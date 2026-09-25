import { useGemsStore } from '../store/useGemsStore'
import { GemPropertiesEditor } from './GemPropertiesEditor'

interface GemInspectorPanelProps {
  isOpen: boolean
  onClose: () => void
}

export function GemInspectorPanel({ isOpen, onClose }: GemInspectorPanelProps) {
  const selectedGemId = useGemsStore((state) => state.selectedGemId)
  const gems = useGemsStore((state) => state.gems)

  if (!isOpen || !selectedGemId) return null

  const selectedGem = gems.find((g) => g.id === selectedGemId)
  if (!selectedGem) return null

  const toothNumber = selectedGem.toothId.replace('tooth-', '#')

  return (
    <aside className="absolute right-0 top-14 bottom-0 w-84 bg-slate-950/95 backdrop-blur-2xl border-l border-slate-800/90 shadow-2xl z-25 flex flex-col select-none overflow-hidden animate-in slide-in-from-right duration-200">
      {/* Encabezado del Panel */}
      <div className="h-12 px-4 border-b border-slate-800/80 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 3h12l4 6-10 12L2 9z" />
            </svg>
          </div>
          <div>
            <span className="font-semibold text-xs text-slate-100">Propiedades de Gema</span>
            <span className="text-[10px] text-cyan-400 font-mono ml-2">Diente {toothNumber}</span>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      {/* Contenido reutilizado con GemPropertiesEditor */}
      <div className="flex-1 overflow-y-auto p-4 text-xs text-slate-200">
        <GemPropertiesEditor showQuickActions={true} />
      </div>
    </aside>
  )
}
