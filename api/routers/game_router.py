from fastapi import APIRouter, WebSocket, WebSocketDisconnect, HTTPException
from api.models.game import GameCreateRequest, GameResetRequest
from api.services.game_service import game_service
from api.services.matchmaking_service import matchmaking_queue

router = APIRouter()

@router.post("/create-game")
async def create_game(request: GameCreateRequest):
    game = game_service.create_game(request.mode, request.ai_difficulty or "medium")
    return {"game_id": game.id, "mode": game.mode, "ai_difficulty": game.ai_difficulty}

@router.post("/reset-game")
async def reset_game(request: GameResetRequest):
    return game_service.reset_game(request.game_id, request.user_id)

@router.post("/matchmaking/join")
async def join_matchmaking(user_id: str):
    """Join matchmaking queue"""
    try:
        game_id = matchmaking_queue.join_queue(user_id)
        if game_id:
            # Create game for matched players
            players = matchmaking_queue.get_matched_players(game_id)
            if players:
                game = game_service.create_matched_game(game_id, players)
                return {"status": "matched", "game_id": game_id}
            else:
                # If no players found, something went wrong - remove from matched games
                return {"status": "error", "message": "Failed to match players"}
        else:
            position = matchmaking_queue.get_queue_position(user_id)
            return {"status": "queued", "position": position, "queue_size": matchmaking_queue.get_queue_size()}
    except Exception as e:
        # Log the error and return a proper error response
        print(f"Matchmaking error: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Matchmaking failed: {str(e)}")

@router.post("/matchmaking/leave")
async def leave_matchmaking(user_id: str):
    """Leave matchmaking queue"""
    removed = matchmaking_queue.leave_queue(user_id)
    return {"status": "removed" if removed else "not_in_queue"}

@router.get("/matchmaking/status")
async def get_matchmaking_status(user_id: str):
    """Check matchmaking status"""
    position = matchmaking_queue.get_queue_position(user_id)
    if position is not None:
        return {"status": "queued", "position": position, "queue_size": matchmaking_queue.get_queue_size()}
    
    # Check if user was matched
    game_id = matchmaking_queue.get_matched_game(user_id)
    if game_id:
        return {"status": "matched", "game_id": game_id}
    
    return {"status": "not_queued"}

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