# AI Implementation - Quick Reference & Code Snippets

## Quick Start (Copy-Paste Ready)

### 1. AI Logic Engine (`api/utils/ai_logic.py`)

Create new file with this complete implementation:

```python
from typing import List, Optional, Tuple
from api.models.game import PlayerSymbol, GameState
from api.utils.game_logic import check_board_winner
import random
import copy

class AIEngine:
    """Minimax-based AI for Super Tic Tac Toe"""
    
    def __init__(self, difficulty: str = "medium"):
        self.difficulty = difficulty
        self.max_depth = {"easy": 0, "medium": 3, "hard": 5}.get(difficulty, 3)
        self.eval_cache = {}  # Simple cache for positions
    
    def find_best_move(
        self, 
        game_state: GameState,
        active_board: Optional[int] = None
    ) -> Tuple[int, int]:
        """Find best move for AI (O)"""
        if self.difficulty == "easy":
            return self._random_move(game_state, active_board)
        return self._minimax_move(game_state, active_board)
    
    def _get_valid_moves(
        self, 
        game_state: GameState,
        active_board: Optional[int] = None
    ) -> List[Tuple[int, int]]:
        """Get all valid moves"""
        valid_moves = []
        
        if active_board is not None:
            board = game_state.global_board[active_board]
            for idx, cell in enumerate(board):
                if cell is None:
                    valid_moves.append((active_board, idx))
        else:
            for b_idx, board in enumerate(game_state.global_board):
                for c_idx, cell in enumerate(board):
                    if cell is None:
                        valid_moves.append((b_idx, c_idx))
        
        return valid_moves
    
    def _random_move(
        self, 
        game_state: GameState,
        active_board: Optional[int] = None
    ) -> Tuple[int, int]:
        """Random move for easy difficulty"""
        moves = self._get_valid_moves(game_state, active_board)
        return random.choice(moves) if moves else (0, 0)
    
    def _minimax_move(
        self, 
        game_state: GameState,
        active_board: Optional[int] = None
    ) -> Tuple[int, int]:
        """Minimax for medium/hard"""
        moves = self._get_valid_moves(game_state, active_board)
        if not moves:
            return (0, 0)
        
        best_score = float('-inf')
        best_move = moves[0]
        
        for move in moves[:15]:  # Limit branching
            b_idx, c_idx = move
            game_copy = copy.deepcopy(game_state)
            game_copy.global_board[b_idx][c_idx] = PlayerSymbol.O
            
            score = self._minimax(game_copy, self.max_depth, False, b_idx, c_idx)
            if score > best_score:
                best_score = score
                best_move = move
        
        return best_move
    
    def _minimax(
        self,
        game: GameState,
        depth: int,
        is_maximizing: bool,
        last_b: int,
        last_c: int
    ) -> float:
        """Minimax with pruning"""
        winner = self._check_winner(game.global_board)
        
        if winner == PlayerSymbol.O:
            return 100 + depth
        elif winner == PlayerSymbol.X:
            return -100 - depth
        elif winner == PlayerSymbol.T:
            return 0
        
        if depth == 0:
            return self._score_position(game)
        
        next_board = self._get_next_board(game, last_c)
        
        if is_maximizing:
            max_score = float('-inf')
            for b_idx, c_idx in self._get_valid_moves(game, next_board)[:10]:
                g_copy = copy.deepcopy(game)
                g_copy.global_board[b_idx][c_idx] = PlayerSymbol.O
                score = self._minimax(g_copy, depth - 1, False, b_idx, c_idx)
                max_score = max(score, max_score)
            return max_score
        else:
            min_score = float('inf')
            for b_idx, c_idx in self._get_valid_moves(game, next_board)[:10]:
                g_copy = copy.deepcopy(game)
                g_copy.global_board[b_idx][c_idx] = PlayerSymbol.X
                score = self._minimax(g_copy, depth - 1, True, b_idx, c_idx)
                min_score = min(score, min_score)
            return min_score
    
    def _check_winner(self, board) -> Optional[PlayerSymbol]:
        """Check if anyone won"""
        patterns = [
            [0,1,2], [3,4,5], [6,7,8],  # rows
            [0,3,6], [1,4,7], [2,5,8],  # cols
            [0,4,8], [2,4,6]            # diagonals
        ]
        
        for pattern in patterns:
            if board[pattern[0]][0] and \
               board[pattern[0]][0] == board[pattern[1]][0] == board[pattern[2]][0]:
                return board[pattern[0]][0]
        
        if all(b[0] for b in board):
            return PlayerSymbol.T
        
        return None
    
    def _score_position(self, game: GameState) -> float:
        """Heuristic scoring"""
        score = 0
        
        # Favor center boards
        for b_idx in [4]:
            if game.global_board[b_idx][0] == PlayerSymbol.O:
                score += 10
            elif game.global_board[b_idx][0] == PlayerSymbol.X:
                score -= 10
        
        # Count won boards
        for board in game.global_board:
            if board[0] == PlayerSymbol.O:
                score += 20
            elif board[0] == PlayerSymbol.X:
                score -= 20
        
        return score
    
    def _get_next_board(self, game: GameState, last_c: int) -> Optional[int]:
        """Determine next board"""
        if game.global_board[last_c][0] is None:
            return last_c
        return None

# Global instance
ai_engine = AIEngine()
```

---

### 2. Update Models (`api/models/game.py`)

Add to `GameCreateRequest`:

```python
class GameCreateRequest(BaseModel):
    mode: GameMode = GameMode.REMOTE
    difficulty: str = "medium"  # ADD THIS
```

---

### 3. Update GameService (`api/services/game_service.py`)

**Add import at top:**
```python
from api.utils.ai_logic import ai_engine
```

**Update create_game method:**
```python
def create_game(self, mode: GameMode = GameMode.REMOTE, difficulty: str = "medium") -> GameState:
    game = GameState(mode=mode)
    
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

**Add new method:**
```python
def get_ai_move(self, game_id: str, active_board: Optional[int] = None) -> dict:
    """Get AI's next move"""
    game = self._get_game_or_404(game_id)
    
    if game.mode != GameMode.AI:
        raise HTTPException(status_code=400, detail="Not an AI game")
    
    b_idx, c_idx = ai_engine.find_best_move(game, active_board)
    
    return {
        "global_board_index": b_idx,
        "local_board_index": c_idx
    }
```

---

### 4. Create AI Router (`api/routers/ai_router.py`)

Create new file:

```python
from fastapi import APIRouter, HTTPException
from api.models.game import GameCreateRequest, GameMode
from api.services.game_service import game_service

router = APIRouter()

@router.post("/create-game-ai")
async def create_ai_game(difficulty: str = "medium"):
    """Create AI game"""
    game = game_service.create_game(GameMode.AI, difficulty)
    return {
        "game_id": game.id,
        "mode": game.mode,
        "difficulty": difficulty
    }

@router.get("/get-ai-move/{game_id}")
async def get_ai_move(game_id: str, active_board: int = None):
    """Get AI move"""
    return game_service.get_ai_move(game_id, active_board)
```

---

### 5. Update Main App (`api/main.py`)

Add import:
```python
from api.routers import game_router, auth_router, ai_router  # ADD ai_router
```

Add router registration (after existing routers):
```python
app.include_router(ai_router.router, prefix="/api/py/game", tags=["AI"])
```

---

### 6. Update useCreateGame Hook (`hooks/useCreateGame.ts`)

Modify `createGame` function:

```typescript
const createGame = async (
  mode: GameModeType, 
  difficulty: string = "medium"
): Promise<GameData> => {
  const endpoint = mode === GameModeType.AI 
    ? `/api/py/game/create-game-ai?difficulty=${difficulty}`
    : `/api/py/game/create-game`;
  
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ mode }),
  });
  const data = await response.json();
  return GameSchema.parse(data);
};
```

---

### 7. Update PlayWith Component (`components/PlayWith/PlayWith.tsx`)

Replace the AI button handler:

```typescript
const handleGameCreation = (mode: GameModeType) => {
  setIsButtonLoading((prev) => ({
    ...prev,
    [mode]: true,
  }));

  if (mode === GameModeType.AI) {
    // For now, use medium difficulty as default
    // TODO: Add difficulty selector modal
    reset();
    mutate(mode, {
      onSuccess: (data) => {
        router.push(`/game/${data.game_id}?difficulty=medium`);
      },
      onError: (error) => {
        const message = extractErrorMessage(error);
        toast.error("Failed to create AI game", { description: message });
      },
      onSettled: () => {
        setIsButtonLoading((prev) => ({
          ...prev,
          [mode]: false,
        }));
      },
    });
    return;
  }

  // Existing remote game creation code...
  reset();
  mutate(mode, {
    // ... existing code
  });
};
```

---

### 8. Create AIGame Component (`components/Game/AIGame.tsx`)

```typescript
"use client";

import React, { useEffect, useState } from "react";
import SuperTicTacToe from "./SuperTicTacToe";
import { toast } from "sonner";

interface AIGameProps {
  gameId: string;
  userId: string;
  difficulty?: string;
}

const AIGame: React.FC<AIGameProps> = ({ 
  gameId, 
  userId, 
  difficulty = "medium" 
}) => {
  const [isAIThinking, setIsAIThinking] = useState(false);

  const makeAIMove = async (activeBoard: number | null) => {
    setIsAIThinking(true);
    try {
      const url = activeBoard !== null 
        ? `/api/py/game/get-ai-move/${gameId}?active_board=${activeBoard}`
        : `/api/py/game/get-ai-move/${gameId}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error("Failed to get AI move");
      }
      
      const moveData = await response.json();
      
      // Dispatch event for parent to handle
      window.dispatchEvent(
        new CustomEvent("aiMoveReady", {
          detail: {
            gameId,
            move: moveData,
          },
        })
      );
    } catch (error) {
      toast.error("AI failed to move");
      console.error(error);
    } finally {
      setIsAIThinking(false);
    }
  };

  return (
    <SuperTicTacToe
      userId={userId}
      isAIGame={true}
      difficulty={difficulty}
      onRequestAIMove={makeAIMove}
      isAIThinking={isAIThinking}
    />
  );
};

export default AIGame;
```

---

## Testing Commands

```bash
# Test AI logic directly
python -c "
from api.utils.ai_logic import AIEngine
from api.models.game import GameState, PlayerSymbol

engine = AIEngine('easy')
game = GameState()
move = engine.find_best_move(game)
print(f'Move: {move}')
"

# Test API endpoint
curl -X POST "http://localhost:8000/api/py/game/create-game-ai?difficulty=medium"

curl -X GET "http://localhost:8000/api/py/game/get-ai-move/YOUR_GAME_ID"
```

---

## Database - No Changes Required

The existing `GameDB` and `PlayerDB` tables already support AI games:
- `mode` enum already includes `AI`
- All AI games save same way as remote games
- No migrations needed

---

## Performance Tuning Tips

### If AI is too slow:
```python
# In AIEngine.__init__, reduce depth:
self.max_depth = {"easy": 0, "medium": 2, "hard": 3}  # Reduced from 3,5

# Or limit branching more:
for move in moves[:5]:  # From 10 to 5
```

### If AI is too dumb:
```python
# Increase depth:
self.max_depth = {"easy": 0, "medium": 4, "hard": 6}

# Improve heuristic in _score_position()
```

---

## Common Issues & Fixes

| Issue | Solution |
|-------|----------|
| AI never moves | Check `active_board` logic in `_get_next_board()` |
| AI too slow on hard | Reduce max_depth or limit branching |
| AI makes invalid moves | Debug `_get_valid_moves()` |
| Import errors | Ensure all files created in correct directories |
| Game doesn't save | Check GameService.make_move() saves AI moves |

---

## Debugging Tips

```python
# Add to ai_logic.py for debugging
def find_best_move_debug(self, game_state, active_board=None):
    moves = self._get_valid_moves(game_state, active_board)
    print(f"Valid moves: {moves}")
    best_move = self.find_best_move(game_state, active_board)
    print(f"Selected: {best_move}")
    return best_move
```

```typescript
// Add to AIGame.tsx for debugging
const makeAIMove = async (activeBoard: number | null) => {
  console.log("AI thinking...", { gameId, activeBoard });
  // ... rest of function
  console.log("AI response:", moveData);
};
```

---

## Checklist for Implementation

- [ ] Created `api/utils/ai_logic.py`
- [ ] Updated `api/models/game.py`
- [ ] Updated `api/services/game_service.py`
- [ ] Created `api/routers/ai_router.py`
- [ ] Updated `api/main.py`
- [ ] Updated `hooks/useCreateGame.ts`
- [ ] Updated `components/PlayWith/PlayWith.tsx`
- [ ] Created `components/Game/AIGame.tsx`
- [ ] Updated `app/game/[gameId]/page.tsx` (TODO)
- [ ] Tested AI logic independently
- [ ] Tested game creation
- [ ] Tested AI move fetching
- [ ] Tested full game flow
- [ ] Verified game saves to profile
