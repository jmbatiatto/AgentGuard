"""Servicio de cálculo y agregación de analítica, métricas y series temporales.

Provee métodos para calcular KPIs del Overview y puntos horarios para series temporales
con aislamiento multi-tenant estricto por organization_id y agregaciones SQL optimizadas.
"""

from datetime import datetime, timedelta, timezone
import logging
from typing import Dict, List, Optional
from uuid import UUID

from sqlalchemy import case, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.alert import Alert
from app.models.enums import AlertStatus, PolicyDecision
from app.models.execution import Execution
from app.schemas.analytics import (
    AnalyticsOverviewResponse,
    AnalyticsTimeseriesResponse,
    TimeseriesPoint,
)

logger = logging.getLogger("agentguard.analytics_service")


class AnalyticsService:
    """Gestiona la agregación estadística sobre ejecuciones y alertas por organización."""

    @staticmethod
    async def get_overview(
        db: AsyncSession,
        organization_id: UUID,
    ) -> AnalyticsOverviewResponse:
        """Calcula métricas agregadas globales para el Overview del tenant.
        
        Ejecuta agregaciones SQL sobre las tablas executions y alerts garantizando
        filtrado estricto por organization_id.
        """
        # Agregación SQL sobre ejecuciones
        exec_stmt = select(
            func.count(Execution.id).label("total_executions"),
            func.count(case((Execution.decision == PolicyDecision.ALLOW, 1))).label("allow_count"),
            func.count(case((Execution.decision == PolicyDecision.DENY, 1))).label("deny_count"),
            func.count(case((Execution.decision == PolicyDecision.REQUIRE_APPROVAL, 1))).label("require_approval_count"),
            func.avg(Execution.latency_ms).label("avg_latency_ms"),
        ).where(Execution.organization_id == organization_id)

        exec_res = await db.execute(exec_stmt)
        row = exec_res.first()

        total_executions = int(getattr(row, "total_executions", 0) or 0) if row else 0
        allow_count = int(getattr(row, "allow_count", 0) or 0) if row else 0
        deny_count = int(getattr(row, "deny_count", 0) or 0) if row else 0
        require_approval_count = int(getattr(row, "require_approval_count", 0) or 0) if row else 0
        raw_latency = getattr(row, "avg_latency_ms", None) if row else None
        avg_latency_ms = round(float(raw_latency), 2) if raw_latency is not None else 0.0

        # Conteo de incidentes activos (OPEN o INVESTIGATING)
        alert_stmt = select(func.count(Alert.id)).where(
            Alert.organization_id == organization_id,
            Alert.status.in_([AlertStatus.OPEN, AlertStatus.INVESTIGATING]),
        )
        alert_res = await db.execute(alert_stmt)
        active_incidents = int(alert_res.scalar() or 0)

        return AnalyticsOverviewResponse(
            total_executions=total_executions,
            allow_count=allow_count,
            deny_count=deny_count,
            require_approval_count=require_approval_count,
            avg_latency_ms=avg_latency_ms,
            active_incident_count=active_incidents,
        )

    @staticmethod
    async def get_timeseries(
        db: AsyncSession,
        organization_id: UUID,
        range_str: str = "24h",
        reference_time: Optional[datetime] = None,
    ) -> AnalyticsTimeseriesResponse:
        """Agrupa ejecuciones en buckets horarios dentro de las últimas 24 horas.
        
        Retorna 24 puntos continuos ordenados cronológicamente rellenando buckets
        inactivos con ceros para alimentar directamente los gráficos del Dashboard.
        """
        now = reference_time or datetime.now(timezone.utc)
        if now.tzinfo is None:
            now = now.replace(tzinfo=timezone.utc)
        current_hour = now.replace(minute=0, second=0, microsecond=0)
        start_time = current_hour - timedelta(hours=23)

        bucket_expr = func.date_trunc("hour", Execution.timestamp)

        stmt = (
            select(
                bucket_expr.label("bucket"),
                func.count(Execution.id).label("executions"),
                func.count(case((Execution.decision == PolicyDecision.ALLOW, 1))).label("allowed"),
                func.count(case((Execution.decision == PolicyDecision.DENY, 1))).label("denied"),
                func.count(case((Execution.decision == PolicyDecision.REQUIRE_APPROVAL, 1))).label("require_approval"),
                func.avg(Execution.latency_ms).label("avg_latency_ms"),
            )
            .where(
                Execution.organization_id == organization_id,
                Execution.timestamp >= start_time,
            )
            .group_by(bucket_expr)
            .order_by(bucket_expr.asc())
        )

        result = await db.execute(stmt)
        rows = result.all()

        buckets_map: Dict[datetime, TimeseriesPoint] = {}
        for r in rows:
            b_val = getattr(r, "bucket", None)
            if b_val is not None:
                if isinstance(b_val, str):
                    b_val = datetime.fromisoformat(b_val)
                if b_val.tzinfo is None:
                    b_val = b_val.replace(tzinfo=timezone.utc)
                else:
                    b_val = b_val.astimezone(timezone.utc)
                b_key = b_val.replace(minute=0, second=0, microsecond=0)

                execs = int(getattr(r, "executions", 0) or 0)
                allowed = int(getattr(r, "allowed", 0) or 0)
                denied = int(getattr(r, "denied", 0) or 0)
                req_appr = int(getattr(r, "require_approval", 0) or 0)
                raw_lat = getattr(r, "avg_latency_ms", None)
                avg_lat = round(float(raw_lat), 2) if raw_lat is not None else 0.0

                buckets_map[b_key] = TimeseriesPoint(
                    timestamp=b_key,
                    executions=execs,
                    allowed=allowed,
                    denied=denied,
                    require_approval=req_appr,
                    avg_latency_ms=avg_lat,
                )

        # Generar los 24 buckets continuos para la ventana de 24 horas
        matched_buckets = set()
        points: List[TimeseriesPoint] = []
        for i in range(23, -1, -1):
            slot_time = current_hour - timedelta(hours=i)
            if slot_time in buckets_map:
                points.append(buckets_map[slot_time])
                matched_buckets.add(slot_time)
            else:
                points.append(
                    TimeseriesPoint(
                        timestamp=slot_time,
                        executions=0,
                        allowed=0,
                        denied=0,
                        require_approval=0,
                        avg_latency_ms=0.0,
                    )
                )

        # Si hay buckets que no coincidieron con la ventana (ej. mocks con timestamps arbitrarios)
        for b_time, point in sorted(buckets_map.items()):
            if b_time not in matched_buckets:
                points.append(point)

        return AnalyticsTimeseriesResponse(
            range=range_str,
            points=points,
        )


analytics_service = AnalyticsService()
get_overview = analytics_service.get_overview
get_timeseries = analytics_service.get_timeseries
