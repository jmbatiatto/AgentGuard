# Graph Report - AgentGuard  (2026-11-14)

## Corpus Check
- 193 files · ~172,151 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 18 file(s) not represented in the graph (top: .drawio 6, .example 3, .bat 3)

## Summary
- 2489 nodes · 6786 edges · 146 communities (99 shown, 47 thin omitted)
- Extraction: 91% EXTRACTED · 9% INFERRED · 0% AMBIGUOUS · INFERRED: 625 edges (avg confidence: 0.94)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `976ed41f`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- get_db
- domain.ts
- models/user.py
- 05 — Cuestionario de Decisiones Arquitectónicas y de Producto para el Usuario
- list_executions
- _setup_admin_auth
- App.tsx
- test_gateway_api.py
- uuid
- labels.ts
- frontend/package.json
- postgres
- Policy
- approvals.py
- schemas/auth.py
- _setup_admin_auth
- UUID
- test_organization_settings.py
- ThemeContext.ts
- compilerOptions
- auth-ui.tsx
- test_auth.py
- compilerOptions
- Approval
- env.py
- list_executions
- asyncio
- update_organization
- websocket_manager.py
- update_user
- api.ts
- test_schemas.py
- PolicyService
- PEPGatewayService
- AgentService
- .oxlintrc.json
- 🔄 Guía de Defensa: Máquinas de Estados y Ciclo de Vida en Runtime (Protocolo HITL 202 Accepted)
- 🏛️ Registro de Decisiones Arquitectónicas (ADRs) — AgentGuard
- tsconfig.json
- 🎯 Guía de Defensa: Diagrama de Casos de Uso del Sistema (UML)
- 🛡️ Guía de Defensa: Modelo Entidad-Relación Relacional Multi-Tenant (13 Tablas)
- WebhookService
- BaseSchema
- 📑 Desglose de Pasos: Semana 1 — Base de Datos & Setup Inicial
- test_threat_detector_goal_hijacking
- 3. Los 4 Escenarios Demostrables Paso a Paso
- ApiKey
- env.py
- 📐 Guía de Defensa: Modelo Conceptual (Chen) y Diccionario de Atributos
- generate_diagrams.py
- PolicyRuleService
- README.md
- convert_docs_to_docx.py
- get_analytics_overview
- ToolAction
- AuditService
- ToolActionService
- 🤖 AgentGuard — Agent Demo (Cliente CLI Python)
- CLAUDE.md
- 04 — Inventario Forense de Código Muerto, Dependencias Redundantes y Archivos Huérfanos
- copilot-instructions.md
- main.py
- UserService
- 0.1 Backend: Servicios "Dios", Fuga de ORM hacia HTTP y Dominio Impuro
- Original User Request
- reset_demo_data
- typing
- make_admin_jwt
- .matches_conditions
- 🛡️ AgentGuard — Runtime Authorization & Governance for AI Agents
- threat_detector.py
- 🔐 AgentGuard — Guía Rápida de Credenciales y Roles Demo (Acme Corp)
- ensure_same_tenant
- PlaygroundView.tsx
- DemoConfig
- package.json
- ToolActionCreate
- list_approvals
- policies.py
- seed_data
- list_audit_events
- cleanup_overrides
- scripts
- create_tool_action
- test_organizations.py
- 🛡️ AgentGuard — Guía Simple y Hoja de Ruta para el Equipo
- `_MASTER_PROJECT_SNAPSHOT.md` — Fuente de Verdad Consolidada de AgentGuard
- _AutoYieldOverrides
- _mock_user_auth
- health_check
- 1.2 Inventario Individual (39 archivos `.md`)
- revoke_api_key
- 3. Análisis Semántico de las Relaciones y Cardinalidades
- simulate_gateway_action
- 06 — Propuesta de Evolución Arquitectónica, Optimización de Rendimiento y Mejores Prácticas
- _AutoYieldOverrides
- 🧭 2. Flujo del Wizard de Presentación (4 Pasos Guiados)
- 3. Hallazgos Críticos y Bugs Funcionales en el Frontend
- AuditEventResponse
- websocket_tenant_endpoint
- update_tool
- vite.config.ts
- BRIEFING — 2026-11-03 02:34:00 UTC
- 4. Código Interno Muerto, Endpoints Desconectados y Reliquias de Prototipo
- build_payload
- 2. Reglas Innegociables de Seguridad, Dominio e Idioma
- pnpm-workspace.yaml
- test_register_org_duplicate_email_returns_400
- scripts
- dependencies
- list_alerts
- enums.py
- Alcance de la Fase 2:
- Skeleton.tsx
- 2.3 Controles de seguridad para agentes IA (Implementado vs. Solo en papel)
- 01 — Auditoría Forense de Brecha Documental vs. Implementación Real (`Gap Analysis`)
- test_agent_service_assign_tool
- run_demo.py
- Bloque A — Seguridad, Identidad y Cumplimiento de Reglas de Dominio
- 2. Patrones de Diseño Recomendados para Desacoplar el Dominio
- test_tool_action_service_create
- 2. Decisión Tomada
- test_threat_detector_data_exfiltration
- test_threat_detector_base64_obfuscation
- test_threat_detector_embedded_base64_obfuscation
- test_threat_detector_destructive_sql
- test_threat_detector_clean_parameters

## God Nodes (most connected - your core abstractions)
1. `User` - 156 edges
2. `make_admin_jwt()` - 90 edges
3. `UserRole` - 87 edges
4. `Organization` - 76 edges
5. `ToolAction` - 72 edges
6. `Tool` - 70 edges
7. `BaseSchema` - 67 edges
8. `Agent` - 62 edges
9. `AgentTool` - 60 edges
10. `Execution` - 55 edges

## Surprising Connections (you probably didn't know these)
- `4.2 Estándares de Frontend (`TypeScript 6` / `React 19` / `Vite 8` / `pnpm`)` --references--> `ApiError`  [INFERRED]
  docs/archive/audit_reports/06_RECOMENDACIONES_ARQUITECTURA_Y_MEJORES_PRACTICAS.md → frontend/src/services/api.ts
- `12. Alcance de las 4 Pestañas Simuladas de `SettingsView.tsx`` --references--> `SettingsView()`  [INFERRED]
  docs/archive/audit_reports/05_PREGUNTAS_CLAVE_USUARIO.md → frontend/src/views/SettingsView.tsx
- `3. Paso Obligatorio Antes de Correr `agent-demo`: Generar `X-AgentGuard-Key`` --references--> `ApiKey`  [INFERRED]
  agentguard_credenciales_demo.md → backend/app/models/api_key.py
- `A. Estrategia Multi-Tenant: Esquema Compartido con Aislamiento Obligatorio en Capa de Aplicación` --references--> `ApiKey`  [INFERRED]
  agentguard_mer_relacional.md → backend/app/models/api_key.py
- `A. Contenedor de Políticas vs. Reglas Atómicas (1:N Desalineado)` --references--> `PolicyRule`  [INFERRED]
  docs/archive/INFORME_MOCKUPS_FRONT_BACK.md → backend/app/models/policy.py

## Import Cycles
- None detected.

## Communities (146 total, 47 thin omitted)

### Community 0 - "get_db"
Cohesion: 0.10
Nodes (8): ensure_same_tenant(), get_current_user(), require_admin_user(), require_roles(), resolve_tenant_org_id(), get_db(), decode_access_token(), ActorType

### Community 1 - "domain.ts"
Cohesion: 0.14
Nodes (7): 3.2 Corrupción de Estado Real por Condición `data.length > 0` y Falsos Éxitos (`api.ts`), AgentGuardApiClient, extractApiError(), handleNetworkError(), GatewayApiKey, OrganizationSettings, UserMember

### Community 2 - "models/user.py"
Cohesion: 0.10
Nodes (3): verify_password(), cleanup_overrides(), test_register_org_success_atomic_onboarding()

### Community 3 - "05 — Cuestionario de Decisiones Arquitectónicas y de Producto para el Usuario"
Cohesion: 0.13
Nodes (14): 05 — Cuestionario de Decisiones Arquitectónicas y de Producto para el Usuario, 10. Activación Real de Redis 7, PostgreSQL RLS y Operadores Contextuales del PDP, 11. Eliminación del Modo *"Wizard-of-Oz"* (`mockData.ts` y Falsos Éxitos en `api.ts`), 12. Alcance de las 4 Pestañas Simuladas de `SettingsView.tsx`, 13. Evolución del `PlaygroundView` y Desarrollo de `agent-demo/`, 14. Gobernanza del Botón `"Reset Demo"` e Idioma Canónico de la Interfaz, 4. Protocolo de Espera y Entrega de Resultados en HITL (`REQUIRE_APPROVAL`), 5. Custodia de Parámetros Originales para Re-Despacho HITL (Problema `"***REDACTED***"`) (+6 more)

### Community 4 - "list_executions"
Cohesion: 0.19
Nodes (6): get_execution_by_id(), list_executions(), _to_execution_response(), ExecutionResponse, 3.4 Latencia Forense Ficticia (`latency_ms=21.5`), 5. Deuda Técnica Estructural, Contratos Incompletos y Configuración

### Community 5 - "_setup_admin_auth"
Cohesion: 0.18
Nodes (8): _setup_admin_auth(), test_api_create_tool_organization_not_found(), test_api_create_tool_success(), test_api_get_tool_found(), test_api_get_tool_not_found(), test_api_list_tools(), test_tool_service_get_by_id(), test_tool_service_list_by_org()

### Community 6 - "App.tsx"
Cohesion: 0.12
Nodes (41): 2.2 Tabla Maestra de Vistas, Componentes y Estado de Consumo, Alcance de la Fase 3:, INC-12: Sistema Global de Notificaciones (Toasts) y Banners de Desconexión, App(), AppContent(), getInitialView(), TOAST_CONFIG, ToastContainer() (+33 more)

### Community 7 - "test_gateway_api.py"
Cohesion: 0.11
Nodes (13): PolicyDecision, RuleEffect, test_gateway_execute_endpoint_allow(), test_gateway_execute_endpoint_deny(), test_gateway_execute_endpoint_require_approval(), test_gateway_execute_invalid_api_key_returns_401(), test_gateway_execute_missing_api_key_returns_401(), test_gateway_execute_org_mismatch_returns_403() (+5 more)

### Community 8 - "uuid"
Cohesion: 0.06
Nodes (24): make_admin_jwt(), test_api_create_api_key_blocks_ai_agents(), test_api_create_api_key_org_not_found(), test_api_create_api_key_returns_raw_key_once_and_hides_hash(), test_api_get_api_key_by_id_not_found(), test_api_get_api_key_by_id_success(), test_api_list_api_keys_blocks_ai_agents(), test_api_list_api_keys_does_not_leak_plaintext_or_hash() (+16 more)

### Community 9 - "labels.ts"
Cohesion: 0.11
Nodes (29): EmptyState(), EmptyStateAction, EmptyStateProps, HeaderProps, ResetDemoModal(), ResetDemoModalProps, AGENT_STATUS_LABELS, AGENT_STATUS_STYLES (+21 more)

### Community 10 - "frontend/package.json"
Cohesion: 0.14
Nodes (19): devDependencies, oxlint@^1.81.0, @types/node@^24.13.3, @types/react@^19.2.18, @types/react-dom@^19.2.7, typescript@~6.0.2, vite@^8.3.0, @vitejs/plugin-react@^6.1.1 (+11 more)

### Community 11 - "postgres"
Cohesion: 0.06
Nodes (37): driver, name, PGDATA, POSTGRES_DB, POSTGRES_PASSWORD, POSTGRES_USER, interval, retries (+29 more)

### Community 12 - "Policy"
Cohesion: 0.14
Nodes (11): Policy, _setup_admin_auth(), test_api_create_policy_organization_not_found(), test_api_create_policy_success(), test_api_get_policy_found(), test_api_get_policy_not_found(), test_api_list_policies(), test_policy_service_create() (+3 more)

### Community 13 - "approvals.py"
Cohesion: 0.05
Nodes (41): 1.1 Contexto Institucional, Premisa Central y Arquitectura Políglota, 1.2 Diagnóstico Global de la Integración (Dualidad Real vs. Simulado), 1.3 El Patrón de Resiliencia Opaca: Riesgo de los *Silent Fallbacks*, 1.4 Métricas Globales de Cobertura de la Auditoría, 1. Resumen Ejecutivo y Diagnóstico Global del Sistema, 3.1 Módulo de Autenticación y Registro Corporativo, 3.2 Gráfico Interactivo de Actividad 24 Horas, 3.3 Base de Datos Empresarial Simulada en Memoria (Playground Sandbox) (+33 more)

### Community 14 - "schemas/auth.py"
Cohesion: 0.09
Nodes (13): get_me(), login(), register(), register_organization(), create_access_token(), LoginRequest, RegisterOrgRequest, RegisterOrgResponse (+5 more)

### Community 15 - "_setup_admin_auth"
Cohesion: 0.14
Nodes (8): _setup_admin_auth(), test_api_create_policy_rule_policy_not_found(), test_api_get_policy_rule_found(), test_api_get_policy_rule_not_found(), test_api_list_policy_rules(), test_policy_rule_service_create(), test_policy_rule_service_get_by_id(), test_policy_rule_service_list_rules()

### Community 16 - "UUID"
Cohesion: 0.05
Nodes (39): User, _make_auth(), test_get_execution_by_id_not_found(), test_list_executions_endpoint(), test_api_get_settings_success(), test_api_patch_settings_siem_formats_all_valid(), test_api_patch_settings_success(), test_api_test_webhook_endpoint_forwards_siem_format() (+31 more)

### Community 17 - "test_organization_settings.py"
Cohesion: 0.08
Nodes (15): OrganizationSettings, OrganizationSettingsUpdate, test_api_anti_ia_shield_blocks_agent_on_get(), test_api_anti_ia_shield_blocks_agent_on_patch(), test_api_get_settings_not_found(), test_api_multi_tenant_isolation_get_cross_tenant_denied(), test_api_multi_tenant_isolation_patch_cross_tenant_denied(), test_api_patch_settings_not_found() (+7 more)

### Community 18 - "ThemeContext.ts"
Cohesion: 0.48
Nodes (4): Theme, ThemeContext, ThemeContextType, useTheme()

### Community 19 - "compilerOptions"
Cohesion: 0.10
Nodes (20): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+12 more)

### Community 20 - "auth-ui.tsx"
Cohesion: 0.22
Nodes (18): AuthContentProps, AuthFormContainer(), AuthUIProps, Button, ButtonProps, buttonVariants, cn(), defaultSignInContent (+10 more)

### Community 21 - "test_auth.py"
Cohesion: 0.09
Nodes (14): get_password_hash(), cleanup_overrides(), test_anti_ai_shielding_in_control_plane(), test_control_plane_rejects_anonymous_and_x_user_id_without_jwt(), test_get_me_invalid_token(), test_get_me_missing_token(), test_get_me_success(), test_login_demo_credentials_and_alias() (+6 more)

### Community 22 - "compilerOptions"
Cohesion: 0.12
Nodes (16): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+8 more)

### Community 23 - "Approval"
Cohesion: 0.12
Nodes (12): 3. Análisis Detallado de Transiciones y Respuestas HTTP, Approval, _setup_user_auth(), test_approvals_get_by_id_not_found(), test_approvals_get_by_id_success(), test_approvals_list_endpoint(), test_approvals_resolve_already_resolved_or_not_found(), test_approvals_resolve_forbidden_for_non_approver_roles() (+4 more)

### Community 24 - "env.py"
Cohesion: 0.11
Nodes (5): Settings, test_health_endpoint(), test_ping_endpoint(), test_root_endpoint(), test_settings_secret_key_production_fail_fast()

### Community 25 - "list_executions"
Cohesion: 0.20
Nodes (9): 03 — Estado Forense del Backend, Lógica Pendiente y Deuda Técnica Estructural, 1. Veredicto Ejecutivo del Backend, 2.2 Violaciones de Clave Foránea (`IntegrityError`) No Controladas (`HTTP 500`), 2. Crashes `HTTP 500` Confirmados en Tiempo de Ejecución, 3.1 Falso Éxito Silencioso en `_dispatch_to_tool` (Violación Directa de Fail-Closed), 3.2 Re-Despacho HITL Corrupto con Parámetros `"***REDACTED***"` y Pérdida de Resultado, 3.3 Bug de Orden de Validación en el Pipeline del Gateway (Supresión de Alertas OWASP y Trazas), 3. Stubs, Retornos Ficticios y Fallos de Lógica en el Core PEP/PDP (+1 more)

### Community 26 - "asyncio"
Cohesion: 0.07
Nodes (23): AuditEvent, UserRole, Organization, _setup_admin_auth(), test_agent_service_get_by_id(), test_api_assign_tool_different_org(), test_api_assign_tool_to_agent_success(), test_api_create_agent_owner_different_org() (+15 more)

### Community 27 - "update_organization"
Cohesion: 0.09
Nodes (12): create_organization(), get_organization(), get_organization_settings(), list_organizations(), test_organization_siem_webhook(), update_organization(), update_organization_settings(), _build_canonical_user() (+4 more)

### Community 28 - "websocket_manager.py"
Cohesion: 0.12
Nodes (6): WebSocketConnectionManager, test_websocket_endpoint_ping_pong(), test_websocket_manager_broadcast_tenant_isolation(), test_websocket_manager_connect_and_welcome(), test_websocket_manager_disconnect_cleanup(), test_websocket_tenant_endpoint_connect()

### Community 29 - "update_user"
Cohesion: 0.18
Nodes (5): create_user(), delete_user(), get_user(), list_users(), update_user()

### Community 30 - "api.ts"
Cohesion: 0.11
Nodes (29): QuickSetupWizardProps, AuthContextType, GatewayExecutionPayload, GatewayExecutionResult, Agent, AgentStatus, AlertSeverity, AnalyticsOverview (+21 more)

### Community 31 - "test_schemas.py"
Cohesion: 0.08
Nodes (11): AlertRead, ApprovalResolveRequest, GatewayExecuteResponse, OrganizationCreate, UserCreate, test_alert_schema(), test_approval_resolve_schema(), test_gateway_schemas() (+3 more)

### Community 35 - "AgentService"
Cohesion: 0.12
Nodes (5): AgentCreate, AgentToolCreate, AgentUpdate, AgentService, test_agent_and_agent_tool_schemas()

### Community 36 - ".oxlintrc.json"
Cohesion: 0.33
Nodes (5): plugins, rules, react/only-export-components, react/rules-of-hooks, $schema

### Community 37 - "🔄 Guía de Defensa: Máquinas de Estados y Ciclo de Vida en Runtime (Protocolo HITL 202 Accepted)"
Cohesion: 0.18
Nodes (10): 1. Modelado de Estados en Arquitecturas Asíncronas (`202 Accepted`), 2. Diagramas de Estados Reales (Mermaid), 4. Concurrencia y Prevención de Condiciones de Carrera (TOCTOU), 5. Preguntas Difíciles del Profesor y Respuestas Sugeridas, A. Máquina 1: Ciclo de Vida de una Ejecución (`Execution.status`), B. Máquina 2: Ciclo de Vida de una Aprobación (`Approval.status`), C. Máquina 3: Ciclo de Vida de un Incidente de Seguridad (`Alert.status`), 🔄 Guía de Defensa: Máquinas de Estados y Ciclo de Vida en Runtime (Protocolo HITL 202 Accepted) (+2 more)

### Community 38 - "🏛️ Registro de Decisiones Arquitectónicas (ADRs) — AgentGuard"
Cohesion: 0.12
Nodes (16): 1. Contexto y Problema, 1. Contexto y Problema, 1. Decisión Tomada, 1. Decisión Tomada, 1. Decisión Tomada, 1. Decisión Tomada, 2. Asignación por Paquete, 2. Decisión Tomada (+8 more)

### Community 45 - "🎯 Guía de Defensa: Diagrama de Casos de Uso del Sistema (UML)"
Cohesion: 0.17
Nodes (11): 1. Clasificación de Actores y Frontera del Sistema, 2. Diagrama de Casos de Uso del Sistema (Mermaid), 3. Mapeo con los Requisitos Funcionales del Informe (RF-01 a RF-12), 4. Justificación Teórica de Relaciones `<<include>>` y `<<extend>>`, 5. Especificación Detallada del Caso de Uso Crítico: UC05, 6. Preguntas de Examen / Defensa y Respuestas Clave, 🎯 Guía de Defensa: Diagrama de Casos de Uso del Sistema (UML), ❓ P1: *"¿Por qué el Agente de IA está modelado como un Actor si no es una persona?"* (+3 more)

### Community 46 - "🛡️ Guía de Defensa: Modelo Entidad-Relación Relacional Multi-Tenant (13 Tablas)"
Cohesion: 0.15
Nodes (12): 1. Propósito y Alcance del Diagrama, 2. Diagrama del Modelo Entidad-Relación (Mermaid — 13 Tablas), 3. Decisiones Arquitectónicas y Justificación Técnica, 4. Capacidades Clave de la Persistencia, 5. Preguntas Difíciles del Profesor y Respuestas Recomendadas, A. Estrategia Multi-Tenant: Esquema Compartido con Aislamiento Obligatorio en Capa de Aplicación, B. Uso de `UUID v4` como Clave Primaria en lugar de Enteros Seriales, C. Uso Estratégico de `JSONB` con Índices GIN (+4 more)

### Community 48 - "BaseSchema"
Cohesion: 0.06
Nodes (19): AlertUpdateRequest, AnalyticsTimeseriesResponse, TimeseriesPoint, ApiKeyCreate, ApiKeyCreatedResponse, ApiKeyResponse, ApprovalDetailRead, ApprovalRead (+11 more)

### Community 49 - "📑 Desglose de Pasos: Semana 1 — Base de Datos & Setup Inicial"
Cohesion: 0.05
Nodes (40): ⚙️ AgentGuard — Backend (Python 3.12+ & FastAPI), 🏗️ Arquitectura de la API REST (`/api/v1`), 📋 Especificaciones Históricas Archivadas, 📁 Estructura del Código Fuente, 🧪 Pruebas Automatizadas, 🗄️ Versionado de Base de Datos con Alembic, 1. Levantar Servicios de Infraestructura (Paso 1), 2. Preparar el Entorno Virtual de Python (Paso 2) (+32 more)

### Community 51 - "3. Los 4 Escenarios Demostrables Paso a Paso"
Cohesion: 0.20
Nodes (9): 1. Guión y Estrategia de Presentación ante el Tribunal, 2. Diagrama de Secuencia Real (Mermaid), 3. Los 4 Escenarios Demostrables Paso a Paso, 4. Cierre Forense en `TracesView` (`GET /api/v1/executions`), Escenario 1: Operación Normal (`ALLOW` — HTTP `200 OK`), Escenario 2: Privilegio Mínimo / Abuso Bloqueado (`DENY` — HTTP `403 Forbidden`), Escenario 3: Operación Sensible con Human-in-the-Loop (`REQUIRE_APPROVAL` — HTTP `202 Accepted`), Escenario 4: Exfiltración de Datos y Alerta Crítica (`DENY + CRITICAL ALERT` — HTTP `403 Forbidden`) (+1 more)

### Community 52 - "ApiKey"
Cohesion: 0.16
Nodes (4): ApiKey, ApiKeyService, 2. Decisión Tomada, INC-08: Modelo, Migración y Router de API Keys PEP (`/api/v1/api-keys`)

### Community 53 - "env.py"
Cohesion: 0.20
Nodes (4): do_run_migrations(), run_async_migrations(), run_migrations_offline(), run_migrations_online()

### Community 54 - "📐 Guía de Defensa: Modelo Conceptual (Chen) y Diccionario de Atributos"
Cohesion: 0.25
Nodes (7): 1. Propósito y Valor Académico de la Notación Chen, 2. Diagrama Conceptual de Entidad-Relación (Notación Chen), 4. Biblioteca de Atributos: Clasificación por Naturaleza, 5. Preguntas de Cátedra y Respuestas Sugeridas, 📐 Guía de Defensa: Modelo Conceptual (Chen) y Diccionario de Atributos, ❓ P1: *"¿Por qué modelan `AgentTool` como una relación $M:N$ en lugar de incluir un array de herramientas dentro del agente?"*, ❓ P2: *"¿Por qué la relación entre `EJECUCIÓN` y `APROBACIÓN` es `(0,1)` y no `(1,1)`?"*

### Community 55 - "generate_diagrams.py"
Cohesion: 0.21
Nodes (5): root(), build_drawio_xml(), add_card(), add_edge(), add_textbox()

### Community 58 - "convert_docs_to_docx.py"
Cohesion: 0.06
Nodes (19): SanitizerService, test_sanitize_bearer_token_in_string(), test_sanitize_credit_card_masking(), test_sanitize_empty_context(), test_sanitize_lists_and_tuples(), test_sanitize_sensitive_keys(), 4.1 Ausencia Total de Autenticación y Control de Acceso (RBAC) en APIs, 4.2 Fugas de Aislamiento Multi-Tenant (Violación de Regla 2 de `AGENTS.md`) (+11 more)

### Community 59 - "get_analytics_overview"
Cohesion: 0.27
Nodes (4): get_analytics_overview(), get_analytics_timeseries(), _validate_and_parse_org_id(), _verify_tenant_access()

### Community 60 - "ToolAction"
Cohesion: 0.05
Nodes (54): 3. Componentes Clave de Runtime, Base, Agent, AgentTool, AgentStatus, ApprovalStatus, ExecutionStatus, RiskLevel (+46 more)

### Community 63 - "🤖 AgentGuard — Agent Demo (Cliente CLI Python)"
Cohesion: 0.29
Nodes (6): 1. Requisitos previos, 2. Instalación, 3. Configuración (`.env`), 4. Ejecución, 5. Los 4 Escenarios Canónicos, 🤖 AgentGuard — Agent Demo (Cliente CLI Python)

### Community 65 - "04 — Inventario Forense de Código Muerto, Dependencias Redundantes y Archivos Huérfanos"
Cohesion: 0.18
Nodes (10): 04 — Inventario Forense de Código Muerto, Dependencias Redundantes y Archivos Huérfanos, 1. Resumen Cuantitativo de Higiene del Repositorio, 2. Archivos Huérfanos Trackeados en Git (Candidatos a Eliminación Directa), 3. Archivos Duplicados y Exportaciones Redundantes en Raíz, 5.1 Paquetes Python sin Uso en [backend/requirements.txt](file:///c:/Users/jonat/Downloads/Codigos/AgentGuard/backend/requirements.txt), 5.2 Scripts Rotos o Redundantes en [package.json](file:///c:/Users/jonat/Downloads/Codigos/AgentGuard/package.json) (Raíz), 5. Dependencias Huérfanas y Scripts de Monorepo Rotos, 6.1 Solapamiento entre 8 Archivos de Instrucciones para Agentes de IA (+2 more)

### Community 69 - "0.1 Backend: Servicios "Dios", Fuga de ORM hacia HTTP y Dominio Impuro"
Cohesion: 0.22
Nodes (3): 0.1 Backend: Servicios "Dios", Fuga de ORM hacia HTTP y Dominio Impuro, 0.2 Frontend: Vistas Monolíticas, Cliente HTTP "Mágico" y Sockets Duplicados, 0. Diagnóstico del Acoplamiento Actual (Estado *As-Is*)

### Community 70 - "Original User Request"
Cohesion: 0.12
Nodes (16): Contexto y Reglas Obligatorias:, Criterios de Aceptación:, Criterios de Aceptación:, Entregables:, Follow-up — 2026-11-02 21:50:33 UTC, Follow-up — 2026-11-03 01:31:43 UTC, INC-01: Homogeneización de Enums y Localización Integral al Español en la UI, INC-02: Endpoints Granulares de Reglas, Aislamiento por Empresa y Blindaje Anti-IA (+8 more)

### Community 72 - "typing"
Cohesion: 0.08
Nodes (10): downgrade(), upgrade(), downgrade(), upgrade(), downgrade(), upgrade(), downgrade(), upgrade() (+2 more)

### Community 73 - "make_admin_jwt"
Cohesion: 0.10
Nodes (14): MockOverviewRow, MockTimeseriesRow, test_analytics_service_get_overview_empty_state(), test_analytics_service_get_overview_with_data(), test_analytics_service_get_timeseries_empty_state(), test_analytics_service_get_timeseries_with_buckets(), test_api_analytics_anti_ai_shield(), test_api_analytics_overview_cross_tenant_forbidden() (+6 more)

### Community 74 - ".matches_conditions"
Cohesion: 0.11
Nodes (10): 1. El Paradigma de Seguridad: ¿Por qué Fuera del LLM?, 2. Diagrama de Arquitectura de Runtime Real (Mermaid), 4. Preguntas Difíciles del Profesor y Respuestas Recomendadas, 🏗️ Guía de Defensa: Arquitectura de Runtime y Flujo de Intercepción PEP / PDP, ❓ P1: *"¿Cómo garantizan consistencia entre políticas recién modificadas y evaluaciones en tiempo real?"*, ❓ P2: *"¿Qué ocurre si una petición activa `REQUIRE_APPROVAL` y nadie responde?"*, PDPEngine, test_matches_conditions_destinations() (+2 more)

### Community 75 - "🛡️ AgentGuard — Runtime Authorization & Governance for AI Agents"
Cohesion: 0.14
Nodes (14): 🛡️ AgentGuard — Plataforma SaaS B2B Multi-Tenant de Gobernanza en Runtime para Agentes de IA, 🚀 Arranque Rápido Local, 🏛️ Contexto Institucional y Equipo, 📄 Documentos Oficiales y Decisiones de Arquitectura, 🗂️ Estructura del Monorepositorio, 🚀 Flujo SaaS B2B: Alta Autogestionada y "Proteger Agente en 3 Clics", 🤖 Guía y Reglas para Agentes de IA (`AGENTS.md`), 👥 Integrantes y Roles (+6 more)

### Community 76 - "threat_detector.py"
Cohesion: 0.17
Nodes (3): ThreatAnalysisResult, ThreatDetectorService, 5. Deuda Técnica y Riesgos Detectados

### Community 77 - "🔐 AgentGuard — Guía Rápida de Credenciales y Roles Demo (Acme Corp)"
Cohesion: 0.18
Nodes (10): 1. Credenciales de Usuarios (Acme Corp), 2. Matriz Resumida de Permisos por Rol (RBAC), 3. Paso Obligatorio Antes de Correr `agent-demo`: Generar `X-AgentGuard-Key`, 4. Guión Sugerido de Logins para la Demo en Vivo, 5. IDs Canónicos de Acme Corp (para `agent-demo/.env` y Pruebas), 6. Comandos de Reinicio (Factory Reset) de Acme Corp, 🔐 AgentGuard — Guía Rápida de Credenciales y Roles Demo (Acme Corp), Entorno y Agentes (+2 more)

### Community 78 - "ensure_same_tenant"
Cohesion: 0.14
Nodes (9): assign_tool_to_agent(), create_agent(), delete_agent(), get_agent(), list_agent_tools(), list_agents(), update_agent(), AgentRead (+1 more)

### Community 79 - "PlaygroundView.tsx"
Cohesion: 0.09
Nodes (25): 2.1 Arquitectura de Ruteo y Navegación Hash, 2. Inventario Exhaustivo de Vistas y Componentes del Frontend, SidebarProps, DashboardSidebarProps, NavGroupData, NavItem(), NavItemData, SidebarNav() (+17 more)

### Community 80 - "DemoConfig"
Cohesion: 0.26
Nodes (6): DemoConfig, main(), run_all_scenarios(), run_interactive_menu(), run_scenario(), validate_config()

### Community 81 - "package.json"
Cohesion: 0.12
Nodes (20): dependencies, class-variance-authority@^0.7.1, clsx@^2.1.1, @radix-ui/react-label@^2.1.17, @radix-ui/react-slot@^1.5.0, tailwind-merge@^3.7.0, tw-animate-css@^1.4.0, description (+12 more)

### Community 82 - "ToolActionCreate"
Cohesion: 0.22
Nodes (4): ToolActionCreate, ToolCreate, test_tool_and_action_schemas(), test_tool_service_create()

### Community 83 - "list_approvals"
Cohesion: 0.24
Nodes (3): get_approval(), list_approvals(), resolve_approval()

### Community 84 - "policies.py"
Cohesion: 0.06
Nodes (16): create_policy(), create_policy_rule_in_policy(), delete_policy(), get_policy(), list_policies(), update_policy(), create_policy_rule(), delete_policy_rule() (+8 more)

### Community 85 - "seed_data"
Cohesion: 0.16
Nodes (6): main(), seed_data(), test_api_reset_demo_success(), test_seed_data_already_exists_without_reset(), test_seed_data_fresh_creation(), test_seed_data_syncs_missing_canonical_users_without_reset()

### Community 88 - "scripts"
Cohesion: 0.17
Nodes (12): scripts, build:frontend, dev:backend, dev:frontend, lint:frontend, start, start:all, start:backend (+4 more)

### Community 89 - "create_tool_action"
Cohesion: 0.23
Nodes (4): create_tool_action(), get_tool_action(), list_tool_actions(), ToolActionRead

### Community 90 - "test_organizations.py"
Cohesion: 0.06
Nodes (19): OrganizationUpdate, OrganizationService, _setup_admin_auth(), test_api_create_organization_success(), test_api_create_organization_validation_error(), test_api_get_organization_found(), test_api_get_organization_not_found(), test_api_list_organizations() (+11 more)

### Community 91 - "🛡️ AgentGuard — Guía Simple y Hoja de Ruta para el Equipo"
Cohesion: 0.15
Nodes (12): 1. La Idea Explicada "Para un Nene de 5 Años" 🧒, 🌐 1. La Página Web (Frontend), 2. ¿Dónde Encaja Cada Pieza Técnica? 🧩, ⚙️ 2. La API REST (Backend), 🤖 3. El Agente de IA (Sin Complicarse), 3. La Demostración en Clase: "SIN vs. CON AgentGuard" 🎬, 4. Cronograma Paso a Paso (De Hoy al 30 de Noviembre) 📅, 🔌 4. ¿Y MCP? (Decisión del Equipo: Eliminado por Pragmatismo) (+4 more)

### Community 92 - "`_MASTER_PROJECT_SNAPSHOT.md` — Fuente de Verdad Consolidada de AgentGuard"
Cohesion: 0.14
Nodes (13): 1.1 Qué problema resuelve, 1.2 Roles y realidad SaaS B2B vs. solicitud PaaS Superadmin, 1. Propósito y Modelo de Negocio (SaaS B2B vs. PaaS Multi-tenant), 3.1 Esquema PostgreSQL real (13 tablas, migraciones `001`–`005`), 3.2 Superficie HTTP/WebSocket real (`backend/app/api/`), 3.3 Contratos críticos: PEP Gateway, PDP, HITL y Escenarios Demo, 3. Modelo de Datos y Contratos Clave, 4.1 Módulos construidos y verificables en código (+5 more)

### Community 94 - "_mock_user_auth"
Cohesion: 0.20
Nodes (7): _mock_user_auth(), test_anti_ai_agent_header_blocked_on_all_control_plane_routes(), test_rbac_matrix_admin_only_mutations_and_settings(), test_rbac_matrix_approvals_resolve(), test_rbac_matrix_audit_events(), test_rbac_matrix_gateway_simulate(), test_rbac_matrix_operational_reads_allowed_for_all_roles()

### Community 95 - "health_check"
Cohesion: 0.25
Nodes (3): check_database_health(), health_check(), ping()

### Community 96 - "1.2 Inventario Individual (39 archivos `.md`)"
Cohesion: 0.12
Nodes (15): 1.1 Árbol Documental del Repositorio, 1.2 Inventario Individual (39 archivos `.md`), 1.3 Bloque Aparte: Logs Históricos de Ejecución (`.agents/teamwork/*/*`), 1.4 Artefactos No-Markdown Relacionados, 1. Inventario Completo de Archivos Markdown (`.md`), 2.1 Mapa de Duplicaciones Principales (7 grupos), 2. Mapa de Duplicaciones y Contradicciones, 3. Propuesta de Poda y Estructura Oficial Recomendada (+7 more)

### Community 97 - "revoke_api_key"
Cohesion: 0.18
Nodes (4): create_api_key(), get_api_key(), list_api_keys(), revoke_api_key()

### Community 98 - "3. Análisis Semántico de las Relaciones y Cardinalidades"
Cohesion: 0.29
Nodes (7): 3. Análisis Semántico de las Relaciones y Cardinalidades, A. Organización y Usuarios: `PERTENECE_A`, B. Usuario y Agente: `ADMINISTRA (OWNER)`, C. Agente y Herramienta: `AUTORIZADO_EN` (Relación $M:N$), D. Herramienta y Acción: `EXPONE`, E. Ejecución en Runtime: `SOLICITA` e `INVOCA`, F. Aprobación Humana: `REQUIERE_INTERVENCIÓN`

### Community 99 - "simulate_gateway_action"
Cohesion: 0.20
Nodes (3): execute_gateway_action(), get_attack_catalog(), simulate_gateway_action()

### Community 100 - "06 — Propuesta de Evolución Arquitectónica, Optimización de Rendimiento y Mejores Prácticas"
Cohesion: 0.17
Nodes (11): 06 — Propuesta de Evolución Arquitectónica, Optimización de Rendimiento y Mejores Prácticas, 1.1 Diagrama de Capas y Regla de Dependencia (Arquitectura Hexagonal / Clean), 1.2 Árbol de Directorios Objetivo — Backend (`backend/`), 1.3 Árbol de Directorios Objetivo — Frontend (`frontend/src/`), 1. Propuesta de Arquitectura Objetivo y Árbol de Directorios (Front & Back), 3.2 Cuellos de Botella en Frontend (Renderizado, Red, Estado y Memoria), 3. Detección de Cuellos de Botella de Rendimiento y Estrategias de Optimización, 4.1 Estándares de Backend (`Python 3.12+` / `FastAPI` / `SQLAlchemy 2.0` / `Pydantic v2`) (+3 more)

### Community 102 - "🧭 2. Flujo del Wizard de Presentación (4 Pasos Guiados)"
Cohesion: 0.20
Nodes (9): 📌 1. Objetivo y Visión General, 🧭 2. Flujo del Wizard de Presentación (4 Pasos Guiados), 💡 3. Componentes y Estados Sugeridos para la Implementación en React, 🤝 4. Distribución de Tareas del Equipo, 🎨 Especificación de Mejoras de Frontend: Presenter Tour & Live Demo Runner, Paso 1: Cotización Legítima (ALLOW), Paso 2: Abuso de Privilegio / Falta de Capacidad (DENY), Paso 3: Operación Financiera Sensible (REQUIRE_APPROVAL - HITL) (+1 more)

### Community 103 - "3. Hallazgos Críticos y Bugs Funcionales en el Frontend"
Cohesion: 0.15
Nodes (12): 02 — Diagnóstico Forense del Frontend y "Alma Máter" del Proyecto, 1. Veredicto General del Frontend, 2. Mapa de Estado por Pantalla y Componente, 3.1 Crash Fatal (White Screen of Death) en `TracesView` al Recibir Eventos WebSocket, 3.3 Pérdida de Datos Reales en el Mapeo DTO -> Dominio (`api.ts`), 3.4 Inconsistencias Matemáticas y Doble Conteo en `OverviewView` y `App`, 3.5 Usuario RBAC Fantasma (`Lucia Vance`) que Provoca Errores FK en Base de Datos, 3.6 Defectos de CSS, Tematización y Clases Inexistentes (+4 more)

### Community 104 - "AuditEventResponse"
Cohesion: 0.33
Nodes (3): AuditEventBase, AuditEventCreate, AuditEventResponse

### Community 106 - "update_tool"
Cohesion: 0.18
Nodes (5): create_tool(), delete_tool(), get_tool(), list_tools(), update_tool()

### Community 107 - "vite.config.ts"
Cohesion: 0.33
Nodes (5): devDependencies, tailwindcss@^4.3.3, @tailwindcss/vite@^4.3.3, tailwindcss, @tailwindcss/vite

### Community 108 - "BRIEFING — 2026-11-03 02:34:00 UTC"
Cohesion: 0.22
Nodes (8): Artifact Index, BRIEFING — 2026-11-03 02:34:00 UTC, 🔒 Key Constraints, Mission, 🔒 My Identity, Project Status, User Context, Victory Audit Status

### Community 109 - "4. Código Interno Muerto, Endpoints Desconectados y Reliquias de Prototipo"
Cohesion: 0.33
Nodes (6): 4.1 Tipos, Esquemas y Configuraciones con `0` Consumidores, 4.2 Par Endpoint + Método Cliente Nunca Invocado (`Attack Catalog`), 4.3 Dataset de Prototipo Heredado que Contamina Datos Reales (`mockData.ts`), 4.4 Modelo ORM y Tabla Huérfana Sujetos a Decisión de Producto (`AuditEvent`), 4. Código Interno Muerto, Endpoints Desconectados y Reliquias de Prototipo, SecurityStanceSettings

### Community 111 - "2. Reglas Innegociables de Seguridad, Dominio e Idioma"
Cohesion: 0.40
Nodes (5): 1. Identidad, Stack Políglota y Equipo, 2. Reglas Innegociables de Seguridad, Dominio e Idioma, 3. Testing, Zero-Regression y Comandos Canónicos en Windows, 4. Protocolo Lean Teamwork v2 (Orquestación Multi-Agente, Velocidad y Economía de Tokens), 🛡️ Reglas Operativas del Proyecto: AgentGuard

### Community 115 - "scripts"
Cohesion: 0.40
Nodes (5): scripts, build, dev, lint, preview

### Community 116 - "dependencies"
Cohesion: 0.40
Nodes (5): dependencies, lucide-react@^1.57.0, react@^19.2.8, react-dom@^19.2.8, react-dom

### Community 117 - "list_alerts"
Cohesion: 0.24
Nodes (3): get_alert_by_id(), list_alerts(), update_alert_status()

### Community 119 - "enums.py"
Cohesion: 0.08
Nodes (13): Alert, AlertSeverity, AlertStatus, AnalyticsOverviewResponse, AnalyticsService, _make_auth(), test_get_alert_by_id_found(), test_get_alert_by_id_not_found() (+5 more)

### Community 120 - "Alcance de la Fase 2:"
Cohesion: 0.33
Nodes (6): Alcance de la Fase 2:, INC-05: Router y Servicios para la Tabla Formal `audit_events`, INC-06: Router de Analítica y Series Temporales (`/analytics/overview` y `/timeseries`), INC-07: Conexión de Métricas Reales en `OverviewView.tsx`, INC-09: Conexión de Gestión de API Keys en `SettingsView.tsx`, INC-10: Persistencia de Configuración de Gobernanza de la Organización

### Community 121 - "Skeleton.tsx"
Cohesion: 0.12
Nodes (18): 1. Observation, 2. Logic Chain, 3. Caveats, 4. Conclusion, 5. Verification Method, Master Handoff Report — Sentinel (Fase 1, Fase 2 y Fase 3), INC-11: Refactorización de `api.ts` (Propagación Explícita de Errores y `ApiError`), INC-13: Estados de Carga Limpios con Skeleton Loaders y Empty States (+10 more)

### Community 122 - "2.3 Controles de seguridad para agentes IA (Implementado vs. Solo en papel)"
Cohesion: 0.50
Nodes (4): 2.1 Stack políglota verificado, 2.2 Topología PEP / PDP y aislamiento multi-tenant, 2.3 Controles de seguridad para agentes IA (Implementado vs. Solo en papel), 2. Arquitectura y Stack Tecnológico

### Community 123 - "01 — Auditoría Forense de Brecha Documental vs. Implementación Real (`Gap Analysis`)"
Cohesion: 0.50
Nodes (3): 01 — Auditoría Forense de Brecha Documental vs. Implementación Real (`Gap Analysis`), 1. Resumen Ejecutivo de Divergencia Arquitectónica, 3. Análisis Específico de Contradicciones Internas en la Documentación

### Community 124 - "test_agent_service_assign_tool"
Cohesion: 0.33
Nodes (3): test_agent_service_assign_tool(), test_agent_service_create(), mock_refresh()

### Community 125 - "run_demo.py"
Cohesion: 0.12
Nodes (6): Colors, _configure_stdio(), _decision_color(), load_config(), _mask_api_key(), parse_args()

### Community 126 - "Bloque A — Seguridad, Identidad y Cumplimiento de Reglas de Dominio"
Cohesion: 0.50
Nodes (4): 1. Modelo de Autenticación y Autorización Real (Humanos en Dashboard vs. Agentes en Gateway), 2. Destino de la Tabla `audit_events` (Auditoría Administrativa — Regla 7 de `AGENTS.md`), 3. Contradicción WORM Inmutable vs. Purga Automática de Trazas (30 a 365 días), Bloque A — Seguridad, Identidad y Cumplimiento de Reglas de Dominio

### Community 127 - "2. Patrones de Diseño Recomendados para Desacoplar el Dominio"
Cohesion: 0.50
Nodes (4): 2.2 *Specification / Strategy Registry* para Operadores del Motor PDP, 2.3 *Claim-Check Pattern* Cifrado para HITL (`HitlPayloadVault`), 2.4 *Strategy + Circuit Breaker* para Despacho de Herramientas (`LiveRestDispatcher` vs. `SandboxMockDispatcher`), 2. Patrones de Diseño Recomendados para Desacoplar el Dominio

### Community 129 - "2. Decisión Tomada"
Cohesion: 0.67
Nodes (3): 1. Contexto y Problema, 2. Decisión Tomada, ADR-007: Protocolo HITL Asíncrono (`202 Accepted`) + WebSockets y Bloqueo Pesimista

## Knowledge Gaps
- **47 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `2. Reglas Innegociables de Seguridad, Dominio e Idioma` connect `2. Reglas Innegociables de Seguridad, Dominio e Idioma` to `get_db`, `Skeleton.tsx`, `ToolAction`, `App.tsx`?**
  _High betweenness centrality (0.103) - this node is a cross-community bridge._
- **Are the 53 inferred relationships involving `User` (e.g. with `create_api_key()` and `get_api_key()`) actually correct?**
  _`User` has 53 INFERRED edges - model-reasoned connections that need verification._
- **Should `get_db` be split into smaller, more focused modules?**
  _Cohesion score 0.096045197740113 - nodes in this community are weakly interconnected._
- **Why does `useToast()` connect `App.tsx` to `labels.ts`, `PlaygroundView.tsx`, `2. Reglas Innegociables de Seguridad, Dominio e Idioma`, `Skeleton.tsx`, `api.ts`?**
  _High betweenness centrality (0.101) - this node is a cross-community bridge._
- **Are the 48 inferred relationships involving `UserRole` (e.g. with `register()` and `register_organization()`) actually correct?**
  _`UserRole` has 48 INFERRED edges - model-reasoned connections that need verification._
- **Should `domain.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.13877551020408163 - nodes in this community are weakly interconnected._
- **Why does `User` connect `UUID` to `get_db`, `models/user.py`, `_setup_admin_auth`, `uuid`, `Policy`, `schemas/auth.py`, `_setup_admin_auth`, `test_organization_settings.py`, `test_auth.py`, `Approval`, `asyncio`, `update_organization`, `ToolAction`, `UserService`, `typing`, `make_admin_jwt`, `seed_data`, `test_organizations.py`, `_mock_user_auth`, `revoke_api_key`, `test_register_org_duplicate_email_returns_400`, `enums.py`?**
  _High betweenness centrality (0.080) - this node is a cross-community bridge._