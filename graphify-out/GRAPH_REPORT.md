# Graph Report - AgentGuard  (2026-10-22)

## Corpus Check
- 122 files · ~64,923 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 14 file(s) not represented in the graph (top: .drawio 6, (none) 2, .css 2)

## Summary
- 1160 nodes · 2931 edges · 69 communities (47 shown, 22 thin omitted)
- Extraction: 86% EXTRACTED · 14% INFERRED · 0% AMBIGUOUS · INFERRED: 414 edges (avg confidence: 0.94)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `35fffa6e`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- agent_service.py
- App.tsx
- Tool
- convert_docs_to_docx.py
- organizations.py
- uuid
- test_schemas.py
- asyncio
- User
- asyncio
- frontend/package.json
- PolicyDecision
- 🔬 Desglose Paso a Paso: Qué Hacemos y Por Qué
- OrganizationService
- env.py
- test_tool_actions.py
- ToolService
- asyncio
- test_tools.py
- compilerOptions
- asyncio
- PDPEngine
- compilerOptions
- scripts
- pep_gateway_service.py
- ToolActionService
- enums.py
- list_approvals
- test_websocket.py
- policies.py
- create_policy_rule
- tools.py
- UserRole
- test_approvals_get_by_id_success
- assign_tool_to_agent
- .oxlintrc.json
- 🔄 Guía de Defensa: Máquinas de Estados y Ciclo de Vida en Runtime
- downgrade
- tsconfig.json
- get_user
- 🎯 Guía de Defensa: Diagrama de Casos de Uso del Sistema (UML)
- 🛡️ Guía de Defensa: Modelo Entidad-Relación Relacional Multi-Tenant v2.0
- 🛡️ AgentGuard — Guía Simple y Hoja de Ruta para el Equipo
- 🏛️ Registro de Decisiones Arquitectónicas (ADRs) — AgentGuard
- 🏗️ Guía de Defensa: Arquitectura de Runtime y Flujo de Intercepción PEP / PDP
- 3. Los 4 Escenarios Demostrables Paso a Paso
- main.py
- 🛡️ AgentGuard — Runtime Authorization & Governance for AI Agents
- 📐 Guía de Defensa: Modelo Conceptual (Chen) y Diccionario de Atributos
- 3. Análisis Semántico de las Relaciones y Cardinalidades
- 📑 Desglose de Pasos: Semana 1 — Base de Datos & Setup Inicial
- 🛡️ Desglose de Pasos: Semana 3 - El Gateway Interceptor (PEP) y el Motor de Políticas (PDP)
- ⚙️ AgentGuard — Backend (Python + FastAPI)
- PolicyRuleService
- agent-demo/README.md
- CLAUDE.md
- frontend/README.md
- copilot-instructions.md
- websocket.py

## God Nodes (most connected - your core abstractions)
1. `Tool` - 45 edges
2. `ToolAction` - 45 edges
3. `Agent` - 40 edges
4. `PolicyDecision` - 39 edges
5. `Organization` - 38 edges
6. `RiskLevel` - 36 edges
7. `BaseSchema` - 36 edges
8. `AgentTool` - 34 edges
9. `User` - 33 edges
10. `PolicyRule` - 32 edges

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

## Communities (69 total, 22 thin omitted)

### Community 1 - "App.tsx"
Cohesion: 0.08
Nodes (48): App(), Header(), HeaderProps, Sidebar(), SidebarProps, Theme, ThemeContext, ThemeContextType (+40 more)

### Community 2 - "Tool"
Cohesion: 0.12
Nodes (22): 4. Reglas Innegociables de Seguridad y Dominio (AgentGuard Core), Agent, AgentTool, AgentStatus, RiskLevel, Tool, ToolAction, PDPDecisionResult (+14 more)

### Community 3 - "convert_docs_to_docx.py"
Cohesion: 0.06
Nodes (14): SanitizerService, test_sanitize_bearer_token_in_string(), test_sanitize_credit_card_masking(), test_sanitize_empty_context(), test_sanitize_lists_and_tuples(), test_sanitize_sensitive_keys(), add_markdown_to_docx(), build_docx_files() (+6 more)

### Community 4 - "organizations.py"
Cohesion: 0.22
Nodes (4): create_organization(), get_organization(), list_organizations(), OrganizationRead

### Community 5 - "uuid"
Cohesion: 0.12
Nodes (10): test_api_create_user_email_conflict(), test_api_create_user_organization_not_found(), test_api_create_user_success(), test_api_get_user_found(), test_api_get_user_not_found(), test_api_list_users(), test_user_service_create(), test_user_service_get_by_email() (+2 more)

### Community 6 - "test_schemas.py"
Cohesion: 0.08
Nodes (18): AgentCreate, AgentToolCreate, ApprovalDetailRead, ApprovalRead, ApprovalResolveRequest, BaseSchema, ExecutionRead, OrganizationCreate (+10 more)

### Community 7 - "asyncio"
Cohesion: 0.12
Nodes (7): test_api_create_policy_rule_policy_not_found(), test_api_get_policy_rule_found(), test_api_get_policy_rule_not_found(), test_api_list_policy_rules(), test_policy_rule_service_create(), test_policy_rule_service_get_by_id(), test_policy_rule_service_list_rules()

### Community 9 - "asyncio"
Cohesion: 0.11
Nodes (8): test_api_create_policy_organization_not_found(), test_api_create_policy_success(), test_api_get_policy_found(), test_api_get_policy_not_found(), test_api_list_policies(), test_policy_service_create(), test_policy_service_get_by_id(), test_policy_service_list_by_org()

### Community 10 - "frontend/package.json"
Cohesion: 0.07
Nodes (29): dependencies, lucide-react, react, react-dom, devDependencies, oxlint, @types/node, @types/react (+21 more)

### Community 11 - "PolicyDecision"
Cohesion: 0.11
Nodes (11): execute_gateway_action(), ExecutionStatus, PolicyDecision, GatewayExecuteRequest, GatewayExecuteResponse, PEPGatewayService, test_gateway_execute_endpoint_allow(), test_gateway_execute_endpoint_deny() (+3 more)

### Community 12 - "🔬 Desglose Paso a Paso: Qué Hacemos y Por Qué"
Cohesion: 0.20
Nodes (10): 🔬 Desglose Paso a Paso: Qué Hacemos y Por Qué, 🧱 PASO 1: Infraestructura Local Reproducible (`docker-compose.yml`), 🐍 PASO 2: Entorno Backend & Configuración Fail-Fast (`backend/`), 🚀 PASO 4: Entrypoint FastAPI, Middlewares y Verificación (`backend/app/main.py`), ¿Por qué es necesaria cada tecnología y qué rol cumple?, ¿Por qué es necesaria cada tecnología y qué rol cumple?, ¿Por qué es necesaria cada tecnología y qué rol cumple?, ¿Qué se hace concretamente? (+2 more)

### Community 14 - "env.py"
Cohesion: 0.06
Nodes (17): 1. Identidad y Configuración General, 2. Equipo de Desarrollo y Distribución de Roles, 3.1 Fases Estrictas y Progresivas del Proyecto, 3. Metodología de Desarrollo: SDD (Spec-Driven Development), 5. Control de Versiones y Convención de Commits, 6. Calidad de Software, Testing y Regresión Continua, 7. Persistencia y Base de Datos (PostgreSQL), 8. Variables de Entorno y Configuración Fail-Fast (+9 more)

### Community 15 - "test_tool_actions.py"
Cohesion: 0.13
Nodes (11): test_approvals_list_endpoint(), test_api_create_tool_action_duplicate_conflict(), test_api_create_tool_action_success(), test_api_create_tool_action_tool_not_found(), test_api_get_tool_action_found(), test_api_get_tool_action_not_found(), test_api_list_tool_actions(), test_tool_action_service_create() (+3 more)

### Community 17 - "asyncio"
Cohesion: 0.11
Nodes (8): test_api_create_organization_success(), test_api_create_organization_validation_error(), test_api_get_organization_found(), test_api_get_organization_not_found(), test_api_list_organizations(), test_organization_service_create(), test_organization_service_get_by_id(), test_organization_service_list_all()

### Community 18 - "test_tools.py"
Cohesion: 0.13
Nodes (8): test_api_create_tool_organization_not_found(), test_api_create_tool_success(), test_api_get_tool_found(), test_api_get_tool_not_found(), test_api_list_tools(), test_tool_service_create(), test_tool_service_get_by_id(), test_tool_service_list_by_org()

### Community 19 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+11 more)

### Community 20 - "asyncio"
Cohesion: 0.12
Nodes (8): test_agent_service_assign_tool(), test_agent_service_create(), mock_refresh(), test_agent_service_get_by_id(), test_api_assign_tool_different_org(), test_api_create_agent_owner_different_org(), test_api_create_agent_success(), test_api_list_agent_tools()

### Community 21 - "PDPEngine"
Cohesion: 0.11
Nodes (7): PDPEngine, test_matches_conditions_destinations(), test_matches_conditions_empty(), test_matches_conditions_numeric(), test_pdp_evaluate_allow(), test_pdp_evaluate_deny_fail_closed(), test_pdp_evaluate_require_approval()

### Community 22 - "compilerOptions"
Cohesion: 0.12
Nodes (16): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+8 more)

### Community 23 - "scripts"
Cohesion: 0.12
Nodes (15): description, engines, node, name, packageManager, private, scripts, build:frontend (+7 more)

### Community 25 - "ToolActionService"
Cohesion: 0.10
Nodes (6): create_tool_action(), get_tool_action(), list_tool_actions(), ToolActionCreate, ToolActionService, test_tool_and_action_schemas()

### Community 26 - "enums.py"
Cohesion: 0.10
Nodes (20): 4. Las 7 Correcciones y Mejoras de la Versión 2.0, Base, Alert, Approval, AuditEvent, ActorType, AlertSeverity, AlertStatus (+12 more)

### Community 27 - "list_approvals"
Cohesion: 0.27
Nodes (3): get_approval(), list_approvals(), resolve_approval()

### Community 28 - "test_websocket.py"
Cohesion: 0.11
Nodes (6): WebSocketConnectionManager, test_websocket_endpoint_ping_pong(), test_websocket_manager_broadcast_tenant_isolation(), test_websocket_manager_connect_and_welcome(), test_websocket_manager_disconnect_cleanup(), test_websocket_tenant_endpoint_connect()

### Community 29 - "policies.py"
Cohesion: 0.18
Nodes (4): create_policy(), get_policy(), list_policies(), get_db()

### Community 30 - "create_policy_rule"
Cohesion: 0.24
Nodes (3): create_policy_rule(), get_policy_rule(), list_policy_rules()

### Community 31 - "tools.py"
Cohesion: 0.23
Nodes (4): create_tool(), get_tool(), list_tools(), ToolRead

### Community 32 - "UserRole"
Cohesion: 0.21
Nodes (5): create_user(), UserRole, UserCreate, UserRead, test_user_schemas()

### Community 33 - "test_approvals_get_by_id_success"
Cohesion: 0.22
Nodes (4): test_approvals_get_by_id_not_found(), test_approvals_get_by_id_success(), test_approvals_resolve_already_resolved_or_not_found(), test_approvals_resolve_success()

### Community 35 - "assign_tool_to_agent"
Cohesion: 0.18
Nodes (7): assign_tool_to_agent(), create_agent(), get_agent(), list_agent_tools(), list_agents(), AgentRead, AgentToolRead

### Community 36 - ".oxlintrc.json"
Cohesion: 0.33
Nodes (5): plugins, rules, react/only-export-components, react/rules-of-hooks, $schema

### Community 37 - "🔄 Guía de Defensa: Máquinas de Estados y Ciclo de Vida en Runtime"
Cohesion: 0.15
Nodes (12): 1. Importancia del Modelado de Estados en Arquitecturas Asíncronas, 2. Diagramas de Estados UML (Mermaid), 3. Análisis Detallado de las Transiciones, 4. Principios de Robustez: Idempotencia y Prevención de Condiciones de Carrera, 5. Preguntas Difíciles del Profesor y Respuestas Sugeridas, A. Máquina 1: Ciclo de Vida de una Ejecución (`Execution`), B. Máquina 2: Ciclo de Vida de una Aprobación (`Approval`), C. Máquina 3: Ciclo de Vida de un Incidente de Seguridad (`Alert`) (+4 more)

### Community 38 - "downgrade"
Cohesion: 0.21
Nodes (11): 1.1 Stack Tecnológico y Tooling Oficial (Arquitectura Políglota), downgrade(), upgrade(), 🗄️ PASO 3: Modelos Declarativos y Versionado DDL con Alembic (`backend/alembic/`), ¿Por qué es necesaria cada tecnología y qué rol cumple?, ¿Qué se hace concretamente?, 1. Contexto y Problema, 2. Decisión Tomada (+3 more)

### Community 45 - "🎯 Guía de Defensa: Diagrama de Casos de Uso del Sistema (UML)"
Cohesion: 0.17
Nodes (11): 1. Clasificación de Actores y Frontera del Sistema, 2. Diagrama de Casos de Uso del Sistema (Mermaid), 3. Mapeo con los Requisitos Funcionales del Informe (RF-01 a RF-12), 4. Justificación Teórica de Relaciones `<<include>>` y `<<extend>>`, 5. Especificación Detallada del Caso de Uso Crítico: UC05, 6. Preguntas de Examen / Defensa y Respuestas Clave, 🎯 Guía de Defensa: Diagrama de Casos de Uso del Sistema (UML), ❓ P1: *"¿Por qué el Agente de IA está modelado como un Actor si no es una persona?"* (+3 more)

### Community 46 - "🛡️ Guía de Defensa: Modelo Entidad-Relación Relacional Multi-Tenant v2.0"
Cohesion: 0.17
Nodes (12): 1. Propósito y Alcance del Diagrama, 2. Diagrama del Modelo Entidad-Relación (Mermaid), 3. Decisiones Arquitectónicas y Justificación Técnica, 5. Preguntas Difíciles del Profesor y Respuestas Recomendadas, A. Estrategia Multi-Tenant: Base de Datos Compartida con Discriminador de Tenant, B. Uso de UUID v4 como Clave Primaria en lugar de Enteros Seriales, C. Uso Estratégico de `JSONB` vs. Normalización Extrema, D. Sanitización y Privacidad del `request_context` (+4 more)

### Community 48 - "🛡️ AgentGuard — Guía Simple y Hoja de Ruta para el Equipo"
Cohesion: 0.17
Nodes (12): 1. La Idea Explicada "Para un Nene de 5 Años" 🧒, 🌐 1. La Página Web (Frontend), 2. ¿Dónde Encaja Cada Pieza Técnica? 🧩, ⚙️ 2. La API REST (Backend), 🤖 3. El Agente de IA (Sin Complicarse), 3. La Demostración en Clase: "SIN vs. CON AgentGuard" 🎬, 4. Cronograma Paso a Paso (De Hoy al 30 de Noviembre) 📅, 🔌 4. ¿Y MCP? (Decisión del Equipo: Eliminado por Pragmatismo) (+4 more)

### Community 49 - "🏛️ Registro de Decisiones Arquitectónicas (ADRs) — AgentGuard"
Cohesion: 0.13
Nodes (15): 1. Contexto y Problema, 1. Contexto y Problema, 1. Decisión Tomada, 1. Decisión Tomada, 2. Decisión Tomada, 2. Decisión Tomada, 2. Justificación Técnica, 3. Asignación por Paquete (+7 more)

### Community 50 - "🏗️ Guía de Defensa: Arquitectura de Runtime y Flujo de Intercepción PEP / PDP"
Cohesion: 0.20
Nodes (9): 1. El Paradigma de Seguridad: ¿Por qué Fuera del LLM?, 2. Diagrama de Arquitectura de Runtime y Flujo de Intercepción (Mermaid), 3. Los Dos Componentes Clave: PEP y PDP (Estándar XACML / RFC 2904), 4. Manejo de Latencia y Rendimiento en la Ruta Crítica, 5. Preguntas Difíciles del Profesor y Respuestas Magistrales, 🏗️ Guía de Defensa: Arquitectura de Runtime y Flujo de Intercepción PEP / PDP, ❓ P1: *"¿Por qué dicen que esto no es simplemente un API Gateway como Kong o Nginx?"*, ❓ P2: *"¿Dónde está la Inteligencia Artificial si el backend es determinista?"* (+1 more)

### Community 51 - "3. Los 4 Escenarios Demostrables Paso a Paso"
Cohesion: 0.20
Nodes (9): 1. Guión y Estrategia de Presentación ante el Tribunal, 2. Diagrama de Secuencia de la Demo (Mermaid), 3. Los 4 Escenarios Demostrables Paso a Paso, 4. El Cierre Magistral: El "Execution Trace", Escenario 1: Operación Normal (`ALLOW`), Escenario 2: Intento de Abuso de Privilegio (`DENY`), Escenario 3: Operación de Alto Impacto con Intervención Humana (`REQUIRE_APPROVAL`), Escenario 4: Ataque de Prompt Injection y Alerta Crítica (`DENY + ALERT`) (+1 more)

### Community 52 - "main.py"
Cohesion: 0.07
Nodes (12): check_database_health(), check_redis_health(), health_check(), ping(), root(), test_health_endpoint(), test_ping_endpoint(), test_root_endpoint() (+4 more)

### Community 53 - "🛡️ AgentGuard — Runtime Authorization & Governance for AI Agents"
Cohesion: 0.20
Nodes (10): 🛡️ AgentGuard — Runtime Authorization & Governance for AI Agents, 🏛️ Contexto Institucional y Equipo, 🖥️ Cómo Visualizar y Editar los Diagramas, 📄 Documentos Oficiales y Decisiones de Arquitectura, 🗂️ Estructura del Monorepositorio, 🤖 Guía y Reglas para Agentes de IA (`AGENTS.md`), 👥 Integrantes y Roles, 🎬 La Secuencia de la Demo Principal (En Vivo) (+2 more)

### Community 54 - "📐 Guía de Defensa: Modelo Conceptual (Chen) y Diccionario de Atributos"
Cohesion: 0.25
Nodes (7): 1. Propósito y Valor Académico de la Notación Chen, 2. Diagrama Conceptual de Entidad-Relación (Notación Chen), 4. Biblioteca de Atributos: Clasificación por Naturaleza, 5. Preguntas de Cátedra y Respuestas Sugeridas, 📐 Guía de Defensa: Modelo Conceptual (Chen) y Diccionario de Atributos, ❓ P1: *"¿Por qué modelan `AgentTool` como una relación $M:N$ en lugar de incluir un array de herramientas dentro del agente?"*, ❓ P2: *"¿Por qué la relación entre `EJECUCIÓN` y `APROBACIÓN` es `(0,1)` y no `(1,1)`?"*

### Community 56 - "3. Análisis Semántico de las Relaciones y Cardinalidades"
Cohesion: 0.29
Nodes (7): 3. Análisis Semántico de las Relaciones y Cardinalidades, A. Organización y Usuarios: `PERTENECE_A`, B. Usuario y Agente: `ADMINISTRA (OWNER)`, C. Agente y Herramienta: `AUTORIZADO_EN` (Relación $M:N$), D. Herramienta y Acción: `EXPONE`, E. Ejecución en Runtime: `SOLICITA` e `INVOCA`, F. Aprobación Humana: `REQUIERE_INTERVENCIÓN`

### Community 58 - "📑 Desglose de Pasos: Semana 1 — Base de Datos & Setup Inicial"
Cohesion: 0.20
Nodes (10): 1. Levantar Servicios de Infraestructura (Paso 1), 2. Preparar el Entorno Virtual de Python (Paso 2), 3. Ejecutar las Migraciones de Base de Datos (Paso 3), 4. Iniciar el Servidor de Desarrollo (Paso 4), 📑 Desglose de Pasos: Semana 1 — Base de Datos & Setup Inicial, 🧭 Diagrama de Flujo de los 4 Pasos, 🛠️ Guía Rápida de Comandos para Ejecutar la Semana 1, 📊 Matriz Resumen de Tecnologías y Roles para la Defensa (+2 more)

### Community 59 - "🛡️ Desglose de Pasos: Semana 3 - El Gateway Interceptor (PEP) y el Motor de Políticas (PDP)"
Cohesion: 0.15
Nodes (10): 📑 Desglose de Pasos: Semana 2 — API REST de Gestión Administrativa, 🧭 Diagrama de Flujo de los 8 Pasos Atómicos, 📦 Historial de Commits Atómicos (Semana 2), 🎯 Objetivo de la Semana 2, 🏗️ Resumen de Capas Implementadas, 🛡️ Certificación de los 4 Escenarios de la Demo ante el Tribunal, 🛡️ Desglose de Pasos: Semana 3 - El Gateway Interceptor (PEP) y el Motor de Políticas (PDP), 📊 Matriz de Entregables y Estado Final (+2 more)

### Community 61 - "⚙️ AgentGuard — Backend (Python + FastAPI)"
Cohesion: 0.40
Nodes (5): ⚙️ AgentGuard — Backend (Python + FastAPI), 🏗️ Arquitectura de la API REST, 📋 Especificaciones y Hitos de Desarrollo, 📁 Estructura del Código Fuente, 🗄️ Versionado de Base de Datos con Alembic

### Community 67 - "websocket.py"
Cohesion: 0.19
Nodes (3): websocket_global_endpoint(), websocket_tenant_endpoint(), lifespan()

## Knowledge Gaps
- **5 isolated node(s):** `@types/node`, `@types/react`, `@types/react-dom`, `oxlint`, `typescript`
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 564 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **22 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `AgentTool` connect `Tool` to `agent_service.py`, `PolicyDecision`, `asyncio`, `📐 Guía de Defensa: Modelo Conceptual (Chen) y Diccionario de Atributos`, `pep_gateway_service.py`, `enums.py`, `🛡️ Desglose de Pasos: Semana 3 - El Gateway Interceptor (PEP) y el Motor de Políticas (PDP)`?**
  _High betweenness centrality (0.064) - this node is a cross-community bridge._
- **Are the 23 inferred relationships involving `Tool` (e.g. with `PEPGatewayService` and `ToolService`) actually correct?**
  _`Tool` has 23 INFERRED edges - model-reasoned connections that need verification._
- **What connects `@types/node`, `@types/react`, `@types/react-dom` to the rest of the system?**
  _5 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `App.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.07614035087719298 - nodes in this community are weakly interconnected._
- **Why does `ToolAction` connect `Tool` to `PolicyDecision`, `test_tool_actions.py`, `pep_gateway_service.py`, `ToolActionService`, `enums.py`?**
  _High betweenness centrality (0.052) - this node is a cross-community bridge._
- **Are the 26 inferred relationships involving `ToolAction` (e.g. with `4. Las 7 Correcciones y Mejoras de la Versión 2.0` and `4. Reglas Innegociables de Seguridad y Dominio (AgentGuard Core)`) actually correct?**
  _`ToolAction` has 26 INFERRED edges - model-reasoned connections that need verification._
- **Should `Tool` be split into smaller, more focused modules?**
  _Cohesion score 0.11613475177304965 - nodes in this community are weakly interconnected._