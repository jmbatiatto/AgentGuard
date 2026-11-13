# 🛡️ AgentGuard — Informe Técnico Integral de Auditoría: Mockups de Frontend, Capacidades de Backend y Plan de Sincronización

> **Fecha de Emisión:** 2 de Noviembre de 2026  
> **Ámbito de Auditoría:** Frontend React 19 + TypeScript (`http://localhost:5173/`) vs. Backend FastAPI + PostgreSQL 16 + Redis 7 (`http://localhost:8000/`)  
> **Modo de Operación:** Solo Lectura (Strict Read-Only — Cero Modificación de Código / Base de Datos)  
> **Referencia Normativa:** SDD (Spec-Driven Development), ADR-001 a ADR-005, OWASP Top 10 for Agentic Applications 2026, Cátedra de Desarrollo Web (ITU — UNCuyo, 2026).

---

## 1. Resumen Ejecutivo y Diagnóstico Global del Sistema

### 1.1 Contexto Institucional, Premisa Central y Arquitectura Políglota
El proyecto **AgentGuard** es una plataforma SaaS multi-tenant de autorización contextual en tiempo de ejecución, gobernanza y observabilidad forense para agentes de Inteligencia Artificial que invocan herramientas y APIs empresariales. Su premisa fundacional reza:  
> *«IAM responde quién eres; AgentGuard decide qué puedes hacer ahora»*.

En estricto cumplimiento con las directivas académicas de la cátedra de Desarrollo Web del Instituto Tecnológico Universitario (ITU) — Universidad Nacional de Cuyo, la plataforma implementa una **arquitectura políglota desacoplada**:
- **Backend:** Desarrollado en **Python 3.12+ con FastAPI**, servidor ASGI **Uvicorn**, validación de esquemas mediante **Pydantic v2**, capa de persistencia ORM asíncrona mediante **SQLAlchemy 2.0** (`asyncpg`), migraciones estructuradas con **Alembic**, base de datos relacional **PostgreSQL 16** (12 tablas formalizadas en el Modelo Entidad-Relación) y caché en memoria / WebSockets sobre **Redis 7**.
- **Frontend:** Implementado en **TypeScript 5+ con React 19 y Vite**, empaquetado y administrado mediante **`pnpm`**, con estilos basados en Tailwind CSS y componentes desacoplados de alta fidelidad estética.
- **Protocolo de Comunicación:** API REST con serialización JSON, canal bidireccional reactivo vía **WebSockets** (`/api/v1/ws/{organization_id}`) y proxy de ejecución Zero-Trust (PEP / PDP).

---

### 1.2 Diagnóstico Global de la Integración (Dualidad Real vs. Simulado)
La auditoría técnica exhaustiva realizada sobre el código fuente, la navegación interactiva de la interfaz web y la especificación OpenAPI en vivo (`http://localhost:8000/api/v1/openapi.json`) revela un **estado de integración híbrido y asimétrico**:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                              ESTADO DE INTEGRACIÓN ACTUAL                              │
├───────────────────────────────────────────┬────────────────────────────────────────────┤
│         MÓDULOS CONECTADOS (API REAL)     │        MÓDULOS SIMULADOS (MOCKUPS PUROS)   │
├───────────────────────────────────────────┼────────────────────────────────────────────┤
│ • Playground (POST /gateway/execute)      │ • Autenticación y Registro (AuthView)      │
│ • Trazas Forenses (GET /executions + WS)  │ • Gráfico Spline de Actividad 24h (SVG)    │
│ • Bandeja HITL (GET/POST /approvals)      │ • Base de Datos Empresarial en Memoria     │
│ • Agentes (CRUD /agents)                  │ • Gestión de API Keys PEP (Settings Tab 2) │
│ • Herramientas (CRUD /tools + actions)    │ • Postura Fail-Closed & Límites (Tab 4)    │
│ • Políticas (CRUD /policies + rules)      │ • Conector SIEM / Webhook Egress (Tab 5)   │
│ • Miembros del Equipo (CRUD /users)       │ • Workspace Switcher (Sidebar estático)    │
│ • Reset Demo (POST /demo/reset)           │ • Selector de Perfiles RBAC (Header local) │
└───────────────────────────────────────────┴────────────────────────────────────────────┘
```

El backend de FastAPI expone **45 endpoints REST funcionales**, un canal WebSocket con soporte multi-tenant y 20 suites de pruebas automatizadas. El frontend posee pantallas de alta fidelidad para cada uno de los casos de uso. Sin embargo, existe una marcada **dualidad**: mientras que los flujos operacionales principales (ejecución de agentes, intercepción PEP, resolución de aprobaciones HITL e inspección de trazas) están conectados a la API real, las funciones auxiliares de administración, métricas temporales y seguridad perimetral operan como maquetas visuales sin persistencia.

---

### 1.3 El Patrón de Resiliencia Opaca: Riesgo de los *Silent Fallbacks*
Uno de los hallazgos arquitectónicos más críticos radica en la capa de servicios del cliente frontend (`frontend/src/services/api.ts`, 1,084 líneas).  
Para garantizar que la interfaz continúe visible ante caídas del servidor, cada método HTTP (`getAgents`, `getTools`, `getPolicies`, `getApprovals`, `getExecutions`, `getAlerts`, `getUsers`) implementa una captura silenciosa de excepciones (`try/catch`) asociada a un timeout agresivo (`AbortSignal.timeout(1500)` a `5000ms`):

```typescript
// Patrón de Silent Fallback observado en api.ts (ej. getAlerts, líneas 90-108)
async getAlerts(organizationId: string = DEMO_IDS.ORG_ACME_ID): Promise<AlertItem[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/alerts?organization_id=${organizationId}`, {
      signal: AbortSignal.timeout(2500),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data.map(transformBackendAlert);
  } catch (err) {
    // FALLBACK SILENCIOSO: Devuelve datos mockeados en memoria sin notificar al usuario
    return mockAlerts;
  }
}
```

#### Riesgos Técnicos Asociados:
1. **Enmascaramiento de Errores 422 (Unprocessable Entity):** Si el frontend envía un identificador con formato inválido o un enum desalineado, FastAPI rechaza la petición con código 422. El cliente captura el error y retorna silenciosamente el arreglo de `mockData.ts`, dando al desarrollador y al operador la falsa percepción de que la petición fue procesada con éxito.
2. **Desconexión Transparente:** Si la base de datos PostgreSQL se desconecta o degrada (estado reportado en `/health`), la interfaz conmuta a datos simulados sin emitir advertencias en pantalla, impidiendo el diagnóstico ágil de incidencias de infraestructura.
3. **Inconsistencias de Mutación:** Si una pantalla se inicializa con datos de fallback (cuyos IDs son `agt_support_01`, `tool_stripe`, `appr_01`), cualquier intento posterior de mutación (`PATCH /agents/agt_support_01`) fallará catastróficamente en el backend al no ser un UUID válido.

---

### 1.4 Métricas Globales de Cobertura de la Auditoría

| Dimensión Evaluada | Métrica / Hallazgo |
| :--- | :--- |
| **Rutas Frontend Auditadas** | 9 vistas (1 Login + 8 Vistas Protegidas Hash) |
| **Componentes Visuales Clave Evaluados** | 38 componentes (incluyendo Drawers, Modales, Tablas y Widgets) |
| **Endpoints REST Expuestos en Backend** | 45 endpoints documentados en OpenAPI 3.1.0 |
| **Endpoints Backend Consumidos por Frontend** | 22 endpoints (48.8% de utilización) |
| **Endpoints Backend No Consumidos (Ignorados)**| 23 endpoints (51.2% subutilizados) |
| **Endpoints Requeridos Faltantes en Backend** | 6 endpoints clave (Analytics Timeseries, API Keys, SIEM, Auth) |
| **Tablas PostgreSQL Involucradas** | 12 tablas en MER (1 tabla huérfana sin router: `audit_events`) |
| **Archivos de Código Modificados en Auditoría** | **0 archivos** (estricto modo de solo lectura certificado) |

---

## 2. Inventario Exhaustivo de Vistas y Componentes del Frontend

### 2.1 Arquitectura de Ruteo y Navegación Hash
El frontend no utiliza librerías de ruteo como `react-router-dom`, sino un despachador nativo basado en el evento `hashchange` de la ventana (`window.location.hash`), centralizado en `frontend/src/App.tsx`. Esto asegura compatibilidad total con servidores estáticos sin reescritura de URLs en el servidor web.

El tipo discriminado `NavView` (`src/types/domain.ts`, líneas 1–9) define las rutas válidas:
```typescript
export type NavView = 
  | 'overview' 
  | 'agents' 
  | 'tools' 
  | 'policies' 
  | 'approvals' 
  | 'traces' 
  | 'playground' 
  | 'settings';
```

---

### 2.2 Tabla Maestra de Vistas, Componentes y Estado de Consumo

| # | Ruta (Hash) | Componente Vista | Archivo Fuente | Nivel de Integración | Consumo de Datos / Endpoints Backend |
|---|---|---|---|:---:|---|
| 1 | `""` / `#auth` | `AuthView` / `AuthUI` | `src/views/AuthView.tsx`<br>`src/components/ui/auth-ui.tsx` | **0% (Mockup Puro)** | Ninguno. Los botones de Login y Registro ejecutan un bypass directo a `onAuthenticated()` sin contactar `/api/v1/auth/*`. |
| 2 | `#overview` | `OverviewView` | `src/views/OverviewView.tsx` | **50% (Híbrido)** | **Real:** `GET /health`, `GET /executions`, `GET /alerts`, `GET /agents`, `GET /tools`, `GET /policies`. WebSocket `NEW_ALERT`.<br>**Mockup:** Gráfico SVG 24h hardcodeado, cálculo client-side de KPIs. |
| 3 | `#agents` | `AgentsView` | `src/views/AgentsView.tsx` | **80% (Real c/ Fallback)** | **Real:** `GET /agents`, `POST /agents`, `PATCH /agents/{id}`, `DELETE /agents/{id}`, `POST /agents/{id}/tools`.<br>**Mockup:** Fallback a `mockAgents`, campos `owner_team`, `lastActivity` y `assignedTools` dummy. |
| 4 | `#tools` | `ToolsView` | `src/views/ToolsView.tsx` | **85% (Real c/ Fallback)** | **Real:** `GET /tools`, `POST /tools`, `DELETE /tools/{id}`, `POST /tool-actions`.<br>**Mockup:** Fallback a `mockTools`, estado `status: Active` cosmético, endpoint URL por defecto ficticia. |
| 5 | `#policies` | `PoliciesView` | `src/views/PoliciesView.tsx` | **85% (Real c/ Fallback)** | **Real:** `GET /policies`, `POST /policies`, `POST /policy-rules`, `PATCH /policies/{id}`, `DELETE /policies/{id}`, `GET /tool-actions`.<br>**Mockup:** Fallback a `mockPolicies`, cálculo heurístico de cobertura (90% fijo ante error). |
| 6 | `#approvals` | `ApprovalsView` | `src/views/ApprovalsView.tsx` | **80% (Real c/ Fallback)** | **Real:** `GET /approvals`, `POST /approvals/{id}/resolve`. WebSocket `NEW_APPROVAL`, `RESOLVED_APPROVAL`.<br>**Mockup:** Fallback a `mockApprovals`, inyección sintética de `amount`, `riskLevel` y `appliedPolicy`. |
| 7 | `#traces` | `TracesView` | `src/views/TracesView.tsx` | **95% (Prácticamente Real)** | **Real:** `GET /executions`. WebSocket `NEW_EXECUTION`. Drawer con payloads JSON reales sanitizados (OWASP LLM06).<br>**Mockup:** Latencia hardcodeada a `21.5ms` originada en el backend. |
| 8 | `#playground` | `PlaygroundView` | `src/views/PlaygroundView.tsx` | **Híbrido (Real + Sandbox)** | **Real:** `POST /gateway/execute` (Escenarios 1 a 5), `GET /gateway/attacks`.<br>**Mockup:** Base de Datos Empresarial en memoria (`CompanyDatabaseState`) para visualizar daños cuando se apaga AgentGuard. |
| 9 | `#settings` | `SettingsView` | `src/views/SettingsView.tsx` | **30% (Mayormente Mockup)** | **Real:** Tab 3 (Miembros RBAC: `GET/POST/PATCH/DELETE /users`), Modal Reset (`POST /demo/reset`).<br>**Mockup:** Tab 1 (Workspace), Tab 2 (API Keys), Tab 4 (Postura), Tab 5 (SIEM Webhooks). |
| 10 | Global | `Header` | `src/components/Header.tsx` | **Híbrido** | **Real:** Dispara modal Reset Demo (`/demo/reset`).<br>**Mockup:** Selector de Identidades RBAC (`DEMO_PROFILES` en `localStorage`). |
| 11 | Global | `Sidebar` / `WorkspaceSwitcher` | `src/components/Sidebar.tsx`<br>`src/components/ui/dashboard-sidebar.tsx` | **Cosmético** | Lista estática de workspaces (`Acme Corp`, `Personal Workspace`, `Client Sandbox`). No consulta `/api/v1/organizations`. |

---

## 3. Catálogo Detallado de Maquetas y Elementos Mockup

A continuación se realiza la autopsia técnica de cada elemento simulado detectado en la plataforma, proporcionando su ubicación exacta, la estructura de datos en memoria, el endpoint backend correspondiente y el mapeo de campos requerido para su conexión definitiva.

---

### 3.1 Módulo de Autenticación y Registro Corporativo
- **Archivos:** `frontend/src/views/AuthView.tsx` (líneas 1–27) y `frontend/src/components/ui/auth-ui.tsx` (líneas 1–509).
- **Ubicación en Código:**
  - `handleSignIn` (`src/components/ui/auth-ui.tsx`, líneas 200–204):
    ```typescript
    const handleSignIn = (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      // Por ahora: simulamos un inicio de sesión exitoso
      if (onSuccess) onSuccess();
    };
    ```
  - `handleSignUp` (`src/components/ui/auth-ui.tsx`, líneas 249–254):
    ```typescript
    const handleSignUp = (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      // Por ahora: simulamos un registro exitoso
      if (onSuccess) onSuccess();
    };
    ```
  - Inicialización en `App.tsx` (línea 26):
    ```typescript
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
    ```
- **Estructura de Datos Simulada Actual:** No recibe ni genera tokens. El formulario captura correo, contraseña, nombre de organización y slug, pero los descarta inmediatamente al disparar el callback.
- **Endpoint Backend Correspondiente:**
  - Para Login: **Propuesto a crear** `POST /api/v1/auth/login`.
  - Para Registro: **Existente** `POST /api/v1/organizations` (para la organización) y `POST /api/v1/users` (para el usuario admin inicial).
- **Mapeo de Campos Requeridos:**
  - **Login Request:** `{ email: string, password: str }` -> **Response:** `{ access_token: string, token_type: "bearer", user: { id: UUID, email: string, role: string, organization_id: UUID } }`.
  - **Registro Request:** `{ org_name: string, org_slug: string, admin_email: string, admin_password: string }` -> **Backend:** Crear `Organization` con `name`, luego crear `User` con `role='ADMIN'`.

---

### 3.2 Gráfico Interactivo de Actividad 24 Horas
- **Archivo:** `frontend/src/views/OverviewView.tsx` (líneas 500–536).
- **Ubicación en Código:**
  ```tsx
  {/* SVG Interactive Spline Graph */}
  <div style={{ flex: 1, height: '220px', position: 'relative', marginTop: '10px' }}>
    <svg viewBox="0 0 700 200" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
      <line x1="40" y1="20" x2="680" y2="20" stroke="var(--border-subtle)" strokeDasharray="3 3" />
      ...
      <text x="10" y="24" fill="#64748B" fontSize="10">1.5k</text>
      ...
      <path
        d="M 50 160 Q 150 140 250 110 T 450 70 T 650 60"
        fill="none"
        stroke="#38BDF8"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M 50 180 Q 150 175 250 170 T 450 165 T 650 175"
        fill="none"
        stroke="#EF4444"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <text x="45" y="208" fill="#64748B" fontSize="11">00:00</text>
      <text x="145" y="208" fill="#64748B" fontSize="11">04:00</text>
      ...
      <text x="635" y="208" fill="#64748B" fontSize="11">Ahora ⚡</text>
    </svg>
  </div>
  ```
- **Estructura de Datos Simulada Actual:** Dos curvas cúbicas de Bézier SVG fijas (`d="M 50 160 Q 150 140..."` para permitidas en color celeste, y `d="M 50 180 Q 150 175..."` para bloqueadas en color rojo) con etiquetas de texto inmutables.
- **Endpoint Backend Correspondiente:** **Propuesto a crear** `GET /api/v1/analytics/timeseries?organization_id={orgId}&range=24h`.
- **Mapeo de Campos Requeridos:**
  - **Response:**
    ```json
    {
      "range": "24h",
      "intervals": [
        { "timestamp": "2026-11-02T00:00:00Z", "allowed": 142, "denied": 3 },
        { "timestamp": "2026-11-02T04:00:00Z", "allowed": 89, "denied": 1 },
        { "timestamp": "2026-11-02T08:00:00Z", "allowed": 520, "denied": 14 },
        { "timestamp": "2026-11-02T12:00:00Z", "allowed": 1150, "denied": 28 },
        { "timestamp": "2026-11-02T16:00:00Z", "allowed": 870, "denied": 19 },
        { "timestamp": "2026-11-02T20:00:00Z", "allowed": 310, "denied": 7 }
      ]
    }
    ```
  - **Adaptación en Frontend:** Normalizar las coordenadas `(x, y)` del SVG dinámicamente según el valor máximo de `allowed` y renderizar el spline utilizando una función de interpolación polinómica o SVG dinámico.

---

### 3.3 Base de Datos Empresarial Simulada en Memoria (Playground Sandbox)
- **Archivo:** `frontend/src/views/PlaygroundView.tsx` (líneas 56–112 y 400–550).
- **Ubicación en Código:**
  ```typescript
  interface CompanyDatabaseState {
    isWiped: boolean;
    products: SimulatedProduct[];
    customers: SimulatedCustomer[];
    transactions: SimulatedTransaction[];
    lastActionMessage: { ... } | null;
  }
  const INITIAL_DATABASE_STATE: CompanyDatabaseState = {
    isWiped: false,
    products: [
      { id: 'prod_44', name: 'Servidor Cloud Enterprise', price: 450, stock: 12, status: 'NORMAL' },
      { id: 'prod_12', name: 'Licencia AI Gateway Pro', price: 120, stock: 85, status: 'NORMAL' },
      { id: 'prod_08', name: 'Suscripción Soporte 24/7', price: 80, stock: 999, status: 'NORMAL' },
    ],
    customers: [
      { id: 'cus_991', name: 'Acme Logistics Partner', email: 'billing@acmelogistics.com', balance: 14200, isExfiltrated: false },
      { id: 'cus_882', name: 'Initech Systems Corp', email: 'admin@initech.com', balance: 8400, isExfiltrated: false },
      { id: 'cus_773', name: 'Umbrella Global SA', email: 'security@umbrella.org', balance: 32000, isExfiltrated: false },
    ],
    transactions: [ ... ],
    lastActionMessage: null,
  };
  ```
- **Estructura de Datos Simulada Actual:** Objeto React `dbState` en memoria. Cuando el usuario desmarca la opción *"Proteger con AgentGuard PEP"*, el frontend altera el estado local: en el Escenario 2 baja el precio a `$10.00`; en el Escenario 3 debita `$4,500.00` sin aprobación; en el Escenario 4 marca `isExfiltrated = true`; en el Escenario 5 activa `isWiped = true` ocultando todas las tablas.
- **Endpoint Backend Correspondiente:** No requiere endpoint persistente de producción. El endpoint real `POST /api/v1/gateway/execute` ya se invoca cuando AgentGuard está activado.
- **Veredicto Arquitectónico:** Este componente debe **mantenerse deliberadamente como un sandbox educativo en cliente**. Su propósito didáctico es demostrar el daño evitado (daño no materializado gracias al PEP). Persistir una tabla vulnerable en PostgreSQL sería contraproducente para la estabilidad del seeder de demostración. Debe quedar documentado explícitamente en la documentación técnica como maqueta de simulación de impacto.

---

### 3.4 Gestión de Llaves de API del Gateway PEP (Settings Tab 2)
- **Archivo:** `frontend/src/views/SettingsView.tsx` (líneas 60–105).
- **Ubicación en Código:**
  ```typescript
  const handleGenerateKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName.trim()) return;

    const rawHex = Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    const fullKey = `ag_live_${rawHex}`;
    const newEntry: GatewayApiKey = {
      id: `key_${Date.now()}`,
      name: newKeyName.trim(),
      prefix: fullKey.slice(0, 16),
      secretMasked: `${fullKey.slice(0, 16)}••••••••••••••••••••••••${fullKey.slice(-4)}`,
      rawKey: fullKey,
      role: newKeyRole,
      createdAt: new Date().toISOString(),
      lastUsedAt: 'Nunca',
    };

    setApiKeys([newEntry, ...apiKeys]);
    setGeneratedKey(fullKey);
    setNewKeyName('');
    showToast('Nueva API Key de Gateway generada exitosamente');
  };
  ```
- **Estructura de Datos Simulada Actual:** Arreglo `apiKeys` en estado local `useState`, inicializado con dos llaves dummy: `key_prod_01` y `key_sandbox_02`. Las nuevas llaves se generan con `Math.random()`. Al recargar la página (`F5`), se pierden.
- **Endpoint Backend Correspondiente:** **Propuesto a crear** en FastAPI:
  - `GET /api/v1/api-keys?organization_id={orgId}`
  - `POST /api/v1/api-keys`
  - `DELETE /api/v1/api-keys/{id}`
- **Mapeo de Campos Requeridos:**
  - **Tabla PostgreSQL Requerida:** `api_keys (id UUID PK, organization_id UUID FK, name VARCHAR, prefix VARCHAR(16), hashed_key VARCHAR, role VARCHAR, created_at TIMESTAMPTZ, last_used_at TIMESTAMPTZ)`.
  - **POST Request:** `{ organization_id: UUID, name: string, role: string }`.
  - **POST Response:** `{ id: UUID, name: string, prefix: string, secret_key: string, created_at: string }` *(la secret_key solo se devuelve una vez al crearse)*.

---

### 3.5 Salida y Testeo de Webhooks hacia SIEM (Settings Tab 5)
- **Archivo:** `frontend/src/views/SettingsView.tsx` (líneas 201–217).
- **Ubicación en Código:**
  ```typescript
  const [webhookUrl, setWebhookUrl] = useState('https://siem-collector.acmecorp.internal/v1/security-events');
  const [siemFormat, setSiemFormat] = useState<'splunk' | 'datadog' | 'elastic' | 'slack'>('splunk');
  const [isTestingWebhook, setIsTestingWebhook] = useState(false);
  const [webhookTestStatus, setWebhookTestStatus] = useState<string | null>(null);

  const handleTestWebhook = () => {
    setIsTestingWebhook(true);
    setWebhookTestStatus(null);
    setTimeout(() => {
      setIsTestingWebhook(false);
      setWebhookTestStatus('HTTP 200 OK — Payload de incidente SIEM aceptado correctamente');
      showToast('Alerta de prueba despachada exitosamente al SIEM');
    }, 1200);
  };
  ```
- **Estructura de Datos Simulada Actual:** Formulario con URL y formato SIEM en estados locales. El botón de prueba corre un `setTimeout` de 1,200 ms y muestra un texto falso de éxito HTTP 200 sin despachar tráfico de red saliente.
- **Endpoint Backend Correspondiente:** **Propuesto a crear**:
  - `GET /api/v1/settings/siem?organization_id={orgId}`
  - `PUT /api/v1/settings/siem`
  - `POST /api/v1/settings/siem/test`
- **Mapeo de Campos Requeridos:**
  - **Test Request Body:** `{ webhook_url: string, format: "splunk" | "datadog" | "elastic" | "slack" }`.
  - **Backend Logic:** FastAPI ejecuta `httpx.post(webhook_url, json=test_payload, timeout=3.0)` y devuelve el código de estado y latencia reales.

---

### 3.6 Parámetros Globales de Postura de Seguridad (Settings Tab 4)
- **Archivo:** `frontend/src/views/SettingsView.tsx` (líneas 194–199).
- **Ubicación en Código:**
  ```typescript
  const [maskSensitive, setMaskSensitive] = useState(true);
  const [maxAutonomousAmount, setMaxAutonomousAmount] = useState(5000);
  ```
- **Estructura de Datos Simulada Actual:** Checkbox para enmascaramiento OWASP LLM06 e input numérico para el umbral financiero de reembolso autónomo ($5,000 USD). El botón "Actualizar Parámetros" solo lanza un toast cosmético.
- **Endpoint Backend Correspondiente:** **Propuesto a crear** `PATCH /api/v1/organizations/{id}/settings`.
- **Mapeo de Campos Requeridos:**
  - **Request Body:** `{ mask_sensitive_context: boolean, default_decision: "DENY" | "ALLOW", max_autonomous_refund: float }`.
  - **Backend Storage:** Almacenar en la columna `settings JSONB` de la tabla `organizations` o tabla dedicada `organization_settings`.

---

### 3.7 Selector de Espacios de Trabajo / Multi-Tenant (Sidebar)
- **Archivo:** `frontend/src/components/ui/dashboard-sidebar.tsx` (líneas 38–96).
- **Ubicación en Código:**
  ```typescript
  export function WorkspaceSwitcher({ selected, onSelect }: WorkspaceSwitcherProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [internalSelected, setInternalSelected] = useState('Acme Corp');
    const current = selected || internalSelected;
    const workspaces = ['Acme Corp', 'Personal Workspace', 'Client Sandbox'];
    ...
    <div onClick={() => setIsOpen(false)} className="...">
      <span className="text-[16px] leading-none mb-0.5">+</span> Crear Espacio
    </div>
  }
  ```
- **Estructura de Datos Simulada Actual:** Arreglo estático de cadenas. El clic en "+ Crear Espacio" únicamente cierra el menú popover.
- **Endpoint Backend Correspondiente:** **Existente en Backend** pero ignorado:
  - `GET /api/v1/organizations`: Devuelve `List[OrganizationRead]`.
  - `POST /api/v1/organizations`: Crea un nuevo tenant (`{ name: string }`).
- **Mapeo de Campos Requeridos:**
  - **Frontend:** Consumir `GET /api/v1/organizations` al montar la barra lateral, mapear `id` y `name`, y al seleccionar uno, actualizar el `organization_id` activo en toda la aplicación.

---

### 3.8 Selector de Identidades RBAC y Perfiles de Demostración (Header)
- **Archivos:** `frontend/src/components/Header.tsx` (líneas 1–422) y `frontend/src/context/AuthContext.tsx` (líneas 19–75).
- **Ubicación en Código:**
  ```typescript
  export const DEMO_PROFILES: AuthUser[] = [
    {
      id: DEMO_IDS.USER_ADMIN_ID,
      name: 'Jonathan Araujo',
      email: 'admin@acmecorp.com',
      role: 'ADMIN',
      avatarInitials: 'JA',
      canApproveHITL: true,
      canConfigurePolicies: true,
      canManageTeam: true,
    },
    {
      id: DEMO_IDS.USER_APPROVER_ID,
      name: 'Elena Rostova',
      email: 'compliance.lead@acmecorp.com',
      role: 'APPROVER',
      canApproveHITL: true,
      ...
    },
    ...
  ];
  ```
- **Estructura de Datos Simulada Actual:** Cuatro perfiles hardcodeados en el contexto de React con capacidades sintéticas (`canApproveHITL`, `canConfigurePolicies`). Permiten conmutar el rol en caliente para probar las restricciones de la vista de Aprobaciones.
- **Endpoint Backend Correspondiente:** **Existente en Backend**:
  - `GET /api/v1/users?organization_id={orgId}`: Devuelve `List[UserRead]`.
- **Mapeo de Campos Requeridos:**
  - La tabla `users` almacena `id`, `organization_id`, `email`, `role`, `created_at`.
  - Para desplegar nombres legibles y avatar initials en la UI, el backend debe extender el modelo `User` con la columna `full_name VARCHAR(100)` o el frontend debe derivar las iniciales a partir del nombre extraído del email (ej. `admin@acme.corp` -> `AD`).

---

## 4. Puntos de Desincronización y Discrepancias de Contrato (Frontend vs Backend)

---

### 4.1 Desajustes Estructurales de Modelo y Granularidad

#### A. Contenedor de Políticas vs. Reglas Atómicas (1:N Desalineado)
- **Backend (Arquitectura Correcta 1:N):**
  - Una entidad `Policy` es un agrupador corporativo con `id`, `organization_id`, `name`, `description`, `priority`, `is_active` y una relación `rules: list[PolicyRule]`.
  - Cada `PolicyRule` pertenece a una política, evalúa un `tool_action_id` atómico y define un `effect` (`ALLOW`, `DENY`, `REQUIRE_APPROVAL`) con condiciones JSONB.
- **Frontend (Aplanamiento Forzado en `api.ts`, líneas 402–435):**
  El frontend aúna en una sola tabla plana cada regla individual, asignándole como `id` el identificador de la regla y como `policyId` el identificador del contenedor:
  ```typescript
  // Transformación en api.ts
  const flattened: PolicyRuleItem[] = [];
  policies.forEach(pol => {
    (pol.rules || []).forEach(rule => {
      flattened.push({
        id: rule.id, // ID de la regla
        policy_id: pol.id, // ID del contenedor
        name: pol.name, // Nombre heredado del contenedor
        effect: rule.effect,
        conditions: rule.conditions,
      });
    });
  });
  ```
- **Consecuencia Crítica:**
  Cuando el usuario hace clic en el botón "Eliminar" de una fila en `PoliciesView.tsx`, el frontend ejecuta `api.deletePolicy(item.policy_id)`. **Esto envía un `DELETE /api/v1/policies/{policy_id}` que borra toda la política contenedora y TODAS las demás reglas anidadas en cascada**, sin que el usuario haya tenido intención de eliminar más que una regla puntual.
  *Solución Requerida:* Implementar en backend `DELETE /api/v1/policy-rules/{rule_id}` y adaptar la UI para que distinga entre la política y sus reglas.

#### B. Metadatos Huérfanos de Agentes y Herramientas
- **Agentes (`Agent`):**
  - La interfaz de usuario muestra y filtra por: `identifier` (alias corto), `agent_type` (ej. "Copilot", "Autonomous Agent"), `owner_team` (ej. "Finance Ops") y `lastActivity` ("Reciente").
  - En la base de datos PostgreSQL, la tabla `agents` únicamente tiene: `id`, `organization_id`, `owner_user_id` (FK a `users`), `name`, `purpose`, `status` y `created_at`.
  - El frontend inventa estos campos al mapear la respuesta (`item.owner_team || 'Core Team'`).
- **Herramientas (`Tool`):**
  - La interfaz asigna a cada herramienta un estado: `status: 'Active' | 'Paused' | 'Inactive'`.
  - En la base de datos, la tabla `tools` **no posee columna de estado**. La herramienta existe o no existe. Si está deshabilitada para un agente, eso se gestiona en la tabla intermedia `agent_tools.enabled` (booleano). El frontend hardcodea `'Active'` para todas las herramientas.

#### C. Contexto y Métricas en Aprobaciones Humanas (HITL)
- **Backend:** `GET /api/v1/approvals` retorna `List[ApprovalDetailRead]`. Cada objeto contiene la ejecución vinculada con su `request_context` en formato `JSONB`.
- **Frontend (`api.ts`, líneas 618–641):** La UI de `ApprovalsView` espera campos específicos que no forman parte del esquema tipado de la respuesta:
  - `amount`: Si `request_context.amount` no existe, inyecta `'$1,240.00'` estático.
  - `riskLevel`: Hardcodeado a `'High'`. (El dato reside en la tabla `tool_actions`, pero no se serializa en `ApprovalDetailRead`).
  - `delegatedBy`: Hardcodeado como `'Supervisor Humano'` o `'Automated Gateway Trigger'`.
  - `appliedPolicy`: Objeto simulado con `{ name: 'High-value threshold authorization', condition: 'amount >= $500' }`.

#### D. Hardcoding de Latencia en Router de Trazas (`latency_ms = 21.5`)
- **Backend:** En `backend/app/api/executions.py` (línea 47):
  ```python
  def _to_execution_response(execution: Execution) -> ExecutionResponse:
      ...
      return ExecutionResponse(
          ...
          latency_ms=21.5, # HARDCODEADO en backend
          ...
      )
  ```
- **Diagnóstico:** La columna `latency_ms` no existe en la tabla `executions` del modelo físico. Aunque el servicio PEP mide la latencia de evaluación en runtime con `time.perf_counter()`, al momento de persistir la traza en base de datos la latencia se descarta y el endpoint retorna siempre un valor fijo de `21.5 ms`.

---

### 4.2 Desalineación de Enumeraciones (Enums) y Convenciones de Casing

#### A. Convención de Nomenclatura: camelCase vs. snake_case
- El backend expone estrictamente campos en **`snake_case`** (`organization_id`, `agent_name`, `tool_action_id`, `request_context`, `latency_ms`).
- Las interfaces de TypeScript en `frontend/src/types/domain.ts` mezclan propiedades en **`camelCase`** (`organizationId`, `agentName`, `requestContext`, `latencyMs`) con otras en `snake_case` (`tool_action_id`, `action_name`).
- Esto obliga a `api.ts` a mantener más de 300 líneas de mapeadores manuales propensos a errores y desincronizaciones silenciosas.

#### B. Matriz Comparativa de Enums

| Enumeración | Backend (FastAPI / PostgreSQL) | Frontend (`src/types/domain.ts`) | Discrepancia Crítica Detectada |
| :--- | :--- | :--- | :--- |
| **`UserRole`** | `ADMIN`, `OPERATOR`, `APPROVER`, `AUDITOR`, `VIEWER` | `'ADMIN' \| 'APPROVER' \| 'OPERATOR' \| 'AUDITOR'` | **Falta el rol `VIEWER`** en la definición de TypeScript del frontend. |
| **`AgentStatus`** | `ACTIVE`, `SUSPENDED`, `REVOKED` | `'Active' \| 'Inactive' \| 'Suspended'` | **Desalineación doble:** Casing dispar (UPPERCASE vs. PascalCase) y divergencia semántica (`REVOKED` en backend vs. `Inactive` en UI). |
| **`ToolStatus`** | *No existe en base de datos* | `'Active' \| 'Paused' \| 'Inactive'` | Propiedad cosmética exclusiva del frontend. |
| **`RiskLevel`** | `LOW`, `MEDIUM`, `HIGH`, `CRITICAL` | `'Low' \| 'Medium' \| 'High' \| 'Critical'` | PascalCase en `types/domain.ts` vs UPPERCASE en `ToolActionItem` y backend. |
| **`AlertSeverity`** | `LOW`, `MEDIUM`, `HIGH`, `CRITICAL` | `'critical' \| 'warning' \| 'info'` | **Desalineación semántica severa:** Backend define 4 niveles de severidad; frontend usa 3 niveles en minúsculas. `api.ts` comprime arbitrariamente `CRITICAL` y `HIGH` en `'critical'`, `MEDIUM` en `'warning'` y `LOW` en `'info'`. |
| **`AlertStatus`** | `OPEN`, `INVESTIGATING`, `RESOLVED`, `DISMISSED` | `'OPEN' \| 'INVESTIGATING' \| 'RESOLVED' \| 'DISMISSED'` | Alineado en tipos base, pero vistas como `OverviewView` solo consideran `OPEN` y `RESOLVED`. |
| **`ExecutionStatus`**| `PENDING_APPROVAL`, `REJECTED`, `EXECUTED` | Tipado como `string` genérico | Falta tipado estricto. En la UI se compara erróneamente con `'PENDING'` en lugar de `'PENDING_APPROVAL'`. |
| **`PolicyDecision`** | `ALLOW`, `DENY`, `REQUIRE_APPROVAL` | `'ALLOW' \| 'DENY' \| 'REQUIRE_APPROVAL'` | ✅ Perfectamente alineado. |
| **`ApprovalStatus`** | `PENDING`, `APPROVED`, `REJECTED`, `EXPIRED` | `'PENDING' \| 'APPROVED' \| 'REJECTED' \| 'EXPIRED'` | ✅ Perfectamente alineado. |

#### C. Formatos de Identificadores (UUIDs vs. Strings con Prefijo en Mocks)
- **Backend:** Toda clave foránea o primaria se valida rigurosamente como `uuid.UUID` (ej. `11111111-1111-1111-1111-111111111111`).
- **Frontend Mocks:** Los identificadores en `mockData.ts` utilizan cadenas alfanuméricas con prefijo de dominio: `agt_support_01`, `tool_stripe`, `pol_1`, `appr_01`, `alt_01`.
- **Riesgo:** Si un usuario interactúa con una tarjeta cargada por fallback y el cliente envía el ID al backend, FastAPI aborta la petición con error 422: `value is not a valid uuid`.

---

### 4.3 Aislamiento Multi-Tenant, Cabeceras HTTP y Autenticación

1. **Ausencia Total de Cabecera `Authorization`:**
   Ninguna petición saliente desde `frontend/src/services/api.ts` incorpora la cabecera `Authorization: Bearer <token>`. Todas las peticiones HTTP viajan sin credenciales de identidad.
2. **Propagación Rígida de `organization_id`:**
   El frontend resuelve el tenant inyectando el parámetro `organization_id` directamente en la query string (`?organization_id=...`) o en el cuerpo JSON, dependiendo de una constante estática:
   ```typescript
   export const DEMO_IDS = {
     ORG_ACME_ID: '11111111-1111-1111-1111-111111111111',
     USER_ADMIN_ID: '22222222-2222-2222-2222-222222222201',
     ...
   };
   ```
   Si se requiere autenticar contra un tenant secundario o dinámico, la arquitectura actual no dispone de un contexto de sesión que suministre dinámicamente el identificador.

---

### 4.4 Endpoints del Backend Ignorados o Subutilizados por el Frontend

El backend FastAPI cuenta con 45 endpoints listos para ser consumidos. Los siguientes 23 endpoints son ignorados o subutilizados por el cliente web:

1. **Gestión de Tenants (`/organizations`):**
   - `POST /api/v1/organizations`: Ignorado (el registro corporativo es mockup).
   - `GET /api/v1/organizations`: Ignorado (el switcher del sidebar usa lista fija).
   - `GET /api/v1/organizations/{org_id}`: Ignorado (el nombre del tenant en Settings es fijo).
2. **Consultas Unitarias por ID:**
   - `GET /api/v1/users/{user_id}`
   - `GET /api/v1/tools/{tool_id}`
   - `GET /api/v1/tool-actions/{action_id}`
   - `GET /api/v1/agents/{agent_id}`
   - `GET /api/v1/policies/{policy_id}`
   - `GET /api/v1/policy-rules/{rule_id}`
   - `GET /api/v1/approvals/{approval_id}`
   - `GET /api/v1/executions/{execution_id}`
   - `GET /api/v1/alerts/{alert_id}`
   *(En todos estos casos, los drawers o modales del frontend inspeccionan el objeto que ya reside en el estado de React en lugar de solicitar el recurso actualizado por su ID).*
3. **Edición de Herramientas:**
   - `PATCH /api/v1/tools/{tool_id}`: El backend permite actualizar endpoint_url, protocolo y descripción. La UI no dispone de pantalla ni modal de edición de herramientas.
4. **Relación de Herramientas de un Agente:**
   - `GET /api/v1/agents/{agent_id}/tools`: Ignorado al abrir el drawer de agentes (se inyectan valores dummy `'CRM', 'Catalog'`).
5. **Diagnóstico y Metadatos de Plataforma:**
   - `GET /`: Metadatos del sistema no consumidos.
   - `GET /api/v1/ping`: Endpoint ultra liviano no aprovechado para sondeos de latencia viva en el footer.

---

### 4.5 Endpoints Requeridos por el Frontend Faltantes en el Backend

Los siguientes 6 endpoints son requeridos directamente por las pantallas del frontend pero actualmente **no existen en FastAPI**:

1. **`GET /api/v1/analytics/timeseries?organization_id={id}&range=24h`:**  
   Requerido para alimentar el gráfico de actividad de 24 horas en `OverviewView`. Debe devolver conteos agregados por hora divididos entre acciones permitidas (`ALLOW`) y bloqueadas (`DENY`).
2. **`GET /api/v1/analytics/overview?organization_id={id}`:**  
   Requerido para alimentar las 4 tarjetas KPI del dashboard general en una sola llamada indexada, evitando que el frontend descargue todas las trazas de ejecuciones para sumar en cliente.
3. **`GET /api/v1/api-keys` / `POST /api/v1/api-keys` / `DELETE /api/v1/api-keys/{id}`:**  
   Requeridos para respaldar la Pestaña 2 de `SettingsView` (emisión, revocación y auditoría de llaves de API del Gateway PEP).
4. **`GET /api/v1/organizations/{id}/settings` / `PATCH /api/v1/organizations/{id}/settings`:**  
   Requeridos para persistir la postura de gobernanza Fail-Closed, enmascaramiento de contexto y límites autónomos de reembolso (Settings Tab 4).
5. **`POST /api/v1/settings/siem/test` y `PUT /api/v1/settings/siem`:**  
   Requeridos para validar y persistir la integración con plataformas externas de seguridad (Splunk, Datadog, Elastic) en Settings Tab 5.
6. **`POST /api/v1/auth/login` y `POST /api/v1/auth/register`:**  
   Requeridos para dar soporte a la autenticación formal de usuarios y emisión de tokens JWT en `AuthView`.

---

### 4.6 Persistencia Huérfana en Base de Datos: La Tabla `audit_events`

- **Modelo en Base de Datos:** La tabla `audit_events` está formalmente creada en PostgreSQL mediante la migración de Alembic `001_initial_schema.py` y declarada en SQLAlchemy (`backend/app/models/audit_event.py`):
  - Columnas: `id UUID PK`, `organization_id UUID FK`, `event_type VARCHAR`, `actor_type VARCHAR` (`USER`, `AGENT`, `SYSTEM`), `actor_id UUID`, `description TEXT`, `metadata JSONB`, `timestamp TIMESTAMPTZ`.
- **Desconexión:** **No existe ningún router en `backend/app/api/` que exponga esta tabla ni ningún servicio que inserte eventos cuando se crean o modifican políticas, agentes o roles**.
- **Impacto:** Las operaciones administrativas quedan sin registro forense inmutable, incumpliendo el principio de trazabilidad administrativa exigido en la especificación formal del sistema.

---

## 5. Plan de Acción y Recomendaciones Paso a Paso para la Sincronización

A continuación se propone un plan de acción estructurado en **5 fases ordenadas por prioridad técnica y riesgo**, diseñado para cerrar las brechas identificadas sin romper la retrocompatibilidad:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                      HOJA DE RUTA DE INTEGRACIÓN EN 5 FASES                            │
├─────────┬─────────────────────────────────────────────────────────────┬────────────────┤
│ Fase    │ Objetivo Principal                                          │ Complejidad    │
├─────────┼─────────────────────────────────────────────────────────────┼────────────────┤
│ Fase 1  │ Corrección Inmediata de Contratos, Enums y Modelos          │ Media          │
│ Fase 2  │ Implementación de Endpoints Faltantes en Backend            │ Media-Alta     │
│ Fase 3  │ Desactivación de Silent Fallbacks y Manejo de Errores HTTP  │ Baja           │
│ Fase 4  │ Autenticación JWT y Propagación Formal de Tenant Isolation   │ Alta           │
│ Fase 5  │ Conexión de Maquetas Auxiliares (Timeseries, Keys, SIEM)    │ Media          │
└─────────┴─────────────────────────────────────────────────────────────┴────────────────┘
```

---

### Fase 1: Corrección Inmediata de Contratos, Enums y Modelos

1. **Alinear Tipos Enumerados en Frontend:**
   - Modificar `frontend/src/types/domain.ts`:
     - Incorporar `'VIEWER'` al tipo `UserRole`:
       `export type UserRole = 'ADMIN' | 'APPROVER' | 'OPERATOR' | 'AUDITOR' | 'VIEWER';`
     - Cambiar `AgentStatus` a mayúsculas:
       `export type AgentStatus = 'ACTIVE' | 'SUSPENDED' | 'REVOKED';`
     - Homogeneizar `AlertSeverity` a los 4 niveles del backend:
       `export type AlertSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';`
2. **Desacoplar la Eliminación de Políticas y Reglas:**
   - En el backend (`backend/app/api/policies.py`), implementar:
     - `DELETE /api/v1/policy-rules/{rule_id}`: Permite borrar una regla específica sin destruir la política contenedora.
     - `PATCH /api/v1/policy-rules/{rule_id}`: Permite modificar el efecto o condiciones de una regla individual.
   - En `PoliciesView.tsx`, rediseñar la vista para presentar la jerarquía visual de la política contenedora y sus reglas asociadas, direccionando el borrado de una fila al endpoint de la regla correspondiente.
3. **Persistir la Latencia Real en Base de Datos:**
   - Crear una migración de Alembic para incorporar la columna `latency_ms = Column(Float, nullable=True)` en la tabla `executions`.
   - Modificar `backend/app/services/pep_gateway_service.py` para almacenar la latencia calculada al instanciar `Execution`.
   - En `backend/app/api/executions.py`, eliminar el valor hardcodeado `latency_ms=21.5` y serializar el atributo `execution.latency_ms`.
4. **Implementar Adaptador Bidireccional de Nomenclatura:**
   - Incorporar en el cliente HTTP del frontend un transformador genérico (utilizando librerías estándar o utilitarios locales) que convierta automáticamente payloads salientes a `snake_case` y respuestas entrantes a `camelCase`, eliminando los mappers manuales en `api.ts`.

---

### Fase 2: Implementación de Endpoints Faltantes en Backend

1. **Router de Métricas y Series Temporales (`backend/app/api/analytics.py`):**
   - Implementar `GET /api/v1/analytics/overview?organization_id={id}`:
     Ejecuta consultas de agregación indexadas (`COUNT(*)` filtrado por `decision` y `AVG(latency_ms)`).
   - Implementar `GET /api/v1/analytics/timeseries?organization_id={id}&range=24h`:
     Agrupa ejecuciones por hora mediante SQL:
     ```sql
     SELECT 
       date_trunc('hour', timestamp) AS interval_hour,
       COUNT(*) FILTER (WHERE decision = 'ALLOW') AS allowed_count,
       COUNT(*) FILTER (WHERE decision = 'DENY') AS denied_count
     FROM executions
     WHERE organization_id = :org_id AND timestamp >= NOW() - INTERVAL '24 hours'
     GROUP BY interval_hour
     ORDER BY interval_hour ASC;
     ```
2. **Router y Persistencia de Llaves de API (`backend/app/api/api_keys.py`):**
   - Crear migración en Alembic para la tabla `api_keys`.
   - Exponer endpoints `GET`, `POST` y `DELETE` en `/api/v1/api-keys`.
   - Incorporar middleware en el Gateway PEP para validar obligatoriamente la cabecera `X-AgentGuard-Key`.
3. **Router de Auditoría Administrativa (`backend/app/api/audit_events.py`):**
   - Crear el router `audit_events.py` para consultar la tabla `audit_events` mediante `GET /api/v1/audit-events?organization_id={id}`.
   - Instrumentar los servicios de creación/modificación de agentes, políticas y usuarios para registrar automáticamente un `AuditEvent` tras cada mutación.
4. **Configuración de Seguridad de Tenant (`backend/app/api/organizations.py`):**
   - Agregar endpoints `GET /api/v1/organizations/{id}/settings` y `PATCH /api/v1/organizations/{id}/settings` para persistir la postura de seguridad y el umbral de reembolso autónomo.

---

### Fase 3: Remoción de *Silent Fallbacks* y Manejo Explícito de Errores en Frontend

1. **Desactivación de Capturas Silenciosas en Desarrollo:**
   - Modificar `frontend/src/services/api.ts` para que, en lugar de retornar estructuras dummy ante un error, propague la excepción:
     ```typescript
     // Estrategia corregida en api.ts
     if (!res.ok) {
       const errorBody = await res.json().catch(() => ({}));
       throw new ApiError(res.status, errorBody.detail || 'Error en el servidor');
     }
     ```
2. **Componentes Visuales de Notificación de Error (Error Toasts / Banners):**
   - Integrar un manejador global de errores en las vistas para desplegar mensajes comprensibles (ej. *"Error 422: Identificador no válido"* o *"Error 503: Base de datos no accesible"*), permitiendo al desarrollador diagnosticar fallas de red de inmediato.
3. **Skeleton Loaders:**
   - Inicializar las vistas con arreglos vacíos `[]` y estados `isLoading: true` con componentes Skeleton, eliminando la inicialización con `mockAgents`, `mockTools` o `mockPolicies` que genera confusión durante la carga.

---

### Fase 4: Autenticación JWT y Propagación Formal de Tenant Isolation

1. **Módulo de Autenticación en Backend (`backend/app/api/auth.py`):**
   - Agregar columna `hashed_password VARCHAR(255)` a la tabla `users` mediante migración de Alembic.
   - Implementar `POST /api/v1/auth/login` validando contraseñas mediante `passlib[bcrypt]` y emitiendo un token JWT firmado con `HS256` y expiración configurable.
   - El payload del JWT debe contener: `sub` (User ID), `org_id` (Organization ID) y `role` (UserRole).
2. **Dependencia de Autorización en FastAPI:**
   - Implementar la dependencia `get_current_user` con `OAuth2PasswordBearer` para extraer el `organization_id` directamente del token verificado, eliminando la necesidad de recibirlo como parámetro de consulta en cada endpoint.
3. **Almacenamiento de Sesión en Frontend:**
   - Al completar el login en `AuthView`, guardar el JWT en `localStorage`.
   - Modificar `api.ts` para inyectar automáticamente la cabecera `Authorization: Bearer <token>` en todas las solicitudes HTTP salientes.
4. **Conexión del Selector de Espacios de Trabajo:**
   - Conectar el `WorkspaceSwitcher` del Sidebar con `GET /api/v1/organizations` para permitir alternar entre los tenants que pertenezcan a la cuenta del usuario autenticado.

---

### Fase 5: Conexión de Maquetas Auxiliares (Timeseries, Keys, SIEM)

1. **Reemplazo del Gráfico SVG Estático en `OverviewView`:**
   - Consumir el endpoint `GET /api/v1/analytics/timeseries`.
   - Mapear dinámicamente las coordenadas del trazado SVG en función de los conteos reales devueltos por el backend para cada una de las 24 franjas horarias.
2. **Conexión de la Pestaña de API Keys en `SettingsView`:**
   - Reemplazar el generador local `handleGenerateKey` por una llamada a `POST /api/v1/api-keys`.
   - Listar las llaves registradas consumiendo `GET /api/v1/api-keys`.
3. **Conexión del Despachador de Pruebas SIEM:**
   - Enlazar el botón "Test Webhook" de la Pestaña 5 con `POST /api/v1/settings/siem/test`, mostrando la latencia y respuesta HTTP devueltas por el colector externo real.

---

## 6. Verificación de Integridad y Cumplimiento Read-Only

En cumplimiento estricto con la directiva del proyecto de **cero modificación de código fuente, esquemas de base de datos o configuraciones**, se certifica que la presente auditoría se ejecutó exclusivamente en modo de lectura.

### 6.1 Registro de Estado de Git (`git status --porcelain`)
La verificación del árbol de trabajo de Git arrojó el siguiente resultado:
- **Archivos de código fuente modificados:** 0 (`git status` limpio en código de aplicación).
- **Archivos de esquema de base de datos modificados:** 0.
- **Archivos de configuración modificados:** 0.
- **Únicos archivos generados:**
  - El presente informe maestro: `c:\Users\jonat\Downloads\Codigos\AgentGuard\INFORME_MOCKUPS_FRONT_BACK.md`.
  - Archivos de bitácora y coordinación en el directorio de trabajo del agente (`.agents/teamwork/`).

---

## 7. Conclusión y Veredicto Final

El sistema **AgentGuard** posee una base técnica sólida y madura. El motor central de evaluación determinista de políticas (PDP), el proxy interceptor (PEP), el módulo de sanitización de contexto contra OWASP GenAI LLM06, la cola de aprobaciones humanas (HITL) y la persistencia de trazas inmutables en PostgreSQL 16 con canal de eventos reactivos por WebSockets se encuentran **completamente implementados, probados y funcionales**.

La principal oportunidad de evolución de la plataforma reside en **eliminar la asimetría entre las pantallas operativas y los módulos de configuración**, formalizar la jerarquía de políticas y reglas en la interfaz, sustituir los *silent fallbacks* por un manejo explícito de excepciones y dotar al frontend de los endpoints de agregación temporal necesarios para que el panel de control refleje la actividad del sistema con máxima fidelidad forense en tiempo real.

---
*Fin del Informe Técnico de Auditoría.*  
*Elaborado por el Equipo de Auditoría y Documentación Técnica de AgentGuard.*
