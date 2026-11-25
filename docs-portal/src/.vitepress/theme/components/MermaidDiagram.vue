<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useData } from 'vitepress'

const props = defineProps<{
  code: string
  title?: string
}>()

const { isDark } = useData()

const isMounted = ref(false)
const isRendering = ref(true)
const renderError = ref<string | null>(null)
const svgMarkup = ref('')
const copiedMermaid = ref(false)

// Zoom en vista embebida
const inlineZoom = ref(1)
const MIN_INLINE_ZOOM = 0.25
const MAX_INLINE_ZOOM = 4

// Estado del Modal Proyector a pantalla completa (0.25x a 8x + pan)
const isProjectorOpen = ref(false)
const modalZoom = ref(1)
const MIN_MODAL_ZOOM = 0.25
const MAX_MODAL_ZOOM = 8
const panX = ref(0)
const panY = ref(0)
const isDragging = ref(false)
const dragStartX = ref(0)
const dragStartY = ref(0)
const dragOriginPanX = ref(0)
const dragOriginPanY = ref(0)

let renderSequence = 0
let instanceUid = ''

function normalizeMermaidCode(raw: string): string {
  if (!raw) return ''
  const lines = raw.split(/\r?\n/)
  const firstMeaningfulLine =
    lines.map((l) => l.trim()).find((l) => l.length > 0 && !l.startsWith('%%')) || ''

  if (!/^sequenceDiagram\b/i.test(firstMeaningfulLine)) {
    return raw
  }

  return lines
    .map((line) => {
      const trimmed = line.trimStart()
      if (!trimmed || trimmed.startsWith('%%')) return line
      const colonIdx = line.indexOf(':')
      if (colonIdx === -1) return line
      const head = line.slice(0, colonIdx + 1)
      const tail = line.slice(colonIdx + 1)
      const safeTail = tail
        .replace(/((?:&|#)[#a-zA-Z0-9]+;)|;\s*/g, (_match, entity) => (entity ? entity : ' · '))
        .replace(/\s*·\s*$/, '')
      return head + safeTail
    })
    .join('\n')
}

const decodedCode = computed(() => {
  if (!props.code) return ''
  try {
    return decodeURIComponent(props.code).trim()
  } catch {
    return props.code.trim()
  }
})

const normalizedCode = computed(() => normalizeMermaidCode(decodedCode.value))

const detectedDiagramLabel = computed(() => {
  if (props.title) return props.title
  const firstLine =
    decodedCode.value
      .split(/\r?\n/)
      .map((l) => l.trim())
      .find((l) => l.length > 0 && !l.startsWith('%%')) || ''

  if (/^sequenceDiagram/i.test(firstLine)) return 'Diagrama de Secuencia UML'
  if (/^erDiagram/i.test(firstLine)) return 'Modelo Entidad-Relación (MER)'
  if (/^stateDiagram/i.test(firstLine)) return 'Máquina de Estados'
  if (/^classDiagram/i.test(firstLine)) return 'Diagrama de Clases'
  if (/^(flowchart|graph)\b/i.test(firstLine)) return 'Flujo de Arquitectura / Chen'
  return 'Diagrama Vectorial Mermaid'
})

const inlineZoomPercent = computed(() => `${Math.round(inlineZoom.value * 100)}%`)
const modalZoomPercent = computed(() => `${Math.round(modalZoom.value * 100)}%`)

function clamp(val: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, Number(val.toFixed(3))))
}

function zoomInlineOut() {
  inlineZoom.value = clamp(inlineZoom.value - 0.2, MIN_INLINE_ZOOM, MAX_INLINE_ZOOM)
}

function zoomInlineIn() {
  inlineZoom.value = clamp(inlineZoom.value + 0.2, MIN_INLINE_ZOOM, MAX_INLINE_ZOOM)
}

function resetInlineZoom() {
  inlineZoom.value = 1
}

function zoomModalOut() {
  modalZoom.value = clamp(modalZoom.value / 1.25, MIN_MODAL_ZOOM, MAX_MODAL_ZOOM)
}

function zoomModalIn() {
  modalZoom.value = clamp(modalZoom.value * 1.25, MIN_MODAL_ZOOM, MAX_MODAL_ZOOM)
}

function resetModalView() {
  modalZoom.value = 1
  panX.value = 0
  panY.value = 0
}

function openProjector() {
  if (!isMounted.value || !svgMarkup.value) return
  resetModalView()
  isProjectorOpen.value = true
  if (typeof document !== 'undefined') {
    document.body.style.overflow = 'hidden'
  }
  if (typeof window !== 'undefined') {
    window.addEventListener('keydown', handleGlobalKeydown)
  }
}

function closeProjector() {
  isProjectorOpen.value = false
  isDragging.value = false
  if (typeof document !== 'undefined') {
    document.body.style.overflow = ''
  }
  if (typeof window !== 'undefined') {
    window.removeEventListener('keydown', handleGlobalKeydown)
  }
}

function handleGlobalKeydown(event: KeyboardEvent) {
  if (!isProjectorOpen.value) return
  if (event.key === 'Escape') {
    event.preventDefault()
    closeProjector()
  } else if (event.key === '+' || event.key === '=') {
    event.preventDefault()
    zoomModalIn()
  } else if (event.key === '-') {
    event.preventDefault()
    zoomModalOut()
  } else if (event.key === '0') {
    event.preventDefault()
    resetModalView()
  }
}

function onModalWheel(event: WheelEvent) {
  const factor = event.deltaY < 0 ? 1.16 : 1 / 1.16
  const nextZoom = clamp(modalZoom.value * factor, MIN_MODAL_ZOOM, MAX_MODAL_ZOOM)
  if (nextZoom === modalZoom.value) return

  const stage = event.currentTarget as HTMLElement | null
  if (stage) {
    const rect = stage.getBoundingClientRect()
    const cursorOffsetX = event.clientX - (rect.left + rect.width / 2)
    const cursorOffsetY = event.clientY - (rect.top + rect.height / 2)
    const scaleRatio = nextZoom / modalZoom.value
    panX.value = cursorOffsetX - (cursorOffsetX - panX.value) * scaleRatio
    panY.value = cursorOffsetY - (cursorOffsetY - panY.value) * scaleRatio
  }

  modalZoom.value = nextZoom
}

function onDragStart(event: MouseEvent) {
  if (event.button !== 0) return
  isDragging.value = true
  dragStartX.value = event.clientX
  dragStartY.value = event.clientY
  dragOriginPanX.value = panX.value
  dragOriginPanY.value = panY.value
}

function onDragMove(event: MouseEvent) {
  if (!isDragging.value) return
  panX.value = dragOriginPanX.value + (event.clientX - dragStartX.value)
  panY.value = dragOriginPanY.value + (event.clientY - dragStartY.value)
}

function onDragEnd() {
  isDragging.value = false
}

async function copyMermaidSource() {
  if (typeof navigator === 'undefined' || !navigator.clipboard) return
  try {
    await navigator.clipboard.writeText(normalizedCode.value)
    copiedMermaid.value = true
    setTimeout(() => {
      copiedMermaid.value = false
    }, 2000)
  } catch {
    // Sin fallo ruidoso si el navegador restringe portapapeles
  }
}

function downloadRenderedSvg() {
  if (typeof window === 'undefined' || typeof document === 'undefined' || !svgMarkup.value) return
  const xmlPayload = svgMarkup.value.startsWith('<?xml')
    ? svgMarkup.value
    : `<?xml version="1.0" encoding="UTF-8"?>\n${svgMarkup.value}`
  const blob = new Blob([xmlPayload], { type: 'image/svg+xml;charset=utf-8' })
  const objectUrl = URL.createObjectURL(blob)
  const slug = detectedDiagramLabel.value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  const link = document.createElement('a')
  link.href = objectUrl
  link.download = `agentguard-${slug || 'diagrama'}.svg`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(objectUrl)
}

async function renderMermaidDiagram() {
  if (!isMounted.value || !decodedCode.value) return

  const currentSeq = ++renderSequence
  isRendering.value = true
  renderError.value = null

  const elementId = `${instanceUid}-${currentSeq}`

  try {
    const mermaidMod = await import('mermaid')
    const mermaid = mermaidMod.default ?? mermaidMod

    mermaid.initialize({
      startOnLoad: false,
      securityLevel: 'loose',
      theme: isDark.value ? 'dark' : 'default',
      fontFamily: 'Inter, Segoe UI, system-ui, -apple-system, sans-serif',
      flowchart: {
        useMaxWidth: true,
        htmlLabels: true,
        curve: 'basis'
      },
      sequence: {
        useMaxWidth: true
      },
      er: {
        useMaxWidth: true
      },
      themeVariables: isDark.value
        ? {
            darkMode: true,
            background: '#0b1120',
            primaryColor: '#132238',
            primaryTextColor: '#f8fafc',
            primaryBorderColor: '#10b981',
            lineColor: '#38bdf8',
            secondaryColor: '#1e293b',
            tertiaryColor: '#0f172a',
            noteBkgColor: '#132238',
            noteTextColor: '#f8fafc',
            noteBorderColor: '#06b6d4'
          }
        : undefined
    })

    const { svg } = await mermaid.render(elementId, normalizedCode.value)
    if (currentSeq !== renderSequence) return
    svgMarkup.value = svg
  } catch (err) {
    if (currentSeq !== renderSequence) return
    renderError.value =
      err instanceof Error ? err.message : 'No se pudo renderizar el diagrama Mermaid.'
    if (typeof document !== 'undefined') {
      const orphan = document.getElementById(`d${elementId}`) || document.getElementById(elementId)
      orphan?.remove()
    }
  } finally {
    if (currentSeq === renderSequence) {
      isRendering.value = false
    }
  }
}

onMounted(() => {
  instanceUid = `ag-mmd-${Math.random().toString(36).slice(2, 9)}`
  isMounted.value = true
  void renderMermaidDiagram()
})

watch(
  () => [isDark.value, props.code],
  () => {
    if (isMounted.value) {
      void renderMermaidDiagram()
    }
  }
)

onBeforeUnmount(() => {
  if (isProjectorOpen.value) {
    closeProjector()
  }
})
</script>

<template>
  <figure class="ag-mermaid-wrapper" role="region" :aria-label="detectedDiagramLabel">
    <!-- Barra de herramientas superior 100% en español -->
    <div class="ag-toolbar">
      <div class="ag-toolbar-group">
        <span class="ag-badge ag-badge--emerald">SVG Vectorial</span>
        <span class="ag-mermaid-label">{{ detectedDiagramLabel }}</span>
      </div>

      <div class="ag-toolbar-group" role="toolbar" aria-label="Controles del diagrama">
        <button
          type="button"
          class="ag-btn"
          title="Alejar vista del diagrama"
          :disabled="!svgMarkup || inlineZoom <= MIN_INLINE_ZOOM"
          @click="zoomInlineOut"
        >
          Alejar (-)
        </button>
        <span class="ag-zoom-readout" aria-live="polite">{{ inlineZoomPercent }}</span>
        <button
          type="button"
          class="ag-btn"
          title="Acercar vista del diagrama"
          :disabled="!svgMarkup || inlineZoom >= MAX_INLINE_ZOOM"
          @click="zoomInlineIn"
        >
          Acercar (+)
        </button>
        <button
          type="button"
          class="ag-btn"
          title="Restablecer escala al 100%"
          :disabled="!svgMarkup || inlineZoom === 1"
          @click="resetInlineZoom"
        >
          Restablecer
        </button>
        <button
          type="button"
          class="ag-btn ag-btn--primary"
          title="Abrir en pantalla completa con zoom de rueda y arrastre"
          :disabled="!svgMarkup"
          @click="openProjector"
        >
          ⛶ Modo Proyector
        </button>
        <button
          type="button"
          class="ag-btn"
          title="Copiar código fuente Mermaid al portapapeles"
          @click="copyMermaidSource"
        >
          {{ copiedMermaid ? '✓ ¡Copiado!' : 'Copiar Mermaid' }}
        </button>
        <button
          type="button"
          class="ag-btn ag-btn--cyan"
          title="Descargar archivo vectorial SVG"
          :disabled="!svgMarkup"
          @click="downloadRenderedSvg"
        >
          Descargar SVG
        </button>
      </div>
    </div>

    <!-- Lienzo embebido -->
    <div class="ag-mermaid-viewport">
      <div v-if="!isMounted || (isRendering && !svgMarkup)" class="ag-mermaid-status">
        <span class="ag-spinner" aria-hidden="true" />
        <span>Renderizando diagrama vectorial en alta definición...</span>
      </div>

      <div v-else-if="renderError" class="ag-mermaid-error" role="alert">
        <p class="ag-mermaid-error-title">No se pudo compilar la vista gráfica del diagrama</p>
        <p class="ag-mermaid-error-detail">{{ renderError }}</p>
        <pre class="ag-mermaid-fallback"><code>{{ decodedCode }}</code></pre>
      </div>

      <div
        v-else
        class="ag-mermaid-canvas"
        :style="{
          transform: `scale(${inlineZoom})`,
          transformOrigin: inlineZoom > 1 ? 'top left' : 'top center'
        }"
        @dblclick="openProjector"
        v-html="svgMarkup"
      />
    </div>

    <!-- Modal Proyector a Pantalla Completa (SSR Safe con isMounted && isProjectorOpen) -->
    <Teleport v-if="isMounted && isProjectorOpen" to="body">
      <div
        class="ag-projector-overlay"
        role="dialog"
        aria-modal="true"
        :aria-label="`Modo Proyector: ${detectedDiagramLabel}`"
      >
        <header class="ag-projector-header">
          <div class="ag-projector-title">
            <span class="ag-badge ag-badge--emerald">Modo Proyector</span>
            <span>{{ detectedDiagramLabel }}</span>
            <span class="ag-projector-hint">
              Rueda: Zoom (0.25x–8x) · Arrastrar: Mover · ESC: Cerrar
            </span>
          </div>

          <div class="ag-toolbar-group">
            <button
              type="button"
              class="ag-btn"
              title="Alejar (-)"
              :disabled="modalZoom <= MIN_MODAL_ZOOM"
              @click="zoomModalOut"
            >
              -
            </button>
            <span class="ag-zoom-readout ag-zoom-readout--dark">{{ modalZoomPercent }}</span>
            <button
              type="button"
              class="ag-btn"
              title="Acercar (+)"
              :disabled="modalZoom >= MAX_MODAL_ZOOM"
              @click="zoomModalIn"
            >
              +
            </button>
            <button
              type="button"
              class="ag-btn"
              title="Restablecer zoom y posición"
              @click="resetModalView"
            >
              Restablecer
            </button>
            <button type="button" class="ag-btn" @click="copyMermaidSource">
              {{ copiedMermaid ? '✓ ¡Copiado!' : 'Copiar Mermaid' }}
            </button>
            <button type="button" class="ag-btn ag-btn--cyan" @click="downloadRenderedSvg">
              Descargar SVG
            </button>
            <button
              type="button"
              class="ag-btn ag-btn--danger"
              title="Salir del modo pantalla completa (ESC)"
              @click="closeProjector"
            >
              ✕ Cerrar
            </button>
          </div>
        </header>

        <div
          class="ag-projector-stage"
          :class="{
            'is-dragging': isDragging,
            'ag-projector-stage--light': !isDark
          }"
          @wheel.prevent="onModalWheel"
          @mousedown="onDragStart"
          @mousemove="onDragMove"
          @mouseup="onDragEnd"
          @mouseleave="onDragEnd"
        >
          <div
            class="ag-projector-canvas ag-projector-mermaid-svg"
            :style="{
              transform: `translate3d(${panX}px, ${panY}px, 0) scale(${modalZoom})`
            }"
            v-html="svgMarkup"
          />
        </div>
      </div>
    </Teleport>
  </figure>
</template>

<style scoped>
.ag-mermaid-wrapper {
  margin: 1.5rem 0;
  border: 1px solid var(--ag-border);
  border-radius: 14px;
  background: var(--ag-surface-card);
  box-shadow: var(--ag-shadow-sm);
  overflow: hidden;
}

.ag-mermaid-label {
  font-size: 0.84rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
}

.ag-zoom-readout {
  min-width: 3.4rem;
  text-align: center;
  font-family: var(--vp-font-family-mono);
  font-size: 0.78rem;
  font-weight: 700;
  padding: 0.32rem 0.45rem;
  border-radius: 7px;
  background: var(--ag-surface-subtle);
  color: var(--vp-c-text-1);
  border: 1px solid var(--ag-border);
}

.ag-zoom-readout--dark {
  background: #0b1120;
  color: #6ee7b7;
  border-color: #334155;
}

.ag-mermaid-viewport {
  width: 100%;
  min-height: 160px;
  max-height: 760px;
  overflow: auto;
  padding: 1.35rem 1.25rem;
  background: var(--ag-surface-canvas);
}

.ag-mermaid-canvas {
  display: flex;
  justify-content: center;
  align-items: center;
  transition: transform 0.12s ease-out;
  cursor: zoom-in;
}

.ag-mermaid-canvas :deep(svg) {
  max-width: 100%;
  height: auto;
}

.ag-projector-mermaid-svg :deep(svg) {
  max-width: min(88vw, 1680px);
  max-height: 82vh;
  width: auto;
  height: auto;
}

.ag-mermaid-status {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.7rem;
  min-height: 140px;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--vp-c-text-2);
}

.ag-spinner {
  width: 1.15rem;
  height: 1.15rem;
  border-radius: 50%;
  border: 2px solid var(--ag-border-strong);
  border-top-color: var(--ag-emerald);
  animation: ag-spin 0.75s linear infinite;
}

@keyframes ag-spin {
  to {
    transform: rotate(360deg);
  }
}

.ag-mermaid-error {
  padding: 1rem;
  border-radius: 10px;
  border: 1px solid rgba(244, 63, 94, 0.45);
  background: rgba(244, 63, 94, 0.08);
}

.ag-mermaid-error-title {
  margin: 0 0 0.35rem;
  font-weight: 700;
  color: var(--ag-rose);
}

.ag-mermaid-error-detail {
  margin: 0 0 0.75rem;
  font-size: 0.84rem;
  color: var(--vp-c-text-2);
}

.ag-mermaid-fallback {
  margin: 0;
  padding: 0.85rem;
  overflow-x: auto;
  border-radius: 8px;
  background: #0b1120;
  color: #e2e8f0;
  font-size: 0.8rem;
}

.ag-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
  transform: none;
}
</style>
