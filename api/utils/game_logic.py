from typing import List
from api.models.game import PlayerSymbol

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