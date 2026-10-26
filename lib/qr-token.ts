import crypto from "crypto"

const SECRET = process.env.JWT_SECRET || "maxfit_secure_dynamic_qr_secret_key_2026"
const VALIDITY_SECONDS = 60
const GRACE_PERIOD_SECONDS = 30 // Para compensar desfase de reloj entre cliente y servidor

/**
 * Genera un código QR dinámico temporal y firmado criptográficamente para un atleta.
 * Formato: DYNQR:{userId}:{cedula}:{timestamp}:{signature}
 */
export function generateDynamicQrToken(userId: string, cedula: string): string {
  const timestamp = Math.floor(Date.now() / 1000)
  const payload = `${userId}:${cedula}:${timestamp}`
  const signature = crypto
    .createHmac("sha256", SECRET)
    .update(payload)
    .digest("hex")
    .substring(0, 16)

  return `DYNQR:${userId}:${cedula}:${timestamp}:${signature}`
}

/**
 * Verifica si un código QR dinámico es auténtico y no ha expirado.
 */
export function verifyDynamicQrToken(token: string): {
  valid: boolean
  userId?: string
  cedula?: string
  error?: string
} {
  if (!token || !token.startsWith("DYNQR:")) {
    return { valid: false, error: "Formato de código QR dinámico no reconocido." }
  }

  const parts = token.split(":")
  if (parts.length !== 5) {
    return { valid: false, error: "Estructura de código QR inválida o alterada." }
  }

  const [_, userId, cedula, timestampStr, signature] = parts
  const timestamp = parseInt(timestampStr, 10)

  if (isNaN(timestamp)) {
    return { valid: false, error: "Marca de tiempo del QR inválida." }
  }

  // 1. Verificar firma criptográfica
  const payload = `${userId}:${cedula}:${timestamp}`
  const expectedSignature = crypto
    .createHmac("sha256", SECRET)
    .update(payload)
    .digest("hex")
    .substring(0, 16)

  if (signature !== expectedSignature) {
    return { valid: false, error: "Código QR no auténtico o firma alterada." }
  }

  // 2. Verificar tiempo de expiración
  const now = Math.floor(Date.now() / 1000)
  const ageSeconds = now - timestamp

  // Si el token es del futuro por más del periodo de gracia o tiene más de 60s (+ gracia)
  if (ageSeconds > (VALIDITY_SECONDS + GRACE_PERIOD_SECONDS)) {
    return {
      valid: false,
      error: `El código QR ha expirado (${ageSeconds}s de antigüedad). Por favor muestra tu código dinámico en vivo desde la app.`
    }
  }

  return {
    valid: true,
    userId,
    cedula
  }
}
