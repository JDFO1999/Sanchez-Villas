"use client"

import { useState, useEffect, useMemo } from "react"
import { 
  CheckCircle2, 
  XCircle, 
  Search, 
  Clock, 
  Camera, 
  Key, 
  Users, 
  UserCheck, 
  ShieldCheck, 
  Dumbbell, 
  Calendar, 
  Printer, 
  RefreshCw, 
  X,
  CreditCard,
  Briefcase
} from "lucide-react"
import { Scanner } from "@yudiel/react-qr-scanner"
import Swal from "sweetalert2"
import { useAuth } from "@/lib/auth-context"
import { swalTheme, themeColor, playCheckInSound } from "@/lib/confirm"
import { getAttendanceReportAction, checkInByCedula } from "@/app/actions/attendance"
import { Card } from "@/components/ui/card"
import { Loader } from "@/components/ui/loader"

type TabType = "athletes" | "employees" | "all"

export default function AsistenciaPage() {
  const { user } = useAuth()
  
  // Fecha seleccionada (YYYY-MM-DD en horario de Venezuela UTC-4 para evitar salto de día a las 8:00 PM)
  const todayStr = useMemo(() => {
    const vetNow = new Date(Date.now() - 4 * 60 * 60 * 1000)
    return vetNow.toISOString().split("T")[0]
  }, [])
  const [selectedDate, setSelectedDate] = useState<string>(todayStr)

  // Datos del reporte
  const [attendances, setAttendances] = useState<any[]>([])
  const [athleteAttendances, setAthleteAttendances] = useState<any[]>([])
  const [employeeAttendances, setEmployeeAttendances] = useState<any[]>([])
  const [stats, setStats] = useState({
    total: 0,
    athletes: 0,
    employees: 0,
    activeMemberships: 0,
    expiredMemberships: 0,
  })

  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [activeTab, setActiveTab] = useState<TabType>("athletes")
  const [searchQuery, setSearchQuery] = useState("")

  // Modal de Marcaje / Reloj Checador
  const [showCheckInModal, setShowCheckInModal] = useState(false)
  const [showQrScanner, setShowQrScanner] = useState(false)
  const [manualCedula, setManualCedula] = useState("")
  const [isSubmittingCheckIn, setIsSubmittingCheckIn] = useState(false)

  // Cargar reporte de asistencia
  const loadReport = async (dateToLoad: string) => {
    try {
      setIsLoading(true)
      const res = await getAttendanceReportAction(dateToLoad)
      if (res.success) {
        setAttendances(res.attendances || [])
        setAthleteAttendances(res.athleteAttendances || [])
        setEmployeeAttendances(res.employeeAttendances || [])
        setStats(res.stats || { total: 0, athletes: 0, employees: 0, activeMemberships: 0, expiredMemberships: 0 })
      } else {
        console.error("Error cargando reporte:", res.error)
      }
    } catch (err) {
      console.error("Error:", err)
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    loadReport(selectedDate)
  }, [selectedDate])

  const handleRefresh = () => {
    setIsRefreshing(true)
    loadReport(selectedDate)
  }

  // Comprobar autorización de acceso
  const isAuthorized = user && (
    user.role === "admin" ||
    user.role === "gerente" ||
    user.role === "cajero" ||
    user.role === "recepcion" ||
    (user as any)?.canManageAttendance ||
    user.permissions?.includes("CRM_MANAGE")
  )

  if (!isAuthorized) {
    return (
      <div className="p-8 text-center text-destructive font-bold">
        Acceso Denegado. Solo personal de recepción, caja, administración o entrenadores autorizados pueden acceder a la Asistencia.
      </div>
    )
  }

  // Filtrado de la lista según pestaña y búsqueda
  const currentList = activeTab === "athletes" 
    ? athleteAttendances 
    : activeTab === "employees" 
    ? employeeAttendances 
    : attendances

  const filteredList = currentList.filter((item: any) => {
    const name = item.user?.name?.toLowerCase() || ""
    const cedula = item.user?.cedula?.toLowerCase() || ""
    const query = searchQuery.toLowerCase().trim()
    if (!query) return true
    return name.includes(query) || cedula.includes(query)
  })

  // Manejo del registro de entrada (Reloj Checador)
  const handleCheckInProcess = async (code: string, isManual: boolean) => {
    const targetCode = code.trim()
    if (!targetCode) return

    const theme = swalTheme()
    let managerOrAdminKey: string | undefined = undefined

    // Si es manual por cédula, solicitar clave/PIN de autorización de Administrador o Gerente
    if (isManual) {
      const { value: key } = await Swal.fire({
        title: "Autorización Requerida",
        html: `
          <div class="text-sm text-muted-foreground text-left space-y-2 mb-2">
            <p>Para recepcionar manualmente a <b>C.I. ${targetCode}</b>, ingresa la clave o PIN generado de <b>Administrador</b> o <b>Gerente</b>:</p>
          </div>
        `,
        input: "password",
        inputPlaceholder: "Clave o PIN generado...",
        showCancelButton: true,
        ...theme,
        confirmButtonText: "Autorizar y Recepcionar",
        cancelButtonText: "Cancelar",
        confirmButtonColor: themeColor("primary") || "#eab308",
        reverseButtons: true,
        inputValidator: (v) => (!v || !v.trim() ? "Debes ingresar la clave o PIN de autorización" : undefined),
      })

      if (!key) return
      managerOrAdminKey = key.trim()
    }

    setIsSubmittingCheckIn(true)
    try {
      const res = await checkInByCedula(targetCode, managerOrAdminKey, !isManual)
      if (res.success) {
        playCheckInSound("success")

        Swal.fire({
          toast: true,
          position: "top-end",
          showConfirmButton: false,
          timer: 3500,
          timerProgressBar: true,
          icon: "success",
          title: `✅ Entrada: ${res.user?.name} (${res.user?.role === "athlete" ? "Atleta" : "Personal"})`,
          text: res.authorizedBy ? `Autorizado por: ${res.authorizedBy}` : undefined,
          ...theme,
        })

        setManualCedula("")
        setShowQrScanner(false)
        setShowCheckInModal(false)
        loadReport(selectedDate)
      } else {
        playCheckInSound("error")

        Swal.fire({
          title: "Acceso Denegado",
          text: res.error || "No se pudo registrar la entrada.",
          icon: "error",
          ...theme,
          confirmButtonColor: themeColor("destructive") || "#ef4444",
        })
      }
    } finally {
      setIsSubmittingCheckIn(false)
    }
  }

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleCheckInProcess(manualCedula, true)
  }

  const handleQrDetected = (detected: any[]) => {
    if (detected.length > 0 && detected[0].rawValue) {
      setShowQrScanner(false)
      handleCheckInProcess(detected[0].rawValue, false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case "athlete":
        return <span className="bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase">Atleta</span>
      case "coach":
      case "employee":
        return <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase">Entrenador</span>
      case "recepcion":
        return <span className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase">Recepción</span>
      case "cajero":
        return <span className="bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase">Cajero</span>
      case "admin":
      case "gerente":
        return <span className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase">Gerencia</span>
      default:
        return <span className="bg-muted text-muted-foreground px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase">{role || "Staff"}</span>
    }
  }

  return (
    <div className="space-y-6 max-w-full mx-auto pb-12">
      {/* Encabezado Principal */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Reporte General de Asistencia</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Registro diario consolidado de entradas al gimnasio, separado entre atletas y equipo de trabajo.
          </p>
        </div>

        {/* Acciones de Cabecera: Selector de Fecha + Refrescar + Imprimir + Registrar Entrada */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5 bg-card border border-black/15 dark:border-white/15 px-3 py-1.5 rounded-xl shadow-sm">
            <Calendar className="w-4 h-4 text-primary shrink-0" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent text-xs sm:text-sm font-bold focus:outline-none cursor-pointer"
            />
          </div>

          <button
            onClick={() => setSelectedDate(todayStr)}
            className={`px-3 py-2 text-xs font-bold rounded-xl border transition shadow-sm ${
              selectedDate === todayStr 
                ? "bg-primary text-primary-foreground border-primary" 
                : "bg-card border-black/15 dark:border-white/15 hover:bg-black/5 dark:hover:bg-white/5"
            }`}
          >
            Hoy
          </button>

          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-2 rounded-xl bg-card border border-black/15 dark:border-white/15 hover:bg-black/5 dark:hover:bg-white/5 text-muted-foreground hover:text-foreground transition shadow-sm"
            title="Refrescar reporte"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin text-primary" : ""}`} />
          </button>

          <button
            onClick={handlePrint}
            className="px-3.5 py-2 rounded-xl bg-card border border-black/15 dark:border-white/15 hover:bg-black/5 dark:hover:bg-white/5 text-xs sm:text-sm font-bold shadow-sm transition flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4 text-primary" />
            <span className="hidden sm:inline">Imprimir</span>
          </button>

          <button
            onClick={() => setShowCheckInModal(true)}
            className="px-4 py-2 rounded-xl bg-primary text-primary-foreground font-black text-xs sm:text-sm shadow-md hover:opacity-90 transition flex items-center gap-2 cursor-pointer"
          >
            <Camera className="w-4 h-4" />
            <span>Check/Entrada</span>
          </button>
        </div>
      </div>

      {/* Tarjetas KPI de Resumen del Día */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total General */}
        <Card className="rounded-2xl border border-black/15 dark:border-white/15 bg-card shadow-sm p-4 sm:p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground">Total Asistencias</span>
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="my-2">
            <h3 className="text-2xl sm:text-3xl font-black text-foreground">{stats.total}</h3>
            <p className="text-[11px] text-muted-foreground mt-0.5">Ingresos en fecha: {selectedDate}</p>
          </div>
        </Card>

        {/* Total Atletas */}
        <Card className="rounded-2xl border border-primary/20 bg-primary/5 shadow-sm p-4 sm:p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-primary">Atletas Presentes</span>
            <div className="p-2 rounded-xl bg-primary/20 text-primary">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="my-2">
            <h3 className="text-2xl sm:text-3xl font-black text-primary">{stats.athletes}</h3>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              <span className="text-emerald-500 font-bold">{stats.activeMemberships} activas</span> •{" "}
              <span className="text-destructive font-bold">{stats.expiredMemberships} vencidas</span>
            </p>
          </div>
        </Card>

        {/* Total Empleados */}
        <Card className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 shadow-sm p-4 sm:p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Equipo & Staff</span>
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-500">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <div className="my-2">
            <h3 className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">{stats.employees}</h3>
            <p className="text-[11px] text-muted-foreground mt-0.5">Entrenadores, recepción y personal</p>
          </div>
        </Card>

        {/* Último Ingreso */}
        <Card className="rounded-2xl border border-black/15 dark:border-white/15 bg-card shadow-sm p-4 sm:p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground">Último Ingreso</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="my-2">
            <h3 className="text-xl sm:text-2xl font-black text-foreground">
              {attendances.length > 0 
                ? new Date(attendances[0].date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) 
                : "--:--"}
            </h3>
            <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
              {attendances.length > 0 ? attendances[0].user?.name : "Sin ingresos aún"}
            </p>
          </div>
        </Card>
      </div>

      {/* Controles de Vista: Pestañas + Buscador */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-black/10 dark:border-white/10 pb-3">
        {/* Pestañas: Atletas / Empleados / Todos */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 shrink-0">
          <button
            onClick={() => setActiveTab("athletes")}
            className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === "athletes"
                ? "bg-card text-foreground shadow-sm border border-black/10 dark:border-white/10"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Users className="w-4 h-4 text-primary" />
            <span>Atletas</span>
            <span className="ml-1 text-[10px] font-black px-1.5 py-0.2 rounded-full bg-primary/20 text-primary">
              {stats.athletes}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("employees")}
            className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === "employees"
                ? "bg-card text-foreground shadow-sm border border-black/10 dark:border-white/10"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Briefcase className="w-4 h-4 text-emerald-500" />
            <span>Empleados & Staff</span>
            <span className="ml-1 text-[10px] font-black px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
              {stats.employees}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("all")}
            className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === "all"
                ? "bg-card text-foreground shadow-sm border border-black/10 dark:border-white/10"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span>Todos</span>
            <span className="ml-1 text-[10px] font-black px-1.5 py-0.2 rounded-full bg-muted text-foreground">
              {stats.total}
            </span>
          </button>
        </div>

        {/* Buscador */}
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por nombre o cédula..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-card border border-black/15 dark:border-white/15 rounded-xl pl-9 pr-3 py-1.5 text-xs sm:text-sm focus:outline-none focus:border-primary transition"
          />
        </div>
      </div>

      {/* Contenido del Reporte: Tabla de Asistencia */}
      <Card className="rounded-2xl border border-black/15 dark:border-white/15 bg-card shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <Loader size={36} text="Generando reporte de asistencia..." />
          </div>
        ) : filteredList.length === 0 ? (
          <div className="py-16 text-center text-muted-foreground p-6 space-y-2">
            <Clock className="w-12 h-12 mx-auto opacity-30 text-primary" />
            <p className="font-bold text-base text-foreground">No se encontraron registros de asistencia</p>
            <p className="text-xs max-w-md mx-auto">
              {searchQuery 
                ? `No hay coincidencias para "${searchQuery}" en la categoría seleccionada.` 
                : `No hubo ingresos en la fecha seleccionada (${selectedDate}). Puedes registrar accesos con el botón superior.`}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-black/5 dark:bg-white/5 border-b border-black/10 dark:border-white/10 text-muted-foreground uppercase text-[10px] font-black tracking-wider">
                <tr>
                  <th className="py-3 px-4">Hora</th>
                  <th className="py-3 px-4">Persona</th>
                  <th className="py-3 px-4">Cédula</th>
                  <th className="py-3 px-4">Tipo / Rol</th>
                  {activeTab !== "employees" && <th className="py-3 px-4">Membresía / Plan</th>}
                  {activeTab !== "athletes" && <th className="py-3 px-4">Cargo / Detalle</th>}
                  <th className="py-3 px-4 text-right">Estatus</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5 dark:divide-white/5 font-medium">
                {filteredList.map((att: any) => {
                  const person = att.user
                  const isAthlete = person?.role === "athlete"
                  const membership = person?.memberships?.[0]
                  const membershipEnd = membership?.endDate
                  const isExpired = membershipEnd ? new Date(membershipEnd) < new Date() : !isAthlete ? false : true

                  return (
                    <tr key={att.id} className="hover:bg-black/5 dark:hover:bg-white/5 transition">
                      {/* Hora */}
                      <td className="py-3 px-4 font-mono font-bold text-foreground whitespace-nowrap">
                        {new Date(att.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                      </td>

                      {/* Persona (Foto + Nombre) */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          {person?.profilePicture ? (
                            <img
                              src={person.profilePicture}
                              alt={person?.name}
                              className="w-9 h-9 rounded-full object-cover border border-primary/30 shrink-0"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-primary/10 text-primary font-black flex items-center justify-center text-xs border border-primary/25 shrink-0">
                              {person?.name?.slice(0, 2).toUpperCase() || "AS"}
                            </div>
                          )}
                          <div>
                            <div className="font-bold text-foreground">{person?.name}</div>
                            {person?.phone && (
                              <div className="text-[11px] text-muted-foreground">{person.phone}</div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Cédula */}
                      <td className="py-3 px-4 font-mono text-muted-foreground whitespace-nowrap">
                        {person?.cedula}
                      </td>

                      {/* Rol */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        {getRoleBadge(person?.role)}
                      </td>

                      {/* Membresía (para atletas o Todos) */}
                      {activeTab !== "employees" && (
                        <td className="py-3 px-4 whitespace-nowrap">
                          {isAthlete ? (
                            <div>
                              <div className="font-bold text-foreground text-xs flex items-center gap-1.5">
                                <CreditCard className="w-3.5 h-3.5 text-primary" />
                                <span>{membership?.planName || "Mensualidad Regular"}</span>
                              </div>
                              <div className="text-[10px] text-muted-foreground">
                                Vence: {membershipEnd ? new Date(membershipEnd).toLocaleDateString() : "Sin fecha"}
                              </div>
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-xs">—</span>
                          )}
                        </td>
                      )}

                      {/* Cargo / Especialidad (para empleados o Todos) */}
                      {activeTab !== "athletes" && (
                        <td className="py-3 px-4 whitespace-nowrap">
                          {!isAthlete ? (
                            <div>
                              <span className="font-bold text-xs text-foreground block">
                                {person?.specialties || person?.profession || "Personal del Gimnasio"}
                              </span>
                              <span className="text-[10px] text-muted-foreground">Turno de Operación</span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-xs">—</span>
                          )}
                        </td>
                      )}

                      {/* Estatus */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        {isAthlete ? (
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase ${
                              isExpired
                                ? "bg-destructive/15 text-destructive border border-destructive/30"
                                : "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                            }`}
                          >
                            {isExpired ? <XCircle className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />}
                            {isExpired ? "Vencida" : "Al Día"}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                            <CheckCircle2 className="w-3 h-3" /> Presente
                          </span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Modal: Reloj Checador / Escáner QR de Entrada */}
      {showCheckInModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
          <div className="bg-card text-card-foreground border border-black/15 dark:border-white/15 rounded-3xl max-w-md w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-black/10 dark:border-white/10">
              <div className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-primary" />
                <h3 className="font-black text-lg">Reloj Checador (Acceso)</h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowCheckInModal(false)
                  setShowQrScanner(false)
                }}
                className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {!showQrScanner ? (
              <div className="space-y-4">
                <button
                  type="button"
                  onClick={() => setShowQrScanner(true)}
                  className="w-full border-2 border-primary text-primary hover:bg-primary/10 rounded-2xl py-4 px-4 font-bold flex flex-col items-center justify-center gap-2 shadow-sm transition group cursor-pointer"
                >
                  <Camera className="w-8 h-8 group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-black">Escanear Código QR</span>
                </button>

                <div className="relative flex items-center justify-center py-1">
                  <div className="border-t border-black/10 dark:border-white/10 w-full" />
                  <span className="bg-card px-3 text-[11px] font-bold uppercase tracking-wider text-muted-foreground whitespace-nowrap">
                    O ingreso por cédula
                  </span>
                  <div className="border-t border-black/10 dark:border-white/10 w-full" />
                </div>

                <form onSubmit={handleManualSubmit} className="space-y-3">
                  <input
                    type="text"
                    placeholder="Escribe la cédula para recepcionar..."
                    value={manualCedula}
                    onChange={(e) => setManualCedula(e.target.value)}
                    className="w-full bg-black/5 dark:bg-black/40 border border-black/15 dark:border-white/15 rounded-2xl p-3.5 text-center text-base font-mono focus:outline-none focus:border-primary transition"
                  />

                  <button
                    type="submit"
                    disabled={isSubmittingCheckIn}
                    className="w-full bg-primary text-primary-foreground rounded-2xl py-3 px-4 font-bold flex items-center justify-center gap-2 shadow transition hover:opacity-90 disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{isSubmittingCheckIn ? "Registrando..." : "Registrar Entrada Manual"}</span>
                  </button>
                </form>

                <p className="text-[11px] text-muted-foreground text-center flex items-center justify-center gap-1">
                  <Key className="w-3 h-3 text-amber-500" />
                  <span>El ingreso manual por cédula solicita clave o PIN de Gerencia</span>
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="w-full aspect-square rounded-2xl overflow-hidden border-2 border-primary relative shadow-inner">
                  <Scanner onScan={handleQrDetected} formats={["qr_code"]} />
                </div>
                <button
                  type="button"
                  onClick={() => setShowQrScanner(false)}
                  className="w-full py-2.5 rounded-xl border border-black/15 dark:border-white/15 text-xs font-bold hover:bg-black/5 dark:hover:bg-white/5 transition"
                >
                  Volver a opciones
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
