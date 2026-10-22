"use client"

import { useState, useEffect, useMemo } from "react"
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
  Cake,
  Sparkles,
} from "lucide-react"
import Link from "next/link"
import { QRScanner } from "@/components/qr-scanner"
import { Loader } from "@/components/ui/loader"
import Swal from "sweetalert2"

export function ReceptionDashboard() {
  const { user } = useAuth()
  const [pendingOrders, setPendingOrders] = useState<any[]>([])
  const [showScanner, setShowScanner] = useState(false)
  const [cashSession, setCashSession] = useState<any>(null)
  const [isLoadingSession, setIsLoadingSession] = useState(true)
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
  const [athletes, setAthletes] = useState<any[]>([])

  // Cargar pedidos pendientes de tienda
  const fetchPendingOrders = () => {
    import("@/app/actions/store").then(({ getPendingTransactions }) => {
      getPendingTransactions().then((res) => {
        if (res.success) setPendingOrders(res.transactions)
      })
    })
  }

  // Cargar asistencias, ventas del día y directorio de atletas
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

      const { getAthletes } = await import("@/app/actions/users")
      const athRes = await getAthletes()
      if (athRes.success) {
        setAthletes(athRes.athletes || [])
      }
    } catch (e) {
      console.error("Error al cargar asistencias y ventas de hoy:", e)
    } finally {
      setIsLoadingTodayData(false)
      setIsRefreshing(false)
    }
  }

  // Cumpleañeros de hoy (mes y día coinciden)
  const todayBirthdays = useMemo(() => {
    const today = new Date()
    const m = today.getMonth() + 1
    const d = today.getDate()
    return athletes.filter((a) => {
      if (!a.birthDate) return false
      const parts = a.birthDate.split("-").map(Number)
      if (parts.length < 3) return false
      return parts[1] === m && parts[2] === d
    })
  }, [athletes])

  // Membresías próximas a vencer (en 3 días o menos)
  const expiringMemberships = useMemo(() => {
    const now = new Date()
    return athletes.filter((a) => {
      const end = a.memberships?.[0]?.endDate
      if (!end) return false
      const diffDays = Math.ceil((new Date(end).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      return diffDays >= 0 && diffDays <= 3
    })
  }, [athletes])

  const handleManualRefresh = () => {
    setIsRefreshing(true)
    fetchPendingOrders()
    fetchTodayData()
  }

  useEffect(() => {
    fetchPendingOrders()
    fetchTodayData()

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
    const targetCode = (code || universalSearch).trim()
    if (!targetCode) return

    const { swalTheme, themeColor } = await import("@/lib/confirm")
    const theme = swalTheme()

    let managerOrAdminKey: string | undefined = undefined

    // Si el registro es manual por cédula (no por escáner QR directo), solicitar clave o PIN generado de Gerente / Administrador
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
      Swal.fire({
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 3500,
        timerProgressBar: true,
        icon: "success",
        title: `✅ Entrada: ${res.user?.name} (${res.user?.role === 'athlete' ? 'Atleta' : 'Empleado'})`,
        text: res.authorizedBy ? `Autorizado por: ${res.authorizedBy}` : undefined,
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
        title: "No se pudo recepcionar",
        text: res.error || "Error al procesar la entrada",
        icon: "error",
        ...theme,
        confirmButtonColor: themeColor("destructive") || "#ef4444",
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
            className="p-2.5 rounded-xl border-2 border-primary/40 hover:border-primary text-primary hover:bg-primary/10 transition shadow-sm cursor-pointer"
            title="Refrescar datos en vivo"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
          </button>

          <Link
            href="/tienda"
            className="border-2 border-primary text-primary hover:bg-primary/10 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold shadow-sm transition flex items-center gap-2"
          >
            <Store className="h-4 w-4" />
            Punto de Venta
          </Link>

          <Link
            href="/asistencia"
            className="border-2 border-primary/50 text-foreground hover:border-primary hover:bg-primary/10 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold shadow-sm transition flex items-center gap-2"
          >
            <ClipboardCheck className="h-4 w-4 text-primary" />
            Asistencia General
          </Link>

          <Link
            href="/registro"
            className="border-2 border-emerald-500/50 text-foreground hover:border-emerald-500 hover:bg-emerald-500/10 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold shadow-sm transition flex items-center gap-2"
          >
            <Users className="h-4 w-4 text-emerald-500" />
            Nuevo Atleta
          </Link>

          <Link
            href="/membresias"
            className="border-2 border-amber-500/50 text-foreground hover:border-amber-500 hover:bg-amber-500/10 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold shadow-sm transition flex items-center gap-2"
          >
            <CreditCard className="h-4 w-4 text-amber-500" />
            <span>Membresías</span>
            {expiringMemberships.length > 0 && (
              <span className="text-[10px] font-black px-1.5 py-0.2 rounded-full bg-amber-500 text-black">
                {expiringMemberships.length} por vencer
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* Banner de Cumpleañeros del Día (si hay) */}
      {todayBirthdays.length > 0 && (
        <div className="bg-gradient-to-r from-amber-500/15 via-yellow-500/10 to-amber-500/15 border border-amber-500/30 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-500 shrink-0">
              <Cake className="w-6 h-6 animate-bounce" />
            </div>
            <div>
              <h4 className="font-black text-sm text-foreground flex items-center gap-1.5">
                <span>¡Cumpleañeros de Hoy!</span>
                <Sparkles className="w-4 h-4 text-amber-500" />
              </h4>
              <p className="text-xs text-muted-foreground mt-0.5">
                {todayBirthdays.map((b: any) => `${b.name} (C.I. ${b.cedula})`).join(", ")}
              </p>
            </div>
          </div>
          <span className="text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20 whitespace-nowrap">
            ¡Felicítalos en recepción! 🎂
          </span>
        </div>
      )}

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

      {/* Recepcionar un Atleta o Empleado (Card Cuadrado, Elegante y Compacto) */}
      <div className="flex justify-center">
        <Card className="w-full max-w-lg rounded-3xl border-2 border-primary/30 bg-card p-6 sm:p-8 shadow-xl relative overflow-hidden text-center space-y-6">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-48 h-48 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

          <div className="space-y-2 relative z-10">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-primary/10 border-2 border-primary/30 flex items-center justify-center text-primary shadow-inner">
              <QrCode className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
              Recepcionar un Atleta o Empleado
            </h2>
            <p className="text-xs text-muted-foreground max-w-xs mx-auto leading-relaxed">
              Escanea el código QR personal o ingresa la cédula con la clave autorizada de Gerente / Administrador.
            </p>
          </div>

          <div className="space-y-4 relative z-10">
            {/* Botón Principal: Escanear QR (Outline) */}
            <button
              type="button"
              onClick={() => setShowScanner(true)}
              className="w-full border-2 border-primary text-primary hover:bg-primary/10 rounded-2xl py-3.5 px-4 font-bold flex items-center justify-center gap-2.5 transition shadow-sm group text-sm sm:text-base cursor-pointer"
            >
              <Camera className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
              Escanear Código QR
            </button>

            <div className="relative flex items-center justify-center py-1">
              <div className="border-t border-black/10 dark:border-white/10 w-full" />
              <span className="bg-card px-3 text-[11px] font-bold uppercase tracking-wider text-muted-foreground whitespace-nowrap">
                O ingreso por cédula
              </span>
              <div className="border-t border-black/10 dark:border-white/10 w-full" />
            </div>

            {/* Formulario de Entrada por Cédula */}
            <form onSubmit={handleUniversalCheckIn} className="space-y-3">
              <input
                type="text"
                placeholder="Escribe la cédula para recepcionar..."
                value={universalSearch}
                onChange={(e) => setUniversalSearch(e.target.value)}
                className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-2xl p-3.5 text-center text-base font-mono focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition"
              />

              <button
                type="submit"
                className="w-full border-2 border-primary text-primary hover:bg-primary/10 rounded-2xl py-3.5 px-4 font-bold flex items-center justify-center gap-2.5 transition shadow-sm text-sm sm:text-base cursor-pointer"
              >
                <CheckCircle2 className="w-5 h-5 text-primary" />
                Recepcionar por Cédula
              </button>
            </form>

            <p className="text-[11px] text-muted-foreground flex items-center justify-center gap-1.5 pt-1">
              <span className="text-amber-500 font-bold">🔐</span>
              <span>El ingreso por cédula solicita la clave o PIN de Gerente / Administrador</span>
            </p>
          </div>
        </Card>
      </div>

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
                      : person?.role === "coach" || person?.role === "employee"
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

