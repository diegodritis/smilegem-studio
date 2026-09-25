import { useRef, useEffect } from 'react'
import { useGemsStore } from '../store/useGemsStore'
import { useStudioStore } from '../store/useStudioStore'
import type { ScreenCoords } from './GemOverlayTracker'

interface GemTransformOverlayProps {
  coords: ScreenCoords | null
}

export function GemTransformOverlay({ coords }: GemTransformOverlayProps) {
  const selectedGemId = useGemsStore((state) => state.selectedGemId)
  const selectedGemIds = useGemsStore((state) => state.selectedGemIds)
  const gems = useGemsStore((state) => state.gems)
  const isDragging = useGemsStore((state) => state.isDragging)
  const updateGem = useGemsStore((state) => state.updateGem)
  const removeGem = useGemsStore((state) => state.removeGem)
  const removeSelectedGems = useGemsStore((state) => state.removeSelectedGems)
  const duplicateGem = useGemsStore((state) => state.duplicateGem)
  const duplicateSelectedGems = useGemsStore((state) => state.duplicateSelectedGems)
  const copyGem = useGemsStore((state) => state.copyGem)
  const pasteGem = useGemsStore((state) => state.pasteGem)
  const clearSelection = useGemsStore((state) => state.clearSelection)
  const openContextMenu = useGemsStore((state) => state.openContextMenu)

  const dragActionRef = useRef<{
    type: 'resize' | 'rotate'
    startX: number
    startY: number
    initialScale: number
    initialRotation: number
    initialDist: number
    initialAngle: number
  } | null>(null)

  // Atajos de teclado para manipulación de la gema seleccionada o grupo (Fase 5 & 16)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignorar si el foco está en un input de texto
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return
      }

      if (!selectedGemId && selectedGemIds.length === 0) return

      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault()
        if (selectedGemIds.length > 1) {
          removeSelectedGems()
        } else if (selectedGemId) {
          removeGem(selectedGemId)
        }
      } else if (e.key === 'Escape') {
        e.preventDefault()
        clearSelection()
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'd') {
        e.preventDefault()
        if (selectedGemIds.length > 1) {
          duplicateSelectedGems()
        } else if (selectedGemId) {
          duplicateGem(selectedGemId)
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'c') {
        e.preventDefault()
        if (selectedGemId) copyGem(selectedGemId)
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'v') {
        e.preventDefault()
        pasteGem()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedGemId, selectedGemIds, removeGem, removeSelectedGems, duplicateGem, duplicateSelectedGems, copyGem, pasteGem, clearSelection])

  if (!coords || !coords.isVisible || !selectedGemId || isDragging || selectedGemIds.length > 1) {
    return null
  }

  const selectedGem = gems.find((g) => g.id === selectedGemId)
  if (!selectedGem) return null

  const { px, py, radiusPx } = coords

  // Dimensiones del cuadro delimitador proyectado
  const padding = 6
  const boxWidth = (radiusPx + padding) * 2
  const boxHeight = (radiusPx + padding) * 2
  const left = px - boxWidth / 2
  const top = py - boxHeight / 2

  // Iniciar redimensionamiento desde una esquina
  const startResize = (e: React.PointerEvent) => {
    if (e.button !== 0) return
    e.stopPropagation()
    e.preventDefault()

    const startX = e.clientX
    const startY = e.clientY
    const rect = e.currentTarget.closest('.canvas-container')?.getBoundingClientRect()
    const centerX = rect ? rect.left + px : startX
    const centerY = rect ? rect.top + py : startY
    const initialDist = Math.hypot(startX - centerX, startY - centerY)

    dragActionRef.current = {
      type: 'resize',
      startX,
      startY,
      initialScale: selectedGem.scale,
      initialRotation: selectedGem.rotation || 0,
      initialDist: Math.max(initialDist, 10),
      initialAngle: 0,
    }

    const onPointerMove = (ev: PointerEvent) => {
      if (!dragActionRef.current || dragActionRef.current.type !== 'resize') return
      const curDist = Math.hypot(ev.clientX - centerX, ev.clientY - centerY)
      const ratio = curDist / dragActionRef.current.initialDist
      const newScale = Math.max(0.35, Math.min(3.0, dragActionRef.current.initialScale * ratio))
      updateGem(selectedGemId, { scale: Number(newScale.toFixed(3)) })
    }

    const onPointerUp = () => {
      dragActionRef.current = null
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', onPointerUp)
    }

    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', onPointerUp)
  }

  // Iniciar rotación desde el handle superior
  const startRotate = (e: React.PointerEvent) => {
    if (e.button !== 0) return
    e.stopPropagation()
    e.preventDefault()

    const rect = e.currentTarget.closest('.canvas-container')?.getBoundingClientRect()
    const centerX = rect ? rect.left + px : e.clientX
    const centerY = rect ? rect.top + py : e.clientY
    const initialAngle = Math.atan2(e.clientY - centerY, e.clientX - centerX)

    dragActionRef.current = {
      type: 'rotate',
      startX: e.clientX,
      startY: e.clientY,
      initialScale: selectedGem.scale,
      initialRotation: selectedGem.rotation || 0,
      initialDist: 0,
      initialAngle,
    }

    const onPointerMove = (ev: PointerEvent) => {
      if (!dragActionRef.current || dragActionRef.current.type !== 'rotate') return
      const currentAngle = Math.atan2(ev.clientY - centerY, ev.clientX - centerX)
      const deltaAngle = currentAngle - dragActionRef.current.initialAngle
      const newRotation = dragActionRef.current.initialRotation + deltaAngle
      updateGem(selectedGemId, { rotation: Number(newRotation.toFixed(3)) })
    }

    const onPointerUp = () => {
      dragActionRef.current = null
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', onPointerUp)
    }

    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', onPointerUp)
  }

  return (
    <div
      className="absolute pointer-events-none select-none z-20"
      style={{
        left: `${left}px`,
        top: `${top}px`,
        width: `${boxWidth}px`,
        height: `${boxHeight}px`,
      }}
      onContextMenu={(e) => {
        e.preventDefault()
        e.stopPropagation()
        if (useStudioStore.getState().isPanning) return
        openContextMenu({ x: e.clientX, y: e.clientY })
      }}
    >
      {/* Caja envolvente punteada */}
      <div className="w-full h-full border border-dashed border-cyan-400/90 rounded-sm relative shadow-sm pointer-events-none">
        {/* Tallo y Handle de rotación superior (Fase 4d & 14) */}
        <div className="absolute left-1/2 -top-6 -translate-x-1/2 flex flex-col items-center pointer-events-auto">
          <div
            onPointerDown={startRotate}
            title="Rotar gema (plano del diente)"
            className="transform-handle touch-none w-3.5 h-3.5 rounded-full bg-cyan-400 border-2 border-slate-900 shadow-md hover:scale-125 transition-transform cursor-grab active:cursor-grabbing flex items-center justify-center"
          >
            <div className="w-1 h-1 rounded-full bg-slate-900" />
          </div>
          <div className="w-px h-2.5 bg-cyan-400/80" />
        </div>

        {/* 4 Handles de esquina para redimensionar (Fase 4c & 14) */}
        <div
          onPointerDown={startResize}
          title="Redimensionar gema"
          className="transform-handle touch-none absolute -top-1.5 -left-1.5 w-3 h-3 bg-white border border-cyan-500 rounded-xs shadow-md pointer-events-auto hover:scale-125 transition-transform cursor-nwse-resize"
        />
        <div
          onPointerDown={startResize}
          title="Redimensionar gema"
          className="transform-handle touch-none absolute -top-1.5 -right-1.5 w-3 h-3 bg-white border border-cyan-500 rounded-xs shadow-md pointer-events-auto hover:scale-125 transition-transform cursor-nesw-resize"
        />
        <div
          onPointerDown={startResize}
          title="Redimensionar gema"
          className="transform-handle touch-none absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-white border border-cyan-500 rounded-xs shadow-md pointer-events-auto hover:scale-125 transition-transform cursor-nesw-resize"
        />
        <div
          onPointerDown={startResize}
          title="Redimensionar gema"
          className="transform-handle touch-none absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-white border border-cyan-500 rounded-xs shadow-md pointer-events-auto hover:scale-125 transition-transform cursor-nwse-resize"
        />

        {/* Botón rápido flotante "···" para menú contextual de gema (Fase 5) */}
        <div className="absolute -top-3.5 right-0 translate-x-full pl-2 pointer-events-auto flex items-center gap-1">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              const rect = e.currentTarget.getBoundingClientRect()
              openContextMenu({ x: rect.right + 6, y: rect.top })
            }}
            title="Menú de opciones de gema (clic derecho)"
            className="w-5 h-5 rounded-md bg-slate-900/90 text-cyan-300 hover:text-white hover:bg-cyan-950 border border-slate-700/80 shadow-md flex items-center justify-center cursor-pointer transition-colors"
          >
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="12" cy="12" r="2" />
              <circle cx="19" cy="12" r="2" />
              <circle cx="5" cy="12" r="2" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
