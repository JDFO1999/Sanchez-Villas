"use client"

import React, { useState, useRef, useCallback } from "react"
import { Move, RotateCcw, Upload, ArrowUp, ArrowDown } from "lucide-react"

interface DraggableImageFrameProps {
  src: string
  position?: string // "x% y%", ej: "50% 50%"
  onChange: (newPosition: string) => void
  label?: string
  aspectRatio?: string // default "aspect-[3/4]"
  className?: string
  onUpload?: (dataUrl: string) => void
}

export function DraggableImageFrame({
  src,
  position = "50% 50%",
  onChange,
  label,
  aspectRatio = "aspect-[3/4]",
  className = "",
  onUpload,
}: DraggableImageFrameProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const dragStartRef = useRef<{ mouseX: number; mouseY: number; posX: number; posY: number }>({
    mouseX: 0,
    mouseY: 0,
    posX: 50,
    posY: 50,
  })

  // Parsear posición porcentual "X% Y%"
  const parsePos = useCallback((posStr?: string) => {
    if (!posStr) return { x: 50, y: 50 }
    const parts = posStr.trim().split(/\s+/)
    const x = parseFloat(parts[0]) || 50
    const y = parseFloat(parts[1]) || 50
    return { x, y }
  }, [])

  const currentPos = parsePos(position)

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!src) return
    e.preventDefault()
    setIsDragging(true)
    dragStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      posX: currentPos.x,
      posY: currentPos.y,
    }

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      const deltaX = moveEvent.clientX - dragStartRef.current.mouseX
      const deltaY = moveEvent.clientY - dragStartRef.current.mouseY

      // Al arrastrar a la izquierda o arriba, desplazamos el punto focal
      const newX = Math.max(0, Math.min(100, Math.round(dragStartRef.current.posX - (deltaX / rect.width) * 100)))
      const newY = Math.max(0, Math.min(100, Math.round(dragStartRef.current.posY - (deltaY / rect.height) * 100)))

      onChange(`${newX}% ${newY}%`)
    }

    const handleMouseUp = () => {
      setIsDragging(false)
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("mouseup", handleMouseUp)
    }

    window.addEventListener("mousemove", handleMouseMove)
    window.addEventListener("mouseup", handleMouseUp)
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!src || e.touches.length !== 1) return
    setIsDragging(true)
    const touch = e.touches[0]
    dragStartRef.current = {
      mouseX: touch.clientX,
      mouseY: touch.clientY,
      posX: currentPos.x,
      posY: currentPos.y,
    }

    const handleTouchMove = (moveEvent: TouchEvent) => {
      if (!containerRef.current || moveEvent.touches.length !== 1) return
      const touch = moveEvent.touches[0]
      const rect = containerRef.current.getBoundingClientRect()
      const deltaX = touch.clientX - dragStartRef.current.mouseX
      const deltaY = touch.clientY - dragStartRef.current.mouseY

      const newX = Math.max(0, Math.min(100, Math.round(dragStartRef.current.posX - (deltaX / rect.width) * 100)))
      const newY = Math.max(0, Math.min(100, Math.round(dragStartRef.current.posY - (deltaY / rect.height) * 100)))

      onChange(`${newX}% ${newY}%`)
    }

    const handleTouchEnd = () => {
      setIsDragging(false)
      window.removeEventListener("touchmove", handleTouchMove)
      window.removeEventListener("touchend", handleTouchEnd)
    }

    window.addEventListener("touchmove", handleTouchMove)
    window.addEventListener("touchend", handleTouchEnd)
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-foreground">{label}</span>
          <span className="text-[10px] font-mono text-muted-foreground bg-black/10 dark:bg-white/10 px-1.5 py-0.5 rounded">
            Enfoque: {currentPos.x}% {currentPos.y}%
          </span>
        </div>
      )}

      {/* Marco de Imagen Arrastrable */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        className={`relative ${aspectRatio} w-full rounded-2xl overflow-hidden bg-zinc-900 border-2 transition-all select-none ${
          isDragging
            ? "border-amber-400 ring-4 ring-amber-400/20 cursor-grabbing shadow-xl scale-[1.01]"
            : "border-border hover:border-primary/50 cursor-grab"
        }`}
        title="Haz clic y arrastra para centrar o ajustar la foto"
      >
        {src ? (
          <img
            src={src}
            alt="Foto"
            style={{ objectPosition: `${currentPos.x}% ${currentPos.y}%` }}
            className="w-full h-full object-cover pointer-events-none transition-[object-position] duration-75"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground p-4 text-center">
            <Upload className="w-8 h-8 mb-2 opacity-50" />
            <span className="text-xs font-semibold">Sin imagen cargada</span>
          </div>
        )}

        {/* Indicador de Ayuda */}
        <div className="absolute top-2.5 left-2.5 z-10 pointer-events-none">
          <span className="px-2 py-1 rounded-lg bg-black/75 backdrop-blur-md text-[10px] font-bold text-white flex items-center gap-1 shadow-sm border border-white/10">
            <Move className="w-3 h-3 text-amber-400" />
            <span>Arrastra para encuadrar</span>
          </span>
        </div>

        {/* Mira central al arrastrar */}
        {isDragging && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center bg-black/15">
            <div className="w-8 h-8 border-2 border-white/80 rounded-full flex items-center justify-center shadow-lg">
              <div className="w-2 h-2 bg-amber-400 rounded-full" />
            </div>
          </div>
        )}
      </div>

      {/* Botones de Reencuadre Rápido */}
      <div className="flex items-center justify-between gap-1 pt-0.5 text-[11px]">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onChange("50% 15%")}
            className="px-2 py-1 rounded-md bg-black/5 dark:bg-white/5 hover:bg-primary/20 hover:text-primary transition text-muted-foreground font-semibold flex items-center gap-1"
            title="Enfocar parte superior (Rostro / Torso)"
          >
            <ArrowUp className="w-3 h-3" /> Rostro
          </button>
          <button
            type="button"
            onClick={() => onChange("50% 50%")}
            className="px-2 py-1 rounded-md bg-black/5 dark:bg-white/5 hover:bg-primary/20 hover:text-primary transition text-muted-foreground font-semibold flex items-center gap-1"
            title="Centrar foto"
          >
            <RotateCcw className="w-3 h-3" /> Centro
          </button>
          <button
            type="button"
            onClick={() => onChange("50% 85%")}
            className="px-2 py-1 rounded-md bg-black/5 dark:bg-white/5 hover:bg-primary/20 hover:text-primary transition text-muted-foreground font-semibold flex items-center gap-1"
            title="Enfocar parte inferior"
          >
            <ArrowDown className="w-3 h-3" /> Abajo
          </button>
        </div>

        {onUpload && (
          <label className="cursor-pointer px-2.5 py-1 rounded-md bg-primary/10 text-primary hover:bg-primary/20 transition font-bold flex items-center gap-1">
            <Upload className="w-3 h-3" />
            <span>Subir</span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) {
                  const reader = new FileReader()
                  reader.onloadend = () => {
                    onUpload(reader.result as string)
                  }
                  reader.readAsDataURL(file)
                }
              }}
            />
          </label>
        )}
      </div>
    </div>
  )
}
