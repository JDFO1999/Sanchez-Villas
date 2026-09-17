import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { User } from "@prisma/client";

const secretKey = process.env.JWT_SECRET || "gympro_super_secret_key_change_me_in_production";
const key = new TextEncoder().encode(secretKey);

export async function encrypt(payload: any) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(key);
}

export async function decrypt(input: string): Promise<any> {
  const { payload } = await jwtVerify(input, key, {
    algorithms: ["HS256"],
  });
  return payload;
}

export async function createSession(user: Partial<User>) {
  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const sessionData = {
    id: user.id,
    role: user.role,
    cedula: user.cedula,
  };
  
  const session = await encrypt(sessionData);
  
  const cookieStore = cookies();
  cookieStore.set("session", session, {
    expires,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });
}

export async function verifySession() {
  const cookieStore = cookies();
  const cookie = cookieStore.get("session")?.value;
  if (!cookie) return null;
  
  try {
    const session = await decrypt(cookie);
    return session;
  } catch (err) {
    return null;
  }
}

export function destroySession() {
  const cookieStore = cookies();
  cookieStore.set("session", "", {
    expires: new Date(0),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });
}
