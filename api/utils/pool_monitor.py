"""
Database connection pool monitoring and optimization utilities.
Provides real-time metrics and automatic pool tuning.
"""

import asyncio
import time
import logging
from typing import Dict, List, Optional, Any
from dataclasses import dataclass, field
from collections import deque
from datetime import datetime, timedelta
from contextlib import asynccontextmanager

logger = logging.getLogger(__name__)


@dataclass
class PoolMetrics:
    """Snapshot of connection pool metrics"""
    timestamp: float
    pool_size: int
    checked_in: int
    checked_out: int
    overflow: int
    invalidated: int
    
    @property
    def utilization(self) -> float:
        """Calculate pool utilization percentage"""
        total = self.pool_size + self.overflow
        if total == 0:
            return 0.0
        return (self.checked_out / total) * 100
    
    @property
    def is_under_pressure(self) -> bool:
        """Check if pool is under pressure"""
        return self.utilization > 80 or self.overflow > 0
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "timestamp": self.timestamp,
            "pool_size": self.pool_size,
            "checked_in": self.checked_in,
            "checked_out": self.checked_out,
            "overflow": self.overflow,
            "invalidated": self.invalidated,
            "utilization_percent": round(self.utilization, 2),
            "under_pressure": self.is_under_pressure
        }


@dataclass
class QueryMetrics:
    """Metrics for a single query execution"""
    query_hash: str
    duration_ms: float
    timestamp: float
    success: bool
    rows_affected: int = 0
    

class ConnectionPoolMonitor:
    """
    Monitors database connection pool health and performance.
    Tracks metrics over time and provides recommendations.
    """
    
    def __init__(
        self,
        history_size: int = 1000,
        alert_threshold_utilization: float = 90.0,
        alert_threshold_overflow: int = 5,
        sample_interval: float = 5.0
    ):
        self.history_size = history_size
        self.alert_threshold_utilization = alert_threshold_utilization
        self.alert_threshold_overflow = alert_threshold_overflow
        self.sample_interval = sample_interval
        
        self._metrics_history: deque[PoolMetrics] = deque(maxlen=history_size)
        self._query_metrics: deque[QueryMetrics] = deque(maxlen=history_size)
        self._alerts: deque[Dict] = deque(maxlen=100)
        self._running = False
        self._monitor_task: Optional[asyncio.Task] = None
        self._engine = None
        
        # Statistics
        self._total_queries = 0
        self._failed_queries = 0
        self._total_query_time_ms = 0.0
        self._peak_utilization = 0.0
        self._peak_overflow = 0
        
    def set_engine(self, engine):
        """Set the SQLAlchemy engine to monitor"""
        self._engine = engine
        
    async def start(self):
        """Start the monitoring loop"""
        if self._running:
            return
        
        self._running = True
        self._monitor_task = asyncio.create_task(self._monitor_loop())
        logger.info("Connection pool monitor started")
        
    async def stop(self):
        """Stop the monitoring loop"""
        self._running = False
        if self._monitor_task:
            self._monitor_task.cancel()
            try:
                await self._monitor_task
            except asyncio.CancelledError:
                pass
        logger.info("Connection pool monitor stopped")
        
    async def _monitor_loop(self):
        """Main monitoring loop"""
        while self._running:
            try:
                await self._collect_metrics()
                await asyncio.sleep(self.sample_interval)
            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.error(f"Error in pool monitor: {e}")
                await asyncio.sleep(self.sample_interval)
                
    async def _collect_metrics(self):
        """Collect current pool metrics"""
        if not self._engine:
            return
            
        try:
            pool = self._engine.pool
            
            metrics = PoolMetrics(
                timestamp=time.time(),
                pool_size=pool.size(),
                checked_in=pool.checkedin(),
                checked_out=pool.checkedout(),
                overflow=pool.overflow(),
                invalidated=pool.invalidatedcount() if hasattr(pool, 'invalidatedcount') else 0
            )
            
            self._metrics_history.append(metrics)
            
            # Update peak values
            if metrics.utilization > self._peak_utilization:
                self._peak_utilization = metrics.utilization
            if metrics.overflow > self._peak_overflow:
                self._peak_overflow = metrics.overflow
                
            # Check for alerts
            self._check_alerts(metrics)
            
        except Exception as e:
            logger.error(f"Failed to collect pool metrics: {e}")
            
    def _check_alerts(self, metrics: PoolMetrics):
        """Check metrics and generate alerts if needed"""
        if metrics.utilization >= self.alert_threshold_utilization:
            self._add_alert("high_utilization", f"Pool utilization at {metrics.utilization:.1f}%")
            
        if metrics.overflow >= self.alert_threshold_overflow:
            self._add_alert("high_overflow", f"Pool overflow at {metrics.overflow} connections")
            
    def _add_alert(self, alert_type: str, message: str):
        """Add an alert with deduplication"""
        # Check if we recently added this type of alert
        recent_cutoff = time.time() - 60  # 1 minute dedup window
        for alert in self._alerts:
            if alert["type"] == alert_type and alert["timestamp"] > recent_cutoff:
                return
                
        alert = {
            "type": alert_type,
            "message": message,
            "timestamp": time.time(),
            "datetime": datetime.now().isoformat()
        }
        self._alerts.append(alert)
        logger.warning(f"Pool alert: {message}")
        
    def record_query(
        self,
        query_hash: str,
        duration_ms: float,
        success: bool,
        rows_affected: int = 0
    ):
        """Record query execution metrics"""
        self._total_queries += 1
        if not success:
            self._failed_queries += 1
        self._total_query_time_ms += duration_ms
        
        self._query_metrics.append(QueryMetrics(
            query_hash=query_hash,
            duration_ms=duration_ms,
            timestamp=time.time(),
            success=success,
            rows_affected=rows_affected
        ))
        
    def get_current_status(self) -> Dict[str, Any]:
        """Get current pool status"""
        if not self._metrics_history:
            return {"status": "no_data", "message": "No metrics collected yet"}
            
        latest = self._metrics_history[-1]
        
        # Determine overall status
        if latest.utilization >= 95:
            status = "critical"
        elif latest.utilization >= 80 or latest.overflow > 0:
            status = "warning"
        else:
            status = "healthy"
            
        return {
            "status": status,
            "current": latest.to_dict(),
            "peak_utilization_percent": round(self._peak_utilization, 2),
            "peak_overflow": self._peak_overflow
        }
        
    def get_statistics(self) -> Dict[str, Any]:
        """Get comprehensive statistics"""
        if not self._metrics_history:
            return {"status": "no_data"}
            
        # Calculate averages over history
        utilizations = [m.utilization for m in self._metrics_history]
        checked_outs = [m.checked_out for m in self._metrics_history]
        
        avg_query_time = (
            self._total_query_time_ms / self._total_queries
            if self._total_queries > 0 else 0
        )
        
        return {
            "pool_metrics": {
                "average_utilization_percent": round(sum(utilizations) / len(utilizations), 2),
                "max_utilization_percent": round(max(utilizations), 2),
                "min_utilization_percent": round(min(utilizations), 2),
                "average_checked_out": round(sum(checked_outs) / len(checked_outs), 2),
                "samples_count": len(self._metrics_history)
            },
            "query_metrics": {
                "total_queries": self._total_queries,
                "failed_queries": self._failed_queries,
                "success_rate_percent": round(
                    ((self._total_queries - self._failed_queries) / self._total_queries * 100)
                    if self._total_queries > 0 else 100, 2
                ),
                "average_query_time_ms": round(avg_query_time, 2),
                "total_query_time_ms": round(self._total_query_time_ms, 2)
            },
            "alerts": {
                "recent_alerts": list(self._alerts)[-10:],
                "total_alerts": len(self._alerts)
            }
        }
        
    def get_recommendations(self) -> List[str]:
        """Get pool tuning recommendations based on metrics"""
        recommendations = []
        
        if not self._metrics_history:
            recommendations.append("Collect more metrics before making recommendations")
            return recommendations
            
        # Analyze recent metrics (last 100 samples)
        recent = list(self._metrics_history)[-100:]
        avg_utilization = sum(m.utilization for m in recent) / len(recent)
        max_utilization = max(m.utilization for m in recent)
        overflow_count = sum(1 for m in recent if m.overflow > 0)
        
        if avg_utilization > 70:
            recommendations.append(
                f"Average utilization is {avg_utilization:.1f}%. Consider increasing pool_size."
            )
            
        if max_utilization >= 100:
            recommendations.append(
                "Pool reached 100% utilization. Increase pool_size or max_overflow."
            )
            
        if overflow_count > len(recent) * 0.1:  # >10% samples with overflow
            recommendations.append(
                f"Overflow occurred in {overflow_count}/{len(recent)} samples. "
                "Consider increasing pool_size."
            )
            
        if avg_utilization < 20 and len(recent) >= 50:
            recommendations.append(
                f"Average utilization is only {avg_utilization:.1f}%. "
                "Consider decreasing pool_size to save resources."
            )
            
        # Query performance recommendations
        if self._total_queries > 100:
            avg_query_time = self._total_query_time_ms / self._total_queries
            if avg_query_time > 100:
                recommendations.append(
                    f"Average query time is {avg_query_time:.1f}ms. "
                    "Consider query optimization or adding indexes."
                )
                
            error_rate = self._failed_queries / self._total_queries * 100
            if error_rate > 1:
                recommendations.append(
                    f"Query error rate is {error_rate:.1f}%. "
                    "Investigate failed queries."
                )
                
        if not recommendations:
            recommendations.append("Pool configuration looks optimal based on current metrics.")
            
        return recommendations
        
    def get_history(self, minutes: int = 5) -> List[Dict[str, Any]]:
        """Get metrics history for the specified time period"""
        cutoff = time.time() - (minutes * 60)
        return [
            m.to_dict() for m in self._metrics_history
            if m.timestamp >= cutoff
        ]


# Global pool monitor instance
pool_monitor = ConnectionPoolMonitor()


@asynccontextmanager
async def monitored_query(query_identifier: str):
    """
    Context manager to track query execution.
    
    Usage:
        async with monitored_query("get_user_by_id"):
            result = await session.execute(query)
    """
    start_time = time.time()
    success = True
    rows = 0
    
    try:
        yield
    except Exception:
        success = False
        raise
    finally:
        duration_ms = (time.time() - start_time) * 1000
        pool_monitor.record_query(
            query_hash=query_identifier,
            duration_ms=duration_ms,
            success=success,
            rows_affected=rows
        )
