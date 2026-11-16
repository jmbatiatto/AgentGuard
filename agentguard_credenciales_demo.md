# 🔐 AgentGuard — Guía Rápida de Credenciales y Roles Demo (Acme Corp)

**Proyecto:** AgentGuard (Plataforma SaaS B2B Multi-Tenant de Gobernanza y Autorización Contextual en Runtime para Agentes de IA)  
**Organización Demo:** `Acme Corp`  
**Persistencia:** PostgreSQL 16 genera todos los `UUID v4` de forma nativa (`gen_random_uuid()`)  
**Fuente de Verdad:** [`backend/scripts/seed_demo.py`](./backend/scripts/seed_demo.py)

> [!IMPORTANT]
> Este documento contiene las credenciales de acceso y roles RBAC del tenant oficial de demostración **Acme Corp**. La plataforma desacopla completamente cualquier UUID fijo: PostgreSQL 16 asigna UUIDs aleatorios nativos en cada siembra o reseteo, y el cliente CLI `agent-demo` los **descubre automáticamente en runtime** vía `GET /api/v1/gateway/context` utilizando únicamente tu `AGENTGUARD_API_KEY`. Para cambiar de perfil durante la demo en vivo, cerrá sesión desde el menú superior del usuario (**Cerrar sesión**) e iniciá sesión con JWT real en la pantalla de acceso (`AuthView`).

---

## 1. Credenciales de Usuarios (Acme Corp)

Todos los usuarios de **Acme Corp** comparten la misma contraseña para agilizar la demostración:

- **Contraseña única para los 5 usuarios:** `demo-password`

| Rol (`UserRole`) | Etiqueta en UI | Email (Login) | Contraseña | Alcance / Para qué usarlo en la Demo |
| :--- | :--- | :--- | :--- | :--- |
| **`ADMIN`** | Administrador | `admin@acmecorp.com` | `demo-password` | Control total de Acme Corp: configurar agentes, herramientas y políticas PDP; gestionar **Equipo & Roles RBAC**; generar/revocar **API Keys Gateway (PEP)**; usar **Playground**; resolver HITL/alertas; ver trazas y auditoría; único habilitado para **Reiniciar Estado Demo (Factory Reset)**. |
| **`APPROVER`** | Aprobador (HITL) | `approver@acmecorp.com` | `demo-password` | Oficial de cumplimiento / bucle humano: resuelve solicitudes `PENDING` en **Aprobaciones** (`POST /api/v1/approvals/{id}/resolve`, sellando su `approver_user_id` desde el JWT) y gestiona estado de alertas (`PATCH /api/v1/alerts/{id}/status`). Ideal para aprobar en vivo el reembolso del **Escenario 3**. |
| **`OPERATOR`** | Operador | `operator@acmecorp.com` | `demo-password` | Operación y pruebas: ejecuta simulaciones en **Playground** (`POST /api/v1/gateway/simulate`), realiza triage de alertas (`PATCH /api/v1/alerts/{id}/status`). No puede aprobar HITL ni editar políticas o API Keys. |
| **`AUDITOR`** | Auditor | `auditor@acmecorp.com` | `demo-password` | Cumplimiento y auditoría forense de solo lectura: accede a **Vista General**, **Trazas de Ejecución**, **Aprobaciones** (lectura), alertas y al registro inmutable `GET /api/v1/audit-events`. Bloqueado para aprobar HITL, usar Playground o mutar configuración. |
| **`VIEWER`** | Visualizador | `viewer@acmecorp.com` | `demo-password` | Consulta ejecutiva de solo lectura: visualiza **Vista General**, métricas y listados operativos (`/agents`, `/executions`, `/approvals`, `/alerts`, `/analytics/overview`). Bloqueado en Playground, HITL, triage de alertas, `/api/v1/audit-events` y toda acción de Control Plane. |

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

## 5. Entidades y Descubrimiento Dinámico de Acme Corp

PostgreSQL 16 genera todos los identificadores con `gen_random_uuid()`. El cliente CLI `agent-demo` y la interfaz gráfica descubren dinámicamente los UUIDs reales desde la API, eliminando la necesidad de constantes artificiales fijas.

### Entorno y Agentes
| Entidad | Nombre | Rol / Asignación en Acme Corp |
| :--- | :--- | :--- |
| Organización | `Acme Corp` | Tenant principal de demostración |
| Agente Demo Principal | `Agente de Ventas` | Agente protegido usado en los 4 escenarios; vinculado a `CRM & Facturación` y `Stripe Payments`. |
| Agente Secundario | `Finance Copilot` | Vinculado a `Stripe Payments`. |
| Agente Secundario | `Support Assistant` | Vinculado a `CRM & Facturación`. |
| Usuario Operador | `operator@acmecorp.com` | Operador autorizado del sistema. |

### Herramientas, Acciones y Políticas
| Herramienta | Protocolo | Acciones Atómicas / Reglas Clave |
| :--- | :--- | :--- |
| `CRM & Facturación` | REST | `create_quote` (`LOW`), `export_customers` (`CRITICAL`) |
| `Stripe Payments` | REST | `refund` (`HIGH`) |
| `Catálogo de Precios` | REST | `update_price` (`HIGH`) — **NO** asignada a `Agente de Ventas` (principio de privilegio mínimo) |
| `Database Administrator` | REST | `database.drop` (`CRITICAL`) — **NO** asignada a `Agente de Ventas` (guardrail destructivo) |
| Política Ventas | PDP | `create_quote` (`amount <= 10000`) -> `ALLOW`<br>`refund` (`amount >= 500`) -> `REQUIRE_APPROVAL`<br>`refund` (`amount < 500`) -> `ALLOW` |
| Política Global | PDP | `export_customers` -> `DENY` + Alerta CRITICAL (OWASP ASI03)<br>`database.drop` -> `DENY` |

### Los 4 Escenarios Canónicos de `agent-demo`
| Escenario | Acción y Payload | HTTP | Decisión PDP | Efecto en Dashboard |
| :-: | :--- | :--- | :--- | :--- |
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
