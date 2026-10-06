"use server";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { headers } from "next/headers";

import prisma from "@/lib/db"
import { revalidatePath } from "next/cache"
import { saveBase64Image } from "@/lib/image-utils"
import { checkRateLimit } from "@/lib/rate-limiter"
import { audit } from "@/lib/audit"
import {
  guard, guardSelfOr, guardAttendance, getAuthUser, stripSecrets, omitFields, clientIpFrom, verifyActorPassword,
  ROLES, DENIED, EMPLOYEE_PRIVATE_FIELDS,
} from "@/lib/authz"

const EMPLOYEE_ROLES = ["admin", "coach", "cajero", "recepcion", "employee"]
const CEDULA_RE = /^[A-Za-z0-9._-]{3,30}$/
const MIN_PASSWORD = 6

const isPos = (role: string) => (ROLES.POS as readonly string[]).includes(role)
const isStaff = (role: string) => (ROLES.STAFF as readonly string[]).includes(role)
const randomPassword = () => crypto.randomBytes(9).toString("base64url")

function friendlyError(error: any): string {
  if (error?.code === "P2002") return "La cédula ya está registrada."
  console.error(error)
  return "No se pudo completar la operación."
}

export async function createEmployee(data: any, adminPassword?: string) {
  const g = await guard(ROLES.ADMIN)
  if (!g.ok) return { success: false, error: g.error }
  try {
    // Crear personal es una acción delicada: el administrador confirma su propia contraseña
    const stepUp = await verifyActorPassword(g.user.id, adminPassword)
    if (!stepUp.ok) return { success: false, needsPassword: true, error: stepUp.error }

    if (!EMPLOYEE_ROLES.includes(data?.role)) return { success: false, error: "Rol no válido." }
    if (!CEDULA_RE.test(String(data?.cedula ?? ""))) return { success: false, error: "Cédula no válida." }
    if (!data?.name || String(data.name).length > 120) return { success: false, error: "Nombre no válido." }
    if (!data?.clave || String(data.clave).length < MIN_PASSWORD) {
      return { success: false, error: `La contraseña es obligatoria (mínimo ${MIN_PASSWORD} caracteres).` }
    }

    const user = await prisma.user.create({
      data: {
        name: data.name,
        cedula: data.cedula,
        role: data.role,
        password: await bcrypt.hash(String(data.clave), 10),
        accessPin: data.pin || null,
        baseSalary: data.baseSalary ? parseFloat(data.baseSalary) : null,
        commissionRate: data.commissionRate ? parseFloat(data.commissionRate) : null,
        commissionType: data.commissionType || 'flat',
        paymentFrequency: data.paymentFrequency || 'monthly',
        birthDate: data.birthDate || null,
        profession: data.profession || null,
        specialties: data.specialties || null,
        nonWorkingDays: data.nonWorkingDays || null,
        bankAccount: data.bankAccount || null,
        mobilePayment: data.mobilePayment || null,
        email: data.email || null,
        phone: data.phone || null,
        canManageAttendance: Boolean(data.canManageAttendance),
      }
    });
    await audit("employee.create", g.user, { targetId: user.id, role: user.role });
    revalidatePath("/empleados")
    return { success: true, user: stripSecrets(user, { keepPin: true }) }
  } catch (error: any) {
    return { success: false, error: friendlyError(error) }
  }
}

export async function updateEmployee(id: string, data: any, adminPassword?: string) {
  const g = await guard(ROLES.ADMIN)
  if (!g.ok) return { success: false, error: g.error }
  try {
    // Cambios delicados (rol, cédula, contraseña, PIN, permiso de asistencia) exigen confirmar la contraseña del admin
    const current = await prisma.user.findUnique({ where: { id } })
    if (!current) return { success: false, error: "Empleado no encontrado." }
    const sensitive =
      (data?.role !== undefined && data.role !== current.role) ||
      (data?.cedula !== undefined && data.cedula !== current.cedula) ||
      !!data?.clave ||
      (data?.pin !== undefined && (data.pin || null) !== (current.accessPin || null)) ||
      (data?.canManageAttendance !== undefined && Boolean(data.canManageAttendance) !== current.canManageAttendance)
    if (sensitive) {
      const stepUp = await verifyActorPassword(g.user.id, adminPassword)
      if (!stepUp.ok) return { success: false, needsPassword: true, error: stepUp.error }
    }

    if (data?.role !== undefined && ![...EMPLOYEE_ROLES, "deleted"].includes(data.role)) {
      return { success: false, error: "Rol no válido." }
    }
    // Un administrador no puede quitarse su propio acceso por accidente
    if (id === g.user.id && data?.role !== undefined && data.role !== "admin") {
      return { success: false, error: "No puedes cambiar tu propio rol de administrador." }
    }
    if (data?.clave && String(data.clave).length < MIN_PASSWORD) {
      return { success: false, error: `La contraseña debe tener al menos ${MIN_PASSWORD} caracteres.` }
    }

    const user = await prisma.user.update({
      where: { id },
      data: {
        name: data.name,
        role: data.role,
        cedula: data.cedula,
        baseSalary: data.baseSalary ? parseFloat(data.baseSalary) : null,
        commissionRate: data.commissionRate ? parseFloat(data.commissionRate) : null,
        commissionType: data.commissionType || 'flat',
        paymentFrequency: data.paymentFrequency || 'monthly',
        birthDate: data.birthDate || null,
        profession: data.profession || null,
        specialties: data.specialties || null,
        nonWorkingDays: data.nonWorkingDays || null,
        bankAccount: data.bankAccount || null,
        mobilePayment: data.mobilePayment || null,
        email: data.email || null,
        phone: data.phone || null,
        canManageAttendance: data.canManageAttendance !== undefined ? Boolean(data.canManageAttendance) : undefined,
        accessPin: data.pin !== undefined ? data.pin : undefined,
        // Update password if provided
        ...(data.clave ? { password: await bcrypt.hash(String(data.clave), 10) } : {})
      }
    });
    await audit("employee.update", g.user, { targetId: id, newRole: data?.role, passwordChanged: !!data?.clave });
    revalidatePath("/empleados")
    return { success: true, user: stripSecrets(user, { keepPin: true }) }
  } catch (error: any) {
    return { success: false, error: friendlyError(error) }
  }
}

export async function getAllEmployees() {
  const g = await guard()
  if (!g.ok) return { success: false, error: g.error, employees: [] }
  try {
    const employees = await prisma.user.findMany({
      where: {
        role: { not: 'athlete' }
      }
    });

    // Administrador: ficha completa (incluye PIN para gestionar cajeros), nunca el hash de contraseña.
    if (g.user.role === "admin") {
      return { success: true, employees: stripSecrets(employees, { keepPin: true }) }
    }
    // Resto del personal: sin salarios, cuentas bancarias, PIN ni datos personales.
    if (isStaff(g.user.role)) {
      return { success: true, employees: employees.map(e => omitFields(e, EMPLOYEE_PRIVATE_FIELDS)) }
    }
    // Atletas: solo la lista pública de entrenadores (para pedir cambio de entrenador).
    const coaches = employees
      .filter(e => e.role === "coach")
      .map(e => ({
        id: e.id, name: e.name, role: e.role, profilePicture: e.profilePicture,
        specialties: e.specialties, bio: e.bio, socialLinks: e.socialLinks,
      }))
    return { success: true, employees: coaches }
  } catch (error: any) {
    return { success: false, error: friendlyError(error), employees: [] }
  }
}

/**
 * Crea un atleta. Acepta `createAthlete(data)` y la forma antigua `createAthlete(cedula, clave, perfil)`
 * que usa el formulario público de registro.
 *
 * - Sin sesión (registro público): limitado por IP, contraseña obligatoria, sin membresía ni entrenador libre.
 * - Personal (POS, admin…): puede asignar membresía y entrenador; sin contraseña válida se genera una aleatoria.
 */
export async function createAthlete(input: any, legacyClave?: string, legacyProfile?: any) {
  try {
    const data = typeof input === "string"
      ? { ...(legacyProfile || {}), cedula: input, password: legacyClave }
      : (input || {})

    const me = await getAuthUser()
    const staff = !!me && isStaff(me.role)

    if (!staff) {
      let ip = "unknown"
      try { ip = clientIpFrom(await headers()) } catch {}
      const limit = checkRateLimit(`register:${ip}`, 5, 60 * 60 * 1000)
      if (!limit.allowed) return { success: false, error: "Demasiados registros desde esta conexión. Intenta más tarde." }
    }

    if (!CEDULA_RE.test(String(data.cedula ?? ""))) return { success: false, error: "Cédula no válida." }
    if (!data.name || String(data.name).length > 120) return { success: false, error: "Nombre no válido." }

    let plain: string
    if (staff) {
      plain = data.password && String(data.password).length >= MIN_PASSWORD ? String(data.password) : randomPassword()
    } else {
      if (!data.password || String(data.password).length < MIN_PASSWORD) {
        return { success: false, error: `La contraseña debe tener al menos ${MIN_PASSWORD} caracteres.` }
      }
      plain = String(data.password)
    }

    // El entrenador elegido debe existir y serlo realmente
    let coachId: string | undefined
    if (data.coachId) {
      const coach = await prisma.user.findFirst({ where: { id: String(data.coachId), role: "coach" }, select: { id: true } })
      if (coach) coachId = coach.id
    }

    const user = await prisma.user.create({
        data: {
          name: data.name,
          cedula: data.cedula,
          role: 'athlete', // siempre atleta: el rol nunca se toma del cliente
          password: await bcrypt.hash(plain, 10),
          gender: data.gender,
          ...(coachId ? { coach: { connect: { id: coachId } } } : {}),
          phone: data.phone || null,
          address: data.address || null,
          email: data.email || null,
        }
    });

    // La membresía solo la asigna personal de caja/administración
    if (data.membershipEnd && me && isPos(me.role)) {
      await prisma.membership.create({
        data: {
          athleteId: user.id,
          startDate: new Date(),
          endDate: new Date(data.membershipEnd),
          status: 'ACTIVE'
        }
      })
    }

    revalidatePath("/atletas")
    revalidatePath("/membresias")
    return { success: true, user: stripSecrets(user) }
  } catch (error: any) {
    return { success: false, error: friendlyError(error) }
  }
}

export async function getAthletes() {
  const g = await guard(ROLES.STAFF)
  if (!g.ok) return { success: false, error: g.error, athletes: [] }
  try {
    const athletes = await prisma.user.findMany({
      where: { role: 'athlete' },
      include: {
        memberships: {
          orderBy: { endDate: 'desc' },
          take: 1
        },
        coach: true
      }
    })
    return { success: true, athletes: stripSecrets(athletes) }
  } catch (error: any) {
    return { success: false, error: friendlyError(error), athletes: [] }
  }
}

export async function getAthleteById(id: string) {
  const g = await guardSelfOr(id, ROLES.STAFF)
  if (!g.ok) return { success: false, error: g.error }
  try {
    const athlete = await prisma.user.findUnique({
      where: { id },
      include: {
        memberships: { orderBy: { endDate: 'desc' } },
        coach: true,
        biometrics: { orderBy: { date: 'asc' } },
        attendances: { orderBy: { date: 'desc' } }
      }
    })

    if (athlete && athlete.biometrics) {
      athlete.biometrics = athlete.biometrics.map(b => ({
        ...b,
        customFields: b.customFields ? JSON.parse(b.customFields) : undefined
      })) as any
    }

    return { success: true, athlete: stripSecrets(athlete) }
  } catch (error: any) {
    return { success: false, error: friendlyError(error) }
  }
}

export async function updateAthlete(id: string, data: any) {
  const g = await guardSelfOr(id, ROLES.STAFF)
  if (!g.ok) return { success: false, error: g.error }
  try {
    const staff = isStaff(g.user.role)

    // Un atleta editando su propio perfil solo puede cambiar datos de contacto,
    // nunca su entrenador ni su membresía.
    const user = await prisma.user.update({
      where: { id },
      data: {
        name: data.name,
        gender: data.gender,
        phone: data.phone || null,
        address: data.address || null,
        ...(staff ? { coachId: data.coachId || null } : {}),
      }
    });

    // Renovar membresía: solo caja/administración
    if (data.membershipEnd && isPos(g.user.role)) {
      await prisma.membership.create({
         data: {
            athleteId: id,
            startDate: new Date(),
            endDate: new Date(data.membershipEnd),
            status: 'ACTIVE'
         }
      });
    }

    revalidatePath(`/atletas/${id}`)
    revalidatePath("/atletas")
    return { success: true, user: stripSecrets(user) }
  } catch (error: any) {
    return { success: false, error: friendlyError(error) }
  }
}

export async function addBiometric(athleteId: string, data: any) {
  const g = await guardSelfOr(athleteId, ROLES.STAFF)
  if (!g.ok) return { success: false, error: g.error }
  try {
    const biometric = await prisma.biometric.create({
      data: {
        athleteId,
        weight: data.weight,
        height: data.height,
        customFields: data.customFields ? JSON.stringify(data.customFields) : null,
      }
    });
    revalidatePath(`/atletas/${athleteId}`)
    return { success: true, biometric }
  } catch (error: any) {
    return { success: false, error: friendlyError(error) }
  }
}

export async function registerAttendance(query: string, isCedula: boolean = false) {
  const g = await guardAttendance()
  if (!g.ok) return { success: false, error: g.error }
  try {
    const today = new Date()
    today.setHours(0,0,0,0)

    const user = await prisma.user.findFirst({
      where: isCedula ? { cedula: query, role: 'athlete' } : { id: query, role: 'athlete' },
      include: {
        memberships: {
          where: {
            status: 'ACTIVE',
            endDate: { gte: today }
          },
          orderBy: { endDate: 'desc' },
          take: 1
        }
      }
    })

    if (!user) {
      return { success: false, error: 'Atleta no encontrado' }
    }

    if (user.memberships.length === 0) {
      // Find the last expired membership to return the date
      const lastMembership = await prisma.membership.findFirst({
        where: { athleteId: user.id },
        orderBy: { endDate: 'desc' }
      })

      return {
        success: false,
        error: 'Membresía Vencida',
        lastDate: lastMembership?.endDate
      }
    }

    // Registrar asistencia
    await prisma.attendance.create({
      data: {
        userId: user.id,
        type: 'IN',
        date: new Date()
      }
    })

    return {
      success: true,
      user: {
        name: user.name,
        membershipEnd: user.memberships[0].endDate
      }
    }
  } catch (error: any) {
    return { success: false, error: friendlyError(error) }
  }
}

// --- COACH REQUESTS ---
export async function requestCoachChange(athleteId: string, newCoachId: string) {
  const g = await guardSelfOr(athleteId, ROLES.ADMIN)
  if (!g.ok) return { success: false, error: g.error }
  try {
    const coach = await prisma.user.findFirst({ where: { id: newCoachId, role: 'coach' }, select: { id: true } })
    if (!coach) return { success: false, error: 'Entrenador no válido' }

    const existing = await prisma.coachRequest.findFirst({
      where: { athleteId, status: 'PENDING' }
    })
    if (existing) {
      return { success: false, error: 'Ya tienes una solicitud pendiente' }
    }
    const req = await prisma.coachRequest.create({
      data: {
        athleteId,
        coachId: newCoachId
      } as any
    })
    return { success: true, request: req }
  } catch (error) {
    return { success: false, error: 'Error interno' }
  }
}

export async function getPendingCoachRequests() {
  const g = await guard(ROLES.ADMIN)
  if (!g.ok) return { success: false, error: g.error }
  try {
    const reqs = await prisma.coachRequest.findMany({
      where: { status: 'PENDING' },
      include: {
        athlete: { select: { id: true, name: true, cedula: true, coachId: true, coach: { select: { name: true } } } },
        coach: { select: { id: true, name: true } }
      } as any
    })
    return { success: true, requests: reqs }
  } catch (error) {
    return { success: false, error: 'Error interno' }
  }
}

export async function resolveCoachRequest(requestId: string, status: 'APPROVED' | 'REJECTED' | 'APPROVED_PENDING_PAYMENT', athleteId: string, newCoachId: string, fee?: number) {
  const g = await guard(ROLES.ADMIN)
  if (!g.ok) return { success: false, error: g.error }
  try {
    if (status === 'APPROVED_PENDING_PAYMENT' && fee && fee > 0) {
      // Guardar status como pendiente en el request (o APPROVED si no hay fee)
      await prisma.coachRequest.update({
        where: { id: requestId },
        data: { status: 'PENDING_PAYMENT' }
      });

      // Crear transacción pendiente en POS
      await prisma.transaction.create({
        data: {
          customerId: athleteId,
          cashierId: g.user.id,
          paymentMethod: 'Efectivo',
          subtotal: fee,
          tax: 0,
          total: fee,
          status: 'PENDING_DELIVERY',
          items: {
            create: [
              {
                productId: 'COACH_FEE',
                name: 'Cuota de Cambio de Entrenador',
                price: fee,
                qty: 1,
                subtotal: fee
              }
            ]
          }
        }
      });
    } else {
      await prisma.coachRequest.update({
        where: { id: requestId },
        data: { status: status === 'APPROVED_PENDING_PAYMENT' ? 'APPROVED' : status }
      });

      if (status === 'APPROVED' || (status === 'APPROVED_PENDING_PAYMENT' && (!fee || fee === 0))) {
        const athlete = await prisma.user.findUnique({ where: { id: athleteId } });
        await prisma.user.update({
          where: { id: athleteId },
          data: {
            previousCoachId: athlete?.coachId,
            coachId: newCoachId
          }
        });
      }
    }

    revalidatePath('/');
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Error interno' }
  }
}

// --- ATHLETE DASHBOARD DATA ---
export async function getAthleteDashboardData(athleteId: string) {
  const g = await guardSelfOr(athleteId, ROLES.STAFF)
  if (!g.ok) return { success: false, error: g.error }
  try {
    const biometrics = await prisma.biometric.findMany({
      where: { athleteId },
      orderBy: { date: 'asc' }
    })
    const allAttendances = await prisma.attendance.findMany({
      where: { userId: athleteId },
      orderBy: { date: 'desc' }
    })

    let streak = 0;
    let lastDate = new Date();
    lastDate.setHours(0,0,0,0);

    for (const att of allAttendances) {
      const attDate = new Date(att.date);
      attDate.setHours(0,0,0,0);
      const diffTime = Math.abs(lastDate.getTime() - attDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 0 || diffDays === 1) {
        if (diffDays === 1) streak++;
        else if (streak === 0 && diffDays === 0) streak = 1;
        lastDate = attDate;
      } else {
        break;
      }
    }

    const memberships = await prisma.membership.findMany({
      where: { athleteId },
      orderBy: { endDate: 'desc' }
    })
    const purchases = await prisma.transaction.findMany({
      where: { customerId: athleteId },
      orderBy: { date: 'desc' },
      include: { items: true }
      })

    const routines = await prisma.routine.findMany({
      where: { athleteId },
      include: { exercises: true },
      orderBy: { date: "asc" }
    })
    const diets = await prisma.dietAssignment.findMany({
      where: { athleteId },
      orderBy: { date: "desc" }
    })
    const exerciseProgress = await prisma.exerciseProgress.findMany({
      where: { athleteId },
      orderBy: { date: "asc" }
    })
    const payload = { success: true, biometrics, attendances: allAttendances.slice(0, 5), memberships, purchases, streak, routines, diets, exerciseProgress };
    return JSON.parse(JSON.stringify(payload));
  } catch (error) {
    console.error("DASHBOARD CATCH ERROR:", error); return { success: false, error: 'Error al obtener dashboard de atleta' }
  }
}

export async function updateProfilePicture(athleteId: string, base64Image: string) {
  const g = await guardSelfOr(athleteId, ROLES.STAFF)
  if (!g.ok) return { success: false, error: g.error }
  try {
    const imageUrl = await saveBase64Image(base64Image, "avatar");

    if (!imageUrl) return { success: false, error: "Error procesando imagen" }

    const user = await prisma.user.update({
      where: { id: athleteId },
      data: { profilePicture: imageUrl }
    });

    revalidatePath("/atletas");
    revalidatePath("/atletas/" + athleteId);
    revalidatePath("/");

    return { success: true, profilePicture: imageUrl }
  } catch (error: any) {
    return { success: false, error: error?.message || "No se pudo guardar la imagen." }
  }
}

export async function updateCoachProfile(id: string, data: { bio?: string, socialLinks?: string }) {
  const g = await guardSelfOr(id, ROLES.ADMIN)
  if (!g.ok) return { success: false, error: g.error }
  try {
    // Solo estos dos campos, con tope de tamaño (nunca el objeto completo del cliente)
    const safe: { bio?: string; socialLinks?: string } = {}
    if (typeof data?.bio === "string") safe.bio = data.bio.slice(0, 2000)
    if (typeof data?.socialLinks === "string") safe.socialLinks = data.socialLinks.slice(0, 2000)
    await prisma.user.update({
      where: { id },
      data: safe
    })
    return { success: true }
  } catch (error: any) {
    return { success: false, error: friendlyError(error) }
  }
}
