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

/**
 * Consulta la tasa oficial del BCV en tiempo real.
 * Utiliza el endpoint de DolarAPI con fallback en caso de error.
 */
export async function fetchBcvRateAction(): Promise<BcvRateResult> {
  try {
    const res = await fetch("https://ve.dolarapi.com/v1/dolares/oficial", {
      next: { revalidate: 3600 }, // Caché de 1 hora en servidor
      headers: {
        "Accept": "application/json"
      }
    })

    if (!res.ok) {
      throw new Error(`Respuesta HTTP ${res.status}`)
    }

    const data = await res.json()
    const rate = Number(data.promedio || data.venta || data.compra)

    if (!rate || isNaN(rate)) {
      throw new Error("Tasa no válida en la respuesta del proveedor")
    }

    return {
      success: true,
      rate: Number(rate.toFixed(4)),
      date: data.fechaActualizacion || new Date().toISOString(),
      source: "Banco Central de Venezuela (BCV)"
    }
  } catch (error: any) {
    console.error("Error consultando API BCV:", error)
    return {
      success: false,
      error: error?.message || "No se pudo consultar la tasa oficial del BCV."
    }
  }
}

/**
 * Consulta la tasa oficial del BCV y la actualiza en los ajustes del sistema (SystemSetting).
 * Solo permitido para administradores, gerentes y personal autorizado.
 */
export async function syncBcvRateAction(): Promise<BcvRateResult> {
  const g = await guard(ROLES.STAFF)
  if (!g.ok) {
    return { success: false, error: g.error }
  }

  const result = await fetchBcvRateAction()
  if (!result.success || !result.rate) {
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

    const updated = {
      ...current,
      storeExchangeRate: result.rate,
      bcvLastSync: result.date || new Date().toISOString(),
      bcvSource: result.source || "BCV Oficial"
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
      rate: result.rate,
      date: result.date,
      source: result.source
    }
  } catch (error: any) {
    console.error("Error guardando tasa BCV en BD:", error)
    return {
      success: false,
      error: "Tasa obtenida pero no se pudo persistir en base de datos."
    }
  }
}
