# Original User Request

## Parameters
[skip-interview]
How this run was launched; not part of the task.

## Initial Request — 2026-11-02 17:46:15 UTC

Implementar de forma atómica y completa la Fase 1 (INC-01 a INC-04) del plan de sincronización de AgentGuard especificado en PLAN_IMPLEMENTACION_SINCRONIZACION.md:

## Contexto y Reglas Obligatorias:
- Metodología SDD y TDD (Zero-Regression Policy). Los 4 escenarios de la demo deben mantenerse pasando.
- Idioma en Frontend: Todo lo que sea visible para el usuario final en la interfaz debe leerse en español (etiquetas, badges, estados, roles, decisiones, etc.).
- Seguridad: Los agentes de IA NO deben tener acceso a modificar políticas ni reglas. Solo administradores humanos (UserRole.ADMIN) de cada empresa pueden gestionar sus reglas.
- No lanzar servidores continuos (uvicorn, vite) en background. Las pruebas se ejecutan con pytest y pnpm run build de forma síncrona.

## Incrementos a Ejecutar:

### INC-01: Homogeneización de Enums y Localización Integral al Español en la UI
1. En `frontend/src/types/domain.ts`, alinear tipos de dominio:
   - `UserRole = 'ADMIN' | 'APPROVER' | 'OPERATOR' | 'AUDITOR' | 'VIEWER'`
   - `AgentStatus = 'ACTIVE' | 'SUSPENDED' | 'REVOKED'`
   - `AlertSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'`
   - `Decision = 'ALLOW' | 'DENY' | 'REQUIRE_APPROVAL'`
   - `RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'`
2. Crear `frontend/src/constants/labels.ts` con diccionarios canónicos de etiquetas legibles en español y badges (`ROLE_LABELS`, `AGENT_STATUS_LABELS`, `DECISION_LABELS`, `SEVERITY_LABELS`, `RISK_LABELS`).
3. Actualizar vistas y componentes de frontend (`AgentsView.tsx`, `UsersView.tsx`, `AuditView.tsx`, `PoliciesView.tsx`, `OverviewView.tsx`) para usar el diccionario de español en lugar de enums crudos en inglés.
4. Adaptar transformadores en `frontend/src/services/api.ts`.
5. Ejecutar `pnpm run build` en `frontend/` y verificar 0 errores de tipado.

### INC-02: Endpoints Granulares de Reglas, Aislamiento por Empresa y Blindaje Anti-IA
1. En `backend/app/api/policies.py`, implementar:
   - `POST /api/v1/policies/{policy_id}/rules`: Crear una regla determinista dentro de una política existente del tenant.
   - `PATCH /api/v1/policy-rules/{rule_id}`: Modificar conditions, effect o priority de una regla específica.
   - `DELETE /api/v1/policy-rules/{rule_id}`: Eliminar una regla individual sin destruir la política contenedora.
2. Validar aislamiento multi-tenant: la política/regla debe pertenecer a la `organization_id` de la empresa.
3. Asegurar que las rutas de políticas pertenezcan al plano de control y no estén expuestas a los agentes de IA (solo humanos con rol ADMIN).
4. Actualizar `backend/app/schemas/policy.py` y `backend/app/services/policy_service.py` con los métodos correspondientes.
5. Crear suite de pruebas `backend/tests/test_policy_rules_management.py` y ejecutarla con `pytest`.

### INC-03: Rediseño Jerárquico y Desacoplamiento de Borrado en `PoliciesView.tsx`
1. En `frontend/src/services/api.ts`, agregar métodos: `createPolicyRule`, `updatePolicyRule`, `deletePolicyRule`.
2. En `frontend/src/views/PoliciesView.tsx`, presentar la jerarquía visual de la política y sus reglas asociadas.
3. El botón de borrar en cada fila de regla debe invocar `deletePolicyRule` (no borrar la política entera).
4. Todos los textos, diálogos de confirmación y badges de la vista deben leerse en español.
5. Validar con `pnpm run build`.

### INC-04: Persistencia y Serialización de Latencia Real de Ejecuciones
1. Generar migración Alembic agregando la columna `latency_ms = Column(Float, nullable=True)` a la tabla `executions`.
2. Actualizar modelo SQLAlchemy `Execution` en `backend/app/models/execution.py` y schema Pydantic en `backend/app/schemas/execution.py`.
3. En `backend/app/services/pep_gateway_service.py`, medir la latencia transcurrida con `time.perf_counter()` y almacenarla en la entidad `Execution`.
4. En `backend/app/api/executions.py`, eliminar el valor hardcodeado `latency_ms = 21.5` y serializar `execution.latency_ms`.
5. Aplicar la migración (`alembic upgrade head`) y crear prueba en `backend/tests/test_execution_latency.py` validando que la latencia se persiste y no es un valor fijo.

## Entregables:
- Código implementado y probado en backend y frontend.
- Todas las pruebas de `pytest` y `pnpm run build` pasando al 100%.
- Al finalizar, sincronizar el grafo de conocimiento ejecutando `graphify update .`.

## Follow-up — 2026-11-02 21:50:33 UTC

Implementar de forma atómica y completa la Fase 2 (INC-05 a INC-10) del plan de sincronización de AgentGuard especificado en PLAN_IMPLEMENTACION_SINCRONIZACION.md:

## Protocolo Obligatorio: LEAN TEAMWORK (Sección 12 de AGENTS.md y .agents/rules/lean_teamwork_protocol.md):
1. **Saltear Explorers usando Graphify:** No instanciar Explorers redundantes. El Orquestador consulta la arquitectura en `graphify-out/graph.json` y define los contratos SDD a costo 0.
2. **Worker por Incremento Atómico Completo:** Cada Worker se adueña de un incremento completo (código + test + validación síncrona en terminal).
3. **Cero Reviewers Intermedios:** El Worker valida en terminal (`tsc --noEmit` / `pytest -q --tb=short --no-header`). La revisión semántica de calidad se hace sobre `git diff`.
4. **Victory Auditor Quirúrgico:** Suprimir Fase A (proveniencia git). Auditar únicamente `git diff` acumulado (multi-tenant `organization_id`, anti-hardcode, blindaje anti-IA, textos en español) y correr en modo silencioso `pytest -q --tb=short --no-header tests/test_gateway_scenarios.py` antes de emitir VICTORY CONFIRMED.
5. **Idioma:** Toda la interfaz de usuario, diálogos, tablas y badges deben mantenerse 100% en español consumiendo `frontend/src/constants/labels.ts`.

## Alcance de la Fase 2:

### INC-05: Router y Servicios para la Tabla Formal `audit_events`
- Backend: Crear `backend/app/api/audit_events.py` exponiendo:
  - `GET /api/v1/audit-events?organization_id={id}` (paginación `limit`, `offset`, filtro opcional por `actor_type`, `event_type`).
  - `GET /api/v1/audit-events/{id}`.
- Crear schemas Pydantic en `backend/app/schemas/audit_event.py`.
- Crear servicio `backend/app/services/audit_service.py` con `log_audit_event(session, org_id, actor_type, actor_id, event_type, description, metadata)`.
- Instrumentar mutaciones administrativas (crear/revocar agentes, mutar políticas/reglas) para registrar eventos forenses.
- Registrar router en `backend/app/main.py`.
- Test: `backend/tests/test_audit_events.py` pasando con `pytest -q --tb=short --no-header`.

### INC-06: Router de Analítica y Series Temporales (`/analytics/overview` y `/timeseries`)
- Backend: Crear `backend/app/api/analytics.py` y schemas en `backend/app/schemas/analytics.py`.
- Implementar `GET /api/v1/analytics/overview?organization_id={id}` (retorna total ejecuciones, allow_count, deny_count, require_approval_count, avg_latency_ms, active_incident_count calculados de forma indexada sobre `executions`).
- Implementar `GET /api/v1/analytics/timeseries?organization_id={id}&range=24h` agrupando con `date_trunc('hour', timestamp)`.
- Registrar router en `backend/app/main.py`.
- Test: `backend/tests/test_analytics.py` con `pytest -q --tb=short --no-header`.

### INC-07: Conexión de Métricas Reales en `OverviewView.tsx`
- Frontend: Agregar `getAnalyticsOverview` y `getAnalyticsTimeseries` en `frontend/src/services/api.ts`.
- En `frontend/src/views/OverviewView.tsx`, consumir estos endpoints para alimentar las 4 tarjetas KPI y el gráfico de 24 horas dinámicamente con las coordenadas de los datos reales.
- Test: `pnpm --dir frontend run build` con código de salida 0.

### INC-08: Modelo, Migración y Router de API Keys PEP (`/api/v1/api-keys`)
- Persistencia: Generar migración Alembic `003_add_api_keys.py` creando la tabla `api_keys` (`id UUID PK`, `organization_id UUID FK`, `name VARCHAR(100)`, `key_prefix VARCHAR(12)`, `hashed_key VARCHAR(255)`, `created_at TIMESTAMPTZ`, `expires_at TIMESTAMPTZ`, `is_active BOOLEAN`).
- Backend: Modelo SQLAlchemy `ApiKey` en `backend/app/models/api_key.py`, schemas en `backend/app/schemas/api_key.py`, servicio en `backend/app/services/api_key_service.py` y router `backend/app/api/api_keys.py`.
- Endpoints: `GET /api/v1/api-keys`, `POST /api/v1/api-keys` (genera secret seguro con `secrets.token_urlsafe(32)`, guarda hash y retorna secret en plano una única vez), `DELETE /api/v1/api-keys/{id}` (revocación lógica).
- Aplicar migración con `alembic upgrade head`.
- Test: `backend/tests/test_api_keys.py` con `pytest -q --tb=short --no-header`.

### INC-09: Conexión de Gestión de API Keys en `SettingsView.tsx`
- Frontend: Métodos `getApiKeys`, `createApiKey`, `revokeApiKey` en `frontend/src/services/api.ts`.
- En `frontend/src/views/SettingsView.tsx` (Pestaña 2): Conectar tabla real de llaves, modal para emitir llave con copia única al portapapeles y confirmación de revocación en español.
- Test: `pnpm --dir frontend run build` con código de salida 0.

### INC-10: Persistencia de Configuración de Gobernanza de la Organización
- Backend: En `backend/app/api/organizations.py` implementar:
  - `GET /api/v1/organizations/{id}/settings`
  - `PATCH /api/v1/organizations/{id}/settings`: persiste postura Fail-Closed, enmascaramiento y límite autónomo en la columna `settings JSONB` de `organizations`.
- Frontend: Conectar Pestaña 4 de `SettingsView.tsx` para cargar y guardar los ajustes del tenant.
- Test: `backend/tests/test_organization_settings.py` con `pytest -q --tb=short --no-header`.

## Criterios de Aceptación:
- Código implementado y probado bajo TDD.
- Suite de regresión pasando al 100% (`test_gateway_scenarios.py`).
- Compilación frontend impecable (`pnpm run build` exit code 0).
- Actualizar grafo de arquitectura al final: `graphify update .`.


## Follow-up — 2026-11-03 01:31:43 UTC

Implementar de forma atómica y completa la Fase 3 (INC-11 a INC-13) del plan de sincronización de AgentGuard especificado en PLAN_IMPLEMENTACION_SINCRONIZACION.md:

## Protocolo Obligatorio: LEAN TEAMWORK (Sección 12 de AGENTS.md y .agents/rules/lean_teamwork_protocol.md):
1. **Saltear Explorers usando Graphify:** No instanciar Explorers redundantes. El Orquestador consulta `graphify-out/graph.json` y arma las especificaciones SDD a costo 0.
2. **Worker por Incremento Atómico Completo:** Cada Worker se adueña de un incremento completo (código + validación síncrona en terminal).
3. **Cero Reviewers Intermedios:** El Worker valida en terminal (`pnpm --dir frontend run build`). La revisión semántica de calidad se hace sobre `git diff`.
4. **Victory Auditor Quirúrgico:** Suprimir Fase A (proveniencia git). Auditar únicamente `git diff` acumulado (erradicación de silent fallbacks, textos en español, skeletons limpios) y correr `pnpm run build` y `pytest -q --tb=short --no-header tests/test_gateway_scenarios.py` antes de emitir VICTORY CONFIRMED.
5. **Idioma:** Toda la interfaz de usuario, toasts de error, banners y empty states deben estar 100% en español.

## Alcance de la Fase 3:

### INC-11: Refactorización de `api.ts` (Propagación Explícita de Errores y `ApiError`)
- En `frontend/src/services/api.ts`:
  - Declarar y exportar clase `ApiError extends Error` con propiedades: `status: number`, `detail: string`, `errors?: any[]`.
  - Erradicar todos los bloques de silent fallback: eliminar `return mockAgents`, `return mockPolicies`, `return mockApprovals`, `return mockExecutions`, `return mockAlerts`, `return mockUsers`, `return mockTools` en los bloques `catch`.
  - Si `!res.ok`, parsear el cuerpo del error si viene en JSON (ej. `detail` de FastAPI) y lanzar `ApiError(res.status, detail)`.
  - Si ocurre error de red o timeout (`AbortSignal`), lanzar `ApiError(0, "Error de conexión con el servidor")`.
  - Validar compilación con `pnpm --dir frontend run build`.

### INC-12: Sistema Global de Notificaciones (Toasts) y Banners de Desconexión
- En frontend:
  - Crear `frontend/src/context/ToastContext.tsx` y componente `frontend/src/components/common/ToastContainer.tsx` exportando hook `useToast()` con métodos `toast.success(msg)`, `toast.error(msg)`, `toast.warning(msg)`, `toast.info(msg)`.
  - Estilo visual oscuro, moderno y sobrio con Tailwind CSS, alineado con la paleta de AgentGuard.
  - Envolver `App.tsx` con `ToastProvider`.
  - Implementar en `Header.tsx` o `App.tsx` una detección de estado de conectividad que consulte `/health`: si el backend responde con error o no responde, mostrar un banner sutil pero informativo: *"Modo degradado: conexión interrumpida con el backend o la base de datos"*.
  - Validar compilación con `pnpm --dir frontend run build`.

### INC-13: Estados de Carga Limpios con Skeleton Loaders y Empty States
- En frontend:
  - Crear componente reutilizable `frontend/src/components/common/Skeleton.tsx` (`SkeletonRow`, `SkeletonCard`, `SkeletonTable`) con animación `animate-pulse` y colores oscuros (`bg-slate-800/50`).
  - Crear componente `frontend/src/components/common/EmptyState.tsx` para listas vacías (icono, título y descripción clara en español con botón de acción opcional).
  - En las vistas principales (`AgentsView.tsx`, `PoliciesView.tsx`, `AuditView.tsx`, `ApprovalsView.tsx`, `ToolsView.tsx`, `TracesView.tsx`, `UsersView.tsx`):
    - Eliminar la inicialización de estados con datos mockeados (`useState(mockAgents)` -> cambiar a `useState<Agent[] | null>(null)` y `isLoading: true`).
    - Renderizar los skeletons correspondientes mientras `isLoading` sea verdadero.
    - Conectar capturas de error al hook `useToast` para emitir notificación visible si falla una llamada a la API.
    - Si la lista queda vacía (`[]`), renderizar el `EmptyState` en español en lugar de una tabla vacía sin feedback.
  - Validar compilación con `pnpm --dir frontend run build` (0 errores de TypeScript).

## Criterios de Aceptación:
- Erradicación total de los silent fallbacks en `api.ts`.
- Sistema de toasts y banners de desconexión 100% funcional en español.
- Vistas cargando con Skeletons suaves sin mezclar mocks en memoria.
- `pnpm --dir frontend run build` exit code 0.
- Los 4 escenarios de la demo en backend intactos (`pytest -q --tb=short --no-header backend/tests/test_gateway_scenarios.py`).
- Sincronizar grafo de arquitectura al final: `graphify update .`.
