"""Servicio de lógica de negocio y persistencia para Usuarios corporativos."""

from typing import List, Optional
from uuid import UUID
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User
from app.schemas.user import UserCreate


class UserService:
    """Gestiona operaciones CRUD sobre la entidad User con aislamiento multi-tenant."""

    @staticmethod
    async def create(db: AsyncSession, user_in: UserCreate) -> User:
        """Crea un nuevo usuario en la base de datos."""
        user = User(
            organization_id=user_in.organization_id,
            email=user_in.email,
            role=user_in.role,
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)
        return user

    @staticmethod
    async def get_by_id(db: AsyncSession, user_id: UUID) -> Optional[User]:
        """Obtiene un usuario por su UUID primario."""
        stmt = select(User).where(User.id == user_id)
        result = await db.execute(stmt)
        return result.scalar_one_or_none()

    @staticmethod
    async def get_by_email(db: AsyncSession, email: str) -> Optional[User]:
        """Obtiene un usuario por su dirección de correo electrónico única."""
        stmt = select(User).where(User.email == email)
        result = await db.execute(stmt)
        return result.scalar_one_or_none()

    @staticmethod
    async def list_by_org(
        db: AsyncSession,
        organization_id: Optional[UUID] = None,
        skip: int = 0,
        limit: int = 100,
    ) -> List[User]:
        """Lista usuarios, con filtro opcional por organización y paginación."""
        stmt = (
            select(User)
            .order_by(User.created_at.desc())
            .offset(skip)
            .limit(limit)
        )
        if organization_id:
            stmt = stmt.where(User.organization_id == organization_id)

        result = await db.execute(stmt)
        return list(result.scalars().all())

    @staticmethod
    async def update(db: AsyncSession, user_id: UUID, role: str) -> Optional[User]:
        """Actualiza el rol asignado a un usuario."""
        user = await UserService.get_by_id(db=db, user_id=user_id)
        if not user:
            return None
        user.role = role
        await db.commit()
        await db.refresh(user)
        return user

    @staticmethod
    async def delete(db: AsyncSession, user_id: UUID) -> bool:
        """Elimina un usuario de la organización."""
        user = await UserService.get_by_id(db=db, user_id=user_id)
        if not user:
            return False
        await db.delete(user)
        await db.commit()
        return True


user_service = UserService()

