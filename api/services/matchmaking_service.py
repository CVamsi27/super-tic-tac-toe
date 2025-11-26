"""
Matchmaking service for random player matching.
Manages a queue of players waiting for matches and pairs them automatically.
Enhanced with thread safety, better cleanup, and statistics.
"""

from typing import Dict, Optional, List, Tuple
from datetime import datetime, timedelta
from uuid import uuid4
import threading
import logging
from dataclasses import dataclass, field
from enum import Enum

logger = logging.getLogger(__name__)


class MatchmakingStatus(str, Enum):
    """Status of a player in matchmaking"""
    QUEUED = "queued"
    MATCHED = "matched"
    EXPIRED = "expired"


@dataclass
class QueueEntry:
    """A player in the matchmaking queue"""
    user_id: str
    joined_at: datetime = field(default_factory=datetime.now)
    skill_rating: int = 1000  # For future skill-based matching
    
    @property
    def wait_time_seconds(self) -> float:
        return (datetime.now() - self.joined_at).total_seconds()


@dataclass
class MatchedGame:
    """A matched game ready to be created"""
    game_id: str
    player1_id: str
    player2_id: str
    created_at: datetime = field(default_factory=datetime.now)


class MatchmakingQueue:
    """
    In-memory queue for matchmaking with enhanced features.
    Thread-safe operations with threading lock support.
    """
    
    def __init__(self, max_wait_time: int = 300):
        self.queue: List[QueueEntry] = []
        self.matched_games: Dict[str, MatchedGame] = {}
        self._lock = threading.Lock()  # Use threading lock for sync operations
        self.max_wait_time = max_wait_time  # Maximum seconds before auto-removal
        
        # Statistics
        self._stats = {
            "total_joins": 0,
            "total_matches": 0,
            "total_timeouts": 0,
            "total_leaves": 0,
        }
        
        # Lazy import to avoid circular dependency
        self._game_service = None
    
    @property
    def game_service(self):
        if self._game_service is None:
            from api.services.game_service import GameService
            self._game_service = GameService()
        return self._game_service
    
    def clear_user_matched_games(self, user_id: str) -> int:
        """
        Remove any old matched game entries for a user.
        Returns number of entries removed.
        """
        initial_count = len(self.matched_games)
        self.matched_games = {
            game_id: match for game_id, match in self.matched_games.items()
            if match.player1_id != user_id and match.player2_id != user_id
        }
        return initial_count - len(self.matched_games)
    
    def join_queue(self, user_id: str) -> Optional[str]:
        """
        Add user to matchmaking queue.
        If another player is waiting, create a game and return game_id.
        Otherwise, add to queue and return None.
        
        Args:
            user_id: ID of the user joining queue
            
        Returns:
            game_id if matched, None if added to queue
        """
        self._stats["total_joins"] += 1
        
        # Clear any old matched game entries for this user
        self.clear_user_matched_games(user_id)
        
        # Check if user is already in queue
        if any(entry.user_id == user_id for entry in self.queue):
            logger.debug(f"User {user_id} already in queue")
            return None
        
        # Try to match with an existing player
        if len(self.queue) > 0:
            opponent_entry = self.queue.pop(0)
            
            game_id = str(uuid4())
            
            matched_game = MatchedGame(
                game_id=game_id,
                player1_id=opponent_entry.user_id,
                player2_id=user_id,
            )
            self.matched_games[game_id] = matched_game
            
            self._stats["total_matches"] += 1
            logger.info(
                f"Match created: {opponent_entry.user_id} vs {user_id} "
                f"(opponent waited {opponent_entry.wait_time_seconds:.1f}s)"
            )
            
            return game_id
        
        # No match available, add to queue
        entry = QueueEntry(user_id=user_id)
        self.queue.append(entry)
        logger.debug(f"User {user_id} added to queue (position: {len(self.queue)})")
        return None
    
    def leave_queue(self, user_id: str) -> bool:
        """
        Remove user from queue.
        
        Args:
            user_id: ID of the user leaving queue
            
        Returns:
            True if user was in queue, False otherwise
        """
        initial_length = len(self.queue)
        self.queue = [entry for entry in self.queue if entry.user_id != user_id]
        
        if len(self.queue) < initial_length:
            self._stats["total_leaves"] += 1
            logger.debug(f"User {user_id} left matchmaking queue")
            return True
        return False
    
    def get_queue_position(self, user_id: str) -> Optional[int]:
        """
        Get user's position in queue (0-indexed).
        
        Args:
            user_id: ID of the user
            
        Returns:
            Position in queue or None if not in queue
        """
        for idx, entry in enumerate(self.queue):
            if entry.user_id == user_id:
                return idx
        return None
    
    def get_queue_entry(self, user_id: str) -> Optional[QueueEntry]:
        """Get the queue entry for a user"""
        for entry in self.queue:
            if entry.user_id == user_id:
                return entry
        return None
    
    def get_matched_players(self, game_id: str) -> Optional[Tuple[str, str]]:
        """
        Get the two players matched for a game.
        
        Args:
            game_id: ID of the game
            
        Returns:
            (player1_id, player2_id) tuple or None
        """
        match = self.matched_games.get(game_id)
        if match:
            return (match.player1_id, match.player2_id)
        return None
    
    def get_matched_game(self, user_id: str) -> Optional[str]:
        """
        Check if user was recently matched to a game that is still active.
        
        Args:
            user_id: ID of the user
            
        Returns:
            game_id if user was matched to an active game, None otherwise
        """
        for game_id, match in list(self.matched_games.items()):
            if match.player1_id == user_id or match.player2_id == user_id:
                # Check if the game is still active (not completed)
                if self.game_service.is_game_completed(game_id):
                    # Game is completed, remove from matched_games
                    del self.matched_games[game_id]
                    return None
                return game_id
        return None
    
    def cleanup_old_entries(self, max_age_minutes: int = 10) -> dict:
        """
        Remove queue entries older than max_age_minutes.
        
        Args:
            max_age_minutes: Maximum age in minutes
            
        Returns:
            Statistics about cleaned entries
        """
        cutoff_time = datetime.now() - timedelta(minutes=max_age_minutes)
        
        # Cleanup expired queue entries
        expired_queue = [
            entry for entry in self.queue 
            if entry.joined_at <= cutoff_time
        ]
        self.queue = [
            entry for entry in self.queue 
            if entry.joined_at > cutoff_time
        ]
        
        # Track timeouts
        self._stats["total_timeouts"] += len(expired_queue)
        
        # Cleanup old matched games
        expired_matches = len([
            game_id for game_id, match in self.matched_games.items()
            if match.created_at <= cutoff_time
        ])
        self.matched_games = {
            game_id: match for game_id, match in self.matched_games.items()
            if match.created_at > cutoff_time
        }
        
        if expired_queue or expired_matches:
            logger.info(
                f"Matchmaking cleanup: removed {len(expired_queue)} queue entries, "
                f"{expired_matches} matched games"
            )
        
        return {
            "expired_queue_entries": len(expired_queue),
            "expired_matches": expired_matches,
        }
    
    def get_queue_size(self) -> int:
        """Get current queue size"""
        return len(self.queue)
    
    def get_average_wait_time(self) -> float:
        """Get average wait time in seconds for current queue"""
        if not self.queue:
            return 0.0
        return sum(entry.wait_time_seconds for entry in self.queue) / len(self.queue)
    
    def get_stats(self) -> dict:
        """Get matchmaking statistics"""
        return {
            **self._stats,
            "queue_size": len(self.queue),
            "active_matches": len(self.matched_games),
            "average_wait_time": self.get_average_wait_time(),
        }


# Global matchmaking queue instance
matchmaking_queue = MatchmakingQueue()
