import { useStudioStore } from '../store/useStudioStore'

export function StudioLighting() {
  const lightingPreset = useStudioStore((state) => state.lightingPreset)

  switch (lightingPreset) {
    case 'ringlight':
      return (
        <group>
          <ambientLight intensity={1.1} />
          <hemisphereLight color="#ffffff" groundColor="#f1f5f9" intensity={0.8} />
          {/* Luz anular suave con intensidad balanceada para no quemar el esmalte */}
          <pointLight position={[0.8, 0.8, 3.8]} intensity={0.8} color="#ffffff" decay={2} />
          <pointLight position={[-0.8, 0.8, 3.8]} intensity={0.8} color="#ffffff" decay={2} />
          <pointLight position={[0.8, -0.8, 3.8]} intensity={0.6} color="#ffffff" decay={2} />
          <pointLight position={[-0.8, -0.8, 3.8]} intensity={0.6} color="#ffffff" decay={2} />
          <directionalLight position={[0, 3, 2.5]} intensity={0.6} />
        </group>
      )
    case 'clinical':
      return (
        <group>
          <ambientLight intensity={1.4} color="#f8fafc" />
          <hemisphereLight color="#ffffff" groundColor="#e2e8f0" intensity={1.0} />
          {/* Luz difusa clínica extendida */}
          <directionalLight position={[0, 2, 4.5]} intensity={1.2} color="#ffffff" />
          <directionalLight position={[2, -1, 3]} intensity={0.7} color="#e2e8f0" />
        </group>
      )
    case 'cyber':
      return (
        <group>
          <ambientLight intensity={0.7} color="#0f172a" />
          <directionalLight position={[-3, 2, 3]} intensity={1.6} color="#06b6d4" />
          <directionalLight position={[3, -1, 3]} intensity={1.6} color="#ec4899" />
          <pointLight position={[0, 0, 4]} intensity={0.8} color="#ffffff" decay={2} />
        </group>
      )
    case 'studio':
    default:
      return (
        <group>
          {/* 1. Luz ambiental difusa envolvente */}
          <ambientLight intensity={0.95} color="#ffffff" />

          {/* 2. Luz hemisférica: simula cielo blanco superior y rebote cálido de mucosa/labios */}
          <hemisphereLight color="#ffffff" groundColor="#eddcd7" intensity={0.85} />

          {/* 3. Softbox principal amplio (Key Light difuso doble que crea un highlight suave y extendido) */}
          <directionalLight position={[0.8, 2.6, 4.2]} intensity={0.85} color="#ffffff" />
          <directionalLight position={[-0.8, 2.6, 4.2]} intensity={0.65} color="#ffffff" />

          {/* 4. Fill light lateral para dar volumen anatómico sin generar brillos duros */}
          <directionalLight position={[-2.4, 1.0, 3.2]} intensity={0.50} color="#f0f9ff" />

          {/* 5. Rim light suave superior para recortar el borde incisal y perfil dental */}
          <directionalLight position={[0, 3.5, 0.6]} intensity={0.40} color="#ffffff" />

          {/* 6. Rebote tenue inferior */}
          <directionalLight position={[0, -2.2, 2.5]} intensity={0.30} color="#fff8f3" />
        </group>
      )
  }
}
