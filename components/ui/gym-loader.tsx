"use client"

import React, { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import { useSettings } from "@/lib/settings-context"
import { useTheme } from "next-themes"

interface GymLoaderProps {
  size?: "sm" | "md" | "lg"
  text?: string
  showQuote?: boolean
  className?: string
  progressive?: boolean
  progress?: number
}

export function GymLoader({
  size = "md",
  text,
  className = "",
}: GymLoaderProps) {
  const { settings } = useSettings()
  const { theme, resolvedTheme } = useTheme()
  const [imgError, setImgError] = useState(false)

  const isDark = (resolvedTheme || theme) === "dark"
  
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

  // Resolver logo con prioridad de tema y caché
  const darkCandidate = settings.logoUrlDark || cachedLogoDark
  const lightCandidate = settings.logoUrl || cachedLogo
  const rawLogo = isDark
    ? (darkCandidate || lightCandidate || "/uploads/sys_logourldark_8456539f5fe89f8796d1f53a.png")
    : (lightCandidate || darkCandidate || "/uploads/sys_logourl_537fc153bd61e2b18a3bf2de.png")

  useEffect(() => {
    setImgError(false)
  }, [rawLogo])

  const logoSrc = !imgError && rawLogo ? rawLogo : ""
  const appName = settings.appName || cachedName || ""

  const spinnerSize = size === "sm" ? 24 : size === "md" ? 32 : 40

  const logoClasses =
    size === "sm"
      ? "max-h-12 max-w-[140px]"
      : size === "md"
      ? "max-h-16 max-w-[200px]"
      : "max-h-24 sm:max-h-28 max-w-[280px] sm:max-w-[340px]"

  return (
    <div className={`flex flex-col items-center justify-center select-none ${className}`}>
      <div className="relative flex flex-col items-center">
        {/* Soft Ambient Brand Glow detrás del logo */}
        <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full scale-125 animate-pulse pointer-events-none" />

        {logoSrc ? (
          <div className="relative z-10 flex flex-col items-center mb-4">
            <div className="relative flex items-center justify-center p-2">
              <img
                src={logoSrc}
                alt={appName || "Logo"}
                onError={() => setImgError(true)}
                className={`w-auto h-auto object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.45)] transition-all duration-500 ${logoClasses}`}
              />
            </div>
            {appName && size === "lg" && (
              <span className="font-display font-black text-lg md:text-xl uppercase tracking-wider text-foreground mt-2 drop-shadow">
                {appName}
              </span>
            )}
          </div>
        ) : (
          appName && (
            <div className="relative z-10 flex flex-col items-center mb-4">
              <span className="font-display font-black text-xl md:text-2xl uppercase tracking-wider text-foreground drop-shadow">
                {appName}
              </span>
            </div>
          )
        )}

        {/* Spinner Redondo Minimalista con Pulso */}
        <div className="relative z-10 flex flex-col items-center gap-3">
          <div 
            className="rounded-full border-[3px] border-primary/20 border-t-primary animate-spin shadow-sm"
            style={{ width: spinnerSize, height: spinnerSize }}
          />
          {text && (
            <span className="text-xs md:text-sm font-semibold tracking-wide text-muted-foreground animate-pulse text-center">
              {text}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

export function FullScreenGymLoader({
  text,
  className = "",
}: {
  text?: string
  showQuote?: boolean
  progressive?: boolean
  progress?: number
  className?: string
}) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const loaderOverlay = (
    <div className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background/95 dark:bg-[#09090b]/95 backdrop-blur-2xl transition-all duration-300 ${className}`}>
      <GymLoader
        size="lg"
        text={text}
      />
    </div>
  )

  if (mounted && typeof document !== "undefined") {
    return createPortal(loaderOverlay, document.body)
  }

  return loaderOverlay
}
