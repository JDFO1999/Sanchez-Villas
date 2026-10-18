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
}

const FITNESS_QUOTES = [
  "Cargando peso a la barra...",
  "Ajustando las mancuernas...",
  "Preparando tu próxima serie...",
  "La disciplina vence a la motivación...",
  "Sin excusas, cada repetición cuenta...",
  "Calibrando las máquinas...",
  "Foco, fuerza y constancia...",
]

export function GymLoader({
  size = "md",
  text,
  showQuote = true,
  className = "",
}: GymLoaderProps) {
  const { settings } = useSettings()
  const { theme, resolvedTheme } = useTheme()
  const [quoteIndex, setQuoteIndex] = useState(0)

  const isDark = (resolvedTheme || theme) === "dark"
  const logoSrc = isDark 
    ? (settings.logoUrlDark || settings.logoUrl) 
    : (settings.logoUrl || settings.logoUrlDark)

  useEffect(() => {
    if (!showQuote) return
    const interval = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % FITNESS_QUOTES.length)
    }, 2400)
    return () => clearInterval(interval)
  }, [showQuote])

  const dimensions = {
    sm: { width: 140, height: 48, barH: 4, plateH: 28, plateW: 8, text: "text-xs" },
    md: { width: 210, height: 70, barH: 6, plateH: 44, plateW: 11, text: "text-sm" },
    lg: { width: 280, height: 92, barH: 8, plateH: 60, plateW: 16, text: "text-base" },
  }[size]

  // Dimensiones notablemente aumentadas para un impacto visual imponente
  const logoH = size === "sm" ? 70 : size === "md" ? 110 : 160
  const logoMaxW = size === "sm" ? 220 : size === "md" ? 340 : 460

  return (
    <div className={`flex flex-col items-center justify-center select-none ${className}`}>
      {/* Brand Logo or Name prominently displayed */}
      {logoSrc ? (
        <div className="mb-8 relative flex flex-col items-center">
          {/* Glowing Aura detrás del logo */}
          <div className="absolute inset-0 bg-primary/30 blur-3xl rounded-full scale-150 animate-logo-glow pointer-events-none" />
          <img
            src={logoSrc}
            alt={settings.appName || "Logo Empresa"}
            style={{
              height: logoH,
              maxWidth: logoMaxW,
              objectFit: "contain",
            }}
            className="relative z-10 drop-shadow-[0_10px_25px_rgba(0,0,0,0.5)] transition-all animate-pulse"
          />
          {settings?.appName && size !== "sm" && (
            <span className="font-display font-black text-xl md:text-3xl uppercase tracking-wider text-foreground mt-3 drop-shadow">
              {settings.appName}
            </span>
          )}
        </div>
      ) : settings?.appName ? (
        <div className="mb-6 flex flex-col items-center">
          <div className="px-6 py-3 rounded-2xl bg-primary/15 border-2 border-primary/40 text-primary font-black uppercase tracking-widest text-xl md:text-3xl shadow-xl">
            {settings.appName}
          </div>
        </div>
      ) : null}

      {/* Animated Olympic Barbell */}
      <div
        className="relative flex items-center justify-center"
        style={{ width: dimensions.width, height: dimensions.height }}
      >
        {/* Ambient Glow */}
        <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full animate-pulse pointer-events-none" />

        {/* Barbell Assembly Container with Bench Press / Deadlift vertical motion */}
        <div className="relative w-full flex items-center justify-center animate-gym-lift">
          {/* Outer Left Plate */}
          <div
            className="rounded-sm bg-gradient-to-b from-zinc-700 via-zinc-900 to-black border border-primary/50 shadow-lg shadow-black/60 relative"
            style={{
              width: dimensions.plateW * 0.75,
              height: dimensions.plateH * 0.75,
              marginRight: 2,
            }}
          >
            <div className="absolute inset-0 bg-primary/10 rounded-sm" />
          </div>

          {/* Medium Left Plate */}
          <div
            className="rounded-sm bg-gradient-to-b from-zinc-600 via-zinc-800 to-black border border-primary/60 shadow-lg shadow-black/60 relative"
            style={{
              width: dimensions.plateW * 0.85,
              height: dimensions.plateH * 0.88,
              marginRight: 2,
            }}
          >
            <div className="absolute inset-0 bg-primary/15 rounded-sm" />
          </div>

          {/* Heavy Inner Left Plate (45LB / 20KG) */}
          <div
            className="rounded-sm bg-gradient-to-b from-zinc-500 via-zinc-800 to-black border-2 border-primary shadow-xl shadow-primary/25 relative"
            style={{
              width: dimensions.plateW,
              height: dimensions.plateH,
              marginRight: 4,
            }}
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-1 h-3 rounded-full bg-primary/80 animate-ping opacity-75" />
            </div>
          </div>

          {/* Left Collar / Grip Ring */}
          <div
            className="rounded-xs bg-amber-400 border border-amber-300 shadow-sm"
            style={{ width: 4, height: dimensions.plateH * 0.5 }}
          />

          {/* Steel Knurled Bar */}
          <div
            className="flex-1 bg-gradient-to-r from-zinc-400 via-zinc-100 to-zinc-400 dark:from-zinc-500 dark:via-zinc-200 dark:to-zinc-500 shadow-md relative overflow-hidden rounded-full"
            style={{ height: dimensions.barH, minWidth: 40 }}
          >
            {/* Knurling texture highlights */}
            <div className="absolute inset-0 bg-[repeating-linear-gradient(90deg,transparent,transparent_3px,rgba(0,0,0,0.25)_3px,rgba(0,0,0,0.25)_5px)] opacity-60" />
            {/* Center ring marker */}
            <div className="absolute left-1/2 top-0 bottom-0 w-1.5 -translate-x-1/2 bg-primary/80" />
          </div>

          {/* Right Collar / Grip Ring */}
          <div
            className="rounded-xs bg-amber-400 border border-amber-300 shadow-sm"
            style={{ width: 4, height: dimensions.plateH * 0.5 }}
          />

          {/* Heavy Inner Right Plate (45LB / 20KG) */}
          <div
            className="rounded-sm bg-gradient-to-b from-zinc-500 via-zinc-800 to-black border-2 border-primary shadow-xl shadow-primary/25 relative"
            style={{
              width: dimensions.plateW,
              height: dimensions.plateH,
              marginLeft: 4,
            }}
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-1 h-3 rounded-full bg-primary/80 animate-ping opacity-75" />
            </div>
          </div>

          {/* Medium Right Plate */}
          <div
            className="rounded-sm bg-gradient-to-b from-zinc-600 via-zinc-800 to-black border border-primary/60 shadow-lg shadow-black/60 relative"
            style={{
              width: dimensions.plateW * 0.85,
              height: dimensions.plateH * 0.88,
              marginLeft: 2,
            }}
          >
            <div className="absolute inset-0 bg-primary/15 rounded-sm" />
          </div>

          {/* Outer Right Plate */}
          <div
            className="rounded-sm bg-gradient-to-b from-zinc-700 via-zinc-900 to-black border border-primary/50 shadow-lg shadow-black/60 relative"
            style={{
              width: dimensions.plateW * 0.75,
              height: dimensions.plateH * 0.75,
              marginLeft: 2,
            }}
          >
            <div className="absolute inset-0 bg-primary/10 rounded-sm" />
          </div>
        </div>
      </div>

      {/* Gym Rep Cadence Pulse Bar */}
      <div className="w-32 h-1 bg-zinc-800 rounded-full mt-4 overflow-hidden relative">
        <div className="h-full bg-gradient-to-r from-primary/50 via-primary to-primary/50 rounded-full animate-gym-bar-pulse" />
      </div>

      {/* Dynamic Motivational Slogan or Custom Text */}
      <div className="mt-3.5 text-center px-4 max-w-sm">
        <p className={`font-semibold tracking-wide text-foreground transition-all duration-300 ${dimensions.text}`}>
          {text || (showQuote ? FITNESS_QUOTES[quoteIndex] : "Cargando...")}
        </p>
      </div>

      <style jsx global>{`
        @keyframes gymLift {
          0%, 100% {
            transform: translateY(4px) scale(0.98);
          }
          50% {
            transform: translateY(-8px) scale(1.02);
          }
        }
        @keyframes gymBarPulse {
          0% {
            transform: translateX(-100%);
          }
          50% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        .animate-gym-lift {
          animation: gymLift 1.8s ease-in-out infinite;
        }
        .animate-gym-bar-pulse {
          animation: gymBarPulse 1.8s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}

export function FullScreenGymLoader({
  text,
  showQuote = true,
}: {
  text?: string
  showQuote?: boolean
}) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const loaderOverlay = (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white/75 dark:bg-black/80 backdrop-blur-xl transition-all duration-300">
      <GymLoader size="lg" text={text} showQuote={showQuote} />
    </div>
  )

  if (mounted && typeof document !== "undefined") {
    return createPortal(loaderOverlay, document.body)
  }

  return loaderOverlay
}

