import { verifySession } from "@/lib/session";
﻿"use server"

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
    const session = await verifySession();
    if (!session || (session.role !== "coach" && session.role !== "admin")) return { success: false, error: "No autorizado" };
    // Enforce that coachId matches the session ID if they are a coach
    if (session.role === "coach" && data.coachId !== session.id) {
      return { success: false, error: "IDOR detectado: No puedes asignar rutinas en nombre de otro entrenador" };
    }
    const routine = await prisma.routine.create({
      data: {
        athleteId: data.athleteId,
        coachId: data.coachId,
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
    const session = await verifySession();
    if (!session || (session.role !== "coach" && session.role !== "admin")) return { success: false, error: "No autorizado" };
    if (session.role === "coach" && data.coachId !== session.id) {
      return { success: false, error: "IDOR detectado: No puedes asignar dietas en nombre de otro entrenador" };
    }
    const diet = await prisma.dietAssignment.create({
      data: {
        athleteId: data.athleteId,
        coachId: data.coachId,
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
