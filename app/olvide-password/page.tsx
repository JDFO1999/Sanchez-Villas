"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSettings } from "@/lib/settings-context"
import { useTheme } from "next-themes"
import Link from "next/link"
import { Mail, ArrowLeft, Sun, Moon, CheckCircle2, ShieldAlert } from "lucide-react"
import { Loader } from "@/components/ui/loader"
import { requestPasswordReset } from "@/app/actions/auth-reset"

export default function OlvidePasswordPage() {
  const router = useRouter()
  const { settings } = useSettings()
  const { theme, resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  const [identifier, setIdentifier] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [successData, setSuccessData] = useState<{ maskedEmail: string; userName: string } | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (!identifier.trim()) {
      setError("Por favor ingresa tu cédula o correo electrónico.")
      return
    }

    setIsLoading(true)
    try {
      const res = await requestPasswordReset(identifier)
      if (res.success) {
        setSuccessData({
          maskedEmail: res.maskedEmail || "",
          userName: res.userName || "Atleta"
        })
      } else {
        setError(res.error || "No se pudo procesar la solicitud.")
      }
    } catch (err: any) {
      setError(err?.message || "Ocurrió un error inesperado al conectar con el servidor.")
    } finally {
      setIsLoading(false)
    }
  }

  const currentTheme = mounted ? (theme === 'system' ? resolvedTheme : theme) : 'dark'
  const logoSrc = currentTheme === 'dark'
    ? (settings.logoUrlDark || settings.logoUrl)
    : (settings.logoUrl || settings.logoUrlDark)

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

      <div className="z-10 w-full max-w-md bg-card/85 backdrop-blur-xl border border-black/10 dark:border-white/10 p-8 rounded-3xl flex flex-col items-center shadow-2xl relative">
        
        {/* Logo */}
        <div className="mb-3 flex items-center justify-center">
          {logoSrc ? (
            <img 
              src={logoSrc} 
              alt="Logo" 
              className="h-16 w-16 object-contain transition-all" 
            />
          ) : (
            <div className="h-16 w-16 bg-primary/15 border border-primary/30 rounded-2xl flex items-center justify-center text-primary font-black text-2xl shadow-inner select-none">
              {(settings.appName || 'M').charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        <h1 className="text-2xl font-black mb-1 text-center leading-tight tracking-tight text-foreground">
          {settings.appName || "Maximum Evolution Fit"}
        </h1>

        {successData ? (
          <div className="w-full text-center py-6 space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 mx-auto flex items-center justify-center shadow-lg">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <h2 className="text-xl font-black text-foreground">¡Correo Enviado!</h2>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-sm mx-auto">
              Hemos enviado un enlace seguro para restablecer tu contraseña al correo asociado a tu cuenta:
            </p>
            <div className="p-3 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl font-mono text-sm font-bold text-primary">
              {successData.maskedEmail}
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              ⏳ El enlace tiene una validez de <strong>60 minutos</strong>. Revisa también tu carpeta de correo no deseado (SPAM) si no lo ves de inmediato.
            </p>
            <div className="pt-2">
              <button
                onClick={() => router.push("/login")}
                className="w-full bg-transparent border-2 border-primary text-primary hover:bg-primary/10 font-bold py-3 rounded-xl transition flex items-center justify-center gap-2 text-sm"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Volver al Inicio de Sesión</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="w-full mt-2">
            <p className="text-muted-foreground mb-6 text-center text-xs leading-relaxed max-w-sm mx-auto">
              Ingresa tu cédula o correo electrónico para recibir un enlace seguro de restablecimiento de contraseña.
            </p>

            {error && (
              <div className="w-full p-3 mb-4 bg-destructive/10 border border-destructive/40 text-destructive text-xs rounded-xl text-center font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-foreground mb-1 block">Cédula o Correo Electrónico</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="Ej. 12345678 o tu@correo.com"
                    className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-xl pl-9 pr-4 py-3 text-sm text-foreground focus:outline-none focus:border-primary transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-transparent border-2 border-primary text-primary hover:bg-primary/10 font-bold py-3.5 rounded-xl transition flex items-center justify-center disabled:opacity-50 active:scale-[0.99] text-sm mt-2"
              >
                {isLoading ? <Loader size={18} color="currentColor" /> : "Enviar Enlace de Recuperación"}
              </button>
            </form>
          </div>
        )}

        <div className="mt-6 pt-4 border-t border-black/10 dark:border-white/10 w-full text-center">
          <Link href="/login" className="inline-flex items-center text-xs font-semibold text-muted-foreground hover:text-primary transition">
            <ArrowLeft className="h-3.5 w-3.5 mr-1" /> Volver a Iniciar Sesión
          </Link>
        </div>

      </div>
    </div>
  )
}
