"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { getCoachesWithAthletesAction } from "@/app/actions/users"
import { PageTitle } from "@/components/ui/page-title"
import { Button } from "@/components/ui/button"
import { Dialog } from "@/components/ui/dialog"
import {
  Users,
  Search,
  Calendar,
  Clock,
  Dumbbell,
  ChevronRight,
  Phone,
  UserCheck,
  AlertCircle,
  X,
  History
} from "lucide-react"

export default function EntrenadoresPage() {
  const { user } = useAuth()
  const [coaches, setCoaches] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCoach, setSelectedCoach] = useState<any | null>(null)
  const [athleteSearch, setAthleteSearch] = useState("")

  // Modales de historial de asistencia separados
  const [coachAttendanceModal, setCoachAttendanceModal] = useState<any | null>(null)
  const [athleteAttendanceModal, setAthleteAttendanceModal] = useState<any | null>(null)

  useEffect(() => {
    loadCoaches()
  }, [])

  async function loadCoaches() {
    setIsLoading(true)
    const res = await getCoachesWithAthletesAction()
    if (res.success && res.coaches) {
      setCoaches(res.coaches)
      if (selectedCoach) {
        const updated = res.coaches.find((c: any) => c.id === selectedCoach.id)
        if (updated) setSelectedCoach(updated)
      }
    }
    setIsLoading(false)
  }

  // Filtrado de entrenadores por nombre o cédula
  const filteredCoaches = coaches.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.cedula.includes(searchTerm)
  )

  // Filtrado de atletas del coach seleccionado
  const filteredAthletes = (selectedCoach?.coachedAthletes || []).filter(
    (a: any) =>
      a.name.toLowerCase().includes(athleteSearch.toLowerCase()) ||
      a.cedula.includes(athleteSearch)
  )

  const isAuthorized =
    user?.role === "admin" ||
    user?.permissions?.includes("STAFF_MANAGE") ||
    user?.permissions?.includes("CRM_MANAGE")

  if (!user || !isAuthorized) {
    return (
      <div className="p-8 text-center text-destructive font-bold">
        Acceso Denegado. Solo personal autorizado.
      </div>
    )
  }

  return (
    <div className="space-y-6 w-full p-2 sm:p-6 pb-24">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-4">
        <div>
          <PageTitle>Directorio de Entrenadores</PageTitle>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Supervisa a los entrenadores (Coaches), sus días asistidos y el estado de membresía de sus atletas asignados.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs px-3 py-1.5 rounded-xl bg-primary/10 text-primary border border-primary/20 font-bold flex items-center gap-1.5">
            <Dumbbell className="w-4 h-4" /> {coaches.length} Coaches Registrados
          </span>
        </div>
      </div>

      {/* Buscador de Entrenadores */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar coach por nombre o cédula..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-card border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-sm"
          />
        </div>
      </div>

      {/* Grid Principal: Entrenadores */}
      {isLoading ? (
        <div className="py-20 text-center text-muted-foreground text-sm flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span>Cargando información de entrenadores...</span>
        </div>
      ) : filteredCoaches.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center text-muted-foreground">
          <Users className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p className="font-bold text-sm">No se encontraron entrenadores registrados.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCoaches.map((coach) => {
            const athleteCount = coach.coachedAthletes?.length || 0
            const attendanceCount = coach.attendances?.length || 0
            const isSelected = selectedCoach?.id === coach.id

            return (
              <div
                key={coach.id}
                onClick={() => setSelectedCoach(isSelected ? null : coach)}
                className={`group relative rounded-2xl border bg-card p-5 shadow-sm transition-all cursor-pointer hover:shadow-md hover:border-primary/50 flex flex-col justify-between ${
                  isSelected
                    ? "border-primary ring-2 ring-primary/20 bg-primary/5"
                    : "border-border"
                }`}
              >
                <div>
                  {/* Fila Superior: Avatar + Info */}
                  <div className="flex items-start gap-3.5">
                    {coach.profilePicture ? (
                      <img
                        src={coach.profilePicture}
                        alt={coach.name}
                        className="w-14 h-14 rounded-2xl object-cover border-2 border-primary/40 shrink-0 shadow-sm"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-2xl bg-primary/15 text-primary border-2 border-primary/30 flex items-center justify-center font-black text-xl shrink-0 shadow-inner">
                        {coach.name?.charAt(0) || "C"}
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="font-extrabold text-base text-foreground truncate group-hover:text-primary transition-colors">
                          {coach.name}
                        </h3>
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 shrink-0">
                          Coach
                        </span>
                      </div>
                      <p className="text-xs font-mono text-muted-foreground mt-0.5">
                        C.I. {coach.cedula}
                      </p>
                      {coach.specialties && (
                        <p className="text-xs text-foreground/80 mt-1 line-clamp-1 italic">
                          {coach.specialties}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Badges de Métricas */}
                  <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-border/50">
                    <div className="bg-black/5 dark:bg-white/5 rounded-xl p-2.5 text-center">
                      <span className="text-[11px] text-muted-foreground block font-medium">Atletas Asignados</span>
                      <span className="text-lg font-black text-foreground flex items-center justify-center gap-1 mt-0.5">
                        <Users className="w-4 h-4 text-primary" /> {athleteCount}
                      </span>
                    </div>

                    <div className="bg-black/5 dark:bg-white/5 rounded-xl p-2.5 text-center">
                      <span className="text-[11px] text-muted-foreground block font-medium">Días Asistidos</span>
                      <span className="text-lg font-black text-foreground flex items-center justify-center gap-1 mt-0.5">
                        <Calendar className="w-4 h-4 text-info" /> {attendanceCount}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Acciones de la Tarjeta */}
                <div className="mt-4 pt-3 border-t border-border/50 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      setCoachAttendanceModal(coach)
                    }}
                    className="text-xs font-bold text-muted-foreground hover:text-primary flex items-center gap-1.5 transition py-1 px-2 rounded-lg hover:bg-primary/10"
                    title="Ver historial de asistencias del coach"
                  >
                    <History className="w-3.5 h-3.5 text-primary" />
                    <span>Ver Asistencia</span>
                  </button>

                  <span className="text-xs font-bold text-primary flex items-center gap-1">
                    <span>{isSelected ? "Ocultar Atletas" : "Ver Atletas"}</span>
                    <ChevronRight className={`w-4 h-4 transition-transform ${isSelected ? "rotate-90" : ""}`} />
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Detalle de Atletas Asignados */}
      {selectedCoach && (
        <div className="mt-8 rounded-3xl border-2 border-primary/40 bg-card p-5 sm:p-7 shadow-xl animate-in fade-in duration-300 relative">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-4 mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/20 text-primary flex items-center justify-center font-bold">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-lg text-foreground">
                  Atletas Asignados a {selectedCoach.name}
                </h3>
                <p className="text-xs text-muted-foreground">
                  Listado de deportistas bajo la tutela de este entrenador.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Buscar en sus atletas..."
                  value={athleteSearch}
                  onChange={(e) => setAthleteSearch(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl pl-9 pr-3 py-1.5 text-xs focus:outline-none focus:border-primary"
                />
              </div>

              <button
                onClick={() => setSelectedCoach(null)}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5 transition"
                title="Cerrar panel de atletas"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {filteredAthletes.length === 0 ? (
            <div className="p-10 text-center text-muted-foreground">
              <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-40 text-amber-500" />
              <p className="font-bold text-sm">
                {selectedCoach.coachedAthletes?.length === 0
                  ? "Este entrenador aún no tiene atletas asignados."
                  : "No se encontraron atletas con ese criterio de búsqueda."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-border text-muted-foreground font-semibold uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-3">Estado Membresía</th>
                    <th className="py-3 px-3">Atleta</th>
                    <th className="py-3 px-3">Cédula</th>
                    <th className="py-3 px-3">Fecha de Ingreso</th>
                    <th className="py-3 px-3">Plan / Vencimiento</th>
                    <th className="py-3 px-3 text-center">Días Asistidos</th>
                    <th className="py-3 px-3 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40 font-medium">
                  {filteredAthletes.map((ath: any) => {
                    const latestMemb = ath.memberships?.[0]
                    const hasActiveMembership =
                      latestMemb &&
                      new Date(latestMemb.endDate).getTime() >= new Date().setHours(0, 0, 0, 0)
                    const admissionDate = ath.createdAt
                      ? new Date(ath.createdAt).toLocaleDateString("es-VE", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        })
                      : "N/A"
                    const attendanceCount = ath.attendances?.length || 0

                    return (
                      <tr
                        key={ath.id}
                        className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                      >
                        {/* Estado: Círculo Verde / Rojo */}
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2">
                            <span
                              className={`w-3.5 h-3.5 rounded-full inline-block shadow-sm ${
                                hasActiveMembership
                                  ? "bg-emerald-500 ring-4 ring-emerald-500/20"
                                  : "bg-rose-500 ring-4 ring-rose-500/20"
                              }`}
                              title={hasActiveMembership ? "Membresía Activa" : "Membresía Inactiva / Vencida"}
                            />
                            <span
                              className={`text-[11px] font-bold ${
                                hasActiveMembership ? "text-emerald-500" : "text-rose-500"
                              }`}
                            >
                              {hasActiveMembership ? "Activa" : "Inactiva"}
                            </span>
                          </div>
                        </td>

                        {/* Nombre y Foto */}
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2.5">
                            {ath.profilePicture ? (
                              <img
                                src={ath.profilePicture}
                                alt={ath.name}
                                className="w-8 h-8 rounded-full object-cover border border-border"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-xs">
                                {ath.name?.charAt(0) || "A"}
                              </div>
                            )}
                            <div>
                              <span className="font-bold text-foreground block text-sm">
                                {ath.name}
                              </span>
                              {ath.phone && (
                                <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                  <Phone className="w-3 h-3" /> {ath.phone}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Cédula */}
                        <td className="py-3 px-3 font-mono text-xs">{ath.cedula}</td>

                        {/* Fecha de Ingreso */}
                        <td className="py-3 px-3 text-muted-foreground">{admissionDate}</td>

                        {/* Plan */}
                        <td className="py-3 px-3">
                          {latestMemb ? (
                            <div>
                              <span className="font-semibold text-foreground block">
                                {latestMemb.planName || "Plan General"}
                              </span>
                              <span className="text-[10px] text-muted-foreground">
                                Vence: {new Date(latestMemb.endDate).toLocaleDateString("es-VE")}
                              </span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground italic">Sin Plan Registrado</span>
                          )}
                        </td>

                        {/* Días Asistidos */}
                        <td className="py-3 px-3 text-center">
                          <span className="inline-flex items-center gap-1 font-bold px-2.5 py-1 rounded-full bg-info/10 text-info">
                            <Calendar className="w-3.5 h-3.5" /> {attendanceCount}
                          </span>
                        </td>

                        {/* Acción: Ver Historial de Asistencia */}
                        <td className="py-3 px-3 text-right">
                          <button
                            type="button"
                            onClick={() => setAthleteAttendanceModal(ath)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-primary/20 hover:text-primary transition font-bold text-xs border border-border/60"
                          >
                            <History className="w-3.5 h-3.5 text-primary" />
                            <span>Historial</span>
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* MODAL 1: Historial de Asistencia del COACH */}
      {coachAttendanceModal && (
        <Dialog
          open={!!coachAttendanceModal}
          onClose={() => setCoachAttendanceModal(null)}
          title={`Historial de Asistencias: ${coachAttendanceModal.name}`}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-primary/10 border border-primary/20 rounded-2xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/20 text-primary flex items-center justify-center font-bold">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-foreground">Entrenador (Coach)</h4>
                  <p className="text-xs text-muted-foreground">C.I. {coachAttendanceModal.cedula}</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-2xl font-black text-primary">
                  {coachAttendanceModal.attendances?.length || 0}
                </span>
                <span className="text-xs text-muted-foreground block font-medium">Días Asistidos</span>
              </div>
            </div>

            <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
              {!coachAttendanceModal.attendances || coachAttendanceModal.attendances.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground text-xs">
                  No hay registros de asistencia para este entrenador.
                </div>
              ) : (
                coachAttendanceModal.attendances.map((att: any, idx: number) => {
                  const d = new Date(att.date)
                  return (
                    <div
                      key={att.id || idx}
                      className="flex items-center justify-between p-3 rounded-xl bg-card border border-border text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="w-6 h-6 rounded-full bg-info/10 text-info flex items-center justify-center font-bold text-[10px]">
                          {idx + 1}
                        </span>
                        <span className="font-bold text-foreground">
                          {d.toLocaleDateString("es-VE", {
                            weekday: "short",
                            day: "2-digit",
                            month: "long",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                      <span className="text-muted-foreground flex items-center gap-1 font-mono">
                        <Clock className="w-3.5 h-3.5" />
                        {d.toLocaleTimeString("es-VE", { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                  )
                })
              )}
            </div>

            <Button
              variant="outline"
              onClick={() => setCoachAttendanceModal(null)}
              className="w-full mt-2"
            >
              Cerrar Historial
            </Button>
          </div>
        </Dialog>
      )}

      {/* MODAL 2: Historial de Asistencia del ATLETA */}
      {athleteAttendanceModal && (
        <Dialog
          open={!!athleteAttendanceModal}
          onClose={() => setAthleteAttendanceModal(null)}
          title={`Historial de Asistencias: ${athleteAttendanceModal.name}`}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-emerald-500/10 border border-emerald-500/25 rounded-2xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-500 flex items-center justify-center font-bold">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-foreground">Atleta del Gimnasio</h4>
                  <p className="text-xs text-muted-foreground">C.I. {athleteAttendanceModal.cedula}</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-2xl font-black text-emerald-500">
                  {athleteAttendanceModal.attendances?.length || 0}
                </span>
                <span className="text-xs text-muted-foreground block font-medium">Asistencias Totales</span>
              </div>
            </div>

            <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
              {!athleteAttendanceModal.attendances || athleteAttendanceModal.attendances.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground text-xs">
                  No hay registros de asistencia para este atleta.
                </div>
              ) : (
                athleteAttendanceModal.attendances.map((att: any, idx: number) => {
                  const d = new Date(att.date)
                  return (
                    <div
                      key={att.id || idx}
                      className="flex items-center justify-between p-3 rounded-xl bg-card border border-border text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold text-[10px]">
                          {idx + 1}
                        </span>
                        <span className="font-bold text-foreground">
                          {d.toLocaleDateString("es-VE", {
                            weekday: "short",
                            day: "2-digit",
                            month: "long",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                      <span className="text-muted-foreground flex items-center gap-1 font-mono">
                        <Clock className="w-3.5 h-3.5" />
                        {d.toLocaleTimeString("es-VE", { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                  )
                })
              )}
            </div>

            <Button
              variant="outline"
              onClick={() => setAthleteAttendanceModal(null)}
              className="w-full mt-2"
            >
              Cerrar Historial
            </Button>
          </div>
        </Dialog>
      )}
    </div>
  )
}
