"use client"

import React, { useState } from "react"
import { Dialog } from "@/components/ui/dialog"
import {
  Calendar,
  CalendarCheck,
  Clock,
  CreditCard,
  AlertCircle,
  CheckCircle2,
  XCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"

export interface AttendanceItem {
  id: string
  date: string | Date
  type?: string
}

export interface AttendanceModalAthlete {
  id: string
  name: string
  cedula: string
  profilePicture?: string | null
  planName?: string | null
  membershipType?: string | null
  membershipStart?: string | Date | null
  membershipEnd?: string | Date | null
  attendances?: AttendanceItem[]
  coachName?: string | null
}

interface AttendanceHistoryModalProps {
  open: boolean
  onClose: () => void
  athlete: AttendanceModalAthlete | null
}

const DAYS_ES = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"]
const MONTHS_ES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
]

function formatEntryDate(dateInput: string | Date) {
  const d = new Date(dateInput)
  if (isNaN(d.getTime())) {
    return { dayName: "Fecha", fullDate: String(dateInput), timeStr: "--:--" }
  }
  const dayName = DAYS_ES[d.getDay()]
  const dayNum = d.getDate()
  const monthName = MONTHS_ES[d.getMonth()]
  const year = d.getFullYear()
  const timeStr = d.toLocaleTimeString("es-VE", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  })
  return {
    dayName,
    fullDate: `${dayNum} de ${monthName}, ${year}`,
    timeStr,
  }
}

export function AttendanceHistoryModal({
  open,
  onClose,
  athlete,
}: AttendanceHistoryModalProps) {
  const [filterMonth, setFilterMonth] = useState<string>("TODOS")

  if (!athlete) return null

  // Cálculo de estado de membresía
  const hasValidMemb = Boolean(
    athlete.membershipEnd && new Date(athlete.membershipEnd).getFullYear() > 1970
  )
  const endDate = hasValidMemb ? new Date(athlete.membershipEnd as string | Date) : null
  const startDate = athlete.membershipStart ? new Date(athlete.membershipStart) : null
  const today = new Date()
  const diffDays = endDate ? Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)) : 0

  let statusBadge = {
    text: "Activa",
    className: "bg-emerald-500/15 text-emerald-500 border-emerald-500/30",
    icon: CheckCircle2,
  }

  if (!hasValidMemb) {
    statusBadge = {
      text: "Sin Membresía",
      className: "bg-muted text-muted-foreground border-border",
      icon: AlertCircle,
    }
  } else if (diffDays <= 0) {
    statusBadge = {
      text: "Vencida",
      className: "bg-rose-500/15 text-rose-500 border-rose-500/30",
      icon: XCircle,
    }
  } else if (diffDays <= 7) {
    statusBadge = {
      text: `Por vencer (${diffDays}d)`,
      className: "bg-amber-500/15 text-amber-500 border-amber-500/30",
      icon: AlertCircle,
    }
  }

  const rawAttendances = athlete.attendances || []
  // Ordenar de más reciente a más antigua
  const sortedAttendances = [...rawAttendances].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  const filteredAttendances = sortedAttendances.filter((att) => {
    if (filterMonth === "TODOS") return true
    const d = new Date(att.date)
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}` === filterMonth
  })

  // Obtener meses únicos con asistencias para el selector
  const availableMonths = Array.from(
    new Set(
      sortedAttendances.map((att) => {
        const d = new Date(att.date)
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
      })
    )
  )

  const planDisplayName =
    athlete.planName || athlete.membershipType || "Plan Estándar (General)"

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={`Historial de Asistencias - ${athlete.name}`}
      className="max-w-2xl w-full p-0 overflow-hidden"
    >
      <div className="flex flex-col max-h-[85vh]">
        {/* Cabecera Atleta y Plan */}
        <div className="p-6 bg-card border-b border-border space-y-4">
          <div className="flex items-center gap-4">
            {athlete.profilePicture ? (
              <img
                src={athlete.profilePicture}
                alt={athlete.name}
                className="w-14 h-14 rounded-2xl object-cover border-2 border-primary/40 shrink-0 shadow-md"
              />
            ) : (
              <div className="w-14 h-14 rounded-2xl bg-primary/20 text-primary font-black flex items-center justify-center text-xl shrink-0 border border-primary/30 shadow-md">
                {athlete.name?.charAt(0) || "A"}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-lg font-black text-foreground truncate">{athlete.name}</h3>
                <span className="text-xs px-2.5 py-0.5 rounded-md font-bold bg-muted text-muted-foreground border border-border">
                  C.I. {athlete.cedula}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {athlete.coachName ? `Entrenador asignado: ${athlete.coachName}` : "Sin entrenador personal"}
              </p>
            </div>
          </div>

          {/* Tarjeta Informativa del Plan Contratado */}
          <div className="rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/25 p-4 space-y-2.5">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-primary/20 text-primary">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
                    Plan Contratado
                  </span>
                  <span className="text-sm font-extrabold text-foreground">{planDisplayName}</span>
                </div>
              </div>

              <div
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${statusBadge.className}`}
              >
                <statusBadge.icon className="w-3.5 h-3.5" />
                <span>{statusBadge.text}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1 border-t border-primary/10 text-xs">
              <div>
                <span className="text-muted-foreground block text-[10px]">Inicio:</span>
                <span className="font-semibold text-foreground">
                  {startDate ? startDate.toLocaleDateString("es-VE") : "No registrado"}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[10px]">Vence:</span>
                <span className="font-semibold text-foreground">
                  {endDate ? endDate.toLocaleDateString("es-VE") : "Indefinida"}
                </span>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <span className="text-muted-foreground block text-[10px]">Total Asistencias:</span>
                <span className="font-black text-primary text-sm">
                  {sortedAttendances.length} {sortedAttendances.length === 1 ? "Día" : "Días"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Barra de Filtro y Resumen de Días */}
        <div className="px-6 py-3 bg-muted/40 border-b border-border flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2 text-xs font-bold text-foreground">
            <CalendarCheck className="w-4 h-4 text-primary" />
            <span>
              Mostrando {filteredAttendances.length} de {sortedAttendances.length} asistencias
            </span>
          </div>

          {availableMonths.length > 1 && (
            <select
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
              className="text-xs bg-background border border-border rounded-lg px-2.5 py-1 text-foreground focus:outline-none focus:border-primary"
            >
              <option value="TODOS">Todos los meses</option>
              {availableMonths.map((ym) => {
                const [y, m] = ym.split("-")
                const mName = MONTHS_ES[parseInt(m, 10) - 1]
                return (
                  <option key={ym} value={ym}>
                    {mName} {y}
                  </option>
                )
              })}
            </select>
          )}
        </div>

        {/* Listado Cronológico de Asistencias */}
        <div className="p-6 overflow-y-auto space-y-2.5 flex-1 min-h-[220px]">
          {filteredAttendances.length === 0 ? (
            <div className="text-center py-12 px-4 rounded-2xl border border-dashed border-border bg-card/50 space-y-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 text-primary mx-auto flex items-center justify-center">
                <Calendar className="w-6 h-6 opacity-75" />
              </div>
              <h4 className="text-sm font-bold text-foreground">Sin registros de asistencia</h4>
              <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                {filterMonth !== "TODOS"
                  ? "No se registraron asistencias durante el mes seleccionado."
                  : "Este atleta aún no tiene asistencias registradas en el torniquete o módulo de recepción."}
              </p>
            </div>
          ) : (
            filteredAttendances.map((att, idx) => {
              const formatted = formatEntryDate(att.date)
              const countNumber = sortedAttendances.length - idx
              return (
                <div
                  key={att.id || idx}
                  className="flex items-center justify-between gap-3 p-3.5 rounded-2xl bg-card border border-border hover:border-primary/40 hover:shadow-sm transition-all"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center justify-center font-black text-xs shrink-0">
                      #{countNumber}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-primary uppercase tracking-wide">
                          {formatted.dayName}
                        </span>
                        <span className="text-xs font-bold text-foreground truncate">
                          {formatted.fullDate}
                        </span>
                      </div>
                      <span className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3 text-muted-foreground" />
                        Hora de entrada: {formatted.timeStr}
                      </span>
                    </div>
                  </div>

                  <div className="shrink-0">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-primary/10 text-primary border border-primary/20">
                      <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                      Asistió
                    </span>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Pie del Modal */}
        <div className="p-4 bg-card border-t border-border flex justify-end">
          <Button variant="outline" size="sm" onClick={onClose} className="rounded-xl px-5 font-bold">
            Cerrar
          </Button>
        </div>
      </div>
    </Dialog>
  )
}
