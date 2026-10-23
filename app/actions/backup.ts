"use server"

import prisma from "@/lib/db"
import { guard, ROLES, verifyActorPassword } from "@/lib/authz"

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

/**
 * Exporta un respaldo completo de la base de datos en formato JSON.
 * Requiere estrictamente rol 'admin', ser el Super Administrador (C.I. 26710825 o admin principal),
 * y la confirmación de la contraseña del Super Administrador.
 */
export async function exportDatabaseBackupAction(adminPassword?: string) {
  const g = await guard(ROLES.ADMIN)
  if (!g.ok) {
    return { success: false, error: "No autorizado para realizar respaldos del sistema." }
  }

  try {
    const superAdmin = await getSuperAdminUser()
    const isSuperAdmin = superAdmin && (g.user.id === superAdmin.id || g.user.cedula === superAdmin.cedula || g.user.cedula === "26710825")

    if (!isSuperAdmin) {
      return { 
        success: false, 
        error: "Acceso denegado. La descarga de respaldos está restringida exclusivamente al Super Administrador principal." 
      }
    }

    // Comprobación de seguridad: contraseña del Super Administrador obligatoria
    if (!adminPassword || typeof adminPassword !== "string") {
      return { 
        success: false, 
        needsPassword: true, 
        error: "Debes ingresar tu contraseña de Super Administrador para autorizar el respaldo." 
      }
    }

    const stepUp = await verifyActorPassword(g.user.id, adminPassword)
    if (!stepUp.ok) {
      return { success: false, needsPassword: true, error: stepUp.error }
    }

    // Obtener configuración del sistema para el nombre del gimnasio
    const systemSetting = await prisma.systemSetting.findUnique({ where: { id: "default" } })
    let appName = "Maximum Evolution Fit"
    try {
      if (systemSetting?.data) {
        const parsed = JSON.parse(systemSetting.data)
        if (parsed.appName) appName = parsed.appName
      }
    } catch (_) {}

    // Extraer todas las tablas del gimnasio en paralelo
    const [
      users,
      memberships,
      biometrics,
      attendances,
      products,
      transactions,
      transactionItems,
      expenses,
      recurringExpenses,
      payrollReceipts,
      cashSessions,
      coachRequests,
      routines,
      routineExercises,
      exerciseProgresses,
      dietAssignments,
      systemSettings,
      communityPosts,
      communityReactions,
      communityChallenges,
      communityChallengeParticipants,
    ] = await Promise.all([
      prisma.user.findMany({ orderBy: { createdAt: "asc" } }),
      prisma.membership.findMany({ orderBy: { createdAt: "asc" } }),
      prisma.biometric.findMany({ orderBy: { date: "asc" } }),
      prisma.attendance.findMany({ orderBy: { date: "asc" } }),
      prisma.product.findMany({ orderBy: { createdAt: "asc" } }),
      prisma.transaction.findMany({ orderBy: { date: "asc" } }),
      prisma.transactionItem.findMany(),
      prisma.expense.findMany({ orderBy: { date: "asc" } }),
      prisma.recurringExpense.findMany(),
      prisma.payrollReceipt.findMany({ orderBy: { date: "asc" } }),
      prisma.cashSession.findMany({ orderBy: { startTime: "asc" } }),
      prisma.coachRequest.findMany({ orderBy: { createdAt: "asc" } }),
      prisma.routine.findMany({ orderBy: { createdAt: "asc" } }),
      prisma.routineExercise.findMany(),
      prisma.exerciseProgress.findMany({ orderBy: { date: "asc" } }),
      prisma.dietAssignment.findMany({ orderBy: { createdAt: "asc" } }),
      prisma.systemSetting.findMany(),
      prisma.communityPost.findMany({ orderBy: { createdAt: "asc" } }),
      prisma.communityReaction.findMany(),
      prisma.communityChallenge.findMany({ orderBy: { createdAt: "asc" } }),
      prisma.communityChallengeParticipant.findMany(),
    ])

    // Sanitizar contraseñas y pines sensibles en el backup para máxima seguridad
    const sanitizedUsers = users.map(u => ({
      ...u,
      password: "[PROTECTED_HASH]",
      accessPin: u.accessPin ? "[PROTECTED_PIN]" : null
    }))

    const stats = {
      usuarios: users.length,
      atletas: users.filter(u => u.role === "athlete").length,
      empleados: users.filter(u => u.role !== "athlete").length,
      membresias: memberships.length,
      asistencias: attendances.length,
      productos: products.length,
      transacciones: transactions.length,
      rutinas: routines.length,
      dietas: dietAssignments.length,
      gastos: expenses.length,
      nominaRecibos: payrollReceipts.length,
    }

    const backupPayload = {
      meta: {
        sistema: "MaximumFitAPP - Sistema de Gestión de Gimnasio",
        appName,
        version: "2.0.0",
        formato: "JSON_COMPLETE_BACKUP",
        fechaExportacion: new Date().toISOString(),
        generadoPor: `${g.user.name} (C.I. ${g.user.cedula})`,
        rolAutorizado: "Super Administrador",
        resumenRegistros: stats,
      },
      data: {
        users: sanitizedUsers,
        memberships,
        biometrics,
        attendances,
        products,
        transactions,
        transactionItems,
        expenses,
        recurringExpenses,
        payrollReceipts,
        cashSessions,
        coachRequests,
        routines,
        routineExercises,
        exerciseProgresses,
        dietAssignments,
        systemSettings,
        communityPosts,
        communityReactions,
        communityChallenges,
        communityChallengeParticipants,
      }
    }

    const jsonString = JSON.stringify(backupPayload, null, 2)
    const dateStamp = new Date().toISOString().slice(0, 10).replace(/-/g, "")
    const timeStamp = new Date().toTimeString().slice(0, 5).replace(/:/g, "")
    const filename = `backup_${appName.toLowerCase().replace(/[^a-z0-9]/g, "_")}_${dateStamp}_${timeStamp}.json`

    return {
      success: true,
      filename,
      stats,
      backupData: jsonString,
    }
  } catch (error: any) {
    console.error("Error al generar respaldo de la base de datos:", error)
    return {
      success: false,
      error: error?.message || "Ocurrió un error inesperado al generar el respaldo de datos.",
    }
  }
}
