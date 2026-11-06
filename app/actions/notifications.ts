"use server"

import prisma from "@/lib/db"
import { guard, ROLES } from "@/lib/authz"
import { 
  sendMembershipExpiringSoonEmail, 
  sendMembershipExpiredEmail, 
  sendInactivityReminderEmail,
  testSmtpConnection
} from "@/lib/mailer"
import { sendNotificationToUser } from "@/lib/push-notifications"

export interface WhatsAppNotificationQueueItem {
  id: string
  name: string
  phone: string
  cedula: string
  type: "EXPIRING_4_DAYS" | "EXPIRED_TODAY" | "INACTIVE_7_DAYS"
  title: string
  message: string
}

export interface NotificationCheckResult {
  success: boolean
  error?: string
  summary?: {
    expiring4DaysCount: number
    expiredTodayCount: number
    inactive7DaysCount: number
    emailsSentCount: number
    whatsappQueue: WhatsAppNotificationQueueItem[]
  }
}

/**
 * Ejecuta la verificación diaria de alertas de membresías (incluyendo 4 días antes) e inasistencia.
 * Envía correos automáticos vía Resend, genera la cola de WhatsApp y dispara Push Notifications a móviles.
 */
export async function runDailyNotificationChecks(skipAuth: boolean = false): Promise<NotificationCheckResult> {
  if (!skipAuth) {
    const g = await guard(ROLES.STAFF)
    if (!g.ok) return { success: false, error: g.error }
  }

  try {
    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0)
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999)

    // Ventana de exactamente 4 días antes
    const in4DaysStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 4, 0, 0, 0, 0)
    const in4DaysEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 4, 23, 59, 59, 999)

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

    // Obtener atletas con sus membresías y asistencias
    const athletes = await prisma.user.findMany({
      where: {
        role: "athlete"
      },
      include: {
        memberships: {
          orderBy: { endDate: "desc" },
          take: 1
        },
        attendances: {
          orderBy: { date: "desc" },
          take: 1
        }
      }
    })

    // Obtener configuración del gimnasio para instrucciones de pago
    const settingRecord = await prisma.systemSetting.findUnique({
      where: { id: "default" }
    })
    let settingsData: any = {}
    if (settingRecord?.data) {
      try { settingsData = JSON.parse(settingRecord.data) } catch {}
    }

    const pagoMovilInfo = settingsData?.storePaymentInstructions?.pagoMovil || "Pago Móvil disponible en recepción"
    const binanceInfo = settingsData?.storePaymentInstructions?.binance || "Binance Pay ID disponible en recepción"

    let emailsSentCount = 0
    let expiring4DaysCount = 0
    let expiredTodayCount = 0
    let inactive7DaysCount = 0
    const whatsappQueue: WhatsAppNotificationQueueItem[] = []

    for (const ath of athletes) {
      const activeMemb = ath.memberships[0]
      if (!activeMemb) continue

      const endDate = new Date(activeMemb.endDate)
      const planName = activeMemb.planName || "Plan Estándar"
      const firstName = ath.name.split(" ")[0]
      const expiryFormatted = endDate.toLocaleDateString("es-ES", { day: "numeric", month: "long" })

      // 1. Trigger 5: Vence en 4 días
      if (endDate >= in4DaysStart && endDate <= in4DaysEnd) {
        expiring4DaysCount++
        
        // Notificación Push a Móviles tipo WhatsApp
        await sendNotificationToUser(ath.id, {
          title: "⏳ Tu membresía vence en 4 días",
          message: `¡Hola ${firstName}! Tu plan ${planName} vence el ${expiryFormatted}. Renueva a tiempo en recepción o desde tu app para no interrumpir tus entrenamientos. ¡A darlo todo! 💪`,
          type: "MEMBERSHIP_EXPIRING",
          url: "/membresias"
        })

        if (ath.email && ath.email.includes("@")) {
          const sent = await sendMembershipExpiringSoonEmail(ath.email, ath.name, 4, planName, expiryFormatted)
          if (sent.success) emailsSentCount++
        }

        if (ath.phone) {
          whatsappQueue.push({
            id: `exp_4_${ath.id}`,
            name: ath.name,
            phone: ath.phone,
            cedula: ath.cedula,
            type: "EXPIRING_4_DAYS",
            title: "Aviso de Vencimiento (4 días)",
            message: `¡Hola ${firstName}! Te recordamos de forma amistosa que tu membresía (${planName}) en Maximum Evolution Fit está próxima a vencer el ${expiryFormatted}. Renueva a tiempo en recepción o desde tu app para no interrumpir tus entrenamientos. ¡A darlo todo! 💪`
          })
        }
      }

      // 2. Vence hoy (Alerta de corte)
      else if (endDate >= todayStart && endDate <= todayEnd) {
        expiredTodayCount++
        if (ath.email && ath.email.includes("@")) {
          const sent = await sendMembershipExpiredEmail(ath.email, ath.name, planName, {
            pagoMovil: pagoMovilInfo,
            binance: binanceInfo
          })
          if (sent.success) emailsSentCount++
        }
        if (ath.phone) {
          whatsappQueue.push({
            id: `exp_today_${ath.id}`,
            name: ath.name,
            phone: ath.phone,
            cedula: ath.cedula,
            type: "EXPIRED_TODAY",
            title: "Alerta de Corte (Hoy)",
            message: `⚠️ Alerta de Corte: ¡Hola ${firstName}! Tu membresía (${planName}) en Maximum Evolution Fit vence hoy. Puedes realizar tu pago por Pago Móvil (${pagoMovilInfo}) o Binance Pay (${binanceInfo}) y presentar tu comprobante en recepción para mantener activo tu acceso. ¡Te esperamos!`
          })
        }
      }

      // 3. Retención por inasistencia (Membresía activa, pero más de 7 días sin asistir)
      else if (endDate > now) {
        const lastAtt = ath.attendances[0]?.date
        const isInactive = lastAtt 
          ? new Date(lastAtt) < sevenDaysAgo 
          : new Date(ath.createdAt) < sevenDaysAgo

        if (isInactive) {
          const daysWithoutAtt = lastAtt 
            ? Math.floor((now.getTime() - new Date(lastAtt).getTime()) / (1000 * 60 * 60 * 24))
            : Math.floor((now.getTime() - new Date(ath.createdAt).getTime()) / (1000 * 60 * 60 * 24))

          inactive7DaysCount++
          if (ath.email && ath.email.includes("@")) {
            const sent = await sendInactivityReminderEmail(ath.email, ath.name, daysWithoutAtt)
            if (sent.success) emailsSentCount++
          }
          if (ath.phone) {
            whatsappQueue.push({
              id: `inact_${ath.id}`,
              name: ath.name,
              phone: ath.phone,
              cedula: ath.cedula,
              type: "INACTIVE_7_DAYS",
              title: `Inasistencia (${daysWithoutAtt} días)`,
              message: `¡Hola ${firstName}! Notamos que llevas ${daysWithoutAtt} días sin venir a entrenar a Maximum Evolution Fit. ¿Todo bien? Tu rutina y tus metas te están esperando. Si necesitas ayuda con tus ejercicios o una reevaluación con tu entrenador, acércate a recepción. ¡No pierdas la constancia! 💪🔥`
            })
          }
        }
      }
    }

    return {
      success: true,
      summary: {
        expiring4DaysCount,
        expiredTodayCount,
        inactive7DaysCount,
        emailsSentCount,
        whatsappQueue
      }
    }
  } catch (error: any) {
    console.error("Error in runDailyNotificationChecks:", error)
    return { success: false, error: error?.message || "Error al procesar notificaciones." }
  }
}

/**
 * Guarda o actualiza la suscripción Web Push del dispositivo del usuario
 */
export async function savePushSubscriptionAction(subData: {
  endpoint: string
  p256dh: string
  auth: string
}) {
  const g = await guard()
  if (!g.ok) return { success: false, error: g.error }

  try {
    const existing = await prisma.pushSubscription.findFirst({
      where: { endpoint: subData.endpoint },
    })

    if (existing) {
      await prisma.pushSubscription.update({
        where: { id: existing.id },
        data: {
          userId: g.user.id,
          p256dh: subData.p256dh,
          auth: subData.auth,
        },
      })
    } else {
      await prisma.pushSubscription.create({
        data: {
          userId: g.user.id,
          endpoint: subData.endpoint,
          p256dh: subData.p256dh,
          auth: subData.auth,
        },
      })
    }

    return { success: true }
  } catch (error: any) {
    console.error("Error saving push subscription:", error)
    return { success: false, error: error?.message || "Error al registrar dispositivo" }
  }
}

/**
 * Obtiene las notificaciones del usuario logueado con contador de no leídas
 */
export async function getMyNotificationsAction() {
  const g = await guard()
  if (!g.ok) return { success: false, notifications: [], unreadCount: 0 }

  try {
    const notifications = await prisma.appNotification.findMany({
      where: { userId: g.user.id },
      orderBy: { createdAt: "desc" },
      take: 25,
    })

    const unreadCount = await prisma.appNotification.count({
      where: { userId: g.user.id, read: false },
    })

    return { success: true, notifications, unreadCount }
  } catch (error: any) {
    console.error("Error fetching user notifications:", error)
    return { success: false, notifications: [], unreadCount: 0 }
  }
}

/**
 * Marca una notificación como leída
 */
export async function markNotificationReadAction(notificationId: string) {
  const g = await guard()
  if (!g.ok) return { success: false }

  try {
    await prisma.appNotification.updateMany({
      where: { id: notificationId, userId: g.user.id },
      data: { read: true },
    })
    return { success: true }
  } catch (_) {
    return { success: false }
  }
}

/**
 * Marca todas las notificaciones del usuario como leídas
 */
export async function markAllNotificationsReadAction() {
  const g = await guard()
  if (!g.ok) return { success: false }

  try {
    await prisma.appNotification.updateMany({
      where: { userId: g.user.id, read: false },
      data: { read: true },
    })
    return { success: true }
  } catch (_) {
    return { success: false }
  }
}

/**
 * Comprueba alertas de membresía personal para el atleta (ej: vence en <= 4 días)
 * Se ejecuta al iniciar sesión o cargar la app para no depender únicamente del cron.
 */
export async function checkMyMembershipAlertAction() {
  const g = await guard()
  if (!g.ok || g.user.role !== "athlete") return { success: true }

  try {
    const activeMemb = await prisma.membership.findFirst({
      where: { athleteId: g.user.id, status: "active" },
      orderBy: { endDate: "desc" },
    })

    if (!activeMemb) return { success: true }

    const now = new Date()
    const endDate = new Date(activeMemb.endDate)
    const diffMs = endDate.getTime() - now.getTime()
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))

    // Si vence en 4 días o menos (y no ha vencido)
    if (diffDays > 0 && diffDays <= 4) {
      // Verificar si ya se envió notificación en las últimas 24 horas
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
      const recent = await prisma.appNotification.findFirst({
        where: {
          userId: g.user.id,
          type: "MEMBERSHIP_EXPIRING",
          createdAt: { gte: oneDayAgo },
        },
      })

      if (!recent) {
        await sendNotificationToUser(g.user.id, {
          title: `⏳ Tu membresía vence en ${diffDays} día${diffDays > 1 ? "s" : ""}`,
          message: `¡Hola! Tu plan ${activeMemb.planName || "Estándar"} vencerá pronto. Renueva a tiempo en recepción o desde tu app.`,
          type: "MEMBERSHIP_EXPIRING",
          url: "/membresias",
        })
      }
    }

    return { success: true }
  } catch (error) {
    return { success: false }
  }
}

/**
 * Acción de servidor para diagnosticar la conexión SMTP y enviar un correo de prueba.
 */
export async function testSmtpConnectionAction(targetEmail?: string) {
  const g = await guard(ROLES.STAFF)
  if (!g.ok) return { success: false, error: g.error }

  return await testSmtpConnection(targetEmail)
}
