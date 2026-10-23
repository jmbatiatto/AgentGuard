"""Router de Operaciones de Demostración y Re-seeding de AgentGuard."""

import logging
from typing import Dict, Any
from datetime import datetime, timezone
from fastapi import APIRouter, status, HTTPException
from scripts.seed_demo import seed_data, ORG_ACME_ID

logger = logging.getLogger("agentguard.api.demo")

router = APIRouter(prefix="/demo", tags=["Demo Operations"])


@router.post(
    "/reset",
    status_code=status.HTTP_200_OK,
    summary="Restablecer Datos Semilla de la Demo Oficial",
    description=(
        "Limpia las tablas operativas de la organización Acme Corp y recrea el entorno "
        "con los agentes, herramientas, políticas y trazas iniciales para la presentación."
    ),
)
async def reset_demo_data() -> Dict[str, Any]:
    """Ejecuta el re-seeding determinista con reset=True."""
    try:
        await seed_data(reset=True)
        return {
            "status": "success",
            "message": "Entorno de demostración restablecido con éxito a su estado inicial.",
            "organization_id": str(ORG_ACME_ID),
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }
    except Exception as exc:
        logger.error("Error al re-sembrar datos de la demo: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Fallo al restablecer datos de la demo: {str(exc)}",
        )
