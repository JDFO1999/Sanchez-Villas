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

  useEffect(() => {
    setTransactions(storeService.getTransactions().reverse()) // Newest first
    setAthletes(athleteService.getAthletes())
  }, [])

  if (!user || (user.role !== 'admin' && !user.permissions?.includes('SALES_VIEW'))) {
    return <div className="p-8 text-center text-red-500 font-bold">Acceso Denegado. Solo personal autorizado.</div>
  }

  const getAthleteName = (id?: string) => {
    if (!id) return "Cliente General"
    const athlete = athletes.find(a => a.id === id)
    return athlete ? `${athlete.name} (C.C. ${athlete.cedula})` : "Desconocido"
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center gap-3">
        <h1 className="text-4xl font-black tracking-tighter bg-gradient-to-r from-primary dark:dark:via-white via-black via-black to-primary/50 bg-clip-text text-transparent dark:dark:drop-shadow-[0_0_15px_rgba(255,255,255,0.1)] drop-shadow-sm drop-shadow-sm mb-4">Historial de Ventas</h1>
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
              <p className="text-xs font-bold text-yellow-500">{transactions.filter(t => t.status === 'PENDING_PICKUP').length} en espera</p>
              <p className="text-xs font-bold text-green-500">{transactions.filter(t => t.status === 'COMPLETED').length} completadas</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="glass hover:scale-[1.02] hover:shadow-[0_0_15px_rgba(255,255,255,0.1)] transition-all duration-300">
          <CardContent className="p-6 flex items-start gap-4">
            <div className="p-3 bg-green-500/20 rounded-full text-green-500 mt-1">
              <span className="text-xl font-bold leading-none">{settings.storeCurrency}</span>
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Ingresos Totales</p>
              <h3 className="text-2xl font-bold text-white">
                {settings.storeCurrency} {transactions.reduce((acc, tx) => acc + tx.total, 0).toFixed(2)}
              </h3>
              {settings.storeCurrencySecondary && settings.storeExchangeRate > 0 && (
                <p className="text-sm text-muted-foreground font-bold">{settings.storeCurrencySecondary} {(transactions.reduce((acc, tx) => acc + tx.total, 0) * settings.storeExchangeRate).toFixed(2)}</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="glass hover:scale-[1.02] hover:shadow-[0_0_15px_rgba(255,255,255,0.1)] transition-all duration-300">
          <CardContent className="p-6 flex items-start gap-4">
            <div className="p-3 bg-blue-500/20 rounded-full text-blue-500 mt-1">
              <Calendar className="h-6 w-6" />
            </div>
            <div className="w-full">
              <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Última Venta</p>
              <div className="mt-1">
                {transactions.length > 0 ? (
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-primary">{transactions[0].id}</h3>
                    <p className="text-xs text-muted-foreground">Cliente: <span className="text-white font-bold">{getAthleteName(transactions[0].customerId)}</span></p>
                    <p className="text-xs text-muted-foreground">{new Date(transactions[0].date).toLocaleString()}</p>
                    <button onClick={() => setShowReceipt(transactions[0])} className="text-xs text-blue-400 font-bold hover:underline mt-1 block">Visualizar Factura</button>
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
        <div className="overflow-hidden">
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
                  <td className="p-4 font-medium text-primary">{tx.id}</td>
                  <td className="p-4">{new Date(tx.date).toLocaleString()}</td>
                  <td className="p-4">{getAthleteName(tx.customerId)}</td>
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
                    {tx.status === 'PENDING_PICKUP' ? (
                      <div className="flex flex-col gap-2 items-start">
                        <span className="bg-yellow-500/20 text-yellow-500 px-2 py-1 rounded-full text-[10px] font-bold">POR ENTREGAR</span>
                        <button 
                          onClick={() => {
                            import("sweetalert2").then((Swal) => {
                              Swal.default.fire({
                                title: 'Verificar Código de Retiro',
                                input: 'text',
                                inputPlaceholder: 'Ingrese el código (Ej: ATH-1234)',
                                showCancelButton: true,
                                confirmButtonText: 'Verificar',
                                cancelButtonText: 'Cancelar',
                                confirmButtonColor: '#22c55e',
                                inputAttributes: { style: 'text-transform: uppercase; text-align: center; font-size: 1.2rem; font-weight: bold; letter-spacing: 0.1em;' },
                                customClass: { input: 'swal-code-input' }
                              }).then((result) => {
                                if (result.isConfirmed && result.value) {
                                  if (result.value.trim().toUpperCase() === tx.pickupCode?.toUpperCase()) {
                                    const updatedTx = { ...tx, status: 'COMPLETED' as const, deliveredBy: user?.name || user?.id }
                                    storeService.updateTransaction(updatedTx)
                                    setTransactions(storeService.getTransactions().reverse())
                                    Swal.default.fire({ icon: 'success', title: '¡Entregado!', text: 'Código correcto. Productos entregados.', timer: 2000, showConfirmButton: false })
                                  } else {
                                    Swal.default.fire({ icon: 'error', title: 'Código Incorrecto', text: 'El código no coincide. Verifica e intenta de nuevo.' })
                                  }
                                }
                              })
                            })
                          }}
                          className="bg-primary text-primary-foreground text-xs px-3 py-1 rounded hover:bg-primary/90 font-bold"
                        >
                          Entregar
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-start gap-1">
                        <span className="bg-green-500/20 text-green-500 px-2 py-1 rounded-full text-[10px] font-bold">COMPLETADO</span>
                        {tx.deliveredBy && (
                          <span className="text-[10px] text-muted-foreground">Entregado por: {tx.deliveredBy}</span>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="p-4 text-right font-bold text-green-500">
                    {settings.storeCurrency} {tx.total.toFixed(2)}
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
                    <div className="font-bold text-primary">{tx.id}</div>
                    <div className="text-xs text-muted-foreground">{new Date(tx.date).toLocaleString()}</div>
                  </div>
                  <div className="text-right font-bold text-green-500">
                    {settings.storeCurrency} {tx.total.toFixed(2)}
                  </div>
                </div>
                
                <div className="text-sm">
                  <span className="text-muted-foreground">Cliente:</span> {getAthleteName(tx.customerId)}
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
                  {tx.status === 'PENDING_PICKUP' ? (
                    <div className="flex justify-between items-center">
                      <span className="bg-yellow-500/20 text-yellow-500 px-2 py-1 rounded-full text-[10px] font-bold">POR ENTREGAR</span>
                      <button 
                        onClick={() => {
                          const code = prompt("Ingrese el Código de Retiro del Atleta:")
                          if (code) {
                            if (code.trim().toUpperCase() === tx.pickupCode?.toUpperCase()) {
                              const updatedTx = { ...tx, status: 'COMPLETED' as const }
                              storeService.updateTransaction(updatedTx)
                              setTransactions(storeService.getTransactions().reverse())
                              showToast("¡Código correcto! Venta finalizada y productos entregados.", "success")
                            } else {
                              showToast("Código incorrecto.", "error")
                            }
                          }
                        }}
                        className="bg-primary text-primary-foreground text-xs px-3 py-1 rounded hover:bg-primary/90 font-bold"
                      >
                        Verificar Código
                      </button>
                    </div>
                  ) : (
                    <span className="bg-green-500/20 text-green-500 px-2 py-1 rounded-full text-[10px] font-bold">COMPLETADO</span>
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
            <button onClick={() => setViewImage(null)} className="absolute -top-10 right-0 text-white hover:text-red-400 font-bold text-xl">&times; Cerrar</button>
            <img src={viewImage} alt="Capture" className="w-full h-auto max-h-[80vh] object-contain rounded-lg" />
          </div>
        </div>
      )}

      {/* TICKET / RECIBO MODAL */}
      {showReceipt && (() => {
        const widthClass = settings.storeTicketWidth === '58mm' ? 'max-w-[280px]' : settings.storeTicketWidth === 'Carta' ? 'max-w-2xl' : 'max-w-sm';
        return (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 overflow-y-auto">
            <div className={`bg-white text-black p-8 w-full font-mono text-sm relative shadow-2xl my-auto ${widthClass}`}>
              <button onClick={() => setShowReceipt(null)} className="absolute top-4 right-4 text-gray-500 hover:text-black font-sans font-bold text-xl print:hidden">&times;</button>
              
              <div className="text-center mb-6 border-b border-dashed border-black pb-6">
                <h2 className="font-bold text-2xl uppercase tracking-widest">{settings.appName}</h2>
                {settings.storeRif && <p className="text-xs text-black mt-1 font-bold">RIF/NIT: {settings.storeRif}</p>}
                {settings.storeAddress && <p className="text-xs text-black mb-2">{settings.storeAddress}</p>}
                <p className="text-black mt-1 font-bold">Ticket: {showReceipt.id}</p>
                {showReceipt.pickupCode && (
                  <div className="mt-2 mb-2 p-2 border-2 border-dashed border-black bg-gray-100">
                    <p className="font-bold">CÓDIGO DE RETIRO</p>
                    <p className="text-xl font-black">{showReceipt.pickupCode}</p>
                  </div>
                )}
                <p className="text-black">{new Date(showReceipt.date).toLocaleString()}</p>
                <p className="text-black mt-2">Cajero: {user?.name}</p>
                <p className="text-black">Cliente: {showReceipt.customerId ? getAthleteName(showReceipt.customerId) : 'Consumidor Final'}</p>
              </div>

              <div className="space-y-2 mb-6 text-black">
                <div className="flex justify-between font-bold border-b border-black pb-1 mb-2">
                  <span>CANT. DESC.</span>
                  <span>TOTAL</span>
                </div>
                {showReceipt.items.map(item => (
                  <div key={item.productId} className="flex justify-between items-start text-sm mb-1 leading-tight">
                    <div className="flex gap-2 pr-2">
                      <span className="font-bold">{item.qty}x</span>
                      <span>{item.name}</span>
                    </div>
                    <span className="shrink-0 font-bold">{settings.storeCurrencySecondary} {(item.subtotal * (settings.storeExchangeRate || 1)).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-dashed border-black pt-4 space-y-1 text-black font-bold">
                <div className="flex justify-between">
                  <span>Artículos Totales</span>
                  <span>{showReceipt.items.reduce((acc, item) => acc + item.qty, 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{settings.storeCurrencySecondary} {(showReceipt.subtotal * (settings.storeExchangeRate || 1)).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>IVA ({settings.storeTaxRate}%)</span>
                  <span>{settings.storeCurrencySecondary} {(showReceipt.tax * (settings.storeExchangeRate || 1)).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xl font-black mt-2 pt-2 border-t border-black">
                  <span>TOTAL</span>
                  <span>{settings.storeCurrencySecondary} {(showReceipt.total * (settings.storeExchangeRate || 1)).toFixed(2)}</span>
                </div>
                <div className="flex justify-between mt-2">
                  <span>Pago con:</span>
                  <span className="uppercase">{showReceipt.paymentMethod}</span>
                </div>
                {showReceipt.reference && (
                  <div className="flex justify-between">
                    <span>Ref:</span>
                    <span className="uppercase">{showReceipt.reference}</span>
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
