"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'

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
  
  // Datos extendidos de Empleados
  birthDate?: string
  profession?: string
  courses?: string
  specialty?: string
  bankAccount?: string
  mobilePayment?: string
  
  baseSalary?: number
  commissionRate?: number // Monto o porcentaje por atleta
  commissionType?: 'flat' | 'percentage' // Tipo de comisión
  lastPaidDate?: string // Para registrar la última vez que se pagó
}

// Mock Database of users
export const mockUsers: User[] = [
  { id: '1', name: 'Admin Principal', email: 'admin@gympro.com', role: 'admin', cedula: '1234', permissions: ['POS_ACCESS', 'INVENTORY_MANAGE', 'SALES_VIEW', 'CRM_MANAGE'] },
  { id: '2', name: 'Recepción Maria', email: 'maria@gympro.com', role: 'cajero', cedula: '5678', permissions: ['POS_ACCESS', 'SALES_VIEW', 'CRM_MANAGE'] },
  { id: '4', name: 'Entrenador Carlos', email: 'carlos@gympro.com', role: 'employee', cedula: '4444', permissions: [] },
  { id: '3', name: 'Atleta Juan', email: 'juan@atleta.com', role: 'athlete', cedula: '9012' }
]

const mockPasswords: Record<string, string> = {
  '1234': 'admin',
  '5678': 'recepcion',
  '4444': 'entrenador',
  '9012': 'atleta'
}

interface AuthContextType {
  user: User | null
  login: (cedula: string, clave: string) => boolean
  logout: () => void
  registerAthlete: (cedula: string, clave: string, profile: any) => User | false
  adminUpdateAthleteCredentials: (oldCedula: string, newCedula: string, newName: string, newClave: string) => boolean
  updateEmployeePermissions: (userId: string, permissions: Permission[]) => void
  getAllEmployees: () => User[]
  addEmployee: (employeeData: Partial<User>, clave: string) => void
  updateEmployee: (userId: string, employeeData: Partial<User>) => void
  
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
    // Check localStorage on mount
    const storedUser = localStorage.getItem('gympro_mock_user')
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch (e) {
        console.error("Failed to parse user from local storage", e)
      }
    }
    setIsLoading(false)
  }, [])

  const registerAthlete = (cedula: string, clave: string, profile: any) => {
    // Check if exists
    const users = JSON.parse(localStorage.getItem('gympro_mock_users') || JSON.stringify(mockUsers))
    const passwords = JSON.parse(localStorage.getItem('gympro_mock_passwords') || JSON.stringify(mockPasswords))
    
    if (users.find((u: User) => u.cedula === cedula)) {
      return false // Ya existe
    }

    const newUser: User = {
      id: Date.now().toString(),
      cedula,
      name: profile.name,
      email: `${cedula}@atleta.com`,
      role: 'athlete'
    }

    users.push(newUser)
    passwords[cedula] = clave
    
    localStorage.setItem('gympro_mock_users', JSON.stringify(users))
    localStorage.setItem('gympro_mock_passwords', JSON.stringify(passwords))

    return newUser
  }

  const adminUpdateAthleteCredentials = (oldCedula: string, newCedula: string, newName: string, newClave: string) => {
    const users = JSON.parse(localStorage.getItem('gympro_mock_users') || JSON.stringify(mockUsers))
    const passwords = JSON.parse(localStorage.getItem('gympro_mock_passwords') || JSON.stringify(mockPasswords))
    
    const userIndex = users.findIndex((u: User) => u.cedula === oldCedula)
    if (userIndex >= 0) {
      users[userIndex].cedula = newCedula
      users[userIndex].name = newName
      if (oldCedula !== newCedula) {
        delete passwords[oldCedula]
      }
      if (newClave) {
        passwords[newCedula] = newClave
      } else if (oldCedula !== newCedula) {
        passwords[newCedula] = passwords[oldCedula] // keep old pass
      }

      localStorage.setItem('gympro_mock_users', JSON.stringify(users))
      localStorage.setItem('gympro_mock_passwords', JSON.stringify(passwords))
      return true
    }
    return false
  }

  const login = (cedula: string, clave: string) => {
    const users = JSON.parse(localStorage.getItem('gympro_mock_users') || JSON.stringify(mockUsers))
    const passwords = JSON.parse(localStorage.getItem('gympro_mock_passwords') || JSON.stringify(mockPasswords))
    
    const mockUser = users.find((u: User) => u.cedula === cedula)
    
    if (mockUser && passwords[cedula] === clave) {
      setUser(mockUser)
      localStorage.setItem('gympro_mock_user', JSON.stringify(mockUser))
      return true
    }
    return false
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('gympro_mock_user')
  }

  const updateEmployeePermissions = (userId: string, permissions: Permission[]) => {
    const users = JSON.parse(localStorage.getItem('gympro_mock_users') || JSON.stringify(mockUsers))
    const index = users.findIndex((u: User) => u.id === userId)
    if (index >= 0) {
      users[index].permissions = permissions
      localStorage.setItem('gympro_mock_users', JSON.stringify(users))
      // If we are updating ourselves, update state
      if (user?.id === userId) {
        const updatedUser = { ...user, permissions }
        setUser(updatedUser)
        localStorage.setItem('gympro_mock_user', JSON.stringify(updatedUser))
      }
    }
  }

  const getAllEmployees = (): User[] => {
    if (typeof window === "undefined") return []
    const users = JSON.parse(localStorage.getItem('gympro_mock_users') || JSON.stringify(mockUsers))
    return users.filter((u: User) => u.role === 'employee' || u.role === 'admin')
  }

  const addEmployee = (employeeData: Partial<User>, clave: string) => {
    const users = JSON.parse(localStorage.getItem('gympro_mock_users') || JSON.stringify(mockUsers))
    const passwords = JSON.parse(localStorage.getItem('gympro_mock_passwords') || JSON.stringify(mockPasswords))
    
    if (employeeData.cedula && users.find((u: User) => u.cedula === employeeData.cedula)) {
      alert("La cédula ya está registrada.")
      return;
    }

    const newUser: User = {
      id: `EMP-${Date.now()}`,
      name: employeeData.name || '',
      email: employeeData.email || '',
      cedula: employeeData.cedula || '',
      role: employeeData.role || 'employee',
      permissions: employeeData.role === 'admin' ? ['POS_ACCESS', 'INVENTORY_MANAGE', 'SALES_VIEW', 'CRM_MANAGE', 'FINANCE_VIEW', 'FINANCE_MANAGE', 'SETTINGS_MANAGE', 'STAFF_MANAGE'] : ['POS_ACCESS'],
      ...employeeData
    } as User

    users.push(newUser)
    if (clave) {
      passwords[newUser.cedula] = clave
    }
    localStorage.setItem('gympro_mock_users', JSON.stringify(users))
    localStorage.setItem('gympro_mock_passwords', JSON.stringify(passwords))
  }

  const updateEmployee = (userId: string, employeeData: Partial<User>) => {
    const users = JSON.parse(localStorage.getItem('gympro_mock_users') || JSON.stringify(mockUsers))
    const index = users.findIndex((u: User) => u.id === userId)
    if (index >= 0) {
      users[index] = { ...users[index], ...employeeData }
      localStorage.setItem('gympro_mock_users', JSON.stringify(users))
      if (user?.id === userId) {
        setUser(users[index])
        localStorage.setItem('gympro_mock_user', JSON.stringify(users[index]))
      }
    }
  }

  const getCustomRoles = (): CustomRoleDef[] => {
    if (typeof window === "undefined") return []
    const stored = JSON.parse(localStorage.getItem('gympro_custom_roles') || "[]")
    if (stored.length === 0) {
      return [
        { id: 'admin', name: 'Administrador Principal', permissions: ['POS_ACCESS', 'INVENTORY_MANAGE', 'SALES_VIEW', 'CRM_MANAGE', 'FINANCE_VIEW', 'FINANCE_MANAGE', 'SETTINGS_MANAGE', 'STAFF_MANAGE'] },
        { id: 'employee', name: 'Entrenador Base', permissions: ['POS_ACCESS', 'CRM_MANAGE'] },
        { id: 'cajero', name: 'Cajero / Recepción', permissions: ['POS_ACCESS', 'SALES_VIEW'] }
      ]
    }
    return stored
  }

  const addCustomRole = (role: CustomRoleDef) => {
    const roles = getCustomRoles()
    const existingIndex = roles.findIndex(r => r.id === role.id)
    if (existingIndex >= 0) {
      roles[existingIndex] = role
    } else {
      roles.push(role)
    }
    localStorage.setItem('gympro_custom_roles', JSON.stringify(roles))
  }

  const deleteCustomRole = (roleId: string) => {
    const roles = getCustomRoles().filter(r => r.id !== roleId)
    localStorage.setItem('gympro_custom_roles', JSON.stringify(roles))
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading, registerAthlete, adminUpdateAthleteCredentials, updateEmployeePermissions, getAllEmployees, addEmployee, updateEmployee, getCustomRoles, addCustomRole, deleteCustomRole }}>
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
