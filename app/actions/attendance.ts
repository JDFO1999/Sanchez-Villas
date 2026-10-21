"use server"

import prisma from "@/lib/db"
import { guardAttendance } from "@/lib/authz"

export async function checkInByCedula(code: string) {
  // guard:checkInByCedula
  const g = await guardAttendance()
  if (!g.ok) return { success: false, error: g.error }
  try {
    const cleanCode = code ? code.trim() : ""
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { cedula: cleanCode },
          { id: cleanCode }
        ]
      }
    });

    if (!user) {
      return { success: false, error: "Usuario no encontrado" };
    }
    
    // Validar membresía si es atleta
    if (user.role === 'athlete') {
      const activeMembership = await prisma.membership.findFirst({
        where: {
          athleteId: user.id,
          endDate: { gte: new Date() }
        }
      });
      if (!activeMembership) {
        const anyMembership = await prisma.membership.findFirst({
          where: { athleteId: user.id }
        });
        return { 
          success: false, 
          error: anyMembership ? "Membresía vencida" : "Atleta no tiene membresía activa" 
        };
      }
    }

    // Registrar asistencia
    const attendance = await prisma.attendance.create({
      data: {
        userId: user.id,
        type: 'IN',
        date: new Date()
      }
    });

    return { 
      success: true, 
      user: { name: user.name, role: user.role }, 
      attendance 
    };

  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getTodayAttendanceAndSalesAction() {
  const g = await guardAttendance()
  if (!g.ok) return { success: false, error: g.error }

  try {
    const startOfToday = new Date()
    startOfToday.setHours(0, 0, 0, 0)

    // 1. Asistencias de hoy (últimas 40)
    const attendances = await prisma.attendance.findMany({
      where: {
        date: { gte: startOfToday }
      },
      orderBy: { date: 'desc' },
      take: 40,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            cedula: true,
            role: true,
            profilePicture: true,
            memberships: {
              where: { status: 'ACTIVE' },
              orderBy: { endDate: 'desc' },
              take: 1,
              select: {
                endDate: true,
                planName: true,
              }
            }
          }
        }
      }
    })

    // 2. Ventas de hoy
    const todaySales = await prisma.transaction.findMany({
      where: {
        date: { gte: startOfToday }
      },
      orderBy: { date: 'desc' },
      take: 20,
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            cedula: true,
          }
        },
        items: true
      }
    })

    const totalSalesAmount = todaySales.reduce((acc, tx) => acc + (tx.total || 0), 0)

    return {
      success: true,
      attendances: JSON.parse(JSON.stringify(attendances)),
      todaySales: JSON.parse(JSON.stringify(todaySales)),
      totalSalesAmount,
      totalSalesCount: todaySales.length,
      totalAttendanceCount: attendances.length,
    }
  } catch (error: any) {
    console.error("Error fetching today reception data:", error)
    return { success: false, error: error?.message || "Error al cargar datos del panel" }
  }
}

