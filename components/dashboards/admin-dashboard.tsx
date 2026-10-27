"use client"

import { Users, TrendingUp, Banknote, AlertCircle, ArrowUpRight, ShoppingCart, Download, FileText, FileSpreadsheet, Calendar, CheckCircle2, X, CalendarDays, Activity, UserMinus, DollarSign, Flame, Clock } from "lucide-react"
import { useState, useEffect } from "react"
import Swal from "sweetalert2"
import { useSettings } from "@/lib/settings-context"
import { Loader } from "@/components/ui/loader"
import { Dialog } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BcvRateBadge } from "@/components/ui/bcv-rate-badge"
import { 
  Area, 
  AreaChart, 
  Bar, 
  BarChart, 
  CartesianGrid, 
  ResponsiveContainer, 
  Tooltip, 
  XAxis, 
  YAxis,
  Cell
} from "recharts"



export function AdminDashboard() {
  const { settings } = useSettings();
  const hoy = new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })
  
  const [storeData, setStoreData] = useState([
    { name: "Lun", ventas: 0, costos: 0 },
    { name: "Mar", ventas: 0, costos: 0 },
    { name: "Mie", ventas: 0, costos: 0 },
    { name: "Jue", ventas: 0, costos: 0 },
    { name: "Vie", ventas: 0, costos: 0 },
    { name: "Sab", ventas: 0, costos: 0 },
    { name: "Dom", ventas: 0, costos: 0 },
  ])

  const [dynamicStats, setDynamicStats] = useState({
    activeAthletes: 0,
    checkinsToday: 0,
    monthlyRevenue: 0,
    churnRate: 0,
    arpu: 0,
    mrr: 0,
    peakHoursData: [] as any[],
    riskAthletes: [] as any[],
    exitoAtletas: [] as any[],
    membresiasPorVencer: [] as any[],
    membresiasNuevas: [] as any[],
    revenueData: [] as any[],
    recentCheckins: [] as any[],
    attendanceData: [] as any[]
  })

  const [coachRequests, setCoachRequests] = useState<any[]>([])
  const [pendingOrders, setPendingOrders] = useState<any[]>([])

  const fetchPendingOrders = () => {
    import('@/app/actions/store').then(({ getPendingTransactions }) => {
      getPendingTransactions().then(res => {
        if (res.success) setPendingOrders(res.transactions)
      })
    })
  }

  useEffect(() => {
    fetchPendingOrders()
    const interval = setInterval(fetchPendingOrders, 30000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const { getTransactions, getProducts } = await import('@/app/actions/store')
        const { getDashboardStats } = await import('@/app/actions/dashboard')
        const { getPendingCoachRequests } = await import('@/app/actions/users')
        
        const [txRes, prodRes, statsRes, reqsRes] = await Promise.all([
          getTransactions(),
          getProducts(),
          getDashboardStats(),
          getPendingCoachRequests()
        ])
        
        if (reqsRes.success) {
          setCoachRequests(reqsRes.requests as any[])
        }
        
        if (statsRes.success) {
          setDynamicStats(statsRes.stats as any)
        }
        
        if (txRes.success && prodRes.success) {
          const txs = txRes.transactions as any[]
          const prods = prodRes.products as any[]
          
          const newData = [
            { name: "Lun", ventas: 0, costos: 0 },
            { name: "Mar", ventas: 0, costos: 0 },
            { name: "Mie", ventas: 0, costos: 0 },
            { name: "Jue", ventas: 0, costos: 0 },
            { name: "Vie", ventas: 0, costos: 0 },
            { name: "Sab", ventas: 0, costos: 0 },
            { name: "Dom", ventas: 0, costos: 0 },
          ]
          
          const now = new Date()
          const currentDayOfWeek = now.getDay()
          const diffToMonday = (currentDayOfWeek === 0 ? -6 : 1) - currentDayOfWeek
          const monday = new Date(now)
          monday.setDate(now.getDate() + diffToMonday)
          monday.setHours(0, 0, 0, 0)
          
          const sunday = new Date(monday)
          sunday.setDate(monday.getDate() + 6)
          sunday.setHours(23, 59, 59, 999)

          txs
            .filter(tx => {
              if (tx.status !== 'COMPLETED') return false
              const txDate = new Date(tx.date)
              return txDate >= monday && txDate <= sunday
            })
            .forEach(tx => {
              const d = new Date(tx.date)
              let day = d.getDay() - 1
              if (day === -1) day = 6 // Sunday
              newData[day].ventas += (Number(tx.total) || 0)
              
              if (Array.isArray(tx.items)) {
                tx.items.forEach((item: any) => {
                  const p = prods.find(pr => pr.id === item.productId)
                  if (p) newData[day].costos += ((p.cost || p.costPrice || 0) * (item.qty || 1))
                })
              }
            })
          
          setStoreData(newData)
        }
      } catch (err) {
        console.error("Error loading dashboard data:", err)
      }
    }
    
    fetchDashboardData()
  }, [])

  const [showReportModal, setShowReportModal] = useState(false)
  const [reportPeriod, setReportPeriod] = useState("Mensual")
  const [reportFormat, setReportFormat] = useState("PDF")
  const [isGenerating, setIsGenerating] = useState(false)

  const handleDownloadReport = async () => {
    setIsGenerating(true)
    try {
      const { exportToPDF, exportToExcel } = await import('@/lib/export-service');
      
      const title = `Resumen de Rendimiento - ${reportPeriod}`;
      const cols = ['Métrica', 'Valor'];
      const pdfData = [
        ['Atletas Activos (Hoy)', (dynamicStats?.activeAthletes || 0).toString()],
        ['Ingresos del Mes', (dynamicStats?.monthlyRevenue || 0).toString()],
        ['Check-ins de Hoy', (dynamicStats?.checkinsToday || 0).toString()],
        ['Membresías por Vencer', (dynamicStats?.membresiasPorVencer?.length || 0).toString()],
        ['Nuevas Membresías', (dynamicStats?.membresiasNuevas?.length || 0).toString()],
        ['Pedidos Tienda Pendientes', (pendingOrders?.length || 0).toString()],
        ['Solicitudes Coach', (coachRequests?.length || 0).toString()]
      ];
      const excelData = pdfData.map(r => ({ 'Métrica': r[0], 'Valor': r[1] }));
      
      const filename = `Reporte_Dashboard_${reportPeriod}`;
      
      if (reportFormat === 'PDF') {
        exportToPDF({
          title,
          columns: cols,
          data: pdfData,
          filename,
          appName: settings?.appName || '',
          logoUrl: settings?.logoUrl
        });
      } else {
        await exportToExcel(excelData, 'Dashboard', filename);
      }
    } catch (err) {
      console.error("Export error", err);
    } finally {
      setIsGenerating(false)
      setShowReportModal(false)
    }
  }

  return (
    <div className="space-y-6 relative">
        
        {coachRequests.length > 0 && (
          <div className="bg-warning/10 border border-warning/20 rounded-xl p-4 glass">
            <h3 className="text-warning font-bold flex items-center gap-2 mb-3">
              <AlertCircle className="h-5 w-5" /> Solicitudes de Cambio de Entrenador ({coachRequests.length})
            </h3>
            <div className="space-y-2">
              {coachRequests.map((req) => (
                <div key={req.id} className="flex flex-col sm:flex-row justify-between items-center bg-card border border-black/5 dark:border-white/5 p-3 rounded-lg gap-3">
                  <div className="text-sm flex items-center gap-2.5">
                    {req.athlete?.profilePicture ? (
                      <img src={req.athlete.profilePicture} alt={req.athlete.name} className="h-8 w-8 rounded-full object-cover shrink-0 border border-primary/30" />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs shrink-0">
                        {req.athlete?.name?.charAt(0) || 'A'}
                      </div>
                    )}
                    <div>
                      <span className="font-bold">{req.athlete.name}</span> (C.I: {req.athlete.cedula}) quiere cambiar de 
                      <span className="font-medium text-muted-foreground mx-1">
                        {req.athlete.coach?.name || 'Ninguno'}
                      </span>
                      a
                      <span className="font-bold text-primary mx-1">
                        {req.coach.name}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2 w-full sm:w-auto">
                    <button 
                      onClick={async () => {
                        const feeResult = await Swal.fire({
                          title: '¿Asignar Cuota?',
                          text: 'Ingresa el monto de la cuota para este nuevo entrenador (escribe 0 si es gratis o si paga la suscripción normal).',
                          input: 'number',
                          inputAttributes: {
                            min: '0',
                            step: '0.01'
                          },
                          showCancelButton: true,
                          confirmButtonText: 'Aprobar y Generar Cobro',
                          cancelButtonText: 'Cancelar'
                        });

                        if (feeResult.isConfirmed) {
                          const fee = parseFloat(feeResult.value || "0");
                          const { resolveCoachRequest } = await import('@/app/actions/users');
                          const res = await resolveCoachRequest(req.id, "APPROVED_PENDING_PAYMENT", req.athleteId, req.coachId, fee);
                          
                          if (res.success) {
                            setCoachRequests(prev => prev.filter(r => r.id !== req.id));
                            if (fee > 0) {
                              Swal.fire('¡Aprobado!', 'El atleta debe pagar en Recepción o Tienda para oficializar el cambio.', 'success');
                            } else {
                              Swal.fire('¡Aprobado!', 'El atleta ha sido reasignado gratuitamente al instante.', 'success');
                            }
                          } else {
                            Swal.fire('Error', res.error, 'error');
                          }
                        }
                      }}
                      className="flex-1 sm:flex-none bg-green-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-green-600 transition"
                    >
                      Aprobar
                    </button>
                    <button 
                      onClick={async () => {
                        const { resolveCoachRequest } = await import('@/app/actions/users')
                        const res = await resolveCoachRequest(req.id, "REJECTED", req.athleteId, req.coachId)
                        if (res.success) {
                          setCoachRequests(prev => prev.filter(r => r.id !== req.id))
                        }
                      }}
                      className="flex-1 sm:flex-none bg-destructive/10 text-destructive px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-destructive/20 transition"
                    >
                      Rechazar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      <Dialog
        open={showReportModal}
        onClose={() => setShowReportModal(false)}
        title="Exportar reporte"
        description="Selecciona el formato y periodo para tu informe financiero."
      >
        <div className="space-y-5">
          <div role="group" aria-label="Periodo">
            <span className="text-xs font-semibold text-muted-foreground mb-2 block">Periodo</span>
            <div className="grid grid-cols-3 gap-2">
              {['Semanal', 'Quincenal', 'Mensual'].map(p => (
                <Button
                  key={p}
                  size="sm"
                  variant={reportPeriod === p ? 'primary' : 'outline'}
                  aria-pressed={reportPeriod === p}
                  onClick={() => setReportPeriod(p)}
                >
                  {p}
                </Button>
              ))}
            </div>
          </div>

          <div role="group" aria-label="Formato">
            <span className="text-xs font-semibold text-muted-foreground mb-2 block">Formato</span>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                aria-pressed={reportFormat === 'PDF'}
                onClick={() => setReportFormat('PDF')}
                className={`py-3 px-2 flex flex-col items-center justify-center gap-2 rounded-xl transition-colors border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${reportFormat === 'PDF' ? 'bg-destructive/15 border-destructive/50 text-destructive' : 'border-border text-muted-foreground hover:bg-muted'}`}
              >
                <FileText className="h-6 w-6" />
                <span className="text-xs font-bold">PDF</span>
              </button>
              <button
                type="button"
                aria-pressed={reportFormat === 'Excel'}
                onClick={() => setReportFormat('Excel')}
                className={`py-3 px-2 flex flex-col items-center justify-center gap-2 rounded-xl transition-colors border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${reportFormat === 'Excel' ? 'bg-success/15 border-success/50 text-success' : 'border-border text-muted-foreground hover:bg-muted'}`}
              >
                <FileSpreadsheet className="h-6 w-6" />
                <span className="text-xs font-bold">Excel (CSV)</span>
              </button>
            </div>
          </div>

          <Button size="lg" className="w-full" onClick={handleDownloadReport} disabled={isGenerating}>
            {isGenerating ? (
              <Loader size={20} color="currentColor" />
            ) : (
              <>
                <CheckCircle2 className="h-5 w-5" /> Generar y descargar
              </>
            )}
          </Button>
        </div>
      </Dialog>

      <div className="grid grid-cols-1 lg:grid-cols-3 items-center gap-4">
        <div>
          <h1 className="page-title">Dashboard General</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Resumen integral de finanzas, tienda y retención de atletas.
          </p>
        </div>

        {/* Badge Tasa Oficial BCV centrado en el Dashboard */}
        <div className="flex justify-center items-center w-full">
          <BcvRateBadge />
        </div>

        <div className="flex justify-start lg:justify-end items-center gap-3">
          <Button variant="outline" onClick={() => setShowReportModal(true)}>
            <Download className="h-4 w-4" /> Exportar Reporte
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="glass card-hover-elevate border-black/10 dark:border-white/10 rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground">
              Atletas Activos
            </CardTitle>
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
              <Users className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-foreground tracking-tight">{dynamicStats.activeAthletes}</div>
            <p className="text-xs text-emerald-500 flex items-center font-medium mt-1.5">
              <ArrowUpRight className="h-3.5 w-3.5 mr-1" />
              Actualizado en tiempo real
            </p>
          </CardContent>
        </Card>

        <Card className="glass card-hover-elevate border-black/10 dark:border-white/10 rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground">
              Asistencia Hoy
            </CardTitle>
            <div className="w-9 h-9 rounded-xl bg-primary/15 text-primary flex items-center justify-center">
              <TrendingUp className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-foreground tracking-tight">{dynamicStats.checkinsToday}</div>
            <p className="text-xs text-primary capitalize flex items-center font-medium mt-1.5">
              {hoy}
            </p>
          </CardContent>
        </Card>

        <Card className="glass card-hover-elevate border-black/10 dark:border-white/10 rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground">
              Ingresos del Mes
            </CardTitle>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <Banknote className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-foreground tracking-tight">${dynamicStats.monthlyRevenue.toFixed(2)}</div>
            <p className="text-xs text-emerald-500 flex items-center font-medium mt-1.5">
              <ArrowUpRight className="h-3.5 w-3.5 mr-1" />
              Ventas y Membresías
            </p>
          </CardContent>
        </Card>

        <Card className="glass card-hover-elevate border-rose-500/30 rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-rose-500">
              Riesgo de Abandono (Top 3)
            </CardTitle>
            <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
              <AlertCircle className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 mt-1">
              {dynamicStats.riskAthletes.length > 0 ? dynamicStats.riskAthletes.map((atleta: any, i: number) => (
                <div key={i} className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-foreground truncate max-w-[130px]">{atleta.nombre}</span>
                  <span className="badge-soft-danger px-2 py-0.5 rounded-full font-bold">{atleta.dias}d ausente</span>
                </div>
              )) : (
                <div className="text-xs text-muted-foreground py-1">No hay atletas en riesgo.</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* SECCIÓN ANALÍTICA (Exclusivo Administradores y Gerentes) */}
      <div className="space-y-4 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-black/10 dark:border-white/10 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/15 text-amber-500 flex items-center justify-center font-bold">
              <Activity className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">Analítica de retención, rentabilidad por atleta y horas pico de afluencia</h2>
              <p className="text-xs text-muted-foreground">Métricas clave de gestión y rendimiento en tiempo real.</p>
            </div>
          </div>
          <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20 shrink-0 self-start sm:self-auto">
            Solo Admin / Gerencia
          </span>
        </div>

        {/* Tarjetas de BI */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1: Churn Rate */}
          <Card className="glass card-hover-elevate border-black/10 dark:border-white/10 rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Tasa de Deserción (Churn Rate)
              </CardTitle>
              <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-500 flex items-center justify-center">
                <UserMinus className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <div className="text-3xl font-black tracking-tight text-foreground">
                  {dynamicStats.churnRate ?? 0}%
                </div>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                  (dynamicStats.churnRate || 0) <= 5 
                    ? 'bg-emerald-500/15 text-emerald-500' 
                    : (dynamicStats.churnRate || 0) <= 10 
                    ? 'bg-amber-500/15 text-amber-500' 
                    : 'bg-rose-500/15 text-rose-500'
                }`}>
                  {(dynamicStats.churnRate || 0) <= 5 ? 'Excelente Retención' : (dynamicStats.churnRate || 0) <= 10 ? 'Controlado' : 'Alerta de Fuga'}
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">
                Atletas vencidos en los últimos 30 días sin renovar membresía.
              </p>
            </CardContent>
          </Card>

          {/* Card 2: ARPU */}
          <Card className="glass card-hover-elevate border-black/10 dark:border-white/10 rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Ingreso Promedio x Atleta (ARPU)
              </CardTitle>
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                <DollarSign className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black tracking-tight text-foreground">
                ${dynamicStats.arpu ?? 0}
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">
                Gasto promedio mensual por atleta activo (Membresías + Tienda).
              </p>
            </CardContent>
          </Card>

          {/* Card 3: MRR Proyectado */}
          <Card className="glass card-hover-elevate border-black/10 dark:border-white/10 rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Ingresos Recurrentes (MRR Estimado)
              </CardTitle>
              <div className="w-8 h-8 rounded-lg bg-primary/15 text-primary flex items-center justify-center">
                <Flame className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black tracking-tight text-primary">
                ${(dynamicStats.mrr || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">
                Facturación mensual recurrente proyectada con la base activa actual.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Gráfico de Horas Pico de Sala */}
        <Card className="glass border-black/10 dark:border-white/10 rounded-2xl shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                Mapa de Horas Pico de Asistencia (Últimos 30 días)
              </span>
              <span className="text-xs text-muted-foreground font-normal">
                Franja horaria (06:00 a 22:00)
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dynamicStats.peakHoursData || []} margin={{ top: 10, right: 20, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis dataKey="hour" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  cursor={{ fill: 'hsl(var(--secondary))', opacity: 0.5 }}
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', color: 'hsl(var(--foreground))', borderRadius: '8px', fontSize: '12px' }}
                  formatter={(val: any) => [`${val} accesos`, 'Afluencia']}
                />
                <Bar dataKey="checkins" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Accesos" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section 1: Finanzas & Asistencia */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="glass border-black/10 dark:border-white/10 rounded-2xl shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-bold flex items-center justify-between">
              <span>Flujo de Caja (Gimnasio)</span>
              <span className="text-xs text-muted-foreground font-normal">Semanal</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dynamicStats.revenueData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorIngresos" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.65}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.02}/>
                  </linearGradient>
                  <linearGradient id="colorEgresos" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--destructive))" stopOpacity={0.65}/>
                    <stop offset="95%" stopColor="hsl(var(--destructive))" stopOpacity={0.02}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(17, 23, 36, 0.9)', backdropFilter: 'blur(12px)', borderColor: 'rgba(255, 255, 255, 0.15)', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)', color: '#ffffff' }}
                  itemStyle={{ color: '#ffffff', fontWeight: 600 }}
                />
                <Area type="monotone" dataKey="ingresos" stroke="hsl(var(--primary))" strokeWidth={2.5} fillOpacity={1} fill="url(#colorIngresos)" />
                <Area type="monotone" dataKey="egresos" stroke="hsl(var(--destructive))" strokeWidth={2} fillOpacity={1} fill="url(#colorEgresos)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="glass border-black/10 dark:border-white/10 rounded-2xl shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-bold flex items-center justify-between">
              <span>Asistencia Semanal</span>
              <span className="text-xs text-muted-foreground font-normal">Check-ins</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dynamicStats.attendanceData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }} barSize={35}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.4} />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  cursor={{fill: 'hsl(var(--secondary))'}}
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', color: 'hsl(var(--foreground))', borderRadius: '8px' }}
                />
                <Bar dataKey="checkins" radius={[6, 6, 0, 0]}>
                  {
                    dynamicStats.attendanceData.map((entry, index) => {
                      let color = '#22c55e' // Green by default (Alto)
                      if (entry.checkins < 90) color = '#ef4444' // Red (Bajo)
                      else if (entry.checkins <= 130) color = '#eab308' // Yellow (Intermedio)
                      
                      return <Cell key={`cell-${index}`} fill={color} />
                    })
                  }
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section 2: Tienda & Éxito de Rutinas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="glass">
          <CardHeader className="flex flex-row justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-primary" /> Flujo Ventas y Costos Tienda
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={storeData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }} />
                <Bar dataKey="ventas" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Ventas ($)" />
                <Bar dataKey="costos" fill="hsl(var(--secondary-foreground))" radius={[4, 4, 0, 0]} name="Costos ($)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="glass overflow-hidden flex flex-col">
          <CardHeader>
            <CardTitle>Cumplimiento de Entrenamientos</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto pr-2">
            <div className="space-y-4">
              {dynamicStats.exitoAtletas.map((atleta, i) => (
                <div key={i} className="flex flex-col gap-1.5">
                  <div className="flex justify-between items-center text-sm font-medium">
                    <div className="flex items-center gap-2">
                      {atleta.profilePicture ? (
                        <img src={atleta.profilePicture} alt={atleta.nombre} className="h-6 w-6 rounded-full object-cover shrink-0 border border-primary/30" />
                      ) : (
                        <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-[10px] shrink-0">
                          {atleta.nombre?.charAt(0) || 'A'}
                        </div>
                      )}
                      <span>{atleta.nombre}</span>
                    </div>
                    <span className={atleta.porcentaje >= 80 ? "text-success" : atleta.porcentaje >= 70 ? "text-primary" : "text-destructive"}>
                      {atleta.porcentaje}%
                    </span>
                  </div>
                  <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${atleta.porcentaje >= 80 ? "bg-green-500" : atleta.porcentaje >= 70 ? "bg-primary" : "bg-destructive"}`} 
                      style={{ width: `${atleta.porcentaje}%` }} 
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Membresías (Por vencer y Nuevas) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="glass border-warning/30">
          <CardHeader>
            <CardTitle className="text-warning">Membresías por Vencer</CardTitle>
          </CardHeader>
          <CardContent>
            {dynamicStats.membresiasPorVencer.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center bg-black/5 dark:bg-white/5 rounded-xl border border-dashed border-black/10 dark:border-white/10">
                <div className="w-12 h-12 bg-warning/10 rounded-full flex items-center justify-center mb-3">
                  <CheckCircle2 className="w-6 h-6 text-warning opacity-80" />
                </div>
                <h4 className="text-sm font-bold text-warning mb-1">¡Todo está al día!</h4>
                <p className="text-xs text-muted-foreground px-4">En este momento no hay atletas con membresías próximas a expirar.</p>
              </div>
            ) : (
              <ul className="space-y-3">
                {dynamicStats.membresiasPorVencer.map((mem, i) => (
                  <li key={i} className="flex justify-between items-center p-3 rounded-lg bg-black/20 border border-black/5 dark:border-white/5">
                    <div className="flex items-center gap-2.5">
                      {mem.profilePicture ? (
                        <img src={mem.profilePicture} alt={mem.nombre} className="h-8 w-8 rounded-full object-cover shrink-0 border border-warning/30" />
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-warning/20 flex items-center justify-center text-warning font-bold text-xs shrink-0">
                          {mem.nombre?.charAt(0) || 'A'}
                        </div>
                      )}
                      <span className="font-medium">{mem.nombre}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs bg-warning/20 text-warning px-2 py-1 rounded-full font-bold">
                        Vence en {mem.venceEn}
                      </span>
                      <a 
                        href={`https://wa.me/58${mem.phone?.replace(/[^0-9]/g, '')}?text=${encodeURIComponent("¡Hola " + mem.nombre + "! Recordatorio de " + (settings?.appName || 'nuestro gimnasio') + ": Tu membresía vence en " + mem.venceEn + ". ¡Te esperamos para renovar!")}`}
                        target="_blank"
                        rel="noreferrer"
                        className="bg-green-500 hover:bg-green-600 text-white p-1.5 rounded-full transition"
                        title="Enviar Recordatorio por WhatsApp"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                      </a>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card className="glass border-success/30">
          <CardHeader>
            <CardTitle className="text-success">Membresías Nuevas</CardTitle>
          </CardHeader>
          <CardContent>
            {dynamicStats.membresiasNuevas.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center bg-black/5 dark:bg-white/5 rounded-xl border border-dashed border-black/10 dark:border-white/10">
                <div className="w-12 h-12 bg-success/10 rounded-full flex items-center justify-center mb-3">
                  <CalendarDays className="w-6 h-6 text-success opacity-80" />
                </div>
                <h4 className="text-sm font-bold text-success mb-1">Esperando nuevas afiliaciones</h4>
                <p className="text-xs text-muted-foreground px-4">Aún no se han registrado inscripciones recientes en el gimnasio.</p>
              </div>
            ) : (
              <ul className="space-y-3">
                {dynamicStats.membresiasNuevas.map((mem, i) => (
                  <li key={i} className="flex justify-between items-center p-3 rounded-lg bg-black/20 border border-black/5 dark:border-white/5">
                    <div className="flex items-center gap-2.5">
                      {mem.profilePicture ? (
                        <img src={mem.profilePicture} alt={mem.nombre} className="h-8 w-8 rounded-full object-cover shrink-0 border border-success/30" />
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-success/20 flex items-center justify-center text-success font-bold text-xs shrink-0">
                          {mem.nombre?.charAt(0) || 'A'}
                        </div>
                      )}
                      <div>
                        <span className="font-medium block">{mem.nombre}</span>
                        <span className="text-xs text-muted-foreground">{mem.plan}</span>
                      </div>
                    </div>
                    <span className="text-xs bg-success/20 text-success px-2 py-1 rounded-full">
                      {mem.hace}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

    </div>
  )
}
