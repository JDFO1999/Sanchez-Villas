"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, CheckCircle2, FileEdit, UserCheck } from "lucide-react"
import { dataService, athleteService, AthleteRoutine } from "@/lib/data-service"
import Link from "next/link"

export function CoachDashboard() {
  const { user } = useAuth()
  const [routines, setRoutines] = useState<AthleteRoutine[]>([])

  useEffect(() => {
    // Load from mock db
    setRoutines(dataService.getRoutines())
  }, [])

  const handleVerify = (id: string) => {
    dataService.verifyByCoach(id)
    setRoutines(dataService.getRoutines())
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tighter bg-gradient-to-r from-primary dark:dark:via-white via-black via-black to-primary/50 bg-clip-text text-transparent dark:dark:drop-shadow-[0_0_15px_rgba(255,255,255,0.1)] drop-shadow-sm drop-shadow-sm">Panel de Entrenador</h1>
          <p className="text-muted-foreground mt-1">
            Gestiona las rutinas, dietas y verifica la asistencia de tus atletas.
          </p>
        </div>
        <button className="bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium shadow-sm hover:bg-primary/90 transition flex items-center gap-2">
          <FileEdit className="h-4 w-4" />
          Nueva Asignación
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Atletas a tu cargo hoy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {routines.map((routine) => {
                const athlete = athleteService.getAthleteById(routine.athleteId)
                return (
                <div key={routine.id} className="p-4 border border-black/10 dark:border-white/10 rounded-xl bg-card hover:bg-secondary/20 transition">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <Link href={`/atletas/${routine.athleteId}`} className="font-bold text-foreground hover:text-primary transition underline-offset-4 hover:underline">
                        {athlete ? `${athlete.name} (C.C. ${athlete.cedula})` : `Atleta ${routine.athleteId}`}
                      </Link>
                      <p className="text-sm text-primary font-medium">{routine.title}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-muted-foreground block">{routine.date}</span>
                      {routine.coachVerified ? (
                        <span className="inline-flex items-center gap-1 text-xs text-green-500 mt-1 bg-green-500/10 px-2 py-1 rounded-full">
                          <CheckCircle2 className="h-3 w-3" /> Verificado
                        </span>
                      ) : routine.completed ? (
                        <span className="inline-flex items-center gap-1 text-xs text-orange-500 mt-1 bg-orange-500/10 px-2 py-1 rounded-full">
                          <UserCheck className="h-3 w-3" /> Reportó Asistencia
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground mt-1 bg-black/5 dark:bg-white/5 px-2 py-1 rounded-full">
                          Pendiente
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-xs text-muted-foreground mb-4">
                    <strong>Dieta asignada:</strong> {routine.diet}
                  </div>

                  {!routine.coachVerified && routine.completed && (
                    <div className="text-xs text-orange-500 bg-orange-500/10 p-2 rounded text-center">
                      Esperando que Recepción valide la entrada.
                    </div>
                  )}
                </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Asignar Nueva Rutina</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); alert('Modo Mock: Asignación guardada.'); }}>
              <div>
                <label className="text-sm font-medium block mb-1.5">Atleta</label>
                <select className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-lg p-2.5 text-sm text-foreground focus:outline-none focus:border-primary">
                  <option>Juan (9012)</option>
                  <option>María (8013)</option>
                </select>
              </div>
              
              <div>
                <label className="text-sm font-medium block mb-1.5">Fecha</label>
                <select className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-lg p-2.5 text-sm text-foreground focus:outline-none focus:border-primary">
                  <option>Hoy</option>
                  <option>Mañana</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium block mb-1.5">Enfoque (Rutina)</label>
                <input type="text" placeholder="Ej. Empuje (Pecho/Tríceps)" className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-lg p-2.5 text-sm text-foreground focus:outline-none focus:border-primary" />
              </div>

              <div>
                <label className="text-sm font-medium block mb-1.5">Pauta de Dieta</label>
                <textarea rows={3} placeholder="Instrucciones alimenticias para hoy..." className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-lg p-2.5 text-sm text-foreground focus:outline-none focus:border-primary"></textarea>
              </div>

              <button type="submit" className="w-full bg-primary text-primary-foreground font-bold py-2.5 rounded-lg hover:bg-primary/90 transition">
                Asignar al Atleta
              </button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
