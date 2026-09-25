import { useRef } from 'react'
import { useGemsStore, type GemShape, type GemFinish } from '../store/useGemsStore'
import { GEM_SHAPES } from '../lib/gemShapes'
import { GEM_SIZES } from '../lib/gemSizes'
import { GEM_FINISHES, COLOR_SWATCHES } from '../lib/gemFinishes'
import { exportGemAsPNG } from '../lib/gemExport'

interface GemPropertiesEditorProps {
  showQuickActions?: boolean
  onActionCompleted?: () => void
}

export function GemPropertiesEditor({
  showQuickActions = true,
  onActionCompleted,
}: GemPropertiesEditorProps) {
  const selectedGemId = useGemsStore((state) => state.selectedGemId)
  const gems = useGemsStore((state) => state.gems)
  const updateGem = useGemsStore((state) => state.updateGem)
  const removeGem = useGemsStore((state) => state.removeGem)
  const duplicateGem = useGemsStore((state) => state.duplicateGem)
  const flipGemHorizontal = useGemsStore((state) => state.flipGemHorizontal)
  const clearGems = useGemsStore((state) => state.clearGems)

  const activeShape = useGemsStore((state) => state.activeShape)
  const activeSizeCode = useGemsStore((state) => state.activeSizeCode)
  const activeColor = useGemsStore((state) => state.activeColor)
  const activeFinish = useGemsStore((state) => state.activeFinish)

  const setActiveShape = useGemsStore((state) => state.setActiveShape)
  const setActiveSizeCode = useGemsStore((state) => state.setActiveSizeCode)
  const setActiveColor = useGemsStore((state) => state.setActiveColor)
  const setActiveFinish = useGemsStore((state) => state.setActiveFinish)

  const customShapes = useGemsStore((state) => state.customShapes)
  const addCustomShape = useGemsStore((state) => state.addCustomShape)
  const removeCustomShape = useGemsStore((state) => state.removeCustomShape)

  const fileInputRef = useRef<HTMLInputElement>(null)

  const selectedGem = selectedGemId ? gems.find((g) => g.id === selectedGemId) : null

  // Valores efectivos actuales (de la gema seleccionada si existe, o del preset de colocación si no)
  const currentShapeId = selectedGem ? selectedGem.shape : activeShape
  const currentSizeCode = selectedGem ? selectedGem.sizeCode || 'SS3' : activeSizeCode
  const currentScale = selectedGem
    ? selectedGem.scale
    : GEM_SIZES.find((s) => s.code === activeSizeCode)?.scaleFactor || 1
  const currentRotation = selectedGem ? selectedGem.rotation || 0 : 0
  const currentFinish = selectedGem ? selectedGem.finish || 'solid' : activeFinish
  const currentColor = selectedGem ? selectedGem.color || '#FFFFFF' : activeColor

  // Manejo de cambio de forma
  const handleSelectShape = (shapeId: GemShape, customUrl?: string) => {
    setActiveShape(shapeId)
    if (selectedGem) {
      updateGem(selectedGem.id, {
        shape: shapeId,
        customShapeUrl: customUrl,
      })
    }
  }

  // Manejo de cambio de talla SS
  const handleSelectSize = (code: string, scaleFactor: number) => {
    setActiveSizeCode(code)
    if (selectedGem) {
      updateGem(selectedGem.id, {
        sizeCode: code,
        scale: scaleFactor,
      })
    }
  }

  // Manejo de escala fina
  const handleScaleChange = (newScale: number) => {
    if (selectedGem) {
      updateGem(selectedGem.id, { scale: newScale })
    }
  }

  // Manejo de rotación
  const handleRotationChange = (newRotation: number) => {
    if (selectedGem) {
      updateGem(selectedGem.id, { rotation: newRotation })
    }
  }

  // Manejo de acabado
  const handleSelectFinish = (finishId: GemFinish) => {
    setActiveFinish(finishId)
    if (selectedGem) {
      updateGem(selectedGem.id, { finish: finishId })
    }
  }

  // Manejo de color
  const handleSelectColor = (colorHex: string, recommendedFinish?: GemFinish) => {
    setActiveColor(colorHex)
    if (recommendedFinish) {
      setActiveFinish(recommendedFinish)
    }
    if (selectedGem) {
      updateGem(selectedGem.id, {
        color: colorHex,
        finish: recommendedFinish || selectedGem.finish,
      })
    }
  }

  // Subida de forma propia PNG/SVG
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string
      if (dataUrl) {
        const cleanName = file.name.replace(/\.[^/.]+$/, '').slice(0, 10)
        const newId = addCustomShape(cleanName || 'Custom', dataUrl)
        setActiveShape(newId)
        if (selectedGem) {
          updateGem(selectedGem.id, { shape: newId, customShapeUrl: dataUrl })
        }
      }
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  return (
    <div className="space-y-4 select-none">
      {/* Banner de contexto/modo */}
      <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span
            className={`w-2 h-2 rounded-full ${
              selectedGem ? 'bg-cyan-400 animate-pulse' : 'bg-emerald-400'
            }`}
          />
          <div>
            <span className="font-semibold text-slate-100">
              {selectedGem
                ? `Editando Diente #${selectedGem.toothId.replace('tooth-', '')}`
                : 'Herramienta de Colocación'}
            </span>
            <div className="text-[10px] text-slate-400">
              {selectedGem
                ? 'Los cambios se aplican en tiempo real'
                : 'Define la gema que se colocará al hacer clic en un diente'}
            </div>
          </div>
        </div>
        <div className="text-right">
          <span className="font-mono text-[10px] text-cyan-300 font-semibold uppercase">
            {currentSizeCode} · {currentFinish}
          </span>
        </div>
      </div>

      {/* 1. SELECCIÓN DE FORMA & FORMAS PERSONALIZADAS */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Forma ({GEM_SHAPES.length + customShapes.length})
          </label>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            title="Subir gema propia en PNG/SVG con transparencia"
            className="text-[10px] font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 bg-cyan-950/60 px-2 py-0.5 rounded-full border border-cyan-800/60 cursor-pointer transition-colors"
          >
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 5v14M5 12h14" />
            </svg>
            <span>Subir Propia</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".png,.svg"
            className="hidden"
            onChange={handleFileUpload}
          />
        </div>

        <div className="grid grid-cols-4 gap-1.5 max-h-48 overflow-y-auto pr-1">
          {/* Formas estándar de catálogo */}
          {GEM_SHAPES.map((shape) => {
            const isActive = currentShapeId === shape.id
            return (
              <button
                key={shape.id}
                type="button"
                onClick={() => handleSelectShape(shape.id)}
                title={shape.label}
                className={`p-2 rounded-lg flex flex-col items-center gap-1 border transition-all cursor-pointer ${
                  isActive
                    ? 'bg-cyan-950/80 border-cyan-500 text-cyan-300 shadow-sm shadow-cyan-950 ring-1 ring-cyan-400/50'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d={shape.svgPath} />
                </svg>
                <span className="text-[9px] truncate w-full text-center leading-tight">
                  {shape.label.split(' ')[0]}
                </span>
              </button>
            )
          })}

          {/* Formas personalizadas subidas por el usuario */}
          {customShapes.map((shape) => {
            const isActive = currentShapeId === shape.id
            return (
              <div key={shape.id} className="relative group">
                <button
                  type="button"
                  onClick={() => handleSelectShape(shape.id, shape.dataUrl)}
                  title={`Forma propia: ${shape.label}`}
                  className={`w-full p-2 rounded-lg flex flex-col items-center gap-1 border transition-all cursor-pointer relative overflow-hidden ${
                    isActive
                      ? 'bg-cyan-950/80 border-cyan-500 text-cyan-300 shadow-sm shadow-cyan-950 ring-1 ring-cyan-400'
                      : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-cyan-800'
                  }`}
                >
                  <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-cyan-400 ring-2 ring-slate-900" />
                  <img
                    src={shape.dataUrl}
                    alt={shape.label}
                    className="w-5 h-5 object-contain filter drop-shadow"
                  />
                  <span className="text-[8px] truncate w-full text-center leading-tight text-cyan-300/90 font-mono">
                    {shape.label}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    removeCustomShape(shape.id)
                  }}
                  title="Eliminar forma personalizada"
                  className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow-md text-[9px]"
                >
                  ×
                </button>
              </div>
            )
          })}
        </div>
      </div>

      {/* 2. SISTEMA DE TALLAS SS */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Talla Dental (Estándar SS)
          </label>
          <span className="text-[11px] font-mono text-cyan-300 font-semibold">
            {currentSizeCode} · {(1.4 * currentScale).toFixed(1)} mm
          </span>
        </div>
        <div className="grid grid-cols-5 gap-1">
          {GEM_SIZES.map((size) => {
            const isActive = currentSizeCode === size.code
            return (
              <button
                key={size.code}
                type="button"
                onClick={() => handleSelectSize(size.code, size.scaleFactor)}
                className={`py-1.5 px-1 rounded-md text-center border font-mono transition-all cursor-pointer ${
                  isActive
                    ? 'bg-cyan-500 text-slate-950 font-bold border-cyan-400 shadow-sm'
                    : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800/80 hover:border-slate-700'
                }`}
              >
                <div className="text-[11px]">{size.code}</div>
                <div className="text-[8px] opacity-75">{size.mm}mm</div>
              </button>
            )
          })}
        </div>

        {/* Slider manual de escala fina (cuando hay gema seleccionada) */}
        {selectedGem && (
          <div className="mt-2.5">
            <div className="flex justify-between text-[10px] text-slate-400 mb-1">
              <span>Escala fina</span>
              <span className="font-mono">{(currentScale * 100).toFixed(0)}%</span>
            </div>
            <input
              type="range"
              min="0.4"
              max="2.8"
              step="0.05"
              value={currentScale}
              onChange={(e) => handleScaleChange(parseFloat(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer"
            />
          </div>
        )}
      </div>

      {/* 3. ROTACIÓN EN EL PLANO DENTAL (solo si hay gema seleccionada) */}
      {selectedGem && (
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Rotación en Superficie
            </label>
            <span className="text-[11px] font-mono text-slate-300">
              {Math.round(((currentRotation) * 180) / Math.PI) % 360}°
            </span>
          </div>
          <input
            type="range"
            min="0"
            max={Math.PI * 2}
            step="0.05"
            value={currentRotation % (Math.PI * 2)}
            onChange={(e) => handleRotationChange(parseFloat(e.target.value))}
            className="w-full accent-cyan-400 cursor-pointer"
          />
        </div>
      )}

      {/* 4. ACABADO Y MATERIAL */}
      <div>
        <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
          Acabado del Material
        </label>
        <div className="grid grid-cols-2 gap-1.5">
          {GEM_FINISHES.map((finish) => {
            const isActive = currentFinish === finish.id
            return (
              <button
                key={finish.id}
                type="button"
                onClick={() => handleSelectFinish(finish.id)}
                className={`p-2 rounded-lg text-left border transition-all cursor-pointer ${
                  isActive
                    ? 'bg-cyan-950/80 border-cyan-500 text-cyan-200 shadow-sm'
                    : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="font-semibold text-[11px]">{finish.label.split(' ')[0]}</div>
                <div className="text-[9px] text-slate-400 truncate">{finish.description}</div>
              </button>
            )
          })}
        </div>
      </div>

      {/* 5. COLOR Y PALETA */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Color de Gema
          </label>
          <div className="flex items-center gap-1.5">
            <span
              className="w-3.5 h-3.5 rounded-full border border-slate-600 shadow-inner"
              style={{ backgroundColor: currentColor }}
            />
            <span className="font-mono text-[10px] text-slate-400 uppercase">
              {currentColor}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-6 gap-1.5 mb-2.5">
          {COLOR_SWATCHES.map((swatch) => {
            const isSelected = currentColor.toLowerCase() === swatch.hex.toLowerCase()
            return (
              <button
                key={swatch.hex}
                type="button"
                onClick={() => handleSelectColor(swatch.hex, swatch.recommendedFinish)}
                title={swatch.name}
                className={`h-7 rounded-md border flex items-center justify-center transition-transform hover:scale-110 cursor-pointer ${
                  isSelected ? 'ring-2 ring-cyan-400 scale-105 border-white' : 'border-slate-700'
                }`}
                style={{ backgroundColor: swatch.hex }}
              >
                {isSelected && (
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-950/80 shadow-sm" />
                )}
              </button>
            )
          })}
        </div>

        {/* Color picker personalizado */}
        <div className="flex items-center gap-2 bg-slate-900/80 p-2 rounded-lg border border-slate-800">
          <input
            type="color"
            value={currentColor}
            onChange={(e) => handleSelectColor(e.target.value)}
            className="w-7 h-7 rounded border-0 bg-transparent cursor-pointer p-0"
          />
          <input
            type="text"
            value={currentColor}
            onChange={(e) => handleSelectColor(e.target.value)}
            className="flex-1 bg-slate-950 border border-slate-700/80 rounded px-2 py-1 font-mono text-[11px] text-slate-200 uppercase focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      {/* 6. ACCIONES RÁPIDAS */}
      {showQuickActions && (
        <div className="pt-2 border-t border-slate-800/80 space-y-1.5">
          {selectedGem ? (
            <>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    duplicateGem(selectedGem.id)
                    onActionCompleted?.()
                  }}
                  className="py-2 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-slate-200 font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer text-xs"
                >
                  <svg className="w-3.5 h-3.5 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect width="13" height="13" x="9" y="9" rx="2" ry="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                  </svg>
                  <span>Duplicar (Ctrl+D)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    flipGemHorizontal(selectedGem.id)
                    onActionCompleted?.()
                  }}
                  className="py-2 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-slate-200 font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer text-xs"
                >
                  <svg className="w-3.5 h-3.5 text-sky-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="m3 7 5 5-5 5V7z" />
                    <path d="m21 7-5 5 5 5V7z" />
                  </svg>
                  <span>Voltear H</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  exportGemAsPNG(selectedGem)
                  onActionCompleted?.()
                }}
                className="w-full py-2 px-3 rounded-lg bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-700/60 text-emerald-300 font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer text-xs"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                <span>Descargar PNG Individual</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  removeGem(selectedGem.id)
                  onActionCompleted?.()
                }}
                className="w-full py-2 px-3 rounded-lg bg-red-950/40 hover:bg-red-900/50 border border-red-800/60 text-red-300 font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer text-xs"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 6h18" />
                  <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                </svg>
                <span>Eliminar Gema (Supr)</span>
              </button>
            </>
          ) : (
            gems.length > 0 && (
              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-slate-400">Total en boca: {gems.length} cristales</span>
                <button
                  type="button"
                  onClick={() => {
                    clearGems()
                    onActionCompleted?.()
                  }}
                  className="text-red-400 hover:text-red-300 font-medium transition-colors cursor-pointer"
                >
                  Borrar todas
                </button>
              </div>
            )
          )}
        </div>
      )}
    </div>
  )
}
