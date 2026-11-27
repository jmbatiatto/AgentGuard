<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { withBase } from 'vitepress'

interface ReelChapter {
  time: string
  seconds: number
  label: string
}

const DRIVE_FILE_ID = '1MGKSaJY939cJWj5cr5Wl7op8VL1b91c5'
const DRIVE_PREVIEW_URL = `https://drive.google.com/file/d/${DRIVE_FILE_ID}/preview`
const DRIVE_VIEW_URL = `https://drive.google.com/file/d/${DRIVE_FILE_ID}/view?usp=drivesdk`

const REEL_CHAPTERS: ReelChapter[] = [
  { time: '00:00', seconds: 0, label: 'Agentes conectados a APIs reales' },
  { time: '00:15', seconds: 15, label: 'Prompt Injection y reglas vulneradas' },
  { time: '00:33', seconds: 33, label: 'Capa determinista AgentGuard (PEP/PDP)' },
  { time: '00:45', seconds: 45, label: 'Veredicto ALLOW y aprobación HITL' },
  { time: '00:55', seconds: 55, label: 'Bloqueo Fail-Closed DENY y auditoría' }
]

const props = withDefaults(
  defineProps<{
    compact?: boolean
    title?: string
  }>(),
  {
    compact: false,
    title: undefined
  }
)

const videoSrc = computed(() => withBase('/video/agentguard-reel.mp4'))
const posterSrc = computed(() => withBase('/video/agentguard-reel-poster.jpg'))
const displayTitle = computed(
  () => props.title?.trim() || 'Recorrido oficial de AgentGuard en runtime'
)

const videoRef = ref<HTMLVideoElement | null>(null)
const hasStarted = ref(false)
const isPlaying = ref(false)
const videoFailed = ref(false)
const isFullscreen = ref(false)
const fullscreenSupported = ref(false)
const currentTime = ref(0)

const activeChapterIndex = computed(() => {
  let idx = 0
  for (let i = 0; i < REEL_CHAPTERS.length; i += 1) {
    if (currentTime.value >= REEL_CHAPTERS[i].seconds) {
      idx = i
    }
  }
  return idx
})

function syncFullscreenState() {
  if (typeof document === 'undefined') return
  const doc = document as Document & { webkitFullscreenElement?: Element | null }
  isFullscreen.value = Boolean(doc.fullscreenElement || doc.webkitFullscreenElement)
}

async function startPlayback() {
  if (videoFailed.value) return
  const el = videoRef.value
  if (!el) return
  hasStarted.value = true
  try {
    await el.play()
  } catch {
    isPlaying.value = false
  }
}

async function togglePlayPause() {
  if (videoFailed.value) return
  const el = videoRef.value
  if (!el) return
  if (el.paused || el.ended) {
    hasStarted.value = true
    try {
      await el.play()
    } catch {
      isPlaying.value = false
    }
  } else {
    el.pause()
  }
}

async function seekToChapter(seconds: number) {
  if (videoFailed.value) return
  const el = videoRef.value
  if (!el) return
  hasStarted.value = true
  el.currentTime = seconds
  currentTime.value = seconds
  try {
    await el.play()
  } catch {
    isPlaying.value = false
  }
}

async function toggleFullscreen() {
  if (typeof document === 'undefined' || videoFailed.value) return
  const el = videoRef.value as
    | (HTMLVideoElement & {
        webkitRequestFullscreen?: () => Promise<void> | void
        webkitEnterFullscreen?: () => void
      })
    | null
  if (!el) return

  const doc = document as Document & {
    webkitFullscreenElement?: Element | null
    webkitExitFullscreen?: () => Promise<void> | void
  }

  try {
    if (doc.fullscreenElement || doc.webkitFullscreenElement) {
      if (doc.exitFullscreen) {
        await doc.exitFullscreen()
      } else if (doc.webkitExitFullscreen) {
        await doc.webkitExitFullscreen()
      }
      return
    }

    if (el.requestFullscreen) {
      await el.requestFullscreen()
    } else if (el.webkitRequestFullscreen) {
      await el.webkitRequestFullscreen()
    } else if (el.webkitEnterFullscreen) {
      el.webkitEnterFullscreen()
    }
  } catch {
    // Ignorar rechazo de API nativa de pantalla completa
  }
}

function handlePlay() {
  hasStarted.value = true
  isPlaying.value = true
}

function handlePause() {
  isPlaying.value = false
}

function handleEnded() {
  isPlaying.value = false
}

function handleTimeUpdate() {
  const el = videoRef.value
  if (el) {
    currentTime.value = el.currentTime
  }
}

function handleVideoError() {
  videoFailed.value = true
  isPlaying.value = false
}

onMounted(() => {
  if (typeof document === 'undefined') return
  const doc = document as Document & { webkitFullscreenEnabled?: boolean }
  const el = videoRef.value as
    | (HTMLVideoElement & {
        webkitRequestFullscreen?: () => Promise<void> | void
        webkitEnterFullscreen?: () => void
      })
    | null

  fullscreenSupported.value = Boolean(
    doc.fullscreenEnabled ||
      doc.webkitFullscreenEnabled ||
      el?.requestFullscreen ||
      el?.webkitRequestFullscreen ||
      el?.webkitEnterFullscreen
  )

  document.addEventListener('fullscreenchange', syncFullscreenState)
  document.addEventListener('webkitfullscreenchange', syncFullscreenState)
})

onBeforeUnmount(() => {
  if (typeof document === 'undefined') return
  document.removeEventListener('fullscreenchange', syncFullscreenState)
  document.removeEventListener('webkitfullscreenchange', syncFullscreenState)
})
</script>

<template>
  <figure
    class="ag-reel"
    :class="{ 'ag-reel--compact': compact }"
    aria-label="Reproductor del video oficial de AgentGuard"
  >
    <div class="ag-reel__stage">
      <template v-if="!videoFailed">
        <video
          ref="videoRef"
          class="ag-reel__video"
          :src="videoSrc"
          :poster="posterSrc"
          playsinline
          preload="metadata"
          :controls="hasStarted"
          @play="handlePlay"
          @pause="handlePause"
          @ended="handleEnded"
          @timeupdate="handleTimeUpdate"
          @error="handleVideoError"
        >
          Tu navegador no soporta la reproducción HTML5 de MP4.
        </video>

        <button
          v-if="!hasStarted"
          type="button"
          class="ag-reel__overlay"
          aria-label="Reproducir demo oficial de AgentGuard de 68 segundos"
          @click="startPlayback"
        >
          <span class="ag-reel__overlay-content">
            <span class="ag-reel__chip">
              <span class="ag-reel__chip-dot" aria-hidden="true" />
              01:08 · Demo Oficial
            </span>
            <span class="ag-reel__cue">{{ displayTitle }}</span>
            <span class="ag-reel__play-cta">
              <svg
                class="ag-reel__icon"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M8 5.14v13.72a1 1 0 0 0 1.53.85l10.69-6.86a1 1 0 0 0 0-1.7L9.53 4.29A1 1 0 0 0 8 5.14Z" />
              </svg>
              <span>Ver demo en vivo</span>
            </span>
          </span>
        </button>
      </template>

      <iframe
        v-else
        class="ag-reel__fallback-iframe"
        :src="DRIVE_PREVIEW_URL"
        title="Demo oficial de AgentGuard en Google Drive"
        allow="autoplay; fullscreen"
        allowfullscreen
        loading="lazy"
      />
    </div>

    <div class="ag-reel__panel">
      <div v-if="compact" class="ag-reel__aside-header">
        <span class="ag-reel__aside-pill">Video oficial en español</span>
        <h3 class="ag-reel__aside-title">{{ displayTitle }}</h3>
        <p class="ag-reel__aside-desc">
          En 68 segundos: el riesgo del acceso directo de agentes a producción, un intento de
          Prompt Injection y la intercepción determinista de AgentGuard con decisiones
          <code>ALLOW</code>, <code>HITL</code> y <code>DENY</code>.
        </p>
      </div>

      <div
        v-if="compact"
        class="ag-reel__chapters"
        role="group"
        aria-label="Capítulos del video oficial"
      >
        <button
          v-for="(chapter, index) in REEL_CHAPTERS"
          :key="chapter.time"
          type="button"
          class="ag-reel__chapter-btn"
          :class="{ 'is-active': hasStarted && !videoFailed && activeChapterIndex === index }"
          :disabled="videoFailed"
          @click="seekToChapter(chapter.seconds)"
        >
          <span class="ag-reel__chapter-time">{{ chapter.time }}</span>
          <span class="ag-reel__chapter-label">{{ chapter.label }}</span>
        </button>
      </div>

      <figcaption class="ag-reel__controls">
        <div class="ag-reel__control-group">
          <button
            v-if="!videoFailed"
            type="button"
            class="ag-reel__btn ag-reel__btn--primary"
            :aria-pressed="isPlaying"
            aria-label="Reproducir o pausar el video oficial de AgentGuard"
            @click="togglePlayPause"
          >
            <svg
              v-if="!isPlaying"
              class="ag-reel__btn-icon"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M8 5.14v13.72a1 1 0 0 0 1.53.85l10.69-6.86a1 1 0 0 0 0-1.7L9.53 4.29A1 1 0 0 0 8 5.14Z" />
            </svg>
            <svg
              v-else
              class="ag-reel__btn-icon"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M7 5h3.5v14H7V5Zm6.5 0H17v14h-3.5V5Z" />
            </svg>
            <span>{{ isPlaying ? 'Pausar' : 'Reproducir' }}</span>
          </button>

          <button
            v-if="fullscreenSupported && !videoFailed"
            type="button"
            class="ag-reel__btn"
            @click="toggleFullscreen"
          >
            <svg
              class="ag-reel__btn-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
            </svg>
            <span>{{ isFullscreen ? 'Salir' : 'Pantalla completa' }}</span>
          </button>

          <span v-if="videoFailed" class="ag-reel__fallback-note">
            Reproducción en respaldo desde Google Drive
          </span>
        </div>

        <div class="ag-reel__controls-meta">
          <span v-if="!compact" class="ag-reel__meta-label">Audio en español (68 s)</span>
          <a
            :href="DRIVE_VIEW_URL"
            target="_blank"
            rel="noopener noreferrer"
            class="ag-reel__drive-link"
          >
            Abrir en Google Drive ↗
          </a>
        </div>
      </figcaption>
    </div>
  </figure>
</template>

<style scoped>
.ag-reel {
  margin: 0 auto;
  width: 100%;
  max-width: 348px;
  display: flex;
  flex-direction: column;
  border-radius: 16px;
  overflow: hidden;
  background: var(--ag-surface-card);
  border: 1px solid var(--ag-border);
  box-shadow: var(--ag-shadow-md);
}

.ag-reel--compact {
  max-width: 100%;
  margin: 1.25rem 0 2rem;
  display: grid;
  grid-template-columns: 280px minmax(0, 1fr);
  align-items: stretch;
}

.ag-reel__stage {
  position: relative;
  width: 100%;
  aspect-ratio: 9 / 16;
  max-height: 540px;
  background: #070d19;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.ag-reel--compact .ag-reel__stage {
  max-height: none;
  border-right: 1px solid var(--ag-border);
}

.ag-reel__video {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: contain;
  background: #070d19;
}

.ag-reel__fallback-iframe {
  width: 100%;
  height: 100%;
  border: 0;
  display: block;
  background: #070d19;
}

.ag-reel__overlay {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  padding: 1.1rem;
  border: 0;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: stretch;
  text-align: left;
  background: linear-gradient(
    to top,
    rgba(7, 13, 25, 0.96) 0%,
    rgba(7, 13, 25, 0.84) 28%,
    rgba(7, 13, 25, 0.14) 52%,
    rgba(7, 13, 25, 0) 100%
  );
  transition: background-color 0.18s ease;
}

.ag-reel__overlay:hover .ag-reel__play-cta {
  background: var(--ag-emerald);
  color: #06221a;
}

.ag-reel__overlay:focus-visible {
  outline: 3px solid var(--ag-cyan);
  outline-offset: -3px;
}

.ag-reel__overlay-content {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.55rem;
}

.ag-reel__chip {
  display: inline-flex;
  align-items: center;
  gap: 0.42rem;
  padding: 0.24rem 0.65rem;
  border-radius: 9999px;
  background: rgba(11, 17, 32, 0.92);
  border: 1px solid rgba(52, 211, 153, 0.48);
  color: #ecfdf5;
  font-family: var(--vp-font-family-mono);
  font-size: 0.8125rem;
  font-weight: 600;
  line-height: 1.25;
}

.ag-reel__chip-dot {
  width: 7px;
  height: 7px;
  border-radius: 9999px;
  background: var(--ag-emerald);
  flex-shrink: 0;
}

.ag-reel__cue {
  color: #f8fafc;
  font-family: var(--ag-font-display, var(--vp-font-family-base));
  font-size: 0.96rem;
  font-weight: 700;
  line-height: 1.3;
}

.ag-reel__play-cta {
  margin-top: 0.15rem;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.52rem 0.95rem;
  border-radius: 9px;
  background: var(--vp-button-brand-bg);
  color: #ffffff;
  font-size: 0.86rem;
  font-weight: 700;
  line-height: 1.2;
  transition: background-color 0.16s ease, color 0.16s ease;
}

.ag-reel__icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.ag-reel__panel {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  background: var(--ag-surface-card);
  min-width: 0;
}

/* Barra de controles inferior */
.ag-reel__controls {
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
  padding: 0.72rem 0.85rem;
  background: var(--ag-surface-elevated);
  border-top: 1px solid var(--ag-border);
  color: var(--vp-c-text-1);
}

.ag-reel--compact .ag-reel__controls {
  flex-direction: row;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  padding: 0.85rem 1.45rem;
}

.ag-reel__control-group {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.45rem;
}

.ag-reel--compact .ag-reel__control-group {
  justify-content: flex-start;
  gap: 0.5rem;
}

.ag-reel__controls-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.45rem;
  padding-top: 0.5rem;
  border-top: 1px solid var(--ag-border);
}

.ag-reel--compact .ag-reel__controls-meta {
  padding-top: 0;
  border-top: 0;
}

.ag-reel__meta-label {
  font-size: 0.78rem;
  font-weight: 500;
  color: var(--vp-c-text-2);
}

.ag-reel__btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.38rem;
  padding: 0.4rem 0.72rem;
  border-radius: 8px;
  border: 1px solid var(--ag-border);
  background: var(--ag-surface-card);
  color: var(--vp-c-text-1);
  font-size: 0.8rem;
  font-weight: 600;
  line-height: 1.25;
  cursor: pointer;
  transition: background-color 0.15s ease, border-color 0.15s ease, color 0.15s ease;
}

.ag-reel__btn:hover {
  background: var(--ag-surface-subtle);
  border-color: var(--ag-border-strong);
}

.ag-reel__btn:focus-visible {
  outline: 2px solid var(--ag-emerald);
  outline-offset: 2px;
}

.ag-reel__btn--primary {
  background: var(--vp-button-brand-bg);
  border-color: var(--vp-button-brand-bg);
  color: #ffffff;
}

.ag-reel__btn--primary:hover {
  background: var(--vp-button-brand-hover-bg);
  border-color: var(--vp-button-brand-hover-bg);
  color: #ffffff;
}

.ag-reel__btn-icon {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
}

.ag-reel__drive-link {
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--ag-emerald-aaa);
  text-decoration: none;
  border-radius: 6px;
  padding: 0.12rem 0.25rem;
  transition: color 0.15s ease, text-decoration-color 0.15s ease;
}

.ag-reel__drive-link:hover {
  color: var(--ag-cyan-strong);
  text-decoration: underline;
  text-underline-offset: 3px;
}

.ag-reel__drive-link:focus-visible {
  outline: 2px solid var(--ag-emerald);
  outline-offset: 2px;
}

.ag-reel__fallback-note {
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--vp-c-text-2);
}

/* Panel lateral editorial para modo compacto en páginas anchas (/modo-presentacion) */
.ag-reel__aside-header {
  padding: 1.35rem 1.45rem 0.85rem;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.55rem;
}

.ag-reel__aside-pill {
  display: inline-flex;
  align-items: center;
  padding: 0.2rem 0.62rem;
  border-radius: 9999px;
  background: var(--vp-c-brand-soft);
  border: 1px solid var(--ag-border-accent);
  color: var(--ag-emerald-aaa);
  font-size: 0.78rem;
  font-weight: 700;
  line-height: 1.3;
}

.ag-reel__aside-title {
  margin: 0 !important;
  padding: 0 !important;
  border: 0 !important;
  font-family: var(--ag-font-display, var(--vp-font-family-base));
  font-size: 1.28rem !important;
  font-weight: 800 !important;
  line-height: 1.28 !important;
  color: var(--vp-c-text-1);
}

.ag-reel__aside-desc {
  margin: 0 !important;
  font-size: 0.92rem;
  line-height: 1.58;
  color: var(--vp-c-text-2);
}

.ag-reel__chapters {
  padding: 0.25rem 1.45rem 1.15rem;
  display: flex;
  flex-direction: column;
  gap: 0.42rem;
}

.ag-reel__chapter-btn {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 0.72rem;
  padding: 0.52rem 0.72rem;
  border-radius: 9px;
  border: 1px solid var(--ag-border);
  background: var(--ag-surface-elevated);
  color: var(--vp-c-text-1);
  text-align: left;
  cursor: pointer;
  transition: background-color 0.15s ease, border-color 0.15s ease;
}

.ag-reel__chapter-btn:hover:not(:disabled) {
  background: var(--ag-surface-subtle);
  border-color: var(--ag-border-accent);
}

.ag-reel__chapter-btn:focus-visible {
  outline: 2px solid var(--ag-emerald);
  outline-offset: 2px;
}

.ag-reel__chapter-btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.ag-reel__chapter-btn.is-active {
  background: var(--vp-c-brand-soft);
  border-color: var(--ag-emerald);
}

.ag-reel__chapter-time {
  font-family: var(--vp-font-family-mono);
  font-size: 0.8125rem;
  font-weight: 700;
  color: var(--ag-emerald-aaa);
  flex-shrink: 0;
}

.ag-reel__chapter-label {
  font-size: 0.86rem;
  font-weight: 600;
  color: var(--vp-c-text-1);
  line-height: 1.35;
}

@media (max-width: 780px) {
  .ag-reel--compact {
    grid-template-columns: 1fr;
    max-width: 380px;
    margin-inline: auto;
  }

  .ag-reel--compact .ag-reel__stage {
    border-right: 0;
    border-bottom: 1px solid var(--ag-border);
    max-height: 520px;
  }

  .ag-reel__aside-header,
  .ag-reel__chapters,
  .ag-reel--compact .ag-reel__controls {
    padding-inline: 1rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .ag-reel__overlay,
  .ag-reel__play-cta,
  .ag-reel__btn,
  .ag-reel__drive-link,
  .ag-reel__chapter-btn {
    transition: none;
  }
}
</style>
