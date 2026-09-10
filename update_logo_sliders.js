const fs = require('fs');
let c = fs.readFileSync('app/ajustes/page.tsx', 'utf8');

c = c.replace(/<div className="grid grid-cols-2 gap-2">\s*<div>\s*<label className="text-xs text-muted-foreground block mb-1">Ancho \(px\)<\/label>\s*<input type="number" value=\{logoSettings\?\.widthNavbar \?\? 40\}.*?\/>\s*<\/div>\s*<div>\s*<label className="text-xs text-muted-foreground block mb-1">Alto \(px\)<\/label>\s*<input type="number" value=\{logoSettings\?\.heightNavbar \?\? 40\}.*?\/>\s*<\/div>\s*<\/div>/, `
                      <div className="space-y-4">
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
`);

c = c.replace(/<div className="grid grid-cols-2 gap-2">\s*<div>\s*<label className="text-xs text-muted-foreground block mb-1">Ancho \(px\)<\/label>\s*<input type="number" value=\{logoSettings\?\.widthLogin \?\? 96\}.*?\/>\s*<\/div>\s*<div>\s*<label className="text-xs text-muted-foreground block mb-1">Alto \(px\)<\/label>\s*<input type="number" value=\{logoSettings\?\.heightLogin \?\? 96\}.*?\/>\s*<\/div>\s*<\/div>/, `
                      <div className="space-y-4">
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
`);

fs.writeFileSync('app/ajustes/page.tsx', c, 'utf8');
console.log("Updated logo sliders");
