"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Store, QrCode, ClipboardCheck, Wallet, Camera } from "lucide-react"
import { athleteService, AthleteProfile, dataService } from "@/lib/data-service"
import Link from "next/link"
import { QRScanner } from "@/components/qr-scanner"
import Swal from "sweetalert2"

export function ReceptionDashboard() {
  const { user } = useAuth()
  const [athletes, setAthletes] = useState<AthleteProfile[]>([])
  const [search, setSearch] = useState("")

  const [showScanner, setShowScanner] = useState(false)
  const [cashSession, setCashSession] = useState<any>(null)
  const [isLoadingSession, setIsLoadingSession] = useState(true)

  useEffect(() => {
    setAthletes(athleteService.getAthletes())
    
    // Fetch active cash session
    if (user?.id) {
      import('@/app/actions/cash').then(({ getCurrentCashSession }) => {
        getCurrentCashSession(user.id).then(res => {
          if (res.success) setCashSession(res.session)
          setIsLoadingSession(false)
        })
      })
    }
  }, [user?.id])

  const [checkedInIds, setCheckedInIds] = useState<Record<string, boolean>>({})

  const [universalSearch, setUniversalSearch] = useState("")

  const handleUniversalCheckIn = async (e?: React.FormEvent, code?: string) => {
    if (e) e.preventDefault()
    const targetCode = code || universalSearch
    if (!targetCode) return
    
    const { checkInByCedula } = await import("@/app/actions/attendance")
    const res = await checkInByCedula(targetCode)
    
    if (res.success) {
      Swal.fire({ toast: true, position: 'top-end', showConfirmButton: false, timer: 3000, timerProgressBar: true, icon: 'success', title: `✅ Entrada: ${res.user?.name} (${res.user?.role})` })
      setUniversalSearch("")
      setShowScanner(false)
    } else {
      Swal.fire({ toast: true, position: 'top-end', showConfirmButton: false, timer: 3000, timerProgressBar: true, icon: 'error', title: res.error })
    }
  }

  const handleOpenSession = async () => {
    const { value: startingCash } = await Swal.fire({
      title: 'Abrir Turno de Caja',
      input: 'number',
      inputLabel: '¿Con cuánto efectivo en físico estás abriendo la caja?',
      inputPlaceholder: 'Monto base. Ej: 50',
      showCancelButton: true,
      inputValidator: (value) => {
        if (!value) return 'Debes ingresar un monto.'
      }
    })

    if (startingCash && user?.id) {
      const { openCashSession } = await import('@/app/actions/cash')
      const res = await openCashSession(user.id, Number(startingCash))
      if (res.success) {
        setCashSession(res.session)
        Swal.fire('Turno Abierto', 'Ya puedes empezar a facturar.', 'success')
      } else {
        Swal.fire('Error', res.error, 'error')
      }
    }
  }

  const handleCloseSession = async () => {
    const { value: declaredCash } = await Swal.fire({
      title: 'Cerrar Turno de Caja',
      input: 'number',
      inputLabel: '¿Cuánto efectivo EXACTO tienes en la caja fuerte ahora mismo?',
      inputPlaceholder: 'Efectivo declarado',
      showCancelButton: true,
      inputValidator: (value) => {
        if (!value) return 'Debes declarar el efectivo físico.'
      }
    })

    if (declaredCash && cashSession?.id) {
      const { closeCashSession } = await import('@/app/actions/cash')
      const res = await closeCashSession(cashSession.id, Number(declaredCash))
      
      if (res.success) {
        setCashSession(null)
        
        const diff = Number(declaredCash) - res.session.expectedCash
        const diffText = diff === 0 
          ? '<b class="text-green-500">¡Caja Cuadrada Perfectamente!</b>' 
          : diff > 0 
            ? `<b class="text-yellow-500">Sobrante de Caja: +$${diff.toFixed(2)}</b>`
            : `<b class="text-red-500">Faltante de Caja: -$${Math.abs(diff).toFixed(2)}</b>`
            
        Swal.fire({
          title: 'Turno Cerrado',
          html: `
            Resumen del Turno:<br/>
            Efectivo Esperado: $${res.session.expectedCash.toFixed(2)}<br/>
            Efectivo Declarado: $${Number(declaredCash).toFixed(2)}<br/><br/>
            ${diffText}
          `,
          icon: diff < 0 ? 'warning' : 'success'
        })
      } else {
        Swal.fire('Error', res.error, 'error')
      }
    }
  }

  const handleCheckIn = (id: string) => {
    // Buscar si el atleta tiene rutina hoy para marcar coachVerified
    const routines = dataService.getRoutines()
    const today = new Date().toISOString().split('T')[0]
    const activeRoutine = routines.find(r => r.athleteId === id && r.date === today)
    
    if (activeRoutine) {
      dataService.verifyByCoach(activeRoutine.id) // Recepción valida la entrada
    }
    
    setCheckedInIds(prev => ({...prev, [id]: true}))
    
    import("sweetalert2").then((Swal) => {
      const Toast = Swal.default.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
      })
      Toast.fire({ icon: 'success', title: 'Entrada registrada exitosamente' })
    })
  }

  const filteredAthletes = athletes.filter(a =>  
    a.name.toLowerCase().includes(search.toLowerCase()) || 
    a.cedula.includes(search)
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tighter bg-gradient-to-r from-primary dark:via-white via-black to-primary/50 bg-clip-text text-transparent dark:drop-shadow-[0_0_15px_rgba(255,255,255,0.1)] drop-shadow-sm">Panel de Recepción</h1>
          <p className="text-muted-foreground mt-1">
            Control de acceso, ventas y registro de atletas.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/tienda" className="bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium shadow-sm hover:bg-primary/90 transition flex items-center gap-2">
            <Store className="h-4 w-4" />
            Punto de Venta
          </Link>
          <Link href="/registro" className="bg-black/10 dark:bg-white/10 text-foreground px-4 py-2 rounded-md font-medium shadow-sm hover:bg-black/20 dark:hover:bg-white/20 transition flex items-center gap-2">
            <Users className="h-4 w-4" />
            Nuevo Atleta
          </Link>
        </div>
      </div>

      {!isLoadingSession && (
        <div className={`p-4 rounded-xl border ${cashSession ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'} flex flex-col md:flex-row justify-between items-center gap-4`}>
          <div>
            <h3 className="font-bold text-lg flex items-center gap-2">
              <Wallet className="h-5 w-5" /> 
              Estado de Caja: {cashSession ? <span className="text-green-500">ABIERTA</span> : <span className="text-red-500">CERRADA</span>}
            </h3>
            <p className="text-sm text-muted-foreground">
              {cashSession 
                ? `Turno iniciado a las ${new Date(cashSession.startTime).toLocaleTimeString()} con $${cashSession.startingCash.toFixed(2)}` 
                : 'Debes abrir turno para poder facturar en el Punto de Venta.'}
            </p>
          </div>
          <button 
            onClick={cashSession ? handleCloseSession : handleOpenSession}
            className={`px-6 py-3 rounded-lg font-bold text-white shadow-lg transition ${cashSession ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}`}
          >
            {cashSession ? 'Cerrar Turno (Arqueo)' : 'Abrir Turno de Caja'}
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="col-span-1 md:col-span-2 border-primary/50 shadow-lg shadow-primary/10">
          <CardHeader className="bg-primary/5 border-b border-primary/10 flex flex-row items-center justify-between">
            <CardTitle className="text-xl flex items-center gap-2">
              <QrCode className="h-5 w-5 text-primary" /> Reloj Checador (Staff y Atletas)
            </CardTitle>
            <button 
              onClick={() => setShowScanner(true)}
              className="bg-primary text-white font-bold px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-primary/90"
            >
              <Camera className="h-5 w-5" /> Escanear Código QR
            </button>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleUniversalCheckIn} className="flex gap-2">
              <input 
                type="text" 
                placeholder="Ingresar Cédula para registrar entrada (Empleados o Atletas)..." 
                value={universalSearch}
                onChange={e => setUniversalSearch(e.target.value)}
                className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-lg p-4 text-lg focus:outline-none focus:border-primary font-mono text-center"
                autoFocus
              />
              <button type="submit" className="bg-primary text-white font-bold px-8 rounded-lg shadow-sm hover:bg-primary/90 transition text-lg whitespace-nowrap">
                Marcar Asistencia
              </button>
            </form>
          </CardContent>
        </Card>

        <Card className="col-span-1 md:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Control de Acceso Manual</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4 relative">
              <input 
                type="text" 
                placeholder="Buscar por Cédula o Nombre para dar entrada..." 
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-lg p-3 text-sm focus:outline-none focus:border-primary"
              />
            </div>
            
            <div className="space-y-2">
              {filteredAthletes.slice(0, 5).map(a => {
                const isOverdue = new Date(a.membershipEnd) < new Date()
                return (
                  <div key={a.id} className="flex justify-between items-center p-3 border border-black/10 dark:border-white/10 rounded-lg bg-card hover:bg-secondary/20 transition">
                    <div>
                      <h4 className="font-bold text-sm">{a.name} (C.C. {a.cedula})</h4>
                      <p className={`text-xs ${isOverdue ? 'text-red-500 font-bold' : 'text-muted-foreground'}`}>
                        Vence: {new Date(a.membershipEnd).toLocaleDateString()} {isOverdue && '(VENCIDO)'}
                      </p>
                    </div>
                    <button 
                      onClick={() => handleCheckIn(a.id)}
                      disabled={isOverdue || checkedInIds[a.id]}
                      className={`px-4 py-2 text-xs font-bold rounded-lg flex items-center gap-2 transition ${
                        isOverdue 
                          ? 'bg-black/10 dark:bg-white/10 text-muted-foreground cursor-not-allowed' 
                          : checkedInIds[a.id]
                            ? 'bg-green-500 text-white'
                            : 'bg-red-500/10 text-red-600 hover:bg-red-500/20 dark:bg-red-500/20 dark:text-red-400'
                      }`}
                    >
                      <ClipboardCheck className="h-4 w-4" />
                      {isOverdue ? 'Vencido' : checkedInIds[a.id] ? 'Listo' : 'Dar Entrada'}
                    </button>
                  </div>
                )
              })}
              {filteredAthletes.length === 0 && search && (
                <div className="text-center p-4 text-sm text-muted-foreground">
                  No se encontró el atleta.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {showScanner && (
        <QRScanner 
          onScan={(code) => handleUniversalCheckIn(undefined, code)}
          onClose={() => setShowScanner(false)}
        />
      )}
    </div>
  )
}
