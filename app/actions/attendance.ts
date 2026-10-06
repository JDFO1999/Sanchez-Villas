"use server"

import prisma from "@/lib/db"
import { guardAttendance } from "@/lib/authz"

export async function checkInByCedula(cedula: string) {
  // guard:checkInByCedula
  const g = await guardAttendance()
  if (!g.ok) return { success: false, error: g.error }
  try {
    const user = await prisma.user.findUnique({
      where: { cedula }
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
        return { success: false, error: "Membresía vencida o inactiva" };
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
