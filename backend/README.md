# ⚙️ AgentGuard — Backend (API REST & Gateway PEP/PDP)

Módulo central de autorización, gobernanza y persistencia en tiempo de ejecución de AgentGuard.

* **Responsables:** **Agustín Belardinelli** (PO / Motor PDP) & **Jonathan Araujo** (Gateway PEP / Persistencia).
* **Stack:** Node.js (TypeScript) + Express / Fastify + PostgreSQL (pg / drizzle o prisma) + Redis (ioredis).
* **Arquitectura:**
  1. **API de Gestión:** Rutas CRUD administrativas (`/api/organizations`, `/api/agents`, `/api/policies`, `/api/traces`, `/api/approvals`).
  2. **Agent Runtime Gateway (PEP):** Endpoint de interceptación en tiempo real (`POST /api/gateway/execute`).
  3. **Motor de Políticas (PDP):** Evaluador determinista de condiciones `JSONB` sobre tuplas de 5 dimensiones con caché Redis.
