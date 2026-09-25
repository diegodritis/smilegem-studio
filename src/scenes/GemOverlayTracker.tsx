import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useGemsStore } from '../store/useGemsStore'

export interface ScreenCoords {
  px: number
  py: number
  radiusPx: number
  isVisible: boolean
}

export interface GemPoint2D {
  id: string
  px: number
  py: number
}

interface GemOverlayTrackerProps {
  onUpdate: (coords: ScreenCoords | null) => void
  onUpdateAllPoints?: (points: GemPoint2D[]) => void
}

export function GemOverlayTracker({ onUpdate, onUpdateAllPoints }: GemOverlayTrackerProps) {
  const selectedGemId = useGemsStore((state) => state.selectedGemId)
  const gems = useGemsStore((state) => state.gems)
  const selectedGem = gems.find((g) => g.id === selectedGemId)
  const tempVec = useRef(new THREE.Vector3())
  const topVec = useRef(new THREE.Vector3())

  useFrame(({ camera, gl }) => {
    const canvas = gl.domElement
    const rect = canvas.getBoundingClientRect()
    if (rect.width === 0 || rect.height === 0) return

    // 1. Proyectar todas las gemas a 2D para selección por lazo/marquee (Fase 16)
    if (onUpdateAllPoints) {
      const points: GemPoint2D[] = []
      gems.forEach((g) => {
        tempVec.current.set(...g.worldPosition)
        tempVec.current.project(camera)
        if (tempVec.current.z <= 1) {
          const px = ((tempVec.current.x + 1) / 2) * rect.width
          const py = ((-tempVec.current.y + 1) / 2) * rect.height
          points.push({ id: g.id, px, py })
        }
      })
      onUpdateAllPoints(points)
    }

    // 2. Proyectar la gema seleccionada para handles de transformación (Fase 4c & 4d)
    if (!selectedGem) {
      onUpdate(null)
      return
    }

    // Proyectar la posición mundial al espacio de coordenadas de pantalla
    tempVec.current.set(...selectedGem.worldPosition)
    tempVec.current.project(camera)

    // Si la posición queda detrás de la cámara
    if (tempVec.current.z > 1) {
      onUpdate(null)
      return
    }

    // Coordenadas CSS en píxeles relativas al canvas (no a window)
    const px = ((tempVec.current.x + 1) / 2) * rect.width
    const py = ((-tempVec.current.y + 1) / 2) * rect.height

    // Proyectar el punto superior para derivar el radio en píxeles en pantalla
    topVec.current.set(
      selectedGem.worldPosition[0],
      selectedGem.worldPosition[1] + 0.08 * selectedGem.scale,
      selectedGem.worldPosition[2]
    )
    topVec.current.project(camera)
    const pyTop = ((-topVec.current.y + 1) / 2) * rect.height
    const radiusPx = Math.max(16, Math.abs(py - pyTop))

    onUpdate({ px, py, radiusPx, isVisible: true })
  })

  return null
}
