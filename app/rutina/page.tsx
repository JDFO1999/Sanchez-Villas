"use client"

import { useState, useEffect } from "react"
import { AppLayout } from "@/components/layout/app-layout"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Dumbbell, CheckCircle2, Clock, CalendarDays, Activity, ChevronRight, Apple } from "lucide-react"
import { getAthleteData, markRoutineCompleted } from "@/app/actions/routines"

export default function RutinaPage() {
  const { user } = useAuth()
  const [routines, setRoutines] = useState<any[]>([])
  const [diets, setDiets] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"ROUTINAS" | "DIETAS">("ROUTINAS")

  useEffect(() => {
    if (user?.id && user.role === "ATHLETE") {
      loadData()
    } else {
      setIsLoading(false)
    }
  }, [user])

  async function loadData() {
    setIsLoading(true)
    const res = await getAthleteData(user!.id)
    if (res.success) {
      setRoutines(res.routines || [])
      setDiets(res.diets || [])
    }
    setIsLoading(false)
  }

  const handleComplete = async (routineId: string) => {
    const res = await markRoutineCompleted(routineId)
    if (res.success) {
      loadData()
    }
  }

  if (user?.role !== "ATHLETE") {
    return (
      <AppLayout>
        <div className="p-8">
          <h1 className="text-2xl font-bold">Acceso Denegado</h1>
          <p className="text-muted-foreground">Esta pgina es exclusiva para atletas.</p>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="p-4 sm:p-8 space-y-6 max-w-5xl mx-auto">
        <div>
          <h1 className="text-4xl font-black tracking-tighter bg-gradient-to-r from-primary dark:via-white via-black to-primary/50 bg-clip-text text-transparent">Tu Entrenamiento</h1>
          <p className="text-muted-foreground mt-1">
            Visualiza tus rutinas y dietas asignadas por tu coach.
          </p>
        </div>

        <div className="flex gap-4 border-b border-black/10 dark:border-white/10 pb-2">
          <button 
            onClick={() => setActiveTab("ROUTINAS")}
            className={`px-4 py-2 font-bold transition-all border-b-2 ${activeTab === 'ROUTINAS' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-primary'}`}
          >
            Rutinas ({routines.length})
          </button>
          <button 
            onClick={() => setActiveTab("DIETAS")}
            className={`px-4 py-2 font-bold transition-all border-b-2 ${activeTab === 'DIETAS' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-primary'}`}
          >
            Dietas ({diets.length})
          </button>
        </div>

        {isLoading ? (
          <p className="text-muted-foreground">Cargando tus planes...</p>
        ) : activeTab === "ROUTINAS" ? (
          routines.length === 0 ? (
            <Card className="shadow-none border border-black/10 dark:border-white/10 rounded-xl bg-transparent p-8 text-center">
              <Dumbbell className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-bold">Sin Rutinas</h3>
              <p className="text-muted-foreground text-sm mt-2">An no tienes rutinas asignadas por tu entrenador.</p>
            </Card>
          ) : (
            <div className="space-y-6">
              {routines.map((routine) => (
                <Card key={routine.id} className={`shadow-none border-2 rounded-xl bg-transparent transition-all ${routine.completed ? 'border-green-500/50 opacity-80' : 'border-primary/50'}`}>
                  <CardHeader className="pb-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-2xl font-bold flex items-center gap-2">
                          {routine.completed && <CheckCircle2 className="w-6 h-6 text-green-500" />}
                          {routine.title}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-4 mt-2 font-medium">
                          <span className="flex items-center gap-1"><CalendarDays className="w-4 h-4"/> {new Date(routine.date).toLocaleDateString()}</span>
                          <span className="flex items-center gap-1"><Clock className="w-4 h-4"/> {routine.duration}</span>
                          <span className="flex items-center gap-1"><Activity className="w-4 h-4"/> Coach: {routine.coach?.name}</span>
                        </CardDescription>
                      </div>
                      {!routine.completed && (
                        <button 
                          onClick={() => handleComplete(routine.id)}
                          className="border border-green-500 text-green-500 hover:bg-green-500/10 px-4 py-2 rounded-lg font-bold transition bg-transparent"
                        >
                          Completar Hoy
                        </button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {routine.exercises?.map((ex: any, idx: number) => (
                        <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 group hover:border-primary/50 transition">
                          <div className="flex items-center gap-4">
                            <div className="bg-primary/20 text-primary w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0">
                              {idx + 1}
                            </div>
                            <div>
                              <h4 className="font-bold text-lg">{ex.name}</h4>
                              {ex.notes && <p className="text-sm text-muted-foreground mt-1">{ex.notes}</p>}
                            </div>
                          </div>
                          <div className="flex gap-6 mt-4 sm:mt-0 bg-white dark:bg-black/40 px-4 py-2 rounded-lg border border-black/10 dark:border-white/10 shrink-0">
                            <div className="text-center">
                              <span className="text-[10px] uppercase font-bold text-muted-foreground block">Series</span>
                              <span className="text-xl font-black text-primary">{ex.sets}</span>
                            </div>
                            <div className="w-px bg-black/10 dark:bg-white/10"></div>
                            <div className="text-center">
                              <span className="text-[10px] uppercase font-bold text-muted-foreground block">Reps</span>
                              <span className="text-xl font-black text-primary">{ex.reps}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )
        ) : (
          diets.length === 0 ? (
            <Card className="shadow-none border border-black/10 dark:border-white/10 rounded-xl bg-transparent p-8 text-center">
              <Apple className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-bold">Sin Dietas</h3>
              <p className="text-muted-foreground text-sm mt-2">An no tienes dietas asignadas por tu entrenador.</p>
            </Card>
          ) : (
            <div className="space-y-6">
              {diets.map((diet) => (
                <Card key={diet.id} className="shadow-none border-2 border-primary/50 rounded-xl bg-transparent">
                  <CardHeader>
                    <CardTitle className="text-2xl font-bold flex items-center gap-2">
                      <Apple className="w-6 h-6 text-primary" />
                      {diet.title}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-4 mt-2 font-medium">
                      <span className="flex items-center gap-1"><CalendarDays className="w-4 h-4"/> {new Date(diet.date).toLocaleDateString()}</span>
                      <span className="flex items-center gap-1"><Activity className="w-4 h-4"/> Coach: {diet.coach?.name}</span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="p-6 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 whitespace-pre-wrap font-medium">
                      {diet.description}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )
        )}
      </div>
    </AppLayout>
  )
}
