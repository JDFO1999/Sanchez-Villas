"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PlayCircle, Clock, Calendar, CheckCircle, Info, Apple, CheckCircle2, ChevronLeft, ChevronRight } from "lucide-react"

// Mock data for the 3 days
const routinesData = {
  yesterday: {
    id: "r_yest",
    title: "Espalda y Bíceps",
    duration: "45 min",
    date: "Ayer",
    completed: true,
    diet: "Alto en carbohidratos complejos. 1 batido post-entreno.",
    exercises: [
      { name: "Jalón al pecho", sets: 4, reps: "10-12", notes: "Controlar excéntrica" },
      { name: "Remo con barra", sets: 4, reps: "10", notes: "Espalda recta" },
      { name: "Curl de bíceps alterno", sets: 3, reps: "12", notes: "" }
    ]
  },
  today: {
    id: "r_tod",
    title: "Pierna y Glúteo",
    duration: "60 min",
    date: "Hoy",
    completed: false,
    diet: "Aumento de proteínas. Comer algo ligero 1h antes del entreno.",
    exercises: [
      { name: "Sentadilla Libre", sets: 4, reps: "10-12", notes: "Profundidad máxima" },
      { name: "Prensa Inclinada", sets: 4, reps: "12", notes: "No bloquear rodillas" },
      { name: "Extensión de Cuádriceps", sets: 3, reps: "15", notes: "Sostener arriba 1s" },
      { name: "Hip Thrust", sets: 4, reps: "10", notes: "Apretar glúteo" }
    ]
  },
  tomorrow: {
    id: "r_tom",
    title: "Pecho y Tríceps",
    duration: "50 min",
    date: "Mañana",
    completed: false,
    diet: "Día de moderados carbohidratos. Mantener buena hidratación.",
    exercises: [
      { name: "Press de Banca", sets: 4, reps: "8-10", notes: "Barra a nivel del pecho" },
      { name: "Aperturas con mancuernas", sets: 3, reps: "12", notes: "Estirar bien el pectoral" },
      { name: "Extensión de tríceps polea", sets: 4, reps: "15", notes: "Codos pegados al cuerpo" }
    ]
  }
}

export default function RutinaPage() {
  const { user } = useAuth()
  const [selectedDay, setSelectedDay] = useState<'yesterday' | 'today' | 'tomorrow'>('today')
  
  type ExState = 'pending' | 'progress' | 'completed' | 'failed'
  // Track checked exercises by day and index
  const [exerciseStates, setExerciseStates] = useState<Record<string, Record<number, ExState>>>({
    yesterday: { 0: 'completed', 1: 'completed', 2: 'completed' }, // all completed yesterday
    today: {},
    tomorrow: {}
  })

  const [routineCompleted, setRoutineCompleted] = useState<Record<string, boolean>>({
    yesterday: true,
    today: false,
    tomorrow: false
  })

  const routine = routinesData[selectedDay]
  const currentStates = exerciseStates[selectedDay] || {}
  const allChecked = routine.exercises.length > 0 && routine.exercises.every((_, i) => currentStates[i] === 'completed')

  const changeExerciseState = (idx: number, newState: ExState) => {
    if (selectedDay !== 'today') {
      alert(selectedDay === 'yesterday' ? "No puedes modificar una rutina de ayer, ya finalizó." : "No puedes modificar una rutina de mañana, aún no ha comenzado.")
      return
    }
    setExerciseStates(prev => ({
      ...prev,
      [selectedDay]: {
        ...prev[selectedDay],
        [idx]: newState
      }
    }))
  }

  const handleCompletar = () => {
    if (selectedDay !== 'today') return
    // If marking as complete, check all exercises
    const newStates = { ...currentStates }
    routine.exercises.forEach((_, i) => { newStates[i] = 'completed' })
    
    setExerciseStates(prev => ({
      ...prev,
      [selectedDay]: newStates
    }))
    
    setRoutineCompleted(prev => ({
      ...prev,
      [selectedDay]: true
    }))
  }

  const isCompleted = routineCompleted[selectedDay] || (allChecked && Object.keys(currentStates).length > 0)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tighter bg-gradient-to-r from-primary dark:dark:via-white via-black via-black to-primary/50 bg-clip-text text-transparent dark:dark:drop-shadow-[0_0_15px_rgba(255,255,255,0.1)] drop-shadow-sm drop-shadow-sm">Tu Entrenamiento</h1>
          <p className="text-muted-foreground mt-1">
            Revisa y completa tus rutinas asignadas.
          </p>
        </div>
        
        {isCompleted ? (
          <div className="bg-green-500/20 text-green-500 border border-green-500/50 px-4 py-2 rounded-md font-medium flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5" />
            ¡Rutina Completada!
          </div>
        ) : selectedDay === 'today' ? (
          <button 
            onClick={handleCompletar}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium shadow-sm hover:bg-primary/90 transition flex items-center gap-2"
          >
            <PlayCircle className="h-5 w-5" />
            Marcar todo como Realizado
          </button>
        ) : (
          <div className="bg-black/10 dark:bg-white/10 text-muted-foreground px-4 py-2 rounded-md font-medium flex items-center gap-2">
            {selectedDay === 'yesterday' ? 'Completado en el pasado' : 'Aún no disponible'}
          </div>
        )}
      </div>

      <div className="flex bg-black/5 dark:bg-black/40 p-1 rounded-lg w-fit border border-black/5 dark:border-white/5">
        <button 
          onClick={() => setSelectedDay('yesterday')}
          className={`px-6 py-2 rounded-md text-sm font-medium transition ${selectedDay === 'yesterday' ? 'bg-primary text-primary-foreground shadow-sm' : 'hover:bg-black/5 dark:bg-white/5 text-muted-foreground'}`}
        >
          Ayer
        </button>
        <button 
          onClick={() => setSelectedDay('today')}
          className={`px-6 py-2 rounded-md text-sm font-medium transition ${selectedDay === 'today' ? 'bg-primary text-primary-foreground shadow-sm' : 'hover:bg-black/5 dark:bg-white/5 text-muted-foreground'}`}
        >
          Hoy
        </button>
        <button 
          onClick={() => setSelectedDay('tomorrow')}
          className={`px-6 py-2 rounded-md text-sm font-medium transition ${selectedDay === 'tomorrow' ? 'bg-primary text-primary-foreground shadow-sm' : 'hover:bg-black/5 dark:bg-white/5 text-muted-foreground'}`}
        >
          Mañana
        </button>
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
                  <span>{routine.date}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-black/10 dark:border-white/10">
                <p className="text-sm font-medium mb-2">Pauta Nutricional (Dieta):</p>
                <div className="p-3 rounded-lg bg-black/5 dark:bg-black/40 text-sm text-muted-foreground flex gap-3 items-start">
                  <Apple className="h-5 w-5 shrink-0 mt-0.5 text-green-500" />
                  <p>{routine.diet}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="md:col-span-2 glass">
          <CardHeader>
            <CardTitle>Ejercicios ({Object.keys(currentChecked).length}/{routine.exercises.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {routine.exercises.map((ex, idx) => {
                const state = currentStates[idx] || 'pending'
                const isChecked = state === 'completed'
                const isFailed = state === 'failed'
                const isProgress = state === 'progress'

                let borderClass = 'border-black/5 dark:border-white/5 bg-secondary/10'
                if (isChecked) borderClass = 'border-green-500/50 bg-green-500/10'
                else if (isFailed) borderClass = 'border-red-500/50 bg-red-500/10'
                else if (isProgress) borderClass = 'border-yellow-500/50 bg-yellow-500/10'

                return (
                  <div 
                    key={idx} 
                    className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition ${borderClass}`}
                  >
                    <div className="flex gap-4 items-start flex-1">
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold shrink-0 transition-colors ${isChecked ? 'bg-green-500 text-white' : isFailed ? 'bg-red-500 text-white' : isProgress ? 'bg-yellow-500 text-white' : 'bg-primary/20 text-primary'}`}>
                        {isChecked ? <CheckCircle2 className="h-5 w-5" /> : idx + 1}
                      </div>
                      <div>
                        <h4 className={`font-semibold ${isChecked ? 'text-green-500 line-through opacity-70' : isFailed ? 'text-red-500 line-through opacity-70' : isProgress ? 'text-yellow-600 dark:text-yellow-400' : ''}`}>{ex.name}</h4>
                        <p className="text-sm text-muted-foreground mt-1">{ex.notes}</p>
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-3 shrink-0">
                      <div className={`flex items-center gap-4 ${isChecked || isFailed ? 'opacity-50' : ''}`}>
                        <div className="text-center bg-black/5 dark:bg-black/40 px-3 py-1.5 rounded-lg min-w-[70px]">
                          <p className="text-xs text-muted-foreground">Series</p>
                          <p className="font-bold">{ex.sets}</p>
                        </div>
                        <div className="text-center bg-black/5 dark:bg-black/40 px-3 py-1.5 rounded-lg min-w-[70px]">
                          <p className="text-xs text-muted-foreground">Reps</p>
                          <p className="font-bold">{ex.reps}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1 mt-2 sm:mt-0 justify-end">
                         <button 
                            onClick={() => changeExerciseState(idx, 'failed')}
                            className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors ${isFailed ? 'bg-red-500 text-white' : 'bg-red-500/10 text-red-500 hover:bg-red-500/20'}`}
                         >
                           No Realizado
                         </button>
                         <button 
                            onClick={() => changeExerciseState(idx, 'progress')}
                            className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors ${isProgress ? 'bg-yellow-500 text-white' : 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 hover:bg-yellow-500/20'}`}
                         >
                           En Progreso
                         </button>
                         <button 
                            onClick={() => changeExerciseState(idx, 'completed')}
                            className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors ${isChecked ? 'bg-green-500 text-white' : 'bg-green-500/10 text-green-500 hover:bg-green-500/20'}`}
                         >
                           Realizado
                         </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
