"use client"

import { useState } from "react"
import { Users, FileEdit, Plus, Trash2, X, Dumbbell, Apple, Clock, Layers, Send, Sparkles } from "lucide-react"
import { createRoutine, createDiet } from "@/app/actions/routines"
import { showSweetToast } from "@/lib/toast-context"
import Swal from "sweetalert2"

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
  const [modalType, setModalType] = useState<"ROUTINE" | "DIET" | "BOTH">("ROUTINE")
  const [selectedAthlete, setSelectedAthlete] = useState(defaultAthleteId || "")
  
  // Rutina State
  const [routineTitle, setRoutineTitle] = useState("")
  const [routineDuration, setRoutineDuration] = useState("60 min")
  const [routineReminderTime, setRoutineReminderTime] = useState("08:00")
  const [exercises, setExercises] = useState([{ name: "", sets: 3, reps: "10", notes: "" }])
  
  // Dieta State
  const [dietTitle, setDietTitle] = useState("")
  const [breakfastTime, setBreakfastTime] = useState("08:00")
  const [lunchTime, setLunchTime] = useState("13:00")
  const [snackTime, setSnackTime] = useState("16:30")
  const [dinnerTime, setDinnerTime] = useState("20:00")
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
    setRoutineTitle("")
    setRoutineDuration("60 min")
    setRoutineReminderTime("08:00")
    setExercises([{ name: "", sets: 3, reps: "10", notes: "" }])
    setDietTitle("")
    setBreakfastTime("08:00")
    setLunchTime("13:00")
    setSnackTime("16:30")
    setDinnerTime("20:00")
    setWeeklyPlan(DAYS_OF_WEEK.reduce((acc, day) => ({ ...acc, [day]: { breakfast: "", lunch: "", dinner: "", snacks: "" } }), {}))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedAthlete) {
      showSweetToast("Selecciona el atleta a quien asignar el plan.", "warning")
      return
    }

    const needsRoutine = modalType === "ROUTINE" || modalType === "BOTH"
    const needsDiet = modalType === "DIET" || modalType === "BOTH"

    if (needsRoutine && !routineTitle.trim()) {
      showSweetToast("Ingresa un título para la rutina.", "warning")
      return
    }
    if (needsDiet && !dietTitle.trim()) {
      showSweetToast("Ingresa un título para el plan de dieta.", "warning")
      return
    }

    setIsSubmitting(true)

    let routineRes: any = null
    let dietRes: any = null
    let lastWhatsAppUrl = ""

    // 1. Guardar Rutina si aplica
    if (needsRoutine) {
      routineRes = await createRoutine({
        athleteId: selectedAthlete,
        coachId,
        title: routineTitle,
        duration: routineDuration,
        reminderTime: routineReminderTime,
        date: new Date(),
        exercises: exercises.filter(ex => ex.name.trim() !== "")
      })
      if (routineRes?.whatsAppUrl) lastWhatsAppUrl = routineRes.whatsAppUrl
    }

    // 2. Guardar Dieta si aplica
    if (needsDiet) {
      dietRes = await createDiet({
        athleteId: selectedAthlete,
        coachId,
        title: dietTitle,
        weeklyPlan: JSON.stringify(weeklyPlan),
        mealSchedule: {
          breakfast: breakfastTime,
          lunch: lunchTime,
          snacks: snackTime,
          dinner: dinnerTime
        },
        date: new Date()
      })
      if (dietRes?.whatsAppUrl) lastWhatsAppUrl = dietRes.whatsAppUrl
    }

    const isSuccess = (!needsRoutine || routineRes?.success) && (!needsDiet || dietRes?.success)

    if (isSuccess) {
      resetForm()
      onClose()
      if (onSuccess) onSuccess()

      // Prompt para enviar seguimiento vía WhatsApp si hay número disponible
      if (lastWhatsAppUrl) {
        Swal.fire({
          title: "¡Plan Asignado!",
          text: "Los recordatorios de seguimiento fueron programados en la app del atleta. ¿Deseas enviarle el recordatorio por WhatsApp de una vez?",
          icon: "success",
          showCancelButton: true,
          confirmButtonColor: "#22c55e",
          cancelButtonColor: "#64748b",
          confirmButtonText: "📲 Enviar por WhatsApp",
          cancelButtonText: "Listo, cerrar"
        }).then((result) => {
          if (result.isConfirmed) {
            window.open(lastWhatsAppUrl, "_blank")
          }
        })
      } else {
        showSweetToast("¡Plan y recordatorios de seguimiento asignados con éxito!", "success")
      }
    } else {
      const err = routineRes?.error || dietRes?.error || "Error al procesar la asignación."
      showSweetToast(err, "error")
    }

    setIsSubmitting(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 sm:p-4 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-card/95 border border-white/10 rounded-2xl max-w-4xl w-full shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* HEADER */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-black/5 dark:bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10 border border-primary/20 text-primary">
              <FileEdit className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-foreground uppercase tracking-tight flex items-center gap-2">
                Asignación de Entrenamiento y Seguimiento
              </h3>
              <p className="text-xs text-muted-foreground">
                Configura rutinas, dietas y sus recordatorios horarios automáticos para el atleta.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/10 transition cursor-pointer"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* CONTENIDO FORMULARIO */}
        <div className="overflow-y-auto p-5 sm:p-6 space-y-5 custom-scrollbar">
          <form id="assignment-form" onSubmit={handleSubmit} className="space-y-5">
            {/* SELECTOR DE MODO (INDIVIDUAL O AMBOS) */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-black/5 dark:bg-white/[0.03] border border-white/10">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase text-foreground">Asignar:</span>
              </div>
              <div className="flex items-center gap-1.5 bg-black/20 p-1 rounded-xl border border-white/5">
                <button
                  type="button"
                  onClick={() => setModalType("ROUTINE")}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg flex items-center gap-1.5 transition cursor-pointer ${
                    modalType === "ROUTINE"
                      ? "bg-primary text-black font-black shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Dumbbell className="w-3.5 h-3.5" /> Solo Rutina
                </button>
                <button
                  type="button"
                  onClick={() => setModalType("DIET")}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg flex items-center gap-1.5 transition cursor-pointer ${
                    modalType === "DIET"
                      ? "bg-emerald-500 text-white font-black shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Apple className="w-3.5 h-3.5" /> Solo Dieta
                </button>
                <button
                  type="button"
                  onClick={() => setModalType("BOTH")}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg flex items-center gap-1.5 transition cursor-pointer ${
                    modalType === "BOTH"
                      ? "bg-amber-500 text-black font-black shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" /> Ambos (Rutina + Dieta)
                </button>
              </div>
            </div>

            {/* SELECCIÓN DE ATLETA */}
            <div className="p-4 rounded-xl bg-black/5 dark:bg-white/[0.02] border border-white/10">
              <label className="text-xs font-black uppercase tracking-wider text-foreground mb-1.5 block flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" /> Atleta Asignado *
              </label>
              <select
                required
                value={selectedAthlete}
                onChange={(e) => setSelectedAthlete(e.target.value)}
                className="w-full bg-card border border-white/10 rounded-xl p-2.5 text-sm focus:border-primary focus:outline-none text-foreground cursor-pointer font-medium"
              >
                <option value="">Selecciona un atleta...</option>
                {athletes.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} — C.I. {a.cedula} {a.phone ? `(${a.phone})` : ""}
                  </option>
                ))}
              </select>
            </div>

            {/* SECCIÓN RUTINA */}
            {(modalType === "ROUTINE" || modalType === "BOTH") && (
              <div className="p-4 sm:p-5 rounded-2xl bg-primary/[0.03] border border-primary/20 space-y-4">
                <div className="flex items-center justify-between border-b border-primary/20 pb-2">
                  <h4 className="text-sm font-black uppercase tracking-wide text-primary flex items-center gap-2">
                    <Dumbbell className="w-4 h-4" /> Plan de Rutina & Recordatorio de Entrenamiento
                  </h4>
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-primary/20 text-primary">
                    Entrenamiento
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-bold text-foreground mb-1 block">Título de la Rutina *</label>
                    <input
                      required
                      type="text"
                      value={routineTitle}
                      onChange={(e) => setRoutineTitle(e.target.value)}
                      placeholder="Ej. Piernas & Glúteos Hipertrofia"
                      className="w-full bg-card border border-white/10 rounded-xl p-2.5 text-sm focus:border-primary focus:outline-none text-foreground"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-foreground mb-1 block">Duración Estimada</label>
                    <select
                      value={routineDuration}
                      onChange={(e) => setRoutineDuration(e.target.value)}
                      className="w-full bg-card border border-white/10 rounded-xl p-2.5 text-sm focus:border-primary focus:outline-none text-foreground cursor-pointer"
                    >
                      <option value="30 min">30 minutos</option>
                      <option value="45 min">45 minutos</option>
                      <option value="60 min">60 minutos (Estándar)</option>
                      <option value="90 min">90 minutos</option>
                      <option value="120 min">120 minutos</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-foreground mb-1 block flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-primary" /> Hora de Recordatorio Diario
                    </label>
                    <input
                      type="time"
                      value={routineReminderTime}
                      onChange={(e) => setRoutineReminderTime(e.target.value)}
                      className="w-full bg-card border border-white/10 rounded-xl p-2.5 text-sm focus:border-primary focus:outline-none text-foreground cursor-pointer font-bold"
                    />
                  </div>
                </div>

                {/* EJERCICIOS */}
                <div className="pt-2">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Lista de Ejercicios ({exercises.length})
                    </span>
                    <button
                      type="button"
                      onClick={handleAddExercise}
                      className="text-xs flex items-center gap-1.5 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 px-3 py-1.5 rounded-lg transition font-bold cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" /> Agregar Ejercicio
                    </button>
                  </div>

                  <div className="space-y-3">
                    {exercises.map((ex, index) => (
                      <div
                        key={index}
                        className="p-3.5 border border-white/10 rounded-xl bg-black/5 dark:bg-black/20 flex flex-col gap-2.5 relative"
                      >
                        <div className="flex justify-between items-center">
                          <span className="text-[11px] font-black text-primary uppercase tracking-wider">
                            Ejercicio #{index + 1}
                          </span>
                          {exercises.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveExercise(index)}
                              className="text-rose-400 hover:text-rose-300 bg-rose-500/10 p-1 rounded-md transition cursor-pointer"
                              title="Eliminar ejercicio"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                          <div className="sm:col-span-5">
                            <input
                              required
                              type="text"
                              value={ex.name}
                              onChange={(e) => {
                                const newEx = [...exercises]
                                newEx[index].name = e.target.value
                                setExercises(newEx)
                              }}
                              placeholder="Nombre (ej. Press Militar Mancuernas)"
                              className="w-full bg-card border border-white/10 rounded-lg p-2 text-xs focus:border-primary focus:outline-none text-foreground font-medium"
                            />
                          </div>
                          <div className="sm:col-span-2">
                            <input
                              required
                              type="number"
                              min={1}
                              value={ex.sets}
                              onChange={(e) => {
                                const newEx = [...exercises]
                                newEx[index].sets = Number(e.target.value)
                                setExercises(newEx)
                              }}
                              placeholder="Series"
                              title="Número de series"
                              className="w-full bg-card border border-white/10 rounded-lg p-2 text-xs focus:border-primary focus:outline-none text-foreground font-bold text-center"
                            />
                          </div>
                          <div className="sm:col-span-2">
                            <input
                              required
                              type="text"
                              value={ex.reps}
                              onChange={(e) => {
                                const newEx = [...exercises]
                                newEx[index].reps = e.target.value
                                setExercises(newEx)
                              }}
                              placeholder="Reps (ej. 12-15)"
                              className="w-full bg-card border border-white/10 rounded-lg p-2 text-xs focus:border-primary focus:outline-none text-foreground text-center"
                            />
                          </div>
                          <div className="sm:col-span-3">
                            <input
                              type="text"
                              value={ex.notes}
                              onChange={(e) => {
                                const newEx = [...exercises]
                                newEx[index].notes = e.target.value
                                setExercises(newEx)
                              }}
                              placeholder="Notas (ej. 60s descanso)"
                              className="w-full bg-card border border-white/10 rounded-lg p-2 text-xs focus:border-primary focus:outline-none text-foreground"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* SECCIÓN DIETA */}
            {(modalType === "DIET" || modalType === "BOTH") && (
              <div className="p-4 sm:p-5 rounded-2xl bg-emerald-500/[0.03] border border-emerald-500/20 space-y-4">
                <div className="flex items-center justify-between border-b border-emerald-500/20 pb-2">
                  <h4 className="text-sm font-black uppercase tracking-wide text-emerald-400 flex items-center gap-2">
                    <Apple className="w-4 h-4" /> Plan Nutricional & Horarios de Comidas
                  </h4>
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">
                    Alimentación
                  </span>
                </div>

                <div>
                  <label className="text-xs font-bold text-foreground mb-1 block">Título del Plan de Dieta *</label>
                  <input
                    required
                    type="text"
                    value={dietTitle}
                    onChange={(e) => setDietTitle(e.target.value)}
                    placeholder="Ej. Plan Déficit Calórico & Definición (Semana 1-4)"
                    className="w-full bg-card border border-white/10 rounded-xl p-2.5 text-sm focus:border-emerald-500 focus:outline-none text-foreground"
                  />
                </div>

                {/* CONFIGURACIÓN HORARIA DE COMIDAS (RECORDATORIOS AUTOMÁTICOS) */}
                <div className="p-3.5 rounded-xl bg-black/5 dark:bg-black/20 border border-white/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" /> Horarios de Recordatorio de Comidas
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      Se enviarán alertas al atleta en estos horarios
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
                    <div>
                      <label className="text-[11px] font-bold text-muted-foreground block mb-1">
                        🌅 Desayuno
                      </label>
                      <input
                        type="time"
                        value={breakfastTime}
                        onChange={(e) => setBreakfastTime(e.target.value)}
                        className="w-full bg-card border border-white/10 rounded-lg p-2 text-xs font-bold focus:border-emerald-500 focus:outline-none text-foreground cursor-pointer"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-muted-foreground block mb-1">
                        ☀️ Almuerzo
                      </label>
                      <input
                        type="time"
                        value={lunchTime}
                        onChange={(e) => setLunchTime(e.target.value)}
                        className="w-full bg-card border border-white/10 rounded-lg p-2 text-xs font-bold focus:border-emerald-500 focus:outline-none text-foreground cursor-pointer"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-muted-foreground block mb-1">
                        🍎 Merienda / Snack
                      </label>
                      <input
                        type="time"
                        value={snackTime}
                        onChange={(e) => setSnackTime(e.target.value)}
                        className="w-full bg-card border border-white/10 rounded-lg p-2 text-xs font-bold focus:border-emerald-500 focus:outline-none text-foreground cursor-pointer"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-muted-foreground block mb-1">
                        🌙 Cena
                      </label>
                      <input
                        type="time"
                        value={dinnerTime}
                        onChange={(e) => setDinnerTime(e.target.value)}
                        className="w-full bg-card border border-white/10 rounded-lg p-2 text-xs font-bold focus:border-emerald-500 focus:outline-none text-foreground cursor-pointer"
                      />
                    </div>
                  </div>
                </div>

                {/* PLAN SEMANAL POR DÍA */}
                <div className="space-y-3 pt-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Pautas Nutricionales por Día
                    </span>
                  </div>

                  <div className="flex overflow-x-auto pb-1 gap-1.5 custom-scrollbar">
                    {DAYS_OF_WEEK.map((day) => (
                      <button
                        key={day}
                        type="button"
                        onClick={() => setActiveDay(day)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                          activeDay === day
                            ? "bg-emerald-500 text-white shadow-sm font-black"
                            : "bg-black/5 dark:bg-white/5 text-muted-foreground hover:text-foreground border border-white/5"
                        }`}
                      >
                        {day}
                      </button>
                    ))}
                  </div>

                  <div className="p-3.5 border border-white/10 rounded-xl bg-black/5 dark:bg-black/20 space-y-3">
                    <div className="flex items-center justify-between border-b border-white/5 pb-2">
                      <span className="font-black text-sm text-emerald-400 uppercase">
                        Menú para el día: {activeDay}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] uppercase font-bold text-muted-foreground mb-1 block">
                          Desayuno ({breakfastTime})
                        </label>
                        <textarea
                          value={weeklyPlan[activeDay].breakfast}
                          onChange={(e) => handleMealChange(activeDay, "breakfast", e.target.value)}
                          placeholder="Ej. 4 claras, 1 huevo entero, 60g avena y café negro..."
                          rows={2}
                          className="w-full bg-card border border-white/10 rounded-lg p-2 text-xs focus:border-emerald-500 focus:outline-none text-foreground resize-none"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] uppercase font-bold text-muted-foreground mb-1 block">
                          Almuerzo ({lunchTime})
                        </label>
                        <textarea
                          value={weeklyPlan[activeDay].lunch}
                          onChange={(e) => handleMealChange(activeDay, "lunch", e.target.value)}
                          placeholder="Ej. 180g pechuga de pollo, 120g arroz blanco, ensalada verde..."
                          rows={2}
                          className="w-full bg-card border border-white/10 rounded-lg p-2 text-xs focus:border-emerald-500 focus:outline-none text-foreground resize-none"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] uppercase font-bold text-muted-foreground mb-1 block">
                          Merienda / Snack ({snackTime})
                        </label>
                        <textarea
                          value={weeklyPlan[activeDay].snacks}
                          onChange={(e) => handleMealChange(activeDay, "snacks", e.target.value)}
                          placeholder="Ej. 1 scoop proteína whey con 20g almendras o fruta..."
                          rows={2}
                          className="w-full bg-card border border-white/10 rounded-lg p-2 text-xs focus:border-emerald-500 focus:outline-none text-foreground resize-none"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] uppercase font-bold text-muted-foreground mb-1 block">
                          Cena ({dinnerTime})
                        </label>
                        <textarea
                          value={weeklyPlan[activeDay].dinner}
                          onChange={(e) => handleMealChange(activeDay, "dinner", e.target.value)}
                          placeholder="Ej. 180g pescado blanco o atún, vegetales al vapor, aguacate..."
                          rows={2}
                          className="w-full bg-card border border-white/10 rounded-lg p-2 text-xs focus:border-emerald-500 focus:outline-none text-foreground resize-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* FOOTER */}
        <div className="px-6 py-4 border-t border-white/10 flex items-center justify-between bg-black/5 dark:bg-white/[0.02]">
          <span className="text-[11px] text-muted-foreground">
            El atleta recibirá alertas automáticas y seguimiento continuo en su app.
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-white/5 transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              form="assignment-form"
              disabled={isSubmitting}
              className="bg-primary text-black px-6 py-2 rounded-xl text-xs font-black uppercase tracking-wider hover:opacity-90 transition disabled:opacity-50 cursor-pointer shadow-md flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isSubmitting ? "Programando..." : "Guardar & Asignar Recordatorios"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
