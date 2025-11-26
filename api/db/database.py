"""
Database configuration and connection management.
Provides synchronous database access with connection pooling.
"""

from sqlalchemy.orm import DeclarativeBase, sessionmaker
from sqlalchemy import create_engine, text
from contextlib import contextmanager
import os
import logging
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

database_url = os.getenv("DATABASE_URL")
if not database_url:
    raise ValueError("DATABASE_URL environment variable is not set")

# Create engine with optimized pool settings
engine = create_engine(
    database_url,
    pool_pre_ping=True,  # Check connection health before using
    pool_recycle=1800,   # Recycle connections every 30 minutes
    pool_size=20,        # Increased pool size
    max_overflow=30,     # Allow more overflow connections
    pool_timeout=30,     # Connection timeout in seconds
    echo=False,          # Set to True for SQL debugging
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    """Base class for ORM models"""
    pass


@contextmanager
def get_db():
    """
    Context manager for database sessions.
    Automatically handles commit/rollback and session cleanup.
    """
    db = SessionLocal()
    try:
        yield db
        db.commit()
    except Exception as e:
        db.rollback()
        logger.error(f"Database error: {e}")
        raise
    finally:
        db.close()


def init_db():
    """Initialize database - create tables if they don't exist"""
    Base.metadata.create_all(bind=engine)
    logger.info("Database initialized")


def get_pool_status() -> dict:
    """
    Get database connection pool status.
    Useful for monitoring and debugging.
    """
    pool = engine.pool
    return {
        "pool_size": pool.size(),
        "checked_in": pool.checkedin(),
        "checked_out": pool.checkedout(),
        "overflow": pool.overflow(),
        "invalid": pool.invalidatedcount() if hasattr(pool, 'invalidatedcount') else 0,
    }


def check_db_health() -> dict:
    """
    Check database connectivity and pool status.
    Returns health information for monitoring.
    """
    try:
        with get_db() as db:
            db.execute(text("SELECT 1"))
        
        return {
            "status": "healthy",
            **get_pool_status(),
        }
    except Exception as e:
        logger.error(f"Database health check failed: {e}")
        return {
            "status": "unhealthy",
            "error": str(e),
        }