# 🎨 Especificación de Mejoras de Frontend: Presenter Tour & Live Demo Runner

**Destinatarios:** Juan Martín Battiato (*Scrum Master & Frontend Core*) & Mateo Ortega (*Diseñador UI/UX & Frontend*)  
**Autor:** Jonathan Araujo (*Backend Architecture & Gateway*)  
**Fecha:** Octubre 2026  
**Contexto Institucional:** Cátedra de Desarrollo Web — ITU UNCUYO (AgentGuard v2.0)  

---

## 📌 1. Objetivo y Visión General
Para la defensa final ante el profesor y evaluadores de la cátedra, necesitamos que la navegación por los 4 escenarios de la demo en el [PlaygroundView](file:///c:/Users/jonat/Downloads/Codigos/AgentGuard/frontend/src/views/PlaygroundView.tsx) sea **guiada, secuencial y pedagógicamente impactante**.

Actualmente, el Playground cuenta con 4 botones independientes. Proponemos enriquecerlo con un **"Modo Presenter Tour / Live Demo Runner"** tipo Wizard interactivo que lleve al evaluador paso a paso a través de la secuencia oficial definida en [`agentguard_secuencia_demo.md`](file:///c:/Users/jonat/Downloads/Codigos/AgentGuard/agentguard_secuencia_demo.md).

---

## 🧭 2. Flujo del Wizard de Presentación (4 Pasos Guiados)

El componente puede implementarse en la parte superior del Playground o como un modo conmutable mediante un toggle: `[Modo Libre] / [Modo Presenter Tour]`.

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│ 🚀 MODO PRESENTER: PASO 3 DE 4 — INTERVENCIÓN HUMANA HITL (Escenario 3)     │
│ [● 1. ALLOW] ─── [● 2. DENY] ─── [◉ 3. HITL] ─── [○ 4. ALERTA SIEM]         │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Paso 1: Cotización Legítima (ALLOW)
- **Agente:** `sales-agent` (`33333333-3333-3333-3333-333333333301`)
- **Herramienta & Acción:** `crm` ➔ `create_quote` ($2,500).
- **Resultado Esperado:** 200 OK — Decisión `ALLOW`.
- **Explicación para el Docente:** Demuestra que las operaciones comerciales dentro del umbral autónomo ($10,000) no sufren fricción ni latencia perceptible (<25ms).

### Paso 2: Abuso de Privilegio / Falta de Capacidad (DENY)
- **Agente:** `customer-support-agent`
- **Herramienta & Acción:** `product-catalog` ➔ `update_price`.
- **Resultado Esperado:** 403 Forbidden — Decisión `DENY` (Agent lacks capability en tabla `agent_tools`).
- **Explicación para el Docente:** Principio de Mínimo Privilegio. Aunque el agente tenga conexión al Gateway, no puede invocar herramientas para las que no tiene relación explícita activa en `AgentTool`.

### Paso 3: Operación Financiera Sensible (REQUIRE_APPROVAL - HITL)
- **Agente:** `sales-agent`
- **Herramienta & Acción:** `stripe` ➔ `refund` ($8,500).
- **Resultado Esperado:** 202 Accepted — Decisión `REQUIRE_APPROVAL`.
- **Interacción Clave del Frontend sugerida para Juan Martín y Mateo:**
  - Mostrar un botón destacado: **«Ir a Bandeja de Aprobaciones HITL (Elena Rostova)»**.
  - Al hacer clic, redirigir a [ApprovalsView](file:///c:/Users/jonat/Downloads/Codigos/AgentGuard/frontend/src/views/ApprovalsView.tsx), abrir el ticket generado en vivo y permitir que el docente vea cómo el usuario con rol `APPROVER` aprueba la solicitud.

### Paso 4: Intento de Exfiltración / Inyección de Prompt (DENY + ALERTA SIEM)
- **Agente:** `sales-agent`
- **Herramienta & Acción:** `crm` ➔ `export_customers` a `https://attacker.io/leak`.
- **Resultado Esperado:** 403 Forbidden — Decisión `DENY` + Generación automática de `Alert` crítica.
- **Explicación para el Docente:** Demuestra la postura *Fail-Closed* y la emisión de incidentes en tiempo real vía WebSockets hacia la campanita del Header y la pestaña de Alertas.

---

## 💡 3. Componentes y Estados Sugeridos para la Implementación en React

1. **Estado en `PlaygroundView.tsx`:**
   ```tsx
   const [isPresenterMode, setIsPresenterMode] = useState<boolean>(true);
   const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);
   ```

2. **Stepper / Barra de Progreso:**
   - Un componente `TourStepper.tsx` con badges numerados, checkmarks verdes en los pasos completados y efecto *glow* en el paso activo.
   - Botones «Anterior», «Ejecutar Paso Actual» y «Siguiente Escenario».

3. **Tarjeta Explicativa de Arquitectura (Callout Pedagógico):**
   - Mostrar qué tabla de la base de datos se consulta (`policies`, `policy_rules`, `agent_tools`), qué regla se evalúa y cuál es la referencia de seguridad según el modelo de amenazas (OWASP Top 10 for Agentic Applications 2026).

4. **Botón de Reset Directo:**
   - Aprovechar el nuevo modal [`ResetDemoModal.tsx`](file:///c:/Users/jonat/Downloads/Codigos/AgentGuard/frontend/src/components/ResetDemoModal.tsx) para que, al finalizar el Paso 4, el docente pueda presionar «Reiniciar Demo para Nueva Prueba» con un solo clic.

---

## 🤝 4. Distribución de Tareas del Equipo

- **Juan Martín Battiato:** Lógica del Stepper, persistencia de estado del paso actual y redirección profunda con preservación de contexto entre Playground y Approvals.
- **Mateo Ortega:** Diseño visual de la tarjeta del Tour, micro-animaciones en las transiciones de pasos y badges estilizados para los veredictos (`ALLOW`, `DENY`, `HITL`).
- **Jonathan Araujo (Backend & Gateway):** Ya se encuentran listos todos los endpoints en FastAPI (`/api/v1/gateway/execute`, `/api/v1/approvals`, `/api/v1/alerts`, `/api/v1/demo/reset`) y la suite de pruebas automatizadas en `backend/tests/test_gateway_scenarios.py`.

Cualquier duda o ajuste en los contratos JSON de la API, lo coordinamos de inmediato.
