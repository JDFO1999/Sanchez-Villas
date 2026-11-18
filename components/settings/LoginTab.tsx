"use client"

import React from "react"
import { User } from "lucide-react"

interface LoginTabProps {
  theme?: string
  appName: string
  setAppName: (name: string) => void
  logoUrl?: string
  logoUrlDark?: string
  logoSettings: any
  setLogoSettings: React.Dispatch<React.SetStateAction<any>>
}

export function LoginTab({
  theme,
  appName,
  setAppName,
  logoUrl,
  logoUrlDark,
  logoSettings,
  setLogoSettings,
}: LoginTabProps) {
  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-primary/10 border border-primary/20">
        <div>
          <h3 className="text-lg font-black text-foreground flex items-center gap-2">
            <User className="w-5 h-5 text-primary" /> Personalización de Pantalla de Login
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            Modifica el logo, las letras de la empresa, dimensiones y previsualización de la pantalla de inicio de sesión.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Previsualización en Tiempo Real del Login */}
        <div className="space-y-4 bg-black/5 dark:bg-white/5 p-6 rounded-2xl border border-black/10 dark:border-white/10 flex flex-col justify-center">
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
            Vista Previa en Vivo (Pantalla de Login)
          </label>
          <div className="w-full bg-zinc-100 dark:bg-zinc-950 border border-black/10 dark:border-white/10 rounded-2xl p-6 flex flex-col items-center justify-center min-h-[320px]">
            <div className="w-full max-w-xs bg-white dark:bg-zinc-900 border border-black/10 dark:border-white/10 p-6 rounded-2xl shadow-xl flex flex-col items-center">
              {logoSettings?.showInLogin && (logoUrl || logoUrlDark) && (
                <img
                  src={theme === "dark" && logoUrlDark ? logoUrlDark : logoUrl || logoUrlDark}
                  alt="Logo Login"
                  style={{
                    width: `${logoSettings.widthLogin || 96}px`,
                    height: `${logoSettings.heightLogin || 96}px`,
                    objectFit: logoSettings.objectFit || "contain",
                    maskImage: logoSettings.fadeEffect ? "linear-gradient(to bottom, black 50%, transparent 100%)" : "none",
                    WebkitMaskImage: logoSettings.fadeEffect ? "linear-gradient(to bottom, black 50%, transparent 100%)" : "none",
                  }}
                  className="mb-2 transition-all"
                />
              )}
              {logoSettings?.showNameInLogin && (
                <h2 className="font-extrabold text-xl text-foreground text-center uppercase tracking-tight mt-1">
                  {appName || "Nombre de Empresa"}
                </h2>
              )}
              <p className="text-[10px] text-muted-foreground text-center mt-0.5">
                Ingresa tus credenciales para continuar
              </p>
              <div className="w-full mt-4 space-y-2 opacity-60 pointer-events-none">
                <div className="h-8 w-full bg-black/5 dark:bg-white/10 rounded-lg border border-black/10 dark:border-white/10 flex items-center px-3 text-[10px] text-muted-foreground">
                  Cédula de identidad
                </div>
                <div className="h-8 w-full bg-black/5 dark:bg-white/10 rounded-lg border border-black/10 dark:border-white/10 flex items-center px-3 text-[10px] text-muted-foreground">
                  ••••••••
                </div>
                <div className="h-8 w-full bg-primary text-primary-foreground rounded-lg flex items-center justify-center text-xs font-bold">
                  Iniciar Sesión
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Controles de Configuración de Login */}
        <div className="space-y-6 bg-black/5 dark:bg-white/5 p-6 rounded-2xl border border-black/10 dark:border-white/10 flex flex-col justify-between">
          <div className="space-y-5">
            {/* Nombre y Letras de la Empresa para el Login */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-foreground block">
                Nombre de la Empresa / Letras para Login
              </label>
              <input
                type="text"
                value={appName}
                onChange={(e) => setAppName(e.target.value)}
                placeholder="Ej. Mi Gimnasio Club"
                className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-lg p-3 text-sm focus:border-primary font-medium"
              />
              <p className="text-[11px] text-muted-foreground">
                Este texto se muestra debajo del logo en la pantalla de inicio de sesión.
              </p>
            </div>

            {/* Opciones de Visibilidad */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <label className="flex items-center gap-2 p-3 bg-black/5 dark:bg-black/30 border border-black/10 dark:border-white/10 rounded-xl cursor-pointer hover:border-primary/40 transition">
                <input
                  type="checkbox"
                  checked={logoSettings?.showInLogin ?? true}
                  onChange={(e) => setLogoSettings((s: any) => ({ ...s, showInLogin: e.target.checked }))}
                  className="accent-primary w-4 h-4"
                />
                <span className="text-xs font-bold">Mostrar Logo</span>
              </label>
              <label className="flex items-center gap-2 p-3 bg-black/5 dark:bg-black/30 border border-black/10 dark:border-white/10 rounded-xl cursor-pointer hover:border-primary/40 transition">
                <input
                  type="checkbox"
                  checked={logoSettings?.showNameInLogin ?? true}
                  onChange={(e) => setLogoSettings((s: any) => ({ ...s, showNameInLogin: e.target.checked }))}
                  className="accent-primary w-4 h-4"
                />
                <span className="text-xs font-bold">Mostrar Letras</span>
              </label>
              <label className="flex items-center gap-2 p-3 bg-black/5 dark:bg-black/30 border border-black/10 dark:border-white/10 rounded-xl cursor-pointer hover:border-primary/40 transition col-span-2">
                <input
                  type="checkbox"
                  checked={logoSettings?.fadeEffect ?? false}
                  onChange={(e) => setLogoSettings((s: any) => ({ ...s, fadeEffect: e.target.checked }))}
                  className="accent-primary w-4 h-4"
                />
                <span className="text-xs font-bold">Efecto Desvanecido en Logo (Fade Effect)</span>
              </label>
            </div>

            {/* Dimensiones y Ajuste */}
            <div className="space-y-4 pt-2 border-t border-black/10 dark:border-white/10">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-bold text-muted-foreground">
                    Ancho del Logo en Login ({logoSettings?.widthLogin ?? 96}px)
                  </label>
                  <input
                    type="number"
                    value={logoSettings?.widthLogin ?? 96}
                    onChange={(e) => setLogoSettings((s: any) => ({ ...s, widthLogin: Number(e.target.value) }))}
                    className="w-16 bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded p-1 text-xs text-center focus:border-primary font-bold"
                  />
                </div>
                <input
                  type="range"
                  min="40"
                  max="400"
                  value={logoSettings?.widthLogin ?? 96}
                  onChange={(e) => setLogoSettings((s: any) => ({ ...s, widthLogin: Number(e.target.value) }))}
                  className="w-full accent-primary"
                />
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-bold text-muted-foreground">
                    Alto del Logo en Login ({logoSettings?.heightLogin ?? 96}px)
                  </label>
                  <input
                    type="number"
                    value={logoSettings?.heightLogin ?? 96}
                    onChange={(e) => setLogoSettings((s: any) => ({ ...s, heightLogin: Number(e.target.value) }))}
                    className="w-16 bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded p-1 text-xs text-center focus:border-primary font-bold"
                  />
                </div>
                <input
                  type="range"
                  min="40"
                  max="400"
                  value={logoSettings?.heightLogin ?? 96}
                  onChange={(e) => setLogoSettings((s: any) => ({ ...s, heightLogin: Number(e.target.value) }))}
                  className="w-full accent-primary"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
