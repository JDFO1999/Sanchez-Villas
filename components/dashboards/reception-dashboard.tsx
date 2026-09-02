"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Store, QrCode, ClipboardCheck } from "lucide-react"
import { athleteService, AthleteProfile, dataService } from "@/lib/data-service"
import Link from "next/link"

export function ReceptionDashboard() {
  const { user } = useAuth()
  const [athletes, setAthletes] = useState<AthleteProfile[]>([])
  const [search, setSearch] = useState("")

  useEffect(() => {
    setAthletes(athleteService.getAthletes())
  }, [])

  const [checkedInIds, setCheckedInIds] = useState<Record<string, boolean>>({})

  const [universalSearch, setUniversalSearch] = useState("")

  const handleUniversalCheckIn = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!universalSearch) return
    
    const { checkInByCedula } = await import("@/app/actions/attendance")
    const res = await checkInByCedula(universalSearch)
    
    import("sweetalert2").then((Swal) => {
      const Toast = Swal.default.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
      })
      if (res.success) {
        Toast.fire({ icon: 'success', title: `✅ Entrada: ${res.user?.name} (${res.user?.role})` })
        setUniversalSearch("")
      } else {
        Toast.fire({ icon: 'error', title: res.error })
      }
    })
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="col-span-1 md:col-span-2 border-primary/50 shadow-lg shadow-primary/10">
          <CardHeader className="bg-primary/5 border-b border-primary/10">
            <CardTitle className="text-xl flex items-center gap-2">
              <QrCode className="h-5 w-5 text-primary" /> Reloj Checador (Staff y Atletas)
            </CardTitle>
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
    </div>
  )
}
