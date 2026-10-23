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
    ? (darkCandidate || lightCandidate)
    : (lightCandidate || darkCandidate)

  useEffect(() => {
    setImgError(false)
  }, [rawLogo])

  const logoSrc = !imgError && rawLogo ? rawLogo : ""
  const appName = settings.appName || cachedName || ""

  const logoH = size === "sm" ? 44 : size === "md" ? 64 : 85
  const spinnerSize = size === "sm" ? 28 : size === "md" ? 36 : 44

  return (
    <div className={`flex flex-col items-center justify-center select-none ${className}`}>
      <div className="relative flex flex-col items-center">
        {/* Soft Ambient Brand Glow */}
        <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full scale-125 animate-pulse pointer-events-none" />

        {logoSrc ? (
          <div className="relative z-10 flex flex-col items-center mb-5">
            <img
              src={logoSrc}
              alt={appName || "Logo"}
              onError={() => setImgError(true)}
              style={{
                height: logoH,
                maxWidth: 240,
                objectFit: "contain",
              }}
              className="drop-shadow-lg transition-transform animate-pulse"
            />
            {appName && size !== "sm" && (
              <span className="font-display font-black text-lg md:text-2xl uppercase tracking-wider text-foreground mt-2 drop-shadow">
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

        {/* Spinner Redondo Minimalista */}
        <div className="relative z-10 flex flex-col items-center gap-3">
          <div 
            className="rounded-full border-[3px] border-primary/20 border-t-primary animate-spin"
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
    <div className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background/90 dark:bg-black/90 backdrop-blur-xl transition-all duration-300 ${className}`}>
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
