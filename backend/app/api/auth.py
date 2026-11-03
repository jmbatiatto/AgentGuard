"""Router de API REST para Autenticación, Registro y Perfil de Usuario."""

import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.core.database import get_db
from app.core.security import (
    create_access_token,
    get_password_hash,
    verify_password,
)
from app.models.enums import UserRole
from app.models.organization import Organization
from app.models.user import User
from app.schemas.auth import (
    LoginRequest,
    RegisterRequest,
    TokenResponse,
    UserMeResponse,
)
from app.schemas.user import UserRead

router = APIRouter(prefix="/auth", tags=["Autenticación"])


@router.post(
    "/login",
    response_model=TokenResponse,
    status_code=status.HTTP_200_OK,
    summary="Iniciar Sesión",
    description="Autentica un usuario corporativo mediante email y contraseña, retornando un token JWT.",
)
async def login(
    credentials: LoginRequest,
    db: AsyncSession = Depends(get_db),
) -> TokenResponse:
    """Busca al usuario por email, valida la contraseña y emite el JWT."""
    result = await db.execute(select(User).where(User.email == credentials.email))
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales de acceso incorrectas o usuario no encontrado",
        )

    # Si el usuario proviene de datos semilla o migraciones sin hash de password
    if user.hashed_password is None:
        if credentials.password in ("admin123", "demo123"):
            user.hashed_password = get_password_hash(credentials.password)
            await db.commit()
            await db.refresh(user)
        else:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Credenciales de acceso incorrectas",
            )
    else:
        if not verify_password(credentials.password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Credenciales de acceso incorrectas",
            )

    token_claims = {
        "sub": str(user.id),
        "org_id": str(user.organization_id),
        "role": user.role.value,
    }
    access_token = create_access_token(data=token_claims)

    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user=UserRead.model_validate(user),
    )


@router.post(
    "/register",
    response_model=TokenResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Registro de Nuevo Usuario Administrador",
    description="Crea una nueva organización o asigna a tenant, registrando al usuario con rol ADMIN.",
)
async def register(
    register_data: RegisterRequest,
    db: AsyncSession = Depends(get_db),
) -> TokenResponse:
    """Registra una nueva cuenta y organización corporativa, emitiendo un token JWT."""
    # 1. Validar unicidad de correo
    existing = await db.execute(select(User).where(User.email == register_data.email))
    if existing.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El correo electrónico ya se encuentra registrado",
        )

    # 2. Asignar o crear la organización
    org_name = register_data.organization_name or f"Org {register_data.name}"
    org = Organization(
        id=uuid.uuid4(),
        name=org_name,
        created_at=datetime.now(timezone.utc),
    )
    db.add(org)
    await db.flush()

    # 3. Crear el usuario con contraseña hasheada y rol ADMIN
    hashed = get_password_hash(register_data.password)
    user = User(
        id=uuid.uuid4(),
        organization_id=org.id,
        email=register_data.email,
        hashed_password=hashed,
        role=UserRole.ADMIN,
        created_at=datetime.now(timezone.utc),
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)

    # 4. Generar token de acceso inmediato
    token_claims = {
        "sub": str(user.id),
        "org_id": str(user.organization_id),
        "role": user.role.value,
    }
    access_token = create_access_token(data=token_claims)

    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user=UserRead.model_validate(user),
    )


@router.get(
    "/me",
    response_model=UserMeResponse,
    status_code=status.HTTP_200_OK,
    summary="Obtener Perfil del Usuario Autenticado",
    description="Retorna los datos del usuario actual identificado mediante el token Bearer.",
)
async def get_me(
    current_user: User = Depends(get_current_user),
) -> UserMeResponse:
    """Retorna la información del perfil del usuario autenticado."""
    # Derivamos el nombre de forma descriptiva a partir del email
    name = current_user.email.split("@")[0].replace(".", " ").capitalize()
    return UserMeResponse(
        id=current_user.id,
        email=current_user.email,
        name=name,
        role=current_user.role,
        organization_id=current_user.organization_id,
    )
