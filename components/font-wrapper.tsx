"use client"

import React from 'react'
import { useSettings } from '@/lib/settings-context'

export function FontWrapper({ children }: { children: React.ReactNode }) {
  const { settings, isLoading } = useSettings()

  if (isLoading) {
    return <div className="font-arvo">{children}</div>
  }

  const fontClass = `font-${settings.fontFamily}`

  return (
    <div className={fontClass} style={{ minHeight: '100vh' }}>
      {children}
    </div>
  )
}
