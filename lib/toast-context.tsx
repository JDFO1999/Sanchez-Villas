"use client"

import React, { createContext, useContext, useCallback, ReactNode } from 'react'
import Swal from 'sweetalert2'
import { swalTheme } from '@/lib/confirm'

type ToastType = 'success' | 'error' | 'info' | 'warning'

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: ReactNode }) {
  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    Swal.fire({
      title: message,
      icon: type,
      toast: true,
      position: 'bottom-end',
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
      ...swalTheme(),
      customClass: {
        popup: 'border border-border rounded-lg shadow-2xl'
      }
    })
  }, [])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

export function showSweetToast(message: string, type: ToastType = 'info') {
  Swal.fire({
    title: message,
    icon: type,
    toast: true,
    position: 'bottom-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    ...swalTheme(),
    customClass: {
      popup: 'border border-border rounded-lg shadow-2xl'
    }
  })
}
