"""Servicio de lógica de negocio y persistencia para Contenedores de Políticas (Policies)."""

from typing import List, Optional
from uuid import UUID
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.policy import Policy
from app.schemas.policy import PolicyCreate


class PolicyService:
    """Gestiona operaciones CRUD sobre la entidad Policy con aislamiento multi-tenant."""

    @staticmethod
    async def create(db: AsyncSession, policy_in: PolicyCreate) -> Policy:
        """Crea un nuevo contenedor de políticas en la base de datos."""
        policy = Policy(
            organization_id=policy_in.organization_id,
            name=policy_in.name,
            description=policy_in.description,
            priority=policy_in.priority,
            is_active=policy_in.is_active,
        )
        db.add(policy)
        await db.commit()
        await db.refresh(policy)
        return policy

    @staticmethod
    async def get_by_id(db: AsyncSession, policy_id: UUID) -> Optional[Policy]:
        """Obtiene un contenedor de política por su UUID primario."""
        stmt = select(Policy).where(Policy.id == policy_id)
        result = await db.execute(stmt)
        return result.scalar_one_or_none()

    @staticmethod
    async def list_by_org(
        db: AsyncSession,
        organization_id: Optional[UUID] = None,
        skip: int = 0,
        limit: int = 100,
    ) -> List[Policy]:
        """Lista políticas ordenadas por prioridad descendente con paginación y filtro por tenant."""
        stmt = (
            select(Policy)
            .order_by(Policy.priority.desc(), Policy.created_at.desc())
            .offset(skip)
            .limit(limit)
        )
        if organization_id:
            stmt = stmt.where(Policy.organization_id == organization_id)

        result = await db.execute(stmt)
        return list(result.scalars().all())


policy_service = PolicyService()
