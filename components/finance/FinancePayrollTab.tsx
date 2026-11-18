"use client"

import React from "react"
import { Plus } from "lucide-react"

export interface FinancePayrollTabProps {
  employees: any[]
  athletes: any[]
  transactions: any[]
  settings: {
    storeCurrency?: string
    storeCurrencySecondary?: string
    storeExchangeRate?: number
    [key: string]: any
  }
  onAddEmployeeClick: () => void
  onConfigureEmployee: (emp: any) => void
  onProcessPayroll: (emp: any, baseSalary: number, commission: number) => void
}

export function FinancePayrollTab({
  employees,
  athletes,
  transactions,
  settings,
  onAddEmployeeClick,
  onConfigureEmployee,
  onProcessPayroll,
}: FinancePayrollTabProps) {
  const currency = settings.storeCurrency || "$"
  const currentMonth = new Date().toISOString().substring(0, 7)

  const activeEmployees = employees.filter((e) => e.role !== "admin" && e.role !== "deleted")

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-end">
        <button
          onClick={onAddEmployeeClick}
          className="border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground px-4 py-2 rounded-xl font-bold transition flex items-center gap-2 cursor-pointer shadow-sm"
        >
          <Plus className="h-4 w-4" /> Agregar Empleado a Nómina
        </button>
      </div>

      <div className="bg-card border border-black/10 dark:border-white/10 rounded-xl overflow-hidden glass">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-black/5 dark:bg-black/40 border-b border-black/10 dark:border-white/10 text-muted-foreground">
              <tr>
                <th className="p-4 font-medium">Empleado</th>
                <th className="p-4 font-medium">Atletas Asignados</th>
                <th className="p-4 font-medium">Sueldo + Comisiones</th>
                <th className="p-4 font-medium">Datos de Pago</th>
                <th className="p-4 font-medium text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 dark:divide-white/5">
              {activeEmployees.map((emp) => {
                const baseSalary = emp.baseSalary || 0
                const commissionRate = emp.commissionRate || 0

                const monthTransactions = transactions.filter(
                  (tx) =>
                    tx.date &&
                    new Date(tx.date).toISOString().startsWith(currentMonth) &&
                    tx.status === "COMPLETED"
                )

                // Solo transacciones pagadas por clientes de este coach
                const coachTx = monthTransactions.filter((tx) => tx.customer?.coachId === emp.id)
                const empAssignedAthletes = athletes.filter((a) => a.coachId === emp.id)

                let commission = 0
                if (emp.commissionType === "flat") {
                  commission = empAssignedAthletes.length * commissionRate
                } else {
                  for (const tx of coachTx) {
                    for (const item of tx.items || []) {
                      if (item.productId === "MEMB" || item.productId === "COACH") {
                        commission += item.subtotal * (commissionRate / 100)
                      }
                    }
                  }
                }

                const totalPay = baseSalary + commission
                const isPaidThisMonth =
                  emp.lastPaidDate && new Date(emp.lastPaidDate).toISOString().startsWith(currentMonth)

                return (
                  <tr
                    key={emp.id}
                    className={`transition-colors ${
                      isPaidThisMonth ? "bg-success/5" : "hover:bg-black/5 dark:hover:bg-white/5"
                    }`}
                  >
                    <td className="p-4">
                      <div className="font-bold flex items-center gap-2">
                        {emp.name}
                        {isPaidThisMonth && (
                          <span className="bg-emerald-500 text-white text-[10px] px-1.5 py-0.5 rounded-full uppercase font-bold">
                            Pagado
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {emp.cedula} | {emp.role}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-bold">{empAssignedAthletes.length} atletas</div>
                    </td>
                    <td className="p-4">
                      <div className="text-xs text-muted-foreground">
                        Base: {currency} {baseSalary} + Com: {currency} {commission.toFixed(2)}
                      </div>
                      <div className="font-black text-primary">
                        {currency} {totalPay.toFixed(2)}
                      </div>
                    </td>
                    <td className="p-4 text-xs">
                      <div className="space-y-1">
                        {emp.bankAccount ? (
                          <div className="text-muted-foreground">
                            <span className="font-bold">Cta:</span>{" "}
                            {emp.bankName ? `${emp.bankName} - ` : ""}
                            {emp.bankAccount}
                          </div>
                        ) : null}
                        {emp.mobilePayment ? (
                          <div className="text-muted-foreground">
                            <span className="font-bold">Pago Móvil:</span>{" "}
                            {emp.mobilePaymentBank ? `${emp.mobilePaymentBank} - ` : ""}
                            {emp.mobilePayment}
                          </div>
                        ) : null}
                        {!emp.bankAccount && !emp.mobilePayment && (
                          <span className="text-destructive/70">Sin datos registrados</span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-right flex justify-end gap-2">
                      <button
                        onClick={() => onConfigureEmployee(emp)}
                        className="px-3 py-1.5 bg-black/10 dark:bg-white/10 text-foreground text-xs font-bold rounded hover:bg-black/20 dark:hover:bg-white/20 transition cursor-pointer"
                      >
                        Configurar
                      </button>
                      {!isPaidThisMonth ? (
                        <button
                          onClick={() => onProcessPayroll(emp, baseSalary, commission)}
                          className="px-3 py-1.5 bg-transparent border border-success text-success text-xs font-bold rounded hover:bg-success/10 transition cursor-pointer"
                        >
                          Pagar Nómina
                        </button>
                      ) : (
                        <button
                          disabled
                          className="px-3 py-1.5 bg-success/20 text-success text-xs font-bold rounded cursor-not-allowed opacity-80"
                        >
                          Nómina Pagada
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
              {activeEmployees.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-muted-foreground">
                    No hay entrenadores o empleados registrados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
