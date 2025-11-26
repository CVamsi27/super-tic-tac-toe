"""
Request ID middleware for request tracing and correlation.
"""

from uuid import uuid4
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response
from contextvars import ContextVar

# Context variable for request ID (accessible throughout the request lifecycle)
request_id_ctx: ContextVar[str] = ContextVar("request_id", default="")


def get_request_id() -> str:
    """Get the current request ID from context"""
    return request_id_ctx.get()


class RequestIdMiddleware(BaseHTTPMiddleware):
    """
    Middleware that adds a unique request ID to each request.
    The ID can be passed in via X-Request-ID header or generated automatically.
    """
    
    async def dispatch(self, request: Request, call_next) -> Response:
        # Get existing request ID or generate a new one
        request_id = request.headers.get("x-request-id", str(uuid4()))
        
        # Set in context for use throughout the request
        token = request_id_ctx.set(request_id)
        
        try:
            # Add to request state for easy access
            request.state.request_id = request_id
            
            # Process request
            response = await call_next(request)
            
            # Add request ID to response headers
            response.headers["X-Request-ID"] = request_id
            
            return response
        finally:
            # Reset context
            request_id_ctx.reset(token)
