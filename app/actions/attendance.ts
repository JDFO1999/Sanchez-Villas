"use server"

import prisma from "@/lib/db"
import { guardAttendance } from "@/lib/authz"
import bcrypt from "bcryptjs"

export async function checkInByCedula(code: string, adminKey?: string, isQr: boolean = false) {
  // guard:checkInByCedula
  const g = await guardAttendance()
  if (!g.ok) return { success: false, error: g.error }
  try {
    const cleanCode = code ? code.trim() : ""
    if (!cleanCode) {
      return { success: false, error: "Debes ingresar una cédula o escanear un código." }
    }

    // Si NO es por escáner QR directo, el registro manual por cédula exige autorización de Gerente o Administrador
    let authorizedManagerName: string | null = null
    if (!isQr) {
      if (!adminKey || !adminKey.trim()) {
        return {
          success: false,
          error: "Se requiere la clave o PIN generado de un Administrador o Gerente para registrar por cédula."
        }
      }

      const trimmedKey = adminKey.trim()

      // 1. Buscar coincidencia con PIN generado (accessPin) de Administrador o Gerente
      let authorizedManager: any = await prisma.user.findFirst({
        where: {
          accessPin: trimmedKey,
          role: { in: ["admin", "gerente"] },
          NOT: { role: "deleted" }
        }
      })

      // 2. Si no coincidió por accessPin, verificar por contraseña (bcrypt o directa)
      if (!authorizedManager) {
        const managers = await prisma.user.findMany({
          where: {
            role: { in: ["admin", "gerente"] },
            NOT: { role: "deleted" }
          }
        })
        for (const mgr of managers) {
          let matches = false
          try {
            matches = await bcrypt.compare(trimmedKey, mgr.password || "")
          } catch {
            matches = false
          }
          if (!matches && mgr.password === trimmedKey) {
            matches = true
          }
          if (matches) {
            authorizedManager = mgr
            break
          }
        }
      }

      if (!authorizedManager) {
        return {
          success: false,
          error: "Clave o PIN de autorización incorrecto. Se requiere autorización de un Administrador o Gerente."
        }
      }

      authorizedManagerName = authorizedManager.name
    }

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { cedula: cleanCode },
          { id: cleanCode }
        ]
      }
    });

    if (!user) {
      return { success: false, error: "Usuario no encontrado con la cédula indicada." };
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
          error: anyMembership ? "Membresía vencida. El atleta debe renovar para ingresar." : "Atleta no tiene membresía activa." 
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
      authorizedBy: authorizedManagerName,
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

export async function getAttendanceReportAction(dateStr?: string) {
  const g = await guardAttendance()
  if (!g.ok) return { success: false, error: g.error }

  try {
    let startOfDay: Date
    let endOfDay: Date

    if (dateStr && /^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      const [year, month, day] = dateStr.split("-").map(Number)
      startOfDay = new Date(year, month - 1, day, 0, 0, 0, 0)
      endOfDay = new Date(year, month - 1, day, 23, 59, 59, 999)
    } else {
      startOfDay = new Date()
      startOfDay.setHours(0, 0, 0, 0)
      endOfDay = new Date()
      endOfDay.setHours(23, 59, 59, 999)
    }

    const attendances = await prisma.attendance.findMany({
      where: {
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      orderBy: { date: "desc" },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            cedula: true,
            role: true,
            profilePicture: true,
            specialties: true,
            profession: true,
            phone: true,
            memberships: {
              orderBy: { endDate: "desc" },
              take: 1,
              select: {
                endDate: true,
                planName: true,
                status: true,
              },
            },
          },
        },
      },
    })

    const parsed = JSON.parse(JSON.stringify(attendances))
    const now = new Date()

    const athleteAttendances = parsed.filter((a: any) => a.user?.role === "athlete")
    const employeeAttendances = parsed.filter((a: any) => a.user?.role !== "athlete")

    let activeMembershipsCount = 0
    let expiredMembershipsCount = 0

    athleteAttendances.forEach((a: any) => {
      const end = a.user?.memberships?.[0]?.endDate
      if (end && new Date(end) >= now) {
        activeMembershipsCount++
      } else {
        expiredMembershipsCount++
      }
    })

    return {
      success: true,
      attendances: parsed,
      athleteAttendances,
      employeeAttendances,
      stats: {
        total: parsed.length,
        athletes: athleteAttendances.length,
        employees: employeeAttendances.length,
        activeMemberships: activeMembershipsCount,
        expiredMemberships: expiredMembershipsCount,
      },
    }
  } catch (error: any) {
    console.error("Error generating attendance report:", error)
    return { success: false, error: error?.message || "Error al generar reporte de asistencia" }
  }
}


