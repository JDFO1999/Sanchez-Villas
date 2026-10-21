"use client"

import { useAuth } from "@/lib/auth-context"
import { AdminDashboard } from "@/components/dashboards/admin-dashboard"
import { AthleteDashboard } from "@/components/dashboards/athlete-dashboard"
import { CoachDashboard } from "@/components/dashboards/coach-dashboard"
import { ReceptionDashboard } from "@/components/dashboards/reception-dashboard"
import { GymLandingPage } from "@/components/landing/gym-landing-page"

export default function HomePage() {
  const { user, isLoading } = useAuth()

  if (isLoading) return null

  // Si no hay usuario logueado, mostrar la Página Principal Promocional del Gimnasio
  if (!user) {
    return <GymLandingPage />
  }

  // 1. Atleta: visualiza su panel personal de atleta
  if (user?.role === 'athlete') {
    return <AthleteDashboard />
  }

  // 2. Validación estricta: un Coach NUNCA puede ver finanzas ni el Dashboard de Administrador
  const isCoach = user?.role === 'coach' || user?.role === 'employee'

  // 3. El dashboard de Administrador lo ve el Administrador, el Gerente y quien tenga el módulo de Finanzas activo (excepto coach)
  const hasFinanceActive = Boolean(
    user?.permissions?.includes('FINANCE_MANAGE') ||
    user?.permissions?.includes('FINANCE_VIEW')
  )
  const canViewAdminDashboard = !isCoach && (
    user?.role === 'admin' ||
    user?.role === 'gerente' ||
    hasFinanceActive
  )

  if (canViewAdminDashboard) {
    return <AdminDashboard />
  }

  // 4. Entrenador Oficial: visualiza exclusivamente el CoachDashboard
  if (isCoach) {
    return <CoachDashboard />
  }

  // 5. Recepción, Cajero y personal de atención: visualizan el ReceptionDashboard
  return <ReceptionDashboard />
}

