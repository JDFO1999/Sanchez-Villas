"use client"

import { 
  Users, 
  TrendingUp, 
  Banknote, 
  AlertCircle,
  ArrowUpRight,
  ShoppingCart
} from "lucide-react"
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

const revenueData = [
  { name: "Ene", ingresos: 4000, egresos: 2400 },
  { name: "Feb", ingresos: 3000, egresos: 1398 },
  { name: "Mar", ingresos: 2000, egresos: 9800 },
  { name: "Abr", ingresos: 2780, egresos: 3908 },
  { name: "May", ingresos: 1890, egresos: 4800 },
  { name: "Jun", ingresos: 2390, egresos: 3800 },
  { name: "Jul", ingresos: 3490, egresos: 4300 },
]

const attendanceData = [
  { name: "Lun", checkins: 145 },
  { name: "Mar", checkins: 130 },
  { name: "Mie", checkins: 155 },
  { name: "Jue", checkins: 120 },
  { name: "Vie", checkins: 110 },
  { name: "Sab", checkins: 85 },
  { name: "Dom", checkins: 40 },
]

const storeData = [
  { name: "Lun", ventas: 300, costos: 150 },
  { name: "Mar", ventas: 450, costos: 200 },
  { name: "Mie", ventas: 320, costos: 180 },
  { name: "Jue", ventas: 500, costos: 250 },
  { name: "Vie", ventas: 600, costos: 300 },
  { name: "Sab", ventas: 800, costos: 400 },
  { name: "Dom", ventas: 200, costos: 100 },
]

const topRiesgo = [
  { nombre: "Carlos M.", dias: 12, antiguedad: "2 años" },
  { nombre: "Ana G.", dias: 9, antiguedad: "1.5 años" },
  { nombre: "Luis F.", dias: 8, antiguedad: "3 años" }
]

const exitoAtletas = [
  { nombre: "María P.", porcentaje: 95 },
  { nombre: "Jorge R.", porcentaje: 88 },
  { nombre: "Elena S.", porcentaje: 82 },
  { nombre: "Diego L.", porcentaje: 75 },
  { nombre: "Juan C.", porcentaje: 60 },
]

const membresiasPorVencer = [
  { nombre: "Pedro S.", venceEn: "2 días" },
  { nombre: "Lucía M.", venceEn: "3 días" },
  { nombre: "Andrés V.", venceEn: "4 días" },
]

const membresiasNuevas = [
  { nombre: "Sofía C.", plan: "Plan Anual", hace: "2 horas" },
  { nombre: "Roberto D.", plan: "Plan Mensual", hace: "5 horas" },
  { nombre: "Camila R.", plan: "Plan Semestral", hace: "1 día" },
]

export function AdminDashboard() {
  const hoy = new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard General</h1>
          <p className="text-muted-foreground mt-1">
            Resumen integral de finanzas, tienda y retención de atletas.
          </p>
        </div>
        <button className="bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium shadow-sm hover:bg-primary/90 transition">
          Descargar Reporte Mensual
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
            <div className="text-2xl font-bold">342</div>
            <p className="text-xs text-green-500 flex items-center mt-1">
              <ArrowUpRight className="h-3 w-3 mr-1" />
              +12% desde el mes pasado
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
            <div className="text-2xl font-bold">145</div>
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
            <div className="text-2xl font-bold">$12,450</div>
            <p className="text-xs text-green-500 flex items-center mt-1">
              <ArrowUpRight className="h-3 w-3 mr-1" />
              +8% vs mes anterior
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
              {topRiesgo.map((atleta, i) => (
                <div key={i} className="flex justify-between items-center text-xs">
                  <span className="font-medium text-foreground">{atleta.nombre} <span className="text-muted-foreground">({atleta.antiguedad})</span></span>
                  <span className="text-destructive font-bold">{atleta.dias}d ausente</span>
                </div>
              ))}
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
              <AreaChart data={revenueData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
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
            <CardTitle>Asistencia Semanal (Mejorado)</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={attendanceData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }} barSize={35}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.4} />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  cursor={{fill: 'hsl(var(--secondary))'}}
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', color: 'hsl(var(--foreground))', borderRadius: '8px' }}
                />
                <Bar dataKey="checkins" radius={[6, 6, 0, 0]}>
                  {
                    attendanceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 2 ? 'hsl(var(--primary))' : 'hsl(var(--primary) / 0.5)'} />
                    ))
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
              {exitoAtletas.map((atleta, i) => (
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
              {membresiasPorVencer.map((mem, i) => (
                <li key={i} className="flex justify-between items-center p-3 rounded-lg bg-black/20 border border-white/5">
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
              {membresiasNuevas.map((mem, i) => (
                <li key={i} className="flex justify-between items-center p-3 rounded-lg bg-black/20 border border-white/5">
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
