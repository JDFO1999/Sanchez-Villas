"use client"

import { useState, useEffect } from "react"
import { useAuth, User as UserType } from "@/lib/auth-context"
import { useSettings } from "@/lib/settings-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Save, Settings, Type, Palette, Image as ImageIcon, Store, User } from "lucide-react"
import { useRouter } from "next/navigation"
import { useToast } from "@/lib/toast-context"

export default function AjustesPage() {
  const { user, getAllEmployees, updateEmployeePermissions } = useAuth()
  const { settings, updateSettings } = useSettings()
  const router = useRouter()
  const { showToast } = useToast()
  const [employees, setEmployees] = useState<UserType[]>([])
  const [showEmployeeModal, setShowEmployeeModal] = useState(false)
  const [empSearch, setEmpSearch] = useState("")
  const [selectedEmpId, setSelectedEmpId] = useState<string | null>(null)
  
  useEffect(() => {
    setEmployees(getAllEmployees())
  }, [])

  const [appName, setAppName] = useState(settings.appName)
  const [primaryColor, setPrimaryColor] = useState(settings.primaryColor)
  const [secondaryColor, setSecondaryColor] = useState(settings.secondaryColor)
  const [borderColor, setBorderColor] = useState(settings.borderColor)
  const [fontFamily, setFontFamily] = useState(settings.fontFamily)
  const [logoUrl, setLogoUrl] = useState(settings.logoUrl)
  const [isGlass, setIsGlass] = useState(settings.isGlass)
  
  const [storeCurrency, setStoreCurrency] = useState(settings.storeCurrency)
  const [storeTaxRate, setStoreTaxRate] = useState(settings.storeTaxRate)
  const [storeReceiptMessage, setStoreReceiptMessage] = useState(settings.storeReceiptMessage)
  const [storeRif, setStoreRif] = useState(settings.storeRif)
  const [storeAddress, setStoreAddress] = useState(settings.storeAddress)
  const [storeTicketWidth, setStoreTicketWidth] = useState(settings.storeTicketWidth || '80mm')
  const [storeUseThermalPrinter, setStoreUseThermalPrinter] = useState(settings.storeUseThermalPrinter ?? true)

  // Ocultar si no es admin
  if (user?.role !== 'admin') {
    return <div className="p-8 text-center text-red-500 font-bold">Acceso Denegado. Solo administradores.</div>
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
      storeCurrency,
      storeTaxRate,
      storeReceiptMessage,
      storeRif,
      storeAddress,
      storeTicketWidth: storeTicketWidth as any,
      storeUseThermalPrinter
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

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Ajustes Globales</h1>
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
                  className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-sm text-foreground focus:outline-none focus:border-primary" 
                />
              </div>

              {/* Logo Upload */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <ImageIcon className="h-4 w-4 text-muted-foreground" /> Subir Logo (Imagen)
                </label>
                <div className="flex items-center gap-4">
                  {logoUrl && (
                    <div className="h-12 w-12 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center p-1 shrink-0 overflow-hidden">
                      <img src={logoUrl} alt="Logo Prev" className="max-h-full max-w-full object-contain" />
                    </div>
                  )}
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/20 file:text-primary hover:file:bg-primary/30 cursor-pointer" 
                  />
                  {logoUrl && (
                    <button type="button" onClick={() => setLogoUrl("")} className="text-xs text-red-500 hover:underline shrink-0">Quitar</button>
                  )}
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
                    className="flex-1 bg-black/40 border border-white/10 rounded-lg p-3 text-sm text-foreground focus:outline-none focus:border-primary uppercase" 
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
                    className="flex-1 bg-black/40 border border-white/10 rounded-lg p-3 text-sm text-foreground focus:outline-none focus:border-primary uppercase" 
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
                    className="flex-1 bg-black/40 border border-white/10 rounded-lg p-3 text-sm text-foreground focus:outline-none focus:border-primary uppercase" 
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
                  className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-sm text-foreground focus:outline-none focus:border-primary"
                >
                  <option value="arvo">Arvo (Deportiva / Slab Serif)</option>
                  <option value="inter">Inter (Moderna / Sans Serif)</option>
                  <option value="roboto">Roboto (Clásica / Sans Serif)</option>
                </select>
              </div>

              {/* Efecto Desvanecido */}
              <div className="space-y-2 md:col-span-2">
                <label className="flex items-center gap-3 cursor-pointer p-4 bg-black/40 border border-white/10 rounded-lg hover:border-primary/50 transition">
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

            <div className="pt-4 border-t border-white/10 mt-6 pt-6">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><Store className="h-5 w-5 text-primary" /> Configuración de Tienda y Facturación</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                <div className="space-y-2">
                  <label className="text-sm font-medium block">NIT / RIF Comercial</label>
                  <input 
                    type="text" 
                    value={storeRif}
                    onChange={(e) => setStoreRif(e.target.value)}
                    placeholder="Ej. J-12345678-9"
                    className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-sm focus:border-primary" 
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium block">Dirección Comercial (Ticket)</label>
                  <input 
                    type="text" 
                    value={storeAddress}
                    onChange={(e) => setStoreAddress(e.target.value)}
                    placeholder="Ej. Av. Principal..."
                    className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-sm focus:border-primary" 
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium block">Moneda (Símbolo)</label>
                  <input 
                    type="text" 
                    value={storeCurrency}
                    onChange={(e) => setStoreCurrency(e.target.value)}
                    placeholder="Ej. $, COP, MXN"
                    className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-sm focus:border-primary" 
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium block">Impuesto (IVA) %</label>
                  <input 
                    type="number" 
                    value={storeTaxRate}
                    onChange={(e) => setStoreTaxRate(Number(e.target.value))}
                    className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-sm focus:border-primary" 
                  />
                </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium block">Formato de Ticket (Impresora)</label>
                    <select 
                      value={storeTicketWidth}
                      onChange={(e) => setStoreTicketWidth(e.target.value as any)}
                      className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-sm focus:border-primary" 
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
                    className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-sm focus:border-primary" 
                  />
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-white/10 flex justify-end mt-6">
              <button 
                type="submit" 
                className="bg-primary text-primary-foreground font-bold py-3 px-6 rounded-lg hover:bg-primary/90 transition shadow-lg shadow-primary/20 flex items-center gap-2"
              >
                <Save className="h-5 w-5" />
                Guardar Cambios
              </button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="glass mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" /> Gestión de Personal (Permisos)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Administra qué módulos pueden ver y editar tus empleados (Entrenadores, Recepcionistas).</p>
            
            <button 
              type="button"
              onClick={() => setShowEmployeeModal(true)}
              className="bg-white/10 hover:bg-white/20 text-foreground font-bold py-3 px-6 rounded-lg transition border border-white/20 w-full md:w-auto"
            >
              Buscar Empleado para Editar Permisos...
            </button>
          </div>
        </CardContent>
      </Card>

      {/* MODAL DE EMPLEADOS */}
      {showEmployeeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="bg-card border border-white/10 rounded-xl max-w-lg w-full p-6 shadow-2xl glass flex flex-col max-h-[85vh]">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold flex items-center gap-2"><User className="h-5 w-5 text-primary"/> Buscar Empleado</h3>
              <button onClick={() => { setShowEmployeeModal(false); setSelectedEmpId(null); setEmpSearch(""); }} className="text-muted-foreground hover:text-white">&times;</button>
            </div>
            
            <input 
              type="text" 
              placeholder="Buscar por nombre o cédula..." 
              value={empSearch}
              onChange={(e) => setEmpSearch(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-sm focus:outline-none focus:border-primary mb-4" 
            />

            <div className="flex-1 overflow-y-auto space-y-2 pr-2">
              {employees.filter(e => e.name.toLowerCase().includes(empSearch.toLowerCase()) || e.cedula?.includes(empSearch)).map(emp => (
                <div key={emp.id} className="p-4 bg-black/40 border border-white/10 rounded-lg hover:border-primary/50 transition">
                  <div className="flex justify-between items-center cursor-pointer" onClick={() => setSelectedEmpId(selectedEmpId === emp.id ? null : emp.id)}>
                    <div>
                      <h4 className="font-bold">{emp.name}</h4>
                      <p className="text-xs text-muted-foreground">{emp.role?.toUpperCase() || 'EMPLEADO'} - C.C. {emp.cedula}</p>
                    </div>
                    {emp.role === 'admin' && (
                      <span className="text-[10px] bg-primary/20 text-primary px-2 py-1 rounded font-bold uppercase">Acceso Total</span>
                    )}
                    {emp.role !== 'admin' && (
                      <button className="text-xs bg-white/10 hover:bg-white/20 px-3 py-1 rounded transition">Editar Permisos</button>
                    )}
                  </div>
                  
                  {emp.role !== 'admin' && selectedEmpId === emp.id && (
                    <div className="mt-4 pt-4 border-t border-white/10 flex flex-wrap gap-4">
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
                                setEmployees(getAllEmployees()) // Refresh UI
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
