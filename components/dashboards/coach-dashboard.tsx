"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, CheckCircle2, FileEdit, UserCheck, Plus, Trash2, X } from "lucide-react"
import { getCoachAthletes, getCoachAssignedRoutines, createRoutine, createDiet } from "@/app/actions/routines"

export function CoachDashboard() {
  const { user } = useAuth()
  const [routines, setRoutines] = useState<any[]>([])
  const [diets, setDiets] = useState<any[]>([])
  const [athletes, setAthletes] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const [showModal, setShowModal] = useState(false)
  const [modalType, setModalType] = useState<"ROUTINE" | "DIET">("ROUTINE")
  
  // Form State
  const [selectedAthlete, setSelectedAthlete] = useState("")
  const [title, setTitle] = useState("")
  const [duration, setDuration] = useState("60 min")
  const [description, setDescription] = useState("")
  const [exercises, setExercises] = useState([{ name: "", sets: 3, reps: "10", notes: "" }])
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (user?.id) {
      loadData()
    }
  }, [user])

  async function loadData() {
    setIsLoading(true)
    const [athRes, routRes] = await Promise.all([
      getCoachAthletes(user!.id),
      getCoachAssignedRoutines(user!.id)
    ])
    
    if (athRes.success) setAthletes(athRes.athletes || [])
    if (routRes.success) {
      setRoutines(routRes.routines || [])
      setDiets(routRes.diets || [])
    }
    setIsLoading(false)
  }

  const handleAddExercise = () => {
    setExercises([...exercises, { name: "", sets: 3, reps: "10", notes: "" }])
  }

  const handleRemoveExercise = (index: number) => {
    setExercises(exercises.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedAthlete || !title) return
    setIsSubmitting(true)
    
    if (modalType === "ROUTINE") {
      const res = await createRoutine({
        athleteId: selectedAthlete,
        coachId: user!.id,
        title,
        duration,
        date: new Date(),
        exercises: exercises.filter(ex => ex.name.trim() !== "")
      })
      if (res.success) {
        setShowModal(false)
        resetForm()
        loadData()
      }
    } else {
      const res = await createDiet({
        athleteId: selectedAthlete,
        coachId: user!.id,
        title,
        description,
        date: new Date()
      })
      if (res.success) {
        setShowModal(false)
        resetForm()
        loadData()
      }
    }
    setIsSubmitting(false)
  }

  const resetForm = () => {
    setSelectedAthlete("")
    setTitle("")
    setDescription("")
    setDuration("60 min")
    setExercises([{ name: "", sets: 3, reps: "10", notes: "" }])
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tighter bg-gradient-to-r from-primary dark:via-white via-black to-primary/50 bg-clip-text text-transparent">Panel de Entrenador</h1>
          <p className="text-muted-foreground mt-1">
            Gestiona las rutinas y dietas de tus atletas.
          </p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="border border-primary text-primary hover:bg-primary/10 px-4 py-2 rounded-md font-medium transition flex items-center gap-2 bg-transparent"
        >
          <FileEdit className="h-4 w-4" />
          Nueva Asignación
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Atletas / Rutinas */}
        <Card className="col-span-1 shadow-none border border-black/10 dark:border-white/10 rounded-xl bg-transparent">
          <CardHeader>
            <CardTitle className="text-lg">Últimas Rutinas Asignadas</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-muted-foreground text-sm">Cargando...</p>
            ) : routines.length === 0 ? (
              <p className="text-muted-foreground text-sm">No has asignado rutinas recientemente.</p>
            ) : (
              <div className="space-y-4">
                {routines.map((routine) => (
                  <div key={routine.id} className="p-4 border border-black/10 dark:border-white/10 rounded-xl bg-transparent flex flex-col gap-1">
                    <div className="flex justify-between items-start">
                      <span className="font-bold text-primary">{routine.athlete?.name}</span>
                      <span className="text-xs text-muted-foreground">{new Date(routine.createdAt).toLocaleDateString()}</span>
                    </div>
                    <span className="text-sm font-medium">{routine.title}</span>
                    <span className="text-xs text-muted-foreground">{routine.exercises?.length} ejercicios • {routine.duration}</span>
                    <div className="mt-2 text-xs">
                      {routine.completed ? (
                        <span className="text-green-500 font-bold flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/> Completada</span>
                      ) : (
                        <span className="text-orange-500 font-bold flex items-center gap-1">Pendiente</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Dietas */}
        <Card className="col-span-1 shadow-none border border-black/10 dark:border-white/10 rounded-xl bg-transparent">
          <CardHeader>
            <CardTitle className="text-lg">Últimas Dietas Asignadas</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-muted-foreground text-sm">Cargando...</p>
            ) : diets.length === 0 ? (
              <p className="text-muted-foreground text-sm">No has asignado dietas recientemente.</p>
            ) : (
              <div className="space-y-4">
                {diets.map((diet) => (
                  <div key={diet.id} className="p-4 border border-black/10 dark:border-white/10 rounded-xl bg-transparent flex flex-col gap-1">
                    <div className="flex justify-between items-start">
                      <span className="font-bold text-primary">{diet.athlete?.name}</span>
                      <span className="text-xs text-muted-foreground">{new Date(diet.createdAt).toLocaleDateString()}</span>
                    </div>
                    <span className="text-sm font-medium">{diet.title}</span>
                    <span className="text-xs text-muted-foreground line-clamp-2 mt-1">{diet.description}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#0a0a0a] border border-black/10 dark:border-white/10 rounded-xl w-full max-w-2xl max-h-[90vh] flex flex-col my-auto shadow-2xl relative">
            <div className="p-6 border-b border-black/10 dark:border-white/10 flex justify-between items-center sticky top-0 bg-white dark:bg-[#0a0a0a] z-10 rounded-t-xl">
              <h2 className="text-xl font-black">Nueva Asignación</h2>
              <button onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-red-500 transition">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <div className="flex gap-4 mb-6">
                <button 
                  onClick={() => setModalType("ROUTINE")}
                  className={`flex-1 py-2 rounded-lg font-bold border transition ${modalType === 'ROUTINE' ? 'bg-primary/10 border-primary text-primary' : 'bg-transparent border-black/10 dark:border-white/10 text-muted-foreground'}`}
                >
                  Rutina
                </button>
                <button 
                  onClick={() => setModalType("DIET")}
                  className={`flex-1 py-2 rounded-lg font-bold border transition ${modalType === 'DIET' ? 'bg-primary/10 border-primary text-primary' : 'bg-transparent border-black/10 dark:border-white/10 text-muted-foreground'}`}
                >
                  Dieta
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-bold text-muted-foreground mb-1 block">Atleta</label>
                  <select 
                    required
                    value={selectedAthlete}
                    onChange={(e) => setSelectedAthlete(e.target.value)}
                    className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-lg p-3 text-sm focus:border-primary focus:outline-none"
                  >
                    <option value="">Selecciona un atleta...</option>
                    {athletes.map(a => (
                      <option key={a.id} value={a.id}>{a.name} ({a.cedula})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-bold text-muted-foreground mb-1 block">Título del Plan</label>
                  <input 
                    required
                    type="text" 
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ej. Rutina de Volumen Pecho/Triceps"
                    className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-lg p-3 text-sm focus:border-primary focus:outline-none"
                  />
                </div>

                {modalType === "ROUTINE" ? (
                  <>
                    <div>
                      <label className="text-sm font-bold text-muted-foreground mb-1 block">Duración Estimada</label>
                      <input 
                        type="text" 
                        value={duration}
                        onChange={(e) => setDuration(e.target.value)}
                        placeholder="Ej. 60 min"
                        className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-lg p-3 text-sm focus:border-primary focus:outline-none"
                      />
                    </div>
                    
                    <div className="pt-4 border-t border-black/10 dark:border-white/10">
                      <div className="flex justify-between items-center mb-4">
                        <label className="text-sm font-bold text-primary">Ejercicios</label>
                        <button 
                          type="button" 
                          onClick={handleAddExercise}
                          className="text-xs flex items-center gap-1 border border-primary text-primary px-2 py-1 rounded hover:bg-primary/10 transition"
                        >
                          <Plus className="w-3 h-3" /> Añadir
                        </button>
                      </div>

                      <div className="space-y-4">
                        {exercises.map((ex, index) => (
                          <div key={index} className="p-3 border border-black/10 dark:border-white/10 rounded-lg bg-black/5 dark:bg-black/20 flex flex-col gap-3 relative">
                            <div className="flex justify-between items-center">
                              <span className="text-xs font-bold text-muted-foreground">Ejercicio {index + 1}</span>
                              {exercises.length > 1 && (
                                <button type="button" onClick={() => handleRemoveExercise(index)} className="text-red-500 hover:text-red-700 transition">
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
                              className="w-full bg-white dark:bg-[#1A1A1A] border border-black/10 dark:border-white/10 rounded p-2 text-sm focus:border-primary focus:outline-none"
                            />
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="text-[10px] uppercase text-muted-foreground block mb-1">Series</label>
                                <input 
                                  required
                                  type="number" 
                                  value={ex.sets}
                                  onChange={(e) => {
                                    const newEx = [...exercises]
                                    newEx[index].sets = Number(e.target.value)
                                    setExercises(newEx)
                                  }}
                                  className="w-full bg-white dark:bg-[#1A1A1A] border border-black/10 dark:border-white/10 rounded p-2 text-sm focus:border-primary focus:outline-none"
                                />
                              </div>
                              <div>
                                <label className="text-[10px] uppercase text-muted-foreground block mb-1">Repeticiones</label>
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
                                  className="w-full bg-white dark:bg-[#1A1A1A] border border-black/10 dark:border-white/10 rounded p-2 text-sm focus:border-primary focus:outline-none"
                                />
                              </div>
                            </div>
                            <div>
                              <label className="text-[10px] uppercase text-muted-foreground block mb-1">Notas / Peso</label>
                              <input 
                                type="text" 
                                value={ex.notes}
                                onChange={(e) => {
                                  const newEx = [...exercises]
                                  newEx[index].notes = e.target.value
                                  setExercises(newEx)
                                }}
                                placeholder="Ej. Descanso 60s o 20kg"
                                className="w-full bg-white dark:bg-[#1A1A1A] border border-black/10 dark:border-white/10 rounded p-2 text-sm focus:border-primary focus:outline-none"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <div>
                    <label className="text-sm font-bold text-muted-foreground mb-1 block">Descripción del Plan Alimenticio</label>
                    <textarea 
                      required
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Ej. Desayuno: 3 huevos, Avena... Almuerzo..."
                      rows={8}
                      className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-lg p-3 text-sm focus:border-primary focus:outline-none resize-none"
                    />
                  </div>
                )}
                
                <div className="pt-4 sticky bottom-0 bg-white dark:bg-[#0a0a0a] border-t border-black/10 dark:border-white/10 -mx-6 px-6 pb-2">
                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full bg-transparent border-2 border-primary text-primary hover:bg-primary/10 py-3 rounded-lg font-bold transition flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? "Guardando..." : "Asignar a Atleta"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
