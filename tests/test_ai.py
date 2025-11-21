
import sys
import os
import time
from typing import List, Optional

# Add project root to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from api.utils.ai_logic import AILogic
from api.models.game import GameState, PlayerSymbol, GameMode

def create_empty_game():
    # Create a basic empty game state manually
    # We need to mock the structure expected by AILogic
    # Global board is 9x9 (list of 9 lists of 9 cells)
    global_board = [[None for _ in range(9)] for _ in range(9)]
    
    return GameState(
        id="test_game",
        mode=GameMode.AI,
        ai_difficulty="hard",
        global_board=global_board,
        active_board=None, # Any board allowed
        players=[],
        current_player=PlayerSymbol.X
    )

def test_ai_performance():
    print("Testing AI Performance (Hard Mode - Depth 4)...")
    
    ai = AILogic(difficulty="hard")
    game = create_empty_game()
    
    # 1. First move (empty board) - should be fast due to heuristics or opening book if implemented, 
    # but minimax might run.
    # Available moves: all 81 cells. This is worst case for minimax.
    # However, AILogic might have optimizations.
    
    # Let's restrict available moves to one board to simulate mid-game if full board is too slow,
    # or just test full board to see if it hangs.
    
    # Actually, let's simulate a move where X played in center of board 4, sending O to board 4.
    game.active_board = 4
    available_moves = [(4, i) for i in range(9)]
    
    print(f"1. Testing move with 9 options (Active Board 4)...")
    start_time = time.time()
    move = ai.get_next_move(game, available_moves)
    duration = time.time() - start_time
    
    print(f"   Move selected: {move}")
    print(f"   Time taken: {duration:.4f}s")
    
    if duration > 2.0:
        print("   Warning: Move took > 2 seconds")
    else:
        print("   Performance OK")
        
    # 2. Test with more options (Active Board None - Free Move)
    # This is the heavy case. 81 moves.
    # If depth 4 is too deep for 81 branches, this will be very slow.
    # Let's see if it handles it or if we need to reduce depth for early game.
    
    print(f"\n2. Testing Free Move (Active Board None - 81 options)...")
    game.active_board = None
    # Fill some spots to make it realistic and slightly faster? 
    # Or just test empty to be sure.
    available_moves = []
    for b in range(9):
        for c in range(9):
            available_moves.append((b, c))
            
    start_time = time.time()
    # We'll set a timeout logic mentally - if this script hangs, we know depth 4 is too much for free move.
    # But we can't easily timeout in this simple script without signals.
    # Let's just run it.
    try:
        move = ai.get_next_move(game, available_moves)
        duration = time.time() - start_time
        print(f"   Move selected: {move}")
        print(f"   Time taken: {duration:.4f}s")
        
        if duration > 3.0:
             print("   Warning: Free move took > 3 seconds. Consider variable depth.")
        else:
             print("   Performance OK")
             
    except Exception as e:
        print(f"  Error: {e}")

    print("\n AI Test Completed")

if __name__ == "__main__":
    test_ai_performance()
