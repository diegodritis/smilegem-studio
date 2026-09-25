import { useMemo, useState } from 'react'
import { useGemsStore, type Gem } from '../store/useGemsStore'
import { useStudioStore } from '../store/useStudioStore'
import { GEM_SHAPES } from '../lib/gemShapes'

interface ToothInfo {
  fdi: string
  toothId: string
  name: string
  type: 'incisor' | 'canine' | 'premolar' | 'molar'
  arch: 'upper' | 'lower'
}

const UPPER_TEETH: ToothInfo[] = [
  { fdi: '17', toothId: 'tooth-17', name: '2° Molar Sup. Der.', type: 'molar', arch: 'upper' },
  { fdi: '16', toothId: 'tooth-16', name: '1° Molar Sup. Der.', type: 'molar', arch: 'upper' },
  { fdi: '15', toothId: 'tooth-15', name: '2° Premolar Sup. Der.', type: 'premolar', arch: 'upper' },
  { fdi: '14', toothId: 'tooth-14', name: '1° Premolar Sup. Der.', type: 'premolar', arch: 'upper' },
  { fdi: '13', toothId: 'tooth-13', name: 'Canino Sup. Der.', type: 'canine', arch: 'upper' },
  { fdi: '12', toothId: 'tooth-12', name: 'Inc. Lateral Sup. Der.', type: 'incisor', arch: 'upper' },
  { fdi: '11', toothId: 'tooth-11', name: 'Inc. Central Sup. Der.', type: 'incisor', arch: 'upper' },
  { fdi: '21', toothId: 'tooth-21', name: 'Inc. Central Sup. Izq.', type: 'incisor', arch: 'upper' },
  { fdi: '22', toothId: 'tooth-22', name: 'Inc. Lateral Sup. Izq.', type: 'incisor', arch: 'upper' },
  { fdi: '23', toothId: 'tooth-23', name: 'Canino Sup. Izq.', type: 'canine', arch: 'upper' },
  { fdi: '24', toothId: 'tooth-24', name: '1° Premolar Sup. Izq.', type: 'premolar', arch: 'upper' },
  { fdi: '25', toothId: 'tooth-25', name: '2° Premolar Sup. Izq.', type: 'premolar', arch: 'upper' },
  { fdi: '26', toothId: 'tooth-26', name: '1° Molar Sup. Izq.', type: 'molar', arch: 'upper' },
  { fdi: '27', toothId: 'tooth-27', name: '2° Molar Sup. Izq.', type: 'molar', arch: 'upper' },
]

const LOWER_TEETH: ToothInfo[] = [
  { fdi: '47', toothId: 'tooth-47', name: '2° Molar Inf. Der.', type: 'molar', arch: 'lower' },
  { fdi: '46', toothId: 'tooth-46', name: '1° Molar Inf. Der.', type: 'molar', arch: 'lower' },
  { fdi: '45', toothId: 'tooth-45', name: '2° Premolar Inf. Der.', type: 'premolar', arch: 'lower' },
  { fdi: '44', toothId: 'tooth-44', name: '1° Premolar Inf. Der.', type: 'premolar', arch: 'lower' },
  { fdi: '43', toothId: 'tooth-43', name: 'Canino Inf. Der.', type: 'canine', arch: 'lower' },
  { fdi: '42', toothId: 'tooth-42', name: 'Inc. Lateral Inf. Der.', type: 'incisor', arch: 'lower' },
  { fdi: '41', toothId: 'tooth-41', name: 'Inc. Central Inf. Der.', type: 'incisor', arch: 'lower' },
  { fdi: '31', toothId: 'tooth-31', name: 'Inc. Central Inf. Izq.', type: 'incisor', arch: 'lower' },
  { fdi: '32', toothId: 'tooth-32', name: 'Inc. Lateral Inf. Izq.', type: 'incisor', arch: 'lower' },
  { fdi: '33', toothId: 'tooth-33', name: 'Canino Inf. Izq.', type: 'canine', arch: 'lower' },
  { fdi: '34', toothId: 'tooth-34', name: '1° Premolar Inf. Izq.', type: 'premolar', arch: 'lower' },
  { fdi: '35', toothId: 'tooth-35', name: '2° Premolar Inf. Izq.', type: 'premolar', arch: 'lower' },
  { fdi: '36', toothId: 'tooth-36', name: '1° Molar Inf. Izq.', type: 'molar', arch: 'lower' },
  { fdi: '37', toothId: 'tooth-37', name: '2° Molar Inf. Izq.', type: 'molar', arch: 'lower' },
]

export function Odontogram2D() {
  const gems = useGemsStore((state) => state.gems)
  const selectedGemId = useGemsStore((state) => state.selectedGemId)
  const setSelectedGemId = useGemsStore((state) => state.setSelectedGemId)
  const addGem = useGemsStore((state) => state.addGem)

  const activeArch = useStudioStore((state) => state.activeArch)
  const setActiveArch = useStudioStore((state) => state.setActiveArch)

  const [hoveredTooth, setHoveredTooth] = useState<string | null>(null)

  // Mapeo de gemas agrupadas por diente
  const gemsByTooth = useMemo(() => {
    const map: Record<string, Gem[]> = {}
    ;[...UPPER_TEETH, ...LOWER_TEETH].forEach((t) => {
      map[t.toothId] = []
    })
    gems.forEach((g) => {
      if (map[g.toothId]) {
        map[g.toothId].push(g)
      } else {
        map[g.toothId] = [g]
      }
    })
    return map
  }, [gems])

  // Desglose de inventario para la ficha técnica
  const inventorySummary = useMemo(() => {
    const counts: Record<string, { count: number; shape: string; color: string; size: string }> = {}
    gems.forEach((g) => {
      const key = `${g.shape}_${g.sizeCode || 'SS3'}_${g.color}`
      if (!counts[key]) {
        counts[key] = {
          count: 0,
          shape: g.shape,
          color: g.color,
          size: g.sizeCode || 'SS3',
        }
      }
      counts[key].count++
    })
    return Object.values(counts)
  }, [gems])

  // Colocar una gema directamente en la pieza dental desde el odontograma
  const handleQuickPlace = (tooth: ToothInfo) => {
    const storeState = useGemsStore.getState()
    // Estimación de posición aproximada en 3D
    const isUpper = tooth.arch === 'upper'
    const isLeft = tooth.fdi.startsWith('2') || tooth.fdi.startsWith('3')
    const offsetIndex = parseInt(tooth.fdi.slice(1)) - 1
    const x = (isLeft ? -1 : 1) * (0.2 + offsetIndex * 0.28)
    const y = isUpper ? 0.0 : -0.44
    const z = 0.44 - offsetIndex * 0.12

    addGem({
      toothId: tooth.toothId,
      position: { u: 0.5, v: 0.5 },
      worldPosition: [x, y, z],
      normal: [x * 0.3, y * 0.1, 0.95],
      rotation: 0,
      scale: 1,
      shape: storeState.activeShape || 'circle',
      sizeCode: storeState.activeSizeCode || 'SS3',
      color: storeState.activeColor || '#FFFFFF',
      finish: storeState.activeFinish || 'solid',
    })
  }

  const renderToothRow = (teeth: ToothInfo[], label: string) => (
    <div className="space-y-1">
      <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 px-2 flex items-center justify-between">
        <span>{label}</span>
        <span className="text-slate-500">14 piezas FDI</span>
      </div>
      <div className="min-w-[760px] flex items-end justify-center gap-1 px-1">
        {teeth.map((tooth) => {
          const toothGems = gemsByTooth[tooth.toothId] || []
          const hasGems = toothGems.length > 0
          const hasSelectedGem = toothGems.some((g) => g.id === selectedGemId)
          const isHovered = hoveredTooth === tooth.toothId

          return (
            <div
              key={tooth.toothId}
              onMouseEnter={() => setHoveredTooth(tooth.toothId)}
              onMouseLeave={() => setHoveredTooth(null)}
              className={`flex-1 flex flex-col items-center p-1.5 rounded-xl border transition-all relative group ${
                hasSelectedGem
                  ? 'bg-cyan-950/80 border-cyan-400 shadow-md shadow-cyan-950/50'
                  : hasGems
                  ? 'bg-slate-900/90 border-cyan-700/60'
                  : 'bg-slate-900/40 border-slate-800/60 hover:border-slate-700'
              }`}
            >
              {/* Visualización de Gemas colocadas sobre este diente */}
              <div className="h-8 w-full flex items-center justify-center gap-0.5 flex-wrap p-0.5">
                {toothGems.map((g) => {
                  const isSelected = g.id === selectedGemId
                  const shapeDef = GEM_SHAPES.find((s) => s.id === g.shape) || GEM_SHAPES[0]
                  return (
                    <button
                      key={g.id}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedGemId(g.id)
                      }}
                      title={`Gema en ${tooth.fdi}: ${g.shape} ${g.sizeCode || 'SS3'}`}
                      className={`w-4 h-4 rounded flex items-center justify-center transition-transform hover:scale-125 cursor-pointer shadow-sm ${
                        isSelected ? 'ring-2 ring-cyan-400 scale-110' : ''
                      }`}
                      style={{ backgroundColor: g.color || '#FFFFFF' }}
                    >
                      <svg className="w-2.5 h-2.5 text-slate-900 fill-current opacity-85" viewBox="0 0 24 24">
                        <path d={shapeDef.svgPath} />
                      </svg>
                    </button>
                  )
                })}
              </div>

              {/* Silueta Anatómica del Diente en 2D */}
              <div className="w-full flex justify-center my-1">
                <svg
                  className={`w-7 h-10 transition-colors ${
                    hasSelectedGem
                      ? 'text-cyan-400'
                      : hasGems
                      ? 'text-slate-100'
                      : 'text-slate-600 hover:text-slate-400'
                  }`}
                  viewBox="0 0 40 60"
                  fill="currentColor"
                >
                  {tooth.type === 'incisor' && (
                    <path d="M6 12 C6 5, 34 5, 34 12 C34 30, 31 52, 26 55 C23 57, 17 57, 14 55 C9 52, 6 30, 6 12 Z" />
                  )}
                  {tooth.type === 'canine' && (
                    <path d="M8 12 C8 5, 32 5, 32 12 C32 28, 28 48, 20 57 C12 48, 8 28, 8 12 Z" />
                  )}
                  {tooth.type === 'premolar' && (
                    <path d="M5 12 C5 4, 35 4, 35 12 C35 28, 32 50, 26 54 C23 56, 17 56, 14 54 C8 50, 5 28, 5 12 Z" />
                  )}
                  {tooth.type === 'molar' && (
                    <path d="M4 10 C4 2, 36 2, 36 10 C36 30, 33 51, 26 55 C22 57, 18 57, 14 55 C7 51, 4 30, 4 10 Z" />
                  )}
                </svg>
              </div>

              {/* Botón rápido "+" para colocar gema directa en este diente al pasar el mouse */}
              {isHovered && (
                <button
                  type="button"
                  onClick={() => handleQuickPlace(tooth)}
                  title={`Colocar gema en diente #${tooth.fdi}`}
                  className="absolute inset-0 m-auto w-6 h-6 rounded-full bg-cyan-500 text-slate-950 font-bold flex items-center justify-center shadow-lg hover:scale-110 transition-transform cursor-pointer"
                >
                  +
                </button>
              )}

              {/* Número FDI de la pieza */}
              <span className={`font-mono text-[11px] font-bold ${hasGems ? 'text-cyan-300' : 'text-slate-400'}`}>
                #{tooth.fdi}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )

  return (
    <div className="w-full h-full bg-slate-950/95 p-4 flex flex-col justify-between overflow-y-auto select-none border-t border-slate-800/80">
      {/* Cabecera Técnica del Odontograma */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-100 uppercase tracking-wider">
              Esquema Clínico Dental (FDI)
            </span>
            <div className="flex items-center bg-slate-900 p-0.5 rounded-lg border border-slate-800 text-[10px]">
              <button
                type="button"
                onClick={() => setActiveArch('upper')}
                className={`px-2 py-0.5 rounded transition-colors ${
                  activeArch === 'upper' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Superior
              </button>
              <button
                type="button"
                onClick={() => setActiveArch('lower')}
                className={`px-2 py-0.5 rounded transition-colors ${
                  activeArch === 'lower' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Inferior
              </button>
              <button
                type="button"
                onClick={() => setActiveArch('both')}
                className={`px-2 py-0.5 rounded transition-colors ${
                  activeArch === 'both' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Ambas
              </button>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Pasa el mouse sobre cualquier pieza y haz clic en "+" para colocar un cristal de forma instantánea
          </p>
        </div>

        {/* Resumen numérico */}
        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="text-slate-400">
            Dientes con gemas:{' '}
            <span className="text-cyan-400 font-bold">
              {Object.values(gemsByTooth).filter((arr) => arr.length > 0).length} /{' '}
              {activeArch === 'both' ? 28 : 14}
            </span>
          </div>
          <div className="text-slate-400">
            Total gemas:{' '}
            <span className="text-white font-bold">{gems.length}</span>
          </div>
        </div>
      </div>

      {/* Diagrama Dental Anatómico 2D (Filas Superior e Inferior) */}
      <div className="py-3 overflow-x-auto space-y-4">
        {(activeArch === 'upper' || activeArch === 'both') &&
          renderToothRow(UPPER_TEETH, 'Arcada Superior (Maxilar)')}
        {(activeArch === 'lower' || activeArch === 'both') &&
          renderToothRow(LOWER_TEETH, 'Arcada Inferior (Mandibular)')}
      </div>

      {/* Ficha Técnica & Inventario Clínico */}
      <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-slate-300 uppercase text-[10px] tracking-wider">
            Materiales Requeridos:
          </span>
          {inventorySummary.length === 0 ? (
            <span className="text-slate-500 italic text-[11px]">
              No hay cristales asignados aún.
            </span>
          ) : (
            <div className="flex items-center gap-2 flex-wrap">
              {inventorySummary.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700/80 font-mono text-[11px]"
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full border border-slate-500 shadow-inner"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="font-bold text-white">{item.count}x</span>
                  <span className="text-slate-300 capitalize">{item.shape}</span>
                  <span className="text-cyan-400">{item.size}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tiempo estimado de aplicación técnica */}
        <div className="text-[11px] text-slate-400 font-mono">
          Tiempo aprox: <span className="text-white font-semibold">{Math.max(10, gems.length * 6)} min</span>
        </div>
      </div>
    </div>
  )
}
