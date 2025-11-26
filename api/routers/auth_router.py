from fastapi import APIRouter, Depends, HTTPException, status, Header
from typing import Optional
from api.models.auth import GoogleLoginRequest, AuthResponse, UserResponse, GameHistoryResponse, LeaderboardResponse, UserStatsResponse
from api.services.auth_service import auth_service
from api.utils.cache import get_leaderboard_cache, get_user_cache
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

# Cache instances
leaderboard_cache = get_leaderboard_cache()
user_cache = get_user_cache()

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
    
    # Invalidate user cache on login
    await user_cache.delete(f"user:{user.id}")
    
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
    # Try cache first
    cache_key = f"user:stats:{user_id}"
    cached = await user_cache.get(cache_key)
    if cached:
        return UserResponse(**cached)
    
    result = auth_service.get_user_stats(user_id)
    
    # Cache for 5 minutes
    await user_cache.set(cache_key, result.model_dump(), ttl=300)
    
    return result

@router.get("/auth/history")
async def get_game_history(user_id: str = Depends(get_current_user_id)) -> list[GameHistoryResponse]:
    """Get user's game history"""
    return auth_service.get_game_history(user_id)

# Scoring configuration
SCORING_RATES = {
    "WIN": 25,      # Points for winning
    "LOSS": -10,    # Points for losing  
    "DRAW": 5,      # Points for a draw
}

@router.post("/auth/save-game")
async def save_game_result(
    result: str,
    opponent_name: Optional[str] = None,
    game_duration: int = 0,
    user_id: str = Depends(get_current_user_id)
) -> GameHistoryResponse:
    """Save game result"""
    # Calculate points using scoring rates
    points = SCORING_RATES.get(result, 0)
    
    game_result = auth_service.save_game_result(user_id, result, opponent_name, game_duration, points)
    
    # Invalidate caches
    await user_cache.delete(f"user:stats:{user_id}")
    await leaderboard_cache.invalidate_pattern("leaderboard:")
    
    return game_result

@router.get("/leaderboard")
async def get_leaderboard(limit: int = 100) -> LeaderboardResponse:
    """Get global leaderboard (cached for 60 seconds)"""
    cache_key = f"leaderboard:top:{limit}"
    
    # Try cache first
    cached = await leaderboard_cache.get(cache_key)
    if cached:
        return LeaderboardResponse(users=[UserStatsResponse(**u) for u in cached])
    
    users = auth_service.get_leaderboard(limit)
    
    # Cache for 60 seconds
    await leaderboard_cache.set(
        cache_key,
        [u.model_dump() for u in users],
        ttl=60
    )
    
    return LeaderboardResponse(users=users)

@router.get("/leaderboard/top")
async def get_top_players(limit: int = 10) -> list[UserStatsResponse]:
    """Get top players (cached for 60 seconds)"""
    cache_key = f"leaderboard:players:{limit}"
    
    # Try cache first
    cached = await leaderboard_cache.get(cache_key)
    if cached:
        return [UserStatsResponse(**u) for u in cached]
    
    users = auth_service.get_leaderboard(limit)
    
    # Cache for 60 seconds
    await leaderboard_cache.set(
        cache_key,
        [u.model_dump() for u in users],
        ttl=60
    )
    
    return users

@router.get("/scoring-rates")
async def get_scoring_rates():
    """Get current scoring rates for the leaderboard"""
    return {
        "win": SCORING_RATES["WIN"],
        "loss": SCORING_RATES["LOSS"],
        "draw": SCORING_RATES["DRAW"],
    }
