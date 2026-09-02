"use client"

import { useState, useEffect } from "react"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import { useAuth } from "@/lib/auth-context"
import { useSettings } from "@/lib/settings-context"
import { storeService } from "@/lib/store-service"
import { financeService, Expense } from "@/lib/finance-service"
import { athleteService, AthleteProfile } from "@/lib/data-service"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  BarChart3, TrendingDown, TrendingUp, DollarSign, 
  AlertCircle, FileText, Download, Calendar, Wallet, Users, Plus, Trash2, MessageCircle 
} from "lucide-react"

export default function FinanzasPage() {
  const { user, getAllEmployees, updateEmployee } = useAuth()
  const { settings } = useSettings()
  
  const [activeTab, setActiveTab] = useState('resumen')
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [transactions, setTransactions] = useState([])
  const [athletes, setAthletes] = useState<AthleteProfile[]>([])
  const [employees, setEmployees] = useState<any[]>([])

  useEffect(() => {
    async function load() {
      const { getExpenses } = await import('@/app/actions/finance')
      const { getTransactions } = await import('@/app/actions/store')
      const { getAthletes } = await import('@/app/actions/users')
      
      const [expRes, txRes, athRes] = await Promise.all([
        getExpenses(),
        getTransactions(),
        getAthletes()
      ])
      
      if (expRes.success) setExpenses(expRes.expenses as any)
      if (txRes.success) setTransactions(txRes.transactions as any)
      if (athRes.success) setAthletes(athRes.athletes as any)

      if (getAllEmployees) {
        const emps = await getAllEmployees()
        setEmployees(emps)
      }
    }
    load()
  }, [getAllEmployees])
  
  if (!user || (user.role !== 'admin' && !user.permissions?.includes('FINANCE_VIEW') && !user.permissions?.includes('FINANCE_MANAGE'))) {
    return <div className="p-8 text-center text-red-500 font-bold">Acceso Denegado al Módulo de Finanzas.</div>
  }

  // Calcular Ingresos Totales de las transacciones
  const totalIngresos = transactions.reduce((sum, tx) => sum + tx.total, 0)
  
  // Calcular Egresos Totales
  const totalEgresos = expenses.reduce((sum, ex) => sum + ex.amount, 0)
  
  const balanceNeto = totalIngresos - totalEgresos

  // Calcular Morosos y Fiados
  const now = new Date()
  const overdueAthletes = athletes.filter(a => {
    let isOverdue = false
    if (a.membershipEnd) {
      isOverdue = new Date(a.membershipEnd) < now
    }
    const hasDebt = (a.debt || 0) > 0
    return isOverdue || hasDebt
  })
  
  // Deuda total: Membresías vencidas (estimado 30$) + Deudas reales de tienda
  const estimatedDebt = overdueAthletes.reduce((sum, a) => {
    let memberDebt = (a.membershipEnd && new Date(a.membershipEnd) < now) ? 30 : 0
    return sum + memberDebt + (a.debt || 0)
  }, 0)

  // Generar datos diarios para el gráfico de los últimos 7 días
  const last7Days = Array.from({length: 7}).map((_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    return d.toISOString().split('T')[0]
  })
  
  const finanzasData = last7Days.map(dateStr => {
    const dateObj = new Date(dateStr)
    const dayName = dateObj.toLocaleDateString('es-ES', { weekday: 'short' })
    const dayIngresos = transactions
      .filter(tx => tx.date.startsWith(dateStr))
      .reduce((sum, tx) => sum + tx.total, 0)
    const dayEgresos = expenses
      .filter(ex => ex.date.startsWith(dateStr))
      .reduce((sum, ex) => sum + ex.amount, 0)
    
    return { name: dayName.charAt(0).toUpperCase() + dayName.slice(1), ingresos: dayIngresos, egresos: dayEgresos }
  })
  
  // Calcular Ganancia por Entrenadores
  const totalGymProfitFromCoaches = employees.filter(e => e.role !== 'admin').reduce((sum, emp) => {
    const assignedAthletes = athletes.filter(a => a.coachId === emp.id)
    const commissionRate = emp.commissionRate || 0
    const commission = assignedAthletes.length * commissionRate
    const avgMembership = 30
    const profit = (assignedAthletes.length * avgMembership) - commission
    return sum + (profit > 0 ? profit : 0)
  }, 0)
  
  const egresosPorCategoria = expenses.reduce((acc, ex) => {
    acc[ex.category] = (acc[ex.category] || 0) + ex.amount;
    return acc;
  }, {} as Record<string, number>);

  const pieChartData = Object.entries(egresosPorCategoria).map(([name, value]) => ({
    name, value
  }));

  const COLORS = ['#ef4444', '#f97316', '#f59e0b', '#84cc16', '#0ea5e9', '#8b5cf6'];

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

  // Estados para Egresos
  const [showExpenseModal, setShowExpenseModal] = useState(false)
  const [expForm, setExpForm] = useState<Partial<Expense>>({
    id: '', description: '', amount: 0, category: 'Servicios'
  })
  const [isCustomCategory, setIsCustomCategory] = useState(false)

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault()
    if (!expForm.description || !expForm.amount) return
    
    if (expForm.id) {
      financeService.updateExpense(expForm.id, {
        description: expForm.description,
        amount: parseFloat(expForm.amount as any),
        category: expForm.category
      })
    } else {
      financeService.addExpense({
        description: expForm.description,
        amount: parseFloat(expForm.amount as any),
        category: expForm.category || 'Otros'
      })
    }
    setExpenses(financeService.getExpenses())
    setShowExpenseModal(false)
    setExpForm({ id: '', description: '', amount: 0, category: 'Servicios' })
    setIsCustomCategory(false)
  }

  const handleDeleteExpense = (id: string) => {
    if (confirm("¿Eliminar este gasto?")) {
      financeService.deleteExpense(id)
      setExpenses(financeService.getExpenses())
    }
  }

  const handlePayEmployee = async (emp: any, totalPay: number) => {
    if (confirm(`¿Proceder a pagar la nómina de ${settings.storeCurrency} ${totalPay.toFixed(2)} a ${emp.name}?`)) {
      financeService.addExpense({
        description: `Nómina: ${emp.name}`,
        amount: totalPay,
        category: 'Nómina'
      })
      if (updateEmployee) {
        await updateEmployee(emp.id, { ...emp, lastPaidDate: new Date().toISOString() })
      }
      if (getAllEmployees) setEmployees(await getAllEmployees())
      setExpenses(financeService.getExpenses())
    }
  }
  
  const handleSaldarDeuda = (athleteId: string, debtAmount: number) => {
    if (confirm(`¿Saldar la deuda de ${settings.storeCurrency} ${debtAmount}? (Esto registrará un ingreso)`)) {
      storeService.addTransaction({
        id: `TX-${Date.now()}`,
        date: new Date().toISOString(),
        cashierId: user?.id || 'unknown',
        customerId: athleteId,
        items: [{ productId: 'DEBT', name: 'Pago de Deuda (Fiado)', price: debtAmount, qty: 1, subtotal: debtAmount }],
        subtotal: debtAmount,
        tax: 0,
        total: debtAmount,
        paymentMethod: 'Efectivo',
        status: 'COMPLETED'
      })
      athleteService.updateAthlete(athleteId, { debt: 0 } as any) // we just overwrite that field by fetching first
      const athlete = athleteService.getAthlete(athleteId)
      if (athlete) {
         athleteService.updateAthlete({...athlete, debt: 0})
      }
      setAthletes(athleteService.getAthletes())
      setTransactions(storeService.getTransactions())
    }
  }

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
      
      let csvContent = "data:text/csv;charset=utf-8,";
      
      if (reportSection === 'Ingresos') {
        csvContent += "Fecha,Ticket,Metodo,Referencia,Monto\n";
        transactions.forEach(t => {
          csvContent += `"${new Date(t.date).toLocaleDateString()}","${t.id}","${t.paymentMethod}","${t.reference||''}","${t.total}"\n`;
        })
      } else if (reportSection === 'Egresos') {
        csvContent += "Fecha,Descripcion,Categoria,MontoUSD\n";
        expenses.forEach(e => {
          csvContent += `"${new Date(e.date).toLocaleDateString()}","${e.description}","${e.category}","${e.amount}"\n`;
        })
      } else if (reportSection === 'Cuentas por Cobrar') {
        csvContent += "Atleta,Cedula,Plan,Vencimiento,MontoEstimadoDeuda\n";
        overdueAthletes.forEach(a => {
          csvContent += `"${a.name}","${a.cedula}","${a.membershipType||'Base'}","${new Date(a.membershipEnd).toLocaleDateString()}","30"\n`;
        })
      } else if (reportSection === 'Nómina') {
        csvContent += "Empleado,Rol,Atletas,ComisionEstimada\n";
        employees.forEach(emp => {
          const count = athletes.filter(a => a.coachId === emp.id).length
          csvContent += `"${emp.name}","${emp.role}","${count}","${count*15}"\n`;
        })
      } else {
        csvContent += "Concepto,Monto\n";
        csvContent += `"Ingresos Totales","${totalIngresos}"\n`;
        csvContent += `"Egresos Totales","${totalEgresos}"\n`;
        csvContent += `"Cuentas Por Cobrar","${estimatedDebt}"\n`;
        csvContent += `"Balance Neto","${balanceNeto}"\n`;
      }

      // If PDF, just alert that it's using CSV logic for now (native JS PDF needs large libs)
      if (reportFormat === 'PDF') {
         alert("La exportación a PDF nativa requiere una librería externa (como jspdf). Para esta demostración se exportará como Excel/CSV que puedes imprimir como PDF.");
      }

      const encodedUri = encodeURI(csvContent);
      link.href = encodedUri;
      link.download = `Reporte_${reportSection.replace(/ /g, '_')}_${reportPeriod}_GymPro.csv`;
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <Card className="glass border-green-500/20">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Ingresos Totales</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-black text-green-400">{settings.storeCurrency} {totalIngresos.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground mt-1">{settings.storeCurrencySecondary} {(totalIngresos * settings.storeExchangeRate).toFixed(2)}</p>
              </CardContent>
            </Card>
            <Card className="glass border-red-500/20">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Egresos Totales</CardTitle>
                <TrendingDown className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-black text-red-400">{settings.storeCurrency} {totalEgresos.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground mt-1">{settings.storeCurrencySecondary} {(totalEgresos * settings.storeExchangeRate).toFixed(2)}</p>
              </CardContent>
            </Card>
            <Card className={`glass ${balanceNeto >= 0 ? 'border-primary/20' : 'border-red-500/20'}`}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Balance Neto</CardTitle>
                <Wallet className={`h-4 w-4 ${balanceNeto >= 0 ? 'text-primary' : 'text-red-500'}`} />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-black ${balanceNeto >= 0 ? 'text-foreground' : 'text-red-500'}`}>{settings.storeCurrency} {balanceNeto.toFixed(2)}</div>
                <p className={`text-xs mt-1 ${balanceNeto >= 0 ? 'text-primary' : 'text-red-500'}`}>{settings.storeCurrencySecondary} {(balanceNeto * settings.storeExchangeRate).toFixed(2)}</p>
              </CardContent>
            </Card>
            <Card className="glass border-orange-500/20">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Por Cobrar</CardTitle>
                <AlertCircle className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-black text-orange-400">{settings.storeCurrency} {estimatedDebt.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground mt-1">{settings.storeCurrencySecondary} {(estimatedDebt * settings.storeExchangeRate).toFixed(2)}</p>
              </CardContent>
            </Card>
            <Card className="glass border-blue-500/20">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Rentabilidad Staff</CardTitle>
                <Users className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-black text-blue-400">{settings.storeCurrency} {totalGymProfitFromCoaches.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground mt-1">{settings.storeCurrencySecondary} {(totalGymProfitFromCoaches * settings.storeExchangeRate).toFixed(2)}</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
            <Card className="glass lg:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Flujo de Ingresos y Egresos</CardTitle>
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
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${settings.storeCurrency} ${value}`} />
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.4} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', color: 'hsl(var(--foreground))', borderRadius: '8px' }}
                      itemStyle={{ color: 'hsl(var(--foreground))' }}
                      formatter={(value: any) => [`${settings.storeCurrency} ${Number(value).toFixed(2)} (${settings.storeCurrencySecondary} ${(Number(value) * settings.storeExchangeRate).toFixed(2)})`, '']}
                    />
                    <Area type="monotone" dataKey="ingresos" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorIngresos)" />
                    <Area type="monotone" dataKey="egresos" stroke="hsl(var(--destructive))" fillOpacity={1} fill="url(#colorEgresos)" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="glass">
              <CardHeader>
                <CardTitle>Gastos Administrativos</CardTitle>
              </CardHeader>
              <CardContent className="h-[300px] flex flex-col justify-center">
                {pieChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieChartData}
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {pieChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value: any) => [`${settings.storeCurrency} ${Number(value).toFixed(2)} (${settings.storeCurrencySecondary} ${(Number(value) * settings.storeExchangeRate).toFixed(2)})`, 'Monto']}
                        contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                      />
                      <Legend verticalAlign="bottom" height={36}/>
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                    No hay gastos registrados
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
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
          <div className="bg-card border border-black/10 dark:border-white/10 rounded-xl overflow-hidden glass">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm hidden md:table">
                <thead className="bg-black/5 dark:bg-black/40 border-b border-black/10 dark:border-white/10 text-muted-foreground">
                  <tr>
                    <th className="p-4 font-medium">Fecha</th>
                    <th className="p-4 font-medium">Ticket #</th>
                    <th className="p-4 font-medium">Método</th>
                    <th className="p-4 font-medium">Referencia</th>
                    <th className="p-4 font-medium">Monto</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {transactions.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(tx => (
                    <tr key={tx.id} className="hover:bg-black/5 dark:bg-white/5 transition-colors">
                      <td className="p-4 text-muted-foreground">{new Date(tx.date).toLocaleDateString()} {new Date(tx.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</td>
                      <td className="p-4 font-medium font-mono text-xs">{tx.id}</td>
                      <td className="p-4">
                        <span className="text-xs bg-black/10 dark:bg-white/10 px-2 py-0.5 rounded uppercase font-bold">{tx.paymentMethod}</span>
                      </td>
                      <td className="p-4 text-xs text-muted-foreground">{tx.reference || '-'}</td>
                      <td className="p-4">
                        <div className="font-bold text-green-500">{settings.storeCurrency} {tx.total.toFixed(2)}</div>
                        <div className="text-xs text-muted-foreground">{settings.storeCurrencySecondary} {(tx.total * settings.storeExchangeRate).toFixed(2)}</div>
                      </td>
                    </tr>
                  ))}
                  {transactions.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-muted-foreground">No hay ingresos registrados aún.</td>
                    </tr>
                  )}
                </tbody>
              </table>

              {/* Mobile View */}
              <div className="md:hidden flex flex-col divide-y divide-white/5">
                {transactions.map(tx => (
                  <div key={tx.id} className="p-4 space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-mono text-xs font-bold">{tx.id}</div>
                        <div className="text-xs text-muted-foreground">{new Date(tx.date).toLocaleDateString()} {new Date(tx.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-black text-green-500">{settings.storeCurrency} {tx.total.toFixed(2)}</div>
                        <div className="text-xs text-muted-foreground">{settings.storeCurrencySecondary} {(tx.total * settings.storeExchangeRate).toFixed(2)}</div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center text-sm pt-2">
                      <span className="text-xs bg-black/10 dark:bg-white/10 px-2 py-0.5 rounded uppercase font-bold">{tx.paymentMethod}</span>
                      <span className="text-xs text-muted-foreground">{tx.reference || '-'}</span>
                    </div>
                  </div>
                ))}
                {transactions.length === 0 && (
                  <div className="p-8 text-center text-muted-foreground">No hay ingresos registrados aún.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'egresos' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Registro de Gastos</h2>
            <div className="flex gap-2">
              <button onClick={() => setShowExpenseModal(true)} className="bg-green-500 text-white px-3 py-1.5 rounded-lg text-sm font-bold hover:bg-green-600 transition flex items-center gap-2">
                <Plus className="h-4 w-4" /> Nuevo Gasto
              </button>
              <button onClick={() => handleDownloadReport('Egresos')} className="bg-black/10 dark:bg-white/10 text-foreground px-3 py-1.5 rounded-lg text-sm font-bold hover:bg-white/20 transition flex items-center gap-2">
                <Download className="h-4 w-4" /> Exportar
              </button>
            </div>
          </div>
          
          <div className="bg-card border border-black/10 dark:border-white/10 rounded-xl overflow-hidden glass">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm hidden md:table">
                <thead className="bg-black/5 dark:bg-black/40 border-b border-black/10 dark:border-white/10 text-muted-foreground">
                  <tr>
                    <th className="p-4 font-medium">Fecha</th>
                    <th className="p-4 font-medium">Descripción</th>
                    <th className="p-4 font-medium">Categoría</th>
                    <th className="p-4 font-medium">Monto</th>
                    <th className="p-4 font-medium text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {expenses.map(ex => (
                    <tr key={ex.id} className="hover:bg-black/5 dark:bg-white/5 transition-colors">
                      <td className="p-4 text-muted-foreground">{new Date(ex.date).toLocaleDateString()} {new Date(ex.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</td>
                      <td className="p-4 font-medium">{ex.description}</td>
                      <td className="p-4">
                        <span className="text-xs bg-black/10 dark:bg-white/10 px-2 py-0.5 rounded">{ex.category}</span>
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-red-500">{settings.storeCurrency} {ex.amount.toFixed(2)}</div>
                        <div className="text-xs text-muted-foreground">{settings.storeCurrencySecondary} {(ex.amount * settings.storeExchangeRate).toFixed(2)}</div>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => { setExpForm(ex); setShowExpenseModal(true); }} className="p-2 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:bg-white/10 rounded transition">
                            Editar
                          </button>
                          <button onClick={() => handleDeleteExpense(ex.id)} className="p-2 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:bg-white/10 rounded transition text-red-400">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {expenses.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-muted-foreground">No hay gastos registrados.</td>
                    </tr>
                  )}
                </tbody>
              </table>

              {/* Mobile View */}
              <div className="md:hidden flex flex-col divide-y divide-white/5">
                {expenses.map(ex => (
                  <div key={ex.id} className="p-4 space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-bold">{ex.description}</div>
                        <div className="text-xs text-muted-foreground">{new Date(ex.date).toLocaleDateString()} {new Date(ex.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-red-500">{settings.storeCurrency} {ex.amount.toFixed(2)}</div>
                        <div className="text-xs text-muted-foreground">{settings.storeCurrencySecondary} {(ex.amount * settings.storeExchangeRate).toFixed(2)}</div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center text-sm pt-2">
                      <span className="text-xs bg-black/10 dark:bg-white/10 px-2 py-0.5 rounded">{ex.category}</span>
                      <div className="flex gap-2">
                        <button onClick={() => { setExpForm(ex); setShowExpenseModal(true); }} className="p-2 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:bg-white/10 rounded transition text-xs">
                          Editar
                        </button>
                        <button onClick={() => handleDeleteExpense(ex.id)} className="p-2 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:bg-white/10 rounded transition text-red-400">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {expenses.length === 0 && (
                  <div className="p-8 text-center text-muted-foreground">No hay gastos registrados.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL GASTO */}
      {showExpenseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="bg-card border border-black/10 dark:border-white/10 rounded-2xl max-w-sm w-full p-6 shadow-2xl glass relative">
            <h3 className="text-xl font-bold mb-4">{expForm.id ? 'Editar Gasto' : 'Registrar Gasto'}</h3>
            <form onSubmit={handleAddExpense} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Descripción</label>
                <input 
                  required autoFocus type="text" value={expForm.description} onChange={e => setExpForm({...expForm, description: e.target.value})}
                  placeholder="Ej. Pago de luz, Mantenimiento..."
                  className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-lg p-2 text-sm focus:border-primary"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Monto ({settings.storeCurrency})</label>
                  <input 
                    required type="number" step="0.01" min="0" value={expForm.amount} 
                    onChange={e => setExpForm({...expForm, amount: e.target.value as any})}
                    placeholder="0.00"
                    className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-lg p-2 text-sm focus:border-primary"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Monto ({settings.storeCurrencySecondary})</label>
                  <input 
                    required type="number" step="0.01" min="0" 
                    value={expForm.amount ? (Number(expForm.amount) * settings.storeExchangeRate).toFixed(2) : ''} 
                    onChange={e => setExpForm({...expForm, amount: (Number(e.target.value) / settings.storeExchangeRate) as any})}
                    placeholder="0.00"
                    className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-lg p-2 text-sm focus:border-primary"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Categoría</label>
                {!isCustomCategory ? (
                  <select 
                    value={expForm.category} 
                    onChange={e => {
                      if (e.target.value === 'CUSTOM') {
                        setIsCustomCategory(true);
                        setExpForm({...expForm, category: ''});
                      } else {
                        setExpForm({...expForm, category: e.target.value});
                      }
                    }}
                    className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-lg p-2 text-sm focus:border-primary"
                  >
                    <option value="Servicios">Servicios Básicos</option>
                    <option value="Mantenimiento">Mantenimiento</option>
                    <option value="Insumos">Insumos (Limpieza, etc)</option>
                    <option value="Nómina">Nómina / Pago</option>
                    <option value="Otros">Otros</option>
                    <option value="CUSTOM">+ Nueva Categoría (Escribir...)</option>
                  </select>
                ) : (
                  <div className="flex gap-2">
                    <input 
                      autoFocus required type="text" value={expForm.category} 
                      onChange={e => setExpForm({...expForm, category: e.target.value})}
                      placeholder="Ej. Publicidad..."
                      className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-lg p-2 text-sm focus:border-primary"
                    />
                    <button type="button" onClick={() => setIsCustomCategory(false)} className="px-2 bg-black/10 dark:bg-white/10 rounded text-xs">Volver</button>
                  </div>
                )}
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <button type="button" onClick={() => setShowExpenseModal(false)} className="px-4 py-2 text-sm rounded-lg bg-black/10 dark:bg-white/10 hover:bg-white/20">Cancelar</button>
                <button type="submit" className="px-4 py-2 text-sm rounded-lg bg-red-500 text-white font-bold hover:bg-red-600">Guardar</button>
              </div>
            </form>
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
          <div className="bg-card border border-black/10 dark:border-white/10 rounded-xl overflow-hidden glass">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm hidden md:table">
                <thead className="bg-black/5 dark:bg-black/40 border-b border-black/10 dark:border-white/10 text-muted-foreground">
                  <tr>
                    <th className="p-4 font-medium">Atleta / Cédula</th>
                    <th className="p-4 font-medium">Estado Membresía</th>
                    <th className="p-4 font-medium">Deuda Tienda (Fiado)</th>
                    <th className="p-4 font-medium text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {overdueAthletes.map(a => {
                    let membershipStatus = "Al día";
                    let isMembOverdue = false;
                    let diffDays = 0;
                    if (a.membershipEnd) {
                      isMembOverdue = new Date(a.membershipEnd) < now;
                      if (isMembOverdue) {
                        const diffTime = Math.abs(now.getTime() - new Date(a.membershipEnd).getTime());
                        diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                        membershipStatus = `Vencida (${diffDays} días)`;
                      } else {
                        membershipStatus = `Activa hasta ${new Date(a.membershipEnd).toLocaleDateString()}`;
                      }
                    }

                    return (
                      <tr key={a.id} className="hover:bg-black/5 dark:bg-white/5 transition-colors">
                        <td className="p-4">
                          <div className="font-bold">{a.name}</div>
                          <div className="text-xs text-muted-foreground">{a.cedula}</div>
                        </td>
                        <td className="p-4">
                          <span className={`text-xs px-2 py-0.5 rounded ${isMembOverdue ? 'bg-red-500/20 text-red-500' : 'bg-green-500/20 text-green-500'}`}>
                            {membershipStatus}
                          </span>
                        </td>
                        <td className="p-4">
                          {a.debt && a.debt > 0 ? (
                            <div className="font-bold text-orange-500">{settings.storeCurrency} {a.debt.toFixed(2)}</div>
                          ) : (
                            <div className="text-muted-foreground">-</div>
                          )}
                        </td>
                        <td className="p-4 text-right flex justify-end gap-2">
                          {a.debt && a.debt > 0 && (
                            <button 
                              onClick={() => handleSaldarDeuda(a.id, a.debt!)}
                              className="px-3 py-1.5 bg-primary/20 text-primary text-xs font-bold rounded hover:bg-primary/30 transition"
                            >
                              Saldar Deuda
                            </button>
                          )}
                          <a 
                            href={`https://wa.me/${a.phone}?text=Hola%20${encodeURIComponent(a.name)},%20te%20escribimos%20de%20${encodeURIComponent(settings.appName)}.%20Tienes%20pagos%20pendientes.`} 
                            target="_blank" 
                            rel="noreferrer"
                            className="inline-flex p-2 bg-[#25D366]/20 hover:bg-[#25D366]/30 text-[#25D366] rounded-lg transition"
                            title="Cobrar por WhatsApp"
                          >
                            <MessageCircle className="h-4 w-4" />
                          </a>
                        </td>
                      </tr>
                    );
                  })}
                  {overdueAthletes.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-muted-foreground">
                        <AlertCircle className="h-12 w-12 text-green-500/50 mx-auto mb-2" />
                        ¡Excelente! No hay cuentas por cobrar ni atletas en mora.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              {/* Mobile View */}
              <div className="md:hidden flex flex-col divide-y divide-white/5">
                {overdueAthletes.map(a => {
                  let membershipStatus = "Al día";
                  let isMembOverdue = false;
                  let diffDays = 0;
                  if (a.membershipEnd) {
                    isMembOverdue = new Date(a.membershipEnd) < now;
                    if (isMembOverdue) {
                      const diffTime = Math.abs(now.getTime() - new Date(a.membershipEnd).getTime());
                      diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                      membershipStatus = `Vencida (${diffDays} días)`;
                    } else {
                      membershipStatus = `Activa hasta ${new Date(a.membershipEnd).toLocaleDateString()}`;
                    }
                  }

                  return (
                    <div key={a.id} className="p-4 space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-bold">{a.name}</div>
                          <div className="text-xs text-muted-foreground">{a.cedula}</div>
                        </div>
                        <div className="text-right">
                          {a.debt && a.debt > 0 ? (
                            <div className="font-bold text-orange-500">{settings.storeCurrency} {a.debt.toFixed(2)}</div>
                          ) : (
                            <div className="text-muted-foreground">-</div>
                          )}
                          <div className="text-xs font-bold mt-1 uppercase">Deuda Tienda</div>
                        </div>
                      </div>
                      <div className="flex justify-between items-center text-sm pt-2">
                        <span className={`text-xs px-2 py-0.5 rounded ${isMembOverdue ? 'bg-red-500/20 text-red-500' : 'bg-green-500/20 text-green-500'}`}>
                          {membershipStatus}
                        </span>
                        <div className="flex gap-2">
                          {a.debt && a.debt > 0 && (
                            <button 
                              onClick={() => handleSaldarDeuda(a.id, a.debt!)}
                              className="px-2 py-1 bg-primary/20 text-primary text-xs font-bold rounded hover:bg-primary/30 transition"
                            >
                              Saldar Deuda
                            </button>
                          )}
                          <a 
                            href={`https://wa.me/${a.phone}?text=Hola%20${encodeURIComponent(a.name)},%20te%20escribimos%20de%20${encodeURIComponent(settings.appName)}.%20Tienes%20pagos%20pendientes.`} 
                            target="_blank" 
                            rel="noreferrer"
                            className="inline-flex p-1.5 bg-[#25D366]/20 hover:bg-[#25D366]/30 text-[#25D366] rounded transition text-xs font-bold gap-1 items-center"
                          >
                            <MessageCircle className="h-4 w-4" /> Cobrar
                          </a>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {overdueAthletes.length === 0 && (
                  <div className="p-8 text-center text-muted-foreground">
                    <AlertCircle className="h-12 w-12 text-green-500/50 mx-auto mb-2" />
                    ¡Excelente! No hay cuentas por cobrar ni atletas en mora.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'nomina' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-card border border-black/10 dark:border-white/10 rounded-xl overflow-hidden glass">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-black/5 dark:bg-black/40 border-b border-black/10 dark:border-white/10 text-muted-foreground">
                  <tr>
                    <th className="p-4 font-medium">Empleado</th>
                    <th className="p-4 font-medium">Atletas Asignados</th>
                    <th className="p-4 font-medium">Sueldo + Comisiones</th>
                    <th className="p-4 font-medium text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {employees.filter(e => e.role !== 'admin').map(emp => {
                    const assignedAthletes = athletes.filter(a => a.coachId === emp.id)
                    const baseSalary = emp.baseSalary || 0
                    const commissionRate = emp.commissionRate || 0
                    const commissionType = emp.commissionType || 'flat'
                    
                    const avgMembership = 30
                    const totalRevenueFromMembership = assignedAthletes.length * avgMembership
                    let commission = 0
                    if (settings.coachCustomPricing) {
                      const coachTotalGross = assignedAthletes.length * commissionRate
                      const gymCut = coachTotalGross * ((settings.gymCommissionPercentage || 30) / 100)
                      commission = coachTotalGross - gymCut
                    } else {
                      commission = commissionType === 'percentage' 
                        ? totalRevenueFromMembership * (commissionRate / 100) 
                        : assignedAthletes.length * commissionRate
                    }
                      
                    const totalPay = baseSalary + commission
                    const currentMonth = new Date().toISOString().substring(0, 7)
                    const isPaidThisMonth = emp.lastPaidDate && emp.lastPaidDate.startsWith(currentMonth)

                    return (
                      <tr key={emp.id} className={`transition-colors ${isPaidThisMonth ? 'bg-green-500/5' : 'hover:bg-black/5 dark:hover:bg-white/5'}`}>
                        <td className="p-4">
                          <div className="font-bold flex items-center gap-2">
                            {emp.name}
                            {isPaidThisMonth && <span className="bg-green-500 text-white text-[10px] px-1.5 py-0.5 rounded-full uppercase">Pagado</span>}
                          </div>
                          <div className="text-xs text-muted-foreground">{emp.cedula} | {emp.role}</div>
                        </td>
                        <td className="p-4">
                          <div className="font-bold">{assignedAthletes.length} atletas</div>
                        </td>
                        <td className="p-4">
                          <div className="text-xs text-muted-foreground">Base: {settings.storeCurrency} {baseSalary} + Com: {settings.storeCurrency} {commission.toFixed(2)}</div>
                          <div className="font-black text-primary">{settings.storeCurrency} {totalPay.toFixed(2)}</div>
                        </td>
                        <td className="p-4 text-right flex justify-end gap-2">
                          {!isPaidThisMonth ? (
                            <button onClick={() => handlePayEmployee(emp, totalPay)} className="px-3 py-1.5 bg-green-500 text-white text-xs font-bold rounded hover:bg-green-600 transition shadow-lg shadow-green-500/20">
                              Pagar Nómina
                            </button>
                          ) : (
                            <button disabled className="px-3 py-1.5 bg-green-500/20 text-green-500 text-xs font-bold rounded cursor-not-allowed">
                              Nómina Pagada
                            </button>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                  {employees.filter(e => e.role !== 'admin').length === 0 && (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-muted-foreground">No hay entrenadores o empleados registrados.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
