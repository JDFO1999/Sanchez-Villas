"use client"

import React, { useState } from "react"
import {
  Calendar,
  CalendarCheck,
  Clock,
  CreditCard,
  AlertCircle,
  CheckCircle2,
  XCircle,
  X,
  User,
  Sparkles,
} from "lucide-react"

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

  if (!open || !athlete) return null

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
    athlete.planName || athlete.membershipType || "Plan Estándar"

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 sm:p-4 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-card/95 dark:bg-[#0e1017]/95 backdrop-blur-2xl text-card-foreground border border-black/10 dark:border-white/15 rounded-2xl max-w-xl w-full shadow-2xl relative my-auto max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera del Modal */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-black/10 dark:border-white/10 shrink-0 bg-black/[0.02] dark:bg-white/[0.02]">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-primary/15 text-primary flex items-center justify-center shrink-0 ring-1 ring-primary/25">
              <CalendarCheck className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-base sm:text-lg font-black text-foreground truncate leading-tight">
                Historial de Asistencias — {athlete.name}
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                C.I. {athlete.cedula} • Registro cronológico de accesos
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/10 transition cursor-pointer shrink-0 ml-2"
            title="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenido Principal con Scroll */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1 min-h-0">
          
          {/* Ficha Atleta & Entrenador */}
          <div className="flex items-center gap-3.5 p-3 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10">
            {athlete.profilePicture ? (
              <img
                src={athlete.profilePicture}
                alt={athlete.name}
                className="w-12 h-12 rounded-xl object-cover border-2 border-primary/40 shrink-0 shadow-sm"
              />
            ) : (
              <div className="w-12 h-12 rounded-xl bg-primary/20 text-primary font-black flex items-center justify-center text-lg shrink-0 border border-primary/30 shadow-sm">
                {athlete.name?.charAt(0) || "A"}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-extrabold text-sm text-foreground truncate">{athlete.name}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-black/10 dark:bg-white/10 text-muted-foreground border border-black/10 dark:border-white/10">
                  C.I. {athlete.cedula}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1.5">
                <User className="w-3 h-3 text-primary shrink-0" />
                <span>{athlete.coachName ? `Entrenador asignado: ${athlete.coachName}` : "Sin entrenador personal asignado"}</span>
              </p>
            </div>
          </div>

          {/* Tarjeta Informativa del Plan Contratado */}
          <div className="rounded-xl bg-gradient-to-br from-primary/15 via-primary/5 to-transparent border border-primary/25 p-3.5 space-y-3">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-primary/20 text-primary">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                    Plan Contratado
                  </span>
                  <span className="text-sm font-black text-foreground">{planDisplayName}</span>
                </div>
              </div>

              <div
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border shadow-xs ${statusBadge.className}`}
              >
                <statusBadge.icon className="w-3.5 h-3.5" />
                <span>{statusBadge.text}</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-primary/15 text-center">
              <div className="p-2 rounded-lg bg-black/5 dark:bg-black/30 border border-black/5 dark:border-white/5">
                <span className="text-muted-foreground block text-[10px] font-bold uppercase">Inicio</span>
                <span className="font-bold text-xs text-foreground mt-0.5 block">
                  {startDate ? startDate.toLocaleDateString("es-VE") : "No reg."}
                </span>
              </div>
              <div className="p-2 rounded-lg bg-black/5 dark:bg-black/30 border border-black/5 dark:border-white/5">
                <span className="text-muted-foreground block text-[10px] font-bold uppercase">Vencimiento</span>
                <span className="font-bold text-xs text-foreground mt-0.5 block">
                  {endDate ? endDate.toLocaleDateString("es-VE") : "Indefinida"}
                </span>
              </div>
              <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
                <span className="text-primary block text-[10px] font-bold uppercase">Total Asistencias</span>
                <span className="font-black text-sm text-primary mt-0.5 block">
                  {sortedAttendances.length} {sortedAttendances.length === 1 ? "Día" : "Días"}
                </span>
              </div>
            </div>
          </div>

          {/* Barra de Filtro y Conteo */}
          <div className="flex items-center justify-between gap-2 pt-1 pb-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground">
              <CalendarCheck className="w-4 h-4 text-primary" />
              <span>
                Mostrando <strong className="text-foreground">{filteredAttendances.length}</strong> de {sortedAttendances.length} asistencias
              </span>
            </div>

            {availableMonths.length > 1 && (
              <select
                value={filterMonth}
                onChange={(e) => setFilterMonth(e.target.value)}
                className="text-xs bg-card dark:bg-black/40 border border-black/15 dark:border-white/15 rounded-lg px-2.5 py-1 text-foreground focus:outline-none focus:border-primary font-medium"
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
          <div className="space-y-2">
            {filteredAttendances.length === 0 ? (
              <div className="text-center py-10 px-4 rounded-xl border border-dashed border-black/15 dark:border-white/15 bg-black/[0.02] dark:bg-white/[0.02] space-y-2.5">
                <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary mx-auto flex items-center justify-center">
                  <Calendar className="w-6 h-6 opacity-80" />
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
                    className="flex items-center justify-between gap-3 p-3 rounded-xl bg-card border border-black/10 dark:border-white/10 hover:border-primary/40 transition"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center justify-center font-black text-xs shrink-0">
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
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/25">
                        <CheckCircle2 className="w-3 h-3" />
                        Asistió
                      </span>
                    </div>
                  </div>
                )
              })
            )}
          </div>

        </div>

        {/* Pie del Modal */}
        <div className="p-3.5 sm:p-4 bg-black/[0.02] dark:bg-white/[0.02] border-t border-black/10 dark:border-white/10 flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl transition cursor-pointer shadow-sm"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  )
}
