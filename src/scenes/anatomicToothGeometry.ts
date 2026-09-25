import * as THREE from 'three'

export type ToothClass =
  | 'upper-central'
  | 'upper-lateral'
  | 'upper-canine'
  | 'upper-premolar'
  | 'upper-molar'
  | 'lower-central'
  | 'lower-lateral'
  | 'lower-canine'
  | 'lower-premolar'
  | 'lower-molar'

/**
 * Determina el tipo anatómico de cada diente según su numeración FDI (11-17, 21-27, 31-37, 41-47)
 */
export function getToothClass(toothNum: number): ToothClass {
  // Arcada superior (cuadrantes 1 y 2)
  if (toothNum === 11 || toothNum === 21) return 'upper-central'
  if (toothNum === 12 || toothNum === 22) return 'upper-lateral'
  if (toothNum === 13 || toothNum === 23) return 'upper-canine'
  if ([14, 15, 24, 25].includes(toothNum)) return 'upper-premolar'
  if ([16, 17, 26, 27].includes(toothNum)) return 'upper-molar'

  // Arcada inferior (cuadrantes 3 y 4)
  if (toothNum === 31 || toothNum === 41) return 'lower-central'
  if (toothNum === 32 || toothNum === 42) return 'lower-lateral'
  if (toothNum === 33 || toothNum === 43) return 'lower-canine'
  if ([34, 35, 44, 45].includes(toothNum)) return 'lower-premolar'
  return 'lower-molar'
}

/**
 * Generador procedural de coronas dentales anatómicas estéticas de alta fidelidad.
 *
 * Características clave del perfil dental real:
 * 1. Cara labial aplanada suave con curvatura estética (no semicilindro de cápsula).
 * 2. Borde incisal definido en la base (filo masticatorio plano tipo cincel, sin frunces ni puntas cónicas).
 * 3. Estrechamiento hacia el cuello en la zona cervical que se inserta orgánicamente en la encía.
 * 4. Silueta armónica: caninos proporcionados con pendiente incisal sutil (sin deformaciones cónicas).
 */
export function createAnatomicToothGeometry(
  toothNum: number,
  baseRadius = 0.17,
  baseLength = 0.38
): THREE.BufferGeometry {
  const toothClass = getToothClass(toothNum)
  const isUpper = toothNum < 30

  // Variación anatómica sutil determinista por pieza
  const seed = (toothNum * 9301 + 49297) % 233280
  const rnd = seed / 233280
  const varW = 0.98 + (rnd - 0.5) * 0.04
  const varH = 0.98 + (0.5 - rnd) * 0.04

  // Parámetros dimensionales por clase dental
  let width = baseRadius * 1.05 * varW
  let height = baseLength * 0.78 * varH
  let depth = baseRadius * 0.68
  let neckTaperX = 0.74 // Estrechamiento transversal en el cuello
  let neckTaperZ = 0.68 // Estrechamiento sagital en el cuello
  let labialFlatness = 0.45 // Grado de aplanamiento de la cara labial
  let incisalCornerRound = 0.08 // Suavizado de ángulos mesio/disto-incisales
  let canineCusp = 0.0

  switch (toothClass) {
    case 'upper-central':
      // Incisivo central superior: pala ancha, cara labial plana, borde incisal amplio
      width = 0.185 * varW
      height = 0.34 * varH
      depth = 0.120
      neckTaperX = 0.74
      neckTaperZ = 0.66
      labialFlatness = 0.52
      incisalCornerRound = 0.06
      break

    case 'upper-lateral':
      // Incisivo lateral superior: ~82% del ancho del central, estilizado y armónico
      width = 0.150 * varW
      height = 0.31 * varH
      depth = 0.110
      neckTaperX = 0.76
      neckTaperZ = 0.68
      labialFlatness = 0.46
      incisalCornerRound = 0.12
      break

    case 'upper-canine':
      // Canino superior: robusto, pendiente incisal suave y armónica (sin punta cónica desproporcionada)
      width = 0.165 * varW
      height = 0.34 * varH
      depth = 0.135
      neckTaperX = 0.78
      neckTaperZ = 0.72
      labialFlatness = 0.36
      incisalCornerRound = 0.15
      canineCusp = 0.018
      break

    case 'upper-premolar':
      width = 0.165 * varW
      height = 0.28 * varH
      depth = 0.150
      neckTaperX = 0.82
      neckTaperZ = 0.80
      labialFlatness = 0.30
      break

    case 'upper-molar':
      width = 0.195 * varW
      height = 0.25 * varH
      depth = 0.175
      neckTaperX = 0.85
      neckTaperZ = 0.84
      labialFlatness = 0.25
      break

    case 'lower-central':
    case 'lower-lateral':
      // Incisivos inferiores: delgados, alargados, borde incisal recto
      width = 0.125 * varW
      height = 0.31 * varH
      depth = 0.100
      neckTaperX = 0.72
      neckTaperZ = 0.66
      labialFlatness = 0.48
      incisalCornerRound = 0.06
      break

    case 'lower-canine':
      width = 0.140 * varW
      height = 0.33 * varH
      depth = 0.120
      neckTaperX = 0.76
      neckTaperZ = 0.70
      labialFlatness = 0.36
      incisalCornerRound = 0.14
      canineCusp = 0.015
      break

    case 'lower-premolar':
      width = 0.155 * varW
      height = 0.26 * varH
      depth = 0.140
      neckTaperX = 0.80
      neckTaperZ = 0.80
      labialFlatness = 0.28
      break

    case 'lower-molar':
      width = 0.185 * varW
      height = 0.23 * varH
      depth = 0.170
      neckTaperX = 0.84
      neckTaperZ = 0.84
      labialFlatness = 0.24
      break
  }

  // Malla paramétrica de alta resolución:
  // nV = anillos de altura (de cuello a borde incisal)
  // nU = segmentos radiales alrededor del diente
  const nV = 32
  const nU = 36

  const positions: number[] = []
  const uvs: number[] = []
  const indices: number[] = []

  // Generar anillos de vértices desde el cuello (t=0) hasta el borde incisal (t=1)
  for (let j = 0; j <= nV; j++) {
    const t = j / nV // 0 = cervical (cuello/encía), 1 = borde incisal (filo masticatorio)

    // Coordenada vertical Y
    let yNorm = (0.5 - t) * height
    if (!isUpper) {
      yNorm = (t - 0.5) * height
    }

    // Escala de ancho X en función de la altura:
    // Estrechamiento suave en el cuello (t=0) que se expande hacia el tercio medio e incisal
    const factorX = THREE.MathUtils.lerp(neckTaperX, 1.0, Math.sin(t * Math.PI * 0.5))
    let currentW = width * factorX

    // Leve redondeo en las esquinas incisales en el borde inferior
    if (t > 0.90 && incisalCornerRound > 0) {
      const tCorner = (t - 0.90) / 0.10
      currentW *= 1.0 - incisalCornerRound * tCorner * 0.35
    }

    // Escala de grosor Z en función de la altura:
    // Máxima convexidad labial en el tercio cervical (t=0.35)
    // Adelgazamiento progresivo hacia un filo incisal plano y estilizado (t=1.0)
    let factorZ = 1.0
    if (t < 0.35) {
      factorZ = THREE.MathUtils.lerp(neckTaperZ, 1.0, t / 0.35)
    } else {
      const tInc = (t - 0.35) / 0.65
      factorZ = THREE.MathUtils.lerp(1.0, 0.22, Math.pow(tInc, 1.25))
    }
    const currentD = depth * factorZ

    // Generar vértices a lo largo del anillo
    for (let i = 0; i < nU; i++) {
      const u = (i / nU) * Math.PI * 2
      const cosU = Math.cos(u)
      const sinU = Math.sin(u)

      // Coordenada transversal X
      let x = currentW * sinU

      // Coordenada sagital Z:
      // Cara labial (cosU > 0) plana y pulida; cara palatina/lingual (cosU < 0) suavemente cóncava
      let z = 0
      if (cosU >= 0) {
        const flatMod = 1.0 - labialFlatness * Math.pow(sinU, 2)
        z = currentD * cosU * flatMod
      } else {
        z = currentD * cosU * 0.88
      }

      // Pendiente sutil de cúspide en caninos en el borde incisal
      let y = yNorm
      if (canineCusp > 0 && t > 0.75) {
        const cuspFactor = (t - 0.75) / 0.25
        const slopeY = (1.0 - Math.abs(sinU)) * canineCusp * cuspFactor
        y += isUpper ? -slopeY : slopeY
      }

      positions.push(x, y, z)
      uvs.push(i / nU, t)
    }
  }

  // Triangulación de la superficie perimetral
  for (let j = 0; j < nV; j++) {
    for (let i = 0; i < nU; i++) {
      const nextI = (i + 1) % nU
      const current = j * nU + i
      const next = j * nU + nextI
      const above = (j + 1) * nU + i
      const aboveNext = (j + 1) * nU + nextI

      indices.push(current, next, aboveNext)
      indices.push(current, aboveNext, above)
    }
  }

  // 1. Tapa cervical (cuello/encía, t=0): centro cerrado que penetra en la encía
  const neckCenterIndex = positions.length / 3
  const neckY = isUpper ? 0.5 * height : -0.5 * height
  positions.push(0, neckY, 0)
  uvs.push(0.5, 0)

  for (let i = 0; i < nU; i++) {
    const nextI = (i + 1) % nU
    if (isUpper) {
      indices.push(neckCenterIndex, nextI, i)
    } else {
      indices.push(neckCenterIndex, i, nextI)
    }
  }

  // 2. Tapa incisal (filo masticatorio, t=1.0):
  // Se conecta en tira plana de lado a lado (front-to-back bridge) para formar un borde plano tipo cincel
  // sin ningún frunce ni vértice central que deforme el filo masticatorio
  const lastRingStart = nV * nU
  const halfU = Math.floor(nU / 2) // 18
  for (let i = 0; i < halfU; i++) {
    // Vértice en la cara labial
    const f1 = lastRingStart + i
    const f2 = lastRingStart + i + 1
    // Vértice opuesto en la cara lingual
    const b1 = lastRingStart + (nU - 1 - i)
    const b2 = lastRingStart + (nU - 2 - i)

    if (f2 <= b2) {
      if (isUpper) {
        indices.push(f1, f2, b1)
        if (f2 < b1 && b2 >= f2) {
          indices.push(f2, b2, b1)
        }
      } else {
        indices.push(f1, b1, f2)
        if (f2 < b1 && b2 >= f2) {
          indices.push(f2, b1, b2)
        }
      }
    }
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2))
  geometry.setIndex(indices)

  // Normales suaves optimizadas
  geometry.computeVertexNormals()

  return geometry
}
