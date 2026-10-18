"""Schemas Pydantic v2 para Usuarios y Roles."""

from datetime import datetime
from uuid import UUID
from pydantic import Field

from app.models.enums import UserRole
from app.schemas.base import BaseSchema


class UserCreate(BaseSchema):
    """Payload para registrar un nuevo usuario corporativo."""

    organization_id: UUID = Field(
        ...,
        description="ID de la organización a la que pertenece",
    )
    email: str = Field(
        ...,
        min_length=3,
        max_length=255,
        description="Correo electrónico corporativo",
    )
    role: UserRole = Field(
        default=UserRole.OPERATOR,
        description="Rol de autorización dentro de la plataforma",
    )


class UserRead(BaseSchema):
    """Respuesta con la información del usuario."""

    id: UUID
    organization_id: UUID
    email: str
    role: UserRole
    created_at: datetime
