# 🤖 AgentGuard — Agent Demo (Script de Prueba y Simulación)

Script cliente diseñado para la demostración en vivo ante el tribunal y la cátedra de Desarrollo Web.

* **Propósito:** Demostrar la diferencia tangible entre **"SIN AgentGuard (El Desastre)"** vs **"CON AgentGuard (La Gobernanza en Tiempo Real)"**.
* **Stack:** Node.js / TypeScript (consumiendo Gemini API o cliente simulado con llamadas HTTP REST).
* **Los 4 Escenarios Demostrables:**
  1. `create_quote` ($2,500) $\rightarrow$ **`ALLOW`** (operación legítima aprobada).
  2. `update_price` ($10) $\rightarrow$ **`DENY`** (intento de abuso bloqueado en seco).
  3. `refund` ($4,500) $\rightarrow$ **`REQUIRE_APPROVAL`** (congelada a la espera de autorización humana).
  4. `export_customers` (url externa) $\rightarrow$ **`DENY + CRITICAL ALERT`** (intento de inyección/exfiltración neutralizado).
