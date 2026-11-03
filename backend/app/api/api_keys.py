"""Router de API REST para la gestión de API Keys PEP del Control Plane.

Provee:
- POST /api/v1/api-keys: Emisión de nuevas llaves con retorno único de secreto en plano.
- GET /api/v1/api-keys: Listado de llaves por tenant (solo metadatos seguros).
- GET /api/v1/api-keys/{id}: Consulta de metadatos de llave individual.
- DELETE /api/v1/api-keys/{id}: Revocación lógica (is_active = False).

Blindaje de Seguridad:
- Control Plane: Blindado contra agentes de IA mediante require_admin_user (403 si X-Agent-Id).
- Multi-tenancy: Aislamiento estricto por organization_id y prevención de IDOR.
"""

from typing import Any, Dict, List, Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import require_admin_user
from app.core.database import get_db
from app.models.enums import ActorType
from app.models.user import User
from app.schemas.api_key import ApiKeyCreate, ApiKeyCreatedResponse, ApiKeyResponse
from app.services.api_key_service import api_key_service
from app.services.audit_service import audit_service
from app.services.organization_service import organization_service

router = APIRouter(prefix="/api-keys", tags=["API Keys"])


@router.post(
    "",
    response_model=ApiKeyCreatedResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Crear API Key",
    description=(
        "Genera una nueva API Key corporativa para autenticación PEP. "
        "El secreto en texto plano se retorna UNA ÚNICA VEZ en esta respuesta."
    ),
)
async def create_api_key(
    key_in: ApiKeyCreate,
    current_admin: Optional[User] = Depends(require_admin_user),
    db: AsyncSession = Depends(get_db),
) -> ApiKeyCreatedResponse:
    """Crea una API Key validando existencia del tenant y rol administrativo."""
    org = await organization_service.get_by_id(db=db, org_id=key_in.organization_id)
    if not org:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Organización con ID {key_in.organization_id} no encontrada",
        )

    if current_admin and current_admin.organization_id != key_in.organization_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tiene autorización para crear API Keys para otra organización",
        )

    api_key, raw_key = await api_key_service.create_api_key(
        db=db,
        org_id=key_in.organization_id,
        name=key_in.name,
        expires_in_days=key_in.expires_in_days,
    )

    actor_id = current_admin.id if current_admin else api_key.organization_id
    actor_type = ActorType.USER if current_admin else ActorType.SYSTEM

    await audit_service.log_audit_event(
        db=db,
        organization_id=api_key.organization_id,
        actor_type=actor_type,
        actor_id=actor_id,
        event_type="API_KEY_CREATED",
        metadata={
            "api_key_id": str(api_key.id),
            "name": api_key.name,
            "key_prefix": api_key.key_prefix,
        },
        description=f"API Key '{api_key.name}' ({api_key.key_prefix}...) generada",
    )

    return ApiKeyCreatedResponse(
        id=api_key.id,
        organization_id=api_key.organization_id,
        name=api_key.name,
        key_prefix=api_key.key_prefix,
        created_at=api_key.created_at,
        expires_at=api_key.expires_at,
        is_active=api_key.is_active,
        api_key=raw_key,
    )


@router.get(
    "",
    response_model=List[ApiKeyResponse],
    status_code=status.HTTP_200_OK,
    summary="Listar API Keys",
    description="Retorna el listado de API Keys registradas filtradas por organización.",
)
async def list_api_keys(
    organization_id: Optional[UUID] = Query(
        default=None,
        description="Filtrar por ID de la organización",
    ),
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
    current_admin: Optional[User] = Depends(require_admin_user),
    db: AsyncSession = Depends(get_db),
) -> List[ApiKeyResponse]:
    """Lista las API Keys sin revelar hashes ni secretos."""
    if current_admin:
        if organization_id and organization_id != current_admin.organization_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No tiene permisos para ver API Keys de otra organización",
            )
        target_org = organization_id or current_admin.organization_id
    else:
        target_org = organization_id

    keys = await api_key_service.list_api_keys(
        db=db,
        org_id=target_org,
        skip=skip,
        limit=limit,
    )
    return [ApiKeyResponse.model_validate(k) for k in keys]


@router.get(
    "/{key_id}",
    response_model=ApiKeyResponse,
    status_code=status.HTTP_200_OK,
    summary="Obtener API Key por ID",
    description="Recupera los metadatos seguros de una API Key específica.",
)
async def get_api_key(
    key_id: UUID,
    organization_id: Optional[UUID] = Query(
        default=None,
        description="ID de la organización para validación multi-tenant",
    ),
    current_admin: Optional[User] = Depends(require_admin_user),
    db: AsyncSession = Depends(get_db),
) -> ApiKeyResponse:
    """Retorna una API Key por ID asegurando aislamiento de tenant."""
    if current_admin:
        if organization_id and organization_id != current_admin.organization_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No tiene permisos para consultar API Keys de otra organización",
            )
        target_org = current_admin.organization_id
    else:
        target_org = organization_id

    api_key = await api_key_service.get_api_key(db=db, key_id=key_id, org_id=target_org)
    if not api_key:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"API Key con ID {key_id} no encontrada",
        )

    return ApiKeyResponse.model_validate(api_key)


@router.delete(
    "/{key_id}",
    status_code=status.HTTP_200_OK,
    summary="Revocar API Key",
    description="Revoca de forma lógica una API Key marcándola como inactiva (is_active = False).",
)
async def revoke_api_key(
    key_id: UUID,
    organization_id: Optional[UUID] = Query(
        default=None,
        description="ID de la organización para validación multi-tenant",
    ),
    current_admin: Optional[User] = Depends(require_admin_user),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """Revoca una API Key validando propiedad y permisos."""
    if current_admin:
        if organization_id and organization_id != current_admin.organization_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No tiene permisos para revocar API Keys de otra organización",
            )
        target_org = current_admin.organization_id
    else:
        target_org = organization_id

    api_key = await api_key_service.get_api_key(db=db, key_id=key_id, org_id=target_org)
    if not api_key:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"API Key con ID {key_id} no encontrada",
        )

    revoked = await api_key_service.revoke_api_key(db=db, key_id=key_id, org_id=target_org)
    if not revoked:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"API Key con ID {key_id} no pudo ser revocada",
        )

    actor_id = current_admin.id if current_admin else api_key.organization_id
    actor_type = ActorType.USER if current_admin else ActorType.SYSTEM

    await audit_service.log_audit_event(
        db=db,
        organization_id=api_key.organization_id,
        actor_type=actor_type,
        actor_id=actor_id,
        event_type="API_KEY_REVOKED",
        metadata={
            "api_key_id": str(api_key.id),
            "name": api_key.name,
            "key_prefix": api_key.key_prefix,
        },
        description=f"API Key '{api_key.name}' ({api_key.key_prefix}...) revocada",
    )

    return {
        "message": "API Key revocada exitosamente",
        "id": str(key_id),
        "is_active": False,
    }
