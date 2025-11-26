"""
WebSocket connection manager with heartbeat and connection health monitoring.
"""

import asyncio
import time
import logging
from typing import Dict, Set, Optional, Any
from dataclasses import dataclass, field
from datetime import datetime

from fastapi import WebSocket
from fastapi.websockets import WebSocketState
from websockets.exceptions import ConnectionClosedError, ConnectionClosedOK

logger = logging.getLogger(__name__)


@dataclass
class WebSocketConnection:
    """Represents a single WebSocket connection with metadata"""
    websocket: WebSocket
    game_id: str
    user_id: str
    connected_at: float = field(default_factory=time.time)
    last_ping: float = field(default_factory=time.time)
    last_pong: float = field(default_factory=time.time)
    ping_count: int = 0
    missed_pongs: int = 0
    
    @property
    def is_healthy(self) -> bool:
        """Check if connection is still healthy"""
        return (
            self.websocket.client_state == WebSocketState.CONNECTED
            and self.missed_pongs < 3
        )
    
    @property
    def connection_age_seconds(self) -> float:
        """Get connection age in seconds"""
        return time.time() - self.connected_at


class WebSocketManager:
    """
    Manages WebSocket connections with heartbeat monitoring.
    Handles connection tracking, broadcasting, and cleanup.
    """
    
    def __init__(
        self,
        heartbeat_interval: int = 30,  # Ping every 30 seconds
        connection_timeout: int = 90,  # Consider dead after 90 seconds without pong
        max_connections_per_game: int = 100,
    ):
        self.heartbeat_interval = heartbeat_interval
        self.connection_timeout = connection_timeout
        self.max_connections_per_game = max_connections_per_game
        
        # Connection storage
        self._connections: Dict[str, Dict[str, WebSocketConnection]] = {}
        self._connection_count: Dict[str, int] = {}
        
        # Heartbeat task
        self._heartbeat_task: Optional[asyncio.Task] = None
        self._running = False
        
        # Statistics
        self._stats = {
            "total_connections": 0,
            "total_disconnections": 0,
            "total_messages_sent": 0,
            "total_messages_failed": 0,
        }
    
    async def start(self):
        """Start the heartbeat background task"""
        if self._heartbeat_task is None:
            self._running = True
            self._heartbeat_task = asyncio.create_task(self._heartbeat_loop())
            logger.info("WebSocket heartbeat started")
    
    async def stop(self):
        """Stop the heartbeat background task"""
        self._running = False
        if self._heartbeat_task:
            self._heartbeat_task.cancel()
            try:
                await self._heartbeat_task
            except asyncio.CancelledError:
                pass
            self._heartbeat_task = None
            logger.info("WebSocket heartbeat stopped")
    
    async def connect(
        self,
        websocket: WebSocket,
        game_id: str,
        user_id: str,
    ) -> Optional[WebSocketConnection]:
        """
        Register a new WebSocket connection.
        Returns the connection object or None if rejected.
        """
        # Check connection limit
        current_count = self._connection_count.get(game_id, 0)
        if current_count >= self.max_connections_per_game:
            logger.warning(f"Connection limit reached for game {game_id}")
            return None
        
        # Accept the connection
        await websocket.accept()
        
        # Create connection object
        connection = WebSocketConnection(
            websocket=websocket,
            game_id=game_id,
            user_id=user_id,
        )
        
        # Store connection
        if game_id not in self._connections:
            self._connections[game_id] = {}
        
        # Handle duplicate connections from same user
        existing = self._connections[game_id].get(user_id)
        if existing:
            await self._close_connection(existing, "duplicate_connection")
        
        self._connections[game_id][user_id] = connection
        self._connection_count[game_id] = len(self._connections[game_id])
        self._stats["total_connections"] += 1
        
        logger.info(f"WebSocket connected: game={game_id}, user={user_id}")
        return connection
    
    async def disconnect(self, game_id: str, user_id: str) -> None:
        """Remove a WebSocket connection"""
        if game_id in self._connections:
            connection = self._connections[game_id].pop(user_id, None)
            if connection:
                await self._close_connection(connection, "disconnect")
                self._connection_count[game_id] = len(self._connections[game_id])
                self._stats["total_disconnections"] += 1
                
                # Cleanup empty game
                if not self._connections[game_id]:
                    del self._connections[game_id]
                    del self._connection_count[game_id]
    
    async def broadcast_to_game(
        self,
        game_id: str,
        message: Dict[str, Any],
        exclude_user: Optional[str] = None,
    ) -> int:
        """
        Broadcast a message to all connections in a game.
        Returns number of successful sends.
        """
        if game_id not in self._connections:
            return 0
        
        connections = self._connections[game_id]
        successful_sends = 0
        failed_connections = []
        
        for user_id, connection in connections.items():
            if exclude_user and user_id == exclude_user:
                continue
            
            if not connection.is_healthy:
                failed_connections.append(user_id)
                continue
            
            try:
                await connection.websocket.send_json(message)
                successful_sends += 1
                self._stats["total_messages_sent"] += 1
            except (ConnectionClosedError, ConnectionClosedOK):
                failed_connections.append(user_id)
            except Exception as e:
                logger.warning(f"Failed to send message to {user_id}: {e}")
                failed_connections.append(user_id)
                self._stats["total_messages_failed"] += 1
        
        # Cleanup failed connections
        for user_id in failed_connections:
            await self.disconnect(game_id, user_id)
        
        return successful_sends
    
    async def send_to_user(
        self,
        game_id: str,
        user_id: str,
        message: Dict[str, Any],
    ) -> bool:
        """Send a message to a specific user"""
        if game_id not in self._connections:
            return False
        
        connection = self._connections[game_id].get(user_id)
        if not connection or not connection.is_healthy:
            return False
        
        try:
            await connection.websocket.send_json(message)
            self._stats["total_messages_sent"] += 1
            return True
        except Exception as e:
            logger.warning(f"Failed to send message to {user_id}: {e}")
            self._stats["total_messages_failed"] += 1
            await self.disconnect(game_id, user_id)
            return False
    
    def get_connection(self, game_id: str, user_id: str) -> Optional[WebSocketConnection]:
        """Get a specific connection"""
        if game_id in self._connections:
            return self._connections[game_id].get(user_id)
        return None
    
    def get_game_connections(self, game_id: str) -> Dict[str, WebSocketConnection]:
        """Get all connections for a game"""
        return self._connections.get(game_id, {})
    
    def get_connection_count(self, game_id: str) -> int:
        """Get number of connections for a game"""
        return self._connection_count.get(game_id, 0)
    
    async def _heartbeat_loop(self):
        """Background task for sending heartbeat pings"""
        while self._running:
            try:
                await asyncio.sleep(self.heartbeat_interval)
                await self._send_heartbeats()
            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.error(f"Heartbeat error: {e}")
    
    async def _send_heartbeats(self):
        """Send ping to all connections and cleanup stale ones"""
        now = time.time()
        stale_connections = []
        
        for game_id, connections in list(self._connections.items()):
            for user_id, connection in list(connections.items()):
                # Check for stale connections
                if now - connection.last_pong > self.connection_timeout:
                    stale_connections.append((game_id, user_id))
                    continue
                
                # Send ping
                try:
                    await connection.websocket.send_json({
                        "type": "ping",
                        "timestamp": now,
                    })
                    connection.last_ping = now
                    connection.ping_count += 1
                except Exception:
                    connection.missed_pongs += 1
        
        # Cleanup stale connections
        for game_id, user_id in stale_connections:
            logger.info(f"Cleaning up stale connection: game={game_id}, user={user_id}")
            await self.disconnect(game_id, user_id)
    
    async def handle_pong(self, game_id: str, user_id: str):
        """Handle pong response from client"""
        connection = self.get_connection(game_id, user_id)
        if connection:
            connection.last_pong = time.time()
            connection.missed_pongs = 0
    
    async def _close_connection(
        self,
        connection: WebSocketConnection,
        reason: str,
    ):
        """Close a WebSocket connection gracefully"""
        try:
            if connection.websocket.client_state == WebSocketState.CONNECTED:
                await connection.websocket.close(code=1000, reason=reason)
        except Exception:
            pass
    
    def get_stats(self) -> dict:
        """Get connection manager statistics"""
        total_active = sum(len(conns) for conns in self._connections.values())
        return {
            **self._stats,
            "active_connections": total_active,
            "active_games": len(self._connections),
        }


# Global WebSocket manager instance
ws_manager = WebSocketManager()
