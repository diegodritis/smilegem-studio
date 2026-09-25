import { useEffect, useRef } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import { useStudioStore } from '../store/useStudioStore'

export function CameraController() {
  const camera = useThree((state) => state.camera)
  const cameraPreset = useStudioStore((state) => state.cameraPreset)
  const autoRotate = useStudioStore((state) => state.autoRotate)
  const panOffset = useStudioStore((state) => state.panOffset)
  const isPanning = useStudioStore((state) => state.isPanning)
  const controlsRef = useRef<any>(null)

  // Coordenadas deseadas según preset
  const targetPos = useRef(new THREE.Vector3(0, 0, 5.0))
  const currentLookAt = useRef(new THREE.Vector3(0, 0, 0))

  useEffect(() => {
    switch (cameraPreset) {
      case 'left':
        targetPos.current.set(-2.0, 0.2, 4.4)
        break
      case 'right':
        targetPos.current.set(2.0, 0.2, 4.4)
        break
      case 'closeUp':
        targetPos.current.set(0, 0, 3.2)
        break
      case 'frontal':
      case 'orbit':
      default:
        targetPos.current.set(0, 0, 5.0)
        break
    }
  }, [cameraPreset])

  useFrame(() => {
    const lerpFactor = isPanning ? 0.35 : 0.16

    if (cameraPreset !== 'orbit') {
      // Transición suave hacia la posición objetivo con desplazamiento de paneo sincronizado
      const camX = targetPos.current.x - panOffset[0]
      const camY = targetPos.current.y - panOffset[1]
      camera.position.x = THREE.MathUtils.lerp(camera.position.x, camX, lerpFactor)
      camera.position.y = THREE.MathUtils.lerp(camera.position.y, camY, lerpFactor)
      camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetPos.current.z, lerpFactor)

      currentLookAt.current.x = THREE.MathUtils.lerp(currentLookAt.current.x, -panOffset[0], lerpFactor)
      currentLookAt.current.y = THREE.MathUtils.lerp(currentLookAt.current.y, -panOffset[1], lerpFactor)
      camera.lookAt(currentLookAt.current.x, currentLookAt.current.y, 0)
    }

    // Efecto Turntable / Giro automático si está activo
    if (autoRotate) {
      const radius = 5.0
      const speed = 0.5
      const time = performance.now() * 0.001 * speed
      camera.position.x = Math.sin(time) * radius - panOffset[0]
      camera.position.z = Math.cos(time) * radius
      camera.lookAt(-panOffset[0], -panOffset[1], 0)
    }
  })

  if (cameraPreset === 'orbit' && !autoRotate) {
    return (
      <OrbitControls
        ref={controlsRef}
        makeDefault
        enablePan={true}
        screenSpacePanning={true}
        minDistance={2.5}
        maxDistance={8.0}
        maxPolarAngle={Math.PI / 1.7}
        minPolarAngle={Math.PI / 2.6}
      />
    )
  }

  return null
}
