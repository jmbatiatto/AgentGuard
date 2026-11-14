"""Dependencias de Seguridad, Aislamiento Multi-Tenant y Blindaje Anti-IA."""

from typing import Optional
from uuid import UUID
from fastapi import Depends, Header, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import decode_access_token
from app.models.enums import UserRole
from app.models.user import User

bearer_scheme = HTTPBearer(auto_error=False)


async def get_current_user(
    x_agent_id: Optional[UUID] = Header(default=None, alias="X-Agent-Id"),
    auth_credentials: Optional[HTTPAuthorizationCredentials] = Depends(bearer_scheme),
    authorization: Optional[str] = Header(default=None, alias="Authorization"),
    db: AsyncSession = Depends(get_db),
) -> User:
    """Extrae y valida el token Bearer JWT, rechazando agentes de IA y retornando el usuario autenticado.

    1. Si se envía X-Agent-Id -> Bloqueo inmediato (403 Forbidden).
    2. Obtiene el token desde HTTPAuthorizationCredentials o la cabecera Authorization.
    3. Decodifica y valida el JWT con settings.SECRET_KEY y ALGORITHM.
    4. Comprueba que el usuario exista en la base de datos.
    """
    if x_agent_id is not None:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="AI Agents are not permitted to manage governance policies or rules",
        )

    token = None
    if auth_credentials:
        token = auth_credentials.credentials
    elif authorization:
        parts = authorization.split()
        if len(parts) == 2 and parts[0].lower() == "bearer":
            token = parts[1]
        elif len(parts) == 1:
            token = parts[0]

    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales de autenticación no proporcionadas o formato inválido",
            headers={"WWW-Authenticate": "Bearer"},
        )

    payload = decode_access_token(token)
    if not payload or not payload.get("sub"):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token de acceso inválido, expirado o malformado",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user_id_str = payload.get("sub")
    try:
        user_id = UUID(str(user_id_str))
    except (ValueError, TypeError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="El identificador de usuario en el token es inválido",
            headers={"WWW-Authenticate": "Bearer"},
        )

    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuario asociado al token no encontrado en el sistema",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return user


async def require_admin_user(
    x_agent_id: Optional[UUID] = Header(default=None, alias="X-Agent-Id"),
    current_user: User = Depends(get_current_user),
) -> User:
    """Verifica que el solicitante sea un administrador humano autenticado por JWT y bloquea agentes de IA.

    1. Si se envía X-Agent-Id -> Bloqueo inmediato (403 Forbidden).
    2. Valida token Bearer via get_current_user (401 si falta o es inválido).
    3. Exige role == UserRole.ADMIN (403 Forbidden si tiene otro rol).
    """
    if x_agent_id is not None:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="AI Agents are not permitted to manage governance policies or rules",
        )

    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Acceso denegado: El usuario con rol '{current_user.role.value}' no tiene privilegios de ADMIN para esta operación",
        )

    return current_user


def require_roles(*allowed_roles: UserRole):
    """Genera una dependencia FastAPI fail-closed que exige JWT humano y uno de los roles permitidos."""

    async def _role_guard(
        x_agent_id: Optional[UUID] = Header(default=None, alias="X-Agent-Id"),
        current_user: User = Depends(get_current_user),
    ) -> User:
        if x_agent_id is not None:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="AI Agents are not permitted to manage governance policies or rules",
            )

        if current_user.role not in allowed_roles:
            allowed_names = ", ".join(r.value for r in allowed_roles)
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=(
                    f"Acceso denegado: El rol '{current_user.role.value}' no está autorizado "
                    f"para esta operación (requiere: {allowed_names})"
                ),
            )

        return current_user

    return _role_guard
