import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { createHash } from "crypto";
import { User } from "@prisma/client";

/**
 * Clave de firma de las sesiones. Debe venir SIEMPRE de la variable de entorno JWT_SECRET
 * (mínimo 32 caracteres). No hay clave por defecto: si falta, no se puede iniciar ni verificar sesión.
 */
function getKey(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("JWT_SECRET no está configurado (mínimo 32 caracteres).");
  }
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

export async function createSession(user: Partial<User>) {
  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const sessionData = {
    id: user.id,
    role: user.role,
    cedula: user.cedula,
    pv: passwordFingerprint(user.password),
  };

  const session = await encrypt(sessionData);

  const cookieStore = await cookies();
  cookieStore.set("session", session, {
    expires,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
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
  cookieStore.set("session", "", {
    expires: new Date(0),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });
}
