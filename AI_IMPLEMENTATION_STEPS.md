# AI Implementation - Step-by-Step Execution Plan

## Phase 1: Backend AI Engine (Est. 2-3 hours)

### ✅ Step 1.1: Create AI Logic Module
**File**: `api/utils/ai_logic.py`
**What**: Implement minimax algorithm with difficulty levels
**Difficulty**: Medium
**Depends on**: None

```bash
# After creating ai_logic.py, test with:
python -c "from api.utils.ai_logic import AIEngine; print(AIEngine('easy'))"
```

**Key Functions**:
- `find_best_move()` - Main entry point
- `_minimax()` - Core algorithm
- `_get_valid_moves()` - Move validation
- `_evaluate_position()` - Board scoring

### ✅ Step 1.2: Update Game Models
**File**: `api/models/game.py`
**What**: Add AI difficulty to game requests
**Difficulty**: Easy
**Changes**:
```python
class GameCreateRequest(BaseModel):
    mode: GameMode = GameMode.REMOTE
    difficulty: str = "medium"  # NEW
```

### ✅ Step 1.3: Update GameService
**File**: `api/services/game_service.py`
**What**: Add `get_ai_move()` method and AI initialization
**Difficulty**: Easy
**Changes**:
- Modify `create_game()` to accept difficulty
- Add `get_ai_move()` method

### ✅ Step 1.4: Create AI Router
**File**: `api/routers/ai_router.py` (NEW)
**What**: HTTP endpoints for AI game creation and moves
**Difficulty**: Easy
**Endpoints**:
- `POST /create-game-ai` - Create AI game
- `GET /get-ai-move/{game_id}` - Get AI's next move

### ✅ Step 1.5: Register AI Router
**File**: `api/main.py`
**What**: Add AI router to FastAPI app
**Difficulty**: Easy
**Change**:
```python
from api.routers import ai_router
app.include_router(ai_router.router, prefix="/api/py/game", tags=["AI"])
```

---

## Phase 2: Frontend AI Support (Est. 2-3 hours)

### ✅ Step 2.1: Update useCreateGame Hook
**File**: `hooks/useCreateGame.ts`
**What**: Support creating AI games
**Difficulty**: Easy
**Changes**:
- Add difficulty parameter to `createGame()`
- Route to correct endpoint based on mode

### ✅ Step 2.2: Update PlayWith Component
**File**: `components/PlayWith/PlayWith.tsx`
**What**: Enable AI mode button and difficulty selector
**Difficulty**: Medium
**Changes**:
- Remove hardcoded `/soon` redirect for AI
- Add difficulty modal/dropdown
- Pass difficulty to game creation

### ✅ Step 2.3: Create AIGame Wrapper Component
**File**: `components/Game/AIGame.tsx` (NEW)
**What**: Wrapper for AI game-specific logic
**Difficulty**: Medium
**Responsibilities**:
- Listen for player moves
- Fetch AI move
- Dispatch AI move event
- Show "AI thinking..." indicator

### ✅ Step 2.4: Update SuperTicTacToe Component
**File**: `components/Game/SuperTicTacToe.tsx`
**What**: Support both WebSocket (remote) and HTTP (AI) modes
**Difficulty**: Hard
**Changes**:
- Add `isAIGame` prop
- Add `onMakeAIMove` callback
- Modify turn logic to trigger AI after player moves
- Replace WebSocket with HTTP for AI games

### ✅ Step 2.5: Update GameBoard Component
**File**: `components/Game/GameBoard.tsx`
**What**: Support local-only state for AI games
**Difficulty**: Medium
**Changes**:
- Use local state instead of WebSocket for AI
- Trigger AI move after player move
- Disable board while AI is thinking

### ✅ Step 2.6: Update Game Page
**File**: `app/game/[gameId]/page.tsx`
**What**: Detect game mode and render appropriate component
**Difficulty**: Easy
**Changes**:
- Fetch game metadata to check if AI mode
- Render AIGame wrapper if AI mode
- Render SuperTicTacToe normally if remote mode

---

## Phase 3: State Management & Storage (Est. 1-2 hours)

### ✅ Step 3.1: Update Game Store
**File**: `store/useGameStore.ts`
**What**: Support both WebSocket and local game state
**Difficulty**: Easy
**Changes**:
- Add `isAIGame` flag to game state
- Add AI difficulty to game state
- Add AI thinking status

### ✅ Step 3.2: Update Game Result Saving
**File**: `api/services/game_service.py`
**What**: Save AI game results correctly
**Difficulty**: Easy
**Changes**:
- AI opponent name: "AI ({difficulty})"
- Ensure points calculated correctly
- Save to `GameHistoryDB` same as remote games

### ✅ Step 3.3: Update Profile Display
**File**: `app/profile/page.tsx` (optional enhancement)
**What**: Show AI vs Human games differently
**Difficulty**: Easy
**Note**: Can add icon or label like 🤖 for AI games

---

## Phase 4: Testing & Refinement (Est. 2-3 hours)

### ✅ Step 4.1: Test AI Logic Independently
```python
# Create test script: api/tests/test_ai.py
def test_easy_ai():
    engine = AIEngine("easy")
    game = create_test_game()
    move = engine.find_best_move(game)
    assert isinstance(move, tuple)
    assert len(move) == 2

def test_medium_ai():
    engine = AIEngine("medium")
    game = create_test_game()
    move = engine.find_best_move(game)
    # Should not be random
    assert move is not None

def test_hard_ai():
    engine = AIEngine("hard")
    game = create_test_game()
    move = engine.find_best_move(game)
    # Should find optimal move
    assert move is not None
```

### ✅ Step 4.2: Test Game Flow
- [ ] Create AI game with easy difficulty
- [ ] Make a move → AI responds
- [ ] Make another move → AI responds
- [ ] Play to completion (win/loss/draw)
- [ ] Verify result saved to profile

### ✅ Step 4.3: Test AI Difficulty Progression
- [ ] Easy: Loses often, responds instantly
- [ ] Medium: Competitive, ~50ms delay
- [ ] Hard: Challenging, ~500ms delay

### ✅ Step 4.4: Test Edge Cases
- [ ] AI can't find move (board full)
- [ ] AI wins immediately if available
- [ ] AI blocks player's winning move
- [ ] AI handles draws correctly

### ✅ Step 4.5: Performance Testing
- [ ] Hard AI doesn't timeout (< 2s)
- [ ] Multiple concurrent AI games
- [ ] No memory leaks over long games

---

## Phase 5: Deployment & Documentation (Est. 1-2 hours)

### ✅ Step 5.1: Update Environment Variables (if needed)
- No new env vars required (AI runs locally)

### ✅ Step 5.2: Database Migration (if needed)
- No schema changes (uses existing GameDB)
- No migration needed

### ✅ Step 5.3: Update README
- [ ] Add AI mode section
- [ ] Explain difficulty levels
- [ ] Add screenshots/GIFs of AI gameplay

### ✅ Step 5.4: Performance Tuning
- [ ] Profile AI move generation
- [ ] Optimize minimax for production
- [ ] Consider caching for repeated positions

---

## Rollout Checklist

### Before Going Live
- [ ] All tests passing
- [ ] AI doesn't crash on edge cases
- [ ] Performance acceptable (<2s per move on hard)
- [ ] Game results saving correctly
- [ ] Profile shows all games
- [ ] No console errors

### Going Live
1. Merge AI branch to main
2. Deploy to production
3. Test on live server
4. Monitor for errors

### Post-Launch Monitoring
- [ ] Check AI move response times
- [ ] Monitor error logs
- [ ] Verify game saving
- [ ] Gather user feedback

---

## Implementation Order (Recommended)

```
Week 1 (Backend):
├── Create ai_logic.py (minimax algorithm)
├── Update models for AI
├── Add get_ai_move() to GameService
├── Create ai_router.py
└── Test AI logic independently

Week 2 (Frontend):
├── Update useCreateGame hook
├── Create AIGame component
├── Update SuperTicTacToe for both modes
├── Update GameBoard component
└── Test game creation and moves

Week 3 (Integration & Polish):
├── Update game page routing
├── Test full game flow
├── Optimize performance
├── Add UI polish (AI thinking indicator)
└── Deploy and monitor
```

---

## Code Review Points

When submitting code:
1. **Minimax Algorithm**: Verify move quality at each difficulty
2. **Error Handling**: Graceful fallback if AI fails
3. **Performance**: Async AI moves to prevent UI blocking
4. **Testing**: Unit tests for AI, integration tests for flow
5. **Documentation**: Comments on minimax implementation

---

## Rollback Plan

If issues arise:
1. Revert ai_router.py
2. Remove AI creation endpoint
3. Keep AI logic for future reference
4. Users on remote mode unaffected
5. AI games can be deleted or frozen

---

## Future Enhancements

After MVP launch:
- [ ] Difficulty selector on game creation page
- [ ] Show AI thinking animation
- [ ] Display AI decision rationale
- [ ] Save game replays for analysis
- [ ] Different AI personalities
- [ ] Leaderboard for AI wins
