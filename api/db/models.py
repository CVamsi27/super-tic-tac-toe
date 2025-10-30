from sqlalchemy import Column, String, Integer, Enum, ARRAY, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from api.db.database import Base

from api.models.game import GameMode, PlayerSymbol, PlayerStatus

class GameDB(Base):
    __tablename__ = 'games'
    
    id = Column(String, primary_key=True)
    mode = Column(Enum(GameMode))
    ai_difficulty = Column(String, nullable=True)
    current_player = Column(Enum(PlayerSymbol), nullable=True)
    active_board = Column(Integer, nullable=True)
    watchers_count = Column(Integer, default=0)
    winner = Column(Enum(PlayerSymbol), nullable=True)
    last_move_timestamp = Column(DateTime, nullable=True)
    move_count = Column(Integer, default=0)
    global_board = Column(ARRAY(String), nullable=True)
    
    players = relationship("PlayerDB", back_populates="game", cascade="all, delete-orphan")

class PlayerDB(Base):
    __tablename__ = 'players'
    
    id = Column(String, primary_key=True)
    game_id = Column(String, ForeignKey('games.id'))
    symbol = Column(Enum(PlayerSymbol), nullable=True)
    status = Column(Enum(PlayerStatus))
    join_order = Column(Integer)
    last_active = Column(DateTime, default=datetime.now)
    
    game = relationship("GameDB", back_populates="players")
