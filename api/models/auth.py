from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class GoogleLoginRequest(BaseModel):
    id_token: str

class UserResponse(BaseModel):
    id: str
    email: str
    name: str
    profile_picture: Optional[str] = None
    points: int
    wins: int
    losses: int
    draws: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class GameHistoryResponse(BaseModel):
    id: str
    result: str
    opponent_name: Optional[str]
    points_earned: int
    game_duration: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class UserStatsResponse(BaseModel):
    id: str
    email: str
    name: str
    points: int
    wins: int
    losses: int
    draws: int
    profile_picture: Optional[str] = None

class LeaderboardResponse(BaseModel):
    users: list[UserStatsResponse]

class AuthResponse(BaseModel):
    access_token: str
    user: UserResponse
    token_type: str = "bearer"
