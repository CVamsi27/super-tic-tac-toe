from typing import Dict, List
from fastapi import HTTPException, WebSocket
from datetime import datetime, timedelta

from models.game import (
    GameState, 
    Player, 
    PlayerSymbol, 
    PlayerStatus, 
    GameMove,
    GameMode
)
from utils.game_logic import check_board_winner, find_next_active_board

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

    def join_game(self, game_id: str, user_id: str) -> Player:
        game = self._get_game_or_404(game_id)

        existing_player = next((p for p in game.players if p.id == user_id), None)
        if existing_player:
            return existing_player

        if game.mode == GameMode.LOCAL:
            if not game.players:
                player = Player(
                    id=user_id,
                    status=PlayerStatus.PLAYER,
                    join_order=0
                )
            else:
                player = Player(
                    id=user_id,
                    status=PlayerStatus.WATCHER,
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
                        status=PlayerStatus.WATCHER,
                        join_order=len(game.players)
                    )
                    game.watchers_count += 1
                else:
                    raise ValueError("User is already watching the game.")

        game.players.append(player)

        if game.mode == GameMode.REMOTE and len([p for p in game.players if p.status == PlayerStatus.PLAYER]) == 2:
            game.current_player = PlayerSymbol.X

        return player

    def make_move(self, game_id: str, move: GameMove) -> GameState:
        game = self._get_game_or_404(game_id)

        self._validate_move(game, move)

        if game.mode == GameMode.LOCAL:
            symbol = PlayerSymbol.X if move.move_count % 2 == 1 else PlayerSymbol.O
        else:
            symbol = PlayerSymbol.X if move.move_count % 2 == 0 else PlayerSymbol.O

        game.global_board[move.global_board_index][move.local_board_index] = symbol

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
        global_board_state = [
            board[0] if all(cell == board[0] and cell is not None for cell in board)
            else None 
            for board in global_board
        ]

        winner = check_board_winner(global_board_state)
        return winner if winner != PlayerSymbol.T else None
    
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

    def remove_watcher(self, game_id: str):
        game = self._get_game_or_404(game_id)
        if game.watchers_count > 0:
            game.watchers_count -= 1

game_service = GameService()