const fs = require('fs');
let lines = fs.readFileSync('app/ajustes/page.tsx', 'utf8').split('\n');
let getIdx = (str) => lines.findIndex(l => l.includes(str));

let showLogoIdx = getIdx('checked={footerLogoSettings.showLogo}');
if (showLogoIdx !== -1) {
    let startIdx = showLogoIdx - 2; 
    let endIdx = getIdx('Tamaño (Ancho / Alto)') + 6; 
    
    const new_footer_settings = `                            <div className="flex flex-col gap-3">
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" checked={footerLogoSettings.showLogo} onChange={e => setFooterLogoSettings((s: any) => ({...s, showLogo: e.target.checked}))} className="rounded border-black/20" />
                                <span className="text-sm">Mostrar Logo en el Footer</span>
                              </label>
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" checked={footerLogoSettings.showAppName !== false} onChange={e => setFooterLogoSettings((s: any) => ({...s, showAppName: e.target.checked}))} className="rounded border-black/20" />
                                <span className="text-sm">Mostrar Nombre de App en el Footer</span>
                              </label>
                            </div>
                            
                            <div className="space-y-2">
                              <label className="text-xs text-muted-foreground block">Tamaño del Logo (Ancho / Alto)</label>
                              <div className="flex gap-2">
                                <input type="range" min="20" max="150" value={footerLogoSettings.width} onChange={e => setFooterLogoSettings((s: any) => ({...s, width: Number(e.target.value), height: Number(e.target.value)}))} className="w-full accent-primary" />
                                <span className="text-xs">{footerLogoSettings.width}px</span>
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              <label className="text-xs text-muted-foreground block">Color de Fondo del Footer</label>
                              <input type="color" value={footerLogoSettings.bgColor || '#000000'} onChange={e => setFooterLogoSettings((s: any) => ({...s, bgColor: e.target.value}))} className="w-full h-10 rounded-lg cursor-pointer" />
                              <span className="text-[10px] text-muted-foreground">Déjalo en negro (#000000) para usar el fondo por defecto.</span>
                            </div>
                            
                            <div className="space-y-2">
                              <label className="text-xs text-muted-foreground block">Texto de Copyright</label>
                              <input type="text" placeholder="© 2026 Gym..." value={footerLogoSettings.copyrightText || ''} onChange={e => setFooterLogoSettings((s: any) => ({...s, copyrightText: e.target.value}))} className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-lg p-2 text-sm" />
                            </div>`;
    
    lines.splice(startIdx, endIdx - startIdx + 1, new_footer_settings);
}

fs.writeFileSync('app/ajustes/page.tsx', lines.join('\n'));
