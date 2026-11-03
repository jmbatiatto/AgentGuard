"""Esquemas Pydantic v2 para Métricas, KPIs de Analítica y Series Temporales."""

from datetime import datetime
from typing import List
from pydantic import Field

from app.schemas.base import BaseSchema


class AnalyticsOverviewResponse(BaseSchema):
    """Métricas globales agregadas para el resumen ejecutivo y tarjetas KPI del Dashboard."""

    total_executions: int = Field(
        default=0,
        ge=0,
        description="Cantidad total de ejecuciones interceptadas por el Gateway para el tenant",
    )
    allow_count: int = Field(
        default=0,
        ge=0,
        description="Cantidad de acciones autorizadas directamente (efecto ALLOW)",
    )
    deny_count: int = Field(
        default=0,
        ge=0,
        description="Cantidad de acciones bloqueadas o denegadas por políticas (efecto DENY)",
    )
    require_approval_count: int = Field(
        default=0,
        ge=0,
        description="Cantidad de acciones suspendidas esperando aprobación humana (HITL)",
    )
    avg_latency_ms: float = Field(
        default=0.0,
        ge=0.0,
        description="Latencia promedio real transcurrida de evaluación PEP/PDP en milisegundos",
    )
    active_incident_count: int = Field(
        default=0,
        ge=0,
        description="Cantidad de incidentes de seguridad activos en estado OPEN o INVESTIGATING",
    )


class TimeseriesPoint(BaseSchema):
    """Punto temporal discreto de agregación horaria para gráficos de actividad."""

    timestamp: datetime = Field(
        ...,
        description="Marca temporal UTC que delimita el inicio del bucket horario",
    )
    executions: int = Field(
        default=0,
        ge=0,
        description="Total de ejecuciones registradas dentro de este bucket horario",
    )
    allowed: int = Field(
        default=0,
        ge=0,
        description="Acciones autorizadas (ALLOW) dentro de este bucket horario",
    )
    denied: int = Field(
        default=0,
        ge=0,
        description="Acciones denegadas o bloqueadas (DENY) dentro de este bucket horario",
    )
    require_approval: int = Field(
        default=0,
        ge=0,
        description="Acciones que requirieron aprobación humana dentro de este bucket horario",
    )
    avg_latency_ms: float = Field(
        default=0.0,
        ge=0.0,
        description="Latencia promedio en ms de las ejecuciones dentro de este bucket",
    )


class AnalyticsTimeseriesResponse(BaseSchema):
    """Respuesta estructurada para la serie temporal del gráfico de actividad del Dashboard."""

    range: str = Field(
        default="24h",
        description="Ventana temporal cubierta por la serie (ej. '24h')",
    )
    points: List[TimeseriesPoint] = Field(
        default_factory=list,
        description="Listado cronológico de puntos horarios agregados (24 buckets continuos)",
    )
