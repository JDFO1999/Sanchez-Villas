"use client"

import React, { useEffect } from "react"
import { CreditCard, Minus, Plus, Check, CheckCircle2, X } from "lucide-react"

export interface StorePlan {
  name: string
  price: number
  period?: string
  description?: string
  features?: string[]
  popular?: boolean
}

export interface PlanSelectorModalProps {
  isOpen: boolean
  onClose: () => void
  planMonths: number
  setPlanMonths: React.Dispatch<React.SetStateAction<number>>
  availableStorePlans: StorePlan[]
  currency: string
  onSelectPlan: (plan: StorePlan) => void
}

export function PlanSelectorModal({
  isOpen,
  onClose,
  planMonths,
  setPlanMonths,
  availableStorePlans,
  currency,
  onSelectPlan,
}: PlanSelectorModalProps) {
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
      <div className="bg-card border border-black/10 dark:border-white/10 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        <div className="p-5 border-b border-black/10 dark:border-white/10 flex items-center justify-between bg-black/5 dark:bg-white/[0.02]">
          <div>
            <h3 className="font-black text-lg sm:text-xl flex items-center gap-2 uppercase tracking-tight">
              <CreditCard className="h-5 w-5 text-primary" />
              Elegir Plan o Mensualidad
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Selecciona uno de nuestros planes promocionales o la mensualidad básica y la cantidad de meses a pagar.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground font-bold text-2xl leading-none px-2 cursor-pointer"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto space-y-5">
          {/* Selector de meses */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-primary/10 border border-primary/20">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-primary block">
                Duración del Pago
              </span>
              <span className="text-xs text-muted-foreground">
                ¿Cuántos meses deseas pagar por adelantado?
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPlanMonths((m) => Math.max(1, m - 1))}
                className="h-9 w-9 rounded-lg bg-card border border-black/10 dark:border-white/10 flex items-center justify-center font-bold hover:border-primary cursor-pointer transition"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="min-w-[90px] text-center font-black text-sm">
                {planMonths} {planMonths === 1 ? "Mes" : "Meses"}
              </span>
              <button
                type="button"
                onClick={() => setPlanMonths((m) => Math.min(12, m + 1))}
                className="h-9 w-9 rounded-lg bg-card border border-black/10 dark:border-white/10 flex items-center justify-center font-bold hover:border-primary cursor-pointer transition"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Tarjetas de Planes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {availableStorePlans.map((plan) => {
              const totalForMonths = plan.price * planMonths
              return (
                <div
                  key={plan.name}
                  className={`rounded-2xl p-5 border flex flex-col justify-between transition-all ${
                    plan.popular
                      ? "border-primary bg-primary/10 shadow-lg shadow-primary/10 ring-1 ring-primary/40"
                      : "border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/[0.03] hover:border-primary/50"
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h4 className="font-black text-base uppercase tracking-tight">{plan.name}</h4>
                      {plan.popular && (
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-primary text-primary-foreground shrink-0">
                          Más Popular
                        </span>
                      )}
                    </div>
                    {plan.description && (
                      <p className="text-xs text-muted-foreground mb-3">{plan.description}</p>
                    )}
                    <div className="flex items-baseline gap-1 mb-4">
                      <span className="text-3xl font-black text-primary">
                        {currency}
                        {plan.price}
                      </span>
                      <span className="text-xs text-muted-foreground">{plan.period || "/mes"}</span>
                      {planMonths > 1 && (
                        <span className="ml-auto text-xs font-bold text-emerald-500">
                          Total ({planMonths}m): {currency}
                          {totalForMonths.toFixed(2)}
                        </span>
                      )}
                    </div>

                    {plan.features && plan.features.length > 0 && (
                      <ul className="space-y-1.5 mb-4 border-t border-black/10 dark:border-white/10 pt-3">
                        {plan.features.map((feat: string, idx: number) => (
                          <li key={idx} className="text-xs flex items-start gap-2 text-foreground/90">
                            <Check className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => onSelectPlan(plan)}
                    className={`w-full py-2.5 px-4 rounded-xl font-black text-xs uppercase tracking-wider transition flex items-center justify-center gap-2 cursor-pointer ${
                      plan.popular
                        ? "bg-primary text-primary-foreground hover:opacity-90 shadow-md shadow-primary/20"
                        : "bg-emerald-500 text-white hover:bg-emerald-600 shadow-sm"
                    }`}
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Elegir {plan.name} ({currency}
                    {totalForMonths.toFixed(2)})
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
