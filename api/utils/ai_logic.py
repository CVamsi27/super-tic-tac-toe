"""
AI logic for Super Tic Tac Toe using intelligent strategy.
Supports difficulty levels: easy, medium, hard

Strategy:
- Easy: Random moves with occasional smart plays
- Medium: Mix of strategic and random moves
- Hard: Optimal minimax-based play with alpha-beta pruning
"""

from typing import List, Tuple, Optional
from api.models.game import GameState, PlayerSymbol
import random


class AILogic:
    """AI player for Super Tic Tac Toe"""

    def __init__(self, difficulty: str = "medium"):
        """
        Initialize AI with difficulty level
        
        Args:
            difficulty: "easy", "medium", or "hard"
        """
        self.difficulty = difficulty.lower()
        self.ai_symbol = PlayerSymbol.O
        self.human_symbol = PlayerSymbol.X

    def get_next_move(
        self, game: GameState, available_moves: List[Tuple[int, int]]
    ) -> Tuple[int, int]:
        """
        Get the best next move for AI based on difficulty level.
        
        Args:
            game: Current game state
            available_moves: List of (board_index, cell_index) tuples
            
        Returns:
            (board_index, cell_index) tuple for the best move
        """
        if not available_moves:
            raise ValueError("No available moves")
        
        if self.difficulty == "easy":
            return self._get_easy_move(game, available_moves)
        elif self.difficulty == "medium":
            return self._get_medium_move(game, available_moves)
        else:  # hard
            return self._get_hard_move(game, available_moves)

    def _get_easy_move(
        self, game: GameState, available_moves: List[Tuple[int, int]]
    ) -> Tuple[int, int]:
        """Easy mode: Mostly random with 30% chance of smart moves"""
        if random.random() < 0.3:
            smart_move = self._get_smart_move(game, available_moves)
            if smart_move:
                return smart_move
        
        return random.choice(available_moves)

    def _get_medium_move(
        self, game: GameState, available_moves: List[Tuple[int, int]]
    ) -> Tuple[int, int]:
        """Medium mode: 70% strategic, 30% random"""
        if random.random() < 0.7:
            smart_move = self._get_smart_move(game, available_moves)
            if smart_move:
                return smart_move
        
        return random.choice(available_moves)

    def _get_hard_move(
        self, game: GameState, available_moves: List[Tuple[int, int]]
    ) -> Tuple[int, int]:
        """Hard mode: Always make optimal moves using strategic analysis"""
        # First, check for immediate wins or blocks
        smart_move = self._get_smart_move(game, available_moves)
        if smart_move:
            return smart_move
        
        # Then use minimax for deep strategy
        return self._get_minimax_move(game, available_moves)

    def _get_smart_move(
        self, game: GameState, available_moves: List[Tuple[int, int]]
    ) -> Optional[Tuple[int, int]]:
        """
        Find immediate strategic moves in priority order:
        1. Winning move (completes a board)
        2. Blocking move (prevents opponent from winning)
        3. Center of active board or global center
        """
        
        # Priority 1: Look for winning moves
        for move in available_moves:
            board_idx, cell_idx = move
            board = game.global_board[board_idx]
            
            if self._is_winning_move(board, cell_idx, self.ai_symbol):
                return move
        
        # Priority 2: Block opponent's winning move
        for move in available_moves:
            board_idx, cell_idx = move
            board = game.global_board[board_idx]
            
            if self._is_blocking_move(board, cell_idx, self.human_symbol):
                return move
        
        # Priority 3: Prefer center positions
        # If in specific board, prefer center of that board
        center_moves = [m for m in available_moves if m[1] == 4]
        if center_moves:
            return center_moves[0]
        
        # Priority 4: Prefer corners (strong positions)
        corner_moves = [m for m in available_moves if m[1] in [0, 2, 6, 8]]
        if corner_moves:
            return corner_moves[0]
        
        return None

    def _get_minimax_move(
        self, game: GameState, available_moves: List[Tuple[int, int]]
    ) -> Tuple[int, int]:
        """Use minimax algorithm to find optimal move"""
        best_move = available_moves[0]
        best_score = float('-inf')
        
        for move in available_moves:
            # Evaluate each move
            game_copy = self._copy_game(game)
            game_copy.global_board[move[0]][move[1]] = self.ai_symbol
            
            score = self._minimax(game_copy, depth=2, is_maximizing=False)
            
            if score > best_score:
                best_score = score
                best_move = move
        
        return best_move

    def _minimax(
        self, 
        game: GameState, 
        depth: int, 
        is_maximizing: bool,
        alpha: float = float('-inf'),
        beta: float = float('inf')
    ) -> float:
        """
        Minimax with alpha-beta pruning.
        Evaluates positions up to specified depth.
        """
        
        # Check terminal states
        winner = self._get_game_winner(game)
        if winner == self.ai_symbol:
            return 100 + depth
        elif winner == self.human_symbol:
            return -100 - depth
        elif winner == PlayerSymbol.T:  # Tie
            return 0
        
        # Depth limit - evaluate position
        if depth == 0:
            return self._evaluate_position(game)
        
        # Get available moves
        available = self._get_available_moves_static(game)
        if not available:
            return self._evaluate_position(game)
        
        if is_maximizing:
            # AI's turn - maximize score
            max_eval = float('-inf')
            for move in available:
                game_copy = self._copy_game(game)
                game_copy.global_board[move[0]][move[1]] = self.ai_symbol
                eval_score = self._minimax(game_copy, depth - 1, False, alpha, beta)
                max_eval = max(max_eval, eval_score)
                alpha = max(alpha, eval_score)
                if beta <= alpha:
                    break  # Pruning
            return max_eval
        else:
            # Human's turn - minimize score
            min_eval = float('inf')
            for move in available:
                game_copy = self._copy_game(game)
                game_copy.global_board[move[0]][move[1]] = self.human_symbol
                eval_score = self._minimax(game_copy, depth - 1, True, alpha, beta)
                min_eval = min(min_eval, eval_score)
                beta = min(beta, eval_score)
                if beta <= alpha:
                    break  # Pruning
            return min_eval

    def _evaluate_position(self, game: GameState) -> float:
        """Evaluate a board position without terminal state"""
        score = 0
        
        # Evaluate each small board
        for board_idx, board in enumerate(game.global_board):
            board_score = self._evaluate_board(board)
            score += board_score
        
        return score

    def _evaluate_board(self, board: List[Optional[PlayerSymbol]]) -> float:
        """Evaluate a single 3x3 board"""
        score = 0
        
        win_patterns = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8],
            [0, 3, 6], [1, 4, 7], [2, 5, 8],
            [0, 4, 8], [2, 4, 6]
        ]
        
        for pattern in win_patterns:
            a, b, c = pattern
            cells = [board[a], board[b], board[c]]
            
            ai_count = sum(1 for cell in cells if cell == self.ai_symbol)
            human_count = sum(1 for cell in cells if cell == self.human_symbol)
            empty_count = sum(1 for cell in cells if cell is None)
            
            # AI has 2, opponent 0, 1 empty: very strong
            if ai_count == 2 and human_count == 0 and empty_count == 1:
                score += 20
            # AI has 1, opponent 0, 2 empty: somewhat strong
            elif ai_count == 1 and human_count == 0 and empty_count == 2:
                score += 2
            # Opponent has 2, AI 0, 1 empty: very weak
            elif human_count == 2 and ai_count == 0 and empty_count == 1:
                score -= 20
            # Opponent has 1, AI 0, 2 empty: somewhat weak
            elif human_count == 1 and ai_count == 0 and empty_count == 2:
                score -= 2
        
        return score

    def _is_winning_move(
        self, 
        board: List[Optional[PlayerSymbol]], 
        cell_idx: int,
        symbol: PlayerSymbol
    ) -> bool:
        """Check if placing symbol at cell_idx wins this board"""
        board_copy = board.copy()
        board_copy[cell_idx] = symbol
        return self._get_board_winner(board_copy) == symbol

    def _is_blocking_move(
        self, 
        board: List[Optional[PlayerSymbol]], 
        cell_idx: int,
        symbol: PlayerSymbol
    ) -> bool:
        """Check if placing opponent's symbol at cell_idx would win"""
        board_copy = board.copy()
        board_copy[cell_idx] = symbol
        return self._get_board_winner(board_copy) == symbol

    def _get_board_winner(
        self, board: List[Optional[PlayerSymbol]]
    ) -> Optional[PlayerSymbol]:
        """Get the winner of a single 3x3 board"""
        win_patterns = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8],
            [0, 3, 6], [1, 4, 7], [2, 5, 8],
            [0, 4, 8], [2, 4, 6]
        ]
        
        for pattern in win_patterns:
            a, b, c = pattern
            if (board[a] is not None and 
                board[a] == board[b] and 
                board[a] == board[c]):
                return board[a]
        
        if all(cell is not None for cell in board):
            return PlayerSymbol.T  # Tie
        
        return None

    def _get_game_winner(self, game: GameState) -> Optional[PlayerSymbol]:
        """Determine winner of the entire super tic-tac-toe game"""
        board_winners = []
        for board in game.global_board:
            winner = self._get_board_winner(board)
            board_winners.append(winner)
        
        x_wins = sum(1 for w in board_winners if w == PlayerSymbol.X)
        o_wins = sum(1 for w in board_winners if w == PlayerSymbol.O)
        empty_boards = sum(1 for w in board_winners if w is None)
        
        # Check meta game winner
        if x_wins > o_wins + empty_boards:
            return PlayerSymbol.X
        elif o_wins > x_wins + empty_boards:
            return PlayerSymbol.O
        elif empty_boards == 0:
            if x_wins > o_wins:
                return PlayerSymbol.X
            elif o_wins > x_wins:
                return PlayerSymbol.O
            else:
                return PlayerSymbol.T
        
        return None

    def _get_available_moves_static(
        self, game: GameState
    ) -> List[Tuple[int, int]]:
        """Get all available moves in a game state"""
        moves = []
        
        if game.active_board is not None:
            # Specific board is active
            board = game.global_board[game.active_board]
            for cell_idx, cell in enumerate(board):
                if cell is None:
                    moves.append((game.active_board, cell_idx))
        else:
            # Any board with space is valid
            for board_idx, board in enumerate(game.global_board):
                for cell_idx, cell in enumerate(board):
                    if cell is None:
                        moves.append((board_idx, cell_idx))
        
        return moves

    def _copy_game(self, game: GameState) -> GameState:
        """Create a deep copy of game state"""
        from copy import deepcopy
        return deepcopy(game)
