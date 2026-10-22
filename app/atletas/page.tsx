"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { athleteService, AthleteProfile } from "@/lib/data-service"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, Users, ChevronRight, CalendarCheck, Edit, Check, X, ShieldAlert, KeyRound, User as UserIcon } from "lucide-react"
import Link from "next/link"
import { Loader } from "@/components/ui/loader"
import { CardGridSkeleton } from "@/components/ui/skeleton"
import { AttendanceHistoryModal, AttendanceModalAthlete } from "@/components/athletes/attendance-history-modal"
import { showSweetToast } from "@/lib/toast-context"

export default function AtletasPage() {
  const { user } = useAuth()
  const [athletes, setAthletes] = useState<AthleteProfile[]>([])
  const [coaches, setCoaches] = useState<Record<string, string>>({})
  const [coachList, setCoachList] = useState<{ id: string; name: string }[]>([])
  const [selectedAthleteForAttendance, setSelectedAthleteForAttendance] = useState<AttendanceModalAthlete | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)

  // Estados para Modal de Edición de Atleta
  const [editingAthlete, setEditingAthlete] = useState<AthleteProfile | null>(null)
  const [editName, setEditName] = useState("")
  const [editCedula, setEditCedula] = useState("")
  const [editPhone, setEditPhone] = useState("")
  const [editEmail, setEditEmail] = useState("")
  const [editAddress, setEditAddress] = useState("")
  const [editGender, setEditGender] = useState("M")
  const [editCoachId, setEditCoachId] = useState("")
  const [editPassword, setEditPassword] = useState("")
  const [editConfirmPassword, setEditConfirmPassword] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  const canEdit = user?.role === 'admin' || user?.role === 'gerente'

  const loadAthletes = async () => {
    try {
      const { getAthletes, getAllEmployees } = await import('@/app/actions/users')
      const empRes = await getAllEmployees()
      if (empRes.success) {
        const map: Record<string, string> = {}
        const list: { id: string; name: string }[] = []
        ;(empRes.employees as any[]).forEach((e: any) => { 
          if (e.role === 'coach' || e.role === 'employee') {
            map[e.id] = e.name
            list.push({ id: e.id, name: e.name })
          }
        })
        setCoaches(map)
        setCoachList(list)
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

  useEffect(() => {
    loadAthletes()
  }, [])

  const handleOpenEdit = (a: AthleteProfile) => {
    setEditingAthlete(a)
    setEditName(a.name || "")
    setEditCedula(a.cedula || "")
    setEditPhone(a.phone || "")
    setEditEmail((a as any).email || "")
    setEditAddress(a.address || "")
    setEditGender(a.gender || "M")
    setEditCoachId(a.coachId || "")
    setEditPassword("")
    setEditConfirmPassword("")
  }

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingAthlete) return

    if (editPassword) {
      if (editPassword.length < 6) {
        showSweetToast("La contraseña debe tener al menos 6 caracteres.", "warning")
        return
      }
      if (editPassword !== editConfirmPassword) {
        showSweetToast("Las contraseñas no coinciden.", "warning")
        return
      }
    }

    setIsSaving(true)
    try {
      const { updateAthlete } = await import('@/app/actions/users')
      const res = await updateAthlete(editingAthlete.id, {
        name: editName,
        cedula: editCedula,
        phone: editPhone,
        email: editEmail,
        address: editAddress,
        gender: editGender,
        coachId: editCoachId || null,
        ...(editPassword ? { password: editPassword } : {})
      })

      if (res.success) {
        showSweetToast("Datos del atleta actualizados correctamente.", "success")
        setEditingAthlete(null)
        await loadAthletes()
      } else {
        showSweetToast(res.error || "No se pudo actualizar los datos.", "error")
      }
    } catch (err: any) {
      showSweetToast(err?.message || "Error al actualizar.", "error")
    } finally {
      setIsSaving(false)
    }
  }

  // Solo Admin y Empleado pueden ver esto
  if (user?.role === 'athlete') {
    return <div className="p-8 text-center text-destructive font-bold">Acceso Denegado</div>
  }

  const isCoach = user?.role === 'coach' || user?.role === 'employee'
  const [filterType, setFilterType] = useState('Todas')

  const filteredAthletes = athletes.filter(a => {
    // Si el usuario es entrenador, únicamente puede ver sus atletas asignados
    if (isCoach && a.coachId !== user?.id) return false

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
        <CardGridSkeleton count={6} variant="athlete" />
      ) : filteredAthletes.length === 0 ? (
        <div className="text-center py-16 px-4 rounded-2xl glass border border-dashed border-black/15 dark:border-white/15 my-6">
          <div className="h-16 w-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center text-primary shadow-inner">
            <Users className="h-8 w-8 opacity-80" />
          </div>
          <h3 className="text-xl font-black text-foreground">
            {isCoach ? "No tienes atletas asignados" : "No se encontraron atletas"}
          </h3>
          <p className="text-sm text-muted-foreground mt-1.5 max-w-md mx-auto">
            {isCoach
              ? "Actualmente no tienes ningún atleta asignado a tu supervisión. Contacta a un administrador para que te asigne atletas."
              : searchTerm
                ? `No hay resultados para "${searchTerm}". Prueba verificando la cédula o el nombre.`
                : "No hay atletas registrados que coincidan con el filtro seleccionado."}
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

                  {/* Botón para ver Asistencias y Plan / Editar */}
                  <div className="mt-4 pt-3 border-t border-black/10 dark:border-white/10 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedAthleteForAttendance({
                          ...atleta,
                          coachName: atleta.coachId ? coaches[atleta.coachId] : undefined,
                        })
                      }
                      className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary border border-primary/25 font-bold text-xs transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
                    >
                      <CalendarCheck className="w-4 h-4 text-primary" />
                      <span>Asistencias ({atleta.attendances?.length || 0})</span>
                    </button>

                    {canEdit && (
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(atleta)}
                        title="Editar datos y contraseña"
                        className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-primary/15 text-foreground hover:text-primary border border-black/10 dark:border-white/10 font-bold text-xs transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Editar</span>
                      </button>
                    )}
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

      {/* MODAL DE EDICIÓN DE DATOS Y CREDENCIALES DEL ATLETA */}
      {editingAthlete && (
        <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-black/80 p-2 sm:p-4 backdrop-blur-md overflow-y-auto">
          <div className="bg-card text-card-foreground border border-black/15 dark:border-white/15 rounded-2xl max-w-lg w-full p-4 sm:p-6 shadow-2xl relative my-auto max-h-[92vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-black/10 dark:border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-primary/15 text-primary flex items-center justify-center">
                  <Edit className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-foreground leading-tight">Editar Atleta</h3>
                  <p className="text-xs text-muted-foreground">{editingAthlete.name}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingAthlete(null)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Formulario */}
            <form onSubmit={handleSaveEdit} className="space-y-4 overflow-y-auto pr-1">
              {/* Sección Datos Personales */}
              <div className="space-y-3">
                <span className="text-[11px] font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <UserIcon className="w-3.5 h-3.5 text-primary" /> Datos Personales
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold mb-1 block">Nombre Completo *</label>
                    <input
                      required
                      type="text"
                      value={editName}
                      onChange={e => setEditName(e.target.value)}
                      className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-lg p-2.5 text-sm focus:border-primary focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold mb-1 block">Cédula *</label>
                    <input
                      required
                      type="text"
                      value={editCedula}
                      onChange={e => setEditCedula(e.target.value)}
                      className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-lg p-2.5 text-sm focus:border-primary focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold mb-1 block">Teléfono</label>
                    <input
                      type="text"
                      placeholder="0414-0000000"
                      value={editPhone}
                      onChange={e => setEditPhone(e.target.value)}
                      className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-lg p-2.5 text-sm focus:border-primary focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold mb-1 block">Correo Electrónico</label>
                    <input
                      type="email"
                      placeholder="atleta@gym.com"
                      value={editEmail}
                      onChange={e => setEditEmail(e.target.value)}
                      className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-lg p-2.5 text-sm focus:border-primary focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold mb-1 block">Género</label>
                    <select
                      value={editGender}
                      onChange={e => setEditGender(e.target.value)}
                      className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-lg p-2.5 text-sm focus:border-primary focus:outline-none"
                    >
                      <option value="M">Masculino</option>
                      <option value="F">Femenino</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold mb-1 block">Entrenador (Coach)</label>
                    <select
                      value={editCoachId}
                      onChange={e => setEditCoachId(e.target.value)}
                      className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-lg p-2.5 text-sm focus:border-primary focus:outline-none"
                    >
                      <option value="">Sin entrenador asignado</option>
                      {coachList.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold mb-1 block">Dirección de Habitación</label>
                  <input
                    type="text"
                    placeholder="Sector / Calle / Residencia"
                    value={editAddress}
                    onChange={e => setEditAddress(e.target.value)}
                    className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-lg p-2.5 text-sm focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              {/* Sección Credenciales / Contraseña */}
              <div className="pt-3 border-t border-black/10 dark:border-white/10 space-y-3">
                <span className="text-[11px] font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-amber-500" /> Restablecer Contraseña (Opcional)
                </span>
                <p className="text-[11px] text-muted-foreground">
                  Deja estos campos en blanco si no deseas modificar la clave actual del atleta.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold mb-1 block">Nueva Contraseña</label>
                    <input
                      type="password"
                      placeholder="Mínimo 6 caracteres"
                      value={editPassword}
                      onChange={e => setEditPassword(e.target.value)}
                      className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-lg p-2.5 text-sm focus:border-primary focus:outline-none"
                    />
                  </div>

                  <div className="relative">
                    <label className="text-xs font-semibold mb-1 block">Confirmar Contraseña</label>
                    <input
                      type="password"
                      placeholder="Repetir contraseña"
                      disabled={!editPassword}
                      value={editConfirmPassword}
                      onChange={e => setEditConfirmPassword(e.target.value)}
                      className={`w-full bg-black/5 dark:bg-black/40 border rounded-lg p-2.5 text-sm focus:outline-none transition-all ${
                        editConfirmPassword
                          ? editPassword === editConfirmPassword
                            ? 'border-emerald-500 focus:border-emerald-500'
                            : 'border-rose-500 focus:border-rose-500'
                          : 'border-black/10 dark:border-white/10 focus:border-primary'
                      }`}
                    />
                    {editPassword && editConfirmPassword && editPassword === editConfirmPassword && (
                      <Check className="absolute right-3 top-8 h-4 w-4 text-emerald-500" />
                    )}
                  </div>
                </div>
              </div>

              {/* Botones de acción */}
              <div className="flex gap-2.5 justify-end pt-4 border-t border-black/10 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setEditingAthlete(null)}
                  disabled={isSaving}
                  className="px-4 py-2 text-sm font-semibold bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 rounded-xl transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSaving || (!!editPassword && editPassword !== editConfirmPassword)}
                  className="px-5 py-2 text-sm font-bold bg-primary text-primary-foreground rounded-xl hover:opacity-90 transition disabled:opacity-50 flex items-center gap-2"
                >
                  {isSaving ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      <span>Guardando...</span>
                    </>
                  ) : (
                    <span>Guardar Cambios</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
