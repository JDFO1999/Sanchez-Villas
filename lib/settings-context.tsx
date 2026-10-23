"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'
import { getSystemSettingsAction, saveSystemSettingsAction } from '@/app/actions/settings'

type FontFamily = 'arvo' | 'inter' | 'roboto'

export interface AppSettings {
  appName: string
  logoUrl: string
  logoUrlDark?: string
  faviconUrl?: string
  primaryColor: string
  secondaryColor: string
  borderColor: string
  isGlass: boolean
  fontFamily: FontFamily
  logoSettings: {
    showInNavbar: boolean
    showInSidebar: boolean
    showInLogin: boolean
    widthNavbar: number
    heightNavbar: number
    widthLogin: number
    heightLogin: number
    showNameInNavbar: boolean
    showNameInLogin: boolean
    objectFit: 'contain' | 'cover' | 'fill'
    fadeEffect: boolean
    paddingNavbar?: number
    marginNavbar?: number
  }
  footerLogoSettings?: {
    showLogo: boolean
    customLogoUrl?: string
    position: 'side' | 'top' | 'top-center'
    width: number
    height: number
    glassEffect: boolean
    glowEffect: boolean
    alignment?: 'left' | 'center' | 'right'
    showText?: boolean
    showAppName?: boolean
    textSize?: number
    textEffect?: 'gradient' | 'minimalist' | 'neon' | 'none'
    footerAlignment?: 'left' | 'center' | 'right' | 'justify'
    footerTextAlign?: 'justify' | 'center' | 'left' | 'right'
    footerPadding?: number
    footerMarginTop?: number
    bgColor?: string
    copyrightText?: string
    layoutTheme?: 'modern' | 'classic' | 'minimalist'
    partnersLayout?: 'pyramid' | 'inverted-pyramid' | 'grid'
  }
  storeCurrency: string
  storeCurrencySecondary: string
  storeExchangeRate: number
  storeExchangeRateEur?: number
  storeExchangeRateCop?: number
  bcvRates?: {
    usd: number
    eur: number
    cop: number
    copToBs?: number
    lastSync?: string
    updatedAt?: string
    updatedBy?: string
    updatedByRole?: string
  }
  bcvRateAlert?: {
    id: string
    updatedAt: string
    updatedBy?: string
    updatedByRole?: string
    rates: {
      usd: number
      eur: number
      cop: number
      copToBs?: number
    }
  }
  storeTaxRate: number
  storeReceiptMessage: string
  storeNextInvoice: number
  storeRif: string
  storeAddress: string
  storeTicketWidth: '80mm' | '58mm' | 'Carta'
  storeUseThermalPrinter: boolean
  storePaymentInstructions: {
    pagoMovil: string
    pagoMovil2?: string
    binance: string
    transferencia: string
    transferencia2?: string
  }
  storePaymentQRs: {
    pagoMovil: string
    pagoMovil2?: string
    binance: string
    transferencia: string
    transferencia2?: string
  }
  coachCustomPricing: boolean
  gymCommissionPercentage: number
  monthlyFee?: number
  biometricFields: string[]
  footerMission: string
  footerVision: string
  footerSocialLinks: { id: string, name: string, url: string, iconUrl?: string, width: number, height: number }[]
  footerPartners: { id: string, imageUrl: string, width: number, height: number, link?: string, tier?: number }[]
  trainingPhilosophy?: string
  allowCoachesToPostCommunity?: boolean
  gymSchedule?: {
    weekdays: string
    saturdays: string
    sundays: string
  }
  landingSettings?: {
    enabled: boolean
    tagline?: string
    disciplinesTitle?: string
    disciplinesSubtitle?: string
    heroSlides: {
      id: string
      type: 'image' | 'video'
      url: string
      title?: string
      subtitle?: string
      ctaText?: string
      ctaLink?: string
    }[]
    disciplines: {
      id: string
      title: string
      description: string
      imageUrl: string
      intensity?: string
      schedule?: string
    }[]
    promiseSettings?: {
      badge?: string
      title?: string
      description?: string
      images: string[]
    }
    plansSettings?: {
      badge?: string
      title?: string
      subtitle?: string
      plans: {
        id: string
        name: string
        price: string
        billingPeriod?: string
        description?: string
        highlight?: boolean
        badge?: string
        features: string[]
        ctaText?: string
        ctaLink?: string
      }[]
    }
    map: {
      embedUrl: string
      address: string
      googleMapsUrl?: string
      phone?: string
      whatsapp?: string
      infoCardTitle?: string
    }
  }
  customRoles?: {
    id: string
    name: string
    permissions: string[]
  }[]
}

interface SettingsContextType {
  settings: AppSettings
  updateSettings: (newSettings: Partial<AppSettings>) => Promise<{ success: boolean; error?: string }>
  isLoading: boolean
}

export const defaultSettings: AppSettings = {
  appName: '',
  logoUrl: '',
  logoUrlDark: '',
  faviconUrl: '',
  primaryColor: '#D4AF37',
  secondaryColor: '#1A1A1A',
  borderColor: '#333333',
  isGlass: true,
  fontFamily: 'arvo',
  logoSettings: {
    showInNavbar: true,
    showInSidebar: true,
    showInLogin: true,
    widthNavbar: 40,
    heightNavbar: 40,
    widthLogin: 96,
    heightLogin: 96,
    showNameInNavbar: true,
    showNameInLogin: true,
    objectFit: 'contain',
    fadeEffect: false,
    paddingNavbar: 0,
    marginNavbar: 0
  },
  footerLogoSettings: {
    showLogo: true,
    position: 'side',
    width: 60,
    height: 60,
    glassEffect: false,
    glowEffect: true,
    alignment: 'left',
    showText: true,
    textSize: 24,
    textEffect: 'gradient',
    footerAlignment: 'left',
    footerPadding: 12,
    footerMarginTop: 0,
    partnersLayout: 'pyramid'
  },
  storeCurrency: 'USD',
  storeCurrencySecondary: 'BsS',
  storeExchangeRate: 886.23,
  storeExchangeRateEur: 993.09,
  storeExchangeRateCop: 3185.01,
  bcvRates: {
    usd: 886.23,
    eur: 993.09,
    cop: 3185.01,
    copToBs: 278.25
  },
  storeTaxRate: 19,
  storeReceiptMessage: '¡Gracias por su compra!',
  storeNextInvoice: 1,
  storeRif: 'J-12345678-9',
  storeAddress: 'Centro de la ciudad, Calle 1',
  storeTicketWidth: '80mm',
  storeUseThermalPrinter: true,
  storePaymentInstructions: {
    pagoMovil: 'Banco: Banesco (0134)\nCédula: V-12345678\nTeléfono: 0414-1234567',
    pagoMovil2: '',
    binance: 'Email: pagos@maximumstore.com\nPay ID: 123456789',
    transferencia: 'Banco: Mercantil\nCuenta: 0105-0000-0000-0000-0000\nNombre: Maximum Store C.A.\nRIF: J-12345678-9',
    transferencia2: ''
  },
  storePaymentQRs: {
    pagoMovil: '',
    pagoMovil2: '',
    binance: '',
    transferencia: '',
    transferencia2: ''
  },
  coachCustomPricing: false,
  gymCommissionPercentage: 30,
  biometricFields: ['Pecho', 'Cintura', 'Cadera'],
  footerMission: '',
  footerVision: '',
  footerSocialLinks: [
    { id: '1', name: 'Instagram', url: '', width: 24, height: 24 },
    { id: '2', name: 'Facebook', url: '', width: 24, height: 24 },
    { id: '3', name: 'TikTok', url: '', width: 24, height: 24 }
  ],
  footerPartners: [],
  trainingPhilosophy: 'No cuentes los días, haz que los días cuenten. Tu único límite es la mente que te dice que pares una repetición antes.',
  allowCoachesToPostCommunity: false,
  gymSchedule: {
    weekdays: '6:00 AM - 10:00 PM',
    saturdays: '7:00 AM - 6:00 PM',
    sundays: '8:00 AM - 2:00 PM'
  },
  landingSettings: {
    enabled: true,
    tagline: 'Supera tus límites, forja tu mejor versión',
    heroSlides: [
      {
        id: '1',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1920&auto=format&fit=crop',
        title: 'TRANSFORMA TU CUERPO Y MENTE',
        subtitle: 'Instalaciones de alto rendimiento, entrenadores certificados y la mejor comunidad fitness.',
        ctaText: 'Ver Disciplinas',
        ctaLink: '#disciplinas'
      },
      {
        id: '2',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?q=80&w=1920&auto=format&fit=crop',
        title: 'DISCIPLINAS PARA CADA OBJETIVO',
        subtitle: 'Musculación, Cross Training, Spinning, Boxeo y mucho más en un solo lugar.',
        ctaText: 'Conoce Nuestra Ubicación',
        ctaLink: '#ubicacion'
      },
      {
        id: '3',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=1920&auto=format&fit=crop',
        title: 'VIVE LA EXPERIENCIA DEL ENTRENAMIENTO REAL',
        subtitle: 'Ambiente motivador con equipo de última generación y asesoría personalizada.',
        ctaText: 'Contáctanos',
        ctaLink: '#contacto'
      }
    ],
    disciplines: [
      {
        id: '1',
        title: 'Musculación & Hipertrofia',
        description: 'Zona de peso libre, máquinas selectorizadas y asesoría técnica para maximizar tu ganancia muscular y fuerza.',
        imageUrl: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=800&auto=format&fit=crop',
        intensity: 'Alta',
        schedule: 'Lunes a Sábado'
      },
      {
        id: '2',
        title: 'Cross Training & Funcional',
        description: 'Entrenamientos dinámicos de alta intensidad para elevar resistencia, potencia cardiovascular y agilidad.',
        imageUrl: 'https://images.unsplash.com/photo-1517963879433-6ad2b056d712?q=80&w=800&auto=format&fit=crop',
        intensity: 'Extrema',
        schedule: 'Mañanas y Tardes'
      },
      {
        id: '3',
        title: 'Indoor Cycling (Spinning)',
        description: 'Quema calorías al ritmo de la música con sesiones guiadas que fortalecen piernas y capacidad aeróbica.',
        imageUrl: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=800&auto=format&fit=crop',
        intensity: 'Media - Alta',
        schedule: 'Clases Grupales'
      },
      {
        id: '4',
        title: 'Boxeo & Contacto',
        description: 'Aprende técnica, golpeo al saco, reflejos y coordinación en una disciplina que desafía tu velocidad y resistencia.',
        imageUrl: 'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?q=80&w=800&auto=format&fit=crop',
        intensity: 'Alta',
        schedule: 'Lunes, Miércoles y Viernes'
      }
    ],
    disciplinesTitle: 'ENTRENA A TU MANERA, SUPERA TUS LÍMITES',
    disciplinesSubtitle: 'Disponemos de programas y áreas diseñadas para todos los niveles, desde principiantes hasta atletas de alto rendimiento.',
    promiseSettings: {
      badge: 'NUESTRA PROMESA',
      title: 'UN ESPACIO PENSADO PARA TU EVOLUCIÓN',
      description: 'no solo entrenas: formas parte de un estilo de vida enfocado en la disciplina, la superación y los resultados reales.',
      images: [
        'https://images.unsplash.com/photo-1574680096145-d05b474e2155?q=80&w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?q=80&w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1534367507873-d2d7e24c797f?q=80&w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1599058917212-d750089bc07e?q=80&w=800&auto=format&fit=crop'
      ]
    },
    plansSettings: {
      badge: 'MEMBRESÍAS & PLANES',
      title: 'INVULNÉRABILIDAD Y CONSTANCIA: ELIGE TU PLAN',
      subtitle: 'Planes flexibles diseñados para tus metas, con acceso completo a equipamiento de primer nivel y asesoría continua.',
      plans: [
        {
          id: '1',
          name: 'Plan Básico Mensual',
          price: '$25',
          billingPeriod: '/mes',
          description: 'Ideal para quienes inician su disciplina física con acceso libre al área de pesas.',
          highlight: false,
          badge: '',
          features: [
            'Acceso a zona de pesas y musculación',
            'Vestuarios y duchas con agua caliente',
            'Evaluación física inicial básica',
            'Horario ilimitado de lunes a sábado'
          ],
          ctaText: 'Comenzar Ahora',
          ctaLink: '#contacto'
        },
        {
          id: '2',
          name: 'Plan Pro Fitness',
          price: '$35',
          billingPeriod: '/mes',
          description: 'El plan favorito: musculación completa más acceso libre a clases grupales y spinning.',
          highlight: true,
          badge: 'MÁS POPULAR',
          features: [
            'Todo lo del Plan Básico',
            'Acceso ilimitado a Spinning y Cross Training',
            'Rutina personalizada digital en la app',
            'Casillero personal asignado en vestuario',
            'Descuento del 10% en tienda y suplementos'
          ],
          ctaText: 'Elegir Plan Pro',
          ctaLink: '#contacto'
        },
        {
          id: '3',
          name: 'Plan Elite Personalizado',
          price: '$50',
          billingPeriod: '/mes',
          description: 'Entrenamiento de alto nivel con asesoría de coach dedicado y seguimiento biométrico semanal.',
          highlight: false,
          badge: 'RECOMENDADO',
          features: [
            'Todo lo del Plan Pro Fitness',
            'Asesoría técnica y corrección con Coach',
            'Monitoreo biométrico y de composición corporal',
            'Plan nutricional sugerido y ajuste de cargas',
            'Acceso VIP a todas las áreas y disciplinas'
          ],
          ctaText: 'Unirme a Elite',
          ctaLink: '#contacto'
        },
        {
          id: '4',
          name: 'Pase Anual Black Evolution',
          price: '$300',
          billingPeriod: '/año',
          description: 'Compromiso total a largo plazo con el mayor ahorro: entrena todo el año sin preocupaciones.',
          highlight: false,
          badge: 'MEJOR VALOR',
          features: [
            'Acceso total 365 días a todas las disciplinas',
            'Congelación de membresía por viaje hasta 30 días',
            '2 Pases de invitado al mes gratis',
            'Camiseta oficial del gimnasio de regalo',
            'Prioridad en eventos y retos de comunidad'
          ],
          ctaText: 'Obtener Pase Anual',
          ctaLink: '#contacto'
        }
      ]
    },
    map: {
      embedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3923.2384976722216!2d-66.8833!3d10.488!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTDCsDI5JzE2LjgiTiA2NsKwNTInNTkuOSJX!5e0!3m2!1ses!2sve!4v1600000000000!5m2!1ses!2sve',
      address: 'Avenida Principal, Centro Deportivo, Edificio Gym, Nivel 1',
      googleMapsUrl: 'https://maps.google.com',
      phone: '+58 412 123 4567',
      whatsapp: '+58 414 123 4567',
      infoCardTitle: 'Información del Gym'
    }
  },
  customRoles: []
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

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

  const sanitizeSettings = (parsed: any): AppSettings => {
    if (parsed.footerSocialLinks && !Array.isArray(parsed.footerSocialLinks)) {
      parsed.footerSocialLinks = defaultSettings.footerSocialLinks;
    }
    if (parsed.footerPartners && !Array.isArray(parsed.footerPartners)) {
      parsed.footerPartners = [];
    } else if (Array.isArray(parsed.footerPartners)) {
      parsed.footerPartners = parsed.footerPartners.map((p: any) => typeof p === "string" ? { id: Math.random().toString(), imageUrl: p, width: 100, height: 40 } : p);
    }
    return {
      ...defaultSettings,
      ...parsed,
      logoSettings: {
        ...defaultSettings.logoSettings,
        ...(parsed.logoSettings || {})
      },
      footerLogoSettings: {
        ...defaultSettings.footerLogoSettings,
        ...(parsed.footerLogoSettings || {})
      }
    };
  }

export function SettingsProvider({
  children,
  initialSettings: serverInitialSettings,
}: {
  children: React.ReactNode
  initialSettings?: AppSettings | null
}) {
  const [settings, setSettings] = useState<AppSettings>(() => {
    if (serverInitialSettings && (serverInitialSettings.appName || serverInitialSettings.logoUrl || serverInitialSettings.logoUrlDark)) {
      return sanitizeSettings(serverInitialSettings)
    }
    if (typeof window !== 'undefined') {
      try {
        const winSettings = (window as any).__INITIAL_SETTINGS__
        if (winSettings && (winSettings.appName || winSettings.logoUrl || winSettings.logoUrlDark)) {
          return sanitizeSettings(winSettings)
        }
        const saved = localStorage.getItem('gympro_settings')
        if (saved) {
          return sanitizeSettings(JSON.parse(saved))
        }
      } catch {}
    }
    return defaultSettings
  })

  const [isLoading, setIsLoading] = useState(() => {
    return !(serverInitialSettings && (serverInitialSettings.appName || serverInitialSettings.logoUrl || serverInitialSettings.logoUrlDark))
  })

  const applyDomUpdates = (currSettings: AppSettings) => {
    if (typeof document !== 'undefined') {
      document.title = currSettings.appName ? `${currSettings.appName} - Sistema de Gestión` : "Sistema de Gestión";
      const targetHref = currSettings.faviconUrl || currSettings.logoUrl || currSettings.logoUrlDark || defaultSettings.faviconUrl || '/api/favicon';
      const existingIcons = document.querySelectorAll("link[rel*='icon'], link[rel='apple-touch-icon']");
      if (existingIcons.length > 0) {
        existingIcons.forEach((el) => {
          const linkEl = el as HTMLLinkElement;
          linkEl.href = targetHref;
          if (targetHref.startsWith('data:image/png')) linkEl.type = 'image/png';
          else if (targetHref.startsWith('data:image/svg')) linkEl.type = 'image/svg+xml';
          else if (targetHref.startsWith('data:image/jpeg') || targetHref.startsWith('data:image/jpg')) linkEl.type = 'image/jpeg';
          else linkEl.removeAttribute('type');
        });
      } else {
        const iconLink = document.createElement("link");
        iconLink.rel = "icon";
        iconLink.href = targetHref;
        document.head.appendChild(iconLink);

        const shortcutLink = document.createElement("link");
        shortcutLink.rel = "shortcut icon";
        shortcutLink.href = targetHref;
        document.head.appendChild(shortcutLink);
      }
    }
  }

  useEffect(() => {
    let activeSettings = settings

    // 1. Cargar inmediatamente desde localStorage para evitar parpadeos si no venían del servidor
    const saved = localStorage.getItem('gympro_settings')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        if (!serverInitialSettings) {
          activeSettings = sanitizeSettings(parsed)
          setSettings(activeSettings)
        }
      } catch (e) {
        console.error("Error reading localStorage settings:", e)
      }
    }

    applyDomUpdates(activeSettings)

    // 2. Sincronizar desde la base de datos MySQL
    getSystemSettingsAction().then(res => {
      if (res.success && res.settings) {
        const dbSettings = sanitizeSettings(res.settings)
        setSettings(dbSettings)
        applyDomUpdates(dbSettings)
        try {
          localStorage.setItem('gympro_settings', JSON.stringify(dbSettings))
        } catch (_) {}
      } else if (saved && !res.settings) {
        // Respaldar settings existentes en DB
        try {
          saveSystemSettingsAction(activeSettings).catch(() => {})
        } catch (_) {}
      }
    }).catch(err => {
      console.warn("Could not fetch settings from DB, using cached settings:", err)
    }).finally(() => {
      setIsLoading(false)
    })
  }, [])

  const updateSettings = async (newSettings: Partial<AppSettings>): Promise<{ success: boolean; error?: string }> => {
    const updated: AppSettings = {
      ...settings,
      ...newSettings,
      logoSettings: {
        ...settings.logoSettings,
        ...(newSettings.logoSettings || {})
      },
      footerLogoSettings: {
        showLogo: true,
        position: 'side',
        width: 60,
        height: 60,
        glassEffect: false,
        glowEffect: true,
        alignment: 'left',
        showText: true,
        textSize: 24,
        textEffect: 'gradient',
        footerAlignment: 'left',
        footerPadding: 12,
        footerMarginTop: 0,
        ...(settings.footerLogoSettings || {}),
        ...(newSettings.footerLogoSettings || {})
      }
    }
    setSettings(updated)
    applyDomUpdates(updated)
    try {
      localStorage.setItem('gympro_settings', JSON.stringify(updated))
    } catch (e) {
      console.warn("Could not save to localStorage:", e)
    }
    // Persistir en base de datos MySQL
    try {
      const res = await saveSystemSettingsAction(updated)
      if (!res.success) {
        console.error("Error from saveSystemSettingsAction:", res.error)
      }
      return res
    } catch (err: any) {
      console.error("Error persisting settings to DB:", err)
      return { success: false, error: err?.message || "Error al conectar con la base de datos" }
    }
  }

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
