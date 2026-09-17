const fs = require('fs');

const p = 'app/ajustes/page.tsx';
let c = fs.readFileSync(p, 'utf8');

const target = `</select>
                              </div>
                            </div>
                          </div>`;

const replaceWith = `</select>
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
                          </div>`;

if (c.includes(target)) {
    c = c.replace(target, replaceWith);
    fs.writeFileSync(p, c, 'utf8');
    console.log('UI injected successfully!');
} else {
    console.log('Target string not found!');
}
