"""
Tests for the rate limiting middleware.
"""

import sys
import os
import asyncio

# Add project root to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from api.middleware.rate_limiter import RateLimitStore, get_rate_limit_config


def test_rate_limit_store():
    """Test rate limit store using asyncio.run"""
    asyncio.run(_test_rate_limit_store_async())


async def _test_rate_limit_store_async():
    print("Testing Rate Limit Store...")
    
    store = RateLimitStore(cleanup_interval=1)
    
    # 1. Test initial request (not limited)
    print("1. Testing initial request...")
    is_limited, remaining = await store.is_rate_limited("test_key", max_requests=5, window_seconds=60)
    assert not is_limited, "First request should not be limited"
    assert remaining == 4, f"Expected 4 remaining, got {remaining}"
    print("   Initial request: OK")
    
    # 2. Test subsequent requests
    print("2. Testing subsequent requests...")
    for i in range(3):
        is_limited, remaining = await store.is_rate_limited("test_key", max_requests=5, window_seconds=60)
        assert not is_limited, f"Request {i+2} should not be limited"
    print("   Subsequent requests: OK")
    
    # 3. Test rate limit exceeded
    print("3. Testing rate limit exceeded...")
    is_limited, remaining = await store.is_rate_limited("test_key", max_requests=5, window_seconds=60)
    assert not is_limited, "5th request should not be limited"
    
    is_limited, remaining = await store.is_rate_limited("test_key", max_requests=5, window_seconds=60)
    assert is_limited, "6th request should be limited"
    assert remaining == 0, "Should have 0 remaining when limited"
    print("   Rate limit exceeded: OK")
    
    # 4. Test different keys are independent
    print("4. Testing key independence...")
    is_limited, remaining = await store.is_rate_limited("other_key", max_requests=5, window_seconds=60)
    assert not is_limited, "Different key should not be limited"
    print("   Key independence: OK")
    
    # 5. Test window expiration
    print("5. Testing window expiration...")
    is_limited, _ = await store.is_rate_limited("expire_key", max_requests=2, window_seconds=1)
    is_limited, _ = await store.is_rate_limited("expire_key", max_requests=2, window_seconds=1)
    is_limited, _ = await store.is_rate_limited("expire_key", max_requests=2, window_seconds=1)
    assert is_limited, "Should be limited"
    
    await asyncio.sleep(1.1)  # Wait for window to expire
    
    is_limited, remaining = await store.is_rate_limited("expire_key", max_requests=2, window_seconds=1)
    assert not is_limited, "Should not be limited after window expires"
    print("   Window expiration: OK")
    
    print("\n✅ Rate Limit Store Tests Passed!")


def test_rate_limit_config():
    print("\nTesting Rate Limit Configuration...")
    
    # Test specific endpoint configs
    config = get_rate_limit_config("/api/py/game/create-game")
    assert config["max_requests"] == 10
    assert config["window_seconds"] == 60
    print("   Game create config: OK")
    
    config = get_rate_limit_config("/api/py/auth/google-login")
    assert config["max_requests"] == 10
    print("   Auth login config: OK")
    
    config = get_rate_limit_config("/api/py/leaderboard")
    assert config["max_requests"] == 30
    print("   Leaderboard config: OK")
    
    # Test default config
    config = get_rate_limit_config("/api/py/unknown/endpoint")
    assert config == {"max_requests": 100, "window_seconds": 60}
    print("   Default config: OK")
    
    print("\n✅ Rate Limit Config Tests Passed!")


async def main():
    try:
        await test_rate_limit_store()
        test_rate_limit_config()
        
        print("\n" + "="*50)
        print("✅ ALL RATE LIMITER TESTS PASSED!")
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
