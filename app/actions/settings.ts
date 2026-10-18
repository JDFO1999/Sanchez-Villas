"use server"

import prisma from "@/lib/db"
import { guard, ROLES } from "@/lib/authz"
import { revalidatePath } from "next/cache"

export async function getSystemSettingsAction() {
  try {
    const record = await prisma.systemSetting.findUnique({
      where: { id: "default" },
    })
    if (!record || !record.data) {
      return { success: true, settings: null }
    }
    const parsed = JSON.parse(record.data)
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

    const stringified = JSON.stringify(merged)
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

