"""Router de Operaciones de Demostración y Re-seeding de AgentGuard."""

import logging
import sys
from pathlib import Path
from typing import Dict, Any
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import require_admin_user
from app.core.database import get_db
from app.core.security import create_access_token
from app.models.enums import UserRole
from app.models.organization import Organization
from app.models.user import User
from app.schemas.organization import OrganizationRead
from app.schemas.user import UserRead

# Garantizar resolución confiable de scripts.seed_demo independientemente del CWD de ejecución
_backend_root = Path(__file__).resolve().parent.parent.parent
if str(_backend_root) not in sys.path:
    sys.path.insert(0, str(_backend_root))

from scripts.seed_demo import seed_data

logger = logging.getLogger("agentguard.api.demo")

router = APIRouter(prefix="/demo", tags=["Demo Operations"])


@router.post(
    "/reset",
    status_code=status.HTTP_200_OK,
    summary="Restablecer Datos Semilla de la Demo Oficial",
    description=(
        "Limpia las tablas operativas de la organización Acme Corp y recrea el entorno "
        "con los agentes, herramientas, políticas y trazas iniciales para la presentación."
    ),
)
async def reset_demo_data(
    current_admin: User = Depends(require_admin_user),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """Ejecuta el re-seeding con reset=True únicamente dentro del tenant Acme Corp."""
    is_acme = current_admin.email.lower().endswith("@acmecorp.com")
    if not is_acme and current_admin.organization_id:
        org = await db.get(Organization, current_admin.organization_id)
        if org and org.name == "Acme Corp":
            is_acme = True

    if not is_acme:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acceso denegado: Solo un administrador del entorno Acme Corp puede restablecer los datos demo",
        )
    try:
        seeded_org_id = await seed_data(reset=True)
        resolved_org_id = seeded_org_id or current_admin.organization_id
        payload: Dict[str, Any] = {
            "status": "success",
            "message": "Entorno de demostración restablecido con éxito a su estado inicial.",
            "organization_id": str(resolved_org_id),
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }

        # Re-emitir JWT y sesión para el admin re-sembrado tras regenerar UUIDs en PostgreSQL
        if resolved_org_id is not None:
            admin_result = await db.execute(
                select(User).where(
                    User.organization_id == resolved_org_id,
                    User.email == current_admin.email,
                )
            )
            new_admin = admin_result.scalar_one_or_none()
            if not isinstance(new_admin, User):
                fallback_result = await db.execute(
                    select(User)
                    .where(
                        User.organization_id == resolved_org_id,
                        User.role == UserRole.ADMIN,
                    )
                    .order_by(User.created_at.asc())
                )
                new_admin = fallback_result.scalar_one_or_none()

            org_result = await db.execute(
                select(Organization).where(Organization.id == resolved_org_id)
            )
            new_org = org_result.scalar_one_or_none()

            if (
                isinstance(new_admin, User)
                and getattr(new_admin, "id", None) is not None
                and getattr(new_admin, "created_at", None) is not None
            ):
                payload["access_token"] = create_access_token(
                    data={
                        "sub": str(new_admin.id),
                        "org_id": str(new_admin.organization_id),
                        "role": new_admin.role.value,
                    }
                )
                payload["token_type"] = "bearer"
                payload["user"] = UserRead.model_validate(new_admin).model_dump(mode="json")

            if (
                isinstance(new_org, Organization)
                and getattr(new_org, "id", None) is not None
                and getattr(new_org, "created_at", None) is not None
            ):
                payload["organization"] = OrganizationRead.model_validate(new_org).model_dump(mode="json")

        return payload
    except Exception as exc:
        logger.error("Error al re-sembrar datos de la demo: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Fallo al restablecer datos de la demo: {str(exc)}",
        )
