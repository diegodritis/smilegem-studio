import { useMemo } from 'react'
import * as THREE from 'three'
import type { ThreeEvent } from '@react-three/fiber'
import { useGemsStore } from '../store/useGemsStore'
import { useStudioStore } from '../store/useStudioStore'
import { GEM_SIZES } from '../lib/gemSizes'
import { createAnatomicToothGeometry } from './anatomicToothGeometry'

interface ToothConfig {
  id: string
  label: string
  position: [number, number, number]
  rotation: [number, number, number]
  scale: [number, number, number]
  radius: number
  length: number
}

export function DentalArch() {
  const addGem = useGemsStore((state) => state.addGem)
  const isDragging = useGemsStore((state) => state.isDragging)
  const activeArch = useStudioStore((state) => state.activeArch)

  // 1. Configuración de la arcada superior (14 piezas: #11-#17, #21-#27)
  const upperTeeth = useMemo<ToothConfig[]>(() => {
    const specs = [
      { radius: 0.17, length: 0.44, scale: [1, 1, 1] as [number, number, number], x: 0.185, y: 0.0, z: 0.16, ry: -0.05, rx: 0.05 }, // #11 & #21 (Centrales)
      { radius: 0.145, length: 0.38, scale: [1, 1, 1] as [number, number, number], x: 0.51, y: 0.03, z: 0.09, ry: -0.22, rx: 0.04 }, // #12 & #22 (Laterales)
      { radius: 0.16, length: 0.42, scale: [1, 1, 1] as [number, number, number], x: 0.84, y: 0.01, z: -0.05, ry: -0.46, rx: 0.03 }, // #13 & #23 (Caninos proporcionados, sin cúspide cónica)
      { radius: 0.17, length: 0.37, scale: [1, 1, 1] as [number, number, number], x: 1.14, y: 0.04, z: -0.26, ry: -0.75, rx: 0.02 }, // #14 & #24
      { radius: 0.175, length: 0.35, scale: [1, 1, 1] as [number, number, number], x: 1.40, y: 0.06, z: -0.53, ry: -1.02, rx: 0.02 }, // #15 & #25
      { radius: 0.21, length: 0.34, scale: [1, 1, 1] as [number, number, number], x: 1.63, y: 0.08, z: -0.86, ry: -1.22, rx: 0.01 }, // #16 & #26
      { radius: 0.20, length: 0.32, scale: [1, 1, 1] as [number, number, number], x: 1.83, y: 0.10, z: -1.21, ry: -1.35, rx: 0.01 }, // #17 & #27
    ]

    const list: ToothConfig[] = []
    specs.forEach((s, idx) => {
      const toothNumRight = 11 + idx
      const toothNumLeft = 21 + idx

      list.push({
        id: `tooth-${toothNumRight}`,
        label: `#${toothNumRight}`,
        position: [s.x, s.y, s.z],
        rotation: [s.rx, s.ry, 0],
        scale: s.scale,
        radius: s.radius,
        length: s.length,
      })

      list.push({
        id: `tooth-${toothNumLeft}`,
        label: `#${toothNumLeft}`,
        position: [-s.x, s.y, s.z],
        rotation: [s.rx, -s.ry, 0],
        scale: s.scale,
        radius: s.radius,
        length: s.length,
      })
    })
    return list
  }, [])

  // 2. Configuración de la arcada inferior (14 piezas: #41-#47, #31-#37)
  // Separada verticalmente para evitar interpenetración con la arcada superior (Paso 2)
  const lowerTeeth = useMemo<ToothConfig[]>(() => {
    const specs = [
      { radius: 0.13, length: 0.40, scale: [1, 1, 1] as [number, number, number], x: 0.13, y: -0.47, z: 0.06, ry: -0.04, rx: -0.04 }, // #41 & #31
      { radius: 0.14, length: 0.42, scale: [1, 1, 1] as [number, number, number], x: 0.38, y: -0.46, z: 0.01, ry: -0.20, rx: -0.04 }, // #42 & #32
      { radius: 0.155, length: 0.44, scale: [1, 1, 1] as [number, number, number], x: 0.66, y: -0.45, z: -0.11, ry: -0.42, rx: -0.03 }, // #43 & #33
      { radius: 0.16, length: 0.36, scale: [1, 1, 1] as [number, number, number], x: 0.94, y: -0.43, z: -0.30, ry: -0.70, rx: -0.02 }, // #44 & #34
      { radius: 0.165, length: 0.35, scale: [1, 1, 1] as [number, number, number], x: 1.20, y: -0.42, z: -0.54, ry: -0.98, rx: -0.02 }, // #45 & #35
      { radius: 0.20, length: 0.34, scale: [1, 1, 1] as [number, number, number], x: 1.44, y: -0.40, z: -0.84, ry: -1.18, rx: -0.01 }, // #46 & #36
      { radius: 0.19, length: 0.32, scale: [1, 1, 1] as [number, number, number], x: 1.65, y: -0.38, z: -1.17, ry: -1.32, rx: -0.01 }, // #47 & #37
    ]

    const list: ToothConfig[] = []
    specs.forEach((s, idx) => {
      const toothNumRight = 41 + idx // 41 a 47
      const toothNumLeft = 31 + idx  // 31 a 37

      list.push({
        id: `tooth-${toothNumRight}`,
        label: `#${toothNumRight}`,
        position: [s.x, s.y, s.z],
        rotation: [s.rx, s.ry, 0],
        scale: s.scale,
        radius: s.radius,
        length: s.length,
      })

      list.push({
        id: `tooth-${toothNumLeft}`,
        label: `#${toothNumLeft}`,
        position: [-s.x, s.y, s.z],
        rotation: [s.rx, -s.ry, 0],
        scale: s.scale,
        radius: s.radius,
        length: s.length,
      })
    })
    return list
  }, [])

  // Geometrías anatómicas memoizadas por ID de diente (Paso 1: dientes reales, no cápsulas)
  const toothGeometries = useMemo(() => {
    const map: Record<string, THREE.BufferGeometry> = {}
    const all = [...upperTeeth, ...lowerTeeth]
    for (const t of all) {
      const num = parseInt(t.id.replace('tooth-', ''), 10)
      map[t.id] = createAnatomicToothGeometry(num, t.radius, t.length)
    }
    return map
  }, [upperTeeth, lowerTeeth])

  // Franja de encía continua superior (Gingiva superior, Paso 1)
  const upperGingivaGeometry = useMemo(() => {
    const points = [
      new THREE.Vector3(1.88, 0.22, -1.24),
      new THREE.Vector3(1.68, 0.20, -0.89),
      new THREE.Vector3(1.44, 0.19, -0.56),
      new THREE.Vector3(1.18, 0.18, -0.29),
      new THREE.Vector3(0.88, 0.16, -0.07),
      new THREE.Vector3(0.54, 0.17, 0.07),
      new THREE.Vector3(0.19, 0.16, 0.14),
      new THREE.Vector3(-0.19, 0.16, 0.14),
      new THREE.Vector3(-0.54, 0.17, 0.07),
      new THREE.Vector3(-0.88, 0.16, -0.07),
      new THREE.Vector3(-1.18, 0.18, -0.29),
      new THREE.Vector3(-1.44, 0.19, -0.56),
      new THREE.Vector3(-1.68, 0.20, -0.89),
      new THREE.Vector3(-1.88, 0.22, -1.24),
    ]
    const curve = new THREE.CatmullRomCurve3(points)
    return new THREE.TubeGeometry(curve, 64, 0.12, 14, false)
  }, [])

  // Franja de encía continua inferior (Gingiva inferior, Paso 1)
  const lowerGingivaGeometry = useMemo(() => {
    const points = [
      new THREE.Vector3(1.70, -0.55, -1.21),
      new THREE.Vector3(1.50, -0.56, -0.88),
      new THREE.Vector3(1.27, -0.57, -0.58),
      new THREE.Vector3(1.01, -0.58, -0.34),
      new THREE.Vector3(0.73, -0.59, -0.14),
      new THREE.Vector3(0.42, -0.60, -0.01),
      new THREE.Vector3(0.14, -0.61, 0.04),
      new THREE.Vector3(-0.14, -0.61, 0.04),
      new THREE.Vector3(-0.42, -0.60, -0.01),
      new THREE.Vector3(-0.73, -0.59, -0.14),
      new THREE.Vector3(-1.01, -0.58, -0.34),
      new THREE.Vector3(-1.27, -0.57, -0.58),
      new THREE.Vector3(-1.50, -0.56, -0.88),
      new THREE.Vector3(-1.70, -0.55, -1.21),
    ]
    const curve = new THREE.CatmullRomCurve3(points)
    return new THREE.TubeGeometry(curve, 64, 0.11, 14, false)
  }, [])

  // Dientes visibles según la selección de arcada
  const activeTeeth = useMemo(() => {
    if (activeArch === 'lower') return lowerTeeth
    if (activeArch === 'both') return [...upperTeeth, ...lowerTeeth]
    return upperTeeth
  }, [activeArch, upperTeeth, lowerTeeth])

  // Manejador del clic mediante Raycasting para colocar la gema en la superficie
  const handleToothClick = (e: ThreeEvent<MouseEvent>, toothId: string) => {
    if (isDragging) return
    if (e.nativeEvent?.button === 2 || e.button === 2) return
    if (useStudioStore.getState().isPanning) return
    e.stopPropagation()

    const hitPoint = e.point.clone()
    let worldNormal = new THREE.Vector3(0, 0, 1)
    if (e.face) {
      worldNormal = e.face.normal.clone().transformDirection(e.object.matrixWorld).normalize()
    } else if (e.normal) {
      worldNormal = e.normal.clone().normalize()
    }

    const offsetHitPoint = hitPoint.add(worldNormal.clone().multiplyScalar(0.018))
    const u = e.uv ? e.uv.x : 0.5
    const v = e.uv ? e.uv.y : 0.5

    const storeState = useGemsStore.getState()
    const sizeDef = GEM_SIZES.find((s) => s.code === storeState.activeSizeCode)
    const scale = sizeDef ? sizeDef.scaleFactor : 1
    const customShape = storeState.customShapes.find((cs) => cs.id === storeState.activeShape)

    addGem({
      toothId,
      position: { u, v },
      worldPosition: [offsetHitPoint.x, offsetHitPoint.y, offsetHitPoint.z],
      normal: [worldNormal.x, worldNormal.y, worldNormal.z],
      rotation: 0,
      scale,
      shape: storeState.activeShape || 'circle',
      customShapeUrl: customShape ? customShape.dataUrl : undefined,
      sizeCode: storeState.activeSizeCode || 'SS3',
      color: storeState.activeColor || '#FFFFFF',
      finish: storeState.activeFinish || 'solid',
    })
  }

  return (
    <group name="dentalArchGroup" position={[0, 0, 0]}>
      {/* 1. Franja de encía superior continua (Gingiva superior) */}
      {(activeArch === 'upper' || activeArch === 'both') && (
        <mesh
          name="upperGingiva"
          geometry={upperGingivaGeometry}
          scale={[1, 1.25, 0.95]}
          position={[0, 0.03, -0.01]}
          raycast={() => null}
        >
          <meshPhysicalMaterial
            color="#d6717e"
            roughness={0.42}
            metalness={0.0}
            clearcoat={0.35}
            clearcoatRoughness={0.25}
            reflectivity={0.65}
          />
        </mesh>
      )}

      {/* 2. Franja de encía inferior continua (Gingiva inferior) */}
      {(activeArch === 'lower' || activeArch === 'both') && (
        <mesh
          name="lowerGingiva"
          geometry={lowerGingivaGeometry}
          scale={[1, 1.25, 0.95]}
          position={[0, -0.03, -0.01]}
          raycast={() => null}
        >
          <meshPhysicalMaterial
            color="#d6717e"
            roughness={0.42}
            metalness={0.0}
            clearcoat={0.35}
            clearcoatRoughness={0.25}
            reflectivity={0.65}
          />
        </mesh>
      )}

      {/* 3. Dientes anatómicos */}
      {activeTeeth.map((t) => (
        <group key={t.id} position={t.position} rotation={t.rotation}>
          <mesh
            name={t.id}
            userData={{ toothId: t.id, isTooth: true }}
            scale={[1, 1, 1]}
            geometry={toothGeometries[t.id]}
            onClick={(e) => handleToothClick(e, t.id)}
            onContextMenu={(e) => {
              e.stopPropagation()
              e.nativeEvent?.preventDefault()
              if (useStudioStore.getState().isPanning) return

              useGemsStore.getState().clearSelection()
              const clientX = e.clientX ?? e.nativeEvent?.clientX ?? window.innerWidth / 2
              const clientY = e.clientY ?? e.nativeEvent?.clientY ?? window.innerHeight / 2
              useGemsStore.getState().openContextMenu({ x: clientX, y: clientY })
            }}
            onPointerOver={(e) => {
              if (isDragging) return
              e.stopPropagation()
              document.body.style.cursor = 'crosshair'
            }}
            onPointerOut={() => {
              if (!isDragging) {
                document.body.style.cursor = 'default'
              }
            }}
          >
            {/* Material PBR de esmalte dental con brillo difuso suave tipo estudio (Paso 3) */}
            <meshPhysicalMaterial
              color="#fcfbf7"
              roughness={0.22}
              metalness={0.0}
              clearcoat={0.65}
              clearcoatRoughness={0.20}
              reflectivity={0.88}
              ior={1.55}
            />
          </mesh>
        </group>
      ))}
    </group>
  )
}
