# 🏛️ Registro de Decisiones Arquitectónicas (ADRs) — AgentGuard

Este documento registra formalmente las decisiones de arquitectura de software (Architecture Decision Records) adoptadas por el equipo de desarrollo de **AgentGuard**.  
Cualquier desarrollador o agente de inteligencia artificial (Antigravity, Cursor, Copilot, etc.) **debe consultar y respetar estas decisiones** antes de proponer cambios estructurales en el código.

---

## 📋 Índice de Decisiones

* [ADR-001: Adopción de Fullstack TypeScript (Node.js) y pnpm como Package Manager](#adr-001-adopción-de-fullstack-typescript-nodejs-y-pnpm-como-package-manager)
* [ADR-002: Estructura Monorepo y Distribución Modular de Carpetas](#adr-002-estructura-monorepo-y-distribución-modular-de-carpetas)
* [ADR-003: Supresión de MCP y Estandarización en Protocolo HTTP REST Puro](#adr-003-supresión-de-mcp-y-estandarización-en-protocolo-http-rest-puro)
* [ADR-004: Modelo Relacional Multi-Tenant con Identificadores UUID v4 e Índices JSONB](#adr-004-modelo-relacional-multi-tenant-con-identificadores-uuid-v4-e-índices-jsonb)

---

## ADR-001: Adopción de Fullstack TypeScript (Node.js) y pnpm como Package Manager

* **Estado:** ✅ Aceptado / En vigor
* **Fecha:** Octubre 2026
* **Decisores:** Equipo de Desarrollo (Agustín Belardinelli, Juan Martín Battiato, Mateo Ortega, Jonathan Araujo)

### 1. Contexto y Problema
En la definición de la arquitectura web para el 5to semestre (ITU - UNCUYO), se evaluaron dos alternativas para el backend:
1. **Python con FastAPI:** Ventajoso para prototipado rápido de IA y tipado Pydantic.
2. **Node.js con TypeScript (Express o Fastify):** Unifica el lenguaje entre el frontend (React SPA) y el backend.

### 2. Decisión Tomada
Se resolvió **adoptar TypeScript de forma uniforme en todo el stack (Fullstack TypeScript)** bajo el runtime **Node.js (versión 20+ LTS o 24+)**, utilizando **`pnpm`** como gestor de paquetes y monorepositorio.

### 3. Justificación Técnica
1. **Tipado de Extremo a Extremo (End-to-End Type Safety):** Permite compartir contratos, DTOs e interfaces de dominio (`Agent`, `ToolAction`, `PolicyRule`, `ExecutionTrace`, `ApprovalTicket`) entre el backend y el dashboard web sin duplicar definiciones.
2. **Menor Carga Cognitiva:** Los 4 integrantes del equipo trabajan sobre la misma sintaxis, tooling (ESLint, Prettier, tsconfig) y ecosistema npm.
3. **Eficiencia Superior con `pnpm`:**  
   * **Ahorro de espacio y velocidad:** Utiliza un almacén de contenido direccionable por contenido (*hard links*) que evita duplicar gigabytes de `node_modules`.
   * **Monorepositorios Nativos:** El soporte de workspaces de `pnpm` permite gestionar `backend`, `frontend` y utilidades compartidas con comandos atómicos (`pnpm --filter backend dev`).
   * **Determinismo Estricto:** Evita dependencias fantasmas (*phantom dependencies*), problema común en `npm` tradicional.

### 4. Consecuencias
* **Positivas:** Máxima velocidad de desarrollo en equipo, contratos unificados, despliegues y scripts coordinados.
* **A considerar:** Se requiere configurar `pnpm-workspace.yaml` y mantener las versiones de Node.js sincronizadas mediante `.nvmrc` o `engines` en `package.json`.

---

## ADR-002: Estructura Monorepo y Distribución Modular de Carpetas

* **Estado:** ✅ Aceptado / En vigor
* **Fecha:** Octubre 2026

### 1. Contexto y Problema
El repositorio albergaba originalmente archivos de documentación y scripts en la raíz. Para comenzar a codificar sin mezclar código fuente con diagramas y guías de defensa, se requería una estructura limpia y orientada a los roles del equipo.

### 2. Decisión Tomada
Se adoptó una estructura modular monorepo organizada por paquetes de trabajo:
```text
AgentGuard/
├── backend/              # API REST (Gestión + Gateway PEP + Motor PDP) [Node.js + TS]
├── frontend/             # Dashboard Web SPA (Auditoría, Políticas, Approvals) [React + Vite + TS]
├── agent-demo/           # Script cliente autónomo del Agente para la demo [Node.js / TS]
├── diagramas/            # Archivos vectoriales de respaldo de Draw.io (*.drawio)
├── scripts/              # Utilidades de mantenimiento, regeneración y seeds
├── pnpm-workspace.yaml   # Configuración de workspaces de pnpm
├── package.json          # Root package.json con scripts unificados
└── *.md                  # Suite de documentación, guías de defensa y reglas de dominio
```

### 3. Asignación por Paquete
* **`backend/`:** Agustín Belardinelli (PO / Motor PDP) & Jonathan Araujo (Gateway PEP / Persistencia).
* **`frontend/`:** Juan Martín Battiato (SM / Integración) & Mateo Ortega (Diseño UI/UX / Componentes).
* **`agent-demo/`:** Módulo transversal para simular el cliente que dispara las llamadas en los 4 escenarios de la defensa.

---

## ADR-003: Supresión de MCP y Estandarización en Protocolo HTTP REST Puro

* **Estado:** ✅ Aceptado / En vigor
* **Fecha:** Octubre 2026

### 1. Contexto y Problema
El protocolo MCP (*Model Context Protocol*) de Anthropic introduce complejidad de transporte (stdio, WebSockets dedicados, SSE y serialización JSON-RPC específica) que no forma parte de los contenidos evaluados por la cátedra de Desarrollo Web y aumenta el riesgo de fallas durante una demostración en vivo.

### 2. Decisión Tomada
Se eliminó MCP de toda la arquitectura de AgentGuard. La plataforma opera **100% sobre llamadas HTTP REST estándar**:
* El agente de IA propone una acción y ejecuta un `fetch()` HTTP POST hacia el Gateway de AgentGuard (`POST /api/gateway/execute`).
* Si la política autoriza (`ALLOW`), el Gateway reenvía la petición mediante una llamada HTTP REST estándar (JSON) hacia la API de destino (ej. CRM, Stripe, API interna).
* Si la política deniega (`DENY`), el Gateway corta la conexión y devuelve HTTP `403 Forbidden`.

---

## ADR-004: Modelo Relacional Multi-Tenant con Identificadores UUID v4 e Índices JSONB

* **Estado:** ✅ Aceptado / En vigor
* **Fecha:** Octubre 2026

### 1. Decisión Tomada
La persistencia de datos utiliza **PostgreSQL** bajo un esquema compartido con discriminador de tenant (`organization_id`), claves primarias basadas en **UUID v4** y almacenamiento de predicados lógicos y contextos de sesión en columnas **`JSONB`** indexadas mediante **GIN**.

### 2. Justificación Técnica
* Previene ataques IDOR (*Insecure Direct Object References*).
* Permite generación de identificadores descentralizada sin colisiones.
* Combina integridad referencial relacional rígida (12 tablas) con la flexibilidad necesaria para evaluar condiciones dinámicas en tiempo real sin caer en antipatrones de diseño como EAV (*Entity-Attribute-Value*).
