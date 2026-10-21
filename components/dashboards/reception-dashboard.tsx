"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Users,
  Store,
  QrCode,
  ClipboardCheck,
  Wallet,
  Camera,
  Package,
  DollarSign,
  Clock,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  RefreshCw,
  ShoppingBag,
} from "lucide-react"
import { athleteService, AthleteProfile, dataService } from "@/lib/data-service"
import Link from "next/link"
import { QRScanner } from "@/components/qr-scanner"
import { Loader } from "@/components/ui/loader"
import Swal from "sweetalert2"

export function ReceptionDashboard() {
  const { user } = useAuth()
  const [athletes, setAthletes] = useState<AthleteProfile[]>([])
  const [search, setSearch] = useState("")
  const [pendingOrders, setPendingOrders] = useState<any[]>([])
  const [showScanner, setShowScanner] = useState(false)
  const [cashSession, setCashSession] = useState<any>(null)
  const [isLoadingSession, setIsLoadingSession] = useState(true)
  const [checkedInIds, setCheckedInIds] = useState<Record<string, boolean>>({})
  const [universalSearch, setUniversalSearch] = useState("")

  // Estados para Historial en Vivo de Asistencias y Ventas
  const [todayAttendances, setTodayAttendances] = useState<any[]>([])
  const [todaySales, setTodaySales] = useState<any[]>([])
  const [todayStats, setTodayStats] = useState({
    totalAttendance: 0,
    totalSalesAmount: 0,
    totalSalesCount: 0,
  })
  const [isLoadingTodayData, setIsLoadingTodayData] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Cargar pedidos pendientes de tienda
  const fetchPendingOrders = () => {
    import("@/app/actions/store").then(({ getPendingTransactions }) => {
      getPendingTransactions().then((res) => {
        if (res.success) setPendingOrders(res.transactions)
      })
    })
  }

  // Cargar asistencias y ventas del día
  const fetchTodayData = async () => {
    try {
      const { getTodayAttendanceAndSalesAction } = await import("@/app/actions/attendance")
      const res = await getTodayAttendanceAndSalesAction()
      if (res.success) {
        setTodayAttendances(res.attendances || [])
        setTodaySales(res.todaySales || [])
        setTodayStats({
          totalAttendance: res.totalAttendanceCount || 0,
          totalSalesAmount: res.totalSalesAmount || 0,
          totalSalesCount: res.totalSalesCount || 0,
        })
      }
    } catch (e) {
      console.error("Error al cargar asistencias y ventas de hoy:", e)
    } finally {
      setIsLoadingTodayData(false)
      setIsRefreshing(false)
    }
  }

  const handleManualRefresh = () => {
    setIsRefreshing(true)
    fetchPendingOrders()
    fetchTodayData()
  }

  useEffect(() => {
    fetchPendingOrders()
    fetchTodayData()
    setAthletes(athleteService.getAthletes())

    // Consultar turno de caja activo
    if (user?.id) {
      import("@/app/actions/cash").then(({ getCurrentCashSession }) => {
        getCurrentCashSession(user.id).then((res) => {
          if (res.success) setCashSession(res.session)
          setIsLoadingSession(false)
        })
      })
    }

    const interval = setInterval(() => {
      fetchPendingOrders()
      fetchTodayData()
    }, 25000)
    return () => clearInterval(interval)
  }, [user?.id])

  const handleUniversalCheckIn = async (e?: React.FormEvent, code?: string) => {
    if (e) e.preventDefault()
    const targetCode = code || universalSearch
    if (!targetCode) return

    const { checkInByCedula } = await import("@/app/actions/attendance")
    const res = await checkInByCedula(targetCode)
    const { swalTheme } = await import("@/lib/confirm")
    const theme = swalTheme()

    if (res.success) {
      Swal.fire({
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        icon: "success",
        title: `✅ Entrada: ${res.user?.name} (${res.user?.role})`,
        ...theme,
        customClass: {
          popup: "border border-black/10 dark:border-white/10 rounded-xl shadow-xl glass",
        },
      })
      setUniversalSearch("")
      setShowScanner(false)
      fetchTodayData()
    } else {
      Swal.fire({
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 3500,
        timerProgressBar: true,
        icon: "error",
        title: res.error,
        ...theme,
        customClass: {
          popup: "border border-destructive/30 rounded-xl shadow-xl glass",
        },
      })
    }
  }

  const handleOpenSession = async () => {
    const { value: startingCash } = await Swal.fire({
      title: "Abrir Turno de Caja",
      input: "number",
      inputLabel: "¿Con cuánto efectivo en físico estás abriendo la caja?",
      inputPlaceholder: "Monto base. Ej: 50",
      showCancelButton: true,
      inputValidator: (value) => {
        if (!value) return "Debes ingresar un monto."
      },
    })

    if (startingCash && user?.id) {
      const { openCashSession } = await import("@/app/actions/cash")
      const res = await openCashSession(user.id, Number(startingCash))
      if (res.success) {
        setCashSession(res.session)
        Swal.fire("Turno Abierto", "Ya puedes empezar a facturar en el Punto de Venta.", "success")
      } else {
        Swal.fire("Error", res.error, "error")
      }
    }
  }

  const handleCloseSession = async () => {
    const { value: declaredCash } = await Swal.fire({
      title: "Cerrar Turno de Caja",
      input: "number",
      inputLabel: "¿Cuánto efectivo EXACTO tienes en caja física ahora mismo?",
      inputPlaceholder: "Efectivo declarado",
      showCancelButton: true,
      inputValidator: (value) => {
        if (!value) return "Debes declarar el efectivo físico."
      },
    })

    if (declaredCash && cashSession?.id) {
      const { closeCashSession } = await import("@/app/actions/cash")
      const res = await closeCashSession(cashSession.id, Number(declaredCash))

      if (res.success) {
        setCashSession(null)
        const diff = Number(declaredCash) - (res.session?.expectedCash ?? 0)
        const diffText =
          diff === 0
            ? '<b class="text-success">¡Caja Cuadrada Perfectamente!</b>'
            : diff > 0
            ? `<b class="text-warning">Sobrante de Caja: +$${diff.toFixed(2)}</b>`
            : `<b class="text-destructive">Faltante de Caja: -$${Math.abs(diff).toFixed(2)}</b>`

        Swal.fire({
          title: "Turno Cerrado (Arqueo)",
          html: `
            Resumen del Turno:<br/>
            Efectivo Esperado: $${(res.session?.expectedCash ?? 0).toFixed(2)}<br/>
            Efectivo Declarado: $${Number(declaredCash).toFixed(2)}<br/><br/>
            ${diffText}
          `,
          icon: diff < 0 ? "warning" : "success",
        })
      } else {
        Swal.fire("Error", res.error, "error")
      }
    }
  }

  const handleCheckIn = (id: string) => {
    const routines = dataService.getRoutines()
    const today = new Date().toISOString().split("T")[0]
    const activeRoutine = routines.find((r) => r.athleteId === id && r.date === today)

    if (activeRoutine) {
      dataService.verifyByCoach(activeRoutine.id)
    }

    setCheckedInIds((prev) => ({ ...prev, [id]: true }))
    import("sweetalert2").then((Swal) => {
      Swal.default.fire({
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
        icon: "success",
        title: "Entrada registrada exitosamente",
      })
    })
    fetchTodayData()
  }

  const filteredAthletes = athletes.filter(
    (a) => a.name.toLowerCase().includes(search.toLowerCase()) || a.cedula.includes(search)
  )

  return (
    <div className="space-y-6">
      {/* Encabezado y Accesos Directos */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Panel de Recepción & Caja</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Control de asistencia, ventas en tiempo real, registro de atletas y gestión de turno.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="p-2 rounded-xl border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 text-muted-foreground hover:text-foreground transition shadow-sm"
            title="Refrescar datos en vivo"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
          </button>

          <Link
            href="/tienda"
            className="bg-primary text-primary-foreground px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold shadow-md hover:bg-primary/90 transition flex items-center gap-2"
          >
            <Store className="h-4 w-4" />
            Punto de Venta
          </Link>

          <Link
            href="/asistencia"
            className="bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-foreground px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold shadow-sm hover:bg-black/10 dark:hover:bg-white/10 transition flex items-center gap-2"
          >
            <ClipboardCheck className="h-4 w-4 text-primary" />
            Asistencia General
          </Link>

          <Link
            href="/registro"
            className="bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-foreground px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold shadow-sm hover:bg-black/10 dark:hover:bg-white/10 transition flex items-center gap-2"
          >
            <Users className="h-4 w-4 text-emerald-500" />
            Nuevo Atleta
          </Link>

          <Link
            href="/membresias"
            className="bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-foreground px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold shadow-sm hover:bg-black/10 dark:hover:bg-white/10 transition flex items-center gap-2"
          >
            <CreditCard className="h-4 w-4 text-amber-500" />
            Membresías
          </Link>
        </div>
      </div>

      {/* Tarjetas Resumen de Operaciones del Día */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Estado de Turno de Caja */}
        <div
          className={`p-5 rounded-2xl border shadow-sm flex flex-col justify-between ${
            cashSession ? "bg-emerald-500/10 border-emerald-500/30" : "bg-destructive/10 border-destructive/30"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Estado de Caja</span>
            <Wallet className={`h-5 w-5 ${cashSession ? "text-emerald-500" : "text-destructive"}`} />
          </div>
          <div className="my-2">
            <h3 className="text-xl font-black">
              {cashSession ? (
                <span className="text-emerald-600 dark:text-emerald-400">TURNO ABIERTO</span>
              ) : (
                <span className="text-destructive">TURNO CERRADO</span>
              )}
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {cashSession
                ? `Inicio: ${new Date(cashSession.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} • Base: $${cashSession.startingCash.toFixed(2)}`
                : "Abre turno para facturar en caja"}
            </p>
          </div>
          <button
            onClick={cashSession ? handleCloseSession : handleOpenSession}
            className={`w-full py-2 rounded-xl text-xs font-bold text-white shadow transition mt-1 ${
              cashSession ? "bg-red-500 hover:bg-red-600" : "bg-emerald-600 hover:bg-emerald-700"
            }`}
          >
            {cashSession ? "Cerrar Turno (Arqueo)" : "Abrir Turno de Caja"}
          </button>
        </div>

        {/* Total Entradas de Hoy */}
        <div className="p-5 rounded-2xl border border-black/10 dark:border-white/10 bg-card shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Entradas Hoy</span>
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="my-2">
            <h3 className="text-3xl font-black text-foreground">{todayStats.totalAttendance}</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Personas que han ingresado hoy</p>
          </div>
          <span className="text-[11px] font-semibold text-emerald-500 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Registro en vivo
          </span>
        </div>

        {/* Total Ventas de Hoy */}
        <div className="p-5 rounded-2xl border border-black/10 dark:border-white/10 bg-card shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Ventas de Hoy</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <div className="my-2">
            <h3 className="text-3xl font-black text-foreground">${todayStats.totalSalesAmount.toFixed(2)}</h3>
            <p className="text-xs text-muted-foreground mt-0.5">{todayStats.totalSalesCount} transacciones procesadas</p>
          </div>
          <Link href="/tienda" className="text-[11px] font-bold text-primary hover:underline">
            Ir a facturación →
          </Link>
        </div>

        {/* Pedidos por Despachar */}
        <div className="p-5 rounded-2xl border border-black/10 dark:border-white/10 bg-card shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Por Entregar (Tienda)</span>
            <div className="p-2 rounded-xl bg-orange-500/10 text-orange-500">
              <Package className="h-4 w-4" />
            </div>
          </div>
          <div className="my-2">
            <h3 className="text-3xl font-black text-foreground">{pendingOrders.length}</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Pedidos pagados esperando retiro</p>
          </div>
          <span className="text-[11px] font-semibold text-muted-foreground">
            {pendingOrders.length > 0 ? "Requiere código de retiro" : "Sin pedidos pendientes"}
          </span>
        </div>
      </div>

      {/* Reloj Checador Principal (Staff y Atletas) */}
      <Card className="border-primary/50 shadow-lg shadow-primary/10 overflow-hidden">
        <CardHeader className="bg-primary/5 border-b border-primary/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <CardTitle className="text-lg font-black flex items-center gap-2">
              <QrCode className="h-5 w-5 text-primary" /> Reloj Checador (Acceso Rápido)
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              Escanea el código QR o escribe la cédula para validar entrada de atletas y empleados.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowScanner(true)}
            className="bg-primary text-white font-bold px-4 py-2 rounded-xl flex items-center justify-center gap-2 hover:bg-primary/90 transition shadow-sm text-sm"
          >
            <Camera className="h-4 w-4" /> Escanear Código QR
          </button>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleUniversalCheckIn} className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="Escribe la Cédula para registrar entrada..."
              value={universalSearch}
              onChange={(e) => setUniversalSearch(e.target.value)}
              className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-xl p-3.5 text-base sm:text-lg focus:outline-none focus:ring-2 focus:ring-primary font-mono text-center"
              autoFocus
            />
            <button
              type="submit"
              className="bg-primary text-white font-black px-8 py-3.5 rounded-xl shadow hover:bg-primary/90 transition text-sm sm:text-base whitespace-nowrap cursor-pointer"
            >
              Marcar Entrada
            </button>
          </form>
        </CardContent>
      </Card>

      {/* Grid de 2 Columnas: Historial de Asistencias de Hoy vs Ventas y Despacho */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Columna 1: Historial de Entrada y Salida de Hoy */}
        <Card className="rounded-3xl border border-black/10 dark:border-white/10 shadow-sm overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-black/5 dark:border-white/5">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              <div>
                <CardTitle className="text-base font-black">Historial de Entrada (Hoy)</CardTitle>
                <p className="text-xs text-muted-foreground">Últimos ingresos registrados en el día</p>
              </div>
            </div>
            <span className="text-xs bg-primary/10 text-primary font-extrabold px-2.5 py-1 rounded-full">
              {todayAttendances.length} registros
            </span>
          </CardHeader>
          <CardContent className="pt-4 p-0">
            {isLoadingTodayData ? (
              <div className="py-12 flex justify-center items-center">
                <Loader size={36} text="Cargando ingresos de hoy..." />
              </div>
            ) : todayAttendances.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground space-y-2 p-6">
                <Clock className="w-10 h-10 mx-auto opacity-30 text-primary" />
                <p className="font-bold text-sm">Aún no hay ingresos registrados hoy.</p>
                <p className="text-xs">Usa el Reloj Checador superior o la búsqueda manual para registrar accesos.</p>
              </div>
            ) : (
              <div className="divide-y divide-black/5 dark:divide-white/5 max-h-[460px] overflow-y-auto custom-scrollbar">
                {todayAttendances.map((att: any) => {
                  const person = att.user
                  const roleLabel =
                    person?.role === "athlete"
                      ? "Atleta"
                      : person?.role === "coach"
                      ? "Entrenador"
                      : "Staff / Empleado"
                  const membershipEnd = person?.memberships?.[0]?.endDate
                  const isExpired = membershipEnd ? new Date(membershipEnd) < new Date() : false

                  return (
                    <div key={att.id} className="p-3.5 sm:px-5 flex items-center justify-between gap-3 hover:bg-black/5 dark:hover:bg-white/5 transition">
                      <div className="flex items-center gap-3 min-w-0">
                        {person?.profilePicture ? (
                          <img
                            src={person.profilePicture}
                            alt={person.name}
                            className="w-10 h-10 rounded-full object-cover border border-primary/40 shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-primary/20 text-primary font-black flex items-center justify-center text-xs border border-primary/30 shrink-0">
                            {person?.name?.slice(0, 2).toUpperCase() || "AT"}
                          </div>
                        )}
                        <div className="min-w-0">
                          <h4 className="font-bold text-sm text-foreground truncate">{person?.name}</h4>
                          <p className="text-xs text-muted-foreground flex items-center gap-2">
                            <span>C.I. {person?.cedula}</span>
                            <span>•</span>
                            <span className="font-semibold text-primary">{roleLabel}</span>
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-xs font-mono font-bold text-foreground block">
                          {new Date(att.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                        </span>
                        {person?.role === "athlete" && (
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase inline-block mt-0.5 ${
                              isExpired
                                ? "bg-destructive/15 text-destructive"
                                : "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                            }`}
                          >
                            {isExpired ? "Vencida" : "Activa"}
                          </span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Columna 2: Ventas y Despacho del Turno */}
        <div className="space-y-6">
          {/* Pedidos en Espera (Tienda) */}
          <Card className="rounded-3xl border border-black/10 dark:border-white/10 shadow-sm overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-black/5 dark:border-white/5 bg-warning/5">
              <CardTitle className="text-base font-black flex items-center gap-2">
                <Package className="h-5 w-5 text-warning" />
                Pedidos en Espera (Retiro en Tienda)
              </CardTitle>
              <span className="text-xs font-bold bg-warning/20 text-warning px-2 py-0.5 rounded-full">
                {pendingOrders.length} pendientes
              </span>
            </CardHeader>
            <CardContent className="pt-4 p-4">
              {pendingOrders.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">No hay pedidos pendientes de entrega.</p>
              ) : (
                <div className="space-y-3">
                  {pendingOrders.map((tx) => (
                    <div
                      key={tx.id}
                      className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-warning/10 p-3.5 rounded-2xl border border-warning/20"
                    >
                      <div>
                        <div className="flex gap-2 items-center mb-1">
                          <span className="font-mono text-xs font-black bg-white dark:bg-black text-foreground px-2 py-0.5 rounded border border-black/20 shadow-sm">
                            {tx.id.slice(-5).toUpperCase()}
                          </span>
                          <span className="font-bold text-sm">{tx.customer?.name || "Atleta"}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {tx.items?.map((i: any) => `${i.qty}x ${i.name}`).join(", ")}
                        </p>
                        <p className="text-[10px] text-muted-foreground font-bold mt-1">
                          Pago: {tx.paymentMethod} • Total: ${tx.total?.toFixed(2)}
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          Swal.fire({
                            title: "Validar Entrega",
                            text: "Introduce el Código de Retiro que el atleta tiene en su pantalla:",
                            input: "text",
                            inputPlaceholder: "Ej: J3M2N",
                            showCancelButton: true,
                            confirmButtonText: "Validar y Entregar",
                            cancelButtonText: "Cancelar",
                          }).then((result) => {
                            if (result.isConfirmed) {
                              if (result.value?.toUpperCase() === tx.id.slice(-5).toUpperCase()) {
                                import("@/app/actions/store").then(({ deliverTransaction }) => {
                                  deliverTransaction(tx.id, user?.id || "").then((res) => {
                                    if (res.success) {
                                      fetchPendingOrders()
                                      Swal.fire({
                                        title: "Pedido Entregado",
                                        icon: "success",
                                        toast: true,
                                        position: "top-end",
                                        showConfirmButton: false,
                                        timer: 3000,
                                      })
                                    } else {
                                      Swal.fire({
                                        title: "Error",
                                        text: res.error,
                                        icon: "error",
                                        toast: true,
                                        position: "top-end",
                                        showConfirmButton: false,
                                        timer: 3000,
                                      })
                                    }
                                  })
                                })
                              } else {
                                Swal.fire("Error", "El código ingresado es incorrecto.", "error")
                              }
                            }
                          })
                        }}
                        className="bg-orange-500 text-white px-4 py-2 rounded-xl text-xs font-bold shadow hover:bg-orange-600 transition w-full sm:w-auto"
                      >
                        Marcar Entregado
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Últimas Ventas de Hoy */}
          <Card className="rounded-3xl border border-black/10 dark:border-white/10 shadow-sm overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-black/5 dark:border-white/5">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-amber-500" />
                <div>
                  <CardTitle className="text-base font-black">Ventas de Hoy</CardTitle>
                  <p className="text-xs text-muted-foreground">Registro de cobros del día</p>
                </div>
              </div>
              <Link href="/tienda" className="text-xs text-primary font-bold hover:underline">
                Nueva Venta +
              </Link>
            </CardHeader>
            <CardContent className="pt-2 p-0">
              {todaySales.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-6">Aún no hay ventas registradas hoy.</p>
              ) : (
                <div className="divide-y divide-black/5 dark:divide-white/5 max-h-[260px] overflow-y-auto custom-scrollbar">
                  {todaySales.slice(0, 8).map((tx: any) => (
                    <div key={tx.id} className="p-3 px-4 flex items-center justify-between hover:bg-black/5 dark:hover:bg-white/5 transition">
                      <div className="min-w-0">
                        <h5 className="font-bold text-xs text-foreground truncate">
                          {tx.customer?.name || "Cliente General"}
                        </h5>
                        <p className="text-[10px] text-muted-foreground">
                          {tx.paymentMethod} • {tx.items?.length || 1} producto(s)
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="font-black text-xs text-foreground block">${tx.total?.toFixed(2)}</span>
                        <span className="text-[10px] text-muted-foreground font-mono">
                          {new Date(tx.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Control de Acceso Manual de Atletas */}
      <Card className="rounded-3xl border border-black/10 dark:border-white/10 shadow-sm">
        <CardHeader className="pb-3 border-b border-black/5 dark:border-white/5">
          <CardTitle className="text-base font-black flex items-center gap-2">
            <ClipboardCheck className="w-5 h-5 text-primary" /> Control de Acceso Manual (Directorio)
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Busca rápidamente a un atleta por nombre o cédula para verificar su estatus y permitirle el acceso manual.
          </p>
        </CardHeader>
        <CardContent className="pt-4 space-y-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar por Cédula o Nombre para dar entrada manual..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="space-y-2">
            {filteredAthletes.slice(0, 6).map((a) => {
              const isOverdue = new Date(a.membershipEnd) < new Date()
              return (
                <div
                  key={a.id}
                  className="flex justify-between items-center p-3 border border-black/10 dark:border-white/10 rounded-xl bg-card hover:bg-black/5 dark:hover:bg-white/5 transition"
                >
                  <div>
                    <h4 className="font-bold text-sm text-foreground">
                      {a.name} <span className="text-xs text-muted-foreground font-mono">(C.I. {a.cedula})</span>
                    </h4>
                    <p className={`text-xs ${isOverdue ? "text-destructive font-bold" : "text-muted-foreground"}`}>
                      Membresía: {new Date(a.membershipEnd).toLocaleDateString()} {isOverdue && "(VENCIDA)"}
                    </p>
                  </div>
                  <button
                    onClick={() => handleCheckIn(a.id)}
                    disabled={isOverdue || checkedInIds[a.id]}
                    className={`px-4 py-2 text-xs font-bold rounded-xl flex items-center gap-1.5 transition ${
                      isOverdue
                        ? "bg-black/10 dark:bg-white/10 text-muted-foreground cursor-not-allowed"
                        : checkedInIds[a.id]
                        ? "bg-emerald-500 text-white"
                        : "bg-primary/10 text-primary hover:bg-primary hover:text-white"
                    }`}
                  >
                    <ClipboardCheck className="h-4 w-4" />
                    {isOverdue ? "Vencido" : checkedInIds[a.id] ? "Ingresado" : "Dar Entrada"}
                  </button>
                </div>
              )
            })}
            {filteredAthletes.length === 0 && search && (
              <div className="text-center p-6 text-sm text-muted-foreground">
                No se encontró ningún atleta con el criterio especificado.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Modal de Escáner QR */}
      {showScanner && (
        <QRScanner
          onScan={(code) => handleUniversalCheckIn(undefined, code)}
          onClose={() => setShowScanner(false)}
        />
      )}
    </div>
  )
}

