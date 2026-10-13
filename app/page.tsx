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

  // Si el usuario está autenticado, renderizar su panel de control correspondiente
  if (user?.role === 'admin') return <AdminDashboard />
  if (user?.role === 'athlete') return <AthleteDashboard />
  
  // Recepción / Cajero
  if (user?.role === 'cajero' || (user?.permissions?.includes('POS_ACCESS') && !user?.permissions?.includes('CRM_MANAGE'))) {
    return <ReceptionDashboard />
  }

  // Por defecto (Entrenador)
  return <CoachDashboard />
}

