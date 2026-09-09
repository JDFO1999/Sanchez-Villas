"use client"

import { 
  Users, 
  TrendingUp, 
  Banknote, 
  AlertCircle,
  ArrowUpRight,
  ShoppingCart,
  Download,
  FileText,
  FileSpreadsheet,
  Calendar,
  CheckCircle2,
  X
} from "lucide-react"
import { useState, useEffect } from "react"
import Swal from "sweetalert2"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
          
          txs.forEach(tx => {
            const d = new Date(tx.date)
            let day = d.getDay() - 1
            if (day === -1) day = 6 // Sunday
            newData[day].ventas += tx.total
            
            tx.items.forEach((item: any) => {
              const p = prods.find(pr => pr.id === item.productId)
              if (p) newData[day].costos += (p.cost * item.qty) // Cost from backend is `p.cost`
            })
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

  const handleDownloadReport = () => {
    setIsGenerating(true)
    setTimeout(() => {
      setIsGenerating(false)
      setShowReportModal(false)
      const link = document.createElement("a");
      const content = reportFormat === "Excel" 
        ? "data:text/csv;charset=utf-8,ID,Monto,Fecha\n1,100,2026-08-31" 
        : "data:application/pdf;base64,JVBERi0xLjQKJcOkw7zDtsOfCjIgMCBvYmoKPDwvTGVuZ3RoIDMgMCBSL0ZpbHRlci9GbGF0ZURlY29kZT4+CnN0cmVhbQp4nDPQM1Qo5ypUMFAwALJMLY31jBQK0osSQyNzgUKZqYkFEAkiBQAAD1oH/QplbmRzdHJlYW0KZW5kb2JqCgozIDAgb2JqCjM5CmVuZG9iagoKMSAwIG9iago8PC9QYWdlcyA0IDAgUi9UeXBlL0NhdGFsb2c+PgplbmRvYmoKCjUgMCBvYmoKPDwvQ3JlYXRpb25EYXRlKEQ6MjAxOTA5MjYwNjMzMTErMDAnMDAnKS9DcmVhdG9yKFBERiB0b29sKS9Qcm9kdWNlcihQREYgdG9vbCk+PgplbmRvYmoKCjQgMCBvYmoKPDwvQ291bnQgMS9LaWRzWzYgMCBSXS9UeXBlL1BhZ2VzPj4KZW5kb2JqCgo2IDAgb2JqCjw8L0NvbnRlbnRzIDIgMCBSL01lZGlhQm94WzAgMCA1OTUgODQyXS9QYXJlbnQgNCAwIFIvUmVzb3VyY2VzPDwvRm9udDw8L0YxIDcgMCBSPj4+Pi9UeXBlL1BhZ2U+PgplbmRvYmoKCjcgMCBvYmoKPDwvQmFzZUZvbnQvSGVsdmV0aWNhL0VuY29kaW5nL1dpbkFuc2lFbmNvZGluZy9TdWJ0eXBlL1R5cGUxL1R5cGUvRm9udD4+CmVuZG9iagoKeHJlZgowIDgKMDAwMDAwMDAwMCA2NTUzNSBmIAowMDAwMDAwMTE1IDAwMDAwIG4gCjAwMDAwMDAwMTUgMDAwMDAgbiAKMDAwMDAwMDA5NiAwMDAwMCBuIAowMDAwMDAwMjM1IDAwMDAwIG4gCjAwMDAwMDAxNjQgMDAwMDAgbiAKMDAwMDAwMDI5MiAwMDAwMCBuIAowMDAwMDAwMzk2IDAwMDAwIG4gCnRyYWlsZXIKPDwvUm9vdCAxIDAgUi9TaXplIDgvSW5mbyA1IDAgUj4+CnN0YXJ0eHJlZgo0ODQKJSVFT0YK";
      link.href = content;
      link.download = `Reporte_${reportPeriod}_GymPro.${reportFormat === "Excel" ? "csv" : "pdf"}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }, 1500)
  }

  return (
    <div className="space-y-6 relative">
        
        {coachRequests.length > 0 && (
          <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4 glass">
            <h3 className="text-orange-500 font-bold flex items-center gap-2 mb-3">
              <AlertCircle className="h-5 w-5" /> Solicitudes de Cambio de Entrenador ({coachRequests.length})
            </h3>
            <div className="space-y-2">
              {coachRequests.map((req) => (
                <div key={req.id} className="flex flex-col sm:flex-row justify-between items-center bg-card border border-black/5 dark:border-white/5 p-3 rounded-lg gap-3">
                  <div className="text-sm">
                    <span className="font-bold">{req.athlete.name}</span> (C.I: {req.athlete.cedula}) quiere cambiar de 
                    <span className="font-medium text-muted-foreground mx-1">
                      {req.athlete.coach?.name || 'Ninguno'}
                    </span>
                    a
                    <span className="font-bold text-primary mx-1">
                      {req.coach.name}
                    </span>
                  </div>
                  <div className="flex gap-2 w-full sm:w-auto">
                    <button 
                      onClick={async () => {
                        const { resolveCoachRequest } = await import('@/app/actions/users')
                        const res = await resolveCoachRequest(req.id, "APPROVED", req.athleteId, req.coachId)
                        if (res.success) {
                          setCoachRequests(prev => prev.filter(r => r.id !== req.id))
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
                      className="flex-1 sm:flex-none bg-red-500/10 text-red-500 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-red-500/20 transition"
                    >
                      Rechazar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="bg-card border border-black/10 dark:border-white/10 rounded-2xl max-w-sm w-full p-6 shadow-2xl glass relative overflow-hidden">
            <button onClick={() => setShowReportModal(false)} className="absolute top-4 right-4 text-foreground/50 hover:text-foreground transition">
              <X className="h-5 w-5" />
            </button>
            <div className="text-center mb-6">
              <div className="mx-auto bg-primary/20 h-16 w-16 rounded-full flex items-center justify-center mb-4">
                <Download className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-2xl font-black tracking-tighter bg-gradient-to-r from-primary dark:dark:via-white via-black via-black to-primary/50 bg-clip-text text-transparent">Exportar Reporte</h3>
              <p className="text-sm text-muted-foreground mt-2">Selecciona el formato y periodo para tu informe financiero.</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 block">Periodo</label>
                <div className="grid grid-cols-3 gap-2">
                  {['Semanal', 'Quincenal', 'Mensual'].map(p => (
                    <button 
                      key={p} 
                      onClick={() => setReportPeriod(p)}
                      className={`py-2 px-1 text-xs font-bold rounded-lg transition-colors border ${reportPeriod === p ? 'border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground dark:bg-primary dark:text-primary-foreground dark:border-transparent border-primary shadow-lg shadow-primary/20' : 'bg-black/5 dark:bg-black/40 border-black/10 dark:border-white/10 text-muted-foreground hover:bg-black/5 dark:bg-white/5'}`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 block">Formato</label>
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => setReportFormat('PDF')}
                    className={`py-3 px-2 flex flex-col items-center justify-center gap-2 rounded-xl transition-colors border ${reportFormat === 'PDF' ? 'bg-red-500/20 border-red-500/50 text-red-500 shadow-lg' : 'bg-black/5 dark:bg-black/40 border-black/10 dark:border-white/10 text-muted-foreground hover:bg-black/5 dark:bg-white/5'}`}
                  >
                    <FileText className="h-6 w-6" />
                    <span className="text-xs font-bold">PDF</span>
                  </button>
                  <button 
                    onClick={() => setReportFormat('Excel')}
                    className={`py-3 px-2 flex flex-col items-center justify-center gap-2 rounded-xl transition-colors border ${reportFormat === 'Excel' ? 'bg-green-500/20 border-green-500/50 text-green-500 shadow-lg' : 'bg-black/5 dark:bg-black/40 border-black/10 dark:border-white/10 text-muted-foreground hover:bg-black/5 dark:bg-white/5'}`}
                  >
                    <FileSpreadsheet className="h-6 w-6" />
                    <span className="text-xs font-bold">Excel (CSV)</span>
                  </button>
                </div>
              </div>
            </div>

            <button 
              onClick={handleDownloadReport}
              disabled={isGenerating}
              className="w-full mt-6 border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground dark:bg-primary dark:text-primary-foreground dark:border-transparent font-bold py-3.5 rounded-xl hover:bg-primary/90 transition shadow-lg shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isGenerating ? (
                <div className="h-5 w-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <CheckCircle2 className="h-5 w-5" /> Generar y Descargar
                </>
              )}
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tighter bg-gradient-to-r from-primary dark:dark:via-white via-black via-black to-primary/50 bg-clip-text text-transparent dark:dark:drop-shadow-[0_0_15px_rgba(255,255,255,0.1)] drop-shadow-sm drop-shadow-sm">Dashboard General</h1>
          <p className="text-muted-foreground mt-1">
            Resumen integral de finanzas, tienda y retención de atletas.
          </p>
        </div>
        <button onClick={() => setShowReportModal(true)} className="bg-primary/10 border border-primary/20 text-primary px-4 py-2 rounded-lg font-bold shadow-sm hover:bg-primary hover:text-primary-foreground transition flex items-center gap-2">
          <Download className="h-4 w-4" /> Exportar Reporte
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Atletas Activos
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dynamicStats.activeAthletes}</div>
            <p className="text-xs text-green-500 flex items-center mt-1">
              <ArrowUpRight className="h-3 w-3 mr-1" />
              Actualizado hoy
            </p>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Asistencia Hoy
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dynamicStats.checkinsToday}</div>
            <p className="text-xs text-primary capitalize flex items-center mt-1">
              {hoy}
            </p>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Ingresos Mensuales
            </CardTitle>
            <Banknote className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${dynamicStats.monthlyRevenue.toFixed(2)}</div>
            <p className="text-xs text-green-500 flex items-center mt-1">
              <ArrowUpRight className="h-3 w-3 mr-1" />
              Tienda (Completados)
            </p>
          </CardContent>
        </Card>

        <Card className="border-destructive/50 glass">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-destructive">
              Riesgo de Abandono (Top 3)
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2 mt-1">
              {dynamicStats.riskAthletes.length > 0 ? dynamicStats.riskAthletes.map((atleta: any, i: number) => (
                <div key={i} className="flex justify-between items-center text-xs">
                  <span className="font-medium text-foreground">{atleta.nombre} <span className="text-muted-foreground">({atleta.antiguedad})</span></span>
                  <span className="text-destructive font-bold">{atleta.dias}d ausente</span>
                </div>
              )) : (
                <div className="text-xs text-muted-foreground">No hay atletas en riesgo.</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section 1: Finanzas & Asistencia */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="glass">
          <CardHeader>
            <CardTitle>Flujo de Caja (Gimnasio)</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dynamicStats.revenueData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorIngresos" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorEgresos" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--destructive))" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="hsl(var(--destructive))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', color: 'hsl(var(--foreground))' }}
                  itemStyle={{ color: 'hsl(var(--foreground))' }}
                />
                <Area type="monotone" dataKey="ingresos" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorIngresos)" />
                <Area type="monotone" dataKey="egresos" stroke="hsl(var(--destructive))" fillOpacity={1} fill="url(#colorEgresos)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader>
            <CardTitle>Asistencia Semanal</CardTitle>
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
                    <span>{atleta.nombre}</span>
                    <span className={atleta.porcentaje >= 80 ? "text-green-500" : atleta.porcentaje >= 70 ? "text-primary" : "text-destructive"}>
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
        <Card className="glass border-orange-500/30">
          <CardHeader>
            <CardTitle className="text-orange-500">Membresías por Vencer</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {dynamicStats.membresiasPorVencer.map((mem, i) => (
                <li key={i} className="flex justify-between items-center p-3 rounded-lg bg-black/20 border border-black/5 dark:border-white/5">
                  <span className="font-medium">{mem.nombre}</span>
                  <span className="text-xs bg-orange-500/20 text-orange-500 px-2 py-1 rounded-full font-bold">
                    Vence en {mem.venceEn}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="glass border-green-500/30">
          <CardHeader>
            <CardTitle className="text-green-500">Membresías Nuevas</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {dynamicStats.membresiasNuevas.map((mem, i) => (
                <li key={i} className="flex justify-between items-center p-3 rounded-lg bg-black/20 border border-black/5 dark:border-white/5">
                  <div>
                    <span className="font-medium block">{mem.nombre}</span>
                    <span className="text-xs text-muted-foreground">{mem.plan}</span>
                  </div>
                  <span className="text-xs bg-green-500/20 text-green-500 px-2 py-1 rounded-full">
                    {mem.hace}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

    </div>
  )
}
