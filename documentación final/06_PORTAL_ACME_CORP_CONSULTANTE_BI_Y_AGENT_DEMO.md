# 06 — Portal ACME Corp, Asistente Consultante BI y Cliente Agent Demo

> **Documento Oficial de Integración y Demostración Práctica (SSOT):** Inspección 100% fidedigna del código fuente real en `acme-corp/**`, `agent-demo/run_demo.py`, `backend/app/api/gateway.py` y `backend/scripts/seed_demo.py`.

---

## 1. Documentación Integral del Portal Empresarial `acme-corp/` (`:9000`)

El portal empresarial de **ACME Corporation** es una aplicación autónoma desarrollada en FastAPI que simula el sistema interno de gestión comercial, inventario y facturación del universo Looney Tunes. Su objetivo pedagógico y de demostración es contrastar la operación de agentes de IA bajo **Modo Protegido (gobernados por el Gateway PEP de AgentGuard)** frente al **Modo Directo (ejecución sin barreras de seguridad, demostrando vulnerabilidad catastrófica)**.

```mermaid
graph TD
    subgraph ACME_Portal ["Portal Empresarial ACME Corp (http://localhost:9000)"]
        WebUI["Consola Web & Copiloto BI (server/static/index.html + app.js)"]
        FastAPIServer["Servidor FastAPI (server/app.py)"]
        SQLiteDB["Base de Datos SQLite Multihilo (acme_corp.db - 7 Tablas)"]
        OnboardingEngine["Auto-Onboarding Engine (agent/onboarding.py)"]
        GeminiClient["Cliente Asistente Gemini 3.8 Flash (agent/gemini_client.py)"]
    end

    subgraph AgentGuard_Platform ["Plataforma AgentGuard (http://localhost:8000)"]
        GatewayPEP["Gateway PEP (/api/v1/gateway/execute)"]
        PDPEngine["Motor PDP Determinista (PostgreSQL 16)"]
        AdminAPI["Control Plane Administrativo (/api/v1)"]
    end

    subgraph LLM_Cloud ["Servicios Externos de Inteligencia Artificial"]
        GoogleGemini["Google Gemini API (gemini-3.8-flash / gemini-3.5-flash-lite)"]
    end

    WebUI -->|HTTP / JSON| FastAPIServer
    FastAPIServer --> SQLiteDB
    FastAPIServer --> OnboardingEngine
    FastAPIServer --> GeminiClient
    OnboardingEngine -->|Bootstrap JWT / API Keys| AdminAPI
    GeminiClient -->|Function Calling / Tools| GoogleGemini
    GeminiClient -->|Modo Protegido: X-AgentGuard-Key| GatewayPEP
    GeminiClient -->|Modo Directo: Despacho Crudo| SQLiteDB
    GatewayPEP --> PDPEngine
    GatewayPEP -->|ALLOW / Resuelto| FastAPIServer
```

---

### 1.1 Scripts de Ejecución y Lanzadores

El entorno autónomo de ACME Corporation puede iniciarse de forma independiente o integrado:
1. **Lanzador por Lotes en Windows (`acme-corp/start_acme.bat`):**
   - Configura la consola a UTF-8 (`chcp 65001`).
   - Copia automáticamente `.env.example` a `.env` si no existe.
   - Detecta el entorno virtual local `.venv` o el entorno virtual global `backend\.venv`.
   - Si no existe entorno, crea `.venv`, instala dependencias con `pip install -q -r requirements.txt` y arranca `run.py`.
2. **Punto de Entrada Autónomo (`acme-corp/run.py`):**
   - Resuelve rutas absolutas y carga la configuración de Uvicorn.
   - Inicia `uvicorn.run("server.app:app", host="0.0.0.0", port=9000, reload=False)` en `http://localhost:9000`.

---

### 1.2 Variables de Entorno Reales (`acme-corp/server/config.py` y `.env.example`)

La clase `AcmeSettings` (basada en `pydantic-settings`) carga y valida los siguientes parámetros desde `acme-corp/.env`:

| Variable de Entorno | Valor por Defecto | Propósito en el Sistema |
| :--- | :--- | :--- |
| **`ACME_HOST`** | `0.0.0.0` | Dirección de escucha del socket TCP para el servidor Uvicorn. |
| **`ACME_PORT`** | `9000` | Puerto TCP de servicio para la interfaz web y endpoints ERP. |
| **`ACME_PUBLIC_URL`** | `http://localhost:9000` | URL pública con la que ACME se registra como herramienta en AgentGuard. |
| **`ACME_DB_PATH`** | `acme_corp.db` | Nombre y ruta relativa/absoluta del archivo de base de datos SQLite. |
| **`AGENTGUARD_URL`** | `http://localhost:8000` | Dirección base del backend central de AgentGuard (PEP/PDP). |
| **`AGENTGUARD_API_KEY`** | *(Dinámica)* | Clave de autenticación del Data Plane (`ag_live_...`) persistida tras auto-onboarding. |
| **`GEMINI_API_KEY`** | *(Opcional)* | Token de Google AI Studio para activar razonamiento agéntico LLM real. |
| **`GEMINI_MODEL`** | `gemini-3.8-flash` | Modelo de lenguaje canónico utilizado para function calling y síntesis. |

---

### 1.3 Arquitectura del Servidor FastAPI (`acme-corp/server/app.py`)

El servidor expone dos familias diferenciadas de rutas:

#### A. Endpoints de Herramientas Empresariales (Despachadas por AgentGuard o en Modo Directo):
- `POST /crm/create_quote`: Genera presupuestos comerciales y cotizaciones formales.
- `POST /crm/export_customers`: Exportación masiva de datos de clientes (vector OWASP ASI03).
- `POST /stripe/refund`: Emisión de reembolsos monetarios a través de la pasarela de pagos.
- `POST /catalog/update_price`: Modificación de precios de lista oficiales en el catálogo.
- `POST /db/database.drop`: Ejecución de comandos DDL destructivos sobre el esquema relacional.
- `POST /bi/query_sales`: Consulta analítica de ventas históricas con filtros por monto, período y categoría.
- `POST /bi/delete_sales`: Eliminación física de registros de ventas en la tabla SQLite.

#### B. Endpoints de Gestión y Consola Web:
- `GET /`: Entrega la aplicación web interactiva (`server/static/index.html`).
- `GET /health`: Estado del servicio ACME, conectividad con base de datos y bandera `database_wiped`.
- `GET /api/state`: Instantánea en tiempo real del estado de SQLite para el inspector web.
- `POST /api/reset`: Restablecimiento de tablas y semillas de SQLite al estado inicial canónico.
- `POST /api/agent/onboard`: Disparador manual para re-vincular la empresa con AgentGuard.
- `GET /api/agent/presets`: Entrega el catálogo de los 8 escenarios preconfigurados.
- `POST /api/agent/discover`: Consulta el contexto del tenant en AgentGuard mediante `GET /gateway/context`.
- `POST /api/agent/run`: Ejecutor agéntico que orquesta el ciclo de vida (Gemini LLM o disparo guiado).

---

### 1.4 Inspector Relacional SQLite en Vivo (`acme-corp/server/database.py`)

La clase `AcmeDatabase` implementa acceso multihilo seguro mediante `threading.Lock()` y serialización en `acme_corp.db`. Mantiene 7 tablas relacionales:

```mermaid
erDiagram
    company_status {
        int id PK "id = 1"
        int database_wiped "0 = OK, 1 = WIPED"
        text wiped_at
        text wiped_reason
        text created_at
        text updated_at
    }

    products {
        text id PK "ACME-ROCKET-01"
        text sku
        text name
        text category
        real price
        real base_price
        int stock
        int is_tampered "0 = Oficial, 1 = Saboteado"
        text updated_at
    }

    customers {
        text id PK "cust_coyote_01"
        text name "Wile E. Coyote"
        text alias
        text email
        text tax_id
        text address
        real credit_limit
        text created_at
    }

    quotes {
        text id PK
        text customer_id FK
        text customer_name
        real total_amount
        text status
        text created_at
        text notes
    }

    refunds {
        text id PK
        text customer_id FK
        text customer_name
        real amount
        text reason
        text status
        text created_at
    }

    events {
        text id PK
        text event_type
        text severity "LOW, MEDIUM, HIGH, CRITICAL"
        text action
        text payload "JSON estructurado"
        text message
        text created_at
    }

    sales {
        text id PK "SALE-LM-01"
        text sale_date
        text period "last_month, current_month"
        text customer_id FK
        text customer_name
        text product_sku
        text product_name
        text category
        int quantity
        real amount
    }

    customers ||--o{ quotes : solicita
    customers ||--o{ refunds : recibe
    customers ||--o{ sales : registra
    products ||--o{ sales : contiene
```

#### Catálogo Semilla de 15 Ventas Históricas Canónicas (`SEED_SALES`):
- **Ventas del Mes Pasado (`period: "last_month"`, 8 registros):**
  1. `SALE-LM-01`: Wile E. Coyote — Cohete Propulsor Mk-IV ($4,500.00).
  2. `SALE-LM-02`: Lucas Daffy Duck — Patines Cohete ($6,000.00).
  3. `SALE-LM-03`: Sam Bigotes — Yunque Clásico ($1,300.00).
  4. `SALE-LM-04`: Marvin el Marciano — Dinamita TNT ($1,780.00).
  5. `SALE-LM-05`: Wile E. Coyote — Dinamita TNT ($890.00).
  6. `SALE-LM-06`: Elmer Gruñón — Yunque Clásico ($650.00).
  7. `SALE-LM-07`: Wile E. Coyote — Pintura Negra Túnel ($320.00).
  8. `SALE-LM-08`: Wile E. Coyote — Semillas Súper Rápidas ($150.00).
  *(Total ventas > $1,000 en mes pasado: 4 transacciones mayores).*
- **Ventas del Mes Actual (`period: "current_month"`, 7 registros):**
  9. `SALE-CM-09`: Sam Bigotes — Patines Cohete ($6,000.00).
  10. `SALE-CM-10`: Wile E. Coyote — Cohete Propulsor Mk-IV ($4,500.00).
  11. `SALE-CM-11`: Marvin el Marciano — Dinamita TNT ($2,670.00).
  12. `SALE-CM-12`: Elmer Gruñón — Yunque Clásico ($650.00).
  13. `SALE-CM-13`: Lucas Daffy Duck — Dinamita TNT ($890.00).
  14. `SALE-CM-14`: Wile E. Coyote — Semillas Súper Rápidas ($450.00).
  15. `SALE-CM-15`: Lucas Daffy Duck — Pintura Negra Túnel ($320.00).

#### Simulación de Sabotaje y Purga Catastrófica (`drop_acme_database`):
Cuando se ejecuta la acción destructiva `database.drop` en **Modo Directo**:
- Ejecuta `DELETE` masivo sobre `sales`, `quotes`, `refunds`, `customers` y `products`.
- Modifica `company_status.database_wiped = 1` y almacena el motivo y fecha del ataque.
- Inserta un evento inmutable `DB_WIPED` con severidad `CRITICAL`.
- A partir de ese instante, cualquier intento operativo en ACME lanza `DatabaseWipedError`, respondiendo con código **HTTP 503 Service Unavailable** y bloqueando la empresa por completo.

---

## 2. Auto-Onboarding Automático del CEO (`acme-corp/agent/onboarding.py`)

El módulo de onboarding simula el proceso en el que el CEO de ACME Corporation (**Lucas Duck**) contrata los servicios de AgentGuard para gobernar su infraestructura de inteligencia artificial.

```mermaid
sequenceDiagram
    autonumber
    participant App as "ACME Uvicorn (lifespan)"
    participant Onboard as "acme-corp/agent/onboarding.py"
    participant GuardAPI as "AgentGuard API (:8000)"
    participant EnvFile as "acme-corp/.env"

    App->>Onboard: ensure_acme_onboarded_if_needed() tras 0.8s de startup
    Onboard->>GuardAPI: GET /health
    GuardAPI-->>Onboard: 200 OK (AgentGuard saludable)
    Onboard->>GuardAPI: GET /api/v1/gateway/context (con AGENTGUARD_API_KEY local)
    alt Clave válida y contiene "Consultante BI"
        Onboard-->>App: No requiere cambios (ya aprovisionado)
    else Clave ausente, expirada (401/403) o DB Docker reiniciada
        Note over Onboard,GuardAPI: Inicia Bootstrap Automático de la Organización
        Onboard->>GuardAPI: POST /api/v1/auth/login (admin@acmecorp.com / demo-password)
        alt 401 o 404 (DB limpia)
            Onboard->>GuardAPI: POST /api/v1/auth/register-org (Acme Corp, Lucas Duck)
            GuardAPI-->>Onboard: 201 Created (access_token, api_key inicial)
        else 200 OK
            GuardAPI-->>Onboard: 200 OK (access_token)
        end
        Onboard->>GuardAPI: GET /api/v1/agents
        alt PostgreSQL tiene 0 agentes (vacío)
            Onboard->>GuardAPI: POST /api/v1/demo/reset (re-siembra base de 12 tablas)
        end
        Note over Onboard,GuardAPI: Provisión Idempotente de Recursos de BI
        Onboard->>GuardAPI: POST /api/v1/agents (Crea "Consultante BI" si no existe)
        Onboard->>GuardAPI: POST /api/v1/tools (Crea "BI & Ventas ACME" con query_sales y delete_sales)
        Onboard->>GuardAPI: POST /api/v1/agents/{id}/tools (Vincula en AgentTool)
        Onboard->>GuardAPI: POST /api/v1/policies (Crea "Gobernanza Consultante BI (Solo Lectura)")
        Onboard->>GuardAPI: POST /api/v1/policy-rules (Regla 1: ALLOW query_sales, prioridad 150)
        Onboard->>GuardAPI: POST /api/v1/policy-rules (Regla 2: DENY delete_sales, prioridad 250)
        Onboard->>GuardAPI: POST /api/v1/api-keys (Genera "Portal ACME Corporation" si clave era inválida)
        GuardAPI-->>Onboard: 201 Created (api_key ag_live_...)
        Onboard->>EnvFile: persist_api_key_to_env(api_key)
        Onboard-->>App: Onboarding exitoso (clave en memoria y en disco)
    end
```

### Características Clave del Auto-Onboarding:
1. **Idempotencia Estricta:** Revisa si el agente `Consultante BI`, la herramienta `BI & Ventas ACME` o la política ya existen antes de intentar crearlos, evitando duplicados.
2. **Auto-Recuperación ante Docker Limpio:** Si el desarrollador reinicia la base de datos de PostgreSQL con `docker compose down -v`, la API Key vieja fallará; el script detecta el error 401/403, descarta la clave rota, re-crea la empresa y persiste la nueva llave en `acme-corp/.env`.
3. **Botón Interactivo en UI:** La consola de ACME (`:9000`) cuenta con el botón **«Probar Conexión AgentGuard»** que ejecuta `POST /api/agent/onboard`, permitiendo forzar el re-seeding o comprobar la salud de la integración en vivo.

---

## 3. Asistente "Consultante BI" y Motor Google Gemini 3.8 Flash

Implementado en `acme-corp/agent/gemini_client.py`, este componente otorga inteligencia analítica al personal de ACME.

### 3.1 Configuración del Modelo y Pensamiento Determinista

- **Modelo Predeterminado:** `gemini-3.8-flash`.
- **Configuración de Generación (`_build_generation_config`):**
  - `temperature: 0.2` (minimiza alucinaciones y favorece la exactitud matemática y de fechas).
  - Para modelos de la familia Gemini 3 (`model_name.startswith("gemini-3")`), inyecta:
    ```json
    {
      "temperature": 0.2,
      "thinkingConfig": {
        "thinkingLevel": "low"
      }
    }
    ```
    El nivel de pensamiento `"low"` reduce drásticamente la latencia de respuesta sin perder capacidad de razonamiento en Function Calling.

---

### 3.2 Manejo de Historial Multi-Turno y Preservación de `thoughtSignature`

Los modelos Gemini 3 emiten partes internas de razonamiento (`thought`) durante las llamadas a herramientas:

```mermaid
sequenceDiagram
    autonumber
    actor Admin as "Usuario (Prompt en Lenguaje Natural)"
    participant Client as "GeminiAgentClient"
    participant Gemini as "Google Gemini API (:generateContent)"
    participant PEP as "AgentGuard Gateway PEP"

    Admin->>Client: "Dame todas las ventas mayores a $1,000 del mes pasado"
    Note over Client,Gemini: TURNO 1 — Selección de Herramienta
    Client->>Gemini: POST /models/gemini-3.8-flash:generateContent (Prompt + Tools Schema)
    Gemini-->>Client: candidate[0] con parts: [thought_chunk, functionCall(query_sales)]
    Note right of Client: CRÍTICO: Guarda model_turn_parts completo (incluyendo firma de pensamiento)
    Client->>PEP: Invocación en Modo Protegido (query_sales, min_amount=1000)
    PEP-->>Client: 200 OK (ALLOW, datos de ventas de SQLite)
    Note over Client,Gemini: TURNO 2 — Síntesis y Explicación
    Client->>Gemini: POST /models/gemini-3.8-flash:generateContent
    Note over Client,Gemini: Envía: 1. User prompt, 2. Model (con model_turn_parts intacto), 3. FunctionResponse
    Gemini-->>Client: candidate[0] con parts: [thought_chunk, text_chunk]
    Note right of Client: Filtra 'not p.get("thought")' para extraer solo el texto limpio de respuesta
    Client-->>Admin: Muestra síntesis ejecutiva y renderiza Gráfica de Torta SVG
```

> [!IMPORTANT]
> ### 🚨 Preservación Obligatoria de `thoughtSignature`
> Si las partes de pensamiento (`thought`) se eliminan del historial del modelo antes de enviar el Turno 2 (`functionResponse`), la API de Google Gemini 3 rechaza la petición con error HTTP 400 por historial corrupto. `gemini_client.py` preserva íntegramente `model_turn_parts` en el rol `model` y únicamente excluye los pensamientos al formatear el texto visible para el usuario final.

---

### 3.3 Conmutación por Fallback de Alta Disponibilidad (`GEMINI_FALLBACK_MODELS`)

Para prevenir interrupciones durante demostraciones en vivo por cuota o latencia de Google AI Studio:
- Tupla de respaldo: `("gemini-3.8-flash", "gemini-3.5-flash-lite")`.
- Si el modelo principal devuelve códigos **`404`** (no disponible en la región), **`429`** (rate-limit), **`503`** (sobrecarga) o **`ReadTimeout`**, el cliente conmuta de inmediato a `gemini-3.5-flash-lite` y documenta el evento:
  ```text
  Gemini seleccionó la herramienta 'query_sales' [Fallback automático a gemini-3.5-flash-lite]
  ```

---

### 3.4 Modos de Ejecución: Guiado / Rápido vs Gemini LLM Real

1. **Modo Guiado / Rápido (`use_llm=False`):**
   - No requiere `GEMINI_API_KEY`.
   - Mapea el preset seleccionado directamente a los parámetros canónicos y ejecuta la llamada de inmediato.
   - Ideal para evaluación rápida, entornos sin internet o pruebas automatizadas de regresión.
2. **Modo Gemini LLM Real (`use_llm=True`):**
   - Exige una clave válida de Gemini.
   - Pasa el prompt en lenguaje natural por la API de Google para que el LLM deduzca qué herramienta y argumentos utilizar.
   - Ejecuta el ciclo completo de dos turnos con síntesis explicativa.

---

### 3.5 Gráfica de Torta SVG Interactiva y Filtro Visual no Destructivo

1. **Gráfica de Torta SVG Interactiva:**
   - Se activa ante consultas de ventas o mediante el preset `consult_pie_chart`.
   - Agrupa ventas por categoría de producto (ej. *Propulsión*, *Movilidad*, *Impacto Pesado*, *Explosivos*).
   - Genera arcos vectoriales SVG calculados dinámicamente con etiquetas de monto en USD y porcentaje respecto al total.
2. **Filtro Visual Local ante `DENY delete_sales`:**
   - Ante la petición *"borrá de la base las ventas menores a $1,000"*, AgentGuard emite un **`DENY` determinista**.
   - El Asistente Consultante BI no entra en pánico ni muestra un error crudo: informa con cortesía que la política de seguridad le prohíbe escribir o borrar en SQLite, pero ofrece aplicar un **filtro visual en pantalla** que oculta los registros en la tabla y recalcula la gráfica de torta **sin alterar la persistencia física**.

---

## 4. Catálogo Completo de los 8 Escenarios Demostrativos

Los 8 presets configurados en `acme-corp/agent/presets.py` abarcan la totalidad del espectro funcional y de seguridad de la plataforma:

```mermaid
graph TD
    subgraph BI_Scenarios ["Casos de Uso BI (Consultante BI & Personal Administrativo)"]
        BI1["BI-1: consult_sales<br/>(Ventas > $1k Mes Pasado)<br/>ALLOW (LOW)"]
        BI2["BI-2: consult_pie_chart<br/>(Gráfica de Torta de Ventas)<br/>ALLOW (LOW)"]
        BI3["BI-3: consult_delete_attempt<br/>(Borrar Ventas < $1k en SQLite)<br/>DENY por AgentGuard (CRITICAL)"]
    end

    subgraph SEC_Scenarios ["Casos Comerciales y de Seguridad (Agente de Ventas)"]
        SEC1["SEC-1: legit_quote<br/>(Cotización Cohete $4,500)<br/>ALLOW (LOW)"]
        SEC2["SEC-2: attack_price<br/>(Sabotaje de Precio a $9.99)<br/>DENY (HIGH)"]
        SEC3["SEC-3: hitl_refund<br/>(Reembolso $12,500 >= $500)<br/>REQUIRE_APPROVAL (HIGH)"]
        SEC4["SEC-4: attack_exfil<br/>(Inyección ASI03 a Webhook C2)<br/>DENY + ALERT (CRITICAL)"]
        SEC5["SEC-5: attack_drop_db<br/>(Purga Total de SQLite DDL)<br/>DENY + ALERT (CRITICAL)"]
    end
```

### Tabla Resumen de los 8 Escenarios

| ID | Nombre en UI | Acción Destino | Riesgo | Veredicto Protegido | Comportamiento en Modo Protegido (PEP) | Catástrofe en Modo Directo (Sin Guard) |
| :--- | :--- | :--- | :---: | :---: | :--- | :--- |
| **`BI-1`** | Ventas > $1k Mes Pasado | `query_sales` | `LOW` | **`ALLOW`** | Recupera 4 ventas de alto valor; muestra tabla. | Recupera datos idénticos directamente de SQLite. |
| **`BI-2`** | Gráfica de Torta | `generate_pie_chart` | `LOW` | **`ALLOW`** | Renderiza gráfico circular interactivo con porcentajes. | Renderiza gráfico idéntico directamente. |
| **`BI-3`** | Borrar Ventas < $1k | `delete_sales` | `CRITICAL` | **`DENY`** | **Bloqueado por política de solo lectura.** SQLite intacto; ofrece filtro visual en UI. | **¡Elimina físicamente 4 ventas de SQLite!** Datos perdidos para siempre. |
| **`SEC-1`** | Cotización Cohete | `create_quote` | `LOW` | **`ALLOW`** | Genera presupuesto por $4,500 formal en CRM. | Genera presupuesto sin validar límites ni trazabilidad. |
| **`SEC-2`** | Sabotaje de Precio | `update_price` | `HIGH` | **`DENY`** | **Bloqueado temprano:** Agente carece de herramienta en `AgentTool`. Catálogo seguro. | **Rebaja Cohete Mk-IV a $9.99** (precio base $4,500). Sabotaje de catálogo consumado. |
| **`SEC-3`** | Reembolso Financiero | `refund` | `HIGH` | **`REQUIRE_APPROVAL`** | **Retenido en HITL:** Espera que supervisor humano apruebe en `ApprovalsView`. | Emite reembolso por $12,500 en Stripe sin supervisión humana alguna. |
| **`SEC-4`** | Exfiltración ASI03 | `export_customers` | `CRITICAL` | **`DENY + ALERT`** | **ThreatDetector detecta C2:** Enmascara PII, bloquea con 403 y crea alerta crítica. | Exfiltra la base de clientes VIP con CUIT y domicilios hacia el servidor atacante. |
| **`SEC-5`** | Purga Total de Base | `database.drop` | `CRITICAL` | **`DENY + ALERT`** | **Bloqueo preventivo anti-sabotaje:** Genera alerta crítica. Tablas 100% protegidas. | **¡DROP TABLE masivo!** Purgadas todas las tablas de SQLite. Servidor responde 503. |

---

## 5. Comparativa Exhaustiva: Modo Protegido vs Modo Directo

La fortaleza de AgentGuard se evidencia al alternar el selector de **Modo de Despacho** en la consola de ACME Corp:

```mermaid
graph TD
    subgraph Modo_Protegido ["Modo Protegido (AgentGuard PEP Activo)"]
        ReqP["Invocación de Acción Sensible"]
        PEPGateway["PEP Gateway Service (:8000)"]
        PDPRules["Reglas PDP / ThreatDetector"]
        VerdictP{"Veredicto"}
        BlockP["DENY: Acción Bloqueada<br/>Alerta Crítica Generada<br/>Trazabilidad Registrada<br/>Base de Datos Intacta"]
        AllowP["ALLOW: Despacho Seguro"]
        ReqP --> PEPGateway
        PEPGateway --> PDPRules
        PDPRules --> VerdictP
        VerdictP -->|Ataque o Abuso| BlockP
        VerdictP -->|Legítimo| AllowP
    end

    subgraph Modo_Directo ["Modo Directo (Sin Protección / Vulnerable)"]
        ReqD["Invocación de Acción Sensible"]
        NoShield["Sin Intercepción ni Políticas"]
        DirectExec["Ejecución Directa sobre SQLite / API"]
        DamageD["CATASTROFE DE SEGURIDAD:<br/>• Precios saboteados a $9.99<br/>• Ventas eliminadas físicamente<br/>• Fuga masiva de clientes VIP<br/>• DROP TABLE -> Servidor 503 caído"]
        ReqD --> NoShield
        NoShield --> DirectExec
        DirectExec --> DamageD
    end
```

---

## 6. Guía Completa del Cliente CLI `agent-demo/run_demo.py`

`agent-demo/run_demo.py` es el cliente de línea de comandos oficial para reproducir y verificar de forma automatizada los 4 escenarios de la evaluación académica contra el Gateway PEP (`POST /api/v1/gateway/execute`).

### 6.1 Auto-Descubrimiento de Contexto (`GET /gateway/context`)

El cliente no requiere identificadores UUID hardcodeados. Lee `AGENTGUARD_API_KEY` (desde `.env` o argumento) y consulta `GET /api/v1/gateway/context`:
```python
headers = {"X-AgentGuard-Key": api_key}
resp = client.get(f"{base_url}/api/v1/gateway/context", headers=headers)
# Resuelve dinámicamente:
# - organization_id
# - agent_id (Agente de Ventas activo)
# - tool_crm_id, tool_stripe_id, tool_catalog_id
```

---

### 6.2 Modos de Ejecución CLI

#### A. Ejecución de la Suite Completa en Secuencia (`--all`):
Ejecuta los 4 escenarios canónicos y presenta una tabla comparativa con veredictos y tiempos:
```powershell
backend\.venv\Scripts\python.exe agent-demo/run_demo.py --all
```
**Salida Canónica:**
```text
==========================================================================
Resumen de Ejecución (--all)
--------------------------------------------------------------------------
  [PASS] Escenario 1: create_quote -> ALLOW (HTTP 200)
  [PASS] Escenario 2: update_price -> DENY (HTTP 403)
  [PASS] Escenario 3: refund -> REQUIRE_APPROVAL (HTTP 202)
  [PASS] Escenario 4: export_customers -> DENY (HTTP 403)
==========================================================================
```

#### B. Ejecución Quirúrgica de un Escenario Específico (`--scenario <1..4>`):
Permite probar una regla aislada:
```powershell
# Probar únicamente el escenario HITL (reembolso retenido)
backend\.venv\Scripts\python.exe agent-demo/run_demo.py --scenario 3
```

#### C. Menú Interactivo por Consola (sin argumentos):
Si se invoca sin banderas, despliega un menú interactivo en tiempo real:
```powershell
backend\.venv\Scripts\python.exe agent-demo/run_demo.py
```
```text
=== AgentGuard CLI Demo (Gateway PEP) ===
Target: http://localhost:8000 | Org: 8f3b2a11-... | Agent: 5c91b244-...
--------------------------------------------------------------------------
  [1] Operación Normal (ALLOW) — create_quote (HTTP 200)
  [2] Privilegio Mínimo / Abuso Bloqueado (DENY) — update_price (HTTP 403)
  [3] Human-in-the-Loop (REQUIRE_APPROVAL) — refund (HTTP 202)
  [4] Exfiltración / Amenaza Crítica (DENY + Alerta) — export_customers (HTTP 403)
  [A] Ejecutar TODOS los escenarios (1 -> 4)
  [0] Salir

Seleccioná una opción: 
```

---

## 7. Verificación de Integridad con Pytest

Para certificar que la lógica del Gateway PEP y las reglas de los escenarios se mantienen en verde permanente (política Zero-Regression), se ejecuta la suite automatizada:

```powershell
backend\.venv\Scripts\pytest.exe -q --tb=short --no-header backend/tests/test_gateway_scenarios.py
```
```text
4 passed in 0.42s
```
Ambos manuales garantizan trazabilidad total y alineación rigurosa con el código fuente en producción.
