"use client"

import React, { useEffect } from "react"
import { CreditCard, Minus, Plus, Check, CheckCircle2, X, Sparkles } from "lucide-react"

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

  const quickMonths = [1, 3, 6, 12]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 sm:p-4 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-card/95 border border-white/10 rounded-2xl w-full max-w-6xl shadow-2xl overflow-hidden max-h-[94vh] flex flex-col">
        {/* HEADER COMPACTO */}
        <div className="px-5 py-3.5 border-b border-black/10 dark:border-white/10 flex items-center justify-between bg-black/5 dark:bg-white/[0.02]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-primary/10 border border-primary/20 text-primary">
              <CreditCard className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-black text-base sm:text-lg flex items-center gap-2 uppercase tracking-tight text-foreground">
                Elegir Plan o Mensualidad
              </h3>
              <p className="text-xs text-muted-foreground">
                Selecciona tu plan y la cantidad de meses para renovar o activar tu membresía.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/10 transition cursor-pointer"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* CUERPO DEL MODAL */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
          {/* BARRA HORIZONTAL COMPACTA DE DURACIÓN */}
          <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 rounded-xl bg-primary/5 border border-primary/20">
            <div className="flex items-center gap-3">
              <span className="text-xs font-black uppercase tracking-wider text-primary">
                Duración:
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setPlanMonths((m) => Math.max(1, m - 1))}
                  className="h-8 w-8 rounded-lg bg-card border border-black/10 dark:border-white/10 flex items-center justify-center font-bold hover:border-primary cursor-pointer transition text-foreground"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span className="min-w-[80px] text-center font-black text-sm text-foreground">
                  {planMonths} {planMonths === 1 ? "Mes" : "Meses"}
                </span>
                <button
                  type="button"
                  onClick={() => setPlanMonths((m) => Math.min(12, m + 1))}
                  className="h-8 w-8 rounded-lg bg-card border border-black/10 dark:border-white/10 flex items-center justify-center font-bold hover:border-primary cursor-pointer transition text-foreground"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Accesos rápidos de meses */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-bold text-muted-foreground mr-1 hidden sm:inline">
                Atajo:
              </span>
              {quickMonths.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setPlanMonths(m)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                    planMonths === m
                      ? "bg-primary text-black font-black shadow-sm"
                      : "bg-black/5 dark:bg-white/5 text-muted-foreground hover:text-foreground border border-black/5 dark:border-white/10"
                  }`}
                >
                  {m === 12 ? "1 Año" : `${m}M`}
                </button>
              ))}
            </div>
          </div>

          {/* GRID MULTICOLUMNA DE PLANES (HASTA 5 COLUMNAS EN DESKTOP) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {availableStorePlans.map((plan) => {
              const totalForMonths = plan.price * planMonths
              return (
                <div
                  key={plan.name}
                  className={`rounded-xl p-3.5 border flex flex-col justify-between transition-all relative ${
                    plan.popular
                      ? "border-primary bg-primary/10 shadow-lg shadow-primary/10 ring-1 ring-primary/40"
                      : "border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/[0.02] hover:border-primary/50"
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-2.5 right-3 bg-primary text-black text-[9px] font-black uppercase px-2 py-0.5 rounded-full shadow-sm flex items-center gap-1">
                      <Sparkles className="w-2.5 h-2.5" /> Más Popular
                    </div>
                  )}

                  <div>
                    <h4 className="font-black text-sm uppercase tracking-tight text-foreground line-clamp-1 mb-1 mt-0.5">
                      {plan.name}
                    </h4>

                    <div className="flex items-baseline gap-1 my-2">
                      <span className="text-2xl font-black text-primary">
                        {currency}
                        {plan.price.toFixed(2)}
                      </span>
                      <span className="text-[10px] text-muted-foreground uppercase font-bold">
                        {plan.period || "/mes"}
                      </span>
                    </div>

                    {planMonths > 1 && (
                      <div className="mb-2 text-[11px] font-bold text-emerald-500">
                        Total {planMonths}m: {currency}
                        {totalForMonths.toFixed(2)}
                      </div>
                    )}

                    {plan.description && (
                      <p className="text-[11px] text-muted-foreground line-clamp-2 mb-2 leading-relaxed">
                        {plan.description}
                      </p>
                    )}

                    {plan.features && plan.features.length > 0 && (
                      <ul className="space-y-1 mb-3 border-t border-black/10 dark:border-white/10 pt-2">
                        {plan.features.slice(0, 3).map((feat: string, idx: number) => (
                          <li
                            key={idx}
                            className="text-[11px] flex items-start gap-1.5 text-foreground/80 leading-tight"
                          >
                            <Check className="h-3 w-3 text-primary shrink-0 mt-0.5" />
                            <span className="line-clamp-1">{feat}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => onSelectPlan(plan)}
                    className={`w-full py-2 px-3 rounded-lg font-black text-xs uppercase tracking-wider transition flex items-center justify-center gap-1.5 cursor-pointer mt-1 ${
                      plan.popular
                        ? "bg-primary text-black hover:opacity-90 shadow-md shadow-primary/20"
                        : "bg-emerald-500 text-white hover:bg-emerald-600 shadow-sm"
                    }`}
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                    <span>Elegir ({currency}{totalForMonths.toFixed(2)})</span>
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
