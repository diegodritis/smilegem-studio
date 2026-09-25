import type { GemFinish } from '../store/useGemsStore'

export interface GemFinishOption {
  id: GemFinish
  label: string
  description: string
  roughness: number
  metalness: number
  clearcoat: number
  clearcoatRoughness: number
  iridescence: number
  ior: number
}

export const GEM_FINISHES: GemFinishOption[] = [
  {
    id: 'solid',
    label: 'Cristal Brillante (Swarovski)',
    description: 'Transparencia pura con alta refracción y destello facetado',
    roughness: 0.04,
    metalness: 0.15,
    clearcoat: 1.0,
    clearcoatRoughness: 0.02,
    iridescence: 0.0,
    ior: 2.42,
  },
  {
    id: 'iridescent',
    label: 'Tornasol / Holográfico',
    description: 'Reflejos multicolores de arcoíris según la incidencia de luz',
    roughness: 0.05,
    metalness: 0.35,
    clearcoat: 1.0,
    clearcoatRoughness: 0.04,
    iridescence: 1.0,
    ior: 1.85,
  },
  {
    id: 'metallic',
    label: 'Metal / Oro Pulido',
    description: 'Reflexión metálica de alto brillo (Oro 24K, Plata, Oro Rosa)',
    roughness: 0.08,
    metalness: 0.95,
    clearcoat: 0.6,
    clearcoatRoughness: 0.05,
    iridescence: 0.0,
    ior: 2.5,
  },
  {
    id: 'pearl',
    label: 'Perla / Ópalo Satén',
    description: 'Lustre perlado suave y satinado con sutil brillo nacarado',
    roughness: 0.22,
    metalness: 0.05,
    clearcoat: 0.85,
    clearcoatRoughness: 0.12,
    iridescence: 0.45,
    ior: 1.65,
  },
]

export interface ColorSwatch {
  name: string
  hex: string
  recommendedFinish?: GemFinish
}

export const COLOR_SWATCHES: ColorSwatch[] = [
  { name: 'Crystal Clear', hex: '#FFFFFF', recommendedFinish: 'solid' },
  { name: 'Oro 24K', hex: '#FFD700', recommendedFinish: 'metallic' },
  { name: 'Plata 925', hex: '#E2E8F0', recommendedFinish: 'metallic' },
  { name: 'Oro Rosa', hex: '#E0A899', recommendedFinish: 'metallic' },
  { name: 'Zafiro Real', hex: '#0284C7', recommendedFinish: 'solid' },
  { name: 'Esmeralda', hex: '#10B981', recommendedFinish: 'solid' },
  { name: 'Rubí Pasión', hex: '#EF4444', recommendedFinish: 'solid' },
  { name: 'Amatista', hex: '#8B5CF6', recommendedFinish: 'solid' },
  { name: 'Aqua Turquesa', hex: '#06B6D4', recommendedFinish: 'iridescent' },
  { name: 'Rosa Neón', hex: '#EC4899', recommendedFinish: 'iridescent' },
  { name: 'Ópalo Blanco', hex: '#F1F5F9', recommendedFinish: 'pearl' },
  { name: 'Jet Black', hex: '#1E293B', recommendedFinish: 'solid' },
]

export function getFinishById(id: GemFinish = 'solid'): GemFinishOption {
  return GEM_FINISHES.find((f) => f.id === id) || GEM_FINISHES[0]
}
