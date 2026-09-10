"use client"

import { useState, useEffect } from "react"
import { useAuth, User as UserType } from "@/lib/auth-context"
import { useSettings } from "@/lib/settings-context"
import { useTheme } from "next-themes"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Save, Settings, Type, Palette, Image as ImageIcon, Store, User, QrCode } from "lucide-react"
import { useRouter } from "next/navigation"
import { useToast } from "@/lib/toast-context"

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
  
  // Custom Roles State
  const { getCustomRoles, addCustomRole, deleteCustomRole } = useAuth()
  const [roles, setRoles] = useState<any[]>([])
  const [showRoleModal, setShowRoleModal] = useState(false)
  const [roleForm, setRoleForm] = useState({ id: '', name: '', permissions: [] as string[] })

  useEffect(() => {
    async function load() {
      const emps = await getAllEmployees()
      setEmployees(emps)
      setRoles(getCustomRoles())
    }
    load()
  }, [])

  const [appName, setAppName] = useState(settings.appName)
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
  const [footerSocialLinks, setFooterSocialLinks] = useState(Array.isArray(settings.footerSocialLinks) ? settings.footerSocialLinks : [])
  const [footerPartners, setFooterPartners] = useState(Array.isArray(settings.footerPartners) ? settings.footerPartners.map(p => typeof p === "string" ? { id: Math.random().toString(), imageUrl: p, width: 100, height: 40 } : p) : [])
  const [partnerInput, setPartnerInput] = useState("")
  const [storeUseThermalPrinter, setStoreUseThermalPrinter] = useState(settings.storeUseThermalPrinter ?? true)
  
  const [storeCurrencySecondary, setStoreCurrencySecondary] = useState(settings.storeCurrencySecondary || "BsS")
  const [storeExchangeRate, setStoreExchangeRate] = useState(settings.storeExchangeRate || 40.0)
  const [storePaymentInstructions, setStorePaymentInstructions] = useState(settings.storePaymentInstructions || {
    pagoMovil: "", binance: "", transferencia: ""
  })
  const [storePaymentQRs, setStorePaymentQRs] = useState(settings.storePaymentQRs || {
    pagoMovil: "", binance: "", transferencia: ""
  })
  
  const [coachCustomPricing, setCoachCustomPricing] = useState(settings.coachCustomPricing ?? false)
  const [gymCommissionPercentage, setGymCommissionPercentage] = useState(settings.gymCommissionPercentage ?? 30)
  const [biometricFields, setBiometricFields] = useState<string[]>(settings.biometricFields || ['Pecho', 'Cintura', 'Cadera'])

  // Ocultar si no es admin
  if (user?.role !== 'admin') {
    return <div className="p-8 text-center text-red-500 font-bold">Acceso Denegado. Solo administradores.</div>
  }

  const handleSaveRole = (e: React.FormEvent) => {
    e.preventDefault()
    if (!roleForm.name) return
    const newRole = {
      id: roleForm.id || `ROLE-${Date.now()}`,
      name: roleForm.name,
      permissions: roleForm.permissions as any
    }
    addCustomRole(newRole)
    setRoles(getCustomRoles())
    setShowRoleModal(false)
    showToast(`Rol '${newRole.name}' guardado exitosamente.`, 'success')
  }

  const handleDeleteRole = (id: string) => {
    deleteCustomRole(id)
    setRoles(getCustomRoles())
    showToast(`Rol eliminado.`, 'success')
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
      updateSettings({
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
        storeCurrency,
        storeCurrencySecondary,
        storeExchangeRate,
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
        gymCommissionPercentage,
        biometricFields,
        footerMission,
        footerVision,
        footerSocialLinks,
        footerPartners
      })
    showToast("Ajustes guardados correctamente.", "success")
  }

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

  const handleQRUpload = (method: 'pagoMovil' | 'binance' | 'transferencia', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setStorePaymentQRs(prev => ({ ...prev, [method]: reader.result as string }))
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tighter bg-gradient-to-r from-primary dark:dark:via-white via-black via-black to-primary/50 bg-clip-text text-transparent dark:dark:drop-shadow-[0_0_15px_rgba(255,255,255,0.1)] drop-shadow-sm drop-shadow-sm">Ajustes Globales</h1>
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
          <form onSubmit={handleSave} className="space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Nombre de la App */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Type className="h-4 w-4 text-muted-foreground" /> Nombre de la Aplicación
                </label>
                <input 
                  type="text" 
                  value={appName}
                  onChange={(e) => setAppName(e.target.value)}
                  className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-lg p-3 text-sm text-foreground focus:outline-none focus:border-primary" 
                />
              </div>


              {/* Branding and Logos */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold flex items-center gap-2 text-primary">Marca y Logos</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Favicon */}
                  <div className="space-y-2 bg-black/5 dark:bg-white/5 p-4 rounded-xl border border-black/10 dark:border-white/10 text-center relative group">
                    <label className="text-sm font-medium text-muted-foreground block mb-2">Favicon (Pestaña)</label>
                    <div className="w-16 h-16 mx-auto bg-white dark:bg-black/40 rounded-xl flex items-center justify-center overflow-hidden border border-black/10 dark:border-white/10">
                      {faviconUrl ? <img src={faviconUrl} alt="Favicon" className="w-full h-full object-contain" /> : <span className="text-xs">Subir</span>}
                    </div>
                    <input type="file" accept="image/*" onChange={handleFaviconUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                    {faviconUrl && <button type="button" onClick={() => setFaviconUrl("")} className="mt-2 text-xs text-red-500 hover:underline">Quitar</button>}
                  </div>

                  {/* Logo Claro */}
                  <div className="space-y-2 bg-black/5 dark:bg-white/5 p-4 rounded-xl border border-black/10 dark:border-white/10 text-center relative group">
                    <label className="text-sm font-medium text-muted-foreground block mb-2">Logo (Modo Claro)</label>
                    <div className="w-32 h-16 mx-auto bg-white rounded-xl flex items-center justify-center overflow-hidden border border-black/10 dark:border-white/10">
                      {logoUrl ? <img src={logoUrl} alt="Logo" className="w-full h-full object-contain p-1" /> : <span className="text-xs text-black">Subir</span>}
                    </div>
                    <input type="file" accept="image/*" onChange={handleLogoUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                    {logoUrl && <button type="button" onClick={() => setLogoUrl("")} className="mt-2 text-xs text-red-500 hover:underline">Quitar</button>}
                  </div>

                  {/* Logo Oscuro */}
                  <div className="space-y-2 bg-black/5 dark:bg-white/5 p-4 rounded-xl border border-black/10 dark:border-white/10 text-center relative group">
                    <label className="text-sm font-medium text-muted-foreground block mb-2">Logo (Modo Oscuro)</label>
                    <div className="w-32 h-16 mx-auto bg-black rounded-xl flex items-center justify-center overflow-hidden border border-black/10 dark:border-white/10">
                      {logoUrlDark ? <img src={logoUrlDark} alt="Logo Dark" className="w-full h-full object-contain p-1" /> : <span className="text-xs text-white">Subir (Opcional)</span>}
                    </div>
                    <input type="file" accept="image/*" onChange={handleLogoDarkUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                    {logoUrlDark && <button type="button" onClick={() => setLogoUrlDark("")} className="mt-2 text-xs text-red-500 hover:underline">Quitar</button>}
                  </div>
                </div>

                {/* Live Preview & Sizes */}
                <div className="pt-4 border-t border-black/5 dark:border-white/5">
                  <h4 className="text-sm font-bold text-primary mb-4">Ajustes Estéticos del Logo (Previsualización en Vivo)</h4>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Controles de Navbar */}
                    <div className="space-y-4 bg-black/20 p-4 rounded-xl border border-black/5 dark:border-white/5">
                      <h5 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Barra de Navegación</h5>
                      
                      {/* Live Preview Box */}
                      <div className="w-full h-16 bg-white dark:bg-[#1A1A1A] border border-black/10 dark:border-white/10 rounded-lg flex items-center px-6 overflow-hidden">
                        <div className="flex items-center gap-2 font-bold text-xl text-primary">
                          {logoSettings?.showInNavbar && (logoUrl || logoUrlDark) && (
                            <img 
                              src={(theme === 'dark' && logoUrlDark) ? logoUrlDark : (logoUrl || logoUrlDark)} 
                              alt="Logo" 
                              style={{ width: logoSettings.widthNavbar, height: logoSettings.heightNavbar, objectFit: logoSettings.objectFit }} 
                              className="transition-all" 
                            />
                          )}
                          {logoSettings?.showNameInNavbar && <span>{appName}</span>}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-4 pt-2">
                        <label className="flex items-center gap-2 text-sm cursor-pointer">
                          <input type="checkbox" checked={logoSettings?.showInNavbar ?? true} onChange={(e) => setLogoSettings(s => ({...s, showInNavbar: e.target.checked}))} className="accent-primary w-4 h-4" />
                          Logo
                        </label>
                        <label className="flex items-center gap-2 text-sm cursor-pointer">
                          <input type="checkbox" checked={logoSettings?.showNameInNavbar ?? true} onChange={(e) => setLogoSettings(s => ({...s, showNameInNavbar: e.target.checked}))} className="accent-primary w-4 h-4" />
                          Nombre App
                        </label>
                      </div>

                      <div className="space-y-4 pt-2">
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <label className="text-xs text-muted-foreground block">Ancho (px)</label>
                            <input type="number" value={logoSettings?.widthNavbar ?? 40} onChange={e => setLogoSettings(s => ({...s, widthNavbar: Number(e.target.value)}))} className="w-16 bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded p-1 text-xs text-center focus:border-primary" />
                          </div>
                          <input type="range" min="20" max="200" value={logoSettings?.widthNavbar ?? 40} onChange={e => setLogoSettings(s => ({...s, widthNavbar: Number(e.target.value)}))} className="w-full accent-primary" />
                        </div>
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <label className="text-xs text-muted-foreground block">Alto (px)</label>
                            <input type="number" value={logoSettings?.heightNavbar ?? 40} onChange={e => setLogoSettings(s => ({...s, heightNavbar: Number(e.target.value)}))} className="w-16 bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded p-1 text-xs text-center focus:border-primary" />
                          </div>
                          <input type="range" min="20" max="200" value={logoSettings?.heightNavbar ?? 40} onChange={e => setLogoSettings(s => ({...s, heightNavbar: Number(e.target.value)}))} className="w-full accent-primary" />
                        </div>
                      </div>
                    </div>

                    {/* Controles de Login */}
                    <div className="space-y-4 bg-black/20 p-4 rounded-xl border border-black/5 dark:border-white/5">
                      <h5 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Pantalla Login</h5>
                      
                      {/* Live Preview Box */}
                      <div className="w-full h-32 bg-slate-100 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-lg flex items-center justify-center overflow-hidden relative">
                        <div className="p-4 bg-white dark:bg-[#1A1A1A] rounded-xl shadow flex flex-col items-center">
                          {logoSettings?.showInLogin && (logoUrl || logoUrlDark) && (
                            <img 
                              src={(theme === 'dark' && logoUrlDark) ? logoUrlDark : (logoUrl || logoUrlDark)} 
                              alt="Logo" 
                              style={{ width: logoSettings.widthLogin, height: logoSettings.heightLogin, objectFit: logoSettings.objectFit }} 
                              className="transition-all" 
                            />
                          )}
                          {logoSettings?.showNameInLogin && <span className="font-black text-primary mt-2">{appName}</span>}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-4 pt-2">
                        <label className="flex items-center gap-2 text-sm cursor-pointer">
                          <input type="checkbox" checked={logoSettings?.showInLogin ?? true} onChange={(e) => setLogoSettings(s => ({...s, showInLogin: e.target.checked}))} className="accent-primary w-4 h-4" />
                          Logo
                        </label>
                        <label className="flex items-center gap-2 text-sm cursor-pointer">
                          <input type="checkbox" checked={logoSettings?.showNameInLogin ?? true} onChange={(e) => setLogoSettings(s => ({...s, showNameInLogin: e.target.checked}))} className="accent-primary w-4 h-4" />
                          Nombre App
                        </label>
                      </div>

                      <div className="space-y-4 pt-2">
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <label className="text-xs text-muted-foreground block">Ancho (px)</label>
                            <input type="number" value={logoSettings?.widthLogin ?? 96} onChange={e => setLogoSettings(s => ({...s, widthLogin: Number(e.target.value)}))} className="w-16 bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded p-1 text-xs text-center focus:border-primary" />
                          </div>
                          <input type="range" min="40" max="400" value={logoSettings?.widthLogin ?? 96} onChange={e => setLogoSettings(s => ({...s, widthLogin: Number(e.target.value)}))} className="w-full accent-primary" />
                        </div>
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <label className="text-xs text-muted-foreground block">Alto (px)</label>
                            <input type="number" value={logoSettings?.heightLogin ?? 96} onChange={e => setLogoSettings(s => ({...s, heightLogin: Number(e.target.value)}))} className="w-16 bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded p-1 text-xs text-center focus:border-primary" />
                          </div>
                          <input type="range" min="40" max="400" value={logoSettings?.heightLogin ?? 96} onChange={e => setLogoSettings(s => ({...s, heightLogin: Number(e.target.value)}))} className="w-full accent-primary" />
                        </div>
                      </div>
                    </div>
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
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><Store className="h-5 w-5 text-primary" /> Configuración de Tienda y Facturación</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                <div className="space-y-2">
                  <label className="text-sm font-medium block">NIT / RIF Comercial</label>
                  <input 
                    type="text" 
                    value={storeRif}
                    onChange={(e) => setStoreRif(e.target.value)}
                    placeholder="Ej. J-12345678-9"
                    className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-lg p-3 text-sm focus:border-primary" 
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium block">Dirección Comercial (Ticket)</label>
                  <input 
                    type="text" 
                    value={storeAddress}
                    onChange={(e) => setStoreAddress(e.target.value)}
                    placeholder="Ej. Av. Principal..."
                    className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-lg p-3 text-sm focus:border-primary" 
                  />
                </div>
                
                <div className="space-y-2 md:col-span-2">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium block">Moneda Principal</label>
                      <input type="text" value={storeCurrency} onChange={(e) => setStoreCurrency(e.target.value)} placeholder="Ej. USD, $" className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-lg p-3 text-sm focus:border-primary mt-1" />
                    </div>
                    <div>
                      <label className="text-sm font-medium block">Moneda Secundaria</label>
                      <input type="text" value={storeCurrencySecondary} onChange={(e) => setStoreCurrencySecondary(e.target.value)} placeholder="Ej. BsS, COP" className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-lg p-3 text-sm focus:border-primary mt-1" />
                    </div>
                    <div>
                      <label className="text-sm font-medium block">Tasa de Cambio ({storeCurrencySecondary}/{storeCurrency})</label>
                      <input type="number" step="0.01" value={storeExchangeRate} onChange={(e) => setStoreExchangeRate(Number(e.target.value))} placeholder="Ej. 40.5" className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-lg p-3 text-sm focus:border-primary mt-1" />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium block">Impuesto (IVA) %</label>
                  <input 
                    type="number" 
                    value={storeTaxRate}
                    onChange={(e) => setStoreTaxRate(Number(e.target.value))}
                    className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-lg p-3 text-sm focus:border-primary" 
                  />
                </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium block">Formato de Ticket (Impresora)</label>
                    <select 
                      value={storeTicketWidth}
                      onChange={(e) => setStoreTicketWidth(e.target.value as any)}
                      className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-lg p-3 text-sm focus:border-primary" 
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
                      <span className="text-sm">Impresión Térmica Automática</span>
                    </label>
                  </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium block">Mensaje de Agradecimiento (Ticket)</label>
                  <input 
                    type="text" 
                    value={storeReceiptMessage}
                    onChange={(e) => setStoreReceiptMessage(e.target.value)}
                    className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-lg p-3 text-sm focus:border-primary" 
                  />
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
                  </div>
                </div>
                <div className="space-y-4 md:col-span-2 pt-4 border-t border-black/5 dark:border-white/5">
                  <h4 className="font-bold text-sm text-primary">Instrucciones de Pago (Tienda)</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-medium block">Pago Móvil</label>
                      <textarea rows={4} value={storePaymentInstructions.pagoMovil} onChange={(e) => setStorePaymentInstructions(prev => ({...prev, pagoMovil: e.target.value}))} className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-lg p-2 text-sm focus:border-primary" placeholder="Datos de Pago Móvil..." />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-medium block">Binance Pay</label>
                      <textarea rows={4} value={storePaymentInstructions.binance} onChange={(e) => setStorePaymentInstructions(prev => ({...prev, binance: e.target.value}))} className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-lg p-2 text-sm focus:border-primary" placeholder="Datos de Binance (Email, ID)..." />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-medium block">Transferencia Bancaria</label>
                      <textarea rows={4} value={storePaymentInstructions.transferencia} onChange={(e) => setStorePaymentInstructions(prev => ({...prev, transferencia: e.target.value}))} className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-lg p-2 text-sm focus:border-primary" placeholder="Datos de Cuenta Bancaria..." />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    {/* Pago Móvil QR */}
                    <div className="space-y-2">
                      <label className="text-xs font-medium block mb-2">QR Pago Móvil</label>
                      {!storePaymentQRs.pagoMovil && (
                        <label className="flex flex-col items-center justify-center gap-2 w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 border-dashed rounded-xl p-6 text-xs text-muted-foreground hover:bg-primary/10 hover:text-primary hover:border-primary/50 hover:shadow-lg cursor-pointer transition-all">
                          <QrCode className="h-8 w-8 mb-1" />
                          <span className="font-bold">Subir código QR</span>
                          <input type="file" accept="image/*" onChange={(e) => handleQRUpload('pagoMovil', e)} className="hidden" />
                        </label>
                      )}
                      {storePaymentQRs.pagoMovil && (
                        <div className="flex flex-col items-center gap-2">
                          <div className="h-32 w-32 bg-white/5 border border-white/10 rounded-xl overflow-hidden shadow-lg p-2 flex items-center justify-center">
                            <img src={storePaymentQRs.pagoMovil} className="max-h-full max-w-full object-contain rounded" />
                          </div>
                          <button type="button" onClick={() => setStorePaymentQRs(p => ({...p, pagoMovil: ''}))} className="text-xs text-red-500 hover:bg-red-500/10 px-3 py-1.5 rounded-lg font-bold transition">Eliminar QR</button>
                        </div>
                      )}
                    </div>
                    {/* Binance QR */}
                    <div className="space-y-2">
                      <label className="text-xs font-medium block mb-2">QR Binance Pay</label>
                      {!storePaymentQRs.binance && (
                        <label className="flex flex-col items-center justify-center gap-2 w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 border-dashed rounded-xl p-6 text-xs text-muted-foreground hover:bg-primary/10 hover:text-primary hover:border-primary/50 hover:shadow-lg cursor-pointer transition-all">
                          <QrCode className="h-8 w-8 mb-1" />
                          <span className="font-bold">Subir código QR</span>
                          <input type="file" accept="image/*" onChange={(e) => handleQRUpload('binance', e)} className="hidden" />
                        </label>
                      )}
                      {storePaymentQRs.binance && (
                        <div className="flex flex-col items-center gap-2">
                          <div className="h-32 w-32 bg-white/5 border border-white/10 rounded-xl overflow-hidden shadow-lg p-2 flex items-center justify-center">
                            <img src={storePaymentQRs.binance} className="max-h-full max-w-full object-contain rounded" />
                          </div>
                          <button type="button" onClick={() => setStorePaymentQRs(p => ({...p, binance: ''}))} className="text-xs text-red-500 hover:bg-red-500/10 px-3 py-1.5 rounded-lg font-bold transition">Eliminar QR</button>
                        </div>
                      )}
                    </div>
                    {/* Transferencia QR */}
                    <div className="space-y-2">
                      <label className="text-xs font-medium block mb-2">QR Transferencia</label>
                      {!storePaymentQRs.transferencia && (
                        <label className="flex flex-col items-center justify-center gap-2 w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 border-dashed rounded-xl p-6 text-xs text-muted-foreground hover:bg-primary/10 hover:text-primary hover:border-primary/50 hover:shadow-lg cursor-pointer transition-all">
                          <QrCode className="h-8 w-8 mb-1" />
                          <span className="font-bold">Subir código QR</span>
                          <input type="file" accept="image/*" onChange={(e) => handleQRUpload('transferencia', e)} className="hidden" />
                        </label>
                      )}
                      {storePaymentQRs.transferencia && (
                        <div className="flex flex-col items-center gap-2">
                          <div className="h-32 w-32 bg-white/5 border border-white/10 rounded-xl overflow-hidden shadow-lg p-2 flex items-center justify-center">
                            <img src={storePaymentQRs.transferencia} className="max-h-full max-w-full object-contain rounded" />
                          </div>
                          <button type="button" onClick={() => setStorePaymentQRs(p => ({...p, transferencia: ''}))} className="text-xs text-red-500 hover:bg-red-500/10 px-3 py-1.5 rounded-lg font-bold transition">Eliminar QR</button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>


              
                {/* Footer Settings */}
                <div className="pt-6 border-t border-black/10 dark:border-white/10 mt-6 space-y-8">
                  <h3 className="text-lg font-bold flex items-center gap-2 text-primary">Footer y Marca</h3>
                  
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
                          <button type="button" onClick={() => setFooterSocialLinks(footerSocialLinks.filter((_, i) => i !== idx))} className="absolute top-2 right-2 text-red-500 opacity-0 group-hover:opacity-100 transition p-1 hover:bg-red-500/10 rounded-lg">&times;</button>
                          
                          <div className="flex gap-4">
                            <div className="w-16 h-16 shrink-0 bg-black/10 dark:bg-black/40 rounded-xl overflow-hidden flex items-center justify-center border border-black/10 dark:border-white/10 relative">
                              {link.iconUrl ? (
                                <img src={link.iconUrl} alt={link.name} className="w-full h-full object-contain p-2" />
                              ) : (
                                <div className="text-[10px] font-bold text-center text-primary leading-tight"><span className="text-xl block mb-1">↑</span>Subir<br/>Logo</div>
                              )}
                              <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => {
                                const file = e.target.files?.[0];
                                if(file){
                                  const reader = new FileReader();
                                  reader.onloadend = () => {
                                    const arr = [...footerSocialLinks];
                                    arr[idx].iconUrl = reader.result;
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
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-muted-foreground block">Socios Comerciales (Logos)</label>
                      <button type="button" onClick={() => setFooterPartners([...footerPartners, { id: Date.now().toString(), imageUrl: '', link: '', width: 100, height: 40 }])} className="bg-transparent border border-primary text-primary hover:bg-primary/10 text-xs px-3 py-1.5 rounded-lg transition font-bold">+ Agregar Socio</button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {footerPartners.map((partner, idx) => (
                        <div key={partner.id || idx} className="bg-black/5 dark:bg-white/5 p-4 rounded-xl border border-black/10 dark:border-white/10 space-y-4 relative group hover:shadow-md transition">
                          <button type="button" onClick={() => setFooterPartners(footerPartners.filter((_, i) => i !== idx))} className="absolute top-2 right-2 text-red-500 opacity-0 group-hover:opacity-100 transition p-1 hover:bg-red-500/10 rounded-lg">&times;</button>
                          
                          <div className="flex gap-4">
                            <div className="w-20 h-20 shrink-0 bg-white dark:bg-white/10 rounded-xl overflow-hidden flex items-center justify-center border border-black/10 dark:border-white/10 relative">
                              {partner.imageUrl ? (
                                <img src={partner.imageUrl} alt="Socio" className="w-full h-full object-contain p-1" />
                              ) : (
                                <div className="text-xs font-bold text-center text-primary leading-tight"><span className="text-2xl block mb-1">↑</span>Subir<br/>Logo</div>
                              )}
                              <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => {
                                const file = e.target.files?.[0];
                                if(file){
                                  const reader = new FileReader();
                                  reader.onloadend = () => {
                                    const arr = [...footerPartners];
                                    arr[idx].imageUrl = reader.result;
                                    setFooterPartners(arr);
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }} />
                            </div>
                            <div className="flex-1 space-y-2 flex flex-col justify-center">
                              <input type="text" placeholder="URL (Opcional)" value={partner.link || ''} onChange={e => { const arr = [...footerPartners]; arr[idx].link = e.target.value; setFooterPartners(arr); }} className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-lg p-2 text-sm focus:border-primary" />
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
<div className="pt-6 border-t border-black/10 dark:border-white/10 flex justify-end mt-6">
              <button 
                type="submit" 
                className="bg-transparent border-2 border-primary text-primary hover:bg-primary/10 font-bold py-3 px-6 rounded-lg transition flex items-center gap-2"
              >
                <Save className="h-5 w-5" />
                Guardar Cambios
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
            className="text-xs bg-transparent border border-green-500 text-green-500 font-bold px-3 py-1.5 rounded hover:bg-green-500/10 transition"
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
                      <button onClick={() => handleDeleteRole(r.id)} className="text-xs bg-red-500/10 text-red-500 px-3 py-1.5 rounded-lg hover:bg-red-500/20 transition font-bold">Borrar</button>
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
                    { id: 'STAFF_MANAGE', label: 'Nómina y Personal' }
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
                <button type="button" onClick={() => setShowRoleModal(false)} className="bg-transparent border border-slate-500 text-slate-500 hover:bg-slate-500/10 px-4 py-2 rounded-lg text-sm transition">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-transparent border border-green-500 text-green-500 font-bold rounded-lg text-sm hover:bg-green-500/10">Guardar Rol</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE EMPLEADOS (Legacy Permisos) */}
      {showEmployeeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="bg-card border border-black/10 dark:border-white/10 rounded-xl max-w-lg w-full p-6 shadow-2xl glass flex flex-col max-h-[85vh]">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold flex items-center gap-2"><User className="h-5 w-5 text-primary"/> Buscar Empleado</h3>
              <button onClick={() => { setShowEmployeeModal(false); setSelectedEmpId(null); setEmpSearch(""); }} className="text-muted-foreground hover:text-white">&times;</button>
            </div>
            
            <input 
              type="text" 
              placeholder="Buscar por nombre o cédula..." 
              value={empSearch}
              onChange={(e) => setEmpSearch(e.target.value)}
              className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-lg p-3 text-sm focus:outline-none focus:border-primary mb-4" 
            />

            <div className="flex-1 overflow-y-auto space-y-2 pr-2">
              {employees.filter(e => e.name.toLowerCase().includes(empSearch.toLowerCase()) || e.cedula?.includes(empSearch)).map(emp => (
                <div key={emp.id} className="p-4 bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-lg hover:border-primary/50 transition">
                  <div className="flex justify-between items-center cursor-pointer" onClick={() => setSelectedEmpId(selectedEmpId === emp.id ? null : emp.id)}>
                    <div>
                      <h4 className="font-bold">{emp.name}</h4>
                      <p className="text-xs text-muted-foreground">{emp.role?.toUpperCase() || 'EMPLEADO'} - C.C. {emp.cedula}</p>
                    </div>
                    {emp.role === 'admin' && (
                      <span className="text-[10px] bg-primary/20 text-primary px-2 py-1 rounded font-bold uppercase">Acceso Total</span>
                    )}
                    {emp.role !== 'admin' && (
                      <button className="bg-transparent border border-primary text-primary hover:bg-primary/10 text-xs px-3 py-1 rounded transition">Editar Permisos</button>
                    )}
                  </div>
                  
                  {emp.role !== 'admin' && selectedEmpId === emp.id && (
                    <div className="mt-4 pt-4 border-t border-black/10 dark:border-white/10 flex flex-wrap gap-4">
                      {[
                        { id: 'POS_ACCESS', label: 'Caja (POS)' },
                        { id: 'INVENTORY_MANAGE', label: 'Inventario' },
                        { id: 'SALES_VIEW', label: 'Reportes Ventas' },
                        { id: 'CRM_MANAGE', label: 'CRM Membresías' },
                      ].map(perm => {
                        const hasPerm = emp.permissions?.includes(perm.id as any)
                        return (
                          <label key={perm.id} className="flex items-center gap-2 cursor-pointer text-sm">
                            <input 
                              type="checkbox" 
                              checked={hasPerm}
                              onChange={(e) => {
                                const newPerms = e.target.checked 
                                  ? [...(emp.permissions || []), perm.id]
                                  : (emp.permissions || []).filter(p => p !== perm.id)
                                updateEmployeePermissions(emp.id, newPerms as any)
                                getAllEmployees().then(setEmployees) // Refresh UI
                              }}
                              className="accent-primary h-4 w-4"
                            />
                            {perm.label}
                          </label>
                        )
                      })}
                    </div>
                  )}
                </div>
              ))}
              
              {employees.filter(e => e.name.toLowerCase().includes(empSearch.toLowerCase()) || e.cedula?.includes(empSearch)).length === 0 && (
                <div className="text-center text-sm text-muted-foreground p-4">No se encontraron empleados.</div>
              )}
            </div>
            
          </div>
        </div>
      )}
    </div>
  )
}
