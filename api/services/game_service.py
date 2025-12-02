from typing import Any, Dict, List, Optional, Set
import asyncio
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

    def _game_db_to_state(self, game_db: GameDB, db) -> GameState:
        player_ids = [p.id for p in game_db.players]
        users = db.query(UserDB).filter(UserDB.id.in_(player_ids)).all()
        user_map = {u.id: u.name for u in users}

        players = [
            Player(
                id=player_db.id,
                name=user_map.get(player_db.id, "AI (Bot)" if player_db.id.startswith("ai_") else "Unknown"),
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
            
            game_state = self._game_db_to_state(game_db, db)
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
    
    def create_matched_game(self, game_id: str, players: tuple) -> GameState:
        """
        Create a game with both players already assigned (for matchmaking).
        
        Args:
            game_id: ID for the new game
            players: (player1_id, player2_id) tuple
            
        Returns:
            GameState with both players added
        """
        if not players or len(players) != 2:
            raise ValueError("Exactly 2 players required for matched game")
        
        player1_id, player2_id = players
        
        game = GameState(id=game_id, mode=GameMode.REMOTE)
        
        # Fetch user names
        with get_db() as db:
            users = db.query(UserDB).filter(UserDB.id.in_([player1_id, player2_id])).all()
            user_map = {u.id: u.name for u in users}

        # Add both players
        player1 = Player(
            id=player1_id,
            name=user_map.get(player1_id, "Unknown"),
            symbol=PlayerSymbol.X,
            status=PlayerStatus.PLAYER,
            join_order=0
        )
        player2 = Player(
            id=player2_id,
            name=user_map.get(player2_id, "Unknown"),
            symbol=PlayerSymbol.O,
            status=PlayerStatus.PLAYER,
            join_order=1
        )
        
        game.players = [player1, player2]
        game.current_player = PlayerSymbol.X
        
        try:
            with get_db() as db:
                # First, remove any existing player entries for these users
                # This handles the case where a user was in a previous game
                db.query(PlayerDB).filter(PlayerDB.id.in_([player1_id, player2_id])).delete(synchronize_session=False)
                db.flush()
                
                game_db = GameDB(
                    id=game.id,
                    mode=GameMode.REMOTE,
                    global_board=convert_global_board_to_db(game.global_board),
                    current_player=PlayerSymbol.X,
                    watchers_count=0
                )
                db.add(game_db)
                db.flush()  # Flush to ensure game_db is persisted before adding players
                
                # Add players to database
                for player in [player1, player2]:
                    player_db = PlayerDB(
                        id=player.id,
                        game_id=game.id,
                        symbol=player.symbol,
                        status=player.status,
                        join_order=player.join_order
                    )
                    db.add(player_db)
                
                db.commit()
        except Exception as e:
            print(f"Error creating matched game: {str(e)}")
            import traceback
            traceback.print_exc()
            raise HTTPException(status_code=500, detail=f"Failed to create matched game: {str(e)}")
        
        self.games[game.id] = game
        return game
    
    def get_existing_game(self, game_id: str) -> bool:
        if game_id in self.games:
            return True
            
        with get_db() as db:
            game_exists = db.query(GameDB).filter(GameDB.id == game_id).first() is not None
            
            if game_exists:
                game_db = db.query(GameDB).filter(GameDB.id == game_id).first()
                self.games[game_id] = self._game_db_to_state(game_db, db)
                
            return game_exists

    def is_game_completed(self, game_id: str) -> bool:
        """Check if a game is completed (has a winner or is a tie)."""
        if game_id in self.games:
            return self.games[game_id].winner is not None
            
        with get_db() as db:
            game_db = db.query(GameDB).filter(GameDB.id == game_id).first()
            if game_db:
                return game_db.winner is not None
        return False  # If game doesn't exist, it's not "completed" (likely a new match)

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
                    self.games[game_id] = self._game_db_to_state(game_db, db)
            
            old_game = self.games[game_id]
            
            # Determine the current player for the new game
            # If there was a winner, set current_player to the winner
            # Otherwise, set it to the first player (X)
            new_current_player = old_game.winner if old_game.winner and old_game.winner != PlayerSymbol.T else PlayerSymbol.X
            
            new_game = GameState(
                id=old_game.id,
                mode=old_game.mode,
                current_player=new_current_player,
                players=old_game.players,
                watchers_count=old_game.watchers_count
            )
            
            self.games[game_id] = new_game
            
            with get_db() as db:
                game_db = db.query(GameDB).filter(GameDB.id == game_id).first()
                
                game_db.global_board = convert_global_board_to_db(new_game.global_board)
                game_db.current_player = new_current_player
                game_db.active_board = None
                game_db.winner = None
                game_db.last_move_timestamp = None
                game_db.move_count = 0
                # Watchers count is preserved in the DB as we are not deleting players
                
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
            
            # Convert players list (Pydantic models to dicts)
            if "players" in game_state and game_state["players"]:
                game_state["players"] = [
                    {
                        "id": p.id,
                        "name": p.name,
                        "symbol": p.symbol.value if p.symbol else None,
                        "status": p.status.value if p.status else None,
                        "join_order": p.join_order
                    } for p in game_state["players"]
                ]
            
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
                    "players": self.games[game_id].players,
                    "global_board": self.games[game_id].global_board,
                    "active_board": self.games[game_id].active_board,
                    "move_count": self.games[game_id].move_count,
                    "winner": self.games[game_id].winner,
                    "current_player": self.games[game_id].current_player
                }
            })
            
            # For AI games, always broadcast AI player if it exists (so frontend knows about it)
            game = self.games[game_id]  # Refresh game reference
            
            if game.mode == GameMode.AI:
                # Find AI player
                ai_player = next((p for p in game.players if p.id.startswith("ai_")), None)
                
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
                            "players": self.games[game_id].players,
                            "global_board": self.games[game_id].global_board,
                            "active_board": self.games[game_id].active_board,
                            "move_count": self.games[game_id].move_count,
                            "winner": self.games[game_id].winner,
                            "current_player": self.games[game_id].current_player
                        }
                    })
        except HTTPException as e:
            if websocket.client_state == WebSocketState.CONNECTED:
                try:
                    await websocket.send_json({"type": "error", "message": str(e.detail)})
                except (ConnectionClosedError, ConnectionClosedOK, WebSocketDisconnect):
                    active_sockets.discard(websocket)
        except Exception as e:
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
                    "players": game.players,
                    "global_board": game.global_board,
                    "active_board": game.active_board,
                    "move_count": game.move_count,
                    "winner": game.winner,
                    "current_player": game.current_player
                }
            })
            
            # Save game state in background
            loop = asyncio.get_running_loop()
            await loop.run_in_executor(None, self._save_game_state, game)

            # If game ended, save results in background (after broadcast)
            if game.winner is not None:
                await loop.run_in_executor(None, self._save_game_results, game)

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
                return
            
            # Use AI logic to determine best move
            ai_logic = AILogic(difficulty=game.ai_difficulty or "medium")
            board_idx, cell_idx = ai_logic.get_next_move(game, available_moves)
            
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
                    "players": game.players,
                    "global_board": game.global_board,
                    "active_board": game.active_board,
                    "move_count": game.move_count,
                    "winner": game.winner,
                    "current_player": game.current_player
                }
            })
            
            # Save game state in background
            loop = asyncio.get_running_loop()
            await loop.run_in_executor(None, self._save_game_state, game)

            # If game ended, save results in background (after broadcast)
            if game.winner is not None:
                await loop.run_in_executor(None, self._save_game_results, game)

        except Exception as e:
            pass

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
                    "players": self.games[game_id].players,
                    "global_board": self.games[game_id].global_board,
                    "active_board": self.games[game_id].active_board,
                    "move_count": self.games[game_id].move_count,
                    "winner": self.games[game_id].winner,
                    "current_player": self.games[game_id].current_player
                }
            })
        except HTTPException as e:
            # Send error message to requester only
            for client in list(active_sockets):
                if client.client_state == WebSocketState.CONNECTED:
                    try:
                        await client.send_json({"type": "error", "message": str(e.detail)})
                        break  # Only send to first connected client (the requester)
                    except (ConnectionClosedError, ConnectionClosedOK, WebSocketDisconnect):
                        pass
        except Exception as e:
            # Send generic error message to all connected clients
            for client in list(active_sockets):
                if client.client_state == WebSocketState.CONNECTED:
                    try:
                        await client.send_json({"type": "error", "message": "Failed to reset game"})
                    except (ConnectionClosedError, ConnectionClosedOK, WebSocketDisconnect):
                        pass

    def _calculate_game_closeness(self, game: GameState, player_symbol: PlayerSymbol) -> dict:
        """
        Calculate how close the game was based on board control and patterns.
        Returns a dict with closeness metrics.
        """
        from api.utils.game_logic import check_board_winner
        
        player_boards_won = 0
        opponent_boards_won = 0
        tied_boards = 0
        player_near_wins = 0  # Boards where player had 2 in a row
        opponent_near_wins = 0  # Boards where opponent had 2 in a row
        
        opponent_symbol = PlayerSymbol.O if player_symbol == PlayerSymbol.X else PlayerSymbol.X
        
        win_patterns = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8],  # Rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8],  # Columns
            [0, 4, 8], [2, 4, 6]  # Diagonals
        ]
        
        local_board_winners = []
        
        for board_idx, board in enumerate(game.global_board):
            winner = check_board_winner(board)
            local_board_winners.append(winner)
            
            if winner == player_symbol:
                player_boards_won += 1
            elif winner == opponent_symbol:
                opponent_boards_won += 1
            elif winner == PlayerSymbol.T:
                tied_boards += 1
            
            # Check for near-wins (2 in a row with empty third)
            for pattern in win_patterns:
                cells = [board[i] for i in pattern]
                player_count = cells.count(player_symbol)
                opponent_count = cells.count(opponent_symbol)
                empty_count = cells.count(None)
                
                if player_count == 2 and empty_count == 1:
                    player_near_wins += 1
                if opponent_count == 2 and empty_count == 1:
                    opponent_near_wins += 1
        
        # Check global board for near-wins (2 boards in a row)
        global_player_near_wins = 0
        global_opponent_near_wins = 0
        
        for pattern in win_patterns:
            boards = [local_board_winners[i] for i in pattern]
            player_count = sum(1 for b in boards if b == player_symbol)
            opponent_count = sum(1 for b in boards if b == opponent_symbol)
            none_or_tie_count = sum(1 for b in boards if b is None or b == PlayerSymbol.T)
            
            if player_count == 2 and none_or_tie_count >= 1:
                global_player_near_wins += 1
            if opponent_count == 2 and none_or_tie_count >= 1:
                global_opponent_near_wins += 1
        
        return {
            "player_boards_won": player_boards_won,
            "opponent_boards_won": opponent_boards_won,
            "tied_boards": tied_boards,
            "board_difference": player_boards_won - opponent_boards_won,
            "player_near_wins": player_near_wins,
            "opponent_near_wins": opponent_near_wins,
            "global_player_near_wins": global_player_near_wins,
            "global_opponent_near_wins": global_opponent_near_wins,
            "move_count": game.move_count,
            "total_boards_decided": player_boards_won + opponent_boards_won + tied_boards
        }

    def _calculate_points(self, game: GameState, player_symbol: PlayerSymbol, result: str) -> int:
        """Calculate points based on game result and board control."""
        closeness = self._calculate_game_closeness(game, player_symbol)
        
        if result == "WIN":
            # Base points for win
            base_points = 25
            
            # Bonus for dominant victory (won many more boards)
            board_diff = closeness["board_difference"]
            if board_diff >= 5:
                base_points += 10  # Very dominant (won 5+ more boards)
            elif board_diff >= 3:
                base_points += 5   # Dominant (won 3-4 more boards)
            
            return base_points
            
        elif result == "LOSS":
            # Penalty for loss, reduced if close game
            base_points = -10
            
            # Reduce penalty for close games
            board_diff = closeness["board_difference"]
            if board_diff >= -1:  # Lost by 1 board or tied boards
                base_points += 5   # Very close loss
            elif board_diff >= -2:  # Lost by 2 boards
                base_points += 3   # Close loss
            
            return base_points
            
        elif result == "DRAW":
            # Points for draw (equal boards won)
            return 5
        
        return 0

    def _save_game_results(self, game: GameState) -> None:
        """Save game results and update player stats with closeness-based scoring"""
        try:
            # Skip saving results for AI games - they don't affect player scores
            if game.mode == GameMode.AI:
                return
            
            with get_db() as db:
                game_duration = 0
                if game.last_move_timestamp:
                    # Calculate game duration (this is approximate, would need start_time for exact calc)
                    game_duration = game.move_count * 5  # Rough estimate
                
                players = game.players
                player_symbols = {p.id: p.symbol for p in players if p.symbol}
                
                # Save result for each player
                for player_id, player_symbol in player_symbols.items():
                    # Skip saving for AI player
                    if player_id.startswith("ai_"):
                        continue

                    if game.winner == PlayerSymbol.T:
                        # Draw
                        result = 'DRAW'
                    elif game.winner == player_symbol:
                        # Player won
                        result = 'WIN'
                    else:
                        # Player lost
                        result = 'LOSS'
                    
                    # Calculate points based on game closeness
                    points = self._calculate_points(game, player_symbol, result)
                    
                    # Find opponent
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
                                    opponent_name = opponent_user.name if opponent_user else "Unknown"
                            break
                    
                    # Check if user exists in database before saving
                    user_exists = db.query(UserDB).filter(UserDB.id == player_id).first()
                    if user_exists:
                        # Save the game result
                        auth_service.save_game_result(player_id, result, opponent_name, game_duration, points)
        except Exception as e:
            print(f"Error saving game results: {str(e)}")

    def _save_game_state(self, game: GameState) -> None:
        """Save game state to database"""
        try:
            with get_db() as db:
                game_db = db.query(GameDB).filter(GameDB.id == game.id).first()
                if game_db:
                    game_db.global_board = convert_global_board_to_db(game.global_board)
                    game_db.current_player = game.current_player
                    game_db.active_board = game.active_board
                    game_db.winner = game.winner
                    game_db.last_move_timestamp = datetime.fromtimestamp(game.last_move_timestamp) if game.last_move_timestamp else None
                    game_db.move_count = game.move_count
                    db.commit()
        except Exception as e:
            print(f"Error saving game state: {str(e)}")

    def make_move(self, game_id: str, move: GameMove) -> GameState:
        game = self._get_game_or_404(game_id)
        validate_move(game, move)
        
        player = next((p for p in game.players if p.id == move.playerId), None)
        
        # Handle AI player if not in memory (fallback)
        if not player and game.mode == GameMode.AI and move.playerId.startswith("ai_"):
            player = Player(
                id=move.playerId,
                name="AI (Bot)",
                symbol=PlayerSymbol.O,
                status=PlayerStatus.PLAYER,
                join_order=1
            )
            # We don't add to game.players here to avoid side effects during move validation, 
            # but ideally it should be there.
        
        if not player:
             raise HTTPException(status_code=404, detail="Player not found")
        
        if player.status == PlayerStatus.WATCHER:
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
        game.last_move_timestamp = datetime.now().timestamp()
        game.winner = final_winner
        
        return game

    def join_game(self, game_id: str, user_id: str) -> Player:
        game = self._get_game_or_404(game_id)
        
        with get_db() as db:
            game_db = db.query(GameDB).filter(GameDB.id == game_id).first()
            
            existing_player_db = db.query(PlayerDB).filter(PlayerDB.id == user_id).first()
            existing_player_in_game = next((p for p in game.players if p.id == user_id), None)
            
            # If player already exists in this game, return them (reconnection case)
            if existing_player_db and existing_player_db.game_id == game_id:
                # Player is reconnecting to the same game
                player = existing_player_in_game
                
                # Handle case where player is in DB but not in memory (inconsistency)
                if not player:
                    user = db.query(UserDB).filter(UserDB.id == existing_player_db.id).first()
                    player = Player(
                        id=existing_player_db.id,
                        name=user.name if user else "Unknown",
                        symbol=existing_player_db.symbol,
                        status=existing_player_db.status,
                        join_order=existing_player_db.join_order
                    )
                    game.players.append(player)
                
                # Only increment watcher count if this is a NEW watcher connection
                # (not already counted in the game state)
                if existing_player_db.status == PlayerStatus.WATCHER:
                    # Check if watcher is already counted
                    # We don't increment here as they're reconnecting, not joining fresh
                    pass
                
                if player.status == PlayerStatus.PLAYER:
                    if not game.current_player:
                        game.current_player = player.symbol
                        game_db.current_player = player.symbol
                
                db.commit()
                return player
            
            # Player exists but in a different game - move them to this game
            if existing_player_db:
                    active_players_count = len([p for p in game.players if p.status == PlayerStatus.PLAYER])
                    
                    if active_players_count < 2:
                        existing_player_db.game_id = game_id
                        existing_player_db.symbol = PlayerSymbol.X if not game.players else PlayerSymbol.O
                        existing_player_db.status = PlayerStatus.PLAYER
                        existing_player_db.join_order = len(game.players)
                        
                        user = db.query(UserDB).filter(UserDB.id == existing_player_db.id).first()
                        player = Player(
                            id=existing_player_db.id,
                            name=user.name if user else "Unknown",
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
                        
                        user = db.query(UserDB).filter(UserDB.id == existing_player_db.id).first()
                        player = Player(
                            id=existing_player_db.id,
                            name=user.name if user else "Unknown",
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
                    user = db.query(UserDB).filter(UserDB.id == user_id).first()
                    player = Player(
                        id=user_id,
                        name=user.name if user else "Unknown",
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
                    user = db.query(UserDB).filter(UserDB.id == user_id).first()
                    player = Player(
                        id=user_id,
                        name=user.name if user else "Unknown",
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
                user = db.query(UserDB).filter(UserDB.id == user_id).first()
                player = Player(
                    id=user_id,
                    name=user.name if user else "Unknown",
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
                        name="AI (Bot)",
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
                    # Skip if player has no last_active timestamp
                    if not player.last_active:
                        continue
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
            cleanup_inactive_games(self.games)
            db.commit()

game_service = GameService()