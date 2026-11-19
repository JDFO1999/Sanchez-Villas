"use server";
import prisma from "@/lib/db"
import { guard, guardSelfOr, ROLES, DENIED } from "@/lib/authz"
import { sendNotificationToUser } from "@/lib/push-notifications"

const isTrainer = (role: string) => (ROLES.TRAINER as readonly string[]).includes(role)

export async function getCoachAthletes(coachId: string) {
  // Un entrenador ve a SUS atletas; admin/empleado cualquiera
  const g = await guardSelfOr(coachId, ["admin", "employee"])
  if (!g.ok) return { success: false, error: g.error }
  if (!coachId) return { success: true, athletes: [] };
  try {
    const athletes = await prisma.user.findMany({
      where: {
        role: "athlete",
        coachId: coachId
      },
      select: { id: true, name: true, cedula: true, phone: true, createdAt: true, profilePicture: true, _count: { select: { athleteRoutines: true, athleteDiets: true } } },
      orderBy: { createdAt: 'desc' },
      take: 100
    })
    return { success: true, athletes }
  } catch (error: any) {
    console.error(error)
    return { success: false, error: "No se pudo obtener la información." }
  }
}

export async function getCoachAssignedRoutines(coachId: string) {
  const g = await guardSelfOr(coachId, ["admin", "employee"])
  if (!g.ok) return { success: false, error: g.error }
  try {
    const routines = await prisma.routine.findMany({
      where: { coachId },
      include: {
        athlete: { select: { id: true, name: true, phone: true } },
        exercises: true
      },
      orderBy: { createdAt: "desc" },
      take: 50
    })

    const diets = await prisma.dietAssignment.findMany({
      where: { coachId },
      include: {
        athlete: { select: { id: true, name: true, phone: true } }
      },
      orderBy: { createdAt: "desc" },
      take: 50
    })

    return { success: true, routines, diets }
  } catch (error: any) {
    console.error(error)
    return { success: false, error: "No se pudo obtener la información." }
  }
}

/**
 * Quién puede asignar rutinas/dietas a `athleteId`:
 *  - admin y empleados: a cualquier atleta
 *  - coach: a sus atletas (o a atletas aún sin entrenador)
 *  - atleta: solo a sí mismo
 */
async function resolveAssignment(athleteId: string, requestedCoachId?: string) {
  const g = await guard(["admin", "coach", "employee", "athlete"])
  if (!g.ok) return { ok: false as const, error: g.error }

  const athlete = await prisma.user.findFirst({
    where: { id: athleteId, role: "athlete" },
    select: { id: true, coachId: true },
  })
  if (!athlete) return { ok: false as const, error: "Atleta no encontrado" }

  if (g.user.role === "athlete" && g.user.id !== athlete.id) return { ok: false as const, error: DENIED }
  if ((g.user.role === "coach" || g.user.role === "employee") && athlete.coachId && athlete.coachId !== g.user.id) return { ok: false as const, error: DENIED }

  // La autoría sale del servidor: el entrenador del atleta, o quien asigna si es entrenador
  const coachId = athlete.coachId || (isTrainer(g.user.role) ? g.user.id : requestedCoachId) || g.user.id
  return { ok: true as const, coachId }
}

export async function createRoutine(data: {
  athleteId: string
  coachId: string
  title: string
  date: Date
  duration: string
  reminderTime?: string
  exercises: { name: string, sets: number, reps: string, notes: string }[]
}) {
  try {
    const r = await resolveAssignment(data.athleteId, data.coachId)
    if (!r.ok) return { success: false, error: r.error };

    if (!data.title || String(data.title).length > 200) return { success: false, error: "Título no válido" }
    if (!Array.isArray(data.exercises) || data.exercises.length > 100) return { success: false, error: "Ejercicios no válidos" }

    const routine = await prisma.routine.create({
      data: {
        athleteId: data.athleteId,
        coachId: r.coachId,
        title: data.title,
        date: data.date,
        duration: data.duration,
        exercises: {
          create: data.exercises.map(e => ({ name: e.name, sets: e.sets, reps: e.reps, notes: e.notes }))
        }
      }
    })

    const coachUser = await prisma.user.findUnique({
      where: { id: r.coachId },
      select: { name: true }
    })
    const athleteUser = await prisma.user.findUnique({
      where: { id: data.athleteId },
      select: { name: true, phone: true }
    })

    const coachName = coachUser?.name || "tu entrenador"
    const reminderTimeStr = data.reminderTime ? ` (Hora sugerida: ${data.reminderTime})` : ""

    // 1. Notificación inmediata de asignación
    await sendNotificationToUser(data.athleteId, {
      title: "🏋️‍♂️ ¡Nueva rutina asignada!",
      message: `${coachName} te ha asignado la rutina "${data.title}" (${data.duration})${reminderTimeStr}. ¡A darlo todo hoy en el gym!`,
      type: "ROUTINE",
      url: "/rutina",
    }).catch(() => {});

    // 2. Notificación de Seguimiento / Recordatorio
    await sendNotificationToUser(data.athleteId, {
      title: "⏰ Seguimiento de Rutina",
      message: `Hola ${athleteUser?.name?.split(" ")[0] || "atleta"}, tu coach ${coachName} te recuerda cumplir tu rutina "${data.title}" hoy${reminderTimeStr}. ¡La constancia es la clave!`,
      type: "ROUTINE",
      url: "/rutina",
    }).catch(() => {});

    // 3. Generar enlace de WhatsApp para seguimiento directo
    let whatsAppUrl = ""
    if (athleteUser?.phone) {
      const cleanPhone = athleteUser.phone.replace(/\D/g, "")
      const fullPhone = cleanPhone.startsWith("58") ? cleanPhone : `58${cleanPhone.replace(/^0/, "")}`
      const msg = `¡Hola ${athleteUser.name?.split(" ")[0]}! Te saluda tu entrenador ${coachName}. Te he asignado tu nueva rutina "${data.title}" (${data.duration})${reminderTimeStr}. Puedes verla y marcar tus ejercicios aquí: https://maximumevolutionfit.com/rutina ¡A entrenar con todo!`
      whatsAppUrl = `https://wa.me/${fullPhone}?text=${encodeURIComponent(msg)}`
    }

    return { success: true, routine, whatsAppUrl }
  } catch (error: any) {
    console.error(error)
    return { success: false, error: "No se pudo crear la rutina." }
  }
}

export async function createDiet(data: {
  athleteId: string
  coachId: string
  title: string
  description?: string
  weeklyPlan?: string
  mealSchedule?: {
    breakfast?: string
    lunch?: string
    snacks?: string
    dinner?: string
  }
  date: Date
}) {
  try {
    const r = await resolveAssignment(data.athleteId, data.coachId)
    if (!r.ok) return { success: false, error: r.error };

    let finalWeeklyPlan = data.weeklyPlan
    if (data.mealSchedule) {
      try {
        const parsed = finalWeeklyPlan ? JSON.parse(finalWeeklyPlan) : {}
        parsed.__schedule = data.mealSchedule
        finalWeeklyPlan = JSON.stringify(parsed)
      } catch {
        finalWeeklyPlan = JSON.stringify({ raw: finalWeeklyPlan, __schedule: data.mealSchedule })
      }
    }

    const diet = await prisma.dietAssignment.create({
      data: {
        athleteId: data.athleteId,
        coachId: r.coachId,
        title: data.title,
        description: data.description,
        weeklyPlan: finalWeeklyPlan,
        date: data.date
      }
    })

    const coachUser = await prisma.user.findUnique({
      where: { id: r.coachId },
      select: { name: true }
    })
    const athleteUser = await prisma.user.findUnique({
      where: { id: data.athleteId },
      select: { name: true, phone: true }
    })

    const coachName = coachUser?.name || "tu entrenador"
    const sch = data.mealSchedule

    // 1. Notificación inicial
    await sendNotificationToUser(data.athleteId, {
      title: "🥗 ¡Nuevo plan de alimentación!",
      message: `${coachName} te ha asignado tu plan nutricional "${data.title}". Revisa tus comidas y horarios de seguimiento en la app.`,
      type: "DIET",
      url: "/rutina",
    }).catch(() => {});

    // 2. Notificaciones de seguimiento según los tiempos que colocó el entrenador para la dieta
    const scheduleItems = [
      { label: "Desayuno", time: sch?.breakfast || "08:00 AM" },
      { label: "Almuerzo", time: sch?.lunch || "01:00 PM" },
      { label: "Merienda", time: sch?.snacks || "04:30 PM" },
      { label: "Cena", time: sch?.dinner || "08:00 PM" }
    ]

    for (const item of scheduleItems) {
      await sendNotificationToUser(data.athleteId, {
        title: `⏰ Recordatorio de Dieta (${item.label} - ${item.time})`,
        message: `Hola ${athleteUser?.name?.split(" ")[0] || "atleta"}, recuerda cumplir con tu ${item.label.toLowerCase()} a las ${item.time} según la pauta asignada por ${coachName}.`,
        type: "DIET",
        url: "/rutina",
      }).catch(() => {});
    }

    // 3. Generar enlace de WhatsApp para seguimiento directo de dieta
    let whatsAppUrl = ""
    if (athleteUser?.phone) {
      const cleanPhone = athleteUser.phone.replace(/\D/g, "")
      const fullPhone = cleanPhone.startsWith("58") ? cleanPhone : `58${cleanPhone.replace(/^0/, "")}`
      const timesSummary = sch
        ? `\n- Desayuno: ${sch.breakfast || '08:00 AM'}\n- Almuerzo: ${sch.lunch || '01:00 PM'}\n- Merienda: ${sch.snacks || '04:30 PM'}\n- Cena: ${sch.dinner || '08:00 PM'}`
        : ""
      const msg = `¡Hola ${athleteUser.name?.split(" ")[0]}! Te saluda tu entrenador ${coachName}. Te he asignado tu nuevo plan de alimentación "${data.title}".${timesSummary ? '\n\nHorarios pautados de comidas:' + timesSummary : ''}\n\nPuedes ver los detalles en tu app: https://maximumevolutionfit.com/rutina\n\n¡La disciplina en la cocina define tus resultados!`
      whatsAppUrl = `https://wa.me/${fullPhone}?text=${encodeURIComponent(msg)}`
    }

    return { success: true, diet, whatsAppUrl }
  } catch (error: any) {
    console.error(error)
    return { success: false, error: "No se pudo crear la dieta." }
  }
}

export async function sendCoachFollowUpReminder(athleteId: string, planType: "ROUTINE" | "DIET", planTitle: string, extraNote?: string) {
  const g = await guard(["coach", "admin", "employee"])
  if (!g.ok) return { success: false, error: g.error }

  try {
    const athlete = await prisma.user.findUnique({
      where: { id: athleteId },
      select: { id: true, name: true, phone: true }
    })
    if (!athlete) return { success: false, error: "Atleta no encontrado" }

    const coachName = g.user.name || "Tu Entrenador"
    const typeLabel = planType === "ROUTINE" ? "tu rutina de entrenamiento" : "tu plan nutricional"
    const titleLabel = planType === "ROUTINE" ? "🏋️ Recordatorio de Rutina" : "🥗 Recordatorio de Alimentación"
    const noteText = extraNote ? ` Nota del coach: "${extraNote}".` : ""

    await sendNotificationToUser(athlete.id, {
      title: titleLabel,
      message: `¡Hola ${athlete.name.split(" ")[0]}! ${coachName} te recuerda cumplir con ${typeLabel} "${planTitle}".${noteText} ¡No te detengas! 💪`,
      type: planType,
      url: "/rutina"
    })

    let whatsAppUrl = ""
    if (athlete.phone) {
      const cleanPhone = athlete.phone.replace(/\D/g, "")
      const fullPhone = cleanPhone.startsWith("58") ? cleanPhone : `58${cleanPhone.replace(/^0/, "")}`
      const msg = `¡Hola ${athlete.name.split(" ")[0]}! Te saluda tu entrenador ${coachName}. Te recuerdo cumplir hoy con ${typeLabel} "${planTitle}".${noteText}\n\nPuedes revisarla aquí: https://maximumevolutionfit.com/rutina\n¡A darlo todo!`
      whatsAppUrl = `https://wa.me/${fullPhone}?text=${encodeURIComponent(msg)}`
    }

    return { success: true, whatsAppUrl }
  } catch (error: any) {
    console.error(error)
    return { success: false, error: "No se pudo enviar el recordatorio." }
  }
}

export async function getAthleteData(athleteId: string) {
  const g = await guardSelfOr(athleteId, ROLES.STAFF)
  if (!g.ok) return { success: false, error: g.error }
  try {
    const routines = await prisma.routine.findMany({
      where: { athleteId },
      include: {
        exercises: true,
        coach: { select: { name: true } }
      },
      orderBy: { date: "desc" }
    })

    const diets = await prisma.dietAssignment.findMany({
      where: { athleteId },
      include: {
        coach: { select: { name: true } }
      },
      orderBy: { date: "desc" }
    })

    return { success: true, routines, diets }
  } catch (error: any) {
    console.error(error)
    return { success: false, error: "No se pudo obtener la información." }
  }
}

export async function markRoutineCompleted(routineId: string) {
  const g = await guard()
  if (!g.ok) return { success: false, error: g.error }
  try {
    const routine = await prisma.routine.findUnique({ where: { id: routineId }, select: { athleteId: true, coachId: true } })
    if (!routine) return { success: false, error: "Rutina no encontrada" }
    // El atleta dueño, su entrenador, o admin/empleado
    const allowed = routine.athleteId === g.user.id || routine.coachId === g.user.id || ["admin", "employee"].includes(g.user.role)
    if (!allowed) return { success: false, error: DENIED }

    await prisma.routine.update({
      where: { id: routineId },
      data: { completed: true }
    })
    return { success: true }
  } catch (error: any) {
    console.error(error)
    return { success: false, error: "No se pudo actualizar la rutina." }
  }
}

export async function toggleExerciseCompleted(exerciseId: string, completed: boolean) {
  const g = await guard()
  if (!g.ok) return { success: false, error: g.error }
  try {
    const exercise = await prisma.routineExercise.findUnique({
      where: { id: exerciseId },
      select: { routine: { select: { athleteId: true, coachId: true } } },
    })
    if (!exercise) return { success: false, error: "Ejercicio no encontrado" }
    const r = exercise.routine
    const allowed = r.athleteId === g.user.id || r.coachId === g.user.id || ["admin", "employee"].includes(g.user.role)
    if (!allowed) return { success: false, error: DENIED }

    await prisma.routineExercise.update({
      where: { id: exerciseId },
      data: { completed: Boolean(completed) }
    })
    return { success: true }
  } catch (error: any) {
    console.error(error)
    return { success: false, error: "No se pudo actualizar el ejercicio." }
  }
}

export async function recordExerciseProgress(data: {
  exerciseName: string
  weight: number | string
  date?: string | Date
  athleteId?: string
}) {
  const g = await guard(["athlete", "coach", "admin", "employee"])
  if (!g.ok) return { success: false, error: g.error }

  try {
    const targetAthleteId = g.user.role === "athlete" ? g.user.id : (data.athleteId || g.user.id)
    if (!data.exerciseName?.trim()) {
      return { success: false, error: "Debes indicar el nombre del ejercicio." }
    }
    const weightNum = parseFloat(String(data.weight))
    if (!Number.isFinite(weightNum) || weightNum <= 0) {
      return { success: false, error: "El peso debe ser mayor a 0 kg." }
    }

    const record = await prisma.exerciseProgress.create({
      data: {
        athleteId: targetAthleteId,
        exerciseName: data.exerciseName.trim(),
        weight: weightNum,
        date: data.date ? new Date(data.date) : new Date()
      }
    })

    return { success: true, record }
  } catch (error: any) {
    console.error("Error al registrar récord personal:", error)
    return { success: false, error: "No se pudo guardar la carga máxima." }
  }
}
