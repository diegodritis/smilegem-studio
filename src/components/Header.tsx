import { useState, useRef, useEffect } from 'react'
import {
  useStudioStore,
  BACKGROUND_OPTIONS,
  type BackgroundId,
  type DentalArchSelection,
} from '../store/useStudioStore'
import { useGemsStore } from '../store/useGemsStore'
import { useAuthStore } from '../store/useAuthStore'
import { GemPropertiesEditor } from './GemPropertiesEditor'

type OpenDropdown = 'teeth' | 'gems' | 'background' | 'user' | null

interface HeaderProps {
  onOpenPortfolio: () => void
  onOpenTemplates: () => void
  onOpenShowcase: () => void
  onOpenSettings: () => void
  onOpenAuth: () => void
}

export function Header({
  onOpenPortfolio,
  onOpenTemplates,
  onOpenShowcase,
  onOpenSettings,
  onOpenAuth,
}: HeaderProps) {
  const {
    backgroundId,
    setBackgroundId,
    customBackgroundUrl,
    setCustomBackgroundUrl,
    viewMode,
    setViewMode,
    activeArch,
    setActiveArch,
  } = useStudioStore()
  const { user, signOut } = useAuthStore()
  const {
    activeSizeCode,
    activeColor,
    history,
    future,
    undo,
    redo,
  } = useGemsStore()

  const [openDropdown, setOpenDropdown] = useState<OpenDropdown>(null)
  const headerRef = useRef<HTMLElement>(null)
  const bgFileInputRef = useRef<HTMLInputElement>(null)

  const activeBg = BACKGROUND_OPTIONS.find((bg) => bg.id === backgroundId) || BACKGROUND_OPTIONS[0]

  // Cerrar cualquier dropdown al hacer clic fuera del header
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (headerRef.current && !headerRef.current.contains(event.target as Node)) {
        setOpenDropdown(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Atajos de teclado globales para Undo / Redo
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault()
        if (e.shiftKey) {
          redo()
        } else {
          undo()
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault()
        redo()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [undo, redo])

  const toggleDropdown = (key: OpenDropdown) => {
    setOpenDropdown((current) => (current === key ? null : key))
  }

  return (
    <header
      ref={headerRef}
      className="h-14 w-full border-b border-slate-800/90 bg-slate-950/85 backdrop-blur-xl px-3 sm:px-4 flex items-center justify-between select-none z-30"
    >
      {/* 1. SECCIÓN IZQUIERDA: Marca + Deshacer/Rehacer */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Logo de la aplicación */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500/25 via-sky-500/10 to-transparent border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-sm shadow-cyan-950">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 3h12l4 6-10 12L2 9z"/>
              <path d="M11 3 8 9l4 12 4-12-3-6"/>
              <path d="M2 9h20"/>
            </svg>
          </div>
          <div className="hidden md:block">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-sm tracking-tight text-slate-100">SmileGem Studio</span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-800/50">PRO</span>
            </div>
          </div>
        </div>

        {/* Separador vertical */}
        <div className="h-5 w-px bg-slate-800/90 mx-0.5" />

        {/* Botones Deshacer / Rehacer conectados al motor temporal */}
        <div className="flex items-center gap-0.5 bg-slate-900/60 p-0.5 rounded-lg border border-slate-800/70">
          <button
            type="button"
            onClick={undo}
            disabled={history.length === 0}
            title={history.length > 0 ? `Deshacer (Ctrl+Z) · ${history.length} estados` : 'Deshacer (sin historial)'}
            className={`p-1.5 rounded-md transition-colors ${
              history.length > 0
                ? 'text-slate-200 hover:text-white hover:bg-slate-800 cursor-pointer'
                : 'text-slate-600 opacity-40 cursor-not-allowed'
            }`}
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 14 4 9l5-5"/>
              <path d="M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5a5.5 5.5 0 0 1-5.5 5.5H11"/>
            </svg>
          </button>
          <button
            type="button"
            onClick={redo}
            disabled={future.length === 0}
            title={future.length > 0 ? `Rehacer (Ctrl+Y) · ${future.length} estados` : 'Rehacer (sin rehacer)'}
            className={`p-1.5 rounded-md transition-colors ${
              future.length > 0
                ? 'text-slate-200 hover:text-white hover:bg-slate-800 cursor-pointer'
                : 'text-slate-600 opacity-40 cursor-not-allowed'
            }`}
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m15 14 5-5-5-5"/>
              <path d="M20 9H9.5A5.5 5.5 0 0 0 4 14.5A5.5 5.5 0 0 0 9.5 20H13"/>
            </svg>
          </button>
        </div>
      </div>

      {/* 2. SECCIÓN CENTRAL: Segmented Toolbar estilo Figma */}
      <div className="flex items-center gap-1 bg-slate-900/60 p-1 rounded-xl border border-slate-800/80 shadow-inner">
        {/* DROPDOWN: TEETH (Arcada Superior, Inferior, Ambas) */}
        <div className="relative">
          <button
            type="button"
            onClick={() => toggleDropdown('teeth')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              openDropdown === 'teeth'
                ? 'bg-slate-800 text-cyan-300 shadow-sm'
                : 'text-slate-300 hover:text-slate-100 hover:bg-slate-800/60'
            }`}
          >
            <svg className="w-3.5 h-3.5 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2C8.5 2 6 4.5 6 8c0 3.5 1.5 8 3 13 1 1 2 1 3-1 1 2 2 2 3 1 1.5-5 3-9.5 3-13 0-3.5-2.5-6-6-6z"/>
            </svg>
            <span className="hidden sm:inline capitalize">
              {activeArch === 'upper' ? 'Arcada Superior' : activeArch === 'lower' ? 'Arcada Inferior' : 'Boca Completa'}
            </span>
            <svg className={`w-3 h-3 text-slate-400 transition-transform duration-200 ${openDropdown === 'teeth' ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m6 9 6 6 6-6"/>
            </svg>
          </button>

          {openDropdown === 'teeth' && (
            <div className="absolute left-0 mt-2 w-60 rounded-xl bg-slate-900/95 backdrop-blur-2xl border border-slate-700/90 shadow-2xl py-1.5 z-50 text-slate-200">
              <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-800/80">
                Modelo Anatómico Activo
              </div>
              <div className="p-1 space-y-1">
                {[
                  { id: 'upper', label: 'Arcada Superior', desc: '14 piezas anatómicas (#11-#27)' },
                  { id: 'lower', label: 'Arcada Inferior', desc: '14 piezas anatómicas (#31-#47)' },
                  { id: 'both', label: 'Boca Completa (Ambas)', desc: '28 piezas con oclusión dental' },
                ].map((archOpt) => {
                  const isSel = activeArch === archOpt.id
                  return (
                    <button
                      key={archOpt.id}
                      type="button"
                      onClick={() => {
                        setActiveArch(archOpt.id as DentalArchSelection)
                        setOpenDropdown(null)
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-left text-xs transition-colors cursor-pointer ${
                        isSel
                          ? 'bg-cyan-950/70 text-cyan-200 border border-cyan-800/60'
                          : 'hover:bg-slate-800/70 text-slate-300 hover:text-white'
                      }`}
                    >
                      <div>
                        <div className="font-medium">{archOpt.label}</div>
                        <div className="text-[10px] text-slate-400">{archOpt.desc}</div>
                      </div>
                      {isSel && (
                        <svg className="w-3.5 h-3.5 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        <div className="h-4 w-px bg-slate-800" />

        {/* DROPDOWN: GEMS */}
        <div className="relative">
          <button
            type="button"
            onClick={() => toggleDropdown('gems')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              openDropdown === 'gems'
                ? 'bg-slate-800 text-sky-300 shadow-sm'
                : 'text-slate-300 hover:text-slate-100 hover:bg-slate-800/60'
            }`}
          >
            <svg className="w-3.5 h-3.5 text-sky-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 3h12l4 6-10 12L2 9z"/>
            </svg>
            <span className="hidden sm:inline">Gems</span>
            <div className="flex items-center gap-1">
              <span
                className="w-2.5 h-2.5 rounded-full border border-slate-500 shadow-inner"
                style={{ backgroundColor: activeColor }}
              />
              <span className="font-mono text-[10px] text-cyan-300">{activeSizeCode}</span>
            </div>
            <svg className={`w-3 h-3 text-slate-400 transition-transform duration-200 ${openDropdown === 'gems' ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m6 9 6 6 6-6"/>
            </svg>
          </button>

          {openDropdown === 'gems' && (
            <div className="absolute left-0 mt-2 w-84 sm:w-90 max-h-[82vh] overflow-y-auto rounded-2xl bg-slate-950/95 backdrop-blur-2xl border border-slate-700/90 shadow-2xl p-4 z-50 text-slate-200">
              <GemPropertiesEditor
                showQuickActions={true}
                onActionCompleted={() => {}}
              />
            </div>
          )}
        </div>

        <div className="h-4 w-px bg-slate-800" />

        {/* DROPDOWN: BACKGROUND */}
        <div className="relative">
          <button
            type="button"
            onClick={() => toggleDropdown('background')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              openDropdown === 'background'
                ? 'bg-slate-800 text-slate-100 shadow-sm'
                : 'text-slate-300 hover:text-slate-100 hover:bg-slate-800/60'
            }`}
          >
            <span
              className="w-3 h-3 rounded-full border border-slate-600/80 shadow-inner"
              style={{ backgroundColor: activeBg.color }}
            />
            <span className="hidden md:inline font-semibold text-slate-200">{activeBg.label}</span>
            <svg className={`w-3 h-3 text-slate-400 transition-transform duration-200 ${openDropdown === 'background' ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m6 9 6 6 6-6"/>
            </svg>
          </button>

          {openDropdown === 'background' && (
            <div className="absolute left-0 mt-2 w-64 rounded-xl bg-slate-900/95 backdrop-blur-2xl border border-slate-700/90 shadow-2xl py-1.5 z-50 text-slate-200">
              <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-800/80 flex items-center justify-between">
                <span>Fondo de Lienzo</span>
                {customBackgroundUrl && (
                  <span className="text-cyan-400 font-mono text-[9px]">Fondo Propio</span>
                )}
              </div>
              <div className="p-1 space-y-0.5">
                {BACKGROUND_OPTIONS.map((option) => {
                  const isSelected = option.id === backgroundId && !customBackgroundUrl
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => {
                        setBackgroundId(option.id as BackgroundId)
                        setCustomBackgroundUrl(null)
                        setOpenDropdown(null)
                      }}
                      className={`w-full flex items-center gap-3 px-2.5 py-2 rounded-lg text-left text-xs transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-cyan-950/60 text-cyan-200 border border-cyan-800/60'
                          : 'hover:bg-slate-800/70 text-slate-300 hover:text-slate-100'
                      }`}
                    >
                      <span
                        className="w-4 h-4 rounded-full border border-slate-600/80 shrink-0 shadow-sm"
                        style={{ backgroundColor: option.color }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-xs truncate">{option.label}</div>
                        <div className="text-[10px] text-slate-400 truncate">{option.description}</div>
                      </div>
                      {isSelected && (
                        <svg className="w-4 h-4 text-cyan-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                      )}
                    </button>
                  )
                })}

                <div className="h-px bg-slate-800 my-1" />

                {/* Subir fondo propio (Fase 17) */}
                <input
                  ref={bgFileInputRef}
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      const reader = new FileReader()
                      reader.onload = (ev) => {
                        const url = ev.target?.result as string
                        if (url) {
                          setCustomBackgroundUrl(url)
                          setOpenDropdown(null)
                        }
                      }
                      reader.readAsDataURL(file)
                    }
                    e.target.value = ''
                  }}
                />

                <button
                  type="button"
                  onClick={() => bgFileInputRef.current?.click()}
                  className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-left text-xs text-cyan-300 hover:bg-slate-800/80 transition-colors cursor-pointer font-medium"
                >
                  <svg className="w-4 h-4 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>
                    <circle cx="9" cy="9" r="2"/>
                    <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
                  </svg>
                  <span>Subir imagen de fondo...</span>
                </button>

                {customBackgroundUrl && (
                  <button
                    type="button"
                    onClick={() => {
                      setCustomBackgroundUrl(null)
                      setOpenDropdown(null)
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left text-[11px] text-red-400 hover:bg-red-950/40 transition-colors cursor-pointer"
                  >
                    <span>× Quitar fondo personalizado</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="h-4 w-px bg-slate-800" />

        {/* SELECTOR DE VISTA: 3D / DUAL / ODONTOGRAMA (Fase 9) */}
        <div className="flex items-center bg-slate-950/70 p-0.5 rounded-lg border border-slate-800">
          <button
            type="button"
            onClick={() => setViewMode('3d')}
            title="Vista 3D Exclusiva"
            className={`px-2 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
              viewMode === '3d'
                ? 'bg-cyan-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            3D
          </button>
          <button
            type="button"
            onClick={() => setViewMode('dual')}
            title="Vista Dual (3D + Odontograma Técnico)"
            className={`px-2 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
              viewMode === 'dual'
                ? 'bg-cyan-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Dual
          </button>
          <button
            type="button"
            onClick={() => setViewMode('odontogram')}
            title="Vista Técnica Odontograma 2D"
            className={`px-2 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
              viewMode === 'odontogram'
                ? 'bg-cyan-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            2D
          </button>
        </div>
      </div>

      {/* 3. SECCIÓN DERECHA: Plantillas, Portafolio, Showcase & Ajustes */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Botón Plantillas (Fase 10) */}
        <button
          type="button"
          onClick={onOpenTemplates}
          title="Galería de Plantillas Prediseñadas"
          className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <svg className="w-3.5 h-3.5 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
          </svg>
          <span className="hidden lg:inline">Plantillas</span>
        </button>

        {/* Botón Portafolio & Sets (Fase 11) */}
        <button
          type="button"
          onClick={onOpenPortfolio}
          title="Portafolio de Sets y Diseños Guardados"
          className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <svg className="w-3.5 h-3.5 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" />
          </svg>
          <span className="hidden lg:inline">Portafolio</span>
        </button>

        {/* Botón Showcase Público del Artista (Fase 12) */}
        <button
          type="button"
          onClick={onOpenShowcase}
          title="Vista de Cliente / Página Pública"
          className="px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-emerald-500/20 to-teal-500/20 hover:from-emerald-500/30 hover:to-teal-500/30 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
        >
          <svg className="w-3.5 h-3.5 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
            <circle cx="12" cy="12" r="3"/>
          </svg>
          <span className="hidden sm:inline">Página Pública</span>
        </button>

        {/* Botón de Ajustes de Estudio */}
        <button
          type="button"
          onClick={onOpenSettings}
          title="Ajustes de Estudio 3D (Iluminación, Labios, Cámara)"
          className="p-2 rounded-lg text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 transition-colors cursor-pointer"
        >
          <svg className="w-4 h-4 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
            <circle cx="12" cy="12" r="3"/>
          </svg>
        </button>

        <div className="h-5 w-px bg-slate-800 my-auto" />

        {/* 4. Autenticación y Perfil de Usuario (Fase 13a) */}
        {!user ? (
          <button
            type="button"
            onClick={onOpenAuth}
            title="Iniciar Sesión para guardar diseños en la nube"
            className="px-2.5 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/50 text-cyan-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            <span className="hidden sm:inline">Iniciar Sesión</span>
          </button>
        ) : (
          <div className="relative">
            <button
              type="button"
              onClick={() => toggleDropdown('user')}
              title="Cuenta de usuario activa"
              className="px-2 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <span className="w-5 h-5 rounded-full bg-cyan-500 text-slate-950 font-bold text-[10px] flex items-center justify-center">
                {user.email.slice(0, 1).toUpperCase()}
              </span>
              <span className="hidden md:inline max-w-[100px] truncate text-slate-200">
                {user.name || user.email.split('@')[0]}
              </span>
              <svg className={`w-3 h-3 text-slate-400 transition-transform duration-200 ${openDropdown === 'user' ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>

            {openDropdown === 'user' && (
              <div className="absolute right-0 mt-2 w-60 rounded-xl bg-slate-900/95 backdrop-blur-2xl border border-slate-700 shadow-2xl py-1 z-50 text-slate-200 text-xs">
                <div className="px-3 py-2 border-b border-slate-800">
                  <div className="font-semibold truncate">{user.name || 'Artista Dental'}</div>
                  <div className="text-[10px] text-slate-400 truncate">{user.email}</div>
                  <div className="mt-1 flex items-center gap-1 text-[10px] text-emerald-400 font-mono">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Nube Sincronizada</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    signOut()
                    setOpenDropdown(null)
                  }}
                  className="w-full px-3 py-2 text-left text-red-400 hover:bg-slate-800/80 flex items-center gap-2 cursor-pointer transition-colors"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                  <span>Cerrar sesión</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  )
}
