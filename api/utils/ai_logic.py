"""
AI logic for Super Tic Tac Toe using Minimax algorithm.
Supports difficulty levels: easy, medium, hard
"""

from typing import List, Tuple, Optional
import random


class AILogic:
    """AI player for Super Tic Tac Toe using Minimax algorithm"""

    def __init__(self, difficulty: str = "medium"):
        """
        Initialize AI with difficulty level
        
        Args:
            difficulty: "easy", "medium", or "hard"
        """
        self.difficulty = difficulty
        self.max_depth = self._get_depth(difficulty)
        self.ai_player = "O"  # AI is always O
        self.human_player = "X"  # Human is always X

    def _get_depth(self, difficulty: str) -> int:
        """Get search depth based on difficulty"""
        depths = {
            "easy": 2,
            "medium": 4,
            "hard": 9,  # Full depth for perfect play
        }
        return depths.get(difficulty, 4)

    def get_next_move(
        self, board_state: dict, available_moves: List[Tuple[int, int]]
    ) -> Tuple[int, int]:
        """
        Get the best next move for AI
        
        Args:
            board_state: dict with keys like "(0,0)" containing "X", "O", or ""
            available_moves: List of (row, col) tuples for available positions
            
        Returns:
            (row, col) tuple for the best move
        """
        if self.difficulty == "easy":
            # Random move for easy
            return random.choice(available_moves)

        if self.difficulty == "medium":
            # Minimax with reduced depth + some randomness
            best_move = self._minimax_move(board_state, available_moves)
            # Occasionally pick a random move for variety
            if random.random() < 0.3:
                return random.choice(available_moves)
            return best_move

        # Hard: Full minimax
        return self._minimax_move(board_state, available_moves)

    def _minimax_move(
        self, board_state: dict, available_moves: List[Tuple[int, int]]
    ) -> Tuple[int, int]:
        """Find best move using minimax"""
        best_score = float("-inf")
        best_move = available_moves[0]

        for move in available_moves:
            # Try this move
            board_copy = board_state.copy()
            board_copy[f"({move[0]},{move[1]})"] = self.ai_player

            score = self._minimax(board_copy, 0, False, available_moves)

            if score > best_score:
                best_score = score
                best_move = move

        return best_move

    def _minimax(
        self,
        board_state: dict,
        depth: int,
        is_maximizing: bool,
        all_available_moves: List[Tuple[int, int]],
    ) -> int:
        """
        Minimax algorithm with alpha-beta pruning
        
        Args:
            board_state: Current board state
            depth: Current search depth
            is_maximizing: True if maximizing (AI), False if minimizing (human)
            all_available_moves: List of all possible moves in the game
            
        Returns:
            Score of the position
        """
        # Check terminal states
        winner = self._check_winner(board_state)
        if winner == self.ai_player:
            return 10 - depth  # Prefer faster wins
        if winner == self.human_player:
            return depth - 10  # Prefer slower losses
        if self._is_board_full(board_state):
            return 0  # Draw

        # Stop at depth limit
        if depth >= self.max_depth:
            return self._evaluate_board(board_state)

        # Get available moves in this state
        available = self._get_available_moves(board_state)
        if not available:
            return 0

        if is_maximizing:
            max_score = float("-inf")
            for move in available:
                board_copy = board_state.copy()
                board_copy[f"({move[0]},{move[1]})"] = self.ai_player
                score = self._minimax(board_copy, depth + 1, False, all_available_moves)
                max_score = max(score, max_score)
            return max_score
        else:
            min_score = float("inf")
            for move in available:
                board_copy = board_state.copy()
                board_copy[f"({move[0]},{move[1]})"] = self.human_player
                score = self._minimax(board_copy, depth + 1, True, all_available_moves)
                min_score = min(score, min_score)
            return min_score

    def _check_winner(self, board_state: dict) -> Optional[str]:
        """Check if there's a winner"""
        # Check rows
        for row in range(3):
            if all(
                board_state.get(f"({row},{col})", "") == "X"
                for col in range(3)
            ):
                return "X"
            if all(
                board_state.get(f"({row},{col})", "") == "O"
                for col in range(3)
            ):
                return "O"

        # Check columns
        for col in range(3):
            if all(
                board_state.get(f"({row},{col})", "") == "X"
                for row in range(3)
            ):
                return "X"
            if all(
                board_state.get(f"({row},{col})", "") == "O"
                for row in range(3)
            ):
                return "O"

        # Check diagonals
        if all(
            board_state.get(f"({i},{i})", "") == "X" for i in range(3)
        ):
            return "X"
        if all(
            board_state.get(f"({i},{i})", "") == "O" for i in range(3)
        ):
            return "O"

        if all(
            board_state.get(f"({i},{2-i})", "") == "X"
            for i in range(3)
        ):
            return "X"
        if all(
            board_state.get(f"({i},{2-i})", "") == "O"
            for i in range(3)
        ):
            return "O"

        return None

    def _is_board_full(self, board_state: dict) -> bool:
        """Check if board is full"""
        empty_count = sum(
            1
            for val in board_state.values()
            if val == ""
        )
        return empty_count == 0

    def _get_available_moves(self, board_state: dict) -> List[Tuple[int, int]]:
        """Get list of available moves"""
        moves = []
        for row in range(3):
            for col in range(3):
                if board_state.get(f"({row},{col})", "") == "":
                    moves.append((row, col))
        return moves

    def _evaluate_board(self, board_state: dict) -> int:
        """Heuristic evaluation of board position"""
        score = 0

        # Check for winning patterns
        for row in range(3):
            score += self._evaluate_line(
                [
                    board_state.get(f"({row},{col})", "")
                    for col in range(3)
                ]
            )

        for col in range(3):
            score += self._evaluate_line(
                [
                    board_state.get(f"({row},{col})", "")
                    for row in range(3)
                ]
            )

        # Diagonals
        score += self._evaluate_line(
            [board_state.get(f"({i},{i})", "") for i in range(3)]
        )
        score += self._evaluate_line(
            [board_state.get(f"({i},{2-i})", "") for i in range(3)]
        )

        return score

    def _evaluate_line(self, line: List[str]) -> int:
        """Evaluate a line (row/col/diagonal)"""
        ai_count = line.count(self.ai_player)
        human_count = line.count(self.human_player)
        empty_count = line.count("")

        if ai_count > 0 and human_count > 0:
            return 0  # Mixed, neutral

        if ai_count == 3:
            return 10  # AI wins
        if human_count == 3:
            return -10  # Human wins

        if ai_count == 2 and empty_count == 1:
            return 5  # AI close to winning
        if human_count == 2 and empty_count == 1:
            return -5  # Human close to winning

        if ai_count == 1 and empty_count == 2:
            return 1
        if human_count == 1 and empty_count == 2:
            return -1

        return 0
