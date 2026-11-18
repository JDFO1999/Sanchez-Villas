"use client"

import React from "react"
import { Store, Building2, Coins, RefreshCw, Receipt, CreditCard, QrCode } from "lucide-react"

export interface FinanceSettingsTabProps {
  storeRif: string
  setStoreRif: (rif: string) => void
  storeAddress: string
  setStoreAddress: (address: string) => void
  storeCurrency: string
  setStoreCurrency: (currency: string) => void
  storeCurrencySecondary: string
  setStoreCurrencySecondary: (currency: string) => void
  storeExchangeRate: number
  setStoreExchangeRate: (rate: number) => void
  storeExchangeRateEur: number
  setStoreExchangeRateEur: (rate: number) => void
  storeExchangeRateCop: number
  setStoreExchangeRateCop: (rate: number) => void
  isFetchingBcv: boolean
  handleFetchBcv: () => Promise<void>
  storeTaxRate: number
  setStoreTaxRate: (rate: number) => void
  storeTicketWidth: "58mm" | "80mm" | "Carta"
  setStoreTicketWidth: (width: "58mm" | "80mm" | "Carta") => void
  storeUseThermalPrinter: boolean
  setStoreUseThermalPrinter: (use: boolean) => void
  storeReceiptMessage: string
  setStoreReceiptMessage: (msg: string) => void
  coachCustomPricing: boolean
  setCoachCustomPricing: (custom: boolean) => void
  gymCommissionPercentage: number
  setGymCommissionPercentage: (pct: number) => void
  allowCoachesToPostCommunity: boolean
  setAllowCoachesToPostCommunity: (allow: boolean) => void
  storePaymentInstructions: {
    pagoMovil: string
    pagoMovil2?: string
    transferencia: string
    transferencia2?: string
    binance: string
    [key: string]: any
  }
  setStorePaymentInstructions: React.Dispatch<React.SetStateAction<any>>
  storePaymentQRs: {
    pagoMovil: string
    pagoMovil2?: string
    transferencia: string
    transferencia2?: string
    binance: string
    [key: string]: any
  }
  setStorePaymentQRs: React.Dispatch<React.SetStateAction<any>>
  handleQRUpload: (method: 'pagoMovil' | 'pagoMovil2' | 'binance' | 'transferencia' | 'transferencia2', e: React.ChangeEvent<HTMLInputElement>) => Promise<void>
}

export function FinanceSettingsTab({
  storeRif,
  setStoreRif,
  storeAddress,
  setStoreAddress,
  storeCurrency,
  setStoreCurrency,
  storeCurrencySecondary,
  setStoreCurrencySecondary,
  storeExchangeRate,
  setStoreExchangeRate,
  storeExchangeRateEur,
  setStoreExchangeRateEur,
  storeExchangeRateCop,
  setStoreExchangeRateCop,
  isFetchingBcv,
  handleFetchBcv,
  storeTaxRate,
  setStoreTaxRate,
  storeTicketWidth,
  setStoreTicketWidth,
  storeUseThermalPrinter,
  setStoreUseThermalPrinter,
  storeReceiptMessage,
  setStoreReceiptMessage,
  coachCustomPricing,
  setCoachCustomPricing,
  gymCommissionPercentage,
  setGymCommissionPercentage,
  allowCoachesToPostCommunity,
  setAllowCoachesToPostCommunity,
  storePaymentInstructions,
  setStorePaymentInstructions,
  storePaymentQRs,
  setStorePaymentQRs,
  handleQRUpload,
}: FinanceSettingsTabProps) {
  return (
    <div className="pt-4 border-t border-black/10 dark:border-white/10 mt-6 pt-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6 pb-2 border-b border-black/10 dark:border-white/10">
        <div>
          <h3 className="text-lg font-bold flex items-center gap-2 text-foreground">
            <Store className="h-5 w-5 text-primary" /> Configuración de Tienda y Facturación
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Administra datos comerciales, divisas, sincronización de tasa oficial BCV, tickets e impuestos.
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 1. DATOS FISCALES Y COMERCIALES */}
        <div className="md:col-span-2 p-5 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-black/5 dark:border-white/5">
            <Building2 className="h-4 w-4 text-primary" />
            <div>
              <h4 className="text-sm font-bold text-foreground">Datos Fiscales y Comerciales</h4>
              <p className="text-xs text-muted-foreground">Información que se imprimirá en los tickets y facturas de venta emitidas.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block">NIT / RIF Comercial</label>
              <input 
                type="text" 
                value={storeRif}
                onChange={(e) => setStoreRif(e.target.value)}
                placeholder="Ej. J-12345678-9"
                className="w-full bg-card border border-black/10 dark:border-white/10 rounded-xl p-3 text-sm focus:border-primary transition" 
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block">Dirección Comercial (Exclusiva para Tickets)</label>
              <input 
                type="text" 
                value={storeAddress}
                onChange={(e) => setStoreAddress(e.target.value)}
                placeholder="Ej. Av. Principal..."
                className="w-full bg-card border border-black/10 dark:border-white/10 rounded-xl p-3 text-sm focus:border-primary transition" 
              />
            </div>
          </div>
        </div>

        {/* 2. DIVISAS Y TASA OFICIAL BCV (USD, EUR, COP) */}
        <div className="md:col-span-2 p-5 rounded-2xl bg-gradient-to-br from-emerald-500/[0.04] to-transparent border border-emerald-500/20 dark:border-emerald-500/30 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-emerald-500/15">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-emerald-500/10 dark:bg-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <Coins className="h-4 w-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-foreground">Divisas y Tasas Oficiales (BCV & TRM)</h4>
                <p className="text-xs text-muted-foreground">Configura las monedas del sistema y sincroniza cotizaciones de Dólar, Euro y Pesos Colombianos.</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto font-mono text-xs">
              <span className="px-2.5 py-1 rounded-xl bg-card border border-emerald-500/25 text-emerald-600 dark:text-emerald-400 font-bold shadow-sm">
                🇺🇸 Bs. {Number(storeExchangeRate || 0).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
              </span>
              <span className="px-2.5 py-1 rounded-xl bg-card border border-blue-500/25 text-blue-600 dark:text-blue-400 font-bold shadow-sm">
                🇪🇺 Bs. {Number(storeExchangeRateEur || 0).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
              </span>
              <span className="px-2.5 py-1 rounded-xl bg-card border border-amber-500/25 text-amber-600 dark:text-amber-400 font-bold shadow-sm">
                🇨🇴 {Number(storeExchangeRateCop || 0).toLocaleString('es-CO')} COP
              </span>
            </div>
          </div>

          {/* Selección de Monedas Base y Secundaria */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5 p-4 rounded-xl bg-card border border-black/10 dark:border-white/10">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">Moneda Base (Precios del Sistema)</label>
              <p className="text-xs text-muted-foreground mb-2">Moneda principal en la que registras productos y planes (Ej. 30 = 30 USD)</p>
              <div className="flex gap-2">
                <select 
                  value={['USD', 'BsS', 'EUR', 'COP'].includes(storeCurrency) ? storeCurrency : 'Otra'}
                  onChange={(e) => setStoreCurrency(e.target.value === 'Otra' ? '' : e.target.value)}
                  className="bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-lg p-2.5 text-sm font-medium focus:border-primary flex-1"
                >
                  <option value="USD">USD ($ - Dólares)</option>
                  <option value="BsS">BsS (Bs. - Bolívares)</option>
                  <option value="EUR">EUR (€ - Euros)</option>
                  <option value="COP">COP ($ - Pesos Col.)</option>
                  <option value="Otra">Otra...</option>
                </select>
                {!['USD', 'BsS', 'EUR', 'COP'].includes(storeCurrency) && (
                  <input type="text" value={storeCurrency} onChange={(e) => setStoreCurrency(e.target.value)} placeholder="Ej. MXN" className="w-28 bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-lg p-2.5 text-sm focus:border-primary" />
                )}
              </div>
            </div>

            <div className="space-y-1.5 p-4 rounded-xl bg-card border border-black/10 dark:border-white/10">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">Moneda Secundaria (Equivalencia)</label>
              <p className="text-xs text-muted-foreground mb-2">Se mostrará junto al precio principal en tienda, membresías y finanzas</p>
              <div className="flex gap-2">
                <select 
                  value={['USD', 'BsS', 'EUR', 'COP'].includes(storeCurrencySecondary) ? storeCurrencySecondary : 'Otra'}
                  onChange={(e) => setStoreCurrencySecondary(e.target.value === 'Otra' ? '' : e.target.value)}
                  className="bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-lg p-2.5 text-sm font-medium focus:border-primary flex-1"
                >
                  <option value="USD">USD ($ - Dólares)</option>
                  <option value="BsS">BsS (Bs. - Bolívares)</option>
                  <option value="EUR">EUR (€ - Euros)</option>
                  <option value="COP">COP ($ - Pesos Col.)</option>
                  <option value="Otra">Otra...</option>
                </select>
                {!['USD', 'BsS', 'EUR', 'COP'].includes(storeCurrencySecondary) && (
                  <input type="text" value={storeCurrencySecondary} onChange={(e) => setStoreCurrencySecondary(e.target.value)} placeholder="Ej. MXN" className="w-28 bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-lg p-2.5 text-sm focus:border-primary" />
                )}
              </div>
            </div>
          </div>

          {/* Panel de Tasas de Cambio & Botón Sincronización */}
          <div className="p-4 sm:p-5 rounded-xl bg-card border border-emerald-500/20 dark:border-emerald-500/30 space-y-4 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-foreground block">
                  Cotizaciones de Cambio Oficiales (Dólar, Euro, Peso Colombiano)
                </label>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Valores utilizados para calcular equivalencias en ventas, cobros y punto de venta.
                </p>
              </div>

              <button
                type="button"
                disabled={isFetchingBcv}
                onClick={handleFetchBcv}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all cursor-pointer disabled:opacity-60 shrink-0 self-start sm:self-auto"
              >
                {isFetchingBcv ? (
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <span>🏦</span>
                )}
                <span>{isFetchingBcv ? "Consultando Tasas..." : "Sincronizar Tasas Oficiales Hoy"}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* USD */}
              <div className="space-y-1.5 p-3 rounded-xl bg-black/5 dark:bg-white/5 border border-emerald-500/25">
                <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <span>🇺🇸</span> Dólar Oficial BCV (USD)
                </label>
                <div className="relative">
                  <input 
                    type="number" 
                    step="0.0001" 
                    value={storeExchangeRate} 
                    onChange={(e) => setStoreExchangeRate(Number(e.target.value))} 
                    placeholder="Ej. 886.2271" 
                    className="w-full bg-card border border-emerald-500/30 focus:border-emerald-500 rounded-lg p-2.5 text-sm font-bold pr-14 text-foreground transition" 
                  />
                  <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-black text-muted-foreground">
                    Bs. / $
                  </span>
                </div>
                <p className="text-[10px] text-muted-foreground">Tasa principal de conversión.</p>
              </div>

              {/* EUR */}
              <div className="space-y-1.5 p-3 rounded-xl bg-black/5 dark:bg-white/5 border border-blue-500/25">
                <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <span>🇪🇺</span> Euro Oficial BCV (EUR)
                </label>
                <div className="relative">
                  <input 
                    type="number" 
                    step="0.0001" 
                    value={storeExchangeRateEur} 
                    onChange={(e) => setStoreExchangeRateEur(Number(e.target.value))} 
                    placeholder="Ej. 993.0883" 
                    className="w-full bg-card border border-blue-500/30 focus:border-blue-500 rounded-lg p-2.5 text-sm font-bold pr-14 text-foreground transition" 
                  />
                  <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-black text-muted-foreground">
                    Bs. / €
                  </span>
                </div>
                <p className="text-[10px] text-muted-foreground">Cotización oficial Banco Central.</p>
              </div>

              {/* COP */}
              <div className="space-y-1.5 p-3 rounded-xl bg-black/5 dark:bg-white/5 border border-amber-500/25">
                <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <span>🇨🇴</span> Peso Colombiano (TRM)
                </label>
                <div className="relative">
                  <input 
                    type="number" 
                    step="0.01" 
                    value={storeExchangeRateCop} 
                    onChange={(e) => setStoreExchangeRateCop(Number(e.target.value))} 
                    placeholder="Ej. 3185.01" 
                    className="w-full bg-card border border-amber-500/30 focus:border-amber-500 rounded-lg p-2.5 text-sm font-bold pr-16 text-foreground transition" 
                  />
                  <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-black text-muted-foreground">
                    COP / $
                  </span>
                </div>
                <p className="text-[10px] text-muted-foreground">Tasa Representativa del Mercado.</p>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-muted-foreground">
              💡 <strong>Aviso a Recepción:</strong> Al pulsar "Guardar Cambios" con nuevas tasas, el panel de <strong>Recepción y Caja</strong> mostrará una alerta automática obligatoria informándole al personal que debe notificar a los atletas sobre las nuevas tasas antes de cobrar.
            </div>
          </div>
        </div>

        {/* 3. FACTURACIÓN E IMPRESIÓN */}
        <div className="md:col-span-2 p-5 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-black/5 dark:border-white/5">
            <Receipt className="h-4 w-4 text-primary" />
            <div>
              <h4 className="text-sm font-bold text-foreground">Facturación, Impuestos e Impresión de Tickets</h4>
              <p className="text-xs text-muted-foreground">Configuración de formato de impresión para tickeras térmicas o estándar e impuestos de ley.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block">Impuesto (IVA) %</label>
              <input 
                type="number" 
                value={storeTaxRate}
                onChange={(e) => setStoreTaxRate(Number(e.target.value))}
                className="w-full bg-card border border-black/10 dark:border-white/10 rounded-xl p-3 text-sm focus:border-primary transition" 
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block">Formato de Ticket (Impresora)</label>
              <select 
                value={storeTicketWidth}
                onChange={(e) => setStoreTicketWidth(e.target.value as any)}
                className="w-full bg-card border border-black/10 dark:border-white/10 rounded-xl p-3 text-sm focus:border-primary transition" 
              >
                <option value="80mm">80mm (Tickera Grande)</option>
                <option value="58mm">58mm (Tickera Pequeña)</option>
                <option value="Carta">Tamaño Carta (Impresora Normal)</option>
              </select>
              
              <label className="flex items-center gap-2 mt-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={storeUseThermalPrinter}
                  onChange={(e) => setStoreUseThermalPrinter(e.target.checked)}
                  className="accent-primary h-4 w-4"
                />
                <span className="text-xs font-medium">Impresión Térmica Automática</span>
              </label>
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block">Mensaje de Agradecimiento (Pie de Ticket)</label>
              <input 
                type="text" 
                value={storeReceiptMessage}
                onChange={(e) => setStoreReceiptMessage(e.target.value)}
                placeholder="Ej. ¡Gracias por entrenar con nosotros!"
                className="w-full bg-card border border-black/10 dark:border-white/10 rounded-xl p-3 text-sm focus:border-primary transition" 
              />
            </div>
          </div>
        </div>

        {/* 4. PRECIOS Y COMISIONES DE ENTRENADORES */}
        <div className="space-y-4 pt-4 border-t border-black/5 dark:border-white/5 md:col-span-2">
          <h4 className="text-sm font-bold text-primary">Precios y Comisiones de Entrenadores</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-black/5 dark:bg-white/5 p-4 rounded-xl border border-black/10 dark:border-white/10">
              <label className="flex items-center gap-2 mb-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={coachCustomPricing}
                  onChange={(e) => setCoachCustomPricing(e.target.checked)}
                  className="accent-primary h-4 w-4"
                />
                <span className="font-bold text-sm">Entrenadores fijan su propia cuota</span>
              </label>
              <p className="text-xs text-muted-foreground">
                Si está activo, al registrar un empleado el valor de "Comisión x Atleta" se tratará como el precio público que el atleta debe pagar para entrenar con esa persona.
              </p>
            </div>
            <div className="bg-black/5 dark:bg-white/5 p-4 rounded-xl border border-black/10 dark:border-white/10">
              <label className="text-sm font-bold block mb-1">Porcentaje del Gimnasio (%)</label>
              <input 
                type="number" 
                value={gymCommissionPercentage}
                onChange={(e) => setGymCommissionPercentage(Number(e.target.value))}
                placeholder="Ej. 30"
                className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-lg p-3 text-sm focus:border-primary" 
              />
              <p className="text-xs text-muted-foreground mt-2">
                {coachCustomPricing 
                  ? "Del precio que el entrenador defina, el gimnasio retendrá este porcentaje como ganancia."
                  : "Del precio asignado por el gimnasio para el entrenador, el gimnasio retendrá este porcentaje como ganancia y el resto es para el entrenador."
                }
              </p>
            </div>

            <div className="bg-black/5 dark:bg-white/5 p-4 rounded-xl border border-black/10 dark:border-white/10 md:col-span-2">
              <label className="flex items-center gap-2 mb-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={allowCoachesToPostCommunity}
                  onChange={(e) => setAllowCoachesToPostCommunity(e.target.checked)}
                  className="accent-primary h-4 w-4"
                />
                <span className="font-bold text-sm">Permitir a los Entrenadores Publicar en Comunidad</span>
              </label>
              <p className="text-xs text-muted-foreground">
                Si está activo, los entrenadores pueden redactar avisos, consejos y comunicados oficiales en el muro de la Comunidad. Puedes revocar o conceder este permiso de forma individual por empleado en la pestaña de Roles y Permisos.
              </p>
            </div>
          </div>
        </div>

        {/* 5. DATOS E INSTRUCCIONES DE PAGO */}
        <div className="space-y-6 md:col-span-2 pt-6 border-t border-black/10 dark:border-white/10">
          <div>
            <h4 className="font-extrabold text-base text-primary flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-primary" /> Datos e Instrucciones de Pago
            </h4>
            <p className="text-xs text-muted-foreground mt-0.5">
              Configura hasta dos cuentas bancarias para Pago Móvil y Transferencia, con sus respectivos códigos QR.
            </p>
          </div>

          {/* BLOQUE PAGO MÓVIL (CUENTA 1 Y CUENTA 2) */}
          <div className="p-5 rounded-2xl bg-black/5 dark:bg-white/5 border border-primary/20 space-y-4">
            <h5 className="font-bold text-sm text-foreground flex items-center justify-between">
              <span>📲 Pago Móvil (Hasta 2 Cuentas)</span>
            </h5>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Cuenta 1 */}
              <div className="p-4 rounded-xl bg-card border border-black/10 dark:border-white/10 space-y-3">
                <span className="text-xs font-bold text-primary block">Cuenta Principal (Cuenta #1)</span>
                <textarea 
                  rows={3} 
                  value={storePaymentInstructions.pagoMovil} 
                  onChange={(e) => setStorePaymentInstructions((prev: any) => ({...prev, pagoMovil: e.target.value}))} 
                  className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-lg p-2.5 text-xs focus:border-primary font-mono" 
                  placeholder="Banco: ...&#10;Cédula: ...&#10;Teléfono: ..." 
                />
                <div>
                  <label className="text-[11px] font-bold text-muted-foreground block mb-1">Código QR (Cuenta #1)</label>
                  {!storePaymentQRs.pagoMovil ? (
                    <label className="flex items-center justify-center gap-2 w-full bg-black/5 dark:bg-black/30 border border-dashed border-black/15 dark:border-white/15 rounded-lg p-3 text-xs text-muted-foreground hover:bg-primary/10 hover:text-primary cursor-pointer transition">
                      <QrCode className="h-4 w-4" />
                      <span>Subir QR Cuenta 1</span>
                      <input type="file" accept="image/*" onChange={(e) => handleQRUpload('pagoMovil', e)} className="hidden" />
                    </label>
                  ) : (
                    <div className="flex items-center gap-3">
                      <img src={storePaymentQRs.pagoMovil} className="h-14 w-14 object-contain rounded border border-white/10 bg-white/5 p-1" />
                      <button type="button" onClick={() => setStorePaymentQRs((p: any) => ({...p, pagoMovil: ''}))} className="text-xs text-destructive hover:underline font-bold">Eliminar QR 1</button>
                    </div>
                  )}
                </div>
              </div>

              {/* Cuenta 2 */}
              <div className="p-4 rounded-xl bg-card border border-black/10 dark:border-white/10 space-y-3">
                <span className="text-xs font-bold text-primary block">Cuenta Secundaria (Cuenta #2 - Opcional)</span>
                <textarea 
                  rows={3} 
                  value={storePaymentInstructions.pagoMovil2 || ''} 
                  onChange={(e) => setStorePaymentInstructions((prev: any) => ({...prev, pagoMovil2: e.target.value}))} 
                  className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-lg p-2.5 text-xs focus:border-primary font-mono" 
                  placeholder="Banco: ...&#10;Cédula: ...&#10;Teléfono: ..." 
                />
                <div>
                  <label className="text-[11px] font-bold text-muted-foreground block mb-1">Código QR (Cuenta #2)</label>
                  {!storePaymentQRs.pagoMovil2 ? (
                    <label className="flex items-center justify-center gap-2 w-full bg-black/5 dark:bg-black/30 border border-dashed border-black/15 dark:border-white/15 rounded-lg p-3 text-xs text-muted-foreground hover:bg-primary/10 hover:text-primary cursor-pointer transition">
                      <QrCode className="h-4 w-4" />
                      <span>Subir QR Cuenta 2</span>
                      <input type="file" accept="image/*" onChange={(e) => handleQRUpload('pagoMovil2', e)} className="hidden" />
                    </label>
                  ) : (
                    <div className="flex items-center gap-3">
                      <img src={storePaymentQRs.pagoMovil2} className="h-14 w-14 object-contain rounded border border-white/10 bg-white/5 p-1" />
                      <button type="button" onClick={() => setStorePaymentQRs((p: any) => ({...p, pagoMovil2: ''}))} className="text-xs text-destructive hover:underline font-bold">Eliminar QR 2</button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* BLOQUE TRANSFERENCIA BANCARIA (CUENTA 1 Y CUENTA 2) */}
          <div className="p-5 rounded-2xl bg-black/5 dark:bg-white/5 border border-primary/20 space-y-4">
            <h5 className="font-bold text-sm text-foreground flex items-center justify-between">
              <span>🏦 Transferencia Bancaria (Hasta 2 Cuentas)</span>
            </h5>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Cuenta 1 */}
              <div className="p-4 rounded-xl bg-card border border-black/10 dark:border-white/10 space-y-3">
                <span className="text-xs font-bold text-primary block">Cuenta Principal (Cuenta #1)</span>
                <textarea 
                  rows={3} 
                  value={storePaymentInstructions.transferencia} 
                  onChange={(e) => setStorePaymentInstructions((prev: any) => ({...prev, transferencia: e.target.value}))} 
                  className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-lg p-2.5 text-xs focus:border-primary font-mono" 
                  placeholder="Banco: ...&#10;Número de Cuenta: ...&#10;Titular / RIF: ..." 
                />
                <div>
                  <label className="text-[11px] font-bold text-muted-foreground block mb-1">Código QR (Cuenta #1)</label>
                  {!storePaymentQRs.transferencia ? (
                    <label className="flex items-center justify-center gap-2 w-full bg-black/5 dark:bg-black/30 border border-dashed border-black/15 dark:border-white/15 rounded-lg p-3 text-xs text-muted-foreground hover:bg-primary/10 hover:text-primary cursor-pointer transition">
                      <QrCode className="h-4 w-4" />
                      <span>Subir QR Cuenta 1</span>
                      <input type="file" accept="image/*" onChange={(e) => handleQRUpload('transferencia', e)} className="hidden" />
                    </label>
                  ) : (
                    <div className="flex items-center gap-3">
                      <img src={storePaymentQRs.transferencia} className="h-14 w-14 object-contain rounded border border-white/10 bg-white/5 p-1" />
                      <button type="button" onClick={() => setStorePaymentQRs((p: any) => ({...p, transferencia: ''}))} className="text-xs text-destructive hover:underline font-bold">Eliminar QR 1</button>
                    </div>
                  )}
                </div>
              </div>

              {/* Cuenta 2 */}
              <div className="p-4 rounded-xl bg-card border border-black/10 dark:border-white/10 space-y-3">
                <span className="text-xs font-bold text-primary block">Cuenta Secundaria (Cuenta #2 - Opcional)</span>
                <textarea 
                  rows={3} 
                  value={storePaymentInstructions.transferencia2 || ''} 
                  onChange={(e) => setStorePaymentInstructions((prev: any) => ({...prev, transferencia2: e.target.value}))} 
                  className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-lg p-2.5 text-xs focus:border-primary font-mono" 
                  placeholder="Banco: ...&#10;Número de Cuenta: ...&#10;Titular / RIF: ..." 
                />
                <div>
                  <label className="text-[11px] font-bold text-muted-foreground block mb-1">Código QR (Cuenta #2)</label>
                  {!storePaymentQRs.transferencia2 ? (
                    <label className="flex items-center justify-center gap-2 w-full bg-black/5 dark:bg-black/30 border border-dashed border-black/15 dark:border-white/15 rounded-lg p-3 text-xs text-muted-foreground hover:bg-primary/10 hover:text-primary cursor-pointer transition">
                      <QrCode className="h-4 w-4" />
                      <span>Subir QR Cuenta 2</span>
                      <input type="file" accept="image/*" onChange={(e) => handleQRUpload('transferencia2', e)} className="hidden" />
                    </label>
                  ) : (
                    <div className="flex items-center gap-3">
                      <img src={storePaymentQRs.transferencia2} className="h-14 w-14 object-contain rounded border border-white/10 bg-white/5 p-1" />
                      <button type="button" onClick={() => setStorePaymentQRs((p: any) => ({...p, transferencia2: ''}))} className="text-xs text-destructive hover:underline font-bold">Eliminar QR 2</button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* BLOQUE BINANCE PAY (CUENTA ÚNICA) */}
          <div className="p-5 rounded-2xl bg-black/5 dark:bg-white/5 border border-primary/20 space-y-4">
            <h5 className="font-bold text-sm text-foreground">🟡 Binance Pay (Cuenta Única)</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-medium block">Datos de Binance Pay</label>
                <textarea 
                  rows={3} 
                  value={storePaymentInstructions.binance} 
                  onChange={(e) => setStorePaymentInstructions((prev: any) => ({...prev, binance: e.target.value}))} 
                  className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-lg p-2.5 text-xs focus:border-primary font-mono" 
                  placeholder="Email: ...&#10;Pay ID: ..." 
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium block">Código QR Binance Pay</label>
                {!storePaymentQRs.binance ? (
                  <label className="flex items-center justify-center gap-2 w-full bg-black/5 dark:bg-black/30 border border-dashed border-black/15 dark:border-white/15 rounded-lg p-3 text-xs text-muted-foreground hover:bg-primary/10 hover:text-primary cursor-pointer transition">
                    <QrCode className="h-4 w-4" />
                    <span>Subir QR Binance Pay</span>
                    <input type="file" accept="image/*" onChange={(e) => handleQRUpload('binance', e)} className="hidden" />
                  </label>
                ) : (
                  <div className="flex items-center gap-3">
                    <img src={storePaymentQRs.binance} className="h-14 w-14 object-contain rounded border border-white/10 bg-white/5 p-1" />
                    <button type="button" onClick={() => setStorePaymentQRs((p: any) => ({...p, binance: ''}))} className="text-xs text-destructive hover:underline font-bold">Eliminar QR</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
