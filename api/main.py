from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

from api.routers import game_router
from api.db.database import init_db

app = FastAPI(title="Super Tic Tac Toe")

init_db()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(game_router.router, prefix="/api/game", tags=["Game"])

@app.get("/")
async def root():
    return {"message": "Super Tic Tac Toe Backend is running"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)