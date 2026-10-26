"use server"

import prisma from "@/lib/db"
import { guard, ROLES } from "@/lib/authz"

export async function getDashboardStats() {
  // guard:getDashboardStats
  const g = await guard(ROLES.ADMIN)
  if (!g.ok) return { success: false, error: g.error }
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
          profilePicture: a.profilePicture,
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
          profilePicture: a.profilePicture,
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
          profilePicture: a.profilePicture,
          phone: a.phone || "0000000000",
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
          profilePicture: a.profilePicture,
          plan: a.memberships[0]?.planName || 'Plan Estándar',
          hace: days === 0 ? "Hoy" : `${days} días`
        }
      })
      .slice(0, 3)

    // 1. Asistencias de los últimos 30 días para Mapa de Calor de Horas Pico (6:00 a 22:00)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    const recentAttendances = await prisma.attendance.findMany({
      where: { date: { gte: thirtyDaysAgo } },
      select: { date: true }
    })

    const hoursMap: { [key: number]: number } = {}
    for (let h = 6; h <= 22; h++) hoursMap[h] = 0

    recentAttendances.forEach(att => {
      const h = new Date(att.date).getHours()
      if (h >= 6 && h <= 22) {
        hoursMap[h] = (hoursMap[h] || 0) + 1
      }
    })

    const peakHoursData = Object.keys(hoursMap).map(h => ({
      hour: `${h.padStart(2, '0')}:00`,
      checkins: hoursMap[Number(h)]
    }))

    // 2. Churn Rate (Tasa de Deserción):
    // Atletas cuya membresía venció en los últimos 30 días y no han renovado
    const expiredLast30Days = allAthletes.filter(a => {
      const lastMemb = a.memberships[0]
      if (!lastMemb) return false
      const endDate = new Date(lastMemb.endDate)
      const isExpired = endDate < today
      const expiredRecently = (today.getTime() - endDate.getTime()) <= 30 * 24 * 60 * 60 * 1000
      return isExpired && expiredRecently
    }).length

    const totalEligible = activeAthletesCount + expiredLast30Days
    const churnRate = totalEligible > 0 ? parseFloat(((expiredLast30Days / totalEligible) * 100).toFixed(1)) : 0.0

    // 3. ARPU (Average Revenue Per User)
    const arpu = activeAthletesCount > 0 ? parseFloat((monthlyRevenue / activeAthletesCount).toFixed(2)) : 0.0

    // 4. MRR (Monthly Recurring Revenue Estimado)
    const mrr = activeAthletesCount * (arpu > 0 ? arpu : 25)

    // Chart Data (Mock implementation for historical months, using real scale)
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
        churnRate,
        arpu,
        mrr,
        peakHoursData,
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
