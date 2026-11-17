# Graph Report - AgentGuard  (2026-11-17)

## Corpus Check
- 212 files · ~195,500 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 23 file(s) not represented in the graph (top: .drawio 6, (none) 4, .example 4)

## Summary
- 2799 nodes · 7551 edges · 168 communities (102 shown, 66 thin omitted)
- Extraction: 90% EXTRACTED · 10% INFERRED · 0% AMBIGUOUS · INFERRED: 721 edges (avg confidence: 0.94)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `06bff28a`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- datetime
- domain.ts
- generate_diagrams.py
- 05 — Cuestionario de Decisiones Arquitectónicas y de Producto para el Usuario
- list_executions
- _setup_admin_auth
- agent_service.py
- policies.py
- PolicyRuleService
- App.tsx
- frontend/package.json
- postgres
- test_gemini_agent.py
- approvals.py
- domain.ts
- User
- UUID
- Policy
- compilerOptions
- auth-ui.tsx
- typing
- compilerOptions
- run_demo.py
- convert_docs_to_docx.py
- OrganizationSettingsUpdate
- AcmeDatabase
- organization_service.py
- websocket_manager.py
- update_user
- ToolCreate
- ensure_same_tenant
- PolicyService
- AgentService
- .oxlintrc.json
- gemini_client.py
- 🏛️ Registro de Decisiones Arquitectónicas (ADRs) — AgentGuard
- tsconfig.json
- 🎯 Guía de Defensa: Diagrama de Casos de Uso del Sistema (UML)
- 🛡️ Guía de Defensa: Modelo Entidad-Relación Relacional Multi-Tenant (13 Tablas)
- WebhookService
- AuthContext.tsx
- 📑 Desglose de Pasos: Semana 1 — Base de Datos & Setup Inicial
- test_agent_service_assign_tool
- 3. Los 4 Escenarios Demostrables Paso a Paso
- ApiKey
- test_agents.py
- 📐 Guía de Defensa: Modelo Conceptual (Chen) y Diccionario de Atributos
- PolicyRule
- AlertRead
- AcmeSettings
- sanitizer_service.py
- Tool
- AuditService
- ToolActionService
- 🤖 AgentGuard — Agent Demo (Cliente CLI Python)
- CLAUDE.md
- 04 — Inventario Forense de Código Muerto, Dependencias Redundantes y Archivos Huérfanos
- copilot-instructions.md
- app.py
- .get_by_id
- 🔄 Guía de Defensa: Máquinas de Estados y Ciclo de Vida en Runtime (Protocolo HITL 202 Accepted)
- Original User Request
- sqlalchemy
- get_analytics_overview
- PDPEngine
- 🛡️ AgentGuard — Runtime Authorization & Governance for AI Agents
- threat_detector.py
- 🔐 AgentGuard — Guía Rápida de Credenciales y Roles Demo (Acme Corp)
- BaseSchema
- dashboard-sidebar.tsx
- Bloque D — Experiencia de Frontend, Simulación y Demo Académica
- package.json
- test_health.py
- approvals.py
- create_app
- app.js
- load_config
- cleanup_overrides
- scripts
- test_acme_server.py
- Organization
- 🛡️ AgentGuard — Guía Simple y Hoja de Ruta para el Equipo
- `_MASTER_PROJECT_SNAPSHOT.md` — Fuente de Verdad Consolidada de AgentGuard
- _AutoYieldOverrides
- _mock_user_auth
- SanitizerService
- 1.2 Inventario Individual (39 archivos `.md`)
- test_api_keys.py
- PolicyRuleRead
- _setup_user_auth
- 06 — Propuesta de Evolución Arquitectónica, Optimización de Rendimiento y Mejores Prácticas
- _AutoYieldOverrides
- 🧭 2. Flujo del Wizard de Presentación (4 Pasos Guiados)
- 3. Hallazgos Críticos y Bugs Funcionales en el Frontend
- Bloque B — Flujo Runtime del Gateway PEP, HITL y Herramientas
- seed_data
- update_tool
- vite.config.ts
- BRIEFING — 2026-11-03 02:34:00 UTC
- 💥 ACME Corporation — Portal Empresarial & Copiloto BI (Looney Tunes Edition)
- 01 — Auditoría Forense de Brecha Documental vs. Implementación Real (`Gap Analysis`)
- README.md
- pnpm-workspace.yaml
- 3. Stubs, Retornos Ficticios y Fallos de Lógica en el Core PEP/PDP
- 1. Propuesta de Arquitectura Objetivo y Árbol de Directorios (Front & Back)
- scripts
- test_organization_service_create
- test_api_get_attack_catalog
- get_gateway_context
- .resolve_approval
- create_tool_action
- ApiError
- _make_auth
- Colors
- test_auth.py
- main.py
- ApiError
- asyncio
- test_tool_actions.py
- 03 — Estado Forense del Backend, Lógica Pendiente y Deuda Técnica Estructural
- env.py
- 4. Código Interno Muerto, Endpoints Desconectados y Reliquias de Prototipo
- audit_events.py
- websocket.py
- test_threat_detector_goal_hijacking
- test_threat_detector_data_exfiltration
- test_threat_detector_base64_obfuscation
- temp_db
- test_threat_detector_embedded_base64_obfuscation
- test_threat_detector_destructive_sql
- cleanup_overrides
- test_threat_detector_clean_parameters
- asyncio

## God Nodes (most connected - your core abstractions)
1. `User` - 173 edges
2. `make_admin_jwt()` - 91 edges
3. `Organization` - 85 edges
4. `UserRole` - 78 edges
5. `Tool` - 77 edges
6. `ToolAction` - 75 edges
7. `BaseSchema` - 72 edges
8. `Agent` - 67 edges
9. `AgentTool` - 64 edges
10. `AgentGuardApiClient` - 52 edges

## Surprising Connections (you probably didn't know these)
- `Fase 2: Implementación de Endpoints Faltantes en Backend` --references--> `AuditEvent`  [INFERRED]
  docs/archive/INFORME_MOCKUPS_FRONT_BACK.md → backend/app/models/audit.py
- `C. Máquina 3: Ciclo de Vida de un Incidente de Seguridad (`Alert.status`)` --references--> `AlertStatus`  [INFERRED]
  agentguard_estados_ciclo_vida.md → backend/app/models/enums.py
- `3. Paso Obligatorio Antes de Correr `agent-demo`: Generar `X-AgentGuard-Key`` --references--> `ApiKey`  [INFERRED]
  agentguard_credenciales_demo.md → backend/app/models/api_key.py
- `A. Estrategia Multi-Tenant: Esquema Compartido con Aislamiento Obligatorio en Capa de Aplicación` --references--> `ApiKey`  [INFERRED]
  agentguard_mer_relacional.md → backend/app/models/api_key.py
- `INC-08: Modelo, Migración y Router de API Keys PEP (`/api/v1/api-keys`)` --references--> `ApiKey`  [INFERRED]
  docs/archive/ORIGINAL_REQUEST.md → backend/app/models/api_key.py

## Import Cycles
- None detected.

## Communities (168 total, 66 thin omitted)

### Community 0 - "datetime"
Cohesion: 0.06
Nodes (14): decode_access_token(), verify_password(), AnalyticsOverviewResponse, AnalyticsTimeseriesResponse, TimeseriesPoint, AnalyticsService, MockOverviewRow, MockTimeseriesRow (+6 more)

### Community 1 - "domain.ts"
Cohesion: 0.13
Nodes (6): 3.2 Corrupción de Estado Real por Condición `data.length > 0` y Falsos Éxitos (`api.ts`), AgentGuardApiClient, extractApiError(), handleNetworkError(), AuthResponse, UserMember

### Community 2 - "generate_diagrams.py"
Cohesion: 0.21
Nodes (5): root(), build_drawio_xml(), add_card(), add_edge(), add_textbox()

### Community 3 - "05 — Cuestionario de Decisiones Arquitectónicas y de Producto para el Usuario"
Cohesion: 0.22
Nodes (8): 05 — Cuestionario de Decisiones Arquitectónicas y de Producto para el Usuario, 10. Activación Real de Redis 7, PostgreSQL RLS y Operadores Contextuales del PDP, 1. Modelo de Autenticación y Autorización Real (Humanos en Dashboard vs. Agentes en Gateway), 2. Destino de la Tabla `audit_events` (Auditoría Administrativa — Regla 7 de `AGENTS.md`), 3. Contradicción WORM Inmutable vs. Purga Automática de Trazas (30 a 365 días), 8. Unificación de `UserRole` y Usuarios Semilla (`Lucia Vance`), Bloque A — Seguridad, Identidad y Cumplimiento de Reglas de Dominio, Bloque C — Modelo de Datos, Estados e Infraestructura

### Community 4 - "list_executions"
Cohesion: 0.23
Nodes (4): get_execution_by_id(), list_executions(), _to_execution_response(), 3.4 Latencia Forense Ficticia (`latency_ms=21.5`)

### Community 5 - "_setup_admin_auth"
Cohesion: 0.15
Nodes (9): _setup_admin_auth(), test_api_create_tool_organization_not_found(), test_api_create_tool_success(), test_api_get_tool_found(), test_api_get_tool_not_found(), test_api_list_tools(), test_tool_service_create(), test_tool_service_get_by_id() (+1 more)

### Community 6 - "agent_service.py"
Cohesion: 0.23
Nodes (4): AgentCreate, AgentToolCreate, AgentUpdate, test_agent_and_agent_tool_schemas()

### Community 7 - "policies.py"
Cohesion: 0.16
Nodes (7): create_policy(), create_policy_rule_in_policy(), delete_policy(), get_policy(), list_policies(), update_policy(), PolicyRead

### Community 9 - "App.tsx"
Cohesion: 0.14
Nodes (44): 1. Observation, 2.2 Tabla Maestra de Vistas, Componentes y Estado de Consumo, INC-13: Estados de Carga Limpios con Skeleton Loaders y Empty States, AppContent(), getInitialView(), EmptyState(), EmptyStateAction, EmptyStateProps (+36 more)

### Community 10 - "frontend/package.json"
Cohesion: 0.14
Nodes (19): devDependencies, oxlint@^1.81.0, @types/node@^24.13.3, @types/react@^19.2.18, @types/react-dom@^19.2.7, typescript@~6.0.2, vite@^8.3.0, @vitejs/plugin-react@^6.1.1 (+11 more)

### Community 11 - "postgres"
Cohesion: 0.06
Nodes (37): driver, name, PGDATA, POSTGRES_DB, POSTGRES_PASSWORD, POSTGRES_USER, interval, retries (+29 more)

### Community 12 - "test_gemini_agent.py"
Cohesion: 0.09
Nodes (17): discover_agentguard_context(), GeminiAgentClient, resolve_agent_id(), resolve_tool_id_for_action(), run_agent(), test_api_agent_run_endpoint(), test_bootstrap_acme_in_agentguard_mocked(), test_discover_agentguard_context() (+9 more)

### Community 13 - "approvals.py"
Cohesion: 0.05
Nodes (41): 1.1 Contexto Institucional, Premisa Central y Arquitectura Políglota, 1.2 Diagnóstico Global de la Integración (Dualidad Real vs. Simulado), 1.3 El Patrón de Resiliencia Opaca: Riesgo de los *Silent Fallbacks*, 1.4 Métricas Globales de Cobertura de la Auditoría, 1. Resumen Ejecutivo y Diagnóstico Global del Sistema, 3.1 Módulo de Autenticación y Registro Corporativo, 3.2 Gráfico Interactivo de Actividad 24 Horas, 3.3 Base de Datos Empresarial Simulada en Memoria (Playground Sandbox) (+33 more)

### Community 15 - "domain.ts"
Cohesion: 0.07
Nodes (49): ForcePasswordChangeModalProps, QuickSetupWizard(), QuickSetupWizardProps, AGENT_STATUS_LABELS, AGENT_STATUS_STYLES, APPROVAL_STATUS_LABELS, DECISION_BADGE_CLASSES, DECISION_LABELS (+41 more)

### Community 16 - "User"
Cohesion: 0.04
Nodes (46): Organization, User, test_api_multi_tenant_isolation_cross_tenant_forbidden(), test_api_admin_user_same_tenant_allowed(), test_api_anti_ia_shield_blocks_agent_on_get(), test_api_anti_ia_shield_blocks_agent_on_patch(), test_api_get_settings_not_found(), test_api_get_settings_success() (+38 more)

### Community 17 - "UUID"
Cohesion: 0.04
Nodes (52): RuleEffect, UserRole, Policy, make_admin_jwt(), test_analytics_service_get_timeseries_empty_state(), test_api_analytics_anti_ai_shield(), test_api_analytics_overview_cross_tenant_forbidden(), test_api_analytics_overview_invalid_uuid() (+44 more)

### Community 18 - "Policy"
Cohesion: 0.15
Nodes (9): _setup_admin_auth(), test_api_create_policy_organization_not_found(), test_api_create_policy_success(), test_api_get_policy_found(), test_api_get_policy_not_found(), test_api_list_policies(), test_policy_service_create(), test_policy_service_get_by_id() (+1 more)

### Community 19 - "compilerOptions"
Cohesion: 0.10
Nodes (20): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+12 more)

### Community 20 - "auth-ui.tsx"
Cohesion: 0.22
Nodes (19): AuthContentProps, AuthFormContainer(), AuthUI(), AuthUIProps, Button, ButtonProps, buttonVariants, cn() (+11 more)

### Community 21 - "typing"
Cohesion: 0.11
Nodes (6): ensure_same_tenant(), get_current_user(), require_admin_user(), resolve_tenant_org_id(), get_db(), ActorType

### Community 22 - "compilerOptions"
Cohesion: 0.12
Nodes (16): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+8 more)

### Community 23 - "run_demo.py"
Cohesion: 0.13
Nodes (12): build_payload(), _configure_stdio(), _decision_color(), DemoConfig, DemoScenario, main(), _mask_api_key(), parse_args() (+4 more)

### Community 24 - "convert_docs_to_docx.py"
Cohesion: 0.20
Nodes (8): add_markdown_to_docx(), build_docx_files(), set_cell_background(), set_cell_margins(), add_markdown_to_docx(), build_domain_docx(), set_cell_background(), set_cell_margins()

### Community 26 - "AcmeDatabase"
Cohesion: 0.11
Nodes (3): AcmeDatabase, test_bi_delete_sales_endpoint(), test_initial_seed_data()

### Community 27 - "organization_service.py"
Cohesion: 0.09
Nodes (15): get_me(), create_organization(), get_organization(), get_organization_settings(), list_organizations(), test_organization_siem_webhook(), update_organization(), update_organization_settings() (+7 more)

### Community 28 - "websocket_manager.py"
Cohesion: 0.12
Nodes (6): WebSocketConnectionManager, test_websocket_endpoint_ping_pong(), test_websocket_manager_broadcast_tenant_isolation(), test_websocket_manager_connect_and_welcome(), test_websocket_manager_disconnect_cleanup(), test_websocket_tenant_endpoint_connect()

### Community 29 - "update_user"
Cohesion: 0.18
Nodes (5): create_user(), delete_user(), get_user(), list_users(), update_user()

### Community 30 - "ToolCreate"
Cohesion: 0.17
Nodes (3): ToolUpdate, ToolService, 2.1 Fallos `sqlalchemy.exc.MissingGreenlet` por Lazy-Loading Implícito tras `db.refresh()`

### Community 31 - "ensure_same_tenant"
Cohesion: 0.14
Nodes (9): assign_tool_to_agent(), create_agent(), delete_agent(), get_agent(), list_agent_tools(), list_agents(), update_agent(), AgentRead (+1 more)

### Community 32 - "PolicyService"
Cohesion: 0.11
Nodes (6): PolicyCreate, PolicyUpdate, PolicyRuleCreateInPolicy, PolicyRuleUpdate, PolicyService, test_policy_and_policy_rule_schemas_fail_closed()

### Community 36 - ".oxlintrc.json"
Cohesion: 0.33
Nodes (5): plugins, rules, react/only-export-components, react/rules-of-hooks, $schema

### Community 37 - "gemini_client.py"
Cohesion: 0.07
Nodes (8): display_presets_table(), main(), main_async(), print_banner(), get_preset_by_id(), list_presets(), main(), get_agent_presets()

### Community 38 - "🏛️ Registro de Decisiones Arquitectónicas (ADRs) — AgentGuard"
Cohesion: 0.12
Nodes (16): 1. Contexto y Problema, 1. Contexto y Problema, 1. Decisión Tomada, 1. Decisión Tomada, 1. Decisión Tomada, 1. Decisión Tomada, 2. Asignación por Paquete, 2. Decisión Tomada (+8 more)

### Community 45 - "🎯 Guía de Defensa: Diagrama de Casos de Uso del Sistema (UML)"
Cohesion: 0.17
Nodes (11): 1. Clasificación de Actores y Frontera del Sistema, 2. Diagrama de Casos de Uso del Sistema (Mermaid), 3. Mapeo con los Requisitos Funcionales del Informe (RF-01 a RF-12), 4. Justificación Teórica de Relaciones `<<include>>` y `<<extend>>`, 5. Especificación Detallada del Caso de Uso Crítico: UC05, 6. Preguntas de Examen / Defensa y Respuestas Clave, 🎯 Guía de Defensa: Diagrama de Casos de Uso del Sistema (UML), ❓ P1: *"¿Por qué el Agente de IA está modelado como un Actor si no es una persona?"* (+3 more)

### Community 46 - "🛡️ Guía de Defensa: Modelo Entidad-Relación Relacional Multi-Tenant (13 Tablas)"
Cohesion: 0.15
Nodes (12): 1. Propósito y Alcance del Diagrama, 2. Diagrama del Modelo Entidad-Relación (Mermaid — 13 Tablas), 3. Decisiones Arquitectónicas y Justificación Técnica, 4. Capacidades Clave de la Persistencia, 5. Preguntas Difíciles del Profesor y Respuestas Recomendadas, A. Estrategia Multi-Tenant: Esquema Compartido con Aislamiento Obligatorio en Capa de Aplicación, B. Uso de `UUID v4` como Clave Primaria en lugar de Enteros Seriales, C. Uso Estratégico de `JSONB` con Índices GIN (+4 more)

### Community 48 - "AuthContext.tsx"
Cohesion: 0.23
Nodes (14): AuthContext, AuthContextType, AuthProvider(), clearLegacyAndSessionAuthStorage(), formatAuthUser(), normalizeRole(), UNAUTHENTICATED_USER, VALID_ROLES (+6 more)

### Community 49 - "📑 Desglose de Pasos: Semana 1 — Base de Datos & Setup Inicial"
Cohesion: 0.05
Nodes (40): ⚙️ AgentGuard — Backend (Python 3.12+ & FastAPI), 🏗️ Arquitectura de la API REST (`/api/v1`), 📋 Especificaciones Históricas Archivadas, 📁 Estructura del Código Fuente, 🧪 Pruebas Automatizadas, 🗄️ Versionado de Base de Datos con Alembic, 1. Levantar Servicios de Infraestructura (Paso 1), 2. Preparar el Entorno Virtual de Python (Paso 2) (+32 more)

### Community 50 - "test_agent_service_assign_tool"
Cohesion: 0.33
Nodes (3): test_agent_service_assign_tool(), test_agent_service_create(), mock_refresh()

### Community 51 - "3. Los 4 Escenarios Demostrables Paso a Paso"
Cohesion: 0.20
Nodes (9): 1. Guión y Estrategia de Presentación ante el Tribunal, 2. Diagrama de Secuencia Real (Mermaid), 3. Los 4 Escenarios Demostrables Paso a Paso, 4. Cierre Forense en `TracesView` (`GET /api/v1/executions`), Escenario 1: Operación Normal (`ALLOW` — HTTP `200 OK`), Escenario 2: Privilegio Mínimo / Abuso Bloqueado (`DENY` — HTTP `403 Forbidden`), Escenario 3: Operación Sensible con Human-in-the-Loop (`REQUIRE_APPROVAL` — HTTP `202 Accepted`), Escenario 4: Exfiltración de Datos y Alerta Crítica (`DENY + CRITICAL ALERT` — HTTP `403 Forbidden`) (+1 more)

### Community 52 - "ApiKey"
Cohesion: 0.13
Nodes (5): ApiKey, ApiKeyService, 2. Decisión Tomada, 2.3 Controles de seguridad para agentes IA (Implementado vs. Solo en papel), 4.2 Módulos a medio hacer o parcialmente cableados

### Community 53 - "test_agents.py"
Cohesion: 0.19
Nodes (6): _setup_admin_auth(), test_agent_service_get_by_id(), test_api_assign_tool_different_org(), test_api_create_agent_owner_different_org(), test_api_create_agent_success(), test_api_list_agent_tools()

### Community 54 - "📐 Guía de Defensa: Modelo Conceptual (Chen) y Diccionario de Atributos"
Cohesion: 0.13
Nodes (14): 1. Propósito y Valor Académico de la Notación Chen, 2. Diagrama Conceptual de Entidad-Relación (Notación Chen), 3. Análisis Semántico de las Relaciones y Cardinalidades, 4. Biblioteca de Atributos: Clasificación por Naturaleza, 5. Preguntas de Cátedra y Respuestas Sugeridas, A. Organización y Usuarios: `PERTENECE_A`, B. Usuario y Agente: `ADMINISTRA (OWNER)`, C. Agente y Herramienta: `AUTORIZADO_EN` (Relación $M:N$) (+6 more)

### Community 56 - "PolicyRule"
Cohesion: 0.08
Nodes (15): PolicyRule, _setup_admin_auth(), test_api_create_policy_rule_policy_not_found(), test_api_create_policy_rule_success(), test_api_create_policy_rule_target_agent_different_org(), test_api_get_policy_rule_found(), test_api_get_policy_rule_not_found(), test_api_list_policy_rules() (+7 more)

### Community 57 - "AlertRead"
Cohesion: 0.14
Nodes (8): get_alert_by_id(), list_alerts(), update_alert_status(), require_roles(), AlertSeverity, AlertStatus, AlertRead, AlertUpdateRequest

### Community 59 - "sanitizer_service.py"
Cohesion: 0.17
Nodes (5): test_sanitize_bearer_token_in_string(), test_sanitize_credit_card_masking(), test_sanitize_empty_context(), test_sanitize_lists_and_tuples(), test_sanitize_sensitive_keys()

### Community 60 - "Tool"
Cohesion: 0.04
Nodes (58): 3. Componentes Clave de Runtime, 3. Análisis Detallado de Transiciones y Respuestas HTTP, Base, Agent, AgentTool, Approval, AgentStatus, ApprovalStatus (+50 more)

### Community 63 - "🤖 AgentGuard — Agent Demo (Cliente CLI Python)"
Cohesion: 0.29
Nodes (6): 1. Requisitos previos, 2. Instalación, 3. Configuración (`.env`), 4. Ejecución, 5. Los 4 Escenarios Canónicos, 🤖 AgentGuard — Agent Demo (Cliente CLI Python)

### Community 65 - "04 — Inventario Forense de Código Muerto, Dependencias Redundantes y Archivos Huérfanos"
Cohesion: 0.18
Nodes (10): 04 — Inventario Forense de Código Muerto, Dependencias Redundantes y Archivos Huérfanos, 1. Resumen Cuantitativo de Higiene del Repositorio, 2. Archivos Huérfanos Trackeados en Git (Candidatos a Eliminación Directa), 3. Archivos Duplicados y Exportaciones Redundantes en Raíz, 5.1 Paquetes Python sin Uso en [backend/requirements.txt](file:///c:/Users/jonat/Downloads/Codigos/AgentGuard/backend/requirements.txt), 5.2 Scripts Rotos o Redundantes en [package.json](file:///c:/Users/jonat/Downloads/Codigos/AgentGuard/package.json) (Raíz), 5. Dependencias Huérfanas y Scripts de Monorepo Rotos, 6.1 Solapamiento entre 8 Archivos de Instrucciones para Agentes de IA (+2 more)

### Community 67 - "app.py"
Cohesion: 0.18
Nodes (10): AgentDiscoverRequest, AgentRunRequest, DeleteSalesRequest, DropDatabaseRequest, ExportCustomersRequest, OnboardRequest, QuerySalesRequest, QuoteRequest (+2 more)

### Community 69 - "🔄 Guía de Defensa: Máquinas de Estados y Ciclo de Vida en Runtime (Protocolo HITL 202 Accepted)"
Cohesion: 0.18
Nodes (10): 1. Modelado de Estados en Arquitecturas Asíncronas (`202 Accepted`), 2. Diagramas de Estados Reales (Mermaid), 4. Concurrencia y Prevención de Condiciones de Carrera (TOCTOU), 5. Preguntas Difíciles del Profesor y Respuestas Sugeridas, A. Máquina 1: Ciclo de Vida de una Ejecución (`Execution.status`), B. Máquina 2: Ciclo de Vida de una Aprobación (`Approval.status`), C. Máquina 3: Ciclo de Vida de un Incidente de Seguridad (`Alert.status`), 🔄 Guía de Defensa: Máquinas de Estados y Ciclo de Vida en Runtime (Protocolo HITL 202 Accepted) (+2 more)

### Community 70 - "Original User Request"
Cohesion: 0.08
Nodes (23): Alcance de la Fase 2:, Contexto y Reglas Obligatorias:, Criterios de Aceptación:, Criterios de Aceptación:, Entregables:, Follow-up — 2026-11-02 21:50:33 UTC, Follow-up — 2026-11-03 01:31:43 UTC, INC-01: Homogeneización de Enums y Localización Integral al Español en la UI (+15 more)

### Community 72 - "sqlalchemy"
Cohesion: 0.09
Nodes (12): downgrade(), upgrade(), downgrade(), upgrade(), downgrade(), upgrade(), downgrade(), upgrade() (+4 more)

### Community 73 - "get_analytics_overview"
Cohesion: 0.27
Nodes (4): get_analytics_overview(), get_analytics_timeseries(), _validate_and_parse_org_id(), _verify_tenant_access()

### Community 74 - "PDPEngine"
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
Nodes (10): 1. Credenciales de Usuarios (Acme Corp), 2. Matriz Resumida de Permisos por Rol (RBAC), 3. Paso Obligatorio Antes de Correr `agent-demo`: Generar `X-AgentGuard-Key`, 4. Guión Sugerido de Logins para la Demo en Vivo, 5. Entidades y Descubrimiento Dinámico de Acme Corp, 6. Comandos de Reinicio (Factory Reset) de Acme Corp, 🔐 AgentGuard — Guía Rápida de Credenciales y Roles Demo (Acme Corp), Entorno y Agentes (+2 more)

### Community 78 - "BaseSchema"
Cohesion: 0.05
Nodes (26): AgentToolRead, ApprovalDetailRead, ApprovalRead, ApprovalResolveRequest, AuditEventBase, AuditEventCreate, AuditEventPagination, AuditEventResponse (+18 more)

### Community 79 - "dashboard-sidebar.tsx"
Cohesion: 0.16
Nodes (15): 2.1 Arquitectura de Ruteo y Navegación Hash, 2. Inventario Exhaustivo de Vistas y Componentes del Frontend, SidebarProps, DashboardSidebarProps, NavGroupData, NavItem(), NavItemData, SidebarNav() (+7 more)

### Community 80 - "Bloque D — Experiencia de Frontend, Simulación y Demo Académica"
Cohesion: 0.40
Nodes (5): 11. Eliminación del Modo *"Wizard-of-Oz"* (`mockData.ts` y Falsos Éxitos en `api.ts`), 12. Alcance de las 4 Pestañas Simuladas de `SettingsView.tsx`, 13. Evolución del `PlaygroundView` y Desarrollo de `agent-demo/`, 14. Gobernanza del Botón `"Reset Demo"` e Idioma Canónico de la Interfaz, Bloque D — Experiencia de Frontend, Simulación y Demo Académica

### Community 81 - "package.json"
Cohesion: 0.12
Nodes (20): dependencies, class-variance-authority@^0.7.1, clsx@^2.1.1, @radix-ui/react-label@^2.1.17, @radix-ui/react-slot@^1.5.0, tailwind-merge@^3.7.0, tw-animate-css@^1.4.0, description (+12 more)

### Community 82 - "test_health.py"
Cohesion: 0.10
Nodes (5): Settings, test_health_endpoint(), test_ping_endpoint(), test_root_endpoint(), test_settings_secret_key_production_fail_fast()

### Community 83 - "approvals.py"
Cohesion: 0.24
Nodes (3): get_approval(), list_approvals(), resolve_approval()

### Community 84 - "create_app"
Cohesion: 0.11
Nodes (18): bootstrap_acme_in_agentguard(), persist_api_key_to_env(), create_app(), bi_delete_sales(), bi_query_sales(), catalog_update_price(), crm_create_quote(), crm_export_customers() (+10 more)

### Community 85 - "app.js"
Cohesion: 0.13
Nodes (31): applyLocalFilter(), dom, escapeHtml(), executeBiStep(), handleBiChatSubmit(), loadPresets(), onboardAgentguard(), PIE_COLORS (+23 more)

### Community 88 - "scripts"
Cohesion: 0.17
Nodes (12): scripts, build:frontend, dev:backend, dev:frontend, lint:frontend, start, start:all, start:backend (+4 more)

### Community 89 - "test_acme_server.py"
Cohesion: 0.12
Nodes (8): app_with_temp_db(), temp_db(), test_bi_query_sales_endpoint(), test_catalog_update_price_and_tampering(), test_crm_create_quote_endpoint(), test_crm_export_customers_endpoint(), test_database_drop_and_503_wiped_with_sales(), test_stripe_refund_endpoint()

### Community 90 - "Organization"
Cohesion: 0.10
Nodes (16): _setup_admin_auth(), test_api_create_organization_success(), test_api_create_organization_validation_error(), test_api_get_organization_found(), test_api_get_organization_not_found(), test_api_list_organizations(), test_api_patch_organization_ai_agent_blocked(), test_api_patch_organization_cross_tenant_forbidden() (+8 more)

### Community 91 - "🛡️ AgentGuard — Guía Simple y Hoja de Ruta para el Equipo"
Cohesion: 0.15
Nodes (12): 1. La Idea Explicada "Para un Nene de 5 Años" 🧒, 🌐 1. La Página Web (Frontend), 2. ¿Dónde Encaja Cada Pieza Técnica? 🧩, ⚙️ 2. La API REST (Backend), 🤖 3. El Agente de IA (Sin Complicarse), 3. La Demostración en Clase: "SIN vs. CON AgentGuard" 🎬, 4. Cronograma Paso a Paso (De Hoy al 30 de Noviembre) 📅, 🔌 4. ¿Y MCP? (Decisión del Equipo: Eliminado por Pragmatismo) (+4 more)

### Community 92 - "`_MASTER_PROJECT_SNAPSHOT.md` — Fuente de Verdad Consolidada de AgentGuard"
Cohesion: 0.12
Nodes (15): 1.1 Qué problema resuelve, 1.2 Roles y realidad SaaS B2B vs. solicitud PaaS Superadmin, 1. Propósito y Modelo de Negocio (SaaS B2B vs. PaaS Multi-tenant), 2.1 Stack políglota verificado, 2.2 Topología PEP / PDP y aislamiento multi-tenant, 2. Arquitectura y Stack Tecnológico, 3.1 Esquema PostgreSQL real (13 tablas, migraciones `001`–`005`), 3.2 Superficie HTTP/WebSocket real (`backend/app/api/`) (+7 more)

### Community 94 - "_mock_user_auth"
Cohesion: 0.16
Nodes (10): clear_overrides(), _mock_user_auth(), test_anti_ai_agent_header_blocked_on_all_control_plane_routes(), test_anti_idor_cross_tenant_blocked_with_403(), test_rbac_matrix_admin_only_mutations_and_settings(), test_rbac_matrix_alerts_triage(), test_rbac_matrix_approvals_resolve(), test_rbac_matrix_audit_events() (+2 more)

### Community 96 - "1.2 Inventario Individual (39 archivos `.md`)"
Cohesion: 0.12
Nodes (15): 1.1 Árbol Documental del Repositorio, 1.2 Inventario Individual (39 archivos `.md`), 1.3 Bloque Aparte: Logs Históricos de Ejecución (`.agents/teamwork/*/*`), 1.4 Artefactos No-Markdown Relacionados, 1. Inventario Completo de Archivos Markdown (`.md`), 2.1 Mapa de Duplicaciones Principales (7 grupos), 2. Mapa de Duplicaciones y Contradicciones, 3. Propuesta de Poda y Estructura Oficial Recomendada (+7 more)

### Community 97 - "test_api_keys.py"
Cohesion: 0.07
Nodes (16): create_api_key(), get_api_key(), list_api_keys(), revoke_api_key(), ApiKeyCreate, ApiKeyCreatedResponse, ApiKeyResponse, test_api_create_api_key_blocks_ai_agents() (+8 more)

### Community 98 - "PolicyRuleRead"
Cohesion: 0.17
Nodes (6): create_policy_rule(), delete_policy_rule(), get_policy_rule(), list_policy_rules(), update_policy_rule(), PolicyRuleRead

### Community 99 - "_setup_user_auth"
Cohesion: 0.19
Nodes (7): _setup_user_auth(), test_approvals_get_by_id_not_found(), test_approvals_get_by_id_success(), test_approvals_list_endpoint(), test_approvals_resolve_already_resolved_or_not_found(), test_approvals_resolve_forbidden_for_non_approver_roles(), test_approvals_resolve_success()

### Community 100 - "06 — Propuesta de Evolución Arquitectónica, Optimización de Rendimiento y Mejores Prácticas"
Cohesion: 0.14
Nodes (13): 06 — Propuesta de Evolución Arquitectónica, Optimización de Rendimiento y Mejores Prácticas, 0.2 Frontend: Vistas Monolíticas, Cliente HTTP "Mágico" y Sockets Duplicados, 0. Diagnóstico del Acoplamiento Actual (Estado *As-Is*), 2.2 *Specification / Strategy Registry* para Operadores del Motor PDP, 2.3 *Claim-Check Pattern* Cifrado para HITL (`HitlPayloadVault`), 2.4 *Strategy + Circuit Breaker* para Despacho de Herramientas (`LiveRestDispatcher` vs. `SandboxMockDispatcher`), 2. Patrones de Diseño Recomendados para Desacoplar el Dominio, 3.2 Cuellos de Botella en Frontend (Renderizado, Red, Estado y Memoria) (+5 more)

### Community 102 - "🧭 2. Flujo del Wizard de Presentación (4 Pasos Guiados)"
Cohesion: 0.20
Nodes (9): 📌 1. Objetivo y Visión General, 🧭 2. Flujo del Wizard de Presentación (4 Pasos Guiados), 💡 3. Componentes y Estados Sugeridos para la Implementación en React, 🤝 4. Distribución de Tareas del Equipo, 🎨 Especificación de Mejoras de Frontend: Presenter Tour & Live Demo Runner, Paso 1: Cotización Legítima (ALLOW), Paso 2: Abuso de Privilegio / Falta de Capacidad (DENY), Paso 3: Operación Financiera Sensible (REQUIRE_APPROVAL - HITL) (+1 more)

### Community 103 - "3. Hallazgos Críticos y Bugs Funcionales en el Frontend"
Cohesion: 0.17
Nodes (11): 02 — Diagnóstico Forense del Frontend y "Alma Máter" del Proyecto, 1. Veredicto General del Frontend, 2. Mapa de Estado por Pantalla y Componente, 3.1 Crash Fatal (White Screen of Death) en `TracesView` al Recibir Eventos WebSocket, 3.4 Inconsistencias Matemáticas y Doble Conteo en `OverviewView` y `App`, 3.5 Usuario RBAC Fantasma (`Lucia Vance`) que Provoca Errores FK en Base de Datos, 3.6 Defectos de CSS, Tematización y Clases Inexistentes, 3. Hallazgos Críticos y Bugs Funcionales en el Frontend (+3 more)

### Community 104 - "Bloque B — Flujo Runtime del Gateway PEP, HITL y Herramientas"
Cohesion: 0.40
Nodes (5): 4. Protocolo de Espera y Entrega de Resultados en HITL (`REQUIRE_APPROVAL`), 5. Custodia de Parámetros Originales para Re-Despacho HITL (Problema `"***REDACTED***"`), 6. Política de Despacho a Herramientas Externas (`_dispatch_to_tool`: Sandbox Mock vs. REST Real), 7. Orden de Evaluación OWASP vs. `AgentTool` en el Pipeline del Gateway (Escenario 5), Bloque B — Flujo Runtime del Gateway PEP, HITL y Herramientas

### Community 105 - "seed_data"
Cohesion: 0.10
Nodes (13): clear_database(), ensure_canonical_demo_users(), main(), _resolve_demo_org(), seed_data(), test_api_reset_demo_reissues_jwt_for_new_db_uuids(), test_api_reset_demo_success(), test_clear_database_executes_cascaded_deletes() (+5 more)

### Community 106 - "update_tool"
Cohesion: 0.17
Nodes (6): create_tool(), delete_tool(), get_tool(), list_tools(), update_tool(), ToolRead

### Community 107 - "vite.config.ts"
Cohesion: 0.33
Nodes (5): devDependencies, tailwindcss@^4.3.3, @tailwindcss/vite@^4.3.3, tailwindcss, @tailwindcss/vite

### Community 108 - "BRIEFING — 2026-11-03 02:34:00 UTC"
Cohesion: 0.22
Nodes (8): Artifact Index, BRIEFING — 2026-11-03 02:34:00 UTC, 🔒 Key Constraints, Mission, 🔒 My Identity, Project Status, User Context, Victory Audit Status

### Community 109 - "💥 ACME Corporation — Portal Empresarial & Copiloto BI (Looney Tunes Edition)"
Cohesion: 0.17
Nodes (11): 🌟 1. Propósito y Visión General del Sistema, 🦆 2. Caso de Uso Estrella: El Administrativo & el Asistente "Consultante BI", 🛡️ 3. Escenarios Oficiales de la Demostración, 🚀 4. Instalación y Puesta en Marcha, ⚙️ 5. Variables de Entorno (`acme-corp/.env`), 🧪 6. Pruebas Automatizadas, 💥 ACME Corporation — Portal Empresarial & Copiloto BI (Looney Tunes Edition), Ejecución en Windows o Terminal (+3 more)

### Community 110 - "01 — Auditoría Forense de Brecha Documental vs. Implementación Real (`Gap Analysis`)"
Cohesion: 0.50
Nodes (3): 01 — Auditoría Forense de Brecha Documental vs. Implementación Real (`Gap Analysis`), 1. Resumen Ejecutivo de Divergencia Arquitectónica, 3. Análisis Específico de Contradicciones Internas en la Documentación

### Community 111 - "README.md"
Cohesion: 0.20
Nodes (7): 1. Identidad, Stack Políglota y Equipo, 2. Reglas Innegociables de Seguridad, Dominio e Idioma, 3. Testing, Zero-Regression y Comandos Canónicos en Windows, 4. Protocolo Lean Teamwork v2 (Orquestación Multi-Agente, Velocidad y Economía de Tokens), 🛡️ Reglas Operativas del Proyecto: AgentGuard, 🌐 AgentGuard — Frontend (Dashboard Web SPA SaaS B2B), 🛠️ Comandos Útiles (`pnpm`)

### Community 113 - "3. Stubs, Retornos Ficticios y Fallos de Lógica en el Core PEP/PDP"
Cohesion: 0.50
Nodes (4): 3.1 Falso Éxito Silencioso en `_dispatch_to_tool` (Violación Directa de Fail-Closed), 3.2 Re-Despacho HITL Corrupto con Parámetros `"***REDACTED***"` y Pérdida de Resultado, 3.3 Bug de Orden de Validación en el Pipeline del Gateway (Supresión de Alertas OWASP y Trazas), 3. Stubs, Retornos Ficticios y Fallos de Lógica en el Core PEP/PDP

### Community 114 - "1. Propuesta de Arquitectura Objetivo y Árbol de Directorios (Front & Back)"
Cohesion: 0.50
Nodes (4): 1.1 Diagrama de Capas y Regla de Dependencia (Arquitectura Hexagonal / Clean), 1.2 Árbol de Directorios Objetivo — Backend (`backend/`), 1.3 Árbol de Directorios Objetivo — Frontend (`frontend/src/`), 1. Propuesta de Arquitectura Objetivo y Árbol de Directorios (Front & Back)

### Community 115 - "scripts"
Cohesion: 0.40
Nodes (5): scripts, build, dev, lint, preview

### Community 118 - "get_gateway_context"
Cohesion: 0.11
Nodes (8): execute_gateway_action(), get_attack_catalog(), get_gateway_context(), simulate_gateway_action(), GatewayContextAction, GatewayContextAgent, GatewayContextResponse, GatewayContextTool

### Community 119 - ".resolve_approval"
Cohesion: 0.17
Nodes (3): 1. Contexto y Problema, 2. Decisión Tomada, ADR-007: Protocolo HITL Asíncrono (`202 Accepted`) + WebSockets y Bloqueo Pesimista

### Community 120 - "create_tool_action"
Cohesion: 0.25
Nodes (3): create_tool_action(), get_tool_action(), list_tool_actions()

### Community 121 - "ApiError"
Cohesion: 0.10
Nodes (19): INC-12: Sistema Global de Notificaciones (Toasts) y Banners de Desconexión, dependencies, lucide-react@^1.57.0, react@^19.2.8, react-dom@^19.2.8, App(), TOAST_CONFIG, ToastContainer() (+11 more)

### Community 122 - "_make_auth"
Cohesion: 0.23
Nodes (7): Alert, _make_auth(), test_get_alert_by_id_found(), test_get_alert_by_id_not_found(), test_list_alerts_endpoint(), test_update_alert_status(), 9. Granularidad de Máquinas de Estado (`ExecutionStatus`, `AlertStatus`, `Tool.status`) y Protocolos (`ADR-003`)

### Community 124 - "test_auth.py"
Cohesion: 0.04
Nodes (30): change_password(), login(), register(), register_organization(), reset_demo_data(), create_access_token(), get_password_hash(), cleanup_overrides() (+22 more)

### Community 125 - "main.py"
Cohesion: 0.10
Nodes (5): check_database_health(), check_redis_health(), health_check(), lifespan(), ping()

### Community 126 - "ApiError"
Cohesion: 0.20
Nodes (8): 2. Logic Chain, 3. Caveats, 4. Conclusion, 5. Verification Method, Master Handoff Report — Sentinel (Fase 1, Fase 2 y Fase 3), Alcance de la Fase 3:, INC-11: Refactorización de `api.ts` (Propagación Explícita de Errores y `ApiError`), ApiError

### Community 128 - "test_tool_actions.py"
Cohesion: 0.13
Nodes (11): _setup_admin_auth(), test_api_create_tool_action_duplicate_conflict(), test_api_create_tool_action_success(), test_api_create_tool_action_tool_not_found(), test_api_get_tool_action_found(), test_api_get_tool_action_not_found(), test_api_list_tool_actions(), test_tool_action_service_create() (+3 more)

### Community 131 - "03 — Estado Forense del Backend, Lógica Pendiente y Deuda Técnica Estructural"
Cohesion: 0.18
Nodes (10): 03 — Estado Forense del Backend, Lógica Pendiente y Deuda Técnica Estructural, 1. Veredicto Ejecutivo del Backend, 2.2 Violaciones de Clave Foránea (`IntegrityError`) No Controladas (`HTTP 500`), 2. Crashes `HTTP 500` Confirmados en Tiempo de Ejecución, 4.1 Ausencia Total de Autenticación y Control de Acceso (RBAC) en APIs, 4.2 Fugas de Aislamiento Multi-Tenant (Violación de Regla 2 de `AGENTS.md`), 4.3 Condición de Carrera TOCTOU y Expiración Pasiva en Aprobaciones HITL, 4. Brechas de Seguridad, Multi-Tenancy y Reglas de Dominio (`AGENTS.md` §4) (+2 more)

### Community 145 - "env.py"
Cohesion: 0.20
Nodes (4): do_run_migrations(), run_async_migrations(), run_migrations_offline(), run_migrations_online()

### Community 149 - "4. Código Interno Muerto, Endpoints Desconectados y Reliquias de Prototipo"
Cohesion: 0.33
Nodes (6): 4.1 Tipos, Esquemas y Configuraciones con `0` Consumidores, 4.2 Par Endpoint + Método Cliente Nunca Invocado (`Attack Catalog`), 4.3 Dataset de Prototipo Heredado que Contamina Datos Reales (`mockData.ts`), 4.4 Modelo ORM y Tabla Huérfana Sujetos a Decisión de Producto (`AuditEvent`), 4. Código Interno Muerto, Endpoints Desconectados y Reliquias de Prototipo, SecurityStanceSettings

### Community 171 - "asyncio"
Cohesion: 0.22
Nodes (4): test_gateway_execute_invalid_api_key_returns_401(), test_gateway_execute_missing_api_key_returns_401(), test_gateway_execute_org_mismatch_returns_403(), test_gateway_execute_validation_error()

## Knowledge Gaps
- **66 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `AgentTool` connect `Tool` to `datetime`, `03 — Estado Forense del Backend, Lógica Pendiente y Deuda Técnica Estructural`, `agent_service.py`, `User`, `typing`, `ToolCreate`, `AgentService`, `📑 Desglose de Pasos: Semana 1 — Base de Datos & Setup Inicial`, `test_agents.py`, `📐 Guía de Defensa: Modelo Conceptual (Chen) y Diccionario de Atributos`, `PolicyRule`, `🤖 AgentGuard — Agent Demo (Cliente CLI Python)`, `🛡️ AgentGuard — Runtime Authorization & Governance for AI Agents`, `🔐 AgentGuard — Guía Rápida de Credenciales y Roles Demo (Acme Corp)`, ``_MASTER_PROJECT_SNAPSHOT.md` — Fuente de Verdad Consolidada de AgentGuard`, `06 — Propuesta de Evolución Arquitectónica, Optimización de Rendimiento y Mejores Prácticas`, `🧭 2. Flujo del Wizard de Presentación (4 Pasos Guiados)`, `3. Hallazgos Críticos y Bugs Funcionales en el Frontend`, `Bloque B — Flujo Runtime del Gateway PEP, HITL y Herramientas`, `seed_data`, `💥 ACME Corporation — Portal Empresarial & Copiloto BI (Looney Tunes Edition)`, `README.md`, `3. Stubs, Retornos Ficticios y Fallos de Lógica en el Core PEP/PDP`?**
  _High betweenness centrality (0.100) - this node is a cross-community bridge._
- **Are the 69 inferred relationships involving `User` (e.g. with `create_api_key()` and `get_api_key()`) actually correct?**
  _`User` has 69 INFERRED edges - model-reasoned connections that need verification._
- **Should `datetime` be split into smaller, more focused modules?**
  _Cohesion score 0.055288461538461536 - nodes in this community are weakly interconnected._
- **Why does `2. Reglas Innegociables de Seguridad, Dominio e Idioma` connect `README.md` to `App.tsx`, `Tool`, `typing`, `ApiError`?**
  _High betweenness centrality (0.095) - this node is a cross-community bridge._
- **Are the 20 inferred relationships involving `Organization` (e.g. with `reset_demo_data()` and `get_gateway_context()`) actually correct?**
  _`Organization` has 20 INFERRED edges - model-reasoned connections that need verification._
- **Should `domain.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.12719298245614036 - nodes in this community are weakly interconnected._
- **Why does `ApiKey` connect `ApiKey` to `datetime`, `test_api_keys.py`, `Original User Request`, `App.tsx`, `🛡️ AgentGuard — Runtime Authorization & Governance for AI Agents`, `🔐 AgentGuard — Guía Rápida de Credenciales y Roles Demo (Acme Corp)`, `🛡️ Guía de Defensa: Modelo Entidad-Relación Relacional Multi-Tenant (13 Tablas)`, `Tool`, `📑 Desglose de Pasos: Semana 1 — Base de Datos & Setup Inicial`, `UUID`, `PolicyRule`, `test_auth.py`?**
  _High betweenness centrality (0.090) - this node is a cross-community bridge._