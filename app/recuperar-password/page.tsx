"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { useSettings } from "@/lib/settings-context"
import { useTheme } from "next-themes"
import Link from "next/link"
import { Lock, Eye, EyeOff, Check, AlertCircle, ArrowLeft, Sun, Moon, ShieldCheck } from "lucide-react"
import { Loader } from "@/components/ui/loader"
import { verifyPasswordResetToken, resetPasswordWithToken } from "@/app/actions/auth-reset"
import { validatePassword } from "@/lib/password-validator"

function RecuperarPasswordContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { settings } = useSettings()
  const { theme, resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  const token = searchParams.get("token") || ""

  const [isValidating, setIsValidating] = useState(true)
  const [tokenValid, setTokenValid] = useState(false)
  const [tokenError, setTokenError] = useState("")
  const [userName, setUserName] = useState("")

  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState("")
  const [isSuccess, setIsSuccess] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!token) {
      setIsValidating(false)
      setTokenValid(false)
      setTokenError("No se proporcionó ningún token de recuperación en el enlace.")
      return
    }

    verifyPasswordResetToken(token)
      .then((res) => {
        if (res.valid) {
          setTokenValid(true)
          setUserName(res.userName || "Atleta")
        } else {
          setTokenValid(false)
          setTokenError(res.error || "El enlace es inválido o ha expirado.")
        }
      })
      .catch(() => {
        setTokenValid(false)
        setTokenError("Error al verificar el enlace de seguridad.")
      })
      .finally(() => {
        setIsValidating(false)
      })
  }, [token])

  const passwordsMatch = password && confirmPassword && password === confirmPassword
  const pwdValidation = validatePassword(password)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError("")

    if (!pwdValidation.isValid) {
      setSubmitError(pwdValidation.error || "La contraseña debe tener al menos 8 caracteres, mayúscula, minúscula y número.")
      return
    }

    if (!passwordsMatch) {
      setSubmitError("Las contraseñas no coinciden.")
      return
    }

    setIsSubmitting(true)
    try {
      const res = await resetPasswordWithToken(token, password)
      if (res.success) {
        setIsSuccess(true)
      } else {
        setSubmitError(res.error || "No se pudo actualizar la contraseña.")
      }
    } catch (err: any) {
      setSubmitError(err?.message || "Ocurrió un error inesperado.")
    } finally {
      setIsSubmitting(false)
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

        {isValidating ? (
          <div className="py-12 flex flex-col items-center justify-center space-y-4">
            <Loader size={36} color="currentColor" />
            <p className="text-xs text-muted-foreground font-semibold">Validando enlace de seguridad...</p>
          </div>
        ) : isSuccess ? (
          <div className="w-full text-center py-6 space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 mx-auto flex items-center justify-center shadow-lg">
              <ShieldCheck className="w-9 h-9" />
            </div>
            <h2 className="text-xl font-black text-foreground">¡Contraseña Actualizada!</h2>
            <p className="text-xs text-muted-foreground max-w-xs mx-auto leading-relaxed">
              Tu contraseña ha sido restablecida exitosamente. Ya puedes iniciar sesión con tu nueva clave.
            </p>
            <div className="pt-2">
              <button
                onClick={() => router.push("/login")}
                className="w-full bg-primary text-primary-foreground font-bold py-3.5 rounded-xl hover:opacity-90 transition active:scale-[0.99] shadow-lg shadow-primary/20"
              >
                Iniciar Sesión Ahora
              </button>
            </div>
          </div>
        ) : !tokenValid ? (
          <div className="w-full text-center py-6 space-y-4">
            <div className="w-16 h-16 rounded-full bg-destructive/10 border border-destructive/30 text-destructive mx-auto flex items-center justify-center shadow-lg">
              <AlertCircle className="w-8 h-8" />
            </div>
            <h2 className="text-lg font-black text-foreground">Enlace No Válido o Expirado</h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {tokenError || "Este enlace de recuperación ya fue utilizado o superó el tiempo límite de seguridad (60 minutos)."}
            </p>
            <div className="pt-2 flex flex-col gap-2">
              <Link
                href="/login"
                className="w-full bg-transparent border-2 border-primary text-primary hover:bg-primary/10 font-bold py-3 rounded-xl transition flex items-center justify-center gap-2 text-sm"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Volver al Inicio de Sesión</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="w-full mt-2">
            <div className="text-center mb-6">
              <p className="text-sm font-bold text-foreground">Hola, {userName}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Crea una nueva contraseña segura para tu cuenta.
              </p>
            </div>

            {submitError && (
              <div className="w-full p-3 mb-4 bg-destructive/10 border border-destructive/40 text-destructive text-xs rounded-xl text-center font-medium">
                {submitError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-foreground mb-1 block">Nueva Contraseña</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mínimo 8 caracteres (Mayúscula, minúscula y número)"
                    className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-xl pl-9 pr-10 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {password.length > 0 && (
                  <div className="mt-2 p-2.5 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 grid grid-cols-2 gap-1.5 text-[11px]">
                    <span className={pwdValidation.hasMinLength ? "text-emerald-500 font-semibold" : "text-muted-foreground"}>
                      {pwdValidation.hasMinLength ? "✓" : "○"} Mín. 8 caracteres
                    </span>
                    <span className={pwdValidation.hasUpperCase ? "text-emerald-500 font-semibold" : "text-muted-foreground"}>
                      {pwdValidation.hasUpperCase ? "✓" : "○"} 1 Mayúscula (A-Z)
                    </span>
                    <span className={pwdValidation.hasLowerCase ? "text-emerald-500 font-semibold" : "text-muted-foreground"}>
                      {pwdValidation.hasLowerCase ? "✓" : "○"} 1 Minúscula (a-z)
                    </span>
                    <span className={pwdValidation.hasNumber ? "text-emerald-500 font-semibold" : "text-muted-foreground"}>
                      {pwdValidation.hasNumber ? "✓" : "○"} 1 Número (0-9)
                    </span>
                  </div>
                )}
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground mb-1 block">Confirmar Nueva Contraseña</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repite la contraseña"
                    className={`w-full bg-black/5 dark:bg-black/40 border rounded-xl pl-9 pr-10 py-2.5 text-sm text-foreground focus:outline-none transition ${
                      confirmPassword
                        ? passwordsMatch
                          ? 'border-emerald-500 focus:border-emerald-500'
                          : 'border-rose-500 focus:border-rose-500'
                        : 'border-black/10 dark:border-white/10 focus:border-primary'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {confirmPassword && passwordsMatch && (
                  <p className="text-[11px] text-emerald-500 font-semibold mt-1 flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Las contraseñas coinciden
                  </p>
                )}
                {confirmPassword && !passwordsMatch && (
                  <p className="text-[11px] text-rose-500 font-semibold mt-1">
                    Las contraseñas no coinciden
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-transparent border-2 border-primary text-primary hover:bg-primary/10 font-bold py-3 rounded-xl transition flex items-center justify-center disabled:opacity-50 active:scale-[0.99] text-sm mt-2"
              >
                {isSubmitting ? <Loader size={18} color="currentColor" /> : "Guardar Nueva Contraseña"}
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

export default function RecuperarPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader size={36} color="currentColor" />
      </div>
    }>
      <RecuperarPasswordContent />
    </Suspense>
  )
}
