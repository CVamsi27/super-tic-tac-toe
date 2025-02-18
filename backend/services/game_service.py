from typing import Dict, List
from fastapi import HTTPException, WebSocket, WebSocketDisconnect
from datetime import datetime, timedelta
from fastapi.websockets import WebSocketState

from models.game import (
    GameState, 
    Player, 
    PlayerSymbol, 
    PlayerStatus, 
    GameMove,
    GameMode
)
from utils.game_logic import check_board_winner, find_next_active_board
from typing import Set, Dict, Any

class GameService:
    def __init__(self):
        self.games: Dict[str, GameState] = {}
        self.active_websockets: Dict[str, List[WebSocket]] = {}

    def _get_game_or_404(self, game_id: str) -> GameState:
        if game_id not in self.games:
            raise HTTPException(status_code=404, detail="Game not found")
        return self.games[game_id]

    def current_board(self, game_id: str) -> GameState:
        return self._get_game_or_404(game_id)

    def create_game(self, mode: GameMode = GameMode.LOCAL) -> GameState:
        game = GameState(mode=mode)
        self.games[game.id] = game
        return game
    
    def get_existing_game(self, game_id: str) -> bool:
        return game_id in self.games

    def get_game_by_id(self, game_id: str) -> GameState:
        return self.games[game_id]
    
    def get_current_player(self, game_id: str) -> PlayerSymbol:
        game = self._get_game_or_404(game_id)
        return game.current_player

    def reset_game(self, game_id: str) -> bool:
        old_game = self._get_game_or_404(game_id)
        
        self.games[game_id] = GameState(
            id=old_game.id,
            mode=old_game.mode
        )
        
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

    async def handle_leave_watcher(self, game_id: str, user_id: str, active_sockets: Set[WebSocket]) -> None:
        self.remove_watcher(game_id, user_id)
        await self.broadcast_to_game(active_sockets, {
            "type": "watchers_update",
            "gameId": game_id,
            "watchers_count": self.games[game_id].watchers_count
        })

    def join_game(self, game_id: str, user_id: str) -> Player:
        game = self._get_game_or_404(game_id)

        existing_player = next((p for p in game.players if p.id == user_id), None)
        if existing_player:
            if existing_player.status == PlayerStatus.WATCHER:
                game.watchers_count += 1
            return existing_player

        if game.mode == GameMode.LOCAL:
            if not game.players:
                player = Player(
                    id=user_id,
                    status=PlayerStatus.PLAYER,
                    symbol=PlayerSymbol.X,
                    join_order=0
                )
            else:
                player = Player(
                    id=user_id,
                    status=PlayerStatus.WATCHER,
                    symbol=None,
                    join_order=len(game.players)
                )
                game.watchers_count += 1

        elif game.mode == GameMode.REMOTE:
            if len([p for p in game.players if p.status == PlayerStatus.PLAYER]) < 2:
                symbol = PlayerSymbol.X if not game.players else PlayerSymbol.O
                player = Player(
                    id=user_id,
                    symbol=symbol,
                    status=PlayerStatus.PLAYER,
                    join_order=len(game.players)
                )
            else:
                if user_id not in [p.id for p in game.players if p.status == PlayerStatus.WATCHER]:
                    player = Player(
                        id=user_id,
                        symbol=None,
                        status=PlayerStatus.WATCHER,
                        join_order=len(game.players)
                    )
                    game.watchers_count += 1
                else:
                    player = next((p for p in game.players if p.id == user_id), None)
                    game.watchers_count += 1
                    raise ValueError("User is already watching the game.")

        game.players.append(player)

        if game.mode == GameMode.REMOTE:
            if len([p for p in game.players if p.status == PlayerStatus.PLAYER]) == 2:
                game.current_player = PlayerSymbol.X
            else:
                game.current_player = PlayerSymbol.O
        else:
            game.current_player = PlayerSymbol.X
        return player

    def make_move(self, game_id: str, move: GameMove) -> GameState:
        game = self._get_game_or_404(game_id)

        self._validate_move(game, move)

        player = next((p for p in game.players if p.id == move.playerId), None)
        if not player:
            raise HTTPException(status_code=400, detail="Player not found in the game")
        elif player.status == PlayerStatus.WATCHER:
            raise HTTPException(status_code=400, detail="Watcher cannot make moves")
            
        symbol = player.symbol

        game.global_board[move.global_board_index][move.local_board_index] = symbol
        game.current_player = PlayerSymbol.X if symbol == PlayerSymbol.O else PlayerSymbol.O

        game.move_count += 1

        board = game.global_board[move.global_board_index]
        board_winner = check_board_winner(board)
        if board_winner:
            if board_winner != PlayerSymbol.T:
                game.global_board[move.global_board_index] = [board_winner] * 9

        game.active_board = find_next_active_board(
            move.local_board_index, 
            game.global_board
        )

        game.last_move_timestamp = datetime.now()

        game.winner = self._check_global_winner(game.global_board)

        return game

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

            for player in game.players:
                if datetime.now() - player.last_active > timedelta(minutes=2):
                    game.players = [p for p in game.players if p.id != player.id]
                    
                    if not game.players:
                        del self.games[game_id]
                        break

    def remove_watcher(self, game_id: str, user_id: str):
        game = self._get_game_or_404(game_id)
        player = next((p for p in game.players if p.id == user_id), None)
        if game.watchers_count > 0 and player.status == PlayerStatus.WATCHER:
            game.watchers_count -= 1

game_service = GameService()