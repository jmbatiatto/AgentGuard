"""Servidor REST FastAPI para ACME Corporation (Looney Tunes).

Expone:
1. Endpoints de herramientas empresariales para despacho PEP de AgentGuard y ejecución directa:
   - POST /crm/create_quote
   - POST /crm/export_customers
   - POST /stripe/refund
   - POST /catalog/update_price
   - POST /db/database.drop
   - POST /bi/query_sales (Módulo BI y Ventas Históricas)
   - POST /bi/delete_sales (Módulo BI y Ventas Históricas)
2. Consola web de gestión empresarial, Copiloto BI y control:
   - GET / (Portal Empresarial ACME Corporation en español)
   - GET /health
   - GET /api/state
   - POST /api/reset
   - POST /api/agent/onboard (Onboarding Automático del CEO en AgentGuard)
   - GET /api/agent/presets
   - POST /api/agent/discover
   - POST /api/agent/run
"""

import asyncio
import logging
from contextlib import asynccontextmanager, suppress
from pathlib import Path
from typing import Any, Dict, List, Optional, Union

import httpx
from fastapi import FastAPI, HTTPException, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, ConfigDict, Field

from agent.gemini_client import (
    GeminiAgentClient,
    discover_agentguard_context,
)
from agent.onboarding import bootstrap_acme_in_agentguard
from agent.presets import list_presets
from server.config import ROOT_DIR, normalize_loopback_url, settings
from server.database import AcmeDatabase, DatabaseWipedError, acme_db

logger = logging.getLogger("acme.app")
STATIC_DIR = Path(__file__).resolve().parent / "static"


# ---------------------------------------------------------------------------
# Esquemas Pydantic para Solicitudes
# ---------------------------------------------------------------------------
class QuoteRequest(BaseModel):
    model_config = ConfigDict(extra="allow")
    customer: Optional[str] = None
    customer_id: Optional[str] = None
    customer_name: Optional[str] = None
    product: Optional[str] = None
    amount: Optional[float] = 0.0
    currency: Optional[str] = "USD"
    details: Optional[str] = None


class ExportCustomersRequest(BaseModel):
    model_config = ConfigDict(extra="allow")
    destination: Optional[str] = None
    format: Optional[str] = "csv"
    include_ssn: Optional[bool] = True
    filter: Optional[str] = "all"


class RefundRequest(BaseModel):
    model_config = ConfigDict(extra="allow")
    transaction_id: Optional[str] = "tx_default"
    customer_id: Optional[str] = None
    customer_name: Optional[str] = None
    amount: Optional[float] = 0.0
    reason: Optional[str] = None


class UpdatePriceRequest(BaseModel):
    model_config = ConfigDict(extra="allow")
    product_id: Optional[Union[str, int]] = None
    sku: Optional[str] = None
    new_price: Optional[float] = None
    price: Optional[float] = None
    reason: Optional[str] = None


class DropDatabaseRequest(BaseModel):
    model_config = ConfigDict(extra="allow")
    query: Optional[str] = "DROP TABLE products;"
    force: Optional[bool] = True
    reason: Optional[str] = "Ataque Destructivo Forzado"


class QuerySalesRequest(BaseModel):
    model_config = ConfigDict(extra="allow")
    min_amount: Optional[float] = None
    max_amount: Optional[float] = None
    period: Optional[str] = "last_month"
    category: Optional[str] = None


class DeleteSalesRequest(BaseModel):
    model_config = ConfigDict(extra="allow")
    max_amount: Optional[float] = None
    min_amount: Optional[float] = None
    period: Optional[str] = None


class OnboardRequest(BaseModel):
    force_reset: bool = Field(default=False, description="Fuerza un re-seeding demo en AgentGuard")
    agentguard_url: Optional[str] = None


class AgentDiscoverRequest(BaseModel):
    agentguard_url: Optional[str] = None
    agentguard_api_key: Optional[str] = Field(
        default=None,
        description="API Key de AgentGuard para Data Plane (opcional si existe en .env)",
    )


class AgentRunRequest(BaseModel):
    prompt: Optional[str] = None
    preset_id: Optional[str] = None
    mode: str = Field(default="protected", description="'protected' o 'direct'")
    use_llm: bool = Field(default=False, description="Activa razonamiento real con Google Gemini")
    gemini_api_key: Optional[str] = None
    gemini_model: Optional[str] = None
    agentguard_url: Optional[str] = None
    agentguard_api_key: Optional[str] = None
    override_parameters: Optional[Dict[str, Any]] = None


# ---------------------------------------------------------------------------
# Dependencia de Base de Datos
# ---------------------------------------------------------------------------
def get_db_instance(request: Request) -> AcmeDatabase:
    """Retorna la instancia de base de datos asignada al estado de la app."""
    return getattr(request.app.state, "db", acme_db)


# ---------------------------------------------------------------------------
# Factoría de Aplicación FastAPI
# ---------------------------------------------------------------------------
async def ensure_acme_onboarded_if_needed(
    agentguard_url: Optional[str] = None,
    acme_public_url: Optional[str] = None,
) -> bool:
    """Verifica si ACME está vinculado con una API Key válida y ejecuta auto-onboarding si falta o expiró."""
    base_url = normalize_loopback_url((agentguard_url or settings.AGENTGUARD_URL).rstrip("/"))
    acme_url = (acme_public_url or settings.ACME_PUBLIC_URL).rstrip("/")

    async with httpx.AsyncClient(timeout=4.0) as probe_client:
        probe_resp = await probe_client.get(f"{base_url}/health")
        if probe_resp.status_code != 200:
            logger.debug("AgentGuard respondió HTTP %s en /health; se omite auto-onboarding.", probe_resp.status_code)
            return False

        current_key = (settings.AGENTGUARD_API_KEY or "").strip()
        needs_onboard = not current_key

        if current_key:
            ctx_resp = await probe_client.get(
                f"{base_url}/api/v1/gateway/context",
                headers={"X-AgentGuard-Key": current_key},
            )
            if ctx_resp.status_code == 200:
                ctx_data = ctx_resp.json() if isinstance(ctx_resp.json(), dict) else {}
                agents = ctx_data.get("agents", [])
                has_consultante = any(
                    isinstance(a, dict) and "consultante" in (a.get("name") or "").lower()
                    for a in agents
                )
                if has_consultante:
                    return False
                logger.info("Falta el agente 'Consultante BI' en AgentGuard; completando onboarding de ACME...")
                needs_onboard = True
            else:
                logger.info(
                    "La API Key local de ACME ya no es válida en AgentGuard (HTTP %s). "
                    "Limpiando clave obsoleta y re-vinculando organización ACME...",
                    ctx_resp.status_code,
                )
                settings.AGENTGUARD_API_KEY = None
                needs_onboard = True

    if needs_onboard:
        logger.info("AgentGuard detectado activo. Ejecutando vinculación inicial del CEO ACME...")
        res = await bootstrap_acme_in_agentguard(
            agentguard_url=base_url,
            acme_public_url=acme_url,
            force_reset=False,
        )
        logger.info(
            "ACME Corporation vinculada en AgentGuard (%s, clave %s).",
            res.get("organization_id"),
            res.get("api_key_masked"),
        )
        return True

    return False


def create_app(
    db_path: Optional[Union[str, Path]] = None,
    enable_auto_onboard: Optional[bool] = None,
) -> FastAPI:
    """Crea y configura la aplicación FastAPI para ACME Corporation."""
    active_db = AcmeDatabase(db_path=db_path) if db_path else acme_db
    should_auto_onboard = (db_path is None) if enable_auto_onboard is None else enable_auto_onboard

    @asynccontextmanager
    async def lifespan(app: FastAPI):
        # Startup: asegurar inicialización de tablas SQLite
        active_db.init_db()

        onboard_task: Optional[asyncio.Task[Any]] = None
        if should_auto_onboard:
            async def _auto_onboard_when_ready() -> None:
                try:
                    # Esperar breve margen para que Uvicorn quede escuchando en :9000 antes del /demo/reset
                    await asyncio.sleep(0.8)
                    await ensure_acme_onboarded_if_needed(
                        agentguard_url=settings.AGENTGUARD_URL,
                        acme_public_url=settings.ACME_PUBLIC_URL,
                    )
                except asyncio.CancelledError:
                    raise
                except Exception as exc:
                    logger.warning("Auto-onboarding omitido en startup: %s", exc)

            onboard_task = asyncio.create_task(_auto_onboard_when_ready())

        try:
            yield
        finally:
            if onboard_task is not None and not onboard_task.done():
                onboard_task.cancel()
                with suppress(asyncio.CancelledError):
                    await onboard_task
        # Shutdown

    app = FastAPI(
        title="ACME Corporation (Looney Tunes) — Sistema Interno & Copiloto BI",
        description=(
            "Portal empresarial de ACME Corporation integrado con AgentGuard (PEP/PDP) "
            "y asistente autónomo para personal administrativo y operaciones de catálogo."
        ),
        version="2.0.0",
        lifespan=lifespan,
    )

    app.state.db = active_db

    # CORS para interoperabilidad local
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Manejo de error de base de datos purgada (503 Service Unavailable)
    @app.exception_handler(DatabaseWipedError)
    async def database_wiped_handler(request: Request, exc: DatabaseWipedError):
        return JSONResponse(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content={"status": "error", "is_database_wiped": True, "detail": str(exc)},
        )

    # -----------------------------------------------------------------------
    # Endpoints de Servicios Empresariales ACME (llamados por AgentGuard o directo)
    # -----------------------------------------------------------------------
    @app.post(
        "/crm/create_quote",
        tags=["Servicios ACME - CRM"],
        summary="Emisión de cotización y presupuesto",
    )
    async def crm_create_quote(payload: QuoteRequest, request: Request):
        db = get_db_instance(request)
        if db.is_wiped():
            raise DatabaseWipedError("La base de datos de ACME Corporation ha sido purgada.")

        cust = payload.customer or payload.customer_name
        return db.record_quote(
            customer_id=payload.customer_id,
            customer_name=cust,
            product_sku=payload.product,
            amount=payload.amount,
            currency=payload.currency or "USD",
            details=payload.details,
        )

    @app.post(
        "/crm/export_customers",
        tags=["Servicios ACME - CRM"],
        summary="Exportación masiva de datos y clientes",
    )
    async def crm_export_customers(payload: ExportCustomersRequest, request: Request):
        db = get_db_instance(request)
        if db.is_wiped():
            raise DatabaseWipedError("La base de datos de ACME Corporation ha sido purgada.")

        return db.export_all_customers(
            destination=payload.destination,
            format_type=payload.format or "csv",
            include_ssn=bool(payload.include_ssn),
            requested_by="Gateway / Agente",
        )

    @app.post(
        "/stripe/refund",
        tags=["Servicios ACME - Pagos"],
        summary="Reembolso de pagos a clientes",
    )
    async def stripe_refund(payload: RefundRequest, request: Request):
        db = get_db_instance(request)
        if db.is_wiped():
            raise DatabaseWipedError("La base de datos de ACME Corporation ha sido purgada.")

        return db.record_refund(
            transaction_id=payload.transaction_id or "tx_unknown",
            customer_id=payload.customer_id,
            customer_name=payload.customer_name,
            amount=payload.amount,
            reason=payload.reason,
        )

    @app.post(
        "/catalog/update_price",
        tags=["Servicios ACME - Catálogo"],
        summary="Modificación del precio de lista de productos",
    )
    async def catalog_update_price(payload: UpdatePriceRequest, request: Request):
        db = get_db_instance(request)
        if db.is_wiped():
            raise DatabaseWipedError("La base de datos de ACME Corporation ha sido purgada.")

        identifier = payload.product_id if payload.product_id is not None else (payload.sku or "ACME-ROCKET-01")
        resolved_price = payload.new_price if payload.new_price is not None else (payload.price or 0.0)

        return db.update_product_price(
            product_identifier=identifier,
            new_price=resolved_price,
            reason=payload.reason,
        )

    @app.post(
        "/db/database.drop",
        tags=["Servicios ACME - Base de Datos"],
        summary="Ataque destructivo: purga de base de datos",
    )
    async def db_drop(payload: DropDatabaseRequest, request: Request):
        db = get_db_instance(request)
        return db.drop_acme_database(
            query=payload.query,
            reason=payload.reason or "Comando SQL Destructivo",
        )

    # -----------------------------------------------------------------------
    # Endpoints BI y Ventas Históricas
    # -----------------------------------------------------------------------
    @app.post(
        "/bi/query_sales",
        tags=["Servicios ACME - BI & Ventas"],
        summary="Consulta analítica de ventas históricas",
    )
    async def bi_query_sales(payload: QuerySalesRequest, request: Request):
        db = get_db_instance(request)
        if db.is_wiped():
            raise DatabaseWipedError("La base de datos de ACME Corporation ha sido purgada.")

        return db.query_sales_records(
            min_amount=payload.min_amount,
            max_amount=payload.max_amount,
            period=payload.period or "last_month",
            category=payload.category,
        )

    @app.post(
        "/bi/delete_sales",
        tags=["Servicios ACME - BI & Ventas"],
        summary="Eliminación de registros de ventas en SQLite",
    )
    async def bi_delete_sales(payload: DeleteSalesRequest, request: Request):
        db = get_db_instance(request)
        if db.is_wiped():
            raise DatabaseWipedError("La base de datos de ACME Corporation ha sido purgada.")

        return db.delete_sales_records(
            max_amount=payload.max_amount,
            min_amount=payload.min_amount,
            period=payload.period,
        )

    # -----------------------------------------------------------------------
    # Endpoints de la Consola Web y Control de Demostración
    # -----------------------------------------------------------------------
    @app.get("/health", tags=["Sistema"])
    async def health_check(request: Request):
        db = get_db_instance(request)
        is_wiped = db.is_wiped()
        return {
            "status": "warning" if is_wiped else "ok",
            "app": "ACME Corporation (Looney Tunes)",
            "database_wiped": is_wiped,
            "version": "2.0.0",
        }

    @app.get("/api/state", tags=["Consola Web"])
    async def get_state(request: Request):
        db = get_db_instance(request)
        state = db.get_state()
        has_ag_key = bool(settings.AGENTGUARD_API_KEY and settings.AGENTGUARD_API_KEY.strip())
        key_raw = (settings.AGENTGUARD_API_KEY or "").strip()
        prefix = f"{key_raw[:12]}***" if len(key_raw) > 12 else ("ag_live_***" if has_ag_key else "")

        state.update({
            "has_env_gemini_key": bool(settings.GEMINI_API_KEY and settings.GEMINI_API_KEY.strip()),
            "has_env_agentguard_key": has_ag_key,
            "has_effective_agentguard_key": has_ag_key,
            "agentguard_api_key_prefix": prefix,
            "default_agentguard_url": settings.AGENTGUARD_URL,
            "default_gemini_model": settings.GEMINI_MODEL,
        })
        return state

    @app.post("/api/reset", tags=["Consola Web"])
    async def reset_database(request: Request):
        db = get_db_instance(request)
        return db.reset_db()

    @app.post("/api/agent/onboard", tags=["Consola Web"])
    async def onboard_agentguard(payload: OnboardRequest):
        """Ejecuta el onboarding automático del CEO de ACME en AgentGuard bajo demanda."""
        target_url = payload.agentguard_url or settings.AGENTGUARD_URL
        try:
            result = await bootstrap_acme_in_agentguard(
                agentguard_url=target_url,
                acme_public_url=settings.ACME_PUBLIC_URL,
                force_reset=payload.force_reset,
            )
            return result
        except RuntimeError as re:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=f"Fallo al conectar o configurar AgentGuard en {target_url}: {re}",
            )
        except Exception as exc:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Error inesperado durante la vinculación con AgentGuard: {exc}",
            )

    @app.get("/api/agent/presets", tags=["Consola Web"])
    async def get_agent_presets():
        return list_presets()

    @app.post("/api/agent/discover", tags=["Consola Web"])
    async def discover_context(payload: AgentDiscoverRequest):
        url = payload.agentguard_url or settings.AGENTGUARD_URL
        api_key = (payload.agentguard_api_key or "").strip() or (settings.AGENTGUARD_API_KEY or "").strip()
        if not api_key:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Debe proveer una X-AgentGuard-Key válida o presionar 'Vincular AgentGuard' para generarla automáticamente.",
            )
        try:
            return await discover_agentguard_context(
                agentguard_url=url,
                agentguard_api_key=api_key,
            )
        except Exception as exc:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Fallo al conectar con AgentGuard en {url}: {exc}",
            )

    @app.post("/api/agent/run", tags=["Consola Web"])
    async def run_agent(payload: AgentRunRequest, request: Request):
        db = get_db_instance(request)

        gemini_key = payload.gemini_api_key or settings.GEMINI_API_KEY
        if payload.use_llm and (not gemini_key or not gemini_key.strip()):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    "Se requiere una clave GEMINI_API_KEY válida para ejecutar el agente con Gemini LLM real. "
                    "Configure su clave en el encabezado o active el modo guiado sin Gemini."
                ),
            )

        agentguard_url = payload.agentguard_url or settings.AGENTGUARD_URL
        agentguard_key = payload.agentguard_api_key or settings.AGENTGUARD_API_KEY
        gemini_model = payload.gemini_model or settings.GEMINI_MODEL

        client = GeminiAgentClient(
            gemini_api_key=gemini_key,
            gemini_model=gemini_model,
            agentguard_url=agentguard_url,
            agentguard_api_key=agentguard_key,
            db=db,
        )

        try:
            return await client.run_scenario(
                prompt=payload.prompt,
                preset_id=payload.preset_id,
                mode=payload.mode,
                use_llm=payload.use_llm,
                override_parameters=payload.override_parameters,
            )
        except ValueError as ve:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))
        except httpx.TimeoutException as tex:
            detail_msg = str(tex).strip() or type(tex).__name__
            raise HTTPException(
                status_code=status.HTTP_504_GATEWAY_TIMEOUT,
                detail=f"Tiempo de espera agotado al consultar Gemini o AgentGuard ({detail_msg}).",
            )
        except Exception as exc:
            logger.exception("Error inesperado durante la ejecución del agente")
            detail_msg = str(exc).strip() or repr(exc)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error durante la ejecución del agente ({type(exc).__name__}): {detail_msg}",
            )

    # -----------------------------------------------------------------------
    # Archivos Estáticos y Página Principal
    # -----------------------------------------------------------------------
    if STATIC_DIR.exists():
        app.mount("/static", StaticFiles(directory=str(STATIC_DIR)), name="static")

        @app.get("/", include_in_schema=False)
        async def serve_index():
            index_path = STATIC_DIR / "index.html"
            if index_path.exists():
                return FileResponse(index_path)
            return {"message": "ACME Corporation API activa. Interfaz web no encontrada en server/static/."}

    return app


# Instancia por defecto para uvicorn
app = create_app()
