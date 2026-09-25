import { useGemsStore } from '../store/useGemsStore'
import { useStudioStore } from '../store/useStudioStore'

interface ClientShowcaseModalProps {
  isOpen: boolean
  onClose: () => void
  designTitle?: string
}

export function ClientShowcaseModal({ isOpen, onClose, designTitle }: ClientShowcaseModalProps) {
  const gems = useGemsStore((state) => state.gems)
  const artistProfile = useStudioStore((state) => state.artistProfile)

  if (!isOpen) return null

  // Calcular piezas involucradas
  const teethNumbers = Array.from(new Set(gems.map((g) => g.toothId.replace('tooth-', '#'))))

  const waMessage = encodeURIComponent(
    `Hola ${artistProfile.name}! Vi el diseño "${designTitle || 'Custom Tooth Gem Set'}" en SmileGem Studio y me gustaría agendar una cita.`
  )
  const waUrl = `https://wa.me/${artistProfile.whatsapp.replace(/\D/g, '')}?text=${waMessage}`

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-xl flex items-center justify-center p-4 select-none animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-slate-900/95 border border-cyan-500/30 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Banner Superior Estilo Lookbook */}
        <div className="relative p-6 bg-gradient-to-r from-cyan-950/80 via-slate-900 to-sky-950/80 border-b border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                Showcase Público Oficial
              </span>
              <span className="text-[10px] text-slate-400 font-mono">{artistProfile.handle}</span>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors cursor-pointer"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          <h2 className="text-xl font-bold text-white tracking-tight">
            {designTitle || 'Custom Tooth Gem Set'}
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            Diseño digitalizado en 3D de alta definición creado por {artistProfile.name} ({artistProfile.studioName}).
          </p>
        </div>

        {/* Detalles del Set */}
        <div className="p-6 space-y-6">
          {/* Métricas clave */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Gemas Totales</div>
              <div className="text-xl font-bold text-cyan-400 font-mono mt-0.5">{gems.length} cristales</div>
            </div>
            <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Piezas Dentales</div>
              <div className="text-sm font-bold text-white font-mono mt-1 truncate">
                {teethNumbers.length > 0 ? teethNumbers.join(', ') : 'Ninguna'}
              </div>
            </div>
            <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Durabilidad Est.</div>
              <div className="text-sm font-bold text-emerald-400 font-mono mt-1">6 a 24 meses</div>
            </div>
          </div>

          {/* Calidad de materiales */}
          <div className="p-4 rounded-2xl bg-slate-950/50 border border-slate-800/80 space-y-2">
            <div className="text-xs font-semibold text-slate-200">Garantía de Aplicación Dental</div>
            <div className="grid grid-cols-2 gap-2 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                <span>Adhesivo médico fotopolimerizable</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                <span>Cristales certificados de grado dental</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                <span>100% no invasivo (sin perforar esmalte)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                <span>Removible sin daño por odontólogo</span>
              </div>
            </div>
          </div>

          {/* CTA Principal de Conversión para Clientes */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:flex-1 py-3 px-5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/50 hover:opacity-95 transition-opacity cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
              </svg>
              <span>Agendar Cita con {artistProfile.name} (WhatsApp)</span>
            </a>

            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto py-3 px-5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs transition-colors cursor-pointer"
            >
              Volver al Estudio
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
