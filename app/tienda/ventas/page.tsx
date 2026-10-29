"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { useSettings } from "@/lib/settings-context"
import { storeService, Transaction } from "@/lib/store-service"
import { athleteService, AthleteProfile } from "@/lib/data-service"
import { useToast } from "@/lib/toast-context"
import { StoreNav } from "@/components/store/StoreNav"
import { Card, CardContent } from "@/components/ui/card"
import { ReceiptText, Calendar } from "lucide-react"

export default function VentasPage() {
  const { user } = useAuth()
  const { settings } = useSettings()
  const { showToast } = useToast()
  
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [athletes, setAthletes] = useState<AthleteProfile[]>([])
  const [viewImage, setViewImage] = useState<string | null>(null)
  const [showReceipt, setShowReceipt] = useState<Transaction | null>(null)

  const loadTransactions = async () => {
    const { getTransactions } = await import('@/app/actions/store')
    const res = await getTransactions()
    if (res.success) {
      setTransactions(res.transactions as any)
    }
    setAthletes(athleteService.getAthletes())
  }

  useEffect(() => {
    loadTransactions()
  }, [])

  const handleDeliver = async (tx: any) => {
    const Swal = (await import("sweetalert2")).default
    const confirm = await Swal.fire({
      title: '¿Completar y Entregar Pedido?',
      text: `Factura ${tx.id} por ${settings.storeCurrency} ${tx.total.toFixed(2)}. ¿Confirmas la entrega de productos al cliente?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, Entregar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#10b981',
    })
    if (!confirm.isConfirmed) return

    const { deliverTransaction } = await import('@/app/actions/store')
    const res = await deliverTransaction(tx.id, user?.id || '')
    if (res.success) {
      setTransactions(prev => prev.map(t => t.id === tx.id ? { ...t, status: 'COMPLETED', deliveredBy: user?.name || user?.id } : t))
      showToast("¡Venta finalizada y productos entregados exitosamente!", "success")
    } else {
      showToast(res.error || "No se pudo completar la entrega.", "error")
    }
  }

  const handleCancel = async (tx: any) => {
    const Swal = (await import("sweetalert2")).default
    const confirm = await Swal.fire({
      title: '¿Anular Factura?',
      text: `Se cancelará la factura ${tx.id} y se reincorporarán los productos al stock del inventario.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, Anular Venta',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#ef4444',
    })
    if (!confirm.isConfirmed) return

    const { cancelTransaction } = await import('@/app/actions/store')
    const res = await cancelTransaction(tx.id)
    if (res.success) {
      setTransactions(prev => prev.map(t => t.id === tx.id ? { ...t, status: 'CANCELED' } : t))
      showToast("Factura anulada correctamente.", "success")
    } else {
      showToast(res.error || "Error al anular factura.", "error")
    }
  }

  const isAuthorized = user && (
    user.role === 'admin' ||
    user.role === 'gerente' ||
    user.role === 'cajero' ||
    user.role === 'recepcion' ||
    user.permissions?.includes('SALES_VIEW') ||
    user.permissions?.includes('POS_ACCESS')
  )

  if (!isAuthorized) {
    return <div className="p-8 text-center text-destructive font-bold">Acceso Denegado. Solo personal autorizado.</div>
  }

  const getAthleteName = (tx: any) => {
    if (!tx.customerId) return "Cliente General"
    if (tx.customer) return `${tx.customer.name} (C.C. ${tx.customer.cedula})`
    return "Desconocido"
  }

  const getCustomerNameOnly = (tx: any) => {
    if (!tx?.customerId) return "Consumidor Final"
    if (tx.customer?.name) return tx.customer.name
    return "Desconocido"
  }

  const getCustomerCedula = (tx: any) => {
    if (!tx?.customerId) return ""
    return tx.customer?.cedula || ""
  }

  const getCashierName = (tx: any) => {
    if (tx?.cashier?.name) return tx.cashier.name
    if (user?.id && tx?.cashierId === user.id && user?.name) return user.name
    return tx?.cashierId ? "Administración" : "Pago Online"
  }

  const getInvoiceNumber = (tx: any) => {
    if (tx?.invoiceNumber) return String(tx.invoiceNumber).padStart(7, '0')
    const sorted = [...transactions].sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())
    const idx = sorted.findIndex((t: any) => t.id === tx?.id)
    if (idx >= 0) return String(idx + 1).padStart(7, '0')
    return "0000001"
  }

  const cleanRefString = (ref?: string | null) => {
    if (!ref) return ""
    return String(ref)
      .replace(/^Ref:\s*/i, '')
      .replace(/\s*\(Asiento desde edici[oó]n\)/gi, '')
      .replace(/^Asiento directo desde edici[oó]n de membres[ií]a$/i, '')
      .replace(/^Asignado desde Directorio de Atletas$/i, '')
      .trim()
  }

  const completedTxs = transactions.filter(t => t.status === 'COMPLETED')
  const pendingTxs = transactions.filter(t => t.status === 'PENDING_DELIVERY' || t.status === 'PENDING_PICKUP' || (t.status as string) === 'PENDING')
  const canceledTxs = transactions.filter(t => t.status === 'CANCELED')
  const totalCompletedIncome = completedTxs.reduce((acc, tx) => acc + (Number(tx.total) || 0), 0)

  return (
    <div className="space-y-6 max-w-full mx-auto">
      <div className="flex items-center gap-3">
        <h1 className="page-title mb-4">Historial de Ventas</h1>
      </div>
      <StoreNav />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="glass hover:scale-[1.02] hover:shadow-[0_0_15px_rgba(255,255,255,0.1)] transition-all duration-300">
          <CardContent className="p-6 flex items-start gap-4">
            <div className="p-3 bg-primary/20 rounded-full text-primary mt-1">
              <ReceiptText className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Total Facturas</p>
              <h3 className="text-2xl font-bold">{transactions.length}</h3>
              <div className="flex flex-wrap gap-x-2 gap-y-0.5 mt-1">
                <span className="text-xs font-bold text-amber-500">{pendingTxs.length} en espera</span>
                <span className="text-xs font-bold text-emerald-500">• {completedTxs.length} completadas</span>
                <span className="text-xs font-bold text-destructive">• {canceledTxs.length} anuladas</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="glass hover:scale-[1.02] hover:shadow-[0_0_15px_rgba(255,255,255,0.1)] transition-all duration-300">
          <CardContent className="p-6 flex items-start gap-4">
            <div className="p-3 bg-success/20 rounded-full text-success mt-1">
              <span className="text-xl font-bold leading-none">{settings.storeCurrency}</span>
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Ingresos Completados</p>
              <h3 className="text-2xl font-bold text-white">
                {settings.storeCurrency} {totalCompletedIncome.toFixed(2)}
              </h3>
              {settings.storeCurrencySecondary && settings.storeExchangeRate > 0 && (
                <p className="text-sm text-muted-foreground font-bold">{settings.storeCurrencySecondary} {(totalCompletedIncome * settings.storeExchangeRate).toFixed(2)}</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="glass hover:scale-[1.02] hover:shadow-[0_0_15px_rgba(255,255,255,0.1)] transition-all duration-300">
          <CardContent className="p-6 flex items-start gap-4">
            <div className="p-3 bg-info/20 rounded-full text-info mt-1">
              <Calendar className="h-6 w-6" />
            </div>
            <div className="w-full">
              <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Última Venta</p>
              <div className="mt-1">
                {transactions.length > 0 ? (
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-primary">#{getInvoiceNumber(transactions[0])}</h3>
                    <p className="text-xs text-muted-foreground">Cliente: <span className="text-white font-bold">{getAthleteName(transactions[0])}</span></p>
                    <p className="text-xs text-muted-foreground">{new Date(transactions[0].date).toLocaleString()}</p>
                    <button onClick={() => setShowReceipt(transactions[0])} className="text-xs text-info font-bold hover:underline mt-1 block">Visualizar Factura</button>
                  </div>
                ) : (
                  <h3 className="text-sm font-bold text-muted-foreground">N/A</h3>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="bg-card border border-black/10 dark:border-white/10 rounded-xl overflow-hidden glass">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm hidden md:table">
            <thead className="bg-black/5 dark:bg-black/40 border-b border-black/10 dark:border-white/10 text-muted-foreground">
              <tr>
                <th className="p-4 font-medium">ID Transacción</th>
                <th className="p-4 font-medium">Fecha</th>
                <th className="p-4 font-medium">Cliente</th>
                <th className="p-4 font-medium">Método</th>
                <th className="p-4 font-medium">Artículos</th>
                <th className="p-4 font-medium">Estado</th>
                <th className="p-4 font-medium text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {transactions.map(tx => (
                <tr key={tx.id} className="hover:bg-black/5 dark:bg-white/5 transition-colors">
                  <td className="p-4 font-medium text-primary">
                    <button onClick={() => setShowReceipt(tx)} className="hover:underline font-mono font-bold">#{getInvoiceNumber(tx)}</button>
                  </td>
                  <td className="p-4">{new Date(tx.date).toLocaleString()}</td>
                  <td className="p-4">{getAthleteName(tx)}</td>
                  <td className="p-4">
                    <div className="flex flex-col gap-1 items-start">
                      <span className="bg-black/10 dark:bg-white/10 px-2 py-1 rounded text-xs">
                        {tx.paymentMethod}
                      </span>
                      {(tx.paymentMethod === 'Transferencia' || tx.paymentMethod === 'Pago Móvil' || tx.paymentMethod === 'Binance') && tx.reference && (
                        <span className="text-[10px] text-muted-foreground uppercase">Ref: {tx.reference}</span>
                      )}
                      {(tx.paymentMethod === 'Transferencia' || tx.paymentMethod === 'Pago Móvil' || tx.paymentMethod === 'Binance') && tx.receiptImage && (
                        <button 
                          onClick={() => setViewImage(tx.receiptImage!)}
                          className="text-[10px] text-primary hover:underline font-bold"
                        >
                          Ver Capture
                        </button>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="space-y-1">
                      {tx.items.map(item => (
                        <div key={item.productId} className="text-xs text-muted-foreground flex justify-between gap-4">
                          <span>{item.qty}x {item.name}</span>
                          <span>{settings.storeCurrency}{item.subtotal.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="p-4">
                    {tx.status === 'PENDING_DELIVERY' || tx.status === 'PENDING_PICKUP' || (tx.status as string) === 'PENDING' ? (
                      <div className="flex flex-col gap-2 items-start">
                        <span className="bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 px-2.5 py-1 rounded-full text-[10px] font-bold">
                          EN ESPERA
                        </span>
                        <div className="flex gap-1.5 flex-wrap">
                          <button 
                            onClick={() => handleDeliver(tx)}
                            className="bg-transparent border border-emerald-500 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 transition text-xs px-2.5 py-1 rounded-md font-bold"
                          >
                            Entregar
                          </button>
                          <button 
                            onClick={() => handleCancel(tx)}
                            className="bg-transparent border border-destructive/40 text-destructive hover:bg-destructive/10 transition text-xs px-2.5 py-1 rounded-md font-bold"
                          >
                            Anular
                          </button>
                        </div>
                      </div>
                    ) : tx.status === 'CANCELED' ? (
                      <div className="flex flex-col items-start gap-1">
                        <span className="bg-destructive/20 text-destructive border border-destructive/30 px-2.5 py-1 rounded-full text-[10px] font-bold">
                          ANULADA
                        </span>
                      </div>
                    ) : tx.status === 'PENDING_PAYMENT' ? (
                      <div className="flex flex-col items-start gap-1">
                        <span className="bg-purple-500/20 text-purple-600 dark:text-purple-400 border border-purple-500/30 px-2.5 py-1 rounded-full text-[10px] font-bold">
                          PENDIENTE DE PAGO
                        </span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-start gap-1">
                        <span className="bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 px-2.5 py-1 rounded-full text-[10px] font-bold">
                          COMPLETADO
                        </span>
                        {tx.deliveredBy && (
                          <span className="text-[10px] text-muted-foreground">Entregado por: {tx.deliveredBy}</span>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="p-4 text-right font-bold text-success">
                    <div>{settings.storeCurrency} {tx.total.toFixed(2)}</div>
                    {settings.storeExchangeRate > 0 && settings.storeCurrencySecondary && (
                      <div className="text-[10px] text-muted-foreground font-normal">
                        ({settings.storeCurrencySecondary} {(tx.total * settings.storeExchangeRate).toFixed(2)})
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {transactions.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-muted-foreground">
                    No se han registrado ventas aún.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Vista Móvil de Ventas */}
          <div className="md:hidden flex flex-col divide-y divide-black/10 dark:divide-white/10">
            {transactions.map(tx => (
              <div key={tx.id} className="p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-bold text-primary">
                      <button onClick={() => setShowReceipt(tx)} className="hover:underline font-mono">#{getInvoiceNumber(tx)}</button>
                    </div>
                    <div className="text-xs text-muted-foreground">{new Date(tx.date).toLocaleString()}</div>
                  </div>
                  <div className="text-right font-bold text-success">
                    {settings.storeCurrency} {tx.total.toFixed(2)}
                  </div>
                </div>
                
                <div className="text-sm">
                  <span className="text-muted-foreground">Cliente:</span> {getAthleteName(tx)}
                </div>

                <div className="flex justify-between items-center bg-black/5 dark:bg-white/5 p-2 rounded-lg">
                  <div className="flex flex-col gap-1 items-start">
                    <span className="text-xs font-bold">{tx.paymentMethod}</span>
                    {(tx.paymentMethod === 'Transferencia' || tx.paymentMethod === 'Pago Móvil' || tx.paymentMethod === 'Binance') && tx.reference && (
                      <span className="text-[10px] text-muted-foreground uppercase">Ref: {tx.reference}</span>
                    )}
                  </div>
                  {(tx.paymentMethod === 'Transferencia' || tx.paymentMethod === 'Pago Móvil' || tx.paymentMethod === 'Binance') && tx.receiptImage && (
                    <button 
                      onClick={() => setViewImage(tx.receiptImage!)}
                      className="text-xs bg-primary/20 text-primary px-2 py-1 rounded hover:bg-primary/30 font-bold"
                    >
                      Ver Capture
                    </button>
                  )}
                </div>

                <div className="space-y-1">
                  {tx.items.map(item => (
                    <div key={item.productId} className="text-xs text-muted-foreground flex justify-between gap-4">
                      <span>{item.qty}x {item.name}</span>
                      <span>{settings.storeCurrency}{item.subtotal.toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-2 border-t border-black/5 dark:border-white/5">
                  {tx.status === 'PENDING_DELIVERY' || tx.status === 'PENDING_PICKUP' || (tx.status as string) === 'PENDING' ? (
                    <div className="flex flex-col gap-2">
                      <div className="flex justify-between items-center">
                        <span className="bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 px-2.5 py-1 rounded-full text-[10px] font-bold">
                          EN ESPERA
                        </span>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleDeliver(tx)}
                            className="text-xs bg-transparent border border-emerald-500 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 transition px-2.5 py-1 rounded-md font-bold"
                          >
                            Entregar
                          </button>
                          <button 
                            onClick={() => handleCancel(tx)}
                            className="text-xs bg-transparent border border-destructive/40 text-destructive hover:bg-destructive/10 transition px-2.5 py-1 rounded-md font-bold"
                          >
                            Anular
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : tx.status === 'CANCELED' ? (
                    <div className="flex justify-between items-center">
                      <span className="bg-destructive/20 text-destructive border border-destructive/30 px-2.5 py-1 rounded-full text-[10px] font-bold">
                        ANULADA
                      </span>
                    </div>
                  ) : tx.status === 'PENDING_PAYMENT' ? (
                    <div className="flex justify-between items-center">
                      <span className="bg-purple-500/20 text-purple-600 dark:text-purple-400 border border-purple-500/30 px-2.5 py-1 rounded-full text-[10px] font-bold">
                        PENDIENTE DE PAGO
                      </span>
                    </div>
                  ) : (
                    <div className="flex justify-between items-center">
                      <span className="bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 px-2.5 py-1 rounded-full text-[10px] font-bold">
                        COMPLETADO
                      </span>
                      {tx.deliveredBy && (
                        <span className="text-[10px] text-muted-foreground truncate max-w-[150px]">
                          Por: {tx.deliveredBy}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {transactions.length === 0 && (
              <div className="p-8 text-center text-muted-foreground">
                No se han registrado ventas aún.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal Visor de Capture */}
      {viewImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm" onClick={() => setViewImage(null)}>
          <div className="bg-card border border-black/10 dark:border-white/10 rounded-xl max-w-2xl w-full p-2 shadow-2xl relative" onClick={e => e.stopPropagation()}>
            <button onClick={() => setViewImage(null)} className="absolute -top-10 right-0 text-white hover:text-destructive font-bold text-xl">&times; Cerrar</button>
            <img src={viewImage} alt="Capture" className="w-full h-auto max-h-[80vh] object-contain rounded-lg" />
          </div>
        </div>
      )}

      {/* TICKET / RECIBO MODAL */}
      {showReceipt && (() => {
        const widthClass = settings.storeTicketWidth === '58mm' ? 'max-w-[280px]' : settings.storeTicketWidth === 'Carta' ? 'max-w-2xl' : 'max-w-sm';
        const invNum = getInvoiceNumber(showReceipt);
        const cashierDisplay = getCashierName(showReceipt);
        const clientName = getCustomerNameOnly(showReceipt);
        const clientCedula = getCustomerCedula(showReceipt);
        const cleanedRef = cleanRefString(showReceipt.reference);
        const logoSrc = settings.logoUrl || settings.logoUrlDark;
        const rate = settings.storeExchangeRate || 1;
        const secCurr = settings.storeCurrencySecondary || 'BsS';
        const mainCurr = settings.storeCurrency || '$';

        return (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 overflow-y-auto">
            <div className={`bg-white text-black p-8 w-full font-mono text-sm relative shadow-2xl my-auto ${widthClass}`}>
              <button onClick={() => setShowReceipt(null)} className="absolute top-4 right-4 text-gray-500 hover:text-black font-sans font-bold text-xl print:hidden">&times;</button>
              
              <div className="text-center mb-6 border-b border-dashed border-black pb-6">
                {logoSrc && (
                  <div className="flex justify-center mb-2">
                    <img src={logoSrc} alt={settings.appName} className="h-14 w-auto max-w-[150px] object-contain mx-auto" />
                  </div>
                )}
                <h2 className="font-bold text-2xl uppercase tracking-widest">{settings.appName}</h2>
                {settings.storeRif && <p className="text-xs text-black mt-1 font-bold">RIF/NIT: {settings.storeRif}</p>}
                {settings.storeAddress && <p className="text-xs text-black mb-2">{settings.storeAddress}</p>}
                {showReceipt.pickupCode && (
                  <div className="mt-2 mb-2 p-2 border-2 border-dashed border-black bg-gray-100">
                    <p className="font-bold">CÓDIGO DE RETIRO</p>
                    <p className="text-xl font-black">{showReceipt.pickupCode}</p>
                  </div>
                )}
                <div className="text-sm border-b border-black/20 pb-4 mb-4 mt-3 space-y-0.5">
                  <p className="text-black font-bold">Factura N°: {invNum}</p>
                  <p className="text-black">Fecha: {new Date(showReceipt.date).toLocaleString()}</p>
                  <p className="text-black">Cajero: {cashierDisplay}</p>
                  <p className="text-black">Cliente: {clientName}</p>
                  {clientCedula && <p className="text-black">Cédula / C.I.: {clientCedula}</p>}
                </div>
              </div>

              <div className="space-y-2 mb-6 text-black">
                <div className="flex justify-between font-bold border-b border-black pb-1 mb-2">
                  <span>CANT. DESC.</span>
                  <span>TOTAL</span>
                </div>
                {showReceipt.items.map(item => {
                  const cleanName = String(item.name || '').replace(/\s*\((Ajuste administrativo|Edici[oó]n de Atleta)\)/gi, '').trim();
                  return (
                    <div key={item.productId} className="flex justify-between items-start text-sm mb-1 leading-tight">
                      <div className="flex gap-2 pr-2">
                        <span className="font-bold">{item.qty}x</span>
                        <span>{cleanName}</span>
                      </div>
                      <span className="shrink-0 font-bold">{secCurr} {(item.subtotal * rate).toFixed(2)}</span>
                    </div>
                  );
                })}
              </div>

              <div className="border-t border-dashed border-black pt-4 space-y-1 text-black font-bold">
                <div className="flex justify-between">
                  <span>Artículos Totales</span>
                  <span>{showReceipt.items.reduce((acc, item) => acc + item.qty, 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{secCurr} {(showReceipt.subtotal * rate).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>IVA ({settings.storeTaxRate}%)</span>
                  <span>{secCurr} {(showReceipt.tax * rate).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xl font-black mt-2 pt-2 border-t border-black">
                  <span>TOTAL</span>
                  <span>{secCurr} {(showReceipt.total * rate).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-base font-black text-gray-800 pb-1">
                  <span>TOTAL ({mainCurr})</span>
                  <span>{mainCurr} {Number(showReceipt.total || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between mt-2">
                  <span>Pago con:</span>
                  <span className="uppercase">{showReceipt.paymentMethod}</span>
                </div>
                {cleanedRef && (
                  <div className="flex justify-between">
                    <span>Ref:</span>
                    <span className="uppercase">{cleanedRef}</span>
                  </div>
                )}
              </div>

              <div className="text-center mt-8 text-black italic font-bold">
                {settings.storeReceiptMessage}
              </div>

              <div className="mt-6 flex flex-col gap-2 print:hidden">
                <button 
                  onClick={() => window.print()}
                  className="w-full bg-black text-white font-sans font-bold py-3 rounded hover:bg-gray-800 transition flex items-center justify-center gap-2"
                >
                  <ReceiptText className="h-5 w-5" /> Imprimir Recibo
                </button>
              </div>
            </div>
          </div>
        )
      })()}
    </div>
  )
}
