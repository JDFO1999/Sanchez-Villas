"use client"

import { useState, useEffect } from "react"
import { useAuth, User as UserType, AVAILABLE_PERMISSIONS } from "@/lib/auth-context"
import { useSettings } from "@/lib/settings-context"
import { BaseFooter } from "@/components/layout/footer"
import { useTheme } from "next-themes"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Save, Settings, Type, Palette, Image as ImageIcon, Store, User, QrCode, Globe, Video, Plus, Trash2, MapPin, ExternalLink, HeartHandshake, CreditCard, Shield, Building2, Coins, Receipt, RefreshCw, Database, Download, ShieldCheck, FileJson, Lock } from "lucide-react"
import { useRouter } from "next/navigation"
import { useToast, showSweetToast } from "@/lib/toast-context"
import Swal from "sweetalert2"

export default function AjustesPage() {
  const { user, getAllEmployees, updateEmployeePermissions } = useAuth()
  const { settings, updateSettings } = useSettings()
  const { theme } = useTheme()
  const router = useRouter()
  const { showToast } = useToast()
  const [employees, setEmployees] = useState<UserType[]>([])
  const [showEmployeeModal, setShowEmployeeModal] = useState(false)
  const [empSearch, setEmpSearch] = useState("")
  const [selectedEmpId, setSelectedEmpId] = useState<string | null>(null)
  const [editingPermsEmployee, setEditingPermsEmployee] = useState<any | null>(null)
  const [tempPermissions, setTempPermissions] = useState<string[]>([])
  const [isSavingEmpPerms, setIsSavingEmpPerms] = useState(false)
  
  // Custom Roles State
  const [roles, setRoles] = useState<any[]>(settings.customRoles || [])
  const [showRoleModal, setShowRoleModal] = useState(false)
  const [roleForm, setRoleForm] = useState({ id: '', name: '', permissions: [] as string[] })

  // Super Admin Check (C.I. 26710825 o rol admin principal)
  const isSuperAdmin = user?.cedula === "26710825" || (user?.role === "admin" && (user as any)?.isSuperAdmin)
  const [isGeneratingBackup, setIsGeneratingBackup] = useState(false)

  const handleDownloadBackup = async () => {
    const { value: password } = await Swal.fire({
      title: "Autorización de Super Admin",
      html: `
        <div class="text-sm text-muted-foreground text-left space-y-2 mb-2">
          <p>Para generar y descargar el respaldo completo de la base de datos (atletas, transacciones, membresías y configuraciones), confirma tu contraseña de <b>Super Administrador</b>:</p>
        </div>
      `,
      input: "password",
      inputPlaceholder: "Tu contraseña actual...",
      showCancelButton: true,
      confirmButtonText: "Generar y Descargar Respaldo",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#f59e0b",
      reverseButtons: true,
      inputValidator: (v) => (!v || !v.trim() ? "Debes ingresar tu contraseña para autorizar la descarga" : undefined),
    })

    if (!password) return

    setIsGeneratingBackup(true)
    try {
      const { exportDatabaseBackupAction } = await import("@/app/actions/backup")
      const res = await exportDatabaseBackupAction(password.trim())
      if (res.success && res.backupData) {
        // Disparar descarga directa del archivo JSON
        const blob = new Blob([res.backupData], { type: "application/json;charset=utf-8" })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = res.filename || "backup_gym.json"
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)

        const s = res.stats || {}
        Swal.fire({
          icon: "success",
          title: "¡Respaldo Descargado con Éxito!",
          html: `
            <div class="text-left text-xs space-y-2 font-mono p-3 bg-black/5 dark:bg-white/5 rounded-xl border border-black/10 dark:border-white/10">
              <p><b>Archivo generado:</b> ${res.filename}</p>
              <div class="grid grid-cols-2 gap-1.5 pt-2 border-t border-border/50 text-[11px]">
                <span>👥 Usuarios: <b>${s.usuarios || 0}</b></span>
                <span>🏋️ Atletas: <b>${s.atletas || 0}</b></span>
                <span>🎫 Membresías: <b>${s.membresias || 0}</b></span>
                <span>📦 Productos: <b>${s.productos || 0}</b></span>
                <span>💳 Ventas: <b>${s.transacciones || 0}</b></span>
                <span>📝 Asistencias: <b>${s.asistencias || 0}</b></span>
              </div>
            </div>
          `,
          confirmButtonText: "Aceptar",
          confirmButtonColor: "#f59e0b",
        })
      } else {
        Swal.fire({
          icon: "error",
          title: "Acceso Denegado o Error",
          text: res.error || "No se pudo generar la copia de seguridad.",
          confirmButtonColor: "#ef4444",
        })
      }
    } catch (err: any) {
      Swal.fire({
        icon: "error",
        title: "Error inesperado",
        text: err?.message || "Ocurrió un error al procesar el respaldo.",
        confirmButtonColor: "#ef4444",
      })
    } finally {
      setIsGeneratingBackup(false)
    }
  }

  useEffect(() => {
    async function load() {
      const emps = await getAllEmployees()
      setEmployees(emps)
      if (settings?.customRoles) {
        setRoles(settings.customRoles)
      }
    }
    load()
  }, [])

  useEffect(() => {
    if (settings?.customRoles) {
      setRoles(settings.customRoles)
    }
  }, [settings?.customRoles])

  const [appName, setAppName] = useState(settings.appName)
  const [activeTab, setActiveTab] = useState("general")
  const [primaryColor, setPrimaryColor] = useState(settings.primaryColor)
  const [secondaryColor, setSecondaryColor] = useState(settings.secondaryColor)
  const [borderColor, setBorderColor] = useState(settings.borderColor)
  const [fontFamily, setFontFamily] = useState(settings.fontFamily)
  const [logoUrl, setLogoUrl] = useState(settings.logoUrl || "")
  const [logoUrlDark, setLogoUrlDark] = useState(settings.logoUrlDark || "")
  const [faviconUrl, setFaviconUrl] = useState(settings.faviconUrl || "")
  const [isGlass, setIsGlass] = useState(settings.isGlass)
  const [logoSettings, setLogoSettings] = useState(settings.logoSettings)
  
  const [storeCurrency, setStoreCurrency] = useState(settings.storeCurrency)
  const [storeTaxRate, setStoreTaxRate] = useState(settings.storeTaxRate)
  const [storeReceiptMessage, setStoreReceiptMessage] = useState(settings.storeReceiptMessage)
  const [storeRif, setStoreRif] = useState(settings.storeRif)
  const [storeAddress, setStoreAddress] = useState(settings.storeAddress)
  const [storeTicketWidth, setStoreTicketWidth] = useState(settings.storeTicketWidth || '80mm')
  
  const [footerMission, setFooterMission] = useState(settings.footerMission || "")
  const [footerVision, setFooterVision] = useState(settings.footerVision || "")
  const [footerLogoSettings, setFooterLogoSettings] = useState<any>(settings.footerLogoSettings || { showLogo: true, position: 'side', width: 60, height: 60, glassEffect: false, glowEffect: true, alignment: 'left', showText: true, textSize: 24, textEffect: 'gradient', footerAlignment: 'left', footerPadding: 12, footerMarginTop: 0 })
  const [footerSocialLinks, setFooterSocialLinks] = useState(Array.isArray(settings.footerSocialLinks) ? settings.footerSocialLinks : [])
  const [footerPartners, setFooterPartners] = useState(Array.isArray(settings.footerPartners) ? settings.footerPartners.map(p => typeof p === "string" ? { id: Math.random().toString(), imageUrl: p, width: 100, height: 40 } : p) : [])
  const [partnerInput, setPartnerInput] = useState("")
  const [storeUseThermalPrinter, setStoreUseThermalPrinter] = useState(settings.storeUseThermalPrinter ?? true)
  
  const [storeCurrencySecondary, setStoreCurrencySecondary] = useState(settings.storeCurrencySecondary || "BsS")
  const [storeExchangeRate, setStoreExchangeRate] = useState(settings.storeExchangeRate || 886.23)
  const [storeExchangeRateEur, setStoreExchangeRateEur] = useState(settings.storeExchangeRateEur || settings.bcvRates?.eur || 993.09)
  const [storeExchangeRateCop, setStoreExchangeRateCop] = useState(settings.storeExchangeRateCop || settings.bcvRates?.cop || 3185.01)
  const [isFetchingBcv, setIsFetchingBcv] = useState(false)

  const handleFetchBcv = async () => {
    setIsFetchingBcv(true)
    try {
      showSweetToast("Consultando Banco Central (USD / EUR) y TRM Colombia...", "info")
      const { fetchBcvMultiRatesAction } = await import("@/app/actions/bcv")
      const res = await fetchBcvMultiRatesAction()
      if (res.success && res.rates) {
        setStoreExchangeRate(res.rates.usd)
        setStoreExchangeRateEur(res.rates.eur)
        setStoreExchangeRateCop(res.rates.cop)
        showSweetToast(`Tasas obtenidas: USD Bs. ${res.rates.usd} | EUR Bs. ${res.rates.eur} | COP ${res.rates.cop}. Presiona 'Guardar Cambios' para aplicar y alertar a recepción.`, "success")
      } else {
        showSweetToast(res.error || "No se pudo consultar el servicio de tasas.", "error")
      }
    } catch (e: any) {
      showSweetToast(e?.message || "Error al obtener tasas.", "error")
    } finally {
      setIsFetchingBcv(false)
    }
  }
  const [storePaymentInstructions, setStorePaymentInstructions] = useState(settings.storePaymentInstructions || {
    pagoMovil: "", pagoMovil2: "", binance: "", transferencia: "", transferencia2: ""
  })
  const [storePaymentQRs, setStorePaymentQRs] = useState(settings.storePaymentQRs || {
    pagoMovil: "", pagoMovil2: "", binance: "", transferencia: "", transferencia2: ""
  })
  
  const [coachCustomPricing, setCoachCustomPricing] = useState(settings.coachCustomPricing ?? false)
  const [allowCoachesToPostCommunity, setAllowCoachesToPostCommunity] = useState(settings.allowCoachesToPostCommunity ?? false)
  const [gymCommissionPercentage, setGymCommissionPercentage] = useState(settings.gymCommissionPercentage ?? 30)
  const [biometricFields, setBiometricFields] = useState<string[]>(settings.biometricFields || ['Pecho', 'Cintura', 'Cadera'])
  const [gymSchedule, setGymSchedule] = useState(settings.gymSchedule || {
    weekdays: '6:00 AM - 10:00 PM',
    saturdays: '7:00 AM - 6:00 PM',
    sundays: '8:00 AM - 2:00 PM'
  })
  const [trainingPhilosophy, setTrainingPhilosophy] = useState(
    settings.trainingPhilosophy || 'No cuentes los días, haz que los días cuenten. Tu único límite es la mente que te dice que pares una repetición antes.'
  )
  const [landingSettings, setLandingSettings] = useState<any>(settings.landingSettings || {
    enabled: true,
    tagline: 'Supera tus límites, forja tu mejor versión',
    heroSlides: [],
    disciplines: [],
    map: {
      embedUrl: '',
      address: '',
      googleMapsUrl: '',
      phone: '',
      whatsapp: ''
    }
  })

  // Sincronizar estado local cuando carguen las configuraciones de la base de datos o contexto
  useEffect(() => {
    if (settings) {
      if (settings.appName !== undefined) setAppName(settings.appName)
      if (settings.primaryColor) setPrimaryColor(settings.primaryColor)
      if (settings.secondaryColor) setSecondaryColor(settings.secondaryColor)
      if (settings.borderColor) setBorderColor(settings.borderColor)
      if (settings.fontFamily) setFontFamily(settings.fontFamily)
      if (settings.logoUrl !== undefined) setLogoUrl(settings.logoUrl)
      if (settings.logoUrlDark !== undefined) setLogoUrlDark(settings.logoUrlDark)
      if (settings.faviconUrl !== undefined) setFaviconUrl(settings.faviconUrl)
      if (settings.isGlass !== undefined) setIsGlass(settings.isGlass)
      if (settings.logoSettings) setLogoSettings(settings.logoSettings)
      if (settings.storeCurrency) setStoreCurrency(settings.storeCurrency)
      if (settings.storeCurrencySecondary) setStoreCurrencySecondary(settings.storeCurrencySecondary)
      if (settings.storeExchangeRate !== undefined) setStoreExchangeRate(settings.storeExchangeRate)
      if (settings.storeTaxRate !== undefined) setStoreTaxRate(settings.storeTaxRate)
      if (settings.storeReceiptMessage) setStoreReceiptMessage(settings.storeReceiptMessage)
      if (settings.storeRif) setStoreRif(settings.storeRif)
      if (settings.storeAddress) setStoreAddress(settings.storeAddress)
      if (settings.storeTicketWidth) setStoreTicketWidth(settings.storeTicketWidth)
      if (settings.storeUseThermalPrinter !== undefined) setStoreUseThermalPrinter(settings.storeUseThermalPrinter)
      if (settings.storePaymentInstructions) setStorePaymentInstructions(settings.storePaymentInstructions)
      if (settings.storePaymentQRs) setStorePaymentQRs(settings.storePaymentQRs)
      if (settings.coachCustomPricing !== undefined) setCoachCustomPricing(settings.coachCustomPricing)
      if (settings.allowCoachesToPostCommunity !== undefined) setAllowCoachesToPostCommunity(settings.allowCoachesToPostCommunity)
      if (settings.gymCommissionPercentage !== undefined) setGymCommissionPercentage(settings.gymCommissionPercentage)
      if (settings.biometricFields) setBiometricFields(settings.biometricFields)
      if (settings.footerMission !== undefined) setFooterMission(settings.footerMission)
      if (settings.footerVision !== undefined) setFooterVision(settings.footerVision)
      if (settings.footerLogoSettings) setFooterLogoSettings(settings.footerLogoSettings)
      if (settings.footerSocialLinks) setFooterSocialLinks(settings.footerSocialLinks)
      if (settings.footerPartners) setFooterPartners(settings.footerPartners)
      if (settings.gymSchedule) setGymSchedule(settings.gymSchedule)
      if (settings.trainingPhilosophy) setTrainingPhilosophy(settings.trainingPhilosophy)
      if (settings.landingSettings) setLandingSettings(settings.landingSettings)
    }
  }, [settings])


  // Ocultar si no es admin ni tiene permiso SETTINGS_MANAGE
  if (user?.role !== 'admin' && !user?.permissions?.includes('SETTINGS_MANAGE')) {
    return <div className="p-8 text-center text-destructive font-bold">Acceso Denegado. Solo administradores o personal con permiso de ajustes.</div>
  }

  const handleSaveRole = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!roleForm.name) return
    const newRole = {
      id: roleForm.id || `ROLE-${Date.now()}`,
      name: roleForm.name,
      permissions: roleForm.permissions as any
    }
    let updatedRoles = []
    if (roleForm.id) {
      updatedRoles = roles.map(r => r.id === roleForm.id ? newRole : r)
    } else {
      updatedRoles = [...roles, newRole]
    }
    setRoles(updatedRoles)
    setShowRoleModal(false)
    const res = await updateSettings({ customRoles: updatedRoles })
    if (res && res.success === false) {
      showToast(res.error || "Error al guardar el rol en base de datos.", "error")
    } else {
      showToast(`Rol '${newRole.name}' guardado exitosamente.`, 'success')
    }
  }

  const handleDeleteRole = async (id: string) => {
    const updatedRoles = roles.filter(r => r.id !== id)
    setRoles(updatedRoles)
    const res = await updateSettings({ customRoles: updatedRoles })
    if (res && res.success === false) {
      showToast(res.error || "Error al eliminar el rol en base de datos.", "error")
    } else {
      showToast(`Rol eliminado con éxito.`, 'success')
    }
  }

  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    try {
      const res = await updateSettings({
        appName,
        primaryColor,
        secondaryColor,
        borderColor,
        isGlass,
        fontFamily: fontFamily as any,
        logoUrl,
        logoUrlDark,
        faviconUrl,
        logoSettings,
        footerLogoSettings,
        storeCurrency,
        storeCurrencySecondary,
        storeExchangeRate,
        storeExchangeRateEur,
        storeExchangeRateCop,
        bcvRates: {
          usd: storeExchangeRate,
          eur: storeExchangeRateEur,
          cop: storeExchangeRateCop,
          copToBs: Number(((storeExchangeRate / (storeExchangeRateCop || 3185)) * 1000).toFixed(4)),
          updatedAt: new Date().toISOString(),
          updatedBy: user?.name || "Administrador",
          updatedByRole: (user?.role as string) || "admin",
        },
        bcvRateAlert: {
          id: Date.now().toString(),
          updatedAt: new Date().toISOString(),
          updatedBy: user?.name || "Administración",
          updatedByRole: (user?.role as string) || "admin",
          rates: {
            usd: storeExchangeRate,
            eur: storeExchangeRateEur,
            cop: storeExchangeRateCop,
          }
        },
        storeTaxRate,
        storeReceiptMessage,
        storeNextInvoice: settings.storeNextInvoice || 1,
        storeRif,
        storeAddress,
        storeUseThermalPrinter,
        storePaymentInstructions,
        storePaymentQRs,
        storeTicketWidth: storeTicketWidth as any,
        coachCustomPricing,
        allowCoachesToPostCommunity,
        gymCommissionPercentage,
        biometricFields,
        footerMission,
        footerVision,
        footerSocialLinks,
        footerPartners,
        gymSchedule,
        trainingPhilosophy,
        landingSettings,
        customRoles: roles
      })

      if (res && res.success === false) {
        showToast(res.error || "Error al guardar en base de datos.", "error")
      } else {
        showToast("Ajustes guardados correctamente en el sistema y base de datos.", "success")
      }
    } catch (err: any) {
      showToast("Error inesperado al guardar los ajustes.", "error")
    } finally {
      setIsSaving(false)
    }
  }

  const handleFaviconUpload = (e: any) => { const f = e.target.files?.[0]; if(f) { const r = new FileReader(); r.onloadend = () => setFaviconUrl(r.result as string); r.readAsDataURL(f); } }
  const handleLogoDarkUpload = (e: any) => { const f = e.target.files?.[0]; if(f) { const r = new FileReader(); r.onloadend = () => setLogoUrlDark(r.result as string); r.readAsDataURL(f); } }
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setLogoUrl(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleQRUpload = async (method: 'pagoMovil' | 'pagoMovil2' | 'binance' | 'transferencia' | 'transferencia2', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      try {
        const { compressImage } = await import('@/lib/image-compress')
        const base64 = await compressImage(file, 800, 800, 0.85)
        setStorePaymentQRs(prev => ({ ...prev, [method]: base64 }))
      } catch {
        const reader = new FileReader()
        reader.onloadend = () => {
          setStorePaymentQRs(prev => ({ ...prev, [method]: reader.result as string }))
        }
        reader.readAsDataURL(file)
      }
    }
  }

  return (
    <div className="space-y-6 max-w-full mx-auto w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Ajustes Globales</h1>
          <p className="text-muted-foreground mt-1">
            Personaliza la apariencia de toda la plataforma.
          </p>
        </div>
      </div>

      <Card className="glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-primary" /> Preferencias de Marca
          </CardTitle>
        </CardHeader>
        <CardContent>
                  {/* TABS HEADER */}
        <div className="flex overflow-x-auto border-b border-black/10 dark:border-white/10 mb-8 scrollbar-hide">
          <button type="button" onClick={() => setActiveTab('general')} className={`whitespace-nowrap px-6 py-4 font-bold border-b-2 transition-all ${activeTab === 'general' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>General</button>
          <button type="button" onClick={() => setActiveTab('navbar')} className={`whitespace-nowrap px-6 py-4 font-bold border-b-2 transition-all ${activeTab === 'navbar' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>Pantalla de Login</button>
          <button type="button" onClick={() => setActiveTab('footer')} className={`whitespace-nowrap px-6 py-4 font-bold border-b-2 transition-all ${activeTab === 'footer' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>Footer y Redes</button>
          <button type="button" onClick={() => setActiveTab('landing')} className={`whitespace-nowrap px-6 py-4 font-bold border-b-2 transition-all ${activeTab === 'landing' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>Página Principal (Promocional)</button>
        </div>
        <form onSubmit={handleSave} className="space-y-6">
            
            <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 ${activeTab === "general" ? "" : "hidden"}`}>
              {/* Nombre de la App */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Type className="h-4 w-4 text-muted-foreground" /> Nombre de la Aplicación
                </label>
                <input 
                  type="text" 
                  value={appName}
                  placeholder="Ej. Mi Gimnasio"
                  onChange={(e) => setAppName(e.target.value)}
                  className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-lg p-3 text-sm text-foreground focus:outline-none focus:border-primary" 
                />
              </div>

              {/* Opción para Ocultar o Mostrar Texto en el Brand / Home */}
              <div className="space-y-2 bg-black/5 dark:bg-white/5 p-4 rounded-xl border border-black/10 dark:border-white/10 flex items-center justify-between">
                <div className="pr-4">
                  <span className="text-sm font-bold text-foreground block">Mostrar texto junto al icono / logo (Home)</span>
                  <span className="text-xs text-muted-foreground block">
                    Si desactivas esta opción, solo se mostrará el icono o logo limpio como botón para ir al inicio.
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input 
                    type="checkbox" 
                    checked={logoSettings?.showNameInNavbar ?? true} 
                    onChange={(e) => setLogoSettings(s => ({...s, showNameInNavbar: e.target.checked}))} 
                    className="sr-only peer" 
                  />
                  <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>

              {/* Personalización y Tamaño del Icono / Logo */}
              <div className="space-y-4 md:col-span-2 p-5 rounded-2xl bg-black/5 dark:bg-white/5 border border-primary/20 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-black/10 dark:border-white/10">
                  <div>
                    <h3 className="text-base font-extrabold text-foreground flex items-center gap-2">
                      <Settings className="w-4 h-4 text-primary" /> Personalización del Icono / Logo (Barra y Menú)
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Ajusta las dimensiones, escala y proporciones exactas para que tu icono se visualice con el tamaño ideal.
                    </p>
                  </div>

                  {/* Previsualización en Vivo */}
                  <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-card border border-border shadow-sm min-h-[52px]">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground mr-1">Vista previa:</span>
                    <div 
                      className="flex items-center justify-center transition-all bg-black/5 dark:bg-white/5 rounded-lg border border-black/5 dark:border-white/5"
                      style={{
                        margin: logoSettings?.marginNavbar ? `${logoSettings.marginNavbar}px` : undefined,
                      }}
                    >
                      {(logoUrl || logoUrlDark) ? (
                        <img 
                          src={(theme === 'dark' && logoUrlDark) ? logoUrlDark : (logoUrl || logoUrlDark)} 
                          alt="Preview"
                          style={{
                            width: logoSettings?.widthNavbar || 40,
                            height: logoSettings?.heightNavbar || 40,
                            objectFit: logoSettings?.objectFit || 'contain',
                            padding: logoSettings?.paddingNavbar ? `${logoSettings.paddingNavbar}px` : undefined,
                          }}
                          className="rounded"
                        />
                      ) : (
                        <div 
                          style={{ 
                            width: logoSettings?.widthNavbar || 40, 
                            height: logoSettings?.heightNavbar || 40,
                            padding: logoSettings?.paddingNavbar ? `${logoSettings.paddingNavbar}px` : undefined,
                          }}
                          className="bg-primary/20 rounded-lg flex items-center justify-center font-bold text-primary text-xs"
                        >
                          GP
                        </div>
                      )}
                    </div>
                    {logoSettings?.showNameInNavbar && (
                      <span className="text-sm font-bold text-primary truncate max-w-[120px]">
                        {appName || 'Gimnasio'}
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-2">
                  {/* Ancho */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-bold text-foreground">Ancho</label>
                      <span className="text-xs font-mono font-bold text-primary px-2 py-0.5 rounded bg-primary/10">
                        {logoSettings?.widthNavbar || 40}px
                      </span>
                    </div>
                    <input 
                      type="range" 
                      min="24" 
                      max="160" 
                      value={logoSettings?.widthNavbar || 40} 
                      onChange={e => setLogoSettings(s => ({ ...s, widthNavbar: Number(e.target.value) }))} 
                      className="w-full accent-primary" 
                    />
                    <div className="flex justify-between text-[10px] text-muted-foreground">
                      <span>24px</span>
                      <span>80px</span>
                      <span>160px</span>
                    </div>
                  </div>

                  {/* Alto */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-bold text-foreground">Alto</label>
                      <span className="text-xs font-mono font-bold text-primary px-2 py-0.5 rounded bg-primary/10">
                        {logoSettings?.heightNavbar || 40}px
                      </span>
                    </div>
                    <input 
                      type="range" 
                      min="24" 
                      max="80" 
                      value={logoSettings?.heightNavbar || 40} 
                      onChange={e => setLogoSettings(s => ({ ...s, heightNavbar: Number(e.target.value) }))} 
                      className="w-full accent-primary" 
                    />
                    <div className="flex justify-between text-[10px] text-muted-foreground">
                      <span>24px</span>
                      <span>50px</span>
                      <span>80px</span>
                    </div>
                  </div>

                  {/* Relleno / Padding */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-bold text-foreground">Relleno Interno (Padding)</label>
                      <span className="text-xs font-mono font-bold text-primary px-2 py-0.5 rounded bg-primary/10">
                        {logoSettings?.paddingNavbar || 0}px
                      </span>
                    </div>
                    <input 
                      type="range" 
                      min="0" 
                      max="24" 
                      value={logoSettings?.paddingNavbar || 0} 
                      onChange={e => setLogoSettings(s => ({ ...s, paddingNavbar: Number(e.target.value) }))} 
                      className="w-full accent-primary" 
                    />
                    <div className="flex justify-between text-[10px] text-muted-foreground">
                      <span>0px (Pegado)</span>
                      <span>8px (Equilibrado)</span>
                      <span>24px (Espacioso)</span>
                    </div>
                  </div>

                  {/* Margen Exterior */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-bold text-foreground">Margen Exterior (Separación)</label>
                      <span className="text-xs font-mono font-bold text-primary px-2 py-0.5 rounded bg-primary/10">
                        {logoSettings?.marginNavbar || 0}px
                      </span>
                    </div>
                    <input 
                      type="range" 
                      min="0" 
                      max="24" 
                      value={logoSettings?.marginNavbar || 0} 
                      onChange={e => setLogoSettings(s => ({ ...s, marginNavbar: Number(e.target.value) }))} 
                      className="w-full accent-primary" 
                    />
                    <div className="flex justify-between text-[10px] text-muted-foreground">
                      <span>0px</span>
                      <span>8px</span>
                      <span>24px</span>
                    </div>
                  </div>
                </div>

                {/* Ajuste de Proporción / Object Fit */}
                <div className="space-y-2 pt-2 border-t border-black/5 dark:border-white/5">
                  <label className="text-xs font-bold text-foreground block">Ajuste de Proporción (Object Fit)</label>
                  <select
                    value={logoSettings?.objectFit || 'contain'}
                    onChange={e => setLogoSettings(s => ({ ...s, objectFit: e.target.value as any }))}
                    className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-lg p-2.5 text-xs text-foreground focus:border-primary"
                  >
                    <option value="contain">Contener (Sin distorsión, proporción natural del logo)</option>
                    <option value="cover">Cubrir (Llenar caja completa)</option>
                    <option value="fill">Rellenar (Estirar proporcionalmente)</option>
                  </select>
                  <span className="text-[10px] text-muted-foreground block">
                    Con el padding y margen puedes centrar el icono y darle respiración para que quede impecable tanto en pantallas pequeñas como grandes.
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-bold flex items-center gap-2 text-primary">Marca y Logos</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Favicon */}
                  <div className="space-y-2 bg-black/5 dark:bg-white/5 p-4 rounded-xl border border-black/10 dark:border-white/10 text-center relative group">
                    <label className="text-sm font-medium text-muted-foreground block mb-2">Favicon (Pestaña)</label>
                    <div className="w-16 h-16 mx-auto bg-white dark:bg-black/40 rounded-xl flex items-center justify-center overflow-hidden border border-black/10 dark:border-white/10">
                      {faviconUrl ? <img src={faviconUrl} alt="Favicon" className="w-full h-full object-contain" /> : <span className="text-xs">Subir</span>}
                    </div>
                    <span className="text-[10px] text-muted-foreground block mt-1">SVG, PNG, JPG o ICO</span>
                    <input type="file" accept=".svg,.png,.jpg,.jpeg,.webp,.ico,image/svg+xml,image/png,image/jpeg,image/webp,image/x-icon" onChange={handleFaviconUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                    {faviconUrl && <button type="button" onClick={() => setFaviconUrl("")} className="mt-2 text-xs text-destructive hover:underline relative z-10">Quitar</button>}
                  </div>

                  {/* Logo Claro */}
                  <div className="space-y-2 bg-black/5 dark:bg-white/5 p-4 rounded-xl border border-black/10 dark:border-white/10 text-center relative group">
                    <label className="text-sm font-medium text-muted-foreground block mb-2">Logo (Modo Claro)</label>
                    <div className="w-32 h-16 mx-auto bg-white rounded-xl flex items-center justify-center overflow-hidden border border-black/10 dark:border-white/10">
                      {logoUrl ? <img src={logoUrl} alt="Logo" className="w-full h-full object-contain p-1" /> : <span className="text-xs text-black">Subir</span>}
                    </div>
                    <span className="text-[10px] text-muted-foreground block mt-1">SVG, PNG o JPG (Hasta 5MB)</span>
                    <input type="file" accept=".svg,.png,.jpg,.jpeg,.webp,image/svg+xml,image/png,image/jpeg,image/webp" onChange={handleLogoUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                    {logoUrl && <button type="button" onClick={() => setLogoUrl("")} className="mt-2 text-xs text-destructive hover:underline relative z-10">Quitar</button>}
                  </div>

                  {/* Logo Oscuro */}
                  <div className="space-y-2 bg-black/5 dark:bg-white/5 p-4 rounded-xl border border-black/10 dark:border-white/10 text-center relative group">
                    <label className="text-sm font-medium text-muted-foreground block mb-2">Logo (Modo Oscuro)</label>
                    <div className="w-32 h-16 mx-auto bg-black rounded-xl flex items-center justify-center overflow-hidden border border-black/10 dark:border-white/10">
                      {logoUrlDark ? <img src={logoUrlDark} alt="Logo Dark" className="w-full h-full object-contain p-1" /> : <span className="text-xs text-white">Subir (Opcional)</span>}
                    </div>
                    <span className="text-[10px] text-muted-foreground block mt-1">SVG, PNG o JPG (Hasta 5MB)</span>
                    <input type="file" accept=".svg,.png,.jpg,.jpeg,.webp,image/svg+xml,image/png,image/jpeg,image/webp" onChange={handleLogoDarkUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                    {logoUrlDark && <button type="button" onClick={() => setLogoUrlDark("")} className="mt-2 text-xs text-destructive hover:underline relative z-10">Quitar</button>}
                  </div>
                </div>
              </div>



              {/* Color Principal */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Palette className="h-4 w-4 text-muted-foreground" /> Color Principal (Acento)
                </label>
                <div className="flex items-center gap-3">
                  <input 
                    type="color" 
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="h-10 w-12 bg-transparent cursor-pointer rounded border-0 p-0" 
                  />
                  <input 
                    type="text" 
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="flex-1 bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-lg p-3 text-sm text-foreground focus:outline-none focus:border-primary uppercase" 
                  />
                </div>
              </div>

              {/* Color Secundario */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Palette className="h-4 w-4 text-muted-foreground" /> Color Secundario
                </label>
                <div className="flex items-center gap-3">
                  <input 
                    type="color" 
                    value={secondaryColor}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                    className="h-10 w-12 bg-transparent cursor-pointer rounded border-0 p-0" 
                  />
                  <input 
                    type="text" 
                    value={secondaryColor}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                    className="flex-1 bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-lg p-3 text-sm text-foreground focus:outline-none focus:border-primary uppercase" 
                  />
                </div>
              </div>

              {/* Color del Delineado */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Palette className="h-4 w-4 text-muted-foreground" /> Color Delineado (Bordes)
                </label>
                <div className="flex items-center gap-3">
                  <input 
                    type="color" 
                    value={borderColor}
                    onChange={(e) => setBorderColor(e.target.value)}
                    className="h-10 w-12 bg-transparent cursor-pointer rounded border-0 p-0" 
                  />
                  <input 
                    type="text" 
                    value={borderColor}
                    onChange={(e) => setBorderColor(e.target.value)}
                    className="flex-1 bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-lg p-3 text-sm text-foreground focus:outline-none focus:border-primary uppercase" 
                  />
                </div>
              </div>

              {/* Tipografía */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Type className="h-4 w-4 text-muted-foreground" /> Tipografía Global
                </label>
                <select 
                  value={fontFamily}
                  onChange={(e) => setFontFamily(e.target.value as any)}
                  className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-lg p-3 text-sm text-foreground focus:outline-none focus:border-primary"
                >
                  <option value="arvo">Arvo (Deportiva / Slab Serif)</option>
                  <option value="inter">Inter (Moderna / Sans Serif)</option>
                  <option value="roboto">Roboto (Clásica / Sans Serif)</option>
                </select>
              </div>

              {/* Efecto Desvanecido */}
              <div className="space-y-2 md:col-span-2">
                <label className="flex items-center gap-3 cursor-pointer p-4 bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-lg hover:border-primary/50 transition">
                  <input 
                    type="checkbox" 
                    checked={isGlass}
                    onChange={(e) => setIsGlass(e.target.checked)}
                    className="h-5 w-5 accent-primary cursor-pointer"
                  />
                  <div>
                    <span className="text-sm font-medium block">Efecto Desvanecido (Glassmorphism)</span>
                    <span className="text-xs text-muted-foreground">Si está activo, las tarjetas tendrán fondos semitransparentes. Desactívalo para colores sólidos.</span>
                  </div>
                </label>
              </div>
            </div>

            <div className="pt-4 border-t border-black/10 dark:border-white/10 mt-6 pt-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6 pb-2 border-b border-black/10 dark:border-white/10">
                <div>
                  <h3 className="text-lg font-bold flex items-center gap-2 text-foreground">
                    <Store className="h-5 w-5 text-primary" /> Configuración de Tienda y Facturación
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Administra datos comerciales, divisas, sincronización de tasa oficial BCV, tickets e impuestos.
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 1. DATOS FISCALES Y COMERCIALES */}
                <div className="md:col-span-2 p-5 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-black/5 dark:border-white/5">
                    <Building2 className="h-4 w-4 text-primary" />
                    <div>
                      <h4 className="text-sm font-bold text-foreground">Datos Fiscales y Comerciales</h4>
                      <p className="text-xs text-muted-foreground">Información que se imprimirá en los tickets y facturas de venta emitidas.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block">NIT / RIF Comercial</label>
                      <input 
                        type="text" 
                        value={storeRif}
                        onChange={(e) => setStoreRif(e.target.value)}
                        placeholder="Ej. J-12345678-9"
                        className="w-full bg-card border border-black/10 dark:border-white/10 rounded-xl p-3 text-sm focus:border-primary transition" 
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block">Dirección Comercial (Exclusiva para Tickets)</label>
                      <input 
                        type="text" 
                        value={storeAddress}
                        onChange={(e) => setStoreAddress(e.target.value)}
                        placeholder="Ej. Av. Principal..."
                        className="w-full bg-card border border-black/10 dark:border-white/10 rounded-xl p-3 text-sm focus:border-primary transition" 
                      />
                    </div>
                  </div>
                </div>

                {/* 2. DIVISAS Y TASA OFICIAL BCV (USD, EUR, COP) */}
                <div className="md:col-span-2 p-5 rounded-2xl bg-gradient-to-br from-emerald-500/[0.04] to-transparent border border-emerald-500/20 dark:border-emerald-500/30 space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-emerald-500/15">
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-lg bg-emerald-500/10 dark:bg-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                        <Coins className="h-4 w-4" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-foreground">Divisas y Tasas Oficiales (BCV & TRM)</h4>
                        <p className="text-xs text-muted-foreground">Configura las monedas del sistema y sincroniza cotizaciones de Dólar, Euro y Pesos Colombianos.</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto font-mono text-xs">
                      <span className="px-2.5 py-1 rounded-xl bg-card border border-emerald-500/25 text-emerald-600 dark:text-emerald-400 font-bold shadow-sm">
                        🇺🇸 Bs. {Number(storeExchangeRate || 0).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
                      </span>
                      <span className="px-2.5 py-1 rounded-xl bg-card border border-blue-500/25 text-blue-600 dark:text-blue-400 font-bold shadow-sm">
                        🇪🇺 Bs. {Number(storeExchangeRateEur || 0).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
                      </span>
                      <span className="px-2.5 py-1 rounded-xl bg-card border border-amber-500/25 text-amber-600 dark:text-amber-400 font-bold shadow-sm">
                        🇨🇴 {Number(storeExchangeRateCop || 0).toLocaleString('es-CO')} COP
                      </span>
                    </div>
                  </div>

                  {/* Selección de Monedas Base y Secundaria */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5 p-4 rounded-xl bg-card border border-black/10 dark:border-white/10">
                      <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">Moneda Base (Precios del Sistema)</label>
                      <p className="text-xs text-muted-foreground mb-2">Moneda principal en la que registras productos y planes (Ej. 30 = 30 USD)</p>
                      <div className="flex gap-2">
                        <select 
                          value={['USD', 'BsS', 'EUR', 'COP'].includes(storeCurrency) ? storeCurrency : 'Otra'}
                          onChange={(e) => setStoreCurrency(e.target.value === 'Otra' ? '' : e.target.value)}
                          className="bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-lg p-2.5 text-sm font-medium focus:border-primary flex-1"
                        >
                          <option value="USD">USD ($ - Dólares)</option>
                          <option value="BsS">BsS (Bs. - Bolívares)</option>
                          <option value="EUR">EUR (€ - Euros)</option>
                          <option value="COP">COP ($ - Pesos Col.)</option>
                          <option value="Otra">Otra...</option>
                        </select>
                        {!['USD', 'BsS', 'EUR', 'COP'].includes(storeCurrency) && (
                          <input type="text" value={storeCurrency} onChange={(e) => setStoreCurrency(e.target.value)} placeholder="Ej. MXN" className="w-28 bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-lg p-2.5 text-sm focus:border-primary" />
                        )}
                      </div>
                    </div>

                    <div className="space-y-1.5 p-4 rounded-xl bg-card border border-black/10 dark:border-white/10">
                      <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">Moneda Secundaria (Equivalencia)</label>
                      <p className="text-xs text-muted-foreground mb-2">Se mostrará junto al precio principal en tienda, membresías y finanzas</p>
                      <div className="flex gap-2">
                        <select 
                          value={['USD', 'BsS', 'EUR', 'COP'].includes(storeCurrencySecondary) ? storeCurrencySecondary : 'Otra'}
                          onChange={(e) => setStoreCurrencySecondary(e.target.value === 'Otra' ? '' : e.target.value)}
                          className="bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-lg p-2.5 text-sm font-medium focus:border-primary flex-1"
                        >
                          <option value="USD">USD ($ - Dólares)</option>
                          <option value="BsS">BsS (Bs. - Bolívares)</option>
                          <option value="EUR">EUR (€ - Euros)</option>
                          <option value="COP">COP ($ - Pesos Col.)</option>
                          <option value="Otra">Otra...</option>
                        </select>
                        {!['USD', 'BsS', 'EUR', 'COP'].includes(storeCurrencySecondary) && (
                          <input type="text" value={storeCurrencySecondary} onChange={(e) => setStoreCurrencySecondary(e.target.value)} placeholder="Ej. MXN" className="w-28 bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-lg p-2.5 text-sm focus:border-primary" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Panel de Tasas de Cambio & Botón Sincronización */}
                  <div className="p-4 sm:p-5 rounded-xl bg-card border border-emerald-500/20 dark:border-emerald-500/30 space-y-4 shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <label className="text-xs font-bold uppercase tracking-wider text-foreground block">
                          Cotizaciones de Cambio Oficiales (Dólar, Euro, Peso Colombiano)
                        </label>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Valores utilizados para calcular equivalencias en ventas, cobros y punto de venta.
                        </p>
                      </div>

                      <button
                        type="button"
                        disabled={isFetchingBcv}
                        onClick={handleFetchBcv}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all cursor-pointer disabled:opacity-60 shrink-0 self-start sm:self-auto"
                      >
                        {isFetchingBcv ? (
                          <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <span>🏦</span>
                        )}
                        <span>{isFetchingBcv ? "Consultando Tasas..." : "Sincronizar Tasas Oficiales Hoy"}</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* USD */}
                      <div className="space-y-1.5 p-3 rounded-xl bg-black/5 dark:bg-white/5 border border-emerald-500/25">
                        <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                          <span>🇺🇸</span> Dólar Oficial BCV (USD)
                        </label>
                        <div className="relative">
                          <input 
                            type="number" 
                            step="0.0001" 
                            value={storeExchangeRate} 
                            onChange={(e) => setStoreExchangeRate(Number(e.target.value))} 
                            placeholder="Ej. 886.2271" 
                            className="w-full bg-card border border-emerald-500/30 focus:border-emerald-500 rounded-lg p-2.5 text-sm font-bold pr-14 text-foreground transition" 
                          />
                          <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-black text-muted-foreground">
                            Bs. / $
                          </span>
                        </div>
                        <p className="text-[10px] text-muted-foreground">Tasa principal de conversión.</p>
                      </div>

                      {/* EUR */}
                      <div className="space-y-1.5 p-3 rounded-xl bg-black/5 dark:bg-white/5 border border-blue-500/25">
                        <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                          <span>🇪🇺</span> Euro Oficial BCV (EUR)
                        </label>
                        <div className="relative">
                          <input 
                            type="number" 
                            step="0.0001" 
                            value={storeExchangeRateEur} 
                            onChange={(e) => setStoreExchangeRateEur(Number(e.target.value))} 
                            placeholder="Ej. 993.0883" 
                            className="w-full bg-card border border-blue-500/30 focus:border-blue-500 rounded-lg p-2.5 text-sm font-bold pr-14 text-foreground transition" 
                          />
                          <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-black text-muted-foreground">
                            Bs. / €
                          </span>
                        </div>
                        <p className="text-[10px] text-muted-foreground">Cotización oficial Banco Central.</p>
                      </div>

                      {/* COP */}
                      <div className="space-y-1.5 p-3 rounded-xl bg-black/5 dark:bg-white/5 border border-amber-500/25">
                        <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                          <span>🇨🇴</span> Peso Colombiano (TRM)
                        </label>
                        <div className="relative">
                          <input 
                            type="number" 
                            step="0.01" 
                            value={storeExchangeRateCop} 
                            onChange={(e) => setStoreExchangeRateCop(Number(e.target.value))} 
                            placeholder="Ej. 3185.01" 
                            className="w-full bg-card border border-amber-500/30 focus:border-amber-500 rounded-lg p-2.5 text-sm font-bold pr-16 text-foreground transition" 
                          />
                          <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-black text-muted-foreground">
                            COP / $
                          </span>
                        </div>
                        <p className="text-[10px] text-muted-foreground">Tasa Representativa del Mercado.</p>
                      </div>
                    </div>

                    <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-muted-foreground">
                      💡 <strong>Aviso a Recepción:</strong> Al pulsar "Guardar Cambios" con nuevas tasas, el panel de <strong>Recepción y Caja</strong> mostrará una alerta automática obligatoria informándole al personal que debe notificar a los atletas sobre las nuevas tasas antes de cobrar.
                    </div>
                  </div>
                </div>

                {/* 3. FACTURACIÓN E IMPRESIÓN */}
                <div className="md:col-span-2 p-5 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-black/5 dark:border-white/5">
                    <Receipt className="h-4 w-4 text-primary" />
                    <div>
                      <h4 className="text-sm font-bold text-foreground">Facturación, Impuestos e Impresión de Tickets</h4>
                      <p className="text-xs text-muted-foreground">Configuración de formato de impresión para tickeras térmicas o estándar e impuestos de ley.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block">Impuesto (IVA) %</label>
                      <input 
                        type="number" 
                        value={storeTaxRate}
                        onChange={(e) => setStoreTaxRate(Number(e.target.value))}
                        className="w-full bg-card border border-black/10 dark:border-white/10 rounded-xl p-3 text-sm focus:border-primary transition" 
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block">Formato de Ticket (Impresora)</label>
                      <select 
                        value={storeTicketWidth}
                        onChange={(e) => setStoreTicketWidth(e.target.value as any)}
                        className="w-full bg-card border border-black/10 dark:border-white/10 rounded-xl p-3 text-sm focus:border-primary transition" 
                      >
                        <option value="80mm">80mm (Tickera Grande)</option>
                        <option value="58mm">58mm (Tickera Pequeña)</option>
                        <option value="Carta">Tamaño Carta (Impresora Normal)</option>
                      </select>
                      
                      <label className="flex items-center gap-2 mt-2 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={storeUseThermalPrinter}
                          onChange={(e) => setStoreUseThermalPrinter(e.target.checked)}
                          className="accent-primary h-4 w-4"
                        />
                        <span className="text-xs font-medium">Impresión Térmica Automática</span>
                      </label>
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block">Mensaje de Agradecimiento (Pie de Ticket)</label>
                      <input 
                        type="text" 
                        value={storeReceiptMessage}
                        onChange={(e) => setStoreReceiptMessage(e.target.value)}
                        placeholder="Ej. ¡Gracias por entrenar con nosotros!"
                        className="w-full bg-card border border-black/10 dark:border-white/10 rounded-xl p-3 text-sm focus:border-primary transition" 
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-black/5 dark:border-white/5 md:col-span-2">
                  <h4 className="text-sm font-bold text-primary">Precios y Comisiones de Entrenadores</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-black/5 dark:bg-white/5 p-4 rounded-xl border border-black/10 dark:border-white/10">
                      <label className="flex items-center gap-2 mb-2 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={coachCustomPricing}
                          onChange={(e) => setCoachCustomPricing(e.target.checked)}
                          className="accent-primary h-4 w-4"
                        />
                        <span className="font-bold text-sm">Entrenadores fijan su propia cuota</span>
                      </label>
                      <p className="text-xs text-muted-foreground">
                        Si está activo, al registrar un empleado el valor de "Comisión x Atleta" se tratará como el precio público que el atleta debe pagar para entrenar con esa persona.
                      </p>
                    </div>
                    <div className="bg-black/5 dark:bg-white/5 p-4 rounded-xl border border-black/10 dark:border-white/10">
                      <label className="text-sm font-bold block mb-1">Porcentaje del Gimnasio (%)</label>
                      <input 
                        type="number" 
                        value={gymCommissionPercentage}
                        onChange={(e) => setGymCommissionPercentage(Number(e.target.value))}
                        placeholder="Ej. 30"
                        className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-lg p-3 text-sm focus:border-primary" 
                      />
                      <p className="text-xs text-muted-foreground mt-2">
                        {coachCustomPricing 
                          ? "Del precio que el entrenador defina, el gimnasio retendrá este porcentaje como ganancia."
                          : "Del precio asignado por el gimnasio para el entrenador, el gimnasio retendrá este porcentaje como ganancia y el resto es para el entrenador."
                        }
                      </p>
                    </div>

                    <div className="bg-black/5 dark:bg-white/5 p-4 rounded-xl border border-black/10 dark:border-white/10 md:col-span-2">
                      <label className="flex items-center gap-2 mb-2 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={allowCoachesToPostCommunity}
                          onChange={(e) => setAllowCoachesToPostCommunity(e.target.checked)}
                          className="accent-primary h-4 w-4"
                        />
                        <span className="font-bold text-sm">Permitir a los Entrenadores Publicar en Comunidad</span>
                      </label>
                      <p className="text-xs text-muted-foreground">
                        Si está activo, los entrenadores pueden redactar avisos, consejos y comunicados oficiales en el muro de la Comunidad. Puedes revocar o conceder este permiso de forma individual por empleado en la pestaña de Roles y Permisos.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="space-y-6 md:col-span-2 pt-6 border-t border-black/10 dark:border-white/10">
                  <div>
                    <h4 className="font-extrabold text-base text-primary flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-primary" /> Datos e Instrucciones de Pago
                    </h4>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Configura hasta dos cuentas bancarias para Pago Móvil y Transferencia, con sus respectivos códigos QR.
                    </p>
                  </div>

                  {/* BLOQUE PAGO MÓVIL (CUENTA 1 Y CUENTA 2) */}
                  <div className="p-5 rounded-2xl bg-black/5 dark:bg-white/5 border border-primary/20 space-y-4">
                    <h5 className="font-bold text-sm text-foreground flex items-center justify-between">
                      <span>📲 Pago Móvil (Hasta 2 Cuentas)</span>
                    </h5>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Cuenta 1 */}
                      <div className="p-4 rounded-xl bg-card border border-black/10 dark:border-white/10 space-y-3">
                        <span className="text-xs font-bold text-primary block">Cuenta Principal (Cuenta #1)</span>
                        <textarea 
                          rows={3} 
                          value={storePaymentInstructions.pagoMovil} 
                          onChange={(e) => setStorePaymentInstructions(prev => ({...prev, pagoMovil: e.target.value}))} 
                          className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-lg p-2.5 text-xs focus:border-primary font-mono" 
                          placeholder="Banco: ...&#10;Cédula: ...&#10;Teléfono: ..." 
                        />
                        <div>
                          <label className="text-[11px] font-bold text-muted-foreground block mb-1">Código QR (Cuenta #1)</label>
                          {!storePaymentQRs.pagoMovil ? (
                            <label className="flex items-center justify-center gap-2 w-full bg-black/5 dark:bg-black/30 border border-dashed border-black/15 dark:border-white/15 rounded-lg p-3 text-xs text-muted-foreground hover:bg-primary/10 hover:text-primary cursor-pointer transition">
                              <QrCode className="h-4 w-4" />
                              <span>Subir QR Cuenta 1</span>
                              <input type="file" accept="image/*" onChange={(e) => handleQRUpload('pagoMovil', e)} className="hidden" />
                            </label>
                          ) : (
                            <div className="flex items-center gap-3">
                              <img src={storePaymentQRs.pagoMovil} className="h-14 w-14 object-contain rounded border border-white/10 bg-white/5 p-1" />
                              <button type="button" onClick={() => setStorePaymentQRs(p => ({...p, pagoMovil: ''}))} className="text-xs text-destructive hover:underline font-bold">Eliminar QR 1</button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Cuenta 2 */}
                      <div className="p-4 rounded-xl bg-card border border-black/10 dark:border-white/10 space-y-3">
                        <span className="text-xs font-bold text-primary block">Cuenta Secundaria (Cuenta #2 - Opcional)</span>
                        <textarea 
                          rows={3} 
                          value={storePaymentInstructions.pagoMovil2 || ''} 
                          onChange={(e) => setStorePaymentInstructions(prev => ({...prev, pagoMovil2: e.target.value}))} 
                          className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-lg p-2.5 text-xs focus:border-primary font-mono" 
                          placeholder="Banco: ...&#10;Cédula: ...&#10;Teléfono: ..." 
                        />
                        <div>
                          <label className="text-[11px] font-bold text-muted-foreground block mb-1">Código QR (Cuenta #2)</label>
                          {!storePaymentQRs.pagoMovil2 ? (
                            <label className="flex items-center justify-center gap-2 w-full bg-black/5 dark:bg-black/30 border border-dashed border-black/15 dark:border-white/15 rounded-lg p-3 text-xs text-muted-foreground hover:bg-primary/10 hover:text-primary cursor-pointer transition">
                              <QrCode className="h-4 w-4" />
                              <span>Subir QR Cuenta 2</span>
                              <input type="file" accept="image/*" onChange={(e) => handleQRUpload('pagoMovil2', e)} className="hidden" />
                            </label>
                          ) : (
                            <div className="flex items-center gap-3">
                              <img src={storePaymentQRs.pagoMovil2} className="h-14 w-14 object-contain rounded border border-white/10 bg-white/5 p-1" />
                              <button type="button" onClick={() => setStorePaymentQRs(p => ({...p, pagoMovil2: ''}))} className="text-xs text-destructive hover:underline font-bold">Eliminar QR 2</button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* BLOQUE TRANSFERENCIA BANCARIA (CUENTA 1 Y CUENTA 2) */}
                  <div className="p-5 rounded-2xl bg-black/5 dark:bg-white/5 border border-primary/20 space-y-4">
                    <h5 className="font-bold text-sm text-foreground flex items-center justify-between">
                      <span>🏦 Transferencia Bancaria (Hasta 2 Cuentas)</span>
                    </h5>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Cuenta 1 */}
                      <div className="p-4 rounded-xl bg-card border border-black/10 dark:border-white/10 space-y-3">
                        <span className="text-xs font-bold text-primary block">Cuenta Principal (Cuenta #1)</span>
                        <textarea 
                          rows={3} 
                          value={storePaymentInstructions.transferencia} 
                          onChange={(e) => setStorePaymentInstructions(prev => ({...prev, transferencia: e.target.value}))} 
                          className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-lg p-2.5 text-xs focus:border-primary font-mono" 
                          placeholder="Banco: ...&#10;Número de Cuenta: ...&#10;Titular / RIF: ..." 
                        />
                        <div>
                          <label className="text-[11px] font-bold text-muted-foreground block mb-1">Código QR (Cuenta #1)</label>
                          {!storePaymentQRs.transferencia ? (
                            <label className="flex items-center justify-center gap-2 w-full bg-black/5 dark:bg-black/30 border border-dashed border-black/15 dark:border-white/15 rounded-lg p-3 text-xs text-muted-foreground hover:bg-primary/10 hover:text-primary cursor-pointer transition">
                              <QrCode className="h-4 w-4" />
                              <span>Subir QR Cuenta 1</span>
                              <input type="file" accept="image/*" onChange={(e) => handleQRUpload('transferencia', e)} className="hidden" />
                            </label>
                          ) : (
                            <div className="flex items-center gap-3">
                              <img src={storePaymentQRs.transferencia} className="h-14 w-14 object-contain rounded border border-white/10 bg-white/5 p-1" />
                              <button type="button" onClick={() => setStorePaymentQRs(p => ({...p, transferencia: ''}))} className="text-xs text-destructive hover:underline font-bold">Eliminar QR 1</button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Cuenta 2 */}
                      <div className="p-4 rounded-xl bg-card border border-black/10 dark:border-white/10 space-y-3">
                        <span className="text-xs font-bold text-primary block">Cuenta Secundaria (Cuenta #2 - Opcional)</span>
                        <textarea 
                          rows={3} 
                          value={storePaymentInstructions.transferencia2 || ''} 
                          onChange={(e) => setStorePaymentInstructions(prev => ({...prev, transferencia2: e.target.value}))} 
                          className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-lg p-2.5 text-xs focus:border-primary font-mono" 
                          placeholder="Banco: ...&#10;Número de Cuenta: ...&#10;Titular / RIF: ..." 
                        />
                        <div>
                          <label className="text-[11px] font-bold text-muted-foreground block mb-1">Código QR (Cuenta #2)</label>
                          {!storePaymentQRs.transferencia2 ? (
                            <label className="flex items-center justify-center gap-2 w-full bg-black/5 dark:bg-black/30 border border-dashed border-black/15 dark:border-white/15 rounded-lg p-3 text-xs text-muted-foreground hover:bg-primary/10 hover:text-primary cursor-pointer transition">
                              <QrCode className="h-4 w-4" />
                              <span>Subir QR Cuenta 2</span>
                              <input type="file" accept="image/*" onChange={(e) => handleQRUpload('transferencia2', e)} className="hidden" />
                            </label>
                          ) : (
                            <div className="flex items-center gap-3">
                              <img src={storePaymentQRs.transferencia2} className="h-14 w-14 object-contain rounded border border-white/10 bg-white/5 p-1" />
                              <button type="button" onClick={() => setStorePaymentQRs(p => ({...p, transferencia2: ''}))} className="text-xs text-destructive hover:underline font-bold">Eliminar QR 2</button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* BLOQUE BINANCE PAY (CUENTA ÚNICA) */}
                  <div className="p-5 rounded-2xl bg-black/5 dark:bg-white/5 border border-primary/20 space-y-4">
                    <h5 className="font-bold text-sm text-foreground">🟡 Binance Pay (Cuenta Única)</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-medium block">Datos de Binance Pay</label>
                        <textarea 
                          rows={3} 
                          value={storePaymentInstructions.binance} 
                          onChange={(e) => setStorePaymentInstructions(prev => ({...prev, binance: e.target.value}))} 
                          className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-lg p-2.5 text-xs focus:border-primary font-mono" 
                          placeholder="Email: ...&#10;Pay ID: ..." 
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-medium block">Código QR Binance Pay</label>
                        {!storePaymentQRs.binance ? (
                          <label className="flex items-center justify-center gap-2 w-full bg-black/5 dark:bg-black/30 border border-dashed border-black/15 dark:border-white/15 rounded-lg p-3 text-xs text-muted-foreground hover:bg-primary/10 hover:text-primary cursor-pointer transition">
                            <QrCode className="h-4 w-4" />
                            <span>Subir QR Binance Pay</span>
                            <input type="file" accept="image/*" onChange={(e) => handleQRUpload('binance', e)} className="hidden" />
                          </label>
                        ) : (
                          <div className="flex items-center gap-3">
                            <img src={storePaymentQRs.binance} className="h-14 w-14 object-contain rounded border border-white/10 bg-white/5 p-1" />
                            <button type="button" onClick={() => setStorePaymentQRs(p => ({...p, binance: ''}))} className="text-xs text-destructive hover:underline font-bold">Eliminar QR</button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* PANEL DE PANTALLA DE LOGIN */}
            <div className={`space-y-8 ${activeTab === "navbar" ? "" : "hidden"}`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-primary/10 border border-primary/20">
                <div>
                  <h3 className="text-lg font-black text-foreground flex items-center gap-2">
                    <User className="w-5 h-5 text-primary" /> Personalización de Pantalla de Login
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Modifica el logo, las letras de la empresa, dimensiones y previsualización de la pantalla de inicio de sesión.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Previsualización en Tiempo Real del Login */}
                <div className="space-y-4 bg-black/5 dark:bg-white/5 p-6 rounded-2xl border border-black/10 dark:border-white/10 flex flex-col justify-center">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Vista Previa en Vivo (Pantalla de Login)</label>
                  <div className="w-full bg-zinc-100 dark:bg-zinc-950 border border-black/10 dark:border-white/10 rounded-2xl p-6 flex flex-col items-center justify-center min-h-[320px]">
                    <div className="w-full max-w-xs bg-white dark:bg-zinc-900 border border-black/10 dark:border-white/10 p-6 rounded-2xl shadow-xl flex flex-col items-center">
                      {logoSettings?.showInLogin && (logoUrl || logoUrlDark) && (
                        <img 
                          src={(theme === 'dark' && logoUrlDark) ? logoUrlDark : (logoUrl || logoUrlDark)} 
                          alt="Logo Login" 
                          style={{ 
                            width: `${logoSettings.widthLogin || 96}px`, 
                            height: `${logoSettings.heightLogin || 96}px`, 
                            objectFit: logoSettings.objectFit || 'contain',
                            maskImage: logoSettings.fadeEffect ? 'linear-gradient(to bottom, black 50%, transparent 100%)' : 'none',
                            WebkitMaskImage: logoSettings.fadeEffect ? 'linear-gradient(to bottom, black 50%, transparent 100%)' : 'none'
                          }} 
                          className="mb-2 transition-all" 
                        />
                      )}
                      {logoSettings?.showNameInLogin && (
                        <h2 className="font-extrabold text-xl text-foreground text-center uppercase tracking-tight mt-1">
                          {appName || "Nombre de Empresa"}
                        </h2>
                      )}
                      <p className="text-[10px] text-muted-foreground text-center mt-0.5">Ingresa tus credenciales para continuar</p>
                      <div className="w-full mt-4 space-y-2 opacity-60 pointer-events-none">
                        <div className="h-8 w-full bg-black/5 dark:bg-white/10 rounded-lg border border-black/10 dark:border-white/10 flex items-center px-3 text-[10px] text-muted-foreground">Cédula de identidad</div>
                        <div className="h-8 w-full bg-black/5 dark:bg-white/10 rounded-lg border border-black/10 dark:border-white/10 flex items-center px-3 text-[10px] text-muted-foreground">••••••••</div>
                        <div className="h-8 w-full bg-primary text-primary-foreground rounded-lg flex items-center justify-center text-xs font-bold">Iniciar Sesión</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Controles de Configuración de Login */}
                <div className="space-y-6 bg-black/5 dark:bg-white/5 p-6 rounded-2xl border border-black/10 dark:border-white/10 flex flex-col justify-between">
                  <div className="space-y-5">
                    {/* Nombre y Letras de la Empresa para el Login */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-foreground block">
                        Nombre de la Empresa / Letras para Login
                      </label>
                      <input 
                        type="text" 
                        value={appName} 
                        onChange={(e) => setAppName(e.target.value)} 
                        placeholder="Ej. Mi Gimnasio Club" 
                        className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-lg p-3 text-sm focus:border-primary font-medium" 
                      />
                      <p className="text-[11px] text-muted-foreground">Este texto se muestra debajo del logo en la pantalla de inicio de sesión.</p>
                    </div>

                    {/* Opciones de Visibilidad */}
                    <div className="grid grid-cols-2 gap-3 pt-1">
                      <label className="flex items-center gap-2 p-3 bg-black/5 dark:bg-black/30 border border-black/10 dark:border-white/10 rounded-xl cursor-pointer hover:border-primary/40 transition">
                        <input 
                          type="checkbox" 
                          checked={logoSettings?.showInLogin ?? true} 
                          onChange={(e) => setLogoSettings(s => ({...s, showInLogin: e.target.checked}))} 
                          className="accent-primary w-4 h-4" 
                        />
                        <span className="text-xs font-bold">Mostrar Logo</span>
                      </label>
                      <label className="flex items-center gap-2 p-3 bg-black/5 dark:bg-black/30 border border-black/10 dark:border-white/10 rounded-xl cursor-pointer hover:border-primary/40 transition">
                        <input 
                          type="checkbox" 
                          checked={logoSettings?.showNameInLogin ?? true} 
                          onChange={(e) => setLogoSettings(s => ({...s, showNameInLogin: e.target.checked}))} 
                          className="accent-primary w-4 h-4" 
                        />
                        <span className="text-xs font-bold">Mostrar Letras</span>
                      </label>
                      <label className="flex items-center gap-2 p-3 bg-black/5 dark:bg-black/30 border border-black/10 dark:border-white/10 rounded-xl cursor-pointer hover:border-primary/40 transition col-span-2">
                        <input 
                          type="checkbox" 
                          checked={logoSettings?.fadeEffect ?? false} 
                          onChange={(e) => setLogoSettings(s => ({...s, fadeEffect: e.target.checked}))} 
                          className="accent-primary w-4 h-4" 
                        />
                        <span className="text-xs font-bold">Efecto Desvanecido en Logo (Fade Effect)</span>
                      </label>
                    </div>

                    {/* Dimensiones y Ajuste */}
                    <div className="space-y-4 pt-2 border-t border-black/10 dark:border-white/10">
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <label className="text-xs font-bold text-muted-foreground">Ancho del Logo en Login ({logoSettings?.widthLogin ?? 96}px)</label>
                          <input 
                            type="number" 
                            value={logoSettings?.widthLogin ?? 96} 
                            onChange={e => setLogoSettings(s => ({...s, widthLogin: Number(e.target.value)}))} 
                            className="w-16 bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded p-1 text-xs text-center focus:border-primary font-bold" 
                          />
                        </div>
                        <input 
                          type="range" 
                          min="40" 
                          max="400" 
                          value={logoSettings?.widthLogin ?? 96} 
                          onChange={e => setLogoSettings(s => ({...s, widthLogin: Number(e.target.value)}))} 
                          className="w-full accent-primary" 
                        />
                      </div>
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <label className="text-xs font-bold text-muted-foreground">Alto del Logo en Login ({logoSettings?.heightLogin ?? 96}px)</label>
                          <input 
                            type="number" 
                            value={logoSettings?.heightLogin ?? 96} 
                            onChange={e => setLogoSettings(s => ({...s, heightLogin: Number(e.target.value)}))} 
                            className="w-16 bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded p-1 text-xs text-center focus:border-primary font-bold" 
                          />
                        </div>
                        <input 
                          type="range" 
                          min="40" 
                          max="400" 
                          value={logoSettings?.heightLogin ?? 96} 
                          onChange={e => setLogoSettings(s => ({...s, heightLogin: Number(e.target.value)}))} 
                          className="w-full accent-primary" 
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Settings */}
            <div className={`pt-6 border-t border-black/10 dark:border-white/10 mt-6 space-y-8 ${activeTab === "footer" ? "" : "hidden"}`}>
                  <h3 className="text-lg font-bold flex items-center gap-2 text-primary">Footer y Marca</h3>

                    <div className="space-y-4">
                      <h4 className="text-sm font-bold text-primary border-b border-black/10 dark:border-white/10 pb-2">Ajustes de Marca (Footer)</h4>
                      <div className="flex flex-col lg:flex-row gap-6 items-start">
                        <div className="flex-1 space-y-4 w-full">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={footerLogoSettings.showLogo ?? true} onChange={e => setFooterLogoSettings((s: any) => ({...s, showLogo: e.target.checked}))} className="rounded border-black/20 accent-primary" />
                            <span className="text-sm font-semibold">Mostrar Logo en el Footer</span>
                          </label>

                          <div className="space-y-2">
                            <label className="text-xs text-muted-foreground block font-medium">Posición del Logo respecto a Nuestra Misión</label>
                            <select 
                              value={footerLogoSettings.position || 'side'} 
                              onChange={e => setFooterLogoSettings((s: any) => ({...s, position: e.target.value as any}))} 
                              className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-lg p-2.5 text-sm focus:border-primary"
                            >
                              <option value="side">Al lado de Nuestra Misión (Horizontal)</option>
                              <option value="top">Arriba de Nuestra Misión (Vertical)</option>
                              <option value="top-center">Arriba y Centrado sobre Nuestra Misión</option>
                            </select>
                          </div>

                          {/* Logo Exclusivo del Footer */}
                          <div className="space-y-2 pt-2 border-t border-black/5 dark:border-white/5">
                            <label className="text-xs text-muted-foreground block font-medium">Logo del Footer (Opcional - diferente al principal)</label>
                            <div className="flex items-center gap-3">
                              <div className="w-14 h-14 bg-black/5 dark:bg-black/40 rounded-lg border border-black/10 dark:border-white/10 flex items-center justify-center overflow-hidden shrink-0">
                                {(footerLogoSettings.customLogoUrl || logoUrl || logoUrlDark) ? (
                                  <img 
                                    src={footerLogoSettings.customLogoUrl || (theme === 'dark' && logoUrlDark ? logoUrlDark : (logoUrl || logoUrlDark))} 
                                    alt="Footer Logo" 
                                    className="w-full h-full object-contain p-1"
                                  />
                                ) : (
                                  <span className="text-[10px] text-muted-foreground">Sin logo</span>
                                )}
                              </div>
                              <div className="flex-1 flex flex-wrap gap-2">
                                <label className="cursor-pointer px-3 py-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 text-xs font-semibold transition">
                                  Subir Logo Footer
                                  <input 
                                    type="file" 
                                    accept="image/*" 
                                    className="hidden" 
                                    onChange={async (e) => {
                                      const file = e.target.files?.[0];
                                      if (file) {
                                        const { compressImage } = await import('@/lib/image-compress');
                                        const base64 = await compressImage(file, 600, 600, 0.9);
                                        setFooterLogoSettings((s: any) => ({ ...s, customLogoUrl: base64 }));
                                      }
                                    }}
                                  />
                                </label>
                                {footerLogoSettings.customLogoUrl && (
                                  <button 
                                    type="button" 
                                    onClick={() => setFooterLogoSettings((s: any) => ({ ...s, customLogoUrl: undefined }))}
                                    className="px-3 py-1.5 rounded-lg bg-destructive/10 hover:bg-destructive/20 text-destructive text-xs font-semibold transition"
                                  >
                                    Usar Logo Principal
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <label className="text-xs text-muted-foreground block font-medium">Tamaño del Logo (Ancho / Alto)</label>
                              <span className="text-xs font-mono font-bold text-primary">{footerLogoSettings.width || 60}px</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <input 
                                type="range" 
                                min="20" 
                                max="300" 
                                value={footerLogoSettings.width || 60} 
                                onChange={e => setFooterLogoSettings((s: any) => ({...s, width: Number(e.target.value), height: Number(e.target.value)}))} 
                                className="w-full accent-primary" 
                              />
                              <input 
                                type="number" 
                                min="20" 
                                max="300" 
                                value={footerLogoSettings.width || 60} 
                                onChange={e => setFooterLogoSettings((s: any) => ({...s, width: Number(e.target.value) || 60, height: Number(e.target.value) || 60}))} 
                                className="w-16 bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-lg p-1 text-xs text-center font-mono font-bold" 
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                            <label className="flex items-center gap-2 cursor-pointer p-2.5 bg-black/5 dark:bg-black/30 border border-black/10 dark:border-white/10 rounded-lg hover:border-primary/50 transition">
                              <input 
                                type="checkbox" 
                                checked={footerLogoSettings.glowEffect ?? true} 
                                onChange={e => setFooterLogoSettings((s: any) => ({...s, glowEffect: e.target.checked}))} 
                                className="h-4 w-4 accent-primary cursor-pointer rounded" 
                              />
                              <div>
                                <span className="text-xs font-semibold block">✨ Brillo Palpitante (Glow)</span>
                                <span className="text-[10px] text-muted-foreground">Halo de luz pulsante con color primario</span>
                              </div>
                            </label>

                            <label className="flex items-center gap-2 cursor-pointer p-2.5 bg-black/5 dark:bg-black/30 border border-black/10 dark:border-white/10 rounded-lg hover:border-primary/50 transition">
                              <input 
                                type="checkbox" 
                                checked={footerLogoSettings.glassEffect ?? false} 
                                onChange={e => setFooterLogoSettings((s: any) => ({...s, glassEffect: e.target.checked}))} 
                                className="h-4 w-4 accent-primary cursor-pointer rounded" 
                              />
                              <div>
                                <span className="text-xs font-semibold block">💎 Efecto Cristal (Glass)</span>
                                <span className="text-[10px] text-muted-foreground">Fondo translúcido para el logo</span>
                              </div>
                            </label>
                          </div>

                          <div className="space-y-2 pt-2 border-t border-black/5 dark:border-white/5">
                            <span className="text-xs font-bold text-primary mb-2 block">Tema del Footer</span>
                            <div className="grid grid-cols-1 xl:grid-cols-3 gap-2">
                              <button type="button" onClick={() => setFooterLogoSettings((s: any) => ({...s, layoutTheme: 'modern'}))} className={`p-3 border rounded-lg text-xs font-bold ${(footerLogoSettings.layoutTheme || 'modern') === 'modern' ? 'bg-primary text-primary-foreground border-primary' : 'bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10'}`}>Moderno (Actual)</button>
                              <button type="button" onClick={() => setFooterLogoSettings((s: any) => ({...s, layoutTheme: 'classic'}))} className={`p-3 border rounded-lg text-xs font-bold ${footerLogoSettings.layoutTheme === 'classic' ? 'bg-primary text-primary-foreground border-primary' : 'bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10'}`}>Clásico</button>
                              <button type="button" onClick={() => setFooterLogoSettings((s: any) => ({...s, layoutTheme: 'minimalist'}))} className={`p-3 border rounded-lg text-xs font-bold ${footerLogoSettings.layoutTheme === 'minimalist' ? 'bg-primary text-primary-foreground border-primary' : 'bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10'}`}>Minimalista</button>
                            </div>
                          </div>

                          <div className="space-y-4 pt-4 border-t border-black/5 dark:border-white/5 w-full mt-4">
                            <label className="text-xs text-muted-foreground block font-bold text-primary">Estructura Global del Footer (Padding, Margen y Alineación)</label>
                            
                            <div className="space-y-2">
                              <label className="text-xs text-muted-foreground block font-semibold">Alineación de Párrafos de Texto (Misión, Visión y Dirección)</label>
                              <div className="grid grid-cols-2 gap-2">
                                <button
                                  type="button"
                                  onClick={() => setFooterLogoSettings((s: any) => ({ ...s, footerTextAlign: 'justify' }))}
                                  className={`p-2.5 border rounded-lg text-xs font-bold transition ${
                                    (footerLogoSettings.footerTextAlign || (footerLogoSettings.footerAlignment === 'center' ? 'center' : 'justify')) === 'justify'
                                      ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                                      : 'bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10 hover:border-primary/40'
                                  }`}
                                >
                                  Texto Justificado
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setFooterLogoSettings((s: any) => ({ ...s, footerTextAlign: 'center' }))}
                                  className={`p-2.5 border rounded-lg text-xs font-bold transition ${
                                    (footerLogoSettings.footerTextAlign || (footerLogoSettings.footerAlignment === 'center' ? 'center' : 'justify')) === 'center'
                                      ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                                      : 'bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10 hover:border-primary/40'
                                  }`}
                                >
                                  Texto Centrado
                                </button>
                              </div>
                              <p className="text-[11px] text-muted-foreground">
                                Nota: Los bloques de <b>Socios Comerciales</b> y <b>Ubicación</b> se mantienen siempre centrados, mientras que el texto se mostrará justificado o centrado según elijas aquí.
                              </p>
                            </div>

                            <div className="space-y-2">
                              <label className="text-xs text-muted-foreground block">Alineación de Encabezados de Columnas (Misión, Visión, Redes)</label>
                              <select
                                value={footerLogoSettings.footerAlignment || 'left'}
                                onChange={e => {
                                  const val = e.target.value
                                  setFooterLogoSettings((s: any) => ({
                                    ...s,
                                    footerAlignment: val,
                                    ...(val === 'justify' ? { footerTextAlign: 'justify' } : val === 'center' && !s.footerTextAlign ? { footerTextAlign: 'center' } : {})
                                  }))
                                }}
                                className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-lg p-2 text-sm"
                              >
                                <option value="left">Izquierda</option>
                                <option value="center">Centro</option>
                                <option value="justify">Centrado con Texto Justificado</option>
                                <option value="right">Derecha</option>
                              </select>
                            </div>
                            <div className="space-y-2">
                              <label className="text-xs text-muted-foreground block">Espaciado Interno (Padding Vertical)</label>
                              <div className="flex gap-2">
                                <input type="range" min="0" max="64" value={footerLogoSettings.footerPadding ?? 12} onChange={e => setFooterLogoSettings((s: any) => ({...s, footerPadding: Number(e.target.value)}))} className="w-full accent-primary" />
                                <span className="text-xs w-8">{footerLogoSettings.footerPadding ?? 12}</span>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <label className="text-xs text-muted-foreground block">Margen Superior (Margin Top)</label>
                              <div className="flex gap-2">
                                <input type="range" min="0" max="64" value={footerLogoSettings.footerMarginTop ?? 0} onChange={e => setFooterLogoSettings((s: any) => ({...s, footerMarginTop: Number(e.target.value)}))} className="w-full accent-primary" />
                                <span className="text-xs w-8">{footerLogoSettings.footerMarginTop ?? 0}</span>
                              </div>
                            </div>

                            {/* Color de Fondo del Footer */}
                            <div className="space-y-2">
                              <label className="text-xs text-muted-foreground block font-medium">Color de Fondo del Footer</label>
                              <div className="flex items-center gap-3">
                                <input 
                                  type="color" 
                                  value={footerLogoSettings.bgColor || '#09090b'} 
                                  onChange={e => setFooterLogoSettings((s: any) => ({ ...s, bgColor: e.target.value }))}
                                  className="w-9 h-9 rounded-lg border border-black/10 dark:border-white/10 cursor-pointer bg-transparent"
                                />
                                <input 
                                  type="text" 
                                  value={footerLogoSettings.bgColor || ''} 
                                  onChange={e => setFooterLogoSettings((s: any) => ({ ...s, bgColor: e.target.value }))} 
                                  placeholder="Por defecto (Translúcido / Tarjeta)"
                                  className="flex-1 bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-lg p-2 text-xs font-mono"
                                />
                                {footerLogoSettings.bgColor && (
                                  <button 
                                    type="button" 
                                    onClick={() => setFooterLogoSettings((s: any) => ({ ...s, bgColor: undefined }))}
                                    className="text-xs text-muted-foreground hover:text-foreground px-2 py-1"
                                  >
                                    Restablecer
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="space-y-4 pt-4 border-t border-black/5 dark:border-white/5">
                            <label className="text-xs text-muted-foreground block font-bold">Texto y Alineación</label>
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input type="checkbox" checked={footerLogoSettings.showText ?? true} onChange={e => setFooterLogoSettings((s: any) => ({...s, showText: e.target.checked}))} className="rounded border-black/20 accent-primary" />
                              <span className="text-sm font-semibold">Mostrar Nombre (Texto)</span>
                            </label>
                            <div className="space-y-2">
                              <label className="text-xs text-muted-foreground block">Tamaño del Texto</label>
                              <div className="flex gap-2">
                                <input type="range" min="12" max="64" value={footerLogoSettings.textSize || 24} onChange={e => setFooterLogoSettings((s: any) => ({...s, textSize: Number(e.target.value)}))} className="w-full accent-primary" />
                                <span className="text-xs">{footerLogoSettings.textSize || 24}px</span>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <label className="text-xs text-muted-foreground block">Estilo del Texto</label>
                              <select value={footerLogoSettings.textEffect || 'gradient'} onChange={e => setFooterLogoSettings((s: any) => ({...s, textEffect: e.target.value}))} className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-lg p-2 text-sm">
                                <option value="gradient">Metálico / Gradiente</option>
                                <option value="neon">Neon Brillante</option>
                                <option value="minimalist">Minimalista (Ligero)</option>
                                <option value="none">Sólido Normal</option>
                              </select>
                            </div>

                            {/* Texto de Copyright */}
                            <div className="space-y-2 pt-2 border-t border-black/5 dark:border-white/5">
                              <label className="text-xs text-muted-foreground block font-medium">Texto de Derechos de Autor (Copyright)</label>
                              <input 
                                type="text" 
                                value={footerLogoSettings.copyrightText || ''} 
                                onChange={e => setFooterLogoSettings((s: any) => ({ ...s, copyrightText: e.target.value }))} 
                                placeholder={`© ${new Date().getFullYear()} ${appName || 'GymPro'}. Todos los derechos reservados.`}
                                className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-lg p-2 text-xs focus:border-primary"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Live Preview Box */}
                        <div className="w-full lg:w-80 shrink-0 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-2xl p-5 flex flex-col items-center justify-center">
                          <span className="text-[10px] text-muted-foreground mb-4 uppercase tracking-wider font-bold">Previsualización de Marca</span>
                          <div className={`flex ${(footerLogoSettings.position === 'top' || footerLogoSettings.position === 'top-center') ? 'flex-col items-center text-center' : 'flex-row items-center'} gap-3 w-full justify-center`}>
                            {(footerLogoSettings.showLogo ?? true) && (footerLogoSettings.customLogoUrl || logoUrl || logoUrlDark) && (
                              <div 
                                className={`shrink-0 relative flex items-center justify-center ${footerLogoSettings.glassEffect ? 'bg-white/5 backdrop-blur-md p-2 rounded-2xl border border-black/10 dark:border-white/10 shadow-xl' : ''}`}
                                style={{ 
                                  width: Math.min(Number(footerLogoSettings.width || 60), 90), 
                                  height: Math.min(Number(footerLogoSettings.height || 60), 90) 
                                }}
                              >
                                {(footerLogoSettings.glowEffect ?? true) && (
                                  <div 
                                    className="absolute inset-0 rounded-full bg-primary/40 pointer-events-none"
                                    style={{ 
                                      boxShadow: '0 0 16px 4px hsl(var(--primary) / 0.4)',
                                      filter: 'blur(6px)'
                                    }} 
                                  />
                                )}
                                <img 
                                  src={footerLogoSettings.customLogoUrl || ((theme === 'dark' && logoUrlDark) ? logoUrlDark : (logoUrl || logoUrlDark))} 
                                  alt="Preview" 
                                  className="object-contain relative z-10 max-w-full max-h-full" 
                                />
                              </div>
                            )}
                            {(footerLogoSettings.showText !== false) && (
                              <span 
                                style={{ fontSize: Math.min((footerLogoSettings.textSize || 24) * 0.7, 20) }} 
                                className={`font-black tracking-tighter truncate max-w-[180px] ${footerLogoSettings.textEffect === 'neon' ? 'text-primary drop-shadow-[0_0_10px_rgba(var(--primary),0.8)]' : footerLogoSettings.textEffect === 'minimalist' ? 'text-foreground/80 font-light tracking-widest' : footerLogoSettings.textEffect === 'none' ? 'text-foreground' : 'bg-gradient-to-r from-primary to-orange-400 bg-clip-text text-transparent'}`}
                              >
                                {appName || settings.appName}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
    
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <span>📍</span> Dirección para el Footer y Web Pública (Mapa)
                    </label>
                    <input
                      type="text"
                      value={landingSettings?.map?.address || ''}
                      onChange={(e) => setLandingSettings((prev: any) => ({
                        ...prev,
                        map: { ...(prev?.map || {}), address: e.target.value }
                      }))}
                      placeholder="Ej. Av. Principal, Local 5, Ciudad..."
                      className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-lg p-3 text-sm text-foreground focus:outline-none focus:border-primary"
                    />
                    <p className="text-xs text-muted-foreground">Esta dirección se muestra a los clientes en el pie de página (footer) y en el mapa de la página principal. La dirección de tickets y facturas se gestiona por separado en la pestaña General.</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground block">Misión</label>
                      <textarea 
                        value={footerMission}
                        onChange={(e) => setFooterMission(e.target.value)}
                        className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-lg p-3 text-sm focus:border-primary min-h-[100px]" 
                        placeholder="Misión de la empresa..."
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground block">Visión</label>
                      <textarea 
                        value={footerVision}
                        onChange={(e) => setFooterVision(e.target.value)}
                        className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-lg p-3 text-sm focus:border-primary min-h-[100px]" 
                        placeholder="Visión de la empresa..."
                      />
                    </div>
                  </div>

                  {/* Redes Sociales Dinámicas */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-muted-foreground block">Redes Sociales</label>
                      <button type="button" onClick={() => setFooterSocialLinks([...footerSocialLinks, { id: Date.now().toString(), name: 'Nueva', url: '', width: 24, height: 24 }])} className="bg-transparent border border-primary text-primary hover:bg-primary/10 text-xs px-3 py-1.5 rounded-lg transition font-bold">+ Agregar Red</button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {footerSocialLinks.map((link, idx) => (
                        <div key={link.id || idx} className="bg-black/5 dark:bg-white/5 p-4 rounded-xl border border-black/10 dark:border-white/10 space-y-4 relative group hover:shadow-md transition">
                          <button type="button" onClick={() => setFooterSocialLinks(footerSocialLinks.filter((_, i) => i !== idx))} className="absolute top-2 right-2 text-destructive opacity-0 group-hover:opacity-100 transition p-1 hover:bg-destructive/10 rounded-lg">&times;</button>
                          
                          <div className="flex gap-4">
                            <div className="w-16 h-16 shrink-0 bg-black/10 dark:bg-black/40 rounded-xl overflow-hidden flex items-center justify-center border border-black/10 dark:border-white/10 relative">
                              {link.iconUrl ? (
                                <img src={link.iconUrl} alt={link.name} className="w-full h-full object-contain p-2" />
                              ) : (
                                <div className="text-[10px] font-bold text-center text-primary leading-tight"><span className="text-xl block mb-1">↑</span>Subir<br/>Logo</div>
                              )}
                              <input type="file" accept=".svg,.png,.jpg,.jpeg,.webp,image/svg+xml,image/png,image/jpeg,image/webp" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => {
                                const file = e.target.files?.[0];
                                if(file){
                                  const reader = new FileReader();
                                  reader.onloadend = () => {
                                    const arr = [...footerSocialLinks];
                                    arr[idx].iconUrl = reader.result as string;
                                    setFooterSocialLinks(arr);
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }} />
                            </div>
                            <div className="flex-1 space-y-2">
                              <input type="text" placeholder="Nombre (Ej. Instagram)" value={link.name} onChange={e => { const arr = [...footerSocialLinks]; arr[idx].name = e.target.value; setFooterSocialLinks(arr); }} className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-lg p-2 text-sm focus:border-primary" />
                              <input type="text" placeholder="URL (https://...)" value={link.url} onChange={e => { const arr = [...footerSocialLinks]; arr[idx].url = e.target.value; setFooterSocialLinks(arr); }} className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-lg p-2 text-sm focus:border-primary" />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-muted-foreground">Tamaño (Ancho/Alto):</span>
                              <input type="number" value={link.width} onChange={e => { const arr = [...footerSocialLinks]; arr[idx].width = Number(e.target.value) || 24; arr[idx].height = Number(e.target.value) || 24; setFooterSocialLinks(arr); }} className="w-16 bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded p-1 text-xs text-center" />
                            </div>
                            <input type="range" min="10" max="100" value={link.width} onChange={e => { const arr = [...footerSocialLinks]; arr[idx].width = Number(e.target.value); arr[idx].height = Number(e.target.value); setFooterSocialLinks(arr); }} className="w-full accent-primary" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Socios Comerciales Dinámicos */}
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <label className="text-sm font-bold text-foreground block">Socios Comerciales (Logos en Pirámide)</label>
                        <span className="text-xs text-muted-foreground">El primer socio de la lista se ubica en la cima de la pirámide, o puedes elegir el nivel exacto de cada uno.</span>
                      </div>
                      <button type="button" onClick={() => setFooterPartners([...footerPartners, { id: Date.now().toString(), imageUrl: '', link: '', width: 100, height: 40 }])} className="bg-transparent border border-primary text-primary hover:bg-primary/10 text-xs px-3 py-1.5 rounded-lg transition font-bold shrink-0">+ Agregar Socio</button>
                    </div>

                    {/* Selector de Estilo de Disposición de Socios */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setFooterLogoSettings((s: any) => ({ ...s, partnersLayout: 'pyramid' }))}
                        className={`p-2.5 border rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                          (footerLogoSettings.partnersLayout || 'pyramid') === 'pyramid'
                            ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                            : 'bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10 hover:border-primary/40'
                        }`}
                      >
                        <span>🔺 Piramidal (1 arriba, base abajo)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setFooterLogoSettings((s: any) => ({ ...s, partnersLayout: 'inverted-pyramid' }))}
                        className={`p-2.5 border rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                          footerLogoSettings.partnersLayout === 'inverted-pyramid'
                            ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                            : 'bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10 hover:border-primary/40'
                        }`}
                      >
                        <span>🔻 Pirámide Invertida</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setFooterLogoSettings((s: any) => ({ ...s, partnersLayout: 'grid' }))}
                        className={`p-2.5 border rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                          footerLogoSettings.partnersLayout === 'grid'
                            ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                            : 'bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10 hover:border-primary/40'
                        }`}
                      >
                        <span>📏 En Línea / Fila Normal</span>
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {footerPartners.map((partner, idx) => (
                        <div key={partner.id || idx} className="bg-black/5 dark:bg-white/5 p-4 rounded-xl border border-black/10 dark:border-white/10 space-y-4 relative group hover:shadow-md transition">
                          <div className="flex items-center justify-between border-b border-black/5 dark:border-white/5 pb-2">
                            <span className="text-[11px] font-bold text-primary">
                              Socio #{idx + 1} {idx === 0 && (footerLogoSettings.partnersLayout || 'pyramid') === 'pyramid' && !partner.tier ? '(Cima de la Pirámide)' : ''}
                            </span>
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                disabled={idx === 0}
                                onClick={() => {
                                  if (idx === 0) return;
                                  const arr = [...footerPartners];
                                  [arr[idx - 1], arr[idx]] = [arr[idx], arr[idx - 1]];
                                  setFooterPartners(arr);
                                }}
                                title="Subir posición en la pirámide"
                                className="px-2 py-0.5 text-xs rounded bg-black/5 dark:bg-white/10 hover:bg-primary/20 disabled:opacity-30 font-bold"
                              >
                                ↑
                              </button>
                              <button
                                type="button"
                                disabled={idx === footerPartners.length - 1}
                                onClick={() => {
                                  if (idx === footerPartners.length - 1) return;
                                  const arr = [...footerPartners];
                                  [arr[idx + 1], arr[idx]] = [arr[idx], arr[idx + 1]];
                                  setFooterPartners(arr);
                                }}
                                title="Bajar posición en la pirámide"
                                className="px-2 py-0.5 text-xs rounded bg-black/5 dark:bg-white/10 hover:bg-primary/20 disabled:opacity-30 font-bold"
                              >
                                ↓
                              </button>
                              <button
                                type="button"
                                onClick={() => setFooterPartners(footerPartners.filter((_, i) => i !== idx))}
                                className="text-destructive hover:bg-destructive/10 px-2 py-0.5 rounded text-xs font-bold ml-1"
                                title="Eliminar socio"
                              >
                                &times;
                              </button>
                            </div>
                          </div>
                          
                          <div className="flex gap-4">
                            <div className="w-20 h-20 shrink-0 bg-white/10 rounded-xl overflow-hidden flex items-center justify-center border border-black/10 dark:border-white/10 relative">
                              {partner.imageUrl ? (
                                <img src={partner.imageUrl} alt="Socio" className="w-full h-full object-contain p-1" />
                              ) : (
                                <div className="text-xs font-bold text-center text-primary leading-tight"><span className="text-2xl block mb-1">↑</span>Subir<br/>Logo</div>
                              )}
                              <input type="file" accept=".svg,.png,.jpg,.jpeg,.webp,image/svg+xml,image/png,image/jpeg,image/webp" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => {
                                const file = e.target.files?.[0];
                                if(file){
                                  const reader = new FileReader();
                                  reader.onloadend = () => {
                                    const arr = [...footerPartners];
                                    arr[idx].imageUrl = reader.result as string;
                                    setFooterPartners(arr);
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }} />
                            </div>
                            <div className="flex-1 space-y-2 flex flex-col justify-center">
                              <input type="text" placeholder="URL (Opcional)" value={partner.link || ''} onChange={e => { const arr = [...footerPartners]; arr[idx].link = e.target.value; setFooterPartners(arr); }} className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-lg p-2 text-xs focus:border-primary" />
                              <div>
                                <label className="text-[10px] text-muted-foreground block mb-0.5">Escalón / Fila en la Pirámide:</label>
                                <select
                                  value={partner.tier || 0}
                                  onChange={e => {
                                    const arr = [...footerPartners];
                                    const val = Number(e.target.value);
                                    arr[idx].tier = val > 0 ? val : undefined;
                                    setFooterPartners(arr);
                                  }}
                                  className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-lg p-1.5 text-xs focus:border-primary"
                                >
                                  <option value={0}>Automático (1 → 2 → 3...)</option>
                                  <option value={1}>Nivel 1 (Punta / Cima)</option>
                                  <option value={2}>Nivel 2 (Segunda fila)</option>
                                  <option value={3}>Nivel 3 (Tercera fila)</option>
                                  <option value={4}>Nivel 4 (Base inferior)</option>
                                </select>
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <div className="flex justify-between items-center">
                                <span className="text-xs text-muted-foreground">Ancho:</span>
                                <input type="number" value={partner.width} onChange={e => { const arr = [...footerPartners]; arr[idx].width = Number(e.target.value) || 100; setFooterPartners(arr); }} className="w-16 bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded p-1 text-xs text-center" />
                              </div>
                              <input type="range" min="20" max="300" value={partner.width} onChange={e => { const arr = [...footerPartners]; arr[idx].width = Number(e.target.value); setFooterPartners(arr); }} className="w-full accent-primary" />
                            </div>
                            <div className="space-y-2">
                              <div className="flex justify-between items-center">
                                <span className="text-xs text-muted-foreground">Alto:</span>
                                <input type="number" value={partner.height} onChange={e => { const arr = [...footerPartners]; arr[idx].height = Number(e.target.value) || 40; setFooterPartners(arr); }} className="w-16 bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded p-1 text-xs text-center" />
                              </div>
                              <input type="range" min="10" max="200" value={partner.height} onChange={e => { const arr = [...footerPartners]; arr[idx].height = Number(e.target.value); setFooterPartners(arr); }} className="w-full accent-primary" />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                    {/* VISTA PREVIA COMPLETA DEL FOOTER */}
                    <div className="mt-8 pt-8 border-t border-black/10 dark:border-white/10 mb-8">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Vista Previa del Footer (Tiempo Real)</h3>
                        <span className="text-xs text-primary font-medium">Refleja tus cambios en vivo</span>
                      </div>
                      <div className="w-full bg-card/40 border border-black/10 dark:border-white/10 rounded-2xl overflow-hidden shadow-inner">
                        <BaseFooter settings={{
                          footerLogoSettings,
                          logoUrl,
                          logoUrlDark,
                          appName,
                          footerMission,
                          footerVision,
                          footerSocialLinks,
                          footerPartners,
                          landingSettings,
                          storeAddress
                        }} />
                      </div>
                    </div>
            
            {/* PANEL DE PÁGINA PRINCIPAL (PROMOCIONAL) */}
            <div className={`space-y-8 ${activeTab === "landing" ? "" : "hidden"}`}>
              
              {/* ENCABEZADO Y ACTIVACIÓN */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-primary/10 border border-primary/20">
                <div>
                  <h3 className="text-lg font-black text-foreground flex items-center gap-2">
                    <Globe className="w-5 h-5 text-primary" /> Página Principal Promocional (Landing Page)
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Configura el carrusel de fotos/videos, disciplinas deportivas, mapa de Google Maps y datos de contacto de tu vitrina web.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <a
                    href="/inicio"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/10 dark:bg-white/10 hover:bg-primary/20 text-xs font-bold text-foreground border border-black/10 dark:border-white/10 transition"
                  >
                    <span>Ver Landing</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* LEMA O SLOGAN PRINCIPAL */}
              <div className="space-y-2 p-5 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10">
                <label className="text-sm font-bold flex items-center gap-2 text-foreground">
                  <Type className="w-4 h-4 text-primary" /> Eslogan o Lema Promocional (Hero)
                </label>
                <input
                  type="text"
                  value={landingSettings?.tagline || ''}
                  onChange={e => setLandingSettings((prev: any) => ({ ...prev, tagline: e.target.value }))}
                  placeholder="Ej. Supera tus límites, forja tu mejor versión"
                  className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-lg p-3 text-sm text-foreground focus:border-primary"
                />
              </div>

              {/* GESTOR DE CARRUSEL (FOTOS Y VIDEOS) */}
              <div className="space-y-4 p-5 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-black/10 dark:border-white/10">
                  <div>
                    <h4 className="text-base font-extrabold text-foreground flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-primary" /> Carrusel de Imágenes y Videos del Hero
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      Sube fotos en alta resolución (PNG, JPG, WebP) o videos (MP4) para cautivar a los visitantes de tu gimnasio.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const newSlide = {
                        id: String(Date.now()),
                        type: 'image',
                        url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1920&auto=format&fit=crop',
                        title: 'NUEVO SLIDE',
                        subtitle: 'Descripción motivacional de este slide.',
                        ctaText: 'Ver Disciplinas',
                        ctaLink: '#disciplinas'
                      };
                      setLandingSettings((prev: any) => ({
                        ...prev,
                        heroSlides: [...(prev?.heroSlides || []), newSlide]
                      }));
                    }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow-md hover:brightness-110 active:scale-95 transition"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Agregar Slide</span>
                  </button>
                </div>

                {/* LISTA DE SLIDES */}
                <div className="space-y-4 pt-2">
                  {(!landingSettings?.heroSlides || landingSettings.heroSlides.length === 0) && (
                    <div className="p-8 text-center text-sm text-muted-foreground border border-dashed border-black/20 dark:border-white/20 rounded-xl">
                      No hay diapositivas agregadas aún. Haz clic en "Agregar Slide" para comenzar.
                    </div>
                  )}

                  {landingSettings?.heroSlides?.map((slide: any, idx: number) => (
                    <div key={slide.id || idx} className="p-4 rounded-xl bg-card border border-black/10 dark:border-white/10 shadow-sm space-y-4">
                      <div className="flex items-center justify-between gap-2 pb-2 border-b border-border">
                        <span className="text-xs font-black uppercase text-primary tracking-wider">Slide #{idx + 1}</span>
                        <button
                          type="button"
                          onClick={() => {
                            const updated = landingSettings.heroSlides.filter((_: any, i: number) => i !== idx);
                            setLandingSettings((prev: any) => ({ ...prev, heroSlides: updated }));
                          }}
                          className="text-xs text-destructive hover:bg-destructive/10 p-1.5 rounded-lg font-bold flex items-center gap-1 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Eliminar</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* PREVIEW Y SUBIDA */}
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-muted-foreground block">Multimedia (Imagen o Video)</label>
                          <div className="h-28 w-full bg-black/20 rounded-xl overflow-hidden border border-black/10 dark:border-white/10 flex items-center justify-center relative group">
                            {slide.type === 'video' ? (
                              <video src={slide.url} className="w-full h-full object-cover" muted />
                            ) : (
                              <img src={slide.url} alt="Preview" className="w-full h-full object-cover" />
                            )}
                            <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white text-xs font-bold cursor-pointer transition">
                              <span>Cambiar Archivo</span>
                              <input
                                type="file"
                                accept="image/*,video/mp4,video/webm"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    const isVideo = file.type.startsWith('video');
                                    const reader = new FileReader();
                                    reader.onloadend = () => {
                                      const arr = [...landingSettings.heroSlides];
                                      arr[idx].url = reader.result as string;
                                      arr[idx].type = isVideo ? 'video' : 'image';
                                      setLandingSettings((prev: any) => ({ ...prev, heroSlides: arr }));
                                    };
                                    reader.readAsDataURL(file);
                                  }
                                }}
                              />
                            </label>
                          </div>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={slide.url || ''}
                              placeholder="O pega URL (https://...)"
                              onChange={(e) => {
                                const arr = [...landingSettings.heroSlides];
                                arr[idx].url = e.target.value;
                                setLandingSettings((prev: any) => ({ ...prev, heroSlides: arr }));
                              }}
                              className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-lg p-2 text-xs"
                            />
                            <select
                              value={slide.type || 'image'}
                              onChange={(e) => {
                                const arr = [...landingSettings.heroSlides];
                                arr[idx].type = e.target.value;
                                setLandingSettings((prev: any) => ({ ...prev, heroSlides: arr }));
                              }}
                              className="bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-lg p-2 text-xs"
                            >
                              <option value="image">Foto</option>
                              <option value="video">Video</option>
                            </select>
                          </div>
                        </div>

                        {/* TITULOS */}
                        <div className="space-y-2 md:col-span-2">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="text-xs font-bold text-muted-foreground block mb-1">Título Principal</label>
                              <input
                                type="text"
                                value={slide.title || ''}
                                onChange={(e) => {
                                  const arr = [...landingSettings.heroSlides];
                                  arr[idx].title = e.target.value;
                                  setLandingSettings((prev: any) => ({ ...prev, heroSlides: arr }));
                                }}
                                placeholder="Ej. TRANSFORMA TU CUERPO"
                                className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-lg p-2 text-xs font-bold focus:border-primary"
                              />
                            </div>
                            <div>
                              <label className="text-xs font-bold text-muted-foreground block mb-1">Subtítulo / Mensaje</label>
                              <input
                                type="text"
                                value={slide.subtitle || ''}
                                onChange={(e) => {
                                  const arr = [...landingSettings.heroSlides];
                                  arr[idx].subtitle = e.target.value;
                                  setLandingSettings((prev: any) => ({ ...prev, heroSlides: arr }));
                                }}
                                placeholder="Ej. Instalaciones de alto rendimiento..."
                                className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-lg p-2 text-xs focus:border-primary"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                            <div>
                              <label className="text-xs font-bold text-muted-foreground block mb-1">Texto del Botón</label>
                              <input
                                type="text"
                                value={slide.ctaText || ''}
                                onChange={(e) => {
                                  const arr = [...landingSettings.heroSlides];
                                  arr[idx].ctaText = e.target.value;
                                  setLandingSettings((prev: any) => ({ ...prev, heroSlides: arr }));
                                }}
                                placeholder="Ej. Ver Disciplinas"
                                className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-lg p-2 text-xs focus:border-primary"
                              />
                            </div>
                            <div>
                              <label className="text-xs font-bold text-muted-foreground block mb-1">Enlace del Botón (#sección)</label>
                              <input
                                type="text"
                                value={slide.ctaLink || ''}
                                onChange={(e) => {
                                  const arr = [...landingSettings.heroSlides];
                                  arr[idx].ctaLink = e.target.value;
                                  setLandingSettings((prev: any) => ({ ...prev, heroSlides: arr }));
                                }}
                                placeholder="Ej. #disciplinas o #ubicacion"
                                className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-lg p-2 text-xs focus:border-primary"
                              />
                            </div>
                          </div>
                        </div>

                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* GESTOR DE DISCIPLINAS */}
              <div className="space-y-4 p-5 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-black/10 dark:border-white/10">
                  <div>
                    <h4 className="text-base font-extrabold text-foreground flex items-center gap-2">
                      <Store className="w-4 h-4 text-primary" /> Catálogo de Disciplinas Deportivas
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      Muestra las especialidades de tu gimnasio: Musculación, Funcional, Boxeo, Spinning, etc. Puedes registrar más de 6 disciplinas y se adaptarán automáticamente al 100% en columnas responsivas.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const newDisc = {
                        id: String(Date.now()),
                        title: 'Nueva Disciplina',
                        description: 'Breve resumen de los beneficios y objetivos de esta disciplina.',
                        imageUrl: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=800&auto=format&fit=crop',
                        intensity: 'Alta',
                        schedule: 'Lunes a Sábado'
                      };
                      setLandingSettings((prev: any) => ({
                        ...prev,
                        disciplines: [...(prev?.disciplines || []), newDisc]
                      }));
                    }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow-md hover:brightness-110 active:scale-95 transition"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Agregar Disciplina</span>
                  </button>
                </div>

                {/* TITULO Y SUBTITULO DE SECCION DE DISCIPLINAS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-xl bg-black/5 dark:bg-black/20 border border-border/40">
                  <div>
                    <label className="text-xs font-bold text-foreground block mb-1">Título de la Sección de Disciplinas</label>
                    <input
                      type="text"
                      value={landingSettings?.disciplinesTitle ?? 'ENTRENA A TU MANERA, SUPERA TUS LÍMITES'}
                      onChange={(e) => setLandingSettings((prev: any) => ({ ...prev, disciplinesTitle: e.target.value }))}
                      placeholder="Ej. ENTRENA A TU MANERA, SUPERA TUS LÍMITES"
                      className="w-full bg-black/5 dark:bg-black/40 border border-border rounded-lg p-2 text-xs font-bold focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-foreground block mb-1">Subtítulo Descriptivo</label>
                    <input
                      type="text"
                      value={landingSettings?.disciplinesSubtitle ?? 'Disponemos de programas y áreas diseñadas para todos los niveles, desde principiantes hasta atletas de alto rendimiento.'}
                      onChange={(e) => setLandingSettings((prev: any) => ({ ...prev, disciplinesSubtitle: e.target.value }))}
                      placeholder="Ej. Disponemos de programas..."
                      className="w-full bg-black/5 dark:bg-black/40 border border-border rounded-lg p-2 text-xs focus:border-primary"
                    />
                  </div>
                </div>

                {/* GRID DE DISCIPLINAS */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  {(!landingSettings?.disciplines || landingSettings.disciplines.length === 0) && (
                    <div className="md:col-span-2 p-8 text-center text-sm text-muted-foreground border border-dashed border-black/20 dark:border-white/20 rounded-xl">
                      No hay disciplinas registradas. Haz clic en "Agregar Disciplina" para añadir una.
                    </div>
                  )}

                  {landingSettings?.disciplines?.map((disc: any, idx: number) => (
                    <div key={disc.id || idx} className="p-4 rounded-xl bg-card border border-border shadow-sm space-y-3">
                      <div className="flex items-center justify-between gap-2 pb-2 border-b border-border">
                        <span className="text-xs font-black uppercase text-primary">Disciplina #{idx + 1}</span>
                        <button
                          type="button"
                          onClick={() => {
                            const updated = landingSettings.disciplines.filter((_: any, i: number) => i !== idx);
                            setLandingSettings((prev: any) => ({ ...prev, disciplines: updated }));
                          }}
                          className="text-xs text-destructive hover:bg-destructive/10 p-1.5 rounded-lg font-bold flex items-center gap-1 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Eliminar</span>
                        </button>
                      </div>

                      <div className="flex gap-4">
                        <div className="w-24 h-24 shrink-0 rounded-xl bg-black/20 overflow-hidden relative group border border-border">
                          <img src={disc.imageUrl} alt={disc.title} className="w-full h-full object-cover" />
                          <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[10px] font-bold cursor-pointer transition text-center p-1">
                            <span>Subir Foto</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const reader = new FileReader();
                                  reader.onloadend = () => {
                                    const arr = [...landingSettings.disciplines];
                                    arr[idx].imageUrl = reader.result as string;
                                    setLandingSettings((prev: any) => ({ ...prev, disciplines: arr }));
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                            />
                          </label>
                        </div>

                        <div className="flex-1 space-y-2">
                          <input
                            type="text"
                            value={disc.title || ''}
                            onChange={(e) => {
                              const arr = [...landingSettings.disciplines];
                              arr[idx].title = e.target.value;
                              setLandingSettings((prev: any) => ({ ...prev, disciplines: arr }));
                            }}
                            placeholder="Nombre (ej. Musculación)"
                            className="w-full bg-black/5 dark:bg-black/40 border border-border rounded-lg p-2 text-xs font-bold"
                          />
                          <textarea
                            rows={2}
                            value={disc.description || ''}
                            onChange={(e) => {
                              const arr = [...landingSettings.disciplines];
                              arr[idx].description = e.target.value;
                              setLandingSettings((prev: any) => ({ ...prev, disciplines: arr }));
                            }}
                            placeholder="Descripción breve..."
                            className="w-full bg-black/5 dark:bg-black/40 border border-border rounded-lg p-2 text-xs resize-none"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 pt-1">
                        <div>
                          <label className="text-[10px] font-bold text-muted-foreground block mb-0.5">Intensidad</label>
                          <select
                            value={disc.intensity || 'Alta'}
                            onChange={(e) => {
                              const arr = [...landingSettings.disciplines];
                              arr[idx].intensity = e.target.value;
                              setLandingSettings((prev: any) => ({ ...prev, disciplines: arr }));
                            }}
                            className="w-full bg-black/5 dark:bg-black/40 border border-border rounded-lg p-1.5 text-xs"
                          >
                            <option value="Baja">Baja</option>
                            <option value="Media">Media</option>
                            <option value="Alta">Alta</option>
                            <option value="Extrema">Extrema</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-muted-foreground block mb-0.5">Horarios o Días</label>
                          <input
                            type="text"
                            value={disc.schedule || ''}
                            onChange={(e) => {
                              const arr = [...landingSettings.disciplines];
                              arr[idx].schedule = e.target.value;
                              setLandingSettings((prev: any) => ({ ...prev, disciplines: arr }));
                            }}
                            placeholder="Ej. Lunes a Sábado"
                            className="w-full bg-black/5 dark:bg-black/40 border border-border rounded-lg p-1.5 text-xs"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* GESTOR DE "NUESTRA PROMESA" Y FOTOS DE INSTALACIONES */}
              <div className="space-y-4 p-5 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10">
                <div className="pb-3 border-b border-black/10 dark:border-white/10">
                  <h4 className="text-base font-extrabold text-foreground flex items-center gap-2">
                    <HeartHandshake className="w-4 h-4 text-primary" /> Sección "Nuestra Promesa & Instalaciones"
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Personaliza los títulos y las 4 fotos representativas de tus instalaciones, máquinas y áreas de entrenamiento.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-bold text-foreground block mb-1">Etiqueta Superior</label>
                    <input
                      type="text"
                      value={landingSettings?.promiseSettings?.badge ?? 'NUESTRA PROMESA'}
                      onChange={(e) => setLandingSettings((prev: any) => ({
                        ...prev,
                        promiseSettings: { ...(prev?.promiseSettings || {}), badge: e.target.value }
                      }))}
                      placeholder="Ej. NUESTRA PROMESA"
                      className="w-full bg-black/5 dark:bg-black/40 border border-border rounded-lg p-2 text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-foreground block mb-1">Título Principal</label>
                    <input
                      type="text"
                      value={landingSettings?.promiseSettings?.title ?? 'UN ESPACIO PENSADO PARA TU EVOLUCIÓN'}
                      onChange={(e) => setLandingSettings((prev: any) => ({
                        ...prev,
                        promiseSettings: { ...(prev?.promiseSettings || {}), title: e.target.value }
                      }))}
                      placeholder="Ej. UN ESPACIO PENSADO PARA TU EVOLUCIÓN"
                      className="w-full bg-black/5 dark:bg-black/40 border border-border rounded-lg p-2 text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-foreground block mb-1">Texto de la Promesa</label>
                    <input
                      type="text"
                      value={landingSettings?.promiseSettings?.description ?? 'no solo entrenas: formas parte de un estilo de vida enfocado en la disciplina, la superación y los resultados reales.'}
                      onChange={(e) => setLandingSettings((prev: any) => ({
                        ...prev,
                        promiseSettings: { ...(prev?.promiseSettings || {}), description: e.target.value }
                      }))}
                      placeholder="Ej. no solo entrenas: formas parte..."
                      className="w-full bg-black/5 dark:bg-black/40 border border-border rounded-lg p-2 text-xs"
                    />
                  </div>
                </div>

                {/* 4 FOTOS DE INSTALACIONES */}
                <div className="pt-2">
                  <label className="text-xs font-bold text-muted-foreground block mb-3">Las 4 Fotografías de la Galería de Instalaciones:</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[0, 1, 2, 3].map((imgIdx) => {
                      const currentImages = landingSettings?.promiseSettings?.images || [
                        'https://images.unsplash.com/photo-1574680096145-d05b474e2155?q=80&w=800&auto=format&fit=crop',
                        'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?q=80&w=800&auto=format&fit=crop',
                        'https://images.unsplash.com/photo-1534367507873-d2d7e24c797f?q=80&w=800&auto=format&fit=crop',
                        'https://images.unsplash.com/photo-1599058917212-d750089bc07e?q=80&w=800&auto=format&fit=crop'
                      ];
                      const imgSrc = currentImages[imgIdx] || '';
                      return (
                        <div key={imgIdx} className="p-3 rounded-xl bg-card border border-border space-y-2">
                          <span className="text-[11px] font-bold text-primary block">Foto #{imgIdx + 1}</span>
                          <div className="h-32 w-full rounded-lg bg-black/20 overflow-hidden relative group border border-border">
                            {imgSrc ? (
                              <img src={imgSrc} alt="Preview" className="w-full h-full object-cover" />
                            ) : (
                              <div className="flex items-center justify-center h-full text-xs text-muted-foreground">Sin foto</div>
                            )}
                            <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[10px] font-bold cursor-pointer transition text-center p-1">
                              <span>Subir Imagen</span>
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    const reader = new FileReader();
                                    reader.onloadend = () => {
                                      const newImages = [...currentImages];
                                      newImages[imgIdx] = reader.result as string;
                                      setLandingSettings((prev: any) => ({
                                        ...prev,
                                        promiseSettings: { ...(prev?.promiseSettings || {}), images: newImages }
                                      }));
                                    };
                                    reader.readAsDataURL(file);
                                  }
                                }}
                              />
                            </label>
                          </div>
                          <input
                            type="text"
                            value={imgSrc}
                            onChange={(e) => {
                              const newImages = [...currentImages];
                              newImages[imgIdx] = e.target.value;
                              setLandingSettings((prev: any) => ({
                                ...prev,
                                promiseSettings: { ...(prev?.promiseSettings || {}), images: newImages }
                              }));
                            }}
                            placeholder="O pega URL de imagen"
                            className="w-full bg-black/5 dark:bg-black/40 border border-border rounded p-1.5 text-[11px]"
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* GESTOR DE PLANES Y MENSUALIDADES (4 CARDS) */}
              <div className="space-y-5 p-5 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10">
                <div className="pb-3 border-b border-black/10 dark:border-white/10">
                  <h4 className="text-base font-extrabold text-foreground flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-primary" /> Sección "Membresías y Precios de Planes" (4 Tarjetas)
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Configura el precio mensual/anual, nombres, beneficios y tarjeta destacada que se muestran a los visitantes en la página principal.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-bold text-foreground block mb-1">Etiqueta Superior</label>
                    <input
                      type="text"
                      value={landingSettings?.plansSettings?.badge ?? 'MEMBRESÍAS & PLANES'}
                      onChange={(e) => setLandingSettings((prev: any) => ({
                        ...prev,
                        plansSettings: { ...(prev?.plansSettings || {}), badge: e.target.value }
                      }))}
                      placeholder="Ej. MEMBRESÍAS & PLANES"
                      className="w-full bg-black/5 dark:bg-black/40 border border-border rounded-lg p-2 text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-foreground block mb-1">Título Principal</label>
                    <input
                      type="text"
                      value={landingSettings?.plansSettings?.title ?? 'INVULNÉRABILIDAD Y CONSTANCIA: ELIGE TU PLAN'}
                      onChange={(e) => setLandingSettings((prev: any) => ({
                        ...prev,
                        plansSettings: { ...(prev?.plansSettings || {}), title: e.target.value }
                      }))}
                      placeholder="Ej. ELIGE TU PLAN"
                      className="w-full bg-black/5 dark:bg-black/40 border border-border rounded-lg p-2 text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-foreground block mb-1">Subtítulo Descriptivo</label>
                    <input
                      type="text"
                      value={landingSettings?.plansSettings?.subtitle ?? 'Planes flexibles diseñados para tus metas, con acceso completo a equipamiento de primer nivel y asesoría continua.'}
                      onChange={(e) => setLandingSettings((prev: any) => ({
                        ...prev,
                        plansSettings: { ...(prev?.plansSettings || {}), subtitle: e.target.value }
                      }))}
                      placeholder="Ej. Planes flexibles..."
                      className="w-full bg-black/5 dark:bg-black/40 border border-border rounded-lg p-2 text-xs"
                    />
                  </div>
                </div>

                {/* 4 CARDS EDITABLES */}
                <div className="pt-2">
                  <label className="text-xs font-bold text-muted-foreground block mb-3">Las 4 Tarjetas de Planes:</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[0, 1, 2, 3].map((planIdx) => {
                      const defaultPlansList = [
                        {
                          id: '1',
                          name: 'PLAN CORPORATIVO',
                          price: '$25',
                          billingPeriod: '/mes',
                          description: 'Plan corporativo especial para empresas, grupos y convenios aliados.',
                          highlight: true,
                          badge: 'DESTACADO',
                          features: ['Acceso a zona de pesas y musculación', 'Vestuarios y duchas con agua caliente', 'Evaluación física inicial básica', 'Horario ilimitado de lunes a sábado'],
                          ctaText: 'Comenzar Ahora',
                          ctaLink: '#contacto'
                        },
                        {
                          id: '2',
                          name: 'PLAN MAXIMUM BASICO',
                          price: '$25',
                          billingPeriod: '/mes',
                          description: 'Ideal para quienes inician su disciplina física con acceso libre al área de musculación.',
                          highlight: false,
                          badge: '',
                          features: ['Acceso a zona de pesas y musculación', 'Acceso ilimitado a área cardiovascular', 'Rutina personalizada digital en la app', 'Horario libre de lunes a sábado'],
                          ctaText: 'Elegir Plan',
                          ctaLink: '#contacto'
                        },
                        {
                          id: '3',
                          name: 'PLAN SOLO PARA ELLAS',
                          price: '$25',
                          billingPeriod: '/mes',
                          description: 'Entrenamiento enfocado en tonificación, glúteos, cardio y bienestar integral femenino.',
                          highlight: true,
                          badge: 'DESTACADO',
                          features: ['Acceso completo a todas las áreas', 'Asesoría técnica y rutinas especializadas', 'Monitoreo biométrico y de composición corporal', 'Ambiente motivador y seguro'],
                          ctaText: 'Elegir Plan',
                          ctaLink: '#contacto'
                        },
                        {
                          id: '4',
                          name: 'PLAN ADULTO MAYOR',
                          price: '$25',
                          billingPeriod: '/mes',
                          description: 'Programa enfocado en salud articular, movilidad, fuerza funcional y vitalidad.',
                          highlight: false,
                          badge: '',
                          features: ['Entrenamiento adaptado y seguro', 'Acompañamiento en movilidad y fortalecimiento', 'Seguimiento de salud y progreso físico', 'Acceso completo en horario cómodo'],
                          ctaText: 'Elegir Plan',
                          ctaLink: '#contacto'
                        }
                      ];

                      const currentPlans = landingSettings?.plansSettings?.plans?.length
                        ? landingSettings.plansSettings.plans
                        : defaultPlansList;
                      
                      const plan = currentPlans[planIdx] || defaultPlansList[planIdx];

                      const updateCurrentPlan = (updatedFields: any) => {
                        const newPlans = [...currentPlans];
                        newPlans[planIdx] = { ...plan, ...updatedFields };
                        setLandingSettings((prev: any) => ({
                          ...prev,
                          plansSettings: {
                            ...(prev?.plansSettings || {}),
                            plans: newPlans
                          }
                        }));
                      };

                      return (
                        <div key={planIdx} className={`p-4 rounded-xl border space-y-3 ${plan.highlight ? 'bg-primary/5 border-primary shadow-md' : 'bg-card border-border'}`}>
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-extrabold text-primary">Tarjeta #{planIdx + 1}</span>
                            <label className="flex items-center gap-1.5 cursor-pointer text-[10px] font-bold">
                              <input
                                type="checkbox"
                                checked={!!plan.highlight}
                                onChange={(e) => updateCurrentPlan({ highlight: e.target.checked })}
                                className="rounded text-primary focus:ring-primary h-3.5 w-3.5"
                              />
                              <span>Destacado</span>
                            </label>
                          </div>

                          <div>
                            <label className="text-[10px] font-bold text-muted-foreground block mb-0.5">Nombre del Plan</label>
                            <input
                              type="text"
                              value={plan.name || ''}
                              onChange={(e) => updateCurrentPlan({ name: e.target.value })}
                              placeholder="Ej. Plan Pro"
                              className="w-full bg-black/5 dark:bg-black/40 border border-border rounded p-1.5 text-xs font-bold"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="text-[10px] font-bold text-muted-foreground block mb-0.5">Precio</label>
                              <input
                                type="text"
                                value={plan.price || ''}
                                onChange={(e) => updateCurrentPlan({ price: e.target.value })}
                                placeholder="$35"
                                className="w-full bg-black/5 dark:bg-black/40 border border-border rounded p-1.5 text-xs font-black text-primary"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] font-bold text-muted-foreground block mb-0.5">Frecuencia</label>
                              <input
                                type="text"
                                value={plan.billingPeriod || '/mes'}
                                onChange={(e) => updateCurrentPlan({ billingPeriod: e.target.value })}
                                placeholder="/mes o /año"
                                className="w-full bg-black/5 dark:bg-black/40 border border-border rounded p-1.5 text-xs"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="text-[10px] font-bold text-muted-foreground block mb-0.5">Etiqueta Badge (Opcional)</label>
                            <input
                              type="text"
                              value={plan.badge || ''}
                              onChange={(e) => updateCurrentPlan({ badge: e.target.value })}
                              placeholder="Ej. MÁS POPULAR"
                              className="w-full bg-black/5 dark:bg-black/40 border border-border rounded p-1.5 text-[11px]"
                            />
                          </div>

                          <div>
                            <label className="text-[10px] font-bold text-muted-foreground block mb-0.5">Descripción Corta</label>
                            <textarea
                              rows={2}
                              value={plan.description || ''}
                              onChange={(e) => updateCurrentPlan({ description: e.target.value })}
                              placeholder="Breve reseña del plan..."
                              className="w-full bg-black/5 dark:bg-black/40 border border-border rounded p-1.5 text-[11px]"
                            />
                          </div>

                          <div>
                            <label className="text-[10px] font-bold text-muted-foreground block mb-0.5">
                              Beneficios (1 por línea)
                            </label>
                            <textarea
                              rows={3}
                              value={(plan.features || []).join('\n')}
                              onChange={(e) => updateCurrentPlan({
                                features: e.target.value.split('\n').filter((l: string) => l.trim().length > 0)
                              })}
                              placeholder="Acceso pesas&#10;Duchas y vestuarios&#10;Evaluación..."
                              className="w-full bg-black/5 dark:bg-black/40 border border-border rounded p-1.5 text-[10px] font-mono"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-border/40">
                            <div>
                              <label className="text-[9px] font-bold text-muted-foreground block mb-0.5">Texto Botón</label>
                              <input
                                type="text"
                                value={plan.ctaText || 'Elegir Plan'}
                                onChange={(e) => updateCurrentPlan({ ctaText: e.target.value })}
                                className="w-full bg-black/5 dark:bg-black/40 border border-border rounded p-1 text-[10px]"
                              />
                            </div>
                            <div>
                              <label className="text-[9px] font-bold text-muted-foreground block mb-0.5">Enlace Botón</label>
                              <input
                                type="text"
                                value={plan.ctaLink || '#contacto'}
                                onChange={(e) => updateCurrentPlan({ ctaLink: e.target.value })}
                                className="w-full bg-black/5 dark:bg-black/40 border border-border rounded p-1 text-[10px]"
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* GESTOR DE UBICACIÓN Y GOOGLE MAPS */}
              <div className="space-y-4 p-5 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10">
                <h4 className="text-base font-extrabold text-foreground flex items-center gap-2 pb-2 border-b border-black/10 dark:border-white/10">
                  <MapPin className="w-4 h-4 text-primary" /> Ubicación y Mapa Interactivo (Google Maps)
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-xs font-bold text-foreground block">
                      URL del Mapa Embebido de Google Maps (o etiqueta iframe completa)
                    </label>
                    <input
                      type="text"
                      value={landingSettings?.map?.embedUrl || ''}
                      onChange={(e) => setLandingSettings((prev: any) => ({
                        ...prev,
                        map: { ...(prev?.map || {}), embedUrl: e.target.value }
                      }))}
                      placeholder="https://www.google.com/maps/embed?pb=... o <iframe src='...'></iframe>"
                      className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-lg p-3 text-xs text-foreground focus:border-primary font-mono"
                    />
                    <p className="text-[11px] text-muted-foreground">
                      💡 <strong>¿Cómo obtenerlo?</strong> Ve a Google Maps &gt; Busca tu gimnasio &gt; Haz clic en <em>Compartir</em> &gt; Pestaña <em>Insertar un mapa</em> &gt; Copia el HTML o el enlace src y pégalo aquí.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-foreground block">Título de la Tarjeta Lateral</label>
                    <input
                      type="text"
                      value={landingSettings?.map?.infoCardTitle ?? 'Información del Gym'}
                      onChange={(e) => setLandingSettings((prev: any) => ({
                        ...prev,
                        map: { ...(prev?.map || {}), infoCardTitle: e.target.value }
                      }))}
                      placeholder="Ej. Información del Gym"
                      className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-lg p-2.5 text-xs text-foreground focus:border-primary"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-foreground block">Dirección Visible</label>
                    <input
                      type="text"
                      value={landingSettings?.map?.address || ''}
                      onChange={(e) => setLandingSettings((prev: any) => ({
                        ...prev,
                        map: { ...(prev?.map || {}), address: e.target.value }
                      }))}
                      placeholder="Ej. Av. Principal, Edificio Gym, Nivel 1"
                      className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-lg p-2.5 text-xs text-foreground focus:border-primary"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-foreground block">Enlace Directo de Google Maps (Para botón "Cómo llegar")</label>
                    <input
                      type="text"
                      value={landingSettings?.map?.googleMapsUrl || ''}
                      onChange={(e) => setLandingSettings((prev: any) => ({
                        ...prev,
                        map: { ...(prev?.map || {}), googleMapsUrl: e.target.value }
                      }))}
                      placeholder="https://maps.google.com/..."
                      className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-lg p-2.5 text-xs text-foreground focus:border-primary"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-foreground block">Teléfono de Contacto</label>
                    <input
                      type="text"
                      value={landingSettings?.map?.phone || ''}
                      onChange={(e) => setLandingSettings((prev: any) => ({
                        ...prev,
                        map: { ...(prev?.map || {}), phone: e.target.value }
                      }))}
                      placeholder="Ej. +58 412 123 4567"
                      className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-lg p-2.5 text-xs text-foreground focus:border-primary"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-foreground block">WhatsApp Directo</label>
                    <input
                      type="text"
                      value={landingSettings?.map?.whatsapp || ''}
                      onChange={(e) => setLandingSettings((prev: any) => ({
                        ...prev,
                        map: { ...(prev?.map || {}), whatsapp: e.target.value }
                      }))}
                      placeholder="Ej. +58 414 123 4567"
                      className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-lg p-2.5 text-xs text-foreground focus:border-primary"
                    />
                  </div>
                </div>
              </div>

            </div>

<div className="pt-6 border-t border-black/10 dark:border-white/10 flex justify-end mt-6">
              <button 
                type="submit" 
                disabled={isSaving}
                className="bg-transparent border-2 border-primary text-primary hover:bg-primary/10 font-bold py-3 px-6 rounded-lg transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <Save className="h-5 w-5" />
                {isSaving ? "Guardando Cambios..." : "Guardar Cambios"}
              </button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="glass mt-8">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" /> Roles y Permisos del Sistema
          </CardTitle>
          <button 
            type="button" 
            onClick={() => { setRoleForm({ id: '', name: '', permissions: [] }); setShowRoleModal(true); }}
            className="text-xs bg-transparent border border-success text-success font-bold px-3 py-1.5 rounded hover:bg-success/10 transition"
          >
            + Nuevo Rol
          </button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Crea roles personalizados (ej. Recepción, Entrenador, Mantenimiento) y asígnales permisos específicos.</p>
            
            <div className="grid gap-3">
              {roles.map(r => (
                <div key={r.id} className="flex justify-between items-center bg-black/5 dark:bg-white/5 p-3 rounded-lg border border-black/10 dark:border-white/10">
                  <div>
                    <h4 className="font-bold text-sm">{r.name}</h4>
                    <p className="text-xs text-muted-foreground mt-1">Permisos: {r.permissions.length}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => { setRoleForm(r); setShowRoleModal(true); }} className="bg-transparent border border-primary text-primary hover:bg-primary/10 text-xs px-3 py-1.5 rounded-lg transition font-bold">Editar</button>
                    {r.id !== 'admin' && r.id !== 'employee' && (
                      <button onClick={() => handleDeleteRole(r.id)} className="text-xs bg-destructive/10 text-destructive px-3 py-1.5 rounded-lg hover:bg-destructive/20 transition font-bold">Borrar</button>
                    )}
                  </div>
                </div>
              ))}
              {roles.length === 0 && (
                <div className="text-center p-4 text-sm text-muted-foreground border border-dashed border-black/20 dark:border-white/20 rounded-lg">
                  No hay roles creados aún.
                </div>
              )}
            </div>

            <div className="pt-4 mt-4 border-t border-black/5 dark:border-white/5">
              <p className="text-xs text-muted-foreground mb-3">Si necesitas asignar permisos directos (legacy):</p>
              <button 
                type="button"
                onClick={() => setShowEmployeeModal(true)}
                className="bg-black/10 dark:bg-white/10 hover:bg-white/20 text-foreground font-bold py-2 px-4 rounded-lg text-sm transition border border-white/20"
              >
                Asignar permisos manuales por Empleado
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* COPIA DE SEGURIDAD Y RESPALDO (EXCLUSIVO SUPER ADMINISTRADOR) */}
      <Card className="glass mt-8 border-amber-500/30 overflow-hidden relative">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-black/5 dark:border-white/5 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-amber-500/15 text-amber-500 border border-amber-500/30">
              <Database className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                Copia de Seguridad y Respaldo del Sistema
                <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-500 border border-amber-500/30">
                  Super Admin
                </span>
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Exporta y descarga un volcado íntegro de la base de datos (atletas, transacciones, membresías, asistencias y ajustes) en formato JSON.
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {isSuperAdmin ? (
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20">
              <div className="space-y-1.5 max-w-xl">
                <div className="flex items-center gap-2 text-sm font-bold text-foreground">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span>Acceso Autorizado: C.I. {user?.cedula || "26710825"} (Super Administrador)</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Por estrictas políticas de privacidad y protección de datos, solo el Super Administrador principal puede generar y descargar esta copia. Se te solicitará confirmar tu contraseña antes de iniciar la exportación.
                </p>
              </div>

              <button
                type="button"
                onClick={handleDownloadBackup}
                disabled={isGeneratingBackup}
                className="shrink-0 bg-amber-500 hover:bg-amber-600 active:scale-95 text-black font-extrabold px-5 py-3 rounded-xl transition-all shadow-lg flex items-center gap-2.5 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isGeneratingBackup ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Generando Respaldo...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>Descargar Respaldo Completo (.JSON)</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 flex items-center gap-3 text-muted-foreground">
              <Lock className="w-5 h-5 text-amber-500 shrink-0" />
              <p className="text-xs leading-relaxed">
                Esta sección está reservada exclusivamente para el <b>Super Administrador principal</b> (C.I. 26710825). Tu cuenta actual de administrador no tiene privilegios para extraer la base de datos completa.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* MODAL DE ROLES */}
      {showRoleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="bg-card border border-black/10 dark:border-white/10 rounded-xl max-w-lg w-full p-6 shadow-2xl glass flex flex-col">
            <h3 className="text-xl font-bold mb-4">{roleForm.id ? 'Editar Rol' : 'Nuevo Rol'}</h3>
            <form onSubmit={handleSaveRole} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-muted-foreground block mb-1">Nombre del Rol</label>
                <input 
                  required autoFocus type="text" value={roleForm.name} 
                  onChange={e => setRoleForm({...roleForm, name: e.target.value})}
                  placeholder="Ej. Recepción, Mantenimiento..."
                  className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-lg p-2 text-sm focus:border-primary"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-muted-foreground block mb-2">Permisos de Acceso</label>
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 bg-black/5 dark:bg-black/40 rounded-lg">
                  {[
                    { id: 'POS_ACCESS', label: 'Cajero / Punto de Venta' },
                    { id: 'INVENTORY_MANAGE', label: 'Inventario de Tienda' },
                    { id: 'SALES_VIEW', label: 'Historial de Ventas' },
                    { id: 'CRM_MANAGE', label: 'Gestión de Atletas' },
                    { id: 'FINANCE_VIEW', label: 'Ver Finanzas' },
                    { id: 'FINANCE_MANAGE', label: 'Administrar Finanzas' },
                    { id: 'SETTINGS_MANAGE', label: 'Ajustes del Sistema' },
                    { id: 'STAFF_MANAGE', label: 'Nómina y Personal' },
                    { id: 'COMMUNITY_POST', label: 'Publicar en Comunidad' }
                  ].map(perm => (
                    <label key={perm.id} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 p-1 rounded">
                      <input 
                        type="checkbox" 
                        checked={roleForm.permissions.includes(perm.id)}
                        onChange={(e) => {
                          const newPerms = e.target.checked 
                            ? [...roleForm.permissions, perm.id] 
                            : roleForm.permissions.filter(p => p !== perm.id)
                          setRoleForm({...roleForm, permissions: newPerms})
                        }}
                        className="accent-primary"
                      />
                      <span className="text-xs">{perm.label}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-black/10 dark:border-white/10">
                <button type="button" onClick={() => setShowRoleModal(false)} className="bg-transparent border border-border text-muted-foreground hover:bg-slate-500/10 px-4 py-2 rounded-lg text-sm transition">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-transparent border border-success text-success font-bold rounded-lg text-sm hover:bg-success/10">Guardar Rol</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE EMPLEADOS (Buscar y gestionar permisos) */}
      {showEmployeeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-card border border-black/10 dark:border-white/10 rounded-2xl max-w-lg w-full p-6 shadow-2xl glass flex flex-col max-h-[85vh]">
            <div className="flex justify-between items-center mb-4 border-b border-black/10 dark:border-white/10 pb-3">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <User className="h-5 w-5 text-primary"/> Buscar Empleado para Permisos
              </h3>
              <button 
                type="button" 
                onClick={() => { setShowEmployeeModal(false); setEmpSearch(""); }} 
                className="text-muted-foreground hover:text-foreground text-2xl leading-none p-1"
              >
                &times;
              </button>
            </div>
            
            <input 
              type="text" 
              placeholder="Buscar por nombre o cédula..." 
              value={empSearch}
              onChange={(e) => setEmpSearch(e.target.value)}
              className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:border-primary mb-4" 
            />

            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {employees.filter(e => e.role !== 'deleted' && (e.name.toLowerCase().includes(empSearch.toLowerCase()) || e.cedula?.includes(empSearch))).map(emp => (
                <div key={emp.id} className="p-4 bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-xl hover:border-primary/50 transition">
                  <div className="flex justify-between items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-sm truncate">{emp.name}</h4>
                      <p className="text-xs text-muted-foreground mt-0.5">{emp.role?.toUpperCase() || 'EMPLEADO'} • C.C. {emp.cedula}</p>
                      <p className="text-[11px] text-primary/80 font-medium mt-1">
                        {emp.permissions?.length || 0} permisos individuales activos
                      </p>
                    </div>
                    {emp.role === 'admin' ? (
                      <span className="text-[10px] bg-primary/20 text-primary px-2.5 py-1 rounded-full font-bold uppercase shrink-0">
                        Acceso Total
                      </span>
                    ) : (
                      <button 
                        type="button"
                        onClick={() => {
                          setEditingPermsEmployee(emp)
                          setTempPermissions(Array.isArray(emp.permissions) ? [...emp.permissions] : [])
                        }}
                        className="bg-transparent border border-primary text-primary hover:bg-primary/10 text-xs px-3.5 py-1.5 rounded-lg transition font-bold shrink-0"
                      >
                        Editar Permisos
                      </button>
                    )}
                  </div>
                </div>
              ))}
              
              {employees.filter(e => e.role !== 'deleted' && (e.name.toLowerCase().includes(empSearch.toLowerCase()) || e.cedula?.includes(empSearch))).length === 0 && (
                <div className="text-center text-sm text-muted-foreground p-6">No se encontraron empleados coincidentes.</div>
              )}
            </div>
            
          </div>
        </div>
      )}

      {/* MODAL DEDICADO DE EDICIÓN DE PERMISOS */}
      {editingPermsEmployee && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-card border border-black/10 dark:border-white/10 rounded-2xl max-w-xl w-full p-6 shadow-2xl glass flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-start border-b border-black/10 dark:border-white/10 pb-4 mb-4">
              <div>
                <h3 className="text-lg font-bold flex items-center gap-2 text-foreground">
                  <Shield className="h-5 w-5 text-primary" /> Permisos de Acceso
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Configurando permisos para <strong className="text-foreground">{editingPermsEmployee.name}</strong> ({editingPermsEmployee.role?.toUpperCase() || 'EMPLEADO'} • C.I. {editingPermsEmployee.cedula})
                </p>
              </div>
              <button 
                type="button"
                onClick={() => setEditingPermsEmployee(null)} 
                className="text-muted-foreground hover:text-foreground text-2xl leading-none p-1"
              >
                &times;
              </button>
            </div>

            <div className="flex items-center justify-between mb-3 px-1">
              <span className="text-xs font-semibold text-muted-foreground">
                <span className="text-primary font-bold">{tempPermissions.length}</span> de {AVAILABLE_PERMISSIONS.length} permisos habilitados
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setTempPermissions(AVAILABLE_PERMISSIONS.map(p => p.id))}
                  className="text-xs text-primary hover:underline font-bold"
                >
                  Marcar todos
                </button>
                <span className="text-muted-foreground text-xs">•</span>
                <button
                  type="button"
                  onClick={() => setTempPermissions([])}
                  className="text-xs text-destructive hover:underline font-bold"
                >
                  Desmarcar todos
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1 my-1">
              {AVAILABLE_PERMISSIONS.map(perm => {
                const isChecked = tempPermissions.includes(perm.id)
                return (
                  <label
                    key={perm.id}
                    className={`flex items-start gap-3 p-3 rounded-xl border transition cursor-pointer select-none ${
                      isChecked 
                        ? "bg-primary/10 border-primary/50 text-foreground" 
                        : "bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10 text-muted-foreground hover:border-black/20 dark:hover:border-white/20"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setTempPermissions(prev => [...prev, perm.id])
                        } else {
                          setTempPermissions(prev => prev.filter(p => p !== perm.id))
                        }
                      }}
                      className="accent-primary h-4 w-4 mt-0.5 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <span className={`text-xs font-bold block ${isChecked ? "text-primary" : "text-foreground"}`}>
                        {perm.label}
                      </span>
                      <span className="text-[11px] text-muted-foreground block leading-snug">
                        {perm.desc}
                      </span>
                    </div>
                  </label>
                )
              })}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-black/10 dark:border-white/10 mt-3">
              <button
                type="button"
                onClick={() => setEditingPermsEmployee(null)}
                className="bg-transparent border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 px-4 py-2 rounded-xl text-xs font-bold transition text-foreground"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={isSavingEmpPerms}
                onClick={async () => {
                  setIsSavingEmpPerms(true)
                  try {
                    const { updateEmployeePermissionsAction } = await import('@/app/actions/users')
                    const res = await updateEmployeePermissionsAction(editingPermsEmployee.id, tempPermissions)
                    if (res && res.success) {
                      showSweetToast(`Permisos de ${editingPermsEmployee.name} actualizados exitosamente`, 'success')
                      setEmployees(prev => prev.map(e => e.id === editingPermsEmployee.id ? { ...e, permissions: tempPermissions as any } : e))
                      setEditingPermsEmployee(null)
                      if (getAllEmployees) {
                        const updated = await getAllEmployees()
                        setEmployees(updated)
                      }
                    } else {
                      showSweetToast(res?.error || 'Error al guardar permisos', 'error')
                    }
                  } catch (err: any) {
                    showSweetToast(err.message || 'Error al procesar la actualización', 'error')
                  } finally {
                    setIsSavingEmpPerms(false)
                  }
                }}
                className="bg-transparent border-2 border-primary text-primary hover:bg-primary/10 px-5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2"
              >
                {isSavingEmpPerms ? "Guardando..." : "Guardar Permisos"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
