# 🌐 AgentGuard — Frontend (Dashboard Web SPA SaaS B2B)

Panel de control multi-tenant, onboarding autogestionado y bandeja de aprobaciones reactivas en vivo (*Human-in-the-Loop*) para la gobernanza de agentes de IA.

* **Responsables:** **Juan Martín Battiato** (SM / Frontend Core) & **Mateo Ortega** (Diseñador UI/UX & Frontend).
* **Stack:** React 19 + Vite + TypeScript 5+ + Tailwind CSS (`pnpm`).
* **Comunicación:** Cliente HTTP centralizado (`src/services/api.ts`) con propagación estricta de `ApiError`, notificaciones globales (`ToastContext`) y suscripción WebSocket en tiempo real (`/api/v1/ws/{organization_id}`).
* **Idioma:** Interfaz 100% en español mediante diccionario centralizado (`src/constants/labels.ts`).

---

## 🧭 Las 9 Vistas de la Aplicación (`src/views/`)

1. **`AuthView.tsx` (Acceso y Registro de Empresa SaaS B2B):** Inicio de sesión con JWT (`POST /api/v1/auth/login`) y pestaña **"Registrar Empresa"** (`POST /api/v1/auth/register-org`) con exhibición única y copiado seguro de la API Key inicial (`ag_live_...`).
2. **`OverviewView.tsx` (Resumen Ejecutivo):** Métricas agregadas desde `/api/v1/analytics/overview` y `/timeseries`, actividad en vivo vía WebSocket y acceso directo al asistente **"Proteger Agente en 3 Clics"** (`QuickSetupWizard.tsx`).
3. **`AgentsView.tsx` (Agentes IA):** Inventario de identidades autónomas, estado operativo (`ACTIVE`, `SUSPENDED`, `REVOKED`), asignación N:N de herramientas (`AgentTool`) y acceso al asistente **"Proteger Agente en 3 Clics"**.
4. **`ToolsView.tsx` (Herramientas REST y Acciones):** Catálogo de APIs externas (estandarizadas exclusivamente en protocolo `REST`, ADR-003) y registro granular de acciones atómicas (`ToolAction`) con `risk_level`.
5. **`PoliciesView.tsx` (Políticas y Reglas Deterministas):** Creación y priorización de políticas y reglas (`ALLOW`, `DENY`, `REQUIRE_APPROVAL`) con condiciones `JSONB`.
6. **`ApprovalsView.tsx` (Bandeja HITL en Vivo):** Recepción instantánea de tickets `PENDING` por WebSocket (`NEW_APPROVAL`) y resolución humana (`APPROVED` / `REJECTED`) vía `POST /api/v1/approvals/{id}/resolve`.
7. **`TracesView.tsx` (Trazas Forenses y Alertas):** Auditoría en tiempo real de ejecuciones (`/api/v1/executions`), latencia real medida (`latency_ms`) e incidentes de seguridad (`/api/v1/alerts`).
8. **`PlaygroundView.tsx` (Simulador Sandbox y Banco OWASP):** Evaluación segura sin impacto productivo (`POST /api/v1/gateway/simulate`) y carga de vectores de ataque desde `GET /api/v1/gateway/attacks`.
9. **`SettingsView.tsx` (Configuración Multi-Tenant y Seguridad):** Gestión del tenant activo (`activeOrgId`), emisión y revocación de API Keys para `X-AgentGuard-Key`, miembros RBAC, postura *fail-closed* y webhook SIEM.

---

## 🛠️ Comandos Útiles (`pnpm`)

Desde la raíz del repositorio:

```powershell
# Instalar dependencias
pnpm --dir frontend install

# Chequeo rápido de tipos TypeScript
pnpm --dir frontend exec tsc -b

# Linter (oxlint)
pnpm --dir frontend run lint

# Build de producción
pnpm --dir frontend run build
```
