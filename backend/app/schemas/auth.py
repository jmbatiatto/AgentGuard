"""Esquemas Pydantic para Autenticación, Registro y Gestión de Sesión."""

from typing import Optional
from uuid import UUID
from pydantic import EmailStr, Field

from app.models.enums import UserRole
from app.schemas.base import BaseSchema
from app.schemas.organization import OrganizationRead
from app.schemas.user import UserRead


class LoginRequest(BaseSchema):
    """Payload para inicio de sesión con correo y contraseña."""

    email: EmailStr = Field(
        ...,
        description="Correo electrónico del usuario corporativo",
        examples=["admin@acme.corp"],
    )
    password: str = Field(
        ...,
        min_length=1,
        description="Contraseña del usuario",
    )


class RegisterRequest(BaseSchema):
    """Payload para registro de un nuevo usuario corporativo y opcionalmente su organización."""

    email: EmailStr = Field(
        ...,
        description="Correo electrónico corporativo",
        examples=["nuevo_admin@miempresa.com"],
    )
    password: str = Field(
        ...,
        min_length=6,
        description="Contraseña de acceso seguro",
    )
    name: str = Field(
        ...,
        min_length=1,
        max_length=255,
        description="Nombre completo o descriptivo del usuario",
    )
    organization_name: Optional[str] = Field(
        default=None,
        description="Nombre de la nueva organización o tenant a crear",
    )


class TokenResponse(BaseSchema):
    """Respuesta con token Bearer JWT tras autenticación o registro exitoso."""

    access_token: str = Field(..., description="Token de acceso JWT firmado")
    token_type: str = Field(default="bearer", description="Tipo de esquema de token de autorización")
    user: UserRead = Field(..., description="Datos del usuario autenticado")


class RegisterOrgRequest(BaseSchema):
    """Payload para alta autogestionada de organización SaaS B2B y usuario administrador."""

    organization_name: str = Field(
        ...,
        min_length=1,
        max_length=255,
        description="Nombre de la empresa u organización",
        examples=["Mi Empresa SaaS"],
    )
    admin_name: str = Field(
        ...,
        min_length=1,
        max_length=255,
        description="Nombre completo del administrador",
        examples=["Laura Gómez"],
    )
    email: EmailStr = Field(
        ...,
        description="Correo electrónico corporativo del administrador",
        examples=["laura@miempresa.com"],
    )
    password: str = Field(
        ...,
        min_length=6,
        description="Contraseña de acceso seguro",
    )


class RegisterOrgResponse(BaseSchema):
    """Respuesta atómica del alta SaaS B2B con JWT, usuario, organización y API Key inicial."""

    access_token: str = Field(..., description="Token de acceso JWT firmado")
    token_type: str = Field(default="bearer", description="Tipo de esquema de token")
    user: UserRead = Field(..., description="Datos del usuario administrador creado")
    organization: OrganizationRead = Field(
        ...,
        description="Datos de la organización creada con settings por defecto",
    )
    api_key: str = Field(
        ...,
        description="Primera API Key operativa (ag_live_...) revelada una única vez",
    )
    api_key_prefix: str = Field(..., description="Prefijo público de la API Key")
    api_key_id: UUID = Field(..., description="ID único de la API Key creada")


class UserMeResponse(BaseSchema):
    """Información del perfil del usuario autenticado actual."""

    id: UUID = Field(..., description="Identificador único del usuario")
    email: str = Field(..., description="Correo electrónico corporativo")
    name: str = Field(..., description="Nombre del usuario")
    role: UserRole = Field(..., description="Rol administrativo o de operación")
    organization_id: UUID = Field(..., description="Identificador de la organización perteneciente")
