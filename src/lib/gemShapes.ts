import * as THREE from 'three'
import type { GemShape } from '../store/useGemsStore'

export interface ShapeDefinition {
  id: GemShape
  label: string
  category: 'Clásicas' | 'Geométricas' | 'Fantasía'
  aspectRatio: number
  svgPath: string
  createThreeShape: () => THREE.Shape
}

export const GEM_SHAPES: ShapeDefinition[] = [
  {
    id: 'circle',
    label: 'Círculo (Round)',
    category: 'Clásicas',
    aspectRatio: 1,
    svgPath: 'M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z',
    createThreeShape: () => {
      const shape = new THREE.Shape()
      shape.absarc(0, 0, 0.07, 0, Math.PI * 2, false)
      return shape
    },
  },
  {
    id: 'teardrop',
    label: 'Lágrima / Pera',
    category: 'Clásicas',
    aspectRatio: 0.75,
    svgPath: 'M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z',
    createThreeShape: () => {
      const shape = new THREE.Shape()
      const r = 0.065
      // Punta superior en (0, 0.09)
      shape.moveTo(0, 0.09)
      shape.bezierCurveTo(0.045, 0.04, 0.07, -0.01, 0.07, -0.04)
      shape.absarc(0, -0.04, r, 0, Math.PI, true)
      shape.bezierCurveTo(-0.07, -0.01, -0.045, 0.04, 0, 0.09)
      return shape
    },
  },
  {
    id: 'marquise',
    label: 'Marquise (Navette)',
    category: 'Clásicas',
    aspectRatio: 0.55,
    svgPath: 'M12 2C6.5 7.5 4 12 4 12s2.5 4.5 8 10c5.5-5.5 8-10 8-10s-2.5-4.5-8-10z',
    createThreeShape: () => {
      const shape = new THREE.Shape()
      shape.moveTo(0, 0.095)
      shape.quadraticCurveTo(0.065, 0, 0, -0.095)
      shape.quadraticCurveTo(-0.065, 0, 0, 0.095)
      return shape
    },
  },
  {
    id: 'heart',
    label: 'Corazón',
    category: 'Fantasía',
    aspectRatio: 1,
    svgPath: 'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z',
    createThreeShape: () => {
      const shape = new THREE.Shape()
      const x = 0, y = 0
      shape.moveTo(x, y - 0.055)
      shape.bezierCurveTo(x + 0.075, y - 0.02, x + 0.08, y + 0.045, x + 0.035, y + 0.07)
      shape.bezierCurveTo(x + 0.01, y + 0.08, x, y + 0.045, x, y + 0.03)
      shape.bezierCurveTo(x, y + 0.045, x - 0.01, y + 0.08, x - 0.035, y + 0.07)
      shape.bezierCurveTo(x - 0.08, y + 0.045, x - 0.075, y - 0.02, x, y - 0.055)
      return shape
    },
  },
  {
    id: 'star',
    label: 'Estrella',
    category: 'Fantasía',
    aspectRatio: 1,
    svgPath: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
    createThreeShape: () => {
      const shape = new THREE.Shape()
      const points = 5
      const outerR = 0.08
      const innerR = 0.035
      for (let i = 0; i < points * 2; i++) {
        const r = i % 2 === 0 ? outerR : innerR
        const angle = (i * Math.PI) / points - Math.PI / 2
        const px = Math.cos(angle) * r
        const py = -Math.sin(angle) * r
        if (i === 0) shape.moveTo(px, py)
        else shape.lineTo(px, py)
      }
      shape.closePath()
      return shape
    },
  },
  {
    id: 'diamond',
    label: 'Diamante / Rombo',
    category: 'Geométricas',
    aspectRatio: 0.8,
    svgPath: 'M12 2L2 12l10 10 10-10L12 2z',
    createThreeShape: () => {
      const shape = new THREE.Shape()
      shape.moveTo(0, 0.085)
      shape.lineTo(0.065, 0)
      shape.lineTo(0, -0.085)
      shape.lineTo(-0.065, 0)
      shape.closePath()
      return shape
    },
  },
  {
    id: 'square',
    label: 'Cuadrado (Princess)',
    category: 'Geométricas',
    aspectRatio: 1,
    svgPath: 'M3 3h18v18H3z',
    createThreeShape: () => {
      const shape = new THREE.Shape()
      const s = 0.06
      shape.moveTo(-s, -s)
      shape.lineTo(s, -s)
      shape.lineTo(s, s)
      shape.lineTo(-s, s)
      shape.closePath()
      return shape
    },
  },
  {
    id: 'triangle',
    label: 'Triángulo (Trillion)',
    category: 'Geométricas',
    aspectRatio: 1.15,
    svgPath: 'M12 2L1 21h22L12 2z',
    createThreeShape: () => {
      const shape = new THREE.Shape()
      const r = 0.075
      shape.moveTo(0, r)
      shape.lineTo(Math.cos(-Math.PI / 6) * r, Math.sin(-Math.PI / 6) * r)
      shape.lineTo(Math.cos(-5 * Math.PI / 6) * r, Math.sin(-5 * Math.PI / 6) * r)
      shape.closePath()
      return shape
    },
  },
  {
    id: 'hexagon',
    label: 'Hexágono',
    category: 'Geométricas',
    aspectRatio: 1,
    svgPath: 'M12 2l8.66 5v10L12 22l-8.66-5V7L12 2z',
    createThreeShape: () => {
      const shape = new THREE.Shape()
      const r = 0.065
      for (let i = 0; i < 6; i++) {
        const angle = (i * Math.PI) / 3
        const px = Math.cos(angle) * r
        const py = Math.sin(angle) * r
        if (i === 0) shape.moveTo(px, py)
        else shape.lineTo(px, py)
      }
      shape.closePath()
      return shape
    },
  },
  {
    id: 'flower',
    label: 'Flor',
    category: 'Fantasía',
    aspectRatio: 1,
    svgPath: 'M12 2a4 4 0 0 0-4 4 4 4 0 0 0-4 4 4 4 0 0 0 4 4 4 4 0 0 0 4 4 4 4 0 0 0 4-4 4 4 0 0 0 4-4 4 4 0 0 0-4-4 4 4 0 0 0-4-4z',
    createThreeShape: () => {
      const shape = new THREE.Shape()
      const petals = 6
      const rOuter = 0.075
      const rInner = 0.04
      for (let i = 0; i <= petals * 12; i++) {
        const theta = (i * 2 * Math.PI) / (petals * 12)
        const r = rInner + (rOuter - rInner) * Math.sin(petals * theta / 2) ** 2
        const px = Math.cos(theta) * r
        const py = Math.sin(theta) * r
        if (i === 0) shape.moveTo(px, py)
        else shape.lineTo(px, py)
      }
      shape.closePath()
      return shape
    },
  },
  {
    id: 'butterfly',
    label: 'Mariposa',
    category: 'Fantasía',
    aspectRatio: 1.2,
    svgPath: 'M12 5c.5-2 2-3 4-3 3 0 5 3 5 7 0 4-4 7-9 11-5-4-9-7-9-11 0-4 2-7 5-7 2 0 3.5 1 4 3z',
    createThreeShape: () => {
      const shape = new THREE.Shape()
      // Alas superiores e inferiores estilizadas simétricas
      shape.moveTo(0, -0.04)
      shape.bezierCurveTo(0.03, -0.06, 0.07, -0.05, 0.07, -0.01)
      shape.bezierCurveTo(0.08, 0.02, 0.09, 0.07, 0.04, 0.08)
      shape.bezierCurveTo(0.02, 0.07, 0.01, 0.03, 0, 0.01)
      shape.bezierCurveTo(-0.01, 0.03, -0.02, 0.07, -0.04, 0.08)
      shape.bezierCurveTo(-0.09, 0.07, -0.08, 0.02, -0.07, -0.01)
      shape.bezierCurveTo(-0.07, -0.05, -0.03, -0.06, 0, -0.04)
      shape.closePath()
      return shape
    },
  },
  {
    id: 'cross',
    label: 'Cruz',
    category: 'Fantasía',
    aspectRatio: 0.8,
    svgPath: 'M10 2h4v7h7v4h-7v9h-4v-9H3V9h7V2z',
    createThreeShape: () => {
      const shape = new THREE.Shape()
      const w = 0.022
      const top = 0.085
      const bot = -0.085
      const arm = 0.06
      const crossY = 0.015
      shape.moveTo(-w, top)
      shape.lineTo(w, top)
      shape.lineTo(w, crossY + w)
      shape.lineTo(arm, crossY + w)
      shape.lineTo(arm, crossY - w)
      shape.lineTo(w, crossY - w)
      shape.lineTo(w, bot)
      shape.lineTo(-w, bot)
      shape.lineTo(-w, crossY - w)
      shape.lineTo(-arm, crossY - w)
      shape.lineTo(-arm, crossY + w)
      shape.lineTo(-w, crossY + w)
      shape.closePath()
      return shape
    },
  },
]
