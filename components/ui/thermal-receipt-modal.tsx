"use client"

import React, { useEffect } from "react"
import { ReceiptText, X } from "lucide-react"

export interface ThermalReceiptModalProps {
  transaction: any | null
  onClose: () => void
  settings: {
    appName?: string
    storeRif?: string
    storeAddress?: string
    storeReceiptMessage?: string
    storeTaxRate?: number
    storeTicketWidth?: string
    storeCurrency?: string
    storeCurrencySecondary?: string
    storeExchangeRate?: number
    logoUrl?: string
    logoUrlDark?: string
  }
  currentUserName?: string
  currentUserId?: string
  athletes?: any[]
}

export function ThermalReceiptModal({
  transaction,
  onClose,
  settings,
  currentUserName,
  currentUserId,
  athletes,
}: ThermalReceiptModalProps) {
  useEffect(() => {
    if (!transaction) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [transaction, onClose])

  if (!transaction) return null

  const widthClass =
    settings.storeTicketWidth === "58mm"
      ? "max-w-[280px]"
      : settings.storeTicketWidth === "Carta"
      ? "max-w-2xl"
      : "max-w-sm"

  const invNum = transaction?.invoiceNumber
    ? String(transaction.invoiceNumber).padStart(7, "0")
    : String(transaction?.id || "0000001").slice(-7).padStart(7, "0")

  const cashierDisplay =
    transaction?.cashier?.name ||
    (currentUserId && transaction?.cashierId === currentUserId && currentUserName) ||
    (transaction?.cashierId ? "Administración" : "Pago Online")

  const matchedAthlete = transaction?.customerId && athletes ? athletes.find((a: any) => a.id === transaction.customerId) : null
  const clientName = transaction?.customer?.name || matchedAthlete?.name || (transaction?.customerId ? "Cliente Registrado" : "Consumidor Final")
  const clientCedula = transaction?.customer?.cedula || matchedAthlete?.cedula || ""

  const cleanRefString = (ref?: string | null) => {
    if (!ref) return ""
    return String(ref)
      .replace(/^Ref:\s*/i, "")
      .replace(/\s*\(Asiento desde edici[oó]n\)/gi, "")
      .replace(/^Asiento directo desde edici[oó]n de membres[ií]a$/i, "")
      .replace(/^Asignado desde Directorio de Atletas$/i, "")
      .trim()
  }

  const cleanedRef = cleanRefString(transaction.reference)
  const logoSrc = settings.logoUrl || settings.logoUrlDark
  const rate = Number(settings.storeExchangeRate) || 1
  const secCurr = settings.storeCurrencySecondary || "Bs."
  const mainCurr = settings.storeCurrency || "$"

  const items = transaction.items || []
  const totalItemsCount = items.reduce((acc: number, item: any) => acc + (Number(item.qty) || 0), 0)
  const isNoFlow = /sin flujo/i.test(transaction?.paymentMethod || "") || /historico/i.test(transaction?.paymentMethod || "")

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 overflow-y-auto backdrop-blur-sm animate-in fade-in duration-150"
      onClick={e => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className={`bg-white text-black p-8 w-full font-mono text-sm relative shadow-2xl my-auto rounded-lg ${widthClass}`}>
        <button
          onClick={onClose}
          aria-label="Cerrar ticket"
          className="absolute top-4 right-4 text-gray-500 hover:text-black font-sans font-bold text-xl print:hidden transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="text-center mb-6 border-b border-dashed border-black pb-6">
          {logoSrc && (
            <div className="flex justify-center mb-2">
              <img
                src={logoSrc}
                alt={settings.appName || "Logo"}
                className="h-14 w-auto max-w-[150px] object-contain mx-auto"
              />
            </div>
          )}
          <h2 className="font-bold text-2xl uppercase tracking-widest">{settings.appName || "GYM"}</h2>
          {settings.storeRif && <p className="text-xs text-black mt-1 font-bold">RIF/NIT: {settings.storeRif}</p>}
          {settings.storeAddress && <p className="text-xs text-black mb-2">{settings.storeAddress}</p>}

          {transaction.pickupCode && (
            <div className="mt-2 mb-2 p-2 border-2 border-dashed border-black bg-gray-100">
              <p className="font-bold text-xs uppercase">CÓDIGO DE RETIRO</p>
              <p className="text-xl font-black">{transaction.pickupCode}</p>
            </div>
          )}

          {isNoFlow && (
            <div className="mt-2 mb-2 p-2 border-2 border-dashed border-amber-600 bg-amber-50 text-amber-950 rounded">
              <p className="font-bold text-xs uppercase tracking-wide">⚠️ Factura Sin Flujo de Caja</p>
              <p className="text-[11px] leading-tight mt-0.5 font-sans font-medium">Asignación administrativa / membresía previa. No ingresó a caja física.</p>
            </div>
          )}

          <div className="text-sm border-b border-black/20 pb-4 mb-4 mt-3 space-y-0.5 text-left">
            <p className="text-black font-bold">Factura N°: {invNum}</p>
            <p className="text-black">Fecha: {new Date(transaction.date).toLocaleString()}</p>
            <p className="text-black">Cajero: {cashierDisplay}</p>
            <p className="text-black">Cliente: {clientName}</p>
            {clientCedula && <p className="text-black">Cédula / C.I.: {clientCedula}</p>}
            {transaction.deliveredBy && (
              <p className="text-black font-bold">Despachado por: {transaction.deliveredBy}</p>
            )}
          </div>
        </div>

        <div className="space-y-2 mb-6 text-black">
          <div className="flex justify-between font-bold border-b border-black pb-1 mb-2 text-xs">
            <span>CANT. DESC.</span>
            <span>TOTAL</span>
          </div>
          {items.map((item: any, idx: number) => {
            const cleanName = String(item.name || "")
              .replace(/\s*\((Ajuste administrativo|Edici[oó]n de Atleta)\)/gi, "")
              .trim()
            return (
              <div key={item.productId || idx} className="flex justify-between items-start text-xs mb-1 leading-tight">
                <div className="flex gap-2 pr-2">
                  <span className="font-bold">{item.qty}x</span>
                  <span>{cleanName}</span>
                </div>
                <span className="shrink-0 font-bold">
                  {secCurr} {(Number(item.subtotal || 0) * rate).toFixed(2)}
                </span>
              </div>
            )
          })}
        </div>

        <div className="border-t border-dashed border-black pt-4 space-y-1 text-black font-bold text-xs">
          <div className="flex justify-between">
            <span>Artículos Totales</span>
            <span>{totalItemsCount}</span>
          </div>
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>{secCurr} {(Number(transaction.subtotal || 0) * rate).toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>IVA ({settings.storeTaxRate || 0}%)</span>
            <span>{secCurr} {(Number(transaction.tax || 0) * rate).toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-base font-black mt-2 pt-2 border-t border-black">
            <span>TOTAL ({secCurr})</span>
            <span>{secCurr} {(Number(transaction.total || 0) * rate).toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm font-black text-gray-800 pb-1">
            <span>TOTAL ({mainCurr})</span>
            <span>{mainCurr} {Number(transaction.total || 0).toFixed(2)}</span>
          </div>
          <div className="flex justify-between mt-2 pt-1 border-t border-dotted border-gray-400">
            <span>Método de Pago:</span>
            <span className={`uppercase ${isNoFlow ? "text-amber-800 font-bold" : ""}`}>{transaction.paymentMethod || "Efectivo"}</span>
          </div>
          {isNoFlow && (
            <div className="text-right text-[10px] text-amber-700 italic font-semibold">
              * Factura histórica (No computable en arqueo de caja)
            </div>
          )}
          {cleanedRef && (
            <div className="flex justify-between">
              <span>Ref / Comprobante:</span>
              <span className="uppercase">{cleanedRef}</span>
            </div>
          )}
        </div>

        {settings.storeReceiptMessage && (
          <div className="text-center mt-6 text-black italic text-xs">
            {settings.storeReceiptMessage}
          </div>
        )}

        <div className="mt-6 flex flex-col gap-2 print:hidden">
          <button
            onClick={() => window.print()}
            className="w-full bg-black text-white font-sans font-bold py-3 rounded-lg hover:bg-gray-800 transition flex items-center justify-center gap-2 text-sm shadow-md cursor-pointer"
          >
            <ReceiptText className="h-4 w-4" /> Imprimir Recibo
          </button>
          <button
            onClick={() => {
              const phone = transaction?.customer?.phone || matchedAthlete?.phone || prompt("Ingrese número de teléfono (con código de país ej. 58412...):")
              if (phone) {
                const cleanPhone = phone.replace(/[^0-9]/g, "")
                const msg = `Hola! Tu recibo de compra en *${settings.appName || "Gym"}* está listo.%0A%0AFactura N°: ${invNum}%0ATotal: ${mainCurr} ${Number(transaction.total || 0).toFixed(2)} (${secCurr} ${(Number(transaction.total || 0) * rate).toFixed(2)})%0A%0A¡Gracias por preferirnos!`
                window.open(`https://wa.me/${cleanPhone}?text=${msg}`, "_blank")
              }
            }}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-sans font-bold py-2.5 rounded-lg transition flex items-center justify-center gap-2 text-sm shadow-md cursor-pointer"
          >
            Enviar por WhatsApp
          </button>
        </div>
      </div>
    </div>
  )
}
