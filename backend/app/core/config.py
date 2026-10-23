"""Módulo de Configuración Central y Validación Fail-Fast.

Utiliza Pydantic Settings v2 para cargar, validar y tipar estrictamente
todas las variables de entorno necesarias para el funcionamiento de AgentGuard.
Si alguna variable requerida falta o tiene un formato inválido, el proceso
se detiene inmediatamente al iniciar con un mensaje de error descriptivo.
"""

from typing import List, Union
from pydantic import AnyHttpUrl, computed_field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Configuración tipada del backend de AgentGuard."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )

    # Identificación y Entorno
    PROJECT_NAME: str = "AgentGuard Backend API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True

    # Seguridad y Criptografía
    SECRET_KEY: str = "agentguard-insecure-dev-secret-key-change-in-production-min-32-chars"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 días

    @field_validator("SECRET_KEY")
    @classmethod
    def validate_production_secret_key(cls, v: str, info) -> str:
        env = info.data.get("ENVIRONMENT", "development")
        if env == "production" and ("insecure" in v.lower() or len(v) < 32):
            raise ValueError(
                "FATAL: SECRET_KEY insegura o demasiado corta para entorno 'production'. "
                "Configure una clave criptográfica aleatoria de al menos 32 caracteres en .env."
            )
        return v


    # Orígenes Permitidos para CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]

    # Conexión a PostgreSQL 16
    POSTGRES_SERVER: str = "localhost"
    POSTGRES_PORT: int = 5432
    POSTGRES_USER: str = "agentguard"
    POSTGRES_PASSWORD: str = "agentguard_secret"
    POSTGRES_DB: str = "agentguard_db"
    SQLALCHEMY_DATABASE_URI: str | None = None

    # Conexión a Redis 7
    REDIS_URL: str = "redis://localhost:6379/0"

    @computed_field
    @property
    def async_database_uri(self) -> str:
        """Retorna la URI asíncrona oficial para SQLAlchemy y asyncpg."""
        if self.SQLALCHEMY_DATABASE_URI:
            return self.SQLALCHEMY_DATABASE_URI
        return (
            f"postgresql+asyncpg://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}"
            f"@{self.POSTGRES_SERVER}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"
        )

    @computed_field
    @property
    def sync_database_uri(self) -> str:
        """Retorna la URI síncrona alternativa para herramientas auxiliares o Alembic offline."""
        return (
            f"postgresql://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}"
            f"@{self.POSTGRES_SERVER}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"
        )


# Instancia única singleton de configuración
settings = Settings()
