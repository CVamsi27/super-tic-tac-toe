import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock
import asyncio
import re
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from main import app
from models.game import GameMode

client = TestClient(app)

def test_root():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Super Tic Tac Toe Backend is running"}

@pytest.fixture
def mock_game_service():
    with patch('services.game_service.game_service') as mock_service:
        yield mock_service

def test_create_game_rest_endpoint(mock_game_service):
    mock_game = MagicMock()
    mock_game.id = "test_game_id"
    mock_game.mode = GameMode.REMOTE
    mock_game_service.create_game.return_value = mock_game
    response = client.post("/api/game/create-game", json={"mode": "remote"})
    assert response.status_code == 200
    response_json = response.json()
    assert re.match(r'^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$', 
                    response_json["game_id"])
    assert response_json["mode"] == "remote"

def test_join_game_as_player(mock_game_service):
    mock_game = MagicMock()
    mock_game.id = "test_game_id"
    mock_game.mode = GameMode.REMOTE
    mock_game_service.create_game.return_value = mock_game
    response = client.post("/api/game/create-game", json={"mode": "remote"})
    assert response.status_code == 200
    response_json = response.json()
    response = client.post("/api/game/join-game", json={"game_id": response_json["game_id"]}) 
    assert response.status_code == 200
    response_json = response.json()
    assert response_json["player_id"] is not None
    assert response_json["symbol"] == None
    assert response_json["status"] == "player"

def test_join_game_nonexistent_game(mock_game_service):
    """Test joining a game that doesn't exist"""
    mock_game_service.games = {}
    
    response = client.post("/api/game/join-game", json={
        "game_id": "nonexistent_game_id"
    })

    assert response.status_code == 404
    assert response.json() == {"detail": "Game not found"}

def test_make_move_rest_endpoint(mock_game_service):
    """Test the REST endpoint for making a move"""
    mock_game = MagicMock()
    mock_game.model_dump.return_value = {
        "global_board": [[0, 0, 0], [0, 0, 0], [0, 0, 0]],
        "move_count": 1,
        "winner": None
    }
    mock_game_service.make_move.return_value = mock_game

    response = client.post("/api/game/make-move", json={
        "game_id": "test_game_id",
        "global_board_index": 0,
        "local_board_index": 1,
        "move_count": 0
    })
    
    assert response.status_code == 200
    assert "global_board" in response.json()

@pytest.mark.asyncio
async def test_websocket_game_flow():
    """Comprehensive WebSocket game flow test"""
    async with client.websocket_connect("/api/game/ws/test_game") as websocket:
        await websocket.send_json({
            "type": "create_game",
            "mode": "remote"
        })
        response = await websocket.receive_json()
        assert response["type"] == "game_created"
        game_id = response["game_id"]

        await websocket.send_json({
            "type": "join_game",
            "game_id": game_id
        })
        response = await websocket.receive_json()
        assert response["type"] == "player_joined"

        await websocket.send_json({
            "type": "make_move",
            "game_id": game_id,
            "move": {
                "global_board_index": 0,
                "local_board_index": 1,
                "move_count": 0
            }
        })
        response = await websocket.receive_json()
        assert response["type"] == "game_update"
        assert "game_state" in response

def test_websocket_error_handling(mock_game_service):
    """Test WebSocket error scenarios"""
    mock_game_service.join_game.side_effect = Exception("Game is full")

    async def test_error_flow():
        async with client.websocket_connect("/api/game/ws/error_game") as websocket:
            await websocket.send_json({
                "type": "join_game",
                "game_id": "error_game"
            })
            response = await websocket.receive_json()
            assert response["type"] == "error"
            assert "Game is full" in response["message"]

    asyncio.run(test_error_flow())

@pytest.mark.parametrize("invalid_move", [
    {"type": "make_move", "move": {}}, 
    {"type": "make_move", "move": {"global_board_index": -1}}, 
    {"type": "unknown_type", "move": {}}  
])
def test_websocket_input_validation(invalid_move):
    """Test WebSocket input validation and error handling"""
    async def validate_input():
        async with client.websocket_connect("/api/game/ws/validation_game") as websocket:
            await websocket.send_json(invalid_move)
            response = await websocket.receive_json()
            assert response["type"] == "error"

    asyncio.run(validate_input())