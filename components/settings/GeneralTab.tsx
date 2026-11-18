"use client"

import React from "react"
import { Type, Settings, Palette } from "lucide-react"

export interface GeneralTabProps {
  appName: string
  setAppName: (name: string) => void
  logoSettings: any
  setLogoSettings: React.Dispatch<React.SetStateAction<any>>
  theme?: string
  logoUrl: string
  setLogoUrl: (url: string) => void
  logoUrlDark: string
  setLogoUrlDark: (url: string) => void
  faviconUrl: string
  setFaviconUrl: (url: string) => void
  handleFaviconUpload: (e: any) => void
  handleLogoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
  handleLogoDarkUpload: (e: any) => void
  primaryColor: string
  setPrimaryColor: (color: string) => void
  secondaryColor: string
  setSecondaryColor: (color: string) => void
  borderColor: string
  setBorderColor: (color: string) => void
  fontFamily: "arvo" | "inter" | "roboto"
  setFontFamily: (font: "arvo" | "inter" | "roboto") => void
  isGlass: boolean
  setIsGlass: (glass: boolean) => void
}

export function GeneralTab({
  appName,
  setAppName,
  logoSettings,
  setLogoSettings,
  theme,
  logoUrl,
  setLogoUrl,
  logoUrlDark,
  setLogoUrlDark,
  faviconUrl,
  setFaviconUrl,
  handleFaviconUpload,
  handleLogoUpload,
  handleLogoDarkUpload,
  primaryColor,
  setPrimaryColor,
  secondaryColor,
  setSecondaryColor,
  borderColor,
  setBorderColor,
  fontFamily,
  setFontFamily,
  isGlass,
  setIsGlass,
}: GeneralTabProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Nombre de la App */}
      <div className="space-y-2">
        <label className="text-sm font-medium flex items-center gap-2">
          <Type className="h-4 w-4 text-muted-foreground" /> Nombre de la Aplicación
        </label>
        <input 
          type="text" 
          value={appName}
          placeholder="Ej. Mi Gimnasio"
          onChange={(e) => setAppName(e.target.value)}
          className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-lg p-3 text-sm text-foreground focus:outline-none focus:border-primary" 
        />
      </div>

      {/* Opción para Ocultar o Mostrar Texto en el Brand / Home */}
      <div className="space-y-2 bg-black/5 dark:bg-white/5 p-4 rounded-xl border border-black/10 dark:border-white/10 flex items-center justify-between">
        <div className="pr-4">
          <span className="text-sm font-bold text-foreground block">Mostrar texto junto al icono / logo (Home)</span>
          <span className="text-xs text-muted-foreground block">
            Si desactivas esta opción, solo se mostrará el icono o logo limpio como botón para ir al inicio.
          </span>
        </div>
        <label className="relative inline-flex items-center cursor-pointer shrink-0">
          <input 
            type="checkbox" 
            checked={logoSettings?.showNameInNavbar ?? true} 
            onChange={(e) => setLogoSettings((s: any) => ({...s, showNameInNavbar: e.target.checked}))} 
            className="sr-only peer" 
          />
          <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
        </label>
      </div>

      {/* Personalización y Tamaño del Icono / Logo */}
      <div className="space-y-4 md:col-span-2 p-5 rounded-2xl bg-black/5 dark:bg-white/5 border border-primary/20 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-black/10 dark:border-white/10">
          <div>
            <h3 className="text-base font-extrabold text-foreground flex items-center gap-2">
              <Settings className="w-4 h-4 text-primary" /> Personalización del Icono / Logo (Barra y Menú)
            </h3>
            <p className="text-xs text-muted-foreground">
              Ajusta las dimensiones, escala y proporciones exactas para que tu icono se visualice con el tamaño ideal.
            </p>
          </div>

          {/* Previsualización en Vivo */}
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-card border border-border shadow-sm min-h-[52px]">
            <span className="text-[10px] uppercase font-bold text-muted-foreground mr-1">Vista previa:</span>
            <div 
              className="flex items-center justify-center transition-all bg-black/5 dark:bg-white/5 rounded-lg border border-black/5 dark:border-white/5"
              style={{
                margin: logoSettings?.marginNavbar ? `${logoSettings.marginNavbar}px` : undefined,
              }}
            >
              {(logoUrl || logoUrlDark) ? (
                <img 
                  src={(theme === 'dark' && logoUrlDark) ? logoUrlDark : (logoUrl || logoUrlDark)} 
                  alt="Preview"
                  style={{
                    width: logoSettings?.widthNavbar || 40,
                    height: logoSettings?.heightNavbar || 40,
                    objectFit: logoSettings?.objectFit || 'contain',
                    padding: logoSettings?.paddingNavbar ? `${logoSettings.paddingNavbar}px` : undefined,
                  }}
                  className="rounded"
                />
              ) : (
                <div 
                  style={{ 
                    width: logoSettings?.widthNavbar || 40, 
                    height: logoSettings?.heightNavbar || 40,
                    padding: logoSettings?.paddingNavbar ? `${logoSettings.paddingNavbar}px` : undefined,
                  }}
                  className="bg-primary/20 rounded-lg flex items-center justify-center font-bold text-primary text-xs"
                >
                  GP
                </div>
              )}
            </div>
            {logoSettings?.showNameInNavbar && (
              <span className="text-sm font-bold text-primary truncate max-w-[120px]">
                {appName || 'Gimnasio'}
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-2">
          {/* Ancho */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-foreground">Ancho</label>
              <span className="text-xs font-mono font-bold text-primary px-2 py-0.5 rounded bg-primary/10">
                {logoSettings?.widthNavbar || 40}px
              </span>
            </div>
            <input 
              type="range" 
              min="24" 
              max="160" 
              value={logoSettings?.widthNavbar || 40} 
              onChange={e => setLogoSettings((s: any) => ({ ...s, widthNavbar: Number(e.target.value) }))} 
              className="w-full accent-primary" 
            />
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>24px</span>
              <span>80px</span>
              <span>160px</span>
            </div>
          </div>

          {/* Alto */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-foreground">Alto</label>
              <span className="text-xs font-mono font-bold text-primary px-2 py-0.5 rounded bg-primary/10">
                {logoSettings?.heightNavbar || 40}px
              </span>
            </div>
            <input 
              type="range" 
              min="24" 
              max="80" 
              value={logoSettings?.heightNavbar || 40} 
              onChange={e => setLogoSettings((s: any) => ({ ...s, heightNavbar: Number(e.target.value) }))} 
              className="w-full accent-primary" 
            />
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>24px</span>
              <span>50px</span>
              <span>80px</span>
            </div>
          </div>

          {/* Relleno / Padding */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-foreground">Relleno Interno (Padding)</label>
              <span className="text-xs font-mono font-bold text-primary px-2 py-0.5 rounded bg-primary/10">
                {logoSettings?.paddingNavbar || 0}px
              </span>
            </div>
            <input 
              type="range" 
              min="0" 
              max="24" 
              value={logoSettings?.paddingNavbar || 0} 
              onChange={e => setLogoSettings((s: any) => ({ ...s, paddingNavbar: Number(e.target.value) }))} 
              className="w-full accent-primary" 
            />
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>0px (Pegado)</span>
              <span>8px (Equilibrado)</span>
              <span>24px (Espacioso)</span>
            </div>
          </div>

          {/* Margen Exterior */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-foreground">Margen Exterior (Separación)</label>
              <span className="text-xs font-mono font-bold text-primary px-2 py-0.5 rounded bg-primary/10">
                {logoSettings?.marginNavbar || 0}px
              </span>
            </div>
            <input 
              type="range" 
              min="0" 
              max="24" 
              value={logoSettings?.marginNavbar || 0} 
              onChange={e => setLogoSettings((s: any) => ({ ...s, marginNavbar: Number(e.target.value) }))} 
              className="w-full accent-primary" 
            />
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>0px</span>
              <span>8px</span>
              <span>24px</span>
            </div>
          </div>
        </div>

        {/* Ajuste de Proporción / Object Fit y Alineación en la Barra Lateral */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-black/5 dark:border-white/5">
          <div className="space-y-2">
            <label className="text-xs font-bold text-foreground block">Ajuste de Proporción (Object Fit)</label>
            <select
              value={logoSettings?.objectFit || 'contain'}
              onChange={e => setLogoSettings((s: any) => ({ ...s, objectFit: e.target.value as any }))}
              className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-lg p-2.5 text-xs text-foreground focus:border-primary"
            >
              <option value="contain">Contener (Sin distorsión, proporción natural del logo)</option>
              <option value="cover">Cubrir (Llenar caja completa)</option>
              <option value="fill">Rellenar (Estirar proporcionalmente)</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-foreground block">Alineación en la Barra Lateral</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'left', label: 'Izquierda' },
                { id: 'center', label: 'Centrado' },
                { id: 'right', label: 'Derecha' },
              ].map(opt => {
                const active = (logoSettings?.alignNavbar || 'center') === opt.id
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setLogoSettings((s: any) => ({ ...s, alignNavbar: opt.id as any }))}
                    className={`py-2 px-3 rounded-lg text-xs font-bold border transition ${
                      active
                        ? 'bg-primary/20 border-primary text-primary shadow-sm'
                        : 'bg-black/5 dark:bg-black/40 border-black/10 dark:border-white/10 text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {opt.label}
                  </button>
                )
              })}
            </div>
          </div>

          <span className="text-[10px] text-muted-foreground block md:col-span-2">
            Puedes elegir la alineación del logo en la barra lateral (Centrado por defecto) y ajustar su padding y margen.
          </span>
        </div>
      </div>

      <div className="space-y-4 md:col-span-2">
        <h3 className="text-lg font-bold flex items-center gap-2 text-primary">Marca y Logos</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Favicon */}
          <div className="space-y-2 bg-black/5 dark:bg-white/5 p-4 rounded-xl border border-black/10 dark:border-white/10 text-center relative group">
            <label className="text-sm font-medium text-muted-foreground block mb-2">Favicon (Pestaña)</label>
            <div className="w-16 h-16 mx-auto bg-white dark:bg-black/40 rounded-xl flex items-center justify-center overflow-hidden border border-black/10 dark:border-white/10">
              {faviconUrl ? <img src={faviconUrl} alt="Favicon" className="w-full h-full object-contain" /> : <span className="text-xs">Subir</span>}
            </div>
            <span className="text-[10px] text-muted-foreground block mt-1">SVG, PNG, JPG o ICO</span>
            <input type="file" accept=".svg,.png,.jpg,.jpeg,.webp,.ico,image/svg+xml,image/png,image/jpeg,image/webp,image/x-icon" onChange={handleFaviconUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
            {faviconUrl && <button type="button" onClick={() => setFaviconUrl("")} className="mt-2 text-xs text-destructive hover:underline relative z-10">Quitar</button>}
          </div>

          {/* Logo Claro */}
          <div className="space-y-2 bg-black/5 dark:bg-white/5 p-4 rounded-xl border border-black/10 dark:border-white/10 text-center relative group">
            <label className="text-sm font-medium text-muted-foreground block mb-2">Logo (Modo Claro)</label>
            <div className="w-32 h-16 mx-auto bg-white rounded-xl flex items-center justify-center overflow-hidden border border-black/10 dark:border-white/10">
              {logoUrl ? <img src={logoUrl} alt="Logo" className="w-full h-full object-contain p-1" /> : <span className="text-xs text-black">Subir</span>}
            </div>
            <span className="text-[10px] text-muted-foreground block mt-1">SVG, PNG o JPG (Hasta 5MB)</span>
            <input type="file" accept=".svg,.png,.jpg,.jpeg,.webp,image/svg+xml,image/png,image/jpeg,image/webp" onChange={handleLogoUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
            {logoUrl && <button type="button" onClick={() => setLogoUrl("")} className="mt-2 text-xs text-destructive hover:underline relative z-10">Quitar</button>}
          </div>

          {/* Logo Oscuro */}
          <div className="space-y-2 bg-black/5 dark:bg-white/5 p-4 rounded-xl border border-black/10 dark:border-white/10 text-center relative group">
            <label className="text-sm font-medium text-muted-foreground block mb-2">Logo (Modo Oscuro)</label>
            <div className="w-32 h-16 mx-auto bg-black rounded-xl flex items-center justify-center overflow-hidden border border-black/10 dark:border-white/10">
              {logoUrlDark ? <img src={logoUrlDark} alt="Logo Dark" className="w-full h-full object-contain p-1" /> : <span className="text-xs text-white">Subir (Opcional)</span>}
            </div>
            <span className="text-[10px] text-muted-foreground block mt-1">SVG, PNG o JPG (Hasta 5MB)</span>
            <input type="file" accept=".svg,.png,.jpg,.jpeg,.webp,image/svg+xml,image/png,image/jpeg,image/webp" onChange={handleLogoDarkUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
            {logoUrlDark && <button type="button" onClick={() => setLogoUrlDark("")} className="mt-2 text-xs text-destructive hover:underline relative z-10">Quitar</button>}
          </div>
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
            className="flex-1 bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-lg p-3 text-sm text-foreground focus:outline-none focus:border-primary uppercase" 
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
            className="flex-1 bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-lg p-3 text-sm text-foreground focus:outline-none focus:border-primary uppercase" 
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
            className="flex-1 bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-lg p-3 text-sm text-foreground focus:outline-none focus:border-primary uppercase" 
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
          className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-lg p-3 text-sm text-foreground focus:outline-none focus:border-primary"
        >
          <option value="arvo">Arvo (Deportiva / Slab Serif)</option>
          <option value="inter">Inter (Moderna / Sans Serif)</option>
          <option value="roboto">Roboto (Clásica / Sans Serif)</option>
        </select>
      </div>

      {/* Efecto Desvanecido */}
      <div className="space-y-2 md:col-span-2">
        <label className="flex items-center gap-3 cursor-pointer p-4 bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-lg hover:border-primary/50 transition">
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
  )
}
