"use server"

import prisma from "@/lib/db"
import { revalidatePath } from "next/cache"

export async function addBiometricRecord(athleteId: string, data: any) {
  try {
    const record = await prisma.biometric.create({
      data: {
        athleteId,
        weight: parseFloat(data.weight),
        height: parseFloat(data.height),
        customFields: data.customFields ? JSON.stringify(data.customFields) : null,
      }
    })
    revalidatePath(`/atletas/${athleteId}`)
    return { success: true, record }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function registerAttendance(userId: string, type: 'IN' | 'OUT') {
  try {
    const record = await prisma.attendance.create({
      data: {
        userId,
        type
      }
    })
    revalidatePath(`/atletas/${userId}`)
    revalidatePath(`/empleados`)
    return { success: true, record }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}
