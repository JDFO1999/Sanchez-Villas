"use server"

import prisma from "@/lib/db"
import { guardAttendance } from "@/lib/authz"
import bcrypt from "bcryptjs"

// Helpers de zona horaria Venezuela (America/Caracas, UTC-4 fijo)
function getVenezuelaDayBounds(dateStr?: string) {
  let year: number, month: number, day: number
  if (dateStr && /^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    ;[year, month, day] = dateStr.split("-").map(Number)
  } else {
    const vetNow = new Date(Date.now() - 4 * 60 * 60 * 1000)
    year = vetNow.getUTCFullYear()
    month = vetNow.getUTCMonth() + 1
    day = vetNow.getUTCDate()
  }
  // 00:00:00.000 VET = 04:00:00.000 UTC del mismo día
  const startOfDay = new Date(Date.UTC(year, month - 1, day, 4, 0, 0, 0))
  // 23:59:59.999 VET = 03:59:59.999 UTC del día siguiente
  const endOfDay = new Date(Date.UTC(year, month - 1, day + 1, 3, 59, 59, 999))
  return { startOfDay, endOfDay }
}

export async function checkInByCedula(code: string, adminKey?: string, isQr: boolean = false) {
  // guard:checkInByCedula
  const g = await guardAttendance()
  if (!g.ok) return { success: false, error: g.error }
  try {
    const cleanCode = code ? code.trim() : ""
    if (!cleanCode) {
      return { success: false, error: "Debes ingresar una cédula o escanear un código." }
    }

    let targetLookup = cleanCode
    let effectiveIsQr = isQr

    // Verificación de QR Dinámico Anti-Captura (DYNQR)
    if (cleanCode.startsWith("DYNQR:")) {
      const { verifyDynamicQrToken } = await import("@/lib/qr-token")
      const qrCheck = verifyDynamicQrToken(cleanCode)
      if (!qrCheck.valid) {
        return { success: false, error: qrCheck.error || "Código QR inválido o expirado." }
      }
      targetLookup = qrCheck.userId || qrCheck.cedula || cleanCode
      effectiveIsQr = true
    }

    // Si NO es por escáner QR directo, el registro manual por cédula exige autorización de Gerente o Administrador
    let authorizedManagerName: string | null = null
    if (!effectiveIsQr) {
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
          { cedula: targetLookup },
          { id: targetLookup }
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
    const { startOfDay: startOfToday } = getVenezuelaDayBounds()

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
    const { startOfDay, endOfDay } = getVenezuelaDayBounds(dateStr)

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

/**
 * Genera un token QR dinámico firmado criptográficamente para el carnet del atleta.
 * Rota cada 60 segundos con protección anti-captura.
 */
export async function getAthleteDynamicQrToken(athleteId: string, cedula: string) {
  try {
    const { generateDynamicQrToken } = await import("@/lib/qr-token")
    const token = generateDynamicQrToken(athleteId, cedula)
    return { success: true, token }
  } catch (err: any) {
    return { success: false, error: err?.message || "Error al generar código QR dinámico." }
  }
}



