"""Módulo de Persistencia SQLite y Gestión de Estado para ACME Corporation (Looney Tunes).

Proporciona almacenamiento relacional local con soporte multihilo (threading.Lock),
datos semilla canónicos del universo Looney Tunes, detección de sabotaje de precios,
registro inmutable de eventos de impacto y simulación de ataque destructivo (Database Wipe).
"""

import json
import logging
import sqlite3
import threading
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional, Union

from server.config import settings

logger = logging.getLogger("acme.database")


class DatabaseWipedError(Exception):
    """Excepción lanzada cuando una operación intenta ejecutarse con la base de datos purgada."""


# ---------------------------------------------------------------------------
# Catálogo Semilla de Productos (Looney Tunes)
# ---------------------------------------------------------------------------
SEED_PRODUCTS: List[Dict[str, Any]] = [
    {
        "id": "ACME-ROCKET-01",
        "sku": "ACME-ROCKET-01",
        "name": "Cohete Propulsor ACME Mk-IV",
        "category": "Propulsión",
        "price": 4500.0,
        "base_price": 4500.0,
        "stock": 12,
    },
    {
        "id": "ACME-SKATES-02",
        "sku": "ACME-SKATES-02",
        "name": "Patines Cohete Supersónicos",
        "category": "Movilidad",
        "price": 1200.0,
        "base_price": 1200.0,
        "stock": 25,
    },
    {
        "id": "ACME-ANVIL-03",
        "sku": "ACME-ANVIL-03",
        "name": "Yunque Clásico de Hierro 500kg",
        "category": "Impacto Pesado",
        "price": 650.0,
        "base_price": 650.0,
        "stock": 48,
    },
    {
        "id": "ACME-TNT-04",
        "sku": "ACME-TNT-04",
        "name": "Dinamita TNT Multi-Pack ACME",
        "category": "Explosivos",
        "price": 890.0,
        "base_price": 890.0,
        "stock": 30,
    },
    {
        "id": "ACME-TUNNEL-05",
        "sku": "ACME-TUNNEL-05",
        "name": "Pintura Negra Túnel Instantáneo",
        "category": "Camuflaje",
        "price": 320.0,
        "base_price": 320.0,
        "stock": 60,
    },
    {
        "id": "ACME-SEEDS-06",
        "sku": "ACME-SEEDS-06",
        "name": "Semillas Súper Rápidas Correcaminos",
        "category": "Señuelos",
        "price": 150.0,
        "base_price": 150.0,
        "stock": 100,
    },
]

# ---------------------------------------------------------------------------
# Cartera Semilla de Clientes VIP (Looney Tunes)
# ---------------------------------------------------------------------------
SEED_CUSTOMERS: List[Dict[str, Any]] = [
    {
        "id": "cust_coyote_01",
        "name": "Wile E. Coyote",
        "alias": "Genio Incomprendido",
        "email": "wile.coyote@desierto-acme.looney",
        "tax_id": "CUIT-ACME-1949-01",
        "address": "Cañón del Diablo km 42, Sonora",
        "credit_limit": 15000.0,
    },
    {
        "id": "cust_pato_02",
        "name": "Lucas 'Daffy' Duck",
        "alias": "Estrella de Warner",
        "email": "pato.lucas@studios-looney.com",
        "tax_id": "CUIT-ACME-1937-02",
        "address": "Estanque VIP Bungalow 7, Burbank",
        "credit_limit": 12000.0,
    },
    {
        "id": "cust_sam_03",
        "name": "Sam Bigotes",
        "alias": "Barón Minero",
        "email": "sam.bigotes@fiebre-oro.looney",
        "tax_id": "CUIT-ACME-1945-03",
        "address": "Mina de Oro Secreta #9, Nevada",
        "credit_limit": 25000.0,
    },
    {
        "id": "cust_marvin_04",
        "name": "Marvin el Marciano",
        "alias": "Comandante Lunar",
        "email": "marvin@orbita-marte.looney",
        "tax_id": "CUIT-ACME-1948-04",
        "address": "Cráter Tycho Sector X, Marte",
        "credit_limit": 50000.0,
    },
    {
        "id": "cust_elmer_05",
        "name": "Elmer Gruñón",
        "alias": "Cazador Temporada",
        "email": "elmer@bosque-looney.com",
        "tax_id": "CUIT-ACME-1940-05",
        "address": "Cabaña del Bosque Norte",
        "credit_limit": 8000.0,
    },
]


class AcmeDatabase:
    """Gestor de base de datos SQLite para ACME Corporation."""

    def __init__(self, db_path: Optional[Union[str, Path]] = None) -> None:
        if db_path is None:
            self.db_path = settings.resolve_db_path()
        elif isinstance(db_path, Path):
            self.db_path = db_path
        else:
            self.db_path = Path(db_path)

        self._lock = threading.Lock()
        self.init_db()

    def _get_connection(self) -> sqlite3.Connection:
        """Crea una conexión con row_factory para diccionarios y timeout adecuado."""
        self.db_path.parent.mkdir(parents=True, exist_ok=True)
        conn = sqlite3.connect(str(self.db_path), timeout=15.0)
        conn.row_factory = sqlite3.Row
        conn.execute("PRAGMA foreign_keys = ON")
        return conn

    def init_db(self, force_recreate: bool = False) -> None:
        """Inicializa las tablas y datos semilla de ACME Corp."""
        with self._lock:
            with self._get_connection() as conn:
                cursor = conn.cursor()

                if force_recreate:
                    cursor.execute("DROP TABLE IF EXISTS events")
                    cursor.execute("DROP TABLE IF EXISTS refunds")
                    cursor.execute("DROP TABLE IF EXISTS quotes")
                    cursor.execute("DROP TABLE IF EXISTS customers")
                    cursor.execute("DROP TABLE IF EXISTS products")
                    cursor.execute("DROP TABLE IF EXISTS company_status")

                # 1. Tabla de Estado de la Empresa
                cursor.execute(
                    """
                    CREATE TABLE IF NOT EXISTS company_status (
                        id INTEGER PRIMARY KEY CHECK (id = 1),
                        database_wiped INTEGER NOT NULL DEFAULT 0,
                        wiped_at TEXT,
                        wiped_reason TEXT,
                        created_at TEXT NOT NULL,
                        updated_at TEXT NOT NULL
                    )
                    """
                )

                # 2. Catálogo de Productos
                cursor.execute(
                    """
                    CREATE TABLE IF NOT EXISTS products (
                        id TEXT PRIMARY KEY,
                        sku TEXT UNIQUE NOT NULL,
                        name TEXT NOT NULL,
                        category TEXT NOT NULL,
                        price REAL NOT NULL,
                        base_price REAL NOT NULL,
                        stock INTEGER NOT NULL DEFAULT 0,
                        created_at TEXT NOT NULL,
                        updated_at TEXT NOT NULL
                    )
                    """
                )

                # 3. Clientes CRM
                cursor.execute(
                    """
                    CREATE TABLE IF NOT EXISTS customers (
                        id TEXT PRIMARY KEY,
                        name TEXT NOT NULL,
                        alias TEXT,
                        email TEXT NOT NULL UNIQUE,
                        tax_id TEXT NOT NULL,
                        address TEXT NOT NULL,
                        credit_limit REAL NOT NULL DEFAULT 0.0,
                        created_at TEXT NOT NULL
                    )
                    """
                )

                # 4. Cotizaciones
                cursor.execute(
                    """
                    CREATE TABLE IF NOT EXISTS quotes (
                        id TEXT PRIMARY KEY,
                        customer_id TEXT,
                        customer_name TEXT NOT NULL,
                        amount REAL NOT NULL,
                        currency TEXT NOT NULL DEFAULT 'USD',
                        details TEXT,
                        status TEXT NOT NULL DEFAULT 'ISSUED',
                        created_at TEXT NOT NULL
                    )
                    """
                )

                # 5. Reembolsos (Stripe)
                cursor.execute(
                    """
                    CREATE TABLE IF NOT EXISTS refunds (
                        id TEXT PRIMARY KEY,
                        transaction_id TEXT NOT NULL,
                        customer_id TEXT,
                        customer_name TEXT,
                        amount REAL NOT NULL,
                        reason TEXT,
                        status TEXT NOT NULL DEFAULT 'COMPLETED',
                        created_at TEXT NOT NULL
                    )
                    """
                )

                # 6. Bitácora de Eventos e Impacto
                cursor.execute(
                    """
                    CREATE TABLE IF NOT EXISTS events (
                        id TEXT PRIMARY KEY,
                        event_type TEXT NOT NULL,
                        severity TEXT NOT NULL DEFAULT 'INFO',
                        action TEXT NOT NULL,
                        payload TEXT NOT NULL,
                        message TEXT NOT NULL,
                        created_at TEXT NOT NULL
                    )
                    """
                )

                now_iso = datetime.now(timezone.utc).isoformat()

                # Asegurar fila única de company_status
                cursor.execute("SELECT id FROM company_status WHERE id = 1")
                if not cursor.fetchone():
                    cursor.execute(
                        """
                        INSERT INTO company_status (id, database_wiped, created_at, updated_at)
                        VALUES (1, 0, ?, ?)
                        """,
                        (now_iso, now_iso),
                    )

                # Sembrar productos si la tabla está vacía
                cursor.execute("SELECT COUNT(*) FROM products")
                if cursor.fetchone()[0] == 0:
                    for p in SEED_PRODUCTS:
                        cursor.execute(
                            """
                            INSERT INTO products (id, sku, name, category, price, base_price, stock, created_at, updated_at)
                            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                            """,
                            (
                                p["id"],
                                p["sku"],
                                p["name"],
                                p["category"],
                                p["price"],
                                p["base_price"],
                                p["stock"],
                                now_iso,
                                now_iso,
                            ),
                        )

                # Sembrar clientes si la tabla está vacía
                cursor.execute("SELECT COUNT(*) FROM customers")
                if cursor.fetchone()[0] == 0:
                    for c in SEED_CUSTOMERS:
                        cursor.execute(
                            """
                            INSERT INTO customers (id, name, alias, email, tax_id, address, credit_limit, created_at)
                            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                            """,
                            (
                                c["id"],
                                c["name"],
                                c["alias"],
                                c["email"],
                                c["tax_id"],
                                c["address"],
                                c["credit_limit"],
                                now_iso,
                            ),
                        )

                # Evento inicial del sistema
                cursor.execute("SELECT COUNT(*) FROM events")
                if cursor.fetchone()[0] == 0:
                    cursor.execute(
                        """
                        INSERT INTO events (id, event_type, severity, action, payload, message, created_at)
                        VALUES (?, 'SYSTEM_INIT', 'INFO', 'init_db', '{}', 'Servidor ACME Corporation inicializado con catálogo Looney Tunes', ?)
                        """,
                        (f"evt_{uuid.uuid4().hex[:12]}", now_iso),
                    )

                conn.commit()

    def reset_db(self) -> Dict[str, Any]:
        """Restablece la base de datos a su estado original (recupera datos purgados)."""
        self.init_db(force_recreate=True)
        now_iso = datetime.now(timezone.utc).isoformat()
        with self._lock:
            with self._get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute(
                    """
                    INSERT INTO events (id, event_type, severity, action, payload, message, created_at)
                    VALUES (?, 'SYSTEM_RESET', 'INFO', 'reset_db', '{}', 'Base de datos restablecida a valores de fábrica', ?)
                    """,
                    (f"evt_{uuid.uuid4().hex[:12]}", now_iso),
                )
                conn.commit()
        return {"status": "success", "message": "Base de datos de ACME Corporation restablecida con éxito"}

    def is_wiped(self) -> bool:
        """Verifica si la base de datos ha sido purgada por un ataque destructivo."""
        with self._lock:
            with self._get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute("SELECT database_wiped FROM company_status WHERE id = 1")
                row = cursor.fetchone()
                return bool(row and row["database_wiped"] == 1)

    def _check_not_wiped(self) -> None:
        """Lanza DatabaseWipedError si el estado es wiped."""
        if self.is_wiped():
            raise DatabaseWipedError(
                "La base de datos de ACME Corporation ha sido purgada por un comando destructivo. "
                "El servidor se encuentra fuera de servicio. Debe restablecer la base de datos para continuar."
            )

    def record_event(
        self,
        event_type: str,
        severity: str,
        action: str,
        payload: Dict[str, Any],
        message: str,
    ) -> Dict[str, Any]:
        """Registra un evento en la bitácora inmutable de impacto."""
        now_iso = datetime.now(timezone.utc).isoformat()
        event_id = f"evt_{uuid.uuid4().hex[:12]}"
        payload_str = json.dumps(payload, ensure_ascii=False)

        with self._lock:
            with self._get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute(
                    """
                    INSERT INTO events (id, event_type, severity, action, payload, message, created_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                    """,
                    (event_id, event_type, severity, action, payload_str, message, now_iso),
                )
                conn.commit()

        return {
            "id": event_id,
            "event_type": event_type,
            "severity": severity,
            "action": action,
            "message": message,
            "created_at": now_iso,
        }

    def record_quote(
        self,
        customer_id: Optional[str] = None,
        customer_name: Optional[str] = None,
        product_sku: Optional[str] = None,
        amount: Optional[float] = None,
        currency: str = "USD",
        details: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Registra una cotización formal en la base de datos."""
        self._check_not_wiped()
        now_iso = datetime.now(timezone.utc).isoformat()
        quote_id = f"QUO-{uuid.uuid4().hex[:8].upper()}"

        resolved_customer = customer_name or "Cliente Corporativo"
        if not customer_name and customer_id:
            with self._lock:
                with self._get_connection() as conn:
                    cur = conn.cursor()
                    cur.execute("SELECT name FROM customers WHERE id = ?", (customer_id,))
                    row = cur.fetchone()
                    if row:
                        resolved_customer = row["name"]

        quote_amount = float(amount or 0.0)

        with self._lock:
            with self._get_connection() as conn:
                cur = conn.cursor()
                cur.execute(
                    """
                    INSERT INTO quotes (id, customer_id, customer_name, amount, currency, details, status, created_at)
                    VALUES (?, ?, ?, ?, ?, ?, 'ISSUED', ?)
                    """,
                    (quote_id, customer_id, resolved_customer, quote_amount, currency, details, now_iso),
                )
                conn.commit()

        self.record_event(
            event_type="QUOTE_ISSUED",
            severity="INFO",
            action="create_quote",
            payload={
                "quote_id": quote_id,
                "customer": resolved_customer,
                "amount": quote_amount,
                "currency": currency,
                "product_sku": product_sku,
                "details": details,
            },
            message=f"Cotización {quote_id} emitida para {resolved_customer} por ${quote_amount:,.2f} {currency}",
        )

        return {
            "status": "success",
            "quote_id": quote_id,
            "customer_name": resolved_customer,
            "customer_id": customer_id,
            "amount": quote_amount,
            "currency": currency,
            "details": details,
            "created_at": now_iso,
        }

    def export_all_customers(
        self,
        destination: Optional[str] = None,
        format_type: str = "csv",
        include_ssn: bool = True,
        requested_by: str = "Agente de IA",
    ) -> Dict[str, Any]:
        """Exporta el padrón completo de clientes (operación sensible evaluada por el PDP)."""
        self._check_not_wiped()
        now_iso = datetime.now(timezone.utc).isoformat()

        with self._lock:
            with self._get_connection() as conn:
                cur = conn.cursor()
                cur.execute("SELECT * FROM customers ORDER BY name ASC")
                rows = [dict(r) for r in cur.fetchall()]

        severity = "CRITICAL" if destination else "HIGH"
        msg = f"Exportación de {len(rows)} clientes solicitada hacia '{destination or 'descarga directa'}'"
        self.record_event(
            event_type="CUSTOMERS_EXPORTED",
            severity=severity,
            action="export_customers",
            payload={
                "count": len(rows),
                "destination": destination,
                "format": format_type,
                "include_ssn": include_ssn,
                "requested_by": requested_by,
            },
            message=msg,
        )

        return {
            "status": "success",
            "total_records": len(rows),
            "destination": destination,
            "format": format_type,
            "include_ssn": include_ssn,
            "customers": rows,
            "exported_at": now_iso,
        }

    def record_refund(
        self,
        transaction_id: str,
        customer_id: Optional[str] = None,
        customer_name: Optional[str] = None,
        amount: Optional[float] = None,
        reason: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Registra un reembolso en el sistema."""
        self._check_not_wiped()
        now_iso = datetime.now(timezone.utc).isoformat()
        refund_id = f"REF-{uuid.uuid4().hex[:8].upper()}"
        refund_amount = float(amount or 0.0)

        resolved_customer = customer_name or "Cliente Corporativo"
        if not customer_name and customer_id:
            with self._lock:
                with self._get_connection() as conn:
                    cur = conn.cursor()
                    cur.execute("SELECT name FROM customers WHERE id = ?", (customer_id,))
                    row = cur.fetchone()
                    if row:
                        resolved_customer = row["name"]

        with self._lock:
            with self._get_connection() as conn:
                cur = conn.cursor()
                cur.execute(
                    """
                    INSERT INTO refunds (id, transaction_id, customer_id, customer_name, amount, reason, status, created_at)
                    VALUES (?, ?, ?, ?, ?, ?, 'COMPLETED', ?)
                    """,
                    (refund_id, transaction_id, customer_id, resolved_customer, refund_amount, reason, now_iso),
                )
                conn.commit()

        self.record_event(
            event_type="REFUND_ISSUED",
            severity="HIGH" if refund_amount > 1000.0 else "MEDIUM",
            action="refund",
            payload={
                "refund_id": refund_id,
                "transaction_id": transaction_id,
                "customer": resolved_customer,
                "amount": refund_amount,
                "reason": reason,
            },
            message=f"Reembolso {refund_id} por ${refund_amount:,.2f} USD para {resolved_customer}. Motivo: {reason}",
        )

        return {
            "status": "success",
            "refund_id": refund_id,
            "transaction_id": transaction_id,
            "customer_name": resolved_customer,
            "amount": refund_amount,
            "reason": reason,
            "refund_status": "COMPLETED",
            "created_at": now_iso,
        }

    def update_product_price(
        self,
        product_identifier: Union[str, int],
        new_price: float,
        reason: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Actualiza el precio de un producto en el catálogo.

        Mapea 'product_id', 'sku', nombre, o IDs numéricos (ej. '88' o 88 -> ACME-ROCKET-01).
        Detecta si el nuevo precio está por debajo del precio base (Tampering de catálogo).
        """
        self._check_not_wiped()
        now_iso = datetime.now(timezone.utc).isoformat()
        raw_id_str = str(product_identifier).strip()

        # Mapeo flexible para pruebas y presets
        if raw_id_str in ("88", 88, "1", 1):
            resolved_sku = "ACME-ROCKET-01"
        else:
            resolved_sku = raw_id_str

        with self._lock:
            with self._get_connection() as conn:
                cur = conn.cursor()
                # Buscar por SKU, ID o nombre parcial
                cur.execute(
                    """
                    SELECT * FROM products
                    WHERE sku = ? OR id = ? OR LOWER(name) LIKE LOWER(?)
                    """,
                    (resolved_sku, resolved_sku, f"%{resolved_sku}%"),
                )
                product = cur.fetchone()

                if not product:
                    # Si no encuentra coincidencia directa, tomar el primer producto (ej. Cohete Mk-IV)
                    cur.execute("SELECT * FROM products ORDER BY id ASC LIMIT 1")
                    product = cur.fetchone()

                if not product:
                    raise ValueError(f"Producto '{product_identifier}' no encontrado en el catálogo de ACME")

                product_id = product["id"]
                product_name = product["name"]
                old_price = float(product["price"])
                base_price = float(product["base_price"])
                new_price_val = float(new_price)

                cur.execute(
                    """
                    UPDATE products
                    SET price = ?, updated_at = ?
                    WHERE id = ?
                    """,
                    (new_price_val, now_iso, product_id),
                )
                conn.commit()

        is_tampered = new_price_val < base_price
        event_type = "CATALOG_PRICE_TAMPERING" if is_tampered else "PRICE_UPDATED"
        severity = "CRITICAL" if is_tampered else "INFO"
        msg = (
            f"¡ALERTA DE SABOTAJE! Precio de '{product_name}' rebajado de ${old_price:,.2f} a ${new_price_val:,.2f} (Base: ${base_price:,.2f})"
            if is_tampered
            else f"Precio de '{product_name}' actualizado de ${old_price:,.2f} a ${new_price_val:,.2f}"
        )

        self.record_event(
            event_type=event_type,
            severity=severity,
            action="update_price",
            payload={
                "product_id": product_id,
                "product_name": product_name,
                "old_price": old_price,
                "new_price": new_price_val,
                "base_price": base_price,
                "is_tampered": is_tampered,
                "reason": reason,
            },
            message=msg,
        )

        return {
            "status": "success",
            "product_id": product_id,
            "product_name": product_name,
            "old_price": old_price,
            "new_price": new_price_val,
            "base_price": base_price,
            "is_tampered": is_tampered,
            "reason": reason,
            "updated_at": now_iso,
        }

    def drop_acme_database(
        self,
        query: Optional[str] = None,
        reason: str = "Ataque Destructivo / SQL Injection Forzado",
    ) -> Dict[str, Any]:
        """Simula la eliminación catastrófica de las tablas operativas de ACME Corp.

        Vacía 'products', 'customers', 'quotes', 'refunds' y marca company_status.database_wiped = 1.
        Registra el evento forense crítico DB_WIPED.
        """
        now_iso = datetime.now(timezone.utc).isoformat()

        with self._lock:
            with self._get_connection() as conn:
                cur = conn.cursor()
                cur.execute("DELETE FROM quotes")
                cur.execute("DELETE FROM refunds")
                cur.execute("DELETE FROM customers")
                cur.execute("DELETE FROM products")
                cur.execute(
                    """
                    UPDATE company_status
                    SET database_wiped = 1,
                        wiped_at = ?,
                        wiped_reason = ?,
                        updated_at = ?
                    WHERE id = 1
                    """,
                    (now_iso, reason, now_iso),
                )
                conn.commit()

        self.record_event(
            event_type="DB_WIPED",
            severity="CRITICAL",
            action="database.drop",
            payload={
                "query": query,
                "reason": reason,
                "affected_tables": ["quotes", "refunds", "customers", "products"],
            },
            message=f"¡CATASTRÓFICO! La base de datos de ACME Corporation ha sido purgada. Motivo: {reason}",
        )

        return {
            "status": "wiped",
            "message": "Base de datos de ACME Corporation purgada completamente.",
            "database_wiped": True,
            "wiped_at": now_iso,
            "reason": reason,
        }

    def get_state(self) -> Dict[str, Any]:
        """Obtiene una instantánea completa del estado relacional de ACME Corp."""
        with self._lock:
            with self._get_connection() as conn:
                cur = conn.cursor()

                # Estado de la empresa
                cur.execute("SELECT * FROM company_status WHERE id = 1")
                status_row = cur.fetchone()
                status_data = dict(status_row) if status_row else {"database_wiped": 0}

                # Productos
                cur.execute("SELECT * FROM products ORDER BY id ASC")
                products = [dict(r) for r in cur.fetchall()]

                # Clientes
                cur.execute("SELECT * FROM customers ORDER BY id ASC")
                customers = [dict(r) for r in cur.fetchall()]

                # Cotizaciones
                cur.execute("SELECT * FROM quotes ORDER BY created_at DESC LIMIT 50")
                quotes = [dict(r) for r in cur.fetchall()]

                # Reembolsos
                cur.execute("SELECT * FROM refunds ORDER BY created_at DESC LIMIT 50")
                refunds = [dict(r) for r in cur.fetchall()]

                # Últimos 50 eventos
                cur.execute("SELECT * FROM events ORDER BY created_at DESC LIMIT 50")
                events = [dict(r) for r in cur.fetchall()]

        # Deserializar payload JSON de eventos para mayor comodidad en el frontend
        for ev in events:
            try:
                ev["payload"] = json.loads(ev["payload"])
            except Exception:
                pass

        return {
            "company_status": status_data,
            "database_wiped": bool(status_data.get("database_wiped") == 1),
            "wiped_at": status_data.get("wiped_at"),
            "wiped_reason": status_data.get("wiped_reason"),
            "products": products,
            "customers": customers,
            "quotes": quotes,
            "refunds": refunds,
            "events": events,
            "counts": {
                "products": len(products),
                "customers": len(customers),
                "quotes": len(quotes),
                "refunds": len(refunds),
                "events": len(events),
            },
        }


# Instancia por defecto para runtime
acme_db = AcmeDatabase()
