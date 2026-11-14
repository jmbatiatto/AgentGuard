# 🔐 AgentGuard — Guía Rápida de Credenciales y Roles Demo (Acme Corp)

**Proyecto:** AgentGuard (Plataforma SaaS B2B Multi-Tenant de Gobernanza y Autorización Contextual en Runtime para Agentes de IA)  
**Organización Demo:** `Acme Corp`  
**Tenant UUID (`ORG_ACME_ID`):** `11111111-1111-1111-1111-111111111111`  
**Fuente de Verdad:** [`backend/scripts/seed_demo.py`](./backend/scripts/seed_demo.py)

> [!IMPORTANT]
> Este documento contiene **exclusivamente** las credenciales, roles RBAC y UUIDs del tenant oficial de demostración **Acme Corp** sembrados por `seed_demo.py`. Para cambiar de perfil durante la demo en vivo, cerrá sesión desde el menú superior del usuario (**Cerrar sesión**) e iniciá sesión con JWT real en la pantalla de acceso (`AuthView`).

---

## 1. Credenciales de Usuarios (Acme Corp)

Todos los usuarios sembrados de **Acme Corp** comparten la misma contraseña para agilizar la demostración:

- **Contraseña única para los 5 usuarios:** `demo-password`

| Rol (`UserRole`) | Etiqueta en UI | Email (Login) | Contraseña | User ID (UUID) | Alcance / Para qué usarlo en la Demo |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **`ADMIN`** | Administrador | `admin@acmecorp.com` | `demo-password` | `22222222-2222-2222-2222-222222222201` | Control total de Acme Corp: configurar agentes, herramientas y políticas PDP; gestionar **Equipo & Roles RBAC**; generar/revocar **API Keys Gateway (PEP)**; usar **Playground**; resolver HITL/alertas; ver trazas y auditoría; único habilitado para **Reiniciar Estado Demo (Factory Reset)**. |
| **`APPROVER`** | Aprobador (HITL) | `approver@acmecorp.com` | `demo-password` | `22222222-2222-2222-2222-222222222202` | Oficial de cumplimiento / bucle humano: resuelve solicitudes `PENDING` en **Aprobaciones** (`POST /api/v1/approvals/{id}/resolve`, sellando su `approver_user_id` desde el JWT) y gestiona estado de alertas (`PATCH /api/v1/alerts/{id}/status`). Ideal para aprobar en vivo el reembolso del **Escenario 3**. |
| **`OPERATOR`** | Operador | `operator@acmecorp.com` | `demo-password` | `22222222-2222-2222-2222-222222222203` | Operación y pruebas: ejecuta simulaciones en **Playground** (`POST /api/v1/gateway/simulate`), realiza triage de alertas (`PATCH /api/v1/alerts/{id}/status`) y actúa como `DELEGATOR_USER_ID` por defecto en `agent-demo/.env.example`. No puede aprobar HITL ni editar políticas o API Keys. |
| **`AUDITOR`** | Auditor | `auditor@acmecorp.com` | `demo-password` | `22222222-2222-2222-2222-222222222204` | Cumplimiento y auditoría forense de solo lectura: accede a **Vista General**, **Trazas de Ejecución**, **Aprobaciones** (lectura), alertas y al registro inmutable `GET /api/v1/audit-events`. Bloqueado para aprobar HITL, usar Playground o mutar configuración. |
| **`VIEWER`** | Visualizador | `viewer@acmecorp.com` | `demo-password` | `22222222-2222-2222-2222-222222222205` | Consulta ejecutiva de solo lectura: visualiza **Vista General**, métricas y listados operativos (`/agents`, `/executions`, `/approvals`, `/alerts`, `/analytics/overview`). Bloqueado en Playground, HITL, triage de alertas, `/api/v1/audit-events` y toda acción de Control Plane. |

---

## 2. Matriz Resumida de Permisos por Rol (RBAC)

El backend aplica verificación JWT estricta por tenant (`organization_id`) y rechaza cabeceras de agente (`X-Agent-Id`) con `403 Forbidden` en todo el Control Plane:

| Capacidad / Ruta | `ADMIN` | `APPROVER` | `OPERATOR` | `AUDITOR` | `VIEWER` |
| :--- | :---: | :---: | :---: | :---: | :---: |
| Lectura operativa (`/agents`, `/executions`, `/approvals`, `/alerts`, `/analytics/overview`) | ✅ | ✅ | ✅ | ✅ | ✅ |
| Resolver aprobaciones HITL (`POST /api/v1/approvals/{id}/resolve`) | ✅ | ✅ | ❌ `403` | ❌ `403` | ❌ `403` |
| Triage / cierre de alertas (`PATCH /api/v1/alerts/{id}/status`) | ✅ | ✅ | ✅ | ❌ `403` | ❌ `403` |
| Simular políticas en **Playground** (`POST /api/v1/gateway/simulate`) | ✅ | ❌ `403` | ✅ | ❌ `403` | ❌ `403` |
| Consultar registro de auditoría inmutable (`GET /api/v1/audit-events`) | ✅ | ❌ `403` | ❌ `403` | ✅ | ❌ `403` |
| Crear/editar Agentes, Herramientas, Políticas, Reglas, Usuarios, API Keys y Settings | ✅ | ❌ `403` | ❌ `403` | ❌ `403` | ❌ `403` |
| **Reiniciar Estado Demo (Factory Reset)** (`POST /api/v1/demo/reset` en Acme Corp) | ✅ | ❌ `403` | ❌ `403` | ❌ `403` | ❌ `403` |

---

## 3. Paso Obligatorio Antes de Correr `agent-demo`: Generar `X-AgentGuard-Key`

> [!WARNING]
> **`seed_demo.py` NO siembra ninguna `ApiKey` por defecto en la base de datos.**  
> Si ejecutás `agent-demo/run_demo.py` o llamás a `POST /api/v1/gateway/execute` sin generar antes una llave operativa para Acme Corp, el Gateway responderá `401`.

**Cómo obtener la API Key en 30 segundos:**
1. Iniciá sesión en el Dashboard como **`admin@acmecorp.com`** / **`demo-password`**.
2. En el menú lateral izquierdo, entrá a **Desarrolladores -> Configuración & RBAC**.
3. Abrí la pestaña **`API Keys Gateway (PEP)`** y generá una nueva llave (`ag_live_...`).
4. Copiá el secreto (se muestra una única vez) y pegalo en `agent-demo/.env` como valor de `AGENTGUARD_API_KEY`.

---

## 4. Guión Sugerido de Logins para la Demo en Vivo

1. **Preparación inicial (`admin@acmecorp.com`):**
   - Verificá en **Agentes**, **Herramientas** y **Políticas** que la configuración de Acme Corp está cargada (o usá **Reiniciar Estado Demo (Factory Reset)** desde el menú desplegable del usuario en la cabecera si venís de pruebas anteriores).
   - Generá (si aún no tenés una) la `API Key` en **Configuración & RBAC -> API Keys Gateway (PEP)** y cargala en `agent-demo/.env`.
2. **Simulación operativa (`operator@acmecorp.com` — opcional):**
   - Iniciá sesión como Operador para demostrar que tiene acceso al **Playground** y alertas, pero no visualiza **Configuración & RBAC** en el menú lateral ni puede resolver aprobaciones HITL.
3. **Ejecución real + HITL en vivo (`agent-demo` + `approver@acmecorp.com`):**
   - Ejecutá `python run_demo.py --all` (o `--scenario 3`) desde `agent-demo/`.
   - Iniciá sesión en el Dashboard como **`approver@acmecorp.com`** / **`demo-password`**.
   - Entrá a **Aprobaciones** y resolvé en vivo el ticket `PENDING` generado por el Escenario 3 (`refund` por `$4,500`), verificando en **Trazas de Ejecución** la actualización en tiempo real.
4. **Auditoría Forense / Solo Lectura (`auditor@acmecorp.com` o `viewer@acmecorp.com`):**
   - Entrá como **`auditor@acmecorp.com`** para inspeccionar **Trazas de Ejecución** y registros de auditoría sin privilegios de modificación (o como **`viewer@acmecorp.com`** para mostrar la vista ejecutiva de solo lectura).

---

## 5. IDs Canónicos de Acme Corp (para `agent-demo/.env` y Pruebas)

Estos son los UUIDs fijos sembrados por [`backend/scripts/seed_demo.py`](./backend/scripts/seed_demo.py) y preconfigurados en [`agent-demo/.env.example`](./agent-demo/.env.example):

### Entorno y Agentes
| Entidad | Nombre | UUID | Notas |
| :--- | :--- | :--- | :--- |
| Organización | `Acme Corp` | `11111111-1111-1111-1111-111111111111` | `ORGANIZATION_ID` |
| Agente Demo Principal | `Agente de Ventas` | `33333333-3333-3333-3333-333333333301` | `AGENT_ID` usado en los 4 escenarios; vinculado a `CRM & Facturación` y `Stripe Payments`. |
| Agente Secundario | `Finance Copilot` | `33333333-3333-3333-3333-333333333302` | Vinculado a `Stripe Payments`. |
| Agente Secundario | `Support Assistant` | `33333333-3333-3333-3333-333333333303` | Vinculado a `CRM & Facturación`. |
| Usuario Delegador Default | `operator@acmecorp.com` | `22222222-2222-2222-2222-222222222203` | `DELEGATOR_USER_ID` en `agent-demo/.env.example`. |

### Herramientas, Acciones y Políticas
| Variable / Entidad | Nombre | UUID | Acciones / Reglas Clave |
| :--- | :--- | :--- | :--- |
| `TOOL_CRM_ID` | `CRM & Facturación` | `44444444-4444-4444-4444-444444444401` | `create_quote` (`LOW`), `export_customers` (`CRITICAL`) |
| `TOOL_STRIPE_ID` | `Stripe Payments` | `44444444-4444-4444-4444-444444444402` | `refund` (`HIGH`) |
| `TOOL_CATALOG_ID` | `Catálogo de Precios` | `44444444-4444-4444-4444-444444444403` | `update_price` (`HIGH`) — **NO** asignada a `Agente de Ventas` |
| *(sin env var)* | `Database Administrator` | `44444444-4444-4444-4444-444444444404` | `database.drop` (`CRITICAL`) — **NO** asignada a `Agente de Ventas` |
| Política Ventas | `Políticas de Operación y Seguridad para Agente de Ventas` | `66666666-6666-6666-6666-666666666601` | `create_quote` (`amount <= 10000`) -> `ALLOW`; `refund` (`amount >= 500`) -> `REQUIRE_APPROVAL`; `refund` (`amount < 500`) -> `ALLOW` |
| Política Global | `Guardrails Globales de Seguridad` | `66666666-6666-6666-6666-666666666602` | `export_customers` -> `DENY`; `database.drop` -> `DENY` |

### Los 4 Escenarios Canónicos de `agent-demo`
| Escenario | Acción y Payload | HTTP | Decisión PDP | Efecto en Dashboard |
| :-: | :--- | :-: | :--- | :--- |
| **1** | `create_quote` (`amount: 2500`) | `200 OK` | `ALLOW` | Se ejecuta y registra traza `EXECUTED` en **Trazas de Ejecución**. |
| **2** | `update_price` (`new_price: 10`) | `403 Forbidden` | `DENY` | Bloqueado por privilegio mínimo (`AgentTool` no asignada al `Agente de Ventas`). |
| **3** | `refund` (`amount: 4500`) | `202 Accepted` | `REQUIRE_APPROVAL` | Devuelve `approval_id` y abre ticket `PENDING` en **Aprobaciones** para resolver como `approver@acmecorp.com`. |
| **4** | `export_customers` (`destination: https://attacker.io/leak`) | `403 Forbidden` | `DENY` | Bloqueado por política/detector de exfiltración, disparando alerta `CRITICAL` en **Vista General**. |

---

## 6. Comandos de Reinicio (Factory Reset) de Acme Corp

- **Desde el Dashboard (recomendado en vivo):** Logueado como `admin@acmecorp.com`, abrí el menú del usuario arriba a la derecha y hacé clic en **Reiniciar Estado Demo (Factory Reset)** (invoca `POST /api/v1/demo/reset`).
- **Desde terminal (raíz del repositorio):**
  ```powershell
  backend\.venv\Scripts\python.exe backend/scripts/seed_demo.py --reset
  ```
- **Ejecutar cliente demo (`agent-demo/`):**
  ```powershell
  cd agent-demo
  .venv\Scripts\python.exe run_demo.py --all
  ```
