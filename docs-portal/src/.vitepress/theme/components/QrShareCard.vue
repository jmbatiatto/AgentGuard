<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { withBase } from 'vitepress'

const GITHUB_PAGES_URL = 'https://jmbatiatto.github.io/AgentGuard/'
const CANVA_SLIDES_URL = 'https://canva.link/59p7pjdurhxr1vk'

const isMounted = ref(false)
const targetUrl = ref(GITHUB_PAGES_URL)
const qrPngDataUrl = ref('')
const qrSvgMarkup = ref('')
const qrError = ref<string | null>(null)
const copiedUrl = ref(false)

interface JuryShortcut {
  code: string
  badge: string
  badgeVariant: 'emerald' | 'cyan' | 'amber' | 'rose'
  title: string
  questionHint: string
  path: string
}

const juryShortcuts = computed<JuryShortcut[]>(() => [
  {
    code: 'Vol. 01',
    badge: 'PostgreSQL 16 + Alembic',
    badgeVariant: 'emerald',
    title: 'MER Relacional, Esquema Físico y 6 Migraciones',
    questionHint:
      '13 tablas UUID v4, 24 FKs, 4 índices GIN en JSONB, aislamiento organization_id y 7 tablas SQLite ACME.',
    path: withBase('/volumenes/01_MER_RELACIONAL_Y_FISICO_DB')
  },
  {
    code: 'Vol. 02',
    badge: 'Notación Chen',
    badgeVariant: 'cyan',
    title: 'MER Conceptual Chen, Cardinalidades y 96 Atributos',
    questionHint:
      'Relación asociativa N:N AUTORIZADO_EN (agent_tools), cardinalidades (mín, máx) R1–R24 y 16 preguntas de examen.',
    path: withBase('/volumenes/02_MER_CONCEPTUAL_CHEN_Y_ATRIBUTOS')
  },
  {
    code: 'Vol. 03',
    badge: 'Zero Trust Runtime',
    badgeVariant: 'emerald',
    title: 'Interceptor PEP, Motor PDP 5D Fail-Closed y API REST',
    questionHint:
      'Evaluación determinista en 5 dimensiones, sanitización OWASP LLM06, 17 routers FastAPI y difusión WebSockets.',
    path: withBase('/volumenes/03_ARQUITECTURA_RUNTIME_PEP_PDP_Y_API_REST')
  },
  {
    code: 'Vol. 04',
    badge: 'Demo & HITL 202',
    badgeVariant: 'amber',
    title: 'Secuencias de los 4 Escenarios, Estados y Casos de Uso',
    questionHint:
      'ALLOW create_quote, DENY update_price, REQUIRE_APPROVAL refund (TTL 900s) y DENY+ALERT export_customers.',
    path: withBase('/volumenes/04_SECUENCIA_DEMO_ESTADOS_Y_CASOS_DE_USO')
  },
  {
    code: 'Vol. 05',
    badge: 'React 19 + RBAC',
    badgeVariant: 'cyan',
    title: 'Manual de Frontend SPA, Sesiones y Matriz RBAC',
    questionHint:
      '9 vistas 100% en español, cero silent fallbacks, SERVER_BOOT_ID + sessionStorage y matriz de 5 roles.',
    path: withBase('/volumenes/05_MANUAL_FRONTEND_SPA_RBAC_Y_CREDENCIALES')
  },
  {
    code: 'Vol. 06',
    badge: 'ACME + Gemini 3.8',
    badgeVariant: 'emerald',
    title: 'Portal Empresarial ACME Corp y Copiloto Consultante BI',
    questionHint:
      'Auto-onboarding CEO (:9000), Google Gemini 3.8 Flash con thoughtSignature, gráficos SVG y CLI run_demo.py.',
    path: withBase('/volumenes/06_PORTAL_ACME_CORP_CONSULTANTE_BI_Y_AGENT_DEMO')
  },
  {
    code: 'ADRs',
    badge: 'ADR-001 a ADR-009',
    badgeVariant: 'rose',
    title: 'Registro de Decisiones Arquitectónicas (ADRs)',
    questionHint:
      'Por qué FastAPI async, PostgreSQL vs SQLite satélite, Redis, bloqueo pesimista FOR UPDATE y fail-closed.',
    path: withBase('/volumenes/DECISIONS')
  },
  {
    code: 'Vol. 07',
    badge: '12 Slides · 15 min',
    badgeVariant: 'amber',
    title: 'Presentación Oficial en Canva y Guion por Rol SCRUM',
    questionHint:
      'Desglose diapositiva por diapositiva (DAHbl5SRXbM) y tiempos exactos de los 4 integrantes ante el tribunal.',
    path: withBase('/volumenes/07_PRESENTACION_CANVA_Y_GUION_DEFENSA')
  }
])

async function generateQrAssets(rawValue: string) {
  if (!isMounted.value) return
  const cleanUrl = rawValue.trim()
  if (!cleanUrl) {
    qrPngDataUrl.value = ''
    qrSvgMarkup.value = ''
    qrError.value = 'Ingresá una URL válida para generar el código QR.'
    return
  }

  qrError.value = null
  try {
    const qrMod = await import('qrcode')
    const QRCode = qrMod.default ?? qrMod

    const [pngUrl, svgStr] = await Promise.all([
      QRCode.toDataURL(cleanUrl, {
        width: 1024,
        margin: 4,
        errorCorrectionLevel: 'H',
        color: {
          dark: '#0b1120',
          light: '#ffffff'
        }
      }),
      QRCode.toString(cleanUrl, {
        type: 'svg',
        margin: 4,
        errorCorrectionLevel: 'H',
        color: {
          dark: '#0b1120',
          light: '#ffffff'
        }
      })
    ])

    qrPngDataUrl.value = pngUrl
    qrSvgMarkup.value = svgStr
  } catch (err) {
    qrError.value =
      err instanceof Error ? err.message : 'No se pudo generar el código QR para esta dirección.'
  }
}

function selectCurrentBrowserUrl() {
  if (typeof window === 'undefined') return
  targetUrl.value = window.location.href
}

function selectGithubPagesUrl() {
  targetUrl.value = GITHUB_PAGES_URL
}

function selectCanvaUrl() {
  targetUrl.value = CANVA_SLIDES_URL
}

async function copyTargetUrl() {
  if (typeof navigator === 'undefined' || !navigator.clipboard || !targetUrl.value.trim()) return
  try {
    await navigator.clipboard.writeText(targetUrl.value.trim())
    copiedUrl.value = true
    setTimeout(() => {
      copiedUrl.value = false
    }, 2000)
  } catch {
    // Ignorar fallo de permisos del portapapeles
  }
}

function downloadQrPngHd() {
  if (typeof document === 'undefined' || !qrPngDataUrl.value) return
  const link = document.createElement('a')
  link.href = qrPngDataUrl.value
  link.download = 'agentguard-qr-hd-1024px.png'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

function downloadQrSvgCanva() {
  if (typeof window === 'undefined' || typeof document === 'undefined' || !qrSvgMarkup.value) return
  const xmlSvg = qrSvgMarkup.value.startsWith('<?xml')
    ? qrSvgMarkup.value
    : `<?xml version="1.0" encoding="UTF-8"?>\n${qrSvgMarkup.value}`
  const blob = new Blob([xmlSvg], { type: 'image/svg+xml;charset=utf-8' })
  const objectUrl = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = objectUrl
  link.download = 'agentguard-qr-vectorial-canva.svg'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(objectUrl)
}

onMounted(() => {
  isMounted.value = true
  void generateQrAssets(targetUrl.value)
})

watch(targetUrl, (nextUrl) => {
  if (isMounted.value) {
    void generateQrAssets(nextUrl)
  }
})
</script>

<template>
  <section class="ag-qr-section" aria-label="Generador de Código QR y Atajos de Defensa Académica">
    <!-- Tarjeta Superior: Generador QR en Vivo para Proyector y Canva -->
    <div class="ag-qr-card ag-surface-card">
      <div class="ag-qr-info-col">
        <div class="ag-qr-badges">
          <span class="ag-badge ag-badge--emerald">Modo Proyección · ITU UNCuyo 2026</span>
          <span class="ag-badge ag-badge--cyan">Corrección ECC Nivel H (30%)</span>
        </div>

        <h2 class="ag-qr-heading">Acceso Instantáneo por Código QR para el Tribunal</h2>
        <p class="ag-qr-desc">
          Proyectá este código en el aula para que el jurado acceda en vivo a la documentación
          verificada o descargalo en formato vectorial <strong>SVG / PNG 1024px</strong> con
          <em>quiet-zone</em> blanca para incrustarlo en la Diapositiva 12 de Canva.
        </p>

        <!-- Selector rápido de URLs oficiales -->
        <div class="ag-qr-presets" role="group" aria-label="Enlaces rápidos preconfigurados">
          <span class="ag-field-label">Seleccionar destino rápido:</span>
          <div class="ag-preset-buttons">
            <button type="button" class="ag-btn" @click="selectCurrentBrowserUrl">
              📍 URL actual del navegador
            </button>
            <button
              type="button"
              class="ag-btn"
              :class="{ 'ag-btn--primary': targetUrl === GITHUB_PAGES_URL }"
              @click="selectGithubPagesUrl"
            >
              🌐 GitHub Pages ({{ GITHUB_PAGES_URL }})
            </button>
            <button
              type="button"
              class="ag-btn"
              :class="{ 'ag-btn--primary': targetUrl === CANVA_SLIDES_URL }"
              @click="selectCanvaUrl"
            >
              🎨 Presentación Canva ({{ CANVA_SLIDES_URL }})
            </button>
          </div>
        </div>

        <!-- Input editable en tiempo real -->
        <div class="ag-qr-input-group">
          <label for="ag-qr-url-input" class="ag-field-label">
            URL codificada en tiempo real:
          </label>
          <input
            id="ag-qr-url-input"
            v-model="targetUrl"
            type="url"
            class="ag-qr-url-input"
            placeholder="https://jmbatiatto.github.io/AgentGuard/"
            spellcheck="false"
          />
        </div>

        <!-- Botones de acción y exportación -->
        <div class="ag-qr-actions">
          <button type="button" class="ag-btn" @click="copyTargetUrl">
            {{ copiedUrl ? '✓ ¡URL copiada!' : '📋 Copiar URL' }}
          </button>
          <button
            type="button"
            class="ag-btn ag-btn--primary"
            :disabled="!qrPngDataUrl"
            @click="downloadQrPngHd"
          >
            ⬇ Descargar QR PNG HD
          </button>
          <button
            type="button"
            class="ag-btn ag-btn--cyan"
            :disabled="!qrSvgMarkup"
            @click="downloadQrSvgCanva"
          >
            ⬇ Descargar QR SVG (para Canva)
          </button>
        </div>
      </div>

      <!-- Vista Previa Grande con Quiet-Zone Blanca para Lectura Infalible desde Proyector -->
      <div class="ag-qr-preview-col">
        <div class="ag-qr-frame" aria-live="polite">
          <img
            v-if="isMounted && qrPngDataUrl && !qrError"
            :src="qrPngDataUrl"
            :alt="`Código QR hacia ${targetUrl}`"
            class="ag-qr-image"
          />
          <div v-else-if="qrError" class="ag-qr-placeholder ag-qr-placeholder--error">
            {{ qrError }}
          </div>
          <div v-else class="ag-qr-placeholder">
            Generando QR de alto contraste...
          </div>
        </div>
        <span class="ag-qr-caption">{{ targetUrl }}</span>
      </div>
    </div>

    <!-- Grilla Inferior: Atajos Rápidos para Preguntas del Jurado -->
    <div class="ag-jury-block">
      <div class="ag-jury-header">
        <span class="ag-badge ag-badge--emerald">Respuesta en 1 Clic</span>
        <h3 class="ag-jury-title">Atajos Rápidos para Preguntas del Jurado</h3>
        <p class="ag-jury-subtitle">
          Navegación directa hacia los 8 volúmenes técnicos clave durante la ronda de preguntas de
          defensa oral.
        </p>
      </div>

      <div class="ag-jury-grid">
        <a
          v-for="shortcut in juryShortcuts"
          :key="shortcut.path"
          :href="shortcut.path"
          class="ag-jury-card"
        >
          <div class="ag-jury-card-top">
            <span class="ag-jury-code">{{ shortcut.code }}</span>
            <span class="ag-badge" :class="`ag-badge--${shortcut.badgeVariant}`">
              {{ shortcut.badge }}
            </span>
          </div>
          <h4 class="ag-jury-card-title">{{ shortcut.title }}</h4>
          <p class="ag-jury-card-hint">{{ shortcut.questionHint }}</p>
          <span class="ag-jury-cta">Abrir volumen verificado →</span>
        </a>
      </div>
    </div>
  </section>
</template>

<style scoped>
.ag-qr-section {
  display: flex;
  flex-direction: column;
  gap: 2.25rem;
  margin: 1.25rem 0 2.5rem;
}

.ag-qr-card {
  display: grid;
  grid-template-columns: minmax(0, 1.45fr) minmax(280px, 0.9fr);
  gap: 2rem;
  align-items: center;
}

@media (max-width: 900px) {
  .ag-qr-card {
    grid-template-columns: 1fr;
  }
}

.ag-qr-info-col {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.ag-qr-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
}

.ag-qr-heading {
  margin: 0 !important;
  padding: 0 !important;
  border: none !important;
  font-size: 1.45rem !important;
  line-height: 1.28 !important;
  font-weight: 800 !important;
  color: var(--vp-c-text-1);
}

.ag-qr-desc {
  margin: 0 !important;
  font-size: 0.94rem;
  line-height: 1.6;
  color: var(--vp-c-text-2);
}

.ag-qr-presets,
.ag-qr-input-group {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}

.ag-field-label {
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.02em;
  color: var(--vp-c-text-2);
}

.ag-preset-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
}

.ag-qr-url-input {
  width: 100%;
  padding: 0.65rem 0.9rem;
  border-radius: 10px;
  border: 1px solid var(--ag-border-strong);
  background: var(--ag-surface-elevated);
  color: var(--vp-c-text-1);
  font-family: var(--vp-font-family-mono);
  font-size: 0.88rem;
  transition: border-color 0.16s ease, box-shadow 0.16s ease;
}

.ag-qr-url-input:focus {
  outline: none;
  border-color: var(--ag-emerald);
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.2);
}

.ag-qr-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.55rem;
  padding-top: 0.25rem;
}

.ag-qr-preview-col {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.7rem;
}

.ag-qr-frame {
  width: 280px;
  height: 280px;
  max-width: 100%;
  padding: 14px;
  border-radius: 18px;
  background: #ffffff;
  border: 3px solid #10b981;
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.28);
  display: flex;
  align-items: center;
  justify-content: center;
}

.ag-qr-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  image-rendering: crisp-edges;
}

.ag-qr-placeholder {
  text-align: center;
  font-size: 0.85rem;
  font-weight: 600;
  color: #0f172a;
  padding: 1rem;
}

.ag-qr-placeholder--error {
  color: #be123c;
}

.ag-qr-caption {
  max-width: 290px;
  text-align: center;
  font-family: var(--vp-font-family-mono);
  font-size: 0.75rem;
  color: var(--vp-c-text-3);
  word-break: break-all;
}

/* Grilla de Atajos Rápidos para el Jurado */
.ag-jury-block {
  display: flex;
  flex-direction: column;
  gap: 1.15rem;
}

.ag-jury-header {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.35rem;
}

.ag-jury-title {
  margin: 0 !important;
  font-size: 1.25rem !important;
  font-weight: 800 !important;
  color: var(--vp-c-text-1);
}

.ag-jury-subtitle {
  margin: 0 !important;
  font-size: 0.92rem;
  color: var(--vp-c-text-2);
}

.ag-jury-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(295px, 1fr));
  gap: 1rem;
}

.ag-jury-card {
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
  padding: 1.1rem 1.2rem;
  border-radius: 14px;
  border: 1px solid var(--ag-border);
  background: var(--ag-surface-card);
  text-decoration: none !important;
  box-shadow: var(--ag-shadow-sm);
  transition: transform 0.16s ease, border-color 0.16s ease, box-shadow 0.16s ease;
}

.ag-jury-card:hover {
  transform: translateY(-2px);
  border-color: var(--ag-border-accent);
  box-shadow: var(--ag-shadow-md);
}

.ag-jury-card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.ag-jury-code {
  font-family: var(--vp-font-family-mono);
  font-size: 0.78rem;
  font-weight: 800;
  color: var(--vp-c-brand-1);
}

.ag-jury-card-title {
  margin: 0 !important;
  font-size: 0.98rem !important;
  line-height: 1.35 !important;
  font-weight: 700 !important;
  color: var(--vp-c-text-1);
}

.ag-jury-card-hint {
  margin: 0 !important;
  font-size: 0.82rem;
  line-height: 1.5;
  color: var(--vp-c-text-2);
  flex: 1;
}

.ag-jury-cta {
  margin-top: 0.25rem;
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--vp-c-brand-1);
}
</style>
