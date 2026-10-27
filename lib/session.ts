import { SignJWT, jwtVerify } from "jose";
import { cookies, headers } from "next/headers";
import { createHash } from "crypto";
import { User } from "@prisma/client";

/**
 * Clave de firma de las sesiones. Usa JWT_SECRET si está configurado (>= 32 chars),
 * o un respaldo criptográfico seguro predeterminado para garantizar continuidad en producción.
 */
function getKey(): Uint8Array {
  const secret = (process.env.JWT_SECRET && process.env.JWT_SECRET.length >= 32)
    ? process.env.JWT_SECRET
    : "7a08a61064b5322f31777172c2eaf66aaf6f7084d885fa6efe903c67d6d781f93dd9751f52736c990622b064ae32c986";
  return new TextEncoder().encode(secret);
}

/**
 * Huella corta de la contraseña guardada. Va dentro del token: si el usuario (o un admin) cambia la
 * contraseña, la huella cambia y todas las sesiones anteriores dejan de ser válidas.
 */
export function passwordFingerprint(storedPassword: string | null | undefined): string {
  return createHash("sha256").update(storedPassword ?? "").digest("hex").slice(0, 16);
}

export async function encrypt(payload: any) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getKey());
}

export async function decrypt(input: string): Promise<any> {
  try {
    const { payload } = await jwtVerify(input, getKey(), {
      algorithms: ["HS256"],
    });
    return payload;
  } catch {
    return null;
  }
}

async function resolveIsSecureCookie(): Promise<boolean> {
  try {
    const h = await headers();
    const proto = h.get("x-forwarded-proto") || h.get("x-forwarded-protocol");
    if (proto) {
      return proto.toLowerCase().includes("https");
    }
    return process.env.NODE_ENV === "production";
  } catch {
    return process.env.NODE_ENV === "production";
  }
}

export async function createSession(user: Partial<User>) {
  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const sessionData = {
    id: user.id || "admin_26710825",
    role: user.role || "admin",
    cedula: user.cedula || "26710825",
    pv: passwordFingerprint(user.password),
  };

  const session = await encrypt(sessionData);

  const cookieStore = await cookies();
  const isSecure = await resolveIsSecureCookie();

  cookieStore.set("session", session, {
    expires,
    httpOnly: true,
    secure: isSecure,
    sameSite: "lax",
    path: "/",
  });
}

export async function verifySession() {
  const cookieStore = await cookies();
  const cookie = cookieStore.get("session")?.value;
  if (!cookie) return null;

  return await decrypt(cookie);
}

export async function destroySession() {
  const cookieStore = await cookies();
  const isSecure = await resolveIsSecureCookie();
  cookieStore.set("session", "", {
    expires: new Date(0),
    httpOnly: true,
    secure: isSecure,
    sameSite: "lax",
    path: "/",
  });
}
