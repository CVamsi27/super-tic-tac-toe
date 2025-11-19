import os
from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from google.auth.transport import requests
from google.oauth2 import id_token
from fastapi import HTTPException, status
from api.db.database import get_db
from api.db.user_models import UserDB, GameHistoryDB
from api.models.auth import UserResponse, GameHistoryResponse, UserStatsResponse
from uuid import uuid4

# Configuration
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID", "your-client-id.apps.googleusercontent.com")
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30 * 24  # 30 days

class AuthService:
    
    @staticmethod
    def verify_google_token(id_token_str: str) -> dict:
        """Verify Google ID token"""
        try:
            idinfo = id_token.verify_oauth2_token(
                id_token_str, 
                requests.Request(), 
                GOOGLE_CLIENT_ID
            )
            if idinfo['iss'] not in ['accounts.google.com', 'https://accounts.google.com']:
                raise ValueError('Wrong issuer.')
            return idinfo
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"Invalid token: {str(e)}"
            )
    
    @staticmethod
    def create_access_token(user_id: str, expires_delta: Optional[timedelta] = None) -> str:
        """Create JWT access token"""
        if expires_delta is None:
            expires_delta = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        
        expire = datetime.utcnow() + expires_delta
        to_encode = {"sub": user_id, "exp": expire}
        encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
        return encoded_jwt
    
    @staticmethod
    def verify_access_token(token: str) -> str:
        """Verify JWT access token and return user_id"""
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            user_id: str = payload.get("sub")
            if user_id is None:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid token"
                )
            return user_id
        except JWTError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token"
            )
    
    @staticmethod
    def google_login(id_token_str: str) -> tuple[UserDB, str]:
        """Handle Google login - create or update user"""
        # Verify token
        idinfo = AuthService.verify_google_token(id_token_str)
        
        google_id = idinfo['sub']
        email = idinfo['email']
        name = idinfo.get('name', email.split('@')[0])
        picture = idinfo.get('picture')
        
        with get_db() as db:
            # Check if user exists
            user = db.query(UserDB).filter(UserDB.google_id == google_id).first()
            
            if not user:
                # Create new user
                user = UserDB(
                    id=str(uuid4()),
                    email=email,
                    name=name,
                    google_id=google_id,
                    profile_picture=picture,
                    points=0,
                    wins=0,
                    losses=0,
                    draws=0
                )
                db.add(user)
                db.commit()
                db.refresh(user)
            else:
                # Update user info
                user.name = name
                user.profile_picture = picture
                user.updated_at = datetime.utcnow()
                db.commit()
                db.refresh(user)
        
        # Create token
        access_token = AuthService.create_access_token(user.id)
        
        return user, access_token
    
    @staticmethod
    def get_user(user_id: str) -> UserDB:
        """Get user by ID"""
        with get_db() as db:
            user = db.query(UserDB).filter(UserDB.id == user_id).first()
            if not user:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="User not found"
                )
            return user
    
    @staticmethod
    def get_user_stats(user_id: str) -> UserResponse:
        """Get user stats"""
        user = AuthService.get_user(user_id)
        return UserResponse(
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
    
    @staticmethod
    def get_game_history(user_id: str, limit: int = 50) -> list[GameHistoryResponse]:
        """Get user's game history"""
        with get_db() as db:
            games = db.query(GameHistoryDB).filter(
                GameHistoryDB.user_id == user_id
            ).order_by(GameHistoryDB.created_at.desc()).limit(limit).all()
            
            return [
                GameHistoryResponse(
                    id=game.id,
                    result=game.result,
                    opponent_name=game.opponent_name,
                    points_earned=game.points_earned,
                    game_duration=game.game_duration,
                    created_at=game.created_at
                )
                for game in games
            ]
    
    @staticmethod
    def save_game_result(user_id: str, result: str, opponent_name: Optional[str] = None, 
                        game_duration: int = 0, points_earned: int = 0) -> GameHistoryResponse:
        """Save game result and update user stats"""
        with get_db() as db:
            # Create game history
            game_history = GameHistoryDB(
                id=str(uuid4()),
                user_id=user_id,
                result=result,
                opponent_name=opponent_name,
                points_earned=points_earned,
                game_duration=game_duration
            )
            db.add(game_history)
            
            # Update user stats
            user = db.query(UserDB).filter(UserDB.id == user_id).first()
            if user:
                if result == "WIN":
                    user.wins += 1
                    if points_earned == 0:
                        points_earned = 10
                    user.points += points_earned
                elif result == "LOSS":
                    user.losses += 1
                    if points_earned == 0:
                        points_earned = -5
                    user.points = max(0, user.points + points_earned)
                elif result == "DRAW":
                    user.draws += 1
                    if points_earned == 0:
                        points_earned = 1
                    user.points += points_earned
                
                user.updated_at = datetime.utcnow()
            
            db.commit()
            
            return GameHistoryResponse(
                id=game_history.id,
                result=game_history.result,
                opponent_name=game_history.opponent_name,
                points_earned=game_history.points_earned,
                game_duration=game_history.game_duration,
                created_at=game_history.created_at
            )
    
    @staticmethod
    def get_leaderboard(limit: int = 100) -> list[UserStatsResponse]:
        """Get global leaderboard"""
        with get_db() as db:
            users = db.query(UserDB).order_by(
                UserDB.points.desc()
            ).limit(limit).all()
            
            return [
                UserStatsResponse(
                    id=user.id,
                    email=user.email,
                    name=user.name,
                    points=user.points,
                    wins=user.wins,
                    losses=user.losses,
                    draws=user.draws,
                    profile_picture=user.profile_picture
                )
                for user in users
            ]

auth_service = AuthService()
