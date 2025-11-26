from sqlalchemy import Column, String, Integer, DateTime, Float, Boolean, ForeignKey, Index
from sqlalchemy.orm import relationship
from datetime import datetime
from api.db.database import Base

class UserDB(Base):
    __tablename__ = "users"
    
    id = Column(String, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    name = Column(String)
    google_id = Column(String, unique=True, index=True)
    profile_picture = Column(String, nullable=True)
    points = Column(Integer, default=0, index=True)  # Index for leaderboard queries
    wins = Column(Integer, default=0)
    losses = Column(Integer, default=0)
    draws = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    games = relationship("GameHistoryDB", back_populates="user")
    
    # Composite index for leaderboard sorting
    __table_args__ = (
        Index('ix_users_points_desc', points.desc()),
    )
    
    def __repr__(self):
        return f"<User {self.email}>"

class GameHistoryDB(Base):
    __tablename__ = "game_history"
    
    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"), index=True)
    opponent_id = Column(String, nullable=True, index=True)
    opponent_name = Column(String, nullable=True)
    result = Column(String, index=True)  # "WIN", "LOSS", "DRAW" - indexed for filtering
    points_earned = Column(Integer, default=0, nullable=True)
    game_duration = Column(Integer, default=0, nullable=True)  # in seconds
    created_at = Column(DateTime, default=datetime.utcnow, index=True)  # Indexed for sorting
    
    # Relationship
    user = relationship("UserDB", back_populates="games")
    
    # Composite index for user history queries
    __table_args__ = (
        Index('ix_game_history_user_created', 'user_id', 'created_at'),
    )
    
    def __repr__(self):
        return f"<GameHistory {self.id} - {self.result}>"
