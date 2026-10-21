"use client"

import React, { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import { useSettings } from "@/lib/settings-context"
import { useTheme } from "next-themes"
import { Dumbbell } from "lucide-react"

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
  let cachedName = ""
  if (typeof window !== "undefined") {
    try {
      const saved = localStorage.getItem("gympro_settings")
      if (saved) {
        const parsed = JSON.parse(saved)
        cachedLogo = (isDark && parsed.logoUrlDark) ? parsed.logoUrlDark : (parsed.logoUrl || parsed.logoUrlDark || "")
        cachedName = parsed.appName || ""
      }
    } catch {}
  }

  const rawLogo = (isDark && settings.logoUrlDark)
    ? settings.logoUrlDark
    : (settings.logoUrl || settings.logoUrlDark || cachedLogo)

  useEffect(() => {
    setImgError(false)
  }, [rawLogo])

  const logoSrc = !imgError && rawLogo ? rawLogo : ""
  const appName = settings.appName || cachedName || ""

  const logoH = size === "sm" ? 50 : size === "md" ? 75 : 95

  return (
    <div className={`flex flex-col items-center justify-center select-none ${className}`}>
      <div className="relative flex flex-col items-center">
        {/* Soft Ambient Brand Glow */}
        <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full scale-125 animate-pulse pointer-events-none" />

        {logoSrc ? (
          <div className="relative z-10 flex flex-col items-center mb-4">
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
          <div className="relative z-10 flex flex-col items-center mb-4">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-primary/15 border border-primary/40 flex items-center justify-center shadow-lg shadow-primary/20 animate-pulse">
              <Dumbbell className="w-8 h-8 md:w-10 md:h-10 text-primary" />
            </div>
            {appName && (
              <span className="font-display font-black text-lg md:text-xl uppercase tracking-wider text-foreground mt-2">
                {appName}
              </span>
            )}
          </div>
        )}

        {/* Minimalist Spinner & Status Text */}
        <div className="flex items-center gap-2.5">
          <div className="w-4 h-4 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
          <span className="text-xs md:text-sm font-semibold tracking-wide text-muted-foreground">
            {text || "Cargando..."}
          </span>
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
