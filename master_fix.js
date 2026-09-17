const fs = require('fs');
const p = 'app/ajustes/page.tsx';
let c = fs.readFileSync(p, 'utf8');

// 1. max-w-full
c = c.replace('max-w-7xl mx-auto w-full', 'max-w-full mx-auto w-full');

// 2. Add state variable
if (!c.includes('footerLogoSettings')) {
    c = c.replace(
        'const [footerVision, setFooterVision] = useState(settings.footerVision || "")',
        'const [footerVision, setFooterVision] = useState(settings.footerVision || "")\n  const [footerLogoSettings, setFooterLogoSettings] = useState<any>(settings.footerLogoSettings || { showLogo: true, position: \'side\', width: 40, height: 40, glassEffect: false, glowEffect: false, alignment: \'left\', showText: true, textSize: 24, textEffect: \'gradient\', footerAlignment: \'left\', footerPadding: 12, footerMarginTop: 0 })'
    );
    
    // 3. Add to handleSave payload
    c = c.replace(
        'footerVision,\n        footerSocialLinks,\n        footerPartners\n      })',
        'footerVision,\n        footerSocialLinks,\n        footerPartners,\n        footerLogoSettings\n      })'
    );
    
    // 4. Add UI elements under Footer y Marca
    const uiStr = `
                    <div className="space-y-4">
                      <h4 className="text-sm font-bold text-primary border-b border-black/10 dark:border-white/10 pb-2">Ajustes Estéticos del Logo (Previsualización en Vivo)</h4>
                      <div className="flex gap-4 items-start">
                        <div className="flex-1 space-y-4">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={footerLogoSettings.showLogo} onChange={e => setFooterLogoSettings((s: any) => ({...s, showLogo: e.target.checked}))} className="rounded border-black/20" />
                            <span className="text-sm">Mostrar Logo en el Footer</span>
                          </label>
                          <div className="space-y-2">
                            <label className="text-xs text-muted-foreground block">Posición del Logo</label>
                            <select value={footerLogoSettings.position} onChange={e => setFooterLogoSettings((s: any) => ({...s, position: e.target.value as any}))} className="bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-lg p-2 text-sm">
                              <option value="side">Al lado del Texto</option>
                              <option value="top">Arriba del Texto</option>
                            </select>
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs text-muted-foreground block">Tamaño (Ancho / Alto)</label>
                            <div className="flex gap-2">
                              <input type="range" min="20" max="150" value={footerLogoSettings.width} onChange={e => setFooterLogoSettings((s: any) => ({...s, width: Number(e.target.value), height: Number(e.target.value)}))} className="w-full accent-primary" />
                              <span className="text-xs">{footerLogoSettings.width}px</span>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <span className="text-xs text-muted-foreground block">Efectos Avanzados (Diseño)</span>
                            <div className="flex flex-col gap-2">
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" checked={footerLogoSettings.glassEffect} onChange={e => setFooterLogoSettings((s: any) => ({...s, glassEffect: e.target.checked}))} className="rounded border-black/20" />
                                <span className="text-xs">Efecto Glassmorphism (Fondo Translúcido)</span>
                              </label>
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" checked={footerLogoSettings.glowEffect} onChange={e => setFooterLogoSettings((s: any) => ({...s, glowEffect: e.target.checked}))} className="rounded border-black/20" />
                                <span className="text-xs">Efecto Glow / Neon (Resplandor animado)</span>
                              </label>
                            </div>
                          </div>
                          
                          <div className="space-y-4 pt-4 border-t border-black/5 dark:border-white/5 w-full mt-4">
                            <label className="text-xs text-muted-foreground block font-bold text-primary">Estructura Global del Footer (Padding, Margen y Alineación)</label>
                            
                            <div className="space-y-2">
                              <label className="text-xs text-muted-foreground block">Alineación del Contenido (Texto de las Columnas)</label>
                              <select value={footerLogoSettings.footerAlignment || 'left'} onChange={e => setFooterLogoSettings((s: any) => ({...s, footerAlignment: e.target.value}))} className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-lg p-2 text-sm">
                                <option value="left">Izquierda</option>
                                <option value="center">Centro</option>
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
                          </div>

                          <div className="space-y-4 pt-4 border-t border-black/5 dark:border-white/5">
                            <label className="text-xs text-muted-foreground block font-bold">Texto y Alineación</label>
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input type="checkbox" checked={footerLogoSettings.showText ?? true} onChange={e => setFooterLogoSettings((s: any) => ({...s, showText: e.target.checked}))} className="rounded border-black/20" />
                              <span className="text-sm">Mostrar Nombre (Texto)</span>
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
                          </div>
                        </div>

                        {/* Live Preview Box */}
                        <div className="w-64 shrink-0 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl p-4 flex flex-col items-center justify-center">
                          <span className="text-[10px] text-muted-foreground mb-4 uppercase tracking-wider font-bold">Previsualización</span>
                          <div className={\`flex \${footerLogoSettings.position === 'top' ? 'flex-col items-start' : 'items-center'} gap-3\`}>
                            {footerLogoSettings.showLogo && settings.logoUrl && (
                              <div className={\`relative \${footerLogoSettings.glowEffect ? 'before:absolute before:inset-0 before:bg-primary/20 before:blur-xl before:rounded-full before:animate-pulse' : ''} \${footerLogoSettings.glassEffect ? 'bg-white/5 backdrop-blur-md p-2 rounded-2xl border border-black/10 dark:border-white/10 shadow-xl' : ''}\`}>
                                <img src={settings.logoUrl} alt="Preview" style={{ width: footerLogoSettings.width, height: footerLogoSettings.height }} className="object-contain relative z-10" />
                              </div>
                            )}
                            {(footerLogoSettings.showText !== false) && (
                              <span style={{ fontSize: (footerLogoSettings.textSize || 24) * 0.6 }} className={\`font-black tracking-tighter \${footerLogoSettings.textEffect === 'neon' ? 'text-primary drop-shadow-[0_0_10px_rgba(var(--primary),0.8)]' : footerLogoSettings.textEffect === 'minimalist' ? 'text-foreground/80 font-light tracking-widest' : footerLogoSettings.textEffect === 'none' ? 'text-foreground' : 'bg-gradient-to-r from-primary to-orange-400 bg-clip-text text-transparent'}\`}>{settings.appName}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
    `;

    c = c.replace(
        '<h3 className="text-lg font-bold flex items-center gap-2 text-primary">Footer y Marca</h3>',
        '<h3 className="text-lg font-bold flex items-center gap-2 text-primary">Footer y Marca</h3>\n' + uiStr
    );
}

fs.writeFileSync(p, c, 'utf8');
console.log('Fixed from scratch!');
