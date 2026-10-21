"use client"

import React, { useEffect, useState, useRef } from "react"
import { usePathname } from "next/navigation"
import { FullScreenGymLoader } from "./gym-loader"

const ROUTE_LABELS: Record<string, string> = {
  "/": "Cargando Dashboard...",
  "/atletas": "Cargando Atletas...",
  "/tienda": "Cargando Tienda (POS)...",
  "/membresias": "Cargando Membresías...",
  "/finanzas": "Cargando Finanzas...",
  "/empleados": "Cargando Empleados...",
  "/entrenadores": "Cargando Entrenadores...",
  "/asistencia": "Cargando Asistencia...",
  "/comunidad": "Cargando Comunidad...",
  "/ajustes": "Cargando Ajustes...",
  "/perfil": "Cargando Mi Perfil...",
  "/rutina": "Cargando Rutinas...",
  "/mis-atletas": "Cargando Mis Atletas...",
  "/inicio": "Cargando Inicio...",
}

function getLabelForPath(path: string): string {
  const clean = path.split("?")[0].split("#")[0]
  if (ROUTE_LABELS[clean]) return ROUTE_LABELS[clean]
  for (const [prefix, label] of Object.entries(ROUTE_LABELS)) {
    if (prefix !== "/" && clean.startsWith(prefix)) {
      return label
    }
  }
  return "Cargando módulo..."
}

export function ProgressiveRouteLoader() {
  const pathname = usePathname()
  const [isNavigating, setIsNavigating] = useState(false)
  const [targetLabel, setTargetLabel] = useState("Cargando módulo...")
  const [progress, setProgress] = useState(0)
  const [isClosing, setIsClosing] = useState(false)
  const lastPathRef = useRef(pathname)

  // Listen to link clicks globally
  useEffect(() => {
    const handleDocumentClick = (e: MouseEvent) => {
      // Don't trigger for modifier keys
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
      if (e.defaultPrevented) return

      const anchor = (e.target as HTMLElement)?.closest?.("a")
      if (!anchor) return

      const href = anchor.getAttribute("href")
      if (!href) return

      // Ignore external or non-navigational links
      if (
        href.startsWith("http://") ||
        href.startsWith("https://") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:") ||
        href.startsWith("#") ||
        href.startsWith("javascript:") ||
        anchor.target === "_blank" ||
        anchor.hasAttribute("download")
      ) {
        return
      }

      // Check destination path
      const current = window.location.pathname
      const targetPath = href.split("?")[0].split("#")[0]
      if (!targetPath || targetPath === current) return

      // Trigger progressive loader
      setTargetLabel(getLabelForPath(targetPath))
      setIsClosing(false)
      setProgress(15)
      setIsNavigating(true)
    }

    const handlePopState = () => {
      setTargetLabel("Cargando módulo...")
      setIsClosing(false)
      setProgress(25)
      setIsNavigating(true)
    }

    document.addEventListener("click", handleDocumentClick, true)
    window.addEventListener("popstate", handlePopState)

    return () => {
      document.removeEventListener("click", handleDocumentClick, true)
      window.removeEventListener("popstate", handlePopState)
    }
  }, [])

  // Smoothly increment progress while navigating
  useEffect(() => {
    if (!isNavigating || isClosing) return

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 92) return prev
        const remaining = 95 - prev
        const step = Math.max(1.5, remaining * 0.16)
        return Math.min(92, prev + step)
      })
    }, 110)

    // Safety timeout in case navigation is interrupted
    const timeout = setTimeout(() => {
      setIsClosing(true)
      setTimeout(() => {
        setIsNavigating(false)
        setProgress(0)
      }, 200)
    }, 3800)

    return () => {
      clearInterval(interval)
      clearTimeout(timeout)
    }
  }, [isNavigating, isClosing])

  // Complete progress when pathname changes
  useEffect(() => {
    if (pathname !== lastPathRef.current) {
      lastPathRef.current = pathname
      if (isNavigating) {
        setProgress(100)
        setIsClosing(true)
        const timer = setTimeout(() => {
          setIsNavigating(false)
          setProgress(0)
          setIsClosing(false)
        }, 180)
        return () => clearTimeout(timer)
      }
    }
  }, [pathname, isNavigating])

  if (!isNavigating) return null

  return (
    <div
      className={`fixed top-0 left-0 right-0 h-[3px] z-[99999] pointer-events-none transition-opacity duration-300 ${
        isClosing ? "opacity-0" : "opacity-100"
      }`}
    >
      <div
        className="h-full bg-gradient-to-r from-primary via-amber-400 to-emerald-400 transition-[width] duration-150 ease-out shadow-[0_0_10px_rgba(212,175,55,0.7)]"
        style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
      />
    </div>
  )
}
