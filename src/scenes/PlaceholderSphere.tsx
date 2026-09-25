import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type * as THREE from 'three'
import { useStudioStore } from '../store/useStudioStore'

export function PlaceholderSphere() {
  const groupRef = useRef<THREE.Group>(null)
  const timeRef = useRef(0)
  const autoRotate = useStudioStore((state) => state.autoRotate)

  useFrame((_, delta) => {
    if (groupRef.current && autoRotate) {
      timeRef.current += delta
      // Rotación en Y y oscilación suave en X
      groupRef.current.rotation.y += delta * 0.6
      groupRef.current.rotation.x = Math.sin(timeRef.current * 0.5) * 0.15
    }
  })

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* Esfera faceteada con sombreado plano (las facetas reflejan la luz al girar) */}
      <mesh>
        <sphereGeometry args={[1, 28, 20]} />
        <meshStandardMaterial
          color="#0284c7"
          roughness={0.25}
          metalness={0.35}
          flatShading={true}
        />
      </mesh>

      {/* Malla alámbrica (wireframe) superpuesta para que el giro 3D sea 100% visible */}
      <mesh>
        <sphereGeometry args={[1.003, 24, 16]} />
        <meshBasicMaterial
          color="#38bdf8"
          wireframe
          transparent
          opacity={0.35}
        />
      </mesh>

      {/* Anillo de órbita decorativo */}
      <mesh rotation={[Math.PI / 2.3, 0, 0]}>
        <torusGeometry args={[1.35, 0.012, 16, 64]} />
        <meshStandardMaterial
          color="#38bdf8"
          emissive="#0284c7"
          emissiveIntensity={0.6}
          roughness={0.2}
          metalness={0.9}
        />
      </mesh>
    </group>
  )
}
