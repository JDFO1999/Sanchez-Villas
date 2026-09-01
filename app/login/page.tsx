"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { useSettings } from "@/lib/settings-context"
import { useRouter } from "next/navigation"
import { Dumbbell, Lock, User as UserIcon } from "lucide-react"
import Link from "next/link"

export default function LoginPage() {
  const { login } = useAuth()
  const { settings } = useSettings()
  const router = useRouter()
  
  const [cedula, setCedula] = useState("")
  const [clave, setClave] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    setTimeout(() => {
      const success = login(cedula, clave)
      if (success) {
        router.push("/")
      } else {
        setError("Cédula o contraseña incorrectos")
        setIsLoading(false)
      }
    }, 800)
  }

  const handleRecuperarClave = () => {
    if (!cedula) {
      alert("Por favor ingresa tu cédula para enviar el correo de recuperación.")
      return
    }
    alert(`Correo de recuperación enviado simuladamente al usuario con cédula ${cedula}.`)
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative p-4 overflow-hidden">
      {/* Abstract Background for Login */}
      <div className="absolute inset-0 z-0 bg-black">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-black to-black opacity-60" />
      </div>

      <div className="z-10 w-full max-w-md glass p-8 rounded-2xl flex flex-col items-center">
        {settings.logoSettings?.showInLogin && (
          settings.logoUrl ? (
            <img src={settings.logoUrl} alt="Logo" style={{ width: settings.logoSettings.sizeLogin, height: settings.logoSettings.sizeLogin }} className="object-contain mb-6" />
          ) : (
            <div style={{ width: settings.logoSettings.sizeLogin, height: settings.logoSettings.sizeLogin }} className="bg-primary/20 rounded-full flex items-center justify-center mb-6">
              <Dumbbell className="text-primary" style={{ width: settings.logoSettings.sizeLogin / 2, height: settings.logoSettings.sizeLogin / 2 }} />
            </div>
          )
        )}
        {settings.logoSettings?.showNameInLogin && (
          <h1 className="text-3xl font-bold mb-2">{settings.appName}</h1>
        )}
        <p className="text-muted-foreground mb-8 text-center">
          Ingresa tus credenciales para continuar
        </p>

        {error && (
          <div className="w-full p-3 mb-6 bg-red-500/10 border border-red-500/50 text-red-500 text-sm rounded-lg text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="w-full space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">Cédula de Identidad</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                <UserIcon className="h-5 w-5" />
              </div>
              <input
                type="text"
                value={cedula}
                onChange={(e) => setCedula(e.target.value)}
                className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl pl-10 pr-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                placeholder="Ej. 1234"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">Contraseña</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                <Lock className="h-5 w-5" />
              </div>
              <input
                type="password"
                value={clave}
                onChange={(e) => setClave(e.target.value)}
                className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl pl-10 pr-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <div className="flex justify-end pt-1 pb-2">
            <button 
              type="button" 
              onClick={handleRecuperarClave}
              className="text-sm text-primary hover:text-primary/80 transition-colors"
            >
              ¿Olvidaste tu clave?
            </button>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary text-primary-foreground font-bold py-3.5 rounded-xl hover:bg-primary/90 transition shadow-lg shadow-primary/20 flex items-center justify-center"
          >
            {isLoading ? (
              <Dumbbell className="h-5 w-5 animate-spin" />
            ) : (
              "Iniciar Sesión"
            )}
          </button>
          <div className="mt-4 text-center">
            <span className="text-sm text-muted-foreground">¿Eres un nuevo atleta? </span>
            <Link href="/registro" className="text-sm text-primary hover:underline font-medium">
              Regístrate aquí
            </Link>
          </div>
        </form>

        <div className="mt-8 pt-6 border-t border-black/10 dark:border-white/10 w-full text-center text-xs text-muted-foreground">
          <p>Credenciales de prueba:</p>
          <div className="mt-2 grid grid-cols-2 gap-2 text-left bg-black/5 dark:bg-black/40 p-3 rounded-lg">
            <div><span className="text-primary">Admin:</span> 1234 / admin</div>
            <div><span className="text-primary">Coach:</span> 5678 / entrenador</div>
            <div className="col-span-2"><span className="text-primary">Atleta:</span> 9012 / atleta</div>
          </div>
        </div>
      </div>
    </div>
  )
}
