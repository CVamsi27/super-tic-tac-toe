# How to Implement Play with AI - Complete Guide

## Summary

I've created **3 comprehensive guides** to help you implement AI gameplay for Super Tic Tac Toe:

### 📚 Documentation Files Created

1. **`AI_IMPLEMENTATION.md`** - Complete architectural guide
   - Overview and architecture comparison
   - Detailed implementation steps
   - Code structure and organization
   - Performance optimization strategies
   - Testing checklist
   - Future enhancements

2. **`AI_IMPLEMENTATION_STEPS.md`** - Step-by-step execution plan
   - 5 phases of implementation
   - Estimated time for each phase
   - Detailed checklist for each step
   - Implementation order and timeline
   - Code review points
   - Rollback plan

3. **`AI_QUICK_START.md`** - Copy-paste ready code snippets
   - All complete implementations
   - File-by-file changes
   - Testing commands
   - Debugging tips
   - Common issues & fixes
   - Final checklist

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   REMOTE vs AI MODE                     │
├─────────────────────────────────────────────────────────┤
│  REMOTE MODE          │  AI MODE                        │
├───────────────────────┼──────────────────────────────────┤
│ 2 Players             │ 1 Player vs Computer            │
│ WebSocket Real-time   │ HTTP Requests for AI moves      │
│ State on Backend      │ State on Backend + Frontend     │
│ Both players active   │ Player X, AI is O               │
│ Network dependent     │ Works offline (no sync needed)  │
└───────────────────────┴──────────────────────────────────┘
```

---

## AI Algorithm: Minimax

**What it does**: Evaluates all possible future moves and picks the best one

**How it works**:
1. Simulates all possible moves
2. For each move, recursively simulates opponent's best response
3. Scores each position
4. Picks move that maximizes AI score (or minimizes player score)

**Difficulty Levels**:
- **Easy**: Random moves (instant)
- **Medium**: Look ahead 3 moves (~50ms)
- **Hard**: Look ahead 5 moves (~500ms)

---

## Implementation Overview

### Phase 1: Backend AI Engine (2-3 hours)
```
1. Create api/utils/ai_logic.py
   ├── AIEngine class
   ├── find_best_move() - Main entry point
   ├── _minimax() - Algorithm
   ├── _get_valid_moves() - Validation
   └── _score_position() - Board evaluation

2. Update api/models/game.py
   └── Add difficulty to GameCreateRequest

3. Update api/services/game_service.py
   ├── Modify create_game() for AI
   └── Add get_ai_move()

4. Create api/routers/ai_router.py
   ├── POST /create-game-ai
   └── GET /get-ai-move/{game_id}

5. Update api/main.py
   └── Register ai_router
```

### Phase 2: Frontend AI Support (2-3 hours)
```
1. Update hooks/useCreateGame.ts
   └── Support both endpoints

2. Update components/PlayWith/PlayWith.tsx
   └── Enable AI mode button

3. Create components/Game/AIGame.tsx
   ├── Wrapper component
   ├── Fetch AI moves
   └── Show "AI thinking" indicator

4. Update components/Game/SuperTicTacToe.tsx
   ├── Support both modes
   └── Switch between WebSocket and HTTP

5. Update app/game/[gameId]/page.tsx
   └── Detect game mode and render correctly
```

### Phase 3: State Management & Storage (1-2 hours)
```
1. Update store/useGameStore.ts
   ├── Add isAIGame flag
   └── Add AI difficulty

2. Ensure game results save
   ├── Opponent: "AI (medium)"
   ├── Points calculated correctly
   └── Save to GameHistoryDB
```

### Phase 4: Testing (2-3 hours)
```
1. Test AI logic independently
2. Test game creation
3. Test AI move fetching
4. Test full game flow
5. Test edge cases
6. Performance testing
```

---

## Key Components

### 1. AI Engine (`api/utils/ai_logic.py`)
```python
engine = AIEngine("medium")
move = engine.find_best_move(game_state, active_board=None)
# Returns: (global_board_index, local_board_index)
```

**Dependencies**: 
- GameState model
- PlayerSymbol enum
- game_logic utilities

### 2. AI Router (`api/routers/ai_router.py`)

**Endpoints**:
```
POST /api/py/game/create-game-ai?difficulty=medium
  ├── Input: None
  └── Output: { game_id, mode, difficulty }

GET /api/py/game/get-ai-move/{game_id}?active_board=0
  ├── Input: game_id, optional active_board
  └── Output: { global_board_index, local_board_index }
```

### 3. AI Game Component (`components/Game/AIGame.tsx`)

**Props**:
```typescript
interface AIGameProps {
  gameId: string;
  userId: string;
  difficulty?: string;
}
```

**Flow**:
1. Player makes move
2. GameBoard updates state
3. AIGame listens for "player moved" event
4. Fetches AI move via `/get-ai-move`
5. Dispatches `aiMoveReady` event
6. GameBoard applies AI move
7. Switches to player's turn

---

## Game Flow: Player Turn

```
┌─────────────────────────────────────────┐
│ 1. Player clicks cell                   │
└─────────────────────┬───────────────────┘
                      │
┌─────────────────────▼───────────────────┐
│ 2. GameBoard updates local state        │
│    (set cell to X)                      │
└─────────────────────┬───────────────────┘
                      │
┌─────────────────────▼───────────────────┐
│ 3. Check if player won                  │
│    Check next active board              │
└─────────────────────┬───────────────────┘
                      │
               NO WINNER?
                      │
┌─────────────────────▼───────────────────┐
│ 4. Disable board (show "AI thinking")   │
└─────────────────────┬───────────────────┘
                      │
┌─────────────────────▼───────────────────┐
│ 5. Fetch AI move from backend           │
│    GET /get-ai-move/{gameId}            │
└─────────────────────┬───────────────────┘
                      │
┌─────────────────────▼───────────────────┐
│ 6. Update state with AI move            │
│    (set cell to O)                      │
└─────────────────────┬───────────────────┘
                      │
┌─────────────────────▼───────────────────┐
│ 7. Check if AI won                      │
│    Check next active board              │
└─────────────────────┬───────────────────┘
                      │
               NO WINNER?
                      │
┌─────────────────────▼───────────────────┐
│ 8. Enable board for player's next move  │
└─────────────────────────────────────────┘
```

---

## Data Flow

```
Frontend (React)          Backend (FastAPI)      Database (PostgreSQL)
─────────────────         ─────────────────      ──────────────────

                          POST /create-game-ai
User clicks AI    ─────────────────────────────>
  ↓                       ↓
Create AI game    Create GameState
  ↓                       Store in self.games
Player makes      ─────────────────────────────> Save to GameDB
  move            ┌─ Validate move
  ↓               │ Check winner
Enable AI         │ Update board
  thinking    ┌───┴─
  ↓           │
Wait for      GET /get-ai-move/{gameId}
  AI move    ─────────────────────────────────>
  ↓           │ Load game from self.games
Receive AI    │ Run minimax algorithm
  move        │ Find best move
  ↓           └─────────
Update board      Return move coords
  ↓
Check winner ─────────────────────────────────> Update GameDB
  ↓                       ↓                     Save results
Save game         Save game result             to GameHistoryDB
  (HTTP)          Update UserDB stats
```

---

## Database Schema (No Changes!)

**Existing schema already supports AI**:

```python
class GameDB:
    mode: Enum(REMOTE, AI)  # ✅ AI already supported
    current_player: PlayerSymbol
    global_board: ARRAY(String)
    winner: PlayerSymbol
    # ... other fields

class PlayerDB:
    game_id: ForeignKey
    symbol: PlayerSymbol  # X for player, O for AI
    status: Enum(PLAYER, WATCHER)
    # ... other fields

class GameHistoryDB:
    opponent_name: String  # "AI (medium)"
    result: Enum(WIN, LOSS, DRAW)
    points_earned: Int
```

✅ **No migrations needed** - Just update app logic

---

## Performance Characteristics

| Difficulty | Depth | Avg Time | Win Rate vs Random |
|------------|-------|----------|------------------|
| Easy       | 0     | <10ms    | ~50%              |
| Medium     | 3     | 50-100ms | ~95%              |
| Hard       | 5     | 500-1000ms | ~99%            |

**Optimization strategies**:
- Limit branching (check top 10 moves instead of all)
- Cache evaluated positions
- Use alpha-beta pruning
- Run AI in background task

---

## Estimated Timeline

| Phase | Duration | Tasks |
|-------|----------|-------|
| 1: Backend | 2-3h | AI engine + routes |
| 2: Frontend | 2-3h | Components + hooks |
| 3: Integration | 1-2h | State management |
| 4: Testing | 2-3h | Tests + debugging |
| **Total** | **7-11h** | One day of development |

---

## Testing Strategy

### Unit Tests
```python
def test_easy_ai_random():
    # Easy should make random valid moves
    moves = set()
    for _ in range(5):
        move = AIEngine('easy').find_best_move(game)
        moves.add(move)
    assert len(moves) > 1  # Should be random

def test_medium_ai_blocks_winner():
    # AI should block player's winning move
    game = setup_game_with_player_near_win()
    move = AIEngine('medium').find_best_move(game)
    # Verify move blocks player
    assert move_blocks_winner(game, move)

def test_hard_ai_finds_win():
    # AI should take winning move
    game = setup_game_with_ai_winning_move()
    move = AIEngine('hard').find_best_move(game)
    assert move == winning_move
```

### Integration Tests
```typescript
test('AI game creation', async () => {
  const response = await fetch('/api/py/game/create-game-ai?difficulty=medium');
  expect(response.status).toBe(200);
  const game = await response.json();
  expect(game.mode).toBe('ai');
});

test('AI move request', async () => {
  const game = await createAIGame();
  const response = await fetch(`/api/py/game/get-ai-move/${game.id}`);
  const move = await response.json();
  expect(move).toHaveProperty('global_board_index');
  expect(move).toHaveProperty('local_board_index');
});

test('Full AI game', async () => {
  // Play complete game vs AI
  // Verify game result saved
  // Check profile shows game
});
```

---

## Potential Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| AI too fast/slow | Wrong depth | Adjust max_depth |
| AI makes invalid moves | Bug in move validation | Debug _get_valid_moves() |
| Games not saving | Missing game_service call | Check make_move() |
| UI freezes during AI | Sync AI computation | Use async/background tasks |
| High CPU usage | Exponential branching | Limit branching factor |

---

## Next Steps (What To Do Now)

### Immediate Actions
1. **Read** `AI_QUICK_START.md` for copy-paste code
2. **Create** `api/utils/ai_logic.py` 
3. **Update** `api/models/game.py`
4. **Update** `api/services/game_service.py`
5. **Create** `api/routers/ai_router.py`
6. **Test** with curl: `curl -X POST http://localhost:8000/api/py/game/create-game-ai`

### Then Frontend
7. **Create** `components/Game/AIGame.tsx`
8. **Update** `hooks/useCreateGame.ts`
9. **Update** `components/PlayWith/PlayWith.tsx`
10. **Test** in browser

### Finally Polish
11. Run full game test
12. Check profile saves correctly
13. Optimize performance if needed
14. Deploy!

---

## Resources in Your Repo

- `AI_IMPLEMENTATION.md` - Full architecture & concepts
- `AI_IMPLEMENTATION_STEPS.md` - Phase-by-phase roadmap
- `AI_QUICK_START.md` - Code snippets ready to use
- `DEPLOYMENT.md` - Deployment configuration (already exists)

---

## Questions?

Refer to the specific guide:
- **"How do I implement X?"** → `AI_IMPLEMENTATION.md`
- **"What's the order?"** → `AI_IMPLEMENTATION_STEPS.md`
- **"Show me the code"** → `AI_QUICK_START.md`

---

## Success Criteria

✅ AI game creation works
✅ AI makes valid moves
✅ Game completes (win/loss/draw)
✅ Results save to profile
✅ Stats calculate correctly
✅ No errors in console
✅ Performance acceptable

Once all ✅, you're done!
