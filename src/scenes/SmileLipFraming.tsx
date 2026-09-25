import { useMemo } from 'react'
import * as THREE from 'three'
import { useStudioStore } from '../store/useStudioStore'

export function SmileLipFraming() {
  const showLips = useStudioStore((state) => state.showLips)
  const lipShade = useStudioStore((state) => state.lipShade)

  const lipColor = useMemo(() => {
    switch (lipShade) {
      case 'ruby':
        return '#991b1b'
      case 'gloss':
        return '#db2777'
      case 'nude':
      default:
        return '#c07a70'
    }
  }, [lipShade])

  // Geometría del labio superior con arco de Cupido
  const upperLipGeometry = useMemo(() => {
    const shape = new THREE.Shape()
    // Contorno exterior superior
    shape.moveTo(-1.6, 0.12)
    shape.bezierCurveTo(-1.0, 0.42, -0.4, 0.48, 0, 0.38) // Arco izquierdo
    shape.bezierCurveTo(0.4, 0.48, 1.0, 0.42, 1.6, 0.12)  // Arco derecho
    // Borde bermellón interior
    shape.bezierCurveTo(1.0, 0.18, 0.3, 0.20, 0, 0.18)
    shape.bezierCurveTo(-0.3, 0.20, -1.0, 0.18, -1.6, 0.12)
    shape.closePath()

    const geom = new THREE.ExtrudeGeometry(shape, {
      depth: 0.08,
      bevelEnabled: true,
      bevelSegments: 4,
      steps: 1,
      bevelSize: 0.05,
      bevelThickness: 0.06,
    })
    geom.center()
    return geom
  }, [])

  // Geometría del labio inferior con curvatura redondeada completa
  const lowerLipGeometry = useMemo(() => {
    const shape = new THREE.Shape()
    // Contorno exterior inferior
    shape.moveTo(-1.6, 0.08)
    shape.bezierCurveTo(-1.1, -0.62, -0.4, -0.68, 0, -0.68)
    shape.bezierCurveTo(0.4, -0.68, 1.1, -0.62, 1.6, 0.08)
    // Borde bermellón interior
    shape.bezierCurveTo(1.0, -0.32, 0.4, -0.35, 0, -0.35)
    shape.bezierCurveTo(-0.4, -0.35, -1.0, -0.32, -1.6, 0.08)
    shape.closePath()

    const geom = new THREE.ExtrudeGeometry(shape, {
      depth: 0.10,
      bevelEnabled: true,
      bevelSegments: 4,
      steps: 1,
      bevelSize: 0.06,
      bevelThickness: 0.07,
    })
    geom.center()
    return geom
  }, [])

  if (!showLips || lipShade === 'none') return null

  return (
    <group position={[0, -0.05, 0.42]}>
      {/* Labio Superior */}
      <mesh geometry={upperLipGeometry} position={[0, 0.36, 0]}>
        <meshPhysicalMaterial
          color={lipColor}
          roughness={0.28}
          clearcoat={0.92}
          clearcoatRoughness={0.08}
          reflectivity={0.8}
        />
      </mesh>

      {/* Labio Inferior */}
      <mesh geometry={lowerLipGeometry} position={[0, -0.44, 0]}>
        <meshPhysicalMaterial
          color={lipColor}
          roughness={0.28}
          clearcoat={0.92}
          clearcoatRoughness={0.08}
          reflectivity={0.8}
        />
      </mesh>
    </group>
  )
}
