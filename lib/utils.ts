import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Calcula de forma precisa la edad actual en años a partir de una fecha de nacimiento (YYYY-MM-DD).
 * Retorna null si la fecha es inválida o no está definida.
 */
export function calculateAge(dateStr?: string | null): number | null {
  if (!dateStr) return null
  const birth = new Date(dateStr.includes("T") ? dateStr : `${dateStr}T00:00:00`)
  if (isNaN(birth.getTime())) return null
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const m = today.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--
  }
  return age >= 0 && age <= 125 ? age : null
}

/**
 * Limpia y normaliza una cédula venezolana extrayendo solo dígitos numéricos (máximo 8 o 9 dígitos).
 */
export function sanitizeCedula(input?: string | null, maxDigits: number = 8): string {
  if (!input) return ""
  return String(input).replace(/^[VEJvej]-?/i, "").replace(/\D/g, "").slice(0, maxDigits).trim()
}

/**
 * Formatea un monto numérico con separadores de miles y decimales según formato regional.
 */
export function formatMoney(amount: number, currencySymbol: string = "$"): string {
  const num = Number(amount) || 0
  return `${currencySymbol}${num.toLocaleString("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

/**
 * Formatea un precio dual en USD y su equivalente en Bolívares según la tasa BCV.
 */
export function formatDualPrice(amountUsd: number, exchangeRate: number, currencySec: string = "Bs."): { usd: string; ves: string; combined: string } {
  const usdNum = Number(amountUsd) || 0
  const rate = Number(exchangeRate) || 0
  const vesNum = rate > 0 ? usdNum * rate : 0

  const usdStr = `$${usdNum.toFixed(2)}`
  const vesStr = `${currencySec} ${vesNum.toLocaleString("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

  return {
    usd: usdStr,
    ves: vesStr,
    combined: `${usdStr} (${vesStr})`
  }
}

/**
 * Convierte de manera segura cualquier fecha (Date, ISO string o YYYY-MM-DD)
 * al formato input date "YYYY-MM-DD" sin sufrir desfasajes de zona horaria (UTC vs Local).
 */
export function toDateInputValue(input?: string | Date | null): string {
  if (!input) return ""
  if (typeof input === 'string') {
    const match = input.match(/^(\d{4})-(\d{2})-(\d{2})/)
    if (match) return `${match[1]}-${match[2]}-${match[3]}`
  }
  const d = new Date(input)
  if (isNaN(d.getTime()) || d.getFullYear() <= 1970) return ""
  // Extraemos año, mes y día de forma determinista
  const year = d.getUTCFullYear()
  const month = String(d.getUTCMonth() + 1).padStart(2, '0')
  const day = String(d.getUTCDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Formatea una fecha para mostrar al usuario en formato "DD/MM/YYYY" de forma consistente y sin desplazamiento de días.
 */
export function formatDisplayDate(input?: string | Date | null): string {
  const iso = toDateInputValue(input)
  if (!iso) return "Sin registro"
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}

/**
 * Parsea una fecha YYYY-MM-DD a Date para almacenar en base de datos.
 * Para startDate se fija a las 12:00:00 UTC (medio día) para garantizar que en cualquier huso horario
 * (Venezuela UTC-4, Colombia UTC-5, etc.) nunca retroceda al día anterior.
 */
export function parseStartDateToDB(dateStr: string): Date {
  const clean = String(dateStr).trim().slice(0, 10)
  if (/^\d{4}-\d{2}-\d{2}$/.test(clean)) {
    const [y, m, d] = clean.split('-').map(Number)
    return new Date(Date.UTC(y, m - 1, d, 12, 0, 0))
  }
  const fallback = new Date(dateStr)
  return isNaN(fallback.getTime()) ? new Date() : fallback
}

/**
 * Parsea una fecha YYYY-MM-DD a Date para fecha de corte / vencimiento.
 * Se fija a las 23:59:59 UTC para que la membresía cubra el día completo seleccionado.
 */
export function parseEndDateToDB(dateStr: string): Date {
  const clean = String(dateStr).trim().slice(0, 10)
  if (/^\d{4}-\d{2}-\d{2}$/.test(clean)) {
    const [y, m, d] = clean.split('-').map(Number)
    return new Date(Date.UTC(y, m - 1, d, 23, 59, 59))
  }
  const fallback = new Date(dateStr)
  return isNaN(fallback.getTime()) ? new Date() : fallback
}
