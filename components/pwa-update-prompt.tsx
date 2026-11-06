"use client"

import { useState, useEffect, useRef } from "react"
import { RefreshCw, Sparkles, X, ArrowUpCircle } from "lucide-react"

export function PWAUpdatePrompt() {
  const [hasUpdate, setHasUpdate] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)
  const waitingWorkerRef = useRef<ServiceWorker | null>(null)
  const initialBuildIdRef = useRef<string | null>(null)

  useEffect(() => {
    if (typeof window === "undefined") return

    // 1. Escuchar actualizaciones vía Service Worker (PWA nativo)
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.ready.then((reg) => {
        // Verificar si ya hay un worker esperando
        if (reg.waiting) {
          waitingWorkerRef.current = reg.waiting
          setHasUpdate(true)
        }

        // Detectar cuando se descarga un nuevo worker
        reg.addEventListener("updatefound", () => {
          const newWorker = reg.installing
          if (!newWorker) return

          newWorker.addEventListener("statechange", () => {
            if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
              waitingWorkerRef.current = newWorker
              setHasUpdate(true)
            }
          })
        })

        // Comprobar actualizaciones al volver a enfocar la app o cambiar de pestaña
        const checkSWUpdate = () => {
          reg.update().catch(() => {})
        }

        document.addEventListener("visibilitychange", () => {
          if (document.visibilityState === "visible") {
            checkSWUpdate()
          }
        })
      }).catch(() => {})

      // Recargar automáticamente si el nuevo worker toma el control
      let refreshing = false
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        if (!refreshing) {
          refreshing = true
          window.location.reload()
        }
      })
    }

    // 2. Detección secundaria inteligente vía API de versión del servidor (/api/version)
    const checkServerVersion = async () => {
      try {
        const res = await fetch(`/api/version?t=${Date.now()}`, {
          cache: "no-store",
          headers: { Pragma: "no-cache", "Cache-Control": "no-cache" },
        })
        if (!res.ok) return
        const data = await res.json()
        const currentBuildId = data.buildId

        if (!initialBuildIdRef.current) {
          const savedId = sessionStorage.getItem("maxfit_initial_build_id")
          if (savedId) {
            initialBuildIdRef.current = savedId
          } else {
            initialBuildIdRef.current = currentBuildId
            sessionStorage.setItem("maxfit_initial_build_id", currentBuildId)
          }
        }

        // Si el buildId del servidor difiere del que cargó la app, hay un nuevo despliegue
        if (
          initialBuildIdRef.current &&
          currentBuildId &&
          initialBuildIdRef.current !== currentBuildId
        ) {
          setHasUpdate(true)
        }
      } catch (_) {}
    }

    // Verificar al inicio y cada 3 minutos
    checkServerVersion()
    const interval = setInterval(checkServerVersion, 3 * 60 * 1000)

    const onVisibility = () => {
      if (document.visibilityState === "visible") {
        checkServerVersion()
      }
    }
    document.addEventListener("visibilitychange", onVisibility)

    return () => {
      clearInterval(interval)
      document.removeEventListener("visibilitychange", onVisibility)
    }
  }, [])

  const handleApplyUpdate = async () => {
    setIsUpdating(true)
    try {
      // 1. Indicar al nuevo Service Worker que tome el control de inmediato
      if (waitingWorkerRef.current) {
        waitingWorkerRef.current.postMessage({ type: "SKIP_WAITING" })
      }

      // 2. Limpiar cachés viejas de la PWA
      if ("caches" in window) {
        const keys = await caches.keys()
        await Promise.all(keys.map((k) => caches.delete(k)))
      }

      // 3. Actualizar build ID en sessionStorage
      sessionStorage.removeItem("maxfit_initial_build_id")
    } catch (_) {}
    finally {
      // 4. Recarga suave manteniendo sesión y credenciales
      setTimeout(() => {
        window.location.reload()
      }, 300)
    }
  }

  if (!hasUpdate || isDismissed) return null

  return (
    <aside
      role="alert"
      aria-live="polite"
      className="fixed bottom-3 left-3 right-3 sm:left-auto sm:right-6 sm:bottom-6 sm:w-[420px] z-[999999] animate-in slide-in-from-bottom-5 duration-300 pointer-events-auto"
    >
      <div className="bg-card/95 backdrop-blur-xl border-2 border-primary/50 rounded-2xl p-4 shadow-2xl text-foreground relative overflow-hidden">
        {/* Efecto de brillo de fondo */}
        <div className="absolute -top-12 -right-12 w-28 h-28 bg-primary/20 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-start gap-3 relative z-10">
          <div className="w-10 h-10 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center shrink-0 text-primary mt-0.5">
            <ArrowUpCircle className="w-5 h-5 animate-bounce" />
          </div>

          <div className="flex-1 min-w-0 pr-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-extrabold text-sm text-foreground tracking-tight">
                Nueva versión lista
              </span>
              <span className="inline-flex items-center gap-0.5 bg-primary text-black font-black text-[9px] px-1.5 py-0.2 rounded-full uppercase tracking-wider">
                <Sparkles className="w-2.5 h-2.5" />
                Actualización
              </span>
            </div>

            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              Hemos publicado cambios y mejoras en <strong>MaximumAPP</strong>. Actualiza con 1 toque sin desinstalar ni perder tu sesión.
            </p>

            <div className="mt-3 flex items-center gap-2">
              <button
                onClick={handleApplyUpdate}
                disabled={isUpdating}
                className="bg-primary hover:bg-primary/90 text-black font-black text-xs px-3.5 py-2 rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isUpdating ? "animate-spin" : ""}`} />
                <span>{isUpdating ? "Actualizando..." : "Actualizar ahora"}</span>
              </button>

              <button
                onClick={() => setIsDismissed(true)}
                className="text-xs text-muted-foreground hover:text-foreground px-2.5 py-2 rounded-xl transition cursor-pointer"
              >
                Más tarde
              </button>
            </div>
          </div>

          <button
            onClick={() => setIsDismissed(true)}
            className="text-muted-foreground hover:text-foreground p-1 rounded-lg transition shrink-0"
            title="Cerrar aviso"
            aria-label="Cerrar aviso de actualización"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  )
}
