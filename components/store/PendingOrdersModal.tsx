"use client"

import React, { useEffect } from "react"
import { Package, Search, CheckCircle2, Check, X } from "lucide-react"

export interface PendingOrdersModalProps {
  isOpen: boolean
  onClose: () => void
  pendingOrders: any[]
  pendingSearch: string
  setPendingSearch: (v: string) => void
  currency: string
  onDeliverOrder: (order: any) => Promise<void>
}

export function PendingOrdersModal({
  isOpen,
  onClose,
  pendingOrders,
  pendingSearch,
  setPendingSearch,
  currency,
  onDeliverOrder,
}: PendingOrdersModalProps) {
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const filtered = pendingOrders.filter(
    (o) =>
      o.customer?.cedula?.includes(pendingSearch) ||
      o.customer?.name?.toLowerCase().includes(pendingSearch.toLowerCase()) ||
      o.id?.slice(-5).toUpperCase().includes(pendingSearch.toUpperCase())
  )

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-card border border-black/10 dark:border-white/10 rounded-2xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl glass overflow-hidden">
        <div className="p-5 border-b border-black/10 dark:border-white/10 flex justify-between items-center bg-black/5 dark:bg-white/5">
          <h3 className="text-xl sm:text-2xl font-black flex items-center gap-2">
            <Package className="h-6 w-6 text-warning" /> Pedidos Online Pendientes
          </h3>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground font-bold text-xl cursor-pointer"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 border-b border-black/10 dark:border-white/10 bg-black/5 dark:bg-black/40">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar por Cédula, Nombre o Código de Pedido..."
              value={pendingSearch}
              onChange={(e) => setPendingSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-background border border-black/10 dark:border-white/10 rounded-lg text-sm focus:border-warning"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <CheckCircle2 className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p>No hay pedidos online pendientes por entregar.</p>
            </div>
          ) : (
            <div className="grid gap-3">
              {filtered.map((order) => (
                <div
                  key={order.id}
                  className="border border-black/10 dark:border-white/10 rounded-xl p-4 bg-black/5 dark:bg-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-warning/40 transition"
                >
                  <div>
                    <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
                      {order.customer?.profilePicture ? (
                        <img
                          src={order.customer.profilePicture}
                          alt={order.customer.name}
                          className="h-8 w-8 rounded-full object-cover shrink-0 border border-primary/30"
                        />
                      ) : order.customer?.name ? (
                        <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs shrink-0">
                          {order.customer.name.charAt(0)}
                        </div>
                      ) : null}
                      <span className="font-mono bg-warning/20 text-warning px-2 py-0.5 rounded text-xs font-bold">
                        #{order.id.slice(-5).toUpperCase()}
                      </span>
                      <span className="font-bold text-sm">
                        {order.customer?.name} ({order.customer?.cedula})
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-1">
                      {new Date(order.date).toLocaleString()} •{" "}
                      <span className="font-bold text-foreground">{order.paymentMethod}</span>
                    </p>
                    {order.reference && (
                      <p className="text-xs text-muted-foreground mb-2">Ref: {order.reference}</p>
                    )}
                    <div className="flex flex-wrap gap-1.5">
                      {order.items?.map((item: any) => (
                        <span
                          key={item.id || item.productId}
                          className="text-xs bg-black/10 dark:bg-white/10 px-2 py-0.5 rounded font-medium"
                        >
                          {item.qty}x {item.name}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row md:flex-col items-end gap-2 shrink-0 w-full sm:w-auto">
                    <span className="text-lg font-black text-primary">
                      {currency} {Number(order.total || 0).toFixed(2)}
                    </span>
                    <button
                      onClick={() => onDeliverOrder(order)}
                      className="w-full sm:w-auto border-2 border-warning text-warning hover:bg-warning hover:text-black dark:hover:text-black px-4 py-2 rounded-xl font-bold transition flex items-center justify-center gap-2 text-xs uppercase tracking-wider cursor-pointer shadow-sm"
                    >
                      <Check className="h-4 w-4" /> Confirmar / Entregar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
