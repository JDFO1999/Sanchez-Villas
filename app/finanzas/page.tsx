"use client"

import { useState } from "react"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { useAuth } from "@/lib/auth-context"
import { useSettings } from "@/lib/settings-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  BarChart3, 
  TrendingDown, 
  TrendingUp, 
  DollarSign, 
  AlertCircle,
  FileText,
  Download,
  Calendar,
  Wallet,
  Users
} from "lucide-react"

export default function FinanzasPage() {
  const { user } = useAuth()
  const { settings } = useSettings()
  
  const [activeTab, setActiveTab] = useState('resumen')
  
  const finanzasData = [
    { name: "Lun", ingresos: 1200, egresos: 400 },
    { name: "Mar", ingresos: 2100, egresos: 800 },
    { name: "Mie", ingresos: 1800, egresos: 300 },
    { name: "Jue", ingresos: 2400, egresos: 1200 },
    { name: "Vie", ingresos: 3100, egresos: 500 },
    { name: "Sab", ingresos: 4200, egresos: 900 },
    { name: "Dom", ingresos: 1500, egresos: 200 },
  ]
  if (!user || (user.role !== 'admin')) {
    return <div className="p-8 text-center text-red-500 font-bold">Acceso Denegado. Solo administradores.</div>
  }

  const tabs = [
    { id: 'resumen', label: 'Resumen Financiero', icon: BarChart3 },
    { id: 'ingresos', label: 'Flujo de Efectivo', icon: TrendingUp },
    { id: 'egresos', label: 'Egresos (Gastos)', icon: TrendingDown },
    { id: 'cuentas_cobrar', label: 'Cuentas por Cobrar', icon: AlertCircle },
    { id: 'nomina', label: 'Nómina y Comisiones', icon: Users },
  ]

  const [showReportModal, setShowReportModal] = useState(false)
  const [reportSection, setReportSection] = useState("")
  const [reportPeriod, setReportPeriod] = useState("Mensual")
  const [reportFormat, setReportFormat] = useState("PDF")
  const [isGenerating, setIsGenerating] = useState(false)

  const handleDownloadReport = (seccion: string) => {
    setReportSection(seccion)
    setShowReportModal(true)
  }

  const confirmDownload = () => {
    setIsGenerating(true)
    setTimeout(() => {
      setIsGenerating(false)
      setShowReportModal(false)
      const link = document.createElement("a");
      const content = reportFormat === "Excel" 
        ? "data:text/csv;charset=utf-8,ID,Monto,Fecha\n1,100,2026-08-31" 
        : "data:application/pdf;base64,JVBERi0xLjQKJcOkw7zDtsOfCjIgMCBvYmoKPDwvTGVuZ3RoIDMgMCBSL0ZpbHRlci9GbGF0ZURlY29kZT4+CnN0cmVhbQp4nDPQM1Qo5ypUMFAwALJMLY31jBQK0osSQyNzgUKZqYkFEAkiBQAAD1oH/QplbmRzdHJlYW0KZW5kb2JqCgozIDAgb2JqCjM5CmVuZG9iagoKMSAwIG9iago8PC9QYWdlcyA0IDAgUi9UeXBlL0NhdGFsb2c+PgplbmRvYmoKCjUgMCBvYmoKPDwvQ3JlYXRpb25EYXRlKEQ6MjAxOTA5MjYwNjMzMTErMDAnMDAnKS9DcmVhdG9yKFBERiB0b29sKS9Qcm9kdWNlcihQREYgdG9vbCk+PgplbmRvYmoKCjQgMCBvYmoKPDwvQ291bnQgMS9LaWRzWzYgMCBSXS9UeXBlL1BhZ2VzPj4KZW5kb2JqCgo2IDAgb2JqCjw8L0NvbnRlbnRzIDIgMCBSL01lZGlhQm94WzAgMCA1OTUgODQyXS9QYXJlbnQgNCAwIFIvUmVzb3VyY2VzPDwvRm9udDw8L0YxIDcgMCBSPj4+Pi9UeXBlL1BhZ2U+PgplbmRvYmoKCjcgMCBvYmoKPDwvQmFzZUZvbnQvSGVsdmV0aWNhL0VuY29kaW5nL1dpbkFuc2lFbmNvZGluZy9TdWJ0eXBlL1R5cGUxL1R5cGUvRm9udD4+CmVuZG9iagoKeHJlZgowIDgKMDAwMDAwMDAwMCA2NTUzNSBmIAowMDAwMDAwMTE1IDAwMDAwIG4gCjAwMDAwMDAwMTUgMDAwMDAgbiAKMDAwMDAwMDA5NiAwMDAwMCBuIAowMDAwMDAwMjM1IDAwMDAwIG4gCjAwMDAwMDAxNjQgMDAwMDAgbiAKMDAwMDAwMDI5MiAwMDAwMCBuIAowMDAwMDAwMzk2IDAwMDAwIG4gCnRyYWlsZXIKPDwvUm9vdCAxIDAgUi9TaXplIDgvSW5mbyA1IDAgUj4+CnN0YXJ0eHJlZgo0ODQKJSVFT0YK";
      link.href = content;
      link.download = `Reporte_${reportSection.replace(/ /g, '_')}_${reportPeriod}_GymPro.${reportFormat === "Excel" ? "csv" : "pdf"}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }, 1500)
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-20 relative">
      
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="bg-card border border-black/10 dark:border-white/10 rounded-2xl max-w-sm w-full p-6 shadow-2xl glass relative overflow-hidden">
            <button onClick={() => setShowReportModal(false)} className="absolute top-4 right-4 text-foreground/50 hover:text-foreground transition">
              <span className="font-bold text-xl leading-none">&times;</span>
            </button>
            <div className="text-center mb-6">
              <div className="mx-auto bg-primary/20 h-16 w-16 rounded-full flex items-center justify-center mb-4">
                <Download className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-2xl font-black tracking-tighter bg-gradient-to-r from-primary dark:dark:via-white via-black via-black to-primary/50 bg-clip-text text-transparent">Exportar Reporte</h3>
              <p className="text-sm text-muted-foreground mt-2">Módulo: <strong className="text-foreground">{reportSection}</strong></p>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 block">Periodo</label>
                <div className="grid grid-cols-3 gap-2">
                  {['Semanal', 'Quincenal', 'Mensual'].map(p => (
                    <button 
                      key={p} 
                      onClick={() => setReportPeriod(p)}
                      className={`py-2 px-1 text-xs font-bold rounded-lg transition-colors border ${reportPeriod === p ? 'bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20' : 'bg-black/5 dark:bg-black/40 border-black/10 dark:border-white/10 text-muted-foreground hover:bg-black/5 dark:bg-white/5'}`}
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
                    <span className="text-xs font-bold">PDF</span>
                  </button>
                  <button 
                    onClick={() => setReportFormat('Excel')}
                    className={`py-3 px-2 flex flex-col items-center justify-center gap-2 rounded-xl transition-colors border ${reportFormat === 'Excel' ? 'bg-green-500/20 border-green-500/50 text-green-500 shadow-lg' : 'bg-black/5 dark:bg-black/40 border-black/10 dark:border-white/10 text-muted-foreground hover:bg-black/5 dark:bg-white/5'}`}
                  >
                    <span className="text-xs font-bold">Excel (CSV)</span>
                  </button>
                </div>
              </div>
            </div>

            <button 
              onClick={confirmDownload}
              disabled={isGenerating}
              className="w-full mt-6 bg-primary text-primary-foreground font-bold py-3.5 rounded-xl hover:bg-primary/90 transition shadow-lg shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isGenerating ? (
                <div className="h-5 w-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
              ) : (
                "Generar y Descargar"
              )}
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tighter bg-gradient-to-r from-primary dark:dark:via-white via-black via-black to-primary/50 bg-clip-text text-transparent dark:dark:drop-shadow-[0_0_15px_rgba(255,255,255,0.1)] drop-shadow-sm drop-shadow-sm mb-2">Finanzas GymPro</h1>
          <p className="text-muted-foreground">Control total de ingresos, gastos, nómina y morosidad.</p>
        </div>
        <button 
          onClick={() => handleDownloadReport('Todas las secciones')}
          className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-bold shadow-sm hover:bg-primary/90 transition flex items-center gap-2"
        >
          <Download className="h-4 w-4" /> Reporte General (PDF)
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide border-b border-black/10 dark:border-white/10 mb-6">
        {tabs.map(t => (
          <button 
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-lg transition text-sm font-bold whitespace-nowrap ${
              activeTab === t.id 
                ? "bg-primary/10 text-primary border-b-2 border-primary" 
                : "text-muted-foreground hover:bg-black/5 dark:bg-white/5 hover:text-foreground"
            }`}
          >
            <t.icon className="h-4 w-4" />
            {t.label}
          </button>
        ))}
      </div>

      {/* Contenido Dinámico */}
      {activeTab === 'resumen' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="glass border-green-500/20">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Ingresos (Mes)</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-black text-green-400">{settings.storeCurrency} 4,520.00</div>
                <p className="text-xs text-muted-foreground mt-1">+12% vs mes anterior</p>
              </CardContent>
            </Card>
            <Card className="glass border-red-500/20">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Egresos (Mes)</CardTitle>
                <TrendingDown className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-black text-red-400">{settings.storeCurrency} 1,250.00</div>
                <p className="text-xs text-muted-foreground mt-1">-5% vs mes anterior</p>
              </CardContent>
            </Card>
            <Card className="glass border-orange-500/20">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Por Cobrar</CardTitle>
                <AlertCircle className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-black text-orange-400">{settings.storeCurrency} 340.00</div>
                <p className="text-xs text-muted-foreground mt-1">12 atletas en mora</p>
              </CardContent>
            </Card>
            <Card className="glass border-primary/20">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Balance Neto</CardTitle>
                <Wallet className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-black text-foreground">{settings.storeCurrency} 3,270.00</div>
                <p className="text-xs text-primary mt-1">Rentabilidad: 72%</p>
              </CardContent>
            </Card>
          </div>

          <Card className="glass mt-6">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Flujo de Ingresos y Egresos (Semanal)</CardTitle>
              <button onClick={() => handleDownloadReport('Resumen')} className="bg-primary/20 text-primary px-3 py-1.5 rounded-lg text-sm font-bold hover:bg-primary hover:text-foreground transition">
                Descargar Reporte
              </button>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={finanzasData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorIngresos" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorEgresos" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--destructive))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--destructive))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.4} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', color: 'hsl(var(--foreground))', borderRadius: '8px' }}
                    itemStyle={{ color: 'hsl(var(--foreground))' }}
                  />
                  <Area type="monotone" dataKey="ingresos" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorIngresos)" />
                  <Area type="monotone" dataKey="egresos" stroke="hsl(var(--destructive))" fillOpacity={1} fill="url(#colorEgresos)" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'ingresos' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Flujo de Efectivo (Ingresos)</h2>
            <button onClick={() => handleDownloadReport('Ingresos')} className="bg-black/10 dark:bg-white/10 text-foreground px-3 py-1.5 rounded-lg text-sm font-bold hover:bg-white/20 transition flex items-center gap-2">
              <Download className="h-4 w-4" /> Exportar Ingresos
            </button>
          </div>
          <div className="bg-card/40 border border-black/5 dark:border-white/5 rounded-2xl p-8 text-center glass">
            <TrendingUp className="h-16 w-16 text-green-500/20 mx-auto mb-4" />
            <p className="text-muted-foreground max-w-md mx-auto">
              Tabla con todos los pagos recibidos, desglosado por método (Zelle, Efectivo, Binance, Pago Móvil).
            </p>
          </div>
        </div>
      )}

      {activeTab === 'egresos' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Registro de Gastos</h2>
            <div className="flex gap-2">
              <button className="bg-primary text-primary-foreground px-3 py-1.5 rounded-lg text-sm font-bold hover:bg-primary/90 transition">
                + Nuevo Gasto
              </button>
              <button onClick={() => handleDownloadReport('Egresos')} className="bg-black/10 dark:bg-white/10 text-foreground px-3 py-1.5 rounded-lg text-sm font-bold hover:bg-white/20 transition flex items-center gap-2">
                <Download className="h-4 w-4" /> Exportar
              </button>
            </div>
          </div>
          <div className="bg-card/40 border border-black/5 dark:border-white/5 rounded-2xl p-8 text-center glass">
            <TrendingDown className="h-16 w-16 text-red-500/20 mx-auto mb-4" />
            <p className="text-muted-foreground max-w-md mx-auto">
              Lista de gastos operativos: Mantenimiento, Limpieza, Suplementos, Servicios Básicos, etc.
            </p>
          </div>
        </div>
      )}

      {activeTab === 'cuentas_cobrar' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Atletas en Mora / Deudas de Tienda</h2>
            <button onClick={() => handleDownloadReport('Cuentas por Cobrar')} className="bg-black/10 dark:bg-white/10 text-foreground px-3 py-1.5 rounded-lg text-sm font-bold hover:bg-white/20 transition flex items-center gap-2">
              <Download className="h-4 w-4" /> Exportar Morosos
            </button>
          </div>
          <div className="bg-card/40 border border-black/5 dark:border-white/5 rounded-2xl p-8 text-center glass">
            <AlertCircle className="h-16 w-16 text-orange-500/20 mx-auto mb-4" />
            <p className="text-muted-foreground max-w-md mx-auto">
              Clientes que tienen la mensualidad vencida pero siguen activos, o que tienen deudas pendientes en la tienda.
            </p>
          </div>
        </div>
      )}

      {activeTab === 'nomina' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Nómina y Comisiones</h2>
            <button onClick={() => handleDownloadReport('Nómina')} className="bg-black/10 dark:bg-white/10 text-foreground px-3 py-1.5 rounded-lg text-sm font-bold hover:bg-white/20 transition flex items-center gap-2">
              <Download className="h-4 w-4" /> Exportar Nómina
            </button>
          </div>
          <div className="bg-card/40 border border-black/5 dark:border-white/5 rounded-2xl p-8 text-center glass">
            <Users className="h-16 w-16 text-primary/20 mx-auto mb-4" />
            <p className="text-muted-foreground max-w-md mx-auto">
              Cálculo automático de sueldos y comisiones para entrenadores basado en atletas activos y personal training.
            </p>
          </div>
        </div>
      )}

    </div>
  )
}
