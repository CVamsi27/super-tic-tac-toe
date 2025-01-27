from fastapi import APIRouter, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.websockets import WebSocketState
from models.game import GameCreateRequest, GameMove, GameMode, GameResetRequest
from services.game_service import game_service

router = APIRouter()

@router.get("/current-board")
async def current_board(game_id: str):
    return game_service.current_board(game_id).global_board

@router.post("/create-game")
async def create_game(request: GameCreateRequest):
    game = game_service.create_game(request.mode)
    return {"game_id": game.id, "mode": game.mode}

@router.post("/reset-game")
async def reset_game(request: GameResetRequest):
    return game_service.reset_game(request.game_id)

@router.websocket("/ws/connect")
async def websocket_endpoint(websocket: WebSocket, game_id: str, user_id: str):
    await websocket.accept()

    if not game_service.get_existing_game(game_id):
        await websocket.send_json({"type": "error", "message": "Game not found"})
        await websocket.close()
        return

    if game_id not in game_service.active_websockets:
        game_service.active_websockets[game_id] = set()

    game_service.active_websockets[game_id].add(websocket)

    try:
        while True:
            data = await websocket.receive_json()
            message_type = data.get('type')

            if message_type == 'join_game':
                try:
                    player = game_service.join_game(game_id, user_id)
                    for client in game_service.active_websockets[game_id]:
                        if client.client_state == WebSocketState.CONNECTED:
                            await client.send_json({
                                "type": "player_joined",
                                "gameId": game_id,
                                "userId": player.id,
                                "symbol": player.symbol,
                                "status": player.status,
                                "watchers_count": game_service.games[game_id].watchers_count
                            })
                except HTTPException as e:
                    await websocket.send_json({"type": "error", "message": str(e.detail)})

            elif message_type == 'make_move':
                try:
                    move = GameMove(
                        game_id=game_id,
                        global_board_index=data['move']['global_board_index'],
                        local_board_index=data['move']['local_board_index'],
                        move_count=data['move'].get('move_count', 0)
                    )
                    game = game_service.make_move(game_id, move)

                    for client in game_service.active_websockets[game_id]:
                        if client.client_state == WebSocketState.CONNECTED:
                            await client.send_json({
                                "type": "game_update",
                                "userId": user_id,
                                "game_state": {
                                    "global_board": game.global_board,
                                    "move_count": game.move_count,
                                    "winner": game.winner
                                }
                            })
                except HTTPException as e:
                    await websocket.send_json({"type": "error", "message": str(e.detail)})

            elif message_type == 'leave_watcher':
                game_service.remove_watcher(game_id)
                for client in game_service.active_websockets[game_id]:
                    if client.client_state == WebSocketState.CONNECTED:
                        await client.send_json({
                            "type": "watchers_update",
                            "gameId": game_id,
                            "watchers_count": game_service.games[game_id].watchers_count
                        })

            else:
                await websocket.send_json({"type": "error", "message": "Invalid action"})

    except WebSocketDisconnect:
        print(f"WebSocket disconnected: {user_id}")
    finally:
        if game_id in game_service.active_websockets:
            game_service.active_websockets[game_id].discard(websocket)
            
            if not game_service.active_websockets[game_id]:  
                del game_service.active_websockets[game_id]
            
            for client in game_service.active_websockets.get(game_id, []):
                if client.client_state == WebSocketState.CONNECTED:
                    await client.send_json({
                        "type": "watchers_update",
                        "watchers_count": game_service.games[game_id].watchers_count
                    })