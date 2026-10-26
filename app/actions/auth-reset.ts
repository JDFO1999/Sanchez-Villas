"use server"

import crypto from "crypto"
import bcrypt from "bcryptjs"
import prisma from "@/lib/db"
import { sendPasswordResetEmail } from "@/lib/mailer"

function maskEmail(email: string): string {
  if (!email || !email.includes("@")) return email
  const [local, domain] = email.split("@")
  if (local.length <= 2) {
    return `${local.charAt(0)}***@${domain}`
  }
  return `${local.charAt(0)}***${local.charAt(local.length - 1)}@${domain}`
}

/**
 * Solicita el restablecimiento de contraseña.
 * Busca al usuario por cédula o correo, genera un token criptográfico de 64 caracteres,
 * guarda la expiración (60 min) y envía el correo con la plantilla prémium de Maximum Evolution Fit.
 */
export async function requestPasswordReset(identifier: string) {
  try {
    const raw = String(identifier || "").trim()
    if (!raw) {
      return { success: false, error: "Ingresa tu número de cédula o correo electrónico." }
    }

    const cleanCedula = raw.replace(/\D/g, "")

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          ...(cleanCedula ? [{ cedula: cleanCedula }, { cedula: `V-${cleanCedula}` }, { cedula: `E-${cleanCedula}` }] : []),
          { email: raw.toLowerCase() }
        ]
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        cedula: true
      }
    })

    if (!user) {
      return {
        success: false,
        error: "No se encontró ningún usuario con los datos proporcionados. Verifica tu cédula o correo."
      }
    }

    if (!user.email || !user.email.includes("@")) {
      return {
        success: false,
        error: "Tu cuenta no tiene un correo electrónico registrado. Por favor acércate a recepción o contacta al personal para asignarte tu correo."
      }
    }

    // Invalidar tokens previos que no se hayan usado
    await prisma.passwordResetToken.updateMany({
      where: {
        userId: user.id,
        used: false
      },
      data: {
        used: true
      }
    })

    // Generar token criptogrÃ¡ficamente seguro
    const token = crypto.randomBytes(32).toString("hex")
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hora de validez

    await prisma.passwordResetToken.create({
      data: {
        token,
        userId: user.id,
        expiresAt,
        used: false
      }
    })

    // Construir URL base
    const appUrl = (process.env.APP_URL || "https://www.maximumevolutionfit.com").replace(/\/$/, "")
    const resetUrl = `${appUrl}/recuperar-password?token=${token}`

    // Enviar correo
    const mailRes = await sendPasswordResetEmail(user.email, user.name, resetUrl, 60)
    if (!mailRes.success) {
      return {
        success: false,
        error: `No se pudo enviar el correo de recuperación: ${mailRes.error}`
      }
    }

    return {
      success: true,
      maskedEmail: maskEmail(user.email),
      userName: user.name
    }
  } catch (error: any) {
    console.error("Error in requestPasswordReset:", error)
    return {
      success: false,
      error: "Ocurrió un error inesperado al procesar la solicitud. Intenta nuevamente."
    }
  }
}

/**
 * Verifica si un token es válido y no ha expirado para mostrar el formulario al usuario.
 */
export async function verifyPasswordResetToken(token: string) {
  try {
    if (!token || typeof token !== "string") {
      return { valid: false, error: "El enlace de recuperación es inválido." }
    }

    const tokenRecord = await prisma.passwordResetToken.findUnique({
      where: { token },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    if (!tokenRecord) {
      return { valid: false, error: "Este enlace de recuperación no existe o ya fue reemplazado." }
    }

    if (tokenRecord.used) {
      return { valid: false, error: "Este enlace ya fue utilizado anteriormente." }
    }

    if (new Date() > tokenRecord.expiresAt) {
      return { valid: false, error: "Este enlace de recuperación ha expirado por motivos de seguridad (límite de 60 minutos)." }
    }

    return {
      valid: true,
      userName: tokenRecord.user.name,
      userId: tokenRecord.user.id
    }
  } catch (error) {
    console.error("Error in verifyPasswordResetToken:", error)
    return { valid: false, error: "Error al validar el enlace de recuperación." }
  }
}

/**
 * Ejecuta el cambio definitivo de contraseña utilizando el token válido.
 */
export async function resetPasswordWithToken(token: string, newPassword: string) {
  try {
    const verification = await verifyPasswordResetToken(token)
    if (!verification.valid || !verification.userId) {
      return { success: false, error: verification.error }
    }

    if (!newPassword || newPassword.length < 6) {
      return { success: false, error: "La nueva contraseña debe tener al menos 6 caracteres." }
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10)

    // Actualizar contraseña del usuario y quemar el token en una transacción
    await prisma.$transaction([
      prisma.user.update({
        where: { id: verification.userId },
        data: { password: hashedPassword }
      }),
      prisma.passwordResetToken.update({
        where: { token },
        data: { used: true }
      })
    ])

    return { success: true }
  } catch (error: any) {
    console.error("Error in resetPasswordWithToken:", error)
    return { success: false, error: "No se pudo actualizar la contraseña. Intenta nuevamente." }
  }
}
