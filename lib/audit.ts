import { headers } from "next/headers"
import { clientIpFrom } from "@/lib/authz"

/**
 * Registro de auditoría: una línea JSON por evento sensible en la salida estándar del servidor
 * (en Coolify aparece en los logs de la aplicación; se puede enviar luego a un servicio externo).
 *
 * NUNCA incluir contraseñas, PIN, tokens ni datos de pago en `details`.
 */
export type AuditActor = { id?: string; role?: string } | null

export async function audit(event: string, actor: AuditActor, details: Record<string, unknown> = {}): Promise<void> {
  let ip = "unknown"
  try {
    ip = clientIpFrom(await headers())
  } catch {
    // fuera de una petición (scripts): sin IP
  }
  try {
    console.info(JSON.stringify({
      type: "audit",
      ts: new Date().toISOString(),
      event,
      actor: actor ? { id: actor.id, role: actor.role } : null,
      ip,
      ...details,
    }))
  } catch {
    // la auditoría nunca debe romper la operación
  }
}
