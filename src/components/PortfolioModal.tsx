import { useState, useEffect } from 'react'
import { useGemsStore } from '../store/useGemsStore'
import { useStudioStore, type BackgroundId } from '../store/useStudioStore'
import { useAuthStore } from '../store/useAuthStore'
import { getSavedDesigns, saveDesign, deleteDesign, type SavedDesign } from '../lib/designStorage'
import { exportClinicalTechnicalSheetPDF } from '../lib/gemExport'

interface PortfolioModalProps {
  isOpen: boolean
  onClose: () => void
  onOpenShowcase: (title: string) => void
}

export function PortfolioModal({ isOpen, onClose, onOpenShowcase }: PortfolioModalProps) {
  const gems = useGemsStore((state) => state.gems)
  const setGems = useGemsStore((state) => state.setGems)
  const backgroundId = useStudioStore((state) => state.backgroundId)
  const setBackgroundId = useStudioStore((state) => state.setBackgroundId)
  const artistProfile = useStudioStore((state) => state.artistProfile)
  const user = useAuthStore((state) => state.user)

  const [savedDesigns, setSavedDesigns] = useState<SavedDesign[]>([])
  const [activeTab, setActiveTab] = useState<'list' | 'save'>('list')
  const [toastMsg, setToastMsg] = useState<string | null>(null)

  // Formulario para guardar
  const [newTitle, setNewTitle] = useState('')
  const [newClient, setNewClient] = useState('')
  const [newNotes, setNewNotes] = useState('')
  const [isSavedSuccess, setIsSavedSuccess] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setSavedDesigns(getSavedDesigns())
      setIsSavedSuccess(false)
    }
  }, [isOpen])

  if (!isOpen) return null

  const showToast = (msg: string) => {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(null), 3000)
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTitle.trim()) return

    const saved = saveDesign({
      title: newTitle.trim(),
      clientName: newClient.trim() || 'Cliente General',
      notes: newNotes.trim() || 'Aplicación estética con grabado ácido y resina fluida',
      backgroundId,
      gems,
      isPublished: true,
    })

    setSavedDesigns((prev) => [saved, ...prev])
    setIsSavedSuccess(true)
    setTimeout(() => {
      setActiveTab('list')
      setIsSavedSuccess(false)
      setNewTitle('')
      setNewClient('')
      setNewNotes('')
    }, 1200)
  }

  const handleLoad = (design: SavedDesign) => {
    setGems(design.gems)
    if (design.backgroundId) {
      setBackgroundId(design.backgroundId as BackgroundId)
    }
    onClose()
  }

  const handleDelete = (id: string) => {
    deleteDesign(id)
    setSavedDesigns((prev) => prev.filter((d) => d.id !== id))
    showToast('Diseño eliminado del portafolio')
  }

  // Copiar enlace directo al portapapeles (Fase 17 & 13c)
  const handleShare = (design: SavedDesign) => {
    const url = `${window.location.origin}/?set=${design.id}`
    navigator.clipboard.writeText(url)
    showToast('✓ Link copiado al portapapeles')
  }

  // Exportar captura de alta resolución del canvas 3D (Render)
  const handleExportRender = () => {
    const canvas = document.querySelector('canvas')
    if (!canvas) return
    const dataUrl = canvas.toDataURL('image/png')
    const link = document.createElement('a')
    link.download = `smilegem-render-${Date.now()}.png`
    link.href = dataUrl
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    showToast('Render 3D descargado en PNG')
  }

  // Exportar Ficha Técnica en PDF profesional (Fase 17)
  const handleExportPDF = () => {
    exportClinicalTechnicalSheetPDF(gems, {
      clientName: newClient || 'Cliente General',
      technicianName: artistProfile.name,
      studioName: artistProfile.studioName,
      notes: newNotes || 'Aplicación estética no invasiva sobre esmalte dental.',
    })
    showToast('✓ Ficha técnica descargada en PDF')
  }

  // Exportar Ficha Técnica Clínica en archivo TXT imprimible
  const handleExportTechnicalSheetTXT = () => {
    const teethMap: Record<string, string[]> = {}
    gems.forEach((g) => {
      const toothFdi = g.toothId.replace('tooth-', '#')
      if (!teethMap[toothFdi]) teethMap[toothFdi] = []
      teethMap[toothFdi].push(`${g.shape} (${g.sizeCode || 'SS3'}, ${g.color})`)
    })

    let text = `SMILEGEM STUDIO - FICHA TÉCNICA CLÍNICA DE TOOTH GEMS\n`
    text += `=======================================================\n`
    text += `Fecha: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}\n`
    text += `Total de Cristales: ${gems.length}\n`
    text += `Piezas Involucradas: ${Object.keys(teethMap).join(', ')}\n\n`
    text += `DESGLOSE POR DIENTE:\n`
    text += `-------------------------------------------------------\n`
    Object.entries(teethMap).forEach(([tooth, list]) => {
      text += `Diente ${tooth}: ${list.join(', ')}\n`
    })
    text += `\nPROTOCOLO CLÍNICO RECOMENDADO:\n`
    text += `1. Aislamiento relativo con rollos de algodón y eyector.\n`
    text += `2. Profilaxis con pasta libre de flúor.\n`
    text += `3. Grabado ácido ortofosfórico al 37% durante 20-30 seg.\n`
    text += `4. Lavado y secado exhaustivo (esmalte aspecto tiza).\n`
    text += `5. Aplicación de adhesivo dental fotopolimerizable.\n`
    text += `6. Fotopolimerización de resina fluida durante 40 seg.\n`
    text += `=======================================================\n`

    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
    const link = document.createElement('a')
    link.download = `ficha-tecnica-smilegem-${Date.now()}.txt`
    link.href = URL.createObjectURL(blob)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    showToast('Ficha técnica descargada en TXT')
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-xl flex items-center justify-center p-4 select-none animate-in fade-in duration-200">
      <div className="w-full max-w-3xl bg-slate-900/95 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] relative">
        {/* Toast Notificación */}
        {toastMsg && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-slate-950 border border-cyan-400 text-cyan-200 px-4 py-2 rounded-xl text-xs font-semibold shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-top-2 z-50">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span>{toastMsg}</span>
          </div>
        )}

        {/* Cabecera del modal */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" />
                <path d="M6 6h10" />
                <path d="M6 10h10" />
              </svg>
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Portafolio & Sets Clínicos</h2>
              <p className="text-xs text-slate-400">Gestión de diseños para clientes y archivo técnico dental</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Pestañas */}
            <div className="flex bg-slate-950/80 p-0.5 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => setActiveTab('list')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  activeTab === 'list'
                    ? 'bg-cyan-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Mis Sets ({savedDesigns.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('save')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  activeTab === 'save'
                    ? 'bg-cyan-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                + Guardar Actual
              </button>
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
        </div>

        {/* Aviso sutil de login (Fase 13b) */}
        {!user && (
          <div className="px-5 py-2 bg-cyan-950/40 border-b border-cyan-800/40 flex items-center justify-between text-xs text-cyan-300">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              <span>Iniciá sesión para no perder tus diseños y sincronizarlos en la nube.</span>
            </div>
            <span className="text-[10px] text-slate-400">Modo local activo</span>
          </div>
        )}

        {/* Barra de utilidades de exportación */}
        <div className="px-5 py-2.5 bg-slate-950/60 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
          <span className="text-slate-400">
            Diseño activo: <span className="text-cyan-300 font-bold">{gems.length} cristales</span>
          </span>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={handleExportRender}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer text-xs"
            >
              <svg className="w-3.5 h-3.5 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>
                <circle cx="9" cy="9" r="2"/>
                <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
              </svg>
              <span>Render 3D</span>
            </button>

            {/* Exportar PDF Clínico con jsPDF (Fase 17) */}
            <button
              type="button"
              onClick={handleExportPDF}
              className="px-2.5 py-1 rounded-lg bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 border border-cyan-500/50 flex items-center gap-1.5 transition-colors cursor-pointer text-xs font-semibold"
            >
              <svg className="w-3.5 h-3.5 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
              </svg>
              <span>Ficha Técnica (PDF)</span>
            </button>

            <button
              type="button"
              onClick={handleExportTechnicalSheetTXT}
              className="px-2 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center gap-1 transition-colors cursor-pointer text-xs"
            >
              <span>TXT</span>
            </button>
          </div>
        </div>

        {/* Cuerpo del modal */}
        <div className="flex-1 overflow-y-auto p-5">
          {activeTab === 'list' ? (
            savedDesigns.length === 0 ? (
              <div className="py-12 text-center text-slate-500">
                <div className="w-12 h-12 mx-auto rounded-full bg-slate-800/60 border border-slate-700 flex items-center justify-center text-slate-400 mb-3">
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-slate-300">Aún no tienes sets guardados</p>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Crea tu combinación de gemas favorita y haz clic en "+ Guardar Actual" para conservarla en tu portafolio.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {savedDesigns.map((design) => (
                  <div
                    key={design.id}
                    className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-sm text-white truncate">{design.title}</span>
                        <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 border border-cyan-800/40 px-2 py-0.5 rounded-full">
                          {design.gems.length} cristales
                        </span>
                      </div>
                      <div className="text-xs text-slate-400 font-medium">Cliente: {design.clientName}</div>
                      <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                        {design.notes}
                      </p>
                      <div className="text-[10px] text-slate-600 mt-2 font-mono flex items-center justify-between">
                        <span>{new Date(design.createdAt).toLocaleDateString()}</span>
                        {design.isPublished && (
                          <span className="text-emerald-400 text-[9px] font-semibold uppercase tracking-wider">
                            Público
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 pt-2 border-t border-slate-800/60">
                      <button
                        type="button"
                        onClick={() => handleLoad(design)}
                        className="flex-1 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500 text-cyan-300 hover:text-slate-950 text-xs font-semibold border border-cyan-500/40 transition-colors cursor-pointer text-center"
                      >
                        Cargar
                      </button>

                      {/* Botón Compartir link público con toast (Fase 17) */}
                      <button
                        type="button"
                        onClick={() => handleShare(design)}
                        title="Copiar link público para compartir"
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-cyan-300 border border-slate-700 transition-colors cursor-pointer"
                      >
                        <svg className="w-4 h-4 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="18" cy="5" r="3"/>
                          <circle cx="6" cy="12" r="3"/>
                          <circle cx="18" cy="19" r="3"/>
                          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
                          <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                        </svg>
                      </button>

                      <button
                        type="button"
                        onClick={() => onOpenShowcase(design.title)}
                        title="Ver como cliente (Página pública)"
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
                      >
                        <svg className="w-4 h-4 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
                          <circle cx="12" cy="12" r="3"/>
                        </svg>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(design.id)}
                        title="Eliminar de portafolio"
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-950/60 text-slate-400 hover:text-red-400 transition-colors cursor-pointer"
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M3 6h18"/>
                          <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            <form onSubmit={handleSave} className="space-y-4 max-w-lg mx-auto">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Nombre del Diseño / Set
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Starry Canine Duo, Bridal Crystal Arch..."
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Nombre del Cliente
                </label>
                <input
                  type="text"
                  placeholder="Ej: Sofia Gómez"
                  value={newClient}
                  onChange={(e) => setNewClient(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Notas Técnicas y Adhesivo
                </label>
                <textarea
                  rows={3}
                  placeholder="Tipo de adhesivo utilizado, indicaciones post-cuidado, garantía..."
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-400 resize-none"
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-400 flex items-center justify-between font-mono">
                <span>Gemas a guardar en este set:</span>
                <span className="text-cyan-400 font-bold">{gems.length} cristales</span>
              </div>

              {isSavedSuccess && (
                <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500 text-emerald-200 text-xs font-medium text-center">
                  ¡Diseño guardado exitosamente en tu portafolio!
                </div>
              )}

              <button
                type="submit"
                disabled={gems.length === 0}
                className={`w-full py-3 rounded-xl font-bold text-sm transition-all cursor-pointer ${
                  gems.length > 0
                    ? 'bg-gradient-to-r from-cyan-500 to-sky-400 text-slate-950 hover:opacity-95 shadow-lg shadow-cyan-950'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
              >
                Guardar en Portafolio
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
