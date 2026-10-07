# 📦 01-Product — Especificación de Producto y Requisitos (v2.0)

Este directorio contiene la documentación formal del producto **AgentGuard: Runtime Authorization & Governance for AI Agents**, estructurada de acuerdo a metodologías de ingeniería de requisitos de software (SRS) y marcos ágiles (Scrum).

---

## 📑 Índice de Documentos

| Documento | Formatos | Propósito y Contenido |
| :--- | :---: | :--- |
| **Product Brief** | [`product-brief.md`](./product-brief.md) • [`product-brief.docx`](./product-brief.docx) | Visión del producto, tesis central («IAM responde quién eres; AgentGuard decide qué puedes hacer ahora»), análisis de mercado (CSA 2026), modelo de amenazas (OWASP Agentic 2026) y alcance del MVP. |
| **Requisitos de Software (SRS)** | [`requirements.md`](./requirements.md) • [`requirements.docx`](./requirements.docx) | Especificación formal de requisitos funcionales (`RF-01` a `RF-12`) organizados en 4 módulos, y requisitos no funcionales (`RNF-01` a `RNF-06`) con priorización MoSCoW. |
| **Casos de Uso del Sistema** | [`use-cases.md`](./use-cases.md) • [`use-cases.docx`](./use-cases.docx) | Especificación detallada de casos de uso (`CU-01` a `CU-10`) con precondiciones, flujos principales, flujos alternativos y postcondiciones. |
| **Historias de Usuario (Backlog)** | [`user-stories.md`](./user-stories.md) • [`user-stories.docx`](./user-stories.docx) | Product Backlog ágil con historias de usuario (`HU-01` a `HU-10`), criterios de aceptación en formato Gherkin (Given-When-Then), estimación en Story Points y priorización MoSCoW. |
| **Dossier Consolidado de Producto** | [`AgentGuard_Documentacion_Producto_Completa.docx`](./AgentGuard_Documentacion_Producto_Completa.docx) | Documento unificado en formato Word que reúne los 4 documentos anteriores en un único archivo listo para entrega o impresión. |

---

## 👥 Roles del Sistema Definidos

1. **`ADMIN`**: Administrador de la organización tenant. Configura políticas, da de alta agentes y herramientas, y gestiona accesos.
2. **`OPERATOR`**: Operador de seguridad. Monitorea ejecuciones en tiempo real, analiza el dashboard y simula pruebas en el Playground.
3. **`APPROVER`**: Aprobador humano (HITL). Interviene en solicitudes de alto riesgo para conceder o denegar la ejecución (`ALLOW`/`DENY`).
4. **`Agente IA (Principal)`**: Entidad autónoma de IA que solicita la ejecución de herramientas en runtime.
