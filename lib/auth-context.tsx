"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'

export type Role = 'admin' | 'employee' | 'athlete' | null
export type Permission = 'POS_ACCESS' | 'INVENTORY_MANAGE' | 'SALES_VIEW' | 'CRM_MANAGE'

export interface User {
  id: string
  name: string
  email: string
  role: Role
  cedula: string
  avatar?: string
  permissions?: Permission[]
}

// Mock Database of users
export const mockUsers: User[] = [
  { id: '1', name: 'Admin Principal', email: 'admin@gympro.com', role: 'admin', cedula: '1234', permissions: ['POS_ACCESS', 'INVENTORY_MANAGE', 'SALES_VIEW', 'CRM_MANAGE'] },
  { id: '2', name: 'Entrenador Carlos', email: 'carlos@gympro.com', role: 'employee', cedula: '5678', permissions: ['POS_ACCESS'] },
  { id: '3', name: 'Atleta Juan', email: 'juan@atleta.com', role: 'athlete', cedula: '9012' }
]

const mockPasswords: Record<string, string> = {
  '1234': 'admin',
  '5678': 'entrenador',
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
    
    // Validate password
    if (passwords[cedula] === clave) {
      const mockUser = users.find((u: User) => u.cedula === cedula)
      if (mockUser) {
        setUser(mockUser)
        localStorage.setItem('gympro_mock_user', JSON.stringify(mockUser))
        return true
      }
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

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading, registerAthlete, adminUpdateAthleteCredentials, updateEmployeePermissions, getAllEmployees }}>
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
