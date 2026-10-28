"use server"

import prisma from "@/lib/db"
import { guard, ROLES } from "@/lib/authz"
import { revalidatePath } from "next/cache"
import { saveBase64Image } from "@/lib/image-utils"

async function offloadBase64Images(obj: any, prefix = "sys"): Promise<any> {
  if (!obj) return obj
  if (typeof obj === "string") {
    if (obj.startsWith("data:image/")) {
      try {
        const url = await saveBase64Image(obj, prefix)
        return url || obj
      } catch (err) {
        console.error("Error offloading base64 image:", err)
        return obj
      }
    }
    return obj
  }
  if (Array.isArray(obj)) {
    return Promise.all(obj.map((item, i) => offloadBase64Images(item, `${prefix}_${i}`)))
  }
  if (typeof obj === "object" && obj !== null) {
    const out: any = {}
    for (const [k, v] of Object.entries(obj)) {
      out[k] = await offloadBase64Images(v, `${prefix}_${k}`)
    }
    return out
  }
  return obj
}

export async function getSystemSettingsAction() {
  try {
    const record = await prisma.systemSetting.findUnique({
      where: { id: "default" },
    })
    if (!record || !record.data) {
      return { success: true, settings: null }
    }
    let parsed = JSON.parse(record.data)

    // Si contiene imágenes base64 incrustadas, migrarlas automáticamente a /uploads para no inflar el HTML
    if (record.data.includes("data:image/")) {
      try {
        const cleaned = await offloadBase64Images(parsed, "sys")
        const cleanStr = JSON.stringify(cleaned)
        await prisma.systemSetting.update({
          where: { id: "default" },
          data: { data: cleanStr },
        })
        parsed = cleaned
      } catch (e) {
        console.error("Auto-migrating base64 images warning:", e)
      }
    }

    return { success: true, settings: parsed }
  } catch (error) {
    console.error("Error getting system settings from DB:", error)
    return { success: false, error: "Error al obtener ajustes" }
  }
}

export async function saveSystemSettingsAction(settingsData: any) {
  const g = await guard(ROLES.ADMIN)
  if (!g.ok) {
    return { success: false, error: g.error }
  }

  try {
    const existing = await prisma.systemSetting.findUnique({
      where: { id: "default" },
    })

    let current = {}
    if (existing?.data) {
      try {
        current = JSON.parse(existing.data)
      } catch (_) {}
    }

    const merged = {
      ...current,
      ...settingsData,
      logoSettings: {
        ...((current as any).logoSettings || {}),
        ...(settingsData.logoSettings || {})
      },
      footerLogoSettings: {
        ...((current as any).footerLogoSettings || {}),
        ...(settingsData.footerLogoSettings || {})
      },
      gymSchedule: {
        ...((current as any).gymSchedule || {}),
        ...(settingsData.gymSchedule || {})
      }
    }

    const cleaned = await offloadBase64Images(merged, "sys")
    const stringified = JSON.stringify(cleaned)
    await prisma.systemSetting.upsert({
      where: { id: "default" },
      update: { data: stringified },
      create: { id: "default", data: stringified },
    })
    revalidatePath("/", "layout")
    return { success: true }
  } catch (error) {
    console.error("Error saving system settings to DB:", error)
    return { success: false, error: "Error al guardar ajustes en base de datos" }
  }
}

