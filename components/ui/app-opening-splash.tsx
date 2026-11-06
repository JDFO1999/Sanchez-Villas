"use client"

import React, { useEffect, useState } from "react"
import { useSettings } from "@/lib/settings-context"
import { useTheme } from "next-themes"

export function AppOpeningSplash() {
  const { settings } = useSettings()
  const { theme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [visible, setVisible] = useState(true)
  const [closing, setClosing] = useState(false)
  const [imgError, setImgError] = useState(false)

  const isDark = (resolvedTheme || theme) === "dark"

  // Resolver logo con prioridad de tema y caché
  let cachedLogo = ""
  let cachedLogoDark = ""
  let cachedName = ""
  if (typeof window !== "undefined") {
    try {
      const winSettings = (window as any).__INITIAL_SETTINGS__
      if (winSettings) {
        cachedLogo = winSettings.logoUrl || ""
        cachedLogoDark = winSettings.logoUrlDark || ""
        cachedName = winSettings.appName || ""
      }
      if (!cachedLogo && !cachedLogoDark) {
        const saved = localStorage.getItem("gympro_settings")
        if (saved) {
          const parsed = JSON.parse(saved)
          cachedLogo = parsed.logoUrl || ""
          cachedLogoDark = parsed.logoUrlDark || ""
          cachedName = parsed.appName || ""
        }
      }
    } catch {}
  }

  const darkCandidate = settings.logoUrlDark || cachedLogoDark
  const lightCandidate = settings.logoUrl || cachedLogo
  const rawLogo = isDark
    ? (darkCandidate || lightCandidate || "/uploads/sys_logourldark_8456539f5fe89f8796d1f53a.png")
    : (lightCandidate || darkCandidate || "/uploads/sys_logourl_537fc153bd61e2b18a3bf2de.png")

  const logoSrc = !imgError && rawLogo ? rawLogo : ""
  const appName = settings.appName || cachedName || "Maximum Evolution Fit"

  useEffect(() => {
    // Verificar si ya se mostró en esta sesión de navegación para no ser intrusivo
    const alreadyShown = sessionStorage.getItem("maximumfit_opening_splash_shown")
    if (alreadyShown === "true") {
      setVisible(false)
      return
    }

    setMounted(true)

    // Tiempo de animación elegante al abrir la app (~900ms para lucir el efecto)
    const timer = setTimeout(() => {
      setClosing(true)
      sessionStorage.setItem("maximumfit_opening_splash_shown", "true")
      
      const removeTimer = setTimeout(() => {
        setVisible(false)
      }, 700) // Duración del fade-out

      return () => clearTimeout(removeTimer)
    }, 950)

    return () => clearTimeout(timer)
  }, [])

  if (!visible) return null

  return (
    <div
      aria-hidden="true"
      className={`fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-[#09090b] text-white select-none transition-all duration-700 ease-out ${
        closing ? "opacity-0 scale-105 pointer-events-none" : "opacity-100 scale-100 pointer-events-auto"
      }`}
    >
      {/* Fondo con resplandor ambiental radial premium */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] sm:w-[460px] h-[340px] sm:h-[460px] bg-primary/20 rounded-full blur-[110px] animate-pulse" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[220px] h-[220px] bg-primary/15 rounded-full blur-[60px]" />
      </div>

      <div className="relative z-10 flex flex-col items-center max-w-sm px-6 text-center animate-in fade-in zoom-in-95 duration-700">
        {/* Contenedor del Logo 100% completo, sin recortes */}
        <div className="relative flex items-center justify-center p-3 mb-4 group">
          {logoSrc ? (
            <div className="relative overflow-hidden rounded-2xl p-2">
              <img
                src={logoSrc}
                alt={appName}
                onError={() => setImgError(true)}
                className="w-auto h-auto max-w-[260px] sm:max-w-[320px] max-h-[140px] sm:max-h-[170px] object-contain drop-shadow-[0_15px_30px_rgba(0,0,0,0.7)] transition-transform duration-700"
              />
              {/* Efecto de destello de luz sutil cruzando el logo */}
              <div 
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-[shimmer_2s_infinite] pointer-events-none"
                style={{
                  animation: "shimmerSweep 2.2s infinite ease-in-out"
                }}
              />
            </div>
          ) : (
            <div className="w-24 h-24 rounded-3xl bg-primary/20 border-2 border-primary/40 flex items-center justify-center text-primary font-black text-4xl shadow-2xl">
              {appName.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        {/* Nombre y Eslogan de la App */}
        <div className="space-y-1 mb-8">
          <h1 className="font-display font-black text-xl sm:text-2xl uppercase tracking-widest text-white drop-shadow-md">
            {appName}
          </h1>
          <p className="text-[11px] sm:text-xs font-semibold tracking-[0.25em] text-primary uppercase opacity-90 drop-shadow">
            Maximum Performance & Fitness
          </p>
        </div>

        {/* Barra de progreso de energía dorada minimalista */}
        <div className="w-44 h-1.5 rounded-full bg-white/10 overflow-hidden relative p-[1px] shadow-inner">
          <div className="h-full bg-gradient-to-r from-primary/50 via-primary to-amber-300 rounded-full animate-[pulse_1.5s_infinite] w-full origin-left transition-all duration-700" />
        </div>
      </div>

      <style jsx>{`
        @keyframes shimmerSweep {
          0% {
            transform: translateX(-100%) rotate(15deg);
          }
          60%, 100% {
            transform: translateX(200%) rotate(15deg);
          }
        }
      `}</style>
    </div>
  )
}
