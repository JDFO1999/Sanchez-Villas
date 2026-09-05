"use server"

import prisma from "@/lib/db"
import { revalidatePath, unstable_noStore } from "next/cache"

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
        email: data.email || null,
        phone: data.phone || null,
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
        ...(data.clave ? { password: data.clave } : {}),
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
        email: data.email || null,
        phone: data.phone || null,
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
          ...(data.coachId ? { coach: { connect: { id: data.coachId } } } : {}),
          phone: data.phone || null,
          address: data.address || null,
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
    
    if (athlete && athlete.biometrics) {
      athlete.biometrics = athlete.biometrics.map(b => ({
        ...b,
        customFields: b.customFields ? JSON.parse(b.customFields) : undefined
      })) as any
    }

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
        phone: data.phone || null,
        address: data.address || null,
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

export async function addBiometric(athleteId: string, data: any) {
  try {
    const biometric = await prisma.biometric.create({
      data: {
        athleteId,
        weight: data.weight,
        height: data.height,
        customFields: data.customFields ? JSON.stringify(data.customFields) : null,
      }
    });
    revalidatePath(`/atletas/${athleteId}`)
    return { success: true, biometric }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function registerAttendance(query: string, isCedula: boolean = false) {
  try {
    const today = new Date()
    today.setHours(0,0,0,0)

    const user = await prisma.user.findFirst({
      where: isCedula ? { cedula: query, role: 'athlete' } : { id: query, role: 'athlete' },
      include: {
        memberships: {
          where: {
            status: 'ACTIVE',
            endDate: { gte: today }
          },
          orderBy: { endDate: 'desc' },
          take: 1
        }
      }
    })

    if (!user) {
      return { success: false, error: 'Atleta no encontrado' }
    }

    if (user.memberships.length === 0) {
      // Find the last expired membership to return the date
      const lastMembership = await prisma.membership.findFirst({
        where: { athleteId: user.id },
        orderBy: { endDate: 'desc' }
      })
      
      return { 
        success: false, 
        error: 'MembresÃ­a Vencida',
        lastDate: lastMembership?.endDate 
      }
    }

    // Registrar asistencia
    await prisma.attendance.create({
      data: {
        userId: user.id,
        type: 'IN',
        date: new Date()
      }
    })

    return { 
      success: true, 
      user: {
        name: user.name,
        membershipEnd: user.memberships[0].endDate
      } 
    }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

// --- COACH REQUESTS ---
export async function requestCoachChange(athleteId: string, newCoachId: string) {
  try {
    const existing = await prisma.coachRequest.findFirst({
      where: { athleteId, status: 'PENDING' }
    })
    if (existing) {
      return { success: false, error: 'Ya tienes una solicitud pendiente' }
    }
    const req = await prisma.coachRequest.create({
      data: {
        athleteId,
        coachId: newCoachId
      }
    })
    return { success: true, request: req }
  } catch (error) {
    return { success: false, error: 'Error interno' }
  }
}

export async function getPendingCoachRequests() {
  try {
    const reqs = await prisma.coachRequest.findMany({
      where: { status: 'PENDING' },
      include: {
        athlete: { select: { id: true, name: true, cedula: true, coachId: true, coach: { select: { name: true } } } },
        coach: { select: { id: true, name: true } }
      }
    })
    return { success: true, requests: reqs }
  } catch (error) {
    return { success: false, error: 'Error interno' }
  }
}

export async function resolveCoachRequest(requestId: string, status: 'APPROVED' | 'REJECTED', athleteId: string, newCoachId: string) {
  try {
    await prisma.coachRequest.update({
      where: { id: requestId },
      data: { status }
    })
    if (status === 'APPROVED') {
      const athlete = await prisma.user.findUnique({ where: { id: athleteId } })
      await prisma.user.update({
        where: { id: athleteId },
        data: {
          previousCoachId: athlete?.coachId,
          coachId: newCoachId
        }
      })
    }
    revalidatePath('/')
    return { success: true }
  } catch (error) {
    return { success: false, error: 'Error interno' }
  }
}

// --- ATHLETE DASHBOARD DATA ---
export async function getAthleteDashboardData(athleteId: string) {
  try {
    const biometrics = await prisma.biometric.findMany({
      where: { athleteId },
      orderBy: { date: 'asc' }
    })
    const allAttendances = await prisma.attendance.findMany({
      where: { userId: athleteId },
      orderBy: { date: 'desc' }
    })
    
    let streak = 0;
    let lastDate = new Date();
    lastDate.setHours(0,0,0,0);
    
    for (const att of allAttendances) {
      const attDate = new Date(att.date);
      attDate.setHours(0,0,0,0);
      const diffTime = Math.abs(lastDate.getTime() - attDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0 || diffDays === 1) {
        if (diffDays === 1) streak++;
        else if (streak === 0 && diffDays === 0) streak = 1;
        lastDate = attDate;
      } else {
        break;
      }
    }

    const memberships = await prisma.membership.findMany({
      where: { athleteId },
      orderBy: { endDate: 'desc' }
    })
    const purchases = await prisma.transaction.findMany({
      where: { customerId: athleteId },
      orderBy: { date: 'desc' },
      include: { items: true },
      take: 5
    })
    const routines = await prisma.routine.findMany({
      where: { athleteId },
      include: { exercises: true },
      orderBy: { date: "asc" }
    })
    const diets = await prisma.dietAssignment.findMany({
      where: { athleteId },
      orderBy: { date: "desc" }
    })
    const exerciseProgress = await prisma.exerciseProgress.findMany({
      where: { athleteId },
      orderBy: { date: "asc" }
    })
    return { success: true, biometrics, attendances: allAttendances.slice(0, 5), memberships, purchases, streak, routines, diets, exerciseProgress }
  } catch (error) {
    return { success: false, error: 'Error al obtener dashboard de atleta' }
  }
}




export async function updateProfilePicture(athleteId: string, base64Image: string) {
  try {
    const { saveBase64Image } = require("@/lib/image-utils");
    const imageUrl = await saveBase64Image(base64Image);
    
    if (!imageUrl) return { success: false, error: "Error procesando imagen" }
    
    const user = await prisma.user.update({
      where: { id: athleteId },
      data: { profilePicture: imageUrl }
    });
    
    const { revalidatePath } = require("next/cache");
    revalidatePath("/atletas");
    revalidatePath("/atletas/" + athleteId);
    revalidatePath("/");
    
    return { success: true, profilePicture: imageUrl }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}


