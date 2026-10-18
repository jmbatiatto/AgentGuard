"""Servicio de lógica de negocio y persistencia para Organizaciones (Tenants)."""

from typing import List, Optional
from uuid import UUID
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.organization import Organization
from app.schemas.organization import OrganizationCreate


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


organization_service = OrganizationService()
