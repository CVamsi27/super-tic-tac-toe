"""
In-memory caching layer for frequently accessed data.
Supports TTL-based expiration and automatic cleanup.
"""

import time
import asyncio
from typing import Any, Dict, Optional, Callable, TypeVar, Generic
from functools import wraps
import hashlib
import json
import logging
from dataclasses import dataclass
from collections import OrderedDict

logger = logging.getLogger(__name__)

T = TypeVar('T')


@dataclass
class CacheEntry(Generic[T]):
    """Single cache entry with value and metadata"""
    value: T
    expires_at: float
    created_at: float
    hits: int = 0


class InMemoryCache:
    """
    Thread-safe in-memory cache with TTL support.
    Implements LRU eviction when max size is reached.
    """
    
    def __init__(
        self,
        max_size: int = 1000,
        default_ttl: int = 300,  # 5 minutes default
        cleanup_interval: int = 60,  # Cleanup every minute
    ):
        self._cache: OrderedDict[str, CacheEntry] = OrderedDict()
        self._max_size = max_size
        self._default_ttl = default_ttl
        self._cleanup_interval = cleanup_interval
        self._lock = asyncio.Lock()
        self._last_cleanup = time.time()
        self._stats = {
            "hits": 0,
            "misses": 0,
            "evictions": 0,
        }
    
    async def get(self, key: str) -> Optional[Any]:
        """
        Get a value from the cache.
        Returns None if not found or expired.
        """
        async with self._lock:
            await self._maybe_cleanup()
            
            entry = self._cache.get(key)
            if entry is None:
                self._stats["misses"] += 1
                return None
            
            # Check expiration
            if time.time() > entry.expires_at:
                del self._cache[key]
                self._stats["misses"] += 1
                return None
            
            # Update stats and move to end (LRU)
            entry.hits += 1
            self._stats["hits"] += 1
            self._cache.move_to_end(key)
            
            return entry.value
    
    async def set(
        self,
        key: str,
        value: Any,
        ttl: Optional[int] = None,
    ) -> None:
        """
        Set a value in the cache with optional TTL.
        """
        async with self._lock:
            now = time.time()
            expires_at = now + (ttl or self._default_ttl)
            
            # Evict if at max size
            while len(self._cache) >= self._max_size:
                oldest_key = next(iter(self._cache))
                del self._cache[oldest_key]
                self._stats["evictions"] += 1
            
            self._cache[key] = CacheEntry(
                value=value,
                expires_at=expires_at,
                created_at=now,
            )
    
    async def delete(self, key: str) -> bool:
        """Delete a key from the cache"""
        async with self._lock:
            if key in self._cache:
                del self._cache[key]
                return True
            return False
    
    async def clear(self) -> None:
        """Clear all entries from the cache"""
        async with self._lock:
            self._cache.clear()
    
    async def invalidate_pattern(self, pattern: str) -> int:
        """
        Invalidate all keys matching a pattern (prefix match).
        Returns number of keys deleted.
        """
        async with self._lock:
            keys_to_delete = [
                key for key in self._cache.keys()
                if key.startswith(pattern)
            ]
            for key in keys_to_delete:
                del self._cache[key]
            return len(keys_to_delete)
    
    async def _maybe_cleanup(self) -> None:
        """Cleanup expired entries periodically"""
        now = time.time()
        if now - self._last_cleanup < self._cleanup_interval:
            return
        
        self._last_cleanup = now
        keys_to_delete = [
            key for key, entry in self._cache.items()
            if now > entry.expires_at
        ]
        for key in keys_to_delete:
            del self._cache[key]
    
    def get_stats(self) -> dict:
        """Get cache statistics"""
        total_requests = self._stats["hits"] + self._stats["misses"]
        hit_rate = (
            self._stats["hits"] / total_requests * 100
            if total_requests > 0
            else 0
        )
        return {
            **self._stats,
            "size": len(self._cache),
            "max_size": self._max_size,
            "hit_rate": f"{hit_rate:.2f}%",
        }


# Global cache instances for different purposes
_game_cache = InMemoryCache(max_size=500, default_ttl=300)  # Game states
_leaderboard_cache = InMemoryCache(max_size=10, default_ttl=60)  # Leaderboard
_user_cache = InMemoryCache(max_size=1000, default_ttl=600)  # User data


def get_game_cache() -> InMemoryCache:
    """Get the game state cache"""
    return _game_cache


def get_leaderboard_cache() -> InMemoryCache:
    """Get the leaderboard cache"""
    return _leaderboard_cache


def get_user_cache() -> InMemoryCache:
    """Get the user data cache"""
    return _user_cache


def make_cache_key(*args, **kwargs) -> str:
    """
    Create a cache key from arguments.
    Uses hash for complex objects.
    """
    key_parts = [str(arg) for arg in args]
    key_parts.extend(f"{k}={v}" for k, v in sorted(kwargs.items()))
    key_str = ":".join(key_parts)
    
    # Use hash for long keys
    if len(key_str) > 100:
        return hashlib.md5(key_str.encode()).hexdigest()
    return key_str


def cached(
    cache: InMemoryCache = None,
    ttl: int = 300,
    key_prefix: str = "",
    key_builder: Optional[Callable] = None,
):
    """
    Decorator for caching async function results.
    
    Usage:
        @cached(cache=get_leaderboard_cache(), ttl=60, key_prefix="leaderboard")
        async def get_leaderboard(limit: int):
            ...
    """
    _cache = cache or _game_cache
    
    def decorator(func: Callable):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # Build cache key
            if key_builder:
                cache_key = key_builder(*args, **kwargs)
            else:
                cache_key = f"{key_prefix}:{func.__name__}:{make_cache_key(*args, **kwargs)}"
            
            # Try to get from cache
            cached_value = await _cache.get(cache_key)
            if cached_value is not None:
                logger.debug(f"Cache hit for {cache_key}")
                return cached_value
            
            # Execute function and cache result
            logger.debug(f"Cache miss for {cache_key}")
            result = await func(*args, **kwargs)
            
            if result is not None:
                await _cache.set(cache_key, result, ttl=ttl)
            
            return result
        
        # Add cache invalidation helper
        async def invalidate(*args, **kwargs):
            if key_builder:
                cache_key = key_builder(*args, **kwargs)
            else:
                cache_key = f"{key_prefix}:{func.__name__}:{make_cache_key(*args, **kwargs)}"
            await _cache.delete(cache_key)
        
        wrapper.invalidate = invalidate
        wrapper.cache = _cache
        
        return wrapper
    return decorator


async def warm_cache():
    """
    Pre-warm cache with commonly accessed data.
    Call this during application startup.
    """
    logger.info("Warming cache...")
    # This can be extended to pre-populate frequently accessed data
    pass


async def get_cache_stats() -> dict:
    """Get statistics for all caches"""
    return {
        "game_cache": _game_cache.get_stats(),
        "leaderboard_cache": _leaderboard_cache.get_stats(),
        "user_cache": _user_cache.get_stats(),
    }
