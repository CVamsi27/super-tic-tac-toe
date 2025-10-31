from typing import Any, Dict, List, Optional, Set
from fastapi import HTTPException, WebSocket, WebSocketDisconnect
from datetime import datetime, timedelta
from fastapi.websockets import WebSocketState
from websockets.exceptions import ConnectionClosedError, ConnectionClosedOK

from api.models.game import (
    GameState, 
    Player, 
    PlayerSymbol, 
    PlayerStatus, 
    GameMove,
    GameMode
)
from api.db.models import GameDB, PlayerDB
from api.db.user_models import UserDB
from api.db.database import get_db
from api.utils.game_logic import (
    check_board_winner, 
    find_next_active_board, 
    convert_global_board_from_db, 
    convert_global_board_to_db,
    validate_move,
    check_global_winner,
    remove_player_from_game,
    cleanup_inactive_games
)
from api.services.auth_service import auth_service
from api.utils.ai_logic import AILogic

class GameService:
    def __init__(self):
        self.games: Dict[str, GameState] = {}
        self.active_websockets: Dict[str, List[WebSocket]] = {}
        self.reset_in_progress: Set[str] = set()  # Track games currently being reset

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
            global_board=convert_global_board_from_db(game_db.global_board),
            current_player=game_db.current_player,
            active_board=game_db.active_board,
            watchers_count=game_db.watchers_count,
            winner=game_db.winner,
            last_move_timestamp=game_db.last_move_timestamp.timestamp() if game_db.last_move_timestamp else None,
            mode=game_db.mode,
            move_count=game_db.move_count,
            ai_difficulty=game_db.ai_difficulty if hasattr(game_db, 'ai_difficulty') else "medium"
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
        print("Cleaning up empty game")
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

    def create_game(self, mode: GameMode = GameMode.REMOTE, ai_difficulty: str = "medium") -> GameState:
        game = GameState(mode=mode, ai_difficulty=ai_difficulty if mode == GameMode.AI else None)
        
        with get_db() as db:
            game_db = GameDB(
                id=game.id,
                mode=mode,
                ai_difficulty=ai_difficulty if mode == GameMode.AI else None,
                global_board=convert_global_board_to_db(game.global_board)
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
        # Prevent duplicate reset requests for the same game
        if game_id in self.reset_in_progress:
            raise HTTPException(status_code=409, detail="Game reset is already in progress")
        
        if user_id not in [p.id for p in self.games[game_id].players if p.status == PlayerStatus.PLAYER]:
            raise HTTPException(status_code=403, detail="Only players can reset the game")
        
        self.reset_in_progress.add(game_id)
        
        try:
            if game_id not in self.games:
                with get_db() as db:
                    game_db = db.query(GameDB).filter(GameDB.id == game_id).first()
                    if not game_db:
                        raise HTTPException(status_code=404, detail="Game not found")
                    self.games[game_id] = self._game_db_to_state(game_db)
            
            old_game = self.games[game_id]
            
            # Determine the current player for the new game
            # If there was a winner, set current_player to the winner
            # Otherwise, set it to the first player (X)
            new_current_player = old_game.winner if old_game.winner and old_game.winner != PlayerSymbol.T else PlayerSymbol.X
            
            new_game = GameState(
                id=old_game.id,
                mode=old_game.mode,
                current_player=new_current_player
            )
            
            self.games[game_id] = new_game
            
            with get_db() as db:
                game_db = db.query(GameDB).filter(GameDB.id == game_id).first()
                
                game_db.global_board = convert_global_board_to_db(new_game.global_board)
                game_db.current_player = new_current_player
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
        finally:
            # Always remove the game from reset_in_progress, even if there's an error
            self.reset_in_progress.discard(game_id)

    async def broadcast_to_game(self, active_sockets: Set[WebSocket], message: Dict[str, Any]) -> None:
        disconnected_sockets = set()
        
        # Ensure board and enums are serializable
        if "game_state" in message:
            game_state = message["game_state"]
            
            # Convert global_board
            if "global_board" in game_state and game_state["global_board"]:
                board = game_state["global_board"]
                game_state["global_board"] = [
                    [cell.value if cell else None for cell in row] for row in board
                ]
            
            # Convert winner and current_player enums
            if "winner" in game_state and game_state["winner"]:
                game_state["winner"] = game_state["winner"].value
            if "current_player" in game_state and game_state["current_player"]:
                game_state["current_player"] = game_state["current_player"].value
        
        # Convert symbol field if present
        if "symbol" in message and message["symbol"]:
            message["symbol"] = message["symbol"].value
        
        # Convert status field if present
        if "status" in message and message["status"]:
            message["status"] = message["status"].value
        
        # Convert mode field if present
        if "mode" in message and message["mode"]:
            message["mode"] = message["mode"].value
        
        for client in active_sockets:
            try:
                if client.client_state == WebSocketState.CONNECTED:
                    try:
                        await client.send_json(message)
                    except (ConnectionClosedError, ConnectionClosedOK, WebSocketDisconnect):
                        disconnected_sockets.add(client)
                else:
                    disconnected_sockets.add(client)
            except Exception as e:
                print(f"Error broadcasting to client: {str(e)}")
                disconnected_sockets.add(client)
        
        active_sockets.difference_update(disconnected_sockets)

    async def handle_join_game(self, websocket: WebSocket, game_id: str, user_id: str, active_sockets: Set[WebSocket]) -> None:
        try:
            game = self.games.get(game_id)
            if not game:
                # Game not in memory, will be loaded by join_game
                players_before = 0
            else:
                players_before = len(game.players)
            
            player = self.join_game(game_id, user_id)
            
            # Send player_joined for the human player
            await self.broadcast_to_game(active_sockets, {
                "type": "player_joined",
                "gameId": game_id,
                "userId": player.id,
                "symbol": player.symbol,
                "status": player.status,
                "watchers_count": self.games[game_id].watchers_count,
                "mode": self.games[game_id].mode,
                "ai_difficulty": self.games[game_id].ai_difficulty,
                "game_state": {
                    "global_board": self.games[game_id].global_board,
                    "active_board": self.games[game_id].active_board,
                    "move_count": self.games[game_id].move_count,
                    "winner": self.games[game_id].winner,
                    "current_player": self.games[game_id].current_player
                }
            })
            
            # For AI games, always broadcast AI player if it exists (so frontend knows about it)
            game = self.games[game_id]  # Refresh game reference
            print(f"AI Game check: mode={game.mode}, players_before={players_before}, players_now={len(game.players)}")
            print(f"All players: {[(p.id, p.symbol) for p in game.players]}")
            
            if game.mode == GameMode.AI:
                # Find AI player
                ai_player = next((p for p in game.players if p.id.startswith("ai_")), None)
                print(f"AI Player found: {ai_player.id if ai_player else 'None'}")
                
                # Broadcast AI player if it exists and this is a new connection (not already in player list)
                if ai_player and ai_player.id != player.id:
                    await self.broadcast_to_game(active_sockets, {
                        "type": "player_joined",
                        "gameId": game_id,
                        "userId": ai_player.id,
                        "symbol": ai_player.symbol,
                        "status": ai_player.status,
                        "watchers_count": self.games[game_id].watchers_count,
                        "mode": self.games[game_id].mode,
                        "ai_difficulty": self.games[game_id].ai_difficulty,
                        "game_state": {
                            "global_board": self.games[game_id].global_board,
                            "active_board": self.games[game_id].active_board,
                            "move_count": self.games[game_id].move_count,
                            "winner": self.games[game_id].winner,
                            "current_player": self.games[game_id].current_player
                        }
                    })
                    print(f"Broadcasted AI player: {ai_player.id}")
        except HTTPException as e:
            if websocket.client_state == WebSocketState.CONNECTED:
                try:
                    await websocket.send_json({"type": "error", "message": str(e.detail)})
                except (ConnectionClosedError, ConnectionClosedOK, WebSocketDisconnect):
                    active_sockets.discard(websocket)
        except Exception as e:
            print(f"Error in handle_join_game: {str(e)}")
            if websocket.client_state == WebSocketState.CONNECTED:
                try:
                    await websocket.send_json({"type": "error", "message": "Internal server error"})
                except (ConnectionClosedError, ConnectionClosedOK, WebSocketDisconnect):
                    active_sockets.discard(websocket)

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
            
            # If it's an AI game and there's no winner, make AI move
            if game.mode == GameMode.AI and game.winner is None:
                await self._make_ai_move(game_id, active_sockets)
                
        except HTTPException as e:
            if websocket.client_state == WebSocketState.CONNECTED:
                try:
                    await websocket.send_json({"type": "error", "message": str(e.detail)})
                except (ConnectionClosedError, ConnectionClosedOK, WebSocketDisconnect):
                    active_sockets.discard(websocket)
        except Exception as e:
            print(f"Error in handle_make_move: {str(e)}")
            if websocket.client_state == WebSocketState.CONNECTED:
                try:
                    await websocket.send_json({"type": "error", "message": "Internal server error"})
                except (ConnectionClosedError, ConnectionClosedOK, WebSocketDisconnect):
                    active_sockets.discard(websocket)

    async def _make_ai_move(self, game_id: str, active_sockets: Set[WebSocket]) -> None:
        """Generate and execute AI move in an AI game"""
        import asyncio
        
        try:
            # Add a small delay for better UX
            await asyncio.sleep(0.5)
            
            game = self._get_game_or_404(game_id)
            
            # Make sure it's AI's turn and game not won
            if game.winner is not None or game.current_player != PlayerSymbol.O:
                print(f"AI move skipped: winner={game.winner}, current_player={game.current_player}")
                return
            
            # Get available moves
            available_moves = []
            if game.active_board is not None:
                board = game.global_board[game.active_board]
                for cell_idx, cell in enumerate(board):
                    if cell is None:
                        available_moves.append((game.active_board, cell_idx))
            else:
                for board_idx, board in enumerate(game.global_board):
                    for cell_idx, cell in enumerate(board):
                        if cell is None:
                            available_moves.append((board_idx, cell_idx))
            
            if not available_moves:
                print("No available moves for AI")
                return
            
            # Use AI logic to determine best move
            ai_logic = AILogic(difficulty=game.ai_difficulty or "medium")
            board_idx, cell_idx = ai_logic.get_next_move(game, available_moves)
            
            print(f"AI chose move: board={board_idx}, cell={cell_idx}")
            
            # Make the move
            ai_player_id = f"ai_{game_id}"
            ai_move = GameMove(
                playerId=ai_player_id,
                global_board_index=board_idx,
                local_board_index=cell_idx
            )
            
            game = self.make_move(game_id, ai_move)
            
            # Broadcast the AI move
            await self.broadcast_to_game(active_sockets, {
                "type": "game_update",
                "gameId": game_id,
                "userId": ai_player_id,
                "game_state": {
                    "global_board": game.global_board,
                    "active_board": game.active_board,
                    "move_count": game.move_count,
                    "winner": game.winner,
                    "current_player": game.current_player
                }
            })
            
        except Exception as e:
            print(f"Error making AI move: {str(e)}")

    async def handle_leave(self, game_id: str, user_id: str, active_sockets: Set[WebSocket]) -> None:
        self.remove_watcher(game_id, user_id)
        await self.broadcast_to_game(active_sockets, {
            "type": "watchers_update",
            "gameId": game_id,
            "watchers_count": self.games[game_id].watchers_count
        })

    async def handle_reset_game(self, game_id: str, user_id: str, active_sockets: Set[WebSocket]) -> None:
        """Handle reset game and broadcast to all connected clients"""
        try:
            reset_result = self.reset_game(game_id, user_id)
            
            # Broadcast the reset to all connected players and watchers
            await self.broadcast_to_game(active_sockets, {
                "type": "game_reset",
                "gameId": game_id,
                "message": reset_result["message"],
                "game_state": {
                    "global_board": self.games[game_id].global_board,
                    "active_board": self.games[game_id].active_board,
                    "move_count": self.games[game_id].move_count,
                    "winner": self.games[game_id].winner,
                    "current_player": self.games[game_id].current_player
                }
            })
        except HTTPException as e:
            print(f"HTTP Error in handle_reset_game: {str(e.detail)}")
            # Send error message to requester only
            for client in list(active_sockets):
                if client.client_state == WebSocketState.CONNECTED:
                    try:
                        await client.send_json({"type": "error", "message": str(e.detail)})
                        break  # Only send to first connected client (the requester)
                    except (ConnectionClosedError, ConnectionClosedOK, WebSocketDisconnect):
                        pass
        except Exception as e:
            print(f"Error in handle_reset_game: {str(e)}")
            # Send generic error message to all connected clients
            for client in list(active_sockets):
                if client.client_state == WebSocketState.CONNECTED:
                    try:
                        await client.send_json({"type": "error", "message": "Failed to reset game"})
                    except (ConnectionClosedError, ConnectionClosedOK, WebSocketDisconnect):
                        pass

    def make_move(self, game_id: str, move: GameMove) -> GameState:
        game = self._get_game_or_404(game_id)
        validate_move(game, move)
        
        print(f"Making move: playerId={move.playerId}, game mode={game.mode}")
        print(f"Game players: {[(p.id, p.symbol) for p in game.players]}")
        
        player = next((p for p in game.players if p.id == move.playerId), None)
        if not player:
            with get_db() as db:
                player_db = db.query(PlayerDB).filter(PlayerDB.id == move.playerId).first()
                if not player_db:
                    # For AI games, AI player might not be in memory yet, but should be in DB
                    if game.mode == GameMode.AI and move.playerId.startswith("ai_"):
                        print(f"AI move attempted but player not found. Checking DB and game.players")
                        # Try to find in game.players anyway
                        ai_player = next((p for p in game.players if p.id.startswith("ai_")), None)
                        if ai_player:
                            player = ai_player
                            print(f"Found AI player in game.players: {ai_player.id}")
                        else:
                            print(f"AI player {move.playerId} not found in game.players or DB")
                            # Just create a temporary player object for the move
                            player = Player(
                                id=move.playerId,
                                symbol=PlayerSymbol.O,  # AI is always O
                                status=PlayerStatus.PLAYER,
                                join_order=1
                            )
                            print(f"Created temporary AI player: {player.id}")
                    else:
                        raise HTTPException(status_code=404, detail="Player not found")
                else:
                    player = Player(
                        id=player_db.id,
                        symbol=player_db.symbol,
                        status=player_db.status,
                        join_order=player_db.join_order
                    )
                    print(f"Found player in DB: {player.id}")
                db.commit()
        
        if player and player.status == PlayerStatus.WATCHER:
            raise HTTPException(status_code=400, detail="Watcher cannot make moves")
            
        symbol = player.symbol
        game.global_board[move.global_board_index][move.local_board_index] = symbol
        game.current_player = PlayerSymbol.X if symbol == PlayerSymbol.O else PlayerSymbol.O
        game.move_count += 1
        
        board = game.global_board[move.global_board_index]
        board_winner = check_board_winner(board)
        if board_winner and board_winner != PlayerSymbol.T:
            game.global_board[move.global_board_index] = [board_winner] * 9
        
        final_winner = check_global_winner(game.global_board)
        game.active_board = find_next_active_board(move.local_board_index, game.global_board, final_winner)
        game.last_move_timestamp = datetime.now()
        game.winner = final_winner
        
        with get_db() as db:
            game_db = db.query(GameDB).filter(GameDB.id == game_id).first()
            game_db.global_board = convert_global_board_to_db(game.global_board)
            game_db.current_player = game.current_player
            game_db.active_board = game.active_board
            game_db.winner = game.winner
            game_db.last_move_timestamp = datetime.now()
            game_db.move_count = game.move_count
            
            # Save game result if game is finished and it's NOT an AI game
            if final_winner is not None and game.mode == GameMode.REMOTE:
                game_duration = 0
                if game.last_move_timestamp:
                    # Calculate game duration (this is approximate, would need start_time for exact calc)
                    game_duration = game.move_count * 5  # Rough estimate
                
                players = game.players
                player_symbols = {p.id: p.symbol for p in players if p.symbol}
                
                # Save result for each player
                for player_id, player_symbol in player_symbols.items():
                    if final_winner == PlayerSymbol.T:
                        # Draw
                        result = 'DRAW'
                        points = 1
                    elif final_winner == player_symbol:
                        # Player won
                        result = 'WIN'
                        points = 10
                    else:
                        # Player lost
                        result = 'LOSS'
                        points = -5
                    
                    # Find opponent
                    opponent_id = None
                    opponent_name = None
                    for p_id, p_symbol in player_symbols.items():
                        if p_id != player_id:
                            opponent_id = p_id
                            opponent_player = next((p for p in players if p.id == opponent_id), None)
                            if opponent_player:
                                # Get opponent name from database
                                opponent_db = db.query(PlayerDB).filter(PlayerDB.id == opponent_id).first()
                                if opponent_db:
                                    opponent_user = db.query(UserDB).filter(UserDB.id == opponent_id).first()
                                    opponent_name = opponent_user.name if opponent_user else None
                            break
                    
                    # Save the game result
                    auth_service.save_game_result(player_id, result, opponent_name, game_duration, points)
            
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
                        if not game.current_player:
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
                        if not game.current_player:
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
                    if not game.current_player:
                        game.current_player = PlayerSymbol.X
                        game_db.current_player = PlayerSymbol.X
            else:  # AI mode
                # Human player always gets X
                player = Player(
                    id=user_id,
                    symbol=PlayerSymbol.X,
                    status=PlayerStatus.PLAYER,
                    join_order=0
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
                
                # Automatically add AI player as O
                if len(game.players) == 1:
                    ai_player = Player(
                        id=f"ai_{game_id}",
                        symbol=PlayerSymbol.O,
                        status=PlayerStatus.PLAYER,
                        join_order=1
                    )
                    ai_player_db = PlayerDB(
                        id=ai_player.id,
                        game_id=game_id,
                        symbol=ai_player.symbol,
                        status=ai_player.status,
                        join_order=ai_player.join_order
                    )
                    db.add(ai_player_db)
                    game.players.append(ai_player)

            if player.status == PlayerStatus.PLAYER:
                if not game.current_player:
                    game.current_player = PlayerSymbol.X  # Always start with X
                    game_db.current_player = PlayerSymbol.X
            
            db.commit()
            return player

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
        print("Removing player")
        game = self._get_game_or_404(game_id)

        with get_db() as db:
            game_db = db.query(GameDB).filter(GameDB.id == game_id).first()
            if not game_db:
                raise HTTPException(status_code=404, detail="Game not found")

            game.players = [p for p in game.players if p.id != user_id]

            player_db = db.query(PlayerDB).filter(PlayerDB.id == user_id).first()
            if player_db:
                db.delete(player_db)

            remaining_players = db.query(PlayerDB).filter(PlayerDB.game_id == game_id).count()
            if remaining_players == 0:
                if game_id in self.games:
                    del self.games[game_id]
                db.delete(game_db)

            db.commit()

    def remove_player(self, game_id: str, user_id: str) -> None:
        with get_db() as db:
            remove_player_from_game(db, self.games, game_id, user_id)
            db.commit()

    async def cleanup_inactive_games(self) -> None:
        with get_db() as db:
            cleanup_inactive_games(db, self.games)
            db.commit()

game_service = GameService()