from fastapi import APIRouter, WebSocket, WebSocketDisconnect, HTTPException, Query
from api.models.game import GameCreateRequest, GameResetRequest
from api.services.game_service import game_service
from api.services.matchmaking_service import matchmaking_queue
from api.utils.validation import (
    validate_user_id, validate_game_id, validate_move,
    ValidationError, sanitize_string
)
import logging
import traceback
import time

logger = logging.getLogger(__name__)

router = APIRouter()


def handle_validation_error(e: ValidationError):
    """Convert validation error to HTTP exception"""
    raise HTTPException(status_code=400, detail=str(e))


@router.post("/create-game")
async def create_game(request: GameCreateRequest):
    """Create a new game (remote or AI mode)"""
    try:
        game = game_service.create_game(request.mode, request.ai_difficulty or "medium")
        logger.info(f"Game created: {game.id}, mode: {game.mode}")
        return {"game_id": game.id, "mode": game.mode, "ai_difficulty": game.ai_difficulty}
    except Exception as e:
        logger.error(f"Failed to create game: {e}")
        raise HTTPException(status_code=500, detail="Failed to create game")

@router.post("/reset-game")
async def reset_game(request: GameResetRequest):
    """Reset an existing game"""
    try:
        return game_service.reset_game(request.game_id, request.user_id)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to reset game: {e}")
        raise HTTPException(status_code=500, detail="Failed to reset game")

@router.post("/matchmaking/join")
async def join_matchmaking(user_id: str = Query(..., min_length=1, max_length=128)):
    """Join matchmaking queue"""
    try:
        # Validate user_id
        validated_user_id = validate_user_id(user_id)
        
        game_id = matchmaking_queue.join_queue(validated_user_id)
        if game_id:
            # Create game for matched players
            players = matchmaking_queue.get_matched_players(game_id)
            if players:
                game = game_service.create_matched_game(game_id, players)
                logger.info(f"Matchmaking complete: game {game_id}")
                return {"status": "matched", "game_id": game_id}
            else:
                # If no players found, something went wrong - remove from matched games
                logger.warning(f"Matchmaking failed: no players found for game {game_id}")
                return {"status": "error", "message": "Failed to match players"}
        else:
            position = matchmaking_queue.get_queue_position(validated_user_id)
            queue_entry = matchmaking_queue.get_queue_entry(validated_user_id)
            wait_time = queue_entry.wait_time_seconds if queue_entry else 0
            return {
                "status": "queued",
                "position": position,
                "queue_size": matchmaking_queue.get_queue_size(),
                "wait_time_seconds": round(wait_time, 1),
            }
    except ValidationError as e:
        handle_validation_error(e)
    except Exception as e:
        logger.error(f"Matchmaking error: {str(e)}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Matchmaking failed: {str(e)}")

@router.post("/matchmaking/leave")
async def leave_matchmaking(user_id: str = Query(..., min_length=1, max_length=128)):
    """Leave matchmaking queue"""
    try:
        validated_user_id = validate_user_id(user_id)
        removed = matchmaking_queue.leave_queue(validated_user_id)
        return {"status": "removed" if removed else "not_in_queue"}
    except ValidationError as e:
        handle_validation_error(e)

@router.get("/matchmaking/status")
async def get_matchmaking_status(user_id: str = Query(..., min_length=1, max_length=128)):
    """Check matchmaking status"""
    try:
        validated_user_id = validate_user_id(user_id)
        position = matchmaking_queue.get_queue_position(validated_user_id)
        if position is not None:
            queue_entry = matchmaking_queue.get_queue_entry(validated_user_id)
            wait_time = queue_entry.wait_time_seconds if queue_entry else 0
            return {
                "status": "queued",
                "position": position,
                "queue_size": matchmaking_queue.get_queue_size(),
                "wait_time_seconds": round(wait_time, 1),
                "average_wait_time": round(matchmaking_queue.get_average_wait_time(), 1),
            }
        
        # Check if user was matched
        game_id = matchmaking_queue.get_matched_game(validated_user_id)
        if game_id:
            return {"status": "matched", "game_id": game_id}
        
        return {"status": "not_queued"}
    except ValidationError as e:
        handle_validation_error(e)

@router.get("/matchmaking/stats")
async def get_matchmaking_stats():
    """Get matchmaking statistics (for monitoring)"""
    return matchmaking_queue.get_stats()

@router.websocket("/ws/connect")
async def websocket_endpoint(websocket: WebSocket, game_id: str, user_id: str):
    """WebSocket endpoint for real-time game updates"""
    if not game_service.get_existing_game(game_id):
        await websocket.accept()
        await websocket.send_json({"type": "error", "message": "Game not found"})
        await websocket.close()
        return

    await websocket.accept()

    if game_id not in game_service.active_websockets:
        game_service.active_websockets[game_id] = set()
    
    game_service.active_websockets[game_id].add(websocket)
    logger.info(f"WebSocket connected: game={game_id}, user={user_id}")
    
    try:
        while True:
            data = await websocket.receive_json()
            message_type = data.get('type')
            
            # Handle ping/pong for connection health
            if message_type == 'pong':
                # Client responded to ping, connection is healthy
                continue
            elif message_type == 'ping':
                # Client sent ping, respond with pong
                await websocket.send_json({"type": "pong", "timestamp": data.get("timestamp")})
                continue
            elif message_type == 'join_game':
                await game_service.handle_join_game(websocket, game_id, user_id, game_service.active_websockets[game_id])
            elif message_type == 'make_move':
                move_data = data.get('move')
                if not move_data:
                    await websocket.send_json({"type": "error", "message": "Missing move data"})
                    continue
                await game_service.handle_make_move(websocket, game_id, user_id, move_data, game_service.active_websockets[game_id])
            elif message_type == 'reset_game':
                await game_service.handle_reset_game(game_id, user_id, game_service.active_websockets[game_id])
            elif message_type == 'leave':
                leave_user_id = data.get('userId', user_id)
                await game_service.handle_leave(game_id, leave_user_id, game_service.active_websockets[game_id])
            else:
                logger.warning(f"Unknown message type: {message_type}")
                await websocket.send_json({"type": "error", "message": "Invalid action"})

    except WebSocketDisconnect:
        logger.info(f"WebSocket disconnected: game={game_id}, user={user_id}")
    except Exception as e:
        logger.error(f"WebSocket error: game={game_id}, user={user_id}, error={e}")
        try:
            await websocket.send_json({"type": "error", "message": "Internal server error"})
        except Exception:
            pass
    finally:
        if game_id in game_service.active_websockets:
            game_service.active_websockets[game_id].discard(websocket)
            
            if not game_service.active_websockets[game_id]:
                del game_service.active_websockets[game_id]
            else:
                try:
                    await game_service.broadcast_to_game(
                        game_service.active_websockets[game_id],
                        {
                            "type": "watchers_update",
                            "gameId": game_id,
                            "watchers_count": game_service.games[game_id].watchers_count if game_id in game_service.games else 0
                        }
                    )
                except Exception as e:
                    logger.error(f"Failed to broadcast watchers update: {e}")