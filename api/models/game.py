from enum import Enum
from typing import List, Optional
from pydantic import BaseModel, Field
import uuid

class GameMode(str, Enum):
    REMOTE = "remote"
    AI = "ai"

class PlayerSymbol(str, Enum):
    X = "X"
    O = "O"
    T = "T"

class PlayerStatus(str, Enum):
    PLAYER = "PLAYER"
    WATCHER = "WATCHER"

class Player(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: Optional[str] = None
    symbol: Optional[PlayerSymbol] = None
    status: PlayerStatus = PlayerStatus.PLAYER
    join_order: int = 0

class GameMove(BaseModel):
    playerId: str = Field(default_factory=lambda: str(uuid.uuid4()))
    global_board_index: int
    local_board_index: int

class GameState(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    players: List[Player] = []
    global_board: List[List[Optional[PlayerSymbol]]] = Field(
        default_factory=lambda: [
            [None for _ in range(9)] for _ in range(9)
        ]
    )
    current_player: Optional[PlayerSymbol] = None
    active_board: Optional[int] = None
    watchers_count: int = 0
    winner: Optional[PlayerSymbol] = None
    last_move_timestamp: Optional[float] = None
    mode: Optional[GameMode]
    move_count: int = 0
    ai_difficulty: Optional[str] = "medium"  # For AI games

class GameCreateRequest(BaseModel):
    mode: GameMode = GameMode.REMOTE
    ai_difficulty: Optional[str] = "medium"  # "easy", "medium", "hard" - only for AI mode

class GameResetRequest(BaseModel):
    game_id: str
    user_id: str