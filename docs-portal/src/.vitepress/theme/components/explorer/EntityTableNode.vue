<script setup lang="ts">
import { computed } from 'vue'
import { Handle, Position } from '@vue-flow/core'
import type { ColumnBadge, EntityColumn, ExplorerNodeItem } from '../../data/explorerData'

export interface EntityNodeData {
  item: ExplorerNodeItem
  layerLabel: string
  direction: 'LR' | 'TB'
  isDark: boolean
  expanded: boolean
  isSelected: boolean
  isRelated: boolean
  isDimmed: boolean
  isTourFocus: boolean
  isScenarioActive: boolean
  onToggleExpand?: (nodeId: string) => void
}

const props = defineProps<{
  id: string
  data: EntityNodeData
  selected?: boolean
}>()

const KEY_BADGES = new Set<ColumnBadge>(['PK', 'FK', 'UK', 'GIN', 'ENUM'])

function getCompactColumns(columns: EntityColumn[]): EntityColumn[] {
  if (columns.length <= 5) return columns
  const prioritized = columns.filter((col) => col.badges.some((badge) => KEY_BADGES.has(badge)))
  if (prioritized.length >= 3) {
    return prioritized.slice(0, 6)
  }
  return columns.slice(0, 5)
}

const allColumns = computed(() => props.data.item.columns ?? [])

const visibleColumns = computed(() => {
  if (props.data.expanded) return allColumns.value
  return getCompactColumns(allColumns.value)
})

const hiddenColumnsCount = computed(() =>
  Math.max(0, allColumns.value.length - visibleColumns.value.length)
)

const canToggleColumns = computed(
  () => props.data.item.kind === 'table' && allColumns.value.length > getCompactColumns(allColumns.value).length
)

const visibleHighlights = computed(() => {
  const list = props.data.item.highlights ?? []
  return props.data.expanded ? list : list.slice(0, 4)
})

const hiddenHighlightsCount = computed(() => {
  const list = props.data.item.highlights ?? []
  return Math.max(0, list.length - visibleHighlights.value.length)
})

const isNodeSelected = computed(() => Boolean(props.data.isSelected || props.selected))

function visibleStructuralBadges(badges: ColumnBadge[]): ColumnBadge[] {
  return badges.filter((badge) => KEY_BADGES.has(badge)).slice(0, 2)
}

function badgeClass(badge: ColumnBadge): string {
  switch (badge) {
    case 'PK':
      return 'ag-col-chip--pk'
    case 'FK':
      return 'ag-col-chip--fk'
    case 'UK':
      return 'ag-col-chip--uk'
    case 'GIN':
      return 'ag-col-chip--gin'
    case 'ENUM':
      return 'ag-col-chip--enum'
    default:
      return 'ag-col-chip--meta'
  }
}

function handleToggleExpand(event: MouseEvent): void {
  event.stopPropagation()
  props.data.onToggleExpand?.(props.id)
}
</script>

<template>
  <article
    class="ag-ef-node"
    :class="[
      `ag-ef-node--${data.item.kind}`,
      `ag-ef-accent--${data.item.accent}`,
      {
        'is-dark': data.isDark,
        'is-selected': isNodeSelected,
        'is-related': data.isRelated && !isNodeSelected,
        'is-dimmed': data.isDimmed,
        'is-tour-focus': data.isTourFocus,
        'is-scenario-active': data.isScenarioActive
      }
    ]"
    :data-node-id="id"
    :data-node-kind="data.item.kind"
  >
    <!-- Handles ordenados según dirección principal del grafo -->
    <template v-if="data.direction === 'TB'">
      <Handle id="top-target" type="target" :position="Position.Top" class="ag-ef-handle" />
      <Handle id="bottom-source" type="source" :position="Position.Bottom" class="ag-ef-handle" />
      <Handle id="left-target" type="target" :position="Position.Left" class="ag-ef-handle ag-ef-handle--aux" />
      <Handle id="right-source" type="source" :position="Position.Right" class="ag-ef-handle ag-ef-handle--aux" />
    </template>
    <template v-else>
      <Handle id="left-target" type="target" :position="Position.Left" class="ag-ef-handle" />
      <Handle id="right-source" type="source" :position="Position.Right" class="ag-ef-handle" />
      <Handle id="top-target" type="target" :position="Position.Top" class="ag-ef-handle ag-ef-handle--aux" />
      <Handle id="bottom-source" type="source" :position="Position.Bottom" class="ag-ef-handle ag-ef-handle--aux" />
    </template>

    <!-- Franja de acento superior -->
    <span class="ag-ef-node-bar" aria-hidden="true" />

    <!-- Encabezado de entidad o servicio -->
    <header class="ag-ef-node-head">
      <div class="ag-ef-node-title-row">
        <span class="ag-ef-node-icon" aria-hidden="true">
          <svg
            v-if="data.item.kind === 'table'"
            viewBox="0 0 18 18"
            fill="none"
            stroke="currentColor"
            stroke-width="1.75"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <rect x="2.25" y="2.75" width="13.5" height="12.5" rx="2" />
            <line x1="2.25" y1="6.75" x2="15.75" y2="6.75" />
            <line x1="7.25" y1="6.75" x2="7.25" y2="15.25" />
          </svg>
          <svg
            v-else
            viewBox="0 0 18 18"
            fill="none"
            stroke="currentColor"
            stroke-width="1.75"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <rect x="2.5" y="2.5" width="13" height="5" rx="1.5" />
            <rect x="2.5" y="10.5" width="13" height="5" rx="1.5" />
            <circle cx="5.5" cy="5" r="0.8" fill="currentColor" stroke="none" />
            <circle cx="5.5" cy="13" r="0.8" fill="currentColor" stroke="none" />
          </svg>
        </span>

        <h3
          class="ag-ef-node-title"
          :class="{ 'ag-ef-node-title--mono': data.item.kind === 'table' }"
          :title="data.item.title"
        >
          {{ data.item.title }}
        </h3>

        <span v-if="data.item.badge" class="ag-ef-node-badge">
          {{ data.item.badge }}
        </span>
      </div>

      <p class="ag-ef-node-sub">{{ data.item.subtitle }}</p>
    </header>

    <!-- Cuerpo: columnas de tabla -->
    <div v-if="data.item.kind === 'table'" class="ag-ef-node-body">
      <ul class="ag-ef-col-list" aria-label="Columnas de la tabla">
        <li v-for="col in visibleColumns" :key="col.name" class="ag-ef-col-row">
          <div class="ag-ef-col-left">
            <span
              v-for="badge in visibleStructuralBadges(col.badges)"
              :key="`${col.name}-${badge}`"
              class="ag-col-chip"
              :class="badgeClass(badge)"
            >
              {{ badge }}
            </span>
            <span class="ag-ef-col-name" :title="col.name">{{ col.name }}</span>
          </div>
          <span class="ag-ef-col-type" :title="col.type">{{ col.type }}</span>
        </li>
      </ul>

      <footer v-if="canToggleColumns" class="ag-ef-node-foot">
        <button
          type="button"
          class="nodrag nopan ag-ef-more-btn"
          :aria-expanded="data.expanded"
          @click="handleToggleExpand"
        >
          <span v-if="hiddenColumnsCount > 0">
            +{{ hiddenColumnsCount }} {{ hiddenColumnsCount === 1 ? 'columna' : 'columnas' }}
          </span>
          <span v-else>Mostrar solo claves</span>
        </button>
      </footer>
    </div>

    <!-- Cuerpo: tarjeta de servicio / arquitectura runtime -->
    <div v-else class="ag-ef-node-body ag-ef-node-body--service">
      <ul v-if="visibleHighlights.length > 0" class="ag-ef-hl-list">
        <li v-for="point in visibleHighlights" :key="point" class="ag-ef-hl-row">
          <span class="ag-ef-hl-dot" aria-hidden="true" />
          <span class="ag-ef-hl-text">{{ point }}</span>
        </li>
      </ul>

      <footer class="ag-ef-service-foot">
        <span class="ag-ef-layer-tag">{{ data.layerLabel }}</span>
        <button
          v-if="(data.item.highlights?.length ?? 0) > 4"
          type="button"
          class="nodrag nopan ag-ef-more-btn ag-ef-more-btn--inline"
          :aria-expanded="data.expanded"
          @click="handleToggleExpand"
        >
          <span v-if="hiddenHighlightsCount > 0">+{{ hiddenHighlightsCount }} más</span>
          <span v-else>Compactar</span>
        </button>
      </footer>
    </div>
  </article>
</template>

<style scoped>
.ag-ef-node {
  --ef-accent: var(--ag-emerald-strong);
  --ef-accent-text: var(--ag-emerald-aaa);
  --ef-accent-soft: rgba(4, 120, 87, 0.1);
  --ef-accent-ring: rgba(4, 120, 87, 0.34);

  position: relative;
  width: 274px;
  border-radius: 9px;
  background: var(--ag-surface-card);
  border: 1px solid var(--ag-border-strong);
  color: var(--vp-c-text-1);
  overflow: visible;
  cursor: pointer;
  transition:
    opacity 0.2s ease,
    border-color 0.18s ease,
    box-shadow 0.18s ease,
    transform 0.18s ease;
}

.ag-ef-node--service {
  width: 278px;
}

.ag-ef-accent--emerald {
  --ef-accent: var(--ag-emerald-strong);
  --ef-accent-text: var(--ag-emerald-aaa);
  --ef-accent-soft: rgba(4, 120, 87, 0.1);
  --ef-accent-ring: rgba(4, 120, 87, 0.34);
}

.ag-ef-accent--cyan {
  --ef-accent: var(--ag-cyan-strong);
  --ef-accent-text: #155e75;
  --ef-accent-soft: rgba(14, 116, 144, 0.1);
  --ef-accent-ring: rgba(14, 116, 144, 0.34);
}

.ag-ef-accent--sky {
  --ef-accent: #0369a1;
  --ef-accent-text: #075985;
  --ef-accent-soft: rgba(3, 105, 161, 0.1);
  --ef-accent-ring: rgba(3, 105, 161, 0.34);
}

.ag-ef-accent--amber {
  --ef-accent: var(--ag-amber);
  --ef-accent-text: #92400e;
  --ef-accent-soft: rgba(180, 83, 9, 0.1);
  --ef-accent-ring: rgba(180, 83, 9, 0.36);
}

.ag-ef-accent--rose {
  --ef-accent: var(--ag-rose);
  --ef-accent-text: #9f1239;
  --ef-accent-soft: rgba(190, 18, 60, 0.1);
  --ef-accent-ring: rgba(190, 18, 60, 0.34);
}

.ag-ef-node.is-dark {
  border-color: var(--ag-border-strong);
}

.ag-ef-node.is-dark.ag-ef-accent--emerald {
  --ef-accent: var(--ag-emerald-strong);
  --ef-accent-text: var(--ag-emerald-aaa);
  --ef-accent-soft: rgba(16, 185, 129, 0.16);
  --ef-accent-ring: rgba(52, 211, 153, 0.45);
}

.ag-ef-node.is-dark.ag-ef-accent--cyan {
  --ef-accent: var(--ag-cyan-strong);
  --ef-accent-text: #67e8f9;
  --ef-accent-soft: rgba(6, 182, 212, 0.16);
  --ef-accent-ring: rgba(34, 211, 238, 0.45);
}

.ag-ef-node.is-dark.ag-ef-accent--sky {
  --ef-accent: #38bdf8;
  --ef-accent-text: #7dd3fc;
  --ef-accent-soft: rgba(14, 165, 233, 0.18);
  --ef-accent-ring: rgba(56, 189, 248, 0.45);
}

.ag-ef-node.is-dark.ag-ef-accent--amber {
  --ef-accent: var(--ag-amber);
  --ef-accent-text: #fde68a;
  --ef-accent-soft: rgba(245, 158, 11, 0.18);
  --ef-accent-ring: rgba(251, 191, 36, 0.46);
}

.ag-ef-node.is-dark.ag-ef-accent--rose {
  --ef-accent: var(--ag-rose);
  --ef-accent-text: #fda4af;
  --ef-accent-soft: rgba(244, 63, 94, 0.18);
  --ef-accent-ring: rgba(251, 113, 133, 0.46);
}

.ag-ef-node:hover {
  border-color: var(--ef-accent);
}

.ag-ef-node.is-related {
  border-color: var(--ef-accent);
}

.ag-ef-node.is-scenario-active {
  border-color: var(--ef-accent);
  box-shadow: 0 0 0 2px var(--ef-accent-ring);
}

.ag-ef-node.is-tour-focus {
  border-color: var(--ef-accent);
  box-shadow: 0 0 0 3px var(--ef-accent-ring);
}

.ag-ef-node.is-selected {
  border-color: var(--ef-accent);
  box-shadow: 0 0 0 3px var(--ef-accent-ring);
}

.ag-ef-node.is-dimmed {
  opacity: 0.3;
}

.ag-ef-node.is-dimmed:hover {
  opacity: 0.85;
}

.ag-ef-node-bar {
  display: block;
  height: 3.5px;
  width: 100%;
  background: var(--ef-accent);
  border-radius: 8px 8px 0 0;
}

.ag-ef-node-head {
  padding: 0.62rem 0.78rem 0.54rem;
  border-bottom: 1px solid var(--ag-border);
  background: var(--ag-surface-elevated);
}

.ag-ef-node-title-row {
  display: flex;
  align-items: center;
  gap: 0.42rem;
  min-width: 0;
}

.ag-ef-node-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 15px;
  height: 15px;
  flex-shrink: 0;
  color: var(--ef-accent-text);
}

.ag-ef-node-icon svg {
  width: 15px;
  height: 15px;
}

.ag-ef-node-title {
  margin: 0;
  padding: 0;
  border: none;
  flex: 1 1 auto;
  min-width: 0;
  font-family: var(--ag-font-display, var(--vp-font-family-base));
  font-size: 0.9rem;
  font-weight: 700;
  line-height: 1.25;
  color: var(--vp-c-text-1);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ag-ef-node-title--mono {
  font-family: var(--vp-font-family-mono);
  font-size: 0.85rem;
  letter-spacing: -0.015em;
}

.ag-ef-node-badge {
  flex-shrink: 0;
  padding: 0.1rem 0.42rem;
  border-radius: 5px;
  background: var(--ef-accent-soft);
  border: 1px solid var(--ef-accent-ring);
  color: var(--ef-accent-text);
  font-size: 0.72rem;
  font-weight: 700;
  line-height: 1.3;
  white-space: nowrap;
}

.ag-ef-node-sub {
  margin: 0.28rem 0 0;
  font-size: 0.76rem;
  line-height: 1.35;
  color: var(--vp-c-text-2);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.ag-ef-node-body {
  padding: 0.36rem 0 0.28rem;
  background: var(--ag-surface-card);
  border-radius: 0 0 8px 8px;
}

.ag-ef-col-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.ag-ef-col-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.48rem;
  padding: 0.26rem 0.76rem;
  border-bottom: 1px solid var(--ag-border);
  font-size: 0.8rem;
  line-height: 1.3;
}

.ag-ef-col-row:last-child {
  border-bottom: none;
}

.ag-ef-col-left {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  min-width: 0;
  flex: 1 1 auto;
}

.ag-ef-col-name {
  font-family: var(--vp-font-family-mono);
  font-size: 0.8rem;
  font-weight: 500;
  color: var(--vp-c-text-1);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ag-ef-col-type {
  flex-shrink: 0;
  font-family: var(--vp-font-family-mono);
  font-size: 0.79rem;
  color: var(--vp-c-text-3);
  max-width: 94px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ag-col-chip {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.04rem 0.28rem;
  border-radius: 4px;
  font-size: 0.67rem;
  font-weight: 700;
  line-height: 1.3;
  border: 1px solid transparent;
}

.ag-col-chip--pk {
  background: rgba(180, 83, 9, 0.14);
  border-color: rgba(180, 83, 9, 0.38);
  color: #92400e;
}

.ag-col-chip--fk {
  background: rgba(3, 105, 161, 0.13);
  border-color: rgba(3, 105, 161, 0.36);
  color: #075985;
}

.ag-col-chip--uk {
  background: rgba(14, 116, 144, 0.13);
  border-color: rgba(14, 116, 144, 0.35);
  color: #155e75;
}

.ag-col-chip--gin {
  background: rgba(4, 120, 87, 0.13);
  border-color: rgba(4, 120, 87, 0.36);
  color: var(--ag-emerald-aaa);
}

.ag-col-chip--enum {
  background: rgba(190, 18, 60, 0.12);
  border-color: rgba(190, 18, 60, 0.34);
  color: #9f1239;
}

.ag-col-chip--meta {
  background: var(--ag-surface-subtle);
  border-color: var(--ag-border);
  color: var(--vp-c-text-2);
}

.ag-ef-node.is-dark .ag-col-chip--pk {
  background: rgba(245, 158, 11, 0.2);
  border-color: rgba(251, 191, 36, 0.46);
  color: #fde68a;
}

.ag-ef-node.is-dark .ag-col-chip--fk {
  background: rgba(14, 165, 233, 0.2);
  border-color: rgba(56, 189, 248, 0.46);
  color: #7dd3fc;
}

.ag-ef-node.is-dark .ag-col-chip--uk {
  background: rgba(6, 182, 212, 0.2);
  border-color: rgba(34, 211, 238, 0.46);
  color: #67e8f9;
}

.ag-ef-node.is-dark .ag-col-chip--gin {
  background: rgba(16, 185, 129, 0.2);
  border-color: rgba(52, 211, 153, 0.46);
  color: var(--ag-emerald-aaa);
}

.ag-ef-node.is-dark .ag-col-chip--enum {
  background: rgba(244, 63, 94, 0.2);
  border-color: rgba(251, 113, 133, 0.46);
  color: #fda4af;
}

.ag-ef-node-foot {
  padding: 0.32rem 0.72rem 0.2rem;
  border-top: 1px dashed var(--ag-border);
  margin-top: 0.15rem;
}

.ag-ef-more-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 0.24rem 0.5rem;
  border-radius: 5px;
  border: 1px solid var(--ag-border);
  background: var(--ag-surface-subtle);
  color: var(--vp-c-text-2);
  font-size: 0.74rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.15s ease, border-color 0.15s ease, color 0.15s ease;
}

.ag-ef-more-btn--inline {
  width: auto;
  padding: 0.16rem 0.45rem;
}

.ag-ef-more-btn:hover {
  border-color: var(--ef-accent);
  color: var(--ef-accent-text);
  background: var(--ef-accent-soft);
}

.ag-ef-more-btn:focus-visible {
  outline: 2px solid var(--ef-accent);
  outline-offset: 2px;
}

/* Estilos de tarjeta tipo servicio */
.ag-ef-node-body--service {
  padding: 0.52rem 0.78rem 0.56rem;
}

.ag-ef-hl-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.32rem;
}

.ag-ef-hl-row {
  display: flex;
  align-items: flex-start;
  gap: 0.44rem;
  font-size: 0.78rem;
  line-height: 1.38;
  color: var(--vp-c-text-2);
}

.ag-ef-hl-dot {
  width: 6px;
  height: 6px;
  margin-top: 0.38rem;
  border-radius: 999px;
  background: var(--ef-accent);
  flex-shrink: 0;
}

.ag-ef-hl-text {
  min-width: 0;
}

.ag-ef-service-foot {
  margin-top: 0.55rem;
  padding-top: 0.45rem;
  border-top: 1px solid var(--ag-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.ag-ef-layer-tag {
  font-size: 0.72rem;
  font-weight: 600;
  color: var(--ef-accent-text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Handles sutiles y bien alineados */
.ag-ef-handle {
  width: 9px;
  height: 9px;
  border-radius: 999px;
  background: var(--ag-surface-card);
  border: 2px solid var(--ef-accent);
}

.ag-ef-handle--aux {
  width: 7px;
  height: 7px;
  opacity: 0.65;
}

@media (prefers-reduced-motion: reduce) {
  .ag-ef-node,
  .ag-ef-more-btn {
    transition: none;
  }
}
</style>
