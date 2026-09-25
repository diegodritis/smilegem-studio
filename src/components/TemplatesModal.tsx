import { useState } from 'react'
import { useGemsStore, type Gem } from '../store/useGemsStore'
import { useStudioStore, type BackgroundId } from '../store/useStudioStore'
import { DESIGN_PRESETS, type DesignPreset } from '../lib/gemPresets'

interface TemplatesModalProps {
  isOpen: boolean
  onClose: () => void
}

export function TemplatesModal({ isOpen, onClose }: TemplatesModalProps) {
  const setGems = useGemsStore((state) => state.setGems)
  const setBackgroundId = useStudioStore((state) => state.setBackgroundId)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  if (!isOpen) return null

  const categories = ['all', 'Minimal', 'Glamour', 'Avant-Garde']

  const filteredPresets = selectedCategory === 'all'
    ? DESIGN_PRESETS
    : DESIGN_PRESETS.filter((p) => p.category === selectedCategory)

  const handleApplyPreset = (preset: DesignPreset) => {
    // Generar IDs únicos para las gemas de la plantilla
    const instantiatedGems: Gem[] = preset.gems.map((g, idx) => ({
      ...g,
      id: `gem-preset-${Date.now()}-${idx}`,
    }))

    setGems(instantiatedGems)
    if (preset.backgroundId) {
      setBackgroundId(preset.backgroundId as BackgroundId)
    }
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-xl flex items-center justify-center p-4 select-none animate-in fade-in duration-200">
      <div className="w-full max-w-3xl bg-slate-900/95 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Cabecera del modal */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500/20 to-pink-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Galería de Plantillas & Diseños</h2>
              <p className="text-xs text-slate-400">Colecciones exclusivas creadas por expertos de The Gemist Hub Academy</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {/* Categorías */}
        <div className="px-5 py-2.5 bg-slate-950/60 border-b border-slate-800 flex items-center gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {cat === 'all' ? 'Todas las Colecciones' : cat}
            </button>
          ))}
        </div>

        {/* Grid de Plantillas */}
        <div className="flex-1 overflow-y-auto p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filteredPresets.map((preset) => (
            <div
              key={preset.id}
              className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 hover:border-cyan-500/50 transition-all flex flex-col justify-between gap-4 group"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-slate-800 text-cyan-300 border border-slate-700">
                    {preset.category}
                  </span>
                  <span className="text-xs font-mono text-slate-400">
                    {preset.gems.length} cristales
                  </span>
                </div>
                <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors">
                  {preset.name}
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  {preset.description}
                </p>
              </div>

              {/* Mapeo de gemas en la tarjeta */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {preset.gems.map((g, idx) => (
                  <span
                    key={idx}
                    className="w-4 h-4 rounded-full border border-slate-600 shadow-sm"
                    style={{ backgroundColor: g.color }}
                    title={`${g.shape} en ${g.toothId.replace('tooth-', '#')}`}
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={() => handleApplyPreset(preset)}
                className="w-full py-2.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500 text-cyan-300 hover:text-slate-950 text-xs font-bold border border-cyan-500/40 transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm"
              >
                <span>Cargar Plantilla en Lienzo</span>
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14" />
                  <path d="m12 5 7 7-7 7" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
