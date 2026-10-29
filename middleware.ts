import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

// Usa JWT_SECRET si está configurado (>= 32 chars), o el mismo respaldo criptográfico seguro de lib/session.ts
const DEFAULT_JWT_SECRET = "7a08a61064b5322f31777172c2eaf66aaf6f7084d885fa6efe903c67d6d781f93dd9751f52736c990622b064ae32c986";
const secret = (process.env.JWT_SECRET && process.env.JWT_SECRET.length >= 32)
  ? process.env.JWT_SECRET
  : DEFAULT_JWT_SECRET;
const key = new TextEncoder().encode(secret);

const PROTECTED_PREFIXES = [
  "/atletas",
  "/empleados",
  "/finanzas",
  "/asistencia",
  "/tienda",
  "/membresias",
  "/mis-atletas",
  "/rutina",
  "/ajustes",
  "/perfil",
  "/comunidad",
  "/entrenadores",
  "/planes",
];

export async function middleware(request: NextRequest) {
  // Only apply edge redirection to standard GET page navigation.
  // Never intercept Server Actions (POST with next-action) or RSC data fetches to avoid breaking Next.js action responses.
  if (
    request.method !== "GET" ||
    request.headers.has("next-action") ||
    request.headers.get("rsc") === "1"
  ) {
    return NextResponse.next();
  }

  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get("session")?.value;

  const isExactHome = pathname === "/";
  const isProtected = PROTECTED_PREFIXES.some(prefix => pathname === prefix || pathname.startsWith(`${prefix}/`));

  let validPayload: any = null;
  if (sessionCookie && key) {
    try {
      const { payload } = await jwtVerify(sessionCookie, key, { algorithms: ["HS256"] });
      validPayload = payload;
    } catch {
      validPayload = null;
    }
  }

  // 1. If accessing a protected route without a valid token
  if (isProtected && !validPayload) {
    const loginUrl = new URL("/login", request.url);
    if (!isExactHome) {
      loginUrl.searchParams.set("redirect", pathname);
    }
    const res = NextResponse.redirect(loginUrl);
    if (sessionCookie) {
      res.cookies.delete("session");
    }
    return res;
  }

  // 2. Role-based server guard for critical administrative routes
  if (validPayload) {
    const role = validPayload.role as string;
    
    // Profile is accessible by all staff/employees (admin, gerente, coach, employee, cajero, recepcion)
    if (pathname.startsWith("/perfil")) {
      const allowedRoles = ["admin", "gerente", "coach", "employee", "cajero", "recepcion"];
      if (!allowedRoles.includes(role)) {
        return NextResponse.redirect(new URL("/", request.url));
      }
    }

    // Coaches/employees can never access finance
    if (pathname.startsWith("/finanzas") && (role === "coach" || role === "employee")) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    // Athletes cannot access administrative, staff, inventory, or membership management routes
    if (role === "athlete") {
      if (
        pathname.startsWith("/tienda/inventario") ||
        pathname.startsWith("/membresias") ||
        pathname.startsWith("/planes") ||
        pathname.startsWith("/empleados") ||
        pathname.startsWith("/finanzas") ||
        pathname.startsWith("/ajustes") ||
        pathname.startsWith("/entrenadores") ||
        pathname.startsWith("/asistencia") ||
        pathname.startsWith("/atletas") ||
        pathname.startsWith("/mis-atletas")
      ) {
        return NextResponse.redirect(new URL("/", request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|uploads|.*\\..*).*)",
  ],
};
