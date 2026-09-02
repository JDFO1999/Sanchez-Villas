"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'
import { loginAction, getUserById } from '@/app/actions/auth'
import { createEmployee, updateEmployee, getAllEmployees, createAthlete, updateAthlete } from '@/app/actions/users'

export type Role = string | null
export type Permission = 'POS_ACCESS' | 'INVENTORY_MANAGE' | 'SALES_VIEW' | 'CRM_MANAGE' | 'FINANCE_VIEW' | 'FINANCE_MANAGE' | 'SETTINGS_MANAGE' | 'STAFF_MANAGE'

export interface CustomRoleDef {
  id: string
  name: string
  permissions: Permission[]
}

export interface User {
  id: string
  name: string
  email: string
  role: Role
  cedula: string
  avatar?: string
  permissions?: Permission[]
  
  pin?: string // PIN generado automáticamente (para cajero/recepción)

  // Datos extendidos de Empleados
  birthDate?: string
  profession?: string
  courses?: string
  specialty?: string
  bankAccount?: string
  mobilePayment?: string
  
  baseSalary?: number
  commissionRate?: number
  commissionType?: 'flat' | 'percentage'
  lastPaidDate?: string
}

interface AuthContextType {
  user: User | null
  login: (cedula: string, clave: string) => Promise<boolean>
  logout: () => void
  registerAthlete: (cedula: string, clave: string, profile: any) => Promise<User | false>
  adminUpdateAthleteCredentials: (oldCedula: string, newCedula: string, newName: string, newClave: string) => Promise<boolean>
  updateEmployeePermissions: (userId: string, permissions: Permission[]) => void
  getAllEmployees: () => Promise<User[]>
  addEmployee: (employeeData: Partial<User>, clave: string) => Promise<void>
  updateEmployee: (userId: string, employeeData: Partial<User>) => Promise<void>
  
  getCustomRoles: () => CustomRoleDef[]
  addCustomRole: (role: CustomRoleDef) => void
  deleteCustomRole: (roleId: string) => void
  
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadUser() {
      const storedUserId = localStorage.getItem('gympro_session_id')
      if (storedUserId) {
        const res = await getUserById(storedUserId)
        if (res.success && res.user) {
          setUser(res.user as User)
        } else {
          localStorage.removeItem('gympro_session_id')
        }
      }
      setIsLoading(false)
    }
    loadUser()
  }, [])

  const registerAthlete = async (cedula: string, clave: string, profile: any) => {
    const res = await createAthlete({ cedula, password: clave, name: profile.name, gender: profile.gender || 'M' })
    if (res.success && res.user) {
      return res.user as User
    }
    return false
  }

  const adminUpdateAthleteCredentials = async (oldCedula: string, newCedula: string, newName: string, newClave: string) => {
    // This is problematic without knowing the athlete ID, but for now we just return false if not supported 
    // In a real app we'd fetch by cedula and then update.
    return false; // Will replace later if needed
  }

  const loginFn = async (cedula: string, clave: string) => {
    const res = await loginAction(cedula, clave)
    if (res.success && res.user) {
      setUser(res.user as User)
      localStorage.setItem('gympro_session_id', res.user.id)
      return true
    }
    return false
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('gympro_session_id')
    window.location.href = '/login'
  }

  // Permisos (We keep these local for simplicity if not in DB yet)
  const [customRoles, setCustomRoles] = useState<CustomRoleDef[]>([])

  const getCustomRoles = () => customRoles
  const addCustomRole = (r: CustomRoleDef) => setCustomRoles([...customRoles, r])
  const deleteCustomRole = (id: string) => setCustomRoles(customRoles.filter(cr => cr.id !== id))
  const updateEmployeePermissions = (userId: string, permissions: Permission[]) => {}

  // Empleados
  const getAllEmployeesFn = async () => {
    const res = await getAllEmployees()
    return res.success ? res.employees as User[] : []
  }

  const addEmployeeFn = async (data: Partial<User>, clave: string) => {
    const pin = (data.role === 'cajero' || data.permissions?.includes('POS_ACCESS')) 
      ? Math.floor(1000 + Math.random() * 9000).toString() 
      : undefined;
      
    await createEmployee({ ...data, clave, pin })
  }

  const updateEmployeeFn = async (userId: string, data: Partial<User>) => {
    await updateEmployee(userId, data)
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      login: loginFn, 
      logout, 
      registerAthlete, 
      adminUpdateAthleteCredentials,
      updateEmployeePermissions,
      getAllEmployees: getAllEmployeesFn,
      addEmployee: addEmployeeFn,
      updateEmployee: updateEmployeeFn,
      getCustomRoles,
      addCustomRole,
      deleteCustomRole,
      isLoading 
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
