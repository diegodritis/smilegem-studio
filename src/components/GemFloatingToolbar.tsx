import { useState, useRef, useEffect } from 'react'
import { useGemsStore } from '../store/useGemsStore'
import { GEM_SHAPES } from '../lib/gemShapes'
import { GEM_SIZES } from '../lib/gemSizes'
import { COLOR_SWATCHES } from '../lib/gemFinishes'

interface GemFloatingToolbarProps {
  onToggleInspector: () => void
  isInspectorOpen: boolean
}

type ActivePopup = 'shape' | 'size' | 'color' | null

export function GemFloatingToolbar({ onToggleInspector, isInspectorOpen }: GemFloatingToolbarProps) {
  const selectedGemId = useGemsStore((state) => state.selectedGemId)
  const selectedGemIds = useGemsStore((state) => state.selectedGemIds)
  const gems = useGemsStore((state) => state.gems)
  const isDragging = useGemsStore((state) => state.isDragging)
  const updateGem = useGemsStore((state) => state.updateGem)
  const duplicateGem = useGemsStore((state) => state.duplicateGem)
  const duplicateSelectedGems = useGemsStore((state) => state.duplicateSelectedGems)
  const removeGem = useGemsStore((state) => state.removeGem)
  const removeSelectedGems = useGemsStore((state) => state.removeSelectedGems)
  const flipGemHorizontal = useGemsStore((state) => state.flipGemHorizontal)
  const alignGems = useGemsStore((state) => state.alignGems)
  const clearSelection = useGemsStore((state) => state.clearSelection)

  const [activePopup, setActivePopup] = useState<ActivePopup>(null)
  const barRef = useRef<HTMLDivElement>(null)

  // Cerrar popups al hacer clic fuera de la barra flotante
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (barRef.current && !barRef.current.contains(e.target as Node)) {
        setActivePopup(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  if (isDragging) return null

  // 1. TOOLBAR DE MULTI-SELECCIÓN Y ALINEACIÓN (Fase 16)
  if (selectedGemIds.length >= 2) {
    return (
      <div
        ref={barRef}
        className="absolute bottom-5 left-1/2 -translate-x-1/2 bg-slate-950/95 backdrop-blur-2xl border border-purple-500/40 shadow-2xl rounded-2xl p-1.5 flex items-center gap-1.5 z-25 text-slate-200 select-none animate-in slide-in-from-bottom-4 duration-200"
      >
        {/* Badge contador de grupo */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-950/80 rounded-xl border border-purple-800/80 text-xs">
          <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
          <span className="font-semibold text-purple-200">{selectedGemIds.length} Gemas</span>
        </div>

        <div className="h-4 w-px bg-slate-800" />

        {/* Alineación Horizontal */}
        <div className="flex items-center bg-slate-900/80 p-0.5 rounded-xl border border-slate-800">
          <button
            type="button"
            onClick={() => alignGems('left')}
            title="Alinear a la izquierda"
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 22V2M20 6H8M16 12H8M18 18H8" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => alignGems('center')}
            title="Alinear al centro horizontal"
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2v20M18 6H6M20 12H4M17 18H7" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => alignGems('right')}
            title="Alinear a la derecha"
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 2v20M4 6h12M8 12h8M6 18h10" />
            </svg>
          </button>
        </div>

        {/* Alineación Vertical */}
        <div className="flex items-center bg-slate-900/80 p-0.5 rounded-xl border border-slate-800">
          <button
            type="button"
            onClick={() => alignGems('top')}
            title="Alinear arriba"
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M2 4h20M6 20V8M12 16V8M18 18V8" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => alignGems('middle')}
            title="Alinear al medio vertical"
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M2 12h20M6 18V6M12 20V4M18 17V7" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => alignGems('bottom')}
            title="Alinear abajo"
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M2 20h20M6 4v12M12 8v8M18 6v10" />
            </svg>
          </button>
        </div>

        {/* Distribuir Parejo */}
        <div className="flex items-center bg-slate-900/80 p-0.5 rounded-xl border border-slate-800">
          <button
            type="button"
            onClick={() => alignGems('distribute-h')}
            title="Distribuir parejo horizontalmente"
            className="p-1.5 rounded-lg text-cyan-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect width="4" height="14" x="4" y="5" rx="1" />
              <rect width="4" height="14" x="16" y="5" rx="1" />
              <path d="M12 2v20" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => alignGems('distribute-v')}
            title="Distribuir parejo verticalmente"
            className="p-1.5 rounded-lg text-cyan-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect width="14" height="4" x="5" y="4" rx="1" />
              <rect width="14" height="4" x="5" y="16" rx="1" />
              <path d="M2 12h20" />
            </svg>
          </button>
        </div>

        <div className="h-4 w-px bg-slate-800" />

        {/* Duplicar Grupo */}
        <button
          type="button"
          onClick={duplicateSelectedGems}
          title="Duplicar grupo seleccionado (Ctrl+D)"
          className="p-1.5 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800 transition-colors cursor-pointer"
        >
          <svg className="w-4 h-4 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect width="13" height="13" x="9" y="9" rx="2" ry="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
        </button>

        {/* Eliminar Grupo */}
        <button
          type="button"
          onClick={removeSelectedGems}
          title="Eliminar grupo seleccionado (Supr)"
          className="p-1.5 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-950/40 border border-slate-800 transition-colors cursor-pointer"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 6h18" />
            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
          </svg>
        </button>

        {/* Deseleccionar */}
        <button
          type="button"
          onClick={clearSelection}
          title="Deseleccionar grupo (Esc)"
          className="px-2 py-1 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 text-xs transition-colors cursor-pointer"
        >
          Deseleccionar
        </button>
      </div>
    )
  }

  // 2. TOOLBAR DE GEMA INDIVIDUAL
  if (!selectedGemId) return null
  const selectedGem = gems.find((g) => g.id === selectedGemId)
  if (!selectedGem) return null

  const toothNumber = selectedGem.toothId.replace('tooth-', '#')
  const currentShape = GEM_SHAPES.find((s) => s.id === selectedGem.shape) || GEM_SHAPES[0]

  return (
    <div
      ref={barRef}
      className="absolute bottom-5 left-1/2 -translate-x-1/2 bg-slate-950/90 backdrop-blur-2xl border border-slate-700/80 shadow-2xl rounded-2xl p-1.5 flex items-center gap-1.5 z-25 text-slate-200 select-none animate-in slide-in-from-bottom-4 duration-200"
    >
      {/* 1. Indicador de Diente */}
      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900/80 rounded-xl border border-slate-800 text-xs">
        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
        <span className="font-semibold text-cyan-300">Diente {toothNumber}</span>
      </div>

      <div className="h-4 w-px bg-slate-800" />

      {/* 2. Selector Rápido de Forma */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setActivePopup(activePopup === 'shape' ? null : 'shape')}
          title="Cambiar forma de la gema"
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium border transition-colors cursor-pointer ${
            activePopup === 'shape'
              ? 'bg-cyan-950/80 border-cyan-500 text-cyan-300'
              : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
        >
          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
            <path d={currentShape.svgPath} />
          </svg>
          <span className="hidden sm:inline">{currentShape.label.split(' ')[0]}</span>
          <svg className="w-3 h-3 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="m6 9 6 6 6-6" />
          </svg>
        </button>

        {activePopup === 'shape' && (
          <div className="absolute bottom-full left-0 mb-2 w-64 p-2 bg-slate-950/95 backdrop-blur-xl border border-slate-700 rounded-xl shadow-2xl z-50 grid grid-cols-4 gap-1 animate-in fade-in zoom-in-95">
            {GEM_SHAPES.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => {
                  updateGem(selectedGem.id, { shape: s.id })
                  setActivePopup(null)
                }}
                className={`p-1.5 rounded-lg flex flex-col items-center gap-1 border transition-all cursor-pointer ${
                  selectedGem.shape === s.id
                    ? 'bg-cyan-950 border-cyan-400 text-cyan-300'
                    : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                }`}
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d={s.svgPath} />
                </svg>
                <span className="text-[8px] truncate w-full text-center">{s.label.split(' ')[0]}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 3. Selector Rápido de Talla */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setActivePopup(activePopup === 'size' ? null : 'size')}
          title="Cambiar talla de la gema (SS)"
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-mono font-medium border transition-colors cursor-pointer ${
            activePopup === 'size'
              ? 'bg-cyan-950/80 border-cyan-500 text-cyan-300'
              : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
        >
          <span>{selectedGem.sizeCode || 'SS3'}</span>
          <span className="text-[10px] text-slate-400 font-sans">
            ({(1.4 * selectedGem.scale).toFixed(1)}mm)
          </span>
          <svg className="w-3 h-3 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="m6 9 6 6 6-6" />
          </svg>
        </button>

        {activePopup === 'size' && (
          <div className="absolute bottom-full left-0 mb-2 w-48 p-1.5 bg-slate-950/95 backdrop-blur-xl border border-slate-700 rounded-xl shadow-2xl z-50 grid grid-cols-2 gap-1 animate-in fade-in zoom-in-95">
            {GEM_SIZES.map((size) => (
              <button
                key={size.code}
                type="button"
                onClick={() => {
                  updateGem(selectedGem.id, {
                    sizeCode: size.code,
                    scale: size.scaleFactor,
                  })
                  setActivePopup(null)
                }}
                className={`px-2 py-1.5 rounded-lg text-left border flex items-center justify-between cursor-pointer transition-colors ${
                  (selectedGem.sizeCode || 'SS3') === size.code
                    ? 'bg-cyan-950 border-cyan-400 text-cyan-300'
                    : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <span className="font-mono text-xs font-bold">{size.code}</span>
                <span className="text-[10px] text-slate-400 font-sans">{size.mm}mm</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 4. Selector Rápido de Color */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setActivePopup(activePopup === 'color' ? null : 'color')}
          title="Cambiar color de la gema"
          className="p-1.5 rounded-xl bg-slate-900/60 border border-slate-800 hover:bg-slate-800 transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <span
            className="w-4 h-4 rounded-full border border-slate-500 shadow-inner"
            style={{ backgroundColor: selectedGem.color }}
          />
          <svg className="w-3 h-3 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="m6 9 6 6 6-6" />
          </svg>
        </button>

        {activePopup === 'color' && (
          <div className="absolute bottom-full left-0 mb-2 w-52 p-2 bg-slate-950/95 backdrop-blur-xl border border-slate-700 rounded-xl shadow-2xl z-50 grid grid-cols-4 gap-1.5 animate-in fade-in zoom-in-95">
            {COLOR_SWATCHES.map((c) => (
              <button
                key={c.hex}
                type="button"
                onClick={() => {
                  updateGem(selectedGem.id, {
                    color: c.hex,
                    finish: c.recommendedFinish || selectedGem.finish,
                  })
                  setActivePopup(null)
                }}
                title={c.name}
                className="h-8 rounded-lg border border-slate-700 flex items-center justify-center hover:scale-110 transition-transform cursor-pointer"
                style={{ backgroundColor: c.hex }}
              />
            ))}
          </div>
        )}
      </div>

      <div className="h-4 w-px bg-slate-800" />

      {/* 5. Acciones de botón directo */}
      <button
        type="button"
        onClick={() => duplicateGem(selectedGem.id)}
        title="Duplicar gema (Ctrl+D)"
        className="p-1.5 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800 transition-colors cursor-pointer"
      >
        <svg className="w-4 h-4 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect width="13" height="13" x="9" y="9" rx="2" ry="2" />
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
        </svg>
      </button>

      <button
        type="button"
        onClick={() => flipGemHorizontal(selectedGem.id)}
        title="Voltear horizontal"
        className="p-1.5 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800 transition-colors cursor-pointer"
      >
        <svg className="w-4 h-4 text-sky-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="m3 7 5 5-5 5V7z" />
          <path d="m21 7-5 5 5 5V7z" />
        </svg>
      </button>

      <button
        type="button"
        onClick={() => removeGem(selectedGem.id)}
        title="Eliminar gema (Supr)"
        className="p-1.5 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-950/40 border border-slate-800 transition-colors cursor-pointer"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 6h18" />
          <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
        </svg>
      </button>

      <div className="h-4 w-px bg-slate-800" />

      {/* 6. Botón de abrir/cerrar inspector completo */}
      <button
        type="button"
        onClick={onToggleInspector}
        title={isInspectorOpen ? 'Cerrar panel de propiedades' : 'Abrir panel completo de propiedades'}
        className={`px-2.5 py-1.5 rounded-xl text-xs font-medium border flex items-center gap-1.5 transition-colors cursor-pointer ${
          isInspectorOpen
            ? 'bg-cyan-500 text-slate-950 font-bold border-cyan-400'
            : 'bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800 border-slate-700'
        }`}
      >
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
          <circle cx="12" cy="12" r="3"/>
        </svg>
        <span>Propiedades</span>
      </button>
    </div>
  )
}
