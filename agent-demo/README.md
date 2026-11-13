# 🤖 AgentGuard — Agent Demo (Cliente CLI Python)

Cliente demostrador en Python 3.12+ (`httpx`) para demostrar en vivo el comportamiento SaaS B2B de **AgentGuard** interceptando invocaciones reales contra `POST /api/v1/gateway/execute` con autenticación mediante `X-AgentGuard-Key`.

## 1. Requisitos previos

- Python **3.12+**
- Backend de AgentGuard corriendo en `http://localhost:8000` (por ejemplo, levantado con `start_all.bat`).
- Entorno inicializado con `seed_demo.py` (organización demo `Acme Corp`) o una organización SaaS creada desde el registro autogestionado y configurada con herramientas, agente y reglas.
- Una **API Key operativa** (`ag_live_...`) generada en **Configuración -> API Keys** o durante el registro inicial de la empresa.

## 2. Instalación

Desde la raíz del repositorio (`AgentGuard/`):

```powershell
cd agent-demo
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

En Linux / macOS:

```bash
cd agent-demo
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

## 3. Configuración (`.env`)

Copiá la plantilla `.env.example` a `.env` y completá `AGENTGUARD_API_KEY` con la llave generada en tu organización:

```powershell
copy .env.example .env
```

Variables disponibles en `agent-demo/.env`:

| Variable | Descripción | Valor por defecto (`seed_demo.py`) |
| :--- | :--- | :--- |
| `AGENTGUARD_URL` | URL base del backend AgentGuard | `http://localhost:8000` |
| `AGENTGUARD_API_KEY` | API Key enviada en la cabecera `X-AgentGuard-Key` | *(obligatoria)* |
| `ORGANIZATION_ID` | UUID de la organización propietaria de la API Key | `11111111-1111-1111-1111-111111111111` |
| `AGENT_ID` | UUID del agente de IA protegido | `33333333-3333-3333-3333-333333333301` |
| `DELEGATOR_USER_ID` | UUID del usuario humano delegador (opcional) | `22222222-2222-2222-2222-222222222203` |
| `TOOL_CRM_ID` | UUID de la herramienta CRM (`create_quote`, `export_customers`) | `44444444-4444-4444-4444-444444444401` |
| `TOOL_STRIPE_ID` | UUID de la herramienta Stripe (`refund`) | `44444444-4444-4444-4444-444444444402` |
| `TOOL_CATALOG_ID` | UUID de la herramienta Catálogo (`update_price`) | `44444444-4444-4444-4444-444444444403` |

## 4. Ejecución

**Menú interactivo (paso a paso para demo en vivo):**

```powershell
python run_demo.py
```

**Ejecución automática de los 4 escenarios (`--all`):**

```powershell
python run_demo.py --all
```

**Ejecución de un escenario individual (`--scenario`):**

```powershell
python run_demo.py --scenario 3
```

## 5. Los 4 Escenarios Canónicos

| # | Acción y Parámetros | HTTP | Decisión PDP | Efecto en el Dashboard |
| :-: | :--- | :-: | :--- | :--- |
| **1** | `create_quote` (`amount: 2500`) | `200` | `ALLOW` | Se ejecuta y registra traza `EXECUTED` en tiempo real en **Trazas**. |
| **2** | `update_price` (`new_price: 10`) | `403` | `DENY` | Bloqueado por principio de privilegio mínimo (`AgentTool` no asignada). |
| **3** | `refund` (`amount: 4500`) | `202` | `REQUIRE_APPROVAL` | Devuelve `approval_id` y crea ticket pendiente en **Aprobaciones (HITL)** para resolverlo en vivo desde `ApprovalsView`. |
| **4** | `export_customers` (`destination: https://attacker.io/leak`) | `403` | `DENY` | Bloqueado por política y detector OWASP (`ASI03`), generando una alerta `CRITICAL` en **Alertas**. |
