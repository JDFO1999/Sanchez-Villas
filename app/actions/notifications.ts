"use server"

import prisma from "@/lib/db"
import { guard, ROLES } from "@/lib/authz"
import { 
  sendMembershipExpiringSoonEmail, 
  sendMembershipExpiredEmail, 
  sendInactivityReminderEmail,
  testSmtpConnection
} from "@/lib/mailer"

export interface WhatsAppNotificationQueueItem {
  id: string
  name: string
  phone: string
  cedula: string
  type: "EXPIRING_3_DAYS" | "EXPIRED_TODAY" | "INACTIVE_7_DAYS"
  title: string
  message: string
}

export interface NotificationCheckResult {
  success: boolean
  error?: string
  summary?: {
    expiring3DaysCount: number
    expiredTodayCount: number
    inactive7DaysCount: number
    emailsSentCount: number
    whatsappQueue: WhatsAppNotificationQueueItem[]
  }
}

/**
 * Ejecuta la verificación diaria de alertas de membresías e inasistencia.
 * Envía correos automáticos vía Resend y genera la cola de mensajes de WhatsApp.
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

    const in3DaysStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 3, 0, 0, 0, 0)
    const in3DaysEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 3, 23, 59, 59, 999)

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
    let expiring3DaysCount = 0
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

      // 1. Vence en exactamente 3 días
      if (endDate >= in3DaysStart && endDate <= in3DaysEnd) {
        expiring3DaysCount++
        if (ath.email && ath.email.includes("@")) {
          const sent = await sendMembershipExpiringSoonEmail(ath.email, ath.name, 3, planName, expiryFormatted)
          if (sent.success) emailsSentCount++
        }
        if (ath.phone) {
          whatsappQueue.push({
            id: `exp_3_${ath.id}`,
            name: ath.name,
            phone: ath.phone,
            cedula: ath.cedula,
            type: "EXPIRING_3_DAYS",
            title: "Aviso de Vencimiento (3 días)",
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
        expiring3DaysCount,
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
 * Acción de servidor para diagnosticar la conexión SMTP (Gmail / Resend) y enviar un correo de prueba.
 */
export async function testSmtpConnectionAction(targetEmail?: string) {
  const g = await guard(ROLES.STAFF)
  if (!g.ok) return { success: false, error: g.error }

  return await testSmtpConnection(targetEmail)
}
