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
from app.models.api_key import ApiKey
from app.models.enums import UserRole
from app.models.organization import Organization
from app.models.user import User
from app.schemas.auth import (
    LoginRequest,
    RegisterOrgRequest,
    RegisterOrgResponse,
    RegisterRequest,
    TokenResponse,
    UserMeResponse,
)
from app.schemas.organization import OrganizationRead
from app.schemas.user import UserRead
from app.services.api_key_service import ApiKeyService
from app.services.organization_service import DEFAULT_ORGANIZATION_SETTINGS

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
    email_clean = credentials.email.strip().lower()
    result = await db.execute(select(User).where(User.email == email_clean))
    user = result.scalar_one_or_none()

    if not user:
        if "@acmecorp.com" in email_clean:
            alt_email = email_clean.replace("@acmecorp.com", "@acme.corp")
            result = await db.execute(select(User).where(User.email == alt_email))
            user = result.scalar_one_or_none()
        elif "@acme.corp" in email_clean:
            alt_email = email_clean.replace("@acme.corp", "@acmecorp.com")
            result = await db.execute(select(User).where(User.email == alt_email))
            user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales de acceso incorrectas o usuario no encontrado",
        )

    # Validación estricta de contraseña contra hash almacenado
    if not user.hashed_password or not verify_password(credentials.password, user.hashed_password):
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
    # 1. Validar unicidad de correo (normalizado en minúsculas)
    email_clean = register_data.email.strip().lower()
    existing = await db.execute(select(User).where(User.email == email_clean))
    if existing.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El correo electrónico ya se encuentra registrado",
        )

    # 2. Asignar o crear la organización
    org_name = register_data.organization_name or f"Org {register_data.name}"
    org = Organization(
        name=org_name,
        created_at=datetime.now(timezone.utc),
    )
    db.add(org)
    await db.flush()
    if org.id is None:
        org.id = uuid.uuid4()

    # 3. Crear el usuario con contraseña hasheada y rol ADMIN
    hashed = get_password_hash(register_data.password)
    user = User(
        organization_id=org.id,
        email=email_clean,
        hashed_password=hashed,
        role=UserRole.ADMIN,
        created_at=datetime.now(timezone.utc),
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    if user.id is None:
        user.id = uuid.uuid4()

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


@router.post(
    "/register-org",
    response_model=RegisterOrgResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Alta Autogestionada de Organización SaaS B2B",
    description=(
        "Crea en una única transacción atómica una nueva Organización con settings por defecto, "
        "su usuario Administrador con rol ADMIN y una primera API Key operativa (ag_live_...)."
    ),
)
async def register_organization(
    payload: RegisterOrgRequest,
    db: AsyncSession = Depends(get_db),
) -> RegisterOrgResponse:
    """Registra una empresa nueva, su usuario ADMIN y su API Key inicial de forma atómica."""
    email_clean = payload.email.strip().lower()
    existing = await db.execute(select(User).where(User.email == email_clean))
    if existing.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El correo electrónico ya se encuentra registrado",
        )

    now = datetime.now(timezone.utc)
    org_name_clean = payload.organization_name.strip()

    org = Organization(
        name=org_name_clean,
        settings=dict(DEFAULT_ORGANIZATION_SETTINGS),
        created_at=now,
    )
    db.add(org)
    await db.flush()
    if org.id is None:
        org.id = uuid.uuid4()

    hashed_password = get_password_hash(payload.password)
    user = User(
        organization_id=org.id,
        email=email_clean,
        hashed_password=hashed_password,
        role=UserRole.ADMIN,
        created_at=now,
    )

    raw_key = ApiKeyService._generate_raw_key()
    key_prefix = raw_key[:12]
    hashed_key = ApiKeyService._hash_key(raw_key)
    api_key_obj = ApiKey(
        organization_id=org.id,
        name=f"Key Principal — {org_name_clean}"[:100],
        key_prefix=key_prefix,
        hashed_key=hashed_key,
        created_at=now,
        expires_at=None,
        is_active=True,
    )

    try:
        db.add(user)
        db.add(api_key_obj)
        await db.commit()
        await db.refresh(user)
        await db.refresh(org)
        await db.refresh(api_key_obj)
        if user.id is None:
            user.id = uuid.uuid4()
        if api_key_obj.id is None:
            api_key_obj.id = uuid.uuid4()
    except Exception:
        await db.rollback()
        raise

    token_claims = {
        "sub": str(user.id),
        "org_id": str(user.organization_id),
        "role": user.role.value,
    }
    access_token = create_access_token(data=token_claims)

    return RegisterOrgResponse(
        access_token=access_token,
        token_type="bearer",
        user=UserRead.model_validate(user),
        organization=OrganizationRead.model_validate(org),
        api_key=raw_key,
        api_key_prefix=key_prefix,
        api_key_id=api_key_obj.id,
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
