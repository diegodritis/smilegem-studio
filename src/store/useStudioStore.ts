import { create } from 'zustand'

export type BackgroundId = 'dark' | 'neutral' | 'warm' | 'light'

export interface BackgroundOption {
  id: BackgroundId
  label: string
  description: string
  gradientClass: string
  color: string
}

export const BACKGROUND_OPTIONS: BackgroundOption[] = [
  {
    id: 'dark',
    label: 'Estudio Oscuro',
    description: 'Fondo carbón mate de alto contraste',
    gradientClass: 'from-[#172033] via-[#0b0e16] to-[#04060a]',
    color: '#0b0e16',
  },
  {
    id: 'neutral',
    label: 'Gris Neutro',
    description: 'Estudio profesional balanceado',
    gradientClass: 'from-[#2b3342] via-[#1b212c] to-[#0f131a]',
    color: '#1b212c',
  },
  {
    id: 'warm',
    label: 'Nude Cosmético',
    description: 'Tono labial cálido estético',
    gradientClass: 'from-[#342229] via-[#1f1418] to-[#0e080b]',
    color: '#1f1418',
  },
  {
    id: 'light',
    label: 'Luz Clínica',
    description: 'Fondo claro brillante de consulta',
    gradientClass: 'from-[#f1f5f9] via-[#e2e8f0] to-[#cbd5e1]',
    color: '#e2e8f0',
  },
]

export type StudioViewMode = '3d' | 'dual' | 'odontogram'
export type DentalArchSelection = 'upper' | 'lower' | 'both'
export type CameraPreset = 'frontal' | 'left' | 'right' | 'closeUp' | 'orbit'
export type LightingPreset = 'studio' | 'ringlight' | 'clinical' | 'cyber'
export type LipShade = 'nude' | 'ruby' | 'gloss' | 'none'

export interface ArtistProfile {
  name: string
  handle: string
  whatsapp: string
  currency: string
  studioName: string
}

export interface StudioState {
  // Viewport Settings
  autoRotate: boolean
  showGrid: boolean
  backgroundId: BackgroundId
  customBackgroundUrl: string | null
  viewMode: StudioViewMode
  activeArch: DentalArchSelection
  cameraPreset: CameraPreset
  lightingPreset: LightingPreset
  showLips: boolean
  lipShade: LipShade
  artistProfile: ArtistProfile
  panOffset: [number, number]
  isPanning: boolean

  // Actions
  setAutoRotate: (enabled: boolean) => void
  toggleAutoRotate: () => void
  toggleGrid: () => void
  setBackgroundId: (id: BackgroundId) => void
  setCustomBackgroundUrl: (url: string | null) => void
  setViewMode: (mode: StudioViewMode) => void
  setActiveArch: (arch: DentalArchSelection) => void
  setCameraPreset: (preset: CameraPreset) => void
  setLightingPreset: (lighting: LightingPreset) => void
  setShowLips: (show: boolean) => void
  setLipShade: (shade: LipShade) => void
  updateArtistProfile: (profile: Partial<ArtistProfile>) => void
  setPanOffset: (offset: [number, number] | ((prev: [number, number]) => [number, number])) => void
  resetPanOffset: () => void
  setIsPanning: (panning: boolean) => void
}

export const useStudioStore = create<StudioState>((set) => ({
  autoRotate: false,
  showGrid: false,
  backgroundId: 'dark',
  customBackgroundUrl: null,
  viewMode: '3d',
  activeArch: 'upper',
  cameraPreset: 'frontal',
  lightingPreset: 'studio',
  showLips: false,
  lipShade: 'nude',
  panOffset: [0, 0],
  isPanning: false,

  artistProfile: {
    name: 'SmileGem Master Artist',
    handle: '@smilegemstudio',
    whatsapp: '+5491123456789',
    currency: 'USD',
    studioName: 'SmileGem Tooth Studio',
  },

  setAutoRotate: (enabled) => set({ autoRotate: enabled }),
  toggleAutoRotate: () => set((state) => ({ autoRotate: !state.autoRotate })),
  toggleGrid: () => set((state) => ({ showGrid: !state.showGrid })),
  setBackgroundId: (id) => set({ backgroundId: id }),
  setCustomBackgroundUrl: (url) => set({ customBackgroundUrl: url }),
  setViewMode: (mode) => set({ viewMode: mode }),
  setActiveArch: (arch) => set({ activeArch: arch }),
  setCameraPreset: (preset) => set({ cameraPreset: preset }),
  setLightingPreset: (lighting) => set({ lightingPreset: lighting }),
  setShowLips: (show) => set({ showLips: show }),
  setLipShade: (shade) => set({ lipShade: shade, showLips: shade !== 'none' }),
  updateArtistProfile: (profile) =>
    set((state) => ({ artistProfile: { ...state.artistProfile, ...profile } })),
  setPanOffset: (offset) =>
    set((state) => ({
      panOffset: typeof offset === 'function' ? offset(state.panOffset) : offset,
    })),
  resetPanOffset: () => set({ panOffset: [0, 0] }),
  setIsPanning: (panning) => set({ isPanning: panning }),
}))
