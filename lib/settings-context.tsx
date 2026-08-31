"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'

type FontFamily = 'arvo' | 'inter' | 'roboto'

export interface AppSettings {
  appName: string
  logoUrl: string
  primaryColor: string // Hex format
  secondaryColor: string // Hex format
  borderColor: string // Hex format
  isGlass: boolean
  fontFamily: FontFamily
  storeCurrency: string
  storeTaxRate: number
  storeReceiptMessage: string
  storeNextInvoice: number
  storeRif: string
  storeAddress: string
  storeTicketWidth: '80mm' | '58mm' | 'Carta'
  storeUseThermalPrinter: boolean
}

interface SettingsContextType {
  settings: AppSettings
  updateSettings: (newSettings: Partial<AppSettings>) => void
  isLoading: boolean
}

const defaultSettings: AppSettings = {
  appName: 'GymPro',
  logoUrl: '',
  primaryColor: '#D4AF37', // Gold
  secondaryColor: '#1A1A1A', // Dark gray
  borderColor: '#333333', // Lighter gray
  isGlass: true,
  fontFamily: 'arvo',
  storeCurrency: 'USD',
  storeTaxRate: 19,
  storeReceiptMessage: '¡Gracias por su compra en GymPro!',
  storeNextInvoice: 1,
  storeRif: 'J-12345678-9',
  storeAddress: 'Centro de la ciudad, Calle 1',
  storeTicketWidth: '80mm',
  storeUseThermalPrinter: true
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

// Helper to convert HEX to HSL
function hexToHSL(hex: string) {
  let r = 0, g = 0, b = 0;
  if (hex.length === 4) {
    r = parseInt("0x" + hex[1] + hex[1]);
    g = parseInt("0x" + hex[2] + hex[2]);
    b = parseInt("0x" + hex[3] + hex[3]);
  } else if (hex.length === 7) {
    r = parseInt("0x" + hex[1] + hex[2]);
    g = parseInt("0x" + hex[3] + hex[4]);
    b = parseInt("0x" + hex[5] + hex[6]);
  }
  
  r /= 255; g /= 255; b /= 255;
  const cmin = Math.min(r,g,b),
        cmax = Math.max(r,g,b),
        delta = cmax - cmin;
  let h = 0, s = 0, l = 0;

  if (delta === 0) h = 0;
  else if (cmax === r) h = ((g - b) / delta) % 6;
  else if (cmax === g) h = (b - r) / delta + 2;
  else h = (r - g) / delta + 4;

  h = Math.round(h * 60);
  if (h < 0) h += 360;
  l = (cmax + cmin) / 2;
  s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
  s = +(s * 100).toFixed(1);
  l = +(l * 100).toFixed(1);

  return `${h} ${s}% ${l}%`;
}

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const saved = localStorage.getItem('gympro_settings')
    if (saved) {
      try {
        setSettings({ ...defaultSettings, ...JSON.parse(saved) })
      } catch (e) {
        console.error(e)
      }
    }
    setIsLoading(false)
  }, [])

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    const updated = { ...settings, ...newSettings }
    setSettings(updated)
    localStorage.setItem('gympro_settings', JSON.stringify(updated))
  }

  // Generate dynamic CSS based on settings
  const primaryHsl = hexToHSL(settings.primaryColor)
  const secondaryHsl = hexToHSL(settings.secondaryColor)
  const borderHsl = hexToHSL(settings.borderColor)
  
  return (
    <SettingsContext.Provider value={{ settings, updateSettings, isLoading }}>
      {!isLoading && (
        <style dangerouslySetInnerHTML={{__html: `
          :root {
            --primary: ${primaryHsl} !important;
            --secondary: ${secondaryHsl} !important;
            --border: ${borderHsl} !important;
            --is-glass: ${settings.isGlass ? 1 : 0};
          }
          .dark {
            --primary: ${primaryHsl} !important;
            --secondary: ${secondaryHsl} !important;
            --border: ${borderHsl} !important;
          }
        `}} />
      )}
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const context = useContext(SettingsContext)
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider')
  }
  return context
}
