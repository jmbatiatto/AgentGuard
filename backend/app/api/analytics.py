"""Router de API REST para Consulta de Analítica, KPIs y Series Temporales."""

import logging
from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import require_admin_user
from app.core.database import get_db
from app.models.user import User
from app.schemas.analytics import AnalyticsOverviewResponse, AnalyticsTimeseriesResponse
from app.services.analytics_service import analytics_service
from app.services.organization_service import organization_service

logger = logging.getLogger("agentguard.api.analytics")

router = APIRouter(prefix="/analytics", tags=["Analítica y Métricas (Analytics)"])


def _validate_and_parse_org_id(organization_id: Optional[str]) -> UUID:
    """Valida formato y obligatoriedad del parámetro organization_id."""
    if not organization_id or not str(organization_id).strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El parámetro 'organization_id' es obligatorio y debe ser un UUID v4 válido",
        )
    try:
        return UUID(str(organization_id).strip())
    except (ValueError, AttributeError, TypeError):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Identificador de organización inválido: '{organization_id}'",
        )


async def _verify_tenant_access(
    org_uuid: UUID,
    current_admin: Optional[User],
    db: AsyncSession,
) -> None:
    """Verifica que la organización exista y que el usuario solicitante pertenezca a la misma."""
    if current_admin is not None and current_admin.organization_id != org_uuid:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Organización no encontrada o el usuario no pertenece a la misma",
        )

    org = await organization_service.get_by_id(db=db, org_id=org_uuid)
    if not org:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Organización con ID {org_uuid} no encontrada",
        )


@router.get(
    "/overview",
    response_model=AnalyticsOverviewResponse,
    status_code=status.HTTP_200_OK,
    summary="Resumen Ejecutivo y Métricas KPI",
    description=(
        "Calcula métricas agregadas en tiempo real para las tarjetas KPI del Dashboard: "
        "total de ejecuciones, desglose por decisión (ALLOW, DENY, REQUIRE_APPROVAL), "
        "latencia promedio real y cantidad de incidentes de seguridad activos."
    ),
)
async def get_analytics_overview(
    organization_id: Optional[str] = Query(
        default=None,
        description="Identificador UUID de la organización (tenant isolation)",
    ),
    current_admin: Optional[User] = Depends(require_admin_user),
    db: AsyncSession = Depends(get_db),
) -> AnalyticsOverviewResponse:
    """Retorna KPIs agregados para el tenant especificado."""
    org_uuid = _validate_and_parse_org_id(organization_id)
    await _verify_tenant_access(org_uuid=org_uuid, current_admin=current_admin, db=db)

    return await analytics_service.get_overview(db=db, organization_id=org_uuid)


@router.get(
    "/timeseries",
    response_model=AnalyticsTimeseriesResponse,
    status_code=status.HTTP_200_OK,
    summary="Serie Temporal de Actividad Horaria (24h)",
    description=(
        "Agrupa ejecuciones en buckets horarios dentro de las últimas 24 horas para "
        "alimentar dinámicamente el gráfico de actividad del Dashboard."
    ),
)
async def get_analytics_timeseries(
    organization_id: Optional[str] = Query(
        default=None,
        description="Identificador UUID de la organización (tenant isolation)",
    ),
    range: str = Query(
        default="24h",
        description="Ventana temporal para la serie (default: '24h')",
    ),
    current_admin: Optional[User] = Depends(require_admin_user),
    db: AsyncSession = Depends(get_db),
) -> AnalyticsTimeseriesResponse:
    """Retorna serie temporal horaria con 24 puntos cronológicos continuos."""
    org_uuid = _validate_and_parse_org_id(organization_id)
    await _verify_tenant_access(org_uuid=org_uuid, current_admin=current_admin, db=db)

    return await analytics_service.get_timeseries(
        db=db,
        organization_id=org_uuid,
        range_str=range,
    )
