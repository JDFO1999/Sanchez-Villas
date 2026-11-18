"use client"

import { useState, useEffect } from "react"
import { useAuth, User as UserType, AVAILABLE_PERMISSIONS } from "@/lib/auth-context"
import { useSettings } from "@/lib/settings-context"
import { BaseFooter } from "@/components/layout/footer"
import { GeneralTab } from "@/components/settings/GeneralTab"
import { FinanceSettingsTab } from "@/components/settings/FinanceSettingsTab"
import { LoginTab } from "@/components/settings/LoginTab"
import { FooterTab } from "@/components/settings/FooterTab"
import { LandingTab } from "@/components/settings/LandingTab"
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
  const [faviconUrl, setFaviconUrl] = useState(settings.faviconUrl || "/uploads/maximum-favicon.png")
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

  const handleFaviconUpload = (e: any) => {
    const f = e.target.files?.[0]
    if (f) {
      const r = new FileReader()
      r.onloadend = () => {
        const raw = r.result as string
        if (typeof window !== "undefined") {
          const img = new Image()
          img.onload = () => {
            const canvas = document.createElement("canvas")
            const size = 128
            canvas.width = size
            canvas.height = size
            const ctx = canvas.getContext("2d")
            if (ctx) {
              ctx.clearRect(0, 0, size, size)
              const scale = Math.min(size / img.width, size / img.height)
              const w = img.width * scale
              const h = img.height * scale
              const x = (size - w) / 2
              const y = (size - h) / 2
              ctx.drawImage(img, x, y, w, h)
              setFaviconUrl(canvas.toDataURL("image/png"))
            } else {
              setFaviconUrl(raw)
            }
          }
          img.onerror = () => setFaviconUrl(raw)
          img.src = raw
        } else {
          setFaviconUrl(raw)
        }
      }
      r.readAsDataURL(f)
    }
  }
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
            
            <div className={`space-y-8 ${activeTab === "general" ? "" : "hidden"}`}>
              <GeneralTab
                appName={appName}
                setAppName={setAppName}
                logoSettings={logoSettings}
                setLogoSettings={setLogoSettings}
                theme={theme}
                logoUrl={logoUrl}
                setLogoUrl={setLogoUrl}
                logoUrlDark={logoUrlDark}
                setLogoUrlDark={setLogoUrlDark}
                faviconUrl={faviconUrl}
                setFaviconUrl={setFaviconUrl}
                handleFaviconUpload={handleFaviconUpload}
                handleLogoUpload={handleLogoUpload}
                handleLogoDarkUpload={handleLogoDarkUpload}
                primaryColor={primaryColor}
                setPrimaryColor={setPrimaryColor}
                secondaryColor={secondaryColor}
                setSecondaryColor={setSecondaryColor}
                borderColor={borderColor}
                setBorderColor={setBorderColor}
                fontFamily={fontFamily}
                setFontFamily={setFontFamily}
                isGlass={isGlass}
                setIsGlass={setIsGlass}
              />

              <FinanceSettingsTab
                storeRif={storeRif}
                setStoreRif={setStoreRif}
                storeAddress={storeAddress}
                setStoreAddress={setStoreAddress}
                storeCurrency={storeCurrency}
                setStoreCurrency={setStoreCurrency}
                storeCurrencySecondary={storeCurrencySecondary}
                setStoreCurrencySecondary={setStoreCurrencySecondary}
                storeExchangeRate={storeExchangeRate}
                setStoreExchangeRate={setStoreExchangeRate}
                storeExchangeRateEur={storeExchangeRateEur}
                setStoreExchangeRateEur={setStoreExchangeRateEur}
                storeExchangeRateCop={storeExchangeRateCop}
                setStoreExchangeRateCop={setStoreExchangeRateCop}
                isFetchingBcv={isFetchingBcv}
                handleFetchBcv={handleFetchBcv}
                storeTaxRate={storeTaxRate}
                setStoreTaxRate={setStoreTaxRate}
                storeTicketWidth={storeTicketWidth}
                setStoreTicketWidth={setStoreTicketWidth}
                storeUseThermalPrinter={storeUseThermalPrinter}
                setStoreUseThermalPrinter={setStoreUseThermalPrinter}
                storeReceiptMessage={storeReceiptMessage}
                setStoreReceiptMessage={setStoreReceiptMessage}
                coachCustomPricing={coachCustomPricing}
                setCoachCustomPricing={setCoachCustomPricing}
                gymCommissionPercentage={gymCommissionPercentage}
                setGymCommissionPercentage={setGymCommissionPercentage}
                allowCoachesToPostCommunity={allowCoachesToPostCommunity}
                setAllowCoachesToPostCommunity={setAllowCoachesToPostCommunity}
                storePaymentInstructions={storePaymentInstructions}
                setStorePaymentInstructions={setStorePaymentInstructions}
                storePaymentQRs={storePaymentQRs}
                setStorePaymentQRs={setStorePaymentQRs}
                handleQRUpload={handleQRUpload}
              />
            </div>

            {/* PANEL DE PANTALLA DE LOGIN */}
            <div className={activeTab === "navbar" ? "" : "hidden"}>
              <LoginTab
                theme={theme}
                appName={appName}
                setAppName={setAppName}
                logoUrl={logoUrl}
                logoUrlDark={logoUrlDark}
                logoSettings={logoSettings}
                setLogoSettings={setLogoSettings}
              />
            </div>

            {/* Footer Settings */}
            <div className={activeTab === "footer" ? "" : "hidden"}>
              <FooterTab
                theme={theme}
                appName={appName}
                logoUrl={logoUrl}
                logoUrlDark={logoUrlDark}
                storeAddress={storeAddress}
                landingSettings={landingSettings}
                setLandingSettings={setLandingSettings}
                footerMission={footerMission}
                setFooterMission={setFooterMission}
                footerVision={footerVision}
                setFooterVision={setFooterVision}
                footerLogoSettings={footerLogoSettings}
                setFooterLogoSettings={setFooterLogoSettings}
                footerSocialLinks={footerSocialLinks}
                setFooterSocialLinks={setFooterSocialLinks}
                footerPartners={footerPartners}
                setFooterPartners={setFooterPartners}
                partnerInput={partnerInput}
                setPartnerInput={setPartnerInput}
              />
            </div>

            {/* PANEL DE PÁGINA PRINCIPAL (PROMOCIONAL) */}
            <div className={activeTab === "landing" ? "" : "hidden"}>
              <LandingTab
                landingSettings={landingSettings}
                setLandingSettings={setLandingSettings}
              />
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
