import { useMemo } from 'react'
import * as THREE from 'three'
import { useGemsStore, type Gem } from '../store/useGemsStore'
import { useStudioStore } from '../store/useStudioStore'
import { getFinishById } from '../lib/gemFinishes'
import {
  createBrilliantCutGemGeometry,
  createFacetedShapeGeometry,
  createCustomShape3DGeometry,
} from './gemGeometryGenerator'

interface GemMeshProps {
  gem: Gem
  isSelected: boolean
  isDragging: boolean
  onSelect: (e: any) => void
  onDragStart: (e: any) => void
  onContextMenu?: (e: any) => void
}

function GemMesh({ gem, isSelected, isDragging, onSelect, onDragStart, onContextMenu }: GemMeshProps) {
  const customShapes = useGemsStore((state) => state.customShapes)

  // Encontrar definición de textura si es forma personalizada (Fase 15)
  const customUrl = useMemo(() => {
    if (gem.customShapeUrl) return gem.customShapeUrl
    if (typeof gem.shape === 'string' && gem.shape.startsWith('custom-')) {
      const match = customShapes.find((s) => s.id === gem.shape)
      return match?.dataUrl || null
    }
    return null
  }, [gem.shape, gem.customShapeUrl, customShapes])

  const customTexture = useMemo(() => {
    if (!customUrl) return null
    const loader = new THREE.TextureLoader()
    const tex = loader.load(customUrl)
    tex.colorSpace = THREE.SRGBColorSpace
    return tex
  }, [customUrl])

  // Orientar la gema perpendicular a la normal de la superficie del diente, aplicando rotación si existe
  const quaternion = useMemo(() => {
    const normal = new THREE.Vector3(...gem.normal).normalize()
    const up = new THREE.Vector3(0, 0, 1)
    const qNormal = new THREE.Quaternion()

    // Caso límite si la normal es exactamente opuesta al vector de referencia
    if (normal.distanceTo(new THREE.Vector3(0, 0, -1)) < 0.001) {
      qNormal.setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI)
    } else {
      qNormal.setFromUnitVectors(up, normal)
    }

    // Si tiene rotación en el plano de la superficie, componer cuaternión
    if (gem.rotation) {
      const qRot = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), gem.rotation)
      qNormal.multiply(qRot)
    }

    return qNormal
  }, [gem.normal, gem.rotation])

  // Geometría 3D facetada con volumen real (Fase 20b): Brilliant-Cut para círculos o Extrusión biselada nítida
  const geometry = useMemo(() => {
    if (customTexture) {
      return createCustomShape3DGeometry()
    }

    if (gem.shape === 'circle' || !gem.shape) {
      return createBrilliantCutGemGeometry()
    }

    return createFacetedShapeGeometry(gem.shape)
  }, [gem.shape, customTexture])

  // Propiedades físicas del acabado (Fase 7 & 20b)
  const finishOpt = useMemo(() => {
    return getFinishById(gem.finish || 'solid')
  }, [gem.finish])

  return (
    <group position={gem.worldPosition} quaternion={quaternion}>
      {/* Mesh de la gema con su forma 3D facetada y material cristalino PBR con refracción */}
      <mesh
        geometry={geometry}
        scale={[gem.scale, gem.scale, gem.scale]}
        onClick={onSelect}
        onPointerDown={onDragStart}
        onContextMenu={onContextMenu}
        onPointerOver={(e) => {
          e.stopPropagation()
          document.body.style.cursor = isDragging ? 'grabbing' : 'grab'
        }}
        onPointerOut={() => {
          if (!isDragging) {
            document.body.style.cursor = 'default'
          }
        }}
      >
        <meshPhysicalMaterial
          map={customTexture || undefined}
          alphaMap={customTexture || undefined}
          transparent={!!customTexture || finishOpt.id !== 'metallic'}
          alphaTest={customTexture ? 0.08 : 0}
          side={customTexture ? THREE.DoubleSide : THREE.FrontSide}
          color={gem.color || '#FFFFFF'}
          roughness={gem.roughness ?? finishOpt.roughness}
          metalness={gem.metalness ?? finishOpt.metalness}
          clearcoat={gem.clearcoat ?? (finishOpt.clearcoat || 1.0)}
          clearcoatRoughness={finishOpt.clearcoatRoughness || 0.02}
          iridescence={finishOpt.iridescence}
          ior={finishOpt.ior || 2.417}
          reflectivity={1.0}
        />
      </mesh>

      {/* Indicador visual de selección múltiple/individual (aro resaltado cian) */}
      {isSelected && (
        <mesh position={[0, 0, 0.012]}>
          <ringGeometry args={[0.088 * gem.scale, 0.106 * gem.scale, 36]} />
          <meshBasicMaterial
            color="#38bdf8"
            side={THREE.DoubleSide}
            transparent
            opacity={0.95}
          />
        </mesh>
      )}
    </group>
  )
}

export function GemsLayer() {
  const gems = useGemsStore((state) => state.gems)
  const selectedGemIds = useGemsStore((state) => state.selectedGemIds)
  const isDragging = useGemsStore((state) => state.isDragging)
  const toggleSelectGem = useGemsStore((state) => state.toggleSelectGem)
  const setSelectedGemIds = useGemsStore((state) => state.setSelectedGemIds)
  const setIsDragging = useGemsStore((state) => state.setIsDragging)
  const openContextMenu = useGemsStore((state) => state.openContextMenu)

  return (
    // Grupo raíz único 'gemsGroup' sin rotación propia
    <group name="gemsGroup" position={[0, 0, 0]} rotation={[0, 0, 0]}>
      {gems.map((gem) => (
        <GemMesh
          key={gem.id}
          gem={gem}
          isSelected={selectedGemIds.includes(gem.id)}
          isDragging={isDragging && selectedGemIds.includes(gem.id)}
          onSelect={(e) => {
            if (e.nativeEvent?.button === 2 || e.button === 2) return
            if (useStudioStore.getState().isPanning) return
            e.stopPropagation()
            const isShift = !!(e.nativeEvent && (e.nativeEvent.shiftKey || e.nativeEvent.metaKey))
            toggleSelectGem(gem.id, isShift)
          }}
          onDragStart={(e) => {
            if (e.nativeEvent?.button === 2 || e.button === 2) return
            if (useStudioStore.getState().isPanning) return
            e.stopPropagation()
            const isShift = !!(e.nativeEvent && (e.nativeEvent.shiftKey || e.nativeEvent.metaKey))
            if (isShift) {
              toggleSelectGem(gem.id, true)
            } else if (!selectedGemIds.includes(gem.id)) {
              setSelectedGemIds([gem.id])
            }
            setIsDragging(true)
            document.body.style.cursor = 'grabbing'
          }}
          onContextMenu={(e) => {
            e.stopPropagation()
            if (e.nativeEvent) {
              e.nativeEvent.preventDefault()
            }
            if (useStudioStore.getState().isPanning) return

            if (!selectedGemIds.includes(gem.id)) {
              setSelectedGemIds([gem.id])
            }
            const clientX = e.clientX ?? e.nativeEvent?.clientX ?? window.innerWidth / 2
            const clientY = e.clientY ?? e.nativeEvent?.clientY ?? window.innerHeight / 2
            openContextMenu({ x: clientX, y: clientY })
          }}
        />
      ))}
    </group>
  )
}
