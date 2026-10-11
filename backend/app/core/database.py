"""Módulo de Persistencia Asíncrona y Fábrica de Sesiones.

Configura el motor asíncrono de SQLAlchemy 2.0 conectado a PostgreSQL 16
mediante el driver binario de alto rendimiento asyncpg.
"""

from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.orm import DeclarativeBase

from app.core.config import settings

# Motor asíncrono central de SQLAlchemy 2.0
engine = create_async_engine(
    settings.async_database_uri,
    echo=settings.DEBUG and settings.ENVIRONMENT == "development",
    future=True,
    pool_pre_ping=True,
    pool_size=10,
    max_overflow=20,
)

# Fábrica de sesiones asíncronas
AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False,
    autocommit=False,
)


class Base(DeclarativeBase):
    """Clase base declarativa tipada para los modelos de dominio de AgentGuard."""
    pass


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """Generador de dependencia inyectable de FastAPI para sesiones de BD.
    
    Asegura la apertura de una sesión aislada por petición HTTP
    y el cierre limpio de la conexión al finalizar, previniendo fugas.
    """
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()
