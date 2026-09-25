import * as THREE from 'three'

/**
 * Generador procedural de texturas de esmalte dental fotorealista (Fase 20a)
 * Crea mapas de albedo con gradiente natural (centro luminoso, bordes translúcidos cálidos)
 * y mapas de rugosidad variable (centro ultra-pulido/glossy, periferia satinada/mate).
 */
export function createToothEnamelTextures(): {
  colorMap: THREE.CanvasTexture
  roughnessMap: THREE.CanvasTexture
} {
  // 1. Textura de Color / Albedo (512x512)
  const colorCanvas = document.createElement('canvas')
  colorCanvas.width = 512
  colorCanvas.height = 512
  const ctx = colorCanvas.getContext('2d')!

  // Fondo base marfil suave porcelana translúcida
  ctx.fillStyle = '#f8f5ee'
  ctx.fillRect(0, 0, 512, 512)

  // Gradiente radial de esmalte natural:
  // Centro (U=0.5, V=0.5 -> x=256, y=256): blanco brillante #ffffff
  // Bordes (interproximales y cervicales): tono cálido aperlado/translúcido (#ede5d4)
  const radialAlbedo = ctx.createRadialGradient(256, 250, 40, 256, 250, 240)
  radialAlbedo.addColorStop(0, '#ffffff')
  radialAlbedo.addColorStop(0.45, '#faf8f2')
  radialAlbedo.addColorStop(0.8, '#f3ebdd')
  radialAlbedo.addColorStop(1, '#e8dcce')
  ctx.fillStyle = radialAlbedo
  ctx.fillRect(0, 0, 512, 512)

  // Brillo vestibular frontal intenso en el tercio medio-incisal
  const labialGleam = ctx.createRadialGradient(256, 230, 10, 256, 230, 140)
  labialGleam.addColorStop(0, 'rgba(255, 255, 255, 0.95)')
  labialGleam.addColorStop(0.6, 'rgba(255, 255, 255, 0.4)')
  labialGleam.addColorStop(1, 'rgba(255, 255, 255, 0)')
  ctx.fillStyle = labialGleam
  ctx.fillRect(0, 0, 512, 512)

  // Micro-estrías horizontales orgánicas de desarrollo del esmalte (Perikymata)
  ctx.strokeStyle = 'rgba(215, 202, 185, 0.05)'
  ctx.lineWidth = 1.2
  for (let y = 60; y < 450; y += 8) {
    ctx.beginPath()
    ctx.moveTo(30, y + Math.sin(y * 0.15) * 2.5)
    ctx.bezierCurveTo(170, y - 2, 340, y + 2, 482, y)
    ctx.stroke()
  }

  const colorMap = new THREE.CanvasTexture(colorCanvas)
  colorMap.colorSpace = THREE.SRGBColorSpace
  colorMap.wrapS = THREE.ClampToEdgeWrapping
  colorMap.wrapT = THREE.ClampToEdgeWrapping
  colorMap.needsUpdate = true

  // 2. Textura de Rugosidad Variable (512x512)
  // Centro vestibular: oscuro (roughness ~0.08, reflejo de estudio hiper-pulido espejo)
  // Bordes laterales e incisales: más claro (roughness ~0.30, difusión satinada no plástica)
  const roughCanvas = document.createElement('canvas')
  roughCanvas.width = 512
  roughCanvas.height = 512
  const rCtx = roughCanvas.getContext('2d')!

  // Base satinada perimetral
  rCtx.fillStyle = '#4c4c4c' // ~0.30 rugosidad mate suave
  rCtx.fillRect(0, 0, 512, 512)

  // Centro vestibular pulido
  const rGrad = rCtx.createRadialGradient(256, 240, 25, 256, 240, 200)
  rGrad.addColorStop(0, '#101010')    // ~0.06 ultra-glossy / pulido dental
  rGrad.addColorStop(0.5, '#1e1e1e')  // ~0.12
  rGrad.addColorStop(0.8, '#323232')  // ~0.20
  rGrad.addColorStop(1, '#4c4c4c')    // ~0.30 difusión en bordes
  rCtx.fillStyle = rGrad
  rCtx.fillRect(0, 0, 512, 512)

  const roughnessMap = new THREE.CanvasTexture(roughCanvas)
  roughnessMap.wrapS = THREE.ClampToEdgeWrapping
  roughnessMap.wrapT = THREE.ClampToEdgeWrapping
  roughnessMap.needsUpdate = true

  return { colorMap, roughnessMap }
}
