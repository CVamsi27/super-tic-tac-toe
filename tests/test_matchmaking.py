
import sys
import os
import asyncio
from datetime import datetime, timedelta

# Add project root to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from api.services.matchmaking_service import matchmaking_queue, MatchmakingQueue

def test_matchmaking_flow():
    """Test matchmaking flow using asyncio.run"""
    asyncio.run(_test_matchmaking_flow_async())


async def _test_matchmaking_flow_async():
    print("Testing Matchmaking Flow...")
    
    # Create a fresh queue for testing (must be in async context)
    test_queue = MatchmakingQueue()
    
    user1 = "user_1"
    user2 = "user_2"
    user3 = "user_3"
    
    # 1. User 1 joins
    print(f"1. {user1} joining queue...")
    game_id = test_queue.join_queue(user1)
    assert game_id is None, "User 1 should not be matched yet"
    assert test_queue.get_queue_position(user1) == 0, "User 1 should be first in queue"
    print("   User 1 queued successfully.")
    
    # 2. User 2 joins (should match with User 1)
    print(f"2. {user2} joining queue...")
    game_id = test_queue.join_queue(user2)
    assert game_id is not None, "User 2 should trigger a match"
    print(f"   Match found! Game ID: {game_id}")
    
    # 3. Verify match details
    players = test_queue.get_matched_players(game_id)
    assert players is not None, "Should have matched players"
    assert user1 in players and user2 in players, "Both users should be in the match"
    
    assert test_queue.get_queue_position(user1) is None, "User 1 should no longer be in queue"
    assert test_queue.get_queue_position(user2) is None, "User 2 should no longer be in queue"
    print("   Match verification successful.")

    # 4. Test Leave Queue
    print(f"3. {user3} joining and leaving queue...")
    test_queue.join_queue(user3)
    assert test_queue.get_queue_position(user3) == 0
    test_queue.leave_queue(user3)
    assert test_queue.get_queue_position(user3) is None
    print("   Leave queue successful.")
    
    # 5. Test Queue Stats
    print("4. Testing queue statistics...")
    stats = test_queue.get_stats()
    assert stats["total_joins"] == 3, f"Expected 3 joins, got {stats['total_joins']}"
    assert stats["total_matches"] == 1, f"Expected 1 match, got {stats['total_matches']}"
    assert stats["total_leaves"] == 1, f"Expected 1 leave, got {stats['total_leaves']}"
    print(f"   Stats: {stats}")
    
    # 6. Test Cleanup
    print("5. Testing cleanup...")
    test_queue.join_queue("old_user")
    # Simulate old entry by modifying joined_at
    test_queue.queue[0].joined_at = datetime.now() - timedelta(minutes=15)
    cleanup_result = test_queue.cleanup_old_entries(max_age_minutes=10)
    assert cleanup_result["expired_queue_entries"] == 1, "Should have cleaned up 1 entry"
    print(f"   Cleanup result: {cleanup_result}")
    
    print("\n✅ All Matchmaking Tests Passed!")

if __name__ == "__main__":
    try:
        test_matchmaking_flow()
    except AssertionError as e:
        print(f"\n❌ Test Failed: {e}")
        sys.exit(1)
    except Exception as e:
        import traceback
        print(f"\n❌ Error: {e}")
        traceback.print_exc()
        sys.exit(1)
