<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { withBase } from 'vitepress'
import { graphlib, layout as dagreLayout } from '@dagrejs/dagre'
import {
  MarkerType,
  VueFlow,
  type Edge,
  type EdgeMouseEvent,
  type GraphNode,
  type Node,
  type NodeDragEvent,
  type NodeMouseEvent,
  type VueFlowStore
} from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import { Controls } from '@vue-flow/controls'
import { MiniMap } from '@vue-flow/minimap'

import '@vue-flow/core/dist/style.css'
import '@vue-flow/core/dist/theme-default.css'
import '@vue-flow/controls/dist/style.css'
import '@vue-flow/minimap/dist/style.css'

import {
  EXPLORER_VIEWS,
  EXPLORER_VIEW_LIST,
  type ColumnBadge,
  type EntityColumn,
  type ExplorerAccent,
  type ExplorerEdgeItem,
  type ExplorerNodeItem,
  type ExplorerViewId,
  type RuntimeScenarioPreset,
  type TourStep
} from '../data/explorerData'
import EntityTableNode, { type EntityNodeData } from './explorer/EntityTableNode.vue'
import RelationEdge, { type RelationEdgeData } from './explorer/RelationEdge.vue'

const FLOW_ID = 'ag-interactive-explorer'
const VALID_VIEW_IDS = new Set<ExplorerViewId>(['mer-postgres', 'mer-acme', 'runtime-flow'])
const KEY_BADGES = new Set<ColumnBadge>(['PK', 'FK', 'UK', 'GIN', 'ENUM'])

function getInitialViewId(): ExplorerViewId {
  if (typeof window === 'undefined') return 'mer-postgres'
  const param = new URLSearchParams(window.location.search).get('vista') as ExplorerViewId | null
  return param && VALID_VIEW_IDS.has(param) ? param : 'mer-postgres'
}

function getInitialDarkMode(): boolean {
  if (typeof document === 'undefined') return true
  return document.documentElement.classList.contains('dark')
}

let flowInstance: VueFlowStore | null = null

const activeViewId = ref<ExplorerViewId>(getInitialViewId())
const selectedNodeId = ref<string | null>(null)
const selectedEdgeId = ref<string | null>(null)
const activeLayerId = ref<string | null>(null)
const activeScenarioId = ref<string | null>(null)
const expandAllColumns = ref(false)
const locallyExpandedNodeIds = ref<Record<string, boolean>>({})
const isTourActive = ref(false)
const tourIndex = ref(0)
const isFullscreen = ref(false)
const isDark = ref(getInitialDarkMode())
const mobileInspectorOpen = ref(true)
const nodePositions = ref<Record<string, { x: number; y: number }>>({})

let themeObserver: MutationObserver | null = null

const flowInstanceId = computed(() => `${FLOW_ID}-${activeViewId.value}`)

const activeView = computed(() => EXPLORER_VIEWS[activeViewId.value] ?? EXPLORER_VIEWS['mer-postgres'])

const nodesById = computed<Record<string, ExplorerNodeItem>>(() => {
  const map: Record<string, ExplorerNodeItem> = {}
  for (const node of activeView.value.nodes) {
    map[node.id] = node
  }
  return map
})

const edgesById = computed<Record<string, ExplorerEdgeItem>>(() => {
  const map: Record<string, ExplorerEdgeItem> = {}
  for (const edge of activeView.value.edges) {
    map[edge.id] = edge
  }
  return map
})

const layersById = computed(() => {
  const map: Record<string, (typeof activeView.value.layers)[number]> = {}
  for (const layer of activeView.value.layers) {
    map[layer.id] = layer
  }
  return map
})

const hasTableNodes = computed(() => activeView.value.nodes.some((n) => n.kind === 'table'))
const scenarios = computed<RuntimeScenarioPreset[]>(() => activeView.value.scenarios ?? [])
const tourSteps = computed<TourStep[]>(() => activeView.value.tourSteps ?? [])

const activeScenario = computed<RuntimeScenarioPreset | null>(() => {
  if (!activeScenarioId.value) return null
  return scenarios.value.find((s) => s.id === activeScenarioId.value) ?? null
})

const activeTourStep = computed<TourStep | null>(() => {
  if (!isTourActive.value) return null
  return tourSteps.value[tourIndex.value] ?? null
})

const selectedNode = computed<ExplorerNodeItem | null>(() =>
  selectedNodeId.value ? nodesById.value[selectedNodeId.value] ?? null : null
)

const selectedEdge = computed<ExplorerEdgeItem | null>(() =>
  selectedEdgeId.value ? edgesById.value[selectedEdgeId.value] ?? null : null
)

const selectedNodeConnectedEdges = computed(() => {
  if (!selectedNode.value) return []
  const nid = selectedNode.value.id
  return activeView.value.edges
    .filter((edge) => edge.source === nid || edge.target === nid)
    .map((edge) => {
      const isOutgoing = edge.source === nid
      const neighborId = isOutgoing ? edge.target : edge.source
      return {
        edge,
        direction: isOutgoing ? ('out' as const) : ('in' as const),
        neighbor: nodesById.value[neighborId] ?? null
      }
    })
})

const groupedNodesByLayer = computed(() =>
  activeView.value.layers.map((layer) => ({
    layer,
    nodes: activeView.value.nodes.filter((n) => n.layerId === layer.id)
  }))
)

const layerNodeCounts = computed<Record<string, number>>(() => {
  const counts: Record<string, number> = {}
  for (const layer of activeView.value.layers) {
    counts[layer.id] = 0
  }
  for (const node of activeView.value.nodes) {
    counts[node.layerId] = (counts[node.layerId] ?? 0) + 1
  }
  return counts
})

function isNodeExpanded(nodeId: string): boolean {
  return expandAllColumns.value || Boolean(locallyExpandedNodeIds.value[nodeId])
}

function getCompactColumnsCount(columns: EntityColumn[]): number {
  if (columns.length <= 5) return columns.length
  const prioritized = columns.filter((col) => col.badges.some((badge) => KEY_BADGES.has(badge)))
  if (prioritized.length >= 3) return Math.min(6, prioritized.length)
  return 5
}

function estimateNodeDimensions(item: ExplorerNodeItem, expanded: boolean): { width: number; height: number } {
  if (item.kind === 'table') {
    const cols = item.columns ?? []
    const visibleCount = expanded ? cols.length : getCompactColumnsCount(cols)
    const hasToggleBtn = cols.length > getCompactColumnsCount(cols)
    const height = 82 + visibleCount * 29 + (hasToggleBtn ? 36 : 12)
    return { width: 274, height }
  }
  const hlCount = item.highlights?.length ?? 0
  const visibleHl = expanded ? hlCount : Math.min(4, hlCount)
  const height = 84 + visibleHl * 32 + 40
  return { width: 278, height }
}

function computeDagreLayout(): Record<string, { x: number; y: number }> {
  const view = activeView.value
  const graph = new graphlib.Graph({ multigraph: true })
  const isHorizontal = view.direction === 'LR'

  graph.setGraph({
    rankdir: view.direction,
    align: 'UL',
    ranker: 'network-simplex',
    nodesep: isHorizontal ? 54 : 52,
    ranksep: isHorizontal ? 132 : 104,
    edgesep: 30,
    marginx: 24,
    marginy: 24
  })
  graph.setDefaultEdgeLabel(() => ({}))

  const dimsById: Record<string, { width: number; height: number }> = {}

  for (const node of view.nodes) {
    const dims = estimateNodeDimensions(node, isNodeExpanded(node.id))
    dimsById[node.id] = dims
    graph.setNode(node.id, { width: dims.width, height: dims.height })
  }

  for (const edge of view.edges) {
    if (edge.source === edge.target) continue
    if (nodesById.value[edge.source] && nodesById.value[edge.target]) {
      graph.setEdge(edge.source, edge.target, { weight: 1 }, edge.id)
    }
  }

  dagreLayout(graph)

  const positions: Record<string, { x: number; y: number }> = {}
  for (const node of view.nodes) {
    const layoutNode = graph.node(node.id)
    const dims = dimsById[node.id]
    if (layoutNode) {
      positions[node.id] = {
        x: Math.round(layoutNode.x - dims.width / 2),
        y: Math.round(layoutNode.y - dims.height / 2)
      }
    } else {
      positions[node.id] = { x: 0, y: 0 }
    }
  }

  return positions
}

// Determina qué nodos y aristas están activos/resaltados/atenuados según la selección actual
const focusSets = computed(() => {
  const highlightedNodes = new Set<string>()
  const highlightedEdges = new Set<string>()
  const tourFocusNodes = new Set<string>()
  const scenarioNodes = new Set<string>()
  const scenarioEdges = new Set<string>()
  let hasActiveFocus = false

  if (activeScenario.value) {
    hasActiveFocus = true
    for (const nid of activeScenario.value.activeNodeIds) {
      highlightedNodes.add(nid)
      scenarioNodes.add(nid)
    }
    for (const eid of activeScenario.value.activeEdgeIds) {
      highlightedEdges.add(eid)
      scenarioEdges.add(eid)
    }
  }

  if (activeTourStep.value) {
    hasActiveFocus = true
    for (const nid of activeTourStep.value.focusNodeIds) {
      highlightedNodes.add(nid)
      tourFocusNodes.add(nid)
    }
    if (activeTourStep.value.focusEdgeId) {
      highlightedEdges.add(activeTourStep.value.focusEdgeId)
    }
    if (activeTourStep.value.selectEdgeId) {
      highlightedEdges.add(activeTourStep.value.selectEdgeId)
    }
  }

  if (activeLayerId.value) {
    hasActiveFocus = true
    for (const node of activeView.value.nodes) {
      if (node.layerId === activeLayerId.value) {
        highlightedNodes.add(node.id)
      }
    }
    for (const edge of activeView.value.edges) {
      if (highlightedNodes.has(edge.source) && highlightedNodes.has(edge.target)) {
        highlightedEdges.add(edge.id)
      }
    }
  }

  if (selectedEdge.value) {
    hasActiveFocus = true
    highlightedEdges.add(selectedEdge.value.id)
    highlightedNodes.add(selectedEdge.value.source)
    highlightedNodes.add(selectedEdge.value.target)
  } else if (selectedNode.value && !activeScenario.value && !activeTourStep.value) {
    hasActiveFocus = true
    highlightedNodes.add(selectedNode.value.id)
    for (const edge of activeView.value.edges) {
      if (edge.source === selectedNode.value.id || edge.target === selectedNode.value.id) {
        highlightedEdges.add(edge.id)
        highlightedNodes.add(edge.source)
        highlightedNodes.add(edge.target)
      }
    }
  } else if (selectedNode.value) {
    highlightedNodes.add(selectedNode.value.id)
  }

  return {
    hasActiveFocus,
    highlightedNodes,
    highlightedEdges,
    tourFocusNodes,
    scenarioNodes,
    scenarioEdges
  }
})

// Calcula desplazamiento vertical sutil para aristas paralelas entre el mismo par de nodos
const edgeLabelOffsets = computed<Record<string, number>>(() => {
  const pairGroups = new Map<string, string[]>()
  for (const edge of activeView.value.edges) {
    const key = [edge.source, edge.target].sort().join('__')
    const arr = pairGroups.get(key) ?? []
    arr.push(edge.id)
    pairGroups.set(key, arr)
  }
  const offsets: Record<string, number> = {}
  for (const ids of pairGroups.values()) {
    if (ids.length <= 1) {
      offsets[ids[0]] = 0
      continue
    }
    const mid = (ids.length - 1) / 2
    ids.forEach((id, idx) => {
      offsets[id] = Math.round((idx - mid) * 26)
    })
  }
  return offsets
})

function pickEdgeHandles(edge: ExplorerEdgeItem): { sourceHandle: string; targetHandle: string } {
  const dir = activeView.value.direction
  if (edge.source === edge.target) {
    return { sourceHandle: 'right-source', targetHandle: 'top-target' }
  }
  const srcPos = nodePositions.value[edge.source]
  const tgtPos = nodePositions.value[edge.target]
  if (dir === 'LR' && srcPos && tgtPos) {
    const dx = tgtPos.x - srcPos.x
    const dy = tgtPos.y - srcPos.y
    if (Math.abs(dx) < 110 && dy > 70) {
      return { sourceHandle: 'bottom-source', targetHandle: 'top-target' }
    }
    return { sourceHandle: 'right-source', targetHandle: 'left-target' }
  }
  if (dir === 'TB') {
    return { sourceHandle: 'bottom-source', targetHandle: 'top-target' }
  }
  return { sourceHandle: 'right-source', targetHandle: 'left-target' }
}

const flowNodes = computed<Node<EntityNodeData>[]>(() => {
  const view = activeView.value
  const focus = focusSets.value
  return view.nodes.map((item) => {
    const isSelected = selectedNodeId.value === item.id
    const isRelated = focus.hasActiveFocus && focus.highlightedNodes.has(item.id)
    const isDimmed = focus.hasActiveFocus && !focus.highlightedNodes.has(item.id)
    const isTourFocus = focus.tourFocusNodes.has(item.id)
    const isScenarioActive = focus.scenarioNodes.has(item.id)

    return {
      id: item.id,
      type: 'entity',
      position: nodePositions.value[item.id] ?? { x: 0, y: 0 },
      selected: isSelected,
      data: {
        item,
        layerLabel: layersById.value[item.layerId]?.label ?? item.layerId,
        direction: view.direction,
        isDark: isDark.value,
        expanded: isNodeExpanded(item.id),
        isSelected,
        isRelated,
        isDimmed,
        isTourFocus,
        isScenarioActive,
        onToggleExpand: toggleSingleNodeExpand
      }
    }
  })
})

function markerHexForAccent(accent: ExplorerAccent, highlighted: boolean): string {
  if (!highlighted) {
    return isDark.value ? '#475569' : '#94a3b8'
  }
  if (isDark.value) {
    switch (accent) {
      case 'cyan':
        return '#22d3ee'
      case 'sky':
        return '#38bdf8'
      case 'amber':
        return '#fbbf24'
      case 'rose':
        return '#fb7185'
      default:
        // avoid-ai-design-ignore: SD8
        return '#34d399'
    }
  }
  switch (accent) {
    case 'cyan':
      return '#0e7490'
    case 'sky':
      return '#0369a1'
    case 'amber':
      return '#b45309'
    case 'rose':
      return '#be123c'
    default:
      // avoid-ai-design-ignore: SD8
      return '#047857'
  }
}

const flowEdges = computed<Edge<RelationEdgeData>[]>(() => {
  const focus = focusSets.value
  const scenarioAccent = activeScenario.value?.accent
  return activeView.value.edges.map((edge) => {
    const isSelected = selectedEdgeId.value === edge.id
    const isScenarioEdge = focus.scenarioEdges.has(edge.id)
    const isHighlighted = focus.hasActiveFocus && focus.highlightedEdges.has(edge.id)
    const isDimmed = focus.hasActiveFocus && !focus.highlightedEdges.has(edge.id)
    const sourceNode = nodesById.value[edge.source]
    const targetNode = nodesById.value[edge.target]
    const accent: ExplorerAccent =
      isScenarioEdge && scenarioAccent
        ? scenarioAccent
        : targetNode?.accent ?? sourceNode?.accent ?? 'emerald'

    const isAnimated = Boolean(
      isSelected ||
        isScenarioEdge ||
        (isHighlighted && (selectedNodeId.value !== null || activeTourStep.value !== null)) ||
        (!focus.hasActiveFocus && edge.animatedByDefault)
    )

    const handles = pickEdgeHandles(edge)

    return {
      id: edge.id,
      source: edge.source,
      target: edge.target,
      sourceHandle: handles.sourceHandle,
      targetHandle: handles.targetHandle,
      type: 'relation',
      selected: isSelected,
      markerEnd: {
        type: MarkerType.ArrowClosed,
        width: 15,
        height: 15,
        color: markerHexForAccent(accent, isSelected || isHighlighted)
      },
      data: {
        edge,
        accent,
        isDark: isDark.value,
        isSelected,
        isHighlighted,
        isDimmed,
        isAnimated,
        labelOffsetY: edgeLabelOffsets.value[edge.id] ?? 0,
        onSelectEdge: selectEdgeById
      }
    }
  })
})

function syncUrlQueryParam(viewId: ExplorerViewId): void {
  if (typeof window === 'undefined') return
  try {
    const url = new URL(window.location.href)
    url.searchParams.set('vista', viewId)
    window.history.replaceState(window.history.state, '', `${url.pathname}${url.search}${url.hash}`)
  } catch {
    // Entornos sin History API modificable
  }
}

function runSafeFitView(nodeIds?: string[], duration = 440, padding = 0.16): void {
  if (typeof window === 'undefined') return
  nextTick(() => {
    window.setTimeout(() => {
      try {
        if (!flowInstance) return
        if (nodeIds && nodeIds.length > 0) {
          flowInstance.fitView({ nodes: nodeIds, duration, padding: Math.max(padding, 0.24) })
        } else {
          flowInstance.fitView({ duration, padding })
        }
      } catch {
        // Instancia aún inicializándose
      }
    }, 35)
  })
}

function resetLayout(shouldFit = true): void {
  nodePositions.value = computeDagreLayout()
  if (shouldFit && typeof window !== 'undefined') {
    runSafeFitView(undefined, 420, 0.14)
  }
}

function selectView(viewId: ExplorerViewId, syncUrl = true): void {
  if (!VALID_VIEW_IDS.has(viewId)) return
  activeViewId.value = viewId
  selectedNodeId.value = null
  selectedEdgeId.value = null
  activeLayerId.value = null
  activeScenarioId.value = null
  isTourActive.value = false
  tourIndex.value = 0
  locallyExpandedNodeIds.value = {}
  if (syncUrl) {
    syncUrlQueryParam(viewId)
  }
  resetLayout(true)
}

function selectNodeById(nodeId: string, focusCamera = false): void {
  if (!nodesById.value[nodeId]) return
  selectedEdgeId.value = null
  selectedNodeId.value = nodeId
  mobileInspectorOpen.value = true
  if (focusCamera && typeof window !== 'undefined') {
    runSafeFitView([nodeId], 440, 0.42)
  }
}

function selectEdgeById(edgeId: string, focusCamera = false): void {
  const edge = edgesById.value[edgeId]
  if (!edge) return
  selectedNodeId.value = null
  selectedEdgeId.value = edgeId
  mobileInspectorOpen.value = true
  if (focusCamera && typeof window !== 'undefined') {
    runSafeFitView([edge.source, edge.target], 440, 0.28)
  }
}

function clearSelection(): void {
  selectedNodeId.value = null
  selectedEdgeId.value = null
  if (!activeLayerId.value && !activeScenarioId.value && !isTourActive.value) {
    runSafeFitView(undefined, 360, 0.14)
  }
}

function selectLayerFilter(layerId: string | null): void {
  isTourActive.value = false
  activeScenarioId.value = null
  selectedNodeId.value = null
  selectedEdgeId.value = null
  activeLayerId.value = activeLayerId.value === layerId ? null : layerId

  if (typeof window === 'undefined') return
  if (activeLayerId.value) {
    const ids = activeView.value.nodes
      .filter((n) => n.layerId === activeLayerId.value)
      .map((n) => n.id)
    runSafeFitView(ids, 460, 0.22)
  } else {
    runSafeFitView(undefined, 420, 0.14)
  }
}

function selectScenario(scenarioId: string | null): void {
  isTourActive.value = false
  activeLayerId.value = null
  selectedEdgeId.value = null
  selectedNodeId.value = null

  if (!scenarioId || activeScenarioId.value === scenarioId) {
    activeScenarioId.value = null
    if (typeof window !== 'undefined') {
      runSafeFitView(undefined, 420, 0.14)
    }
    return
  }

  const scenario = scenarios.value.find((s) => s.id === scenarioId)
  if (!scenario) return
  activeScenarioId.value = scenario.id
  mobileInspectorOpen.value = true

  if (typeof window !== 'undefined') {
    runSafeFitView(scenario.activeNodeIds, 500, 0.22)
  }
}

function toggleAllColumns(): void {
  expandAllColumns.value = !expandAllColumns.value
  locallyExpandedNodeIds.value = {}
  resetLayout(true)
}

function toggleSingleNodeExpand(nodeId: string): void {
  const next = !isNodeExpanded(nodeId)
  if (expandAllColumns.value && !next) {
    // Si estaba expandido globalmente y compacta uno, desactiva global y deja los demás expandidos
    const map: Record<string, boolean> = {}
    for (const node of activeView.value.nodes) {
      map[node.id] = node.id !== nodeId
    }
    expandAllColumns.value = false
    locallyExpandedNodeIds.value = map
  } else {
    locallyExpandedNodeIds.value = {
      ...locallyExpandedNodeIds.value,
      [nodeId]: next
    }
  }
  nodePositions.value = computeDagreLayout()
}

function applyTourStep(index: number): void {
  const step = tourSteps.value[index]
  if (!step) return
  tourIndex.value = index
  activeLayerId.value = step.layerId ?? null
  activeScenarioId.value = null

  if (step.selectEdgeId && edgesById.value[step.selectEdgeId]) {
    selectedNodeId.value = null
    selectedEdgeId.value = step.selectEdgeId
  } else if (step.selectNodeId && nodesById.value[step.selectNodeId]) {
    selectedEdgeId.value = null
    selectedNodeId.value = step.selectNodeId
  } else if (step.focusNodeIds[0] && nodesById.value[step.focusNodeIds[0]]) {
    selectedEdgeId.value = null
    selectedNodeId.value = step.focusNodeIds[0]
  } else {
    selectedNodeId.value = null
    selectedEdgeId.value = null
  }

  mobileInspectorOpen.value = true
  if (typeof window !== 'undefined') {
    runSafeFitView(step.focusNodeIds, 520, 0.28)
  }
}

function toggleTour(): void {
  if (isTourActive.value) {
    stopTour()
    return
  }
  if (tourSteps.value.length === 0) return
  isTourActive.value = true
  applyTourStep(0)
}

function stopTour(): void {
  isTourActive.value = false
  activeLayerId.value = null
  if (typeof window !== 'undefined') {
    runSafeFitView(undefined, 420, 0.14)
  }
}

function nextTourStep(): void {
  if (!isTourActive.value) return
  if (tourIndex.value < tourSteps.value.length - 1) {
    applyTourStep(tourIndex.value + 1)
  } else {
    stopTour()
  }
}

function prevTourStep(): void {
  if (!isTourActive.value || tourIndex.value <= 0) return
  applyTourStep(tourIndex.value - 1)
}

function toggleFullscreen(): void {
  isFullscreen.value = !isFullscreen.value
  if (typeof window !== 'undefined') {
    runSafeFitView(undefined, 360, 0.14)
  }
}

function onNodeClick(event: NodeMouseEvent): void {
  selectNodeById(event.node.id, false)
}

function onEdgeClick(event: EdgeMouseEvent): void {
  selectEdgeById(event.edge.id, false)
}

function onPaneClick(): void {
  if (!isTourActive.value) {
    selectedNodeId.value = null
    selectedEdgeId.value = null
  }
}

function onNodeDragStop(event: NodeDragEvent): void {
  const dragged = event.node
  if (!dragged) return
  nodePositions.value = {
    ...nodePositions.value,
    [dragged.id]: {
      x: Math.round(dragged.position.x),
      y: Math.round(dragged.position.y)
    }
  }
}

function onFlowInit(instance: VueFlowStore): void {
  flowInstance = instance
  if (typeof window !== 'undefined') {
    runSafeFitView(undefined, 260, 0.14)
  }
}

function onNodesInitialized(): void {
  if (typeof window !== 'undefined' && !selectedNodeId.value && !selectedEdgeId.value && !activeScenarioId.value && !isTourActive.value) {
    runSafeFitView(undefined, 320, 0.14)
  }
}

function minimapNodeColor(node: GraphNode): string {
  const accent = (node.data as EntityNodeData | undefined)?.item?.accent ?? 'emerald'
  return markerHexForAccent(accent, true)
}

function columnBadgeClass(badge: ColumnBadge): string {
  switch (badge) {
    case 'PK':
      return 'ag-insp-chip--pk'
    case 'FK':
      return 'ag-insp-chip--fk'
    case 'UK':
      return 'ag-insp-chip--uk'
    case 'GIN':
      return 'ag-insp-chip--gin'
    case 'ENUM':
      return 'ag-insp-chip--enum'
    default:
      return 'ag-insp-chip--meta'
  }
}

function onDeleteToneClass(rule?: string): string {
  if (!rule) return 'ag-insp-chip--meta'
  const upper = rule.toUpperCase()
  if (upper.includes('RESTRICT') || upper.includes('NO ACTION')) return 'ag-insp-chip--enum'
  if (upper.includes('CASCADE')) return 'ag-insp-chip--pk'
  if (upper.includes('SET NULL')) return 'ag-insp-chip--fk'
  return 'ag-insp-chip--gin'
}

function handleKeydown(event: KeyboardEvent): void {
  const target = event.target as HTMLElement | null
  if (target && ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) return

  if (event.key === 'Escape') {
    if (isFullscreen.value) {
      isFullscreen.value = false
      runSafeFitView(undefined, 320, 0.14)
      return
    }
    if (isTourActive.value) {
      stopTour()
      return
    }
    if (selectedNodeId.value || selectedEdgeId.value) {
      clearSelection()
    }
  } else if (isTourActive.value && event.key === 'ArrowRight') {
    event.preventDefault()
    nextTourStep()
  } else if (isTourActive.value && event.key === 'ArrowLeft') {
    event.preventDefault()
    prevTourStep()
  }
}

function handlePopstate(): void {
  const nextView = getInitialViewId()
  if (nextView !== activeViewId.value) {
    selectView(nextView, false)
  }
}

watch(isFullscreen, (open) => {
  if (typeof document === 'undefined') return
  document.documentElement.style.overflow = open ? 'hidden' : ''
})

// Calcula layout inicial de forma síncrona para primer pintado sin saltos
nodePositions.value = computeDagreLayout()

onMounted(() => {
  isDark.value = document.documentElement.classList.contains('dark')
  themeObserver = new MutationObserver(() => {
    isDark.value = document.documentElement.classList.contains('dark')
  })
  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class']
  })

  const param = new URLSearchParams(window.location.search).get('vista') as ExplorerViewId | null
  if (param && VALID_VIEW_IDS.has(param) && param !== activeViewId.value) {
    selectView(param, false)
  } else {
    resetLayout(true)
  }

  window.addEventListener('keydown', handleKeydown)
  window.addEventListener('popstate', handlePopstate)
})

onBeforeUnmount(() => {
  themeObserver?.disconnect()
  themeObserver = null
  flowInstance = null
  if (typeof window !== 'undefined') {
    window.removeEventListener('keydown', handleKeydown)
    window.removeEventListener('popstate', handlePopstate)
  }
  if (typeof document !== 'undefined') {
    document.documentElement.style.overflow = ''
  }
})
</script>

<template>
  <section
    class="ag-explorer-shell"
    :class="{ 'is-fullscreen': isFullscreen, 'is-dark': isDark }"
    aria-label="Explorador interactivo de modelo entidad-relación y arquitectura AgentGuard"
  >
    <!-- Barra superior de control -->
    <header class="ag-exp-topbar">
      <div class="ag-exp-tabs" role="tablist" aria-label="Lienzos del explorador">
        <button
          v-for="view in EXPLORER_VIEW_LIST"
          :key="view.id"
          type="button"
          role="tab"
          class="ag-exp-tab"
          :class="{ 'is-active': activeViewId === view.id }"
          :aria-selected="activeViewId === view.id"
          :data-view-tab="view.id"
          @click="selectView(view.id)"
        >
          <span class="ag-exp-tab-label">{{ view.shortLabel }}</span>
          <span class="ag-exp-tab-count">{{ view.nodes.length }}</span>
        </button>
      </div>

      <div class="ag-exp-actions">
        <button
          type="button"
          class="ag-exp-btn ag-exp-btn--primary"
          :class="{ 'is-active': isTourActive }"
          data-action="toggle-tour"
          @click="toggleTour"
        >
          <svg
            class="ag-exp-ico"
            viewBox="0 0 18 18"
            fill="none"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <polygon v-if="!isTourActive" points="5,3.5 14.5,9 5,14.5" />
            <template v-else>
              <line x1="4.5" y1="4.5" x2="13.5" y2="13.5" />
              <line x1="13.5" y1="4.5" x2="4.5" y2="13.5" />
            </template>
          </svg>
          <span>{{ isTourActive ? 'Salir del recorrido' : 'Recorrido guiado' }}</span>
        </button>

        <button
          v-if="hasTableNodes"
          type="button"
          class="ag-exp-btn"
          :class="{ 'is-active': expandAllColumns }"
          data-action="toggle-columns"
          @click="toggleAllColumns"
        >
          <svg
            class="ag-exp-ico"
            viewBox="0 0 18 18"
            fill="none"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <line x1="3" y1="5" x2="15" y2="5" />
            <line x1="3" y1="9" x2="15" y2="9" />
            <line x1="3" y1="13" x2="11" y2="13" />
          </svg>
          <span>{{ expandAllColumns ? 'Compactar columnas' : 'Expandir columnas' }}</span>
        </button>

        <button
          type="button"
          class="ag-exp-btn"
          data-action="relayout"
          @click="resetLayout(true)"
        >
          <svg
            class="ag-exp-ico"
            viewBox="0 0 18 18"
            fill="none"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <rect x="2.5" y="2.5" width="5" height="5" rx="1" />
            <rect x="10.5" y="2.5" width="5" height="5" rx="1" />
            <rect x="6.5" y="10.5" width="5" height="5" rx="1" />
            <path d="M5 7.5v1.5h8V7.5M9 9v1.5" />
          </svg>
          <span>Reordenar grafo</span>
        </button>

        <button
          type="button"
          class="ag-exp-btn"
          :class="{ 'is-active': isFullscreen }"
          :aria-pressed="isFullscreen"
          data-action="toggle-fullscreen"
          @click="toggleFullscreen"
        >
          <svg
            class="ag-exp-ico"
            viewBox="0 0 18 18"
            fill="none"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <template v-if="!isFullscreen">
              <polyline points="3,7 3,3 7,3" />
              <polyline points="11,3 15,3 15,7" />
              <polyline points="15,11 15,15 11,15" />
              <polyline points="7,15 3,15 3,11" />
            </template>
            <template v-else>
              <polyline points="7,3 7,7 3,7" />
              <polyline points="15,7 11,7 11,3" />
              <polyline points="11,15 11,11 15,11" />
              <polyline points="3,11 7,11 7,15" />
            </template>
          </svg>
          <span>{{ isFullscreen ? 'Salir pantalla completa' : 'Pantalla completa' }}</span>
        </button>
      </div>
    </header>

    <!-- Barra secundaria: Escenarios canónicos (Runtime) o Filtros de capa (MER) -->
    <div class="ag-exp-subbar">
      <template v-if="scenarios.length > 0">
        <span class="ag-exp-subbar-label">Escenarios canónicos:</span>
        <div class="ag-exp-pills" role="group" aria-label="Selector de escenarios canónicos">
          <button
            type="button"
            class="ag-exp-pill"
            :class="{ 'is-active': activeScenarioId === null }"
            data-scenario-pill="all"
            @click="selectScenario(null)"
          >
            <span>Arquitectura completa</span>
          </button>

          <button
            v-for="scenario in scenarios"
            :key="scenario.id"
            type="button"
            class="ag-exp-pill"
            :class="[
              `ag-exp-pill--${scenario.accent}`,
              { 'is-active': activeScenarioId === scenario.id }
            ]"
            :title="`${scenario.code}: ${scenario.summary}`"
            :data-scenario-pill="scenario.id"
            @click="selectScenario(scenario.id)"
          >
            <span class="ag-exp-pill-dot" :class="`ag-dot--${scenario.accent}`" aria-hidden="true" />
            <span>{{ scenario.title }}</span>
            <span class="ag-exp-pill-verdict">{{ scenario.verdict }}</span>
          </button>
        </div>
      </template>

      <template v-else>
        <span class="ag-exp-subbar-label">Capas del modelo:</span>
        <div class="ag-exp-pills" role="group" aria-label="Filtros por capa del modelo">
          <button
            type="button"
            class="ag-exp-pill"
            :class="{ 'is-active': activeLayerId === null }"
            data-layer-pill="all"
            @click="selectLayerFilter(null)"
          >
            <span>Todas las capas</span>
            <span class="ag-exp-pill-num">{{ activeView.nodes.length }}</span>
          </button>

          <button
            v-for="layer in activeView.layers"
            :key="layer.id"
            type="button"
            class="ag-exp-pill"
            :class="[
              `ag-exp-pill--${layer.accent}`,
              { 'is-active': activeLayerId === layer.id }
            ]"
            :data-layer-pill="layer.id"
            @click="selectLayerFilter(layer.id)"
          >
            <span class="ag-exp-pill-dot" :class="`ag-dot--${layer.accent}`" aria-hidden="true" />
            <span>{{ layer.label }}</span>
            <span class="ag-exp-pill-num">{{ layerNodeCounts[layer.id] ?? 0 }}</span>
          </button>
        </div>
      </template>

      <div class="ag-exp-canvas-hint">
        <span>{{ activeView.nodes.length }} nodos</span>
        <span class="ag-exp-hint-sep" aria-hidden="true">/</span>
        <span>{{ activeView.edges.length }} relaciones</span>
        <span class="ag-exp-hint-sep" aria-hidden="true">/</span>
        <span>Arrastrá o tocá cualquier elemento</span>
      </div>
    </div>

    <!-- Área principal: Lienzo Vue Flow + Panel Inspector -->
    <div class="ag-exp-workspace">
      <div class="ag-exp-canvas-wrap">
        <VueFlow
          :id="flowInstanceId"
          :key="activeViewId"
          :nodes="flowNodes"
          :edges="flowEdges"
          :nodes-draggable="true"
          :nodes-connectable="false"
          :elements-selectable="true"
          :min-zoom="0.25"
          :max-zoom="2.2"
          :fit-view-on-init="true"
          class="ag-exp-vueflow"
          @init="onFlowInit"
          @nodes-initialized="onNodesInitialized"
          @node-click="onNodeClick"
          @edge-click="onEdgeClick"
          @pane-click="onPaneClick"
          @node-drag-stop="onNodeDragStop"
        >
          <template #node-entity="nodeProps">
            <EntityTableNode v-bind="nodeProps" />
          </template>

          <template #edge-relation="edgeProps">
            <RelationEdge v-bind="edgeProps" />
          </template>

          <Background
            :pattern-color="isDark ? '#1e293b' : '#cbd5e1'"
            :gap="22"
            :size="1.2"
          />

          <Controls
            position="bottom-left"
            :show-interactive="false"
            :fit-view-params="{ padding: 0.14, duration: 360 }"
          />

          <MiniMap
            position="top-right"
            class="ag-exp-minimap"
            :width="148"
            :height="94"
            :pannable="true"
            :zoomable="true"
            :node-color="minimapNodeColor"
            :mask-color="isDark ? 'rgba(11, 17, 32, 0.78)' : 'rgba(241, 245, 249, 0.78)'"
          />
        </VueFlow>

        <!-- Barra narrativa del Recorrido Guiado -->
        <aside
          v-if="isTourActive && activeTourStep"
          class="ag-exp-tour-bar"
          aria-live="polite"
          aria-label="Recorrido guiado paso a paso"
        >
          <div class="ag-exp-tour-head">
            <div class="ag-exp-tour-meta">
              <span class="ag-exp-tour-step">
                {{ activeTourStep.badge || `Paso ${tourIndex + 1} de ${tourSteps.length}` }}
              </span>
              <span
                v-if="activeTourStep.layerId && layersById[activeTourStep.layerId]"
                class="ag-exp-tour-badge"
              >
                {{ layersById[activeTourStep.layerId].label }}
              </span>
            </div>

            <button
              type="button"
              class="ag-exp-tour-close"
              aria-label="Salir del recorrido guiado"
              @click="stopTour"
            >
              Salir del recorrido
            </button>
          </div>

          <h4 class="ag-exp-tour-title">{{ activeTourStep.title }}</h4>
          <p class="ag-exp-tour-body">{{ activeTourStep.narrative }}</p>

          <div class="ag-exp-tour-nav">
            <button
              type="button"
              class="ag-exp-tour-btn"
              :disabled="tourIndex === 0"
              data-tour-action="prev"
              @click="prevTourStep"
            >
              <svg
                class="ag-exp-ico"
                viewBox="0 0 18 18"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
              >
                <polyline points="11,4 6,9 11,14" />
              </svg>
              <span>Anterior</span>
            </button>

            <span class="ag-exp-tour-keys">Teclas de flecha o Esc</span>

            <button
              type="button"
              class="ag-exp-tour-btn ag-exp-tour-btn--next"
              data-tour-action="next"
              @click="nextTourStep"
            >
              <span>{{ tourIndex === tourSteps.length - 1 ? 'Finalizar recorrido' : 'Siguiente' }}</span>
              <svg
                class="ag-exp-ico"
                viewBox="0 0 18 18"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
              >
                <polyline points="7,4 12,9 7,14" />
              </svg>
            </button>
          </div>
        </aside>
      </div>

      <!-- Panel Inspector Explicativo -->
      <aside
        class="ag-exp-inspector"
        :class="{ 'is-mobile-collapsed': !mobileInspectorOpen }"
        aria-label="Inspector técnico explicativo"
      >
        <!-- Toggle móvil del drawer del inspector -->
        <button
          type="button"
          class="ag-exp-mobile-drawer-btn"
          :aria-expanded="mobileInspectorOpen"
          @click="mobileInspectorOpen = !mobileInspectorOpen"
        >
          <span class="ag-exp-mobile-drawer-title">
            <template v-if="selectedNode">Inspector: {{ selectedNode.title }}</template>
            <template v-else-if="selectedEdge">Relación: {{ selectedEdge.label }}</template>
            <template v-else-if="activeScenario">Escenario: {{ activeScenario.code }}</template>
            <template v-else>Inspector técnico y guía de entidades</template>
          </span>
          <svg
            class="ag-exp-ico ag-exp-drawer-chevron"
            :class="{ 'is-open': mobileInspectorOpen }"
            viewBox="0 0 18 18"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <polyline points="4.5,7 9,11.5 13.5,7" />
          </svg>
        </button>

        <div class="ag-exp-inspector-scroll">
          <!-- ESTADO 1: Relación seleccionada -->
          <div v-if="selectedEdge" class="ag-insp-pane" data-inspector-mode="edge">
            <div class="ag-insp-top-row">
              <span class="ag-insp-kicker">Relación seleccionada</span>
              <button type="button" class="ag-insp-reset-btn" @click="clearSelection">
                Ver todo
              </button>
            </div>

            <div class="ag-insp-edge-route">
              <button
                type="button"
                class="ag-insp-jump-chip"
                @click="selectNodeById(selectedEdge.source, true)"
              >
                {{ nodesById[selectedEdge.source]?.title ?? selectedEdge.source }}
              </button>

              <svg
                class="ag-insp-route-arrow"
                viewBox="0 0 20 18"
                fill="none"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
              >
                <line x1="2" y1="9" x2="17" y2="9" />
                <polyline points="12,4.5 17,9 12,13.5" />
              </svg>

              <button
                type="button"
                class="ag-insp-jump-chip"
                @click="selectNodeById(selectedEdge.target, true)"
              >
                {{ nodesById[selectedEdge.target]?.title ?? selectedEdge.target }}
              </button>
            </div>

            <h3 class="ag-insp-title">{{ selectedEdge.relationTitle }}</h3>

            <dl class="ag-insp-meta-grid">
              <div class="ag-insp-meta-cell">
                <dt>Cardinalidad Chen</dt>
                <dd class="ag-insp-mono">{{ selectedEdge.chenCardinality ?? selectedEdge.label }}</dd>
              </div>
              <div class="ag-insp-meta-cell">
                <dt>Tipo de unión</dt>
                <dd>{{ selectedEdge.relationType }}</dd>
              </div>
              <div v-if="selectedEdge.onDelete" class="ag-insp-meta-cell ag-insp-meta-cell--full">
                <dt>Integridad referencial</dt>
                <dd>
                  <span class="ag-insp-chip" :class="onDeleteToneClass(selectedEdge.onDelete)">
                    {{ selectedEdge.onDelete }}
                  </span>
                </dd>
              </div>
            </dl>

            <section class="ag-insp-section">
              <h4 class="ag-insp-sec-title">Por qué esta cardinalidad y tipo de unión</h4>
              <p class="ag-insp-text">{{ selectedEdge.whyThisRelation }}</p>
            </section>

            <section class="ag-insp-section">
              <h4 class="ag-insp-sec-title">Regla de integridad y por qué se eligió</h4>
              <p class="ag-insp-text">{{ selectedEdge.integrityRationale }}</p>
            </section>

            <section class="ag-insp-defense">
              <h4 class="ag-insp-defense-label">Tip para la defensa oral</h4>
              <p class="ag-insp-defense-a">{{ selectedEdge.defenseTip }}</p>
            </section>
          </div>

          <!-- ESTADO 2: Entidad / Servicio seleccionado -->
          <div v-else-if="selectedNode" class="ag-insp-pane" data-inspector-mode="node">
            <div v-if="activeScenario" class="ag-insp-scenario-banner">
              <span>Escenario activo: {{ activeScenario.code }}</span>
              <button type="button" class="ag-insp-link-btn" @click="selectedNodeId = null">
                Ver veredicto
              </button>
            </div>

            <div class="ag-insp-top-row">
              <div class="ag-insp-badges">
                <span class="ag-insp-layer-pill" :class="`ag-pill-tone--${selectedNode.accent}`">
                  {{ layersById[selectedNode.layerId]?.label ?? selectedNode.layerId }}
                </span>
                <span v-if="selectedNode.badge" class="ag-insp-chip ag-insp-chip--meta">
                  {{ selectedNode.badge }}
                </span>
              </div>
              <button type="button" class="ag-insp-reset-btn" @click="clearSelection">
                Ver todo
              </button>
            </div>

            <h3
              class="ag-insp-title"
              :class="{ 'ag-insp-title--mono': selectedNode.kind === 'table' }"
            >
              {{ selectedNode.title }}
            </h3>
            <p class="ag-insp-subtitle">{{ selectedNode.subtitle }}</p>
            <p class="ag-insp-summary">{{ selectedNode.summary }}</p>

            <section class="ag-insp-section">
              <h4 class="ag-insp-sec-title">Por qué está diseñada así</h4>
              <p class="ag-insp-text">{{ selectedNode.whyDesigned }}</p>
            </section>

            <section v-if="selectedNode.securityNotes.length > 0" class="ag-insp-section">
              <h4 class="ag-insp-sec-title">Decisiones de seguridad y normalización</h4>
              <ul class="ag-insp-bullets">
                <li v-for="note in selectedNode.securityNotes" :key="note">
                  {{ note }}
                </li>
              </ul>
            </section>

            <section v-if="selectedNodeConnectedEdges.length > 0" class="ag-insp-section">
              <h4 class="ag-insp-sec-title">
                Relaciones conectadas ({{ selectedNodeConnectedEdges.length }})
              </h4>
              <ul class="ag-insp-rel-list">
                <li
                  v-for="rel in selectedNodeConnectedEdges"
                  :key="rel.edge.id"
                  class="ag-insp-rel-item"
                >
                  <button
                    type="button"
                    class="ag-insp-rel-main"
                    @click="selectEdgeById(rel.edge.id, true)"
                  >
                    <span class="ag-insp-rel-dir">
                      {{ rel.direction === 'out' ? 'Sale hacia' : 'Entra desde' }}
                    </span>
                    <span class="ag-insp-rel-target">
                      {{ rel.neighbor?.title ?? (rel.direction === 'out' ? rel.edge.target : rel.edge.source) }}
                    </span>
                    <span class="ag-insp-rel-card">{{ rel.edge.label }}</span>
                  </button>
                  <button
                    v-if="rel.neighbor"
                    type="button"
                    class="ag-insp-rel-go"
                    :aria-label="`Ir a ${rel.neighbor.title}`"
                    @click="selectNodeById(rel.neighbor.id, true)"
                  >
                    Ir
                  </button>
                </li>
              </ul>
            </section>

            <section
              v-if="selectedNode.kind === 'table' && selectedNode.columns && selectedNode.columns.length > 0"
              class="ag-insp-section"
            >
              <h4 class="ag-insp-sec-title">
                Estructura de columnas ({{ selectedNode.columns.length }})
              </h4>
              <div class="ag-insp-cols">
                <div v-for="col in selectedNode.columns" :key="col.name" class="ag-insp-col-row">
                  <div class="ag-insp-col-top">
                    <span class="ag-insp-col-name">{{ col.name }}</span>
                    <span class="ag-insp-col-type">{{ col.type }}</span>
                  </div>
                  <div v-if="col.badges.length > 0" class="ag-insp-col-badges">
                    <span
                      v-for="badge in col.badges"
                      :key="`${col.name}-${badge}`"
                      class="ag-insp-chip"
                      :class="columnBadgeClass(badge)"
                    >
                      {{ badge }}
                    </span>
                  </div>
                  <p v-if="col.note" class="ag-insp-col-note">{{ col.note }}</p>
                </div>
              </div>
            </section>

            <section
              v-else-if="selectedNode.highlights && selectedNode.highlights.length > 0"
              class="ag-insp-section"
            >
              <h4 class="ag-insp-sec-title">Responsabilidades clave</h4>
              <ul class="ag-insp-bullets">
                <li v-for="hl in selectedNode.highlights" :key="hl">
                  {{ hl }}
                </li>
              </ul>
            </section>

            <section class="ag-insp-defense">
              <h4 class="ag-insp-defense-label">Pregunta típica de defensa</h4>
              <p class="ag-insp-defense-q">{{ selectedNode.defenseQuestion }}</p>
              <p class="ag-insp-defense-a">{{ selectedNode.defenseAnswer }}</p>
            </section>

            <a :href="withBase(selectedNode.docLink)" class="ag-insp-doc-link">
              <svg
                class="ag-exp-ico"
                viewBox="0 0 18 18"
                fill="none"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
              >
                <path d="M4 2.75h7.5L14.5 5.75v9.5a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-11.5a1 1 0 0 1 1-1Z" />
                <polyline points="11,2.75 11,6 14.5,6" />
                <line x1="6" y1="9.5" x2="12" y2="9.5" />
                <line x1="6" y1="12.5" x2="10.5" y2="12.5" />
              </svg>
              <span>{{ selectedNode.docLabel }}</span>
            </a>
          </div>

          <!-- ESTADO 3: Escenario canónico activo (Flujo Runtime) -->
          <div v-else-if="activeScenario" class="ag-insp-pane" data-inspector-mode="scenario">
            <div class="ag-insp-top-row">
              <span class="ag-insp-verdict-pill" :class="`ag-pill-tone--${activeScenario.accent}`">
                {{ activeScenario.verdict }}
              </span>
              <button type="button" class="ag-insp-reset-btn" @click="selectScenario(null)">
                Ver vista completa
              </button>
            </div>

            <h3 class="ag-insp-title">{{ activeScenario.code }}: {{ activeScenario.title }}</h3>

            <dl class="ag-insp-meta-grid">
              <div class="ag-insp-meta-cell">
                <dt>Acción evaluada</dt>
                <dd class="ag-insp-mono">{{ activeScenario.action }}</dd>
              </div>
              <div class="ag-insp-meta-cell">
                <dt>Respuesta HTTP</dt>
                <dd class="ag-insp-mono">{{ activeScenario.httpStatus }}</dd>
              </div>
            </dl>

            <p class="ag-insp-summary">{{ activeScenario.summary }}</p>

            <section class="ag-insp-section">
              <h4 class="ag-insp-sec-title">Recorrido runtime paso a paso</h4>
              <p class="ag-insp-text">{{ activeScenario.narrative }}</p>
            </section>

            <section v-if="activeScenario.keyFacts.length > 0" class="ag-insp-section">
              <h4 class="ag-insp-sec-title">Hechos verificados en backend</h4>
              <ul class="ag-insp-bullets">
                <li v-for="fact in activeScenario.keyFacts" :key="fact">
                  {{ fact }}
                </li>
              </ul>
            </section>

            <section class="ag-insp-section">
              <h4 class="ag-insp-sec-title">Componentes atravesados (tocá para inspeccionar)</h4>
              <div class="ag-insp-path-chips">
                <button
                  v-for="(nid, idx) in activeScenario.activeNodeIds"
                  :key="nid"
                  type="button"
                  class="ag-insp-path-btn"
                  @click="selectNodeById(nid, true)"
                >
                  <span class="ag-insp-path-idx">{{ idx + 1 }}</span>
                  <span>{{ nodesById[nid]?.title ?? nid }}</span>
                </button>
              </div>
            </section>
          </div>

          <!-- ESTADO 4: Vista inicial sin selección -->
          <div v-else class="ag-insp-pane" data-inspector-mode="overview">
            <span class="ag-insp-kicker">Lienzo activo</span>
            <h3 class="ag-insp-title">{{ activeView.title }}</h3>
            <p class="ag-insp-subtitle">{{ activeView.subtitle }}</p>

            <dl v-if="activeView.stats.length > 0" class="ag-insp-stats-grid">
              <div v-for="stat in activeView.stats" :key="stat.label" class="ag-insp-stat-box">
                <dt>{{ stat.label }}</dt>
                <dd>{{ stat.value }}</dd>
              </div>
            </dl>

            <div class="ag-insp-guide-box">
              <p class="ag-insp-text">
                Tocá cualquier tabla, servicio o píldora de relación en el grafo para ver por qué fue
                diseñada así, sus reglas de integridad y respuestas clave para la defensa.
              </p>
              <button
                v-if="tourSteps.length > 0"
                type="button"
                class="ag-insp-cta-btn"
                @click="toggleTour"
              >
                <svg
                  class="ag-exp-ico"
                  viewBox="0 0 18 18"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.9"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  aria-hidden="true"
                >
                  <polygon points="5,3.5 14.5,9 5,14.5" />
                </svg>
                <span>Iniciar recorrido guiado ({{ tourSteps.length }} pasos)</span>
              </button>
            </div>

            <div class="ag-insp-directory">
              <h4 class="ag-insp-sec-title">Salto rápido por capa</h4>

              <div
                v-for="group in groupedNodesByLayer"
                :key="group.layer.id"
                class="ag-insp-layer-group"
              >
                <div class="ag-insp-layer-group-head">
                  <span
                    class="ag-exp-pill-dot"
                    :class="`ag-dot--${group.layer.accent}`"
                    aria-hidden="true"
                  />
                  <span class="ag-insp-layer-group-name">{{ group.layer.label }}</span>
                </div>

                <div class="ag-insp-node-chips">
                  <button
                    v-for="node in group.nodes"
                    :key="node.id"
                    type="button"
                    class="ag-insp-node-chip"
                    :class="{ 'ag-insp-node-chip--mono': node.kind === 'table' }"
                    @click="selectNodeById(node.id, true)"
                  >
                    {{ node.title }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </div>
  </section>
</template>

<style scoped>
.ag-explorer-shell {
  width: 100%;
  max-width: 100%;
  display: flex;
  flex-direction: column;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  border-bottom: 1px solid var(--ag-border);
  overflow-x: clip;
}

.ag-explorer-shell.is-fullscreen {
  position: fixed;
  inset: 0;
  z-index: 90;
  height: 100vh;
  max-height: 100vh;
  border-bottom: none;
}

/* Barra superior */
.ag-exp-topbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem 1rem;
  padding: 0.72rem 1.1rem;
  background: var(--ag-surface-elevated);
  border-bottom: 1px solid var(--ag-border);
}

.ag-exp-tabs {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.4rem;
}

.ag-exp-tab {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.45rem 0.82rem;
  border-radius: 7px;
  border: 1px solid var(--ag-border);
  background: var(--ag-surface-card);
  color: var(--vp-c-text-2);
  font-size: 0.86rem;
  font-weight: 600;
  line-height: 1.25;
  cursor: pointer;
  transition: background-color 0.16s ease, border-color 0.16s ease, color 0.16s ease;
}

.ag-exp-tab:hover {
  border-color: var(--ag-border-strong);
  color: var(--vp-c-text-1);
}

.ag-exp-tab.is-active {
  background: rgba(4, 120, 87, 0.11);
  border-color: var(--ag-emerald-strong);
  color: var(--ag-emerald-aaa);
}

.ag-explorer-shell.is-dark .ag-exp-tab.is-active {
  background: rgba(16, 185, 129, 0.2);
  border-color: var(--ag-emerald-strong);
  color: var(--ag-emerald-aaa);
}

.ag-exp-tab-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 1.35rem;
  padding: 0.04rem 0.34rem;
  border-radius: 999px;
  background: var(--ag-surface-subtle);
  color: var(--vp-c-text-2);
  font-size: 0.74rem;
  font-weight: 700;
}

.ag-exp-tab.is-active .ag-exp-tab-count {
  background: var(--ag-surface-card);
  color: var(--ag-emerald-aaa);
}

.ag-exp-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.45rem;
}

.ag-exp-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.44rem 0.76rem;
  border-radius: 7px;
  border: 1px solid var(--ag-border-strong);
  background: var(--ag-surface-card);
  color: var(--vp-c-text-1);
  font-size: 0.83rem;
  font-weight: 600;
  line-height: 1.25;
  cursor: pointer;
  transition: background-color 0.16s ease, border-color 0.16s ease, color 0.16s ease;
}

.ag-exp-btn:hover {
  background: var(--ag-surface-subtle);
  border-color: var(--ag-emerald-strong);
}

.ag-exp-btn.is-active {
  border-color: var(--ag-emerald-strong);
  background: rgba(4, 120, 87, 0.12);
  color: var(--ag-emerald-aaa);
}

.ag-exp-btn--primary {
  background: var(--vp-button-brand-bg);
  border-color: var(--vp-button-brand-bg);
  color: var(--vp-button-brand-text);
}

.ag-exp-btn--primary:hover {
  background: var(--vp-button-brand-hover-bg);
  border-color: var(--vp-button-brand-hover-bg);
  color: var(--vp-button-brand-text);
}

.ag-exp-btn--primary.is-active {
  background: var(--ag-surface-card);
  border-color: var(--ag-rose);
  color: var(--ag-rose);
}

.ag-exp-ico {
  width: 15px;
  height: 15px;
  flex-shrink: 0;
}

/* Subbarra de capas / escenarios */
.ag-exp-subbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem 0.75rem;
  padding: 0.56rem 1.1rem;
  background: var(--vp-c-bg);
  border-bottom: 1px solid var(--ag-border);
}

.ag-exp-subbar-label {
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--vp-c-text-3);
  white-space: nowrap;
}

.ag-exp-pills {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.38rem;
}

.ag-exp-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.38rem;
  padding: 0.28rem 0.66rem;
  border-radius: 999px;
  border: 1px solid var(--ag-border);
  background: var(--ag-surface-elevated);
  color: var(--vp-c-text-2);
  font-size: 0.79rem;
  font-weight: 600;
  line-height: 1.25;
  cursor: pointer;
  transition: background-color 0.15s ease, border-color 0.15s ease, color 0.15s ease;
}

.ag-exp-pill:hover {
  border-color: var(--ag-border-strong);
  color: var(--vp-c-text-1);
}

.ag-exp-pill.is-active {
  background: var(--ag-surface-card);
  border-color: var(--ag-emerald-strong);
  color: var(--vp-c-text-1);
  box-shadow: 0 0 0 1px var(--ag-emerald-strong);
}

.ag-exp-pill--cyan.is-active {
  border-color: var(--ag-cyan-strong);
  box-shadow: 0 0 0 1px var(--ag-cyan-strong);
}

.ag-exp-pill--sky.is-active {
  border-color: #0369a1;
  box-shadow: 0 0 0 1px #0369a1;
}

.ag-explorer-shell.is-dark .ag-exp-pill--sky.is-active {
  border-color: #38bdf8;
  box-shadow: 0 0 0 1px #38bdf8;
}

.ag-exp-pill--amber.is-active {
  border-color: var(--ag-amber);
  box-shadow: 0 0 0 1px var(--ag-amber);
}

.ag-exp-pill--rose.is-active {
  border-color: var(--ag-rose);
  box-shadow: 0 0 0 1px var(--ag-rose);
}

.ag-exp-pill-dot {
  width: 8px;
  height: 8px;
  border-radius: 999px;
  flex-shrink: 0;
}

.ag-dot--emerald {
  background: var(--ag-emerald-strong);
}

.ag-dot--cyan {
  background: var(--ag-cyan-strong);
}

.ag-dot--sky {
  background: #0369a1;
}

.ag-explorer-shell.is-dark .ag-dot--sky {
  background: #38bdf8;
}

.ag-dot--amber {
  background: var(--ag-amber);
}

.ag-dot--rose {
  background: var(--ag-rose);
}

.ag-exp-pill-num {
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--vp-c-text-3);
}

.ag-exp-pill-verdict {
  padding: 0.05rem 0.36rem;
  border-radius: 4px;
  background: var(--ag-surface-subtle);
  color: var(--vp-c-text-1);
  font-size: 0.7rem;
  font-weight: 700;
}

/* Espacio de trabajo principal */
.ag-exp-workspace {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 402px;
  height: calc(100vh - var(--vp-nav-height, 64px) - 108px);
  min-height: 600px;
  width: 100%;
  min-width: 0;
}

.ag-explorer-shell.is-fullscreen .ag-exp-workspace {
  flex: 1 1 auto;
  height: auto;
  min-height: 0;
}

.ag-exp-canvas-wrap {
  position: relative;
  min-width: 0;
  min-height: 0;
  height: 100%;
  background: var(--ag-surface-canvas);
}

.ag-exp-vueflow {
  width: 100%;
  height: 100%;
  background: var(--ag-surface-canvas);
}

/* Override limpio de controles y minimap Vue Flow en Dark y Light */
.ag-exp-vueflow :deep(.vue-flow__controls) {
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid var(--ag-border-strong);
  background: var(--ag-surface-card);
  box-shadow: var(--ag-shadow-sm);
}

.ag-exp-vueflow :deep(.vue-flow__controls-button) {
  width: 30px;
  height: 30px;
  background: var(--ag-surface-card);
  border-bottom: 1px solid var(--ag-border);
  color: var(--vp-c-text-1);
  fill: var(--vp-c-text-1);
}

.ag-exp-vueflow :deep(.vue-flow__controls-button:last-child) {
  border-bottom: none;
}

.ag-exp-vueflow :deep(.vue-flow__controls-button:hover) {
  background: var(--ag-surface-subtle);
}

.ag-exp-vueflow :deep(.vue-flow__controls-button svg) {
  fill: currentColor;
}

.ag-exp-vueflow :deep(.vue-flow__minimap) {
  border-radius: 8px;
  border: 1px solid var(--ag-border-strong);
  background: var(--ag-surface-card);
  overflow: hidden;
  box-shadow: var(--ag-shadow-sm);
}

.ag-exp-vueflow :deep(.vue-flow__attribution) {
  display: none;
}

/* Hint compacto ubicado a la derecha de la subbarra (sin tapar el lienzo) */
.ag-exp-canvas-hint {
  margin-left: auto;
  display: inline-flex;
  align-items: center;
  gap: 0.42rem;
  padding: 0.24rem 0.58rem;
  border-radius: 6px;
  border: 1px solid var(--ag-border);
  background: var(--ag-surface-elevated);
  color: var(--vp-c-text-2);
  font-size: 0.75rem;
  font-weight: 600;
  white-space: nowrap;
}

.ag-exp-hint-sep {
  color: var(--ag-border-strong);
}

/* Barra narrativa del Recorrido Guiado */
.ag-exp-tour-bar {
  position: absolute;
  left: 50%;
  bottom: 14px;
  transform: translateX(-50%);
  z-index: 25;
  width: min(560px, calc(100% - 140px));
  min-width: 310px;
  padding: 0.85rem 1rem;
  border-radius: 10px;
  border: 1px solid var(--ag-emerald-strong);
  background: var(--ag-surface-card);
  box-shadow: var(--ag-shadow-md);
}

.ag-exp-tour-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.6rem;
  margin-bottom: 0.35rem;
}

.ag-exp-tour-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.4rem;
}

.ag-exp-tour-step {
  padding: 0.1rem 0.46rem;
  border-radius: 5px;
  background: rgba(4, 120, 87, 0.14);
  color: var(--ag-emerald-aaa);
  font-size: 0.74rem;
  font-weight: 700;
}

.ag-explorer-shell.is-dark .ag-exp-tour-step {
  background: rgba(16, 185, 129, 0.22);
}

.ag-exp-tour-badge {
  padding: 0.1rem 0.46rem;
  border-radius: 5px;
  background: var(--ag-surface-subtle);
  border: 1px solid var(--ag-border);
  color: var(--vp-c-text-2);
  font-size: 0.74rem;
  font-weight: 600;
}

.ag-exp-tour-close {
  padding: 0.16rem 0.5rem;
  border-radius: 5px;
  border: 1px solid var(--ag-border);
  background: var(--ag-surface-elevated);
  color: var(--vp-c-text-2);
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
}

.ag-exp-tour-close:hover {
  border-color: var(--ag-rose);
  color: var(--ag-rose);
}

.ag-exp-tour-title {
  margin: 0;
  font-family: var(--ag-font-display, var(--vp-font-family-base));
  font-size: 0.96rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
}

.ag-exp-tour-body {
  margin: 0.32rem 0 0.7rem;
  font-size: 0.84rem;
  line-height: 1.5;
  color: var(--vp-c-text-2);
}

.ag-exp-tour-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.6rem;
}

.ag-exp-tour-keys {
  font-size: 0.74rem;
  color: var(--vp-c-text-3);
}

.ag-exp-tour-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.36rem 0.72rem;
  border-radius: 6px;
  border: 1px solid var(--ag-border-strong);
  background: var(--ag-surface-elevated);
  color: var(--vp-c-text-1);
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
}

.ag-exp-tour-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.ag-exp-tour-btn--next {
  background: var(--vp-button-brand-bg);
  border-color: var(--vp-button-brand-bg);
  color: var(--vp-button-brand-text);
}

.ag-exp-tour-btn--next:hover {
  background: var(--vp-button-brand-hover-bg);
  border-color: var(--vp-button-brand-hover-bg);
}

/* Panel Inspector Explicativo */
.ag-exp-inspector {
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
  height: 100%;
  border-left: 1px solid var(--ag-border);
  background: var(--ag-surface-card);
}

.ag-exp-mobile-drawer-btn {
  display: none;
}

.ag-exp-inspector-scroll {
  flex: 1 1 auto;
  overflow-y: auto;
  padding: 1.05rem 1.15rem 1.5rem;
}

.ag-insp-pane {
  display: flex;
  flex-direction: column;
  gap: 0.88rem;
}

.ag-insp-top-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.ag-insp-badges {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.38rem;
}

.ag-insp-kicker {
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--vp-c-brand-1);
}

.ag-insp-reset-btn {
  padding: 0.24rem 0.56rem;
  border-radius: 6px;
  border: 1px solid var(--ag-border-strong);
  background: var(--ag-surface-elevated);
  color: var(--vp-c-text-2);
  font-size: 0.76rem;
  font-weight: 600;
  cursor: pointer;
  flex-shrink: 0;
}

.ag-insp-reset-btn:hover {
  border-color: var(--ag-emerald-strong);
  color: var(--vp-c-text-1);
}

.ag-insp-scenario-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  padding: 0.48rem 0.68rem;
  border-radius: 7px;
  border: 1px solid var(--ag-border-accent);
  background: var(--ag-surface-elevated);
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--vp-c-text-1);
}

.ag-insp-link-btn {
  border: none;
  background: transparent;
  padding: 0.1rem 0.3rem;
  color: var(--vp-c-brand-1);
  font-size: 0.78rem;
  font-weight: 700;
  cursor: pointer;
  text-decoration: underline;
}

.ag-insp-layer-pill,
.ag-insp-verdict-pill {
  display: inline-flex;
  align-items: center;
  padding: 0.16rem 0.54rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 700;
  border: 1px solid transparent;
}

.ag-pill-tone--emerald {
  background: rgba(4, 120, 87, 0.12);
  border-color: rgba(4, 120, 87, 0.38);
  color: var(--ag-emerald-aaa);
}

.ag-pill-tone--cyan {
  background: rgba(14, 116, 144, 0.12);
  border-color: rgba(14, 116, 144, 0.38);
  color: #155e75;
}

.ag-pill-tone--sky {
  background: rgba(3, 105, 161, 0.12);
  border-color: rgba(3, 105, 161, 0.38);
  color: #075985;
}

.ag-pill-tone--amber {
  background: rgba(180, 83, 9, 0.13);
  border-color: rgba(180, 83, 9, 0.4);
  color: #92400e;
}

.ag-pill-tone--rose {
  background: rgba(190, 18, 60, 0.12);
  border-color: rgba(190, 18, 60, 0.38);
  color: #9f1239;
}

.ag-explorer-shell.is-dark .ag-pill-tone--emerald {
  background: rgba(16, 185, 129, 0.2);
  border-color: rgba(52, 211, 153, 0.48);
  color: var(--ag-emerald-aaa);
}

.ag-explorer-shell.is-dark .ag-pill-tone--cyan {
  background: rgba(6, 182, 212, 0.2);
  border-color: rgba(34, 211, 238, 0.48);
  color: #67e8f9;
}

.ag-explorer-shell.is-dark .ag-pill-tone--sky {
  background: rgba(14, 165, 233, 0.2);
  border-color: rgba(56, 189, 248, 0.48);
  color: #7dd3fc;
}

.ag-explorer-shell.is-dark .ag-pill-tone--amber {
  background: rgba(245, 158, 11, 0.2);
  border-color: rgba(251, 191, 36, 0.48);
  color: #fde68a;
}

.ag-explorer-shell.is-dark .ag-pill-tone--rose {
  background: rgba(244, 63, 94, 0.2);
  border-color: rgba(251, 113, 133, 0.48);
  color: #fda4af;
}

.ag-insp-title {
  margin: 0;
  padding: 0;
  border: none;
  font-family: var(--ag-font-display, var(--vp-font-family-base));
  font-size: 1.2rem;
  font-weight: 700;
  line-height: 1.25;
  color: var(--vp-c-text-1);
  overflow-wrap: anywhere;
}

.ag-insp-title--mono {
  font-family: var(--vp-font-family-mono);
  font-size: 1.1rem;
}

.ag-insp-subtitle {
  margin: -0.45rem 0 0;
  font-size: 0.87rem;
  font-weight: 600;
  line-height: 1.45;
  color: var(--vp-c-text-2);
}

.ag-insp-summary {
  margin: 0;
  font-size: 0.87rem;
  line-height: 1.55;
  color: var(--vp-c-text-2);
}

.ag-insp-section {
  display: flex;
  flex-direction: column;
  gap: 0.42rem;
  padding-top: 0.72rem;
  border-top: 1px solid var(--ag-border);
}

.ag-insp-sec-title {
  margin: 0;
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
}

.ag-insp-text {
  margin: 0;
  font-size: 0.855rem;
  line-height: 1.56;
  color: var(--vp-c-text-2);
}

.ag-insp-bullets {
  margin: 0;
  padding-left: 1.05rem;
  display: flex;
  flex-direction: column;
  gap: 0.36rem;
  font-size: 0.845rem;
  line-height: 1.5;
  color: var(--vp-c-text-2);
}

/* Ruta de relación origen -> destino */
.ag-insp-edge-route {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.45rem;
  padding: 0.62rem 0.72rem;
  border-radius: 8px;
  border: 1px solid var(--ag-border);
  background: var(--ag-surface-elevated);
}

.ag-insp-jump-chip {
  padding: 0.24rem 0.56rem;
  border-radius: 6px;
  border: 1px solid var(--ag-border-strong);
  background: var(--ag-surface-card);
  color: var(--vp-c-text-1);
  font-family: var(--vp-font-family-mono);
  font-size: 0.8125rem;
  font-weight: 600;
  cursor: pointer;
}

.ag-insp-jump-chip:hover {
  border-color: var(--ag-emerald-strong);
  color: var(--ag-emerald-aaa);
}

.ag-insp-route-arrow {
  width: 18px;
  height: 18px;
  color: var(--vp-c-brand-1);
  flex-shrink: 0;
}

/* Grids de metadatos */
.ag-insp-meta-grid,
.ag-insp-stats-grid {
  margin: 0;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.5rem;
}

.ag-insp-meta-cell,
.ag-insp-stat-box {
  padding: 0.56rem 0.68rem;
  border-radius: 7px;
  border: 1px solid var(--ag-border);
  background: var(--ag-surface-elevated);
}

.ag-insp-meta-cell--full,
.ag-insp-stat-box:last-child:nth-child(odd) {
  grid-column: span 2;
}

.ag-insp-meta-cell dt,
.ag-insp-stat-box dt {
  font-size: 0.74rem;
  font-weight: 600;
  color: var(--vp-c-text-3);
  margin-bottom: 0.18rem;
}

.ag-insp-meta-cell dd,
.ag-insp-stat-box dd {
  margin: 0;
  font-size: 0.86rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
  overflow-wrap: anywhere;
}

.ag-insp-mono {
  font-family: var(--vp-font-family-mono);
  font-size: 0.82rem;
}

/* Lista de relaciones conectadas */
.ag-insp-rel-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.42rem;
}

.ag-insp-rel-item {
  display: flex;
  align-items: stretch;
  gap: 0.36rem;
}

.ag-insp-rel-main {
  flex: 1 1 auto;
  min-width: 0;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.34rem 0.5rem;
  padding: 0.46rem 0.6rem;
  border-radius: 7px;
  border: 1px solid var(--ag-border);
  background: var(--ag-surface-elevated);
  color: var(--vp-c-text-1);
  text-align: left;
  cursor: pointer;
}

.ag-insp-rel-main:hover {
  border-color: var(--ag-emerald-strong);
}

.ag-insp-rel-dir {
  font-size: 0.72rem;
  font-weight: 600;
  color: var(--vp-c-text-3);
}

.ag-insp-rel-target {
  font-family: var(--vp-font-family-mono);
  font-size: 0.8125rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
  overflow-wrap: anywhere;
}

.ag-insp-rel-card {
  margin-left: auto;
  padding: 0.08rem 0.4rem;
  border-radius: 999px;
  background: var(--ag-surface-card);
  border: 1px solid var(--ag-border-strong);
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--vp-c-text-2);
}

.ag-insp-rel-go {
  flex-shrink: 0;
  padding: 0 0.58rem;
  border-radius: 7px;
  border: 1px solid var(--ag-border);
  background: var(--ag-surface-subtle);
  color: var(--vp-c-text-2);
  font-size: 0.76rem;
  font-weight: 700;
  cursor: pointer;
}

.ag-insp-rel-go:hover {
  border-color: var(--ag-emerald-strong);
  color: var(--ag-emerald-aaa);
}

/* Estructura de columnas */
.ag-insp-cols {
  display: flex;
  flex-direction: column;
  border: 1px solid var(--ag-border);
  border-radius: 8px;
  overflow: hidden;
  background: var(--ag-surface-elevated);
}

.ag-insp-col-row {
  padding: 0.52rem 0.68rem;
  border-bottom: 1px solid var(--ag-border);
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.ag-insp-col-row:last-child {
  border-bottom: none;
}

.ag-insp-col-top {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.5rem;
}

.ag-insp-col-name {
  font-family: var(--vp-font-family-mono);
  font-size: 0.8125rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
  overflow-wrap: anywhere;
}

.ag-insp-col-type {
  font-family: var(--vp-font-family-mono);
  font-size: 0.8rem;
  color: var(--vp-c-text-3);
  text-align: right;
  flex-shrink: 0;
}

.ag-insp-col-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 0.26rem;
}

.ag-insp-col-note {
  margin: 0;
  font-size: 0.78rem;
  line-height: 1.42;
  color: var(--vp-c-text-2);
}

.ag-insp-chip {
  display: inline-flex;
  align-items: center;
  padding: 0.06rem 0.36rem;
  border-radius: 4px;
  border: 1px solid transparent;
  font-size: 0.7rem;
  font-weight: 700;
  line-height: 1.3;
}

.ag-insp-chip--pk {
  background: rgba(180, 83, 9, 0.14);
  border-color: rgba(180, 83, 9, 0.38);
  color: #92400e;
}

.ag-insp-chip--fk {
  background: rgba(3, 105, 161, 0.13);
  border-color: rgba(3, 105, 161, 0.36);
  color: #075985;
}

.ag-insp-chip--uk {
  background: rgba(14, 116, 144, 0.13);
  border-color: rgba(14, 116, 144, 0.36);
  color: #155e75;
}

.ag-insp-chip--gin {
  background: rgba(4, 120, 87, 0.13);
  border-color: rgba(4, 120, 87, 0.36);
  color: var(--ag-emerald-aaa);
}

.ag-insp-chip--enum {
  background: rgba(190, 18, 60, 0.12);
  border-color: rgba(190, 18, 60, 0.34);
  color: #9f1239;
}

.ag-insp-chip--meta {
  background: var(--ag-surface-subtle);
  border-color: var(--ag-border);
  color: var(--vp-c-text-2);
}

.ag-explorer-shell.is-dark .ag-insp-chip--pk {
  background: rgba(245, 158, 11, 0.2);
  border-color: rgba(251, 191, 36, 0.46);
  color: #fde68a;
}

.ag-explorer-shell.is-dark .ag-insp-chip--fk {
  background: rgba(14, 165, 233, 0.2);
  border-color: rgba(56, 189, 248, 0.46);
  color: #7dd3fc;
}

.ag-explorer-shell.is-dark .ag-insp-chip--uk {
  background: rgba(6, 182, 212, 0.2);
  border-color: rgba(34, 211, 238, 0.46);
  color: #67e8f9;
}

.ag-explorer-shell.is-dark .ag-insp-chip--gin {
  background: rgba(16, 185, 129, 0.2);
  border-color: rgba(52, 211, 153, 0.46);
  color: var(--ag-emerald-aaa);
}

.ag-explorer-shell.is-dark .ag-insp-chip--enum {
  background: rgba(244, 63, 94, 0.2);
  border-color: rgba(251, 113, 133, 0.46);
  color: #fda4af;
}

/* Tarjeta destacada de Defensa Oral */
.ag-insp-defense {
  padding: 0.78rem 0.88rem;
  border-radius: 8px;
  border: 1px solid var(--ag-border-accent);
  background: var(--ag-surface-elevated);
  box-shadow: inset 3px 0 0 0 var(--ag-emerald-strong);
  display: flex;
  flex-direction: column;
  gap: 0.36rem;
}

.ag-insp-defense-label {
  margin: 0;
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--ag-emerald-aaa);
}

.ag-insp-defense-q {
  margin: 0;
  font-size: 0.86rem;
  font-weight: 700;
  line-height: 1.45;
  color: var(--vp-c-text-1);
}

.ag-insp-defense-a {
  margin: 0;
  font-size: 0.84rem;
  line-height: 1.54;
  color: var(--vp-c-text-2);
}

/* Enlace directo a volumen SSOT */
.ag-insp-doc-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.48rem;
  padding: 0.56rem 0.85rem;
  border-radius: 7px;
  border: 1px solid var(--ag-emerald-strong);
  background: rgba(4, 120, 87, 0.1);
  color: var(--ag-emerald-aaa);
  font-size: 0.83rem;
  font-weight: 700;
  text-decoration: none;
  transition: background-color 0.15s ease;
}

.ag-explorer-shell.is-dark .ag-insp-doc-link {
  background: rgba(16, 185, 129, 0.18);
}

.ag-insp-doc-link:hover {
  background: rgba(4, 120, 87, 0.18);
}

/* Guía inicial y salto rápido */
.ag-insp-guide-box {
  padding: 0.8rem 0.88rem;
  border-radius: 8px;
  border: 1px solid var(--ag-border);
  background: var(--ag-surface-elevated);
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
}

.ag-insp-cta-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  padding: 0.52rem 0.85rem;
  border-radius: 7px;
  border: 1px solid var(--vp-button-brand-bg);
  background: var(--vp-button-brand-bg);
  color: var(--vp-button-brand-text);
  font-size: 0.84rem;
  font-weight: 700;
  cursor: pointer;
}

.ag-insp-cta-btn:hover {
  background: var(--vp-button-brand-hover-bg);
  border-color: var(--vp-button-brand-hover-bg);
}

.ag-insp-directory {
  display: flex;
  flex-direction: column;
  gap: 0.72rem;
  padding-top: 0.65rem;
  border-top: 1px solid var(--ag-border);
}

.ag-insp-layer-group {
  display: flex;
  flex-direction: column;
  gap: 0.36rem;
}

.ag-insp-layer-group-head {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.ag-insp-layer-group-name {
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--vp-c-text-2);
}

.ag-insp-node-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.34rem;
}

.ag-insp-node-chip {
  padding: 0.24rem 0.54rem;
  border-radius: 6px;
  border: 1px solid var(--ag-border);
  background: var(--ag-surface-elevated);
  color: var(--vp-c-text-1);
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
}

.ag-insp-node-chip--mono {
  font-family: var(--vp-font-family-mono);
  font-size: 0.8rem;
}

.ag-insp-node-chip:hover {
  border-color: var(--ag-emerald-strong);
  color: var(--ag-emerald-aaa);
}

.ag-insp-path-chips {
  display: flex;
  flex-direction: column;
  gap: 0.36rem;
}

.ag-insp-path-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.42rem 0.62rem;
  border-radius: 7px;
  border: 1px solid var(--ag-border);
  background: var(--ag-surface-elevated);
  color: var(--vp-c-text-1);
  font-size: 0.82rem;
  font-weight: 600;
  text-align: left;
  cursor: pointer;
}

.ag-insp-path-btn:hover {
  border-color: var(--ag-emerald-strong);
}

.ag-insp-path-idx {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 999px;
  background: var(--ag-surface-subtle);
  border: 1px solid var(--ag-border-strong);
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
  flex-shrink: 0;
}

/* Accesibilidad: foco visible explícito en todos los interactivos */
.ag-explorer-shell button:focus-visible,
.ag-explorer-shell a:focus-visible {
  outline: 2px solid var(--ag-emerald-strong);
  outline-offset: 2px;
}

/* Responsive Tablet y Mobile (0 overflow horizontal en 390px) */
@media (max-width: 1120px) {
  .ag-exp-workspace {
    grid-template-columns: minmax(0, 1fr) 350px;
  }

  .ag-exp-tour-bar {
    width: min(460px, calc(100% - 120px));
  }

  .ag-exp-vueflow :deep(.vue-flow__minimap) {
    display: none;
  }
}

@media (max-width: 900px) {
  .ag-exp-topbar {
    padding: 0.65rem 0.85rem;
  }

  .ag-exp-subbar {
    padding: 0.5rem 0.85rem;
  }

  .ag-exp-workspace {
    grid-template-columns: 1fr;
    height: auto;
    min-height: 0;
  }

  .ag-exp-canvas-wrap {
    height: 460px;
  }

  .ag-explorer-shell.is-fullscreen .ag-exp-workspace {
    display: flex;
    flex-direction: column;
    overflow-y: auto;
  }

  .ag-explorer-shell.is-fullscreen .ag-exp-canvas-wrap {
    height: 56vh;
    min-height: 360px;
    flex-shrink: 0;
  }

  .ag-exp-canvas-hint {
    display: none;
  }

  .ag-exp-tour-bar {
    left: 10px;
    right: 10px;
    bottom: 10px;
    transform: none;
    width: auto;
    min-width: 0;
  }

  .ag-exp-tour-keys {
    display: none;
  }

  .ag-exp-inspector {
    border-left: none;
    border-top: 1px solid var(--ag-border);
    height: auto;
  }

  .ag-exp-mobile-drawer-btn {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.6rem;
    width: 100%;
    padding: 0.72rem 0.95rem;
    border: none;
    border-bottom: 1px solid var(--ag-border);
    background: var(--ag-surface-elevated);
    color: var(--vp-c-text-1);
    font-size: 0.88rem;
    font-weight: 700;
    text-align: left;
    cursor: pointer;
  }

  .ag-exp-drawer-chevron {
    transition: transform 0.16s ease;
  }

  .ag-exp-drawer-chevron.is-open {
    transform: rotate(180deg);
  }

  .ag-exp-inspector.is-mobile-collapsed .ag-exp-inspector-scroll {
    display: none;
  }

  .ag-exp-inspector-scroll {
    padding: 0.95rem 0.9rem 1.4rem;
    overflow-y: visible;
  }
}

@media (max-width: 520px) {
  .ag-exp-tabs,
  .ag-exp-actions {
    width: 100%;
  }

  .ag-exp-tab {
    flex: 1 1 auto;
    justify-content: center;
    padding: 0.42rem 0.6rem;
    font-size: 0.8rem;
  }

  .ag-exp-btn {
    flex: 1 1 auto;
    justify-content: center;
    padding: 0.4rem 0.58rem;
    font-size: 0.78rem;
  }

  .ag-insp-meta-grid,
  .ag-insp-stats-grid {
    grid-template-columns: 1fr;
  }

  .ag-insp-meta-cell--full,
  .ag-insp-stat-box:last-child:nth-child(odd) {
    grid-column: span 1;
  }
}

@media (prefers-reduced-motion: reduce) {
  .ag-exp-tab,
  .ag-exp-btn,
  .ag-exp-pill,
  .ag-insp-doc-link,
  .ag-exp-drawer-chevron {
    transition: none;
  }
}
</style>
