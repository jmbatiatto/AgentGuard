"""Router de API REST para la gestión de Organizaciones (Tenants) y Webhooks SIEM."""

from typing import List, Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import require_admin_user
from app.core.database import get_db
from app.models.enums import ActorType
from app.models.user import User
from app.schemas.organization import (
    OrganizationCreate,
    OrganizationRead,
    OrganizationSettings,
    OrganizationSettingsUpdate,
    SiemWebhookTestRequest,
    SiemWebhookTestResponse,
)
from app.services.organization_service import organization_service
from app.services.webhook_service import webhook_service

router = APIRouter(prefix="/organizations", tags=["Organizations"])


@router.post(
    "",
    response_model=OrganizationRead,
    status_code=status.HTTP_201_CREATED,
    summary="Crear Organización (Tenant)",
    description="Da de alta una nueva organización corporativa. Es la entidad raíz de aislamiento multi-tenant.",
)
async def create_organization(
    org_in: OrganizationCreate,
    db: AsyncSession = Depends(get_db),
) -> OrganizationRead:
    """Crea un nuevo tenant y lo persiste en la base de datos."""
    org = await organization_service.create(db=db, org_in=org_in)
    return org


@router.get(
    "",
    response_model=List[OrganizationRead],
    status_code=status.HTTP_200_OK,
    summary="Listar Organizaciones",
    description="Obtiene el listado paginado de todas las organizaciones registradas.",
)
async def list_organizations(
    skip: int = Query(
        default=0,
        ge=0,
        description="Número de registros a omitir para paginación",
    ),
    limit: int = Query(
        default=100,
        ge=1,
        le=500,
        description="Límite máximo de registros por página",
    ),
    db: AsyncSession = Depends(get_db),
) -> List[OrganizationRead]:
    """Retorna las organizaciones con paginación."""
    return await organization_service.list_all(db=db, skip=skip, limit=limit)


@router.get(
    "/{org_id}",
    response_model=OrganizationRead,
    status_code=status.HTTP_200_OK,
    summary="Obtener Organización por ID",
    description="Busca y retorna los detalles de una organización específica mediante su UUID.",
)
async def get_organization(
    org_id: UUID,
    db: AsyncSession = Depends(get_db),
) -> OrganizationRead:
    """Retorna una organización específica o 404 si no existe."""
    org = await organization_service.get_by_id(db=db, org_id=org_id)
    if not org:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Organización con ID {org_id} no encontrada",
        )
    return org


@router.get(
    "/{org_id}/settings",
    response_model=OrganizationSettings,
    status_code=status.HTTP_200_OK,
    summary="Obtener Configuración de Gobernanza de la Organización",
    description="Retorna la configuración de gobernanza, postura Fail-Closed y parámetros de retención del tenant.",
)
async def get_organization_settings(
    org_id: UUID,
    current_admin: Optional[User] = Depends(require_admin_user),
    db: AsyncSession = Depends(get_db),
) -> OrganizationSettings:
    """Retorna la configuración de gobernanza o 404 si la organización no existe."""
    if current_admin and current_admin.organization_id != org_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tiene autorización para consultar la configuración de otra organización",
        )
    settings = await organization_service.get_settings(db=db, org_id=org_id)
    if settings is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Organización con ID {org_id} no encontrada",
        )
    return settings


@router.patch(
    "/{org_id}/settings",
    response_model=OrganizationSettings,
    status_code=status.HTTP_200_OK,
    summary="Actualizar Configuración de Gobernanza de la Organización",
    description="Actualiza parcialmente la configuración de gobernanza y emite evento de auditoría forense.",
)
async def update_organization_settings(
    org_id: UUID,
    settings_in: OrganizationSettingsUpdate,
    current_admin: Optional[User] = Depends(require_admin_user),
    db: AsyncSession = Depends(get_db),
) -> OrganizationSettings:
    """Actualiza la configuración de gobernanza del tenant."""
    if current_admin and current_admin.organization_id != org_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tiene autorización para modificar la configuración de otra organización",
        )

    actor_id = current_admin.id if current_admin else None
    actor_type = ActorType.USER if current_admin else None

    updated = await organization_service.update_settings(
        db=db,
        org_id=org_id,
        update_data=settings_in,
        actor_id=actor_id,
        actor_type=actor_type,
    )
    if updated is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Organización con ID {org_id} no encontrada",
        )
    return updated


@router.post(
    "/{org_id}/settings/webhooks/test",
    response_model=SiemWebhookTestResponse,
    status_code=status.HTTP_200_OK,
    summary="Probar Conectividad de Webhook SIEM",
    description="Envía un evento de prueba ping firmado criptográficamente hacia el endpoint SIEM configurado.",
)
async def test_organization_siem_webhook(
    org_id: UUID,
    payload: Optional[SiemWebhookTestRequest] = None,
    current_admin: Optional[User] = Depends(require_admin_user),
    db: AsyncSession = Depends(get_db),
) -> SiemWebhookTestResponse:
    """Verifica la conectividad y recepción de eventos con el servidor SIEM."""
    if current_admin and current_admin.organization_id != org_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tiene autorización para probar la integración SIEM de otra organización",
        )

    current_settings = await organization_service.get_settings(db=db, org_id=org_id)
    if current_settings is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Organización con ID {org_id} no encontrada",
        )

    target_url = (payload.webhook_url if payload and payload.webhook_url else current_settings.siem_webhook_url)
    if not target_url:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No se proporcionó una URL de webhook ni existe una configurada para esta organización",
        )

    secret = (payload.secret if payload and payload.secret is not None else current_settings.siem_webhook_secret)

    result = await webhook_service.test_webhook(
        organization_id=org_id,
        url=target_url,
        secret=secret,
    )
    return result
