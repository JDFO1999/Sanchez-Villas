"use server";
import { createSession } from "@/lib/session";
import prisma from "@/lib/db"
import bcrypt from "bcryptjs"
import { checkRateLimit, resetRateLimit } from "@/lib/rate-limiter";

export async function loginAction(cedula: string, clave: string) {
  try {
    // 1. Rate limiting check (max 5 failed attempts per 5 minutes per cedula)
    const limit = checkRateLimit(`login:${cedula}`, 5, 5 * 60 * 1000);
    if (!limit.allowed) {
      return { 
        success: false, 
        error: `Demasiados intentos fallidos. Por seguridad, intente en ${limit.resetInSeconds} segundos.` 
      };
    }

    const user = await prisma.user.findUnique({
      where: { cedula }
    });

    if (!user) {
      return { success: false, error: "Usuario o contraseña inválida" };
    }

    let isMatch = false;
    try {
      isMatch = await bcrypt.compare(clave, user.password || "");
    } catch (err) {
      isMatch = false;
    }

    // Auto-migration for legacy plain-text passwords:
    // If bcrypt compare failed but legacy string matches, hash it immediately to upgrade security
    if (!isMatch && user.password === clave) {
      isMatch = true;
      const secureHash = await bcrypt.hash(clave, 10);
      await prisma.user.update({
        where: { id: user.id },
        data: { password: secureHash }
      }).catch(err => console.error("Error migrando contraseña legacy:", err));
    }
    
    if (!isMatch) {
      return { success: false, error: "Usuario o contraseña inválida" };
    }

    // Reset rate limiter on successful authentication
    resetRateLimit(`login:${cedula}`);

    await createSession(user);
    return { success: true, user };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function validatePinAction(pin: string) {
  try {
    const pinLimit = checkRateLimit("pin_attempt", 10, 5 * 60 * 1000);
    if (!pinLimit.allowed) {
      return { 
        success: false, 
        error: `Límite de intentos de PIN excedido. Espere ${pinLimit.resetInSeconds} segundos.` 
      };
    }

    const user = await prisma.user.findFirst({
      where: { accessPin: pin }
    });

    if (!user) {
      return { success: false, error: "PIN no válido o no asignado" };
    }

    // Ensure the user actually has permission to operate POS
    if (user.role !== 'admin' && user.role !== 'cajero' && user.role !== 'recepcion') {
       return { success: false, error: "Usuario no tiene permisos de cajero" };
    }

    resetRateLimit("pin_attempt");
    await createSession(user);
    return { success: true, user };
  } catch (error: any) {
    return { success: false, error: error.message };
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

import { verifySession, destroySession } from "@/lib/session";

export async function getSessionData() {
  const session = await verifySession();
  if (!session) return { success: false };
  
  const user = await prisma.user.findUnique({
    where: { id: session.id as string }
  });
  
  if (!user) return { success: false };
  return { success: true, user };
}

export async function logoutAction() {
  destroySession();
  return { success: true };
}
