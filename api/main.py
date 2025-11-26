from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import JSONResponse
from api.services.game_service import game_service
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
from contextlib import asynccontextmanager
import logging
import time

from api.routers import game_router, auth_router, ai_router
from api.db.database import init_db, check_db_health, get_pool_status, engine
from api.middleware.rate_limiter import RateLimitMiddleware
from api.middleware.logging_middleware import LoggingMiddleware
from api.middleware.request_id import RequestIdMiddleware
from api.utils.cache import warm_cache, get_cache_stats
from api.utils.websocket_manager import ws_manager
from api.utils.health import health_monitor, HealthStatus, ComponentHealth
from api.utils.pool_monitor import pool_monitor

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

scheduler = AsyncIOScheduler()


def check_database_health() -> ComponentHealth:
    """Health check for database"""
    db_status = check_db_health()
    if db_status["status"] == "healthy":
        return ComponentHealth(
            name="database",
            status=HealthStatus.HEALTHY,
            details=db_status,
        )
    return ComponentHealth(
        name="database",
        status=HealthStatus.UNHEALTHY,
        message=db_status.get("error", "Database unhealthy"),
        details=db_status,
    )


def check_websocket_health() -> ComponentHealth:
    """Health check for WebSocket manager"""
    stats = ws_manager.get_stats()
    return ComponentHealth(
        name="websocket",
        status=HealthStatus.HEALTHY,
        details=stats,
    )


async def check_cache_health() -> ComponentHealth:
    """Health check for cache system"""
    stats = await get_cache_stats()
    return ComponentHealth(
        name="cache",
        status=HealthStatus.HEALTHY,
        details=stats,
    )


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager"""
    # Startup
    logger.info("Starting Super Tic Tac Toe API...")
    
    # Register health checks
    health_monitor.register_check("database", check_database_health)
    health_monitor.register_check("websocket", check_websocket_health)
    health_monitor.register_check("cache", check_cache_health)
    
    # Start health monitor
    await health_monitor.start()
    
    # Start pool monitor
    pool_monitor.set_engine(engine)
    await pool_monitor.start()
    
    # Start scheduler
    scheduler.start()
    
    # Add scheduled jobs
    scheduler.add_job(
        game_service.cleanup_inactive_games,
        CronTrigger(minute='*/30'),
        id='cleanup_games',
        name='Clean up inactive games'
    )
    
    # Add matchmaking queue cleanup
    from api.services.matchmaking_service import matchmaking_queue
    scheduler.add_job(
        lambda: matchmaking_queue.cleanup_old_entries(10),
        CronTrigger(minute='*/5'),
        id='cleanup_matchmaking',
        name='Clean up old matchmaking entries'
    )
    
    # Start WebSocket manager heartbeat
    await ws_manager.start()
    
    # Warm caches
    await warm_cache()
    
    logger.info("API startup complete")
    
    yield
    
    # Shutdown
    logger.info("Shutting down Super Tic Tac Toe API...")
    
    # Stop health monitor
    await health_monitor.stop()
    
    # Stop pool monitor
    await pool_monitor.stop()
    
    # Stop WebSocket manager
    await ws_manager.stop()
    
    # Stop scheduler
    scheduler.shutdown()
    
    logger.info("API shutdown complete")

app = FastAPI(
    title="Super Tic Tac Toe",
    description="API for Super Tic Tac Toe game with real-time multiplayer support",
    version="2.0.0",
    docs_url="/api/py/docs",
    openapi_url="/api/py/openapi.json",
    lifespan=lifespan
)

init_db()

# Add middleware in correct order (last added = first executed)

# GZip compression for responses
app.add_middleware(GZipMiddleware, minimum_size=1000)

# Request ID tracking
app.add_middleware(RequestIdMiddleware)

# Logging middleware
app.add_middleware(
    LoggingMiddleware,
    exclude_paths=["/health", "/api/py/docs", "/api/py/openapi.json"],
)

# Rate limiting
app.add_middleware(
    RateLimitMiddleware,
    exclude_paths=["/health", "/api/py/docs", "/api/py/openapi.json"],
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://super-tic-tac-toe.buildora.work",
        "http://localhost:3000",
        "http://127.0.0.1:3000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*", "X-Request-ID", "X-Response-Time", "X-RateLimit-Limit", "X-RateLimit-Remaining"],
)

# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.exception(f"Unhandled exception: {exc}")
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"},
    )

# Health check endpoint
@app.get("/health", tags=["Health"])
async def health_check():
    """Comprehensive health check endpoint for monitoring"""
    health_report = await health_monitor.get_health()
    
    # Map status to HTTP-friendly format
    status_map = {
        HealthStatus.HEALTHY: "healthy",
        HealthStatus.DEGRADED: "degraded", 
        HealthStatus.UNHEALTHY: "unhealthy"
    }
    
    return {
        "status": status_map.get(health_report["status"], "unknown"),
        "timestamp": health_report["timestamp"],
        "version": "2.0.0",
        "uptime_seconds": health_report["uptime_seconds"],
        "components": {
            name: {
                "status": status_map.get(comp["status"], "unknown"),
                "latency_ms": comp["latency_ms"],
                "message": comp.get("message"),
                "last_check": comp["last_check"]
            }
            for name, comp in health_report["components"].items()
        }
    }

# Metrics endpoint
@app.get("/api/py/metrics", tags=["Monitoring"])
async def get_metrics():
    """Get application metrics and statistics"""
    cache_stats = await get_cache_stats()
    ws_stats = ws_manager.get_stats()
    db_pool = get_pool_status()
    
    return {
        "cache": cache_stats,
        "websocket": ws_stats,
        "database_pool": db_pool,
        "active_games": len(game_service.games),
    }


# Pool monitoring endpoint
@app.get("/api/py/pool-stats", tags=["Monitoring"])
async def get_pool_stats():
    """Get detailed connection pool statistics and recommendations"""
    return {
        "current_status": pool_monitor.get_current_status(),
        "statistics": pool_monitor.get_statistics(),
        "recommendations": pool_monitor.get_recommendations(),
        "history_5min": pool_monitor.get_history(minutes=5)
    }

app.include_router(game_router.router, prefix="/api/py/game", tags=["Game"])
app.include_router(auth_router.router, prefix="/api/py", tags=["Auth"])
app.include_router(ai_router.router, prefix="/api/py", tags=["AI"])