"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, CheckCircle2, FileEdit, UserCheck, Plus, Trash2, X, Eye, EyeOff, Dumbbell, CalendarDays, QrCode, Camera, ScanLine } from "lucide-react"
import { RoutineAssignmentModal } from "@/components/modals/routine-assignment-modal"
import { getCoachAthletes, getCoachAssignedRoutines, createRoutine, createDiet } from "@/app/actions/routines"
import { QRCodeSVG } from "qrcode.react"
import { athleteService } from "@/lib/data-service"
import { Loader } from "@/components/ui/loader"
import { QRScanner } from "@/components/qr-scanner"
import { playCheckInSound, swalTheme, themeColor } from "@/lib/confirm"
import Swal from "sweetalert2"
import Link from "next/link"

const DAYS_OF_WEEK = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"]

export function CoachDashboard() {
  const { user } = useAuth()
  const [routines, setRoutines] = useState<any[]>([])
  const [diets, setDiets] = useState<any[]>([])
  const [athletes, setAthletes] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  const [showQRModal, setShowQRModal] = useState(false)
  const [dynamicQrToken, setDynamicQrToken] = useState<string>("")
  const [qrSecondsLeft, setQrSecondsLeft] = useState<number>(60)
  const [coachProfile, setCoachProfile] = useState<any>(null)
  const [showTopAthletes, setShowTopAthletes] = useState(true)

  // Estados para Recepcionar Atletas desde el Dashboard del Coach (cuando tiene permiso activo)
  const [showScanner, setShowScanner] = useState(false)
  const [universalSearch, setUniversalSearch] = useState("")

  const canReceiveAthletes = Boolean(
    (user as any)?.canManageAttendance ||
    coachProfile?.canManageAttendance ||
    user?.permissions?.includes("CRM_MANAGE")
  )

  useEffect(() => {
    let timer: any
    let countdown: any

    if (showQRModal && user) {
      const fetchToken = async () => {
        try {
          const { getAthleteDynamicQrToken } = await import("@/app/actions/attendance")
          const res = await getAthleteDynamicQrToken(user.id, user.cedula)
          if (res.success && res.token) {
            setDynamicQrToken(res.token)
            setQrSecondsLeft(60)
          }
        } catch {
          setDynamicQrToken(user.cedula)
        }
      }

      fetchToken()
      timer = setInterval(fetchToken, 60000)
      countdown = setInterval(() => {
        setQrSecondsLeft((prev) => (prev > 1 ? prev - 1 : 60))
      }, 1000)
    }

    return () => {
      if (timer) clearInterval(timer)
      if (countdown) clearInterval(countdown)
    }
  }, [showQRModal, user])

  const handleUniversalCheckIn = async (e?: React.FormEvent, code?: string) => {
    if (e) e.preventDefault()
    const targetCode = (code || universalSearch).trim()
    if (!targetCode) return

    const theme = swalTheme()
    let managerOrAdminKey: string | undefined = undefined

    if (!code) {
      const { value: key } = await Swal.fire({
        title: "Autorización Requerida",
        html: `
          <div class="text-sm text-muted-foreground text-left space-y-2 mb-2">
            <p>Para recepcionar manualmente por cédula a <b>C.I. ${targetCode}</b>, ingresa la clave o PIN generado de un <b>Gerente</b> o <b>Administrador</b>:</p>
          </div>
        `,
        input: "password",
        inputPlaceholder: "Clave o PIN generado...",
        inputAttributes: {
          autocomplete: "off",
          autocapitalize: "off",
        },
        showCancelButton: true,
        ...theme,
        confirmButtonText: "Autorizar y Recepcionar",
        cancelButtonText: "Cancelar",
        reverseButtons: true,
        inputValidator: (v) => (!v || !v.trim() ? "Debes ingresar la clave o PIN de autorización" : undefined),
      })

      if (!key) return
      managerOrAdminKey = key.trim()
    }

    const { checkInByCedula } = await import("@/app/actions/attendance")
    const res = await checkInByCedula(targetCode, managerOrAdminKey, Boolean(code))

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
        customClass: {
          popup: "border border-black/10 dark:border-white/10 rounded-xl shadow-xl glass",
        },
      })
      setUniversalSearch("")
      setShowScanner(false)
    } else {
      playCheckInSound("error")
      Swal.fire({
        title: "Acceso Denegado",
        text: res.error || "No se pudo recepcionar al atleta (verifica si su membresía está activa).",
        icon: "error",
        ...theme,
        confirmButtonColor: themeColor("destructive") || "#ef4444",
      })
    }
  }


  const [showModal, setShowModal] = useState(false)
  const [modalType, setModalType] = useState<"ROUTINE" | "DIET">("ROUTINE")
  
  // Form State
  const [selectedAthlete, setSelectedAthlete] = useState("")
  const [title, setTitle] = useState("")
  const [duration, setDuration] = useState("60 min")
  
  // Rutina State
  const [exercises, setExercises] = useState([{ name: "", sets: 3, reps: "10", notes: "" }])
  
  // Dieta Semanal State
  const [activeDay, setActiveDay] = useState("Lunes")
  const [weeklyPlan, setWeeklyPlan] = useState<Record<string, { breakfast: string, lunch: string, dinner: string, snacks: string }>>(
    DAYS_OF_WEEK.reduce((acc, day) => ({ ...acc, [day]: { breakfast: "", lunch: "", dinner: "", snacks: "" } }), {})
  )

  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (user?.id) {
      loadData()
    }
  }, [user])

  async function loadData() {
    setIsLoading(true)
    const { getAthleteById } = await import('@/app/actions/users');
    
    const [athRes, routRes, profileRes] = await Promise.all([
      getCoachAthletes(user!.id),
      getCoachAssignedRoutines(user!.id),
      getAthleteById(user!.id)
    ])
    
    if (athRes.success) setAthletes(athRes.athletes || [])
    if (routRes.success) {
      setRoutines(routRes.routines || [])
      setDiets(routRes.diets || [])
    }
    if (profileRes && profileRes.success && profileRes.athlete) {
      setCoachProfile(profileRes.athlete)
    }
    setIsLoading(false)
  }

  const handleAddExercise = () => {
    setExercises([...exercises, { name: "", sets: 3, reps: "10", notes: "" }])
  }

  const handleRemoveExercise = (index: number) => {
    setExercises(exercises.filter((_, i) => i !== index))
  }

  const handleOpenAssignment = (athleteId?: string) => {
    if (athleteId) setSelectedAthlete(athleteId)
    setShowModal(true)
  }

  const handleMealChange = (day: string, meal: string, value: string) => {
    setWeeklyPlan(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [meal]: value
      }
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedAthlete || !title) return
    setIsSubmitting(true)
    
    if (modalType === "ROUTINE") {
      const res = await createRoutine({
        athleteId: selectedAthlete,
        coachId: user!.id,
        title,
        duration,
        date: new Date(),
        exercises: exercises.filter(ex => ex.name.trim() !== "")
      })
      if (res.success) {
        setShowModal(false)
        resetForm()
        loadData()
      }
    } else {
      const res = await createDiet({
        athleteId: selectedAthlete,
        coachId: user!.id,
        title,
        weeklyPlan: JSON.stringify(weeklyPlan),
        date: new Date()
      })
      if (res.success) {
        setShowModal(false)
        resetForm()
        loadData()
      }
    }
    setIsSubmitting(false)
  }

  const resetForm = () => {
    setSelectedAthlete("")
    setTitle("")
    setDuration("60 min")
    setExercises([{ name: "", sets: 3, reps: "10", notes: "" }])
    setWeeklyPlan(DAYS_OF_WEEK.reduce((acc, day) => ({ ...acc, [day]: { breakfast: "", lunch: "", dinner: "", snacks: "" } }), {}))
    setActiveDay("Lunes")
  }

  const top10Athletes = [...athletes].slice(0, 10)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="page-title">Panel de Entrenador</h1>
            {coachProfile?.attendances && (
              <span className="bg-warning/20 text-warning px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-sm border border-warning/30">
                🔥 Racha: {coachProfile.attendances.length} Días
              </span>
            )}
          </div>
          <p className="text-muted-foreground mt-1">
            Gestiona las rutinas y dietas de tus atletas asignados.
          </p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setShowQRModal(true)}
            className="bg-transparent border-2 border-primary text-primary hover:bg-primary/10 px-4 py-2 rounded-lg font-bold transition flex items-center gap-2"
          >
            Mi Código QR
          </button>
          <button 
            onClick={() => handleOpenAssignment()}
            className="bg-transparent border-2 border-primary text-primary hover:bg-primary/10 px-4 py-2 rounded-lg font-bold transition flex items-center gap-2"
          >
            <FileEdit className="h-4 w-4" />
            Asignar Rutinas
          </button>
        </div>
      </div>

      {/* KPI Module */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="shadow-none border border-black/10 dark:border-white/10 rounded-xl bg-transparent">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex justify-between items-center">
              Atletas Asignados
              <Link href="/atletas" className="p-1 hover:bg-primary/20 hover:text-primary rounded transition" title="Ver Lista Completa">
                <Eye className="w-4 h-4" />
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black">{athletes.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Total bajo tu supervisión</p>
          </CardContent>
        </Card>
      </div>

      {/* Módulo Compacto de Recepción / Escáner QR para Entrenadores Autorizados (Sin Facturación ni Caja) */}
      {canReceiveAthletes && (
        <div className="flex justify-center mb-6">
          <Card className="w-full max-w-lg rounded-3xl border-2 border-primary/30 bg-card p-6 sm:p-7 shadow-xl relative overflow-hidden text-center space-y-5">
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-48 h-48 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

            <div className="space-y-2 relative z-10">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-500 text-[11px] font-black uppercase tracking-wider mb-1">
                <ScanLine className="w-3.5 h-3.5" /> Permiso de Recepción Activo
              </div>
              <div className="w-14 h-14 mx-auto rounded-2xl bg-primary/10 border-2 border-primary/30 flex items-center justify-center text-primary shadow-inner">
                <QrCode className="h-7 w-7 text-primary" />
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
                Recepcionar Atleta (Acceso QR)
              </h2>
              <p className="text-xs text-muted-foreground max-w-xs mx-auto leading-relaxed">
                Escanea el código QR del atleta para validar su entrada en 1 toque. (Solo control de asistencia, sin acceso a caja ni facturación).
              </p>
            </div>

            <div className="space-y-3.5 relative z-10">
              <button
                type="button"
                onClick={() => setShowScanner(true)}
                className="w-full border-2 border-primary text-primary hover:bg-primary/10 rounded-2xl py-3.5 px-4 font-bold flex items-center justify-center gap-2.5 transition shadow-sm group text-sm sm:text-base cursor-pointer"
              >
                <Camera className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
                Escanear Código QR
              </button>

              <div className="relative flex items-center justify-center py-0.5">
                <div className="border-t border-black/10 dark:border-white/10 w-full" />
                <span className="bg-card px-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground whitespace-nowrap">
                  O ingreso por cédula
                </span>
                <div className="border-t border-black/10 dark:border-white/10 w-full" />
              </div>

              <form onSubmit={handleUniversalCheckIn} className="space-y-2.5">
                <input
                  type="text"
                  placeholder="Escribe la cédula para recepcionar..."
                  value={universalSearch}
                  onChange={(e) => setUniversalSearch(e.target.value)}
                  className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-2xl p-3 text-center text-sm font-mono focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition"
                />

                <button
                  type="submit"
                  className="w-full border-2 border-primary text-primary hover:bg-primary/10 rounded-2xl py-3 px-4 font-bold flex items-center justify-center gap-2 transition shadow-sm text-sm cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  Recepcionar por Cédula
                </button>
              </form>
            </div>
          </Card>
        </div>
      )}

      {/* Top 10 Nuevos Atletas */}
      <Card className="shadow-none border border-black/10 dark:border-white/10 rounded-xl bg-transparent mb-6 card-gold-gradient relative overflow-hidden">
        <div className="absolute top-0 left-0 w-2 h-full bg-primary" />
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-xl flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Tus Nuevos Atletas (Top 10)
          </CardTitle>
          <button 
            onClick={() => setShowTopAthletes(!showTopAthletes)}
            className="bg-transparent border border-primary text-primary hover:bg-primary/10 px-3 py-1.5 rounded-lg text-sm font-medium transition flex items-center gap-2"
          >
            {showTopAthletes ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {showTopAthletes ? 'Ocultar' : 'Mostrar'}
          </button>
        </CardHeader>
        <CardContent>
          {!showTopAthletes ? (
            <p className="text-muted-foreground text-sm italic">Lista de atletas oculta.</p>
          ) : isLoading ? (
            <div className="py-8 flex justify-center">
              <Loader size={40} text="Cargando atletas..." />
            </div>
          ) : top10Athletes.length === 0 ? (
            <p className="text-muted-foreground text-sm">Aún no tienes atletas asignados.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {top10Athletes.map((athlete) => (
                <div key={athlete.id} className="p-4 border border-black/10 dark:border-white/10 rounded-xl bg-card dark:bg-black/20 flex flex-col gap-3 transition hover:border-primary/50">
                  <div className="flex items-center gap-3">
                    {athlete.profilePicture ? (
                      <img src={athlete.profilePicture} alt={athlete.name} className="w-10 h-10 rounded-full object-cover border border-primary/20" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-lg shrink-0">
                        {athlete.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="flex flex-col">
                      <span className="font-bold text-base leading-tight">{athlete.name}</span>
                      <span className="text-xs text-muted-foreground">C.I: {athlete.cedula}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-auto pt-2">
                    <Link href={`/atletas/${athlete.id}`} className="flex-1 flex items-center justify-center bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-foreground text-xs font-bold py-2 rounded-lg transition border border-transparent">
                      Ver Perfil
                    </Link>
                    <button 
                      onClick={() => handleOpenAssignment(athlete.id)}
                      className="flex-[2] flex items-center justify-center gap-1 bg-primary hover:bg-primary/90 text-black text-xs font-bold py-2 rounded-lg transition"
                    >
                      <Dumbbell className="w-3 h-3" /> Entrenar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      
      

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Atletas / Rutinas */}
        <Card className="col-span-1 shadow-none border border-black/10 dark:border-white/10 rounded-xl bg-transparent">
          <CardHeader>
            <CardTitle className="text-lg">Últimas Rutinas Asignadas</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="py-8 flex justify-center">
                <Loader size={36} text="Cargando rutinas..." />
              </div>
            ) : routines.length === 0 ? (
              <p className="text-muted-foreground text-sm">No has asignado rutinas recientemente.</p>
            ) : (
              <div className="space-y-4">
                {routines.map((routine) => (
                  <div key={routine.id} className="p-4 border border-black/10 dark:border-white/10 rounded-xl bg-card dark:bg-black/20 flex flex-col gap-1">
                    <div className="flex justify-between items-start">
                      <span className="font-bold text-primary">{routine.athlete?.name}</span>
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-xs text-muted-foreground">{new Date(routine.createdAt).toLocaleDateString()}</span>
                        {routine.completed ? (
                          <span className="text-[10px] font-bold bg-success/20 text-success px-2 py-0.5 rounded-full flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/> Completada</span>
                        ) : (
                          <span className="text-[10px] font-bold bg-warning/20 text-warning px-2 py-0.5 rounded-full">Pendiente</span>
                        )}
                      </div>
                    </div>
                    {!routine.completed && routine.exercises && routine.exercises.length > 0 && (
                      <div className="mt-2 space-y-1 bg-black/5 dark:bg-black/40 p-2 rounded-lg">
                        <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Estado de los Ejercicios:</p>
                        {routine.exercises.map((ex: any) => (
                          <div key={ex.id || ex.name} className="flex justify-between items-center text-xs">
                            <span className={ex.completed ? 'line-through text-muted-foreground' : 'text-foreground font-medium'}>
                              {ex.name} ({ex.sets}x{ex.reps})
                            </span>
                            {ex.completed ? <CheckCircle2 className="w-3 h-3 text-success" /> : <div className="w-2 h-2 rounded-full bg-warning/50"></div>}
                          </div>
                        ))}
                      </div>
                    )}
                    <span className="text-sm font-medium">{routine.title}</span>
                    <span className="text-xs text-muted-foreground">{routine.exercises?.length} ejercicios • {routine.duration}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Dietas */}
        <Card className="col-span-1 shadow-none border border-black/10 dark:border-white/10 rounded-xl bg-transparent">
          <CardHeader>
            <CardTitle className="text-lg">Últimas Dietas Semanales Asignadas</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="py-8 flex justify-center">
                <Loader size={36} text="Cargando dietas..." />
              </div>
            ) : diets.length === 0 ? (
              <p className="text-muted-foreground text-sm">No has asignado dietas recientemente.</p>
            ) : (
              <div className="space-y-4">
                {diets.map((diet) => (
                  <div key={diet.id} className="p-4 border border-black/10 dark:border-white/10 rounded-xl bg-card dark:bg-black/20 flex flex-col gap-1">
                    <div className="flex justify-between items-start">
                      <span className="font-bold text-primary">{diet.athlete?.name}</span>
                      <span className="text-xs text-muted-foreground">{new Date(diet.createdAt).toLocaleDateString()}</span>
                    </div>
                    <span className="text-sm font-medium">{diet.title}</span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                      <CalendarDays className="w-3 h-3"/> Plan Semanal Interactivo
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      
      {showQRModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm" onClick={() => setShowQRModal(false)}>
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full flex flex-col items-center shadow-2xl" onClick={e => e.stopPropagation()}>
            <h3 className="text-2xl font-black text-black mb-1 text-center">Tu Código de Acceso</h3>
            <p className="text-gray-500 text-xs mb-4 text-center">Muéstralo en recepción para registrar tu asistencia.</p>

            <div className="w-full flex items-center justify-between text-[11px] font-bold text-zinc-700 mb-2 pb-1.5 border-b border-zinc-200">
              <span className="flex items-center gap-1.5 text-emerald-600">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Código Dinámico en Vivo</span>
              </span>
              <span className="font-mono text-zinc-600 font-bold bg-zinc-100 px-2 py-0.5 rounded-md">
                {qrSecondsLeft}s
              </span>
            </div>
            
            <div className="bg-white p-3 rounded-xl shadow-inner border-2 border-dashed border-gray-200 mb-3">
              <QRCodeSVG value={dynamicQrToken || user?.cedula || ''} size={200} level="H" includeMargin={true} />
            </div>

            <div className="w-full h-1.5 bg-zinc-200 rounded-full overflow-hidden mb-3">
              <div 
                className="h-full bg-primary transition-all duration-1000 ease-linear rounded-full"
                style={{ width: `${Math.max(0, Math.min(100, (qrSecondsLeft / 60) * 100))}%` }}
              />
            </div>
            
            <p className="text-xl font-bold text-black tracking-widest mb-4 border-b-2 border-primary pb-1 font-mono">{user?.cedula}</p>
            
            <button onClick={() => setShowQRModal(false)} className="w-full bg-black text-white font-bold py-3 rounded-xl hover:bg-gray-800 transition">
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* Modal Escáner QR para Recepcionar Atletas */}
      {showScanner && (
        <QRScanner
          onScan={(code) => handleUniversalCheckIn(undefined, code)}
          onClose={() => setShowScanner(false)}
        />
      )}

      {showModal && (
        <RoutineAssignmentModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          coachId={user!.id}
          athletes={athletes}
          defaultAthleteId={selectedAthlete}
          onSuccess={() => {
            setShowModal(false);
            loadData();
          }}
        />
      )}
    </div>
  )
}
