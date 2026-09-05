"use server"

import prisma from "@/lib/db"

export async function getDashboardStats() {
  try {
    const today = new Date()
    today.setHours(0,0,0,0)

    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
    
    // Atletas activos (tienen membresía activa hoy)
    const activeAthletesCount = await prisma.user.count({
      where: {
        role: 'athlete',
        memberships: {
          some: {
            status: 'ACTIVE',
            endDate: { gte: today }
          }
        }
      }
    })

    // Asistencias de hoy
    const attendancesToday = await prisma.attendance.count({
      where: {
        date: { gte: today }
      }
    })

    // Ingresos del mes actual
    const monthlyTransactions = await prisma.transaction.aggregate({
      where: {
        status: 'COMPLETED',
        date: { gte: firstDayOfMonth }
      },
      _sum: { total: true }
    })
    const monthlyRevenue = monthlyTransactions._sum.total || 0

    // All athletes with their memberships and attendances
    const allAthletes = await prisma.user.findMany({
      where: { role: 'athlete' },
      include: {
        attendances: { orderBy: { date: 'desc' } }, // Get all to calculate attendance percentage
        memberships: { orderBy: { endDate: 'desc' }, take: 1 }
      }
    })

    const riskAthletes = allAthletes
      .map(a => {
        const lastAtt = a.attendances[0]?.date
        const days = lastAtt ? Math.floor((new Date().getTime() - new Date(lastAtt).getTime()) / (1000 * 60 * 60 * 24)) : 999
        return {
          nombre: a.name,
          dias: days,
          antiguedad: a.memberships[0] ? new Date(a.memberships[0].startDate).toLocaleDateString() : 'N/A'
        }
      })
      .filter(a => a.dias > 7 && a.dias < 30)
      .sort((a, b) => b.dias - a.dias)
      .slice(0, 3)

    const exitoAtletas = allAthletes
      .filter(a => a.attendances.length > 0)
      .map(a => {
        const attendancesLast30 = a.attendances.filter(att => new Date().getTime() - new Date(att.date).getTime() < 30 * 24 * 60 * 60 * 1000).length;
        return {
          nombre: a.name,
          porcentaje: Math.min(100, Math.round((attendancesLast30 / 20) * 100))
        }
      })
      .sort((a,b) => b.porcentaje - a.porcentaje)
      .slice(0, 5)

    const membresiasPorVencer = allAthletes
      .filter(a => {
        if (!a.memberships[0]) return false;
        const end = new Date(a.memberships[0].endDate)
        const days = Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
        return days > 0 && days <= 5;
      })
      .map(a => {
        const end = new Date(a.memberships[0].endDate)
        const days = Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
        return {
          nombre: a.name,
          venceEn: `${days} días`
        }
      })
      .slice(0, 3)

    const membresiasNuevas = allAthletes
      .filter(a => {
        if (!a.memberships[0]) return false;
        const start = new Date(a.memberships[0].startDate)
        const days = Math.ceil((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
        return days >= 0 && days <= 7;
      })
      .map(a => {
        const start = new Date(a.memberships[0].startDate)
        const days = Math.ceil((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
        return {
          nombre: a.name,
          plan: 'Plan Estándar',
          hace: days === 0 ? "Hoy" : `${days} días`
        }
      })
      .slice(0, 3)

    // Chart Data (Mock implementation for now, using random data connected to real scale)
    const revenueData = [
      { name: "Ene", ingresos: monthlyRevenue * 0.8, egresos: monthlyRevenue * 0.5 },
      { name: "Feb", ingresos: monthlyRevenue * 0.9, egresos: monthlyRevenue * 0.4 },
      { name: "Mar", ingresos: monthlyRevenue * 1.1, egresos: monthlyRevenue * 0.6 },
      { name: "Abr", ingresos: monthlyRevenue * 1.0, egresos: monthlyRevenue * 0.7 },
      { name: "May", ingresos: monthlyRevenue * 1.2, egresos: monthlyRevenue * 0.5 },
      { name: "Jun", ingresos: monthlyRevenue * 0.95, egresos: monthlyRevenue * 0.55 },
      { name: "Jul", ingresos: monthlyRevenue, egresos: monthlyRevenue * 0.5 },
    ]

    const attendanceData = [
      { name: "Lun", checkins: Math.round(attendancesToday * 1.2) },
      { name: "Mar", checkins: Math.round(attendancesToday * 1.1) },
      { name: "Mie", checkins: Math.round(attendancesToday * 1.3) },
      { name: "Jue", checkins: Math.round(attendancesToday * 1.0) },
      { name: "Vie", checkins: Math.round(attendancesToday * 0.9) },
      { name: "Sab", checkins: Math.round(attendancesToday * 0.5) },
      { name: "Dom", checkins: Math.round(attendancesToday * 0.2) },
    ]

    return { 
      success: true, 
      stats: {
        activeAthletes: activeAthletesCount,
        checkinsToday: attendancesToday,
        monthlyRevenue,
        riskAthletes,
        exitoAtletas,
        membresiasPorVencer,
        membresiasNuevas,
        revenueData,
        attendanceData
      }
    }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}
