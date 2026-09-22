"use client"

import { useState } from "react"
import { Users, FileEdit, Plus, Trash2, X, Dumbbell, CalendarDays, Apple } from "lucide-react"
import { createRoutine, createDiet } from "@/app/actions/routines"

const DAYS_OF_WEEK = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"]

export function RoutineAssignmentModal({
  isOpen,
  onClose,
  coachId,
  athletes,
  defaultAthleteId,
  onSuccess
}: {
  isOpen: boolean
  onClose: () => void
  coachId: string
  athletes: any[]
  defaultAthleteId?: string
  onSuccess?: () => void
}) {
  const [modalType, setModalType] = useState<"ROUTINE" | "DIET">("ROUTINE")
  const [selectedAthlete, setSelectedAthlete] = useState(defaultAthleteId || "")
  const [title, setTitle] = useState("")
  const [duration, setDuration] = useState("60 min")
  
  const [exercises, setExercises] = useState([{ name: "", sets: 3, reps: "10", notes: "" }])
  
  const [activeDay, setActiveDay] = useState("Lunes")
  const [weeklyPlan, setWeeklyPlan] = useState<Record<string, { breakfast: string, lunch: string, dinner: string, snacks: string }>>(
    DAYS_OF_WEEK.reduce((acc, day) => ({ ...acc, [day]: { breakfast: "", lunch: "", dinner: "", snacks: "" } }), {})
  )

  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!isOpen) return null

  const handleAddExercise = () => {
    setExercises([...exercises, { name: "", sets: 3, reps: "10", notes: "" }])
  }

  const handleRemoveExercise = (index: number) => {
    setExercises(exercises.filter((_, i) => i !== index))
  }

  const handleMealChange = (day: string, meal: string, value: string) => {
    setWeeklyPlan(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [meal]: value
      }
    }))
  }

  const resetForm = () => {
    setTitle("")
    setExercises([{ name: "", sets: 3, reps: "10", notes: "" }])
    setWeeklyPlan(DAYS_OF_WEEK.reduce((acc, day) => ({ ...acc, [day]: { breakfast: "", lunch: "", dinner: "", snacks: "" } }), {}))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedAthlete || !title) return
    setIsSubmitting(true)
    
    const hasRoutineData = exercises.some(ex => ex.name.trim() !== "");
    const hasDietData = Object.values(weeklyPlan).some((day: any) => 
      day.breakfast.trim() !== "" || day.lunch.trim() !== "" || day.dinner.trim() !== "" || day.snacks.trim() !== ""
    );

    let routineSuccess = true;
    let dietSuccess = true;

    // Save Routine if it has data or if we are explicitly on the routine tab
    if (hasRoutineData || (modalType === "ROUTINE" && !hasDietData)) {
      const res = await createRoutine({
        athleteId: selectedAthlete,
        coachId,
        title,
        duration,
        date: new Date(),
        exercises: exercises.filter(ex => ex.name.trim() !== "")
      });
      routineSuccess = res.success;
    }

    // Save Diet if it has data or if we are explicitly on the diet tab
    if (hasDietData || (modalType === "DIET" && !hasRoutineData)) {
      const res = await createDiet({
        athleteId: selectedAthlete,
        coachId,
        title,
        weeklyPlan: JSON.stringify(weeklyPlan),
        date: new Date()
      });
      dietSuccess = res.success;
    }

    if (routineSuccess && dietSuccess) {
      resetForm()
      onClose()
      if (onSuccess) onSuccess()
    } else {
      alert("Error al guardar el plan.");
    }
    
    setIsSubmitting(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-card border border-border rounded-xl max-w-2xl w-full shadow-2xl glass flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center p-6 border-b border-border">
          <h3 className="text-xl font-black text-foreground flex items-center gap-2">
            <FileEdit className="w-5 h-5 text-primary" />
            Asignación de Plan Semanal
          </h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-red-500 transition bg-black/5 dark:bg-white/5 p-2 rounded-full">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-y-auto p-6 custom-scrollbar">
          <form id="assignment-form" onSubmit={handleSubmit} className="space-y-6">
            
            <div className="flex gap-2 p-1 bg-black/5 dark:bg-white/5 rounded-lg w-fit mb-4">
              <button
                type="button"
                onClick={() => setModalType("ROUTINE")}
                className={`px-4 py-2 text-sm font-bold rounded-md flex items-center gap-2 transition ${modalType === 'ROUTINE' ? 'bg-primary text-black shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
              >
                <Dumbbell className="w-4 h-4" /> Rutina
              </button>
              <button
                type="button"
                onClick={() => setModalType("DIET")}
                className={`px-4 py-2 text-sm font-bold rounded-md flex items-center gap-2 transition ${modalType === 'DIET' ? 'bg-blue-500 text-white shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
              >
                <Apple className="w-4 h-4" /> Dieta (Semanal)
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-bold text-foreground mb-1 block flex items-center gap-2">
                  <Users className="w-4 h-4 text-primary" /> Atleta Destino
                </label>
                <select 
                  required
                  value={selectedAthlete}
                  onChange={e => setSelectedAthlete(e.target.value)}
                  className="w-full bg-card border border-border rounded-lg p-2.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none text-foreground"
                >
                  <option value="">Selecciona un atleta</option>
                  {athletes.map(a => (
                    <option key={a.id} value={a.id}>{a.name} (C.I {a.cedula})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-bold text-foreground mb-1 block">Título del Plan</label>
                <input 
                  required
                  type="text" 
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder={modalType === 'ROUTINE' ? "Ej. Rutina de Fuerza A" : "Ej. Dieta Definición Mes 1"}
                  className="w-full bg-card border border-border rounded-lg p-2.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none text-foreground"
                />
              </div>
            </div>

            {modalType === "ROUTINE" && (
              <div>
                <label className="text-sm font-bold text-foreground mb-1 block">Duración Estimada</label>
                <select 
                  value={duration}
                  onChange={e => setDuration(e.target.value)}
                  className="w-full bg-card border border-border rounded-lg p-2.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none text-foreground"
                >
                  <option value="30 min">30 minutos</option>
                  <option value="45 min">45 minutos</option>
                  <option value="60 min">60 minutos</option>
                  <option value="90 min">90 minutos</option>
                  <option value="120 min">120 minutos</option>
                </select>
              </div>
            )}

            {modalType === "ROUTINE" ? (
              <>
                <div className="pt-4 border-t border-border">
                  <div className="flex justify-between items-center mb-4">
                    <label className="text-sm font-bold text-foreground flex items-center gap-2">
                      <Dumbbell className="w-4 h-4 text-primary" /> Ejercicios
                    </label>
                    <button 
                      type="button" 
                      onClick={handleAddExercise}
                      className="text-xs flex items-center gap-1 bg-black/5 dark:bg-white/5 text-foreground px-3 py-1.5 rounded-md hover:bg-black/10 dark:hover:bg-white/10 transition font-bold"
                    >
                      <Plus className="w-3 h-3" /> Añadir
                    </button>
                  </div>

                  <div className="space-y-4">
                    {exercises.map((ex, index) => (
                      <div key={index} className="p-4 border border-border rounded-lg bg-black/5 dark:bg-black/20 flex flex-col gap-3 relative shadow-sm">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Ejercicio {index + 1}</span>
                          {exercises.length > 1 && (
                            <button type="button" onClick={() => handleRemoveExercise(index)} className="text-red-500 hover:text-red-700 bg-red-500/10 p-1.5 rounded transition">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                        <input 
                          required
                          type="text" 
                          value={ex.name}
                          onChange={(e) => {
                            const newEx = [...exercises]
                            newEx[index].name = e.target.value
                            setExercises(newEx)
                          }}
                          placeholder="Nombre del Ejercicio"
                          className="w-full bg-card border border-border rounded p-2.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none text-foreground"
                        />
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-[10px] uppercase text-muted-foreground font-bold block mb-1">Series</label>
                            <input 
                              required
                              type="number" 
                              value={ex.sets}
                              onChange={(e) => {
                                const newEx = [...exercises]
                                newEx[index].sets = Number(e.target.value)
                                setExercises(newEx)
                              }}
                              className="w-full bg-card border border-border rounded p-2.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none text-foreground"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] uppercase text-muted-foreground font-bold block mb-1">Repeticiones</label>
                            <input 
                              required
                              type="text" 
                              value={ex.reps}
                              onChange={(e) => {
                                const newEx = [...exercises]
                                newEx[index].reps = e.target.value
                                setExercises(newEx)
                              }}
                              placeholder="Ej. 10-12"
                              className="w-full bg-card border border-border rounded p-2.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none text-foreground"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="text-[10px] uppercase text-muted-foreground font-bold block mb-1">Notas (Opcional)</label>
                          <input 
                            type="text" 
                            value={ex.notes}
                            onChange={(e) => {
                              const newEx = [...exercises]
                              newEx[index].notes = e.target.value
                              setExercises(newEx)
                            }}
                            placeholder="Ej. Descanso de 60s"
                            className="w-full bg-card border border-border rounded p-2.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none text-foreground"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="space-y-4">
                <label className="text-sm font-bold text-foreground mb-1 block">Plan Semanal</label>
                <div className="flex overflow-x-auto pb-2 gap-2 hide-scrollbar">
                  {DAYS_OF_WEEK.map(day => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => setActiveDay(day)}
                      className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition ${activeDay === day ? 'bg-primary text-black' : 'bg-black/5 dark:bg-white/5 text-muted-foreground hover:bg-black/10 dark:hover:bg-white/10'}`}
                    >
                      {day}
                    </button>
                  ))}
                </div>

                <div className="p-4 border border-border rounded-xl bg-black/5 dark:bg-black/20 space-y-4">
                  <h4 className="font-black text-primary border-b border-border/50 pb-2">{activeDay}</h4>
                  
                  <div>
                    <label className="text-xs uppercase font-bold text-muted-foreground mb-1 block">Desayuno</label>
                    <textarea 
                      value={weeklyPlan[activeDay].breakfast}
                      onChange={(e) => handleMealChange(activeDay, "breakfast", e.target.value)}
                      placeholder="Ej. Avena con frutas..."
                      className="w-full h-16 bg-card border border-border rounded-lg p-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none text-foreground resize-none"
                    />
                  </div>
                  
                  <div>
                    <label className="text-xs uppercase font-bold text-muted-foreground mb-1 block">Almuerzo</label>
                    <textarea 
                      value={weeklyPlan[activeDay].lunch}
                      onChange={(e) => handleMealChange(activeDay, "lunch", e.target.value)}
                      placeholder="Ej. Pechuga a la plancha con arroz..."
                      className="w-full h-16 bg-card border border-border rounded-lg p-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none text-foreground resize-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs uppercase font-bold text-muted-foreground mb-1 block">Cena</label>
                    <textarea 
                      value={weeklyPlan[activeDay].dinner}
                      onChange={(e) => handleMealChange(activeDay, "dinner", e.target.value)}
                      placeholder="Ej. Ensalada con atún..."
                      className="w-full h-16 bg-card border border-border rounded-lg p-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none text-foreground resize-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs uppercase font-bold text-muted-foreground mb-1 block">Snacks / Colaciones</label>
                    <textarea 
                      value={weeklyPlan[activeDay].snacks}
                      onChange={(e) => handleMealChange(activeDay, "snacks", e.target.value)}
                      placeholder="Ej. Frutos secos o batido de proteína..."
                      className="w-full h-16 bg-card border border-border rounded-lg p-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none text-foreground resize-none"
                    />
                  </div>
                </div>
              </div>
            )}
          </form>
        </div>

        <div className="p-6 border-t border-border flex justify-end gap-3 bg-black/5 dark:bg-black/20">
          <button type="button" onClick={onClose} className="px-6 py-2.5 rounded-lg text-sm font-bold text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5 transition">
            Cancelar
          </button>
          <button 
            type="submit" 
            form="assignment-form"
            disabled={isSubmitting} 
            className="bg-primary text-black px-8 py-2.5 rounded-lg text-sm font-black hover:opacity-90 transition disabled:opacity-50"
          >
            {isSubmitting ? 'Guardando...' : 'Guardar Plan'}
          </button>
        </div>
      </div>
    </div>
  )
}
