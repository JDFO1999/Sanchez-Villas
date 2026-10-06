"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'
import { loginAction, logoutAction } from '@/app/actions/auth'
import { getAthleteById } from '@/app/actions/users'
import { createEmployee, updateEmployee, getAllEmployees, createAthlete, updateAthlete } from '@/app/actions/users'
import { askPassword } from '@/lib/confirm'
import { showSweetToast } from '@/lib/toast-context'

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
  logout: () => Promise<void>
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
    async function loadSession() {
      const { getSessionData } = await import('@/app/actions/auth')
      const sessionRes = await getSessionData()
      
      if (sessionRes.success && sessionRes.user) {
        setUser(sessionRes.user as any)
      } else {
        // Sin cookie de sesión válida no hay usuario. Se limpia cualquier id viejo guardado en el navegador.
        localStorage.removeItem('gympro_session_id')
      }
      setIsLoading(false)
    }
    loadSession()
  }, [])

  const loginFn = async (cedula: string, clave: string) => {
    const res = await loginAction(cedula, clave)
    if (res.success && ((res as any).user || (res as any).athlete)) {
      setUser(((res as any).user || (res as any).athlete) as unknown as User)
      localStorage.setItem('gympro_session_id', ((res as any).user || (res as any).athlete).id)
      return true
    }
    return false
  }

  const logout = async () => {
    try {
      // Borra la cookie httpOnly "session"; sin esto el middleware sigue viendo la sesión y redirige /login -> /
      await logoutAction()
    } finally {
      localStorage.removeItem('gympro_session_id')
      setUser(null)
      // Navegación completa: reinicia el estado del cliente y el middleware ve la cookie ya borrada
      window.location.assign('/login')
    }
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
    return res.success ? res.employees as unknown as User[] : []
  }

  /**
   * Ejecuta una acción de personal. Si el servidor pide la contraseña del administrador (acción delicada)
   * se muestra un cuadro para escribirla y se reintenta; los errores se muestran al usuario.
   */
  const runWithAdminPassword = async (
    run: (adminPassword?: string) => Promise<any>,
    title: string
  ): Promise<boolean> => {
    let res = await run()
    let error: string | undefined
    for (let attempt = 0; attempt < 3 && res && res.needsPassword; attempt++) {
      const pwd = await askPassword({ title, text: 'Por seguridad, escribe la contraseña de tu cuenta.', error })
      if (pwd === null) return false // canceló
      res = await run(pwd)
      error = res?.needsPassword ? res.error : undefined
    }
    if (!res?.success) {
      showSweetToast(res?.error || 'No se pudo completar la operación.', 'error')
      return false
    }
    return true
  }

  const addEmployeeFn = async (data: Partial<User> & { pin?: string }, clave: string) => {
    // Si ya trae un pin (por ejemplo, el código de barras autogenerado de 11 dígitos), usamos ese.
    // Si no, y es cajero, generamos uno de 4 dígitos (fallback legacy) o de 11.
    const pin = data.pin || (data as any).accessPin || ((data.role === 'cajero' || data.permissions?.includes('POS_ACCESS')) 
      ? Math.floor(10000000000 + Math.random() * 90000000000).toString().slice(0, 11)
      : undefined);
      
    await runWithAdminPassword(
      (pwd) => createEmployee({ ...data, clave, pin }, pwd),
      'Confirma tu contraseña para crear al empleado'
    )
  }

  const updateEmployeeFn = async (userId: string, data: Partial<User>) => {
    await runWithAdminPassword(
      (pwd) => updateEmployee(userId, data, pwd),
      'Confirma tu contraseña para guardar los cambios'
    )
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      login: loginFn, 
      logout, 
      registerAthlete: createAthlete as any, 
      adminUpdateAthleteCredentials: updateAthlete as any,
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
