import * as THREE from 'three'
import { GEM_SHAPES } from '../lib/gemShapes'

/**
 * Genera una geometría de talla brillante (Brilliant Cut) para gemas circulares (Fase 20b)
 * Modela un strass/cristal Swarovski dental real:
 * - Base plana para adhesión a la superficie del diente (Z = 0)
 * - Cintura/faja (Girdle) de 16 facetas
 * - Corona facetada con 8 facetas cometa (kites), 8 facetas triangulares (stars)
 * - Tabla superior plana octagonal
 * Cada faceta tiene su propia normal plana independiente para destellos nítidos.
 */
export function createBrilliantCutGemGeometry(): THREE.BufferGeometry {
  const R = 0.082       // Radio de cintura (Girdle)
  const H_girdle = 0.010 // Altura de la base/cintura
  const H_crown = 0.038  // Altura total hasta la tabla
  const R_table = 0.042  // Radio de la tabla central

  const positions: number[] = []

  // Helper para empujar un triángulo con vértices independientes (flat facet)
  function pushTriangle(
    p1: [number, number, number],
    p2: [number, number, number],
    p3: [number, number, number]
  ) {
    positions.push(...p1, ...p2, ...p3)
  }

  // Helper para empujar un cuadrilátero como 2 triángulos planos
  function pushQuad(
    p1: [number, number, number],
    p2: [number, number, number],
    p3: [number, number, number],
    p4: [number, number, number]
  ) {
    pushTriangle(p1, p2, p3)
    pushTriangle(p1, p3, p4)
  }

  const N = 16 // 16 vértices en cintura
  const girdleBase: [number, number, number][] = []
  const girdleTop: [number, number, number][] = []

  for (let i = 0; i < N; i++) {
    const angle = (i / N) * Math.PI * 2
    const x = Math.cos(angle) * R
    const y = Math.sin(angle) * R
    girdleBase.push([x, y, 0])
    girdleTop.push([x, y, H_girdle])
  }

  // 1. Base plana inferior (contacto con el esmalte, normal hacia atrás)
  const centerBase: [number, number, number] = [0, 0, 0]
  for (let i = 0; i < N; i++) {
    const next = (i + 1) % N
    pushTriangle(centerBase, girdleBase[next], girdleBase[i])
  }

  // 2. Facetas verticales de la cintura (Girdle)
  for (let i = 0; i < N; i++) {
    const next = (i + 1) % N
    pushQuad(girdleBase[i], girdleBase[next], girdleTop[next], girdleTop[i])
  }

  // 3. Vértices de la tabla superior (octágono centrado en Z = H_crown)
  const tableVerts: [number, number, number][] = []
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2
    const x = Math.cos(angle) * R_table
    const y = Math.sin(angle) * R_table
    tableVerts.push([x, y, H_crown])
  }

  // 4. Facetas de la corona (triángulos de estrella y cometas)
  // Cada vértice de la tabla conecta con 2 vértices de la cintura superior
  for (let i = 0; i < 8; i++) {
    const nextI = (i + 1) % 8
    const tCurrent = tableVerts[i]
    const tNext = tableVerts[nextI]

    const g1 = girdleTop[i * 2]
    const g2 = girdleTop[i * 2 + 1]
    const g3 = girdleTop[(i * 2 + 2) % N]

    // Faceta principal (Kite / trapecio inclinado)
    pushTriangle(tCurrent, g1, g2)
    // Faceta triangular intermedia (Star / Upper girdle facet)
    pushTriangle(tCurrent, g2, tNext)
    pushTriangle(tNext, g2, g3)
  }

  // 5. Tabla superior plana (Octágono central)
  const centerTable: [number, number, number] = [0, 0, H_crown]
  for (let i = 0; i < 8; i++) {
    const next = (i + 1) % 8
    pushTriangle(centerTable, tableVerts[i], tableVerts[next])
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  geometry.computeVertexNormals() // Calcula la normal plana perfecta para cada triángulo

  return geometry
}

/**
 * Genera geometría extruida con bisel pronunciado facetado para formas de gema (Fase 20b)
 * Convierte el contorno 2D de la forma en un prisma cristalino con facetas nítidas.
 */
export function createFacetedShapeGeometry(shapeId: string): THREE.BufferGeometry {
  if (shapeId === 'circle' || !shapeId) {
    return createBrilliantCutGemGeometry()
  }

  const shapeDef = GEM_SHAPES.find((s) => s.id === shapeId) || GEM_SHAPES[0]
  const threeShape = shapeDef.createThreeShape()

  const extrudeSettings: THREE.ExtrudeGeometryOptions = {
    depth: 0.016,          // Profundidad base del cristal
    bevelEnabled: true,
    bevelSegments: 1,      // 1 solo segmento para aristas facetadas cortantes
    steps: 1,
    bevelSize: 0.022,      // Bisel ancho para reflejos claros
    bevelThickness: 0.026, // Grosor pronunciado de la corona
    bevelOffset: 0,
  }

  const extrudeGeom = new THREE.ExtrudeGeometry(threeShape, extrudeSettings)
  extrudeGeom.center()

  // Convertir a no-indexado para asegurar que cada faceta del bisel tenga normales planas
  const nonIndexed = extrudeGeom.toNonIndexed()
  nonIndexed.computeVertexNormals()
  return nonIndexed
}

/**
 * Geometría dimensional para formas personalizadas subidas por el usuario
 */
export function createCustomShape3DGeometry(): THREE.BufferGeometry {
  // Prisma delgado con bisel para dar relieve y volumen a la forma propia subida
  const shape = new THREE.Shape()
  const r = 0.075
  shape.moveTo(-r, -r)
  shape.lineTo(r, -r)
  shape.lineTo(r, r)
  shape.lineTo(-r, r)
  shape.closePath()

  const geom = new THREE.ExtrudeGeometry(shape, {
    depth: 0.014,
    bevelEnabled: true,
    bevelSegments: 1,
    bevelSize: 0.010,
    bevelThickness: 0.012,
  })
  geom.center()
  return geom.toNonIndexed()
}
