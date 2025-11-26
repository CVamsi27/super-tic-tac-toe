"""
Logging middleware for request/response tracking and performance monitoring.
"""

import time
import logging
import json
from typing import Callable
from uuid import uuid4

from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger("api.access")


class LoggingMiddleware(BaseHTTPMiddleware):
    """
    Middleware for logging all HTTP requests and responses.
    Tracks timing, status codes, and request metadata.
    """
    
    def __init__(
        self, 
        app, 
        exclude_paths: list = None,
        log_request_body: bool = False,
        log_response_body: bool = False,
    ):
        super().__init__(app)
        self.exclude_paths = exclude_paths or [
            "/health",
            "/api/py/docs",
            "/api/py/openapi.json",
        ]
        self.log_request_body = log_request_body
        self.log_response_body = log_response_body
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        # Skip logging for excluded paths
        path = request.url.path
        if any(path.startswith(excluded) for excluded in self.exclude_paths):
            return await call_next(request)
        
        # Skip WebSocket connections (they're handled differently)
        if "upgrade" in request.headers.get("connection", "").lower():
            return await call_next(request)
        
        # Get or create request ID
        request_id = request.headers.get("x-request-id", str(uuid4()))
        
        # Record start time
        start_time = time.time()
        
        # Extract request metadata
        client_ip = self._get_client_ip(request)
        user_agent = request.headers.get("user-agent", "unknown")
        
        # Log request
        log_data = {
            "request_id": request_id,
            "method": request.method,
            "path": path,
            "query_params": str(request.query_params),
            "client_ip": client_ip,
            "user_agent": user_agent[:100],  # Truncate user agent
        }
        
        logger.info(f"Request started: {json.dumps(log_data)}")
        
        # Process request
        try:
            response = await call_next(request)
            
            # Calculate duration
            duration_ms = (time.time() - start_time) * 1000
            
            # Log response
            log_data.update({
                "status_code": response.status_code,
                "duration_ms": round(duration_ms, 2),
            })
            
            # Log level based on status code
            if response.status_code >= 500:
                logger.error(f"Request completed: {json.dumps(log_data)}")
            elif response.status_code >= 400:
                logger.warning(f"Request completed: {json.dumps(log_data)}")
            else:
                logger.info(f"Request completed: {json.dumps(log_data)}")
            
            # Add timing headers
            response.headers["X-Request-ID"] = request_id
            response.headers["X-Response-Time"] = f"{duration_ms:.2f}ms"
            
            return response
            
        except Exception as e:
            # Log exception
            duration_ms = (time.time() - start_time) * 1000
            log_data.update({
                "status_code": 500,
                "duration_ms": round(duration_ms, 2),
                "error": str(e),
            })
            logger.exception(f"Request failed: {json.dumps(log_data)}")
            raise
    
    def _get_client_ip(self, request: Request) -> str:
        """Extract client IP from request"""
        forwarded_for = request.headers.get("x-forwarded-for")
        if forwarded_for:
            return forwarded_for.split(",")[0].strip()
        
        real_ip = request.headers.get("x-real-ip")
        if real_ip:
            return real_ip
        
        return request.client.host if request.client else "unknown"


class PerformanceLogger:
    """
    Utility for logging performance metrics for specific operations.
    """
    
    def __init__(self, operation_name: str):
        self.operation_name = operation_name
        self.start_time = None
        self.logger = logging.getLogger("api.performance")
    
    def __enter__(self):
        self.start_time = time.time()
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        duration_ms = (time.time() - self.start_time) * 1000
        
        log_data = {
            "operation": self.operation_name,
            "duration_ms": round(duration_ms, 2),
            "success": exc_type is None,
        }
        
        if exc_type:
            log_data["error"] = str(exc_val)
            self.logger.warning(f"Operation completed: {json.dumps(log_data)}")
        elif duration_ms > 1000:  # Slow operation (> 1 second)
            self.logger.warning(f"Slow operation: {json.dumps(log_data)}")
        else:
            self.logger.debug(f"Operation completed: {json.dumps(log_data)}")
        
        return False  # Don't suppress exceptions


def log_slow_query(threshold_ms: float = 100):
    """
    Decorator for logging slow database queries or operations.
    
    Usage:
        @log_slow_query(threshold_ms=50)
        async def my_db_operation():
            ...
    """
    def decorator(func):
        async def wrapper(*args, **kwargs):
            start_time = time.time()
            try:
                result = await func(*args, **kwargs)
                return result
            finally:
                duration_ms = (time.time() - start_time) * 1000
                if duration_ms > threshold_ms:
                    logger = logging.getLogger("api.slow_query")
                    logger.warning(
                        f"Slow operation: {func.__name__} took {duration_ms:.2f}ms "
                        f"(threshold: {threshold_ms}ms)"
                    )
        return wrapper
    return decorator
