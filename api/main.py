from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.services.game_service import game_service
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
from contextlib import asynccontextmanager

from api.routers import game_router, auth_router, ai_router
from api.db.database import init_db

scheduler = AsyncIOScheduler()

@asynccontextmanager
async def lifespan(app: FastAPI):
    scheduler.start()
    
    scheduler.add_job(
        game_service.cleanup_inactive_games,
        CronTrigger(minute='*/30'),
        id='cleanup_games',
        name='Clean up inactive games'
    )
    yield

app = FastAPI(title="Super Tic Tac Toe", docs_url="/api/py/docs", openapi_url="/api/py/openapi.json", lifespan=lifespan)

init_db()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

app.include_router(game_router.router, prefix="/api/py/game", tags=["Game"])
app.include_router(auth_router.router, prefix="/api/py", tags=["Auth"])
app.include_router(ai_router.router, prefix="/api/py", tags=["AI"])