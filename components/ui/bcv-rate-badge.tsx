"use client"

import React, { useState } from "react"
import { useSettings } from "@/lib/settings-context"
import { useAuth } from "@/lib/auth-context"
import { DollarSign, RefreshCw, Check, AlertCircle } from "lucide-react"
import { showSweetToast } from "@/lib/toast-context"

interface BcvRateBadgeProps {
  className?: string
  compact?: boolean
  showRefreshButton?: boolean
}

export function BcvRateBadge({
  className = "",
  compact = false,
  showRefreshButton = true
}: BcvRateBadgeProps) {
  const { settings, updateSettings } = useSettings()
  const { user } = useAuth()
  const [isSyncing, setIsSyncing] = useState(false)

  const isStaff = user?.role === 'admin' || user?.role === 'gerente' || user?.role === 'cajero' || user?.role === 'employee'
  const canRefresh = showRefreshButton && isStaff

  const rate = Number(settings.storeExchangeRate) || 0
  const currencyPrimary = settings.storeCurrency || 'USD'
  const currencySecondary = settings.storeCurrencySecondary || 'Bs.'

  const handleSync = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (isSyncing) return
    setIsSyncing(true)
    try {
      const { syncBcvRateAction } = await import("@/app/actions/bcv")
      const res = await syncBcvRateAction()
      if (res.success && res.rate) {
        await updateSettings({ storeExchangeRate: res.rate })
        showSweetToast(`Tasa BCV actualizada a Bs. ${res.rate.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 4 })}`, "success")
      } else {
        showSweetToast(res.error || "No se pudo actualizar la tasa BCV.", "error")
      }
    } catch (err: any) {
      showSweetToast(err?.message || "Error al conectar con el servicio BCV.", "error")
    } finally {
      setIsSyncing(false)
    }
  }

  const formattedRate = rate > 0
    ? rate.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 4 })
    : "No fijada"

  if (compact) {
    return (
      <div
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-600 dark:text-emerald-400 text-xs font-semibold backdrop-blur-sm transition-all hover:bg-emerald-500/15 ${className}`}
        title={`Tasa Oficial BCV: 1 ${currencyPrimary} = ${formattedRate} ${currencySecondary}`}
      >
        <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
        <span className="font-mono font-bold tracking-tight">BCV: {formattedRate} {currencySecondary}</span>
        {canRefresh && (
          <button
            type="button"
            onClick={handleSync}
            disabled={isSyncing}
            className="p-0.5 rounded-full hover:bg-emerald-500/20 active:scale-95 transition disabled:opacity-50 ml-0.5"
            title="Sincronizar con BCV oficial hoy"
          >
            <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
          </button>
        )}
      </div>
    )
  }

  return (
    <div
      className={`inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-500/30 text-foreground text-xs shadow-sm backdrop-blur-md transition-all hover:border-emerald-500/50 ${className}`}
    >
      <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 font-black text-[11px]">
        Bs
      </div>

      <div className="flex flex-col leading-tight">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            Tasa Oficial BCV
          </span>
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
        </div>
        <span className="font-mono font-black text-sm text-foreground tracking-tight">
          1 {currencyPrimary} = <span className="text-emerald-600 dark:text-emerald-400">{formattedRate}</span> {currencySecondary}
        </span>
      </div>

      {canRefresh && (
        <button
          type="button"
          onClick={handleSync}
          disabled={isSyncing}
          className="ml-1 p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/25 active:scale-95 text-emerald-600 dark:text-emerald-400 transition disabled:opacity-50 flex items-center justify-center border border-emerald-500/20"
          title="Actualizar tasa con el Banco Central de Venezuela"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
        </button>
      )}
    </div>
  )
}
