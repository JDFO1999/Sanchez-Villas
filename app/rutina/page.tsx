"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PlayCircle, Clock, Calendar, CheckCircle, Info, Apple, CheckCircle2 } from "lucide-react"
import { dataService, AthleteRoutine } from "@/lib/data-service"

export default function RutinaPage() {
  const { user } = useAuth()
  const [routine, setRoutine] = useState<AthleteRoutine | null>(null)

  useEffect(() => {
    // In a real app we'd fetch by user.id
    const routines = dataService.getRoutines()
    if (routines.length > 0) {
      setRoutine(routines[0])
    }
  }, [])

  const handleCompletar = () => {
    if (routine) {
      dataService.markCompletedByAthlete(routine.id)
      const routines = dataService.getRoutines()
      setRoutine(routines.find(r => r.id === routine.id) || null)
    }
  }

  if (!routine) return <div className="p-8 text-center text-muted-foreground">Cargando rutina...</div>

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tu Entrenamiento</h1>
          <p className="text-muted-foreground mt-1">
            Asignado para hoy por tu entrenador
          </p>
        </div>
        
        {routine.completed || routine.coachVerified ? (
          <div className="bg-green-500/20 text-green-500 border border-green-500/50 px-4 py-2 rounded-md font-medium flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5" />
            ¡Día Completado!
          </div>
        ) : (
          <button 
            onClick={handleCompletar}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium shadow-sm hover:bg-primary/90 transition flex items-center gap-2"
          >
            <PlayCircle className="h-5 w-5" />
            Marcar como Realizada
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-6">
          <Card className="border-primary/20 bg-primary/5 glass">
            <CardHeader>
              <CardTitle>Resumen del Día</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-xl font-bold text-primary">{routine.title}</h3>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>{routine.duration}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>{routine.date === new Date().toISOString().split("T")[0] ? "Para Hoy" : routine.date}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-white/10">
                <p className="text-sm font-medium mb-2">Pauta Nutricional (Dieta):</p>
                <div className="p-3 rounded-lg bg-black/40 text-sm text-muted-foreground flex gap-3 items-start">
                  <Apple className="h-5 w-5 shrink-0 mt-0.5 text-green-500" />
                  <p>{routine.diet}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {routine.coachVerified && (
            <div className="p-4 rounded-xl border border-green-500/30 bg-green-500/10 text-green-500 text-sm flex gap-3">
              <CheckCircle2 className="h-5 w-5 shrink-0" />
              <p>Tu entrenador ha verificado personalmente tu asistencia y rendimiento de hoy. ¡Excelente trabajo!</p>
            </div>
          )}
        </div>

        <Card className="md:col-span-2 glass">
          <CardHeader>
            <CardTitle>Ejercicios</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {routine.exercises.map((ex, idx) => (
                <div key={idx} className="p-4 rounded-xl border border-white/5 bg-secondary/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group hover:border-primary/30 transition">
                  <div className="flex gap-4 items-start">
                    <div className="h-8 w-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold shrink-0">
                      {idx + 1}
                    </div>
                    <div>
                      <h4 className="font-semibold">{ex.name}</h4>
                      <p className="text-sm text-muted-foreground mt-1">{ex.notes}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    <div className="text-center bg-black/40 px-3 py-1.5 rounded-lg min-w-[70px]">
                      <p className="text-xs text-muted-foreground">Series</p>
                      <p className="font-bold">{ex.sets}</p>
                    </div>
                    <div className="text-center bg-black/40 px-3 py-1.5 rounded-lg min-w-[70px]">
                      <p className="text-xs text-muted-foreground">Reps</p>
                      <p className="font-bold">{ex.reps}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
