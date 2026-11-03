from typing import Any, Dict, List, Optional
from uuid import UUID
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm.attributes import flag_modified

from app.models.enums import ActorType
from app.models.organization import Organization
from app.schemas.organization import (
    OrganizationCreate,
    OrganizationSettings,
    OrganizationSettingsUpdate,
)
from app.services.audit_service import audit_service

DEFAULT_ORGANIZATION_SETTINGS: Dict[str, Any] = {
    "fail_closed": True,
    "mask_sensitive": True,
    "max_autonomous_amount": 5000.0,
    "retention_days": 90,
}


class OrganizationService:
    """Gestiona operaciones CRUD sobre la entidad Organization."""

    @staticmethod
    async def create(db: AsyncSession, org_in: OrganizationCreate) -> Organization:
        """Crea una nueva organización en la base de datos."""
        org = Organization(name=org_in.name)
        db.add(org)
        await db.commit()
        await db.refresh(org)
        return org

    @staticmethod
    async def get_by_id(db: AsyncSession, org_id: UUID) -> Optional[Organization]:
        """Obtiene una organización por su UUID primario."""
        stmt = select(Organization).where(Organization.id == org_id)
        result = await db.execute(stmt)
        return result.scalar_one_or_none()

    @staticmethod
    async def list_all(
        db: AsyncSession,
        skip: int = 0,
        limit: int = 100,
    ) -> List[Organization]:
        """Lista organizaciones con paginación ordenada por fecha de creación descendente."""
        stmt = (
            select(Organization)
            .order_by(Organization.created_at.desc())
            .offset(skip)
            .limit(limit)
        )
        result = await db.execute(stmt)
        return list(result.scalars().all())

    @staticmethod
    async def get_settings(db: AsyncSession, org_id: UUID) -> Optional[OrganizationSettings]:
        """Obtiene la configuración de gobernanza del tenant con fallbacks seguros."""
        org = await OrganizationService.get_by_id(db=db, org_id=org_id)
        if not org:
            return None

        merged = dict(DEFAULT_ORGANIZATION_SETTINGS)
        if org.settings:
            merged.update(org.settings)

        return OrganizationSettings(**merged)

    @staticmethod
    async def update_settings(
        db: AsyncSession,
        org_id: UUID,
        update_data: OrganizationSettingsUpdate,
        actor_id: Optional[UUID] = None,
        actor_type: Optional[ActorType] = None,
    ) -> Optional[OrganizationSettings]:
        """Actualiza parcialmente las políticas de gobernanza, persiste en JSONB y emite auditoría forense."""
        org = await OrganizationService.get_by_id(db=db, org_id=org_id)
        if not org:
            return None

        updates = update_data.model_dump(exclude_unset=True)
        valid_updates = {k: v for k, v in updates.items() if v is not None}

        current = dict(org.settings or {})
        current.update(valid_updates)

        org.settings = current
        flag_modified(org, "settings")

        await db.commit()
        await db.refresh(org)

        # Registro inmutable de auditoría forense
        audit_actor_id = actor_id or org.id
        audit_actor_type = actor_type or (ActorType.USER if actor_id else ActorType.SYSTEM)

        await audit_service.log_audit_event(
            db=db,
            organization_id=org.id,
            actor_type=audit_actor_type,
            actor_id=audit_actor_id,
            event_type="ORGANIZATION_SETTINGS_UPDATED",
            metadata={
                "updated_fields": valid_updates,
                "new_settings": current,
            },
            description=f"Configuración de gobernanza actualizada para la organización {org.name}",
        )

        merged = dict(DEFAULT_ORGANIZATION_SETTINGS)
        merged.update(current)
        return OrganizationSettings(**merged)


organization_service = OrganizationService()
