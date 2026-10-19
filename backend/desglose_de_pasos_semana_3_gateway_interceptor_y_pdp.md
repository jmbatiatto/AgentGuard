# 🛡️ Desglose de Pasos: Semana 3 - El Gateway Interceptor (PEP) y el Motor de Políticas (PDP)

> **Documento de Especificación Técnica y Justificación para la Defensa Académica**  
> **Módulo:** `backend/`  
> **Proyecto:** AgentGuard - Runtime Authorization & Governance for AI Agents  
> **Cátedra:** Desarrollo Web (5to Semestre) - ITU / Universidad Nacional de Cuyo  
> **Autores / Responsables:** Jonathan Araujo (Arquitectura Backend & Gateway PEP) & Agustín Belardinelli (PO & Motor PDP)  
> **Estado:** ✅ 100% COMPLETADO Y CERTIFICADO (100 Tests en Verde)  

---

## 🎯 Resumen Ejecutivo de Entrega de la Semana 3

Durante esta semana se implementó y certificó con éxito el **núcleo crítico de tiempo de ejecución (*runtime*)** de AgentGuard, compuesto por:
1. **Interceptor en Tiempo de Ejecución (PEP):** Intercepta de forma transparente las llamadas de herramientas de los agentes en el endpoint `POST /api/v1/gateway/execute`.
2. **Motor Determinista de Autorización Contextual (PDP):** Evalúa la tupla 5D (`Principal`, `Delegator`, `Action`, `Resource`, `Context`) con operadores JSONB (`eq`, `neq`, `gt`, `gte`, `lt`, `lte`, `in`, `not_in`, `contains`) y garantía estricta **Fail-Closed**.
3. **Servicio de Sanitización y Enmascaramiento OWASP LLM06:** Enmascara secretos, tokens Bearer y números de tarjetas de crédito previo a su persistencia en trazas forenses.
4. **Bandeja de Aprobaciones Human-in-the-Loop (HITL):** Endpoints `/api/v1/approvals` y `/resolve` para que un operador humano valide o rechace ejecuciones suspendidas.
5. **Certificación Automatizada de los 4 Escenarios de la Demo Oficial:** Suite de pruebas en `test_gateway_scenarios.py` que garantiza cero regresiones para la presentación ante el tribunal académico.

---

## 📊 Matriz de Entregables y Estado Final

| Paso | Entregable / Archivo | Capa | Estado | Commit / Certificación |
| :---: | :--- | :--- | :---: | :--- |
| **Paso 1** | `app/schemas/gateway.py`<br/>`app/schemas/approval.py`<br/>`app/schemas/alert.py` | Schemas Pydantic v2 | ✅ Completado | `7823eb7` (Schemas de Runtime) |
| **Paso 2** | `app/services/pdp_engine.py`<br/>`tests/test_pdp_engine.py` | Servicio PDP | ✅ Completado | `d304303` (Motor Determinista PDP) |
| **Paso 3** | `app/services/sanitizer_service.py`<br/>`tests/test_sanitizer_service.py` | Seguridad OWASP | ✅ Completado | `871f182` (Sanitización y Enmascaramiento) |
| **Paso 4** | `app/services/pep_gateway_service.py`<br/>`tests/test_pep_gateway_service.py` | Servicio PEP | ✅ Completado | `72cea2f` (Servicio PEP Interceptor) |
| **Paso 5** | `app/api/gateway.py`<br/>`app/api/approvals.py`<br/>`tests/test_gateway_api.py`<br/>`tests/test_approvals_api.py` | Routers REST | ✅ Completado | `c826bbc` (Routers REST Gateway y Approvals) |
| **Paso 6** | `tests/test_gateway_scenarios.py` | Testing Integración | ✅ Completado | `fcf308e` (Certificación 4 Escenarios Demo) |
| **Paso 7** | Documentación y Cierre de Semana 3 | Documentación | ✅ Completado | Cierre y sincronización con `origin/main` |

---

## 🧪 Métricas de Calidad y Cobertura (Pytest)

* **Total de Pruebas Automatizadas:** **100 tests PASSED / 100 tests TOTAL** (100% verde).
* **Tiempo de Ejecución de Suite Completa:** ~11 segundos.
* **Regresiones:** **0 regresiones** (Cumplimiento riguroso de la regla innegociable de `AGENTS.md`).

---

## 🛡️ Certificación de los 4 Escenarios de la Demo ante el Tribunal

| Escenario | Acción Invocada | Condición / Regla | Decisión PDP | Estado HTTP / Ejecución | Resultado Observable |
| :---: | :--- | :--- | :---: | :---: | :--- |
| **1. Operación Normal** | `create_quote` | Monto $2,500 < $10,000 | `ALLOW` | `200 OK`<br/>`EXECUTED` | Despacho exitoso a API externa destino y traza forense persistida. |
| **2. Abuso de Privilegio** | `update_price` | Agente carece de capability en `agent_tools` | `DENY` | `403 Forbidden`<br/>`REJECTED` | Bloqueado en seco en el Gateway; la llamada NUNCA alcanza el backend destino. |
| **3. Operación de Alto Impacto** | `refund` | Monto $4,500 >= $500 | `REQUIRE_APPROVAL` | `202 Accepted`<br/>`PENDING_APPROVAL` | Suspensión de llamada, creación de ticket en bandeja HITL y resolución favorable posterior a `EXECUTED`. |
| **4. Prompt Injection & Ataque** | `export_customers` | Destino no homologado `https://attacker.io` | `DENY` | `403 Forbidden`<br/>`REJECTED` | Bloqueo perimetral y generación automática de `Alert` con severidad `CRITICAL`. |

---

## 🎓 Conclusión y Próximos Pasos (Semana 4)

Con la finalización de la **Semana 3**, el backend de AgentGuard cuenta con su motor central y su interceptor completamente operativos, auditables y testeados.

Para la **Semana 4**, el equipo se enfocará en:
1. **Canales en Tiempo Real (WebSockets):** Notificaciones instantáneas de tickets `Approval` y eventos `Alert` hacia el frontend React.
2. **Dashboard de Auditoría y Forense en Frontend:** Conexión de las 7 vistas de Juan Martín con los endpoints REST del backend.
3. **Script Cliente Autónomo (`agent-demo/`):** Preparación del cliente de prueba que ejecutará los 4 escenarios de forma automatizada durante la presentación en vivo.
