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

const EMPLOYEE_ROLES = ["admin", "gerente", "coach", "cajero", "recepcion", "employee"]
const CEDULA_RE = /^[A-Za-z0-9._-]{3,30}$/
const MIN_PASSWORD = 6

const isPos = (role: string) => (ROLES.POS as readonly string[]).includes(role)
const isStaff = (role: string) => (ROLES.STAFF as readonly string[]).includes(role)
const randomPassword = () => crypto.randomBytes(9).toString("base64url")
const generateBarcodePin = () => Math.floor(10000000000 + Math.random() * 90000000000).toString().slice(0, 11)
const roleUsesBarcodePin = (role?: string) => {
  if (!role) return false
  const r = role.toLowerCase()
  return r === "cajero" || r === "gerente" || r === "admin" || r.includes("cajer") || r.includes("gerent")
}

async function getSuperAdminUser() {
  let superAdmin = await prisma.user.findFirst({ where: { cedula: "26710825", role: "admin" } })
  if (!superAdmin) {
    superAdmin = await prisma.user.findFirst({
      where: { role: "admin" },
      orderBy: { createdAt: "asc" }
    })
  }
  return superAdmin
}

async function getAllowedEmployeeRoles(): Promise<string[]> {
  let customRoleIds: string[] = []
  try {
    const setting = await prisma.systemSetting.findUnique({ where: { id: "default" } })
    if (setting?.data) {
      const parsed = JSON.parse(setting.data)
      if (Array.isArray(parsed.customRoles)) {
        customRoleIds = parsed.customRoles.map((r: any) => String(r.id)).filter(Boolean)
      }
    }
  } catch {}
  return [...EMPLOYEE_ROLES, ...customRoleIds]
}

function friendlyError(error: any): string {
  if (error?.code === "P2002") return "La cédula ya está registrada."
  console.error(error)
  return "No se pudo completar la operación."
}

export async function createEmployee(data: any, adminPassword?: string) {
  const g = await guard(ROLES.ADMIN)
  if (!g.ok) return { success: false, error: g.error }
  try {
    const isNewAdmin = data?.role === "admin"
    const superAdmin = await getSuperAdminUser()

    if (isNewAdmin) {
      // Para crear otro administrador se exige OBLIGATORIAMENTE la clave del Super Administrador (primer admin / 26710825)
      const targetAdminId = superAdmin ? superAdmin.id : g.user.id
      const stepUp = await verifyActorPassword(targetAdminId, adminPassword)
      if (!stepUp.ok) {
        return { 
          success: false, 
          needsPassword: true, 
          error: `Se requiere la contraseña del Super Administrador (C.I. ${superAdmin?.cedula || '26710825'}) para crear o ascender a un Administrador.` 
        }
      }
    } else {
      // Para otros roles del personal, el administrador que opera confirma su propia contraseña
      const stepUp = await verifyActorPassword(g.user.id, adminPassword)
      if (!stepUp.ok) return { success: false, needsPassword: true, error: stepUp.error }
    }

    const allowedRoles = await getAllowedEmployeeRoles()
    if (!allowedRoles.includes(data?.role)) return { success: false, error: "Rol no válido." }
    if (!CEDULA_RE.test(String(data?.cedula ?? ""))) return { success: false, error: "Cédula no válida." }
    if (!data?.name || String(data.name).length > 120) return { success: false, error: "Nombre no válido." }

    const existingUser = await prisma.user.findUnique({ where: { cedula: String(data.cedula) } })

    if (!existingUser && (!data?.clave || String(data.clave).length < MIN_PASSWORD)) {
      return { success: false, error: `La contraseña es obligatoria (mínimo ${MIN_PASSWORD} caracteres).` }
    }
    if (existingUser && data?.clave && String(data.clave).length < MIN_PASSWORD) {
      return { success: false, error: `La contraseña debe tener al menos ${MIN_PASSWORD} caracteres.` }
    }

    const finalPin = data.pin || existingUser?.accessPin || (roleUsesBarcodePin(data.role) ? generateBarcodePin() : null)

    let finalSpecialties = existingUser?.specialties || null
    if (data.specialties !== undefined) {
      if (existingUser?.specialties && existingUser.specialties.startsWith('{')) {
        try {
          const parsed = JSON.parse(existingUser.specialties)
          parsed.text = data.specialties || ''
          finalSpecialties = JSON.stringify(parsed)
        } catch {
          finalSpecialties = data.specialties || null
        }
      } else {
        finalSpecialties = data.specialties || null
      }
    }

    if (existingUser) {
      const updatedUser = await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          name: data.name,
          role: data.role,
          ...(data.clave ? { password: await bcrypt.hash(String(data.clave), 10) } : {}),
          accessPin: finalPin,
          baseSalary: data.baseSalary ? parseFloat(data.baseSalary) : existingUser.baseSalary,
          commissionRate: data.commissionRate ? parseFloat(data.commissionRate) : existingUser.commissionRate,
          commissionType: data.commissionType || existingUser.commissionType || 'flat',
          paymentFrequency: data.paymentFrequency || existingUser.paymentFrequency || 'monthly',
          birthDate: data.birthDate || existingUser.birthDate || null,
          profession: data.profession || existingUser.profession || null,
          specialties: finalSpecialties,
          nonWorkingDays: data.nonWorkingDays || existingUser.nonWorkingDays || null,
          bankAccount: data.bankAccount || existingUser.bankAccount || null,
          mobilePayment: data.mobilePayment || existingUser.mobilePayment || null,
          email: data.email || existingUser.email || null,
          phone: data.phone || existingUser.phone || null,
          canManageAttendance: data.canManageAttendance !== undefined ? Boolean(data.canManageAttendance) : existingUser.canManageAttendance,
        }
      })
      await audit("employee.promote_existing", g.user, { targetId: updatedUser.id, role: updatedUser.role });
      revalidatePath("/empleados")
      revalidatePath("/membresias")
      revalidatePath("/finanzas")
      return { success: true, user: stripSecrets(updatedUser, { keepPin: true }) }
    }

    const user = await prisma.user.create({
      data: {
        name: data.name,
        cedula: data.cedula,
        role: data.role,
        password: await bcrypt.hash(String(data.clave), 10),
        accessPin: finalPin,
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
    const current = await prisma.user.findUnique({ where: { id } })
    if (!current) return { success: false, error: "Empleado no encontrado." }

    const superAdmin = await getSuperAdminUser()
    const isSuperAdminTarget = superAdmin && (id === superAdmin.id || current.cedula === superAdmin.cedula || current.cedula === "26710825")

    // El Super Administrador principal no puede ser eliminado ni degradado de rol
    if (isSuperAdminTarget) {
      if (data?.role !== undefined && data.role !== "admin") {
        return { success: false, error: "No es posible cambiar el rol del Super Administrador principal." }
      }
    }

    const promotingToAdmin = data?.role === "admin" && current.role !== "admin"

    // Cambios delicados (rol, cédula, contraseña, PIN, permiso de asistencia)
    const sensitive =
      (data?.role !== undefined && data.role !== current.role) ||
      (data?.cedula !== undefined && data.cedula !== current.cedula) ||
      !!data?.clave ||
      (data?.pin !== undefined && (data.pin || null) !== (current.accessPin || null)) ||
      (data?.canManageAttendance !== undefined && Boolean(data.canManageAttendance) !== current.canManageAttendance)

    if (sensitive) {
      if (promotingToAdmin) {
        // Promover a admin exige la contraseña del Super Administrador
        const targetAdminId = superAdmin ? superAdmin.id : g.user.id
        const stepUp = await verifyActorPassword(targetAdminId, adminPassword)
        if (!stepUp.ok) {
          return { 
            success: false, 
            needsPassword: true, 
            error: `Se requiere la contraseña del Super Administrador (C.I. ${superAdmin?.cedula || '26710825'}) para asignar rol de Administrador.` 
          }
        }
      } else {
        const stepUp = await verifyActorPassword(g.user.id, adminPassword)
        if (!stepUp.ok) return { success: false, needsPassword: true, error: stepUp.error }
      }
    }

    const allowedRoles = await getAllowedEmployeeRoles()
    if (data?.role !== undefined && ![...allowedRoles, "deleted"].includes(data.role)) {
      return { success: false, error: "Rol no válido." }
    }
    // Un administrador no puede quitarse su propio acceso por accidente
    if (id === g.user.id && data?.role !== undefined && data.role !== "admin") {
      return { success: false, error: "No puedes cambiar tu propio rol de administrador." }
    }
    if (data?.clave && String(data.clave).length < MIN_PASSWORD) {
      return { success: false, error: `La contraseña debe tener al menos ${MIN_PASSWORD} caracteres.` }
    }

    const nextRole = data.role !== undefined ? data.role : current.role
    let nextPin = data.pin !== undefined ? (data.pin || null) : current.accessPin
    if (!nextPin && roleUsesBarcodePin(nextRole)) {
      nextPin = generateBarcodePin()
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
        accessPin: nextPin,
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
        role: { notIn: ['athlete', 'deleted'] }
      }
    });

    const attachPermissions = (emps: any[]) => emps.map(e => {
      let permissions: string[] = []
      let cleanSpecialties = e.specialties || ''
      if (e.specialties) {
        try {
          if (e.specialties.startsWith('{')) {
            const parsed = JSON.parse(e.specialties)
            if (Array.isArray(parsed.permissions)) permissions = parsed.permissions
            cleanSpecialties = parsed.text || parsed.specialties || parsed.specialty || ''
          }
        } catch {}
      }
      return { ...e, permissions, specialties: cleanSpecialties }
    })

    // Administrador: ficha completa (incluye PIN para gestionar cajeros), nunca el hash de contraseña.
    if (g.user.role === "admin") {
      return { success: true, employees: attachPermissions(stripSecrets(employees, { keepPin: true })) }
    }
    // Resto del personal: sin salarios, cuentas bancarias, PIN ni datos personales.
    if (isStaff(g.user.role)) {
      return { success: true, employees: attachPermissions(employees.map(e => omitFields(e, EMPLOYEE_PRIVATE_FIELDS))) }
    }
    // Atletas: solo la lista pública de entrenadores (para pedir cambio de entrenador).
    const coaches = employees
      .filter(e => e.role === "coach" || e.role === "employee")
      .map(e => {
        let cleanSpecialties = e.specialties || ''
        if (e.specialties && e.specialties.startsWith('{')) {
          try {
            const parsed = JSON.parse(e.specialties)
            cleanSpecialties = parsed.text || parsed.specialties || parsed.specialty || ''
          } catch {}
        }
        return {
          id: e.id, name: e.name, role: e.role, profilePicture: e.profilePicture,
          specialties: cleanSpecialties, bio: e.bio, socialLinks: e.socialLinks,
        }
      })
    return { success: true, employees: coaches }
  } catch (error: any) {
    return { success: false, error: friendlyError(error), employees: [] }
  }
}

export async function getPublicCoaches() {
  try {
    const coaches = await prisma.user.findMany({
      where: { role: { in: ['coach', 'employee'] } },
      select: { id: true, name: true, specialties: true, profilePicture: true }
    })
    const cleaned = coaches.map((c: any) => {
      let cleanSpecialties = c.specialties || ''
      if (c.specialties && c.specialties.startsWith('{')) {
        try {
          const parsed = JSON.parse(c.specialties)
          cleanSpecialties = parsed.text || parsed.specialties || parsed.specialty || ''
        } catch {}
      }
      return { ...c, specialties: cleanSpecialties }
    })
    return { success: true, coaches: cleaned }
  } catch (error: any) {
    return { success: false, coaches: [] }
  }
}

/**
 * Crea o enlaza un atleta por cédula. Acepta `createAthlete(data)` y `createAthlete(cedula, clave, perfil)`.
 *
 * - Si un cliente NO registrado compró un plan en Recepción/Tienda (usando su cédula) y luego entra a `/registro`
 *   con su misma cédula, el sistema detecta su ficha pre-creada (`PRE_REGISTERED_POS` o sin correo/reclamo),
 *   actualiza sus datos personales y su contraseña elegida, y conserva intacto su plan/membresía ya pagada.
 * - Si el personal de Recepción/Caja inscribe o cobra a una cédula que ya existe, actualiza su membresía/plan sin duplicar usuario.
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

    const rawCedula = String(data.cedula ?? "").trim()
    const cleanCedula = rawCedula.replace(/^[VEJvej]-?/i, "").trim()
    if (!CEDULA_RE.test(cleanCedula)) return { success: false, error: "Cédula no válida." }
    if (!data.name || String(data.name).length > 120) return { success: false, error: "Nombre no válido." }

    let plain: string
    if (staff) {
      plain = data.password && String(data.password).length >= MIN_PASSWORD ? String(data.password) : cleanCedula.padEnd(MIN_PASSWORD, "0")
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

    // Buscar si ya existe un usuario con esa cédula (con o sin prefijo V-/E-/J-)
    const existing = await prisma.user.findFirst({
      where: {
        OR: [
          { cedula: cleanCedula },
          { cedula: rawCedula },
          { cedula: `V-${cleanCedula}` },
          { cedula: `E-${cleanCedula}` }
        ]
      },
      include: {
        memberships: { orderBy: { endDate: 'desc' }, take: 1 }
      }
    })

    if (existing) {
      if (existing.role !== 'athlete') {
        return { success: false, error: "Esta cédula pertenece a un miembro del personal del gimnasio." }
      }

      // Caso 1: El personal de Recepción/Caja está cobrando un plan a una cédula ya registrada
      if (staff) {
        const updatedUser = await prisma.user.update({
          where: { id: existing.id },
          data: {
            cedula: cleanCedula,
            name: data.name || existing.name,
            phone: data.phone || existing.phone,
            address: data.address || existing.address,
            ...(coachId ? { coachId } : {})
          }
        })

        if (data.membershipEnd && !data.skipMembershipCreation && me && isPos(me.role)) {
          await prisma.membership.create({
            data: {
              athleteId: existing.id,
              startDate: new Date(),
              endDate: new Date(data.membershipEnd),
              status: 'ACTIVE',
              planName: data.planName || 'Plan Estándar'
            }
          })
        }

        const safeUpdated = stripSecrets(updatedUser)
        revalidatePath("/atletas")
        revalidatePath("/membresias")
        return { success: true, user: safeUpdated, athlete: safeUpdated, linkedExisting: true }
      }

      // Caso 2: El cliente compró un plan en Recepción antes de registrarse y ahora se registra en /registro con su cédula
      const isPreRegisteredByPos = existing.profession === "PRE_REGISTERED_POS" || !existing.email
      if (!staff && isPreRegisteredByPos) {
        const linkedUser = await prisma.user.update({
          where: { id: existing.id },
          data: {
            cedula: cleanCedula,
            name: data.name,
            password: await bcrypt.hash(plain, 10),
            gender: data.gender || existing.gender || 'M',
            phone: data.phone || existing.phone || null,
            address: data.address || existing.address || null,
            email: data.email || existing.email || null,
            profession: null, // Cuenta ya reclamada y activada por el atleta
            ...(coachId && !existing.coachId ? { coachId } : {})
          }
        })

        const safeLinked = stripSecrets(linkedUser)
        revalidatePath("/atletas")
        revalidatePath("/membresias")
        return { success: true, user: safeLinked, athlete: safeLinked, linkedExisting: true }
      }

      return { success: false, error: "La cédula ya está registrada. Inicia sesión con tu contraseña." }
    }

    const user = await prisma.user.create({
      data: {
        name: data.name,
        cedula: cleanCedula,
        role: 'athlete', // siempre atleta: el rol nunca se toma del cliente
        password: await bcrypt.hash(plain, 10),
        gender: data.gender || 'M',
        ...(coachId ? { coach: { connect: { id: coachId } } } : {}),
        phone: data.phone || null,
        address: data.address || null,
        email: data.email || null,
        profession: staff ? "PRE_REGISTERED_POS" : null,
      }
    });

    // La membresía solo la asigna personal de caja/administración
    if (data.membershipEnd && !data.skipMembershipCreation && me && isPos(me.role)) {
      await prisma.membership.create({
        data: {
          athleteId: user.id,
          startDate: new Date(),
          endDate: new Date(data.membershipEnd),
          status: 'ACTIVE',
          planName: data.planName || 'Plan Estándar'
        }
      })
    }

    const safeCreated = stripSecrets(user)
    revalidatePath("/atletas")
    revalidatePath("/membresias")
    return { success: true, user: safeCreated, athlete: safeCreated }
  } catch (error: any) {
    return { success: false, error: friendlyError(error) }
  }
}

export async function getAthletes() {
  const g = await guard(ROLES.STAFF)
  if (!g.ok) return { success: false, error: g.error, athletes: [] }
  try {
    const whereClause: any = { role: 'athlete' }
    const isCoach = g.user.role === 'coach' || g.user.role === 'employee'
    if (isCoach) {
      whereClause.coachId = g.user.id
    }
    const athletes = await prisma.user.findMany({
      where: whereClause,
      include: {
        memberships: {
          orderBy: { endDate: 'desc' },
          take: 1
        },
        coach: true,
        attendances: {
          orderBy: { date: 'desc' }
        }
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

    // El perfil del administrador está estrictamente protegido y oculto: nadie puede entrar a visualizar al administrador
    if (athlete?.role === 'admin' && g.user.id !== athlete.id) {
      return { success: false, error: "No tienes permiso para ver este perfil." }
    }

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
    const isAdminOrGerente = g.user.role === 'admin' || g.user.role === 'gerente'

    const targetUser = await prisma.user.findUnique({ where: { id } })
    if (!targetUser) return { success: false, error: "Atleta no encontrado." }

    // Validación de contraseña si se proporciona
    let newHashedPassword: string | undefined = undefined
    const plainPwd = data.clave || data.password
    if (plainPwd) {
      if (!isAdminOrGerente && g.user.id !== id) {
        return { success: false, error: "Solo los administradores pueden cambiar la contraseña de otro usuario." }
      }
      if (String(plainPwd).length < MIN_PASSWORD) {
        return { success: false, error: `La contraseña debe tener al menos ${MIN_PASSWORD} caracteres.` }
      }
      newHashedPassword = await bcrypt.hash(String(plainPwd), 10)
    }

    // Validación de cédula si se cambia por staff
    let cleanCedula: string | undefined = undefined
    if (data.cedula && staff) {
      cleanCedula = data.cedula.replace(/\D/g, "").trim()
      if (cleanCedula && cleanCedula !== targetUser.cedula) {
        const existingWithCedula = await prisma.user.findFirst({
          where: {
            id: { not: id },
            OR: [
              { cedula: cleanCedula },
              { cedula: `V-${cleanCedula}` },
              { cedula: `E-${cleanCedula}` }
            ]
          }
        })
        if (existingWithCedula) {
          return { success: false, error: "Ya existe otro usuario registrado con esta cédula." }
        }
      }
    }

    // Resolución segura de coachId si fue proporcionado por staff
    let validCoachId: string | null | undefined = undefined
    if (staff && data.coachId !== undefined) {
      if (data.coachId && String(data.coachId).trim()) {
        const coach = await prisma.user.findFirst({
          where: { id: String(data.coachId).trim(), role: { notIn: ['athlete', 'deleted'] } }
        })
        validCoachId = coach ? coach.id : null
      } else {
        validCoachId = null
      }
    }

    // Un atleta editando su propio perfil solo puede cambiar datos de contacto,
    // nunca su entrenador, cédula ni su membresía.
    const user = await prisma.user.update({
      where: { id },
      data: {
        name: data.name !== undefined ? data.name : targetUser.name,
        gender: data.gender !== undefined ? data.gender : targetUser.gender,
        phone: data.phone !== undefined ? (data.phone || null) : targetUser.phone,
        address: data.address !== undefined ? (data.address || null) : targetUser.address,
        email: data.email !== undefined ? (data.email || null) : targetUser.email,
        ...(cleanCedula ? { cedula: cleanCedula } : {}),
        ...(newHashedPassword ? { password: newHashedPassword } : {}),
        ...(validCoachId !== undefined ? { coachId: validCoachId } : {}),
      }
    });

    // Renovar membresía: solo caja/administración
    if (data.membershipEnd && isPos(g.user.role)) {
      await prisma.membership.create({
         data: {
            athleteId: id,
            startDate: new Date(),
            endDate: new Date(data.membershipEnd),
            status: 'ACTIVE',
            planName: data.planName || data.membershipType || 'Plan Estándar'
         }
      });
    }

    revalidatePath(`/atletas/${id}`)
    revalidatePath("/atletas")
    revalidatePath("/membresias")
    revalidatePath("/finanzas")
    return { success: true, user: stripSecrets(user) }
  } catch (error: any) {
    return { success: false, error: friendlyError(error) }
  }
}

/**
 * Permite a administradores, gerentes y personal autorizado editar directamente la membresía
 * (fechas de inicio y corte, plan) y asignar entrenador a un atleta existente desde el módulo de atletas.
 */
export async function updateAthleteMembershipAndCoach(
  athleteId: string,
  data: {
    startDate?: string | Date | null
    endDate?: string | Date | null
    planName?: string | null
    coachId?: string | null
  }
) {
  const g = await guard(ROLES.STAFF)
  if (!g.ok) return { success: false, error: g.error }
  try {
    const athlete = await prisma.user.findUnique({
      where: { id: athleteId },
      include: {
        memberships: { orderBy: { endDate: 'desc' }, take: 1 }
      }
    })
    if (!athlete) return { success: false, error: "Atleta no encontrado." }

    // Validación y resolución segura de entrenador
    let coachIdToSet: string | null = athlete.coachId
    if (data.coachId !== undefined) {
      if (data.coachId && String(data.coachId).trim()) {
        const coach = await prisma.user.findFirst({
          where: { id: String(data.coachId).trim(), role: { notIn: ['athlete', 'deleted'] } }
        })
        coachIdToSet = coach ? coach.id : null
      } else {
        coachIdToSet = null
      }
    }

    // Actualizar entrenador en el usuario
    await prisma.user.update({
      where: { id: athleteId },
      data: { coachId: coachIdToSet }
    })

    // Actualizar o crear membresía si se proporcionan fechas
    if (data.endDate) {
      const rawEnd = String(data.endDate).trim()
      let eDate: Date | null = null
      if (rawEnd.length === 10 && /^\d{4}-\d{2}-\d{2}$/.test(rawEnd)) {
        const [y, m, d] = rawEnd.split('-').map(Number)
        eDate = new Date(Date.UTC(y, m - 1, d, 23, 59, 59))
      } else {
        const parsed = new Date(rawEnd)
        if (!isNaN(parsed.getTime())) eDate = parsed
      }

      if (!eDate || isNaN(eDate.getTime())) {
        return { success: false, error: "La fecha de corte / vencimiento ingresada no es válida." }
      }

      let sDate = new Date()
      if (data.startDate) {
        const rawStart = String(data.startDate).trim()
        if (rawStart.length === 10 && /^\d{4}-\d{2}-\d{2}$/.test(rawStart)) {
          const [y, m, d] = rawStart.split('-').map(Number)
          sDate = new Date(Date.UTC(y, m - 1, d, 0, 0, 0))
        } else {
          const parsed = new Date(rawStart)
          if (!isNaN(parsed.getTime())) sDate = parsed
        }
      }

      const pName = data.planName?.trim() || "Plan Estándar"
      const status = eDate.getTime() > Date.now() ? "ACTIVE" : "EXPIRED"

      const latestMembership = athlete.memberships?.[0]
      if (latestMembership) {
        await prisma.membership.update({
          where: { id: latestMembership.id },
          data: {
            startDate: sDate,
            endDate: eDate,
            planName: pName,
            status
          }
        })
      } else {
        await prisma.membership.create({
          data: {
            athleteId,
            startDate: sDate,
            endDate: eDate,
            planName: pName,
            status
          }
        })
      }
    }

    await audit("athlete.membership_direct_edit", g.user, {
      athleteId,
      startDate: data.startDate,
      endDate: data.endDate,
      planName: data.planName,
      coachId: coachIdToSet
    })

    revalidatePath(`/atletas/${athleteId}`)
    revalidatePath("/atletas")
    revalidatePath("/membresias")
    revalidatePath("/finanzas")

    return { success: true }
  } catch (error: any) {
    console.error("Error updating athlete membership and coach:", error)
    return { success: false, error: error?.message || friendlyError(error) }
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

    const cleanQuery = query.trim()

    // Buscar al usuario por cédula o por id (tanto si escanea QR de cédula o QR de ID)
    let user = await prisma.user.findFirst({
      where: isCedula 
        ? { cedula: cleanQuery } 
        : { OR: [{ id: cleanQuery }, { cedula: cleanQuery }] },
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

    if (user.role === 'athlete' && user.memberships.length === 0) {
      // Buscar si tuvo alguna membresía anterior para distinguir entre "Sin membresía" y "Membresía vencida"
      const lastMembership = await prisma.membership.findFirst({
        where: { athleteId: user.id },
        orderBy: { endDate: 'desc' }
      })

      const isExpired = !!lastMembership?.endDate
      return {
        success: false,
        error: isExpired ? 'Membresía Vencida' : 'Atleta no tiene membresía activa',
        lastDate: lastMembership?.endDate,
        user: {
          name: user.name,
          profilePicture: user.profilePicture,
          membershipEnd: lastMembership?.endDate
        }
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
        profilePicture: user.profilePicture,
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
        athlete: { select: { id: true, name: true, cedula: true, profilePicture: true, coachId: true, coach: { select: { name: true } } } },
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
  const me = await getAuthUser()
  if (!me || me.id !== athleteId) {
    return { success: false, error: "Solo el propio usuario puede modificar su foto de perfil." }
  }
  try {
    if (!base64Image || typeof base64Image !== "string" || !base64Image.startsWith("data:image/")) {
      return { success: false, error: "Formato de imagen no válido." }
    }
    if (base64Image.length > 2_000_000) {
      return { success: false, error: "La imagen es demasiado pesada." }
    }

    // Guardamos la imagen comprimida directamente en MySQL (User.profilePicture) como data URI
    // para que persista al 100% al cerrar sesión, reloguear o reiniciar el contenedor en Coolify.
    try {
      await prisma.user.update({
        where: { id: athleteId },
        data: { profilePicture: base64Image }
      })
    } catch (dbErr: any) {
      // Auto-migración segura si la columna en MySQL aún es TEXT (64KB) y la imagen supera ese límite
      await prisma.$executeRawUnsafe("ALTER TABLE `User` MODIFY COLUMN `profilePicture` LONGTEXT NULL").catch(() => {})
      await prisma.user.update({
        where: { id: athleteId },
        data: { profilePicture: base64Image }
      })
    }

    revalidatePath("/atletas")
    revalidatePath("/atletas/" + athleteId)
    revalidatePath("/mis-atletas")
    revalidatePath("/membresias")
    revalidatePath("/finanzas")
    revalidatePath("/tienda")
    revalidatePath("/asistencia")
    revalidatePath("/comunidad")
    revalidatePath("/perfil")
    revalidatePath("/")

    return { success: true, profilePicture: base64Image }
  } catch (error: any) {
    console.error("updateProfilePicture error:", error)
    return { success: false, error: error?.message || "No se pudo guardar la imagen en la base de datos." }
  }
}

export async function removeProfilePicture(athleteId: string) {
  const me = await getAuthUser()
  if (!me || me.id !== athleteId) {
    return { success: false, error: "Solo el propio usuario puede modificar su foto de perfil." }
  }
  try {
    await prisma.user.update({
      where: { id: athleteId },
      data: { profilePicture: null }
    })
    revalidatePath("/atletas")
    revalidatePath("/atletas/" + athleteId)
    revalidatePath("/perfil")
    revalidatePath("/comunidad")
    revalidatePath("/")
    return { success: true }
  } catch (error: any) {
    console.error("removeProfilePicture error:", error)
    return { success: false, error: error?.message || "No se pudo eliminar la foto de perfil." }
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

export async function getMyProfileDetailsAction() {
  const me = await getAuthUser()
  if (!me) return { success: false, error: "No autorizado" }
  try {
    const user = await prisma.user.findUnique({
      where: { id: me.id },
      select: {
        id: true,
        name: true,
        cedula: true,
        role: true,
        profilePicture: true,
        bio: true,
        socialLinks: true,
        specialties: true,
        phone: true,
        email: true,
      }
    })
    return { success: true, user }
  } catch (error: any) {
    return { success: false, error: friendlyError(error) }
  }
}

export async function getCoachesWithAthletesAction() {
  const g = await guard(ROLES.STAFF)
  if (!g.ok) return { success: false, error: g.error, coaches: [] }
  try {
    const coaches = await prisma.user.findMany({
      where: {
        role: { in: ["coach", "employee"] },
        NOT: { role: "deleted" }
      },
      select: {
        id: true,
        name: true,
        cedula: true,
        role: true,
        profilePicture: true,
        specialties: true,
        bio: true,
        phone: true,
        email: true,
        createdAt: true,
        attendances: {
          orderBy: { date: "desc" },
          select: {
            id: true,
            date: true,
          }
        },
        coachedAthletes: {
          where: { NOT: { role: "deleted" } },
          select: {
            id: true,
            name: true,
            cedula: true,
            phone: true,
            profilePicture: true,
            createdAt: true,
            memberships: {
              orderBy: { endDate: "desc" },
              take: 1,
              select: {
                id: true,
                planName: true,
                startDate: true,
                endDate: true,
                status: true
              }
            },
            attendances: {
              orderBy: { date: "desc" },
              select: {
                id: true,
                date: true
              }
            }
          }
        }
      },
      orderBy: { name: "asc" }
    })

    const mappedCoaches = coaches.map((c: any) => {
      let permissions: string[] = []
      let cleanSpecialties = c.specialties || ''
      if (c.specialties) {
        try {
          if (c.specialties.startsWith('{')) {
            const parsed = JSON.parse(c.specialties)
            if (Array.isArray(parsed.permissions)) permissions = parsed.permissions
            cleanSpecialties = parsed.text || parsed.specialties || parsed.specialty || ''
          }
        } catch {}
      }
      return {
        ...c,
        permissions,
        specialties: cleanSpecialties
      }
    })

    return { success: true, coaches: stripSecrets(mappedCoaches) }
  } catch (error: any) {
    console.error("getCoachesWithAthletesAction error:", error)
    return { success: false, error: friendlyError(error), coaches: [] }
  }
}

export async function updateEmployeePermissionsAction(userId: string, permissions: string[]) {
  const g = await guard(ROLES.ADMIN)
  if (!g.ok) return { success: false, error: g.error }
  try {
    const target = await prisma.user.findUnique({ where: { id: userId } })
    if (!target) return { success: false, error: "Usuario no encontrado" }

    let dataObj: any = {}
    if (target.specialties) {
      try {
        if (target.specialties.startsWith('{')) {
          dataObj = JSON.parse(target.specialties)
        } else {
          dataObj = { text: target.specialties }
        }
      } catch {
        dataObj = { text: target.specialties }
      }
    }
    dataObj.permissions = permissions

    await prisma.user.update({
      where: { id: userId },
      data: { specialties: JSON.stringify(dataObj) }
    })

    revalidatePath("/empleados")
    revalidatePath("/ajustes")
    revalidatePath("/entrenadores")
    revalidatePath("/")
    return { success: true }
  } catch (error: any) {
    return { success: false, error: friendlyError(error) }
  }
}
