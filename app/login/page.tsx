"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { useSettings } from "@/lib/settings-context"
import { useTheme } from "next-themes"
import { useRouter } from "next/navigation"
import { Dumbbell, Lock, User as UserIcon, Sun, Moon, Mail, X } from "lucide-react"
import Link from "next/link"

export default function LoginPage() {
  const { login } = useAuth()
  const { settings } = useSettings()
  const { theme, setTheme } = useTheme()
  const router = useRouter()
  
  const [cedula, setCedula] = useState("")
  const [clave, setClave] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showRecoveryModal, setShowRecoveryModal] = useState(false)
  const [recoveryMessage, setRecoveryMessage] = useState("")

  const [recoveryInput, setRecoveryInput] = useState("")
  const [recoveryStep, setRecoveryStep] = useState<1 | 2>(1)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    const success = await login(cedula, clave)
    if (success) {
      router.push("/")
    } else {
      setError("Cédula o contraseña incorrectos")
      setIsLoading(false)
    }
  }

  const handleOpenRecovery = () => {
    setRecoveryInput(cedula) // Prefill with cedula if they already typed it
    setRecoveryStep(1)
    setShowRecoveryModal(true)
  }

  const handleSendRecovery = (e: React.FormEvent) => {
    e.preventDefault()
    if (!recoveryInput) return
    // Here we would call the API to send the email
    setRecoveryStep(2)
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative p-4 overflow-hidden bg-zinc-50 dark:bg-black transition-colors duration-500">
      {/* Abstract Background for Login */}
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

      {/* Recovery Modal */}
      {showRecoveryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-background border border-black/10 dark:border-white/10 p-6 rounded-2xl shadow-xl w-full max-w-sm relative flex flex-col items-center text-center animate-in fade-in zoom-in duration-200">
            <button 
              onClick={() => setShowRecoveryModal(false)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="w-12 h-12 bg-primary/20 text-primary rounded-full flex items-center justify-center mb-4 mt-2">
              <Mail className="h-6 w-6" />
            </div>
            
            {recoveryStep === 1 ? (
              <>
                <h3 className="text-xl font-bold mb-2">Recuperar Contraseña</h3>
                <p className="text-sm text-muted-foreground mb-6">
                  Ingresa tu cédula o correo electrónico y te enviaremos instrucciones para restablecer tu clave.
                </p>
                <form onSubmit={handleSendRecovery} className="w-full space-y-4">
                  <input
                    type="text"
                    value={recoveryInput}
                    onChange={(e) => setRecoveryInput(e.target.value)}
                    placeholder="Ej. 12345678 o correo@ejemplo.com"
                    className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm"
                    required
                  />
                  <button 
                    type="submit"
                    className="w-full bg-primary text-primary-foreground font-bold py-3 rounded-xl hover:opacity-90 transition"
                  >
                    Enviar instrucciones
                  </button>
                </form>
              </>
            ) : (
              <>
                <h3 className="text-xl font-bold mb-2">¡Correo Enviado!</h3>
                <p className="text-sm text-muted-foreground mb-6">
                  Hemos enviado las instrucciones a la cuenta asociada a <strong>{recoveryInput}</strong>. Revisa tu bandeja de entrada.
                </p>
                <button 
                  onClick={() => setShowRecoveryModal(false)}
                  className="w-full bg-black/5 dark:bg-white/5 text-foreground font-bold py-3 rounded-xl hover:bg-black/10 dark:hover:bg-white/10 transition border border-black/10 dark:border-white/10"
                >
                  Cerrar
                </button>
              </>
            )}
          </div>
        </div>
      )}

      <div className="z-10 w-full max-w-md bg-white/70 dark:bg-black/40 backdrop-blur-md border border-black/10 dark:border-white/10 p-8 rounded-2xl flex flex-col items-center shadow-2xl">
        {settings.logoSettings?.showInLogin && (
          (settings.logoUrl || settings.logoUrlDark) ? (
            <img 
              src={(theme === 'dark' && settings.logoUrlDark) ? settings.logoUrlDark : (settings.logoUrl || settings.logoUrlDark)} 
              alt="Logo" 
              style={{ 
                width: settings.logoSettings.widthLogin, 
                height: settings.logoSettings.heightLogin,
                objectFit: settings.logoSettings.objectFit,
                maskImage: settings.logoSettings.fadeEffect ? 'linear-gradient(to bottom, black 50%, transparent 100%)' : 'none',
                WebkitMaskImage: settings.logoSettings.fadeEffect ? 'linear-gradient(to bottom, black 50%, transparent 100%)' : 'none'
              }} 
              className="mb-0 transition-all" 
            />
          ) : (
            <div style={{ width: settings.logoSettings.widthLogin, height: settings.logoSettings.heightLogin }} className="bg-primary/20 rounded-full flex items-center justify-center mb-0">
              <Dumbbell className="text-primary" style={{ width: settings.logoSettings.widthLogin / 2, height: settings.logoSettings.heightLogin / 2 }} />
            </div>
          )
        )}
        {settings.logoSettings?.showNameInLogin && (
          <h1 className="text-3xl font-bold mb-0 -mt-4 z-10">{settings.appName}</h1>
        )}
        <p className="text-muted-foreground mb-6 mt-0 text-center leading-tight z-10">
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
            <div className="space-y-2">
              <label className="text-sm font-bold text-muted-foreground ml-1">Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground" />
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
          </div>

          <div className="flex justify-end pt-1 pb-2">
            <button 
              type="button" 
              onClick={handleOpenRecovery}
              className="text-sm text-primary hover:text-primary/80 transition-colors"
            >
              ¿Olvidaste tu clave?
            </button>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-transparent border-2 border-primary text-primary hover:bg-primary/10 font-bold py-3.5 rounded-xl transition flex items-center justify-center"
          >
            {isLoading ? (
              <Dumbbell className="h-5 w-5 animate-spin" />
            ) : (
              "Iniciar Sesión"
            )}
          </button>
          </form>
        <div className="mt-4 text-center">
            <span className="text-sm text-muted-foreground">¿Eres un nuevo atleta? </span>
            <button 
              type="button" 
              onClick={() => router.push('/registro')} 
              className="text-sm text-primary hover:underline font-medium"
            >
              Regístrate aquí
            </button>
          </div>

      </div>
    </div>
  )
}
