const fs = require('fs');
let c = fs.readFileSync('app/ajustes/page.tsx', 'utf8');

// 1. Add activeTab to state
if (!c.includes('activeTab, setActiveTab')) {
    c = c.replace('const [themeColor, setThemeColor] = useState("")', 'const [themeColor, setThemeColor] = useState("")\n  const [activeTab, setActiveTab] = useState("general")');
}

// 2. Add Tabs UI
const tabsUI = `        {/* TABS HEADER */}
        <div className="flex overflow-x-auto border-b border-black/10 dark:border-white/10 mb-8 scrollbar-hide">
          <button type="button" onClick={() => setActiveTab('general')} className={\`whitespace-nowrap px-6 py-4 font-bold border-b-2 transition-all \${activeTab === 'general' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}\`}>General</button>
          <button type="button" onClick={() => setActiveTab('navbar')} className={\`whitespace-nowrap px-6 py-4 font-bold border-b-2 transition-all \${activeTab === 'navbar' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}\`}>Navbar y Apariencia</button>
          <button type="button" onClick={() => setActiveTab('footer')} className={\`whitespace-nowrap px-6 py-4 font-bold border-b-2 transition-all \${activeTab === 'footer' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}\`}>Footer y Redes</button>
        </div>`;
if (!c.includes('TABS HEADER')) {
    c = c.replace('<form onSubmit={handleSave} className="space-y-6">', tabsUI + '\n        <form onSubmit={handleSave} className="space-y-6">');
}

// Helper to wrap sections cleanly without breaking JSX
// Instead of inserting unclosed divs, we will append \`\${activeTab === 'general' ? 'block' : 'hidden'}\` to classNames!

// 1. Nombre de la app (grid grid-cols-1 md:grid-cols-2 gap-6)
c = c.replace('<div className="grid grid-cols-1 md:grid-cols-2 gap-6">', '<div className={`grid grid-cols-1 md:grid-cols-2 gap-6 ${activeTab === "general" ? "block" : "hidden"}`}>');

// 2. Marca y Logos (space-y-4)
c = c.replace('<div className="space-y-4">\n                <h3 className="text-lg font-bold flex items-center gap-2 text-primary">Marca y Logos</h3>', '<div className={`space-y-4 ${activeTab === "general" ? "block" : "hidden"}`}>\n                <h3 className="text-lg font-bold flex items-center gap-2 text-primary">Marca y Logos</h3>');

// 3. Apariencia (pt-6)
c = c.replace('<div className="pt-6">\n                <h3 className="text-lg font-bold flex items-center gap-2 text-primary mb-4">Apariencia</h3>', '<div className={`pt-6 ${activeTab === "navbar" ? "block" : "hidden"}`}>\n                <h3 className="text-lg font-bold flex items-center gap-2 text-primary mb-4">Apariencia</h3>');

// 4. Colores de Sistema (pt-6)
c = c.replace('<div className="pt-6">\n                <h3 className="text-lg font-bold flex items-center gap-2 text-primary mb-4">Colores del Sistema</h3>', '<div className={`pt-6 ${activeTab === "navbar" ? "block" : "hidden"}`}>\n                <h3 className="text-lg font-bold flex items-center gap-2 text-primary mb-4">Colores del Sistema</h3>');

// 5. Misión (pt-6)
c = c.replace('<div className="pt-6">\n                <h3 className="text-lg font-bold flex items-center gap-2 text-primary mb-4">Misión y Visión</h3>', '<div className={`pt-6 ${activeTab === "footer" ? "block" : "hidden"}`}>\n                <h3 className="text-lg font-bold flex items-center gap-2 text-primary mb-4">Misión y Visión</h3>');

// 6. Redes (pt-6)
c = c.replace('<div className="pt-6">\n                <div className="flex justify-between items-center mb-4">\n                  <h3 className="text-lg font-bold flex items-center gap-2 text-primary">Redes Sociales</h3>', '<div className={`pt-6 ${activeTab === "footer" ? "block" : "hidden"}`}>\n                <div className="flex justify-between items-center mb-4">\n                  <h3 className="text-lg font-bold flex items-center gap-2 text-primary">Redes Sociales</h3>');

// 7. Socios (pt-6)
c = c.replace('<div className="pt-6 border-t border-black/10 dark:border-white/10 mt-6">\n                <div className="flex justify-between items-center mb-4">\n                  <h3 className="text-lg font-bold flex items-center gap-2 text-primary">Socios Comerciales</h3>', '<div className={`pt-6 border-t border-black/10 dark:border-white/10 mt-6 ${activeTab === "footer" ? "block" : "hidden"}`}>\n                <div className="flex justify-between items-center mb-4">\n                  <h3 className="text-lg font-bold flex items-center gap-2 text-primary">Socios Comerciales</h3>');

// 8. Tienda (pt-4)
c = c.replace('<div className="pt-4 border-t border-black/10 dark:border-white/10 mt-6 pt-6">\n                <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><Store className="h-5 w-5 text-primary" /> Configuración de Tienda y Facturación</h3>', '<div className={`pt-4 border-t border-black/10 dark:border-white/10 mt-6 pt-6 ${activeTab === "general" ? "block" : "hidden"}`}>\n                <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><Store className="h-5 w-5 text-primary" /> Configuración de Tienda y Facturación</h3>');

// 9. Footer Settings (pt-6)
c = c.replace('<div className="pt-6 border-t border-black/10 dark:border-white/10 mt-6 space-y-8">\n                    <h3 className="text-lg font-bold flex items-center gap-2 text-primary">Footer y Marca</h3>', '<div className={`pt-6 border-t border-black/10 dark:border-white/10 mt-6 space-y-8 ${activeTab === "footer" ? "block" : "hidden"}`}>\n                    <h3 className="text-lg font-bold flex items-center gap-2 text-primary">Footer y Marca</h3>');

// 10. Vista Previa Footer (mt-8)
c = c.replace('<div className="mt-8 pt-8 border-t border-black/10 dark:border-white/10 mb-8">\n                      <h3 className="text-sm font-bold text-muted-foreground mb-4 uppercase tracking-wider">Vista Previa del Footer (Tiempo Real)</h3>', '<div className={`mt-8 pt-8 border-t border-black/10 dark:border-white/10 mb-8 ${activeTab === "footer" ? "block" : "hidden"}`}>\n                      <h3 className="text-sm font-bold text-muted-foreground mb-4 uppercase tracking-wider">Vista Previa del Footer (Tiempo Real)</h3>');


// Apply new Footer controls cleanly by string replace inside the block
const old_footer_settings = `                            <label className="flex items-center gap-2 cursor-pointer">
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
                            </div>`;

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

c = c.replace(old_footer_settings, new_footer_settings);
c = c.replace('<h4 className="text-sm font-bold text-primary border-b border-black/10 dark:border-white/10 pb-2">Ajustes Estéticos del Logo (Previsualización en Vivo)</h4>', '<h4 className="text-sm font-bold text-primary border-b border-black/10 dark:border-white/10 pb-2">Ajustes de Marca (Footer)</h4>');

fs.writeFileSync('app/ajustes/page.tsx', c);
