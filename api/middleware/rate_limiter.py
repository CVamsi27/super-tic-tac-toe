"""
Rate limiting middleware for protecting API endpoints.
Uses in-memory storage with configurable limits per endpoint.
"""

from collections import defaultdict
from datetime import datetime, timedelta
from typing import Dict, Optional, Callable
import asyncio
from functools import wraps
import time

from fastapi import Request, HTTPException, status
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response
import logging

logger = logging.getLogger(__name__)


class RateLimitStore:
    """In-memory rate limit storage with automatic cleanup"""
    
    def __init__(self, cleanup_interval: int = 60):
        self._store: Dict[str, list] = defaultdict(list)
        self._lock = asyncio.Lock()
        self._cleanup_interval = cleanup_interval
        self._last_cleanup = time.time()
    
    async def is_rate_limited(
        self, 
        key: str, 
        max_requests: int, 
        window_seconds: int
    ) -> tuple[bool, int]:
        """
        Check if a key is rate limited.
        
        Args:
            key: Unique identifier (e.g., IP address, user ID)
            max_requests: Maximum allowed requests
            window_seconds: Time window in seconds
            
        Returns:
            (is_limited, remaining_requests)
        """
        async with self._lock:
            now = time.time()
            
            # Cleanup old entries periodically
            if now - self._last_cleanup > self._cleanup_interval:
                await self._cleanup()
                self._last_cleanup = now
            
            # Filter out old timestamps
            cutoff = now - window_seconds
            self._store[key] = [t for t in self._store[key] if t > cutoff]
            
            current_count = len(self._store[key])
            
            if current_count >= max_requests:
                return True, 0
            
            # Add current request
            self._store[key].append(now)
            return False, max_requests - current_count - 1
    
    async def _cleanup(self):
        """Remove expired entries"""
        now = time.time()
        keys_to_remove = []
        
        for key, timestamps in self._store.items():
            # Remove entries older than 1 hour
            self._store[key] = [t for t in timestamps if now - t < 3600]
            if not self._store[key]:
                keys_to_remove.append(key)
        
        for key in keys_to_remove:
            del self._store[key]


# Global rate limit store
_rate_limit_store = RateLimitStore()


# Rate limit configurations per endpoint pattern
RATE_LIMITS = {
    # Game creation - stricter limits
    "/api/py/game/create-game": {"max_requests": 10, "window_seconds": 60},
    "/api/py/game/reset-game": {"max_requests": 20, "window_seconds": 60},
    
    # Matchmaking - moderate limits
    "/api/py/game/matchmaking/join": {"max_requests": 5, "window_seconds": 30},
    "/api/py/game/matchmaking/leave": {"max_requests": 10, "window_seconds": 30},
    "/api/py/game/matchmaking/status": {"max_requests": 60, "window_seconds": 60},
    
    # Auth endpoints
    "/api/py/auth/google-login": {"max_requests": 10, "window_seconds": 60},
    "/api/py/auth/me": {"max_requests": 60, "window_seconds": 60},
    "/api/py/auth/history": {"max_requests": 30, "window_seconds": 60},
    
    # Leaderboard - cached, but still limit
    "/api/py/leaderboard": {"max_requests": 30, "window_seconds": 60},
    "/api/py/leaderboard/top": {"max_requests": 60, "window_seconds": 60},
    
    # AI endpoint
    "/api/py/api/ai/move": {"max_requests": 30, "window_seconds": 60},
    
    # Default for other endpoints
    "default": {"max_requests": 100, "window_seconds": 60},
}


def get_rate_limit_config(path: str) -> dict:
    """Get rate limit config for a specific path"""
    # Check for exact match first
    if path in RATE_LIMITS:
        return RATE_LIMITS[path]
    
    # Check for prefix match
    for pattern, config in RATE_LIMITS.items():
        if pattern != "default" and path.startswith(pattern):
            return config
    
    return RATE_LIMITS["default"]


class RateLimitMiddleware(BaseHTTPMiddleware):
    """
    Middleware for rate limiting API requests.
    Uses client IP as the default identifier.
    """
    
    def __init__(self, app, exclude_paths: Optional[list] = None):
        super().__init__(app)
        self.exclude_paths = exclude_paths or [
            "/api/py/docs",
            "/api/py/openapi.json",
            "/health",
            "/api/py/api/ai/health",
        ]
    
    async def dispatch(self, request: Request, call_next) -> Response:
        # Skip rate limiting for excluded paths
        path = request.url.path
        if any(path.startswith(excluded) for excluded in self.exclude_paths):
            return await call_next(request)
        
        # Skip WebSocket connections
        if path.startswith("/api/py/game/ws"):
            return await call_next(request)
        
        # Get client identifier
        client_ip = self._get_client_ip(request)
        rate_limit_key = f"{client_ip}:{path}"
        
        # Get rate limit config for this path
        config = get_rate_limit_config(path)
        
        # Check rate limit
        is_limited, remaining = await _rate_limit_store.is_rate_limited(
            rate_limit_key,
            config["max_requests"],
            config["window_seconds"]
        )
        
        if is_limited:
            logger.warning(f"Rate limit exceeded for {client_ip} on {path}")
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Rate limit exceeded. Please try again later.",
                headers={
                    "X-RateLimit-Limit": str(config["max_requests"]),
                    "X-RateLimit-Remaining": "0",
                    "X-RateLimit-Reset": str(config["window_seconds"]),
                    "Retry-After": str(config["window_seconds"]),
                }
            )
        
        # Process request
        response = await call_next(request)
        
        # Add rate limit headers
        response.headers["X-RateLimit-Limit"] = str(config["max_requests"])
        response.headers["X-RateLimit-Remaining"] = str(remaining)
        response.headers["X-RateLimit-Reset"] = str(config["window_seconds"])
        
        return response
    
    def _get_client_ip(self, request: Request) -> str:
        """Extract client IP from request, considering proxies"""
        # Check X-Forwarded-For header (for reverse proxies)
        forwarded_for = request.headers.get("x-forwarded-for")
        if forwarded_for:
            return forwarded_for.split(",")[0].strip()
        
        # Check X-Real-IP header
        real_ip = request.headers.get("x-real-ip")
        if real_ip:
            return real_ip
        
        # Fallback to direct client IP
        return request.client.host if request.client else "unknown"


def rate_limiter(
    max_requests: int = 60,
    window_seconds: int = 60,
    key_func: Optional[Callable] = None
):
    """
    Decorator for rate limiting individual endpoints.
    
    Usage:
        @router.get("/my-endpoint")
        @rate_limiter(max_requests=10, window_seconds=60)
        async def my_endpoint():
            ...
    """
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # Try to get request from kwargs or args
            request = kwargs.get("request")
            if not request:
                for arg in args:
                    if isinstance(arg, Request):
                        request = arg
                        break
            
            if request:
                # Get rate limit key
                if key_func:
                    key = key_func(request)
                else:
                    client_ip = request.client.host if request.client else "unknown"
                    key = f"{client_ip}:{request.url.path}"
                
                is_limited, remaining = await _rate_limit_store.is_rate_limited(
                    key, max_requests, window_seconds
                )
                
                if is_limited:
                    raise HTTPException(
                        status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                        detail="Rate limit exceeded"
                    )
            
            return await func(*args, **kwargs)
        return wrapper
    return decorator
