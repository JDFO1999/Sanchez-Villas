import bcrypt from "bcryptjs"
import prisma from "@/lib/db"
import { checkRateLimit, resetRateLimit } from "@/lib/rate-limiter"
import { verifySession, passwordFingerprint } from "@/lib/session"

/**
 * Autorización para Server Actions.
 *
 * Cada función exportada de un archivo "use server" es un endpoint PÚBLICO: el middleware no la protege.
 * Por eso cada acción debe llamar a `guard()` al inicio y devolver el error si `ok` es false.
 * La identidad y el rol se leen SIEMPRE de la base de datos (no del token), así un cambio de rol
 * o una baja ("deleted") surten efecto de inmediato.
 */

export const DENIED = "No autorizado"

export const ROLES = {
  ADMIN: ["admin"],
  STAFF: ["admin", "coach", "cajero", "recepcion", "employee"],
  POS: ["admin", "cajero", "recepcion"],
  TRAINER: ["admin", "coach", "employee"],
} as const

export interface AuthUser {
  id: string
  role: string
  name: string
  cedula: string
  canManageAttendance: boolean
}

export type Guard = { ok: true; user: AuthUser } | { ok: false; error: string }

export async function getAuthUser(): Promise<AuthUser | null> {
  const session = await verifySession()
  if (!session?.id) return null
  const user = await prisma.user.findUnique({
    where: { id: String(session.id) },
    select: { id: true, role: true, name: true, cedula: true, canManageAttendance: true, password: true },
  })
  if (!user || user.role === "deleted") return null
  // Sesión revocada: la contraseña cambió después de emitir el token (o es un token anterior a esta medida)
  if (session.pv !== passwordFingerprint(user.password)) return null
  const { password: _omit, ...safe } = user
  return safe
}

/** Exige sesión válida y, si se indican, que el rol esté entre `roles`. */
export async function guard(roles?: readonly string[]): Promise<Guard> {
  const user = await getAuthUser()
  if (!user) return { ok: false, error: DENIED }
  if (roles && !roles.includes(user.role)) return { ok: false, error: DENIED }
  return { ok: true, user }
}

/** El propio usuario sobre sí mismo, o un rol con permiso sobre cualquiera. */
export async function guardSelfOr(targetUserId: string, roles: readonly string[]): Promise<Guard> {
  const user = await getAuthUser()
  if (!user) return { ok: false, error: DENIED }
  if (user.id === targetUserId || roles.includes(user.role)) return { ok: true, user }
  return { ok: false, error: DENIED }
}

/** Quien puede tomar asistencia: admin, cajero, recepción o quien tenga el permiso explícito. */
export async function guardAttendance(): Promise<Guard> {
  const user = await getAuthUser()
  if (!user) return { ok: false, error: DENIED }
  const allowed = ["admin", "cajero", "recepcion"].includes(user.role) || user.canManageAttendance
  return allowed ? { ok: true, user } : { ok: false, error: DENIED }
}

/**
 * Reautenticación para acciones delicadas (crear empleados, cambiar roles…): comprueba la contraseña
 * de la persona con sesión activa. Limitada a 5 intentos fallidos cada 5 minutos por usuario.
 */
export async function verifyActorPassword(userId: string, password: unknown): Promise<{ ok: true } | { ok: false; error: string }> {
  if (typeof password !== "string" || !password) return { ok: false, error: "Confirma tu contraseña para continuar." }

  const key = `stepup:${userId}`
  const limit = checkRateLimit(key, 5, 5 * 60 * 1000)
  if (!limit.allowed) return { ok: false, error: `Demasiados intentos. Espera ${limit.resetInSeconds} segundos.` }

  const me = await prisma.user.findUnique({ where: { id: userId }, select: { password: true } })
  const stored = me?.password || ""
  let match = false
  try { match = await bcrypt.compare(password, stored) } catch { match = false }
  if (!match && !/^\$2[aby]\$/.test(stored)) match = stored === password // contraseña antigua aún sin cifrar

  if (!match) return { ok: false, error: "Contraseña incorrecta." }
  resetRateLimit(key)
  return { ok: true }
}

const SECRET_KEYS = new Set(["password", "accessPin"])

/**
 * Elimina campos secretos (hash de contraseña y PIN) de cualquier objeto o lista, también anidados
 * (p. ej. `coach` dentro de un atleta). Usar siempre antes de devolver usuarios al navegador.
 * Con `keepPin` se conserva `accessPin` (solo para el administrador gestionando empleados).
 */
export function stripSecrets<T>(value: T, opts: { keepPin?: boolean } = {}): T {
  if (Array.isArray(value)) return value.map(v => stripSecrets(v, opts)) as unknown as T
  if (value && typeof value === "object" && !(value instanceof Date)) {
    const out: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      if (k === "password") continue
      if (k === "accessPin" && !opts.keepPin) continue
      out[k] = stripSecrets(v, opts)
    }
    return out as T
  }
  return value
}

/** Campos de empleado que NO deben ver otros roles (salario, cuentas, PIN…). */
export const EMPLOYEE_PRIVATE_FIELDS = [
  "password", "accessPin", "baseSalary", "commissionRate", "commissionType", "paymentFrequency",
  "bankAccount", "mobilePayment", "birthDate", "storeDebt", "nonWorkingDays", "lastPaidDate",
] as const

export function omitFields<T extends Record<string, any>>(obj: T, fields: readonly string[]): Partial<T> {
  const copy: Record<string, any> = { ...obj }
  for (const f of fields) delete copy[f]
  return copy as Partial<T>
}

export { SECRET_KEYS }

/** IP del cliente tras el proxy (Coolify/Traefik): se usa la última entrada de X-Forwarded-For (la añade el proxy). */
export function clientIpFrom(headers: Headers): string {
  const xff = headers.get("x-forwarded-for")
  if (xff) {
    const parts = xff.split(",").map(s => s.trim()).filter(Boolean)
    if (parts.length) return parts[parts.length - 1]
  }
  return headers.get("x-real-ip") || "unknown"
}
