from typing import Any, Dict, List, Optional, Set
from fastapi import HTTPException, WebSocket, WebSocketDisconnect
from datetime import datetime, timedelta
from fastapi.websockets import WebSocketState

from api.models.game import (
    GameState, 
    Player, 
    PlayerSymbol, 
    PlayerStatus, 
    GameMove,
    GameMode
)
from api.db.models import GameDB, PlayerDB
from api.db.database import get_db
from api.utils.game_logic import check_board_winner, find_next_active_board

class GameService:
    def __init__(self):
        self.games: Dict[str, GameState] = {}
        self.active_websockets: Dict[str, List[WebSocket]] = {}

    def _convert_global_board_to_db(self, board: List[List[Optional[PlayerSymbol]]]) -> List[str]:
        return [str(cell) if cell else '' for row in board for cell in row]

    def _convert_global_board_from_db(self, board_data: List[str]) -> List[List[Optional[PlayerSymbol]]]:
        board = []
        for i in range(0, 81, 9):
            row = []
            for j in range(9):
                cell = board_data[i + j]
                row.append(PlayerSymbol(cell) if cell else None)
            board.append(row)
        return board

    def _game_db_to_state(self, game_db: GameDB) -> GameState:
        players = [
            Player(
                id=player_db.id,
                symbol=player_db.symbol,
                status=player_db.status,
                join_order=player_db.join_order
            ) for player_db in game_db.players
        ]
        
        return GameState(
            id=game_db.id,
            players=players,
            global_board=self._convert_global_board_from_db(game_db.global_board),
            current_player=game_db.current_player,
            active_board=game_db.active_board,
            watchers_count=game_db.watchers_count,
            winner=game_db.winner,
            last_move_timestamp=game_db.last_move_timestamp.timestamp() if game_db.last_move_timestamp else None,
            mode=game_db.mode,
            move_count=game_db.move_count
        )

    def _get_game_or_404(self, game_id: str) -> GameState:
        if game_id in self.games:
            return self.games[game_id]
            
        with get_db() as db:
            game_db = db.query(GameDB).filter(GameDB.id == game_id).first()
            if not game_db:
                raise HTTPException(status_code=404, detail="Game not found")
            
            game_state = self._game_db_to_state(game_db)
            self.games[game_id] = game_state
            return game_state
        
    def _cleanup_empty_game(self, game_id: str, db) -> bool:
        if game_id not in self.games:
            game_db = db.query(GameDB).filter(GameDB.id == game_id).first()
            if game_db and (game_db.winner or not game_db.players):
                db.delete(game_db)
                return True
            return False
                
        game = self.games[game_id]
        game_db = db.query(GameDB).filter(GameDB.id == game_id).first()
        
        should_cleanup = False
        
        active_players = [p for p in game.players if p.status == PlayerStatus.PLAYER]
        if not active_players:
            should_cleanup = True
        
        if game.winner is not None:
            last_move_age = datetime.now() - game.last_move_timestamp if game.last_move_timestamp else timedelta(hours=24)
            if last_move_age > timedelta(hours=1):
                should_cleanup = True
        
        if should_cleanup:
            if game_db:
                db.query(PlayerDB).filter(PlayerDB.game_id == game_id).delete()
                db.delete(game_db)
            
            if game_id in self.games:
                del self.games[game_id]
            
            return True
                
        return False

    def create_game(self, mode: GameMode = GameMode.REMOTE) -> GameState:
        game = GameState(mode=mode)
        
        with get_db() as db:
            game_db = GameDB(
                id=game.id,
                mode=mode,
                global_board=self._convert_global_board_to_db(game.global_board)
            )
            db.add(game_db)
            db.commit()
            
        self.games[game.id] = game
        return game
    
    def get_existing_game(self, game_id: str) -> bool:
        if game_id in self.games:
            return True
            
        with get_db() as db:
            game_exists = db.query(GameDB).filter(GameDB.id == game_id).first() is not None
            
            if game_exists:
                game_db = db.query(GameDB).filter(GameDB.id == game_id).first()
                self.games[game_id] = self._game_db_to_state(game_db)
                
            return game_exists

    def reset_game(self, game_id: str, user_id: str) -> dict:
        if user_id not in [p.id for p in self.games[game_id].players if p.status == PlayerStatus.PLAYER]:
            raise HTTPException(status_code=403, detail="Only players can reset the game")
        
        if game_id not in self.games:
            with get_db() as db:
                game_db = db.query(GameDB).filter(GameDB.id == game_id).first()
                if not game_db:
                    raise HTTPException(status_code=404, detail="Game not found")
                self.games[game_id] = self._game_db_to_state(game_db)
        
        old_game = self.games[game_id]
        
        new_game = GameState(
            id=old_game.id,
            mode=old_game.mode
        )
        
        self.games[game_id] = new_game
        
        with get_db() as db:
            game_db = db.query(GameDB).filter(GameDB.id == game_id).first()
            
            game_db.global_board = self._convert_global_board_to_db(new_game.global_board)
            game_db.current_player = None
            game_db.active_board = None
            game_db.watchers_count = 0
            game_db.winner = None
            game_db.last_move_timestamp = None
            game_db.move_count = 0
            
            db.query(PlayerDB).filter(PlayerDB.game_id == game_id).delete()
            
            db.commit()
        
        return {
            "success": True,
            "message": "Game reset successfully"
        }

    async def broadcast_to_game(self, active_sockets: Set[WebSocket], message: Dict[str, Any]) -> None:
        disconnected_sockets = set()
        
        for client in active_sockets:
            if client.client_state == WebSocketState.CONNECTED:
                try:
                    await client.send_json(message)
                except WebSocketDisconnect:
                    disconnected_sockets.add(client)
        
        active_sockets.difference_update(disconnected_sockets)

    async def handle_join_game(self, websocket: WebSocket, game_id: str, user_id: str, active_sockets: Set[WebSocket]) -> None:
        try:
            player = self.join_game(game_id, user_id)
            await self.broadcast_to_game(active_sockets, {
                "type": "player_joined",
                "gameId": game_id,
                "userId": player.id,
                "symbol": player.symbol,
                "status": player.status,
                "watchers_count": self.games[game_id].watchers_count,
                "game_state": {
                    "global_board": self.games[game_id].global_board,
                    "active_board": self.games[game_id].active_board,
                    "move_count": self.games[game_id].move_count,
                    "winner": self.games[game_id].winner,
                    "current_player": self.games[game_id].current_player
                }
            })
        except HTTPException as e:
            await websocket.send_json({"type": "error", "message": str(e.detail)})

    async def handle_make_move(self, websocket: WebSocket, game_id: str, user_id: str, move_data: Dict[str, Any], active_sockets: Set[WebSocket]) -> None:
        try:
            move = GameMove(
                playerId=move_data['playerId'],
                global_board_index=move_data['global_board_index'],
                local_board_index=move_data['local_board_index']
            )
            game = self.make_move(game_id, move)
            await self.broadcast_to_game(active_sockets, {
                "type": "game_update",
                "gameId": game_id,
                "userId": user_id,
                "game_state": {
                    "global_board": game.global_board,
                    "active_board": game.active_board,
                    "move_count": game.move_count,
                    "winner": game.winner,
                    "current_player": game.current_player
                }
            })
        except HTTPException as e:
            await websocket.send_json({"type": "error", "message": str(e.detail)})

    async def handle_leave(self, game_id: str, user_id: str, active_sockets: Set[WebSocket]) -> None:
        self.remove_watcher(game_id, user_id)
        await self.broadcast_to_game(active_sockets, {
            "type": "watchers_update",
            "gameId": game_id,
            "watchers_count": self.games[game_id].watchers_count
        })

    def make_move(self, game_id: str, move: GameMove) -> GameState:
        game = self._get_game_or_404(game_id)
        self._validate_move(game, move)
        
        player = next((p for p in game.players if p.id == move.playerId), None)
        if not player:
            with get_db() as db:
                player_db = db.query(PlayerDB).filter(PlayerDB.id == move.playerId).first()
                if not player_db:
                    raise HTTPException(status_code=404, detail="Player not found")
                db.commit()
        elif player.status == PlayerStatus.WATCHER:
            raise HTTPException(status_code=400, detail="Watcher cannot make moves")
            
        symbol = player.symbol
        game.global_board[move.global_board_index][move.local_board_index] = symbol
        game.current_player = PlayerSymbol.X if symbol == PlayerSymbol.O else PlayerSymbol.O
        game.move_count += 1
        
        board = game.global_board[move.global_board_index]
        board_winner = check_board_winner(board)
        if board_winner and board_winner != PlayerSymbol.T:
            game.global_board[move.global_board_index] = [board_winner] * 9
        
        final_winner = self._check_global_winner(game.global_board)
        game.active_board = find_next_active_board(move.local_board_index, game.global_board, final_winner)
        game.last_move_timestamp = datetime.now()
        game.winner = final_winner
        
        with get_db() as db:
            game_db = db.query(GameDB).filter(GameDB.id == game_id).first()
            game_db.global_board = self._convert_global_board_to_db(game.global_board)
            game_db.current_player = game.current_player
            game_db.active_board = game.active_board
            game_db.winner = game.winner
            game_db.last_move_timestamp = datetime.now()
            game_db.move_count = game.move_count
            db.commit()
            
        return game

    def join_game(self, game_id: str, user_id: str) -> Player:
        game = self._get_game_or_404(game_id)
        
        with get_db() as db:
            game_db = db.query(GameDB).filter(GameDB.id == game_id).first()
            
            existing_player_db = db.query(PlayerDB).filter(PlayerDB.id == user_id).first()
            existing_player_in_game = next((p for p in game.players if p.id == user_id), None)
            
            if existing_player_db:
                if existing_player_db.game_id == game_id:
                    if existing_player_db.status == PlayerStatus.WATCHER:
                        game.watchers_count += 1
                        game_db.watchers_count = game.watchers_count
                        
                    if not existing_player_in_game:
                        player = Player(
                            id=existing_player_db.id,
                            symbol=existing_player_db.symbol,
                            status=existing_player_db.status,
                            join_order=existing_player_db.join_order
                        )
                        game.players.append(player)
                    else:
                        player = existing_player_in_game

                    if player.status == PlayerStatus.PLAYER:
                        game.current_player = player.symbol
                        game_db.current_player = player.symbol
                    
                    db.commit()

                    return player
                else:
                    active_players_count = len([p for p in game.players if p.status == PlayerStatus.PLAYER])
                    
                    if active_players_count < 2:
                        existing_player_db.game_id = game_id
                        existing_player_db.symbol = PlayerSymbol.X if not game.players else PlayerSymbol.O
                        existing_player_db.status = PlayerStatus.PLAYER
                        existing_player_db.join_order = len(game.players)
                        
                        player = Player(
                            id=existing_player_db.id,
                            symbol=existing_player_db.symbol,
                            status=existing_player_db.status,
                            join_order=existing_player_db.join_order
                        )
                    else:
                        existing_player_db.game_id = game_id
                        existing_player_db.symbol = None
                        existing_player_db.status = PlayerStatus.WATCHER
                        existing_player_db.join_order = len(game.players)
                        game.watchers_count += 1
                        game_db.watchers_count = game.watchers_count
                        
                        player = Player(
                            id=existing_player_db.id,
                            symbol=None,
                            status=PlayerStatus.WATCHER,
                            join_order=existing_player_db.join_order
                        )
                    
                    game.players.append(player)

                    if player.status == PlayerStatus.PLAYER:
                        game.current_player = player.symbol
                        game_db.current_player = player.symbol
                    
                    db.commit()

                    return player
            
            if game.mode == GameMode.REMOTE:
                active_players_count = len([p for p in game.players if p.status == PlayerStatus.PLAYER])
                
                if active_players_count < 2:
                    symbol = PlayerSymbol.X if not game.players else PlayerSymbol.O
                    player = Player(
                        id=user_id,
                        symbol=symbol,
                        status=PlayerStatus.PLAYER,
                        join_order=len(game.players)
                    )
                    player_db = PlayerDB(
                        id=player.id,
                        game_id=game_id,
                        symbol=player.symbol,
                        status=player.status,
                        join_order=player.join_order
                    )
                else:
                    player = Player(
                        id=user_id,
                        symbol=None,
                        status=PlayerStatus.WATCHER,
                        join_order=len(game.players)
                    )
                    player_db = PlayerDB(
                        id=player.id,
                        game_id=game_id,
                        symbol=None,
                        status=PlayerStatus.WATCHER,
                        join_order=player.join_order
                    )
                    game.watchers_count += 1
                    game_db.watchers_count = game.watchers_count
                
                db.add(player_db)
                game.players.append(player)
                
                if active_players_count + 1 == 2:
                    game.current_player = PlayerSymbol.X
                    game_db.current_player = PlayerSymbol.X
            else:
                player = Player(
                    id=user_id,
                    symbol=PlayerSymbol.X if not game.players else PlayerSymbol.O,
                    status=PlayerStatus.PLAYER,
                    join_order=len(game.players)
                )
                player_db = PlayerDB(
                    id=player.id,
                    game_id=game_id,
                    symbol=player.symbol,
                    status=player.status,
                    join_order=player.join_order
                )
                db.add(player_db)
                game.players.append(player)

            if player.status == PlayerStatus.PLAYER:
                game.current_player = player.symbol
                game_db.current_player = player.symbol
            
            db.commit()
            return player
    
    def _validate_move(self, game: GameState, move: GameMove):
        if game.winner:
            raise HTTPException(status_code=400, detail="Game already won")

        cell_value = game.global_board[move.global_board_index][move.local_board_index]
        if cell_value is not None and cell_value != "":
            raise HTTPException(status_code=400, detail="Cell already occupied")

        if game.active_board is not None and move.global_board_index != game.active_board:
            raise HTTPException(status_code=400, detail="Invalid board selected")

    def _check_global_winner(self, global_board):
        local_board_winners = []
        incomplete_boards = 0
        x_wins = 0
        o_wins = 0
        
        for local_board in global_board:
            if None in local_board:
                incomplete_boards += 1
                local_board_winners.append(None)
                continue
                
            winner = check_board_winner(local_board)
            local_board_winners.append(winner)
            
            if winner == PlayerSymbol.X:
                x_wins += 1
            elif winner == PlayerSymbol.O:
                o_wins += 1
        
        remaining_possible_wins = incomplete_boards
        if x_wins > o_wins + remaining_possible_wins:
            return PlayerSymbol.X
        if o_wins > x_wins + remaining_possible_wins:
            return PlayerSymbol.O
            
        if incomplete_boards == 0:
            if x_wins > o_wins:
                return PlayerSymbol.X
            elif o_wins > x_wins:
                return PlayerSymbol.O
            else:
                return PlayerSymbol.T
                
        return None
    
    async def check_player_timeouts(self):
        for game_id, game in list(self.games.items()):
            if game.mode != GameMode.REMOTE:
                continue

            with get_db() as db:
                game_db = db.query(GameDB).filter(GameDB.id == game_id).first()
                if not game_db:
                    continue

                for player in list(game.players):
                    if datetime.now() - player.last_active > timedelta(minutes=2):
                        game.players = [p for p in game.players if p.id != player.id]
                        
                        player_db = db.query(PlayerDB).filter(PlayerDB.id == player.id).first()
                        if player_db:
                            db.delete(player_db)
                
                self._cleanup_empty_game(game_id, db)
                db.commit()


    def remove_watcher(self, game_id: str, user_id: str):
        game = self._get_game_or_404(game_id)
        
        with get_db() as db:
            game_db = db.query(GameDB).filter(GameDB.id == game_id).first()
            if not game_db:
                raise HTTPException(status_code=404, detail="Game not found")
            
            player = next((p for p in game.players if p.id == user_id), None)
            if not player:
                return
            
            if game.watchers_count > 0 and player.status == PlayerStatus.WATCHER:
                game.watchers_count -= 1
                game.players = [p for p in game.players if p.id != user_id]
                
                game_db.watchers_count = game.watchers_count
                player_db = db.query(PlayerDB).filter(PlayerDB.id == user_id).first()
                if player_db:
                    db.delete(player_db)
                
                self._cleanup_empty_game(game_id, db)
                db.commit()

game_service = GameService()