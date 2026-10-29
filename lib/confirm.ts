import Swal from "sweetalert2"

/** Lee un token HSL de globals.css (p. ej. "card") y devuelve un color CSS utilizable por SweetAlert. */
export function themeColor(token: string): string {
  if (typeof document === "undefined") return ""
  const v = getComputedStyle(document.documentElement).getPropertyValue(`--${token}`).trim()
  return v ? `hsl(${v})` : ""
}

/** Colores base de SweetAlert tomados del tema activo (claro/oscuro). */
export function swalTheme() {
  return {
    background: themeColor("card"),
    color: themeColor("card-foreground"),
    confirmButtonColor: themeColor("primary"),
    cancelButtonColor: themeColor("muted-foreground"),
  }
}

interface ConfirmOptions {
  title: string
  text?: string
  confirmText?: string
  cancelText?: string
  /** Acción destructiva: el botón de confirmar usa el color de peligro. */
  danger?: boolean
}

/** Reemplazo de window.confirm() con el tema de la app. Devuelve true si el usuario confirma. */
export async function confirmAction({ title, text, confirmText = "Aceptar", cancelText = "Cancelar", danger }: ConfirmOptions): Promise<boolean> {
  const theme = swalTheme()
  const res = await Swal.fire({
    title,
    text,
    icon: danger ? "warning" : "question",
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
    focusCancel: danger,
    reverseButtons: true,
    ...theme,
    confirmButtonColor: danger ? themeColor("destructive") : theme.confirmButtonColor,
  })
  return res.isConfirmed
}

/** Pide la contraseña de quien está operando. Devuelve null si cancela. */
export async function askPassword({ title, text, error, placeholder }: { title: string; text?: string; error?: string; placeholder?: string }): Promise<string | null> {
  const res = await Swal.fire({
    title,
    text: error ? undefined : text,
    html: error ? `<p style="color:${themeColor("destructive")};font-weight:600">${error}</p>` : undefined,
    input: "password",
    inputPlaceholder: placeholder || "Tu contraseña",
    inputAttributes: { autocomplete: "current-password", "aria-label": "Tu contraseña" },
    showCancelButton: true,
    confirmButtonText: "Confirmar",
    cancelButtonText: "Cancelar",
    reverseButtons: true,
    inputValidator: (v) => (!v ? "Escribe tu contraseña" : undefined),
    ...swalTheme(),
  })
  return res.isConfirmed ? String(res.value) : null
}

/**
 * Reproduce un sonido de validación en recepción (Web Audio API):
 * - 'success': Beep corto ascendente de acceso aprobado (verde)
 * - 'error': Doble beep grave de alerta por membresía vencida o denegada (rojo)
 */
export function playCheckInSound(type: "success" | "error") {
  if (typeof window === "undefined") return
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
    if (!AudioCtx) return
    const ctx = new AudioCtx()

    if (type === "success") {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.type = "sine"
      osc.frequency.setValueAtTime(880, ctx.currentTime)
      osc.frequency.exponentialRampToValueAtTime(1480, ctx.currentTime + 0.14)
      gain.gain.setValueAtTime(0.45, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.16)
      osc.start(ctx.currentTime)
      osc.stop(ctx.currentTime + 0.16)
    } else {
      // Doble beep de alerta (rojo)
      ;[0, 0.18].forEach((offset) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.type = "sawtooth"
        osc.frequency.setValueAtTime(220, ctx.currentTime + offset)
        osc.frequency.exponentialRampToValueAtTime(140, ctx.currentTime + offset + 0.13)
        gain.gain.setValueAtTime(0.45, ctx.currentTime + offset)
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + offset + 0.14)
        osc.start(ctx.currentTime + offset)
        osc.stop(ctx.currentTime + offset + 0.14)
      })
    }
  } catch {}
}

/**
 * Calcula automáticamente la Fecha de Corte sumando N meses a la fecha de inicio (YYYY-MM-DD).
 */
export function calculateCutoffDate(startDateStr: string, monthsToAdd: number): string {
  const base = startDateStr && /^\d{4}-\d{2}-\d{2}$/.test(startDateStr)
    ? new Date(`${startDateStr}T12:00:00`)
    : new Date()
  if (isNaN(base.getTime())) return new Date().toISOString().split("T")[0]
  const result = new Date(base)
  result.setMonth(result.getMonth() + monthsToAdd)
  return result.toISOString().split("T")[0]
}

