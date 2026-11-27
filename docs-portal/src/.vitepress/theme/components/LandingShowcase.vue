<script setup lang="ts">
import { withBase } from 'vitepress'

interface ProofMetric {
  value: string
  label: string
  detail: string
}

interface ContrastRow {
  vector: string
  tag: string
  withoutGuard: string
  withGuard: string
}

interface EnterpriseCapability {
  id: string
  span: 'wide' | 'narrow' | 'half'
  spec: string
  title: string
  description: string
  highlights: string[]
  tone: 'emerald' | 'amber' | 'rose' | 'cyan'
}

const proofMetrics: ProofMetric[] = [
  {
    value: '< 90 ms',
    label: 'Latencia PEP/PDP',
    detail: 'Caché de políticas con Redis 7'
  },
  {
    value: '5D Fail-Closed',
    label: 'Motor Determinista',
    detail: 'DENY ante ambigüedad o caída'
  },
  {
    value: 'OWASP 2026',
    label: 'ASI01–ASI05 y LLM06',
    detail: 'Detección y sanitización nativa'
  },
  {
    value: 'Multi-LLM',
    label: 'Agnóstico al modelo',
    detail: 'Gemini 2.5, OpenAI, Groq y Anthropic'
  },
  {
    value: '330 Tests',
    label: 'Suite Zero-Regression',
    detail: '4 escenarios críticos siempre en verde'
  }
]

const contrastRows: ContrastRow[] = [
  {
    vector: 'Prompt Injection',
    tag: 'OWASP ASI01',
    withoutGuard:
      'El modelo procesa instrucciones ocultas en tickets, correos o parámetros externos y dispara acciones fuera de alcance.',
    withGuard:
      'ThreatDetector y el PDP evalúan la intención fuera del LLM y bloquean con HTTP 403 antes de contactar a la API destino.'
  },
  {
    vector: 'Fuga de secretos y PII',
    tag: 'OWASP LLM06',
    withoutGuard:
      'Tokens Bearer, API keys, tarjetas o datos fiscales quedan registrados en texto plano en trazas y respuestas intermedias.',
    withGuard:
      'SanitizerService enmascara recursivamente credenciales y PII antes de persistir request_context en PostgreSQL 16.'
  },
  {
    vector: 'Mutaciones destructivas en ERP',
    tag: 'OWASP ASI05',
    withoutGuard:
      'Un agente con credenciales de servicio compartidas puede rebajar precios del catálogo o borrar tablas completas en SQL.',
    withGuard:
      'Control granular N:N en AgentTool y ToolAction por nivel de riesgo; toda capacidad no asignada falla cerrado en el PEP.'
  },
  {
    vector: 'Reembolsos sin supervisión humana',
    tag: 'Control HITL',
    withoutGuard:
      'Operaciones financieras de alto impacto (>= $500 USD) se liquidan de inmediato sin revisión ni trazabilidad de aprobación.',
    withGuard:
      'El PDP devuelve REQUIRE_APPROVAL (HTTP 202), abre un ticket HITL con TTL de 900 s y exige resolución de un rol APPROVER.'
  }
]

const capabilities: EnterpriseCapability[] = [
  {
    id: 'pdp-5d',
    span: 'wide',
    spec: 'POST /api/v1/gateway/execute',
    title: 'Motor PDP 5D Fail-Closed fuera del LLM',
    description:
      'Cada llamada de herramienta se evalúa de forma determinista sobre cinco dimensiones: Agente, Delegador, Acción Atómica, Recurso y Contexto JSONB. Si no existe coincidencia explícita, hay empate de prioridades o falla una dependencia, el veredicto siempre es DENY.',
    highlights: ['Evaluación < 90 ms', 'Prioridad determinista', 'Cero confianza en el prompt'],
    tone: 'emerald'
  },
  {
    id: 'hitl-queue',
    span: 'narrow',
    spec: 'HTTP 202 + SELECT ... FOR UPDATE',
    title: 'Bandeja HITL asíncrona en tiempo real',
    description:
      'Suspende operaciones sensibles sin bloquear hilos del agente, emite notificaciones por WebSockets multi-tenant y resuelve aprobaciones humanas con bloqueo pesimista y expiración automática de 900 segundos.',
    highlights: ['TTL 900 s', 'Solo rol APPROVER', 'Sin condiciones de carrera'],
    tone: 'amber'
  },
  {
    id: 'owasp-shield',
    span: 'narrow',
    spec: 'OWASP ASI01–ASI05 y LLM06',
    title: 'Sanitización LLM06 y ThreatDetector',
    description:
      'Neutraliza prompt injection, exfiltración C2, evasión Base64 y sabotaje SQL antes del despacho HTTP. Enmascara automáticamente tokens Bearer, API keys y PII antes de escribir cualquier traza.',
    highlights: ['Alertas CRITICAL', 'Redacción recursiva', 'Bloqueo preventivo'],
    tone: 'rose'
  },
  {
    id: 'multi-tenant',
    span: 'wide',
    spec: 'PostgreSQL 16 · 13 tablas UUID v4',
    title: 'Multi-tenancy aislado y blindaje del Control Plane',
    description:
      'Todas las consultas y mutaciones filtran obligatoriamente por organization_id con claves primarias UUID v4 e índices GIN en JSONB. El Control Plane rechaza cabeceras X-Agent-Id con 403 Forbidden y aplica 5 roles RBAC humanos.',
    highlights: ['Anti-IDOR estricto', 'Rechazo 403 a X-Agent-Id', '5 roles RBAC'],
    tone: 'cyan'
  },
  {
    id: 'sandbox-llm',
    span: 'half',
    spec: 'ACME Corp :9000 + Handshake Multi-LLM',
    title: 'Sandbox empresarial real y Handshake Universal Multi-LLM',
    description:
      'Valida agentes reales sobre el portal satélite ACME Corp con SQLite, detección automática de modelos (Gemini 2.5, OpenAI, Groq y Anthropic) y telemetría de reloj real separando tiempo del LLM frente a latencia del PEP/PDP.',
    highlights: ['Modo Protegido vs Directo', 'Autodescubrimiento de modelos', 'Telemetría LLM vs PEP'],
    tone: 'cyan'
  },
  {
    id: 'forensics',
    span: 'half',
    spec: 'executions + audit_events',
    title: 'Auditoría forense inmutable de extremo a extremo',
    description:
      'Registra cada decisión runtime en executions con latency_ms medida por reloj monotónico y la regla exacta aplicada, junto con un historial append-only en audit_events para toda mutación administrativa.',
    highlights: ['Latencia real medida', 'Historial append-only', 'Trazabilidad de regla exacta'],
    tone: 'emerald'
  }
]
</script>

<template>
  <div class="ag-showcase">
    <!-- Hero dividido above-the-fold -->
    <section id="inicio-hero" class="ag-hero" aria-labelledby="ag-hero-title">
      <div class="ag-hero-grid">
        <div class="ag-hero-copy">
          <div class="ag-hero-kicker">
            <span class="ag-status-dot" aria-hidden="true" />
            <span>Gobernanza Zero Trust en Runtime para Agentes de IA</span>
          </div>

          <h1 id="ag-hero-title" class="ag-hero-title">
            IAM responde quién eres. AgentGuard decide qué puede hacer tu agente ahora.
          </h1>

          <p class="ag-hero-lead">
            Capa determinista PEP/PDP fuera del LLM que intercepta cada invocación REST antes de
            tocar APIs críticas, ERP o bases de datos. Fail-closed por diseño, aprobación humana en
            vivo y trazabilidad forense inmutable.
          </p>

          <div class="ag-hero-actions">
            <a href="#instalacion-local" class="ag-cta ag-cta--primary">
              <svg
                class="ag-icon"
                viewBox="0 0 20 20"
                fill="none"
                stroke="currentColor"
                stroke-width="1.75"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
              >
                <polyline points="4 14 8 10 4 6" />
                <line x1="10" y1="14" x2="16" y2="14" />
              </svg>
              <span>Instalar en local en 2 min</span>
            </a>

            <a href="#simulador-pdp" class="ag-cta ag-cta--secondary">
              <svg
                class="ag-icon"
                viewBox="0 0 20 20"
                fill="none"
                stroke="currentColor"
                stroke-width="1.75"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
              >
                <path d="M10 2.5L4 5v4.5c0 3.7 2.55 6.95 6 8 3.45-1.05 6-4.3 6-8V5l-6-2.5z" />
                <polyline points="7.5 10.2 9.3 12 12.8 8.3" />
              </svg>
              <span>Probar simulador PDP</span>
            </a>

            <a
              :href="withBase('/volumenes/INDICE_MAESTRO')"
              class="ag-cta-link"
            >
              <span>Explorar documentación técnica</span>
              <svg
                class="ag-icon ag-icon--sm"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                stroke-width="1.75"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
              >
                <line x1="3.5" y1="8" x2="12.5" y2="8" />
                <polyline points="8.5 4 12.5 8 8.5 12" />
              </svg>
            </a>
          </div>
        </div>

        <div id="video-demo" class="ag-hero-media">
          <ProductReelPlayer :compact="false" />
        </div>
      </div>

      <!-- Barra de evidencia técnica verificada -->
      <div class="ag-proof-bar" role="list" aria-label="Métricas verificadas de ingeniería">
        <div v-for="metric in proofMetrics" :key="metric.value" class="ag-proof-item" role="listitem">
          <span class="ag-proof-value">{{ metric.value }}</span>
          <span class="ag-proof-label">{{ metric.label }}</span>
          <span class="ag-proof-detail">{{ metric.detail }}</span>
        </div>
      </div>
    </section>

    <!-- Contraste arquitectónico: Sin protección vs Con AgentGuard -->
    <section class="ag-section ag-contrast" aria-labelledby="ag-contrast-title">
      <div class="ag-section-head">
        <h2 id="ag-contrast-title" class="ag-section-heading">
          Por qué los prompts y el IAM tradicional no alcanzan
        </h2>
        <p class="ag-section-sub">
          Un token IAM demuestra identidad estática, pero no evalúa parámetros de negocio ni frena
          un modelo manipulado. Compará el comportamiento frente a cuatro vectores reales.
        </p>
      </div>

      <div class="ag-contrast-shell">
        <div class="ag-contrast-columns-head" aria-hidden="true">
          <div class="ag-contrast-col-label">Vector de riesgo</div>
          <div class="ag-contrast-col-label ag-contrast-col-label--risk">
            <svg
              class="ag-icon ag-icon--sm"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <circle cx="8" cy="8" r="6.2" />
              <line x1="5.6" y1="5.6" x2="10.4" y2="10.4" />
              <line x1="10.4" y1="5.6" x2="5.6" y2="10.4" />
            </svg>
            <span>Agente sin AgentGuard (Confianza implícita en el LLM)</span>
          </div>
          <div class="ag-contrast-col-label ag-contrast-col-label--safe">
            <svg
              class="ag-icon ag-icon--sm"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M8 1.8L3 3.9v3.8c0 3 2.1 5.6 5 6.5 2.9-.9 5-3.5 5-6.5V3.9L8 1.8z" />
              <polyline points="5.8 8.2 7.3 9.7 10.4 6.6" />
            </svg>
            <span>Agente protegido con AgentGuard (Control Plane y Data Plane aislados)</span>
          </div>
        </div>

        <div class="ag-contrast-list">
          <article v-for="row in contrastRows" :key="row.vector" class="ag-contrast-row">
            <div class="ag-contrast-vector">
              <h3 class="ag-contrast-vector-title">{{ row.vector }}</h3>
              <span class="ag-contrast-tag">{{ row.tag }}</span>
            </div>

            <div class="ag-contrast-cell ag-contrast-cell--risk">
              <span class="ag-mobile-col-tag ag-mobile-col-tag--risk">
                Sin AgentGuard (Confianza implícita)
              </span>
              <p class="ag-contrast-text">{{ row.withoutGuard }}</p>
            </div>

            <div class="ag-contrast-cell ag-contrast-cell--safe">
              <span class="ag-mobile-col-tag ag-mobile-col-tag--safe">
                Con AgentGuard (PEP/PDP aislado)
              </span>
              <p class="ag-contrast-text">{{ row.withGuard }}</p>
            </div>
          </article>
        </div>
      </div>
    </section>

    <!-- Arquitectura de valor empresarial (Grilla editorial asimétrica) -->
    <section class="ag-section ag-capabilities" aria-labelledby="ag-capabilities-title">
      <div class="ag-section-head">
        <h2 id="ag-capabilities-title" class="ag-section-heading">
          Arquitectura de valor empresarial
        </h2>
        <p class="ag-section-sub">
          Seis controles de producción implementados en el stack políglota para operar agentes de IA
          con gobierno determinista, aislamiento por organización y evidencia verificable.
        </p>
      </div>

      <div class="ag-bento-grid">
        <article
          v-for="cap in capabilities"
          :key="cap.id"
          class="ag-cap-panel"
          :class="[`ag-cap-panel--${cap.span}`, `ag-cap-panel--${cap.tone}`]"
        >
          <div class="ag-cap-top">
            <code class="ag-cap-spec">{{ cap.spec }}</code>
            <span class="ag-cap-dot" :class="`ag-cap-dot--${cap.tone}`" aria-hidden="true" />
          </div>

          <h3 class="ag-cap-title">{{ cap.title }}</h3>
          <p class="ag-cap-desc">{{ cap.description }}</p>

          <ul class="ag-cap-points">
            <li v-for="point in cap.highlights" :key="point" class="ag-cap-point">
              <svg
                class="ag-point-check"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
              >
                <polyline points="3.5 8.5 6.5 11.5 12.5 4.8" />
              </svg>
              <span>{{ point }}</span>
            </li>
          </ul>
        </article>
      </div>
    </section>
  </div>
</template>

<style scoped>
.ag-showcase {
  width: 100%;
  max-width: 1320px;
  margin: 0 auto;
  padding: 1.75rem 1.5rem 1rem;
  color: var(--vp-c-text-1);
}

/* ==========================================================================
 * Hero Split Above-the-Fold
 * ========================================================================== */
.ag-hero {
  display: flex;
  flex-direction: column;
  gap: 1.75rem;
  padding-bottom: 3.25rem;
  border-bottom: 1px solid var(--ag-border);
}

.ag-hero-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.45fr) minmax(300px, 380px);
  gap: 2.75rem;
  align-items: center;
}

.ag-hero-copy {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 1.25rem;
  min-width: 0;
}

.ag-hero-kicker {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.35rem 0.75rem;
  border-radius: 6px;
  background: var(--vp-c-brand-soft);
  border: 1px solid var(--ag-border-accent);
  color: var(--ag-emerald-aaa);
  font-size: 0.84rem;
  font-weight: 600;
  line-height: 1.3;
}

.ag-status-dot {
  width: 8px;
  height: 8px;
  border-radius: 9999px;
  background: var(--ag-emerald);
  flex-shrink: 0;
}

.ag-hero-title {
  margin: 0;
  font-family: var(--ag-font-display, var(--vp-font-family-base));
  font-size: clamp(2.1rem, 3.6vw, 3.35rem);
  font-weight: 800;
  line-height: 1.07;
  letter-spacing: -0.025em;
  color: var(--vp-c-text-1);
  text-wrap: balance;
}

.ag-hero-lead {
  margin: 0;
  max-width: 56ch;
  font-size: 1.04rem;
  line-height: 1.62;
  color: var(--vp-c-text-2);
}

.ag-hero-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.75rem;
  padding-top: 0.25rem;
}

.ag-cta {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  min-height: 44px;
  padding: 0.65rem 1.2rem;
  border-radius: 8px;
  font-size: 0.92rem;
  font-weight: 600;
  line-height: 1.2;
  text-decoration: none;
  border: 1px solid transparent;
  transition: background-color 0.16s ease, border-color 0.16s ease, color 0.16s ease,
    transform 0.12s ease;
}

.ag-cta:focus-visible,
.ag-cta-link:focus-visible {
  outline: 2px solid var(--ag-emerald-strong);
  outline-offset: 2px;
}

.ag-cta:active {
  transform: translateY(1px);
}

.ag-cta--primary {
  background: var(--vp-button-brand-bg);
  border-color: var(--vp-button-brand-bg);
  color: var(--vp-button-brand-text);
}

.ag-cta--primary:hover {
  background: var(--vp-button-brand-hover-bg);
  border-color: var(--vp-button-brand-hover-bg);
  color: var(--vp-button-brand-text);
}

.ag-cta--secondary {
  background: var(--ag-surface-card);
  border-color: var(--ag-border-strong);
  color: var(--vp-c-text-1);
}

.ag-cta--secondary:hover {
  background: var(--ag-surface-subtle);
  border-color: var(--ag-emerald-strong);
  color: var(--vp-c-text-1);
}

.ag-cta-link {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  min-height: 40px;
  padding: 0.35rem 0.25rem;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--vp-c-brand-1);
  text-decoration: underline;
  text-decoration-color: var(--ag-border-accent);
  text-underline-offset: 4px;
  border-radius: 6px;
  transition: color 0.16s ease, text-decoration-color 0.16s ease;
}

.ag-cta-link:hover {
  color: var(--ag-emerald-strong);
  text-decoration-color: currentColor;
}

.ag-icon {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}

.ag-icon--sm {
  width: 15px;
  height: 15px;
}

.ag-hero-media {
  min-width: 0;
  width: 100%;
  display: flex;
  justify-content: center;
}

/* Barra de evidencia técnica verificada */
.ag-proof-bar {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  border: 1px solid var(--ag-border);
  border-radius: 10px;
  background: var(--ag-surface-card);
  overflow: hidden;
}

.ag-proof-item {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  padding: 1rem 1.15rem;
  border-right: 1px solid var(--ag-border);
  min-width: 0;
}

.ag-proof-item:last-child {
  border-right: none;
}

.ag-proof-value {
  font-family: var(--ag-font-display, var(--vp-font-family-base));
  font-size: 1.12rem;
  font-weight: 800;
  line-height: 1.2;
  font-variant-numeric: tabular-nums;
  color: var(--vp-c-text-1);
}

.ag-proof-label {
  font-size: 0.84rem;
  font-weight: 600;
  color: var(--vp-c-brand-1);
  line-height: 1.3;
}

.ag-proof-detail {
  font-size: 0.8rem;
  color: var(--vp-c-text-3);
  line-height: 1.35;
}

/* ==========================================================================
 * Secciones Editoriales
 * ========================================================================== */
.ag-section {
  padding-top: 4rem;
}

.ag-section-head {
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
  max-width: 68ch;
  margin-bottom: 2rem;
}

.ag-section-heading {
  margin: 0;
  padding: 0;
  border: none;
  font-family: var(--ag-font-display, var(--vp-font-family-base));
  font-size: clamp(1.55rem, 2.4vw, 2.15rem);
  font-weight: 800;
  line-height: 1.18;
  letter-spacing: -0.02em;
  color: var(--vp-c-text-1);
  text-wrap: balance;
}

.ag-section-sub {
  margin: 0;
  font-size: 0.98rem;
  line-height: 1.62;
  color: var(--vp-c-text-2);
}

/* ==========================================================================
 * Contraste Before / After
 * ========================================================================== */
.ag-contrast-shell {
  border: 1px solid var(--ag-border);
  border-radius: 12px;
  background: var(--ag-surface-card);
  overflow: hidden;
}

.ag-contrast-columns-head {
  display: grid;
  grid-template-columns: minmax(190px, 0.72fr) minmax(0, 1fr) minmax(0, 1fr);
  border-bottom: 1px solid var(--ag-border);
  background: var(--ag-surface-elevated);
}

.ag-contrast-col-label {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.85rem 1.15rem;
  font-size: 0.84rem;
  font-weight: 700;
  color: var(--vp-c-text-2);
  border-right: 1px solid var(--ag-border);
}

.ag-contrast-col-label:last-child {
  border-right: none;
}

.ag-contrast-col-label--risk {
  color: var(--ag-rose);
  background: rgba(190, 18, 60, 0.06);
}

.ag-contrast-col-label--safe {
  color: var(--ag-emerald-aaa);
  background: rgba(16, 185, 129, 0.08);
}

:global(.dark) .ag-contrast-col-label--risk {
  background: rgba(244, 63, 94, 0.1);
}

:global(.dark) .ag-contrast-col-label--safe {
  background: rgba(16, 185, 129, 0.12);
}

.ag-contrast-list {
  display: flex;
  flex-direction: column;
}

.ag-contrast-row {
  display: grid;
  grid-template-columns: minmax(190px, 0.72fr) minmax(0, 1fr) minmax(0, 1fr);
  border-bottom: 1px solid var(--ag-border);
}

.ag-contrast-row:last-child {
  border-bottom: none;
}

.ag-contrast-vector {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  gap: 0.4rem;
  padding: 1.15rem;
  border-right: 1px solid var(--ag-border);
  background: var(--ag-surface-elevated);
}

.ag-contrast-vector-title {
  margin: 0;
  font-size: 0.96rem;
  font-weight: 700;
  line-height: 1.3;
  color: var(--vp-c-text-1);
}

.ag-contrast-tag {
  display: inline-flex;
  padding: 0.18rem 0.5rem;
  border-radius: 5px;
  font-family: var(--vp-font-family-mono);
  font-size: 0.8125rem;
  font-weight: 600;
  background: var(--ag-surface-subtle);
  border: 1px solid var(--ag-border);
  color: var(--vp-c-text-2);
}

.ag-contrast-cell {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 0.35rem;
  padding: 1.15rem 1.25rem;
  border-right: 1px solid var(--ag-border);
}

.ag-contrast-cell:last-child {
  border-right: none;
}

.ag-contrast-cell--risk {
  background: rgba(190, 18, 60, 0.025);
}

.ag-contrast-cell--safe {
  background: rgba(16, 185, 129, 0.035);
}

:global(.dark) .ag-contrast-cell--risk {
  background: rgba(244, 63, 94, 0.045);
}

:global(.dark) .ag-contrast-cell--safe {
  background: rgba(16, 185, 129, 0.055);
}

.ag-contrast-text {
  margin: 0;
  font-size: 0.91rem;
  line-height: 1.56;
  color: var(--vp-c-text-2);
}

.ag-mobile-col-tag {
  display: none;
  font-size: 0.8rem;
  font-weight: 700;
}

.ag-mobile-col-tag--risk {
  color: var(--ag-rose);
}

.ag-mobile-col-tag--safe {
  color: var(--ag-emerald-aaa);
}

/* ==========================================================================
 * Grilla Editorial Asimétrica de 6 Capacidades
 * ========================================================================== */
.ag-bento-grid {
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  gap: 1.1rem;
}

.ag-cap-panel {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  padding: 1.45rem 1.5rem;
  border-radius: 10px;
  border: 1px solid var(--ag-border);
  background: var(--ag-surface-card);
  min-width: 0;
  transition: border-color 0.16s ease, background-color 0.16s ease;
}

.ag-cap-panel:hover {
  border-color: var(--ag-border-strong);
}

.ag-cap-panel--wide {
  grid-column: span 7;
}

.ag-cap-panel--narrow {
  grid-column: span 5;
  background: var(--ag-surface-elevated);
}

.ag-cap-panel--half {
  grid-column: span 6;
}

.ag-cap-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.ag-cap-spec {
  font-family: var(--vp-font-family-mono);
  font-size: 0.8125rem;
  font-weight: 600;
  padding: 0.22rem 0.55rem;
  border-radius: 6px;
  background: var(--ag-surface-subtle);
  border: 1px solid var(--ag-border);
  color: var(--vp-c-text-1);
  overflow-wrap: anywhere;
}

.ag-cap-dot {
  width: 9px;
  height: 9px;
  border-radius: 9999px;
  flex-shrink: 0;
}

.ag-cap-dot--emerald {
  background: var(--ag-emerald);
}

.ag-cap-dot--amber {
  background: var(--ag-amber);
}

.ag-cap-dot--rose {
  background: var(--ag-rose);
}

.ag-cap-dot--cyan {
  background: var(--ag-cyan);
}

.ag-cap-title {
  margin: 0;
  font-family: var(--ag-font-display, var(--vp-font-family-base));
  font-size: 1.14rem;
  font-weight: 700;
  line-height: 1.3;
  color: var(--vp-c-text-1);
}

.ag-cap-desc {
  margin: 0;
  font-size: 0.92rem;
  line-height: 1.6;
  color: var(--vp-c-text-2);
  flex: 1;
}

.ag-cap-points {
  display: flex;
  flex-wrap: wrap;
  gap: 0.55rem 1.1rem;
  list-style: none;
  margin: 0.2rem 0 0;
  padding: 0.8rem 0 0;
  border-top: 1px solid var(--ag-border);
}

.ag-cap-point {
  display: inline-flex;
  align-items: center;
  gap: 0.38rem;
  font-size: 0.84rem;
  font-weight: 600;
  color: var(--vp-c-text-1);
}

.ag-point-check {
  width: 14px;
  height: 14px;
  color: var(--ag-emerald-strong);
  flex-shrink: 0;
}

/* ==========================================================================
 * Responsive (hasta 375px)
 * ========================================================================== */
@media (max-width: 1080px) {
  .ag-hero-grid {
    grid-template-columns: 1fr;
    gap: 2rem;
  }

  .ag-proof-bar {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .ag-proof-item {
    border-bottom: 1px solid var(--ag-border);
  }

  .ag-proof-item:nth-child(3n) {
    border-right: none;
  }

  .ag-proof-item:nth-last-child(-n + 2) {
    border-bottom: none;
  }

  .ag-cap-panel--wide,
  .ag-cap-panel--narrow,
  .ag-cap-panel--half {
    grid-column: span 6;
  }
}

@media (max-width: 820px) {
  .ag-contrast-columns-head {
    display: none;
  }

  .ag-contrast-row {
    grid-template-columns: 1fr;
  }

  .ag-contrast-vector {
    border-right: none;
    border-bottom: 1px solid var(--ag-border);
  }

  .ag-contrast-cell {
    border-right: none;
    border-bottom: 1px solid var(--ag-border);
  }

  .ag-contrast-cell:last-child {
    border-bottom: none;
  }

  .ag-mobile-col-tag {
    display: inline-block;
  }

  .ag-cap-panel--wide,
  .ag-cap-panel--narrow,
  .ag-cap-panel--half {
    grid-column: span 12;
  }
}

@media (max-width: 600px) {
  .ag-showcase {
    padding: 1.5rem 1rem 0.75rem;
  }

  .ag-proof-bar {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .ag-proof-item:nth-child(3n) {
    border-right: 1px solid var(--ag-border);
  }

  .ag-proof-item:nth-child(2n) {
    border-right: none;
  }

  .ag-proof-item:last-child {
    grid-column: span 2;
    border-right: none;
    border-bottom: none;
  }

  .ag-hero-actions {
    width: 100%;
  }

  .ag-cta {
    width: 100%;
  }
}

@media (prefers-reduced-motion: reduce) {
  .ag-cta,
  .ag-cta-link,
  .ag-cap-panel {
    transition: none;
  }

  .ag-cta:active {
    transform: none;
  }
}
</style>
