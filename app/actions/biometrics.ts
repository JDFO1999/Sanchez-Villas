"use server";
import prisma from "@/lib/db"
import { guardSelfOr, ROLES } from "@/lib/authz"

export async function addBiometric(data: {
  athleteId: string
  weight: number
  height: number
  chest?: number
  waist?: number
  arms?: number
  legs?: number
  bodyFat?: number
}) {
  // guard:addBiometric
  const g = await guardSelfOr(data.athleteId, ROLES.STAFF)
  if (!g.ok) return { success: false, error: g.error }
  try {
    const bio = await prisma.biometric.create({
      data: {
        athleteId: data.athleteId,
        weight: data.weight,
        height: data.height,
        chest: data.chest,
        waist: data.waist,
        arms: data.arms,
        legs: data.legs,
        bodyFat: data.bodyFat
      }
    })
    return { success: true, biometric: bio }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function getAthleteBiometrics(athleteId: string) {
  // guard:getAthleteBiometrics
  const g = await guardSelfOr(athleteId, ROLES.STAFF)
  if (!g.ok) return { success: false, error: g.error }
  try {
    const bios = await prisma.biometric.findMany({
      where: { athleteId },
      orderBy: { date: "desc" }
    })
    return { success: true, biometrics: bios }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}
