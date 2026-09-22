import { Loader } from "@/components/ui/loader"
"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { Check, Dumbbell, ArrowLeft, Sun, Moon } from "lucide-react"
import Link from "next/link"
import { athleteService } from "@/lib/data-service"
import { useSettings } from "@/lib/settings-context"
import { useTheme } from "next-themes"

export default function RegistroPage() {
  const { registerAthlete, login } = useAuth()
  const { settings } = useSettings()
  const { theme, setTheme } = useTheme()
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
  
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const claveMatch = clave && confirmClave && clave === confirmClave

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (clave !== confirmClave) {
      setError("Las contraseñas no coinciden.")
      return
    }
    
    setIsLoading(true)

    const newUser = await registerAthlete(cedula, clave, { 
      name: nombre, 
      gender: genero, 
      phone: telefono, 
      email: correo, 
      address: direccion, 
      coachId: entrenador 
    })
    if (!newUser) {
      setError("La cédula ya está registrada o hubo un error en el servidor.")
      setIsLoading(false)
      return
    }

    // Attempt login if not staff
    const storedUserId = localStorage.getItem('gympro_session_id')
    if (!storedUserId) {
      const loginSuccess = await login(cedula, clave)
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
    <div className="min-h-screen flex flex-col items-center justify-center relative p-4 overflow-hidden bg-zinc-50 dark:bg-black transition-colors duration-500">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/30 via-zinc-50 to-zinc-50 dark:from-primary/20 dark:via-black dark:to-black opacity-80 dark:opacity-60 transition-colors duration-500" />
      </div>

      {/* Theme Toggle Top Right */}
      <button 
        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        className="absolute top-4 right-4 sm:top-6 sm:right-6 z-20 p-3 rounded-full bg-black/5 hover:bg-black/10 dark:bg-white/10 dark:hover:bg-white/20 text-foreground transition-all shadow-sm"
      >
        {theme === 'dark' ? <Sun className="h-6 w-6" /> : <Moon className="h-6 w-6" />}
      </button>

      <div className="z-10 w-full max-w-lg bg-white/70 dark:bg-black/40 backdrop-blur-md border border-black/10 dark:border-white/10 p-8 rounded-2xl flex flex-col items-center relative mt-8 shadow-2xl">
        <div className="w-full mb-2">
          <Link href="/login" className="inline-flex items-center text-base font-semibold text-muted-foreground hover:text-primary transition">
            <ArrowLeft className="h-5 w-5 mr-1.5" /> Volver
          </Link>
        </div>

        {settings.logoSettings?.showInLogin && (
          settings.logoUrl ? (
            <img src={settings.logoUrl} alt="Logo" style={{ width: settings.logoSettings.widthLogin, height: settings.logoSettings.heightLogin, objectFit: settings.logoSettings.objectFit || 'contain' }} className={`mb-0 ${settings.logoSettings.fadeEffect ? 'opacity-80' : ''}`} />
          ) : (
            <div style={{ width: settings.logoSettings.widthLogin, height: settings.logoSettings.heightLogin }} className="bg-primary/20 rounded-full flex items-center justify-center mb-0">
              <Dumbbell className="text-primary" style={{ width: settings.logoSettings.widthLogin / 2, height: settings.logoSettings.heightLogin / 2 }} />
            </div>
          )
        )}
        <h1 className="text-2xl font-bold mb-0 -mt-4 text-center leading-tight z-10">
          Únete a {settings.logoSettings?.showNameInLogin ? settings.appName : 'nuestra comunidad'}
        </h1>
        <p className="text-muted-foreground mb-6 mt-0 text-center text-sm z-10">
          Crea tu cuenta de atleta y selecciona a tu entrenador
        </p>

        {error && (
          <div className="w-full p-3 mb-6 bg-red-500/10 border border-red-500/50 text-red-500 text-sm rounded-lg text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="w-full space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 md:col-span-1">
              <label className="text-xs font-medium text-foreground mb-1 block">Nombre y Apellido</label>
              <input type="text" value={nombre} onChange={e => setNombre(e.target.value)} className="w-full bg-white dark:bg-[#1A1A1A] border border-black/10 dark:border-white/10 text-slate-900 dark:text-slate-100 rounded-lg p-3 text-sm focus:border-primary" placeholder="Ej. Pedro Pérez" required />
            </div>
            <div className="col-span-2 md:col-span-1">
              <label className="text-xs font-medium text-foreground mb-1 block">Cédula</label>
              <input type="text" value={cedula} onChange={e => setCedula(e.target.value)} className="w-full bg-white dark:bg-[#1A1A1A] border border-black/10 dark:border-white/10 text-slate-900 dark:text-slate-100 rounded-lg p-3 text-sm focus:border-primary" placeholder="12345678" required />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 md:col-span-1">
              <label className="text-xs font-medium text-foreground mb-1 block">Teléfono / WhatsApp</label>
              <input type="text" value={telefono} onChange={e => setTelefono(e.target.value)} className="w-full bg-white dark:bg-[#1A1A1A] border border-black/10 dark:border-white/10 text-slate-900 dark:text-slate-100 rounded-lg p-3 text-sm focus:border-primary" placeholder="Ej. 0414-1234567" required />
            </div>
            <div className="col-span-2 md:col-span-1">
              <label className="text-xs font-medium text-foreground mb-1 block">Correo Electrónico</label>
              <input type="email" value={correo} onChange={e => setCorreo(e.target.value)} className="w-full bg-white dark:bg-[#1A1A1A] border border-black/10 dark:border-white/10 text-slate-900 dark:text-slate-100 rounded-lg p-3 text-sm focus:border-primary" placeholder="tu@correo.com" required />
            </div>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            <div className="col-span-1">
              <label className="text-xs font-medium text-foreground mb-1 block">Dirección</label>
              <input type="text" value={direccion} onChange={e => setDireccion(e.target.value)} className="w-full bg-white dark:bg-[#1A1A1A] border border-black/10 dark:border-white/10 text-slate-900 dark:text-slate-100 rounded-lg p-3 text-sm focus:border-primary" placeholder="Tu dirección" required />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-foreground mb-1 block">Contraseña</label>
              <input type="password" value={clave} onChange={e => setClave(e.target.value)} className="w-full bg-white dark:bg-[#1A1A1A] border border-black/10 dark:border-white/10 text-slate-900 dark:text-slate-100 rounded-lg p-3 text-sm focus:border-primary" placeholder="••••••••" required />
            </div>
            <div className="relative">
              <label className="text-xs font-medium text-foreground mb-1 block">Confirmar Contraseña</label>
              <input type="password" value={confirmClave} onChange={e => setConfirmClave(e.target.value)} className={`w-full bg-black/5 dark:bg-white/5 border rounded-lg p-3 text-sm focus:outline-none transition-all ${confirmClave ? (claveMatch ? 'border-green-500/50 focus:border-green-500' : 'border-red-500/50 focus:border-red-500') : 'border-black/10 dark:border-white/10 focus:border-primary'}`} placeholder="••••••••" required />
              {claveMatch && <Check className="absolute right-3 top-9 h-4 w-4 text-green-500" />}
              {confirmClave && !claveMatch && <span className="text-[10px] text-red-500 absolute -bottom-4 left-0">No coinciden</span>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-2">
            <div className="col-span-2 md:col-span-1">
              <label className="text-xs font-medium text-foreground mb-1 block">Género</label>
              <div className="relative">
                <select value={genero} onChange={e => setGenero(e.target.value as 'M'|'F')} className="w-full bg-white dark:bg-[#1A1A1A] border border-black/10 dark:border-white/10 text-slate-900 dark:text-slate-100 rounded-lg p-3 text-sm focus:border-primary appearance-none pr-8">
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
                <select value={entrenador} onChange={e => setEntrenador(e.target.value)} className="w-full bg-white dark:bg-[#1A1A1A] border border-black/10 dark:border-white/10 text-slate-900 dark:text-slate-100 rounded-lg p-3 text-sm focus:border-primary appearance-none pr-8 cursor-pointer">
                  <option value="">-- Sin entrenador --</option>
                  <option value="4">Carlos (Staff)</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-foreground">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>
            </div>
          </div>

          <button type="submit" disabled={isLoading || (!!confirmClave && !claveMatch)} className="w-full border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground dark:bg-primary dark:text-primary-foreground dark:border-transparent font-bold py-3.5 rounded-xl hover:bg-primary/90 transition shadow-lg shadow-primary/20 flex items-center justify-center mt-6 disabled:opacity-50">
            {isLoading ? <Loader size={20} color="currentColor" /> : "Completar Registro"}
          </button>
        </form>
      </div>
    </div>
  )
}
