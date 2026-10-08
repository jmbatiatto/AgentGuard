# 🌐 AgentGuard — Frontend (Dashboard Web SPA)

Panel de control, observabilidad y bandeja de aprobaciones reactivas en vivo (*Human-in-the-Loop*).

* **Responsables:** **Juan Martín Battiato** (SM / Frontend Core) & **Mateo Ortega** (Diseñador UI/UX & Frontend).
* **Stack:** React + Vite + TypeScript + CSS Moderno / Tailwind.
* **Vistas Principales:**
  1. **Panel de Políticas:** Configuración y orden de reglas deterministas (`ALLOW`, `DENY`, `REQUIRE_APPROVAL`).
  2. **Bandeja de Aprobaciones (Approvals Inbox):** Notificaciones en tiempo real vía WebSockets para resolver solicitudes de alto riesgo.
  3. **Trazas de Ejecución (Execution Traces):** Visualización de logs forenses correlacionados con filtros y estados de seguridad.
  4. **Playground / Simulador:** Entorno visual para disparar escenarios de prueba y demostración con un solo clic.
