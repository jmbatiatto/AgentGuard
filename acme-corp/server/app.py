"""Servidor REST FastAPI para ACME Corporation (Looney Tunes).

Expone:
1. Endpoints de herramientas empresariales para despacho PEP de AgentGuard y ejecución directa:
   - POST /crm/create_quote
   - POST /crm/export_customers
   - POST /stripe/refund
   - POST /catalog/update_price
   - POST /db/database.drop
2. Consola web de simulación y control:
   - GET / (UI Web en español)
   - GET /health
   - GET /api/state
   - POST /api/reset
   - GET /api/agent/presets
   - POST /api/agent/discover
   - POST /api/agent/run
"""

from contextlib import asynccontextmanager
from pathlib import Path
from typing import Any, Dict, List, Optional, Union

from fastapi import FastAPI, HTTPException, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, ConfigDict, Field

from agent.gemini_client import (
    GeminiAgentClient,
    discover_agentguard_context,
)
from agent.presets import list_presets
from server.config import ROOT_DIR, settings
from server.database import AcmeDatabase, DatabaseWipedError, acme_db

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
def create_app(db_path: Optional[Union[str, Path]] = None) -> FastAPI:
    """Crea y configura la aplicación FastAPI para ACME Corporation."""
    active_db = AcmeDatabase(db_path=db_path) if db_path else acme_db

    @asynccontextmanager
    async def lifespan(app: FastAPI):
        # Startup: asegurar inicialización
        active_db.init_db()
        yield
        # Shutdown si se requiere

    app = FastAPI(
        title="ACME Corporation (Looney Tunes) - Entorno Autónomo",
        description=(
            "Servidor externo para demostración de autorización y gobernanza en tiempo real (PEP/PDP) "
            "con AgentGuard y el Agente Autónomo de Google Gemini."
        ),
        version="1.0.0",
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
            "version": "1.0.0",
        }

    @app.get("/api/state", tags=["Consola Web"])
    async def get_state(request: Request):
        db = get_db_instance(request)
        state = db.get_state()
        state.update({
            "has_env_gemini_key": bool(settings.GEMINI_API_KEY and settings.GEMINI_API_KEY.strip()),
            "has_env_agentguard_key": bool(settings.AGENTGUARD_API_KEY and settings.AGENTGUARD_API_KEY.strip()),
            "default_agentguard_url": settings.AGENTGUARD_URL,
            "default_gemini_model": settings.GEMINI_MODEL,
        })
        return state

    @app.post("/api/reset", tags=["Consola Web"])
    async def reset_database(request: Request):
        db = get_db_instance(request)
        return db.reset_db()

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
                detail="Debe proveer una X-AgentGuard-Key válida o configurarla en acme-corp/.env",
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

        # Si se solicita Gemini real y no se suministra API key ni en payload ni en .env
        gemini_key = payload.gemini_api_key or settings.GEMINI_API_KEY
        if payload.use_llm and (not gemini_key or not gemini_key.strip()):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    "Se requiere una clave GEMINI_API_KEY válida para ejecutar el agente con Gemini LLM real. "
                    "Configure su clave en el encabezado o desactive 'Gemini LLM Real' para disparar el payload directo."
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
        except Exception as exc:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error durante la ejecución del agente: {exc}",
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
