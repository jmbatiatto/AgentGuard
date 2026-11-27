<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue'
import { withBase } from 'vitepress'

withDefaults(
  defineProps<{
    showHeader?: boolean
  }>(),
  {
    showHeader: true
  }
)

type InstallTabId = 'windows-one-click' | 'separate' | 'cli-demo'

interface CommandStep {
  id: string
  label: string
  shell: string
  command: string
  note?: string
}

interface InstallTab {
  id: InstallTabId
  label: string
  summary: string
  steps: CommandStep[]
}

interface LocalEndpoint {
  name: string
  url: string
  role: string
  badge: string
}

interface DemoCredential {
  role: string
  email: string
  scope: string
  tone: 'emerald' | 'amber' | 'cyan' | 'neutral'
}

const prerequisites = [
  { name: 'Docker Desktop', detail: 'PostgreSQL 16 y Redis 7' },
  { name: 'Git', detail: 'Clonado del repositorio' },
  { name: 'Node.js 20+ / pnpm', detail: 'Frontend SPA y scripts' },
  { name: 'Python 3.12+', detail: 'FastAPI, PEP/PDP y ACME' }
]

const installTabs: InstallTab[] = [
  {
    id: 'windows-one-click',
    label: 'Windows · 1 Clic (Recomendado)',
    summary:
      'Levanta todo el ecosistema unificado: PostgreSQL 16 (:5433), Redis 7 (:6379), migraciones Alembic, Backend PEP/PDP (:8000), Dashboard SPA (:5173) y Sandbox ACME Corp (:9000) con auto-onboarding.',
    steps: [
      {
        id: 'win-up',
        label: 'Clonar y levantar todo el ecosistema',
        shell: 'PowerShell',
        command: `git clone https://github.com/jmbatiatto/AgentGuard.git\ncd AgentGuard\npnpm start:all`,
        note: 'Equivale a npm run start:all o .\\start_ecosystem.bat. Crea backend/.env y acme-corp/.env desde sus plantillas .env.example sin requerir API keys pagas.'
      },
      {
        id: 'win-stop',
        label: 'Detener servicios y contenedores ordenadamente',
        shell: 'PowerShell',
        command: 'pnpm stop',
        note: 'Equivale a npm run stop:all o .\\stop_all.bat.'
      }
    ]
  },
  {
    id: 'separate',
    label: 'Por separado (AgentGuard + ACME)',
    summary:
      'Ideal para inspeccionar cada servicio en su propia consola de Windows o iniciar el portal documental local de forma independiente.',
    steps: [
      {
        id: 'sep-core',
        label: 'Levantar AgentGuard Core (Docker + Backend :8000 + SPA :5173)',
        shell: 'PowerShell',
        command: '.\\start_all.bat'
      },
      {
        id: 'sep-acme',
        label: 'Levantar Sandbox cliente ACME Corp (:9000)',
        shell: 'PowerShell',
        command: 'acme-corp\\start_acme.bat'
      },
      {
        id: 'sep-docs',
        label: 'Levantar el portal documental VitePress (:4173)',
        shell: 'PowerShell',
        command: '.\\start_docs.bat'
      }
    ]
  },
  {
    id: 'cli-demo',
    label: 'Demo CLI (4 Escenarios)',
    summary:
      'Ejecuta en consola los 4 escenarios canónicos contra el Gateway PEP (:8000) o valida la suite automatizada Zero-Regression.',
    steps: [
      {
        id: 'cli-run',
        label: 'Ejecutar los 4 escenarios canónicos en vivo',
        shell: 'PowerShell',
        command: 'backend\\.venv\\Scripts\\python.exe agent-demo\\run_demo.py --all',
        note: 'Autodescubre organization_id, agentes y herramientas vía GET /api/v1/gateway/context.'
      },
      {
        id: 'cli-tests',
        label: 'Validar suite de regresión de los 4 escenarios',
        shell: 'PowerShell',
        command: 'backend\\.venv\\Scripts\\pytest.exe -q backend/tests/test_gateway_scenarios.py'
      }
    ]
  }
]

const localEndpoints: LocalEndpoint[] = [
  {
    name: 'Dashboard SPA (Control Plane)',
    url: 'http://localhost:5173/#auth',
    role: 'Login en 1 clic para los 5 roles RBAC, políticas PDP, trazas y bandeja HITL en vivo.',
    badge: 'Puerto 5173'
  },
  {
    name: 'API REST y Gateway PEP/PDP',
    url: 'http://localhost:8000/docs',
    role: 'Documentación OpenAPI interactiva de los 17 routers, /api/v1/gateway/execute y /health.',
    badge: 'Puerto 8000'
  },
  {
    name: 'Sandbox ACME Corp y Consultante BI',
    url: 'http://localhost:9000',
    role: 'ERP cliente SQLite, Handshake Universal Multi-LLM y pruebas en Modo Protegido vs Directo.',
    badge: 'Puerto 9000'
  }
]

const demoCredentials: DemoCredential[] = [
  {
    role: 'ADMIN',
    email: 'admin@acmecorp.com',
    scope: 'Control total del tenant, políticas PDP, agentes, API keys y reinicio demo.',
    tone: 'emerald'
  },
  {
    role: 'APPROVER',
    email: 'approver@acmecorp.com',
    scope: 'Aprobar o rechazar reembolsos retenidos (HTTP 202) en ApprovalsView.',
    tone: 'amber'
  },
  {
    role: 'OPERATOR',
    email: 'operator@acmecorp.com',
    scope: 'Simular payloads dry_run, vectores OWASP 2026 y gestionar alertas.',
    tone: 'cyan'
  },
  {
    role: 'AUDITOR',
    email: 'auditor@acmecorp.com',
    scope: 'Inspeccionar trazas sanitizadas (LLM06) con latency_ms real y audit_events.',
    tone: 'cyan'
  },
  {
    role: 'VIEWER',
    email: 'viewer@acmecorp.com',
    scope: 'Consulta ejecutiva de KPIs y catálogo en modo estricto de solo lectura.',
    tone: 'neutral'
  }
]

const activeTabId = ref<InstallTabId>('windows-one-click')
const copiedKey = ref<string | null>(null)
let copyTimer: ReturnType<typeof setTimeout> | null = null

function getActiveTab(): InstallTab {
  return installTabs.find((t) => t.id === activeTabId.value) ?? installTabs[0]
}

async function copyText(key: string, text: string) {
  if (typeof window === 'undefined') return
  let ok = false

  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text)
      ok = true
    } catch {
      ok = false
    }
  }

  if (!ok && typeof document !== 'undefined') {
    try {
      const area = document.createElement('textarea')
      area.value = text
      area.setAttribute('readonly', '')
      area.style.position = 'fixed'
      area.style.opacity = '0'
      document.body.appendChild(area)
      area.select()
      ok = document.execCommand('copy')
      document.body.removeChild(area)
    } catch {
      ok = false
    }
  }

  if (ok) {
    copiedKey.value = key
    if (copyTimer) clearTimeout(copyTimer)
    copyTimer = setTimeout(() => {
      if (copiedKey.value === key) {
        copiedKey.value = null
      }
    }, 2000)
  }
}

onBeforeUnmount(() => {
  if (copyTimer) clearTimeout(copyTimer)
})
</script>

<template>
  <section
    id="instalacion-local"
    class="ag-qs-section"
    :class="{ 'ag-qs-section--embedded': !showHeader }"
    aria-label="Instalación local y entorno de pruebas en vivo"
  >
    <div v-if="showHeader" class="ag-qs-head">
      <div class="ag-qs-intro">
        <h2 class="ag-qs-heading">Instalá y probá AgentGuard en local en 2 minutos</h2>
        <p class="ag-qs-sub">
          Ejecutá el stack completo en tu máquina con Docker Desktop. Sin configuración manual de
          variables de entorno y con cuentas demo precargadas para Acme Corp.
        </p>
      </div>

      <a :href="withBase('/instalacion')" class="ag-qs-guide-link">
        <span>Ver guía completa de instalación</span>
        <svg
          class="ag-icon ag-icon--sm"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          stroke-width="1.8"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <line x1="3.5" y1="8" x2="12.5" y2="8" />
          <polyline points="8.5 4 12.5 8 8.5 12" />
        </svg>
      </a>
    </div>

    <!-- Prerrequisitos -->
    <div class="ag-prereq-strip" role="list" aria-label="Prerrequisitos del entorno local">
      <div
        v-for="req in prerequisites"
        :key="req.name"
        class="ag-prereq-pill"
        role="listitem"
      >
        <svg
          class="ag-prereq-icon"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <polyline points="3.2 8.4 6.4 11.4 12.8 4.8" />
        </svg>
        <span class="ag-prereq-name">{{ req.name }}</span>
        <span class="ag-prereq-detail">{{ req.detail }}</span>
      </div>
    </div>

    <!-- Modos de instalación con pestañas -->
    <div class="ag-qs-shell">
      <div class="ag-qs-tabs" role="tablist" aria-label="Modos de arranque local">
        <button
          v-for="tab in installTabs"
          :key="tab.id"
          type="button"
          role="tab"
          class="ag-qs-tab"
          :class="{ 'is-active': activeTabId === tab.id }"
          :aria-selected="activeTabId === tab.id"
          @click="activeTabId = tab.id"
        >
          {{ tab.label }}
        </button>
      </div>

      <div class="ag-qs-panel" role="tabpanel">
        <p class="ag-qs-panel-summary">{{ getActiveTab().summary }}</p>

        <div class="ag-cmd-list">
          <div v-for="step in getActiveTab().steps" :key="step.id" class="ag-cmd-card">
            <div class="ag-cmd-bar">
              <div class="ag-cmd-meta">
                <span class="ag-cmd-shell">{{ step.shell }}</span>
                <span class="ag-cmd-label">{{ step.label }}</span>
              </div>

              <button
                type="button"
                class="ag-copy-btn"
                :class="{ 'is-copied': copiedKey === step.id }"
                :aria-label="`Copiar comando: ${step.label}`"
                @click="copyText(step.id, step.command)"
              >
                <svg
                  v-if="copiedKey !== step.id"
                  class="ag-icon ag-icon--sm"
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.65"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  aria-hidden="true"
                >
                  <rect x="5.5" y="5.5" width="8" height="8" rx="1.5" />
                  <path d="M3.5 10.5H3a1.5 1.5 0 0 1-1.5-1.5V3A1.5 1.5 0 0 1 3 1.5h6A1.5 1.5 0 0 1 10.5 3v.5" />
                </svg>
                <span>{{ copiedKey === step.id ? '✓ Copiado' : 'Copiar' }}</span>
              </button>
            </div>

            <pre class="ag-cmd-pre"><code>{{ step.command }}</code></pre>
            <p v-if="step.note" class="ag-cmd-note">{{ step.note }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Puertos locales activos -->
    <div class="ag-endpoints-block">
      <h3 class="ag-sub-heading">Endpoints locales activos tras el arranque</h3>
      <div class="ag-endpoints-grid">
        <div v-for="ep in localEndpoints" :key="ep.url" class="ag-endpoint-item">
          <div class="ag-endpoint-top">
            <span class="ag-endpoint-name">{{ ep.name }}</span>
            <span class="ag-endpoint-port">{{ ep.badge }}</span>
          </div>

          <div class="ag-endpoint-url-row">
            <a
              :href="ep.url"
              target="_blank"
              rel="noopener noreferrer"
              class="ag-endpoint-link"
            >
              <code>{{ ep.url }}</code>
            </a>
            <button
              type="button"
              class="ag-mini-copy"
              :class="{ 'is-copied': copiedKey === ep.url }"
              :aria-label="`Copiar URL ${ep.url}`"
              @click="copyText(ep.url, ep.url)"
            >
              {{ copiedKey === ep.url ? '✓ Copiado' : 'Copiar' }}
            </button>
          </div>

          <p class="ag-endpoint-desc">{{ ep.role }}</p>
        </div>
      </div>
    </div>

    <!-- Credenciales Demo Acme Corp -->
    <div class="ag-creds-block">
      <div class="ag-creds-header">
        <div>
          <h3 class="ag-sub-heading">Credenciales Demo (Acme Corp)</h3>
          <p class="ag-creds-sub">
            Listas para inicio de sesión en un clic en <code>http://localhost:5173/#auth</code>.
          </p>
        </div>

        <div class="ag-pass-pill">
          <span class="ag-pass-label">Contraseña uniforme:</span>
          <code class="ag-pass-code">demo-password</code>
          <button
            type="button"
            class="ag-mini-copy"
            :class="{ 'is-copied': copiedKey === 'demo-password' }"
            aria-label="Copiar contraseña demo-password"
            @click="copyText('demo-password', 'demo-password')"
          >
            {{ copiedKey === 'demo-password' ? '✓ Copiado' : 'Copiar' }}
          </button>
        </div>
      </div>

      <div class="ag-table-scroll">
        <table class="ag-creds-table">
          <thead>
            <tr>
              <th>Rol RBAC</th>
              <th>Correo electrónico</th>
              <th>Alcance operativo</th>
              <th class="ag-col-action">Acceso</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="cred in demoCredentials" :key="cred.email">
              <td>
                <span class="ag-role-badge" :class="`ag-role-badge--${cred.tone}`">
                  {{ cred.role }}
                </span>
              </td>
              <td>
                <code class="ag-email-code">{{ cred.email }}</code>
              </td>
              <td class="ag-scope-cell">{{ cred.scope }}</td>
              <td class="ag-col-action">
                <button
                  type="button"
                  class="ag-mini-copy"
                  :class="{ 'is-copied': copiedKey === cred.email }"
                  :aria-label="`Copiar correo ${cred.email}`"
                  @click="copyText(cred.email, cred.email)"
                >
                  {{ copiedKey === cred.email ? '✓ Copiado' : 'Copiar' }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="showHeader" class="ag-qs-footer-cta">
        <p class="ag-qs-footer-text">
          ¿Querés conectar Gemini 2.5, OpenAI, Groq o Anthropic en el Sandbox ACME Corp y recorrer
          el checklist de diagnóstico?
        </p>
        <a :href="withBase('/instalacion')" class="ag-qs-footer-btn">
          <span>Abrir guía completa de instalación</span>
          <svg
            class="ag-icon ag-icon--sm"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            stroke-width="1.8"
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
  </section>
</template>

<style scoped>
.ag-qs-section {
  width: 100%;
  max-width: 1320px;
  margin: 0 auto;
  padding: 4rem 1.5rem 2.5rem;
  color: var(--vp-c-text-1);
}

.ag-qs-section--embedded {
  max-width: 100%;
  padding: 0.5rem 0 1.5rem;
}

.ag-qs-head {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1.25rem;
  margin-bottom: 1.65rem;
}

.ag-qs-intro {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  max-width: 64ch;
}

.ag-qs-heading {
  margin: 0 !important;
  padding: 0 !important;
  border: none !important;
  font-family: var(--ag-font-display, var(--vp-font-family-base));
  font-size: clamp(1.55rem, 2.4vw, 2.15rem) !important;
  font-weight: 800 !important;
  line-height: 1.18 !important;
  letter-spacing: -0.02em;
  color: var(--vp-c-text-1);
  text-wrap: balance;
}

.ag-qs-sub {
  margin: 0 !important;
  font-size: 0.96rem;
  line-height: 1.6;
  color: var(--vp-c-text-2);
}

.ag-qs-guide-link {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  min-height: 40px;
  padding: 0.45rem 0.85rem;
  border-radius: 8px;
  border: 1px solid var(--ag-border-strong);
  background: var(--ag-surface-card);
  color: var(--vp-c-text-1) !important;
  font-size: 0.88rem;
  font-weight: 600;
  text-decoration: none !important;
  transition: border-color 0.16s ease, background-color 0.16s ease;
}

.ag-qs-guide-link:hover {
  border-color: var(--ag-emerald-strong);
  background: var(--ag-surface-subtle);
}

.ag-qs-guide-link:focus-visible,
.ag-qs-tab:focus-visible,
.ag-copy-btn:focus-visible,
.ag-mini-copy:focus-visible,
.ag-endpoint-link:focus-visible,
.ag-qs-footer-btn:focus-visible {
  outline: 2px solid var(--ag-emerald-strong);
  outline-offset: 2px;
}

.ag-icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.ag-icon--sm {
  width: 14px;
  height: 14px;
}

/* Prerrequisitos */
.ag-prereq-strip {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.65rem;
  margin-bottom: 1.35rem;
}

.ag-prereq-pill {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.35rem 0.5rem;
  padding: 0.68rem 0.85rem;
  border-radius: 8px;
  border: 1px solid var(--ag-border);
  background: var(--ag-surface-card);
  min-width: 0;
}

.ag-prereq-icon {
  width: 15px;
  height: 15px;
  color: var(--ag-emerald-strong);
  flex-shrink: 0;
}

.ag-prereq-name {
  font-size: 0.86rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
}

.ag-prereq-detail {
  width: 100%;
  padding-left: 1.45rem;
  font-size: 0.8rem;
  color: var(--vp-c-text-3);
}

/* Panel con pestañas */
.ag-qs-shell {
  border: 1px solid var(--ag-border);
  border-radius: 12px;
  background: var(--ag-surface-card);
  overflow: hidden;
  margin-bottom: 1.75rem;
}

.ag-qs-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
  padding: 0.65rem 0.85rem;
  background: var(--ag-surface-elevated);
  border-bottom: 1px solid var(--ag-border);
}

.ag-qs-tab {
  min-height: 38px;
  padding: 0.45rem 0.9rem;
  border-radius: 7px;
  border: 1px solid transparent;
  background: transparent;
  color: var(--vp-c-text-2);
  font-size: 0.86rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.16s ease, border-color 0.16s ease, color 0.16s ease;
}

.ag-qs-tab:hover {
  color: var(--vp-c-text-1);
  background: var(--ag-surface-card);
}

.ag-qs-tab.is-active {
  background: var(--vp-button-brand-bg);
  border-color: var(--vp-button-brand-bg);
  color: var(--vp-button-brand-text);
}

.ag-qs-panel {
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.ag-qs-panel-summary {
  margin: 0 !important;
  font-size: 0.92rem;
  line-height: 1.58;
  color: var(--vp-c-text-2);
}

.ag-cmd-list {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
}

.ag-cmd-card {
  border: 1px solid var(--ag-border);
  border-radius: 9px;
  background: var(--ag-surface-elevated);
  overflow: hidden;
  min-width: 0;
}

.ag-cmd-bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  padding: 0.62rem 0.95rem;
  border-bottom: 1px solid var(--ag-border);
}

.ag-cmd-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.55rem;
  min-width: 0;
}

.ag-cmd-shell {
  font-family: var(--vp-font-family-mono);
  font-size: 0.8125rem;
  font-weight: 700;
  padding: 0.15rem 0.45rem;
  border-radius: 5px;
  background: var(--ag-surface-subtle);
  border: 1px solid var(--ag-border);
  color: var(--ag-cyan-strong);
}

.ag-cmd-label {
  font-size: 0.86rem;
  font-weight: 600;
  color: var(--vp-c-text-1);
}

.ag-copy-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  min-height: 32px;
  padding: 0.28rem 0.7rem;
  border-radius: 6px;
  border: 1px solid var(--ag-border-strong);
  background: var(--ag-surface-card);
  color: var(--vp-c-text-1);
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.16s ease, border-color 0.16s ease, color 0.16s ease;
}

.ag-copy-btn:hover,
.ag-mini-copy:hover {
  border-color: var(--ag-emerald-strong);
  background: var(--ag-surface-subtle);
}

.ag-copy-btn.is-copied,
.ag-mini-copy.is-copied {
  background: var(--vp-c-brand-soft);
  border-color: var(--ag-emerald-strong);
  color: var(--ag-emerald-aaa);
}

.ag-cmd-pre {
  margin: 0 !important;
  padding: 0.95rem 1.05rem !important;
  background: #080d19 !important;
  color: #f1f5f9 !important;
  font-family: var(--vp-font-family-mono);
  font-size: 0.85rem;
  line-height: 1.62;
  overflow-x: auto;
  max-width: 100%;
  border-radius: 0 !important;
}

.ag-cmd-pre code {
  background: transparent !important;
  border: none !important;
  padding: 0 !important;
  color: inherit !important;
  font-family: var(--vp-font-family-mono);
  font-size: inherit !important;
  font-weight: 500 !important;
}

.ag-cmd-note {
  margin: 0 !important;
  padding: 0.62rem 0.95rem;
  font-size: 0.83rem;
  line-height: 1.5;
  color: var(--vp-c-text-2);
  border-top: 1px solid var(--ag-border);
}

/* Endpoints activos */
.ag-endpoints-block {
  margin-bottom: 1.75rem;
}

.ag-sub-heading {
  margin: 0 0 0.75rem !important;
  padding: 0 !important;
  border: none !important;
  font-family: var(--ag-font-display, var(--vp-font-family-base));
  font-size: 1.12rem !important;
  font-weight: 700 !important;
  line-height: 1.3 !important;
  color: var(--vp-c-text-1);
}

.ag-endpoints-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.85rem;
}

.ag-endpoint-item {
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
  padding: 1.05rem 1.1rem;
  border-radius: 10px;
  border: 1px solid var(--ag-border);
  background: var(--ag-surface-card);
  min-width: 0;
}

.ag-endpoint-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.ag-endpoint-name {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
}

.ag-endpoint-port {
  font-family: var(--vp-font-family-mono);
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--ag-cyan-strong);
  white-space: nowrap;
}

.ag-endpoint-url-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  padding: 0.42rem 0.55rem;
  border-radius: 7px;
  background: var(--ag-surface-elevated);
  border: 1px solid var(--ag-border);
  min-width: 0;
}

.ag-endpoint-link {
  color: var(--vp-c-brand-1) !important;
  text-decoration: none !important;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  min-width: 0;
}

.ag-endpoint-link:hover {
  text-decoration: underline !important;
}

.ag-endpoint-link code {
  font-family: var(--vp-font-family-mono);
  font-size: 0.8125rem !important;
  font-weight: 600 !important;
  background: transparent !important;
  border: none !important;
  padding: 0 !important;
  color: inherit !important;
}

.ag-endpoint-desc {
  margin: 0 !important;
  font-size: 0.84rem;
  line-height: 1.5;
  color: var(--vp-c-text-2);
}

.ag-mini-copy {
  padding: 0.24rem 0.55rem;
  border-radius: 5px;
  border: 1px solid var(--ag-border-strong);
  background: var(--ag-surface-card);
  color: var(--vp-c-text-1);
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  flex-shrink: 0;
  transition: background-color 0.16s ease, border-color 0.16s ease, color 0.16s ease;
}

/* Credenciales Demo */
.ag-creds-block {
  border: 1px solid var(--ag-border);
  border-radius: 12px;
  background: var(--ag-surface-card);
  overflow: hidden;
}

.ag-creds-header {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.85rem;
  padding: 1.05rem 1.2rem;
  background: var(--ag-surface-elevated);
  border-bottom: 1px solid var(--ag-border);
}

.ag-creds-header .ag-sub-heading {
  margin-bottom: 0.2rem !important;
}

.ag-creds-sub {
  margin: 0 !important;
  font-size: 0.85rem;
  color: var(--vp-c-text-2);
}

.ag-creds-sub code {
  font-family: var(--vp-font-family-mono);
  font-size: 0.8125rem;
  padding: 0.1rem 0.35rem;
  border-radius: 4px;
  background: var(--ag-surface-subtle);
  border: 1px solid var(--ag-border);
  color: var(--vp-c-text-1);
}

.ag-pass-pill {
  display: inline-flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
  padding: 0.42rem 0.65rem;
  border-radius: 8px;
  background: var(--ag-surface-card);
  border: 1px solid var(--ag-border);
}

.ag-pass-label {
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--vp-c-text-2);
}

.ag-pass-code {
  font-family: var(--vp-font-family-mono);
  font-size: 0.84rem !important;
  font-weight: 700 !important;
  color: var(--ag-emerald-aaa) !important;
  background: transparent !important;
  border: none !important;
  padding: 0 !important;
}

.ag-table-scroll {
  width: 100%;
  overflow-x: auto;
}

.ag-creds-table {
  display: table !important;
  width: 100% !important;
  min-width: 600px !important;
  margin: 0 !important;
  border: none !important;
  border-radius: 0 !important;
  box-shadow: none !important;
  border-collapse: collapse !important;
  background: var(--ag-surface-card) !important;
}

.ag-creds-table thead tr {
  background: var(--ag-surface-subtle) !important;
}

.ag-creds-table th {
  padding: 0.68rem 1rem !important;
  font-size: 0.82rem !important;
  font-weight: 700 !important;
  color: var(--vp-c-text-2) !important;
  text-align: left !important;
  border: none !important;
  border-bottom: 1px solid var(--ag-border) !important;
  background: var(--ag-surface-subtle) !important;
}

.ag-creds-table td {
  padding: 0.68rem 1rem !important;
  font-size: 0.86rem !important;
  color: var(--vp-c-text-1) !important;
  border: none !important;
  border-bottom: 1px solid var(--ag-border) !important;
  vertical-align: middle !important;
}

.ag-creds-table tbody tr:last-child td {
  border-bottom: none !important;
}

.ag-creds-table tbody tr:nth-child(2n) {
  background: var(--ag-surface-elevated) !important;
}

.ag-col-action {
  text-align: right !important;
  width: 104px;
}

.ag-role-badge {
  display: inline-flex;
  padding: 0.18rem 0.55rem;
  border-radius: 5px;
  font-family: var(--vp-font-family-mono);
  font-size: 0.8125rem;
  font-weight: 700;
  border: 1px solid transparent;
}

.ag-role-badge--emerald {
  background: rgba(16, 185, 129, 0.12);
  border-color: rgba(16, 185, 129, 0.35);
  color: var(--ag-emerald-aaa);
}

.ag-role-badge--amber {
  background: rgba(180, 83, 9, 0.12);
  border-color: rgba(180, 83, 9, 0.35);
  color: var(--ag-amber);
}

:global(.dark) .ag-role-badge--amber {
  background: rgba(245, 158, 11, 0.15);
  border-color: rgba(251, 191, 36, 0.38);
}

.ag-role-badge--cyan {
  background: rgba(6, 182, 212, 0.12);
  border-color: rgba(6, 182, 212, 0.35);
  color: var(--ag-cyan-strong);
}

.ag-role-badge--neutral {
  background: var(--ag-surface-subtle);
  border-color: var(--ag-border);
  color: var(--vp-c-text-2);
}

.ag-email-code {
  font-family: var(--vp-font-family-mono);
  font-size: 0.825rem !important;
  font-weight: 600 !important;
  color: var(--vp-c-text-1) !important;
  background: transparent !important;
  border: none !important;
  padding: 0 !important;
}

.ag-scope-cell {
  color: var(--vp-c-text-2) !important;
  line-height: 1.45;
}

/* Pie CTA hacia /instalacion */
.ag-qs-footer-cta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem 1.2rem;
  background: var(--ag-surface-elevated);
  border-top: 1px solid var(--ag-border);
}

.ag-qs-footer-text {
  margin: 0 !important;
  font-size: 0.88rem;
  color: var(--vp-c-text-2);
}

.ag-qs-footer-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.42rem;
  min-height: 40px;
  padding: 0.52rem 1rem;
  border-radius: 8px;
  background: var(--vp-button-brand-bg);
  color: var(--vp-button-brand-text) !important;
  font-size: 0.86rem;
  font-weight: 600;
  text-decoration: none !important;
  transition: background-color 0.16s ease;
}

.ag-qs-footer-btn:hover {
  background: var(--vp-button-brand-hover-bg);
}

/* ==========================================================================
 * Responsive
 * ========================================================================== */
@media (max-width: 980px) {
  .ag-prereq-strip {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .ag-endpoints-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 600px) {
  .ag-qs-section {
    padding: 3rem 1rem 1.75rem;
  }

  .ag-qs-section--embedded {
    padding: 0.25rem 0 1.25rem;
  }

  .ag-prereq-strip {
    grid-template-columns: 1fr;
  }

  .ag-qs-tabs {
    flex-direction: column;
  }

  .ag-qs-tab {
    width: 100%;
    text-align: left;
  }

  .ag-qs-footer-btn {
    width: 100%;
    justify-content: center;
  }
}

@media (prefers-reduced-motion: reduce) {
  .ag-qs-guide-link,
  .ag-qs-tab,
  .ag-copy-btn,
  .ag-mini-copy,
  .ag-qs-footer-btn {
    transition: none;
  }
}
</style>
