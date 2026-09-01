"use client"

import { useAuth } from "@/lib/auth-context"
import { AdminDashboard } from "@/components/dashboards/admin-dashboard"
import { AthleteDashboard } from "@/components/dashboards/athlete-dashboard"
import { CoachDashboard } from "@/components/dashboards/coach-dashboard"
import { ReceptionDashboard } from "@/components/dashboards/reception-dashboard"

export default function DashboardPage() {
  const { user, isLoading } = useAuth()

  if (isLoading) return null

  if (user?.role === 'admin') return <AdminDashboard />
  if (user?.role === 'athlete') return <AthleteDashboard />
  
  // Recepción / Cajero
  if (user?.role === 'cajero' || user?.permissions?.includes('POS_ACCESS') && !user?.permissions?.includes('CRM_MANAGE')) {
    return <ReceptionDashboard />
  }

  // Por defecto (Entrenador)
  return <CoachDashboard />
}
