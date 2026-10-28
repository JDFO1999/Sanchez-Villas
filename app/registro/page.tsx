"use client"

import { Loader } from "@/components/ui/loader"
import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { useSettings } from "@/lib/settings-context"
import { useRouter } from "next/navigation"
import { Check, ArrowLeft, Sun, Moon, Eye, EyeOff, ShieldCheck, ShieldAlert, AlertCircle } from "lucide-react"
import Link from "next/link"
import { useTheme } from "next-themes"
import { getPublicCoaches, createAthlete } from "@/app/actions/users"
import { validatePassword } from "@/lib/password-validator"
import { showSweetToast } from "@/lib/toast-context"

export default function RegistroPage() {
  const { user, login } = useAuth()
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
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
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

  const cleanCedula = cedula.replace(/\D/g, "").slice(0, 8)
  const isCedulaComplete = cleanCedula.length >= 7 && cleanCedula.length <= 8
  const pwdValidation = validatePassword(clave, cleanCedula)
  const claveMatch = clave && confirmClave && clave === confirmClave

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!nombre.trim()) {
      const msg = "Por favor ingresa tu nombre y apellido."
      setError(msg)
      showSweetToast(msg, "warning")
      return
    }

    if (cleanCedula.length < 7 || cleanCedula.length > 8) {
      const msg = "La cédula de identidad debe contener 7 u 8 dígitos numéricos (ej. 12345678)."
      setError(msg)
      showSweetToast(msg, "warning")
      return
    }

    if (!correo.trim()) {
      const msg = "Por favor ingresa tu correo electrónico."
      setError(msg)
      showSweetToast(msg, "warning")
      return
    }

    if (!pwdValidation.isValid) {
      const msg = pwdValidation.error || "La contraseña debe tener al menos 8 caracteres, mayúscula, minúscula y número."
      setError(msg)
      showSweetToast(msg, "warning")
      return
    }

    if (clave !== confirmClave) {
      const msg = "Las contraseñas no coinciden."
      setError(msg)
      showSweetToast(msg, "warning")
      return
    }
    
    setIsLoading(true)

    try {
      const res = await createAthlete(cleanCedula, clave, { 
        name: nombre.trim(), 
        gender: genero, 
        phone: telefono.trim(), 
        email: correo.trim(), 
        address: direccion.trim(), 
        coachId: entrenador || undefined,
        isSelfRegistration: true,
      })

      if (!res || !res.success) {
        const msg = res?.error || "La cédula ya está registrada o hubo un error en el servidor."
        setError(msg)
        showSweetToast(msg, "error")
        setIsLoading(false)
        return
      }

      showSweetToast("¡Cuenta creada exitosamente!", "success")

      // Verificar si quien está operando tiene sesión activa como personal del gimnasio
      const isStaffSession = Boolean(
        user && ["admin", "gerente", "cajero", "recepcion", "coach", "employee"].includes(String(user.role || "").toLowerCase())
      )

      if (!isStaffSession) {
        const loginRes = await login(cleanCedula, clave)
        const loginOk = loginRes === true || (typeof loginRes === "object" && loginRes?.success)
        if (loginOk) {
          router.push("/")
          router.refresh()
        } else {
          router.push("/login")
        }
      } else {
        router.push(res.user?.id ? `/atletas/${res.user.id}` : "/atletas")
      }
    } catch (err: any) {
      const msg = err?.message || "Ocurrió un error inesperado al procesar el registro."
      setError(msg)
      showSweetToast(msg, "error")
      setIsLoading(false)
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
        aria-label="Alternar tema"
      >
        {theme === 'dark' ? <Sun className="h-6 w-6" /> : <Moon className="h-6 w-6" />}
      </button>

      <div className="z-10 w-full max-w-lg bg-card/85 backdrop-blur-xl border border-black/10 dark:border-white/10 p-6 sm:p-8 rounded-3xl flex flex-col items-center relative my-8 shadow-2xl">
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
          <div className="w-full p-3 mb-6 bg-destructive/10 border border-destructive/50 text-destructive text-sm rounded-xl text-center font-medium flex items-center justify-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="w-full space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 sm:col-span-1">
              <label className="text-xs font-semibold text-foreground mb-1 block">Nombre y Apellido *</label>
              <input 
                type="text" 
                value={nombre} 
                onChange={e => setNombre(e.target.value)} 
                className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 text-foreground rounded-xl p-3 text-sm focus:outline-none focus:border-primary transition-colors" 
                placeholder="Ej. Pedro Pérez" 
                required 
              />
            </div>
            
            {/* Cédula de 8 dígitos estrictos */}
            <div className="col-span-2 sm:col-span-1">
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-foreground block">Cédula (8 dígitos) *</label>
                <span className={`text-[11px] font-mono transition-colors ${
                  isCedulaComplete ? "text-emerald-500 font-bold" : "text-muted-foreground"
                }`}>
                  {cleanCedula.length}/8 dígitos
                </span>
              </div>
              <div className="relative">
                <input 
                  type="text" 
                  inputMode="numeric"
                  maxLength={8}
                  value={cleanCedula} 
                  onChange={e => setCedula(e.target.value.replace(/\D/g, "").slice(0, 8))} 
                  className={`w-full bg-black/5 dark:bg-black/40 border text-foreground rounded-xl p-3 pr-9 text-sm font-mono focus:outline-none transition-colors ${
                    isCedulaComplete 
                      ? "border-emerald-500/60 focus:border-emerald-500" 
                      : cleanCedula.length > 0 
                      ? "border-amber-500/60 focus:border-amber-500"
                      : "border-black/10 dark:border-white/10 focus:border-primary"
                  }`} 
                  placeholder="12345678" 
                  required 
                />
                {isCedulaComplete && (
                  <Check className="absolute right-3 top-3.5 h-4 w-4 text-emerald-500" />
                )}
              </div>
              {cleanCedula.length > 0 && !isCedulaComplete && (
                <p className="text-[11px] text-amber-500 mt-1">
                  Ingresa al menos 7 dígitos numéricos ({cleanCedula.length}/8).
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 sm:col-span-1">
              <label className="text-xs font-semibold text-foreground mb-1 block">Teléfono / WhatsApp *</label>
              <input 
                type="text" 
                value={telefono} 
                onChange={e => setTelefono(e.target.value)} 
                className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 text-foreground rounded-xl p-3 text-sm focus:outline-none focus:border-primary transition-colors" 
                placeholder="Ej. 0414-1234567" 
                required 
              />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label className="text-xs font-semibold text-foreground mb-1 block">Correo Electrónico *</label>
              <input 
                type="email" 
                value={correo} 
                onChange={e => setCorreo(e.target.value)} 
                className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 text-foreground rounded-xl p-3 text-sm focus:outline-none focus:border-primary transition-colors" 
                placeholder="tu@correo.com" 
                required 
              />
            </div>
          </div>
          
          <div>
            <label className="text-xs font-semibold text-foreground mb-1 block">Dirección de Habitación</label>
            <input 
              type="text" 
              value={direccion} 
              onChange={e => setDireccion(e.target.value)} 
              className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 text-foreground rounded-xl p-3 text-sm focus:outline-none focus:border-primary transition-colors" 
              placeholder="Sector / Calle / Residencia" 
            />
          </div>

          {/* Sección de Contraseña Segura */}
          <div className="space-y-3 pt-1">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 sm:col-span-1">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-foreground block">Contraseña *</label>
                  {clave && (
                    <span className={`text-[11px] font-bold ${
                      pwdValidation.strengthLabel === 'Fuerte' 
                        ? 'text-emerald-500' 
                        : pwdValidation.strengthLabel === 'Media'
                        ? 'text-yellow-500 dark:text-yellow-400'
                        : 'text-rose-500'
                    }`}>
                      {pwdValidation.strengthLabel}
                    </span>
                  )}
                </div>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    value={clave} 
                    onChange={e => setClave(e.target.value)} 
                    className={`w-full bg-black/5 dark:bg-black/40 border text-foreground rounded-xl p-3 pr-10 text-sm focus:outline-none transition-colors ${
                      clave ? (pwdValidation.isValid ? 'border-emerald-500/60 focus:border-emerald-500' : 'border-rose-500/60 focus:border-rose-500') : 'border-black/10 dark:border-white/10 focus:border-primary'
                    }`} 
                    placeholder="••••••••" 
                    required 
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3.5 text-muted-foreground hover:text-foreground transition"
                    tabIndex={-1}
                    aria-label={showPassword ? "Ocultar contraseña" : "Ver contraseña"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="col-span-2 sm:col-span-1">
                <label className="text-xs font-semibold text-foreground mb-1 block">Confirmar Contraseña *</label>
                <div className="relative">
                  <input 
                    type={showConfirmPassword ? "text" : "password"} 
                    value={confirmClave} 
                    onChange={e => setConfirmClave(e.target.value)} 
                    className={`w-full bg-black/5 dark:bg-black/40 border rounded-xl p-3 pr-10 text-sm focus:outline-none transition-all ${
                      confirmClave 
                        ? (claveMatch ? 'border-emerald-500/60 focus:border-emerald-500' : 'border-rose-500/60 focus:border-rose-500') 
                        : 'border-black/10 dark:border-white/10 focus:border-primary'
                    }`} 
                    placeholder="••••••••" 
                    required 
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-3.5 text-muted-foreground hover:text-foreground transition"
                    tabIndex={-1}
                    aria-label={showConfirmPassword ? "Ocultar contraseña" : "Ver contraseña"}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {confirmClave && !claveMatch && (
                  <p className="text-[11px] text-rose-500 mt-1 font-medium">Las contraseñas no coinciden.</p>
                )}
                {confirmClave && claveMatch && (
                  <p className="text-[11px] text-emerald-500 mt-1 font-medium flex items-center gap-1">
                    <Check className="h-3 w-3" /> Coinciden correctamente
                  </p>
                )}
              </div>
            </div>

            {/* Medidor de Fortaleza y Requisitos */}
            {clave && (
              <div className="space-y-2 p-3 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 text-xs">
                <div className="w-full bg-black/10 dark:bg-white/10 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-300 ${
                      pwdValidation.score <= 1
                        ? "w-1/4 bg-rose-500"
                        : pwdValidation.score <= 2
                        ? "w-2/4 bg-amber-500"
                        : pwdValidation.score === 3
                        ? "w-3/4 bg-yellow-400"
                        : "w-full bg-emerald-500"
                    }`}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1 text-[11px]">
                  <span className={`flex items-center gap-1.5 ${pwdValidation.hasMinLength ? "text-emerald-500 font-semibold" : "text-muted-foreground"}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${pwdValidation.hasMinLength ? "bg-emerald-500" : "bg-muted-foreground"}`} />
                    Mínimo 8 caracteres
                  </span>
                  <span className={`flex items-center gap-1.5 ${(pwdValidation.hasUpperCase && pwdValidation.hasLowerCase) ? "text-emerald-500 font-semibold" : "text-muted-foreground"}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${(pwdValidation.hasUpperCase && pwdValidation.hasLowerCase) ? "bg-emerald-500" : "bg-muted-foreground"}`} />
                    Mayúscula y minúscula
                  </span>
                  <span className={`flex items-center gap-1.5 ${pwdValidation.hasNumber ? "text-emerald-500 font-semibold" : "text-muted-foreground"}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${pwdValidation.hasNumber ? "bg-emerald-500" : "bg-muted-foreground"}`} />
                    Al menos un número
                  </span>
                  <span className={`flex items-center gap-1.5 ${(pwdValidation.isNotCommon && pwdValidation.doesNotMatchCedula) ? "text-emerald-500 font-semibold" : "text-rose-500 font-semibold"}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${(pwdValidation.isNotCommon && pwdValidation.doesNotMatchCedula) ? "bg-emerald-500" : "bg-rose-500"}`} />
                    {(!pwdValidation.isNotCommon || !pwdValidation.doesNotMatchCedula) ? "No usar 123456 ni tu cédula" : "Clave segura"}
                  </span>
                </div>

                {pwdValidation.error && (
                  <p className="text-[11px] text-rose-500 font-medium pt-0.5 flex items-center gap-1">
                    <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                    <span>{pwdValidation.error}</span>
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 mt-2">
            <div className="col-span-2 sm:col-span-1">
              <label className="text-xs font-semibold text-foreground mb-1 block">Género</label>
              <div className="relative">
                <select 
                  value={genero} 
                  onChange={e => setGenero(e.target.value as 'M'|'F')} 
                  className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 text-foreground rounded-xl p-3 text-sm focus:outline-none focus:border-primary appearance-none pr-8 cursor-pointer"
                >
                  <option value="M">Masculino</option>
                  <option value="F">Femenino</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-foreground">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label className="text-xs font-semibold text-foreground mb-1 block">Entrenador (Opcional)</label>
              <div className="relative">
                <select 
                  value={entrenador} 
                  onChange={e => setEntrenador(e.target.value)} 
                  className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 text-foreground rounded-xl p-3 text-sm focus:outline-none focus:border-primary appearance-none pr-8 cursor-pointer"
                >
                  <option value="">-- Sin entrenador --</option>
                  {coaches.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-foreground">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isLoading} 
            className="w-full mt-2 bg-primary text-primary-foreground hover:bg-primary/90 active:scale-[0.99] font-extrabold py-3.5 rounded-xl transition flex items-center justify-center disabled:opacity-50 shadow-lg shadow-primary/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
          >
            {isLoading ? <Loader size={20} color="currentColor" /> : "Completar Registro"}
          </button>
        </form>
      </div>
    </div>
  )
}
