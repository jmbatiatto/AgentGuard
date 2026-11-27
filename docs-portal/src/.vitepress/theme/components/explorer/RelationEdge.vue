<script setup lang="ts">
import { computed } from 'vue'
import { BaseEdge, EdgeLabelRenderer, Position, getSmoothStepPath } from '@vue-flow/core'
import type { ExplorerAccent, ExplorerEdgeItem } from '../../data/explorerData'

defineOptions({ inheritAttrs: false })

export interface RelationEdgeData {
  edge: ExplorerEdgeItem
  accent: ExplorerAccent
  isDark: boolean
  isSelected: boolean
  isHighlighted: boolean
  isDimmed: boolean
  isAnimated: boolean
  labelOffsetY?: number
  onSelectEdge?: (edgeId: string) => void
}

const props = defineProps<{
  id: string
  sourceX: number
  sourceY: number
  targetX: number
  targetY: number
  sourcePosition: Position
  targetPosition: Position
  markerEnd?: string
  style?: Record<string, string | number>
  data?: RelationEdgeData
  selected?: boolean
}>()

const pathData = computed(() =>
  getSmoothStepPath({
    sourceX: props.sourceX,
    sourceY: props.sourceY,
    targetX: props.targetX,
    targetY: props.targetY,
    sourcePosition: props.sourcePosition,
    targetPosition: props.targetPosition,
    borderRadius: 14,
    offset: 24
  })
)

const isEdgeSelected = computed(() => Boolean(props.data?.isSelected || props.selected))
const isEdgeHighlighted = computed(() => Boolean(props.data?.isHighlighted))
const isEdgeDimmed = computed(() => Boolean(props.data?.isDimmed))
const isEdgeDashed = computed(() => props.data?.edge.edgeStyle === 'dashed')
const isEdgeAnimated = computed(
  () => Boolean(props.data?.isAnimated) && !isEdgeDimmed.value
)

const isEdgeDark = computed(() => Boolean(props.data?.isDark))

const accentClass = computed(() => `ag-edge-accent--${props.data?.accent ?? 'emerald'}`)

const edgeGroupClasses = computed(() => [
  'ag-ef-edge-group',
  accentClass.value,
  {
    'is-dark': isEdgeDark.value,
    'is-selected': isEdgeSelected.value,
    'is-highlighted': isEdgeHighlighted.value && !isEdgeSelected.value,
    'is-dimmed': isEdgeDimmed.value,
    'is-dashed': isEdgeDashed.value,
    'is-animated': isEdgeAnimated.value
  }
])

const labelTransformStyle = computed(() => {
  const [, labelX, labelY] = pathData.value
  const offsetY = props.data?.labelOffsetY ?? 0
  const zIndex = isEdgeSelected.value ? 30 : isEdgeHighlighted.value ? 18 : isEdgeDimmed.value ? 1 : 8
  return {
    transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY + offsetY}px)`,
    zIndex
  }
})

const pillAriaLabel = computed(() => {
  const edge = props.data?.edge
  if (!edge) return 'Inspeccionar relación'
  return `Inspeccionar relación ${edge.relationTitle} (${edge.label})`
})

function handleSelect(event: MouseEvent): void {
  event.stopPropagation()
  props.data?.onSelectEdge?.(props.id)
}
</script>

<template>
  <g :class="edgeGroupClasses">
    <BaseEdge
      :id="id"
      :path="pathData[0]"
      :marker-end="markerEnd"
      :style="style"
      class="ag-ef-edge-base"
    />
    <!-- Área de clic ampliada sobre toda la traza de la relación -->
    <path
      :d="pathData[0]"
      fill="none"
      stroke="transparent"
      stroke-width="18"
      class="ag-ef-edge-hit"
      @click="handleSelect"
    />
  </g>

  <EdgeLabelRenderer v-if="data?.edge.label">
    <div class="ag-ef-edge-label-wrap" :style="labelTransformStyle">
      <button
        type="button"
        class="nodrag nopan ag-ef-edge-pill"
        :class="[
          accentClass,
          {
            'is-dark': isEdgeDark,
            'is-selected': isEdgeSelected,
            'is-highlighted': isEdgeHighlighted && !isEdgeSelected,
            'is-dimmed': isEdgeDimmed,
            'is-dashed': isEdgeDashed
          }
        ]"
        :data-edge-id="id"
        :aria-pressed="isEdgeSelected"
        :aria-label="pillAriaLabel"
        @click="handleSelect"
      >
        <span class="ag-ef-edge-pill-text">{{ data.edge.label }}</span>
      </button>
    </div>
  </EdgeLabelRenderer>
</template>

<style scoped>
.ag-ef-edge-group {
  --ef-edge-stroke: var(--ag-border-strong);
  --ef-edge-accent: var(--ag-emerald-strong);
}

.ag-edge-accent--emerald {
  --ef-edge-accent: var(--ag-emerald-strong);
  --ef-pill-text: var(--ag-emerald-aaa);
  --ef-pill-soft: rgba(4, 120, 87, 0.12);
  --ef-pill-ring: rgba(4, 120, 87, 0.36);
}

.ag-edge-accent--cyan {
  --ef-edge-accent: var(--ag-cyan-strong);
  --ef-pill-text: #155e75;
  --ef-pill-soft: rgba(14, 116, 144, 0.12);
  --ef-pill-ring: rgba(14, 116, 144, 0.36);
}

.ag-edge-accent--sky {
  --ef-edge-accent: #0369a1;
  --ef-pill-text: #075985;
  --ef-pill-soft: rgba(3, 105, 161, 0.12);
  --ef-pill-ring: rgba(3, 105, 161, 0.36);
}

.ag-edge-accent--amber {
  --ef-edge-accent: var(--ag-amber);
  --ef-pill-text: #92400e;
  --ef-pill-soft: rgba(180, 83, 9, 0.12);
  --ef-pill-ring: rgba(180, 83, 9, 0.38);
}

.ag-edge-accent--rose {
  --ef-edge-accent: var(--ag-rose);
  --ef-pill-text: #9f1239;
  --ef-pill-soft: rgba(190, 18, 60, 0.12);
  --ef-pill-ring: rgba(190, 18, 60, 0.36);
}

.ag-edge-accent--emerald.is-dark {
  --ef-edge-accent: var(--ag-emerald-strong);
  --ef-pill-text: var(--ag-emerald-aaa);
  --ef-pill-soft: rgba(16, 185, 129, 0.22);
  --ef-pill-ring: rgba(52, 211, 153, 0.48);
}

.ag-edge-accent--cyan.is-dark {
  --ef-edge-accent: var(--ag-cyan-strong);
  --ef-pill-text: #67e8f9;
  --ef-pill-soft: rgba(6, 182, 212, 0.22);
  --ef-pill-ring: rgba(34, 211, 238, 0.48);
}

.ag-edge-accent--sky.is-dark {
  --ef-edge-accent: #38bdf8;
  --ef-pill-text: #7dd3fc;
  --ef-pill-soft: rgba(14, 165, 233, 0.22);
  --ef-pill-ring: rgba(56, 189, 248, 0.48);
}

.ag-edge-accent--amber.is-dark {
  --ef-edge-accent: var(--ag-amber);
  --ef-pill-text: #fde68a;
  --ef-pill-soft: rgba(245, 158, 11, 0.22);
  --ef-pill-ring: rgba(251, 191, 36, 0.48);
}

.ag-edge-accent--rose.is-dark {
  --ef-edge-accent: var(--ag-rose);
  --ef-pill-text: #fda4af;
  --ef-pill-soft: rgba(244, 63, 94, 0.22);
  --ef-pill-ring: rgba(251, 113, 133, 0.48);
}

.ag-ef-edge-group :deep(.vue-flow__edge-path) {
  stroke: var(--ef-edge-stroke);
  stroke-width: 1.75px;
  transition: stroke 0.18s ease, stroke-width 0.18s ease, opacity 0.2s ease;
}

.ag-ef-edge-group.is-dashed :deep(.vue-flow__edge-path) {
  stroke-dasharray: 6 5;
}

.ag-ef-edge-group.is-highlighted :deep(.vue-flow__edge-path),
.ag-ef-edge-group.is-selected :deep(.vue-flow__edge-path) {
  stroke: var(--ef-edge-accent);
  stroke-width: 2.75px;
}

.ag-ef-edge-group.is-animated :deep(.vue-flow__edge-path) {
  stroke-dasharray: 9 5;
  animation: ag-ef-edge-flow 1.15s linear infinite;
}

.ag-ef-edge-group.is-dimmed :deep(.vue-flow__edge-path) {
  opacity: 0.18;
}

.ag-ef-edge-hit {
  cursor: pointer;
}

.ag-ef-edge-label-wrap {
  position: absolute;
  top: 0;
  left: 0;
  pointer-events: all;
}

.ag-ef-edge-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.16rem 0.5rem;
  border-radius: 999px;
  border: 1px solid var(--ag-border-strong);
  background: var(--ag-surface-card);
  color: var(--vp-c-text-1);
  font-family: var(--vp-font-family-base);
  font-size: 0.74rem;
  font-weight: 700;
  line-height: 1.25;
  white-space: nowrap;
  cursor: pointer;
  transition:
    background-color 0.16s ease,
    border-color 0.16s ease,
    color 0.16s ease,
    opacity 0.2s ease,
    box-shadow 0.16s ease;
}

.ag-ef-edge-pill.is-dashed {
  border-style: dashed;
}

.ag-ef-edge-pill:hover {
  border-color: var(--ef-edge-accent);
  color: var(--ef-pill-text);
  background: var(--ag-surface-elevated);
}

.ag-ef-edge-pill.is-highlighted {
  border-color: var(--ef-edge-accent);
  background: var(--ag-surface-card);
  color: var(--ef-pill-text);
  box-shadow: 0 0 0 2px var(--ef-pill-ring);
}

.ag-ef-edge-pill.is-selected {
  border-color: var(--ef-edge-accent);
  background: var(--ef-pill-soft);
  color: var(--ef-pill-text);
  box-shadow: 0 0 0 2px var(--ef-pill-ring);
}

.ag-ef-edge-pill.is-dimmed {
  opacity: 0.22;
}

.ag-ef-edge-pill.is-dimmed:hover {
  opacity: 0.92;
}

.ag-ef-edge-pill:focus-visible {
  outline: 2px solid var(--ef-edge-accent);
  outline-offset: 2px;
}

@keyframes ag-ef-edge-flow {
  from {
    stroke-dashoffset: 28;
  }
  to {
    stroke-dashoffset: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .ag-ef-edge-group.is-animated :deep(.vue-flow__edge-path) {
    animation: none;
  }

  .ag-ef-edge-group :deep(.vue-flow__edge-path),
  .ag-ef-edge-pill {
    transition: none;
  }
}
</style>
