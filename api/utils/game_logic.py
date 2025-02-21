from datetime import datetime, timedelta
from typing import Dict, List, Optional

from fastapi import HTTPException
from api.db.database import get_db
from api.db.models import GameDB, PlayerDB
from api.models.game import GameMove, GameState, PlayerStatus, PlayerSymbol

def check_board_winner(board: List[PlayerSymbol | None]) -> PlayerSymbol | None:
    win_patterns = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6]
    ]

    for pattern in win_patterns:
        a, b, c = pattern
        if (board[a] is not None and 
            board[a] == board[b] and 
            board[a] == board[c]):
            return board[a]

    if all(cell is not None for cell in board):
        return PlayerSymbol.T

    return None

def find_next_active_board(
    current_cell_index: int, 
    current_global_board: List[List[PlayerSymbol | None]],
    final_winner: PlayerSymbol | None
) -> int | None:
    if final_winner is not None:
        return None

    if all(cell is not None for cell in current_global_board[current_cell_index]):
        available_boards = [
            index for index, board in enumerate(current_global_board)
            if any(cell is None for cell in board)
        ]
        return available_boards[0] if available_boards else None
    
    return current_cell_index

def convert_global_board_to_db(board: List[List[Optional[PlayerSymbol]]]) -> List[str]:
    return [str(cell) if cell else '' for row in board for cell in row]

def convert_global_board_from_db(board_data: List[str]) -> List[List[Optional[PlayerSymbol]]]:
    board = []
    for i in range(0, 81, 9):
        row = []
        for j in range(9):
            cell = board_data[i + j]
            row.append(PlayerSymbol(cell) if cell else None)
        board.append(row)
    return board

def validate_move(self, game: GameState, move: GameMove):
    if game.winner:
        raise HTTPException(status_code=400, detail="Game already won")

    cell_value = game.global_board[move.global_board_index][move.local_board_index]
    if cell_value is not None and cell_value != "":
        raise HTTPException(status_code=400, detail="Cell already occupied")

    if game.active_board is not None and move.global_board_index != game.active_board:
        raise HTTPException(status_code=400, detail="Invalid board selected")
    
def check_global_winner(self, global_board):
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

def remove_player_from_game(games: Dict[str, GameState], game_id: str, user_id: str) -> None:
    if game_id in games:
        game = games[game_id]
        player = next((p for p in game.players if p.id == user_id), None)
        if player:
            game.players.remove(player)
            if player.status == PlayerStatus.WATCHER:
                game.watchers_count -= 1
                
    with get_db() as db:
        player_db = db.query(PlayerDB).filter(PlayerDB.id == user_id).first()
        if player_db:
            db.delete(player_db)

        if game_id in games and not games[game_id].players:
            del games[game_id]
            game_db = db.query(GameDB).filter(GameDB.id == game_id).first()
            if game_db:
                db.delete(game_db)

def cleanup_inactive_games(games: Dict[str, GameState]) -> None:
    inactive_threshold = datetime.now() - timedelta(minutes=30)
    
    for game_id in list(games.keys()):
        game = games[game_id]
        if (game.last_move_timestamp and game.last_move_timestamp < inactive_threshold) or not game.players:
            del games[game_id]
    
    with get_db() as db:
        inactive_games = db.query(GameDB).filter(
            (GameDB.last_move_timestamp < inactive_threshold) | 
            (~GameDB.players.any())
        ).all()
        
        for game_db in inactive_games:
            db.query(PlayerDB).filter(PlayerDB.game_id == game_db.id).delete()
            db.delete(game_db)