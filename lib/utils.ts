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
