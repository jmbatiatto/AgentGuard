"""Router de API REST para el Gateway Interceptor en Tiempo de Ejecución (PEP)."""

from fastapi import APIRouter, Depends, Response, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.models.enums import PolicyDecision
from app.schemas.gateway import GatewayExecuteRequest, GatewayExecuteResponse
from app.services.pep_gateway_service import pep_gateway_service

router = APIRouter(prefix="/gateway", tags=["Gateway (PEP)"])


@router.post(
    "/execute",
    response_model=GatewayExecuteResponse,
    summary="Intercepción y Evaluación en Tiempo Real (PEP/PDP)",
    description=(
        "Punto de entrada de intercepción en tiempo de ejecución para llamadas a herramientas emitidas por Agentes de IA.\n\n"
        "Evalúa políticas contextuales (PDP), ejecuta desinfección/enmascaramiento de datos sensibles (OWASP LLM06) "
        "y determina de forma determinista y Fail-Closed si la acción se despacha inmediatamente (200 OK), "
        "se suspende para aprobación humana (202 Accepted) o se bloquea (403 Forbidden)."
    ),
    responses={
        status.HTTP_200_OK: {
            "model": GatewayExecuteResponse,
            "description": "Acción autorizada y ejecutada exitosamente en el servicio externo (ALLOW).",
        },
        status.HTTP_202_ACCEPTED: {
            "model": GatewayExecuteResponse,
            "description": "Acción suspendida sujeta a aprobación humana obligatoria en la bandeja HITL (REQUIRE_APPROVAL).",
        },
        status.HTTP_403_FORBIDDEN: {
            "model": GatewayExecuteResponse,
            "description": "Acción bloqueada por política de seguridad, agente inactivo o falta de capacidad autorizada (DENY).",
        },
    },
)
async def execute_gateway_action(
    request: GatewayExecuteRequest,
    response: Response,
    db: AsyncSession = Depends(get_db),
) -> GatewayExecuteResponse:
    """Intercepción síncrona en tiempo de ejecución de la invocación de herramientas."""
    result = await pep_gateway_service.execute(db=db, request=request)

    if result.decision == PolicyDecision.ALLOW:
        response.status_code = status.HTTP_200_OK
    elif result.decision == PolicyDecision.REQUIRE_APPROVAL:
        response.status_code = status.HTTP_202_ACCEPTED
    else:
        response.status_code = status.HTTP_403_FORBIDDEN

    return result
