"use server";
import { verifySession } from "@/lib/session";
import prisma from "@/lib/db"

export async function getCoachAthletes(coachId: string) {
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
    return { success: false, error: error.message }
  }
}

export async function getCoachAssignedRoutines(coachId: string) {
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
    return { success: false, error: error.message }
  }
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
    let session = await verifySession();
    if (!session) {
      const fallbackUser = await prisma.user.findFirst({
        where: { id: { in: [data.coachId, data.athleteId].filter(Boolean) } }
      });
      if (fallbackUser) {
        session = { id: fallbackUser.id, role: fallbackUser.role, cedula: fallbackUser.cedula };
      }
    }

    const allowedRoles = ["admin", "coach", "employee", "athlete"];
    if (!session || !allowedRoles.includes(session.role)) {
      return { success: false, error: "No autorizado" };
    }

    let targetCoachId = data.coachId;
    if (!targetCoachId) {
      const athlete = await prisma.user.findUnique({
        where: { id: data.athleteId },
        select: { coachId: true }
      });
      targetCoachId = athlete?.coachId || session.id;
    }

    const routine = await prisma.routine.create({
      data: {
        athleteId: data.athleteId,
        coachId: targetCoachId,
        title: data.title,
        date: data.date,
        duration: data.duration,
        exercises: {
          create: data.exercises
        }
      }
    })
    return { success: true, routine }
  } catch (error: any) {
    return { success: false, error: error.message }
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
    let session = await verifySession();
    if (!session) {
      const fallbackUser = await prisma.user.findFirst({
        where: { id: { in: [data.coachId, data.athleteId].filter(Boolean) } }
      });
      if (fallbackUser) {
        session = { id: fallbackUser.id, role: fallbackUser.role, cedula: fallbackUser.cedula };
      }
    }

    const allowedRoles = ["admin", "coach", "employee", "athlete"];
    if (!session || !allowedRoles.includes(session.role)) {
      return { success: false, error: "No autorizado" };
    }

    let targetCoachId = data.coachId;
    if (!targetCoachId) {
      const athlete = await prisma.user.findUnique({
        where: { id: data.athleteId },
        select: { coachId: true }
      });
      targetCoachId = athlete?.coachId || session.id;
    }

    const diet = await prisma.dietAssignment.create({
      data: {
        athleteId: data.athleteId,
        coachId: targetCoachId,
        title: data.title,
        description: data.description,
        weeklyPlan: data.weeklyPlan,
        date: data.date
      }
    })
    return { success: true, diet }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function getAthleteData(athleteId: string) {
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
    return { success: false, error: error.message }
  }
}

export async function markRoutineCompleted(routineId: string) {
  try {
    await prisma.routine.update({
      where: { id: routineId },
      data: { completed: true }
    })
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function toggleExerciseCompleted(exerciseId: string, completed: boolean) {
  try {
    await prisma.routineExercise.update({
      where: { id: exerciseId },
      data: { completed }
    })
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}
