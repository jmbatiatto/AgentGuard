<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { withBase } from 'vitepress'

export interface DiagramManifestItem {
  index?: number
  id: string
  title: string
  category: string
  diagramType?: string
  docFile?: string
  docSlug: string
  mermaidCode?: string
  svgFile: string
  pngDarkFile: string
  pngLightFile: string
  width?: number
  height?: number
}

const CATEGORIES = [
  'Todos',
  'Base de Datos y Chen',
  'Runtime PEP/PDP y Secuencias',
  'Frontend y RBAC',
  'ACME Corp y Gemini',
  'Navegación'
] as const

type CategoryFilter = (typeof CATEGORIES)[number]

const isMounted = ref(false)
const isLoading = ref(true)
const loadError = ref<string | null>(null)
const generatedAt = ref<string | null>(null)
const items = ref<DiagramManifestItem[]>([])

const searchQuery = ref('')
const activeCategory = ref<CategoryFilter>('Todos')

// Detección de assets estáticos vs. modo nube ligero (Vercel)
const hasStaticAssets = ref(true)
const renderedDarkSvgs = ref<Record<string, string>>({})
const renderedLightSvgs = ref<Record<string, string>>({})
const downloadingKey = ref<string | null>(null)
const downloadError = ref<string | null>(null)
const failedSvgIds = ref<Record<string, boolean>>({})
let mermaidRenderChain: Promise<void> = Promise.resolve()
let clientSvgCounter = 0

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

async function renderMermaidSvg(
  code: string,
  mode: 'dark' | 'light',
  pureSvgForCanvas = false
): Promise<string> {
  if (!code || typeof window === 'undefined') return ''
  const normalized = normalizeMermaidCode(code)

  const runRender = async (): Promise<string> => {
    const mermaidMod = await import('mermaid')
    const mermaid = mermaidMod.default ?? mermaidMod
    const elementId = `ag-gal-${mode}-${++clientSvgCounter}`

    mermaid.initialize({
      startOnLoad: false,
      securityLevel: 'loose',
      theme: mode === 'dark' ? 'dark' : 'default',
      fontFamily: 'Inter, Segoe UI, system-ui, -apple-system, sans-serif',
      htmlLabels: !pureSvgForCanvas,
      flowchart: {
        useMaxWidth: !pureSvgForCanvas,
        htmlLabels: !pureSvgForCanvas,
        curve: 'basis'
      },
      sequence: {
        useMaxWidth: !pureSvgForCanvas
      },
      er: {
        useMaxWidth: !pureSvgForCanvas
      },
      themeVariables:
        mode === 'dark'
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
          : {
              darkMode: false,
              background: '#ffffff',
              primaryColor: '#f0fdf4',
              primaryTextColor: '#0f172a',
              primaryBorderColor: '#047857',
              lineColor: '#0284c7',
              secondaryColor: '#f8fafc',
              tertiaryColor: '#f1f5f9',
              noteBkgColor: '#f0fdf4',
              noteTextColor: '#0f172a',
              noteBorderColor: '#0e7490'
            }
    })

    try {
      const { svg } = await mermaid.render(elementId, normalized)
      return svg
    } catch (err) {
      if (typeof document !== 'undefined') {
        const orphan = document.getElementById(`d${elementId}`) || document.getElementById(elementId)
        orphan?.remove()
      }
      throw err
    }
  }

  const nextTask = mermaidRenderChain.then(runRender, runRender)
  mermaidRenderChain = nextTask.then(
    () => undefined,
    () => undefined
  )
  return nextTask
}

async function renderAllClientPreviews() {
  for (const item of items.value) {
    if (!isMounted.value) return
    if (!item.mermaidCode || renderedDarkSvgs.value[item.id]) continue
    try {
      const svg = await renderMermaidSvg(item.mermaidCode, 'dark', false)
      renderedDarkSvgs.value = { ...renderedDarkSvgs.value, [item.id]: svg }
    } catch {
      // Continuar con el resto si un diagrama puntual fallara en cliente
    }
  }
}

async function ensureLightSvg(item: DiagramManifestItem) {
  if (!item.mermaidCode || renderedLightSvgs.value[item.id]) return
  try {
    const svg = await renderMermaidSvg(item.mermaidCode, 'light', false)
    renderedLightSvgs.value = { ...renderedLightSvgs.value, [item.id]: svg }
  } catch {
    // Fallback al SVG oscuro si falla el claro
  }
}

function triggerBlobDownload(blob: Blob, filename: string) {
  if (typeof window === 'undefined' || typeof document === 'undefined') return
  const objectUrl = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = objectUrl
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  setTimeout(() => URL.revokeObjectURL(objectUrl), 1000)
}

async function downloadClientSvg(item: DiagramManifestItem) {
  if (!item.mermaidCode || typeof window === 'undefined') return
  const key = `${item.id}:svg`
  downloadingKey.value = key
  downloadError.value = null
  try {
    const svg =
      renderedDarkSvgs.value[item.id] || (await renderMermaidSvg(item.mermaidCode, 'dark', false))
    const xmlPayload = svg.startsWith('<?xml') ? svg : `<?xml version="1.0" encoding="UTF-8"?>\n${svg}`
    const blob = new Blob([xmlPayload], { type: 'image/svg+xml;charset=utf-8' })
    triggerBlobDownload(blob, getDownloadFilename(item.svgFile, 'svg'))
  } catch (err) {
    downloadError.value =
      err instanceof Error ? err.message : 'No se pudo generar el SVG vectorial.'
  } finally {
    if (downloadingKey.value === key) downloadingKey.value = null
  }
}

function normalizeSvgDimensionsForCanvas(rawSvg: string, fallbackWidth = 1280, fallbackHeight = 720) {
  let width = fallbackWidth
  let height = fallbackHeight

  const viewBoxMatch = rawSvg.match(/viewBox\s*=\s*["']\s*([-\d.]+)\s+([-\d.]+)\s+([\d.]+)\s+([\d.]+)\s*["']/i)
  if (viewBoxMatch) {
    const vbW = Number(viewBoxMatch[3])
    const vbH = Number(viewBoxMatch[4])
    if (Number.isFinite(vbW) && vbW > 0 && Number.isFinite(vbH) && vbH > 0) {
      width = vbW
      height = vbH
    }
  } else {
    const wMatch = rawSvg.match(/\bwidth\s*=\s*["']\s*([\d.]+)/i)
    const hMatch = rawSvg.match(/\bheight\s*=\s*["']\s*([\d.]+)/i)
    if (wMatch && hMatch) {
      const wVal = Number(wMatch[1])
      const hVal = Number(hMatch[1])
      if (Number.isFinite(wVal) && wVal > 0 && Number.isFinite(hVal) && hVal > 0) {
        width = wVal
        height = hVal
      }
    }
  }

  let prepared = rawSvg
  if (!/\bxmlns\s*=/.test(prepared)) {
    prepared = prepared.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"')
  }
  prepared = prepared.replace(/<svg\b([^>]*)>/i, (_full, attrs: string) => {
    const cleaned = attrs
      .replace(/\s+width\s*=\s*["'][^"']*["']/gi, '')
      .replace(/\s+height\s*=\s*["'][^"']*["']/gi, '')
      .replace(/\s+style\s*=\s*["'][^"']*max-width[^"']*["']/gi, '')
    return `<svg${cleaned} width="${Math.round(width)}" height="${Math.round(height)}">`
  })

  return { svg: prepared, width, height }
}

async function downloadClientPng4k(item: DiagramManifestItem, mode: 'dark' | 'light') {
  if (!item.mermaidCode || typeof window === 'undefined' || typeof document === 'undefined') return
  const key = `${item.id}:png-${mode}`
  downloadingKey.value = key
  downloadError.value = null

  try {
    const rawSvg = await renderMermaidSvg(item.mermaidCode, mode, true)
    const { svg, width, height } = normalizeSvgDimensionsForCanvas(
      rawSvg,
      item.width ? Math.round(item.width / 3) : 1280,
      item.height ? Math.round(item.height / 3) : 720
    )

    const targetLongSide = 3840
    const padding = 96
    const maxCanvasDim = 7680
    const rawScale = Math.max(2, Math.min(4, targetLongSide / Math.max(width, height)))
    const maxScaleForCap = Math.min(
      (maxCanvasDim - padding * 2) / width,
      (maxCanvasDim - padding * 2) / height
    )
    const scale = Math.max(1, Math.min(rawScale, maxScaleForCap))

    const drawW = Math.round(width * scale)
    const drawH = Math.round(height * scale)
    const canvasW = drawW + padding * 2
    const canvasH = drawH + padding * 2

    const img = new Image()
    img.crossOrigin = 'anonymous'
    const svgDataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`

    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve()
      img.onerror = () => reject(new Error('El navegador no pudo rasterizar el SVG a PNG 4K.'))
      img.src = svgDataUrl
    })

    const canvas = document.createElement('canvas')
    canvas.width = canvasW
    canvas.height = canvasH
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('No se pudo inicializar el lienzo 2D para exportar PNG.')

    ctx.fillStyle = mode === 'dark' ? '#0b1120' : '#ffffff'
    ctx.fillRect(0, 0, canvasW, canvasH)
    ctx.drawImage(img, padding, padding, drawW, drawH)

    const pngBlob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) resolve(blob)
        else reject(new Error('Falló la codificación PNG desde el lienzo 4K.'))
      }, 'image/png')
    })

    const suffix = mode === 'dark' ? item.pngDarkFile : item.pngLightFile
    triggerBlobDownload(pngBlob, getDownloadFilename(suffix, 'png'))
  } catch (err) {
    downloadError.value =
      err instanceof Error ? err.message : 'No se pudo generar el PNG 4K en el navegador.'
  } finally {
    if (downloadingKey.value === key) downloadingKey.value = null
  }
}

// Estado del Modal Proyector Interactivo
const activeItem = ref<DiagramManifestItem | null>(null)
const projectorBgMode = ref<'dark' | 'light'>('dark')
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
const copiedCodeId = ref<string | null>(null)

function stripFolderPrefix(filePath: string | undefined, folder: string): string {
  if (!filePath) return ''
  return filePath
    .trim()
    .replace(/^\/+/, '')
    .replace(/^diagramas-hd\//i, '')
    .replace(new RegExp(`^${folder}/`, 'i'), '')
}

function getSvgUrl(item: DiagramManifestItem): string {
  const clean = stripFolderPrefix(item.svgFile, 'svg')
  return clean ? withBase(`/diagramas-hd/svg/${clean}`) : ''
}

function getPngDarkUrl(item: DiagramManifestItem): string {
  const clean = stripFolderPrefix(item.pngDarkFile, 'png-4k-dark')
  return clean ? withBase(`/diagramas-hd/png-4k-dark/${clean}`) : ''
}

function getPngLightUrl(item: DiagramManifestItem): string {
  const clean = stripFolderPrefix(item.pngLightFile, 'png-4k-light')
  return clean ? withBase(`/diagramas-hd/png-4k-light/${clean}`) : ''
}

function getCardPreviewUrl(item: DiagramManifestItem): string {
  return failedSvgIds.value[item.id] ? getPngDarkUrl(item) : getSvgUrl(item)
}

function handleSvgImgError(itemId: string) {
  if (!failedSvgIds.value[itemId]) {
    failedSvgIds.value = { ...failedSvgIds.value, [itemId]: true }
  }
}

function getDocUrl(item: DiagramManifestItem): string {
  const rawSlug = (item.docSlug || item.docFile || 'INDICE_MAESTRO')
    .trim()
    .replace(/^\/+/, '')
    .replace(/^volumenes\//i, '')
    .replace(/\.md$/i, '')
  return withBase(`/volumenes/${rawSlug}`)
}

function getInteractiveExplorerHref(item: DiagramManifestItem): string | null {
  const slug = (item.docSlug || item.docFile || '').trim().replace(/\.md$/i, '')
  const titleLower = (item.title || '').toLowerCase()

  if (
    titleLower.includes('doble persistencia') ||
    (titleLower.includes('acme') && (titleLower.includes('sqlite') || titleLower.includes('mer')))
  ) {
    return '/explorador?vista=mer-acme'
  }

  if (
    (slug === '01_MER_RELACIONAL_Y_FISICO_DB' &&
      !titleLower.includes('alembic') &&
      !titleLower.includes('acme')) ||
    slug === '02_MER_CONCEPTUAL_CHEN_Y_ATRIBUTOS'
  ) {
    return '/explorador?vista=mer-postgres'
  }

  if (
    slug === '03_ARQUITECTURA_RUNTIME_PEP_PDP_Y_API_REST' ||
    slug === '04_SECUENCIA_DEMO_ESTADOS_Y_CASOS_DE_USO' ||
    (slug === 'README' &&
      (titleLower.includes('arquitectura') || titleLower.includes('escenario')))
  ) {
    return '/explorador?vista=runtime-flow'
  }

  return null
}

function getDownloadFilename(fileValue: string | undefined, suffix: string): string {
  if (!fileValue) return `agentguard-diagrama.${suffix}`
  const parts = fileValue.split('/')
  const baseName = parts[parts.length - 1] || `agentguard-diagrama.${suffix}`
  return baseName
}

function formatDiagramType(rawType?: string): string {
  if (!rawType) return 'Mermaid'
  const lower = rawType.toLowerCase()
  if (lower.includes('sequence')) return 'Secuencia'
  if (lower.includes('er')) return 'MER Físico'
  if (lower.includes('state')) return 'Estados'
  if (lower.includes('class')) return 'Clases'
  if (lower.includes('flow') || lower.includes('graph')) return 'Arquitectura / Flujo'
  return rawType
}

function formatDocBadge(item: DiagramManifestItem): string {
  const slug = (item.docSlug || item.docFile || '').replace(/\.md$/i, '')
  if (!slug) return 'Volumen Oficial'
  const match = slug.match(/^(\d{2})_/)
  if (match) return `Vol. ${match[1]}`
  if (slug === 'README') return 'Guía README'
  if (slug === 'INDICE_MAESTRO') return 'Índice Maestro'
  if (slug === 'DECISIONS') return 'ADRs'
  return slug
}

function formatIndexBadge(item: DiagramManifestItem, fallbackIdx: number): string {
  const num = typeof item.index === 'number' ? item.index : fallbackIdx + 1
  return `#${String(num).padStart(2, '0')}`
}

const categoryCounts = computed<Record<CategoryFilter, number>>(() => {
  const counts: Record<CategoryFilter, number> = {
    Todos: items.value.length,
    'Base de Datos y Chen': 0,
    'Runtime PEP/PDP y Secuencias': 0,
    'Frontend y RBAC': 0,
    'ACME Corp y Gemini': 0,
    Navegación: 0
  }
  for (const item of items.value) {
    const cat = item.category as CategoryFilter
    if (cat in counts && cat !== 'Todos') {
      counts[cat] += 1
    }
  }
  return counts
})

const filteredItems = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  return items.value.filter((item) => {
    const matchesCategory =
      activeCategory.value === 'Todos' || item.category === activeCategory.value
    if (!matchesCategory) return false
    if (!q) return true

    const haystack = [
      item.title,
      item.id,
      item.svgFile,
      item.docFile,
      item.docSlug,
      item.category,
      item.diagramType
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()

    return haystack.includes(q)
  })
})

const modalZoomPercent = computed(() => `${Math.round(modalZoom.value * 100)}%`)

function clamp(val: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, Number(val.toFixed(3))))
}

async function fetchManifest() {
  isLoading.value = true
  loadError.value = null

  try {
    const response = await fetch(withBase('/diagramas-hd/manifest.json'), {
      headers: { Accept: 'application/json' }
    })

    if (!response.ok) {
      throw new Error(
        response.status === 404
          ? 'El manifiesto /diagramas-hd/manifest.json aún no fue sincronizado en este entorno.'
          : `Error HTTP ${response.status} al cargar el catálogo de diagramas.`
      )
    }

    const payload = await response.json()
    const extracted: DiagramManifestItem[] = Array.isArray(payload)
      ? payload
      : Array.isArray(payload?.diagrams)
        ? payload.diagrams
        : Array.isArray(payload?.items)
          ? payload.items
          : []

    items.value = extracted
    generatedAt.value = typeof payload?.generatedAt === 'string' ? payload.generatedAt : null

    if (extracted.length > 0 && typeof window !== 'undefined') {
      const probeUrl = getSvgUrl(extracted[0])
      let staticAvailable = false
      if (probeUrl) {
        try {
          const headRes = await fetch(probeUrl, { method: 'HEAD' })
          const contentType = (headRes.headers.get('content-type') || '').toLowerCase()
          staticAvailable = headRes.ok && contentType.includes('svg')
        } catch {
          staticAvailable = false
        }
      }
      hasStaticAssets.value = staticAvailable
      if (!staticAvailable) {
        void renderAllClientPreviews()
      }
    }
  } catch (err) {
    loadError.value =
      err instanceof Error ? err.message : 'No se pudo cargar el catálogo de diagramas HD.'
  } finally {
    isLoading.value = false
  }
}

function toggleProjectorBgMode() {
  const nextMode = projectorBgMode.value === 'dark' ? 'light' : 'dark'
  projectorBgMode.value = nextMode
  if (nextMode === 'light' && !hasStaticAssets.value && activeItem.value) {
    void ensureLightSvg(activeItem.value)
  }
}

function openProjector(item: DiagramManifestItem) {
  if (!isMounted.value) return
  activeItem.value = item
  projectorBgMode.value = 'dark'
  resetModalView()
  if (typeof document !== 'undefined') {
    document.body.style.overflow = 'hidden'
  }
  if (typeof window !== 'undefined') {
    window.addEventListener('keydown', handleKeydown)
  }
}

function closeProjector() {
  activeItem.value = null
  isDragging.value = false
  if (typeof document !== 'undefined') {
    document.body.style.overflow = ''
  }
  if (typeof window !== 'undefined') {
    window.removeEventListener('keydown', handleKeydown)
  }
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

function handleKeydown(event: KeyboardEvent) {
  if (!activeItem.value) return
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

async function copyMermaidCode(item: DiagramManifestItem) {
  if (!item.mermaidCode || typeof navigator === 'undefined' || !navigator.clipboard) return
  try {
    await navigator.clipboard.writeText(item.mermaidCode)
    copiedCodeId.value = item.id
    setTimeout(() => {
      if (copiedCodeId.value === item.id) {
        copiedCodeId.value = null
      }
    }, 2000)
  } catch {
    // Ignorar silenciosamente si el navegador bloquea el portapapeles
  }
}

onMounted(() => {
  isMounted.value = true
  void fetchManifest()
})

onBeforeUnmount(() => {
  if (activeItem.value) {
    closeProjector()
  }
})
</script>

<template>
  <section class="ag-gallery-root" aria-label="Galería Interactiva de Diagramas 4K y SVG">
    <!-- Banner directo al Explorador Interactivo de Nodos (Vue Flow) -->
    <aside
      class="ag-explorer-callout ag-surface-card"
      aria-label="Acceso al Explorador Interactivo de Nodos"
    >
      <div class="ag-explorer-callout-main">
        <span class="ag-explorer-callout-icon" aria-hidden="true">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <circle cx="5" cy="6" r="2.5" />
            <circle cx="19" cy="6" r="2.5" />
            <circle cx="12" cy="18" r="2.5" />
            <path d="M7.3 7.2 10.6 15.8" />
            <path d="M16.7 7.2 13.4 15.8" />
            <path d="M7.5 6h9" />
          </svg>
        </span>
        <div class="ag-explorer-callout-copy">
          <h2 class="ag-explorer-callout-title">Explorador Interactivo de Nodos y Relaciones</h2>
          <p class="ag-explorer-callout-desc">
            En esta galería descargás los 27 diagramas en SVG vectorial y PNG 4K. Para recorrer
            entidad por entidad las 13 tablas PostgreSQL, las 7 tablas SQLite de ACME Corp y el
            flujo runtime PEP/PDP con explicaciones en español, abrí el mapa interactivo.
          </p>
        </div>
      </div>
      <a :href="withBase('/explorador')" class="ag-btn ag-btn--primary ag-explorer-callout-cta">
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <circle cx="5" cy="6" r="2.5" />
          <circle cx="19" cy="6" r="2.5" />
          <circle cx="12" cy="18" r="2.5" />
          <path d="M7.3 7.2 10.6 15.8" />
          <path d="M16.7 7.2 13.4 15.8" />
          <path d="M7.5 6h9" />
        </svg>
        <span>Abrir Explorador Interactivo de Nodos</span>
      </a>
    </aside>

    <!-- Barra de búsqueda instantánea y filtros por categoría -->
    <div class="ag-gallery-controls ag-surface-card">
      <div class="ag-gallery-search-row">
        <div class="ag-search-input-wrap">
          <span class="ag-search-icon" aria-hidden="true">🔎</span>
          <input
            v-model="searchQuery"
            type="search"
            class="ag-search-input"
            placeholder="Buscar diagrama por título, volumen, tipo (Chen, PEP, Secuencia) o archivo..."
            aria-label="Buscar diagramas por título o nombre de archivo"
          />
          <button
            v-if="searchQuery"
            type="button"
            class="ag-clear-btn"
            title="Limpiar búsqueda"
            @click="searchQuery = ''"
          >
            ✕
          </button>
        </div>

        <div class="ag-gallery-stats" aria-live="polite">
          <span class="ag-badge ag-badge--emerald">
            {{ filteredItems.length }} de {{ items.length }} diagramas
          </span>
          <span v-if="generatedAt" class="ag-badge ag-badge--neutral">
            Pack 4K sincronizado
          </span>
        </div>
      </div>

      <div class="ag-category-pills" role="tablist" aria-label="Filtrar diagramas por categoría">
        <button
          v-for="cat in CATEGORIES"
          :key="cat"
          type="button"
          role="tab"
          class="ag-pill-btn"
          :class="{ 'is-active': activeCategory === cat }"
          :aria-selected="activeCategory === cat"
          @click="activeCategory = cat"
        >
          <span>{{ cat }}</span>
          <span class="ag-pill-count">{{ categoryCounts[cat] }}</span>
        </button>
      </div>
    </div>

    <!-- Estado de carga (SSR Safe) -->
    <div v-if="downloadError" class="ag-gallery-empty ag-surface-card" role="alert">
      <p>{{ downloadError }}</p>
    </div>

    <div v-if="!isMounted || isLoading" class="ag-gallery-loading-grid" aria-busy="true">
      <div v-for="n in 6" :key="n" class="ag-skeleton-card">
        <div class="ag-skeleton-thumb" />
        <div class="ag-skeleton-line ag-skeleton-line--lg" />
        <div class="ag-skeleton-line ag-skeleton-line--sm" />
      </div>
    </div>

    <!-- Estado de error / aún no exportado -->
    <div v-else-if="loadError" class="ag-gallery-empty ag-surface-card" role="status">
      <div class="ag-empty-header">
        <span class="ag-badge ag-badge--amber">Diagnóstico de Assets HD</span>
        <h3>Catálogo 4K pendiente de sincronización</h3>
      </div>
      <p>{{ loadError }}</p>
      <p class="ag-empty-cmd">
        Ejecutá <code>pnpm run docs:diagrams</code> y luego
        <code>pnpm --dir docs-portal run prepare-content</code> desde la raíz del repositorio para
        generar los 27 diagramas en SVG vectorial y PNG 4K.
      </p>
      <button type="button" class="ag-btn ag-btn--primary" @click="fetchManifest">
        ↻ Reintentar carga
      </button>
    </div>

    <!-- Sin coincidencias en búsqueda -->
    <div
      v-else-if="filteredItems.length === 0"
      class="ag-gallery-empty ag-surface-card"
      role="status"
    >
      <h3>No se encontraron diagramas para ese criterio</h3>
      <p>
        Probá con otro término de búsqueda o restablecé el filtro de categoría a
        <strong>Todos</strong>.
      </p>
      <button
        type="button"
        class="ag-btn ag-btn--primary"
        @click="
          searchQuery = '';
          activeCategory = 'Todos'
        "
      >
        Mostrar todos los diagramas ({{ items.length }})
      </button>
    </div>

    <!-- Grilla de Tarjetas HD -->
    <div v-else class="ag-gallery-grid">
      <article v-for="(item, idx) in filteredItems" :key="item.id" class="ag-diagram-card">
        <!-- Vista previa nítida -->
        <div
          class="ag-card-preview"
          role="button"
          tabindex="0"
          :aria-label="`Abrir proyector interactivo para ${item.title}`"
          @click="openProjector(item)"
          @keydown.enter.prevent="openProjector(item)"
          @keydown.space.prevent="openProjector(item)"
        >
          <img
            v-if="hasStaticAssets"
            :src="getCardPreviewUrl(item)"
            :alt="item.title"
            loading="lazy"
            decoding="async"
            class="ag-card-img"
            @error="handleSvgImgError(item.id)"
          />
          <div
            v-else-if="renderedDarkSvgs[item.id]"
            class="ag-card-svg-inline"
            v-html="renderedDarkSvgs[item.id]"
          />
          <div v-else class="ag-card-rendering">
            <span class="ag-spinner" aria-hidden="true" />
            <span>Renderizando diagrama vectorial...</span>
          </div>
          <div class="ag-card-overlay-badge">
            <span>⛶ Ampliar en Proyector</span>
          </div>
        </div>

        <!-- Metadatos y badges -->
        <div class="ag-card-body">
          <div class="ag-card-badges">
            <span class="ag-badge ag-badge--emerald">{{ formatIndexBadge(item, idx) }}</span>
            <span class="ag-badge ag-badge--cyan">{{ formatDocBadge(item) }}</span>
            <span class="ag-badge ag-badge--neutral">{{
              formatDiagramType(item.diagramType)
            }}</span>
            <span v-if="item.width && item.height" class="ag-badge ag-badge--neutral">
              {{ item.width }}×{{ item.height }}
            </span>
          </div>

          <h3 class="ag-card-title">{{ item.title }}</h3>
          <p class="ag-card-category">{{ item.category }}</p>

          <!-- Acciones primarias: Proyector Interactivo + Explorador de Nodos + Volumen SSOT -->
          <div class="ag-card-primary-actions">
            <button
              type="button"
              class="ag-btn ag-btn--primary"
              @click="openProjector(item)"
            >
              ⛶ Proyector Interactivo
            </button>
            <a
              v-if="getInteractiveExplorerHref(item)"
              :href="withBase(getInteractiveExplorerHref(item) || '/explorador')"
              class="ag-btn ag-btn--explorer"
              :title="`Abrir ${item.title} en el Explorador Interactivo`"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
              >
                <circle cx="5" cy="6" r="2.5" />
                <circle cx="19" cy="6" r="2.5" />
                <circle cx="12" cy="18" r="2.5" />
                <path d="M7.3 7.2 10.6 15.8" />
                <path d="M16.7 7.2 13.4 15.8" />
                <path d="M7.5 6h9" />
              </svg>
              <span>Explorar Interactivo</span>
            </a>
            <a :href="getDocUrl(item)" class="ag-btn">
              📖 Ir al Volumen
            </a>
            <button
              v-if="item.mermaidCode"
              type="button"
              class="ag-btn"
              title="Copiar fuente Mermaid"
              @click="copyMermaidCode(item)"
            >
              {{ copiedCodeId === item.id ? '✓ Copiado' : 'Mermaid' }}
            </button>
          </div>

          <!-- Descargas directas para Canva y Defensa -->
          <div class="ag-card-downloads">
            <span class="ag-downloads-label">Descargas HD directas:</span>
            <div v-if="hasStaticAssets" class="ag-downloads-buttons">
              <a
                :href="getSvgUrl(item)"
                :download="getDownloadFilename(item.svgFile, 'svg')"
                class="ag-btn ag-btn--cyan"
                title="Descargar gráfico vectorial escalable infinito"
              >
                ⬇ SVG Vectorial
              </a>
              <a
                :href="getPngDarkUrl(item)"
                :download="getDownloadFilename(item.pngDarkFile, 'png')"
                class="ag-btn"
                title="Descargar captura PNG 4K con tema oscuro oficial para presentaciones ejecutivas"
              >
                ⬇ PNG 4K Oscuro
              </a>
              <a
                :href="getPngLightUrl(item)"
                :download="getDownloadFilename(item.pngLightFile, 'png')"
                class="ag-btn"
                title="Descargar captura PNG 4K con fondo blanco para informes impresos"
              >
                ⬇ PNG 4K Claro
              </a>
            </div>
            <div v-else class="ag-downloads-buttons">
              <button
                type="button"
                class="ag-btn ag-btn--cyan"
                :disabled="!item.mermaidCode || downloadingKey === `${item.id}:svg`"
                title="Descargar gráfico vectorial escalable infinito"
                @click="downloadClientSvg(item)"
              >
                {{ downloadingKey === `${item.id}:svg` ? 'Generando SVG...' : '⬇ SVG Vectorial' }}
              </button>
              <button
                type="button"
                class="ag-btn"
                :disabled="!item.mermaidCode || downloadingKey === `${item.id}:png-dark`"
                title="Generar y descargar PNG 4K (#0b1120) en el navegador para presentaciones"
                @click="downloadClientPng4k(item, 'dark')"
              >
                {{
                  downloadingKey === `${item.id}:png-dark`
                    ? 'Generando 4K...'
                    : '⬇ PNG 4K Oscuro'
                }}
              </button>
              <button
                type="button"
                class="ag-btn"
                :disabled="!item.mermaidCode || downloadingKey === `${item.id}:png-light`"
                title="Generar y descargar PNG 4K fondo blanco en el navegador"
                @click="downloadClientPng4k(item, 'light')"
              >
                {{
                  downloadingKey === `${item.id}:png-light`
                    ? 'Generando 4K...'
                    : '⬇ PNG 4K Claro'
                }}
              </button>
            </div>
          </div>
        </div>
      </article>
    </div>

    <!-- Modal Proyector a Pantalla Completa para Inspección 4K / Vectorial -->
    <Teleport v-if="isMounted && activeItem" to="body">
      <div
        class="ag-projector-overlay"
        role="dialog"
        aria-modal="true"
        :aria-label="`Proyector Interactivo: ${activeItem.title}`"
      >
        <header class="ag-projector-header">
          <div class="ag-projector-title">
            <span class="ag-badge ag-badge--emerald">{{ formatDocBadge(activeItem) }}</span>
            <span>{{ activeItem.title }}</span>
            <span class="ag-projector-hint">
              Rueda: Zoom (0.25x–8x) · Arrastrar: Mover · ESC: Cerrar
            </span>
          </div>

          <div class="ag-toolbar-group">
            <button
              type="button"
              class="ag-btn"
              :disabled="modalZoom <= MIN_MODAL_ZOOM"
              @click="zoomModalOut"
            >
              -
            </button>
            <span class="ag-zoom-chip">{{ modalZoomPercent }}</span>
            <button
              type="button"
              class="ag-btn"
              :disabled="modalZoom >= MAX_MODAL_ZOOM"
              @click="zoomModalIn"
            >
              +
            </button>
            <button type="button" class="ag-btn" @click="resetModalView">Restablecer</button>
            <button
              type="button"
              class="ag-btn"
              @click="toggleProjectorBgMode"
            >
              {{ projectorBgMode === 'dark' ? '☀ Lienzo Claro' : '🌙 Lienzo Oscuro' }}
            </button>
            <template v-if="hasStaticAssets">
              <a
                :href="getSvgUrl(activeItem)"
                :download="getDownloadFilename(activeItem.svgFile, 'svg')"
                class="ag-btn ag-btn--cyan"
              >
                ⬇ SVG
              </a>
              <a
                :href="getPngDarkUrl(activeItem)"
                :download="getDownloadFilename(activeItem.pngDarkFile, 'png')"
                class="ag-btn"
              >
                ⬇ PNG 4K Oscuro
              </a>
            </template>
            <template v-else>
              <button
                type="button"
                class="ag-btn ag-btn--cyan"
                :disabled="!activeItem.mermaidCode || downloadingKey === `${activeItem.id}:svg`"
                @click="downloadClientSvg(activeItem)"
              >
                {{ downloadingKey === `${activeItem.id}:svg` ? 'Generando...' : '⬇ SVG' }}
              </button>
              <button
                type="button"
                class="ag-btn"
                :disabled="
                  !activeItem.mermaidCode || downloadingKey === `${activeItem.id}:png-dark`
                "
                @click="downloadClientPng4k(activeItem, 'dark')"
              >
                {{
                  downloadingKey === `${activeItem.id}:png-dark`
                    ? 'Generando 4K...'
                    : '⬇ PNG 4K Oscuro'
                }}
              </button>
            </template>
            <button type="button" class="ag-btn ag-btn--danger" @click="closeProjector">
              ✕ Cerrar
            </button>
          </div>
        </header>

        <div
          class="ag-projector-stage"
          :class="{
            'is-dragging': isDragging,
            'ag-projector-stage--light': projectorBgMode === 'light'
          }"
          @wheel.prevent="onModalWheel"
          @mousedown="onDragStart"
          @mousemove="onDragMove"
          @mouseup="onDragEnd"
          @mouseleave="onDragEnd"
        >
          <div
            class="ag-projector-canvas"
            :style="{
              transform: `translate3d(${panX}px, ${panY}px, 0) scale(${modalZoom})`
            }"
          >
            <img
              v-if="hasStaticAssets"
              :src="
                projectorBgMode === 'light'
                  ? getPngLightUrl(activeItem)
                  : getCardPreviewUrl(activeItem)
              "
              :alt="activeItem.title"
              class="ag-projector-img"
              draggable="false"
              @error="handleSvgImgError(activeItem.id)"
            />
            <div
              v-else
              class="ag-projector-svg-inline"
              v-html="
                projectorBgMode === 'light'
                  ? renderedLightSvgs[activeItem.id] || renderedDarkSvgs[activeItem.id] || ''
                  : renderedDarkSvgs[activeItem.id] || ''
              "
            />
          </div>
        </div>
      </div>
    </Teleport>
  </section>
</template>

<style scoped>
.ag-gallery-root {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin: 1rem 0 2.5rem;
}

.ag-explorer-callout {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 1rem 1.5rem;
  border-left: 3px solid var(--vp-c-brand-2);
}

.ag-explorer-callout-main {
  display: flex;
  align-items: flex-start;
  gap: 0.9rem;
  flex: 1 1 420px;
  min-width: 0;
}

.ag-explorer-callout-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border-radius: 9px;
  border: 1px solid var(--ag-border-accent);
  background: var(--ag-surface-subtle);
  color: var(--vp-c-brand-1);
  flex-shrink: 0;
}

.ag-explorer-callout-copy {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  min-width: 0;
}

.ag-explorer-callout-title {
  margin: 0 !important;
  padding: 0 !important;
  border: none !important;
  font-size: 1.04rem !important;
  line-height: 1.3 !important;
  font-weight: 700 !important;
  color: var(--vp-c-text-1);
}

.ag-explorer-callout-desc {
  margin: 0 !important;
  font-size: 0.89rem;
  line-height: 1.52;
  color: var(--vp-c-text-2);
}

.ag-explorer-callout-cta {
  padding: 0.56rem 0.95rem;
  white-space: nowrap;
  flex-shrink: 0;
}

.ag-explorer-callout-cta:focus-visible,
.ag-btn--explorer:focus-visible {
  outline: 2px solid var(--ag-emerald);
  outline-offset: 2px;
}

.ag-btn--explorer {
  background: rgba(4, 120, 87, 0.1);
  border-color: rgba(4, 120, 87, 0.42);
  color: #065f46 !important;
}

.ag-btn--explorer:hover {
  background: rgba(4, 120, 87, 0.18);
  border-color: #047857;
  color: #064e3b !important;
}

.dark .ag-btn--explorer {
  background: rgba(16, 185, 129, 0.14);
  border-color: rgba(16, 185, 129, 0.44);
  color: #6ee7b7 !important;
}

.dark .ag-btn--explorer:hover {
  background: rgba(16, 185, 129, 0.24);
  border-color: #34d399;
  color: #a7f3d0 !important;
}

.ag-gallery-controls {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.ag-gallery-search-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.85rem;
}

.ag-search-input-wrap {
  position: relative;
  flex: 1 1 340px;
  display: flex;
  align-items: center;
}

.ag-search-icon {
  position: absolute;
  left: 0.9rem;
  font-size: 0.95rem;
  pointer-events: none;
}

.ag-search-input {
  width: 100%;
  padding: 0.68rem 2.4rem 0.68rem 2.5rem;
  border-radius: 10px;
  border: 1px solid var(--ag-border-strong);
  background: var(--ag-surface-elevated);
  color: var(--vp-c-text-1);
  font-size: 0.92rem;
  font-weight: 500;
  transition: border-color 0.16s ease, box-shadow 0.16s ease;
}

.ag-search-input:focus {
  outline: none;
  border-color: var(--ag-emerald);
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.2);
}

.ag-clear-btn {
  position: absolute;
  right: 0.65rem;
  border: none;
  background: transparent;
  color: var(--vp-c-text-2);
  cursor: pointer;
  font-size: 0.9rem;
  padding: 0.2rem 0.4rem;
  border-radius: 6px;
}

.ag-clear-btn:hover {
  background: var(--ag-surface-subtle);
  color: var(--vp-c-text-1);
}

.ag-gallery-stats {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
}

.ag-category-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.ag-pill-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.42rem 0.85rem;
  border-radius: 9999px;
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--vp-c-text-2);
  background: var(--ag-surface-elevated);
  border: 1px solid var(--ag-border);
  cursor: pointer;
  transition: all 0.16s ease;
}

.ag-pill-btn:hover {
  border-color: var(--ag-border-strong);
  color: var(--vp-c-text-1);
}

.ag-pill-btn.is-active {
  background: #047857;
  border-color: #047857;
  color: #ffffff;
}

.dark .ag-pill-btn.is-active {
  background: rgba(16, 185, 129, 0.22);
  border-color: #10b981;
  color: #6ee7b7;
}

.ag-pill-count {
  font-family: var(--vp-font-family-mono);
  font-size: 0.72rem;
  padding: 0.08rem 0.42rem;
  border-radius: 9999px;
  background: rgba(15, 23, 42, 0.12);
}

.dark .ag-pill-count {
  background: rgba(11, 17, 32, 0.6);
}

.ag-gallery-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
  gap: 1.35rem;
}

@media (max-width: 480px) {
  .ag-gallery-grid {
    grid-template-columns: 1fr;
  }
}

.ag-diagram-card {
  display: flex;
  flex-direction: column;
  border-radius: 14px;
  border: 1px solid var(--ag-border);
  background: var(--ag-surface-card);
  box-shadow: var(--ag-shadow-sm);
  overflow: hidden;
  transition: transform 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease;
}

.ag-diagram-card:hover {
  transform: translateY(-3px);
  border-color: var(--ag-border-accent);
  box-shadow: var(--ag-shadow-md);
}

.ag-card-preview {
  position: relative;
  height: 230px;
  padding: 0.85rem;
  background-color: #0b1120;
  background-image: radial-gradient(rgba(148, 163, 184, 0.14) 1px, transparent 1px);
  background-size: 18px 18px;
  border-bottom: 1px solid var(--ag-border);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  cursor: zoom-in;
}

.ag-card-img {
  max-width: 100%;
  max-height: 100%;
  width: auto;
  height: auto;
  object-fit: contain;
  transition: transform 0.22s ease;
}

.ag-card-svg-inline {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.22s ease;
}

.ag-card-svg-inline :deep(svg) {
  max-width: 100%;
  max-height: 100%;
  width: auto;
  height: auto;
}

.ag-card-preview:hover .ag-card-svg-inline {
  transform: scale(1.04);
}

.ag-card-rendering {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8rem;
  font-weight: 600;
  color: #cbd5e1;
}

.ag-spinner {
  width: 1rem;
  height: 1rem;
  border-radius: 50%;
  border: 2px solid #334155;
  border-top-color: #10b981;
  animation: ag-spin 0.75s linear infinite;
}

@keyframes ag-spin {
  to {
    transform: rotate(360deg);
  }
}

.ag-card-preview:hover .ag-card-img {
  transform: scale(1.04);
}

.ag-card-overlay-badge {
  position: absolute;
  right: 0.65rem;
  bottom: 0.65rem;
  padding: 0.28rem 0.65rem;
  border-radius: 8px;
  background: rgba(15, 23, 42, 0.88);
  border: 1px solid rgba(16, 185, 129, 0.45);
  color: #6ee7b7;
  font-size: 0.74rem;
  font-weight: 700;
  opacity: 0;
  transform: translateY(4px);
  transition: opacity 0.16s ease, transform 0.16s ease;
}

.ag-card-preview:hover .ag-card-overlay-badge,
.ag-card-preview:focus-visible .ag-card-overlay-badge {
  opacity: 1;
  transform: translateY(0);
}

.ag-card-body {
  display: flex;
  flex-direction: column;
  flex: 1;
  padding: 1.05rem 1.15rem 1.2rem;
  gap: 0.7rem;
}

.ag-card-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.ag-card-title {
  margin: 0 !important;
  font-size: 1.02rem !important;
  line-height: 1.38 !important;
  font-weight: 700 !important;
  color: var(--vp-c-text-1);
  border: none !important;
  padding: 0 !important;
}

.ag-card-category {
  margin: 0 !important;
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--vp-c-text-3);
}

.ag-card-primary-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
  margin-top: auto;
  padding-top: 0.35rem;
}

.ag-card-downloads {
  margin-top: 0.35rem;
  padding-top: 0.75rem;
  border-top: 1px dashed var(--ag-border);
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}

.ag-downloads-label {
  font-size: 0.74rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--vp-c-text-3);
}

.ag-downloads-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.ag-zoom-chip {
  min-width: 3.4rem;
  text-align: center;
  font-family: var(--vp-font-family-mono);
  font-size: 0.78rem;
  font-weight: 700;
  padding: 0.32rem 0.45rem;
  border-radius: 7px;
  background: #0b1120;
  color: #6ee7b7;
  border: 1px solid #334155;
}

.ag-projector-img {
  max-width: min(90vw, 1760px);
  max-height: 82vh;
  width: auto;
  height: auto;
  object-fit: contain;
  pointer-events: none;
}

.ag-projector-svg-inline {
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

.ag-projector-svg-inline :deep(svg) {
  max-width: min(88vw, 1680px);
  max-height: 82vh;
  width: auto;
  height: auto;
}

.ag-gallery-loading-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 1.25rem;
}

.ag-skeleton-card {
  border-radius: 14px;
  border: 1px solid var(--ag-border);
  background: var(--ag-surface-card);
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.ag-skeleton-thumb {
  height: 190px;
  border-radius: 10px;
  background: var(--ag-surface-subtle);
  animation: ag-pulse 1.4s ease-in-out infinite;
}

.ag-skeleton-line {
  height: 14px;
  border-radius: 6px;
  background: var(--ag-surface-subtle);
  animation: ag-pulse 1.4s ease-in-out infinite;
}

.ag-skeleton-line--lg {
  width: 82%;
}

.ag-skeleton-line--sm {
  width: 48%;
}

@keyframes ag-pulse {
  0%,
  100% {
    opacity: 0.55;
  }
  50% {
    opacity: 1;
  }
}

.ag-gallery-empty {
  text-align: left;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.65rem;
}

.ag-empty-header {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.4rem;
}

.ag-empty-header h3,
.ag-gallery-empty h3 {
  margin: 0 !important;
}

.ag-gallery-empty p {
  margin: 0 !important;
  color: var(--vp-c-text-2);
}

.ag-empty-cmd {
  font-size: 0.88rem;
}
</style>
