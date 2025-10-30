"""
API routes for AI gameplay
"""

from fastapi import APIRouter, HTTPException, WebSocket
from pydantic import BaseModel
from typing import List, Tuple
from api.utils.ai_logic import AILogic
from api.services.game_service import GameService

router = APIRouter(prefix="/api/ai", tags=["ai"])


class AIMovementRequest(BaseModel):
    """Request for AI to make a move"""
    game_id: str
    board_state: dict  # e.g., {"(0,0)": "X", "(0,1)": "", ...}
    difficulty: str = "medium"  # "easy", "medium", "hard"


class AIMovementResponse(BaseModel):
    """Response with AI move"""
    move: Tuple[int, int]  # (row, col)
    game_id: str


@router.post("/move", response_model=AIMovementResponse)
async def get_ai_move(request: AIMovementRequest):
    """
    Get next move from AI
    
    Args:
        game_id: ID of the game
        board_state: Current board state as dict
        difficulty: AI difficulty level
        
    Returns:
        AI's next move
    """
    try:
        # Initialize AI with requested difficulty
        ai = AILogic(difficulty=request.difficulty)
        
        # Get available moves
        available_moves = [
            (row, col)
            for row in range(3)
            for col in range(3)
            if request.board_state.get(f"({row},{col})", "") == ""
        ]
        
        if not available_moves:
            raise HTTPException(
                status_code=400,
                detail="No available moves on board"
            )
        
        # Get AI's best move
        move = ai.get_next_move(request.board_state, available_moves)
        
        return AIMovementResponse(
            move=move,
            game_id=request.game_id
        )
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/health")
async def health_check():
    """Health check for AI service"""
    return {"status": "ok", "service": "ai"}
