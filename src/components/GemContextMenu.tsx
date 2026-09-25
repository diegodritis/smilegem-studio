import { useEffect, useRef } from 'react'
import { useGemsStore } from '../store/useGemsStore'
import { useStudioStore } from '../store/useStudioStore'
import { exportGemAsPNG } from '../lib/gemExport'

export function GemContextMenu() {
  const contextMenu = useGemsStore((state) => state.contextMenu)
  const closeContextMenu = useGemsStore((state) => state.closeContextMenu)
  const selectedGemId = useGemsStore((state) => state.selectedGemId)
  const selectedGemIds = useGemsStore((state) => state.selectedGemIds)
  const gems = useGemsStore((state) => state.gems)
  const clipboardGem = useGemsStore((state) => state.clipboardGem)

  const duplicateGem = useGemsStore((state) => state.duplicateGem)
  const duplicateSelectedGems = useGemsStore((state) => state.duplicateSelectedGems)
  const copyGem = useGemsStore((state) => state.copyGem)
  const pasteGem = useGemsStore((state) => state.pasteGem)
  const flipGemHorizontal = useGemsStore((state) => state.flipGemHorizontal)
  const flipGemVertical = useGemsStore((state) => state.flipGemVertical)
  const removeGem = useGemsStore((state) => state.removeGem)
  const removeSelectedGems = useGemsStore((state) => state.removeSelectedGems)
  const clearGems = useGemsStore((state) => state.clearGems)

  const panOffset = useStudioStore((state) => state.panOffset)
  const resetPanOffset = useStudioStore((state) => state.resetPanOffset)
  const activeArch = useStudioStore((state) => state.activeArch)
  const setActiveArch = useStudioStore((state) => state.setActiveArch)
  const setCameraPreset = useStudioStore((state) => state.setCameraPreset)

  const menuRef = useRef<HTMLDivElement>(null)

  // Cerrar al hacer clic fuera o presionar Escape
  useEffect(() => {
    if (!contextMenu?.isOpen) return

    const handlePointerDown = (e: PointerEvent | MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        closeContextMenu()
      }
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeContextMenu()
      }
    }

    window.addEventListener('pointerdown', handlePointerDown)
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('pointerdown', handlePointerDown)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [contextMenu?.isOpen, closeContextMenu])

  if (!contextMenu?.isOpen) return null

  const isMulti = selectedGemIds.length > 1
  const selectedGem = gems.find((g) => g.id === selectedGemId)
  const hasGemSelected = !!selectedGemId && (!!selectedGem || isMulti)
  const isPanned = Math.abs(panOffset[0]) > 0.01 || Math.abs(panOffset[1]) > 0.01

  const clampedX = Math.min(Math.max(12, contextMenu.x), window.innerWidth - 240)
  const clampedY = Math.min(Math.max(12, contextMenu.y), window.innerHeight - 380)

  return (
    <div
      ref={menuRef}
      role="menu"
      aria-label="Menú contextual"
      className="fixed z-60 w-56 rounded-xl bg-slate-950/95 backdrop-blur-2xl border border-slate-700/90 shadow-2xl p-1 text-slate-200 text-xs select-none animate-in fade-in zoom-in-95 duration-100"
      style={{
        left: `${clampedX}px`,
        top: `${clampedY}px`,
      }}
      onContextMenu={(e) => {
        e.preventDefault()
        e.stopPropagation()
      }}
    >
      {hasGemSelected ? (
        /* ==================== MODO 1: GEMA SELECCIONADA ==================== */
        <>
          <div className="px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-800/80 mb-1 flex items-center justify-between">
            <span>{isMulti ? `Grupo (${selectedGemIds.length} gemas)` : 'Opciones de Gema'}</span>
            <span className="font-mono text-cyan-400">
              {!isMulti && selectedGem ? selectedGem.toothId.replace('tooth-', '#') : ''}
            </span>
          </div>

          {/* 1. Duplicar */}
          <button
            type="button"
            onClick={() => {
              if (isMulti) {
                duplicateSelectedGems()
              } else if (selectedGemId) {
                duplicateGem(selectedGemId)
              }
              closeContextMenu()
            }}
            className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-slate-800/90 hover:text-white transition-colors cursor-pointer text-left"
          >
            <div className="flex items-center gap-2">
              <svg className="w-3.5 h-3.5 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect width="13" height="13" x="9" y="9" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
              <span>{isMulti ? 'Duplicar Selección' : 'Duplicar'}</span>
            </div>
            <span className="text-[10px] text-slate-500 font-mono">Ctrl+D</span>
          </button>

          {/* 2. Copiar */}
          <button
            type="button"
            onClick={() => {
              if (selectedGemId) copyGem(selectedGemId)
              closeContextMenu()
            }}
            className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-slate-800/90 hover:text-white transition-colors cursor-pointer text-left"
          >
            <div className="flex items-center gap-2">
              <svg className="w-3.5 h-3.5 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
              </svg>
              <span>Copiar</span>
            </div>
            <span className="text-[10px] text-slate-500 font-mono">Ctrl+C</span>
          </button>

          {/* 3. Pegar */}
          <button
            type="button"
            disabled={!clipboardGem}
            onClick={() => {
              pasteGem()
              closeContextMenu()
            }}
            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg transition-colors text-left ${
              clipboardGem
                ? 'hover:bg-slate-800/90 hover:text-white cursor-pointer'
                : 'opacity-40 text-slate-500 cursor-not-allowed'
            }`}
          >
            <div className="flex items-center gap-2">
              <svg className="w-3.5 h-3.5 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
              </svg>
              <span>Pegar</span>
            </div>
            <span className="text-[10px] text-slate-500 font-mono">Ctrl+V</span>
          </button>

          <div className="my-1 border-t border-slate-800/80" />

          {/* 4. Voltear Horizontal */}
          {!isMulti && selectedGemId && (
            <button
              type="button"
              onClick={() => {
                flipGemHorizontal(selectedGemId)
                closeContextMenu()
              }}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-slate-800/90 hover:text-white transition-colors cursor-pointer text-left"
            >
              <svg className="w-3.5 h-3.5 text-sky-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="m3 7 5 5-5 5V7z" />
                <path d="m21 7-5 5 5 5V7z" />
                <path d="M12 20V4" />
              </svg>
              <span>Voltear Horizontal</span>
            </button>
          )}

          {/* 5. Voltear Vertical */}
          {!isMulti && selectedGemId && (
            <button
              type="button"
              onClick={() => {
                flipGemVertical(selectedGemId)
                closeContextMenu()
              }}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-slate-800/90 hover:text-white transition-colors cursor-pointer text-left"
            >
              <svg className="w-3.5 h-3.5 text-sky-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="m7 3 5 5 5-5H7z" />
                <path d="m7 21 5-5 5 5H7z" />
                <path d="M4 12h16" />
              </svg>
              <span>Voltear Vertical</span>
            </button>
          )}

          {/* 6. Exportar PNG Transparente (solo gema individual) */}
          {!isMulti && selectedGem && (
            <>
              <button
                type="button"
                onClick={() => {
                  exportGemAsPNG(selectedGem)
                  closeContextMenu()
                }}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-slate-800/90 hover:text-emerald-300 transition-colors cursor-pointer text-left"
              >
                <svg className="w-3.5 h-3.5 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                <span>Exportar PNG (Transparente)</span>
              </button>
            </>
          )}

          <div className="my-1 border-t border-slate-800/80" />

          {/* Centrar Dentadura */}
          <button
            type="button"
            onClick={() => {
              resetPanOffset()
              closeContextMenu()
            }}
            className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-slate-800/90 text-cyan-300 hover:text-cyan-200 transition-colors cursor-pointer text-left"
          >
            <div className="flex items-center gap-2">
              <svg className="w-3.5 h-3.5 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 2v4" />
                <path d="M12 18v4" />
                <path d="M2 12h4" />
                <path d="M18 12h4" />
              </svg>
              <span>Centrar Dentadura</span>
            </div>
            {isPanned && (
              <span className="text-[9px] bg-cyan-950 text-cyan-300 px-1.5 py-0.5 rounded-md font-mono border border-cyan-800/50">
                movida
              </span>
            )}
          </button>

          <div className="my-1 border-t border-slate-800/80" />

          {/* 7. Eliminar */}
          <button
            type="button"
            onClick={() => {
              if (isMulti) {
                removeSelectedGems()
              } else if (selectedGemId) {
                removeGem(selectedGemId)
              }
              closeContextMenu()
            }}
            className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-red-400 hover:bg-red-950/40 hover:text-red-300 transition-colors cursor-pointer text-left"
          >
            <div className="flex items-center gap-2">
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 6h18" />
                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
              </svg>
              <span>{isMulti ? 'Eliminar Selección' : 'Eliminar'}</span>
            </div>
            <span className="text-[10px] text-red-500/70 font-mono">Supr</span>
          </button>
        </>
      ) : (
        /* ==================== MODO 2: DENTADURA Y ESCENA ==================== */
        <>
          <div className="px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-800/80 mb-1 flex items-center justify-between">
            <span>Dentadura & Escena</span>
            <span className="font-mono text-cyan-400">{gems.length} gema{gems.length !== 1 ? 's' : ''}</span>
          </div>

          {/* 1. Centrar Dentadura */}
          <button
            type="button"
            onClick={() => {
              resetPanOffset()
              closeContextMenu()
            }}
            className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-slate-800/90 text-cyan-300 hover:text-white transition-colors cursor-pointer text-left"
          >
            <div className="flex items-center gap-2">
              <svg className="w-3.5 h-3.5 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 2v4" />
                <path d="M12 18v4" />
                <path d="M2 12h4" />
                <path d="M18 12h4" />
              </svg>
              <span>Centrar Dentadura</span>
            </div>
            {isPanned ? (
              <span className="text-[9px] bg-cyan-950 text-cyan-300 px-1.5 py-0.5 rounded-md font-mono border border-cyan-800/50">
                Restablecer
              </span>
            ) : (
              <span className="text-[9px] text-slate-500 font-mono">En centro</span>
            )}
          </button>

          {/* 2. Pegar Gema si hay en portapapeles */}
          <button
            type="button"
            disabled={!clipboardGem}
            onClick={() => {
              pasteGem()
              closeContextMenu()
            }}
            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg transition-colors text-left ${
              clipboardGem
                ? 'hover:bg-slate-800/90 hover:text-white cursor-pointer'
                : 'opacity-40 text-slate-500 cursor-not-allowed'
            }`}
          >
            <div className="flex items-center gap-2">
              <svg className="w-3.5 h-3.5 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
              </svg>
              <span>Pegar Gema</span>
            </div>
            <span className="text-[10px] text-slate-500 font-mono">Ctrl+V</span>
          </button>

          <div className="my-1 border-t border-slate-800/80" />

          {/* 3. Selección rápida de Arcada */}
          <div className="px-2.5 py-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
            Arcada Visible
          </div>
          <div className="grid grid-cols-3 gap-1 px-1 mb-1">
            <button
              type="button"
              onClick={() => {
                setActiveArch('upper')
                closeContextMenu()
              }}
              className={`py-1 px-1 text-center rounded text-[10px] font-medium transition-colors cursor-pointer ${
                activeArch === 'upper'
                  ? 'bg-cyan-500 text-slate-950 font-bold'
                  : 'bg-slate-800/60 hover:bg-slate-800 text-slate-300'
              }`}
            >
              Superior
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveArch('lower')
                closeContextMenu()
              }}
              className={`py-1 px-1 text-center rounded text-[10px] font-medium transition-colors cursor-pointer ${
                activeArch === 'lower'
                  ? 'bg-cyan-500 text-slate-950 font-bold'
                  : 'bg-slate-800/60 hover:bg-slate-800 text-slate-300'
              }`}
            >
              Inferior
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveArch('both')
                closeContextMenu()
              }}
              className={`py-1 px-1 text-center rounded text-[10px] font-medium transition-colors cursor-pointer ${
                activeArch === 'both'
                  ? 'bg-cyan-500 text-slate-950 font-bold'
                  : 'bg-slate-800/60 hover:bg-slate-800 text-slate-300'
              }`}
            >
              Ambas
            </button>
          </div>

          <div className="my-1 border-t border-slate-800/80" />

          {/* 4. Restablecer Vista Frontal */}
          <button
            type="button"
            onClick={() => {
              setCameraPreset('frontal')
              closeContextMenu()
            }}
            className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-slate-800/90 hover:text-white transition-colors cursor-pointer text-left"
          >
            <div className="flex items-center gap-2">
              <svg className="w-3.5 h-3.5 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
                <circle cx="12" cy="13" r="3" />
              </svg>
              <span>Vista Frontal 3D</span>
            </div>
            <span className="text-[10px] text-slate-500 font-mono">Cámara</span>
          </button>

          {/* 5. Limpiar todas las gemas (si hay) */}
          {gems.length > 0 && (
            <>
              <div className="my-1 border-t border-slate-800/80" />
              <button
                type="button"
                onClick={() => {
                  if (window.confirm('¿Deseas eliminar todas las gemas colocadas?')) {
                    clearGems()
                  }
                  closeContextMenu()
                }}
                className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-red-400 hover:bg-red-950/40 hover:text-red-300 transition-colors cursor-pointer text-left"
              >
                <div className="flex items-center gap-2">
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 6h18" />
                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                  </svg>
                  <span>Limpiar todas las gemas</span>
                </div>
              </button>
            </>
          )}
        </>
      )}
    </div>
  )
}
