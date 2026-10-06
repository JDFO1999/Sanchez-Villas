"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { useSettings } from "@/lib/settings-context"
import { useTheme } from "next-themes"
import { useRouter } from "next/navigation"
import { Loader } from "@/components/ui/loader"
import { Dumbbell, Lock, User as UserIcon, Sun, Moon, Mail, X, Eye, EyeOff } from "lucide-react"
import Link from "next/link"
import { Dialog } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

export default function LoginPage() {
  const { login } = useAuth()
  const { settings } = useSettings()
  const { theme, setTheme } = useTheme()
  const router = useRouter()
  
  const [cedula, setCedula] = useState("")
  const [clave, setClave] = useState("")
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
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
      <Dialog
        open={showRecoveryModal}
        onClose={() => setShowRecoveryModal(false)}
        title={recoveryStep === 1 ? "Recuperar contraseña" : "Correo enviado"}
        description={recoveryStep === 1
          ? "Ingresa tu cédula o correo electrónico y te enviaremos instrucciones para restablecer tu clave."
          : `Hemos enviado las instrucciones a la cuenta asociada a ${recoveryInput}. Revisa tu bandeja de entrada.`}
      >
        {recoveryStep === 1 ? (
          <form onSubmit={handleSendRecovery} className="w-full space-y-4">
            <label htmlFor="recovery" className="sr-only">Cédula o correo electrónico</label>
            <input
              id="recovery"
              type="text"
              value={recoveryInput}
              onChange={(e) => setRecoveryInput(e.target.value)}
              placeholder="Ej. 12345678 o correo@ejemplo.com"
              className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm"
              required
            />
            <Button type="submit" className="w-full">Enviar instrucciones</Button>
          </form>
        ) : (
          <Button variant="outline" className="w-full" onClick={() => setShowRecoveryModal(false)}>Cerrar</Button>
        )}
      </Dialog>

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
          <h1 className="font-display text-4xl font-extrabold uppercase tracking-tight mb-0 -mt-4 z-10">{settings.appName}</h1>
        )}
        <p className="text-muted-foreground mb-6 mt-1 text-center leading-tight z-10">
          Ingresa tus credenciales para continuar
        </p>

        {error && (
          <div role="alert" className="w-full p-3 mb-6 bg-destructive/10 border border-destructive/50 text-destructive text-sm rounded-lg text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="w-full space-y-4">
          <div>
            <label htmlFor="cedula" className="text-sm font-medium text-foreground mb-1.5 block">Cédula de Identidad</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                <UserIcon className="h-5 w-5" />
              </div>
              <input
                type="text"
                value={cedula}
                id="cedula" autoComplete="username" inputMode="numeric" onChange={(e) => setCedula(e.target.value)}
                className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl pl-10 pr-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                placeholder="Ej. 1234"
                required
              />
            </div>
          </div>

          <div>
            <div>
              <label htmlFor="clave" className="text-sm font-medium text-foreground mb-1.5 block">Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground" aria-hidden="true" />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  className="absolute right-2 top-1.5 p-2 rounded-lg text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
                <input
                  type={showPassword ? "text" : "password"} id="clave" autoComplete="current-password"
                  value={clave}
                  onChange={(e) => setClave(e.target.value)}
                  className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl pl-10 pr-12 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
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
            className="w-full bg-transparent border-2 border-primary text-primary hover:bg-primary/10 font-bold py-3.5 rounded-xl transition flex items-center justify-center disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {isLoading ? (
              <Loader size={20} color="currentColor" />
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
