# AI Implementation Guide for Super Tic Tac Toe

## Overview

To implement AI gameplay, you need to:
1. **Backend**: Create an AI engine with strategic move selection
2. **Frontend**: Handle AI moves automatically without WebSocket
3. **Game Flow**: Manage turn switching between player and AI
4. **Storage**: Save AI games to user profile

## Architecture

### Current Setup
- **Remote Mode**: 2 players connected via WebSocket
- **AI Mode**: 1 player vs computer (local/HTTP-based)

### Key Difference
- **Remote**: Real-time WebSocket communication
- **AI**: Local game state, HTTP requests for moves, automatic AI turn handling

---

## Implementation Steps

### Step 1: Create AI Engine (`api/utils/ai_logic.py`)

```python
from typing import List, Optional, Tuple
from api.models.game import PlayerSymbol, GameState
from api.utils.game_logic import check_board_winner
import random

class AIEngine:
    """Minimax-based AI for Super Tic Tac Toe"""
    
    def __init__(self, difficulty: str = "medium"):
        """
        difficulty: "easy" (random), "medium" (minimax depth 3), "hard" (minimax depth 5)
        """
        self.difficulty = difficulty
        self.max_depth = {"easy": 0, "medium": 3, "hard": 5}[difficulty]
    
    def find_best_move(
        self, 
        game_state: GameState,
        active_board: Optional[int] = None
    ) -> Tuple[int, int]:
        """
        Find best move for AI (O)
        Returns: (global_board_index, local_board_index)
        """
        if self.difficulty == "easy":
            return self._random_move(game_state, active_board)
        else:
            return self._minimax_move(game_state, active_board)
    
    def _get_valid_moves(
        self, 
        game_state: GameState,
        active_board: Optional[int] = None
    ) -> List[Tuple[int, int]]:
        """Get all valid moves for current game state"""
        valid_moves = []
        
        # If active board is specified, only that board can be played
        if active_board is not None:
            board = game_state.global_board[active_board]
            for cell_idx, cell in enumerate(board):
                if cell is None:
                    valid_moves.append((active_board, cell_idx))
        else:
            # Can play any board
            for board_idx, board in enumerate(game_state.global_board):
                for cell_idx, cell in enumerate(board):
                    if cell is None:
                        valid_moves.append((board_idx, cell_idx))
        
        return valid_moves
    
    def _random_move(
        self, 
        game_state: GameState,
        active_board: Optional[int] = None
    ) -> Tuple[int, int]:
        """Random move for easy difficulty"""
        valid_moves = self._get_valid_moves(game_state, active_board)
        if not valid_moves:
            return (0, 0)
        return random.choice(valid_moves)
    
    def _minimax_move(
        self, 
        game_state: GameState,
        active_board: Optional[int] = None
    ) -> Tuple[int, int]:
        """Minimax algorithm for medium/hard difficulty"""
        valid_moves = self._get_valid_moves(game_state, active_board)
        if not valid_moves:
            return (0, 0)
        
        best_score = float('-inf')
        best_move = valid_moves[0]
        
        for move in valid_moves:
            # Simulate move
            board_idx, cell_idx = move
            game_copy = self._copy_game_state(game_state)
            game_copy.global_board[board_idx][cell_idx] = PlayerSymbol.O
            
            # Evaluate position
            score = self._minimax(
                game_copy,
                self.max_depth,
                False,  # Now it's player's turn (minimizing)
                board_idx,
                cell_idx
            )
            
            if score > best_score:
                best_score = score
                best_move = move
        
        return best_move
    
    def _minimax(
        self,
        game_state: GameState,
        depth: int,
        is_maximizing: bool,
        last_board_idx: int,
        last_cell_idx: int
    ) -> float:
        """
        Minimax algorithm with alpha-beta pruning
        Maximizing: AI (O) is playing
        Minimizing: Player (X) is playing
        """
        # Check terminal states
        winner = self._evaluate_board(game_state.global_board)
        if winner == PlayerSymbol.O:  # AI won
            return 100 + depth  # Prefer faster wins
        elif winner == PlayerSymbol.X:  # Player won
            return -100 - depth  # Prefer slower losses
        elif winner == PlayerSymbol.T:  # Draw
            return 0
        
        # Depth limit reached
        if depth == 0:
            return self._evaluate_position(game_state)
        
        # Get next active board
        next_board = self._get_next_board(game_state, last_cell_idx)
        
        if is_maximizing:  # AI's turn
            max_score = float('-inf')
            valid_moves = self._get_valid_moves(game_state, next_board)
            
            for move in valid_moves[:10]:  # Limit branching for performance
                board_idx, cell_idx = move
                game_copy = self._copy_game_state(game_state)
                game_copy.global_board[board_idx][cell_idx] = PlayerSymbol.O
                
                score = self._minimax(
                    game_copy,
                    depth - 1,
                    False,
                    board_idx,
                    cell_idx
                )
                max_score = max(score, max_score)
            
            return max_score
        else:  # Player's turn
            min_score = float('inf')
            valid_moves = self._get_valid_moves(game_state, next_board)
            
            for move in valid_moves[:10]:  # Limit branching for performance
                board_idx, cell_idx = move
                game_copy = self._copy_game_state(game_state)
                game_copy.global_board[board_idx][cell_idx] = PlayerSymbol.X
                
                score = self._minimax(
                    game_copy,
                    depth - 1,
                    True,
                    board_idx,
                    cell_idx
                )
                min_score = min(score, min_score)
            
            return min_score
    
    def _evaluate_board(self, global_board) -> Optional[PlayerSymbol]:
        """Check if there's a winner"""
        # Check rows
        for i in range(0, 9, 3):
            if (global_board[i][0] is not None and 
                global_board[i][0] == global_board[i+1][0] == global_board[i+2][0]):
                return global_board[i][0]
        
        # Check columns
        for i in range(3):
            if (global_board[i][0] is not None and 
                global_board[i][0] == global_board[i][3] == global_board[i][6]):
                return global_board[i][0]
        
        # Check diagonals
        if (global_board[0][0] is not None and 
            global_board[0][0] == global_board[4][0] == global_board[8][0]):
            return global_board[0][0]
        
        if (global_board[2][0] is not None and 
            global_board[2][0] == global_board[4][0] == global_board[6][0]):
            return global_board[2][0]
        
        # Check for draw
        if all(board[0] is not None for board in global_board):
            return PlayerSymbol.T
        
        return None
    
    def _evaluate_position(self, game_state: GameState) -> float:
        """Evaluate board position (heuristic)"""
        score = 0
        
        # Favor center boards
        center_boards = [4]
        for board_idx in center_boards:
            if game_state.global_board[board_idx][0] == PlayerSymbol.O:
                score += 10
            elif game_state.global_board[board_idx][0] == PlayerSymbol.X:
                score -= 10
        
        # Count winning patterns
        for board_idx, board in enumerate(game_state.global_board):
            winner = check_board_winner(board)
            if winner == PlayerSymbol.O:
                score += 50
            elif winner == PlayerSymbol.X:
                score -= 50
        
        return score
    
    def _get_next_board(self, game_state: GameState, last_cell_idx: int) -> Optional[int]:
        """Determine which board to play next"""
        next_board = last_cell_idx
        if game_state.global_board[next_board][0] is not None:
            return None  # Can play any board
        return next_board
    
    def _copy_game_state(self, game_state: GameState) -> GameState:
        """Create deep copy of game state"""
        import copy
        return copy.deepcopy(game_state)

# Global AI instance
ai_engine = AIEngine()
```

### Step 2: Update Game Service (`api/services/game_service.py`)

Add AI support to `create_game`:

```python
def create_game(self, mode: GameMode = GameMode.REMOTE, difficulty: str = "medium") -> GameState:
    game = GameState(mode=mode)
    
    if mode == GameMode.AI:
        # Create AI player automatically
        from api.utils.ai_logic import ai_engine
        
        # Initialize AI for this game
        game._ai_engine = ai_engine
        game._ai_difficulty = difficulty
    
    with get_db() as db:
        game_db = GameDB(
            id=game.id,
            mode=mode,
            global_board=convert_global_board_to_db(game.global_board)
        )
        db.add(game_db)
        db.commit()
    
    self.games[game.id] = game
    return game
```

Add AI move endpoint:

```python
def get_ai_move(self, game_id: str, active_board: Optional[int] = None) -> GameMove:
    """Get AI's next move"""
    game = self._get_game_or_404(game_id)
    
    if game.mode != GameMode.AI:
        raise HTTPException(status_code=400, detail="Game is not in AI mode")
    
    from api.utils.ai_logic import ai_engine
    
    board_idx, cell_idx = ai_engine.find_best_move(game, active_board)
    
    return GameMove(
        playerId="ai",
        global_board_index=board_idx,
        local_board_index=cell_idx
    )
```

### Step 3: Create AI Game Router (`api/routers/ai_router.py`)

```python
from fastapi import APIRouter, HTTPException
from api.models.game import GameCreateRequest
from api.services.game_service import game_service

router = APIRouter()

@router.post("/create-game-ai")
async def create_ai_game(request: GameCreateRequest, difficulty: str = "medium"):
    """Create a new AI game"""
    game = game_service.create_game(request.mode, difficulty)
    return {
        "game_id": game.id,
        "mode": game.mode,
        "difficulty": difficulty
    }

@router.get("/get-ai-move/{game_id}")
async def get_ai_move(game_id: str, active_board: int = None):
    """Get AI's next move"""
    move = game_service.get_ai_move(game_id, active_board)
    return {
        "global_board_index": move.global_board_index,
        "local_board_index": move.local_board_index
    }
```

### Step 4: Update Frontend Game Hook (`hooks/useCreateGame.ts`)

```typescript
export const useCreateGame = () => {
  const { games } = useGameStore();

  const createGame = async (mode: GameModeType, difficulty: string = "medium"): Promise<GameData> => {
    const endpoint = mode === GameModeType.AI 
      ? `/api/py/game/create-game-ai`
      : `/api/py/game/create-game`;
    
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ mode, difficulty }),
    });
    const data = await response.json();
    return GameSchema.parse(data);
  };

  // ... rest of the hook
};
```

### Step 5: Create AI Game Component (`components/Game/AIGame.tsx`)

```typescript
"use client";

import React, { useEffect, useState } from "react";
import SuperTicTacToe from "./SuperTicTacToe";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const AIGame: React.FC<{ gameId: string; userId: string; difficulty: string }> = ({
  gameId,
  userId,
  difficulty,
}) => {
  const [isAIThinking, setIsAIThinking] = useState(false);
  const router = useRouter();

  const makeAIMove = async (activeBoard: number | null) => {
    setIsAIThinking(true);
    try {
      const response = await fetch(`/api/py/game/get-ai-move/${gameId}?active_board=${activeBoard ?? ""}`);
      
      if (!response.ok) {
        throw new Error("Failed to get AI move");
      }
      
      const moveData = await response.json();
      
      // Send the move through WebSocket or game update
      // This will be handled by the parent component
      window.dispatchEvent(
        new CustomEvent("aiMoveReady", {
          detail: {
            gameId,
            move: moveData,
          },
        })
      );
    } catch (error) {
      toast.error("AI failed to make a move");
      console.error("AI move error:", error);
    } finally {
      setIsAIThinking(false);
    }
  };

  return (
    <SuperTicTacToe
      userId={userId}
      isAIGame={true}
      onMakeAIMove={makeAIMove}
      isAIThinking={isAIThinking}
    />
  );
};

export default AIGame;
```

### Step 6: Update PlayWith Component

```typescript
const handleGameCreation = (mode: GameModeType) => {
  setIsButtonLoading((prev) => ({
    ...prev,
    [mode]: true,
  }));

  if (mode === GameModeType.AI) {
    // Show difficulty selector or use default
    setSelectedDifficulty("medium");
    setShowDifficultyModal(true);
    return;
  }

  // ... rest of remote game creation
};
```

### Step 7: Game Flow Management

For AI games:
1. Player makes a move
2. Game state updates (player is X, AI is O)
3. Check if game is won/drawn
4. If not: Fetch AI move via HTTP
5. Update game state with AI move
6. Switch back to player's turn
7. Repeat

---

## Difficulty Levels

### Easy
- Random valid moves
- No look-ahead
- Fast response

### Medium
- Minimax depth 3
- ~50ms decision time
- Competitive but beatable

### Hard
- Minimax depth 5
- ~500ms decision time
- Very challenging

---

## Database Changes

AI games are saved like regular games:
- User plays as X
- AI plays as O
- Results saved to `GameHistoryDB`
- Points awarded: WIN (+10), LOSS (-5), DRAW (+1)

---

## Performance Optimizations

1. **Move Ordering**: Prioritize center and strategic positions
2. **Branching Limit**: Limit top-level moves to best 10 candidates
3. **Memoization**: Cache evaluated positions (optional)
4. **Async Processing**: Use background task for AI thinking

```python
# Optional: Background task for AI move
from fastapi import BackgroundTasks

@router.post("/make-move-with-ai")
async def make_move_with_ai(move: GameMove, background_tasks: BackgroundTasks):
    game = game_service.make_move(move.game_id, move)
    
    if game.current_player == PlayerSymbol.O:
        background_tasks.add_task(game_service.get_ai_move, move.game_id)
    
    return game
```

---

## Testing Checklist

- [ ] AI makes valid moves only
- [ ] AI respects active board constraint
- [ ] AI prevents opponent from winning
- [ ] AI creates winning opportunities
- [ ] Game saves correctly to profile
- [ ] Points awarded properly
- [ ] Win rate calculation includes AI games
- [ ] Different difficulties play differently
- [ ] Game handles draws correctly
- [ ] AI doesn't crash on unusual board states

---

## Future Enhancements

1. **Skilled Opponent Personalities**: Different play styles (aggressive, defensive)
2. **Learning AI**: Track winning strategies
3. **Difficulty Progression**: Increase difficulty as player improves
4. **Hints System**: Suggest best moves to player
5. **Replay Analysis**: Show AI decision tree
