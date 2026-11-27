<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { withBase } from 'vitepress'

interface ReelChapter {
  time: string
  seconds: number
  label: string
}

const VERTICAL_DRIVE_ID = '1MGKSaJY939cJWj5cr5Wl7op8VL1b91c5'
const VERTICAL_DRIVE_PREVIEW_URL = `https://drive.google.com/file/d/${VERTICAL_DRIVE_ID}/preview`

const WIDESCREEN_4K_DRIVE_ID = '1bDAxk1tOYErQoxIMN61-z-L5uVgWilk4'
const WIDESCREEN_4K_DRIVE_PREVIEW_URL = `https://drive.google.com/file/d/${WIDESCREEN_4K_DRIVE_ID}/preview`
const WIDESCREEN_4K_DRIVE_VIEW_URL = `https://drive.google.com/file/d/${WIDESCREEN_4K_DRIVE_ID}/view?usp=drivesdk`

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
    autoplay?: boolean
  }>(),
  {
    compact: false,
    title: undefined,
    autoplay: true
  }
)

const verticalVideoSrc = computed(() => withBase('/video/agentguard-reel.mp4'))
const widescreenVideoSrc = computed(() => withBase('/video/agentguard-widescreen-4k.mp4'))
const posterSrc = computed(() => withBase('/video/agentguard-reel-poster.jpg'))
const displayTitle = computed(
  () => props.title?.trim() || 'Recorrido oficial de AgentGuard en runtime'
)

const isMounted = ref(false)
const hasUserPaused = ref(false)

const videoRef = ref<HTMLVideoElement | null>(null)
const hasStarted = ref(false)
const isPlaying = ref(false)
const isMuted = ref(true)
const videoFailed = ref(false)
const currentTime = ref(0)

const isWidescreenOpen = ref(false)
const widescreenFailed = ref(false)
const widescreenResumeTime = ref(0)
const widescreenEnteredNativeFs = ref(false)
const widescreenModalRef = ref<HTMLElement | null>(null)
const widescreenVideoRef = ref<HTMLVideoElement | null>(null)
const closeBtnRef = ref<HTMLButtonElement | null>(null)

const shouldAutoplay = computed(() => props.autoplay)

const activeChapterIndex = computed(() => {
  let idx = 0
  for (let i = 0; i < REEL_CHAPTERS.length; i += 1) {
    if (currentTime.value >= REEL_CHAPTERS[i].seconds) {
      idx = i
    }
  }
  return idx
})

function getFullscreenElement(): Element | null {
  if (typeof document === 'undefined') return null
  const doc = document as Document & { webkitFullscreenElement?: Element | null }
  return doc.fullscreenElement || doc.webkitFullscreenElement || null
}

async function exitBrowserFullscreenIfActive() {
  if (typeof document === 'undefined') return
  const doc = document as Document & {
    webkitFullscreenElement?: Element | null
    webkitExitFullscreen?: () => Promise<void> | void
  }
  if (!doc.fullscreenElement && !doc.webkitFullscreenElement) return
  try {
    if (doc.exitFullscreen) {
      await doc.exitFullscreen()
    } else if (doc.webkitExitFullscreen) {
      await doc.webkitExitFullscreen()
    }
  } catch {
    // Ignorar rechazo al salir de pantalla completa
  }
}

async function attemptMutedAutoplay() {
  if (!shouldAutoplay.value || hasUserPaused.value || isWidescreenOpen.value || videoFailed.value) {
    return
  }
  const el = videoRef.value
  if (!el || !el.paused) return
  el.defaultMuted = true
  el.muted = true
  isMuted.value = true
  try {
    await el.play()
    hasStarted.value = true
    isPlaying.value = true
  } catch {
    // Si el navegador bloquea autoplay, queda el overlay interactivo disponible
  }
}

async function startPlayback(withAudio = false) {
  if (videoFailed.value) return
  const el = videoRef.value
  if (!el) return
  hasUserPaused.value = false
  hasStarted.value = true
  if (withAudio) {
    el.muted = false
    isMuted.value = false
  }
  try {
    await el.play()
  } catch {
    if (!el.muted) {
      el.muted = true
      isMuted.value = true
      try {
        await el.play()
        return
      } catch {
        // Ignorar fallo de reproducción automática
      }
    }
    isPlaying.value = false
  }
}

async function togglePlayPause() {
  if (videoFailed.value) return
  const el = videoRef.value
  if (!el) return
  if (el.paused || el.ended) {
    await startPlayback(false)
  } else {
    hasUserPaused.value = true
    el.pause()
  }
}

async function toggleMute() {
  if (videoFailed.value) return
  const el = videoRef.value
  if (!el) return
  const nextMuted = !el.muted
  el.muted = nextMuted
  isMuted.value = nextMuted
  if (!nextMuted && el.paused) {
    hasStarted.value = true
    try {
      await el.play()
    } catch {
      isPlaying.value = false
    }
  }
}

async function seekToChapter(seconds: number) {
  if (videoFailed.value) return
  const el = videoRef.value
  if (!el) return
  hasStarted.value = true
  el.currentTime = seconds
  currentTime.value = seconds
  el.muted = false
  isMuted.value = false
  try {
    await el.play()
  } catch {
    isPlaying.value = false
  }
}

async function openWidescreenFullscreen() {
  if (typeof document === 'undefined') return
  const verticalEl = videoRef.value
  let syncSeconds = 0
  if (verticalEl && Number.isFinite(verticalEl.currentTime)) {
    syncSeconds = verticalEl.currentTime > 0 && verticalEl.currentTime < 65 ? verticalEl.currentTime : 0
  }

  widescreenResumeTime.value = syncSeconds
  widescreenFailed.value = false
  widescreenEnteredNativeFs.value = false
  isWidescreenOpen.value = true
  if (verticalEl) {
    verticalEl.pause()
  }
  document.body.style.overflow = 'hidden'

  await nextTick()

  const modalEl = widescreenModalRef.value as
    | (HTMLElement & {
        webkitRequestFullscreen?: () => Promise<void> | void
      })
    | null

  if (modalEl) {
    try {
      if (modalEl.requestFullscreen) {
        await modalEl.requestFullscreen()
        widescreenEnteredNativeFs.value = true
      } else if (modalEl.webkitRequestFullscreen) {
        await modalEl.webkitRequestFullscreen()
        widescreenEnteredNativeFs.value = true
      }
    } catch {
      widescreenEnteredNativeFs.value = false
    }
  }

  const wsEl = widescreenVideoRef.value
  if (wsEl) {
    wsEl.muted = false
    if (wsEl.readyState >= 1 && widescreenResumeTime.value > 0) {
      wsEl.currentTime = widescreenResumeTime.value
    }
    try {
      await wsEl.play()
    } catch {
      wsEl.muted = true
      try {
        await wsEl.play()
      } catch {
        // El usuario podrá iniciar manualmente con los controles nativos
      }
    }
  }

  closeBtnRef.value?.focus()
}

function handleWidescreenLoadedMetadata() {
  const wsEl = widescreenVideoRef.value
  if (!wsEl) return
  if (widescreenResumeTime.value > 0 && Math.abs(wsEl.currentTime - widescreenResumeTime.value) > 0.5) {
    wsEl.currentTime = widescreenResumeTime.value
  }
}

function handleWidescreenError() {
  widescreenFailed.value = true
}

async function closeWidescreenFullscreen() {
  if (!isWidescreenOpen.value) return

  const wsEl = widescreenVideoRef.value
  const returnTime =
    wsEl && Number.isFinite(wsEl.currentTime) ? wsEl.currentTime : widescreenResumeTime.value
  wsEl?.pause()

  widescreenEnteredNativeFs.value = false
  isWidescreenOpen.value = false
  if (typeof document !== 'undefined') {
    document.body.style.overflow = ''
  }

  await exitBrowserFullscreenIfActive()

  const verticalEl = videoRef.value
  if (verticalEl && !videoFailed.value) {
    if (Number.isFinite(returnTime) && returnTime >= 0 && returnTime < 67) {
      verticalEl.currentTime = returnTime
      currentTime.value = returnTime
    }
    if (shouldAutoplay.value) {
      hasUserPaused.value = false
      verticalEl.muted = true
      isMuted.value = true
      try {
        await verticalEl.play()
      } catch {
        isPlaying.value = false
      }
    }
  }
}

function handleFullscreenChange() {
  const fsEl = getFullscreenElement()
  if (isWidescreenOpen.value) {
    if (fsEl && widescreenModalRef.value && (fsEl === widescreenModalRef.value || widescreenModalRef.value.contains(fsEl))) {
      widescreenEnteredNativeFs.value = true
      return
    }
    if (!fsEl && widescreenEnteredNativeFs.value) {
      void closeWidescreenFullscreen()
    }
  }
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape' && isWidescreenOpen.value) {
    event.preventDefault()
    void closeWidescreenFullscreen()
  }
}

function handlePlay() {
  hasUserPaused.value = false
  hasStarted.value = true
  isPlaying.value = true
}

function handlePause() {
  isPlaying.value = false
  if (!isWidescreenOpen.value) {
    hasUserPaused.value = true
  }
}

function handleCanPlay() {
  void attemptMutedAutoplay()
}

function handleVolumeChange() {
  const el = videoRef.value
  if (el) {
    isMuted.value = el.muted || el.volume === 0
  }
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
  isMounted.value = true

  if (typeof document !== 'undefined') {
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange)
    document.addEventListener('keydown', handleKeydown)
  }

  void attemptMutedAutoplay()
})

onBeforeUnmount(() => {
  if (typeof document !== 'undefined') {
    document.removeEventListener('fullscreenchange', handleFullscreenChange)
    document.removeEventListener('webkitfullscreenchange', handleFullscreenChange)
    document.removeEventListener('keydown', handleKeydown)
    if (isWidescreenOpen.value) {
      document.body.style.overflow = ''
    }
  }
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
          :src="verticalVideoSrc"
          :poster="posterSrc"
          autoplay
          muted
          loop
          playsinline
          preload="auto"
          :controls="hasStarted"
          controlsList="nofullscreen"
          disablePictureInPicture
          @canplay="handleCanPlay"
          @play="handlePlay"
          @pause="handlePause"
          @volumechange="handleVolumeChange"
          @timeupdate="handleTimeUpdate"
          @error="handleVideoError"
        >
          Tu navegador no soporta la reproducción HTML5 de MP4.
        </video>

        <!-- Barra flotante superior: estado de reproducción y control de sonido -->
        <div v-if="hasStarted" class="ag-reel__stage-bar">
          <span class="ag-reel__live-chip">
            <span class="ag-reel__chip-dot" aria-hidden="true" />
            01:08 (9:16)
          </span>
          <button
            type="button"
            class="ag-reel__sound-pill"
            :aria-pressed="!isMuted"
            :aria-label="isMuted ? 'Activar sonido del video' : 'Silenciar video'"
            @click="toggleMute"
          >
            <svg
              v-if="isMuted"
              class="ag-reel__btn-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              <line x1="22" y1="9" x2="16" y2="15" />
              <line x1="16" y1="9" x2="22" y2="15" />
            </svg>
            <svg
              v-else
              class="ag-reel__btn-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
            </svg>
            <span>{{ isMuted ? 'Activar sonido' : 'Sonido activo' }}</span>
          </button>
        </div>

        <!-- Overlay de respaldo si el navegador o reduced-motion impidió el autoplay -->
        <button
          v-if="!hasStarted"
          type="button"
          class="ag-reel__overlay"
          aria-label="Reproducir demo oficial de AgentGuard de 68 segundos"
          @click="startPlayback(true)"
        >
          <span class="ag-reel__overlay-content">
            <span class="ag-reel__chip">
              <span class="ag-reel__chip-dot" aria-hidden="true" />
              Demo Oficial 01:08
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
        :src="VERTICAL_DRIVE_PREVIEW_URL"
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
            class="ag-reel__btn"
            :aria-pressed="isPlaying"
            aria-label="Reproducir o pausar el video vertical de AgentGuard"
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
            type="button"
            class="ag-reel__btn ag-reel__btn--primary"
            aria-label="Abrir versión panorámica 4K 16:9 en pantalla completa"
            @click="openWidescreenFullscreen"
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
            <span>Pantalla completa 4K</span>
          </button>

          <span v-if="videoFailed" class="ag-reel__fallback-note">
            Reproducción en respaldo desde Google Drive
          </span>
        </div>

        <div class="ag-reel__controls-meta">
          <span v-if="!compact" class="ag-reel__meta-label">Audio en español (16:9 en 4K)</span>
          <a
            :href="WIDESCREEN_4K_DRIVE_VIEW_URL"
            target="_blank"
            rel="noopener noreferrer"
            class="ag-reel__drive-link"
          >
            <span>Abrir 4K en Drive</span>
            <svg
              class="ag-reel__ext-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.2"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <path d="M7 17 17 7" />
              <path d="M7 7h10v10" />
            </svg>
          </a>
        </div>
      </figcaption>
    </div>

    <!-- Modal / Cinema Fullscreen 4K Panorámico (16:9) montado bajo demanda -->
    <Teleport to="body">
      <div
        v-if="isMounted && isWidescreenOpen"
        ref="widescreenModalRef"
        class="ag-cinema"
        role="dialog"
        aria-modal="true"
        aria-label="Demo oficial de AgentGuard en formato panorámico 4K 16:9"
        @click.self="closeWidescreenFullscreen"
      >
        <div class="ag-cinema__topbar">
          <div class="ag-cinema__title-group">
            <span class="ag-cinema__badge">4K 16:9</span>
            <span class="ag-cinema__title">{{ displayTitle }}</span>
          </div>
          <div class="ag-cinema__actions">
            <a
              :href="WIDESCREEN_4K_DRIVE_VIEW_URL"
              target="_blank"
              rel="noopener noreferrer"
              class="ag-cinema__link"
            >
              <span>Abrir en Google Drive</span>
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2.2"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
              >
                <path d="M7 17 17 7" />
                <path d="M7 7h10v10" />
              </svg>
            </a>
            <button
              ref="closeBtnRef"
              type="button"
              class="ag-cinema__close"
              aria-label="Cerrar reproductor 4K pantalla completa"
              @click="closeWidescreenFullscreen"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2.2"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
              <span>Cerrar</span>
            </button>
          </div>
        </div>

        <div class="ag-cinema__viewport">
          <video
            v-if="!widescreenFailed"
            ref="widescreenVideoRef"
            class="ag-cinema__video"
            :src="widescreenVideoSrc"
            controls
            autoplay
            playsinline
            preload="auto"
            @loadedmetadata="handleWidescreenLoadedMetadata"
            @error="handleWidescreenError"
          >
            Tu navegador no soporta la reproducción HTML5 de MP4 4K.
          </video>

          <iframe
            v-else
            class="ag-cinema__iframe"
            :src="WIDESCREEN_4K_DRIVE_PREVIEW_URL"
            title="AgentGuard Demo Oficial 4K 16:9 en Google Drive"
            allow="autoplay; fullscreen"
            allowfullscreen
          />
        </div>
      </div>
    </Teleport>
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

.ag-reel__stage-bar {
  position: absolute;
  top: 0.65rem;
  left: 0.65rem;
  right: 0.65rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  pointer-events: none;
  z-index: 2;
}

.ag-reel__live-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.38rem;
  padding: 0.22rem 0.56rem;
  border-radius: 9999px;
  background: rgba(7, 13, 25, 0.9);
  border: 1px solid var(--ag-border-accent);
  color: #ecfdf5;
  font-family: var(--vp-font-family-mono);
  font-size: 0.72rem;
  font-weight: 600;
  line-height: 1.2;
}

.ag-reel__sound-pill {
  pointer-events: auto;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.28rem 0.62rem;
  border-radius: 9999px;
  border: 1px solid rgba(255, 255, 255, 0.26);
  background: rgba(7, 13, 25, 0.92);
  color: #f8fafc;
  font-size: 0.75rem;
  font-weight: 600;
  line-height: 1.2;
  cursor: pointer;
  transition: background-color 0.15s ease, border-color 0.15s ease;
}

.ag-reel__sound-pill:hover {
  background: rgba(15, 23, 42, 0.96);
  border-color: var(--ag-emerald);
}

.ag-reel__sound-pill:focus-visible {
  outline: 2px solid var(--ag-cyan);
  outline-offset: 2px;
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
  display: inline-flex;
  align-items: center;
  gap: 0.28rem;
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--ag-emerald-aaa);
  text-decoration: none;
  border-radius: 6px;
  padding: 0.12rem 0.25rem;
  transition: color 0.15s ease, text-decoration-color 0.15s ease;
}

.ag-reel__ext-icon {
  width: 13px;
  height: 13px;
  flex-shrink: 0;
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
  .ag-reel__sound-pill,
  .ag-reel__overlay,
  .ag-reel__play-cta,
  .ag-reel__btn,
  .ag-reel__drive-link,
  .ag-reel__chapter-btn {
    transition: none;
  }
}
</style>

<style>
/* Modal / Pantalla completa 4K (16:9) montado en body vía Teleport */
.ag-cinema {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  background: #040812;
  color: #f8fafc;
}

.ag-cinema__topbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.75rem 1.25rem;
  background: rgba(11, 17, 32, 0.94);
  border-bottom: 1px solid rgba(51, 65, 85, 0.65);
}

.ag-cinema__title-group {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  min-width: 0;
}

.ag-cinema__badge {
  display: inline-flex;
  align-items: center;
  padding: 0.18rem 0.55rem;
  border-radius: 9999px;
  background: var(--vp-c-brand-soft);
  border: 1px solid var(--ag-border-accent);
  color: var(--ag-cyan-strong);
  font-family: var(--vp-font-family-mono, ui-monospace, monospace);
  font-size: 0.75rem;
  font-weight: 700;
  white-space: nowrap;
}

.ag-cinema__title {
  font-family: var(--ag-font-display, var(--vp-font-family-base, system-ui, sans-serif));
  font-size: 0.95rem;
  font-weight: 700;
  color: #f8fafc;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ag-cinema__actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.ag-cinema__link {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.82rem;
  font-weight: 600;
  color: #f8fafc;
  text-decoration: none;
  padding: 0.25rem 0.45rem;
  border-radius: 6px;
}

.ag-cinema__link:hover {
  color: var(--ag-cyan-strong);
  text-decoration: underline;
  text-underline-offset: 3px;
}

.ag-cinema__link:focus-visible,
.ag-cinema__close:focus-visible {
  outline: 2px solid #22d3ee;
  outline-offset: 2px;
}

.ag-cinema__close {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.4rem 0.8rem;
  border-radius: 8px;
  border: 1px solid #334155;
  background: #0f172a;
  color: #f8fafc;
  font-size: 0.82rem;
  font-weight: 700;
  cursor: pointer;
}

.ag-cinema__close:hover {
  background: #1e293b;
  border-color: #64748b;
}

.ag-cinema__viewport {
  flex: 1;
  min-height: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background: #040812;
}

.ag-cinema__video,
.ag-cinema__iframe {
  width: 100%;
  height: 100%;
  max-width: 100%;
  max-height: 100%;
  aspect-ratio: 16 / 9;
  border: 0;
  border-radius: 10px;
  background: #000000;
  object-fit: contain;
}
</style>
