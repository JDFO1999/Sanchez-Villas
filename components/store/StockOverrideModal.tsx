"use client"

import React, { useEffect } from "react"
import { ShieldAlert, X } from "lucide-react"

export interface StockOverrideModalProps {
  isOpen: boolean
  onClose: () => void
  productName?: string
  adminCedula: string
  setAdminCedula: (v: string) => void
  onSubmit: (e: React.FormEvent) => void
}

export function StockOverrideModal({
  isOpen,
  onClose,
  productName,
  adminCedula,
  setAdminCedula,
  onSubmit,
}: StockOverrideModalProps) {
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-card border border-black/10 dark:border-white/10 rounded-2xl max-w-sm w-full p-6 shadow-2xl glass">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-black text-destructive flex items-center gap-2">
            <ShieldAlert className="h-5 w-5" /> Autorización Requerida
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground font-bold cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-muted-foreground mb-4">
          El producto <strong>{productName || "seleccionado"}</strong> no tiene stock disponible.
          Ingresa la Cédula o escanea la credencial de un Administrador para facturar sin stock.
        </p>

        <form onSubmit={onSubmit} className="space-y-4">
          <input
            type="password"
            autoFocus
            placeholder="Cédula de Administrador..."
            value={adminCedula}
            onChange={(e) => setAdminCedula(e.target.value)}
            className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-xl p-3 text-sm focus:border-destructive font-mono"
          />
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold rounded-xl bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-black rounded-xl bg-destructive text-destructive-foreground hover:opacity-90 transition cursor-pointer"
            >
              Autorizar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
