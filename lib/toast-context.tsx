"use client"

import React, { createContext, useContext, useCallback, ReactNode } from 'react'
import Swal from 'sweetalert2'

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
      background: '#222',
      color: '#fff',
      customClass: {
        popup: 'border border-white/10 rounded-lg shadow-2xl glass'
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
