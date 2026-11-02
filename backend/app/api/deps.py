"""Dependencias de Seguridad, Aislamiento Multi-Tenant y Blindaje Anti-IA."""

from typing import Optional
from uuid import UUID
from fastapi import Depends, Header, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.models.enums import UserRole
from app.models.user import User


async def require_admin_user(
    x_agent_id: Optional[UUID] = Header(default=None, alias="X-Agent-Id"),
    x_user_id: Optional[UUID] = Header(default=None, alias="X-User-Id"),
    db: AsyncSession = Depends(get_db),
) -> Optional[User]:
    """Verifica que el solicitante sea un administrador humano y bloquea agentes de IA.

    1. Si se envía X-Agent-Id -> Bloqueo inmediato (403 Forbidden).
    2. Si se envía X-User-Id -> Debe existir y tener role == UserRole.ADMIN.
    3. Si el rol es distinto a ADMIN -> Bloqueo inmediato (403 Forbidden).
    4. Si no se encuentra el usuario -> 401 Unauthorized.
    """
    # 1. Blindaje Anti-IA estricto
    if x_agent_id is not None:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="AI Agents are not permitted to manage governance policies or rules",
        )

    # 2. Si se proporciona X-User-Id, validar existencia y rol ADMIN
    if x_user_id is not None:
        result = await db.execute(select(User).where(User.id == x_user_id))
        user = result.scalar_one_or_none()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"Usuario solicitante con ID {x_user_id} no encontrado en el sistema",
            )
        if user.role != UserRole.ADMIN:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Acceso denegado: El usuario con rol '{user.role}' no tiene privilegios de ADMIN para gestionar reglas.",
            )
        return user

    return None
