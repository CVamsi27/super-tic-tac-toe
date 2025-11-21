"""
Matchmaking service for random player matching.
Manages a queue of players waiting for matches and pairs them automatically.
"""

from typing import Dict, Optional, List, Tuple
from datetime import datetime, timedelta
from uuid import uuid4
from api.services.game_service import GameService
from api.models.game import GameMode

class MatchmakingQueue:
    """In-memory queue for matchmaking"""
    
    def __init__(self):
        self.queue: List[Dict] = []
        self.matched_games: Dict[str, Dict] = {}  # game_id -> {player1_id, player2_id}
        self.game_service = GameService()
    
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
        if any(player["user_id"] == user_id for player in self.queue):
            return None
        
        if len(self.queue) > 0:
            opponent = self.queue.pop(0)
            
            game_id = str(uuid4())
            
            self.matched_games[game_id] = {
                "player1_id": opponent["user_id"],
                "player2_id": user_id,
                "created_at": datetime.now()
            }
            
            return game_id
        else:
            self.queue.append({
                "user_id": user_id,
                "joined_at": datetime.now()
            })
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
        self.queue = [p for p in self.queue if p["user_id"] != user_id]
        return len(self.queue) < initial_length
    
    def get_queue_position(self, user_id: str) -> Optional[int]:
        """
        Get user's position in queue (0-indexed).
        
        Args:
            user_id: ID of the user
            
        Returns:
            Position in queue or None if not in queue
        """
        for idx, player in enumerate(self.queue):
            if player["user_id"] == user_id:
                return idx
        return None
    
    def get_matched_players(self, game_id: str) -> Optional[Tuple[str, str]]:
        """
        Get the two players matched for a game.
        
        Args:
            game_id: ID of the game
            
        Returns:
            (player1_id, player2_id) tuple or None
        """
        if game_id in self.matched_games:
            match = self.matched_games[game_id]
            return (match["player1_id"], match["player2_id"])
        return None
    
    def get_matched_game(self, user_id: str) -> Optional[str]:
        """
        Check if user was recently matched to a game.
        
        Args:
            user_id: ID of the user
            
        Returns:
            game_id if user was matched, None otherwise
        """
        for game_id, match in self.matched_games.items():
            if match["player1_id"] == user_id or match["player2_id"] == user_id:
                return game_id
        return None
    
    def cleanup_old_entries(self, max_age_minutes: int = 10):
        """
        Remove queue entries older than max_age_minutes.
        
        Args:
            max_age_minutes: Maximum age in minutes
        """
        cutoff_time = datetime.now() - timedelta(minutes=max_age_minutes)
        self.queue = [
            p for p in self.queue 
            if p["joined_at"] > cutoff_time
        ]
        
        # Also cleanup old matched games
        self.matched_games = {
            game_id: match for game_id, match in self.matched_games.items()
            if match["created_at"] > cutoff_time
        }
    
    def get_queue_size(self) -> int:
        """Get current queue size"""
        return len(self.queue)


# Global matchmaking queue instance
matchmaking_queue = MatchmakingQueue()
