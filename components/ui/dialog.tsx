"use client"

import * as React from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'

interface DialogProps {
  open: boolean
  onClose: () => void
  /** Título accesible (se muestra en la cabecera salvo que `hideTitle`). */
  title: string
  description?: string
  hideTitle?: boolean
  /** Evita cerrar al hacer clic fuera (formularios con datos sin guardar). */
  persistent?: boolean
  className?: string
  children: React.ReactNode
}

/**
 * Modal accesible: role="dialog", Escape cierra, el foco queda atrapado dentro,
 * se restaura al elemento que lo abrió y se bloquea el scroll del fondo.
 */
export function Dialog({ open, onClose, title, description, hideTitle, persistent, className, children }: DialogProps) {
  const panelRef = React.useRef<HTMLDivElement>(null)
  const titleId = React.useId()
  const descId = React.useId()

  React.useEffect(() => {
    if (!open) return
    const previouslyFocused = document.activeElement as HTMLElement | null
    const panel = panelRef.current
    const firstField = panel?.querySelector<HTMLElement>("input, textarea, select")
    ;(firstField ?? panel?.querySelector<HTMLElement>(FOCUSABLE) ?? panel)?.focus()

    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !persistent) {
        e.stopPropagation()
        onClose()
        return
      }
      if (e.key !== "Tab" || !panel) return
      const items = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(el => el.offsetParent !== null)
      if (items.length === 0) { e.preventDefault(); return }
      const first = items[0], last = items[items.length - 1]
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus() }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
    }
    document.addEventListener("keydown", onKeyDown)
    return () => {
      document.removeEventListener("keydown", onKeyDown)
      document.body.style.overflow = prevOverflow
      previouslyFocused?.focus?.()
    }
  }, [open, onClose, persistent])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-150"
      onMouseDown={e => { if (e.target === e.currentTarget && !persistent) onClose() }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descId : undefined}
        tabIndex={-1}
        className={cn(
          "relative w-full max-w-sm max-h-[90vh] overflow-y-auto rounded-2xl border border-border bg-card p-6 text-card-foreground shadow-2xl outline-none animate-in zoom-in-95 duration-150",
          className
        )}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar"
          className="absolute right-3 top-3 rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <X className="h-5 w-5" />
        </button>
        <h2 id={titleId} className={cn("font-display text-2xl font-extrabold uppercase leading-none pr-8", hideTitle && "sr-only")}>
          {title}
        </h2>
        {description && <p id={descId} className="mt-2 text-sm text-muted-foreground">{description}</p>}
        <div className={cn(!hideTitle || description ? "mt-5" : "")}>{children}</div>
      </div>
    </div>
  )
}
