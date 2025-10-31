from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from api.models.game import GameCreateRequest, GameResetRequest
from api.services.game_service import game_service

router = APIRouter()

@router.post("/create-game")
async def create_game(request: GameCreateRequest):
    game = game_service.create_game(request.mode, request.ai_difficulty or "medium")
    return {"game_id": game.id, "mode": game.mode, "ai_difficulty": game.ai_difficulty}

@router.post("/reset-game")
async def reset_game(request: GameResetRequest):
    return game_service.reset_game(request.game_id, request.user_id)

@router.websocket("/ws/connect")
async def websocket_endpoint(websocket: WebSocket, game_id: str, user_id: str):
    if not game_service.get_existing_game(game_id):
        await websocket.accept()
        await websocket.send_json({"type": "error", "message": "Game not found"})
        await websocket.close()
        return

    await websocket.accept()

    if game_id not in game_service.active_websockets:
        game_service.active_websockets[game_id] = set()
    
    game_service.active_websockets[game_id].add(websocket)
    
    try:
        while True:
            data = await websocket.receive_json()
            message_type = data.get('type')
            
            if message_type == 'join_game':
                await game_service.handle_join_game(websocket, game_id, user_id, game_service.active_websockets[game_id])
            elif message_type == 'make_move':
                await game_service.handle_make_move(websocket, game_id, user_id, data['move'], game_service.active_websockets[game_id])
            elif message_type == 'reset_game':
                await game_service.handle_reset_game(game_id, user_id, game_service.active_websockets[game_id])
            elif message_type == 'leave':
                await game_service.handle_leave(game_id, data['userId'], game_service.active_websockets[game_id])
            else:
                await websocket.send_json({"type": "error", "message": "Invalid action"})

    except WebSocketDisconnect:
        pass
    except Exception as e:
        await websocket.send_json({"type": "error", "message": "Internal server error"})
    finally:
        if game_id in game_service.active_websockets:
            game_service.active_websockets[game_id].discard(websocket)
            
            if not game_service.active_websockets[game_id]:
                del game_service.active_websockets[game_id]
            else:
                await game_service.broadcast_to_game(
                    game_service.active_websockets[game_id],
                    {
                        "type": "watchers_update",
                        "gameId": game_id,
                        "watchers_count": game_service.games[game_id].watchers_count
                    }
                )