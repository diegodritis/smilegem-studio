import { create } from 'zustand'

export type GemShape =
  | 'circle'
  | 'teardrop'
  | 'heart'
  | 'star'
  | 'diamond'
  | 'marquise'
  | 'square'
  | 'triangle'
  | 'hexagon'
  | 'flower'
  | 'butterfly'
  | 'cross'
  | string

export type GemFinish = 'solid' | 'iridescent' | 'pearl' | 'metallic'

export interface CustomGemShape {
  id: string
  label: string
  dataUrl: string
  createdAt: string
}

export interface Gem {
  id: string
  toothId: string
  position: { u: number; v: number }
  worldPosition: [number, number, number]
  normal: [number, number, number]
  rotation: number
  scale: number
  shape: GemShape
  customShapeUrl?: string
  sizeCode?: string
  color: string
  finish?: GemFinish
  metalness?: number
  roughness?: number
  clearcoat?: number
}

export interface GemsState {
  gems: Gem[]
  selectedGemId: string | null
  selectedGemIds: string[]
  isDragging: boolean
  clipboardGem: Gem | null
  activeShape: GemShape
  activeSizeCode: string
  activeColor: string
  activeFinish: GemFinish

  // Formas personalizadas del usuario (Fase 15)
  customShapes: CustomGemShape[]

  // Historial Temporal Undo / Redo (Fase 17)
  history: Gem[][]
  future: Gem[][]

  // Menú contextual flotante y por clic derecho
  contextMenu: { isOpen: boolean; x: number; y: number } | null
  openContextMenu: (pos: { x: number; y: number }) => void
  closeContextMenu: () => void

  // Selección individual y múltiple (Fase 16)
  setSelectedGemId: (id: string | null) => void
  setSelectedGemIds: (ids: string[]) => void
  toggleSelectGem: (id: string, isMulti: boolean) => void
  clearSelection: () => void

  setIsDragging: (dragging: boolean) => void
  setActiveShape: (shape: GemShape) => void
  setActiveSizeCode: (sizeCode: string) => void
  setActiveColor: (color: string) => void
  setActiveFinish: (finish: GemFinish) => void

  // Operaciones de gemas individuales y de grupo (Fase 16)
  addGem: (gem: Omit<Gem, 'id'>) => string
  updateGem: (id: string, updates: Partial<Gem>, recordHistory?: boolean) => void
  removeGem: (id: string) => void
  removeSelectedGems: () => void
  duplicateGem: (id: string) => string | null
  duplicateSelectedGems: () => string[]
  copyGem: (id: string) => void
  pasteGem: () => string | null
  flipGemHorizontal: (id: string) => void
  flipGemVertical: (id: string) => void
  clearGems: () => void
  setGems: (gems: Gem[]) => void
  undo: () => void
  redo: () => void

  // Alineación y distribución grupal (Fase 16)
  alignGems: (
    type: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom' | 'distribute-h' | 'distribute-v'
  ) => void

  // Gestión de biblioteca de formas personalizadas (Fase 15)
  addCustomShape: (label: string, dataUrl: string) => string
  removeCustomShape: (id: string) => void
}

const CUSTOM_SHAPES_KEY = 'smilegem_custom_shapes'

function getInitialCustomShapes(): CustomGemShape[] {
  try {
    const raw = localStorage.getItem(CUSTOM_SHAPES_KEY)
    return raw ? JSON.parse(raw) : []
  } catch (e) {
    console.error('Error reading custom shapes:', e)
    return []
  }
}

export const useGemsStore = create<GemsState>((set, get) => ({
  gems: [],
  selectedGemId: null,
  selectedGemIds: [],
  isDragging: false,
  clipboardGem: null,
  activeShape: 'circle',
  activeSizeCode: 'SS3',
  activeColor: '#FFFFFF',
  activeFinish: 'solid',

  customShapes: getInitialCustomShapes(),

  // Menú contextual flotante y por clic derecho
  contextMenu: null,
  openContextMenu: (pos) => set({ contextMenu: { isOpen: true, x: pos.x, y: pos.y } }),
  closeContextMenu: () => set({ contextMenu: null }),

  history: [],
  future: [],

  setSelectedGemId: (id) =>
    set({
      selectedGemId: id,
      selectedGemIds: id ? [id] : [],
    }),

  setSelectedGemIds: (ids) =>
    set({
      selectedGemIds: ids,
      selectedGemId: ids.length > 0 ? ids[0] : null,
    }),

  toggleSelectGem: (id, isMulti) =>
    set((state) => {
      if (!isMulti) {
        return {
          selectedGemIds: [id],
          selectedGemId: id,
        }
      }
      const exists = state.selectedGemIds.includes(id)
      const nextIds = exists
        ? state.selectedGemIds.filter((item) => item !== id)
        : [...state.selectedGemIds, id]
      return {
        selectedGemIds: nextIds,
        selectedGemId: nextIds.length > 0 ? nextIds[nextIds.length - 1] : null,
      }
    }),

  clearSelection: () =>
    set({
      selectedGemId: null,
      selectedGemIds: [],
      contextMenu: null,
    }),

  setIsDragging: (dragging) => set({ isDragging: dragging }),
  setActiveShape: (shape) => set({ activeShape: shape }),
  setActiveSizeCode: (sizeCode) => set({ activeSizeCode: sizeCode }),
  setActiveColor: (color) => set({ activeColor: color }),
  setActiveFinish: (finish) => set({ activeFinish: finish }),

  addGem: (gemData) => {
    const id = `gem-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`
    const newGem: Gem = {
      ...gemData,
      id,
    }
    set((state) => ({
      history: [...state.history.slice(-30), state.gems],
      future: [],
      gems: [...state.gems, newGem],
      selectedGemId: id,
      selectedGemIds: [id],
    }))
    return id
  },

  updateGem: (id, updates, recordHistory = false) =>
    set((state) => {
      const nextGems = state.gems.map((g) => (g.id === id ? { ...g, ...updates } : g))
      if (recordHistory) {
        return {
          history: [...state.history.slice(-30), state.gems],
          future: [],
          gems: nextGems,
        }
      }
      return { gems: nextGems }
    }),

  removeGem: (id) =>
    set((state) => ({
      history: [...state.history.slice(-30), state.gems],
      future: [],
      gems: state.gems.filter((g) => g.id !== id),
      selectedGemId: state.selectedGemId === id ? null : state.selectedGemId,
      selectedGemIds: state.selectedGemIds.filter((gId) => gId !== id),
    })),

  removeSelectedGems: () =>
    set((state) => {
      if (state.selectedGemIds.length === 0) return state
      const idSet = new Set(state.selectedGemIds)
      return {
        history: [...state.history.slice(-30), state.gems],
        future: [],
        gems: state.gems.filter((g) => !idSet.has(g.id)),
        selectedGemId: null,
        selectedGemIds: [],
      }
    }),

  duplicateGem: (id) => {
    const { gems } = get()
    const target = gems.find((g) => g.id === id)
    if (!target) return null

    const newId = `gem-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`
    const offsetPos: [number, number, number] = [
      target.worldPosition[0] + 0.05,
      target.worldPosition[1] + 0.02,
      target.worldPosition[2],
    ]

    const duplicated: Gem = {
      ...target,
      id: newId,
      worldPosition: offsetPos,
    }

    set((state) => ({
      history: [...state.history.slice(-30), state.gems],
      future: [],
      gems: [...state.gems, duplicated],
      selectedGemId: newId,
      selectedGemIds: [newId],
    }))
    return newId
  },

  duplicateSelectedGems: () => {
    const { gems, selectedGemIds } = get()
    if (selectedGemIds.length === 0) return []

    const idSet = new Set(selectedGemIds)
    const targets = gems.filter((g) => idSet.has(g.id))
    const newGems: Gem[] = []
    const newIds: string[] = []

    targets.forEach((target) => {
      const newId = `gem-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`
      newIds.push(newId)
      newGems.push({
        ...target,
        id: newId,
        worldPosition: [
          target.worldPosition[0] + 0.06,
          target.worldPosition[1] + 0.03,
          target.worldPosition[2],
        ],
      })
    })

    set((state) => ({
      history: [...state.history.slice(-30), state.gems],
      future: [],
      gems: [...state.gems, ...newGems],
      selectedGemIds: newIds,
      selectedGemId: newIds[0] || null,
    }))

    return newIds
  },

  copyGem: (id) => {
    const { gems } = get()
    const target = gems.find((g) => g.id === id)
    if (target) {
      set({ clipboardGem: { ...target } })
    }
  },

  pasteGem: () => {
    const { clipboardGem } = get()
    if (!clipboardGem) return null

    const newId = `gem-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`
    const pasted: Gem = {
      ...clipboardGem,
      id: newId,
      worldPosition: [
        clipboardGem.worldPosition[0] + 0.05,
        clipboardGem.worldPosition[1] - 0.03,
        clipboardGem.worldPosition[2],
      ],
    }

    set((state) => ({
      history: [...state.history.slice(-30), state.gems],
      future: [],
      gems: [...state.gems, pasted],
      selectedGemId: newId,
      selectedGemIds: [newId],
    }))
    return newId
  },

  flipGemHorizontal: (id) => {
    const { gems } = get()
    const target = gems.find((g) => g.id === id)
    if (!target) return
    const newRotation = (target.rotation + Math.PI) % (Math.PI * 2)
    set((state) => ({
      history: [...state.history.slice(-30), state.gems],
      future: [],
      gems: state.gems.map((g) => (g.id === id ? { ...g, rotation: Number(newRotation.toFixed(3)) } : g)),
    }))
  },

  flipGemVertical: (id) => {
    const { gems } = get()
    const target = gems.find((g) => g.id === id)
    if (!target) return
    const newRotation = (target.rotation + Math.PI / 2) % (Math.PI * 2)
    set((state) => ({
      history: [...state.history.slice(-30), state.gems],
      future: [],
      gems: state.gems.map((g) => (g.id === id ? { ...g, rotation: Number(newRotation.toFixed(3)) } : g)),
    }))
  },

  clearGems: () =>
    set((state) => ({
      history: [...state.history.slice(-30), state.gems],
      future: [],
      gems: [],
      selectedGemId: null,
      selectedGemIds: [],
      isDragging: false,
    })),

  setGems: (newGems) =>
    set((state) => ({
      history: [...state.history.slice(-30), state.gems],
      future: [],
      gems: newGems,
      selectedGemId: null,
      selectedGemIds: [],
    })),

  undo: () =>
    set((state) => {
      if (state.history.length === 0) return state
      const previous = state.history[state.history.length - 1]
      const newHistory = state.history.slice(0, -1)
      return {
        history: newHistory,
        future: [state.gems, ...state.future.slice(0, 30)],
        gems: previous,
        selectedGemId: null,
        selectedGemIds: [],
      }
    }),

  redo: () =>
    set((state) => {
      if (state.future.length === 0) return state
      const next = state.future[0]
      const newFuture = state.future.slice(1)
      return {
        history: [...state.history.slice(-30), state.gems],
        future: newFuture,
        gems: next,
        selectedGemId: null,
        selectedGemIds: [],
      }
    }),

  // Alineación y Distribución de Gemas Múltiples (Fase 16)
  alignGems: (type) =>
    set((state) => {
      if (state.selectedGemIds.length < 2) return state
      const idSet = new Set(state.selectedGemIds)
      const selectedGems = state.gems.filter((g) => idSet.has(g.id))
      if (selectedGems.length < 2) return state

      const xs = selectedGems.map((g) => g.worldPosition[0])
      const ys = selectedGems.map((g) => g.worldPosition[1])
      const minX = Math.min(...xs)
      const maxX = Math.max(...xs)
      const avgX = xs.reduce((a, b) => a + b, 0) / xs.length

      const minY = Math.min(...ys)
      const maxY = Math.max(...ys)
      const avgY = ys.reduce((a, b) => a + b, 0) / ys.length

      let updatedGems = [...state.gems]

      if (type === 'left') {
        updatedGems = state.gems.map((g) =>
          idSet.has(g.id)
            ? { ...g, worldPosition: [minX, g.worldPosition[1], g.worldPosition[2]] }
            : g
        )
      } else if (type === 'center') {
        updatedGems = state.gems.map((g) =>
          idSet.has(g.id)
            ? { ...g, worldPosition: [avgX, g.worldPosition[1], g.worldPosition[2]] }
            : g
        )
      } else if (type === 'right') {
        updatedGems = state.gems.map((g) =>
          idSet.has(g.id)
            ? { ...g, worldPosition: [maxX, g.worldPosition[1], g.worldPosition[2]] }
            : g
        )
      } else if (type === 'top') {
        updatedGems = state.gems.map((g) =>
          idSet.has(g.id)
            ? { ...g, worldPosition: [g.worldPosition[0], maxY, g.worldPosition[2]] }
            : g
        )
      } else if (type === 'middle') {
        updatedGems = state.gems.map((g) =>
          idSet.has(g.id)
            ? { ...g, worldPosition: [g.worldPosition[0], avgY, g.worldPosition[2]] }
            : g
        )
      } else if (type === 'bottom') {
        updatedGems = state.gems.map((g) =>
          idSet.has(g.id)
            ? { ...g, worldPosition: [g.worldPosition[0], minY, g.worldPosition[2]] }
            : g
        )
      } else if (type === 'distribute-h') {
        // Ordenar por X ascendente y espaciar parejo
        const sorted = [...selectedGems].sort((a, b) => a.worldPosition[0] - b.worldPosition[0])
        const step = (maxX - minX) / (sorted.length - 1)
        const posMap = new Map<string, number>()
        sorted.forEach((g, index) => {
          posMap.set(g.id, minX + index * step)
        })

        updatedGems = state.gems.map((g) => {
          if (posMap.has(g.id)) {
            return {
              ...g,
              worldPosition: [posMap.get(g.id)!, g.worldPosition[1], g.worldPosition[2]],
            }
          }
          return g
        })
      } else if (type === 'distribute-v') {
        // Ordenar por Y ascendente y espaciar parejo
        const sorted = [...selectedGems].sort((a, b) => a.worldPosition[1] - b.worldPosition[1])
        const step = (maxY - minY) / (sorted.length - 1)
        const posMap = new Map<string, number>()
        sorted.forEach((g, index) => {
          posMap.set(g.id, minY + index * step)
        })

        updatedGems = state.gems.map((g) => {
          if (posMap.has(g.id)) {
            return {
              ...g,
              worldPosition: [g.worldPosition[0], posMap.get(g.id)!, g.worldPosition[2]],
            }
          }
          return g
        })
      }

      return {
        history: [...state.history.slice(-30), state.gems],
        future: [],
        gems: updatedGems,
      }
    }),

  // Biblioteca de formas personalizadas (Fase 15)
  addCustomShape: (label, dataUrl) => {
    const id = `custom-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`
    const newShape: CustomGemShape = {
      id,
      label,
      dataUrl,
      createdAt: new Date().toISOString(),
    }

    set((state) => {
      const updated = [newShape, ...state.customShapes]
      try {
        localStorage.setItem(CUSTOM_SHAPES_KEY, JSON.stringify(updated))
      } catch (e) {
        console.warn('LocalStorage quota or write error:', e)
      }
      return {
        customShapes: updated,
        activeShape: id,
      }
    })

    return id
  },

  removeCustomShape: (id) =>
    set((state) => {
      const updated = state.customShapes.filter((s) => s.id !== id)
      try {
        localStorage.setItem(CUSTOM_SHAPES_KEY, JSON.stringify(updated))
      } catch (e) {
        console.warn('LocalStorage write error:', e)
      }
      return {
        customShapes: updated,
        activeShape: state.activeShape === id ? 'circle' : state.activeShape,
      }
    }),
}))
