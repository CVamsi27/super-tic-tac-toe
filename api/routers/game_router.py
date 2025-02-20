from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from api.models.game import GameCreateRequest, GameResetRequest
from api.services.game_service import game_service

router = APIRouter()

@router.post("/create-game")
async def create_game(request: GameCreateRequest):
    game = game_service.create_game(request.mode)
    return {"game_id": game.id, "mode": game.mode}

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
            
            handlers = {
                'join_game': lambda: game_service.handle_join_game(websocket, game_id, user_id, game_service.active_websockets[game_id]),
                'make_move': lambda: game_service.handle_make_move(websocket, game_id, user_id, data['move'], game_service.active_websockets[game_id]),
                'leave': lambda: game_service.handle_leave(game_id, data['userId'], game_service.active_websockets[game_id])
            }
            
            handler = handlers.get(message_type)
            if handler:
                await handler()
            else:
                await websocket.send_json({"type": "error", "message": "Invalid action"})

    except WebSocketDisconnect:
        print(f"WebSocket disconnected: {user_id}")
    except Exception as e:
        print(f"Error in websocket connection: {str(e)}")
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