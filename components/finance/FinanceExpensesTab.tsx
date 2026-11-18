"use client"

import React from "react"
import { Plus, Download, Trash2 } from "lucide-react"
import { Dialog } from "@/components/ui/dialog"
import type { Expense } from "@/lib/finance-service"

export interface FinanceExpensesTabProps {
  expenses: Expense[]
  settings: {
    storeCurrency?: string
    storeCurrencySecondary?: string
    storeExchangeRate?: number
    [key: string]: any
  }
  showExpenseModal: boolean
  setShowExpenseModal: (open: boolean) => void
  expForm: Partial<Expense>
  setExpForm: React.Dispatch<React.SetStateAction<any>>
  isCustomCategory: boolean
  setIsCustomCategory: (val: boolean) => void
  onSaveExpense: (e: React.FormEvent) => void | Promise<void>
  onDeleteExpense: (id: string) => void | Promise<void>
  onDownloadReport: (type: string) => void
}

export function FinanceExpensesTab({
  expenses,
  settings,
  showExpenseModal,
  setShowExpenseModal,
  expForm,
  setExpForm,
  isCustomCategory,
  setIsCustomCategory,
  onSaveExpense,
  onDeleteExpense,
  onDownloadReport,
}: FinanceExpensesTabProps) {
  const currency = settings.storeCurrency || "$"
  const secondaryCurrency = settings.storeCurrencySecondary || "BsS"
  const rate = settings.storeExchangeRate || 1

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Registro de Gastos</h2>
        <div className="flex gap-2">
          <button
            onClick={() => {
              setExpForm({ description: "", amount: 0, category: "Servicios" })
              setIsCustomCategory(false)
              setShowExpenseModal(true)
            }}
            className="bg-transparent border-2 border-success text-success px-3 py-1.5 rounded-lg text-sm font-bold hover:bg-success/10 transition flex items-center gap-2 cursor-pointer"
          >
            <Plus className="h-4 w-4" /> Nuevo Gasto
          </button>
          <button
            onClick={() => onDownloadReport("Egresos")}
            className="bg-black/10 dark:bg-white/10 text-foreground px-3 py-1.5 rounded-lg text-sm font-bold hover:bg-black/20 dark:hover:bg-white/20 transition flex items-center gap-2 cursor-pointer"
          >
            <Download className="h-4 w-4" /> Exportar
          </button>
        </div>
      </div>

      <div className="bg-card border border-black/10 dark:border-white/10 rounded-xl overflow-hidden glass">
        <div className="overflow-x-auto">
          {/* Desktop Table View */}
          <table className="w-full text-left text-sm hidden md:table">
            <thead className="bg-black/5 dark:bg-black/40 border-b border-black/10 dark:border-white/10 text-muted-foreground">
              <tr>
                <th className="p-4 font-medium">Fecha</th>
                <th className="p-4 font-medium">Descripción</th>
                <th className="p-4 font-medium">Categoría</th>
                <th className="p-4 font-medium">Monto</th>
                <th className="p-4 font-medium text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 dark:divide-white/5">
              {expenses.map((ex) => (
                <tr key={ex.id} className="hover:bg-black/5 dark:bg-white/5 transition-colors">
                  <td className="p-4 text-muted-foreground">
                    {new Date(ex.date).toLocaleDateString()}{" "}
                    {new Date(ex.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </td>
                  <td className="p-4 font-medium">{ex.description}</td>
                  <td className="p-4">
                    <span className="text-xs bg-black/10 dark:bg-white/10 px-2 py-0.5 rounded font-medium">
                      {ex.category}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="font-bold text-destructive">
                      {currency} {ex.amount.toFixed(2)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {secondaryCurrency} {(ex.amount * rate).toFixed(2)}
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => {
                          setExpForm(ex)
                          setIsCustomCategory(
                            !["Servicios", "Insumos", "Mantenimiento", "Marketing", "Alquiler", "Otros"].includes(
                              ex.category
                            )
                          )
                          setShowExpenseModal(true)
                        }}
                        className="p-2 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 rounded transition cursor-pointer text-xs font-semibold"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => onDeleteExpense(ex.id)}
                        className="p-2 bg-black/5 dark:bg-white/5 hover:bg-destructive/10 rounded transition text-destructive cursor-pointer"
                        title="Eliminar gasto"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {expenses.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-muted-foreground">
                    No hay gastos registrados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Mobile Cards View */}
          <div className="md:hidden flex flex-col divide-y divide-black/5 dark:divide-white/5">
            {expenses.map((ex) => (
              <div key={ex.id} className="p-4 space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-bold">{ex.description}</div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(ex.date).toLocaleDateString()}{" "}
                      {new Date(ex.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-destructive">
                      {currency} {ex.amount.toFixed(2)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {secondaryCurrency} {(ex.amount * rate).toFixed(2)}
                    </div>
                  </div>
                </div>
                <div className="flex justify-between items-center text-sm pt-2">
                  <span className="text-xs bg-black/10 dark:bg-white/10 px-2 py-0.5 rounded font-medium">
                    {ex.category}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setExpForm(ex)
                        setIsCustomCategory(
                          !["Servicios", "Insumos", "Mantenimiento", "Marketing", "Alquiler", "Otros"].includes(
                            ex.category
                          )
                        )
                        setShowExpenseModal(true)
                      }}
                      className="p-2 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 rounded transition text-xs font-semibold cursor-pointer"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => onDeleteExpense(ex.id)}
                      className="p-2 bg-black/5 dark:bg-white/5 hover:bg-destructive/10 rounded transition text-destructive cursor-pointer"
                      title="Eliminar gasto"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {expenses.length === 0 && (
              <div className="p-8 text-center text-muted-foreground">No hay gastos registrados.</div>
            )}
          </div>
        </div>
      </div>

      {/* Modal Agregar / Editar Gasto */}
      <Dialog
        open={showExpenseModal}
        onClose={() => setShowExpenseModal(false)}
        title={expForm.id ? "Editar Gasto" : "Registrar Gasto"}
        className="max-w-sm"
      >
        <form onSubmit={onSaveExpense} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Descripción</label>
            <input
              required
              autoFocus
              type="text"
              value={expForm.description || ""}
              onChange={(e) => setExpForm({ ...expForm, description: e.target.value })}
              placeholder="Ej. Pago de luz, Mantenimiento..."
              className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-lg p-2 text-sm focus:border-primary"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Monto ({currency})</label>
            <input
              required
              type="number"
              step="0.01"
              value={expForm.amount ?? ""}
              onChange={(e) => setExpForm({ ...expForm, amount: parseFloat(e.target.value) || 0 })}
              placeholder="0.00"
              className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-lg p-2 text-sm focus:border-primary font-bold text-red-500"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Categoría</label>
            {!isCustomCategory ? (
              <select
                value={expForm.category || "Servicios"}
                onChange={(e) => {
                  if (e.target.value === "OTRA") {
                    setIsCustomCategory(true)
                    setExpForm({ ...expForm, category: "" })
                  } else {
                    setExpForm({ ...expForm, category: e.target.value })
                  }
                }}
                className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-lg p-2 text-sm focus:border-primary"
              >
                <option value="Servicios">Servicios (Luz, Agua, Internet)</option>
                <option value="Insumos">Insumos y Limpieza</option>
                <option value="Mantenimiento">Mantenimiento de Máquinas</option>
                <option value="Marketing">Publicidad y Marketing</option>
                <option value="Alquiler">Alquiler</option>
                <option value="Otros">Otros</option>
                <option value="OTRA">+ Nueva Categoría Personalizada...</option>
              </select>
            ) : (
              <div className="flex gap-2">
                <input
                  autoFocus
                  type="text"
                  value={expForm.category}
                  onChange={(e) => setExpForm({ ...expForm, category: e.target.value })}
                  placeholder="Nombre de la categoría..."
                  className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-lg p-2 text-sm focus:border-primary"
                />
                <button
                  type="button"
                  onClick={() => {
                    setIsCustomCategory(false)
                    setExpForm({ ...expForm, category: "Servicios" })
                  }}
                  className="px-3 bg-black/10 dark:bg-white/10 rounded-lg text-xs font-semibold cursor-pointer"
                >
                  Volver
                </button>
              </div>
            )}
          </div>
          <div className="flex gap-2 justify-end pt-2">
            <button
              type="button"
              onClick={() => setShowExpenseModal(false)}
              className="px-4 py-2 text-sm rounded-lg bg-black/10 dark:bg-white/10 hover:bg-black/20 dark:hover:bg-white/20 transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm rounded-lg bg-destructive text-destructive-foreground font-bold hover:bg-destructive/90 transition cursor-pointer"
            >
              Guardar
            </button>
          </div>
        </form>
      </Dialog>
    </div>
  )
}
