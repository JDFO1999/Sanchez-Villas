"use server";
import prisma from "@/lib/db"
import { guard, guardSelfOr, ROLES, DENIED } from "@/lib/authz"

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
      select: { id: true, name: true, cedula: true, createdAt: true, profilePicture: true, _count: { select: { athleteRoutines: true, athleteDiets: true } } },
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
        athlete: { select: { name: true } },
        exercises: true
      },
      orderBy: { createdAt: "desc" },
      take: 50
    })

    const diets = await prisma.dietAssignment.findMany({
      where: { coachId },
      include: {
        athlete: { select: { name: true } }
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
  if (g.user.role === "coach" && athlete.coachId && athlete.coachId !== g.user.id) return { ok: false as const, error: DENIED }

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
    return { success: true, routine }
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
  date: Date
}) {
  try {
    const r = await resolveAssignment(data.athleteId, data.coachId)
    if (!r.ok) return { success: false, error: r.error };

    const diet = await prisma.dietAssignment.create({
      data: {
        athleteId: data.athleteId,
        coachId: r.coachId,
        title: data.title,
        description: data.description,
        weeklyPlan: data.weeklyPlan,
        date: data.date
      }
    })
    return { success: true, diet }
  } catch (error: any) {
    console.error(error)
    return { success: false, error: "No se pudo crear la dieta." }
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
