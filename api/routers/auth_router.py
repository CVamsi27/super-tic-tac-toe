from fastapi import APIRouter, Depends, HTTPException, status, Header
from typing import Optional
from api.models.auth import GoogleLoginRequest, AuthResponse, UserResponse, GameHistoryResponse, LeaderboardResponse, UserStatsResponse
from api.services.auth_service import auth_service

router = APIRouter()

def get_current_user_id(authorization: Optional[str] = Header(None)) -> str:
    """Dependency to get current user from JWT token"""
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing authorization header"
        )
    
    try:
        token = authorization.replace("Bearer ", "")
        user_id = auth_service.verify_access_token(token)
        return user_id
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e)
        )

@router.post("/auth/google-login")
async def google_login(request: GoogleLoginRequest) -> AuthResponse:
    """Google OAuth login endpoint"""
    user, access_token = auth_service.google_login(request.id_token)
    
    return AuthResponse(
        access_token=access_token,
        user=UserResponse(
            id=user.id,
            email=user.email,
            name=user.name,
            profile_picture=user.profile_picture,
            points=user.points,
            wins=user.wins,
            losses=user.losses,
            draws=user.draws,
            created_at=user.created_at
        )
    )

@router.get("/auth/me")
async def get_current_user(user_id: str = Depends(get_current_user_id)) -> UserResponse:
    """Get current user profile"""
    return auth_service.get_user_stats(user_id)

@router.get("/auth/history")
async def get_game_history(user_id: str = Depends(get_current_user_id)) -> list[GameHistoryResponse]:
    """Get user's game history"""
    return auth_service.get_game_history(user_id)

@router.post("/auth/save-game")
async def save_game_result(
    result: str,
    opponent_name: Optional[str] = None,
    game_duration: int = 0,
    user_id: str = Depends(get_current_user_id)
) -> GameHistoryResponse:
    """Save game result"""
    # Calculate points
    points = 0
    if result == "WIN":
        points = 10
    elif result == "LOSS":
        points = -5
    elif result == "DRAW":
        points = 1
    
    return auth_service.save_game_result(user_id, result, opponent_name, game_duration, points)

@router.get("/leaderboard")
async def get_leaderboard(limit: int = 100) -> LeaderboardResponse:
    """Get global leaderboard"""
    users = auth_service.get_leaderboard(limit)
    return LeaderboardResponse(users=users)

@router.get("/leaderboard/top")
async def get_top_players(limit: int = 10) -> list[UserStatsResponse]:
    """Get top players"""
    return auth_service.get_leaderboard(limit)
