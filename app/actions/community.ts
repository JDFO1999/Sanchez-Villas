"use server"

import prisma from "@/lib/db"
import { guard, getAuthUser, ROLES } from "@/lib/authz"
import { revalidatePath } from "next/cache"

// -------------------------------------------------------------
// POSTS DEL MURO Y AVISOS
// -------------------------------------------------------------

export async function getCommunityPostsAction() {
  try {
    const posts = await prisma.communityPost.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            role: true,
            profilePicture: true,
          },
        },
        reactions: {
          select: {
            id: true,
            userId: true,
            type: true,
          },
        },
      },
    })
    return { success: true, posts }
  } catch (error) {
    console.error("Error fetching community posts:", error)
    return { success: false, error: "Error al cargar publicaciones del muro" }
  }
}

export async function createCommunityPostAction({
  title,
  content,
  tag = "Aviso Oficial",
  imageUrl,
}: {
  title: string
  content: string
  tag?: string
  imageUrl?: string
}) {
  // Solo administradores y entrenadores pueden publicar
  const g = await guard(["admin", "coach"])
  if (!g.ok) {
    return {
      success: false,
      error: "Solo administradores y entrenadores pueden publicar en el muro.",
    }
  }

  if (!title.trim() || !content.trim()) {
    return { success: false, error: "El título y contenido son obligatorios." }
  }

  try {
    const newPost = await prisma.communityPost.create({
      data: {
        authorId: g.user.id,
        title: title.trim(),
        content: content.trim(),
        tag: tag.trim() || "Aviso",
        imageUrl: imageUrl || null,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            role: true,
            profilePicture: true,
          },
        },
        reactions: true,
      },
    })

    revalidatePath("/comunidad")
    return { success: true, post: newPost }
  } catch (error) {
    console.error("Error creating community post:", error)
    return { success: false, error: "Error al publicar en el muro" }
  }
}

export async function deleteCommunityPostAction(postId: string) {
  const g = await guard(ROLES.ADMIN)
  if (!g.ok) {
    return { success: false, error: "Solo el administrador puede eliminar publicaciones." }
  }

  try {
    const post = await prisma.communityPost.findUnique({
      where: { id: postId },
    })

    if (!post) {
      return { success: false, error: "Publicación no encontrada." }
    }

    await prisma.communityPost.delete({
      where: { id: postId },
    })

    revalidatePath("/comunidad")
    return { success: true }
  } catch (error) {
    console.error("Error deleting post:", error)
    return { success: false, error: "Error al eliminar publicación" }
  }
}

// -------------------------------------------------------------
// REACCIONES (Me gusta, Me encanta)
// -------------------------------------------------------------

export async function toggleCommunityReactionAction(
  postId: string,
  type: "LIKE" | "LOVE"
) {
  const user = await getAuthUser()
  if (!user) {
    return { success: false, error: "Debes iniciar sesión para reaccionar." }
  }

  try {
    const existing = await prisma.communityReaction.findUnique({
      where: {
        postId_userId: {
          postId,
          userId: user.id,
        },
      },
    })

    if (existing) {
      if (existing.type === type) {
        // Quitar reacción
        await prisma.communityReaction.delete({
          where: { id: existing.id },
        })
      } else {
        // Cambiar de LIKE a LOVE o viceversa
        await prisma.communityReaction.update({
          where: { id: existing.id },
          data: { type },
        })
      }
    } else {
      // Crear nueva reacción
      await prisma.communityReaction.create({
        data: {
          postId,
          userId: user.id,
          type,
        },
      })
    }

    revalidatePath("/comunidad")
    return { success: true }
  } catch (error) {
    console.error("Error toggling reaction:", error)
    return { success: false, error: "Error al registrar reacción" }
  }
}

// -------------------------------------------------------------
// RETOS DEL MES (CHALLENGES)
// -------------------------------------------------------------

export async function getCommunityChallengesAction() {
  const user = await getAuthUser()
  const isPrivileged = user?.role === "admin" || user?.role === "coach"

  try {
    const challenges = await prisma.communityChallenge.findMany({
      where: isPrivileged
        ? undefined
        : { status: "APPROVED" },
      orderBy: { createdAt: "desc" },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            role: true,
            profilePicture: true,
          },
        },
        participants: {
          select: {
            id: true,
            userId: true,
            progress: true,
          },
        },
      },
    })

    return { success: true, challenges }
  } catch (error) {
    console.error("Error fetching challenges:", error)
    return { success: false, error: "Error al cargar retos de la comunidad" }
  }
}

export async function createCommunityChallengeAction({
  title,
  description,
  category = "Fuerza",
  daysLeft = 30,
}: {
  title: string
  description: string
  category: string
  daysLeft: number
}) {
  const g = await guard(["admin", "coach"])
  if (!g.ok) {
    return {
      success: false,
      error: "Solo entrenadores y administradores pueden crear retos.",
    }
  }

  if (!title.trim() || !description.trim()) {
    return { success: false, error: "Título y descripción son requeridos." }
  }

  // Si es admin se aprueba automáticamente; si es coach queda pendiente de aprobación
  const status = g.user.role === "admin" ? "APPROVED" : "PENDING"

  try {
    const challenge = await prisma.communityChallenge.create({
      data: {
        title: title.trim(),
        description: description.trim(),
        category: category.trim(),
        daysLeft: Math.max(1, Number(daysLeft) || 30),
        status,
        creatorId: g.user.id,
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            role: true,
            profilePicture: true,
          },
        },
        participants: true,
      },
    })

    revalidatePath("/comunidad")
    return {
      success: true,
      challenge,
      message:
        status === "APPROVED"
          ? "Reto publicado exitosamente."
          : "Reto propuesto. Pendiente de aprobación por la administración.",
    }
  } catch (error) {
    console.error("Error creating challenge:", error)
    return { success: false, error: "Error al crear el reto" }
  }
}

export async function updateChallengeStatusAction(
  challengeId: string,
  newStatus: "APPROVED" | "REJECTED"
) {
  const g = await guard(ROLES.ADMIN)
  if (!g.ok) {
    return {
      success: false,
      error: "Solo el administrador puede aprobar o rechazar retos.",
    }
  }

  try {
    await prisma.communityChallenge.update({
      where: { id: challengeId },
      data: { status: newStatus },
    })

    revalidatePath("/comunidad")
    return { success: true }
  } catch (error) {
    console.error("Error updating challenge status:", error)
    return { success: false, error: "Error al actualizar estado del reto" }
  }
}

export async function toggleJoinChallengeAction(challengeId: string) {
  const user = await getAuthUser()
  if (!user) {
    return { success: false, error: "Debes iniciar sesión para unirte al reto." }
  }

  try {
    const existing = await prisma.communityChallengeParticipant.findUnique({
      where: {
        challengeId_userId: {
          challengeId,
          userId: user.id,
        },
      },
    })

    if (existing) {
      await prisma.communityChallengeParticipant.delete({
        where: { id: existing.id },
      })
      revalidatePath("/comunidad")
      return { success: true, joined: false }
    } else {
      await prisma.communityChallengeParticipant.create({
        data: {
          challengeId,
          userId: user.id,
          progress: 10,
        },
      })
      revalidatePath("/comunidad")
      return { success: true, joined: true }
    }
  } catch (error) {
    console.error("Error joining challenge:", error)
    return { success: false, error: "Error al actualizar inscripción al reto" }
  }
}

// -------------------------------------------------------------
// FILOSOFÍA DE ENTRENAMIENTO (Solo Admin)
// -------------------------------------------------------------

export async function updateTrainingPhilosophyAction(philosophy: string) {
  const g = await guard(ROLES.ADMIN)
  if (!g.ok) {
    return {
      success: false,
      error: "Solo el administrador puede editar la filosofía de entrenamiento.",
    }
  }

  try {
    const record = await prisma.systemSetting.findUnique({
      where: { id: "default" },
    })

    let current = {}
    if (record?.data) {
      try {
        current = JSON.parse(record.data)
      } catch (_) {}
    }

    const updated = {
      ...current,
      trainingPhilosophy: philosophy.trim(),
    }

    await prisma.systemSetting.upsert({
      where: { id: "default" },
      update: { data: JSON.stringify(updated) },
      create: { id: "default", data: JSON.stringify(updated) },
    })

    revalidatePath("/comunidad")
    return { success: true, philosophy: philosophy.trim() }
  } catch (error) {
    console.error("Error updating philosophy:", error)
    return { success: false, error: "Error al actualizar filosofía" }
  }
}

// -------------------------------------------------------------
// HORARIOS DE SALA (Solo Admin)
// -------------------------------------------------------------

export async function updateGymScheduleAction(schedule: {
  weekdays: string
  saturdays: string
  sundays: string
}) {
  const g = await guard(ROLES.ADMIN)
  if (!g.ok) {
    return {
      success: false,
      error: "Solo el administrador puede editar los horarios de sala.",
    }
  }

  try {
    const record = await prisma.systemSetting.findUnique({
      where: { id: "default" },
    })

    let current = {}
    if (record?.data) {
      try {
        current = JSON.parse(record.data)
      } catch (_) {}
    }

    const updated = {
      ...current,
      gymSchedule: schedule,
    }

    await prisma.systemSetting.upsert({
      where: { id: "default" },
      update: { data: JSON.stringify(updated) },
      create: { id: "default", data: JSON.stringify(updated) },
    })

    revalidatePath("/comunidad")
    revalidatePath("/ajustes")
    revalidatePath("/")
    return { success: true, gymSchedule: schedule }
  } catch (error) {
    console.error("Error updating gym schedule:", error)
    return { success: false, error: "Error al actualizar horarios de sala" }
  }
}

// -------------------------------------------------------------
// SALÓN DE LA FAMA (Datos reales basados en superación de atletas)
// -------------------------------------------------------------

export async function getHallOfFameAction() {
  try {
    const athletes = await prisma.user.findMany({
      where: { role: "athlete" },
      select: {
        id: true,
        name: true,
        profilePicture: true,
        attendances: {
          select: { id: true, date: true },
          orderBy: { date: "desc" },
        },
        biometrics: {
          select: { id: true, weight: true, height: true, date: true, customFields: true },
          orderBy: { date: "asc" },
        },
        challengeParticipations: {
          select: { id: true, challenge: { select: { title: true } } },
        },
      },
    })

    const leaders: any[] = []

    athletes.forEach((athlete) => {
      const attCount = athlete.attendances.length
      const bioCount = athlete.biometrics.length
      const chalCount = athlete.challengeParticipations.length

      // 1. Constancia en Asistencias
      if (attCount > 0) {
        leaders.push({
          athleteId: athlete.id,
          name: athlete.name,
          profilePicture: athlete.profilePicture,
          category: "Constancia & Asistencia",
          stat: `${attCount} check-in${attCount > 1 ? "s" : ""} registrado${attCount > 1 ? "s" : ""}`,
          score: attCount * 10,
          badge: attCount >= 20 ? "Oro" : attCount >= 10 ? "Plata" : "Bronce",
          color: attCount >= 20 ? "text-amber-400" : attCount >= 10 ? "text-zinc-300" : "text-amber-600",
        })
      }

      // 2. Evolución Biométrica
      if (bioCount >= 2) {
        const first = athlete.biometrics[0]
        const last = athlete.biometrics[bioCount - 1]
        const weightDiff = Math.abs(last.weight - first.weight)
        leaders.push({
          athleteId: athlete.id,
          name: athlete.name,
          profilePicture: athlete.profilePicture,
          category: "Evolución Corporal",
          stat: `${weightDiff.toFixed(1)} kg transformados (${bioCount} mediciones)`,
          score: Math.round(weightDiff * 15) + bioCount * 5,
          badge: weightDiff >= 5 ? "Oro" : "Plata",
          color: weightDiff >= 5 ? "text-amber-400" : "text-zinc-300",
        })
      }

      // 3. Superación de Retos
      if (chalCount > 0) {
        leaders.push({
          athleteId: athlete.id,
          name: athlete.name,
          profilePicture: athlete.profilePicture,
          category: "Superación de Retos",
          stat: `${chalCount} reto${chalCount > 1 ? "s" : ""} asumido${chalCount > 1 ? "s" : ""}`,
          score: chalCount * 25,
          badge: chalCount >= 3 ? "Oro" : chalCount >= 2 ? "Plata" : "Bronce",
          color: chalCount >= 3 ? "text-amber-400" : chalCount >= 2 ? "text-zinc-300" : "text-amber-600",
        })
      }
    })

    // Ordenar de mayor a menor puntuación de superación
    leaders.sort((a, b) => b.score - a.score)

    // Tomar los mejores 10 registros
    const topLeaders = leaders.slice(0, 10).map((l, index) => ({
      ...l,
      pos: index + 1,
    }))

    return { success: true, leaders: topLeaders }
  } catch (error) {
    console.error("Error getting hall of fame:", error)
    return { success: false, error: "Error al calcular salón de la fama" }
  }
}

