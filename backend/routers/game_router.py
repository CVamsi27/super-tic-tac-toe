from fastapi import APIRouter, WebSocket, WebSocketDisconnect, HTTPException

from models.game import (
    GameCreateRequest, 
    GameMove, 
    GameMode
)
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
async def reset_game(game_id: str):
    return game_service.reset_game(game_id)

# @router.post("/join-game")
# async def join_game(request: GameJoinRequest):
#     player = game_service.join_game(request.game_id)
#     return {
#         "player_id": player.id, 
#         "symbol": player.symbol, 
#         "status": player.status
#     }

# @router.post("/make-move")
# async def make_move(move: GameMove):
#     game = game_service.make_move(move.game_id, move)
#     return game.model_dump()

@router.websocket("/ws/{game_id}")
async def websocket_endpoint(websocket: WebSocket, game_id: str):

    await websocket.accept()

    if not game_service.get_existing_game(game_id):
        await websocket.send_json({
            "type": "error",
            "message": "Game not found"
        })
    
    else:
        if game_id not in game_service.active_websockets:
            game_service.active_websockets[game_id] = []
    
        game_service.active_websockets[game_id].append(websocket)
    
        try:
            while True:
                data = await websocket.receive_json()
                
                if data['type'] == 'create_game':
                    mode = GameMode(data.get('mode', 'local'))
                    game = game_service.create_game(mode)
                    await websocket.send_json({
                        "type": "game_created",
                        "game_id": game.id,
                        "mode": game.mode
                    })
                
                elif data['type'] == 'join_game':
                    try:
                        player = game_service.join_game(game_id)
                        
                        if game_id in game_service.active_websockets:
                            for client in game_service.active_websockets[game_id]:
                                await client.send_json({
                                    "type": "player_joined",
                                    "player_id": player.id,
                                    "status": player.status,
                                    "symbol": player.symbol,
                                    "watchers_count": game_service.games[game_id].watchers_count
                                })
                    except HTTPException as e:
                        await websocket.send_json({
                            "type": "error",
                            "message": str(e.detail)
                        })
                
                elif data['type'] == 'make_move':
                    try:
                        move = GameMove(
                            game_id=game_id,
                            global_board_index=data['move']['global_board_index'],
                            local_board_index=data['move']['local_board_index'],
                            move_count=data['move'].get('move_count', 0)
                        )
                        
                        game = game_service.make_move(game_id, move)
                        
                        if game_id in game_service.active_websockets:
                            for client in game_service.active_websockets[game_id]:
                                await client.send_json({
                                    "type": "game_update",
                                    "game_state": {
                                        "global_board": game.global_board,
                                        "move_count": game.move_count,
                                        "winner": game.winner
                                    }
                                })
                    except HTTPException as e:
                        await websocket.send_json({
                            "type": "error",
                            "message": str(e.detail)
                        })
                
                elif data['type'] == 'leave_watcher':
                    game_service.remove_watcher(game_id)
                    
                    if game_id in game_service.active_websockets:
                        for client in game_service.active_websockets[game_id]:
                            await client.send_json({
                                "type": "watchers_update",
                                "watchers_count": game_service.games[game_id].watchers_count
                            })
        
        except WebSocketDisconnect:
            if game_id in game_service.active_websockets:
                game_service.active_websockets[game_id].remove(websocket)

# @router.websocket("/local_game")
# async def local_game_websocket(websocket: WebSocket):
#     await websocket.accept()
    
#     try:
#         while True:
#             data = await websocket.receive_json()
            
#             if data['type'] == 'create_game':
#                 game = game_service.create_game(GameMode.LOCAL)
#                 await websocket.send_json({
#                     "type": "game_created",
#                     "game_id": game.id,
#                     "mode": "local"
#                 })
    
#     except WebSocketDisconnect:
#         pass