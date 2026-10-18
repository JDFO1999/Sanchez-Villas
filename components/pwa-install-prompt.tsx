"use client"

import { useState, useEffect } from "react"
import { Download, X, Share, PlusSquare, Smartphone } from "lucide-react"

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [isIOS, setIsIOS] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)
  const [showPrompt, setShowPrompt] = useState(false)
  const [showIOSInstructions, setShowIOSInstructions] = useState(false)

  useEffect(() => {
    // 1. Detectar si ya está instalada o ejecutándose en modo standalone
    const isStandaloneMode = 
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true

    if (isStandaloneMode) {
      setIsStandalone(true)
      return
    }

    // 2. Registrar el Service Worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch((err) => {
        console.warn('Error al registrar Service Worker:', err)
      })
    }

    // 3. Detectar si el usuario ya descartó el aviso en las últimas 24 horas
    const dismissedAt = localStorage.getItem('maximumfit_pwa_dismissed')
    if (dismissedAt) {
      const diffHours = (Date.now() - parseInt(dismissedAt, 10)) / (1000 * 60 * 60)
      if (diffHours < 24) return
    }

    // 4. Detectar si es iOS / Safari
    const ua = window.navigator.userAgent.toLowerCase()
    const isIOSDevice = /iphone|ipad|ipod/.test(ua)
    setIsIOS(isIOSDevice)

    // 5. Escuchar evento de instalación estándar (Android / Chrome / Edge)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShowPrompt(true)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    // En iOS Safari no existe beforeinstallprompt, mostramos el banner después de 3 segundos
    let iosTimer: any = null
    if (isIOSDevice) {
      iosTimer = setTimeout(() => {
        setShowPrompt(true)
      }, 3000)
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      if (iosTimer) clearTimeout(iosTimer)
    }
  }, [])

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      if (outcome === 'accepted') {
        setShowPrompt(false)
      }
      setDeferredPrompt(null)
    } else if (isIOS) {
      setShowIOSInstructions(true)
    }
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    setShowIOSInstructions(false)
    localStorage.setItem('maximumfit_pwa_dismissed', Date.now().toString())
  }

  if (isStandalone || !showPrompt) return null

  return (
    <>
      {/* Banner flotante discreto y elegante en móviles */}
      <aside aria-label="Instalar MaximumFitAPP" className="fixed bottom-20 lg:bottom-6 left-4 right-4 sm:left-auto sm:right-6 sm:w-96 z-50 animate-in slide-in-from-bottom-5 duration-300">
        <div className="bg-card/95 backdrop-blur-xl border-2 border-primary/40 rounded-2xl p-4 shadow-2xl glass text-foreground flex items-center justify-between gap-3 relative">
          
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-12 h-12 rounded-xl bg-primary/20 border border-primary/40 flex items-center justify-center text-primary shrink-0 shadow-inner">
              <Smartphone className="w-6 h-6 animate-pulse" />
            </div>
            <div className="min-w-0">
              <h4 className="font-black text-sm text-foreground tracking-tight flex items-center gap-1.5">
                <span>MaximumFitAPP</span>
                <span className="text-[10px] bg-primary text-black font-extrabold px-1.5 py-0.2 rounded-full uppercase">App</span>
              </h4>
              <p className="text-xs text-muted-foreground truncate mt-0.5">
                Instálala en tu teléfono para acceso rápido y pantalla completa.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={handleInstallClick}
              className="bg-primary hover:bg-primary/90 text-black font-black text-xs px-3.5 py-2 rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-1.5 whitespace-nowrap"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Instalar</span>
            </button>
            <button
              onClick={handleDismiss}
              className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg transition"
              title="Cerrar aviso"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Modal interactivo de instrucciones paso a paso para iOS Safari */}
      {showIOSInstructions && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-card border border-black/10 dark:border-white/10 rounded-3xl max-w-sm w-full p-6 shadow-2xl glass relative text-foreground space-y-4">
            <div className="flex justify-between items-center border-b border-black/10 dark:border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
                  <Smartphone className="w-4 h-4" />
                </div>
                <h3 className="font-black text-base">Instalar MaximumFitAPP</h3>
              </div>
              <button onClick={() => setShowIOSInstructions(false)} className="text-muted-foreground hover:text-foreground p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-muted-foreground">
              En tu iPhone o iPad, puedes instalarla en tu pantalla de inicio siguiendo estos 2 sencillos pasos:
            </p>

            <div className="space-y-3 bg-black/5 dark:bg-black/40 p-4 rounded-2xl border border-black/5 dark:border-white/5">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/20 text-primary font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  1
                </div>
                <div className="text-xs">
                  <p className="font-bold">Presiona el botón Compartir</p>
                  <p className="text-muted-foreground mt-0.5 flex items-center gap-1">
                    Es el icono con flecha hacia arriba (<Share className="w-3.5 h-3.5 inline text-primary" />) en la barra inferior de Safari.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/20 text-primary font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  2
                </div>
                <div className="text-xs">
                  <p className="font-bold">Selecciona &quot;Agregar a Inicio&quot;</p>
                  <p className="text-muted-foreground mt-0.5 flex items-center gap-1">
                    Toca en <PlusSquare className="w-3.5 h-3.5 inline text-primary" /> <b>&quot;Agregar a pantalla de inicio&quot;</b> y confirma.
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowIOSInstructions(false)}
              className="w-full bg-primary text-black font-extrabold py-3 rounded-xl shadow-lg hover:bg-primary/90 transition text-sm"
            >
              ¡Entendido!
            </button>
          </div>
        </div>
      )}
    </>
  )
}
