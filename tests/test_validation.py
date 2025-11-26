"""
Tests for request validation utilities.
"""

import sys
import os

# Add project root to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from api.utils.validation import (
    validate_uuid, validate_user_id, validate_game_id,
    validate_game_mode, validate_ai_difficulty, validate_player,
    validate_board_index, validate_move, sanitize_string,
    validate_pagination, require_fields, ValidationError
)


def test_uuid_validation():
    print("Testing UUID Validation...")
    
    # Valid UUIDs
    valid_uuid = "550e8400-e29b-41d4-a716-446655440000"
    result = validate_uuid(valid_uuid)
    assert result == valid_uuid, f"Expected {valid_uuid}, got {result}"
    print("   Valid UUID: OK")
    
    # Invalid UUIDs
    try:
        validate_uuid("not-a-uuid")
        assert False, "Should have raised ValidationError"
    except ValidationError as e:
        assert e.field == "id"
        print("   Invalid UUID rejected: OK")
    
    # Empty UUID
    try:
        validate_uuid("")
        assert False, "Should have raised ValidationError"
    except ValidationError as e:
        assert "empty" in str(e).lower()
        print("   Empty UUID rejected: OK")
    
    print("✅ UUID Validation Tests Passed!")


def test_user_id_validation():
    print("\nTesting User ID Validation...")
    
    # Valid user IDs
    valid_ids = ["user123", "user-123", "user_123", "user.name@email.com", "google|123456"]
    for uid in valid_ids:
        result = validate_user_id(uid)
        assert result == uid.strip(), f"Failed for {uid}"
    print("   Valid user IDs: OK")
    
    # Too long
    try:
        validate_user_id("a" * 200)
        assert False, "Should have raised ValidationError"
    except ValidationError:
        print("   Too long rejected: OK")
    
    # Invalid characters
    try:
        validate_user_id("user<script>")
        assert False, "Should have raised ValidationError"
    except ValidationError:
        print("   Invalid characters rejected: OK")
    
    print("✅ User ID Validation Tests Passed!")


def test_game_mode_validation():
    print("\nTesting Game Mode Validation...")
    
    # Valid modes
    for mode in ["local", "remote", "ai", "LOCAL", "REMOTE", "AI"]:
        result = validate_game_mode(mode)
        assert result == mode.lower(), f"Failed for {mode}"
    print("   Valid modes: OK")
    
    # Invalid mode
    try:
        validate_game_mode("invalid")
        assert False, "Should have raised ValidationError"
    except ValidationError as e:
        assert "must be one of" in str(e).lower()
        print("   Invalid mode rejected: OK")
    
    print("✅ Game Mode Validation Tests Passed!")


def test_ai_difficulty_validation():
    print("\nTesting AI Difficulty Validation...")
    
    # Valid difficulties
    for diff in ["easy", "medium", "hard"]:
        result = validate_ai_difficulty(diff)
        assert result == diff
    print("   Valid difficulties: OK")
    
    # Default for None
    result = validate_ai_difficulty(None)
    assert result == "medium", "Should default to medium"
    print("   Default value: OK")
    
    # Invalid
    try:
        validate_ai_difficulty("impossible")
        assert False, "Should have raised ValidationError"
    except ValidationError:
        print("   Invalid difficulty rejected: OK")
    
    print("✅ AI Difficulty Validation Tests Passed!")


def test_player_validation():
    print("\nTesting Player Validation...")
    
    # Valid players
    assert validate_player("X") == "X"
    assert validate_player("O") == "O"
    assert validate_player("x") == "X"  # Should uppercase
    assert validate_player("o") == "O"
    print("   Valid players: OK")
    
    # Invalid
    try:
        validate_player("Z")
        assert False, "Should have raised ValidationError"
    except ValidationError:
        print("   Invalid player rejected: OK")
    
    print("✅ Player Validation Tests Passed!")


def test_board_index_validation():
    print("\nTesting Board Index Validation...")
    
    # Valid indices
    for i in range(9):
        result = validate_board_index(i)
        assert result == i
    print("   Valid indices 0-8: OK")
    
    # Out of range
    try:
        validate_board_index(9)
        assert False, "Should have raised ValidationError"
    except ValidationError:
        print("   Out of range rejected: OK")
    
    try:
        validate_board_index(-1)
        assert False, "Should have raised ValidationError"
    except ValidationError:
        print("   Negative index rejected: OK")
    
    # String conversion
    result = validate_board_index("5")
    assert result == 5
    print("   String conversion: OK")
    
    print("✅ Board Index Validation Tests Passed!")


def test_move_validation():
    print("\nTesting Move Validation...")
    
    # Valid move
    move = {"boardIndex": 4, "cellIndex": 0, "player": "X"}
    result = validate_move(move)
    assert result["boardIndex"] == 4
    assert result["cellIndex"] == 0
    assert result["player"] == "X"
    print("   Valid move: OK")
    
    # Missing fields
    try:
        validate_move({"boardIndex": 0})
        assert False, "Should have raised ValidationError"
    except ValidationError as e:
        assert "missing" in str(e).lower()
        print("   Missing fields rejected: OK")
    
    # Invalid type
    try:
        validate_move("not-a-dict")
        assert False, "Should have raised ValidationError"
    except ValidationError:
        print("   Invalid type rejected: OK")
    
    print("✅ Move Validation Tests Passed!")


def test_sanitize_string():
    print("\nTesting String Sanitization...")
    
    # Normal string
    result = sanitize_string("Hello World")
    assert result == "Hello World"
    print("   Normal string: OK")
    
    # Control characters
    result = sanitize_string("Hello\x00World\x1f!")
    assert "\x00" not in result
    assert "\x1f" not in result
    print("   Control characters removed: OK")
    
    # Truncation
    result = sanitize_string("a" * 2000, max_length=100)
    assert len(result) == 100
    print("   Truncation: OK")
    
    # Whitespace trimming
    result = sanitize_string("  hello  ")
    assert result == "hello"
    print("   Whitespace trimmed: OK")
    
    print("✅ String Sanitization Tests Passed!")


def test_pagination_validation():
    print("\nTesting Pagination Validation...")
    
    # Normal values
    page, limit = validate_pagination(1, 20)
    assert page == 1 and limit == 20
    print("   Normal values: OK")
    
    # Negative page
    page, limit = validate_pagination(-1, 20)
    assert page == 1
    print("   Negative page corrected: OK")
    
    # Limit exceeds max
    page, limit = validate_pagination(1, 500, max_limit=100)
    assert limit == 100
    print("   Limit capped at max: OK")
    
    print("✅ Pagination Validation Tests Passed!")


def test_require_fields():
    print("\nTesting Required Fields...")
    
    # All fields present
    data = {"name": "test", "value": 123}
    require_fields(data, ["name", "value"])
    print("   All fields present: OK")
    
    # Missing fields
    try:
        require_fields({"name": "test"}, ["name", "value", "extra"])
        assert False, "Should have raised ValidationError"
    except ValidationError as e:
        assert "value" in str(e) or "extra" in str(e)
        print("   Missing fields detected: OK")
    
    print("✅ Required Fields Tests Passed!")


if __name__ == "__main__":
    try:
        test_uuid_validation()
        test_user_id_validation()
        test_game_mode_validation()
        test_ai_difficulty_validation()
        test_player_validation()
        test_board_index_validation()
        test_move_validation()
        test_sanitize_string()
        test_pagination_validation()
        test_require_fields()
        
        print("\n" + "="*50)
        print("✅ ALL VALIDATION TESTS PASSED!")
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
