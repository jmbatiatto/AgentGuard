"""Punto de Entrada Oficial de la API REST de AgentGuard.

Configura la aplicación FastAPI, middlewares de seguridad y CORS,
gestión de ciclo de vida (lifespan) y endpoints de diagnóstico / healthcheck.
"""

import logging
from contextlib import asynccontextmanager
from datetime import datetime, timezone
from typing import Any, Dict

from fastapi import FastAPI, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy import text
import redis.asyncio as aioredis

from app.core.config import settings
from app.core.database import engine
from app.api import api_router

# Configuración básica de logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("agentguard.api")


async def check_database_health() -> str:
    """Verifica la conectividad activa con PostgreSQL 16."""
    try:
        async with engine.connect() as connection:
            await connection.execute(text("SELECT 1"))
            return "connected"
    except Exception as exc:
        logger.warning("Fallo en verificación de salud de PostgreSQL: %s", exc)
        return "disconnected"


async def check_redis_health() -> str:
    """Verifica la conectividad activa con Redis 7."""
    try:
        redis_client = aioredis.from_url(
            settings.REDIS_URL,
            socket_timeout=1.0,
            socket_connect_timeout=1.0,
        )
        await redis_client.ping()
        await redis_client.aclose()
        return "connected"
    except Exception as exc:
        logger.warning("Fallo en verificación de salud de Redis: %s", exc)
        return "disconnected"


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manejador del ciclo de vida de la aplicación.
    
    Inicializa conexiones al arranque y libera pools al detener el servidor.
    """
    logger.info("Iniciando %s v%s [Entorno: %s]", settings.PROJECT_NAME, settings.VERSION, settings.ENVIRONMENT)
    yield
    logger.info("Cerrando pools de persistencia...")
    await engine.dispose()
    logger.info("Apagado ordenado de AgentGuard completado.")


# Instancia central de FastAPI
app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description=(
        "Plataforma SaaS de Autorización en Tiempo de Ejecución (PEP/PDP), "
        "Gobernanza Contextual y Trazabilidad Forense para Agentes de Inteligencia Artificial."
    ),
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# Configuración de Middleware CORS para comunicación con Frontend React/Vite
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inclusión de routers de API REST por dominio (/api/v1)
app.include_router(api_router, prefix=settings.API_V1_STR)


@app.get(
    "/",
    tags=["General"],
    summary="Página de Bienvenida y Metadatos de la API",
)
async def root() -> Dict[str, Any]:
    """Retorna metadatos generales de AgentGuard y enlaces a la documentación interactiva."""
    return {
        "name": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "status": "online",
        "docs": "/docs",
        "redoc": "/redoc",
        "api_v1": settings.API_V1_STR,
    }


@app.get(
    "/health",
    tags=["Diagnóstico"],
    summary="Healthcheck Global del Sistema",
    status_code=status.HTTP_200_OK,
)
async def health_check() -> Dict[str, Any]:
    """Verifica el estado del servicio y la conectividad con PostgreSQL y Redis."""
    db_status = await check_database_health()
    redis_status = await check_redis_health()

    is_fully_healthy = (db_status == "connected") and (redis_status == "connected")

    return {
        "status": "healthy" if is_fully_healthy else "degraded",
        "app": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "services": {
            "database": db_status,
            "redis": redis_status,
        },
    }


@app.get(
    f"{settings.API_V1_STR}/ping",
    tags=["Diagnóstico"],
    summary="Ping de Latencia Rápido",
    status_code=status.HTTP_200_OK,
)
async def ping() -> Dict[str, str]:
    """Endpoint ultraligero de verificación de latencia HTTP sin tocar persistencia."""
    return {
        "message": "pong",
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
