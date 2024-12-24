from enum import Enum
from typing import List, Optional
from pydantic import BaseModel, Field
import uuid

class GameMode(str, Enum):
    LOCAL = "local"
    REMOTE = "remote"
    AI = "ai"

class PlayerSymbol(str, Enum):
    X = "X"
    O = "O"

class PlayerStatus(str, Enum):
    PLAYER = "player"
    WATCHER = "watcher"

class Player(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    symbol: Optional[PlayerSymbol] = None
    status: PlayerStatus = PlayerStatus.PLAYER

class GameMove(BaseModel):
    global_board_index: int
    local_board_index: int
    player_symbol: PlayerSymbol

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

class GameCreateRequest(BaseModel):
    mode: GameMode = GameMode.LOCAL

class GameJoinRequest(BaseModel):
    game_id: str