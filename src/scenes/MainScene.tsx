import { Suspense, useState, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { DentalArch } from './DentalArch'
import { GemsLayer } from './GemsLayer'
import { GemDragController } from './GemDragController'
import { GemOverlayTracker, type ScreenCoords, type GemPoint2D } from './GemOverlayTracker'
import { GemTransformOverlay } from './GemTransformOverlay'
import { SmileLipFraming } from './SmileLipFraming'
import { StudioLighting } from './StudioLighting'
import { CameraController } from './CameraController'
import { GemFloatingToolbar } from '../components/GemFloatingToolbar'
import { GemInspectorPanel } from '../components/GemInspectorPanel'
import { GemContextMenu } from '../components/GemContextMenu'
import { useStudioStore, BACKGROUND_OPTIONS } from '../store/useStudioStore'
import { useGemsStore } from '../store/useGemsStore'

export function MainScene() {
  const [overlayCoords, setOverlayCoords] = useState<ScreenCoords | null>(null)
  const [isInspectorOpen, setIsInspectorOpen] = useState(false)

  // Coordenadas 2D de todas las gemas para lazo/marquesina (Fase 16)
  const allGemPointsRef = useRef<GemPoint2D[]>([])

  // Estado de arrastre con clic derecho para mover la dentadura
  const rightDragRef = useRef<{
    startX: number
    startY: number
    lastX: number
    lastY: number
    hasDragged: boolean
    pointerId: number
  } | null>(null)
  const justFinishedRightDragRef = useRef(false)

  // Estado del lazo de selección (Marquee)
  const [marquee, setMarquee] = useState<{
    startX: number
    startY: number
    currentX: number
    currentY: number
    isActive: boolean
  } | null>(null)

  const backgroundId = useStudioStore((state) => state.backgroundId)
  const customBackgroundUrl = useStudioStore((state) => state.customBackgroundUrl)
  const panOffset = useStudioStore((state) => state.panOffset)
  const setPanOffset = useStudioStore((state) => state.setPanOffset)
  const resetPanOffset = useStudioStore((state) => state.resetPanOffset)
  const isPanning = useStudioStore((state) => state.isPanning)
  const setIsPanning = useStudioStore((state) => state.setIsPanning)

  const gems = useGemsStore((state) => state.gems)
  const selectedGemId = useGemsStore((state) => state.selectedGemId)
  const selectedGemIds = useGemsStore((state) => state.selectedGemIds)
  const isDragging = useGemsStore((state) => state.isDragging)
  const setSelectedGemIds = useGemsStore((state) => state.setSelectedGemIds)
  const clearSelection = useGemsStore((state) => state.clearSelection)
  const openContextMenu = useGemsStore((state) => state.openContextMenu)
  const closeContextMenu = useGemsStore((state) => state.closeContextMenu)

  // Obtener el preset de fondo seleccionado
  const currentBg = BACKGROUND_OPTIONS.find((bg) => bg.id === backgroundId) || BACKGROUND_OPTIONS[0]
  const selectedGem = gems.find((g) => g.id === selectedGemId)

  // Manejo de eventos de puntero (Clic izquierdo: selección/lazo; Clic derecho: menú / mover dentadura)
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // Si se hace clic en controles o modales, ignorar
    if ((e.target as HTMLElement).closest('.transform-handle, button, input, .menu-popover')) return

    // Si es clic derecho (botón 2): Iniciar seguimiento para mover la dentadura o abrir menú
    if (e.button === 2) {
      rightDragRef.current = {
        startX: e.clientX,
        startY: e.clientY,
        lastX: e.clientX,
        lastY: e.clientY,
        hasDragged: false,
        pointerId: e.pointerId,
      }
      try {
        e.currentTarget.setPointerCapture(e.pointerId)
      } catch {}
      return
    }

    // Clic izquierdo:
    closeContextMenu()

    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    setMarquee({
      startX: x,
      startY: y,
      currentX: x,
      currentY: y,
      isActive: true,
    })
  }

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    // 1. Manejo de arrastre con botón derecho: Mover la dentadura
    if (rightDragRef.current) {
      const drag = rightDragRef.current
      const dist = Math.hypot(e.clientX - drag.startX, e.clientY - drag.startY)

      if (dist > 4) {
        drag.hasDragged = true
        setIsPanning(true)
        document.body.style.cursor = 'grabbing'

        const deltaX = e.clientX - drag.lastX
        const deltaY = e.clientY - drag.lastY
        drag.lastX = e.clientX
        drag.lastY = e.clientY

        // Proyección exacta de píxeles a unidades Three.js (FOV 38 a distancia 5.0)
        const fovRad = (38 * Math.PI) / 180
        const visibleHeight = 2 * 5.0 * Math.tan(fovRad / 2) // ~3.44327 unidades en Z=0
        const unitsPerPixel = visibleHeight / Math.max(1, window.innerHeight)

        setPanOffset((prev) => [
          prev[0] + deltaX * unitsPerPixel,
          prev[1] - deltaY * unitsPerPixel,
        ])
      }
      return
    }

    // 2. Manejo de marquesina con clic izquierdo
    if (!marquee || !marquee.isActive || isDragging) return

    const rect = e.currentTarget.getBoundingClientRect()
    const currentX = e.clientX - rect.left
    const currentY = e.clientY - rect.top

    setMarquee((prev) => (prev ? { ...prev, currentX, currentY } : null))

    const minX = Math.min(marquee.startX, currentX)
    const maxX = Math.max(marquee.startX, currentX)
    const minY = Math.min(marquee.startY, currentY)
    const maxY = Math.max(marquee.startY, currentY)

    // Solo activar selección si el arrastre supera un umbral de 6px (evitar clics simples)
    if (Math.hypot(currentX - marquee.startX, currentY - marquee.startY) > 6) {
      const insideIds = allGemPointsRef.current
        .filter((pt) => pt.px >= minX && pt.px <= maxX && pt.py >= minY && pt.py <= maxY)
        .map((pt) => pt.id)

      setSelectedGemIds(insideIds)
    }
  }

  const handlePointerUp = (e?: React.PointerEvent<HTMLDivElement>) => {
    // Finalizar arrastre de botón derecho si existía
    if (rightDragRef.current) {
      const hadDrag = rightDragRef.current.hasDragged
      try {
        if (e) e.currentTarget.releasePointerCapture(rightDragRef.current.pointerId)
      } catch {}

      if (hadDrag) {
        document.body.style.cursor = 'default'
        justFinishedRightDragRef.current = true
        setTimeout(() => {
          justFinishedRightDragRef.current = false
          setIsPanning(false)
        }, 120)
      } else {
        setIsPanning(false)
      }
      rightDragRef.current = null
    }

    if (marquee?.isActive) {
      setMarquee(null)
    }
  }

  // Estilo de fondo personalizado o gradiente garantizado
  const containerStyle = customBackgroundUrl
    ? {
        backgroundImage: `radial-gradient(circle at center, rgba(7,9,14,0.4) 0%, rgba(7,9,14,0.85) 100%), url(${customBackgroundUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }
    : {
        background:
          currentBg.id === 'light'
            ? 'radial-gradient(circle at 50% 35%, #ffffff 0%, #e2e8f0 55%, #cbd5e1 100%)'
            : currentBg.id === 'warm'
            ? 'radial-gradient(circle at 50% 35%, #3e2730 0%, #1f1418 55%, #0e080b 100%)'
            : currentBg.id === 'neutral'
            ? 'radial-gradient(circle at 50% 35%, #2d3748 0%, #1a202c 55%, #0f131a 100%)'
            : 'radial-gradient(circle at 50% 35%, #1e293b 0%, #0b0e16 55%, #04060a 100%)',
      }

  return (
    <div
      className="canvas-container relative w-full h-full select-none transition-all duration-500 ease-in-out touch-none"
      style={containerStyle}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      onContextMenu={(e) => {
        e.preventDefault()
        // Si se acaba de realizar un arrastre para mover la dentadura, no abrir menú
        if (justFinishedRightDragRef.current || isPanning) {
          justFinishedRightDragRef.current = false
          return
        }

        // Clic derecho estático en el canvas: abrir menú contextual de escena/dentadura
        clearSelection()
        openContextMenu({ x: e.clientX, y: e.clientY })
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 5.0], fov: 38 }}
        dpr={[1, 2]}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
          premultipliedAlpha: false,
        }}
        onCreated={({ gl, scene }) => {
          gl.setClearColor(0x000000, 0)
          scene.background = null
        }}
        onPointerMissed={() => {
          if (!isDragging && !marquee?.isActive) {
            clearSelection()
          }
        }}
      >
        <Suspense fallback={null}>
          {/* Controlador de iluminación fotográfica según preset activo (rig calibrado de 5 fuentes) */}
          <StudioLighting />

          {/* Controlador dinámico de cámara (Presets, Órbita 3D y Turntable) */}
          <CameraController />

          {/* Arcada dental con soporte para Superior, Inferior o Ambas */}
          <DentalArch />

          {/* Encuadre de labios anatómicos 3D con brillo gloss realista */}
          <SmileLipFraming />

          {/* Único THREE.Group gemsGroup en la escena raíz (sin rotación propia) */}
          <GemsLayer />

          {/* Controlador de arrastre por raycasting contra la arcada */}
          <GemDragController />

          {/* Tracker 3D a 2D para sincronizar overlay de handles y soporte de lazo */}
          <GemOverlayTracker
            onUpdate={setOverlayCoords}
            onUpdateAllPoints={(pts) => {
              allGemPointsRef.current = pts
            }}
          />
        </Suspense>
      </Canvas>

      {/* Lazo / Marquee Box Visual (Fase 16) */}
      {marquee && marquee.isActive && Math.hypot(marquee.currentX - marquee.startX, marquee.currentY - marquee.startY) > 6 && (
        <div
          className="absolute border border-cyan-400/90 bg-cyan-500/15 rounded-xs pointer-events-none z-30 shadow-sm shadow-cyan-900/50 backdrop-blur-[1px]"
          style={{
            left: Math.min(marquee.startX, marquee.currentX),
            top: Math.min(marquee.startY, marquee.currentY),
            width: Math.abs(marquee.currentX - marquee.startX),
            height: Math.abs(marquee.currentY - marquee.startY),
          }}
        />
      )}

      {/* Overlay 2D con handles proyectados de redimensionado (4c), rotación (4d) y botón contextual (5) */}
      <GemTransformOverlay coords={overlayCoords} />

      {/* Menú Contextual Flotante por Clic Derecho o Botón Rápido */}
      <GemContextMenu />

      {/* Barra flotante de acciones rápidas para la gema seleccionada o grupo (Fase 8 & 16) */}
      <GemFloatingToolbar
        isInspectorOpen={isInspectorOpen}
        onToggleInspector={() => setIsInspectorOpen((prev) => !prev)}
      />

      {/* Panel lateral de inspección de propiedades de gema y subida de formas (Fase 6, 7 & 15) */}
      <GemInspectorPanel
        isOpen={isInspectorOpen}
        onClose={() => setIsInspectorOpen(false)}
      />

      {/* Botón flotante para recentrar dentadura cuando está desplazada */}
      {(Math.abs(panOffset[0]) > 0.01 || Math.abs(panOffset[1]) > 0.01) && (
        <div className="absolute top-4 left-4 z-20 animate-in fade-in duration-200">
          <button
            type="button"
            onClick={() => resetPanOffset()}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-950/90 hover:bg-slate-900 text-cyan-300 hover:text-white border border-cyan-500/50 hover:border-cyan-400 shadow-xl shadow-cyan-950/40 text-xs font-medium cursor-pointer transition-all backdrop-blur-md group"
            title="Restablecer posición de la dentadura al centro original"
          >
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse group-hover:scale-125 transition-transform" />
            <svg className="w-3.5 h-3.5 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 2v4" />
              <path d="M12 18v4" />
              <path d="M2 12h4" />
              <path d="M18 12h4" />
            </svg>
            <span>Dentadura desplazada · <span className="underline decoration-cyan-400 font-bold">Centrar</span></span>
          </button>
        </div>
      )}

      {/* Indicador de modo e información de gemas en el viewport */}
      <div className="absolute bottom-4 left-4 pointer-events-none text-xs text-slate-400 font-mono tracking-wide flex items-center gap-3 bg-slate-950/70 backdrop-blur-md px-3.5 py-2 rounded-lg border border-slate-800/80 shadow-lg z-20">
        <div className="flex items-center gap-2">
          <span
            className={`inline-block w-2 h-2 rounded-full ${
              isDragging
                ? 'bg-amber-400 animate-ping'
                : selectedGemIds.length > 1
                ? 'bg-purple-400 animate-pulse'
                : selectedGemId
                ? 'bg-cyan-400 animate-pulse'
                : 'bg-emerald-400'
            }`}
          />
          <span>
            {isDragging
              ? 'Arrastrando gema(s) por la superficie dental...'
              : selectedGemIds.length > 1
              ? `Multi-selección: ${selectedGemIds.length} gemas seleccionadas`
              : selectedGemId
              ? `Gema en ${selectedGem?.toothId.replace('tooth-', 'Diente #')} (${selectedGem?.shape} · ${selectedGem?.sizeCode || 'SS3'})`
              : 'Colocación Activa: Clic sobre cualquier diente o arrastrá para seleccionar con lazo'}
          </span>
        </div>
        <span className="text-slate-600">|</span>
        <div className="text-cyan-300 font-semibold">
          {gems.length === 0 ? '0 gemas' : `${gems.length} gema${gems.length > 1 ? 's' : ''}`}
        </div>
      </div>
    </div>
  )
}
