# Graph Report - AgentGuard  (2026-11-15)

## Corpus Check
- 194 files · ~174,663 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 18 file(s) not represented in the graph (top: .drawio 6, .example 3, .bat 3)

## Summary
- 2524 nodes · 6917 edges · 143 communities (95 shown, 48 thin omitted)
- Extraction: 90% EXTRACTED · 10% INFERRED · 0% AMBIGUOUS · INFERRED: 670 edges (avg confidence: 0.94)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `17aa734d`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Organization
- domain.ts
- cleanup_overrides
- 05 — Cuestionario de Decisiones Arquitectónicas y de Producto para el Usuario
- list_executions
- _setup_admin_auth
- App.tsx
- test_seed_demo.py
- UUID
- labels.ts
- frontend/package.json
- postgres
- make_admin_jwt
- approvals.py
- get_me
- PolicyRule
- User
- test_organization_settings.py
- PlaygroundView.tsx
- compilerOptions
- auth-ui.tsx
- test_auth.py
- compilerOptions
- Approval
- env.py
- list_executions
- _setup_admin_auth
- update_organization
- websocket_manager.py
- update_user
- api.ts
- OrganizationCreate
- PolicyService
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
- policy_service.py
- 3. Los 4 Escenarios Demostrables Paso a Paso
- ApiKey
- policy_rules.py
- 📐 Guía de Defensa: Modelo Conceptual (Chen) y Diccionario de Atributos
- generate_diagrams.py
- PolicyRuleService
- OrganizationService
- convert_docs_to_docx.py
- sanitizer_service.py
- Tool
- AuditService
- ToolActionService
- 🤖 AgentGuard — Agent Demo (Cliente CLI Python)
- CLAUDE.md
- 04 — Inventario Forense de Código Muerto, Dependencias Redundantes y Archivos Huérfanos
- copilot-instructions.md
- asyncio
- UserService
- Original User Request
- 003_add_api_keys.py
- make_admin_jwt
- .matches_conditions
- 🛡️ AgentGuard — Runtime Authorization & Governance for AI Agents
- threat_detector.py
- 🔐 AgentGuard — Guía Rápida de Credenciales y Roles Demo (Acme Corp)
- ensure_same_tenant
- PlaygroundView.tsx
- run_demo.py
- package.json
- ToolCreate
- list_approvals
- policies.py
- backend/scripts/seed_demo.py
- list_audit_events
- cleanup_overrides
- scripts
- create_tool_action
- test_organizations.py
- 🛡️ AgentGuard — Guía Simple y Hoja de Ruta para el Equipo
- `_MASTER_PROJECT_SNAPSHOT.md` — Fuente de Verdad Consolidada de AgentGuard
- _AutoYieldOverrides
- _mock_user_auth
- SanitizerService
- 1.2 Inventario Individual (39 archivos `.md`)
- revoke_api_key
- test_siem_webhook_test_ping_missing_url
- get_gateway_context
- 06 — Propuesta de Evolución Arquitectónica, Optimización de Rendimiento y Mejores Prácticas
- _AutoYieldOverrides
- 🧭 2. Flujo del Wizard de Presentación (4 Pasos Guiados)
- 3. Hallazgos Críticos y Bugs Funcionales en el Frontend
- OrganizationUpdate
- websocket_tenant_endpoint
- update_tool
- vite.config.ts
- BRIEFING — 2026-11-03 02:34:00 UTC
- 4. Código Interno Muerto, Endpoints Desconectados y Reliquias de Prototipo
- 2. Reglas Innegociables de Seguridad, Dominio e Idioma
- pnpm-workspace.yaml
- 🏗️ Guía de Defensa: Arquitectura de Runtime y Flujo de Intercepción PEP / PDP
- load_config
- scripts
- dependencies
- list_alerts
- 005_add_hashed_password_to_users.py
- pep_gateway_service.py
- Alcance de la Fase 2:
- ApiError
- asyncio
- _setup_admin_auth
- cleanup_overrides
- parse_args
- cleanup_overrides
- Colors
- test_tool_actions.py
- downgrade
- test_approval_resolve_schema

## God Nodes (most connected - your core abstractions)
1. `User` - 164 edges
2. `make_admin_jwt()` - 91 edges
3. `Organization` - 87 edges
4. `UserRole` - 85 edges
5. `Tool` - 78 edges
6. `ToolAction` - 76 edges
7. `BaseSchema` - 71 edges
8. `Agent` - 68 edges
9. `AgentTool` - 63 edges
10. `Execution` - 53 edges

## Surprising Connections (you probably didn't know these)
- `5. Los 4 Escenarios Canónicos` --references--> `AgentTool`  [INFERRED]
  agent-demo/README.md → backend/app/models/agent.py
- `Los 4 Escenarios Canónicos de `agent-demo`` --references--> `AgentTool`  [INFERRED]
  agentguard_credenciales_demo.md → backend/app/models/agent.py
- `❓ P1: *"¿Por qué modelan `AgentTool` como una relación $M:N$ en lugar de incluir un array de herramientas dentro del agente?"*` --references--> `AgentTool`  [INFERRED]
  agentguard_er_conceptual_chen.md → backend/app/models/agent.py
- `1. Veredicto Ejecutivo del Backend` --references--> `AgentTool`  [INFERRED]
  docs/archive/audit_reports/03_ESTADO_BACKEND_PENDIENTES.md → backend/app/models/agent.py
- `🎯 Objetivo de la Semana 2` --references--> `AgentTool`  [INFERRED]
  docs/archive/desglose_de_pasos_semana_2_api_rest_de_gestion.md → backend/app/models/agent.py

## Import Cycles
- None detected.

## Communities (143 total, 48 thin omitted)

### Community 0 - "Organization"
Cohesion: 0.06
Nodes (10): downgrade(), upgrade(), upgrade(), get_current_user(), require_admin_user(), require_roles(), resolve_tenant_org_id(), get_db() (+2 more)

### Community 1 - "domain.ts"
Cohesion: 0.14
Nodes (4): 3.2 Corrupción de Estado Real por Condición `data.length > 0` y Falsos Éxitos (`api.ts`), AgentGuardApiClient, extractApiError(), handleNetworkError()

### Community 3 - "05 — Cuestionario de Decisiones Arquitectónicas y de Producto para el Usuario"
Cohesion: 0.12
Nodes (16): 05 — Cuestionario de Decisiones Arquitectónicas y de Producto para el Usuario, 10. Activación Real de Redis 7, PostgreSQL RLS y Operadores Contextuales del PDP, 11. Eliminación del Modo *"Wizard-of-Oz"* (`mockData.ts` y Falsos Éxitos en `api.ts`), 12. Alcance de las 4 Pestañas Simuladas de `SettingsView.tsx`, 13. Evolución del `PlaygroundView` y Desarrollo de `agent-demo/`, 14. Gobernanza del Botón `"Reset Demo"` e Idioma Canónico de la Interfaz, 1. Modelo de Autenticación y Autorización Real (Humanos en Dashboard vs. Agentes en Gateway), 3. Contradicción WORM Inmutable vs. Purga Automática de Trazas (30 a 365 días) (+8 more)

### Community 4 - "list_executions"
Cohesion: 0.19
Nodes (6): get_execution_by_id(), list_executions(), _to_execution_response(), ExecutionResponse, 3.4 Latencia Forense Ficticia (`latency_ms=21.5`), 5. Deuda Técnica Estructural, Contratos Incompletos y Configuración

### Community 5 - "_setup_admin_auth"
Cohesion: 0.12
Nodes (7): test_api_create_tool_organization_not_found(), test_api_get_tool_found(), test_api_get_tool_not_found(), test_api_list_tools(), test_tool_service_create(), test_tool_service_get_by_id(), test_tool_service_list_by_org()

### Community 6 - "App.tsx"
Cohesion: 0.12
Nodes (46): 1. Observation, 2.2 Tabla Maestra de Vistas, Componentes y Estado de Consumo, Alcance de la Fase 3:, INC-12: Sistema Global de Notificaciones (Toasts) y Banners de Desconexión, INC-13: Estados de Carga Limpios con Skeleton Loaders y Empty States, App(), AppContent(), getInitialView() (+38 more)

### Community 7 - "test_seed_demo.py"
Cohesion: 0.09
Nodes (13): GatewayExecuteResponse, test_gateway_execute_endpoint_allow(), test_gateway_execute_endpoint_deny(), test_gateway_execute_endpoint_require_approval(), test_gateway_schemas(), test_api_reset_demo_success(), test_clear_database_executes_cascaded_deletes(), test_seed_data_already_exists_without_reset() (+5 more)

### Community 8 - "UUID"
Cohesion: 0.05
Nodes (28): _make_auth(), test_get_alert_by_id_found(), test_get_alert_by_id_not_found(), test_list_alerts_endpoint(), test_update_alert_status(), test_api_create_api_key_blocks_ai_agents(), test_api_create_api_key_org_not_found(), test_api_create_api_key_returns_raw_key_once_and_hides_hash() (+20 more)

### Community 9 - "labels.ts"
Cohesion: 0.12
Nodes (11): AGENT_STATUS_LABELS, AGENT_STATUS_STYLES, APPROVAL_STATUS_LABELS, DECISION_BADGE_CLASSES, DECISION_STYLES, RISK_LABELS, RISK_STYLES, ROLE_STYLES (+3 more)

### Community 10 - "frontend/package.json"
Cohesion: 0.14
Nodes (19): devDependencies, oxlint@^1.81.0, @types/node@^24.13.3, @types/react@^19.2.18, @types/react-dom@^19.2.7, typescript@~6.0.2, vite@^8.3.0, @vitejs/plugin-react@^6.1.1 (+11 more)

### Community 11 - "postgres"
Cohesion: 0.06
Nodes (37): driver, name, PGDATA, POSTGRES_DB, POSTGRES_PASSWORD, POSTGRES_USER, interval, retries (+29 more)

### Community 12 - "make_admin_jwt"
Cohesion: 0.04
Nodes (33): lifespan(), UserRole, make_admin_jwt(), test_api_get_audit_event_not_found(), test_api_get_audit_event_tenant_mismatch(), test_api_list_audit_events_offset_alias_and_filters(), test_api_list_audit_events_tenant_isolation_forbidden(), test_mutation_agent_lifecycle_logs_audit_events() (+25 more)

### Community 13 - "approvals.py"
Cohesion: 0.05
Nodes (41): 1.1 Contexto Institucional, Premisa Central y Arquitectura Políglota, 1.2 Diagnóstico Global de la Integración (Dualidad Real vs. Simulado), 1.3 El Patrón de Resiliencia Opaca: Riesgo de los *Silent Fallbacks*, 1.4 Métricas Globales de Cobertura de la Auditoría, 1. Resumen Ejecutivo y Diagnóstico Global del Sistema, 3.1 Módulo de Autenticación y Registro Corporativo, 3.2 Gráfico Interactivo de Actividad 24 Horas, 3.3 Base de Datos Empresarial Simulada en Memoria (Playground Sandbox) (+33 more)

### Community 15 - "PolicyRule"
Cohesion: 0.08
Nodes (17): RiskLevel, Policy, PolicyRule, test_create_rule_in_policy_success(), test_create_rule_target_agent_from_different_org(), test_create_rule_tool_action_from_different_org(), test_delete_policy_rule_preserves_policy_and_sister_rules(), test_update_policy_rule_success() (+9 more)

### Community 16 - "User"
Cohesion: 0.10
Nodes (17): User, _setup_admin_auth(), test_api_create_user_email_conflict(), test_api_create_user_organization_not_found(), test_api_create_user_success(), test_api_delete_user(), test_api_delete_user_not_found(), test_api_get_user_found() (+9 more)

### Community 17 - "test_organization_settings.py"
Cohesion: 0.07
Nodes (19): OrganizationSettingsUpdate, test_api_admin_user_same_tenant_allowed(), test_api_anti_ia_shield_blocks_agent_on_get(), test_api_anti_ia_shield_blocks_agent_on_patch(), test_api_get_settings_not_found(), test_api_get_settings_success(), test_api_multi_tenant_isolation_get_cross_tenant_denied(), test_api_multi_tenant_isolation_patch_cross_tenant_denied() (+11 more)

### Community 18 - "PlaygroundView.tsx"
Cohesion: 0.09
Nodes (31): EmptyStateAction, EmptyStateProps, TOAST_CONFIG, ToastItem(), HeaderProps, QuickSetupWizardProps, ResetDemoModalProps, DECISION_LABELS (+23 more)

### Community 19 - "compilerOptions"
Cohesion: 0.10
Nodes (20): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+12 more)

### Community 20 - "auth-ui.tsx"
Cohesion: 0.22
Nodes (19): AuthContentProps, AuthFormContainer(), AuthUI(), AuthUIProps, Button, ButtonProps, buttonVariants, cn() (+11 more)

### Community 21 - "test_auth.py"
Cohesion: 0.05
Nodes (21): login(), register(), create_access_token(), decode_access_token(), get_password_hash(), verify_password(), test_register_org_api_key_validates_in_gateway_service(), test_register_org_duplicate_email_returns_400() (+13 more)

### Community 22 - "compilerOptions"
Cohesion: 0.12
Nodes (16): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+8 more)

### Community 23 - "Approval"
Cohesion: 0.21
Nodes (7): _setup_user_auth(), test_approvals_get_by_id_not_found(), test_approvals_get_by_id_success(), test_approvals_list_endpoint(), test_approvals_resolve_already_resolved_or_not_found(), test_approvals_resolve_forbidden_for_non_approver_roles(), test_approvals_resolve_success()

### Community 24 - "env.py"
Cohesion: 0.07
Nodes (9): do_run_migrations(), run_async_migrations(), run_migrations_offline(), run_migrations_online(), Settings, test_health_endpoint(), test_ping_endpoint(), test_root_endpoint() (+1 more)

### Community 25 - "list_executions"
Cohesion: 0.15
Nodes (12): 03 — Estado Forense del Backend, Lógica Pendiente y Deuda Técnica Estructural, 1. Veredicto Ejecutivo del Backend, 2.2 Violaciones de Clave Foránea (`IntegrityError`) No Controladas (`HTTP 500`), 2. Crashes `HTTP 500` Confirmados en Tiempo de Ejecución, 3.1 Falso Éxito Silencioso en `_dispatch_to_tool` (Violación Directa de Fail-Closed), 3.2 Re-Despacho HITL Corrupto con Parámetros `"***REDACTED***"` y Pérdida de Resultado, 3. Stubs, Retornos Ficticios y Fallos de Lógica en el Core PEP/PDP, 4.1 Ausencia Total de Autenticación y Control de Acceso (RBAC) en APIs (+4 more)

### Community 26 - "_setup_admin_auth"
Cohesion: 0.12
Nodes (10): _setup_admin_auth(), test_agent_service_assign_tool(), test_agent_service_create(), mock_refresh(), test_agent_service_get_by_id(), test_api_assign_tool_different_org(), test_api_assign_tool_to_agent_success(), test_api_create_agent_owner_different_org() (+2 more)

### Community 27 - "update_organization"
Cohesion: 0.18
Nodes (7): create_organization(), get_organization(), get_organization_settings(), list_organizations(), test_organization_siem_webhook(), update_organization(), update_organization_settings()

### Community 28 - "websocket_manager.py"
Cohesion: 0.12
Nodes (6): WebSocketConnectionManager, test_websocket_endpoint_ping_pong(), test_websocket_manager_broadcast_tenant_isolation(), test_websocket_manager_connect_and_welcome(), test_websocket_manager_disconnect_cleanup(), test_websocket_tenant_endpoint_connect()

### Community 29 - "update_user"
Cohesion: 0.14
Nodes (8): create_user(), delete_user(), get_user(), list_users(), update_user(), UserRead, UserUpdate, test_user_schemas()

### Community 30 - "api.ts"
Cohesion: 0.11
Nodes (38): ROLE_DESCRIPTIONS, AuthContext, AuthContextType, AuthProvider(), formatAuthUser(), normalizeRole(), UNAUTHENTICATED_USER, VALID_ROLES (+30 more)

### Community 31 - "OrganizationCreate"
Cohesion: 0.29
Nodes (3): OrganizationCreate, test_organization_service_create(), test_organization_schemas()

### Community 35 - "AgentService"
Cohesion: 0.13
Nodes (4): AgentCreate, AgentToolCreate, AgentService, test_agent_and_agent_tool_schemas()

### Community 36 - ".oxlintrc.json"
Cohesion: 0.33
Nodes (5): plugins, rules, react/only-export-components, react/rules-of-hooks, $schema

### Community 37 - "🔄 Guía de Defensa: Máquinas de Estados y Ciclo de Vida en Runtime (Protocolo HITL 202 Accepted)"
Cohesion: 0.20
Nodes (9): 1. Modelado de Estados en Arquitecturas Asíncronas (`202 Accepted`), 2. Diagramas de Estados Reales (Mermaid), 5. Preguntas Difíciles del Profesor y Respuestas Sugeridas, A. Máquina 1: Ciclo de Vida de una Ejecución (`Execution.status`), B. Máquina 2: Ciclo de Vida de una Aprobación (`Approval.status`), C. Máquina 3: Ciclo de Vida de un Incidente de Seguridad (`Alert.status`), 🔄 Guía de Defensa: Máquinas de Estados y Ciclo de Vida en Runtime (Protocolo HITL 202 Accepted), ❓ P1: *"¿Por qué cambiaron de mantener la conexión HTTP abierta a devolver `202 Accepted` en HITL?"* (+1 more)

### Community 38 - "🏛️ Registro de Decisiones Arquitectónicas (ADRs) — AgentGuard"
Cohesion: 0.11
Nodes (18): 1. Contexto y Problema, 1. Contexto y Problema, 1. Contexto y Problema, 1. Decisión Tomada, 1. Decisión Tomada, 1. Decisión Tomada, 1. Decisión Tomada, 2. Asignación por Paquete (+10 more)

### Community 45 - "🎯 Guía de Defensa: Diagrama de Casos de Uso del Sistema (UML)"
Cohesion: 0.17
Nodes (11): 1. Clasificación de Actores y Frontera del Sistema, 2. Diagrama de Casos de Uso del Sistema (Mermaid), 3. Mapeo con los Requisitos Funcionales del Informe (RF-01 a RF-12), 4. Justificación Teórica de Relaciones `<<include>>` y `<<extend>>`, 5. Especificación Detallada del Caso de Uso Crítico: UC05, 6. Preguntas de Examen / Defensa y Respuestas Clave, 🎯 Guía de Defensa: Diagrama de Casos de Uso del Sistema (UML), ❓ P1: *"¿Por qué el Agente de IA está modelado como un Actor si no es una persona?"* (+3 more)

### Community 46 - "🛡️ Guía de Defensa: Modelo Entidad-Relación Relacional Multi-Tenant (13 Tablas)"
Cohesion: 0.15
Nodes (12): 1. Propósito y Alcance del Diagrama, 2. Diagrama del Modelo Entidad-Relación (Mermaid — 13 Tablas), 3. Decisiones Arquitectónicas y Justificación Técnica, 4. Capacidades Clave de la Persistencia, 5. Preguntas Difíciles del Profesor y Respuestas Recomendadas, A. Estrategia Multi-Tenant: Esquema Compartido con Aislamiento Obligatorio en Capa de Aplicación, B. Uso de `UUID v4` como Clave Primaria en lugar de Enteros Seriales, C. Uso Estratégico de `JSONB` con Índices GIN (+4 more)

### Community 47 - "WebhookService"
Cohesion: 0.19
Nodes (3): OrganizationSettings, SiemWebhookTestResponse, WebhookService

### Community 48 - "BaseSchema"
Cohesion: 0.06
Nodes (23): AlertUpdateRequest, ApiKeyCreate, ApiKeyCreatedResponse, ApiKeyResponse, ApprovalDetailRead, ApprovalRead, ApprovalResolveRequest, AuditEventBase (+15 more)

### Community 49 - "📑 Desglose de Pasos: Semana 1 — Base de Datos & Setup Inicial"
Cohesion: 0.05
Nodes (39): ⚙️ AgentGuard — Backend (Python 3.12+ & FastAPI), 🏗️ Arquitectura de la API REST (`/api/v1`), 📋 Especificaciones Históricas Archivadas, 📁 Estructura del Código Fuente, 🧪 Pruebas Automatizadas, 🗄️ Versionado de Base de Datos con Alembic, 1. Levantar Servicios de Infraestructura (Paso 1), 2. Preparar el Entorno Virtual de Python (Paso 2) (+31 more)

### Community 50 - "policy_service.py"
Cohesion: 0.12
Nodes (7): PolicyCreate, PolicyUpdate, PolicyRuleCreate, PolicyRuleCreateInPolicy, test_policy_service_create(), test_policy_rule_service_create(), test_policy_and_policy_rule_schemas_fail_closed()

### Community 51 - "3. Los 4 Escenarios Demostrables Paso a Paso"
Cohesion: 0.20
Nodes (9): 1. Guión y Estrategia de Presentación ante el Tribunal, 2. Diagrama de Secuencia Real (Mermaid), 3. Los 4 Escenarios Demostrables Paso a Paso, 4. Cierre Forense en `TracesView` (`GET /api/v1/executions`), Escenario 1: Operación Normal (`ALLOW` — HTTP `200 OK`), Escenario 2: Privilegio Mínimo / Abuso Bloqueado (`DENY` — HTTP `403 Forbidden`), Escenario 3: Operación Sensible con Human-in-the-Loop (`REQUIRE_APPROVAL` — HTTP `202 Accepted`), Escenario 4: Exfiltración de Datos y Alerta Crítica (`DENY + CRITICAL ALERT` — HTTP `403 Forbidden`) (+1 more)

### Community 52 - "ApiKey"
Cohesion: 0.15
Nodes (4): register_organization(), ApiKey, ApiKeyService, 2. Decisión Tomada

### Community 53 - "policy_rules.py"
Cohesion: 0.18
Nodes (6): create_policy_rule(), delete_policy_rule(), get_policy_rule(), list_policy_rules(), update_policy_rule(), PolicyRuleRead

### Community 54 - "📐 Guía de Defensa: Modelo Conceptual (Chen) y Diccionario de Atributos"
Cohesion: 0.13
Nodes (14): 1. Propósito y Valor Académico de la Notación Chen, 2. Diagrama Conceptual de Entidad-Relación (Notación Chen), 3. Análisis Semántico de las Relaciones y Cardinalidades, 4. Biblioteca de Atributos: Clasificación por Naturaleza, 5. Preguntas de Cátedra y Respuestas Sugeridas, A. Organización y Usuarios: `PERTENECE_A`, B. Usuario y Agente: `ADMINISTRA (OWNER)`, C. Agente y Herramienta: `AUTORIZADO_EN` (Relación $M:N$) (+6 more)

### Community 55 - "generate_diagrams.py"
Cohesion: 0.11
Nodes (9): check_database_health(), check_redis_health(), health_check(), ping(), root(), build_drawio_xml(), add_card(), add_edge() (+1 more)

### Community 56 - "PolicyRuleService"
Cohesion: 0.16
Nodes (3): PolicyRuleUpdate, _invalidate_policy_cache(), PolicyRuleService

### Community 58 - "convert_docs_to_docx.py"
Cohesion: 0.20
Nodes (8): add_markdown_to_docx(), build_docx_files(), set_cell_background(), set_cell_margins(), add_markdown_to_docx(), build_domain_docx(), set_cell_background(), set_cell_margins()

### Community 59 - "sanitizer_service.py"
Cohesion: 0.13
Nodes (5): test_sanitize_bearer_token_in_string(), test_sanitize_credit_card_masking(), test_sanitize_empty_context(), test_sanitize_lists_and_tuples(), test_sanitize_sensitive_keys()

### Community 60 - "Tool"
Cohesion: 0.07
Nodes (41): Agent, AgentTool, Tool, ToolAction, GatewayExecuteRequest, PDPDecisionResult, make_api_key_pair(), test_executions_api_get_by_id_serializes_db_latency() (+33 more)

### Community 61 - "AuditService"
Cohesion: 0.17
Nodes (5): AuditEvent, ActorType, AuditService, 4.4 Modelo ORM y Tabla Huérfana Sujetos a Decisión de Producto (`AuditEvent`), 2. Destino de la Tabla `audit_events` (Auditoría Administrativa — Regla 7 de `AGENTS.md`)

### Community 63 - "🤖 AgentGuard — Agent Demo (Cliente CLI Python)"
Cohesion: 0.17
Nodes (8): 1. Requisitos previos, 2. Instalación, 3. Configuración (`.env`), 4. Ejecución, 5. Los 4 Escenarios Canónicos, 🤖 AgentGuard — Agent Demo (Cliente CLI Python), 🌐 AgentGuard — Frontend (Dashboard Web SPA SaaS B2B), 🛠️ Comandos Útiles (`pnpm`)

### Community 65 - "04 — Inventario Forense de Código Muerto, Dependencias Redundantes y Archivos Huérfanos"
Cohesion: 0.18
Nodes (10): 04 — Inventario Forense de Código Muerto, Dependencias Redundantes y Archivos Huérfanos, 1. Resumen Cuantitativo de Higiene del Repositorio, 2. Archivos Huérfanos Trackeados en Git (Candidatos a Eliminación Directa), 3. Archivos Duplicados y Exportaciones Redundantes en Raíz, 5.1 Paquetes Python sin Uso en [backend/requirements.txt](file:///c:/Users/jonat/Downloads/Codigos/AgentGuard/backend/requirements.txt), 5.2 Scripts Rotos o Redundantes en [package.json](file:///c:/Users/jonat/Downloads/Codigos/AgentGuard/package.json) (Raíz), 5. Dependencias Huérfanas y Scripts de Monorepo Rotos, 6.1 Solapamiento entre 8 Archivos de Instrucciones para Agentes de IA (+2 more)

### Community 67 - "asyncio"
Cohesion: 0.14
Nodes (6): test_api_audit_events_anti_ai_shield(), test_api_get_audit_event_by_id_success(), test_api_list_audit_events_success(), test_audit_service_get_by_id(), test_audit_service_list_and_count_events(), test_audit_service_log_audit_event()

### Community 70 - "Original User Request"
Cohesion: 0.12
Nodes (16): Contexto y Reglas Obligatorias:, Criterios de Aceptación:, Criterios de Aceptación:, Entregables:, Follow-up — 2026-11-02 21:50:33 UTC, Follow-up — 2026-11-03 01:31:43 UTC, INC-01: Homogeneización de Enums y Localización Integral al Español en la UI, INC-02: Endpoints Granulares de Reglas, Aislamiento por Empresa y Blindaje Anti-IA (+8 more)

### Community 72 - "003_add_api_keys.py"
Cohesion: 0.18
Nodes (4): downgrade(), upgrade(), downgrade(), upgrade()

### Community 73 - "make_admin_jwt"
Cohesion: 0.06
Nodes (22): get_analytics_overview(), get_analytics_timeseries(), _validate_and_parse_org_id(), _verify_tenant_access(), AnalyticsOverviewResponse, AnalyticsTimeseriesResponse, TimeseriesPoint, AnalyticsService (+14 more)

### Community 74 - ".matches_conditions"
Cohesion: 0.11
Nodes (10): PolicyDecision, RuleEffect, PDPEngine, test_matches_conditions_destinations(), test_matches_conditions_empty(), test_matches_conditions_numeric(), test_pdp_evaluate_allow(), test_pdp_evaluate_deny_fail_closed() (+2 more)

### Community 75 - "🛡️ AgentGuard — Runtime Authorization & Governance for AI Agents"
Cohesion: 0.17
Nodes (12): 🛡️ AgentGuard — Plataforma SaaS B2B Multi-Tenant de Gobernanza en Runtime para Agentes de IA, 🚀 Arranque Rápido Local, 🏛️ Contexto Institucional y Equipo, 📄 Documentos Oficiales y Decisiones de Arquitectura, 🗂️ Estructura del Monorepositorio, 🤖 Guía y Reglas para Agentes de IA (`AGENTS.md`), 👥 Integrantes y Roles, 🎬 La Secuencia de la Demo Principal (En Vivo) (+4 more)

### Community 76 - "threat_detector.py"
Cohesion: 0.17
Nodes (3): ThreatAnalysisResult, ThreatDetectorService, 5. Deuda Técnica y Riesgos Detectados

### Community 77 - "🔐 AgentGuard — Guía Rápida de Credenciales y Roles Demo (Acme Corp)"
Cohesion: 0.18
Nodes (10): 1. Credenciales de Usuarios (Acme Corp), 2. Matriz Resumida de Permisos por Rol (RBAC), 3. Paso Obligatorio Antes de Correr `agent-demo`: Generar `X-AgentGuard-Key`, 4. Guión Sugerido de Logins para la Demo en Vivo, 5. Entidades y Descubrimiento Dinámico de Acme Corp, 6. Comandos de Reinicio (Factory Reset) de Acme Corp, 🔐 AgentGuard — Guía Rápida de Credenciales y Roles Demo (Acme Corp), Entorno y Agentes (+2 more)

### Community 78 - "ensure_same_tenant"
Cohesion: 0.13
Nodes (11): assign_tool_to_agent(), create_agent(), delete_agent(), get_agent(), list_agent_tools(), list_agents(), update_agent(), ensure_same_tenant() (+3 more)

### Community 79 - "PlaygroundView.tsx"
Cohesion: 0.17
Nodes (14): 2.1 Arquitectura de Ruteo y Navegación Hash, 2. Inventario Exhaustivo de Vistas y Componentes del Frontend, SidebarProps, DashboardSidebarProps, NavGroupData, NavItem(), NavItemData, SidebarNav() (+6 more)

### Community 80 - "run_demo.py"
Cohesion: 0.14
Nodes (11): build_payload(), _configure_stdio(), _decision_color(), DemoConfig, DemoScenario, main(), _mask_api_key(), run_all_scenarios() (+3 more)

### Community 81 - "package.json"
Cohesion: 0.12
Nodes (20): dependencies, class-variance-authority@^0.7.1, clsx@^2.1.1, @radix-ui/react-label@^2.1.17, @radix-ui/react-slot@^1.5.0, tailwind-merge@^3.7.0, tw-animate-css@^1.4.0, description (+12 more)

### Community 82 - "ToolCreate"
Cohesion: 0.15
Nodes (5): ToolCreate, ToolUpdate, ToolService, test_tool_and_action_schemas(), 2.1 Fallos `sqlalchemy.exc.MissingGreenlet` por Lazy-Loading Implícito tras `db.refresh()`

### Community 83 - "list_approvals"
Cohesion: 0.24
Nodes (3): get_approval(), list_approvals(), resolve_approval()

### Community 84 - "policies.py"
Cohesion: 0.17
Nodes (7): create_policy(), create_policy_rule_in_policy(), delete_policy(), get_policy(), list_policies(), update_policy(), PolicyRead

### Community 85 - "backend/scripts/seed_demo.py"
Cohesion: 0.24
Nodes (5): clear_database(), ensure_canonical_demo_users(), main(), _resolve_demo_org(), seed_data()

### Community 88 - "scripts"
Cohesion: 0.17
Nodes (12): scripts, build:frontend, dev:backend, dev:frontend, lint:frontend, start, start:all, start:backend (+4 more)

### Community 89 - "create_tool_action"
Cohesion: 0.25
Nodes (3): create_tool_action(), get_tool_action(), list_tool_actions()

### Community 90 - "test_organizations.py"
Cohesion: 0.11
Nodes (14): _setup_admin_auth(), test_api_create_organization_success(), test_api_create_organization_validation_error(), test_api_get_organization_found(), test_api_get_organization_not_found(), test_api_list_organizations(), test_api_patch_organization_ai_agent_blocked(), test_api_patch_organization_cross_tenant_forbidden() (+6 more)

### Community 91 - "🛡️ AgentGuard — Guía Simple y Hoja de Ruta para el Equipo"
Cohesion: 0.15
Nodes (12): 1. La Idea Explicada "Para un Nene de 5 Años" 🧒, 🌐 1. La Página Web (Frontend), 2. ¿Dónde Encaja Cada Pieza Técnica? 🧩, ⚙️ 2. La API REST (Backend), 🤖 3. El Agente de IA (Sin Complicarse), 3. La Demostración en Clase: "SIN vs. CON AgentGuard" 🎬, 4. Cronograma Paso a Paso (De Hoy al 30 de Noviembre) 📅, 🔌 4. ¿Y MCP? (Decisión del Equipo: Eliminado por Pragmatismo) (+4 more)

### Community 92 - "`_MASTER_PROJECT_SNAPSHOT.md` — Fuente de Verdad Consolidada de AgentGuard"
Cohesion: 0.12
Nodes (16): 1.1 Qué problema resuelve, 1.2 Roles y realidad SaaS B2B vs. solicitud PaaS Superadmin, 1. Propósito y Modelo de Negocio (SaaS B2B vs. PaaS Multi-tenant), 2.1 Stack políglota verificado, 2.2 Topología PEP / PDP y aislamiento multi-tenant, 2.3 Controles de seguridad para agentes IA (Implementado vs. Solo en papel), 2. Arquitectura y Stack Tecnológico, 3.1 Esquema PostgreSQL real (13 tablas, migraciones `001`–`005`) (+8 more)

### Community 94 - "_mock_user_auth"
Cohesion: 0.17
Nodes (9): _mock_user_auth(), test_anti_ai_agent_header_blocked_on_all_control_plane_routes(), test_anti_idor_cross_tenant_blocked_with_403(), test_rbac_matrix_admin_only_mutations_and_settings(), test_rbac_matrix_alerts_triage(), test_rbac_matrix_approvals_resolve(), test_rbac_matrix_audit_events(), test_rbac_matrix_gateway_simulate() (+1 more)

### Community 96 - "1.2 Inventario Individual (39 archivos `.md`)"
Cohesion: 0.13
Nodes (14): 1.1 Árbol Documental del Repositorio, 1.2 Inventario Individual (39 archivos `.md`), 1.3 Bloque Aparte: Logs Históricos de Ejecución (`.agents/teamwork/*/*`), 1.4 Artefactos No-Markdown Relacionados, 1. Inventario Completo de Archivos Markdown (`.md`), 2.1 Mapa de Duplicaciones Principales (7 grupos), 2. Mapa de Duplicaciones y Contradicciones, 3. Propuesta de Poda y Estructura Oficial Recomendada (+6 more)

### Community 97 - "revoke_api_key"
Cohesion: 0.18
Nodes (4): create_api_key(), get_api_key(), list_api_keys(), revoke_api_key()

### Community 98 - "test_siem_webhook_test_ping_missing_url"
Cohesion: 0.20
Nodes (5): test_list_organizations_success(), test_siem_webhook_settings_update(), mock_execute(), test_siem_webhook_test_ping_missing_url(), test_siem_webhook_test_ping_success()

### Community 99 - "get_gateway_context"
Cohesion: 0.07
Nodes (11): reset_demo_data(), execute_gateway_action(), get_attack_catalog(), get_gateway_context(), simulate_gateway_action(), GatewayContextAction, GatewayContextAgent, GatewayContextResponse (+3 more)

### Community 100 - "06 — Propuesta de Evolución Arquitectónica, Optimización de Rendimiento y Mejores Prácticas"
Cohesion: 0.11
Nodes (17): 06 — Propuesta de Evolución Arquitectónica, Optimización de Rendimiento y Mejores Prácticas, 0.2 Frontend: Vistas Monolíticas, Cliente HTTP "Mágico" y Sockets Duplicados, 0. Diagnóstico del Acoplamiento Actual (Estado *As-Is*), 1.1 Diagrama de Capas y Regla de Dependencia (Arquitectura Hexagonal / Clean), 1.2 Árbol de Directorios Objetivo — Backend (`backend/`), 1.3 Árbol de Directorios Objetivo — Frontend (`frontend/src/`), 1. Propuesta de Arquitectura Objetivo y Árbol de Directorios (Front & Back), 2.2 *Specification / Strategy Registry* para Operadores del Motor PDP (+9 more)

### Community 102 - "🧭 2. Flujo del Wizard de Presentación (4 Pasos Guiados)"
Cohesion: 0.20
Nodes (9): 📌 1. Objetivo y Visión General, 🧭 2. Flujo del Wizard de Presentación (4 Pasos Guiados), 💡 3. Componentes y Estados Sugeridos para la Implementación en React, 🤝 4. Distribución de Tareas del Equipo, 🎨 Especificación de Mejoras de Frontend: Presenter Tour & Live Demo Runner, Paso 1: Cotización Legítima (ALLOW), Paso 2: Abuso de Privilegio / Falta de Capacidad (DENY), Paso 3: Operación Financiera Sensible (REQUIRE_APPROVAL - HITL) (+1 more)

### Community 103 - "3. Hallazgos Críticos y Bugs Funcionales en el Frontend"
Cohesion: 0.17
Nodes (11): 02 — Diagnóstico Forense del Frontend y "Alma Máter" del Proyecto, 1. Veredicto General del Frontend, 2. Mapa de Estado por Pantalla y Componente, 3.1 Crash Fatal (White Screen of Death) en `TracesView` al Recibir Eventos WebSocket, 3.3 Pérdida de Datos Reales en el Mapeo DTO -> Dominio (`api.ts`), 3.4 Inconsistencias Matemáticas y Doble Conteo en `OverviewView` y `App`, 3.5 Usuario RBAC Fantasma (`Lucia Vance`) que Provoca Errores FK en Base de Datos, 3.6 Defectos de CSS, Tematización y Clases Inexistentes (+3 more)

### Community 104 - "OrganizationUpdate"
Cohesion: 0.20
Nodes (3): OrganizationUpdate, test_organization_service_update_not_found(), test_organization_service_update_success()

### Community 106 - "update_tool"
Cohesion: 0.17
Nodes (6): create_tool(), delete_tool(), get_tool(), list_tools(), update_tool(), ToolRead

### Community 107 - "vite.config.ts"
Cohesion: 0.33
Nodes (5): devDependencies, tailwindcss@^4.3.3, @tailwindcss/vite@^4.3.3, tailwindcss, @tailwindcss/vite

### Community 108 - "BRIEFING — 2026-11-03 02:34:00 UTC"
Cohesion: 0.22
Nodes (8): Artifact Index, BRIEFING — 2026-11-03 02:34:00 UTC, 🔒 Key Constraints, Mission, 🔒 My Identity, Project Status, User Context, Victory Audit Status

### Community 109 - "4. Código Interno Muerto, Endpoints Desconectados y Reliquias de Prototipo"
Cohesion: 0.40
Nodes (5): 4.1 Tipos, Esquemas y Configuraciones con `0` Consumidores, 4.2 Par Endpoint + Método Cliente Nunca Invocado (`Attack Catalog`), 4.3 Dataset de Prototipo Heredado que Contamina Datos Reales (`mockData.ts`), 4. Código Interno Muerto, Endpoints Desconectados y Reliquias de Prototipo, SecurityStanceSettings

### Community 111 - "2. Reglas Innegociables de Seguridad, Dominio e Idioma"
Cohesion: 0.40
Nodes (5): 1. Identidad, Stack Políglota y Equipo, 2. Reglas Innegociables de Seguridad, Dominio e Idioma, 3. Testing, Zero-Regression y Comandos Canónicos en Windows, 4. Protocolo Lean Teamwork v2 (Orquestación Multi-Agente, Velocidad y Economía de Tokens), 🛡️ Reglas Operativas del Proyecto: AgentGuard

### Community 113 - "🏗️ Guía de Defensa: Arquitectura de Runtime y Flujo de Intercepción PEP / PDP"
Cohesion: 0.29
Nodes (6): 1. El Paradigma de Seguridad: ¿Por qué Fuera del LLM?, 2. Diagrama de Arquitectura de Runtime Real (Mermaid), 4. Preguntas Difíciles del Profesor y Respuestas Recomendadas, 🏗️ Guía de Defensa: Arquitectura de Runtime y Flujo de Intercepción PEP / PDP, ❓ P1: *"¿Cómo garantizan consistencia entre políticas recién modificadas y evaluaciones en tiempo real?"*, ❓ P2: *"¿Qué ocurre si una petición activa `REQUIRE_APPROVAL` y nadie responde?"*

### Community 115 - "scripts"
Cohesion: 0.40
Nodes (5): scripts, build, dev, lint, preview

### Community 116 - "dependencies"
Cohesion: 0.40
Nodes (5): dependencies, lucide-react@^1.57.0, react@^19.2.8, react-dom@^19.2.8, react-dom

### Community 117 - "list_alerts"
Cohesion: 0.18
Nodes (5): get_alert_by_id(), list_alerts(), update_alert_status(), AlertRead, test_alert_schema()

### Community 119 - "pep_gateway_service.py"
Cohesion: 0.06
Nodes (29): 3. Componentes Clave de Runtime, 3. Análisis Detallado de Transiciones y Respuestas HTTP, 4. Concurrencia y Prevención de Condiciones de Carrera (TOCTOU), Base, Alert, Approval, AgentStatus, AlertSeverity (+21 more)

### Community 120 - "Alcance de la Fase 2:"
Cohesion: 0.29
Nodes (7): Alcance de la Fase 2:, INC-05: Router y Servicios para la Tabla Formal `audit_events`, INC-06: Router de Analítica y Series Temporales (`/analytics/overview` y `/timeseries`), INC-07: Conexión de Métricas Reales en `OverviewView.tsx`, INC-08: Modelo, Migración y Router de API Keys PEP (`/api/v1/api-keys`), INC-09: Conexión de Gestión de API Keys en `SettingsView.tsx`, INC-10: Persistencia de Configuración de Gobernanza de la Organización

### Community 121 - "ApiError"
Cohesion: 0.22
Nodes (7): 2. Logic Chain, 3. Caveats, 4. Conclusion, 5. Verification Method, Master Handoff Report — Sentinel (Fase 1, Fase 2 y Fase 3), INC-11: Refactorización de `api.ts` (Propagación Explícita de Errores y `ApiError`), ApiError

### Community 128 - "test_tool_actions.py"
Cohesion: 0.13
Nodes (11): _setup_admin_auth(), test_api_create_tool_action_duplicate_conflict(), test_api_create_tool_action_success(), test_api_create_tool_action_tool_not_found(), test_api_get_tool_action_found(), test_api_get_tool_action_not_found(), test_api_list_tool_actions(), test_tool_action_service_create() (+3 more)

## Knowledge Gaps
- **48 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `2. Reglas Innegociables de Seguridad, Dominio e Idioma` connect `2. Reglas Innegociables de Seguridad, Dominio e Idioma` to `Organization`, `ApiError`, `Tool`, `App.tsx`?**
  _High betweenness centrality (0.110) - this node is a cross-community bridge._
- **Are the 64 inferred relationships involving `User` (e.g. with `create_api_key()` and `get_api_key()`) actually correct?**
  _`User` has 64 INFERRED edges - model-reasoned connections that need verification._
- **Should `Organization` be split into smaller, more focused modules?**
  _Cohesion score 0.06386743886743887 - nodes in this community are weakly interconnected._
- **Why does `useToast()` connect `App.tsx` to `labels.ts`, `PlaygroundView.tsx`, `api.ts`, `2. Reglas Innegociables de Seguridad, Dominio e Idioma`?**
  _High betweenness centrality (0.103) - this node is a cross-community bridge._
- **Are the 24 inferred relationships involving `Organization` (e.g. with `register()` and `register_organization()`) actually correct?**
  _`Organization` has 24 INFERRED edges - model-reasoned connections that need verification._
- **Should `domain.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.13556953179594688 - nodes in this community are weakly interconnected._
- **Why does `AgentTool` connect `Tool` to `Organization`, `AgentService`, `06 — Propuesta de Evolución Arquitectónica, Optimización de Rendimiento y Mejores Prácticas`, `🧭 2. Flujo del Wizard de Presentación (4 Pasos Guiados)`, `test_seed_demo.py`, `make_admin_jwt`, `🔐 AgentGuard — Guía Rápida de Credenciales y Roles Demo (Acme Corp)`, `2. Reglas Innegociables de Seguridad, Dominio e Idioma`, `📑 Desglose de Pasos: Semana 1 — Base de Datos & Setup Inicial`, `ToolCreate`, `backend/scripts/seed_demo.py`, `📐 Guía de Defensa: Modelo Conceptual (Chen) y Diccionario de Atributos`, `pep_gateway_service.py`, `list_executions`, `_setup_admin_auth`, `🤖 AgentGuard — Agent Demo (Cliente CLI Python)`?**
  _High betweenness centrality (0.100) - this node is a cross-community bridge._