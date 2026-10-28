/**
 * Validador de seguridad para contraseñas y cédula venezolana (8 dígitos).
 */

const COMMON_WEAK_PASSWORDS = new Set([
  "123456",
  "1234567",
  "12345678",
  "123456789",
  "1234567890",
  "0987654321",
  "87654321",
  "password",
  "password1",
  "password123",
  "admin123",
  "admin1234",
  "qwerty123",
  "abcdefgh",
  "11111111",
  "00000000",
  "12341234",
  "contraseña",
  "contrasena",
  "maximum123",
  "gym12345",
  "gym123456",
  "clave123",
  "miclave123",
])

export interface PasswordValidationResult {
  isValid: boolean
  hasMinLength: boolean
  hasUpperCase: boolean
  hasLowerCase: boolean
  hasNumber: boolean
  isNotCommon: boolean
  doesNotMatchCedula: boolean
  score: number // 0 a 4
  strengthLabel: "Muy débil" | "Débil" | "Media" | "Fuerte"
  colorClass: string
  barWidth: string
  error?: string
}

/**
 * Evalúa si una contraseña es robusta (mínimo 8 caracteres, mayúscula, minúscula, número, no común).
 */
export function validatePassword(password: string, cedula?: string): PasswordValidationResult {
  const pwd = String(password || "").trim()
  const cleanCedula = cedula ? String(cedula).replace(/\D/g, "") : ""

  const hasMinLength = pwd.length >= 8
  const hasUpperCase = /[A-Z]/.test(pwd)
  const hasLowerCase = /[a-z]/.test(pwd)
  const hasNumber = /[0-9]/.test(pwd)

  // No debe ser idéntica a la cédula ni contenerla si la cédula tiene al menos 6 dígitos
  const doesNotMatchCedula = !(
    cleanCedula.length >= 6 &&
    (pwd === cleanCedula || pwd.toLowerCase().includes(cleanCedula))
  )

  const normalized = pwd.toLowerCase()
  const isSequentialNumbers = /^012345|123456|234567|345678|456789|567890|987654|876543|765432/.test(normalized)
  const isRepetitiveChar = /^(.)\1{4,}$/.test(pwd) // 5 o más caracteres idénticos seguidos

  const isNotCommon = !COMMON_WEAK_PASSWORDS.has(normalized) && !isSequentialNumbers && !isRepetitiveChar

  let score = 0
  if (hasMinLength) score++
  if (hasLowerCase && hasUpperCase) score++
  if (hasNumber) score++
  if (/[^A-Za-z0-9]/.test(pwd) || (hasMinLength && pwd.length >= 10)) score++

  const isValid = hasMinLength && hasUpperCase && hasLowerCase && hasNumber && isNotCommon && doesNotMatchCedula

  let strengthLabel: "Muy débil" | "Débil" | "Media" | "Fuerte" = "Muy débil"
  let colorClass = "bg-rose-500 text-rose-500"
  let barWidth = "w-1/4"

  if (!pwd) {
    strengthLabel = "Muy débil"
    barWidth = "w-0"
    colorClass = "bg-muted text-muted-foreground"
  } else if (!isNotCommon || !doesNotMatchCedula || pwd.length < 6) {
    strengthLabel = "Muy débil"
    barWidth = "w-1/4"
    colorClass = "bg-rose-500 text-rose-500"
  } else if (score <= 1) {
    strengthLabel = "Débil"
    barWidth = "w-2/4"
    colorClass = "bg-amber-500 text-amber-500"
  } else if (score === 2 || score === 3) {
    strengthLabel = "Media"
    barWidth = "w-3/4"
    colorClass = "bg-yellow-400 text-yellow-500 dark:text-yellow-400"
  } else {
    strengthLabel = "Fuerte"
    barWidth = "w-full"
    colorClass = "bg-emerald-500 text-emerald-500"
  }

  let error: string | undefined = undefined
  if (!pwd) {
    error = "Ingresa una contraseña."
  } else if (!doesNotMatchCedula) {
    error = "La contraseña no puede ser ni contener tu número de cédula."
  } else if (!isNotCommon) {
    error = "Esta contraseña es muy predecible (como 123456). Por favor usa una combinación más segura."
  } else if (!hasMinLength) {
    error = "La contraseña debe tener al menos 8 caracteres."
  } else if (!hasLowerCase || !hasUpperCase) {
    error = "La contraseña debe combinar letras mayúsculas y minúsculas."
  } else if (!hasNumber) {
    error = "La contraseña debe incluir al menos un número."
  }

  return {
    isValid,
    hasMinLength,
    hasUpperCase,
    hasLowerCase,
    hasNumber,
    isNotCommon,
    doesNotMatchCedula,
    score,
    strengthLabel,
    colorClass,
    barWidth,
    error,
  }
}

/**
 * Valida que la cédula contenga exactamente 8 dígitos numéricos.
 */
export function validateCedula(cedula: string): { isValid: boolean; cleanCedula: string; error?: string } {
  const cleanCedula = String(cedula || "").replace(/\D/g, "").slice(0, 8)
  if (cleanCedula.length !== 8) {
    return {
      isValid: false,
      cleanCedula,
      error: "La cédula debe tener exactamente 8 dígitos numéricos (ej. 12345678).",
    }
  }
  return {
    isValid: true,
    cleanCedula,
  }
}
