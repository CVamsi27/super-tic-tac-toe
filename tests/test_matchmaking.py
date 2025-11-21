
import sys
import os
import asyncio
from datetime import datetime

# Add project root to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from api.services.matchmaking_service import matchmaking_queue
from api.services.game_service import game_service

def test_matchmaking_flow():
    print("Testing Matchmaking Flow...")
    
    # Clear queue first
    matchmaking_queue.queue = []
    matchmaking_queue.matched_games = {}
    
    user1 = "user_1"
    user2 = "user_2"
    user3 = "user_3"
    
    # 1. User 1 joins
    print(f"1. {user1} joining queue...")
    game_id = matchmaking_queue.join_queue(user1)
    assert game_id is None, "User 1 should not be matched yet"
    assert matchmaking_queue.get_queue_position(user1) == 0, "User 1 should be first in queue"
    print("   User 1 queued successfully.")
    
    # 2. User 2 joins (should match with User 1)
    print(f"2. {user2} joining queue...")
    game_id = matchmaking_queue.join_queue(user2)
    assert game_id is not None, "User 2 should trigger a match"
    print(f"   Match found! Game ID: {game_id}")
    
    # 3. Verify match details
    players = matchmaking_queue.get_matched_players(game_id)
    assert players is not None, "Should have matched players"
    assert user1 in players and user2 in players, "Both users should be in the match"
    
    assert matchmaking_queue.get_matched_game(user1) == game_id, "User 1 should have game_id"
    assert matchmaking_queue.get_matched_game(user2) == game_id, "User 2 should have game_id"
    
    assert matchmaking_queue.get_queue_position(user1) is None, "User 1 should no longer be in queue"
    assert matchmaking_queue.get_queue_position(user2) is None, "User 2 should no longer be in queue"
    print("   Match verification successful.")
    
    # 4. Verify Game Creation in GameService
    # Note: The API endpoint calls create_matched_game, but here we are testing the service directly.
    # We should manually call create_matched_game to verify it works.
    print("3. Testing Game Creation...")
    game = game_service.create_matched_game(game_id, players)
    assert game.id == game_id, "Game ID mismatch"
    assert len(game.players) == 2, "Game should have 2 players"
    assert game.players[0].id == players[0], "Player 1 mismatch"
    assert game.players[1].id == players[1], "Player 2 mismatch"
    print("   Game creation successful.")

    # 5. Test Leave Queue
    print(f"4. {user3} joining and leaving queue...")
    matchmaking_queue.join_queue(user3)
    assert matchmaking_queue.get_queue_position(user3) == 0
    matchmaking_queue.leave_queue(user3)
    assert matchmaking_queue.get_queue_position(user3) is None
    print("   Leave queue successful.")
    
    print("\n✅ All Matchmaking Tests Passed!")

if __name__ == "__main__":
    try:
        test_matchmaking_flow()
    except AssertionError as e:
        print(f"\n❌ Test Failed: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Error: {e}")
        sys.exit(1)
