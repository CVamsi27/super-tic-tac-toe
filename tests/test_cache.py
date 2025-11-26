"""
Tests for the caching system.
"""

import sys
import os
import asyncio

# Add project root to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from api.utils.cache import InMemoryCache, cached, make_cache_key, get_cache_stats


def test_basic_cache_operations():
    """Test basic cache operations using asyncio.run"""
    asyncio.run(_test_basic_cache_operations_async())


async def _test_basic_cache_operations_async():
    print("Testing Basic Cache Operations...")
    
    cache = InMemoryCache(max_size=100, default_ttl=10)
    
    # 1. Test set and get
    print("1. Testing set and get...")
    await cache.set("key1", "value1")
    result = await cache.get("key1")
    assert result == "value1", f"Expected 'value1', got '{result}'"
    print("   Set and get: OK")
    
    # 2. Test cache miss
    print("2. Testing cache miss...")
    result = await cache.get("nonexistent")
    assert result is None, f"Expected None, got '{result}'"
    print("   Cache miss: OK")
    
    # 3. Test delete
    print("3. Testing delete...")
    await cache.set("key2", "value2")
    deleted = await cache.delete("key2")
    assert deleted is True, "Expected delete to return True"
    result = await cache.get("key2")
    assert result is None, "Expected None after delete"
    print("   Delete: OK")
    
    # 4. Test TTL expiration
    print("4. Testing TTL expiration...")
    await cache.set("key3", "value3", ttl=1)  # 1 second TTL
    result = await cache.get("key3")
    assert result == "value3", "Should exist before TTL"
    await asyncio.sleep(1.1)  # Wait for expiration
    result = await cache.get("key3")
    assert result is None, "Should be expired after TTL"
    print("   TTL expiration: OK")
    
    # 5. Test pattern invalidation
    print("5. Testing pattern invalidation...")
    await cache.set("prefix:key1", "val1")
    await cache.set("prefix:key2", "val2")
    await cache.set("other:key1", "val3")
    count = await cache.invalidate_pattern("prefix:")
    assert count == 2, f"Expected 2 invalidations, got {count}"
    assert await cache.get("prefix:key1") is None
    assert await cache.get("prefix:key2") is None
    assert await cache.get("other:key1") == "val3"
    print("   Pattern invalidation: OK")
    
    # 6. Test LRU eviction
    print("6. Testing LRU eviction...")
    small_cache = InMemoryCache(max_size=3, default_ttl=60)
    await small_cache.set("a", 1)
    await small_cache.set("b", 2)
    await small_cache.set("c", 3)
    await small_cache.set("d", 4)  # Should evict 'a'
    assert await small_cache.get("a") is None, "Oldest entry should be evicted"
    assert await small_cache.get("b") == 2
    print("   LRU eviction: OK")
    
    # 7. Test cache stats
    print("7. Testing cache stats...")
    stats = cache.get_stats()
    assert "hits" in stats
    assert "misses" in stats
    assert "size" in stats
    print(f"   Stats: {stats}")
    
    print("\n✅ All Cache Tests Passed!")


async def _test_cached_decorator_async():
    print("\nTesting @cached Decorator...")
    
    call_count = 0
    
    @cached(ttl=5, key_prefix="test")
    async def expensive_function(x: int) -> int:
        nonlocal call_count
        call_count += 1
        return x * 2
    
    # First call - should execute function
    result1 = await expensive_function(5)
    assert result1 == 10
    assert call_count == 1
    print("   First call executed function: OK")
    
    # Second call with same arg - should use cache
    result2 = await expensive_function(5)
    assert result2 == 10
    assert call_count == 1, f"Function should not be called again, count: {call_count}"
    print("   Second call used cache: OK")
    
    # Different argument - should execute function again
    result3 = await expensive_function(10)
    assert result3 == 20
    assert call_count == 2
    print("   Different arg executed function: OK")
    
    # Test invalidation
    await expensive_function.invalidate(5)
    result4 = await expensive_function(5)
    assert call_count == 3, "Function should be called after invalidation"
    print("   Invalidation works: OK")
    
    print("\n✅ Cached Decorator Tests Passed!")


def test_cached_decorator():
    """Test the @cached decorator using asyncio.run"""
    asyncio.run(_test_cached_decorator_async())


def test_cache_key_generation():
    print("\nTesting Cache Key Generation...")
    
    key1 = make_cache_key("arg1", "arg2", kwarg1="val1")
    key2 = make_cache_key("arg1", "arg2", kwarg1="val1")
    key3 = make_cache_key("arg1", "arg2", kwarg1="val2")
    
    assert key1 == key2, "Same args should produce same key"
    assert key1 != key3, "Different args should produce different key"
    
    # Test long key hashing
    long_key = make_cache_key("a" * 200)
    assert len(long_key) <= 32, "Long keys should be hashed"
    
    print("   Key generation: OK")
    print("\n✅ Cache Key Tests Passed!")


async def main():
    try:
        await test_basic_cache_operations()
        await test_cached_decorator()
        test_cache_key_generation()
        
        # Test global cache stats
        print("\nTesting Global Cache Stats...")
        stats = await get_cache_stats()
        assert "game_cache" in stats
        assert "leaderboard_cache" in stats
        assert "user_cache" in stats
        print(f"   Global stats: {list(stats.keys())}")
        
        print("\n" + "="*50)
        print("✅ ALL CACHE TESTS PASSED!")
        print("="*50)
        
    except AssertionError as e:
        print(f"\n❌ Test Failed: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    asyncio.run(main())
