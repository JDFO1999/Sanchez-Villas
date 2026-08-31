"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { useSettings } from "@/lib/settings-context"
import { storeService, Transaction } from "@/lib/store-service"
import { athleteService, AthleteProfile } from "@/lib/data-service"
import { StoreNav } from "@/components/store/StoreNav"
import { Card, CardContent } from "@/components/ui/card"
import { ReceiptText, Calendar } from "lucide-react"

export default function VentasPage() {
  const { user } = useAuth()
  const { settings } = useSettings()
  
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [athletes, setAthletes] = useState<AthleteProfile[]>([])
  const [viewImage, setViewImage] = useState<string | null>(null)

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
      <h1 className="text-3xl font-bold tracking-tight">Historial de Ventas</h1>
      <StoreNav />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="glass">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-primary/20 rounded-full text-primary">
              <ReceiptText className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-medium">Total Facturas</p>
              <h3 className="text-2xl font-bold">{transactions.length}</h3>
            </div>
          </CardContent>
        </Card>
        
        <Card className="glass">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-green-500/20 rounded-full text-green-500">
              <span className="text-xl font-bold leading-none">{settings.storeCurrency}</span>
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-medium">Ingresos Totales</p>
              <h3 className="text-2xl font-bold">
                {settings.storeCurrency} {transactions.reduce((acc, tx) => acc + tx.total, 0).toFixed(2)}
              </h3>
            </div>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-blue-500/20 rounded-full text-blue-500">
              <Calendar className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-medium">Última Venta</p>
              <h3 className="text-lg font-bold">
                {transactions.length > 0 ? new Date(transactions[0].date).toLocaleDateString() : 'N/A'}
              </h3>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="bg-card border border-white/10 rounded-xl overflow-hidden glass">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-black/40 border-b border-white/10 text-muted-foreground">
              <tr>
                <th className="p-4 font-medium">ID Transacción</th>
                <th className="p-4 font-medium">Fecha</th>
                <th className="p-4 font-medium">Cliente</th>
                <th className="p-4 font-medium">Método</th>
                <th className="p-4 font-medium">Artículos</th>
                <th className="p-4 font-medium text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {transactions.map(tx => (
                <tr key={tx.id} className="hover:bg-white/5 transition-colors">
                  <td className="p-4 font-medium text-primary">{tx.id}</td>
                  <td className="p-4">{new Date(tx.date).toLocaleString()}</td>
                  <td className="p-4">{getAthleteName(tx.customerId)}</td>
                  <td className="p-4">
                    <div className="flex flex-col gap-1 items-start">
                      <span className="bg-white/10 px-2 py-1 rounded text-xs">
                        {tx.paymentMethod}
                      </span>
                      {(tx.paymentMethod === 'Transferencia' || tx.paymentMethod === 'Pago Móvil') && tx.reference && (
                        <span className="text-[10px] text-muted-foreground uppercase">Ref: {tx.reference}</span>
                      )}
                      {(tx.paymentMethod === 'Transferencia' || tx.paymentMethod === 'Pago Móvil') && tx.receiptImage && (
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
                  <td className="p-4 text-right font-bold text-green-500">
                    {settings.storeCurrency} {tx.total.toFixed(2)}
                  </td>
                </tr>
              ))}
              {transactions.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-muted-foreground">
                    No se han registrado ventas aún.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Visor de Capture */}
      {viewImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm" onClick={() => setViewImage(null)}>
          <div className="bg-card border border-white/10 rounded-xl max-w-2xl w-full p-2 shadow-2xl relative" onClick={e => e.stopPropagation()}>
            <button onClick={() => setViewImage(null)} className="absolute -top-10 right-0 text-white hover:text-red-400 font-bold text-xl">&times; Cerrar</button>
            <img src={viewImage} alt="Capture" className="w-full h-auto max-h-[80vh] object-contain rounded-lg" />
          </div>
        </div>
      )}
    </div>
  )
}
