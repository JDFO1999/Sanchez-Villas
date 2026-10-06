"use server";
import { headers } from "next/headers";
import { createSession, destroySession } from "@/lib/session";
import prisma from "@/lib/db"
import bcrypt from "bcryptjs"
import { checkRateLimit, resetRateLimit } from "@/lib/rate-limiter";
import { clientIpFrom, getAuthUser, stripSecrets, ROLES, DENIED } from "@/lib/authz";
import { audit } from "@/lib/audit"

// Hash de relleno: se compara aunque el usuario no exista para que el tiempo de respuesta no delate qué cédulas existen.
const DUMMY_HASH = bcrypt.hashSync("relleno-no-es-una-clave", 10);

const WINDOW_MS = 5 * 60 * 1000;

async function clientIp(): Promise<string> {
  try {
    return clientIpFrom(await headers());
  } catch {
    return "unknown";
  }
}

export async function loginAction(cedula: string, clave: string) {
  try {
    if (typeof cedula !== "string" || typeof clave !== "string" || !cedula || !clave || cedula.length > 40 || clave.length > 200) {
      return { success: false, error: "Usuario o contraseña inválida" };
    }

    // Límite por cédula (5 / 5 min) y por IP (20 / 5 min) para frenar fuerza bruta y relleno de credenciales
    const ip = await clientIp();
    const byUser = checkRateLimit(`login:${cedula}`, 5, WINDOW_MS);
    const byIp = checkRateLimit(`login-ip:${ip}`, 20, WINDOW_MS);
    if (!byUser.allowed || !byIp.allowed) {
      const wait = Math.max(byUser.allowed ? 0 : byUser.resetInSeconds, byIp.allowed ? 0 : byIp.resetInSeconds);
      await audit("login.blocked", null, { cedula });
      return {
        success: false,
        error: `Demasiados intentos fallidos. Por seguridad, intente en ${wait} segundos.`
      };
    }

    const user = await prisma.user.findUnique({
      where: { cedula }
    });

    if (!user || user.role === "deleted") {
      await bcrypt.compare(clave, DUMMY_HASH).catch(() => false);
      await audit("login.failed", null, { cedula, reason: "usuario_inexistente" });
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
      user.password = secureHash; // la sesión se firma con la huella de la contraseña ya cifrada
      await prisma.user.update({
        where: { id: user.id },
        data: { password: secureHash }
      }).catch(err => console.error("Error migrando contraseña legacy:", err));
    }

    if (!isMatch) {
      await audit("login.failed", { id: user.id, role: user.role }, { cedula, reason: "clave_incorrecta" });
      return { success: false, error: "Usuario o contraseña inválida" };
    }

    // Reset rate limiter on successful authentication
    resetRateLimit(`login:${cedula}`);

    await createSession(user);
    await audit("login.success", { id: user.id, role: user.role });
    return { success: true, user: stripSecrets(user) };
  } catch (error: any) {
    console.error("loginAction:", error);
    return { success: false, error: "No se pudo iniciar sesión. Intente de nuevo." };
  }
}

export async function validatePinAction(pin: string) {
  try {
    if (typeof pin !== "string" || !pin || pin.length > 40) {
      return { success: false, error: "PIN no válido o no asignado" };
    }

    // Límite POR IP (antes era global: cualquiera podía bloquear el PIN de todo el gimnasio)
    const ip = await clientIp();
    const pinLimit = checkRateLimit(`pin:${ip}`, 10, WINDOW_MS);
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
      await audit("login.pin_failed", null);
      return { success: false, error: "PIN no válido o no asignado" };
    }

    // Ensure the user actually has permission to operate POS
    if (!(ROLES.POS as readonly string[]).includes(user.role)) {
       return { success: false, error: "Usuario no tiene permisos de cajero" };
    }

    resetRateLimit(`pin:${ip}`);
    await createSession(user);
    await audit("login.pin", { id: user.id, role: user.role });
    return { success: true, user: stripSecrets(user) };
  } catch (error: any) {
    console.error("validatePinAction:", error);
    return { success: false, error: "No se pudo validar el PIN." };
  }
}

export async function getUserById(id: string) {
  try {
    const me = await getAuthUser();
    if (!me) return { success: false, error: DENIED };
    // Solo el propio usuario o personal del gimnasio
    if (me.id !== id && !(ROLES.STAFF as readonly string[]).includes(me.role)) {
      return { success: false, error: DENIED };
    }
    const user = await prisma.user.findUnique({
      where: { id }
    });
    if (!user) return { success: false }
    return { success: true, user: stripSecrets(user) }
  } catch (e) {
    return { success: false }
  }
}

export async function getSessionData() {
  const me = await getAuthUser();
  if (!me) return { success: false };

  const user = await prisma.user.findUnique({
    where: { id: me.id }
  });

  if (!user) return { success: false };
  return { success: true, user: stripSecrets(user) };
}

export async function logoutAction() {
  await destroySession();
  return { success: true };
}
