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

function extractUserPermissions(user: any): string[] {
  if (!user?.specialties) return [];
  try {
    if (user.specialties.startsWith('{') && user.specialties.includes('"permissions"')) {
      const parsed = JSON.parse(user.specialties);
      if (Array.isArray(parsed.permissions)) return parsed.permissions;
    }
  } catch {}
  return [];
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
    return { success: true, user: { ...stripSecrets(user), permissions: extractUserPermissions(user) } };
  } catch (error: any) {
    console.error("loginAction:", error);
    return { success: false, error: "No se pudo iniciar sesión. Intente de nuevo." };
  }
}

function isAllowedCashierPinRole(role?: string): boolean {
  if (!role) return false;
  const r = role.toLowerCase();
  return r === "cajero" || r === "gerente" || r === "admin" || r.includes("cajer") || r.includes("gerent");
}

export async function validatePinAction(pin: string) {
  try {
    if (typeof pin !== "string" || !pin || pin.length > 200) {
      return { success: false, error: "Código de barras / PIN no válido" };
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
    const currentSessionUser = await getAuthUser();

    // 1) Buscar por Código de Barras / PIN asignado (accessPin) — aplica para Cajero, Gerente y Administrador
    let matchedUser: any = await prisma.user.findFirst({
      where: { accessPin: trimmedPin, NOT: { role: "deleted" } }
    });

    // 2) Si no coincidió por accessPin, SOLO el Gerente o el Administrador pueden validar con su clave
    // (El Cajero NUNCA puede usar la clave de su cuenta personal; el Cajero debe usar obligatoriamente su código de barras / PIN)
    if (!matchedUser) {
      const adminOrManagerUsers = await prisma.user.findMany({
        where: {
          NOT: { role: "deleted" }
        }
      });
      for (const candidate of adminOrManagerUsers) {
        const r = (candidate.role || "").toLowerCase();
        const isManagerOrAdmin = r === "admin" || r === "gerente" || r.includes("gerent");
        if (!isManagerOrAdmin) continue;

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
      return { success: false, error: "Código de barras / PIN inválido (Recuerda: el cajero debe usar su código de barras/PIN, no la clave de su cuenta)." };
    }

    // Verificar que SOLO Cajero, Gerente o Administrador puedan utilizarlo
    if (!isAllowedCashierPinRole(matchedUser.role)) {
      return { success: false, error: "Solo el Cajero, el Gerente y el Administrador están autorizados para validar cobros." };
    }

    resetRateLimit(`pin:${ip}`);
    if (!currentSessionUser) {
      await createSession(matchedUser);
    }
    await audit("login.pin", { id: matchedUser.id, role: matchedUser.role });
    return { success: true, user: { ...stripSecrets(matchedUser), permissions: extractUserPermissions(matchedUser) } };
  } catch (error: any) {
    console.error("validatePinAction:", error);
    return { success: false, error: "No se pudo validar el código de barras / PIN." };
  }
}

/**
 * Validación exclusiva con la CLAVE de la cuenta del Administrador (usado en Recepción para ingreso manual por Cédula y anulaciones).
 */
export async function validateAdminPasswordAction(clave: string) {
  try {
    if (typeof clave !== "string" || !clave || clave.length > 200) {
      return { success: false, error: "Contraseña de Administrador no válida." };
    }

    const ip = await clientIp();
    const limit = checkRateLimit(`admin-pass:${ip}`, 10, WINDOW_MS);
    if (!limit.allowed) {
      return {
        success: false,
        error: `Demasiados intentos. Espere ${limit.resetInSeconds} segundos.`
      };
    }

    const trimmed = clave.trim();
    const admins = await prisma.user.findMany({
      where: { role: "admin" }
    });

    let matchedAdmin: any = null;
    for (const adm of admins) {
      let isMatch = false;
      try {
        isMatch = await bcrypt.compare(trimmed, adm.password || "");
      } catch {
        isMatch = false;
      }
      if (!isMatch && adm.password === trimmed) {
        isMatch = true;
      }
      if (isMatch) {
        matchedAdmin = adm;
        break;
      }
    }

    if (!matchedAdmin) {
      await audit("admin.auth_failed", null);
      return { success: false, error: "Clave de Administrador incorrecta." };
    }

    resetRateLimit(`admin-pass:${ip}`);
    await audit("admin.auth_success", { id: matchedAdmin.id, role: matchedAdmin.role });
    return { success: true, user: stripSecrets(matchedAdmin) };
  } catch (error: any) {
    console.error("validateAdminPasswordAction:", error);
    return { success: false, error: "No se pudo validar la clave de Administrador." };
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
  return { success: true, user: { ...stripSecrets(user), permissions: extractUserPermissions(user) } };
}

export async function logoutAction() {
  await destroySession();
  return { success: true };
}
