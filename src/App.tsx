import { useState, useEffect } from 'react'
import { Header } from './components/Header'
import { MainScene } from './scenes/MainScene'
import { Odontogram2D } from './components/Odontogram2D'
import { PortfolioModal } from './components/PortfolioModal'
import { TemplatesModal } from './components/TemplatesModal'
import { ClientShowcaseModal } from './components/ClientShowcaseModal'
import { StudioSettingsModal } from './components/StudioSettingsModal'
import { AuthModal } from './components/AuthModal'
import { useStudioStore, type BackgroundId } from './store/useStudioStore'
import { useGemsStore } from './store/useGemsStore'
import { getPublicDesigns } from './lib/designStorage'

function App() {
  const viewMode = useStudioStore((state) => state.viewMode)
  const setBackgroundId = useStudioStore((state) => state.setBackgroundId)
  const setGems = useGemsStore((state) => state.setGems)

  const [isPortfolioOpen, setIsPortfolioOpen] = useState(false)
  const [isTemplatesOpen, setIsTemplatesOpen] = useState(false)
  const [isShowcaseOpen, setIsShowcaseOpen] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isAuthOpen, setIsAuthOpen] = useState(false)
  const [showcaseTitle, setShowcaseTitle] = useState('Custom Tooth Gem Design')

  // Detección de ruta pública por parámetros de URL (Fase 13c)
  // Ej: https://midominio.com/?set=design-12345
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const targetSetId = params.get('set') || params.get('design')
    const showcaseFlag = params.get('showcase')

    if (targetSetId) {
      const publicDesigns = getPublicDesigns()
      const found = publicDesigns.find((d) => d.id === targetSetId)
      if (found) {
        setGems(found.gems)
        if (found.backgroundId) {
          setBackgroundId(found.backgroundId as BackgroundId)
        }
        setShowcaseTitle(found.title)
        setIsShowcaseOpen(true)
      }
    } else if (showcaseFlag === 'true') {
      setIsShowcaseOpen(true)
    }
  }, [setGems, setBackgroundId])

  const handleOpenShowcase = (title?: string) => {
    if (title) setShowcaseTitle(title)
    setIsShowcaseOpen(true)
  }

  return (
    <div className="flex flex-col w-screen h-screen overflow-hidden bg-[#07090e] text-slate-100 select-none">
      {/* Barra superior con navegación, herramientas, estudio y autenticación */}
      <Header
        onOpenPortfolio={() => setIsPortfolioOpen(true)}
        onOpenTemplates={() => setIsTemplatesOpen(true)}
        onOpenShowcase={() => handleOpenShowcase()}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
      />

      {/* Área central con vistas: 3D, Vista Dual, o Odontograma 2D (Fase 9) */}
      <main className="flex-1 w-full h-full relative overflow-hidden flex flex-col">
        {viewMode === '3d' && (
          <div className="flex-1 w-full h-full relative">
            <MainScene />
          </div>
        )}

        {viewMode === 'dual' && (
          <div className="flex-1 w-full h-full flex flex-col lg:flex-row overflow-hidden">
            {/* Lienzo 3D (60%) */}
            <div className="flex-[3] w-full h-full relative border-b lg:border-b-0 lg:border-r border-slate-800">
              <MainScene />
            </div>
            {/* Odontograma Clínico 2D (40%) */}
            <div className="flex-[2] w-full h-full relative bg-slate-950/95 overflow-hidden">
              <Odontogram2D />
            </div>
          </div>
        )}

        {viewMode === 'odontogram' && (
          <div className="flex-1 w-full h-full relative">
            <Odontogram2D />
          </div>
        )}
      </main>

      {/* Modales de funcionalidad */}
      <PortfolioModal
        isOpen={isPortfolioOpen}
        onClose={() => setIsPortfolioOpen(false)}
        onOpenShowcase={(title) => handleOpenShowcase(title)}
      />

      <TemplatesModal
        isOpen={isTemplatesOpen}
        onClose={() => setIsTemplatesOpen(false)}
      />

      <ClientShowcaseModal
        isOpen={isShowcaseOpen}
        designTitle={showcaseTitle}
        onClose={() => setIsShowcaseOpen(false)}
      />

      <StudioSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      {/* Modal de Autenticación de Usuario (Fase 13a) */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
      />
    </div>
  )
}

export default App
