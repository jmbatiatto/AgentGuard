# ⚡ Protocolo de Eficiencia Multi-Agente y Economía de Tokens (Lean Teamwork)

Regla obligatoria para toda ejecución de `/teamwork`, sub-agentes o tareas multi-equipo en **AgentGuard**.

## 1. Saltear Explorers usando Graphify (Cero Redundancia)
- Habiéndose ejecutado `graphify update .`, el mapa arquitectónico, dependencias, rutas y modelos residen en `graphify-out/graph.json`.
- **PROHIBIDO** instanciar subagentes exploradores genéricos (*Explorers*) para relevar archivos o contratos que el grafo ya conoce.
- El Orquestador consulta `graphify` directamente para armar la especificación (SDD) a costo cero.
- Los exploradores quedan estrictamente reservados para reproducir o aislar errores lógicos profundos de difícil diagnóstico.

## 2. Alcance Consolidado del Worker (Incremento Atómico Completo)
- **PROHIBIDO** desplegar un subagente por cada archivo individual (evitar el impuesto de inicialización y lectura de directivas).
- Cada Worker se asigna a un **incremento atómico completo** (ej. servicio backend + router FastAPI + archivo de prueba `pytest`, o componente frontend + tipos + validación `tsc`).
- El Worker implementa el código, escribe la prueba y la deja pasando en verde antes de entregar.

## 3. Cero Reviewers Intermedios (Auditoría Semántica en Git Diff)
- No instanciar subagentes *Reviewers* intermedios para validaciones mecánicas.
- La sintaxis y el tipado se validan gratis en la terminal del propio Worker (`pnpm run build` o `tsc --noEmit`).
- La revisión semántica de calidad (respeto de `organization_id`, blindaje del *Control Plane* contra agentes de IA, textos en español y ausencia de fallbacks silenciosos) se consolida al cierre mediante inspección directa de `git diff`.

## 4. Poda del Victory Auditor y Pytest Silencioso
- **Suprimir la Fase A (Proveniencia de Git):** No gastar llamadas a herramientas auditando marcas de tiempo ni commits locales.
- **Salida Silenciosa de Pytest:** Ejecutar siempre las pruebas con modificadores concisos:
  ```bash
  pytest -q --tb=short --no-header
  ```
  Esto reduce la salida de 150 líneas verborrágicas a 2 líneas limpias en la ventana de contexto.
- **Auditoría Quirúrgica sobre `git diff`:** El Auditor solo audita el `git diff` acumulado (verificando anti-hardcoding, multi-tenant y seguridad) y re-ejecuta en modo silencioso los 4 escenarios de la demo (`test_gateway_scenarios.py`) antes de emitir `VICTORY CONFIRMED`.

