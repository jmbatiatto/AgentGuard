# Graph Report - AgentGuard  (2026-10-23)

## Corpus Check
- 131 files · ~88,130 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 19 file(s) not represented in the graph (top: .drawio 6, .bat 5, (none) 2)

## Summary
- 1321 nodes · 3368 edges · 82 communities (56 shown, 26 thin omitted)
- Extraction: 86% EXTRACTED · 14% INFERRED · 0% AMBIGUOUS · INFERRED: 474 edges (avg confidence: 0.94)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `eb8729b8`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- AlertStatus
- App.tsx
- PolicyService
- generate_diagrams.py
- organizations.py
- 📑 Desglose de Pasos: Semana 1 — Base de Datos & Setup Inicial
- test_schemas.py
- asyncio
- tool_action.py
- test_alerts.py
- frontend/package.json
- pep_gateway_service.py
- 🔬 Desglose Paso a Paso: Qué Hacemos y Por Qué
- enums.py
- env.py
- tool_actions.py
- ToolService
- asyncio
- test_tools.py
- compilerOptions
- uuid
- PDPEngine
- compilerOptions
- scripts
- UserRole
- policy_rules.py
- typing
- UserService
- WebSocketConnectionManager
- test_policies.py
- 🚀 Orquestación y Arranque de Desarrollo Local (AgentGuard)
- tools.py
- asyncio
- 📑 Desglose de Pasos: Semana 2 — API REST de Gestión Administrativa
- test_schemas.py
- .oxlintrc.json
- 🔄 Guía de Defensa: Máquinas de Estados y Ciclo de Vida en Runtime
- 🏛️ Registro de Decisiones Arquitectónicas (ADRs) — AgentGuard
- tsconfig.json
- 🎯 Guía de Defensa: Diagrama de Casos de Uso del Sistema (UML)
- 🛡️ Guía de Defensa: Modelo Entidad-Relación Relacional Multi-Tenant v2.0
- test_agents.py
- 🛡️ AgentGuard — Guía Simple y Hoja de Ruta para el Equipo
- AgentService
- 🏗️ Guía de Defensa: Arquitectura de Runtime y Flujo de Intercepción PEP / PDP
- 3. Los 4 Escenarios Demostrables Paso a Paso
- test_tool_actions.py
- convert_docs_to_docx.py
- 📐 Guía de Defensa: Modelo Conceptual (Chen) y Diccionario de Atributos
- FastAPI
- SanitizerService
- test_sanitizer_service.py
- downgrade
- main.py
- list_executions
- Execution
- agent-demo/README.md
- CLAUDE.md
- frontend/README.md
- copilot-instructions.md
- httpx
- list_approvals
- PolicyRuleService
- OrganizationService
- execute_gateway_action
- ⚙️ AgentGuard — Backend (Python + FastAPI)
- test_approvals_get_by_id_success
- 🛡️ AgentGuard — Runtime Authorization & Governance for AI Agents
- test_get_execution_by_id_not_found

## God Nodes (most connected - your core abstractions)
1. `Tool` - 49 edges
2. `ToolAction` - 49 edges
3. `PolicyDecision` - 45 edges
4. `Agent` - 43 edges
5. `BaseSchema` - 43 edges
6. `Organization` - 38 edges
7. `Execution` - 37 edges
8. `PolicyRule` - 37 edges
9. `User` - 37 edges
10. `AgentTool` - 36 edges

## Surprising Connections (you probably didn't know these)
- `❓ P1: *"¿Por qué modelan `AgentTool` como una relación $M:N$ en lugar de incluir un array de herramientas dentro del agente?"*` --references--> `AgentTool`  [INFERRED]
  agentguard_er_conceptual_chen.md → backend/app/models/agent.py
- `C. Máquina 3: Ciclo de Vida de un Incidente de Seguridad (`Alert`)` --references--> `Alert`  [INFERRED]
  agentguard_estados_ciclo_vida.md → backend/app/models/alert.py
- `5. Especificación Detallada del Caso de Uso Crítico: UC05` --references--> `Approval`  [INFERRED]
  agentguard_casos_de_uso.md → backend/app/models/approval.py
- `B. Máquina 2: Ciclo de Vida de una Aprobación (`Approval`)` --references--> `Approval`  [INFERRED]
  agentguard_estados_ciclo_vida.md → backend/app/models/approval.py
- `A. Máquina 1: Ciclo de Vida de una Ejecución (`Execution`)` --references--> `Execution`  [INFERRED]
  agentguard_estados_ciclo_vida.md → backend/app/models/execution.py

## Import Cycles
- None detected.

## Communities (82 total, 26 thin omitted)

### Community 0 - "AlertStatus"
Cohesion: 0.18
Nodes (8): get_alert_by_id(), list_alerts(), update_alert_status(), AlertSeverity, AlertStatus, AlertRead, AlertUpdateRequest, test_alert_schema()

### Community 1 - "App.tsx"
Cohesion: 0.06
Nodes (57): App(), getInitialView(), Header(), HeaderProps, Sidebar(), SidebarProps, Theme, ThemeContext (+49 more)

### Community 3 - "generate_diagrams.py"
Cohesion: 0.19
Nodes (5): root(), build_drawio_xml(), add_card(), add_edge(), add_textbox()

### Community 4 - "organizations.py"
Cohesion: 0.23
Nodes (3): create_organization(), get_organization(), list_organizations()

### Community 5 - "📑 Desglose de Pasos: Semana 1 — Base de Datos & Setup Inicial"
Cohesion: 0.20
Nodes (10): 1. Levantar Servicios de Infraestructura (Paso 1), 2. Preparar el Entorno Virtual de Python (Paso 2), 3. Ejecutar las Migraciones de Base de Datos (Paso 3), 4. Iniciar el Servidor de Desarrollo (Paso 4), 📑 Desglose de Pasos: Semana 1 — Base de Datos & Setup Inicial, 🧭 Diagrama de Flujo de los 4 Pasos, 🛠️ Guía Rápida de Comandos para Ejecutar la Semana 1, 📊 Matriz Resumen de Tecnologías y Roles para la Defensa (+2 more)

### Community 6 - "test_schemas.py"
Cohesion: 0.10
Nodes (11): ApprovalDetailRead, ApprovalRead, ApprovalResolveRequest, BaseSchema, ExecutionRead, OrganizationRead, PolicyCreate, ToolActionRead (+3 more)

### Community 7 - "asyncio"
Cohesion: 0.12
Nodes (7): test_api_create_policy_organization_not_found(), test_api_get_policy_found(), test_api_get_policy_not_found(), test_api_list_policies(), test_policy_service_create(), test_policy_service_get_by_id(), test_policy_service_list_by_org()

### Community 8 - "tool_action.py"
Cohesion: 0.15
Nodes (3): ToolActionCreate, ToolActionService, test_tool_and_action_schemas()

### Community 9 - "test_alerts.py"
Cohesion: 0.24
Nodes (4): test_get_alert_by_id_found(), test_get_alert_by_id_not_found(), test_list_alerts_endpoint(), test_update_alert_status()

### Community 10 - "frontend/package.json"
Cohesion: 0.07
Nodes (29): dependencies, lucide-react, react, react-dom, devDependencies, oxlint, @types/node, @types/react (+21 more)

### Community 11 - "pep_gateway_service.py"
Cohesion: 0.09
Nodes (8): get_db(), GatewayExecuteRequest, GatewayExecuteResponse, test_gateway_execute_endpoint_allow(), test_gateway_execute_endpoint_deny(), test_gateway_execute_endpoint_require_approval(), test_gateway_execute_validation_error(), test_gateway_schemas()

### Community 12 - "🔬 Desglose Paso a Paso: Qué Hacemos y Por Qué"
Cohesion: 0.20
Nodes (10): 🔬 Desglose Paso a Paso: Qué Hacemos y Por Qué, 🧱 PASO 1: Infraestructura Local Reproducible (`docker-compose.yml`), 🐍 PASO 2: Entorno Backend & Configuración Fail-Fast (`backend/`), 🚀 PASO 4: Entrypoint FastAPI, Middlewares y Verificación (`backend/app/main.py`), ¿Por qué es necesaria cada tecnología y qué rol cumple?, ¿Por qué es necesaria cada tecnología y qué rol cumple?, ¿Por qué es necesaria cada tecnología y qué rol cumple?, ¿Qué se hace concretamente? (+2 more)

### Community 13 - "enums.py"
Cohesion: 0.09
Nodes (26): Agent, AgentStatus, ApprovalStatus, ExecutionStatus, PolicyDecision, RiskLevel, RuleEffect, Tool (+18 more)

### Community 14 - "env.py"
Cohesion: 0.05
Nodes (22): 10.1 Comandos de Arranque y Parada Oficiales, 10.2 Secuencia Estricta de Inicialización, 10. Orquestación y Arranque Secuencial Local (`start_all` / `start-all.ps1`), 11. Protocolo Anti-Interrupciones y Estabilidad de Sesión (Anti "Worker User Agent Cancelled"), 1. Identidad y Configuración General, 2. Equipo de Desarrollo y Distribución de Roles, 3.1 Fases Estrictas y Progresivas del Proyecto, 3. Metodología de Desarrollo: SDD (Spec-Driven Development) (+14 more)

### Community 15 - "tool_actions.py"
Cohesion: 0.24
Nodes (3): create_tool_action(), get_tool_action(), list_tool_actions()

### Community 17 - "asyncio"
Cohesion: 0.11
Nodes (10): OrganizationCreate, test_api_create_organization_success(), test_api_create_organization_validation_error(), test_api_get_organization_found(), test_api_get_organization_not_found(), test_api_list_organizations(), test_organization_service_create(), test_organization_service_get_by_id() (+2 more)

### Community 18 - "test_tools.py"
Cohesion: 0.11
Nodes (8): test_api_create_tool_organization_not_found(), test_api_create_tool_success(), test_api_get_tool_found(), test_api_get_tool_not_found(), test_api_list_tools(), test_tool_service_create(), test_tool_service_get_by_id(), test_tool_service_list_by_org()

### Community 19 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+11 more)

### Community 20 - "uuid"
Cohesion: 0.08
Nodes (17): test_approvals_get_by_id_not_found(), test_approvals_resolve_already_resolved_or_not_found(), test_api_create_user_email_conflict(), test_api_create_user_organization_not_found(), test_api_create_user_success(), test_api_delete_user(), test_api_delete_user_not_found(), test_api_get_user_found() (+9 more)

### Community 21 - "PDPEngine"
Cohesion: 0.17
Nodes (4): PDPEngine, test_matches_conditions_destinations(), test_matches_conditions_empty(), test_matches_conditions_numeric()

### Community 22 - "compilerOptions"
Cohesion: 0.12
Nodes (16): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+8 more)

### Community 23 - "scripts"
Cohesion: 0.10
Nodes (19): description, engines, node, name, packageManager, private, scripts, build:frontend (+11 more)

### Community 24 - "UserRole"
Cohesion: 0.13
Nodes (10): create_user(), delete_user(), get_user(), list_users(), update_user(), UserRole, UserCreate, UserRead (+2 more)

### Community 25 - "policy_rules.py"
Cohesion: 0.17
Nodes (6): create_policy_rule(), get_policy_rule(), list_policy_rules(), PolicyRuleCreate, PolicyRuleRead, test_policy_and_policy_rule_schemas_fail_closed()

### Community 26 - "typing"
Cohesion: 0.11
Nodes (9): Base, AuditEvent, ActorType, Organization, Policy, PolicyRule, User, test_api_create_agent_success() (+1 more)

### Community 28 - "WebSocketConnectionManager"
Cohesion: 0.11
Nodes (6): WebSocketConnectionManager, test_websocket_endpoint_ping_pong(), test_websocket_manager_broadcast_tenant_isolation(), test_websocket_manager_connect_and_welcome(), test_websocket_manager_disconnect_cleanup(), test_websocket_tenant_endpoint_connect()

### Community 29 - "test_policies.py"
Cohesion: 0.15
Nodes (7): create_policy(), delete_policy(), get_policy(), list_policies(), update_policy(), PolicyRead, PolicyUpdate

### Community 30 - "🚀 Orquestación y Arranque de Desarrollo Local (AgentGuard)"
Cohesion: 0.33
Nodes (5): Comandos Oficiales:, 🚀 Orquestación y Arranque de Desarrollo Local (AgentGuard), Parada Limpia:, 🚨 Regla Innegociable para Agentes de IA (Anti "Worker User Agent Cancelled"):, Secuencia que ejecuta el orquestador:

### Community 31 - "tools.py"
Cohesion: 0.14
Nodes (6): create_tool(), delete_tool(), get_tool(), list_tools(), update_tool(), ToolUpdate

### Community 32 - "asyncio"
Cohesion: 0.12
Nodes (7): test_api_create_policy_rule_policy_not_found(), test_api_get_policy_rule_found(), test_api_get_policy_rule_not_found(), test_api_list_policy_rules(), test_policy_rule_service_create(), test_policy_rule_service_get_by_id(), test_policy_rule_service_list_rules()

### Community 33 - "📑 Desglose de Pasos: Semana 2 — API REST de Gestión Administrativa"
Cohesion: 0.14
Nodes (11): 📑 Desglose de Pasos: Semana 2 — API REST de Gestión Administrativa, 🧭 Diagrama de Flujo de los 8 Pasos Atómicos, 📦 Historial de Commits Atómicos (Semana 2), 🎯 Objetivo de la Semana 2, 🏗️ Resumen de Capas Implementadas, 🛡️ Certificación de los 4 Escenarios de la Demo ante el Tribunal, 🎓 Conclusión y Próximos Pasos (Semana 4), 🛡️ Desglose de Pasos: Semana 3 - El Gateway Interceptor (PEP) y el Motor de Políticas (PDP) (+3 more)

### Community 35 - "test_schemas.py"
Cohesion: 0.10
Nodes (13): assign_tool_to_agent(), create_agent(), delete_agent(), get_agent(), list_agent_tools(), list_agents(), update_agent(), AgentCreate (+5 more)

### Community 36 - ".oxlintrc.json"
Cohesion: 0.33
Nodes (5): plugins, rules, react/only-export-components, react/rules-of-hooks, $schema

### Community 37 - "🔄 Guía de Defensa: Máquinas de Estados y Ciclo de Vida en Runtime"
Cohesion: 0.15
Nodes (12): 1. Importancia del Modelado de Estados en Arquitecturas Asíncronas, 2. Diagramas de Estados UML (Mermaid), 3. Análisis Detallado de las Transiciones, 4. Principios de Robustez: Idempotencia y Prevención de Condiciones de Carrera, 5. Preguntas Difíciles del Profesor y Respuestas Sugeridas, A. Máquina 1: Ciclo de Vida de una Ejecución (`Execution`), B. Máquina 2: Ciclo de Vida de una Aprobación (`Approval`), C. Máquina 3: Ciclo de Vida de un Incidente de Seguridad (`Alert`) (+4 more)

### Community 38 - "🏛️ Registro de Decisiones Arquitectónicas (ADRs) — AgentGuard"
Cohesion: 0.13
Nodes (15): 1. Contexto y Problema, 1. Contexto y Problema, 1. Decisión Tomada, 1. Decisión Tomada, 2. Decisión Tomada, 2. Decisión Tomada, 2. Justificación Técnica, 3. Asignación por Paquete (+7 more)

### Community 45 - "🎯 Guía de Defensa: Diagrama de Casos de Uso del Sistema (UML)"
Cohesion: 0.17
Nodes (11): 1. Clasificación de Actores y Frontera del Sistema, 2. Diagrama de Casos de Uso del Sistema (Mermaid), 3. Mapeo con los Requisitos Funcionales del Informe (RF-01 a RF-12), 4. Justificación Teórica de Relaciones `<<include>>` y `<<extend>>`, 5. Especificación Detallada del Caso de Uso Crítico: UC05, 6. Preguntas de Examen / Defensa y Respuestas Clave, 🎯 Guía de Defensa: Diagrama de Casos de Uso del Sistema (UML), ❓ P1: *"¿Por qué el Agente de IA está modelado como un Actor si no es una persona?"* (+3 more)

### Community 46 - "🛡️ Guía de Defensa: Modelo Entidad-Relación Relacional Multi-Tenant v2.0"
Cohesion: 0.17
Nodes (12): 1. Propósito y Alcance del Diagrama, 2. Diagrama del Modelo Entidad-Relación (Mermaid), 3. Decisiones Arquitectónicas y Justificación Técnica, 5. Preguntas Difíciles del Profesor y Respuestas Recomendadas, A. Estrategia Multi-Tenant: Base de Datos Compartida con Discriminador de Tenant, B. Uso de UUID v4 como Clave Primaria en lugar de Enteros Seriales, C. Uso Estratégico de `JSONB` vs. Normalización Extrema, D. Sanitización y Privacidad del `request_context` (+4 more)

### Community 47 - "test_agents.py"
Cohesion: 0.14
Nodes (7): test_agent_service_assign_tool(), test_agent_service_create(), mock_refresh(), test_agent_service_get_by_id(), test_api_assign_tool_different_org(), test_api_create_agent_owner_different_org(), test_api_list_agent_tools()

### Community 48 - "🛡️ AgentGuard — Guía Simple y Hoja de Ruta para el Equipo"
Cohesion: 0.17
Nodes (12): 1. La Idea Explicada "Para un Nene de 5 Años" 🧒, 🌐 1. La Página Web (Frontend), 2. ¿Dónde Encaja Cada Pieza Técnica? 🧩, ⚙️ 2. La API REST (Backend), 🤖 3. El Agente de IA (Sin Complicarse), 3. La Demostración en Clase: "SIN vs. CON AgentGuard" 🎬, 4. Cronograma Paso a Paso (De Hoy al 30 de Noviembre) 📅, 🔌 4. ¿Y MCP? (Decisión del Equipo: Eliminado por Pragmatismo) (+4 more)

### Community 50 - "🏗️ Guía de Defensa: Arquitectura de Runtime y Flujo de Intercepción PEP / PDP"
Cohesion: 0.20
Nodes (9): 1. El Paradigma de Seguridad: ¿Por qué Fuera del LLM?, 2. Diagrama de Arquitectura de Runtime y Flujo de Intercepción (Mermaid), 3. Los Dos Componentes Clave: PEP y PDP (Estándar XACML / RFC 2904), 4. Manejo de Latencia y Rendimiento en la Ruta Crítica, 5. Preguntas Difíciles del Profesor y Respuestas Magistrales, 🏗️ Guía de Defensa: Arquitectura de Runtime y Flujo de Intercepción PEP / PDP, ❓ P1: *"¿Por qué dicen que esto no es simplemente un API Gateway como Kong o Nginx?"*, ❓ P2: *"¿Dónde está la Inteligencia Artificial si el backend es determinista?"* (+1 more)

### Community 51 - "3. Los 4 Escenarios Demostrables Paso a Paso"
Cohesion: 0.20
Nodes (9): 1. Guión y Estrategia de Presentación ante el Tribunal, 2. Diagrama de Secuencia de la Demo (Mermaid), 3. Los 4 Escenarios Demostrables Paso a Paso, 4. El Cierre Magistral: El "Execution Trace", Escenario 1: Operación Normal (`ALLOW`), Escenario 2: Intento de Abuso de Privilegio (`DENY`), Escenario 3: Operación de Alto Impacto con Intervención Humana (`REQUIRE_APPROVAL`), Escenario 4: Ataque de Prompt Injection y Alerta Crítica (`DENY + ALERT`) (+1 more)

### Community 52 - "test_tool_actions.py"
Cohesion: 0.12
Nodes (10): test_api_create_tool_action_duplicate_conflict(), test_api_create_tool_action_success(), test_api_create_tool_action_tool_not_found(), test_api_get_tool_action_found(), test_api_get_tool_action_not_found(), test_api_list_tool_actions(), test_tool_action_service_create(), test_tool_action_service_get_by_id() (+2 more)

### Community 53 - "convert_docs_to_docx.py"
Cohesion: 0.22
Nodes (8): add_markdown_to_docx(), build_docx_files(), set_cell_background(), set_cell_margins(), add_markdown_to_docx(), build_domain_docx(), set_cell_background(), set_cell_margins()

### Community 54 - "📐 Guía de Defensa: Modelo Conceptual (Chen) y Diccionario de Atributos"
Cohesion: 0.13
Nodes (14): 1. Propósito y Valor Académico de la Notación Chen, 2. Diagrama Conceptual de Entidad-Relación (Notación Chen), 3. Análisis Semántico de las Relaciones y Cardinalidades, 4. Biblioteca de Atributos: Clasificación por Naturaleza, 5. Preguntas de Cátedra y Respuestas Sugeridas, A. Organización y Usuarios: `PERTENECE_A`, B. Usuario y Agente: `ADMINISTRA (OWNER)`, C. Agente y Herramienta: `AUTORIZADO_EN` (Relación $M:N$) (+6 more)

### Community 55 - "FastAPI"
Cohesion: 0.19
Nodes (3): websocket_global_endpoint(), websocket_tenant_endpoint(), lifespan()

### Community 58 - "test_sanitizer_service.py"
Cohesion: 0.17
Nodes (5): test_sanitize_bearer_token_in_string(), test_sanitize_credit_card_masking(), test_sanitize_empty_context(), test_sanitize_lists_and_tuples(), test_sanitize_sensitive_keys()

### Community 59 - "downgrade"
Cohesion: 0.21
Nodes (11): 1.1 Stack Tecnológico y Tooling Oficial (Arquitectura Políglota), downgrade(), upgrade(), 🗄️ PASO 3: Modelos Declarativos y Versionado DDL con Alembic (`backend/alembic/`), ¿Por qué es necesaria cada tecnología y qué rol cumple?, ¿Qué se hace concretamente?, 1. Contexto y Problema, 2. Decisión Tomada (+3 more)

### Community 60 - "main.py"
Cohesion: 0.16
Nodes (4): check_database_health(), check_redis_health(), health_check(), ping()

### Community 61 - "list_executions"
Cohesion: 0.27
Nodes (4): get_execution_by_id(), list_executions(), _to_execution_response(), ExecutionResponse

### Community 62 - "Execution"
Cohesion: 0.09
Nodes (12): 4. Las 7 Correcciones y Mejoras de la Versión 2.0, AgentTool, Alert, Approval, Execution, PEPGatewayService, 🛡️ Cumplimiento de Reglas Innegociables del Dominio, clear_database() (+4 more)

### Community 64 - "CLAUDE.md"
Cohesion: 0.50
Nodes (3): Assistant Verification Protocol, graphify, Local Dev Orchestration

### Community 66 - "copilot-instructions.md"
Cohesion: 0.50
Nodes (3): Assistant Verification Protocol, graphify, Local Dev Orchestration

### Community 67 - "httpx"
Cohesion: 0.28
Nodes (3): test_health_endpoint(), test_ping_endpoint(), test_root_endpoint()

### Community 68 - "list_approvals"
Cohesion: 0.27
Nodes (3): get_approval(), list_approvals(), resolve_approval()

### Community 73 - "⚙️ AgentGuard — Backend (Python + FastAPI)"
Cohesion: 0.40
Nodes (5): ⚙️ AgentGuard — Backend (Python + FastAPI), 🏗️ Arquitectura de la API REST, 📋 Especificaciones y Hitos de Desarrollo, 📁 Estructura del Código Fuente, 🗄️ Versionado de Base de Datos con Alembic

### Community 75 - "🛡️ AgentGuard — Runtime Authorization & Governance for AI Agents"
Cohesion: 0.17
Nodes (12): 🛡️ AgentGuard — Runtime Authorization & Governance for AI Agents, 🚀 Arranque Rápido con un Solo Clic (Quickstart Local), 🏛️ Contexto Institucional y Equipo, 🖥️ Cómo Visualizar y Editar los Diagramas, 📄 Documentos Oficiales y Decisiones de Arquitectura, 🗂️ Estructura del Monorepositorio, 🤖 Guía y Reglas para Agentes de IA (`AGENTS.md`), 👥 Integrantes y Roles (+4 more)

## Knowledge Gaps
- **5 isolated node(s):** `@types/node`, `@types/react`, `@types/react-dom`, `oxlint`, `typescript`
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 649 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **26 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `🛡️ Reglas de Proyecto: AgentGuard — Runtime Authorization & Governance for AI Agents` connect `env.py` to `README.md`?**
  _High betweenness centrality (0.178) - this node is a cross-community bridge._
- **Are the 24 inferred relationships involving `Tool` (e.g. with `PEPGatewayService` and `ToolService`) actually correct?**
  _`Tool` has 24 INFERRED edges - model-reasoned connections that need verification._
- **What connects `@types/node`, `@types/react`, `@types/react-dom` to the rest of the system?**
  _5 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `App.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.056105610561056105 - nodes in this community are weakly interconnected._
- **Why does `4. Reglas Innegociables de Seguridad y Dominio (AgentGuard Core)` connect `env.py` to `enums.py`, `Execution`?**
  _High betweenness centrality (0.148) - this node is a cross-community bridge._
- **Are the 28 inferred relationships involving `ToolAction` (e.g. with `4. Las 7 Correcciones y Mejoras de la Versión 2.0` and `4. Reglas Innegociables de Seguridad y Dominio (AgentGuard Core)`) actually correct?**
  _`ToolAction` has 28 INFERRED edges - model-reasoned connections that need verification._
- **Should `test_schemas.py` be split into smaller, more focused modules?**
  _Cohesion score 0.10220673635307782 - nodes in this community are weakly interconnected._