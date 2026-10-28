"use client"

import React, { useState } from "react"
import { useSettings } from "@/lib/settings-context"
import { useAuth } from "@/lib/auth-context"
import { RefreshCw, Coins, ChevronDown } from "lucide-react"
import { showSweetToast } from "@/lib/toast-context"
import Swal from "sweetalert2"

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
  const [activeCurrency, setActiveCurrency] = useState<'usd' | 'eur' | 'cop'>('usd')

  // RESTRICCIÓN DE SEGURIDAD: Solo Administrador, Gerente y Super Administrador pueden actualizar
  const isAuthorizedToUpdate = Boolean(
    user && (
      user.role === 'admin' || 
      user.role === 'gerente' || 
      user.role === 'superadmin' || 
      user.cedula === '26710825' ||
      (user as any).isSuperAdmin
    )
  )

  const canRefresh = showRefreshButton && isAuthorizedToUpdate

  const usdRate = Number(settings.bcvRates?.usd || settings.storeExchangeRate) || 886.23
  const eurRate = Number(settings.bcvRates?.eur || settings.storeExchangeRateEur) || 993.09
  const copRate = Number(settings.bcvRates?.cop || settings.storeExchangeRateCop) || 3185.01

  const formatRate = (val: number, maxDecimals = 2, minDecimals = 0) => {
    const num = Number(val)
    if (!num || isNaN(num) || num <= 0) return "0.00"
    const maxD = Math.max(0, maxDecimals)
    const minD = Math.min(minDecimals, maxD)
    try {
      return num.toLocaleString('es-VE', { minimumFractionDigits: minD, maximumFractionDigits: maxD })
    } catch {
      return num.toFixed(maxD)
    }
  }

  const handleSync = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (isSyncing || !canRefresh) return
    setIsSyncing(true)

    try {
      showSweetToast("Consultando Banco Central (USD / EUR) y TRM Colombia...", "info")
      const { syncBcvMultiRatesAction } = await import("@/app/actions/bcv")
      const res = await syncBcvMultiRatesAction()

      if (res.success && res.rates) {
        await updateSettings({
          storeExchangeRate: res.rates.usd,
          storeExchangeRateEur: res.rates.eur,
          storeExchangeRateCop: res.rates.cop,
          bcvRates: res.rates,
        })

        // Alerta de confirmación para Administrador / Gerente
        Swal.fire({
          icon: "success",
          title: "Tasas Oficiales Actualizadas",
          html: `
            <div class="text-left space-y-3 text-sm">
              <p class="text-xs text-muted-foreground">
                Las cotizaciones oficiales se han sincronizado con éxito:
              </p>
              <div class="p-3.5 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 space-y-2 font-mono text-xs">
                <div class="flex justify-between items-center">
                  <span>🇺🇸 <b>Dólar BCV:</b></span>
                  <span class="font-bold text-emerald-600 dark:text-emerald-400">Bs. ${res.rates.usd.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 4 })}</span>
                </div>
                <div class="flex justify-between items-center">
                  <span>🇪🇺 <b>Euro BCV:</b></span>
                  <span class="font-bold text-blue-600 dark:text-blue-400">Bs. ${res.rates.eur.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 4 })}</span>
                </div>
                <div class="flex justify-between items-center">
                  <span>🇨🇴 <b>Peso Colombiano (TRM):</b></span>
                  <span class="font-bold text-amber-600 dark:text-amber-400">${res.rates.cop.toLocaleString('es-CO')} COP / $</span>
                </div>
              </div>
              <div class="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-700 dark:text-amber-300">
                📢 <b>Alerta para Recepción emitida:</b> El personal en caja y recepción recibirá el aviso en pantalla para notificar a los atletas antes de cobrar.
              </div>
            </div>
          `,
          confirmButtonText: "Entendido",
          confirmButtonColor: "#10b981",
        })
      } else {
        showSweetToast(res.error || "No se pudo actualizar la tasa oficial.", "error")
      }
    } catch (err: any) {
      showSweetToast(err?.message || "Error al conectar con el servicio de tasas.", "error")
    } finally {
      setIsSyncing(false)
    }
  }

  if (compact) {
    return (
      <div
        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-700 dark:text-emerald-400 text-xs font-semibold backdrop-blur-sm shadow-sm transition-all ${className}`}
      >
        <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
        <span className="font-mono font-bold tracking-tight">
          BCV: Bs. {formatRate(usdRate, 4, 2)}
        </span>
        <span className="text-[10px] text-muted-foreground">| € {formatRate(eurRate, 2, 2)} | COP {formatRate(copRate, 0, 0)}</span>
        {canRefresh && (
          <button
            type="button"
            onClick={handleSync}
            disabled={isSyncing}
            className="p-1 rounded-full hover:bg-emerald-500/20 active:scale-95 transition disabled:opacity-50 ml-1 text-emerald-600 dark:text-emerald-400 cursor-pointer"
            title="Sincronizar tasas oficiales (USD, EUR, COP)"
          >
            <RefreshCw className={`w-3 h-3 ${isSyncing ? "animate-spin" : ""}`} />
          </button>
        )}
      </div>
    )
  }

  return (
    <>
      {/* VISTA MÓVIL (screens < sm): Píldora compacta interactiva que NO bloquea ni desborda la barra */}
      <div
        className={`sm:hidden inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-card/90 border border-emerald-500/30 shadow-sm backdrop-blur-md max-w-[175px] shrink-0 ${className}`}
      >
        <button
          type="button"
          onClick={() => {
            setActiveCurrency((prev) => (prev === 'usd' ? 'eur' : prev === 'eur' ? 'cop' : 'usd'))
          }}
          className="inline-flex items-center gap-1.5 text-left min-w-0 flex-1 hover:opacity-80 active:scale-95 transition cursor-pointer"
          title="Toca para alternar moneda (USD / EUR / COP)"
        >
          <span className="flex h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] font-black shrink-0">
            {activeCurrency === 'usd' ? '🇺🇸' : activeCurrency === 'eur' ? '🇪🇺' : '🇨🇴'}
          </span>
          <span className="font-mono font-bold text-xs truncate text-foreground">
            {activeCurrency === 'usd' && `Bs. ${formatRate(usdRate, 2, 2)}`}
            {activeCurrency === 'eur' && `Bs. ${formatRate(eurRate, 2, 2)}`}
            {activeCurrency === 'cop' && `${formatRate(copRate, 0, 0)} COP`}
          </span>
        </button>
        {canRefresh && (
          <button
            type="button"
            onClick={handleSync}
            disabled={isSyncing}
            className="p-1 rounded-full text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 active:scale-95 transition shrink-0 cursor-pointer"
            title="Sincronizar tasas oficiales"
          >
            <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
          </button>
        )}
      </div>

      {/* VISTA ESCRITORIO / TABLET (screens >= sm): Barra completa con botones de selección de moneda */}
      <div
        className={`hidden sm:inline-flex flex-nowrap items-center gap-1.5 sm:gap-2.5 px-2.5 py-1 sm:px-3.5 sm:py-1 rounded-full bg-card/80 border border-emerald-500/30 shadow-sm backdrop-blur-md transition-all hover:border-emerald-500/50 shrink-0 ${className}`}
      >
        {/* Botones selectores rápidos de moneda */}
        <div className="flex items-center gap-1 p-0.5 rounded-xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5">
          <button
            type="button"
            onClick={() => setActiveCurrency('usd')}
            className={`px-2 py-0.5 rounded-lg text-[11px] font-black transition-all ${
              activeCurrency === 'usd'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
            title="Ver cotización Dólar Oficial BCV"
          >
            🇺🇸 USD
          </button>
          <button
            type="button"
            onClick={() => setActiveCurrency('eur')}
            className={`px-2 py-0.5 rounded-lg text-[11px] font-black transition-all ${
              activeCurrency === 'eur'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
            title="Ver cotización Euro Oficial BCV"
          >
            🇪🇺 EUR
          </button>
          <button
            type="button"
            onClick={() => setActiveCurrency('cop')}
            className={`px-2 py-0.5 rounded-lg text-[11px] font-black transition-all ${
              activeCurrency === 'cop'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
            title="Ver cotización Pesos Colombianos TRM"
          >
            🇨🇴 COP
          </button>
        </div>

        {/* Indicador de Tasa Activa */}
        <div className="flex flex-col leading-tight px-1">
          <div className="flex items-center gap-1">
            <span className="text-[9px] font-black uppercase tracking-wider text-muted-foreground">
              {activeCurrency === 'usd' && "Tasa Oficial BCV"}
              {activeCurrency === 'eur' && "Euro Oficial BCV"}
              {activeCurrency === 'cop' && "Peso Colombiano (TRM)"}
            </span>
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
          </div>
          <span className="font-mono font-black text-xs sm:text-sm text-foreground tracking-tight">
            {activeCurrency === 'usd' && (
              <>1 USD = <span className="text-emerald-600 dark:text-emerald-400">Bs. {formatRate(usdRate, 4, 2)}</span></>
            )}
            {activeCurrency === 'eur' && (
              <>1 EUR = <span className="text-blue-600 dark:text-blue-400">Bs. {formatRate(eurRate, 4, 2)}</span></>
            )}
            {activeCurrency === 'cop' && (
              <>
                1 USD = <span className="text-amber-600 dark:text-amber-400">{formatRate(copRate, 0, 0)} COP</span>
                <span className="text-[10px] text-muted-foreground ml-1.5 font-normal hidden sm:inline">
                  (1.000 COP ≈ Bs. {formatRate((usdRate / (copRate || 3185)) * 1000, 2, 2)})
                </span>
              </>
            )}
          </span>
        </div>

        {/* Botón de Sincronización (SOLO visible para Administrador y Gerente) */}
        {canRefresh && (
          <button
            type="button"
            onClick={handleSync}
            disabled={isSyncing}
            className="p-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 active:scale-95 text-emerald-600 dark:text-emerald-400 transition disabled:opacity-50 flex items-center justify-center border border-emerald-500/25 cursor-pointer ml-auto sm:ml-0"
            title="Sincronizar Tasas Oficiales (Admin / Gerente)"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
          </button>
        )}
      </div>
    </>
  )
}
