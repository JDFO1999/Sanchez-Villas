"use server"

import prisma from "@/lib/db"

export async function loginAction(cedula: string, clave: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { cedula }
    });

    if (!user) {
      return { success: false, error: "Usuario no encontrado" }
    }

    if (user.password !== clave) {
      return { success: false, error: "Contraseña incorrecta" }
    }

    // In a real app we would create a session/JWT here
    return { success: true, user }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function validatePinAction(pin: string) {
  try {
    const user = await prisma.user.findFirst({
      where: { accessPin: pin }
    });

    if (!user) {
      return { success: false, error: "PIN no válido o no asignado" }
    }

    // Ensure the user actually has permission to operate POS
    if (user.role !== 'admin' && user.role !== 'cajero' && user.role !== 'recepcion') {
       return { success: false, error: "Usuario no tiene permisos de cajero" }
    }

    return { success: true, user }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function getUserById(id: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id }
    });
    if (!user) return { success: false }
    return { success: true, user }
  } catch (e) {
    return { success: false }
  }
}
