const fs = require('fs');
let c = fs.readFileSync('app/ajustes/page.tsx', 'utf8');

const lines = c.split("\n");
let start = lines.findIndex(l => l.includes("{/* Logo Upload */}"));
let end = 304;

const newLogoUi = `
              {/* Branding and Logos */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold flex items-center gap-2 text-primary">Marca y Logos</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Favicon */}
                  <div className="space-y-2 bg-black/5 dark:bg-white/5 p-4 rounded-xl border border-black/10 dark:border-white/10 text-center relative group">
                    <label className="text-sm font-medium text-muted-foreground block mb-2">Favicon (Pestaña)</label>
                    <div className="w-16 h-16 mx-auto bg-white dark:bg-black/40 rounded-xl flex items-center justify-center overflow-hidden border border-black/10 dark:border-white/10">
                      {faviconUrl ? <img src={faviconUrl} alt="Favicon" className="w-full h-full object-contain" /> : <span className="text-xs">Subir</span>}
                    </div>
                    <input type="file" accept="image/*" onChange={handleFaviconUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                    {faviconUrl && <button type="button" onClick={() => setFaviconUrl("")} className="mt-2 text-xs text-red-500 hover:underline">Quitar</button>}
                  </div>

                  {/* Logo Claro */}
                  <div className="space-y-2 bg-black/5 dark:bg-white/5 p-4 rounded-xl border border-black/10 dark:border-white/10 text-center relative group">
                    <label className="text-sm font-medium text-muted-foreground block mb-2">Logo (Modo Claro)</label>
                    <div className="w-32 h-16 mx-auto bg-white rounded-xl flex items-center justify-center overflow-hidden border border-black/10 dark:border-white/10">
                      {logoUrl ? <img src={logoUrl} alt="Logo" className="w-full h-full object-contain p-1" /> : <span className="text-xs text-black">Subir</span>}
                    </div>
                    <input type="file" accept="image/*" onChange={handleLogoUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                    {logoUrl && <button type="button" onClick={() => setLogoUrl("")} className="mt-2 text-xs text-red-500 hover:underline">Quitar</button>}
                  </div>

                  {/* Logo Oscuro */}
                  <div className="space-y-2 bg-black/5 dark:bg-white/5 p-4 rounded-xl border border-black/10 dark:border-white/10 text-center relative group">
                    <label className="text-sm font-medium text-muted-foreground block mb-2">Logo (Modo Oscuro)</label>
                    <div className="w-32 h-16 mx-auto bg-black rounded-xl flex items-center justify-center overflow-hidden border border-black/10 dark:border-white/10">
                      {logoUrlDark ? <img src={logoUrlDark} alt="Logo Dark" className="w-full h-full object-contain p-1" /> : <span className="text-xs text-white">Subir (Opcional)</span>}
                    </div>
                    <input type="file" accept="image/*" onChange={handleLogoDarkUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                    {logoUrlDark && <button type="button" onClick={() => setLogoUrlDark("")} className="mt-2 text-xs text-red-500 hover:underline">Quitar</button>}
                  </div>
                </div>

                {/* Live Preview & Sizes */}
                <div className="pt-4 border-t border-black/5 dark:border-white/5">
                  <h4 className="text-sm font-bold text-primary mb-4">Ajustes Estéticos del Logo (Previsualización en Vivo)</h4>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Controles de Navbar */}
                    <div className="space-y-4 bg-black/20 p-4 rounded-xl border border-black/5 dark:border-white/5">
                      <h5 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Barra de Navegación</h5>
                      
                      {/* Live Preview Box */}
                      <div className="w-full h-16 bg-white dark:bg-[#1A1A1A] border border-black/10 dark:border-white/10 rounded-lg flex items-center px-6 overflow-hidden">
                        <div className="flex items-center gap-2 font-bold text-xl text-primary">
                          {logoSettings?.showInNavbar && (logoUrl || logoUrlDark) && (
                            <img 
                              src={(theme === 'dark' && logoUrlDark) ? logoUrlDark : (logoUrl || logoUrlDark)} 
                              alt="Logo" 
                              style={{ width: logoSettings.widthNavbar, height: logoSettings.heightNavbar, objectFit: logoSettings.objectFit }} 
                              className="transition-all" 
                            />
                          )}
                          {logoSettings?.showNameInNavbar && <span>{appName}</span>}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-4 pt-2">
                        <label className="flex items-center gap-2 text-sm cursor-pointer">
                          <input type="checkbox" checked={logoSettings?.showInNavbar ?? true} onChange={(e) => setLogoSettings(s => ({...s, showInNavbar: e.target.checked}))} className="accent-primary w-4 h-4" />
                          Logo
                        </label>
                        <label className="flex items-center gap-2 text-sm cursor-pointer">
                          <input type="checkbox" checked={logoSettings?.showNameInNavbar ?? true} onChange={(e) => setLogoSettings(s => ({...s, showNameInNavbar: e.target.checked}))} className="accent-primary w-4 h-4" />
                          Nombre App
                        </label>
                      </div>

                      <div className="space-y-4 pt-2">
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <label className="text-xs text-muted-foreground block">Ancho (px)</label>
                            <input type="number" value={logoSettings?.widthNavbar ?? 40} onChange={e => setLogoSettings(s => ({...s, widthNavbar: Number(e.target.value)}))} className="w-16 bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded p-1 text-xs text-center focus:border-primary" />
                          </div>
                          <input type="range" min="20" max="200" value={logoSettings?.widthNavbar ?? 40} onChange={e => setLogoSettings(s => ({...s, widthNavbar: Number(e.target.value)}))} className="w-full accent-primary" />
                        </div>
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <label className="text-xs text-muted-foreground block">Alto (px)</label>
                            <input type="number" value={logoSettings?.heightNavbar ?? 40} onChange={e => setLogoSettings(s => ({...s, heightNavbar: Number(e.target.value)}))} className="w-16 bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded p-1 text-xs text-center focus:border-primary" />
                          </div>
                          <input type="range" min="20" max="200" value={logoSettings?.heightNavbar ?? 40} onChange={e => setLogoSettings(s => ({...s, heightNavbar: Number(e.target.value)}))} className="w-full accent-primary" />
                        </div>
                      </div>
                    </div>

                    {/* Controles de Login */}
                    <div className="space-y-4 bg-black/20 p-4 rounded-xl border border-black/5 dark:border-white/5">
                      <h5 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Pantalla Login</h5>
                      
                      {/* Live Preview Box */}
                      <div className="w-full h-32 bg-slate-100 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-lg flex items-center justify-center overflow-hidden relative">
                        <div className="p-4 bg-white dark:bg-[#1A1A1A] rounded-xl shadow flex flex-col items-center">
                          {logoSettings?.showInLogin && (logoUrl || logoUrlDark) && (
                            <img 
                              src={(theme === 'dark' && logoUrlDark) ? logoUrlDark : (logoUrl || logoUrlDark)} 
                              alt="Logo" 
                              style={{ width: logoSettings.widthLogin, height: logoSettings.heightLogin, objectFit: logoSettings.objectFit }} 
                              className="transition-all" 
                            />
                          )}
                          {logoSettings?.showNameInLogin && <span className="font-black text-primary mt-2">{appName}</span>}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-4 pt-2">
                        <label className="flex items-center gap-2 text-sm cursor-pointer">
                          <input type="checkbox" checked={logoSettings?.showInLogin ?? true} onChange={(e) => setLogoSettings(s => ({...s, showInLogin: e.target.checked}))} className="accent-primary w-4 h-4" />
                          Logo
                        </label>
                        <label className="flex items-center gap-2 text-sm cursor-pointer">
                          <input type="checkbox" checked={logoSettings?.showNameInLogin ?? true} onChange={(e) => setLogoSettings(s => ({...s, showNameInLogin: e.target.checked}))} className="accent-primary w-4 h-4" />
                          Nombre App
                        </label>
                      </div>

                      <div className="space-y-4 pt-2">
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <label className="text-xs text-muted-foreground block">Ancho (px)</label>
                            <input type="number" value={logoSettings?.widthLogin ?? 96} onChange={e => setLogoSettings(s => ({...s, widthLogin: Number(e.target.value)}))} className="w-16 bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded p-1 text-xs text-center focus:border-primary" />
                          </div>
                          <input type="range" min="40" max="400" value={logoSettings?.widthLogin ?? 96} onChange={e => setLogoSettings(s => ({...s, widthLogin: Number(e.target.value)}))} className="w-full accent-primary" />
                        </div>
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <label className="text-xs text-muted-foreground block">Alto (px)</label>
                            <input type="number" value={logoSettings?.heightLogin ?? 96} onChange={e => setLogoSettings(s => ({...s, heightLogin: Number(e.target.value)}))} className="w-16 bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded p-1 text-xs text-center focus:border-primary" />
                          </div>
                          <input type="range" min="40" max="400" value={logoSettings?.heightLogin ?? 96} onChange={e => setLogoSettings(s => ({...s, heightLogin: Number(e.target.value)}))} className="w-full accent-primary" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>`;

lines.splice(start, end - start + 1, newLogoUi);

fs.writeFileSync('app/ajustes/page.tsx', lines.join("\n"), 'utf8');
console.log("Replaced Logo block safely using line indices");
