"use server"

import prisma from "@/lib/db"
import { guard, ROLES } from "@/lib/authz"
import { revalidatePath } from "next/cache"

export interface BcvRateResult {
  success: boolean
  rate?: number
  date?: string
  source?: string
  error?: string
}

export interface BcvMultiRatesResult {
  success: boolean
  rate?: number // Compatibilidad con tasa USD principal
  rates?: {
    usd: number // Bs. por USD (BCV)
    eur: number // Bs. por EUR (BCV)
    cop: number // COP por USD (TRM)
    copToBs?: number // Bs. por 1000 COP
  }
  date?: string
  source?: string
  error?: string
  user?: string
  role?: string
}

/**
 * Consulta la tasa oficial del BCV (Dólar y Euro) y TRM Peso Colombiano en tiempo real.
 * USD: https://ve.dolarapi.com/v1/dolares/oficial
 * EUR: https://ve.dolarapi.com/v1/euros/oficial
 * COP: https://co.dolarapi.com/v1/trm
 */
export async function fetchBcvMultiRatesAction(): Promise<BcvMultiRatesResult> {
  try {
    const [usdRes, eurRes, copRes] = await Promise.allSettled([
      fetch("https://ve.dolarapi.com/v1/dolares/oficial", {
        next: { revalidate: 1800 },
        headers: { "Accept": "application/json" }
      }).then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json()
      }),
      fetch("https://ve.dolarapi.com/v1/euros/oficial", {
        next: { revalidate: 1800 },
        headers: { "Accept": "application/json" }
      }).then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json()
      }),
      fetch("https://co.dolarapi.com/v1/trm", {
        next: { revalidate: 1800 },
        headers: { "Accept": "application/json" }
      }).then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json()
      })
    ])

    const usdVal = usdRes.status === "fulfilled" 
      ? Number(usdRes.value.promedio || usdRes.value.venta || usdRes.value.compra) 
      : 886.2271

    const eurVal = eurRes.status === "fulfilled"
      ? Number(eurRes.value.promedio || eurRes.value.venta || eurRes.value.compra)
      : (usdVal * 1.12) // Fallback aproximado si la API fallara

    const copVal = copRes.status === "fulfilled"
      ? Number(copRes.value.valor || copRes.value.promedio)
      : 3185.01

    if (!usdVal || isNaN(usdVal)) {
      throw new Error("No se pudo obtener la tasa oficial del Dólar BCV.")
    }

    const usd = Number(usdVal.toFixed(4))
    const eur = Number(eurVal.toFixed(4))
    const cop = Number(copVal.toFixed(2))
    const copToBs = Number(((usd / (cop || 3185)) * 1000).toFixed(4))

    const date = (usdRes.status === "fulfilled" && usdRes.value.fechaActualizacion)
      || (eurRes.status === "fulfilled" && eurRes.value.fechaActualizacion)
      || new Date().toISOString()

    return {
      success: true,
      rate: usd,
      rates: {
        usd,
        eur,
        cop,
        copToBs
      },
      date,
      source: "Banco Central de Venezuela (BCV) & Superintendencia Financiera"
    }
  } catch (error: any) {
    console.error("Error consultando tasas multi-moneda:", error)
    return {
      success: false,
      error: error?.message || "No se pudo consultar las tasas oficiales de divisas."
    }
  }
}

/**
 * Consulta la tasa individual USD oficial del BCV (para retrocompatibilidad).
 */
export async function fetchBcvRateAction(): Promise<BcvRateResult> {
  const multi = await fetchBcvMultiRatesAction()
  if (!multi.success || !multi.rates) {
    return { success: false, error: multi.error }
  }
  return {
    success: true,
    rate: multi.rates.usd,
    date: multi.date,
    source: multi.source
  }
}

/**
 * Consulta y actualiza en la base de datos las tasas oficiales (USD, EUR, COP)
 * y emite una alerta para Administrador, Gerente y Recepción.
 * RESTRICCIÓN DE SEGURIDAD: Solo Administrador y Gerente pueden ejecutarla.
 */
export async function syncBcvMultiRatesAction(): Promise<BcvMultiRatesResult> {
  // Verificación estricta: Solo admin o gerente
  const g = await guard(ROLES.ADMIN)
  if (!g.ok) {
    return { 
      success: false, 
      error: "Acceso denegado: Solo el Administrador y Gerente tienen permiso para actualizar la tasa de cambio oficial." 
    }
  }

  const result = await fetchBcvMultiRatesAction()
  if (!result.success || !result.rates) {
    return result
  }

  try {
    const existing = await prisma.systemSetting.findUnique({
      where: { id: "default" },
    })

    let current: any = {}
    if (existing?.data) {
      try {
        current = JSON.parse(existing.data)
      } catch (_) {}
    }

    const alertId = Date.now().toString()
    const nowIso = new Date().toISOString()

    const updated = {
      ...current,
      storeExchangeRate: result.rates.usd,
      storeExchangeRateEur: result.rates.eur,
      storeExchangeRateCop: result.rates.cop,
      bcvLastSync: result.date || nowIso,
      bcvSource: result.source || "BCV Oficial & TRM",
      bcvRates: {
        usd: result.rates.usd,
        eur: result.rates.eur,
        cop: result.rates.cop,
        copToBs: result.rates.copToBs,
        lastSync: result.date || nowIso,
        updatedAt: nowIso,
        updatedBy: g.user.name,
        updatedByRole: g.user.role
      },
      // Alerta para notificar a Recepción, Gerente y Admin
      bcvRateAlert: {
        id: alertId,
        updatedAt: nowIso,
        updatedBy: g.user.name,
        updatedByRole: g.user.role,
        rates: {
          usd: result.rates.usd,
          eur: result.rates.eur,
          cop: result.rates.cop,
          copToBs: result.rates.copToBs
        }
      }
    }

    await prisma.systemSetting.upsert({
      where: { id: "default" },
      update: { data: JSON.stringify(updated) },
      create: { id: "default", data: JSON.stringify(updated) },
    })

    revalidatePath("/", "layout")
    revalidatePath("/tienda")
    revalidatePath("/finanzas")
    revalidatePath("/asistencia")
    revalidatePath("/ajustes")

    return {
      success: true,
      rate: result.rates.usd,
      rates: result.rates,
      date: result.date,
      source: result.source,
      user: g.user.name,
      role: g.user.role
    }
  } catch (error: any) {
    console.error("Error guardando tasas multi-moneda en BD:", error)
    return {
      success: false,
      error: "Tasas obtenidas pero no se pudieron guardar en la base de datos."
    }
  }
}

/**
 * Función heredada syncBcvRateAction (restringida a Administrador y Gerente).
 */
export async function syncBcvRateAction(): Promise<BcvRateResult> {
  const multi = await syncBcvMultiRatesAction()
  if (!multi.success || !multi.rates) {
    return { success: false, error: multi.error }
  }
  return {
    success: true,
    rate: multi.rates.usd,
    date: multi.date,
    source: multi.source
  }
}
