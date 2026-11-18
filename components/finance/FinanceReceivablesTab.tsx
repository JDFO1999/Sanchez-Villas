"use client"

import React from "react"
import { Download, AlertCircle, MessageCircle } from "lucide-react"

export interface FinanceReceivablesTabProps {
  overdueAthletes: any[]
  settings: {
    appName?: string
    storeCurrency?: string
    storeCurrencySecondary?: string
    storeExchangeRate?: number
    [key: string]: any
  }
  onDownloadReport: (type: string) => void
  onSaldarDeuda: (athleteId: string, amount: number) => void
  hasValidDate: (date: any) => boolean
  now: Date
}

export function FinanceReceivablesTab({
  overdueAthletes,
  settings,
  onDownloadReport,
  onSaldarDeuda,
  hasValidDate,
  now,
}: FinanceReceivablesTabProps) {
  const currency = settings.storeCurrency || "$"

  const getStatusBadge = (athlete: any) => {
    let membershipStatus = "Sin membresía activa"
    let badgeStyle = "bg-warning/20 text-warning font-semibold"
    if (hasValidDate(athlete.membershipEnd)) {
      const isMembOverdue = new Date(athlete.membershipEnd) < now
      if (isMembOverdue) {
        const diffTime = Math.abs(now.getTime() - new Date(athlete.membershipEnd).getTime())
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        membershipStatus = `Vencida (${diffDays} días)`
        badgeStyle = "bg-destructive/20 text-destructive font-semibold"
      } else {
        membershipStatus = `Activa hasta ${new Date(athlete.membershipEnd).toLocaleDateString()}`
        badgeStyle = "bg-success/20 text-success font-semibold"
      }
    }
    return { membershipStatus, badgeStyle }
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 className="text-xl font-bold">Cuentas por Cobrar (Crédito / Fiado Autorizado)</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Solo aparecen atletas a quienes el Administrador les autorizó un Plan o consumo a Crédito / Fiado.
          </p>
        </div>
        <button
          onClick={() => onDownloadReport("Cuentas por Cobrar")}
          className="bg-black/10 dark:bg-white/10 text-foreground px-3 py-1.5 rounded-lg text-sm font-bold hover:bg-black/20 dark:hover:bg-white/20 transition flex items-center gap-2 cursor-pointer"
        >
          <Download className="h-4 w-4" /> Exportar Cuentas por Cobrar
        </button>
      </div>

      <div className="bg-card border border-black/10 dark:border-white/10 rounded-xl overflow-hidden glass">
        <div className="overflow-x-auto">
          {/* Vista Tabla Desktop */}
          <table className="w-full text-left text-sm hidden md:table">
            <thead className="bg-black/5 dark:bg-black/40 border-b border-black/10 dark:border-white/10 text-muted-foreground">
              <tr>
                <th className="p-4 font-medium">Atleta / Cédula</th>
                <th className="p-4 font-medium">Plan Seleccionado / Concepto</th>
                <th className="p-4 font-medium">Estado Membresía</th>
                <th className="p-4 font-medium">Saldo Pendiente (Fiado)</th>
                <th className="p-4 font-medium text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 dark:divide-white/5">
              {overdueAthletes.map((a) => {
                const { membershipStatus, badgeStyle } = getStatusBadge(a)
                return (
                  <tr key={a.id} className="hover:bg-black/5 dark:bg-white/5 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        {a.profilePicture || a.avatar ? (
                          <img
                            src={a.profilePicture || a.avatar || ""}
                            alt={a.name}
                            className="h-9 w-9 rounded-full object-cover shrink-0 border border-primary/30"
                          />
                        ) : (
                          <div className="h-9 w-9 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs shrink-0 border border-primary/20">
                            {a.name.charAt(0)}
                          </div>
                        )}
                        <div>
                          <div className="font-bold">{a.name}</div>
                          <div className="text-xs text-muted-foreground">{a.cedula}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="font-bold text-primary">
                        {a.membershipType || "Crédito en Tienda / Plan"}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`text-xs px-2.5 py-1 rounded-md ${badgeStyle}`}>
                        {membershipStatus}
                      </span>
                    </td>
                    <td className="p-4">
                      {a.debt && a.debt > 0 ? (
                        <div className="font-bold text-warning">
                          {currency} {a.debt.toFixed(2)}
                        </div>
                      ) : (
                        <div className="text-muted-foreground">-</div>
                      )}
                    </td>
                    <td className="p-4 text-right flex justify-end gap-2">
                      {a.debt && a.debt > 0 && (
                        <button
                          onClick={() => onSaldarDeuda(a.id, a.debt!)}
                          className="px-3 py-1.5 bg-primary/20 text-primary text-xs font-bold rounded hover:bg-primary/30 transition cursor-pointer"
                        >
                          Saldar Deuda
                        </button>
                      )}
                      <a
                        href={`https://wa.me/${a.phone ? a.phone.replace(/[^0-9]/g, "") : ""}?text=Hola%20${encodeURIComponent(
                          a.name
                        )},%20te%20escribimos%20de%20${encodeURIComponent(
                          settings.appName || "Gym"
                        )}.%20Tienes%20un%20saldo%20pendiente%20de%20${encodeURIComponent(
                          currency
                        )}%20${(a.debt || 0).toFixed(2)}.`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex p-2 bg-[#25D366]/20 hover:bg-[#25D366]/30 text-[#25D366] rounded-lg transition"
                        title="Cobrar por WhatsApp"
                      >
                        <MessageCircle className="h-4 w-4" />
                      </a>
                    </td>
                  </tr>
                )
              })}
              {overdueAthletes.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-muted-foreground">
                    <AlertCircle className="h-12 w-12 text-success/50 mx-auto mb-2" />
                    ¡Excelente! No hay cuentas por cobrar (créditos o fiados pendientes).
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Mobile View */}
          <div className="md:hidden flex flex-col divide-y divide-black/5 dark:divide-white/5">
            {overdueAthletes.map((a) => {
              const { membershipStatus, badgeStyle } = getStatusBadge(a)
              return (
                <div key={a.id} className="p-4 space-y-2">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2.5">
                      {a.profilePicture || a.avatar ? (
                        <img
                          src={a.profilePicture || a.avatar || ""}
                          alt={a.name}
                          className="h-9 w-9 rounded-full object-cover shrink-0 border border-primary/30"
                        />
                      ) : (
                        <div className="h-9 w-9 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs shrink-0 border border-primary/20">
                          {a.name.charAt(0)}
                        </div>
                      )}
                      <div>
                        <div className="font-bold">{a.name}</div>
                        <div className="text-xs text-muted-foreground">{a.cedula}</div>
                        <div className="text-xs font-bold text-primary mt-0.5">
                          {a.membershipType || "Crédito en Tienda / Plan"}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      {a.debt && a.debt > 0 ? (
                        <div className="font-bold text-warning">
                          {currency} {a.debt.toFixed(2)}
                        </div>
                      ) : (
                        <div className="text-muted-foreground">-</div>
                      )}
                      <div className="text-[10px] font-bold mt-1 uppercase text-muted-foreground">Saldo Fiado</div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-sm pt-2">
                    <span className={`text-xs px-2.5 py-1 rounded-md ${badgeStyle}`}>
                      {membershipStatus}
                    </span>
                    <div className="flex gap-2">
                      {a.debt && a.debt > 0 && (
                        <button
                          onClick={() => onSaldarDeuda(a.id, a.debt!)}
                          className="px-2 py-1 bg-primary/20 text-primary text-xs font-bold rounded hover:bg-primary/30 transition cursor-pointer"
                        >
                          Saldar Deuda
                        </button>
                      )}
                      <a
                        href={`https://wa.me/${a.phone ? a.phone.replace(/[^0-9]/g, "") : ""}?text=Hola%20${encodeURIComponent(
                          a.name
                        )},%20te%20escribimos%20de%20${encodeURIComponent(
                          settings.appName || "Gym"
                        )}.%20Tienes%20un%20saldo%20pendiente%20de%20${encodeURIComponent(
                          currency
                        )}%20${(a.debt || 0).toFixed(2)}.`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex p-1.5 bg-[#25D366]/20 hover:bg-[#25D366]/30 text-[#25D366] rounded transition text-xs font-bold gap-1 items-center"
                      >
                        <MessageCircle className="h-4 w-4" /> Cobrar
                      </a>
                    </div>
                  </div>
                </div>
              )
            })}
            {overdueAthletes.length === 0 && (
              <div className="p-8 text-center text-muted-foreground">
                <AlertCircle className="h-12 w-12 text-success/50 mx-auto mb-2" />
                ¡Excelente! No hay cuentas por cobrar (créditos o fiados pendientes).
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
