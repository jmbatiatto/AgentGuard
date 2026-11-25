---
layout: home
title: Inicio

hero:
  name: "AgentGuard"
  text: "Gobernanza Zero Trust en Runtime para Agentes de IA"
  tagline: "«IAM responde quién eres; AgentGuard decide qué puedes hacer ahora» — SaaS B2B Multi-Tenant de autorización contextual PEP/PDP, bandeja HITL en vivo y trazabilidad forense (ITU — UNCuyo, 2026)."
  image:
    src: /logo-agentguard.svg
    alt: Escudo oficial de AgentGuard
  actions:
    - theme: brand
      text: 🧭 Índice Maestro (SSOT)
      link: /volumenes/INDICE_MAESTRO
    - theme: alt
      text: 🖼️ Galería 4K (27 Diagramas)
      link: /galeria-diagramas
    - theme: alt
      text: 🎤 Modo Defensa & QR
      link: /modo-presentacion
    - theme: alt
      text: 🎬 Presentación Canva & Guion
      link: /volumenes/07_PRESENTACION_CANVA_Y_GUION_DEFENSA

features:
  - icon: 🛡️
    title: PEP/PDP Determinista 5D (Fail-Closed)
    details: Separación criptográfica entre Data Plane (X-AgentGuard-Key) y Control Plane (17 routers REST con rechazo 403 a X-Agent-Id). Evalúa [Agente, Delegador, Acción Atómica, Recurso, Contexto JSONB] emitiendo DENY por defecto ante duda o fallo.
    link: /volumenes/03_ARQUITECTURA_RUNTIME_PEP_PDP_Y_API_REST
    linkText: Explorar Arquitectura PEP/PDP
  - icon: 🗄️
    title: Multi-Tenant 13 Tablas PostgreSQL 16 + RLS Lógico
    details: Persistencia en PostgreSQL 16 (:5433) con 13 tablas, PKs UUID v4 nativas (gen_random_uuid()), 24 FKs, 10 ENUMs, 4 índices GIN en JSONB, 6 migraciones Alembic (001–006) y aislamiento anti-IDOR por organization_id en cada consulta ORM.
    link: /volumenes/01_MER_RELACIONAL_Y_FISICO_DB
    linkText: Ver Modelo Físico y Alembic
  - icon: ⚡
    title: Protocolo HITL en Vivo & WebSockets
    details: Las acciones sensibles (REQUIRE_APPROVAL, ej. reembolso Stripe >= $500 USD) devuelven HTTP 202 Accepted sin bloquear hilos, notifican en vivo por /api/v1/ws/{org_id} y aplican bloqueo pesimista SELECT ... FOR UPDATE con TTL de 900 s.
    link: /volumenes/04_SECUENCIA_DEMO_ESTADOS_Y_CASOS_DE_USO
    linkText: Ver Secuencias y Estados HITL
  - icon: 🔒
    title: Blindaje OWASP Agentic 2026 & LLM06
    details: ThreatDetector bloquea Prompt Injection (ASI01), exfiltración C2 (ASI03), evasión Base64 (ASI04) y SQL destructivo (ASI05). SanitizerService enmascara tokens Bearer, API Keys y PII antes de persistir trazas con latency_ms real.
    link: /volumenes/README
    linkText: Leer Guía Maestra Zero Trust
  - icon: 🤖
    title: Portal ACME Corp (:9000) + Gemini 3.8 Flash
    details: ERP empresarial satélite con SQLite (7 tablas), auto-onboarding del CEO Lucas Duck y Copiloto "Consultante BI" impulsado por Google Gemini 3.8 Flash (thinkingLevel low, thoughtSignature, gráfica SVG y filtro visual no destructivo).
    link: /volumenes/06_PORTAL_ACME_CORP_CONSULTANTE_BI_Y_AGENT_DEMO
    linkText: Explorar Ecosistema ACME Corp
  - icon: 📚
    title: Suite Documental SSOT Auditada
    details: 11 volúmenes oficiales verificados línea por línea contra el código real (29 discrepancias históricas subsanadas), 27 diagramas exportables en SVG/PNG 4K para Canva, 9 ADRs, SPA React 19 de 9 vistas 100% en español y Zero-Regression.
    link: /volumenes/00_INFORME_DISCREPANCIAS_DOC_VS_CODIGO_REAL
    linkText: Revisar Auditoría Forense
---

## 📊 Radiografía Verificada del Monorepositorio

::: tip Fuente Única de Verdad (SSOT — Zero-Regression Verified)
Toda la documentación de este portal se sincroniza directamente desde la carpeta `documentación final/` y fue contrastada archivo por archivo contra el código real de `backend/`, `frontend/`, `acme-corp/` y `agent-demo/`.
:::

| Indicador Arquitectónico | Magnitud Verificada en Código Real | Referencia Directa |
| :--- | :--- | :--- |
| **Persistencia SaaS Principal** | **13 tablas** en PostgreSQL 16 (`:5433`), `gen_random_uuid()`, **24 FKs**, **10 ENUMs**, **4 índices GIN** y **6 migraciones Alembic** (`001`–`006`) | [Volumen 01 · MER Físico](/volumenes/01_MER_RELACIONAL_Y_FISICO_DB) |
| **Modelo Conceptual Académico** | Notación Chen de **13 entidades**, entidad asociativa `agent_tools`, **24 relaciones** `(mín, máx)` y **96 atributos** | [Volumen 02 · MER Chen](/volumenes/02_MER_CONCEPTUAL_CHEN_Y_ATRIBUTOS) |
| **Superficie Backend & Runtime** | **17 routers** FastAPI bajo `/api/v1` + motor PDP 5D, `ThreatDetector`, `SanitizerService`, `SERVER_BOOT_ID` y WebSockets | [Volumen 03 · Runtime PEP/PDP](/volumenes/03_ARQUITECTURA_RUNTIME_PEP_PDP_Y_API_REST) |
| **Control Plane Frontend SPA** | React 19 + TypeScript 5+ + Tailwind v4 con **9 vistas** 100% en español (`labels.ts`), **5 roles RBAC** y cero *silent fallbacks* | [Volumen 05 · Manual SPA](/volumenes/05_MANUAL_FRONTEND_SPA_RBAC_Y_CREDENCIALES) |
| **Ecosistema Cliente ACME Corp** | Servidor FastAPI (`:9000`) + SQLite (**7 tablas**), auto-onboarding CEO y Copiloto BI con **Google Gemini 3.8 Flash** | [Volumen 06 · ACME & Gemini](/volumenes/06_PORTAL_ACME_CORP_CONSULTANTE_BI_Y_AGENT_DEMO) |
| **Patrimonio Visual y Defensa** | **27 diagramas** técnicos exportables en SVG y PNG 4K + presentación oficial de **12 diapositivas en Canva** (`~15 min`) | [Galería Interactiva 4K](/galeria-diagramas) |

---

## 🧭 Los 5 Itinerarios de Evaluación Recomendados

Seleccioná el recorrido ideal según el perfil evaluador o el foco técnico de revisión en la mesa de examen:

### 1. Defensa de Cátedra y Evaluación de Arquitectura Global
Pensado para el tribunal examinador de **Desarrollo Web (ITU — UNCuyo)**: recorre el problema OWASP 2026, las decisiones arquitectónicas políglotas, el guion de exposición cronometrado y la auditoría de fidelidad documental.
1. [Guía Maestra del Proyecto (README)](/volumenes/README) — Visión Zero Trust fuera del LLM, separación Control/Data Plane y stack políglota.
2. [07 · Presentación Oficial en Canva (12 Slides) y Guion (~15 min)](/volumenes/07_PRESENTACION_CANVA_Y_GUION_DEFENSA) — Estructura de diapositivas y oratoria del equipo SCRUM.
3. [Registro de Decisiones Arquitectónicas (ADR-001 a ADR-009)](/volumenes/DECISIONS) — Justificación técnica de FastAPI async, PostgreSQL 16, HITL asíncrono y Gemini 3.8 Flash.
4. [00 · Informe de Discrepancias vs. Código Real](/volumenes/00_INFORME_DISCREPANCIAS_DOC_VS_CODIGO_REAL) — Trazabilidad forense de las 29 correcciones sobre documentación heredada.
5. [04 · Secuencias, Estados y Casos de Uso](/volumenes/04_SECUENCIA_DEMO_ESTADOS_Y_CASOS_DE_USO) — Flujos extremo a extremo y banco de preguntas de defensa.

### 2. Persistencia, Modelado Relacional y Normalización
Enfocado en ingeniería de datos, integridad referencial, evolución DDL con Alembic y modelado conceptual formal.
1. [01 · MER Relacional, Esquema Físico y Migraciones Alembic](/volumenes/01_MER_RELACIONAL_Y_FISICO_DB) — Diccionario de las 13 tablas PostgreSQL 16, índices GIN en JSONB, migraciones `001`–`006` y las 7 tablas SQLite de `acme_corp.db`.
2. [02 · MER Conceptual Notación Chen y Atributos](/volumenes/02_MER_CONCEPTUAL_CHEN_Y_ATRIBUTOS) — Cardinalidades `(mín, máx)` de R1–R24, catálogo de 96 atributos y 16 preguntas de cátedra sobre base de datos.
3. [Decisiones ADR-002 y ADR-008](/volumenes/DECISIONS) — Fundamentos del esquema multi-tenant y separación física entre SaaS y ERP cliente.

### 3. Seguridad en Runtime, Interceptor PEP y Motor PDP 5D
Enfocado en ciberseguridad aplicada a IA, mitigación OWASP Agentic Top 10 (2026), sanitización `LLM06` y prevención de condiciones de carrera.
1. [03 · Arquitectura Runtime PEP/PDP y Catálogo API REST](/volumenes/03_ARQUITECTURA_RUNTIME_PEP_PDP_Y_API_REST) — Pipeline de `POST /api/v1/gateway/execute`, operadores del `PDPEngine` e inventario de los 17 routers.
2. [04 · Secuencias Demo, Estados y Casos de Uso](/volumenes/04_SECUENCIA_DEMO_ESTADOS_Y_CASOS_DE_USO) — Máquinas de estado de `Execution`, `Approval` (`SELECT ... FOR UPDATE`, TTL `900 s`) y `Alert`.
3. [Decisiones ADR-004, ADR-005 y ADR-007](/volumenes/DECISIONS) — Motor determinista Fail-Closed, RBAC con blindaje anti-IA y protocolo HITL asíncrono.

### 4. Frontend SPA, Experiencia de Usuario y Gobernanza RBAC
Enfocado en arquitectura cliente moderna con React 19, resiliencia ante fallos HTTP, sesiones efímeras y accesibilidad visual en español.
1. [05 · Manual de Frontend SPA (React 19), Matriz RBAC y Credenciales](/volumenes/05_MANUAL_FRONTEND_SPA_RBAC_Y_CREDENCIALES) — Recorrido por las 9 vistas, localización `labels.ts`, `SERVER_BOOT_ID`, `QuickSetupWizard`, `ForcePasswordChangeModal` y matriz de 5 roles.
2. [03 · Arquitectura Runtime (Sección WebSockets Multi-Tenant)](/volumenes/03_ARQUITECTURA_RUNTIME_PEP_PDP_Y_API_REST) — Eventos reactivos por canal `/api/v1/ws/{organization_id}`.

### 5. Ecosistema ACME Corp, Demostración Práctica e Inteligencia Artificial
Enfocado en la puesta en marcha en vivo, comparación entre **Modo Protegido** y **Modo Directo (Vulnerable)** y uso real de Function Calling con LLMs.
1. [06 · Portal Empresarial ACME Corp, Consultante BI y CLI Agent Demo](/volumenes/06_PORTAL_ACME_CORP_CONSULTANTE_BI_Y_AGENT_DEMO) — Auto-onboarding del CEO Lucas Duck, Copiloto BI con Google Gemini 3.8 Flash (`thoughtSignature`), 8 escenarios interactivos y uso de `agent-demo/run_demo.py`.
2. [04 · Secuencias de los 4 Escenarios Canónicos](/volumenes/04_SECUENCIA_DEMO_ESTADOS_Y_CASOS_DE_USO) — Verificación paso a paso de `ALLOW`, `DENY`, `REQUIRE_APPROVAL` y `DENY + Alert CRITICAL`.
3. [Modo Defensa, QR y Comandos Rápidos](/modo-presentacion) — Hoja de ruta operativa para proyectar y ejecutar la demo en vivo.

---

## 👥 Equipo SCRUM Oficial (ITU — UNCuyo, 2026)

Proyecto desarrollado para la cátedra **Desarrollo Web** (5.º Semestre — Tecnicatura Universitaria en Desarrollo de Software, **Instituto Tecnológico Universitario — Universidad Nacional de Cuyo**). Gestión ágil documentada en el [Tablero Oficial Trello SCRUM](https://trello.com/b/2Ay99TRz/agentguard-tablero-scrum-itu-2026).

| Integrante | Rol SCRUM y Especialidad | Responsabilidad en el Proyecto | Intervención en Defensa (~15 min) |
| :--- | :--- | :--- | :---: |
| **Agustín Belardinelli** | **Product Owner & Backend Core (PDP)** | Alcance funcional, visión Zero Trust fuera del LLM, motor determinista `PDPEngine` (5D Fail-Closed) y reglas de negocio. | **Slides 1, 2, 3 y 5** (`~4 min`) |
| **Juan Martín Battiato** | **Scrum Master & Frontend Core / HITL** | Facilitación ágil de sprints, bandeja HITL reactiva (`202 Accepted`), WebSockets multi-tenant, `SELECT ... FOR UPDATE`, alta B2B y matriz RBAC. | **Slides 7 y 8** (`~3 min`) |
| **Mateo Ortega** | **UI/UX Designer & Frontend / Consultante BI** | Diseño visual de las 9 vistas SPA en español (`labels.ts`), temas claro/oscuro, `QuickSetupWizard`, `PlaygroundView` y UX del Copiloto BI con Gemini 3.8 Flash. | **Slides 9 y 11** (`~3 min 30 s`) |
| **Jonathan Araujo** | **Backend Architecture, Gateway PEP, DB & ACME** | Arquitectura políglota (ADR-001..009), interceptor PEP REST, PostgreSQL 16 (13 tablas / 6 migraciones Alembic), ecosistema ACME Corp (`:9000`) y suite Zero-Regression. | **Slides 4, 6, 10 y 12** (`~4 min 30 s`) |

---

## 📚 Catálogo Navegable de los 11 Volúmenes Oficiales

| Código | Volumen Documental | Alcance Técnico Principal |
| :---: | :--- | :--- |
| **Índice** | [🧭 Índice Maestro y Guía de Navegación](/volumenes/INDICE_MAESTRO) | Taxonomía documental, los 5 itinerarios de evaluación, glosario canónico y matriz de trazabilidad código vs. documentación. |
| **00** | [🔍 Informe de Discrepancias: Doc Histórica vs. Código Real](/volumenes/00_INFORME_DISCREPANCIAS_DOC_VS_CODIGO_REAL) | Auditoría forense de 29 desfasajes históricos (7 críticos, 11 altos, 8 medios, 3 bajos) corregidos contra el repositorio real. |
| **Raíz** | [🛡️ Guía Maestra del Proyecto (README)](/volumenes/README) | Propuesta de valor Zero Trust, amenazas OWASP 2026, stack políglota, árbol completo del monorepositorio y guía de arranque local. |
| **ADRs** | [⚖️ Registro de Decisiones Arquitectónicas (ADR-001 a ADR-009)](/volumenes/DECISIONS) | Decisiones fundacionales: FastAPI async, PostgreSQL 13 tablas, Redis 7, PEP/PDP, RBAC, HITL 202, ACME SQLite y Gemini 3.8 Flash. |
| **01** | [🗄️ 01 · MER Relacional, Esquema Físico y Migraciones Alembic](/volumenes/01_MER_RELACIONAL_Y_FISICO_DB) | Las 13 tablas PostgreSQL 16 (`:5433`), PKs `gen_random_uuid()`, 24 FKs, 10 ENUMs, 4 índices GIN, 6 migraciones Alembic y 7 tablas SQLite ACME. |
| **02** | [📐 02 · MER Conceptual Notación Chen y Diccionario de Atributos](/volumenes/02_MER_CONCEPTUAL_CHEN_Y_ATRIBUTOS) | Diagrama Chen de 13 entidades + relación `AUTORIZADO_EN` (`agent_tools`), cardinalidades R1–R24, 96 atributos y cuestionario de defensa. |
| **03** | [⚙️ 03 · Arquitectura Runtime: Interceptor PEP, Motor PDP 5D y API REST](/volumenes/03_ARQUITECTURA_RUNTIME_PEP_PDP_Y_API_REST) | Ciclo de vida de `POST /gateway/execute`, evaluación 5D, sanitización `LLM06`, `ThreatDetector`, `selectinload` e inventario de 17 routers. |
| **04** | [🔄 04 · Secuencias Runtime, Diagramas de Estados y Casos de Uso](/volumenes/04_SECUENCIA_DEMO_ESTADOS_Y_CASOS_DE_USO) | Diagramas de secuencia de los 4 escenarios canónicos y Consultante BI, máquinas de estado (`Execution`, `Approval`, `Alert`) y UML de Casos de Uso. |
| **05** | [💻 05 · Manual de Frontend SPA (React 19), Matriz RBAC y Credenciales](/volumenes/05_MANUAL_FRONTEND_SPA_RBAC_Y_CREDENCIALES) | Arquitectura de las 9 vistas SPA, cero *silent fallbacks*, sesiones efímeras `SERVER_BOOT_ID`, matriz de 5 roles y cuentas demo `Acme Corp`. |
| **06** | [🏢 06 · Portal Empresarial ACME Corp, Consultante BI y CLI Agent Demo](/volumenes/06_PORTAL_ACME_CORP_CONSULTANTE_BI_Y_AGENT_DEMO) | Servidor `:9000`, inspector SQLite en vivo, auto-onboarding CEO, integración Google Gemini 3.8 Flash (`thoughtSignature`) y guía de `run_demo.py`. |
| **07** | [🎤 07 · Presentación Oficial en Canva (12 Slides) y Guion de Defensa](/volumenes/07_PRESENTACION_CANVA_Y_GUION_DEFENSA) | Ficha oficial de Canva (`DAHbl5SRXbM`), desglose técnico de las 12 diapositivas, guion cronometrado (`~15 min`) y respuestas ante preguntas del jurado. |

### 🔗 Accesos Oficiales Externos y Herramientas de Exposición
- 🖼️ **[Galería Interactiva 4K (27 Diagramas)](/galeria-diagramas)** — Buscador instantáneo, Modo Proyector con zoom/pan y descarga directa en SVG / PNG 4K Oscuro para Canva.
- 📱 **[Modo Defensa Académica & Código QR](/modo-presentacion)** — Generador QR en vivo para el tribunal, reparto de tiempos SCRUM y comandos rápidos de demo.
- 🎨 **[Presentación Oficial en Canva (12 Slides)](https://canva.link/59p7pjdurhxr1vk)** — Diseño panorámico `16:9` (`design_id: DAHbl5SRXbM`).
- 📋 **[Tablero Trello SCRUM (ITU 2026)](https://trello.com/b/2Ay99TRz/agentguard-tablero-scrum-itu-2026)** — Planificación de sprints, historias de usuario y seguimiento del equipo.
- 💻 **[Repositorio Oficial en GitHub (`jmbatiatto/AgentGuard`)](https://github.com/jmbatiatto/AgentGuard)** — Código fuente completo en rama `main`.
