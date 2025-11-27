from datetime import datetime, timedelta
from typing import Dict, List, Optional, Union

from fastapi import HTTPException
from api.db.database import get_db
from api.db.models import GameDB, PlayerDB
from api.models.game import GameMove, GameState, PlayerStatus, PlayerSymbol

def check_board_winner(board: List[Optional[PlayerSymbol]]) -> Optional[PlayerSymbol]:
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
    current_global_board: List[List[Optional[PlayerSymbol]]],
    final_winner: Optional[PlayerSymbol]
) -> Optional[int]:
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
    return [cell.value if cell else '' for row in board for cell in row]

def convert_global_board_from_db(board_data: List[str]) -> List[List[Optional[PlayerSymbol]]]:
    board = []
    for i in range(0, 81, 9):
        row = []
        for j in range(9):
            cell = board_data[i + j]
            row.append(PlayerSymbol(cell) if cell else None)
        board.append(row)
    return board

def validate_move(game: GameState, move: GameMove):
    if game.winner:
        raise HTTPException(status_code=400, detail="Game already won")

    cell_value = game.global_board[move.global_board_index][move.local_board_index]
    if cell_value is not None and cell_value != "":
        raise HTTPException(status_code=400, detail="Cell already occupied")

    if game.active_board is not None and move.global_board_index != game.active_board:
        raise HTTPException(status_code=400, detail="Invalid board selected")
    
def check_global_winner(global_board):
    """Check if there's a winner in the super tic-tac-toe game.
    
    Winner is determined after ALL 9 boards are complete.
    The player who won more boards wins the game.
    """
    # Get winner for each small board
    local_board_winners = []
    for local_board in global_board:
        winner = check_board_winner(local_board)
        local_board_winners.append(winner)
    
    # Game continues if any board is still in progress
    if any(winner is None for winner in local_board_winners):
        return None
    
    # All boards are complete - count wins
    x_wins = sum(1 for w in local_board_winners if w == PlayerSymbol.X)
    o_wins = sum(1 for w in local_board_winners if w == PlayerSymbol.O)
    
    # Determine winner based on board count
    if x_wins > o_wins:
        return PlayerSymbol.X
    elif o_wins > x_wins:
        return PlayerSymbol.O
    else:
        return PlayerSymbol.T  # Tie

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
        # Convert float timestamp to datetime if needed
        last_move_dt = None
        if game.last_move_timestamp:
            if isinstance(game.last_move_timestamp, float):
                last_move_dt = datetime.fromtimestamp(game.last_move_timestamp)
            else:
                last_move_dt = game.last_move_timestamp
        
        if (last_move_dt and last_move_dt < inactive_threshold) or not game.players:
            del games[game_id]
    
    with get_db() as db:
        inactive_games = db.query(GameDB).filter(
            (GameDB.last_move_timestamp < inactive_threshold) | 
            (~GameDB.players.any())
        ).all()
        
        for game_db in inactive_games:
            db.query(PlayerDB).filter(PlayerDB.game_id == game_db.id).delete()
            db.delete(game_db)