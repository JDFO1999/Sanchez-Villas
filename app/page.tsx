"use client"

import { useAuth } from "@/lib/auth-context"
import { AdminDashboard } from "@/components/dashboards/admin-dashboard"
import { AthleteDashboard } from "@/components/dashboards/athlete-dashboard"
import { EmployeeDashboard } from "@/components/dashboards/employee-dashboard"

export default function DashboardPage() {
  const { user, isLoading } = useAuth()

  if (isLoading) return null

  if (user?.role === 'admin') return <AdminDashboard />
  if (user?.role === 'employee') return <EmployeeDashboard />
  if (user?.role === 'athlete') return <AthleteDashboard />

  return null
}
