"use client"

import React from "react"
import { BaseFooter } from "@/components/layout/footer"
import { Plus, Trash2, HeartHandshake } from "lucide-react"

interface FooterTabProps {
  theme?: string
  appName: string
  logoUrl?: string
  logoUrlDark?: string
  storeAddress?: string
  landingSettings: any
  setLandingSettings?: React.Dispatch<React.SetStateAction<any>>
  footerMission: string
  setFooterMission: (v: string) => void
  footerVision: string
  setFooterVision: (v: string) => void
  footerLogoSettings: any
  setFooterLogoSettings: React.Dispatch<React.SetStateAction<any>>
  footerSocialLinks: any[]
  setFooterSocialLinks: React.Dispatch<React.SetStateAction<any[]>>
  footerPartners: any[]
  setFooterPartners: React.Dispatch<React.SetStateAction<any[]>>
  partnerInput: string
  setPartnerInput: (v: string) => void
}

export function FooterTab({
  theme,
  appName,
  logoUrl,
  logoUrlDark,
  storeAddress,
  landingSettings,
  setLandingSettings,
  footerMission,
  setFooterMission,
  footerVision,
  setFooterVision,
  footerLogoSettings,
  setFooterLogoSettings,
  footerSocialLinks,
  setFooterSocialLinks,
  footerPartners,
  setFooterPartners,
  partnerInput,
  setPartnerInput,
}: FooterTabProps) {
  return (
    <div className="pt-6 border-t border-black/10 dark:border-white/10 mt-6 space-y-8">
<h3 className="text-lg font-bold flex items-center gap-2 text-primary">Footer y Marca</h3>

                    <div className="space-y-4">
                      <h4 className="text-sm font-bold text-primary border-b border-black/10 dark:border-white/10 pb-2">Ajustes de Marca (Footer)</h4>
                      <div className="flex flex-col lg:flex-row gap-6 items-start">
                        <div className="flex-1 space-y-4 w-full">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={footerLogoSettings.showLogo ?? true} onChange={e => setFooterLogoSettings((s: any) => ({...s, showLogo: e.target.checked}))} className="rounded border-black/20 accent-primary" />
                            <span className="text-sm font-semibold">Mostrar Logo en el Footer</span>
                          </label>

                          <div className="space-y-2">
                            <label className="text-xs text-muted-foreground block font-medium">Posición del Logo respecto a Nuestra Misión</label>
                            <select 
                              value={footerLogoSettings.position || 'side'} 
                              onChange={e => setFooterLogoSettings((s: any) => ({...s, position: e.target.value as any}))} 
                              className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-lg p-2.5 text-sm focus:border-primary"
                            >
                              <option value="side">Al lado de Nuestra Misión (Horizontal)</option>
                              <option value="top">Arriba de Nuestra Misión (Vertical)</option>
                              <option value="top-center">Arriba y Centrado sobre Nuestra Misión</option>
                            </select>
                          </div>

                          {/* Logo Exclusivo del Footer */}
                          <div className="space-y-2 pt-2 border-t border-black/5 dark:border-white/5">
                            <label className="text-xs text-muted-foreground block font-medium">Logo del Footer (Opcional - diferente al principal)</label>
                            <div className="flex items-center gap-3">
                              <div className="w-14 h-14 bg-black/5 dark:bg-black/40 rounded-lg border border-black/10 dark:border-white/10 flex items-center justify-center overflow-hidden shrink-0">
                                {(footerLogoSettings.customLogoUrl || logoUrl || logoUrlDark) ? (
                                  <img 
                                    src={footerLogoSettings.customLogoUrl || (theme === 'dark' && logoUrlDark ? logoUrlDark : (logoUrl || logoUrlDark))} 
                                    alt="Footer Logo" 
                                    className="w-full h-full object-contain p-1"
                                  />
                                ) : (
                                  <span className="text-[10px] text-muted-foreground">Sin logo</span>
                                )}
                              </div>
                              <div className="flex-1 flex flex-wrap gap-2">
                                <label className="cursor-pointer px-3 py-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 text-xs font-semibold transition">
                                  Subir Logo Footer
                                  <input 
                                    type="file" 
                                    accept="image/*" 
                                    className="hidden" 
                                    onChange={async (e) => {
                                      const file = e.target.files?.[0];
                                      if (file) {
                                        const { compressImage } = await import('@/lib/image-compress');
                                        const base64 = await compressImage(file, 600, 600, 0.9);
                                        setFooterLogoSettings((s: any) => ({ ...s, customLogoUrl: base64 }));
                                      }
                                    }}
                                  />
                                </label>
                                {footerLogoSettings.customLogoUrl && (
                                  <button 
                                    type="button" 
                                    onClick={() => setFooterLogoSettings((s: any) => ({ ...s, customLogoUrl: undefined }))}
                                    className="px-3 py-1.5 rounded-lg bg-destructive/10 hover:bg-destructive/20 text-destructive text-xs font-semibold transition"
                                  >
                                    Usar Logo Principal
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <label className="text-xs text-muted-foreground block font-medium">Tamaño del Logo (Ancho / Alto)</label>
                              <span className="text-xs font-mono font-bold text-primary">{footerLogoSettings.width || 60}px</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <input 
                                type="range" 
                                min="20" 
                                max="300" 
                                value={footerLogoSettings.width || 60} 
                                onChange={e => setFooterLogoSettings((s: any) => ({...s, width: Number(e.target.value), height: Number(e.target.value)}))} 
                                className="w-full accent-primary" 
                              />
                              <input 
                                type="number" 
                                min="20" 
                                max="300" 
                                value={footerLogoSettings.width || 60} 
                                onChange={e => setFooterLogoSettings((s: any) => ({...s, width: Number(e.target.value) || 60, height: Number(e.target.value) || 60}))} 
                                className="w-16 bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-lg p-1 text-xs text-center font-mono font-bold" 
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                            <label className="flex items-center gap-2 cursor-pointer p-2.5 bg-black/5 dark:bg-black/30 border border-black/10 dark:border-white/10 rounded-lg hover:border-primary/50 transition">
                              <input 
                                type="checkbox" 
                                checked={footerLogoSettings.glowEffect ?? true} 
                                onChange={e => setFooterLogoSettings((s: any) => ({...s, glowEffect: e.target.checked}))} 
                                className="h-4 w-4 accent-primary cursor-pointer rounded" 
                              />
                              <div>
                                <span className="text-xs font-semibold block">✨ Brillo Palpitante (Glow)</span>
                                <span className="text-[10px] text-muted-foreground">Halo de luz pulsante con color primario</span>
                              </div>
                            </label>

                            <label className="flex items-center gap-2 cursor-pointer p-2.5 bg-black/5 dark:bg-black/30 border border-black/10 dark:border-white/10 rounded-lg hover:border-primary/50 transition">
                              <input 
                                type="checkbox" 
                                checked={footerLogoSettings.glassEffect ?? false} 
                                onChange={e => setFooterLogoSettings((s: any) => ({...s, glassEffect: e.target.checked}))} 
                                className="h-4 w-4 accent-primary cursor-pointer rounded" 
                              />
                              <div>
                                <span className="text-xs font-semibold block">💎 Efecto Cristal (Glass)</span>
                                <span className="text-[10px] text-muted-foreground">Fondo translúcido para el logo</span>
                              </div>
                            </label>
                          </div>

                          <div className="space-y-2 pt-2 border-t border-black/5 dark:border-white/5">
                            <span className="text-xs font-bold text-primary mb-2 block">Tema del Footer</span>
                            <div className="grid grid-cols-1 xl:grid-cols-3 gap-2">
                              <button type="button" onClick={() => setFooterLogoSettings((s: any) => ({...s, layoutTheme: 'modern'}))} className={`p-3 border rounded-lg text-xs font-bold ${(footerLogoSettings.layoutTheme || 'modern') === 'modern' ? 'bg-primary text-primary-foreground border-primary' : 'bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10'}`}>Moderno (Actual)</button>
                              <button type="button" onClick={() => setFooterLogoSettings((s: any) => ({...s, layoutTheme: 'classic'}))} className={`p-3 border rounded-lg text-xs font-bold ${footerLogoSettings.layoutTheme === 'classic' ? 'bg-primary text-primary-foreground border-primary' : 'bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10'}`}>Clásico</button>
                              <button type="button" onClick={() => setFooterLogoSettings((s: any) => ({...s, layoutTheme: 'minimalist'}))} className={`p-3 border rounded-lg text-xs font-bold ${footerLogoSettings.layoutTheme === 'minimalist' ? 'bg-primary text-primary-foreground border-primary' : 'bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10'}`}>Minimalista</button>
                            </div>
                          </div>

                          <div className="space-y-4 pt-4 border-t border-black/5 dark:border-white/5 w-full mt-4">
                            <label className="text-xs text-muted-foreground block font-bold text-primary">Estructura Global del Footer (Padding, Margen y Alineación)</label>
                            
                            <div className="space-y-2">
                              <label className="text-xs text-muted-foreground block font-semibold">Alineación de Párrafos de Texto (Misión, Visión y Dirección)</label>
                              <div className="grid grid-cols-2 gap-2">
                                <button
                                  type="button"
                                  onClick={() => setFooterLogoSettings((s: any) => ({ ...s, footerTextAlign: 'justify' }))}
                                  className={`p-2.5 border rounded-lg text-xs font-bold transition ${
                                    (footerLogoSettings.footerTextAlign || (footerLogoSettings.footerAlignment === 'center' ? 'center' : 'justify')) === 'justify'
                                      ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                                      : 'bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10 hover:border-primary/40'
                                  }`}
                                >
                                  Texto Justificado
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setFooterLogoSettings((s: any) => ({ ...s, footerTextAlign: 'center' }))}
                                  className={`p-2.5 border rounded-lg text-xs font-bold transition ${
                                    (footerLogoSettings.footerTextAlign || (footerLogoSettings.footerAlignment === 'center' ? 'center' : 'justify')) === 'center'
                                      ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                                      : 'bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10 hover:border-primary/40'
                                  }`}
                                >
                                  Texto Centrado
                                </button>
                              </div>
                              <p className="text-[11px] text-muted-foreground">
                                Nota: Los bloques de <b>Socios Comerciales</b> y <b>Ubicación</b> se mantienen siempre centrados, mientras que el texto se mostrará justificado o centrado según elijas aquí.
                              </p>
                            </div>

                            <div className="space-y-2">
                              <label className="text-xs text-muted-foreground block">Alineación de Encabezados de Columnas (Misión, Visión, Redes)</label>
                              <select
                                value={footerLogoSettings.footerAlignment || 'left'}
                                onChange={e => {
                                  const val = e.target.value
                                  setFooterLogoSettings((s: any) => ({
                                    ...s,
                                    footerAlignment: val,
                                    ...(val === 'justify' ? { footerTextAlign: 'justify' } : val === 'center' && !s.footerTextAlign ? { footerTextAlign: 'center' } : {})
                                  }))
                                }}
                                className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-lg p-2 text-sm"
                              >
                                <option value="left">Izquierda</option>
                                <option value="center">Centro</option>
                                <option value="justify">Centrado con Texto Justificado</option>
                                <option value="right">Derecha</option>
                              </select>
                            </div>
                            <div className="space-y-2">
                              <label className="text-xs text-muted-foreground block">Espaciado Interno (Padding Vertical)</label>
                              <div className="flex gap-2">
                                <input type="range" min="0" max="64" value={footerLogoSettings.footerPadding ?? 12} onChange={e => setFooterLogoSettings((s: any) => ({...s, footerPadding: Number(e.target.value)}))} className="w-full accent-primary" />
                                <span className="text-xs w-8">{footerLogoSettings.footerPadding ?? 12}</span>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <label className="text-xs text-muted-foreground block">Margen Superior (Margin Top)</label>
                              <div className="flex gap-2">
                                <input type="range" min="0" max="64" value={footerLogoSettings.footerMarginTop ?? 0} onChange={e => setFooterLogoSettings((s: any) => ({...s, footerMarginTop: Number(e.target.value)}))} className="w-full accent-primary" />
                                <span className="text-xs w-8">{footerLogoSettings.footerMarginTop ?? 0}</span>
                              </div>
                            </div>

                            {/* Color de Fondo del Footer */}
                            <div className="space-y-2">
                              <label className="text-xs text-muted-foreground block font-medium">Color de Fondo del Footer</label>
                              <div className="flex items-center gap-3">
                                <input 
                                  type="color" 
                                  value={footerLogoSettings.bgColor || '#09090b'} 
                                  onChange={e => setFooterLogoSettings((s: any) => ({ ...s, bgColor: e.target.value }))}
                                  className="w-9 h-9 rounded-lg border border-black/10 dark:border-white/10 cursor-pointer bg-transparent"
                                />
                                <input 
                                  type="text" 
                                  value={footerLogoSettings.bgColor || ''} 
                                  onChange={e => setFooterLogoSettings((s: any) => ({ ...s, bgColor: e.target.value }))} 
                                  placeholder="Por defecto (Translúcido / Tarjeta)"
                                  className="flex-1 bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-lg p-2 text-xs font-mono"
                                />
                                {footerLogoSettings.bgColor && (
                                  <button 
                                    type="button" 
                                    onClick={() => setFooterLogoSettings((s: any) => ({ ...s, bgColor: undefined }))}
                                    className="text-xs text-muted-foreground hover:text-foreground px-2 py-1"
                                  >
                                    Restablecer
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="space-y-4 pt-4 border-t border-black/5 dark:border-white/5">
                            <label className="text-xs text-muted-foreground block font-bold">Texto y Alineación</label>
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input type="checkbox" checked={footerLogoSettings.showText ?? true} onChange={e => setFooterLogoSettings((s: any) => ({...s, showText: e.target.checked}))} className="rounded border-black/20 accent-primary" />
                              <span className="text-sm font-semibold">Mostrar Nombre (Texto)</span>
                            </label>
                            <div className="space-y-2">
                              <label className="text-xs text-muted-foreground block">Tamaño del Texto</label>
                              <div className="flex gap-2">
                                <input type="range" min="12" max="64" value={footerLogoSettings.textSize || 24} onChange={e => setFooterLogoSettings((s: any) => ({...s, textSize: Number(e.target.value)}))} className="w-full accent-primary" />
                                <span className="text-xs">{footerLogoSettings.textSize || 24}px</span>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <label className="text-xs text-muted-foreground block">Estilo del Texto</label>
                              <select value={footerLogoSettings.textEffect || 'gradient'} onChange={e => setFooterLogoSettings((s: any) => ({...s, textEffect: e.target.value}))} className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-lg p-2 text-sm">
                                <option value="gradient">Metálico / Gradiente</option>
                                <option value="neon">Neon Brillante</option>
                                <option value="minimalist">Minimalista (Ligero)</option>
                                <option value="none">Sólido Normal</option>
                              </select>
                            </div>

                            {/* Texto de Copyright */}
                            <div className="space-y-2 pt-2 border-t border-black/5 dark:border-white/5">
                              <label className="text-xs text-muted-foreground block font-medium">Texto de Derechos de Autor (Copyright)</label>
                              <input 
                                type="text" 
                                value={footerLogoSettings.copyrightText || ''} 
                                onChange={e => setFooterLogoSettings((s: any) => ({ ...s, copyrightText: e.target.value }))} 
                                placeholder={`© ${new Date().getFullYear()} ${appName || 'GymPro'}. Todos los derechos reservados.`}
                                className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-lg p-2 text-xs focus:border-primary"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Live Preview Box */}
                        <div className="w-full lg:w-80 shrink-0 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-2xl p-5 flex flex-col items-center justify-center">
                          <span className="text-[10px] text-muted-foreground mb-4 uppercase tracking-wider font-bold">Previsualización de Marca</span>
                          <div className={`flex ${(footerLogoSettings.position === 'top' || footerLogoSettings.position === 'top-center') ? 'flex-col items-center text-center' : 'flex-row items-center'} gap-3 w-full justify-center`}>
                            {(footerLogoSettings.showLogo ?? true) && (footerLogoSettings.customLogoUrl || logoUrl || logoUrlDark) && (
                              <div 
                                className={`shrink-0 relative flex items-center justify-center ${footerLogoSettings.glassEffect ? 'bg-white/5 backdrop-blur-md p-2 rounded-2xl border border-black/10 dark:border-white/10 shadow-xl' : ''}`}
                                style={{ 
                                  width: Math.min(Number(footerLogoSettings.width || 60), 90), 
                                  height: Math.min(Number(footerLogoSettings.height || 60), 90) 
                                }}
                              >
                                {(footerLogoSettings.glowEffect ?? true) && (
                                  <div 
                                    className="absolute inset-0 rounded-full bg-primary/40 pointer-events-none"
                                    style={{ 
                                      boxShadow: '0 0 16px 4px hsl(var(--primary) / 0.4)',
                                      filter: 'blur(6px)'
                                    }} 
                                  />
                                )}
                                <img 
                                  src={footerLogoSettings.customLogoUrl || ((theme === 'dark' && logoUrlDark) ? logoUrlDark : (logoUrl || logoUrlDark))} 
                                  alt="Preview" 
                                  className="object-contain relative z-10 max-w-full max-h-full" 
                                />
                              </div>
                            )}
                            {(footerLogoSettings.showText !== false) && (
                              <span 
                                style={{ fontSize: Math.min((footerLogoSettings.textSize || 24) * 0.7, 20) }} 
                                className={`font-black tracking-tighter truncate max-w-[180px] ${footerLogoSettings.textEffect === 'neon' ? 'text-primary drop-shadow-[0_0_10px_rgba(var(--primary),0.8)]' : footerLogoSettings.textEffect === 'minimalist' ? 'text-foreground/80 font-light tracking-widest' : footerLogoSettings.textEffect === 'none' ? 'text-foreground' : 'bg-gradient-to-r from-primary to-orange-400 bg-clip-text text-transparent'}`}
                              >
                                {appName}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
    
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <span>📍</span> Dirección para el Footer y Web Pública (Mapa)
                    </label>
                    <input
                      type="text"
                      value={landingSettings?.map?.address || ''}
                      onChange={(e) => setLandingSettings?.((prev: any) => ({
                        ...prev,
                        map: { ...(prev?.map || {}), address: e.target.value }
                      }))}
                      placeholder="Ej. Av. Principal, Local 5, Ciudad..."
                      className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-lg p-3 text-sm text-foreground focus:outline-none focus:border-primary"
                    />
                    <p className="text-xs text-muted-foreground">Esta dirección se muestra a los clientes en el pie de página (footer) y en el mapa de la página principal. La dirección de tickets y facturas se gestiona por separado en la pestaña General.</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground block">Misión</label>
                      <textarea 
                        value={footerMission}
                        onChange={(e) => setFooterMission(e.target.value)}
                        className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-lg p-3 text-sm focus:border-primary min-h-[100px]" 
                        placeholder="Misión de la empresa..."
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground block">Visión</label>
                      <textarea 
                        value={footerVision}
                        onChange={(e) => setFooterVision(e.target.value)}
                        className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-lg p-3 text-sm focus:border-primary min-h-[100px]" 
                        placeholder="Visión de la empresa..."
                      />
                    </div>
                  </div>

                  {/* Redes Sociales Dinámicas */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-muted-foreground block">Redes Sociales</label>
                      <button type="button" onClick={() => setFooterSocialLinks([...footerSocialLinks, { id: Date.now().toString(), name: 'Nueva', url: '', width: 24, height: 24 }])} className="bg-transparent border border-primary text-primary hover:bg-primary/10 text-xs px-3 py-1.5 rounded-lg transition font-bold">+ Agregar Red</button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {footerSocialLinks.map((link, idx) => (
                        <div key={link.id || idx} className="bg-black/5 dark:bg-white/5 p-4 rounded-xl border border-black/10 dark:border-white/10 space-y-4 relative group hover:shadow-md transition">
                          <button type="button" onClick={() => setFooterSocialLinks(footerSocialLinks.filter((_, i) => i !== idx))} className="absolute top-2 right-2 text-destructive opacity-0 group-hover:opacity-100 transition p-1 hover:bg-destructive/10 rounded-lg">&times;</button>
                          
                          <div className="flex gap-4">
                            <div className="w-16 h-16 shrink-0 bg-black/10 dark:bg-black/40 rounded-xl overflow-hidden flex items-center justify-center border border-black/10 dark:border-white/10 relative">
                              {link.iconUrl ? (
                                <img src={link.iconUrl} alt={link.name} className="w-full h-full object-contain p-2" />
                              ) : (
                                <div className="text-[10px] font-bold text-center text-primary leading-tight"><span className="text-xl block mb-1">↑</span>Subir<br/>Logo</div>
                              )}
                              <input type="file" accept=".svg,.png,.jpg,.jpeg,.webp,image/svg+xml,image/png,image/jpeg,image/webp" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => {
                                const file = e.target.files?.[0];
                                if(file){
                                  const reader = new FileReader();
                                  reader.onloadend = () => {
                                    const arr = [...footerSocialLinks];
                                    arr[idx].iconUrl = reader.result as string;
                                    setFooterSocialLinks(arr);
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }} />
                            </div>
                            <div className="flex-1 space-y-2">
                              <input type="text" placeholder="Nombre (Ej. Instagram)" value={link.name} onChange={e => { const arr = [...footerSocialLinks]; arr[idx].name = e.target.value; setFooterSocialLinks(arr); }} className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-lg p-2 text-sm focus:border-primary" />
                              <input type="text" placeholder="URL (https://...)" value={link.url} onChange={e => { const arr = [...footerSocialLinks]; arr[idx].url = e.target.value; setFooterSocialLinks(arr); }} className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-lg p-2 text-sm focus:border-primary" />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-muted-foreground">Tamaño (Ancho/Alto):</span>
                              <input type="number" value={link.width} onChange={e => { const arr = [...footerSocialLinks]; arr[idx].width = Number(e.target.value) || 24; arr[idx].height = Number(e.target.value) || 24; setFooterSocialLinks(arr); }} className="w-16 bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded p-1 text-xs text-center" />
                            </div>
                            <input type="range" min="10" max="100" value={link.width} onChange={e => { const arr = [...footerSocialLinks]; arr[idx].width = Number(e.target.value); arr[idx].height = Number(e.target.value); setFooterSocialLinks(arr); }} className="w-full accent-primary" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Socios Comerciales Dinámicos */}
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <label className="text-sm font-bold text-foreground block">Socios Comerciales (Logos en Pirámide)</label>
                        <span className="text-xs text-muted-foreground">El primer socio de la lista se ubica en la cima de la pirámide, o puedes elegir el nivel exacto de cada uno.</span>
                      </div>
                      <button type="button" onClick={() => setFooterPartners([...footerPartners, { id: Date.now().toString(), imageUrl: '', link: '', width: 100, height: 40 }])} className="bg-transparent border border-primary text-primary hover:bg-primary/10 text-xs px-3 py-1.5 rounded-lg transition font-bold shrink-0">+ Agregar Socio</button>
                    </div>

                    {/* Selector de Estilo de Disposición de Socios */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setFooterLogoSettings((s: any) => ({ ...s, partnersLayout: 'pyramid' }))}
                        className={`p-2.5 border rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                          (footerLogoSettings.partnersLayout || 'pyramid') === 'pyramid'
                            ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                            : 'bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10 hover:border-primary/40'
                        }`}
                      >
                        <span>🔺 Piramidal (1 arriba, base abajo)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setFooterLogoSettings((s: any) => ({ ...s, partnersLayout: 'inverted-pyramid' }))}
                        className={`p-2.5 border rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                          footerLogoSettings.partnersLayout === 'inverted-pyramid'
                            ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                            : 'bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10 hover:border-primary/40'
                        }`}
                      >
                        <span>🔻 Pirámide Invertida</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setFooterLogoSettings((s: any) => ({ ...s, partnersLayout: 'grid' }))}
                        className={`p-2.5 border rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                          footerLogoSettings.partnersLayout === 'grid'
                            ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                            : 'bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10 hover:border-primary/40'
                        }`}
                      >
                        <span>📏 En Línea / Fila Normal</span>
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {footerPartners.map((partner, idx) => (
                        <div key={partner.id || idx} className="bg-black/5 dark:bg-white/5 p-4 rounded-xl border border-black/10 dark:border-white/10 space-y-4 relative group hover:shadow-md transition">
                          <div className="flex items-center justify-between border-b border-black/5 dark:border-white/5 pb-2">
                            <span className="text-[11px] font-bold text-primary">
                              Socio #{idx + 1} {idx === 0 && (footerLogoSettings.partnersLayout || 'pyramid') === 'pyramid' && !partner.tier ? '(Cima de la Pirámide)' : ''}
                            </span>
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                disabled={idx === 0}
                                onClick={() => {
                                  if (idx === 0) return;
                                  const arr = [...footerPartners];
                                  [arr[idx - 1], arr[idx]] = [arr[idx], arr[idx - 1]];
                                  setFooterPartners(arr);
                                }}
                                title="Subir posición en la pirámide"
                                className="px-2 py-0.5 text-xs rounded bg-black/5 dark:bg-white/10 hover:bg-primary/20 disabled:opacity-30 font-bold"
                              >
                                ↑
                              </button>
                              <button
                                type="button"
                                disabled={idx === footerPartners.length - 1}
                                onClick={() => {
                                  if (idx === footerPartners.length - 1) return;
                                  const arr = [...footerPartners];
                                  [arr[idx + 1], arr[idx]] = [arr[idx], arr[idx + 1]];
                                  setFooterPartners(arr);
                                }}
                                title="Bajar posición en la pirámide"
                                className="px-2 py-0.5 text-xs rounded bg-black/5 dark:bg-white/10 hover:bg-primary/20 disabled:opacity-30 font-bold"
                              >
                                ↓
                              </button>
                              <button
                                type="button"
                                onClick={() => setFooterPartners(footerPartners.filter((_, i) => i !== idx))}
                                className="text-destructive hover:bg-destructive/10 px-2 py-0.5 rounded text-xs font-bold ml-1"
                                title="Eliminar socio"
                              >
                                &times;
                              </button>
                            </div>
                          </div>
                          
                          <div className="flex gap-4">
                            <div className="w-20 h-20 shrink-0 bg-white/10 rounded-xl overflow-hidden flex items-center justify-center border border-black/10 dark:border-white/10 relative">
                              {partner.imageUrl ? (
                                <img src={partner.imageUrl} alt="Socio" className="w-full h-full object-contain p-1" />
                              ) : (
                                <div className="text-xs font-bold text-center text-primary leading-tight"><span className="text-2xl block mb-1">↑</span>Subir<br/>Logo</div>
                              )}
                              <input type="file" accept=".svg,.png,.jpg,.jpeg,.webp,image/svg+xml,image/png,image/jpeg,image/webp" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => {
                                const file = e.target.files?.[0];
                                if(file){
                                  const reader = new FileReader();
                                  reader.onloadend = () => {
                                    const arr = [...footerPartners];
                                    arr[idx].imageUrl = reader.result as string;
                                    setFooterPartners(arr);
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }} />
                            </div>
                            <div className="flex-1 space-y-2 flex flex-col justify-center">
                              <input type="text" placeholder="URL (Opcional)" value={partner.link || ''} onChange={e => { const arr = [...footerPartners]; arr[idx].link = e.target.value; setFooterPartners(arr); }} className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-lg p-2 text-xs focus:border-primary" />
                              <div>
                                <label className="text-[10px] text-muted-foreground block mb-0.5">Escalón / Fila en la Pirámide:</label>
                                <select
                                  value={partner.tier || 0}
                                  onChange={e => {
                                    const arr = [...footerPartners];
                                    const val = Number(e.target.value);
                                    arr[idx].tier = val > 0 ? val : undefined;
                                    setFooterPartners(arr);
                                  }}
                                  className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-lg p-1.5 text-xs focus:border-primary"
                                >
                                  <option value={0}>Automático (1 → 2 → 3...)</option>
                                  <option value={1}>Nivel 1 (Punta / Cima)</option>
                                  <option value={2}>Nivel 2 (Segunda fila)</option>
                                  <option value={3}>Nivel 3 (Tercera fila)</option>
                                  <option value={4}>Nivel 4 (Base inferior)</option>
                                </select>
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <div className="flex justify-between items-center">
                                <span className="text-xs text-muted-foreground">Ancho:</span>
                                <input type="number" value={partner.width} onChange={e => { const arr = [...footerPartners]; arr[idx].width = Number(e.target.value) || 100; setFooterPartners(arr); }} className="w-16 bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded p-1 text-xs text-center" />
                              </div>
                              <input type="range" min="20" max="300" value={partner.width} onChange={e => { const arr = [...footerPartners]; arr[idx].width = Number(e.target.value); setFooterPartners(arr); }} className="w-full accent-primary" />
                            </div>
                            <div className="space-y-2">
                              <div className="flex justify-between items-center">
                                <span className="text-xs text-muted-foreground">Alto:</span>
                                <input type="number" value={partner.height} onChange={e => { const arr = [...footerPartners]; arr[idx].height = Number(e.target.value) || 40; setFooterPartners(arr); }} className="w-16 bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded p-1 text-xs text-center" />
                              </div>
                              <input type="range" min="10" max="200" value={partner.height} onChange={e => { const arr = [...footerPartners]; arr[idx].height = Number(e.target.value); setFooterPartners(arr); }} className="w-full accent-primary" />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                    {/* VISTA PREVIA COMPLETA DEL FOOTER */}
                    <div className="mt-8 pt-8 border-t border-black/10 dark:border-white/10 mb-8">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Vista Previa del Footer (Tiempo Real)</h3>
                        <span className="text-xs text-primary font-medium">Refleja tus cambios en vivo</span>
                      </div>
                      <div className="w-full bg-card/40 border border-black/10 dark:border-white/10 rounded-2xl overflow-hidden shadow-inner">
                        <BaseFooter settings={{
                          footerLogoSettings,
                          logoUrl,
                          logoUrlDark,
                          appName,
                          footerMission,
                          footerVision,
                          footerSocialLinks,
                          footerPartners,
                          landingSettings,
                          storeAddress
                        }} />
                      </div>
                    </div>
    </div>
  )
}
