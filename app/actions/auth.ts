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
    if (typeof pin !== "string" || !pin || pin.length > 200) {
      return { success: false, error: "Clave o PIN no válido" };
    }

    // Límite POR IP
    const ip = await clientIp();
    const pinLimit = checkRateLimit(`pin:${ip}`, 10, WINDOW_MS);
    if (!pinLimit.allowed) {
      return {
        success: false,
        error: `Límite de intentos excedido. Espere ${pinLimit.resetInSeconds} segundos.`
      };
    }

    const trimmedPin = pin.trim();
    let matchedUser: any = null;

    // 1) Primero verificamos si coincide con la clave de la cuenta (o accessPin) del usuario con sesión activa
    const currentSessionUser = await getAuthUser();
    if (currentSessionUser) {
      const dbCurrent = await prisma.user.findUnique({ where: { id: currentSessionUser.id } });
      if (dbCurrent && dbCurrent.role !== "deleted") {
        let isPassMatch = false;
        try {
          isPassMatch = await bcrypt.compare(trimmedPin, dbCurrent.password || "");
        } catch {
          isPassMatch = false;
        }
        if (!isPassMatch && dbCurrent.password === trimmedPin) {
          isPassMatch = true;
        }
        if (isPassMatch || (dbCurrent.accessPin && dbCurrent.accessPin === trimmedPin)) {
          matchedUser = dbCurrent;
        }
      }
    }

    // 2) Si no es el usuario en sesión (ej. un Admin autorizando en recepción o un cajero escaneando su código),
    // buscamos por accessPin directo
    if (!matchedUser) {
      matchedUser = await prisma.user.findFirst({
        where: { accessPin: trimmedPin, NOT: { role: "deleted" } }
      });
    }

    // 3) Si aún no hay coincidencia, verificamos si coincide con la contraseña (clave de cuenta) de algún miembro del personal autorizado (Admin, Cajero, Recepción)
    if (!matchedUser) {
      const posUsers = await prisma.user.findMany({
        where: {
          role: { in: [...ROLES.POS] }
        }
      });
      for (const candidate of posUsers) {
        let isMatch = false;
        try {
          isMatch = await bcrypt.compare(trimmedPin, candidate.password || "");
        } catch {
          isMatch = false;
        }
        if (!isMatch && candidate.password === trimmedPin) {
          isMatch = true;
        }
        if (isMatch) {
          matchedUser = candidate;
          break;
        }
      }
    }

    if (!matchedUser) {
      await audit("login.pin_failed", null);
      return { success: false, error: "Clave o PIN incorrecto" };
    }

    // Ensure the user actually has permission to operate POS / Recepción / Admin
    if (!(ROLES.POS as readonly string[]).includes(matchedUser.role) && !(matchedUser as any).canManageAttendance) {
      return { success: false, error: "El usuario no tiene permisos de cajero, recepción o administrador" };
    }

    resetRateLimit(`pin:${ip}`);
    // Solo creamos sesión si no había nadie logueado previamente, para no reemplazar la sesión del recepcionista cuando un Admin autoriza algo
    if (!currentSessionUser) {
      await createSession(matchedUser);
    }
    await audit("login.pin", { id: matchedUser.id, role: matchedUser.role });
    return { success: true, user: stripSecrets(matchedUser) };
  } catch (error: any) {
    console.error("validatePinAction:", error);
    return { success: false, error: "No se pudo validar la clave o PIN." };
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
