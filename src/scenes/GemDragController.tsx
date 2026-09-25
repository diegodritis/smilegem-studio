import { useEffect, useRef } from 'react'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useGemsStore } from '../store/useGemsStore'

export function GemDragController() {
  const { gl, camera, scene, raycaster } = useThree()
  const isDragging = useGemsStore((state) => state.isDragging)
  const selectedGemId = useGemsStore((state) => state.selectedGemId)
  const selectedGemIds = useGemsStore((state) => state.selectedGemIds)
  const gems = useGemsStore((state) => state.gems)
  const setIsDragging = useGemsStore((state) => state.setIsDragging)
  const updateGem = useGemsStore((state) => state.updateGem)

  const dragStartRef = useRef<{
    primaryId: string
    initialPrimaryPos: [number, number, number]
    initialPositions: Map<string, [number, number, number]>
  } | null>(null)

  useEffect(() => {
    if (!isDragging || !selectedGemId) {
      dragStartRef.current = null
      return
    }

    const primary = gems.find((g) => g.id === selectedGemId)
    if (!primary) return

    const initialPositions = new Map<string, [number, number, number]>()
    selectedGemIds.forEach((id) => {
      const g = gems.find((item) => item.id === id)
      if (g) {
        initialPositions.set(id, [...g.worldPosition])
      }
    })

    dragStartRef.current = {
      primaryId: selectedGemId,
      initialPrimaryPos: [...primary.worldPosition],
      initialPositions,
    }

    const canvas = gl.domElement

    function onPointerMove(event: PointerEvent) {
      if (!dragStartRef.current) return

      const rect = canvas.getBoundingClientRect()
      // Coordenadas normalizadas del puntero (-1 a +1)
      const mouse = new THREE.Vector2(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        -((event.clientY - rect.top) / rect.height) * 2 + 1
      )

      raycaster.setFromCamera(mouse, camera)

      // Buscar exclusivamente el grupo 'dentalArchGroup' para raycast contra dientes (no contra gemas)
      const archGroup = scene.getObjectByName('dentalArchGroup')
      if (!archGroup) return

      const intersects = raycaster.intersectObjects(archGroup.children, true)
      if (intersects.length > 0) {
        const hit = intersects[0]
        if (hit.face) {
          // Normal convertida a espacio mundial
          const worldNormal = hit.face.normal
            .clone()
            .transformDirection(hit.object.matrixWorld)
            .normalize()

          // Offset de seguridad para mantenerse en la superficie del esmalte
          const offsetHitPoint = hit.point.clone().add(worldNormal.clone().multiplyScalar(0.018))
          const toothId = (hit.object.userData?.toothId as string) || hit.object.name || 'tooth-unknown'
          const u = hit.uv ? hit.uv.x : 0.5
          const v = hit.uv ? hit.uv.y : 0.5

          const { primaryId, initialPrimaryPos, initialPositions } = dragStartRef.current

          // Calcular delta de movimiento
          const deltaX = offsetHitPoint.x - initialPrimaryPos[0]
          const deltaY = offsetHitPoint.y - initialPrimaryPos[1]
          const deltaZ = offsetHitPoint.z - initialPrimaryPos[2]

          // Actualizar gema primaria
          updateGem(primaryId, {
            toothId,
            position: { u, v },
            worldPosition: [offsetHitPoint.x, offsetHitPoint.y, offsetHitPoint.z],
            normal: [worldNormal.x, worldNormal.y, worldNormal.z],
          })

          // Si hay selección múltiple activa (Fase 16), desplazar el resto manteniendo su posición relativa
          initialPositions.forEach((initPos, gId) => {
            if (gId !== primaryId) {
              updateGem(gId, {
                worldPosition: [initPos[0] + deltaX, initPos[1] + deltaY, initPos[2] + deltaZ],
              })
            }
          })
        }
      }
    }

    function onPointerUp() {
      setIsDragging(false)
      dragStartRef.current = null
      document.body.style.cursor = 'default'
    }

    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', onPointerUp)

    return () => {
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', onPointerUp)
    }
  }, [isDragging, selectedGemId, selectedGemIds, gems, gl, camera, scene, raycaster, updateGem, setIsDragging])

  return null
}
