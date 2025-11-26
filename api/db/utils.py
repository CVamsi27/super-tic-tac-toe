"""
Database utilities for retry logic, connection management, and query helpers.
"""

import asyncio
import logging
import time
from functools import wraps
from typing import TypeVar, Callable, Any, Optional
from sqlalchemy.exc import OperationalError, InterfaceError, DBAPIError

logger = logging.getLogger(__name__)

T = TypeVar('T')


class DatabaseRetryError(Exception):
    """Raised when all database retry attempts fail"""
    pass


def with_db_retry(
    max_retries: int = 3,
    initial_delay: float = 0.1,
    max_delay: float = 2.0,
    exponential_base: float = 2.0,
    retryable_exceptions: tuple = (OperationalError, InterfaceError),
):
    """
    Decorator for retrying database operations with exponential backoff.
    
    Args:
        max_retries: Maximum number of retry attempts
        initial_delay: Initial delay between retries in seconds
        max_delay: Maximum delay between retries
        exponential_base: Base for exponential backoff
        retryable_exceptions: Tuple of exception types to retry on
    
    Usage:
        @with_db_retry(max_retries=3)
        def my_db_operation():
            ...
    """
    def decorator(func: Callable[..., T]) -> Callable[..., T]:
        @wraps(func)
        def wrapper(*args, **kwargs) -> T:
            last_exception = None
            delay = initial_delay
            
            for attempt in range(max_retries + 1):
                try:
                    return func(*args, **kwargs)
                except retryable_exceptions as e:
                    last_exception = e
                    
                    if attempt == max_retries:
                        logger.error(
                            f"Database operation {func.__name__} failed after "
                            f"{max_retries + 1} attempts: {e}"
                        )
                        raise DatabaseRetryError(
                            f"Database operation failed after {max_retries + 1} attempts"
                        ) from e
                    
                    logger.warning(
                        f"Database operation {func.__name__} failed (attempt {attempt + 1}/"
                        f"{max_retries + 1}), retrying in {delay:.2f}s: {e}"
                    )
                    
                    time.sleep(delay)
                    delay = min(delay * exponential_base, max_delay)
            
            raise last_exception
        return wrapper
    return decorator


def async_with_db_retry(
    max_retries: int = 3,
    initial_delay: float = 0.1,
    max_delay: float = 2.0,
    exponential_base: float = 2.0,
    retryable_exceptions: tuple = (OperationalError, InterfaceError),
):
    """
    Async version of with_db_retry decorator.
    """
    def decorator(func: Callable[..., T]) -> Callable[..., T]:
        @wraps(func)
        async def wrapper(*args, **kwargs) -> T:
            last_exception = None
            delay = initial_delay
            
            for attempt in range(max_retries + 1):
                try:
                    return await func(*args, **kwargs)
                except retryable_exceptions as e:
                    last_exception = e
                    
                    if attempt == max_retries:
                        logger.error(
                            f"Async database operation {func.__name__} failed after "
                            f"{max_retries + 1} attempts: {e}"
                        )
                        raise DatabaseRetryError(
                            f"Database operation failed after {max_retries + 1} attempts"
                        ) from e
                    
                    logger.warning(
                        f"Async database operation {func.__name__} failed (attempt {attempt + 1}/"
                        f"{max_retries + 1}), retrying in {delay:.2f}s: {e}"
                    )
                    
                    await asyncio.sleep(delay)
                    delay = min(delay * exponential_base, max_delay)
            
            raise last_exception
        return wrapper
    return decorator


class QueryTimer:
    """
    Context manager for timing database queries.
    Logs slow queries automatically.
    """
    
    def __init__(
        self,
        operation_name: str,
        slow_threshold_ms: float = 100.0,
        log_all: bool = False,
    ):
        self.operation_name = operation_name
        self.slow_threshold_ms = slow_threshold_ms
        self.log_all = log_all
        self.start_time: Optional[float] = None
        self.duration_ms: Optional[float] = None
    
    def __enter__(self):
        self.start_time = time.perf_counter()
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        self.duration_ms = (time.perf_counter() - self.start_time) * 1000
        
        if exc_type is not None:
            logger.error(
                f"Query '{self.operation_name}' failed after {self.duration_ms:.2f}ms: {exc_val}"
            )
        elif self.duration_ms > self.slow_threshold_ms:
            logger.warning(
                f"Slow query '{self.operation_name}': {self.duration_ms:.2f}ms "
                f"(threshold: {self.slow_threshold_ms}ms)"
            )
        elif self.log_all:
            logger.debug(f"Query '{self.operation_name}': {self.duration_ms:.2f}ms")
        
        return False  # Don't suppress exceptions


def paginate_query(query, page: int = 1, page_size: int = 20):
    """
    Helper to paginate SQLAlchemy queries.
    
    Args:
        query: SQLAlchemy query object
        page: Page number (1-indexed)
        page_size: Number of items per page
    
    Returns:
        Paginated query
    """
    if page < 1:
        page = 1
    if page_size < 1:
        page_size = 20
    if page_size > 100:
        page_size = 100  # Max page size
    
    offset = (page - 1) * page_size
    return query.offset(offset).limit(page_size)


def batch_insert(session, model_class, items: list, batch_size: int = 100):
    """
    Insert items in batches to avoid memory issues with large inserts.
    
    Args:
        session: SQLAlchemy session
        model_class: ORM model class
        items: List of dictionaries with item data
        batch_size: Number of items per batch
    """
    total_inserted = 0
    
    for i in range(0, len(items), batch_size):
        batch = items[i:i + batch_size]
        session.bulk_insert_mappings(model_class, batch)
        session.flush()
        total_inserted += len(batch)
        logger.debug(f"Inserted batch of {len(batch)} items ({total_inserted}/{len(items)})")
    
    return total_inserted
