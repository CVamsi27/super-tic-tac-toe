"""
Request validation utilities for the API.
Provides reusable validators and sanitizers.
"""

import re
import uuid
from typing import Any, Optional, List
from pydantic import validator, field_validator
from functools import wraps
import logging

logger = logging.getLogger(__name__)


# Constants for validation
MAX_USER_ID_LENGTH = 128
MAX_GAME_ID_LENGTH = 64
VALID_GAME_MODES = {"local", "remote", "ai"}
VALID_AI_DIFFICULTIES = {"easy", "medium", "hard"}
VALID_PLAYERS = {"X", "O"}


class ValidationError(Exception):
    """Custom validation error with details"""
    def __init__(self, field: str, message: str, value: Any = None):
        self.field = field
        self.message = message
        self.value = value
        super().__init__(f"{field}: {message}")


def validate_uuid(value: str, field_name: str = "id") -> str:
    """Validate that a string is a valid UUID"""
    if not value:
        raise ValidationError(field_name, "Cannot be empty")
    
    try:
        # Try to parse as UUID
        parsed = uuid.UUID(str(value))
        return str(parsed)
    except (ValueError, AttributeError):
        raise ValidationError(field_name, "Invalid UUID format", value)


def validate_user_id(user_id: str) -> str:
    """Validate and sanitize user ID"""
    if not user_id:
        raise ValidationError("user_id", "Cannot be empty")
    
    user_id = str(user_id).strip()
    
    if len(user_id) > MAX_USER_ID_LENGTH:
        raise ValidationError("user_id", f"Exceeds maximum length of {MAX_USER_ID_LENGTH}")
    
    # Allow alphanumeric, hyphens, underscores, and some special chars for OAuth IDs
    if not re.match(r'^[\w\-\.@|]+$', user_id):
        raise ValidationError("user_id", "Contains invalid characters")
    
    return user_id


def validate_game_id(game_id: str) -> str:
    """Validate and sanitize game ID"""
    if not game_id:
        raise ValidationError("game_id", "Cannot be empty")
    
    game_id = str(game_id).strip()
    
    if len(game_id) > MAX_GAME_ID_LENGTH:
        raise ValidationError("game_id", f"Exceeds maximum length of {MAX_GAME_ID_LENGTH}")
    
    # Game IDs should be UUIDs
    return validate_uuid(game_id, "game_id")


def validate_game_mode(mode: str) -> str:
    """Validate game mode"""
    if not mode:
        raise ValidationError("mode", "Cannot be empty")
    
    mode = str(mode).lower().strip()
    
    if mode not in VALID_GAME_MODES:
        raise ValidationError("mode", f"Must be one of: {', '.join(VALID_GAME_MODES)}", mode)
    
    return mode


def validate_ai_difficulty(difficulty: Optional[str]) -> str:
    """Validate AI difficulty level"""
    if not difficulty:
        return "medium"  # Default
    
    difficulty = str(difficulty).lower().strip()
    
    if difficulty not in VALID_AI_DIFFICULTIES:
        raise ValidationError("ai_difficulty", f"Must be one of: {', '.join(VALID_AI_DIFFICULTIES)}", difficulty)
    
    return difficulty


def validate_player(player: str) -> str:
    """Validate player symbol"""
    if not player:
        raise ValidationError("player", "Cannot be empty")
    
    player = str(player).upper().strip()
    
    if player not in VALID_PLAYERS:
        raise ValidationError("player", f"Must be one of: {', '.join(VALID_PLAYERS)}", player)
    
    return player


def validate_board_index(index: int, max_value: int = 8) -> int:
    """Validate board index (0-8 for small board, 0-8 for super board)"""
    if not isinstance(index, int):
        try:
            index = int(index)
        except (ValueError, TypeError):
            raise ValidationError("index", "Must be an integer", index)
    
    if index < 0 or index > max_value:
        raise ValidationError("index", f"Must be between 0 and {max_value}", index)
    
    return index


def validate_move(move: dict) -> dict:
    """Validate a move object for super tic-tac-toe"""
    if not isinstance(move, dict):
        raise ValidationError("move", "Must be an object")
    
    required_fields = ["boardIndex", "cellIndex", "player"]
    for field in required_fields:
        if field not in move:
            raise ValidationError("move", f"Missing required field: {field}")
    
    validated = {
        "boardIndex": validate_board_index(move["boardIndex"]),
        "cellIndex": validate_board_index(move["cellIndex"]),
        "player": validate_player(move["player"])
    }
    
    return validated


def sanitize_string(value: str, max_length: int = 1000) -> str:
    """Sanitize a string by removing potentially dangerous characters"""
    if not value:
        return ""
    
    # Remove control characters
    value = re.sub(r'[\x00-\x1f\x7f-\x9f]', '', str(value))
    
    # Truncate if too long
    if len(value) > max_length:
        value = value[:max_length]
    
    return value.strip()


def validate_pagination(page: int = 1, limit: int = 20, max_limit: int = 100) -> tuple[int, int]:
    """Validate pagination parameters"""
    if page < 1:
        page = 1
    
    if limit < 1:
        limit = 20
    elif limit > max_limit:
        limit = max_limit
    
    return page, limit


def require_fields(data: dict, required: List[str]) -> None:
    """Check that all required fields are present"""
    missing = [f for f in required if f not in data or data[f] is None]
    if missing:
        raise ValidationError("request", f"Missing required fields: {', '.join(missing)}")


def validated_endpoint(validators: dict = None):
    """
    Decorator to add validation to endpoint parameters.
    
    Usage:
        @validated_endpoint({
            "user_id": validate_user_id,
            "game_id": validate_game_id
        })
        async def my_endpoint(user_id: str, game_id: str):
            ...
    """
    validators = validators or {}
    
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # Validate each parameter that has a validator
            for param_name, validator_func in validators.items():
                if param_name in kwargs:
                    try:
                        kwargs[param_name] = validator_func(kwargs[param_name])
                    except ValidationError as e:
                        from fastapi import HTTPException
                        raise HTTPException(status_code=400, detail=str(e))
            
            return await func(*args, **kwargs)
        return wrapper
    return decorator


# Pre-built validator combinations
def validate_game_request(game_id: str, user_id: str) -> tuple[str, str]:
    """Validate common game request parameters"""
    return validate_game_id(game_id), validate_user_id(user_id)


def validate_matchmaking_request(user_id: str) -> str:
    """Validate matchmaking request"""
    return validate_user_id(user_id)
