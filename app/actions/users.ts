"use server"

import prisma from "@/lib/db"
import { revalidatePath } from "next/cache"

export async function createEmployee(data: any) {
  try {
    const user = await prisma.user.create({
      data: {
        name: data.name,
        cedula: data.cedula,
        role: data.role,
        password: data.clave || '1234',
        accessPin: data.pin || null,
        baseSalary: data.baseSalary ? parseFloat(data.baseSalary) : null,
        commissionRate: data.commissionRate ? parseFloat(data.commissionRate) : null,
        commissionType: data.commissionType || 'flat',
        paymentFrequency: data.paymentFrequency || 'monthly',
        birthDate: data.birthDate || null,
        profession: data.profession || null,
        specialties: data.specialties || null,
        nonWorkingDays: data.nonWorkingDays || null,
          bankAccount: data.bankAccount || null,
          mobilePayment: data.mobilePayment || null,
      }
    });
    revalidatePath("/empleados")
    return { success: true, user }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function updateEmployee(id: string, data: any) {
  try {
    const user = await prisma.user.update({
      where: { id },
      data: {
        name: data.name,
        role: data.role,
        cedula: data.cedula,
        baseSalary: data.baseSalary ? parseFloat(data.baseSalary) : null,
        commissionRate: data.commissionRate ? parseFloat(data.commissionRate) : null,
        commissionType: data.commissionType || 'flat',
        paymentFrequency: data.paymentFrequency || 'monthly',
        birthDate: data.birthDate || null,
        profession: data.profession || null,
        specialties: data.specialties || null,
        nonWorkingDays: data.nonWorkingDays || null,
          bankAccount: data.bankAccount || null,
          mobilePayment: data.mobilePayment || null,
        bankAccount: data.bankAccount || null,
        mobilePayment: data.mobilePayment || null,
        accessPin: data.pin !== undefined ? data.pin : undefined,
        // Update password if provided
        ...(data.clave ? { password: data.clave } : {})
      }
    });
    revalidatePath("/empleados")
    return { success: true, user }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function getAllEmployees() {
  try {
    const employees = await prisma.user.findMany({
      where: {
        role: { not: 'athlete' }
      }
    });
    return { success: true, employees }
  } catch (error: any) {
    return { success: false, error: error.message, employees: [] }
  }
}

export async function createAthlete(data: any) {
  try {
    const user = await prisma.user.create({
      data: {
        name: data.name,
        cedula: data.cedula,
        role: 'athlete',
        password: data.password || data.cedula, 
        gender: data.gender,
        coachId: data.coachId || null,
      }
    });

    // Also create membership
    if (data.membershipEnd) {
      await prisma.membership.create({
        data: {
          athleteId: user.id,
          startDate: new Date(),
          endDate: new Date(data.membershipEnd),
          status: 'ACTIVE'
        }
      })
    }

    revalidatePath("/atletas")
    revalidatePath("/membresias")
    return { success: true, user }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function getAthletes() {
  try {
    const athletes = await prisma.user.findMany({
      where: { role: 'athlete' },
      include: {
        memberships: {
          orderBy: { endDate: 'desc' },
          take: 1
        },
        coach: true
      }
    })
    return { success: true, athletes }
  } catch (error: any) {
    return { success: false, error: error.message, athletes: [] }
  }
}

export async function getAthleteById(id: string) {
  try {
    const athlete = await prisma.user.findUnique({
      where: { id },
      include: {
        memberships: { orderBy: { endDate: 'desc' } },
        coach: true,
        biometrics: { orderBy: { date: 'asc' } },
        attendances: { orderBy: { date: 'desc' } }
      }
    })
    return { success: true, athlete }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function updateAthlete(id: string, data: any) {
  try {
    const user = await prisma.user.update({
      where: { id },
      data: {
        name: data.name,
        gender: data.gender,
        coachId: data.coachId || null,
      }
    });
    
    // If membership was explicitly renewed
    if (data.membershipEnd) {
      await prisma.membership.create({
         data: {
            athleteId: id,
            startDate: new Date(),
            endDate: new Date(data.membershipEnd),
            status: 'ACTIVE'
         }
      });
    }

    revalidatePath(`/atletas/${id}`)
    revalidatePath("/atletas")
    return { success: true, user }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}
