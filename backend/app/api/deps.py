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
    auth_credentials: Optional[HTTPAuthorizationCredentials] = Depends(bearer_scheme),
    authorization: Optional[str] = Header(default=None, alias="Authorization"),
    db: AsyncSession = Depends(get_db),
) -> User:
    """Extrae y valida el token Bearer JWT, retornando el usuario autenticado.

    1. Obtiene el token desde HTTPAuthorizationCredentials o la cabecera Authorization.
    2. Decodifica y valida el JWT con SECRET_KEY y ALGORITHM.
    3. Comprueba que el usuario exista en la base de datos.
    """
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
    x_user_id: Optional[UUID] = Header(default=None, alias="X-User-Id"),
    auth_credentials: Optional[HTTPAuthorizationCredentials] = Depends(bearer_scheme),
    authorization: Optional[str] = Header(default=None, alias="Authorization"),
    db: AsyncSession = Depends(get_db),
) -> Optional[User]:
    """Verifica que el solicitante sea un administrador humano y bloquea agentes de IA.

    1. Si se envía X-Agent-Id -> Bloqueo inmediato (403 Forbidden).
    2. Si se envía X-User-Id -> Debe existir y tener role == UserRole.ADMIN.
    3. Si no se envía X-User-Id pero se envía Authorization Bearer -> valida token y exige role == UserRole.ADMIN.
    4. Si no se envía ninguno -> retorna None.
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

    # 3. Si se proporciona token Bearer via Authorization
    token = None
    if auth_credentials:
        token = auth_credentials.credentials
    elif authorization:
        parts = authorization.split()
        if len(parts) == 2 and parts[0].lower() == "bearer":
            token = parts[1]

    if token:
        payload = decode_access_token(token)
        if not payload or not payload.get("sub"):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token de acceso inválido, expirado o malformado",
                headers={"WWW-Authenticate": "Bearer"},
            )
        try:
            user_id = UUID(str(payload.get("sub")))
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
                detail="Usuario no encontrado en el sistema",
            )
        if user.role != UserRole.ADMIN:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Acceso denegado: El usuario con rol '{user.role}' no tiene privilegios de ADMIN para gestionar reglas.",
            )
        return user

    return None
