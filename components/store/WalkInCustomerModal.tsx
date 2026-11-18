"use client"

import React, { useState, useEffect } from "react"
import { UserPlus, X } from "lucide-react"
import { sanitizeCedula } from "@/lib/utils"

export interface WalkInCustomerModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (newCustomer: any) => void
  showToast: (msg: string, type: "success" | "error" | "info") => void
}

export function WalkInCustomerModal({
  isOpen,
  onClose,
  onSuccess,
  showToast,
}: WalkInCustomerModalProps) {
  const [name, setName] = useState("")
  const [cedulaType, setCedulaType] = useState("V")
  const [cedula, setCedula] = useState("")
  const [address, setAddress] = useState("")
  const [phone, setPhone] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!isOpen) {
      setName("")
      setCedula("")
      setAddress("")
      setPhone("")
      setCedulaType("V")
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const cleanNum = sanitizeCedula(cedula)
    if (!cleanNum || !name.trim()) {
      showToast("Nombre y Cédula son obligatorios.", "error")
      return
    }

    const fullCedula = `${cedulaType}-${cleanNum}`
    setIsSubmitting(true)

    try {
      const { createAthlete } = await import("@/app/actions/users")
      const res = await createAthlete({
        name: name.trim(),
        cedula: fullCedula,
        role: "athlete",
        password: cleanNum,
        gender: "M",
        address: address.trim(),
        phone: phone.trim(),
      })

      const createdUser = (res as any)?.athlete || (res as any)?.user
      if (res?.success && createdUser) {
        showToast("Cliente agregado y enlazado exitosamente.", "success")
        onSuccess(createdUser)
        onClose()
      } else {
        showToast(res?.error || "Error al registrar cliente.", "error")
      }
    } catch (err: any) {
      showToast(err?.message || "Ocurrió un error al crear el cliente.", "error")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-card border border-black/10 dark:border-white/10 rounded-2xl max-w-sm w-full p-6 shadow-2xl glass">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-black flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-primary" />
            Nuevo Cliente de Paso
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground font-bold cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground">Cédula / Documento</label>
            <div className="flex gap-2">
              <select
                value={cedulaType}
                onChange={(e) => setCedulaType(e.target.value)}
                className="w-16 bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-lg p-2 text-sm focus:border-primary font-bold"
              >
                <option value="V">V</option>
                <option value="E">E</option>
                <option value="J">J</option>
              </select>
              <input
                required
                autoFocus
                type="text"
                value={cedula}
                onChange={(e) => setCedula(e.target.value)}
                className="flex-1 bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-lg p-2 text-sm focus:border-primary"
                placeholder="Ej. 12345678"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground">Nombre / Razón Social</label>
            <input
              required
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-lg p-2 text-sm focus:border-primary"
              placeholder="Ej. Juan Pérez"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground">Dirección (Opcional)</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-lg p-2 text-sm focus:border-primary"
              placeholder="Ej. Sector Centro"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground">Teléfono (Opcional)</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-lg p-2 text-sm focus:border-primary"
              placeholder="Ej. 04121234567"
            />
          </div>

          <div className="flex gap-2 justify-end pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-bold rounded-xl bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-black rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? "Guardando..." : "Guardar Cliente"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
