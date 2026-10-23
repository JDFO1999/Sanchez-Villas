"use client"

import { Loader } from "@/components/ui/loader"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { useSettings } from "@/lib/settings-context"
import { useRouter } from "next/navigation"
import { Check, ArrowLeft, Sun, Moon } from "lucide-react"
import Link from "next/link"
import { useTheme } from "next-themes"
import { getPublicCoaches } from "@/app/actions/users"

export default function RegistroPage() {
  const { registerAthlete, login } = useAuth()
  const { settings } = useSettings()
  const { theme, resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const router = useRouter()
  
  const [nombre, setNombre] = useState("")
  const [cedula, setCedula] = useState("")
  const [telefono, setTelefono] = useState("")
  const [correo, setCorreo] = useState("")
  const [direccion, setDireccion] = useState("")
  const [clave, setClave] = useState("")
  const [confirmClave, setConfirmClave] = useState("")
  const [genero, setGenero] = useState<'M' | 'F'>('M')
  const [entrenador, setEntrenador] = useState("")
  const [coaches, setCoaches] = useState<{ id: string; name: string }[]>([])
  
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    setMounted(true)
    getPublicCoaches().then(res => {
      if (res.success && Array.isArray(res.coaches)) {
        setCoaches(res.coaches)
      }
    }).catch(() => {})
  }, [])

  const currentTheme = mounted ? (theme === 'system' ? resolvedTheme : theme) : 'dark'
  const logoSrc = currentTheme === 'dark'
    ? (settings.logoUrlDark || settings.logoUrl)
    : (settings.logoUrl || settings.logoUrlDark)

  const claveMatch = clave && confirmClave && clave === confirmClave

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (clave !== confirmClave) {
      setError("Las contraseñas no coinciden.")
      return
    }
    const cleanCedula = cedula.replace(/\D/g, "").trim()
    if (!cleanCedula) {
      setError("Ingresa un número de cédula válido.")
      return
    }
    
    setIsLoading(true)

    const newUser = await registerAthlete(cleanCedula, clave, { 
      name: nombre, 
      gender: genero, 
      phone: telefono, 
      email: correo, 
      address: direccion, 
      coachId: entrenador || undefined
    })
    if (!newUser) {
      setError("La cédula ya está registrada o hubo un error en el servidor.")
      setIsLoading(false)
      return
    }

    // Attempt login if not staff
    const storedUserId = localStorage.getItem('gympro_session_id')
    if (!storedUserId) {
      const loginSuccess = await login(cleanCedula, clave)
      if (loginSuccess) {
        router.push("/")
      } else {
        router.push("/login")
      }
    } else {
      router.push(`/atletas/${newUser.id}`)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative p-4 overflow-hidden bg-background transition-colors duration-500">
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-background to-background opacity-80" />
      </div>

      {/* Theme Toggle Top Right */}
      <button 
        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        className="absolute top-4 right-4 sm:top-6 sm:right-6 z-20 p-3 rounded-full bg-black/5 hover:bg-black/10 dark:bg-white/10 dark:hover:bg-white/20 text-foreground transition-all shadow-sm"
      >
        {theme === 'dark' ? <Sun className="h-6 w-6" /> : <Moon className="h-6 w-6" />}
      </button>

      <div className="z-10 w-full max-w-lg bg-card/85 backdrop-blur-xl border border-black/10 dark:border-white/10 p-8 rounded-3xl flex flex-col items-center relative my-8 shadow-2xl">
        <div className="w-full mb-3 flex items-center justify-between">
          <Link href="/login" className="inline-flex items-center text-sm font-semibold text-muted-foreground hover:text-primary transition">
            <ArrowLeft className="h-4 w-4 mr-1.5" /> Volver al Inicio de Sesión
          </Link>
        </div>

        {settings.logoSettings?.showInLogin && (
          <div className="mb-4 flex items-center justify-center">
            {logoSrc ? (
              <img 
                src={logoSrc} 
                alt="Logo" 
                style={{ 
                  width: settings.logoSettings.widthLogin || 70, 
                  height: settings.logoSettings.heightLogin || 70, 
                  objectFit: settings.logoSettings.objectFit || 'contain',
                  maskImage: settings.logoSettings.fadeEffect ? 'linear-gradient(to bottom, black 50%, transparent 100%)' : 'none',
                  WebkitMaskImage: settings.logoSettings.fadeEffect ? 'linear-gradient(to bottom, black 50%, transparent 100%)' : 'none'
                }} 
                className="transition-all" 
              />
            ) : (
              <div 
                style={{ width: settings.logoSettings.widthLogin || 70, height: settings.logoSettings.heightLogin || 70 }} 
                className="bg-primary/15 border border-primary/30 rounded-2xl flex items-center justify-center text-primary font-black text-3xl shadow-inner select-none"
              >
                {(settings.appName || 'M').charAt(0).toUpperCase()}
              </div>
            )}
          </div>
        )}
        <h1 className="text-2xl font-black mb-1 text-center leading-tight tracking-tight text-foreground">
          Únete a {settings.logoSettings?.showNameInLogin ? settings.appName : 'nuestra comunidad'}
        </h1>
        <p className="text-muted-foreground mb-6 text-center text-xs leading-relaxed max-w-sm">
          Crea tu cuenta de atleta (si ya pagaste tu plan en recepción con tu cédula, se enlazará automáticamente)
        </p>

        {error && (
          <div className="w-full p-3 mb-6 bg-destructive/10 border border-destructive/50 text-destructive text-sm rounded-lg text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="w-full space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 md:col-span-1">
              <label className="text-xs font-medium text-foreground mb-1 block">Nombre y Apellido</label>
              <input type="text" value={nombre} onChange={e => setNombre(e.target.value)} className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 text-foreground rounded-xl p-3 text-sm focus:outline-none focus:border-primary transition-colors" placeholder="Ej. Pedro Pérez" required />
            </div>
            <div className="col-span-2 md:col-span-1">
              <label className="text-xs font-medium text-foreground mb-1 block">Cédula (Solo números)</label>
              <input type="text" value={cedula} onChange={e => setCedula(e.target.value.replace(/\D/g, ""))} className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 text-foreground rounded-xl p-3 text-sm font-mono focus:outline-none focus:border-primary transition-colors" placeholder="12345678" required />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 md:col-span-1">
              <label className="text-xs font-medium text-foreground mb-1 block">Teléfono / WhatsApp</label>
              <input type="text" value={telefono} onChange={e => setTelefono(e.target.value)} className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 text-foreground rounded-xl p-3 text-sm focus:outline-none focus:border-primary transition-colors" placeholder="Ej. 0414-1234567" required />
            </div>
            <div className="col-span-2 md:col-span-1">
              <label className="text-xs font-medium text-foreground mb-1 block">Correo Electrónico</label>
              <input type="email" value={correo} onChange={e => setCorreo(e.target.value)} className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 text-foreground rounded-xl p-3 text-sm focus:outline-none focus:border-primary transition-colors" placeholder="tu@correo.com" required />
            </div>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            <div className="col-span-1">
              <label className="text-xs font-medium text-foreground mb-1 block">Dirección</label>
              <input type="text" value={direccion} onChange={e => setDireccion(e.target.value)} className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 text-foreground rounded-xl p-3 text-sm focus:outline-none focus:border-primary transition-colors" placeholder="Tu dirección" required />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-foreground mb-1 block">Contraseña</label>
              <input type="password" value={clave} onChange={e => setClave(e.target.value)} className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 text-foreground rounded-xl p-3 text-sm focus:outline-none focus:border-primary transition-colors" placeholder="••••••••" required />
            </div>
            <div className="relative">
              <label className="text-xs font-medium text-foreground mb-1 block">Confirmar Contraseña</label>
              <input type="password" value={confirmClave} onChange={e => setConfirmClave(e.target.value)} className={`w-full bg-black/5 dark:bg-black/40 border rounded-xl p-3 text-sm focus:outline-none transition-all ${confirmClave ? (claveMatch ? 'border-success/50 focus:border-success' : 'border-destructive/50 focus:border-destructive') : 'border-black/10 dark:border-white/10 focus:border-primary'}`} placeholder="••••••••" required />
              {claveMatch && <Check className="absolute right-3 top-9 h-4 w-4 text-success" />}
              {confirmClave && !claveMatch && <span className="text-[10px] text-destructive absolute -bottom-4 left-0">No coinciden</span>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-2">
            <div className="col-span-2 md:col-span-1">
              <label className="text-xs font-medium text-foreground mb-1 block">Género</label>
              <div className="relative">
                <select value={genero} onChange={e => setGenero(e.target.value as 'M'|'F')} className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 text-foreground rounded-xl p-3 text-sm focus:outline-none focus:border-primary appearance-none pr-8">
                  <option value="M">Masculino</option>
                  <option value="F">Femenino</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-foreground">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>
            </div>
            <div className="col-span-2 md:col-span-1">
              <label className="text-xs font-medium text-foreground mb-1 block">Entrenador (Opcional)</label>
              <div className="relative">
                <select value={entrenador} onChange={e => setEntrenador(e.target.value)} className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 text-foreground rounded-xl p-3 text-sm focus:outline-none focus:border-primary appearance-none pr-8 cursor-pointer">
                  <option value="">-- Sin entrenador --</option>
                  {coaches.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-foreground">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isLoading || (!!confirmClave && !claveMatch)} 
            className="w-full bg-transparent border-2 border-primary text-primary hover:bg-primary/10 active:scale-[0.99] font-extrabold py-3.5 rounded-xl transition flex items-center justify-center disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {isLoading ? <Loader size={20} color="currentColor" /> : "Completar Registro"}
          </button>
        </form>
      </div>
    </div>
  )
}
