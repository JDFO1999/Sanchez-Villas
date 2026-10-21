"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { athleteService, AthleteProfile } from "@/lib/data-service"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, Users, ChevronRight, CalendarCheck } from "lucide-react"
import Link from "next/link"
import { Loader } from "@/components/ui/loader"
import { AttendanceHistoryModal, AttendanceModalAthlete } from "@/components/athletes/attendance-history-modal"

export default function AtletasPage() {
  const { user } = useAuth()
  const [athletes, setAthletes] = useState<AthleteProfile[]>([])
  const [coaches, setCoaches] = useState<Record<string, string>>({})
  const [selectedAthleteForAttendance, setSelectedAthleteForAttendance] = useState<AttendanceModalAthlete | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const { getAthletes, getAllEmployees } = await import('@/app/actions/users')
        const empRes = await getAllEmployees()
        if (empRes.success) {
          const map: Record<string, string> = {}
          ;(empRes.employees as any[]).forEach((e: any) => { if (e.role === 'coach') map[e.id] = e.name })
          setCoaches(map)
        }
        const res = await getAthletes()
        if (res.success) {
          setAthletes(res.athletes.map((a: any) => ({
            ...a,
            membershipEnd: a.memberships?.[0]?.endDate || new Date(0).toISOString(),
            membershipStart: a.memberships?.[0]?.startDate || null,
            planName: a.memberships?.[0]?.planName || null,
            attendances: a.attendances || [],
          })))
        }
      } catch (err) {
        console.error("Error cargando atletas:", err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  // Solo Admin y Empleado pueden ver esto
  if (user?.role === 'athlete') {
    return <div className="p-8 text-center text-destructive font-bold">Acceso Denegado</div>
  }

  const isCoach = user?.role === 'coach'
  const [filterType, setFilterType] = useState('Todas')

  const filteredAthletes = athletes.filter(a => {
    // Si el usuario es entrenador, únicamente puede ver sus atletas asignados
    if (isCoach && a.coachId !== user.id) return false

    const matchesSearch = a.name.toLowerCase().includes(searchTerm.toLowerCase()) || a.cedula.includes(searchTerm)
    if (!matchesSearch) return false

    const endDate = new Date(a.membershipEnd)
    const today = new Date()
    const diffDays = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    
    if (filterType === 'Activas') return diffDays > 0
    if (filterType === 'Por Vencer') return diffDays > 0 && diffDays <= 5
    if (filterType === 'Vencidas') return diffDays <= 0
    return true
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">{isCoach ? "Mis Atletas Asignados" : "Directorio de Atletas"}</h1>
          <p className="text-muted-foreground mt-1">
            {isCoach ? "Gestión y seguimiento de los clientes bajo tu supervisión." : "Gestión y seguimiento de tus clientes."}
          </p>
        </div>
        <div className="flex gap-2">
          <select 
            value={filterType} 
            onChange={e => setFilterType(e.target.value)}
            className="bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary transition-colors"
          >
            <option value="Todas">Todas</option>
            <option value="Activas">Activas</option>
            <option value="Por Vencer">Por Vencer</option>
            <option value="Vencidas">Vencidas</option>
          </select>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Buscar por nombre o cédula..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full sm:w-64 bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-foreground focus:outline-none focus:border-primary"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="py-20 flex justify-center">
          <Loader size={60} text={isCoach ? "Cargando tus atletas asignados..." : "Cargando directorio de atletas..."} />
        </div>
      ) : filteredAthletes.length === 0 ? (
        <div className="text-center py-16 px-4 rounded-2xl glass border border-dashed border-black/15 dark:border-white/15 my-6">
          <div className="h-16 w-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center text-primary shadow-inner">
            <Users className="h-8 w-8 opacity-80" />
          </div>
          <h3 className="text-xl font-black text-foreground">No se encontraron atletas</h3>
          <p className="text-sm text-muted-foreground mt-1.5 max-w-md mx-auto">
            {searchTerm ? `No hay resultados para "${searchTerm}". Prueba verificando la cédula o el nombre.` : "No hay atletas registrados que coincidan con el filtro seleccionado."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-2">
          {filteredAthletes.map((atleta) => {
            // Determinar estado de membresía
            const hasValidMemb = Boolean(atleta.membershipEnd && new Date(atleta.membershipEnd).getFullYear() > 1970)
            const endDate = hasValidMemb ? new Date(atleta.membershipEnd) : null
            const today = new Date()
            const diffTime = endDate ? endDate.getTime() - today.getTime() : -1
            const diffDays = endDate ? Math.ceil(diffTime / (1000 * 60 * 60 * 24)) : 0
            
            let estadoColor = "text-success bg-success/10 border-success/20"
            let dotPing = "bg-emerald-400"
            let dotSolid = "bg-emerald-500"
            let estadoTexto = "Activa"

            if (!hasValidMemb) {
              estadoColor = "text-warning bg-warning/10 border-warning/20"
              dotPing = "bg-amber-400"
              dotSolid = "bg-amber-500"
              estadoTexto = "Sin membresía"
            } else if (diffDays <= 0) {
              estadoColor = "text-rose-500 bg-rose-500/10 border-rose-500/20"
              dotPing = "bg-rose-400"
              dotSolid = "bg-rose-500"
              estadoTexto = "Vencida"
            } else if (diffDays <= 7) {
              estadoColor = "text-warning bg-warning/10 border-warning/20"
              dotPing = "bg-amber-400"
              dotSolid = "bg-amber-500"
              estadoTexto = "Por vencer"
            }

            return (
              <Card
                key={atleta.id}
                className="glass transition-all duration-300 group hover:border-primary/60 hover:shadow-[0_0_25px_rgba(255,255,255,0.12)] flex flex-col justify-between"
              >
                <CardContent className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <Link href={`/atletas/${atleta.id}`} className="block">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                          {atleta.profilePicture ? (
                            <img src={atleta.profilePicture} alt={atleta.name} className="h-12 w-12 rounded-full object-cover border border-primary/30" />
                          ) : (
                            <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-lg">
                              {atleta.name.charAt(0)}
                            </div>
                          )}
                          <div>
                            <h3 className="font-bold text-foreground group-hover:text-primary transition">{atleta.name}</h3>
                            <p className="text-xs text-muted-foreground">C.C. {atleta.cedula}</p>
                          </div>
                        </div>
                        <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition" />
                      </div>
                    </Link>
                    
                    <div className="mt-4 pt-4 border-t border-black/10 dark:border-white/10 space-y-3">
                      {hasValidMemb && diffDays > 0 && (() => {
                        const startDate = atleta.membershipStart ? new Date(atleta.membershipStart) : new Date()
                        const totalDays = Math.max(1, Math.ceil((new Date(atleta.membershipEnd).getTime() - startDate.getTime()) / (1000*60*60*24)))
                        const pct = Math.min(100, Math.max(4, (diffDays / totalDays) * 100))
                        return (
                          <div>
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-muted-foreground">{atleta.planName || "Membresía"}</span>
                              <span className={diffDays <= 7 ? "text-warning font-bold" : "text-success font-bold"}>{diffDays}d restantes</span>
                            </div>
                            <div className="h-1.5 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
                              <div className={`h-full rounded-full transition-all ${diffDays <= 7 ? "bg-amber-500" : "bg-emerald-500"}`} style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                        )
                      })()}
                      {!hasValidMemb && (
                        <div className="flex items-center gap-2 text-warning text-xs font-bold bg-warning/10 border border-warning/20 rounded-lg px-3 py-1.5">
                          <span>⏳</span> Sin Membresía (Pendiente de pago)
                        </div>
                      )}
                      {hasValidMemb && diffDays <= 0 && (
                        <div className="flex items-center gap-2 text-rose-500 text-xs font-bold bg-rose-500/10 border border-rose-500/20 rounded-lg px-3 py-1.5">
                          <span>⚠️</span> Membresía Vencida
                        </div>
                      )}
                      <div className="flex justify-between items-center pt-1">
                        <p className="text-xs text-muted-foreground truncate max-w-[150px]">
                          🏋️ {atleta.coachId ? (coaches[atleta.coachId] || "Coach asignado") : "Sin entrenador"}
                        </p>
                        <span className={`inline-flex items-center gap-1.5 text-[11px] px-2.5 py-0.5 rounded-full font-bold border ${estadoColor}`}>
                          <span className="relative flex h-2 w-2">
                            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${dotPing}`} />
                            <span className={`relative inline-flex rounded-full h-2 w-2 ${dotSolid}`} />
                          </span>
                          {estadoTexto}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Botón para ver Asistencias y Plan */}
                  <div className="mt-4 pt-3 border-t border-black/10 dark:border-white/10">
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedAthleteForAttendance({
                          ...atleta,
                          coachName: atleta.coachId ? coaches[atleta.coachId] : undefined,
                        })
                      }
                      className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary border border-primary/25 font-bold text-xs transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
                    >
                      <CalendarCheck className="w-4 h-4 text-primary" />
                      <span>Ver Asistencias ({atleta.attendances?.length || 0})</span>
                    </button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Modal de Historial de Asistencia */}
      <AttendanceHistoryModal
        open={Boolean(selectedAthleteForAttendance)}
        onClose={() => setSelectedAthleteForAttendance(null)}
        athlete={selectedAthleteForAttendance}
      />
    </div>
  )
}
