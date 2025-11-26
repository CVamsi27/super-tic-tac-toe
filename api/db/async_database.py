"""
Async database configuration using SQLAlchemy async support.
Provides better performance for I/O-bound database operations.
"""

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from contextlib import asynccontextmanager
import os
from dotenv import load_dotenv
import logging

load_dotenv()

logger = logging.getLogger(__name__)

# Get database URL and convert to async format
database_url = os.getenv("DATABASE_URL")
if not database_url:
    raise ValueError("DATABASE_URL environment variable is not set")

# Convert postgresql:// to postgresql+asyncpg://
if database_url.startswith("postgresql://"):
    async_database_url = database_url.replace("postgresql://", "postgresql+asyncpg://", 1)
elif database_url.startswith("postgres://"):
    async_database_url = database_url.replace("postgres://", "postgresql+asyncpg://", 1)
else:
    async_database_url = database_url

# Create async engine with optimized pool settings
async_engine = create_async_engine(
    async_database_url,
    pool_pre_ping=True,
    pool_recycle=1800,  # Recycle connections every 30 minutes
    pool_size=20,  # Increased pool size for async operations
    max_overflow=30,  # Allow more overflow connections
    pool_timeout=30,  # Connection timeout
    echo=False,  # Set to True for SQL debugging
)

# Create async session factory
AsyncSessionLocal = async_sessionmaker(
    bind=async_engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)


class AsyncBase(DeclarativeBase):
    """Base class for async ORM models"""
    pass


@asynccontextmanager
async def get_async_db():
    """
    Async context manager for database sessions.
    Automatically handles commit/rollback and session cleanup.
    """
    session = AsyncSessionLocal()
    try:
        yield session
        await session.commit()
    except Exception as e:
        await session.rollback()
        logger.error(f"Database error: {e}")
        raise
    finally:
        await session.close()


from typing import AsyncGenerator

async def get_db_session() -> AsyncGenerator[AsyncSession, None]:
    """
    Dependency for FastAPI routes that need a database session.
    Use with Depends(get_db_session).
    """
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


async def init_async_db():
    """Initialize async database - create tables if they don't exist"""
    async with async_engine.begin() as conn:
        await conn.run_sync(AsyncBase.metadata.create_all)


async def check_db_health() -> dict:
    """
    Check database connectivity and pool status.
    Returns health information for monitoring.
    """
    try:
        async with AsyncSessionLocal() as session:
            await session.execute("SELECT 1")
            
        pool = async_engine.pool
        return {
            "status": "healthy",
            "pool_size": pool.size(),
            "checked_in": pool.checkedin(),
            "checked_out": pool.checkedout(),
            "overflow": pool.overflow(),
        }
    except Exception as e:
        logger.error(f"Database health check failed: {e}")
        return {
            "status": "unhealthy",
            "error": str(e)
        }


async def close_db_connections():
    """Close all database connections gracefully"""
    await async_engine.dispose()
    logger.info("Database connections closed")
