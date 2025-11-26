"""
Application health monitoring and graceful shutdown utilities.
"""

import asyncio
import logging
import signal
import time
from dataclasses import dataclass, field
from datetime import datetime
from typing import Dict, List, Optional, Callable, Any
from enum import Enum

logger = logging.getLogger(__name__)


class HealthStatus(str, Enum):
    """Health status levels"""
    HEALTHY = "healthy"
    DEGRADED = "degraded"
    UNHEALTHY = "unhealthy"


@dataclass
class ComponentHealth:
    """Health status of a single component"""
    name: str
    status: HealthStatus
    message: Optional[str] = None
    last_check: datetime = field(default_factory=datetime.utcnow)
    details: Dict[str, Any] = field(default_factory=dict)


@dataclass
class ApplicationHealth:
    """Overall application health"""
    status: HealthStatus
    uptime_seconds: float
    components: List[ComponentHealth]
    version: str = "2.0.0"
    
    def to_dict(self) -> dict:
        return {
            "status": self.status.value,
            "uptime_seconds": round(self.uptime_seconds, 2),
            "version": self.version,
            "components": [
                {
                    "name": c.name,
                    "status": c.status.value,
                    "message": c.message,
                    "last_check": c.last_check.isoformat(),
                    "details": c.details,
                }
                for c in self.components
            ],
        }


class HealthMonitor:
    """
    Monitors application health by running periodic checks on components.
    """
    
    def __init__(self):
        self._checks: Dict[str, Callable] = {}
        self._results: Dict[str, ComponentHealth] = {}
        self._start_time = time.time()
        self._check_interval = 30  # seconds
        self._monitor_task: Optional[asyncio.Task] = None
        self._running = False
    
    def register_check(
        self,
        name: str,
        check_func: Callable[[], ComponentHealth],
    ):
        """Register a health check function"""
        self._checks[name] = check_func
        logger.info(f"Registered health check: {name}")
    
    async def start(self):
        """Start the health monitor background task"""
        if self._monitor_task is None:
            self._running = True
            self._monitor_task = asyncio.create_task(self._monitor_loop())
            logger.info("Health monitor started")
    
    async def stop(self):
        """Stop the health monitor"""
        self._running = False
        if self._monitor_task:
            self._monitor_task.cancel()
            try:
                await self._monitor_task
            except asyncio.CancelledError:
                pass
            self._monitor_task = None
            logger.info("Health monitor stopped")
    
    async def _monitor_loop(self):
        """Background loop for running health checks"""
        while self._running:
            await self._run_all_checks()
            await asyncio.sleep(self._check_interval)
    
    async def _run_all_checks(self):
        """Run all registered health checks"""
        for name, check_func in self._checks.items():
            try:
                if asyncio.iscoroutinefunction(check_func):
                    result = await check_func()
                else:
                    result = check_func()
                self._results[name] = result
            except Exception as e:
                self._results[name] = ComponentHealth(
                    name=name,
                    status=HealthStatus.UNHEALTHY,
                    message=str(e),
                )
                logger.error(f"Health check '{name}' failed: {e}")
    
    async def get_health(self) -> ApplicationHealth:
        """Get current application health"""
        # Run fresh checks
        await self._run_all_checks()
        
        components = list(self._results.values())
        
        # Determine overall status
        if any(c.status == HealthStatus.UNHEALTHY for c in components):
            overall_status = HealthStatus.UNHEALTHY
        elif any(c.status == HealthStatus.DEGRADED for c in components):
            overall_status = HealthStatus.DEGRADED
        else:
            overall_status = HealthStatus.HEALTHY
        
        return ApplicationHealth(
            status=overall_status,
            uptime_seconds=time.time() - self._start_time,
            components=components,
        )
    
    def get_uptime(self) -> float:
        """Get application uptime in seconds"""
        return time.time() - self._start_time


class GracefulShutdown:
    """
    Handles graceful application shutdown.
    Ensures all connections are closed and tasks are completed.
    """
    
    def __init__(self):
        self._shutdown_handlers: List[Callable] = []
        self._is_shutting_down = False
        self._shutdown_timeout = 30  # seconds
    
    def register_handler(self, handler: Callable):
        """Register a shutdown handler function"""
        self._shutdown_handlers.append(handler)
        logger.info(f"Registered shutdown handler: {handler.__name__}")
    
    def setup_signal_handlers(self):
        """Setup signal handlers for graceful shutdown"""
        loop = asyncio.get_event_loop()
        
        for sig in (signal.SIGTERM, signal.SIGINT):
            loop.add_signal_handler(
                sig,
                lambda s=sig: asyncio.create_task(self._handle_signal(s))
            )
        
        logger.info("Signal handlers registered for graceful shutdown")
    
    async def _handle_signal(self, sig: signal.Signals):
        """Handle shutdown signal"""
        if self._is_shutting_down:
            logger.warning("Shutdown already in progress, forcing exit...")
            raise SystemExit(1)
        
        self._is_shutting_down = True
        logger.info(f"Received signal {sig.name}, starting graceful shutdown...")
        
        await self.shutdown()
    
    async def shutdown(self):
        """Execute all shutdown handlers"""
        logger.info(f"Running {len(self._shutdown_handlers)} shutdown handlers...")
        
        for handler in reversed(self._shutdown_handlers):
            try:
                logger.info(f"Running shutdown handler: {handler.__name__}")
                if asyncio.iscoroutinefunction(handler):
                    await asyncio.wait_for(
                        handler(),
                        timeout=self._shutdown_timeout / len(self._shutdown_handlers)
                    )
                else:
                    handler()
            except asyncio.TimeoutError:
                logger.warning(f"Shutdown handler {handler.__name__} timed out")
            except Exception as e:
                logger.error(f"Shutdown handler {handler.__name__} failed: {e}")
        
        logger.info("Graceful shutdown complete")
    
    @property
    def is_shutting_down(self) -> bool:
        """Check if application is shutting down"""
        return self._is_shutting_down


# Global instances
health_monitor = HealthMonitor()
graceful_shutdown = GracefulShutdown()
