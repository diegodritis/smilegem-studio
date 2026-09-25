import { useStudioStore, type DentalArchSelection, type CameraPreset, type LightingPreset, type LipShade } from '../store/useStudioStore'

interface StudioSettingsModalProps {
  isOpen: boolean
  onClose: () => void
}

export function StudioSettingsModal({ isOpen, onClose }: StudioSettingsModalProps) {
  const {
    activeArch,
    setActiveArch,
    cameraPreset,
    setCameraPreset,
    lightingPreset,
    setLightingPreset,
    lipShade,
    setLipShade,
    autoRotate,
    toggleAutoRotate,
    artistProfile,
    updateArtistProfile,
  } = useStudioStore()

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-xl flex items-center justify-center p-4 select-none animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-slate-900/95 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh]">
        {/* Cabecera */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-cyan-400">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Ajustes de Estudio 3D</h2>
              <p className="text-xs text-slate-400">Configuración visual, iluminación y perfil profesional</p>
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

        {/* Contenido scrolleable */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs text-slate-200">
          {/* 1. Arcada Dental Activa */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-2">
              Arcada Dental en Pantalla
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'upper', label: 'Superior (14)', desc: 'Maxilar' },
                { id: 'lower', label: 'Inferior (14)', desc: 'Mandíbula' },
                { id: 'both', label: 'Ambas (28)', desc: 'Oclusión Completa' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setActiveArch(opt.id as DentalArchSelection)}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                    activeArch === opt.id
                      ? 'bg-cyan-950/80 border-cyan-400 text-cyan-200 shadow-sm'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  <div className="font-semibold text-xs">{opt.label}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">{opt.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* 2. Iluminación de Estudio */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-2">
              Iluminación Fotográfica de Cristales
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'studio', label: 'Estudio Softbox', desc: 'Luz difusa profesional y brillo balanceado' },
                { id: 'ringlight', label: 'Ring Light Dental', desc: 'Reflejos circulares nítidos y alto destello' },
                { id: 'clinical', label: 'Luz Clínica 5500K', desc: 'Alto CRI neutral para fidelidad de color' },
                { id: 'cyber', label: 'Cyber Neon Glam', desc: 'Luces cian y magenta de alto impacto visual' },
              ].map((light) => (
                <button
                  key={light.id}
                  type="button"
                  onClick={() => setLightingPreset(light.id as LightingPreset)}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                    lightingPreset === light.id
                      ? 'bg-cyan-950/80 border-cyan-400 text-cyan-200'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="font-semibold text-xs">{light.label}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">{light.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* 3. Marco de Labios / Smile Framing */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-2">
              Encuadre de Sonrisa (Labios Anatómicos 3D)
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { id: 'none', label: 'Sin Labios', color: '#1e293b' },
                { id: 'nude', label: 'Nude Gloss', color: '#c07a70' },
                { id: 'ruby', label: 'Rojo Pasión', color: '#991b1b' },
                { id: 'gloss', label: 'Rosa Neón', color: '#db2777' },
              ].map((lip) => (
                <button
                  key={lip.id}
                  type="button"
                  onClick={() => setLipShade(lip.id as LipShade)}
                  className={`p-2 rounded-xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                    lipShade === lip.id
                      ? 'bg-cyan-950/80 border-cyan-400 text-cyan-200'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <span
                    className="w-4 h-4 rounded-full border border-slate-600 shadow-sm"
                    style={{ backgroundColor: lip.color }}
                  />
                  <span className="text-[10px] font-medium">{lip.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 4. Perspectiva de Cámara & Turntable */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-300">
                Ángulo de Cámara & Inspección
              </label>
              <button
                type="button"
                onClick={toggleAutoRotate}
                className={`px-2 py-0.5 rounded-full text-[10px] font-mono border transition-colors cursor-pointer ${
                  autoRotate
                    ? 'bg-cyan-500 text-slate-950 font-bold border-cyan-400'
                    : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                }`}
              >
                Turntable: {autoRotate ? 'ON' : 'OFF'}
              </button>
            </div>
            <div className="grid grid-cols-5 gap-1.5 font-mono text-[10px]">
              {[
                { id: 'frontal', label: 'Frontal' },
                { id: 'left', label: 'Perfil Izq' },
                { id: 'right', label: 'Perfil Der' },
                { id: 'closeUp', label: 'Zoom Macro' },
                { id: 'orbit', label: 'Órbita 3D' },
              ].map((cam) => (
                <button
                  key={cam.id}
                  type="button"
                  onClick={() => setCameraPreset(cam.id as CameraPreset)}
                  className={`py-2 rounded-lg border text-center transition-colors cursor-pointer ${
                    cameraPreset === cam.id
                      ? 'bg-cyan-500 text-slate-950 font-bold border-cyan-400 shadow-sm'
                      : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  {cam.label}
                </button>
              ))}
            </div>
          </div>

          {/* 5. Perfil del Artista */}
          <div className="pt-2 border-t border-slate-800/80 space-y-3">
            <label className="text-xs font-semibold text-slate-300 block">
              Datos Profesionales del Artista
            </label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-[10px] text-slate-500 block mb-1">Nombre o Estudio</span>
                <input
                  type="text"
                  value={artistProfile.name}
                  onChange={(e) => updateArtistProfile({ name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                />
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block mb-1">Instagram (@usuario)</span>
                <input
                  type="text"
                  value={artistProfile.handle}
                  onChange={(e) => updateArtistProfile({ handle: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                />
              </div>
              <div className="col-span-2">
                <span className="text-[10px] text-slate-500 block mb-1">WhatsApp para Reservas</span>
                <input
                  type="text"
                  value={artistProfile.whatsapp}
                  onChange={(e) => updateArtistProfile({ whatsapp: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
