export interface GemSizeOption {
  code: string
  mm: number
  scaleFactor: number
  description: string
  isPopular?: boolean
}

export const GEM_SIZES: GemSizeOption[] = [
  { code: 'SS1', mm: 1.0, scaleFactor: 0.7, description: 'Micro-acento sutil' },
  { code: 'SS3', mm: 1.4, scaleFactor: 1.0, description: 'Estándar universal', isPopular: true },
  { code: 'SS5', mm: 1.8, scaleFactor: 1.3, description: 'Mediano balanceado', isPopular: true },
  { code: 'SS7', mm: 2.1, scaleFactor: 1.5, description: 'Prominente / Canino', isPopular: true },
  { code: 'SS9', mm: 2.6, scaleFactor: 1.85, description: 'Punto focal' },
  { code: 'SS10', mm: 2.8, scaleFactor: 2.0, description: 'Corona completa' },
  { code: 'SS12', mm: 3.1, scaleFactor: 2.2, description: 'Maxi cristal' },
  { code: 'SS16', mm: 3.9, scaleFactor: 2.8, description: 'Jumbo statement' },
]

export function getSizeByCode(code: string): GemSizeOption {
  return GEM_SIZES.find((s) => s.code === code) || GEM_SIZES[1]
}
