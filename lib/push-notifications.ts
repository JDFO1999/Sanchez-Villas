import webpush from "web-push"
import prisma from "@/lib/db"

// Inicializar configuración VAPID
const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "BItGbsbYuo0lJGgDmQiFduYnhxUTVjvD8pzNXdPGLJBt-znJPCzFFfvZnhktMLN6hyQPtLlYdCJT89cO4x2gFNk"
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY || "bfOm1J-KOmciseLGkzQLXvABTmOs6w-Hjx2EUP3vJxI"
const vapidSubject = process.env.VAPID_SUBJECT || "mailto:soporte@maximumevolutionfit.com"

try {
  webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey)
} catch (e) {
  console.warn("Advertencia al inicializar WebPush VAPID:", e)
}

export type NotificationType =
  | "POST"
  | "BIRTHDAY"
  | "ROUTINE"
  | "DIET"
  | "RANKING"
  | "MEMBERSHIP_EXPIRING"
  | "MEMBERSHIP_ACTIVATED"
  | "GENERAL"

export interface SendNotificationPayload {
  title: string
  message: string
  type: NotificationType
  url?: string
  avatarUrl?: string
}

/**
 * Envía una notificación a un usuario específico:
 * 1. La guarda en la base de datos (AppNotification).
 * 2. La envía a todos los dispositivos móviles y navegadores suscritos (Web Push) del usuario.
 */
export async function sendNotificationToUser(
  userId: string,
  payload: SendNotificationPayload
) {
  try {
    // 1. Guardar en Base de Datos
    const notification = await prisma.appNotification.create({
      data: {
        userId,
        title: payload.title,
        message: payload.message,
        type: payload.type,
        url: payload.url || "/",
        avatarUrl: payload.avatarUrl || null,
        read: false,
      },
    })

    // 2. Obtener suscripciones activas del usuario
    const subscriptions = await prisma.pushSubscription.findMany({
      where: { userId },
    })

    if (subscriptions.length > 0) {
      const pushPayload = JSON.stringify({
        title: payload.title,
        body: payload.message,
        type: payload.type,
        url: payload.url || "/",
        icon: "/icon.png",
        badge: "/favicon.png",
        tag: `maxfit_${payload.type.toLowerCase()}_${Date.now()}`,
        id: notification.id,
      })

      const pushPromises = subscriptions.map(async (sub) => {
        try {
          await webpush.sendNotification(
            {
              endpoint: sub.endpoint,
              keys: {
                p256dh: sub.p256dh,
                auth: sub.auth,
              },
            },
            pushPayload
          )
        } catch (err: any) {
          // Si el endpoint expiró o fue revocado por el teléfono (410 o 404), limpiar de la base de datos
          if (err.statusCode === 410 || err.statusCode === 404) {
            await prisma.pushSubscription.delete({ where: { id: sub.id } }).catch(() => {})
          }
        }
      })

      await Promise.allSettled(pushPromises)
    }

    return { success: true, notificationId: notification.id }
  } catch (error) {
    console.error("Error sending notification to user:", error)
    return { success: false, error }
  }
}

/**
 * Envía una notificación masiva (Broadcast) a todos los atletas activos (ej: nuevo post, cumpleañero).
 */
export async function broadcastNotification(
  payload: SendNotificationPayload,
  excludeUserId?: string
) {
  try {
    const athletes = await prisma.user.findMany({
      where: {
        role: "athlete",
        ...(excludeUserId ? { id: { not: excludeUserId } } : {}),
      },
      select: { id: true },
    })

    if (athletes.length === 0) return { success: true, count: 0 }

    // Crear notificaciones en lote
    await prisma.appNotification.createMany({
      data: athletes.map((a) => ({
        userId: a.id,
        title: payload.title,
        message: payload.message,
        type: payload.type,
        url: payload.url || "/",
        avatarUrl: payload.avatarUrl || null,
        read: false,
      })),
    })

    // Enviar push a todas las suscripciones de los atletas
    const subscriptions = await prisma.pushSubscription.findMany({
      where: {
        userId: { in: athletes.map((a) => a.id) },
      },
    })

    if (subscriptions.length > 0) {
      const pushPayload = JSON.stringify({
        title: payload.title,
        body: payload.message,
        type: payload.type,
        url: payload.url || "/",
        icon: "/icon.png",
        badge: "/favicon.png",
        tag: `maxfit_${payload.type.toLowerCase()}_${Date.now()}`,
      })

      const pushPromises = subscriptions.map(async (sub) => {
        try {
          await webpush.sendNotification(
            {
              endpoint: sub.endpoint,
              keys: {
                p256dh: sub.p256dh,
                auth: sub.auth,
              },
            },
            pushPayload
          )
        } catch (err: any) {
          if (err.statusCode === 410 || err.statusCode === 404) {
            await prisma.pushSubscription.delete({ where: { id: sub.id } }).catch(() => {})
          }
        }
      })

      // Ejecutar en segundo plano sin bloquear la respuesta
      Promise.allSettled(pushPromises).catch(() => {})
    }

    return { success: true, count: athletes.length }
  } catch (error) {
    console.error("Error broadcasting notification:", error)
    return { success: false, error }
  }
}

/**
 * Trigger 6: Notificación de Activación / Renovación de Membresía al Atleta
 */
export async function notifyMembershipActivated(
  athleteId: string,
  planName: string = "Plan Estándar",
  endDate?: Date
) {
  try {
    const endStr = endDate
      ? endDate.toLocaleDateString("es-ES", { day: "numeric", month: "long" })
      : "tu fecha de vencimiento"

    await sendNotificationToUser(athleteId, {
      title: "✅ ¡Membresía Activada!",
      message: `¡Tu membresía (${planName}) ya está activa hasta el ${endStr}! Ya puedes ingresar y disfrutar de todos tus entrenamientos. 💪`,
      type: "MEMBERSHIP_ACTIVATED",
      url: "/membresias",
    })
  } catch (err) {
    console.error("Error in notifyMembershipActivated:", err)
  }
}
