const fs = require('fs');

let c = fs.readFileSync('app/ajustes/page.tsx', 'utf8');

if (!c.includes('const [activeTab, setActiveTab]')) {
    c = c.replace('const [themeColor, setThemeColor] = useState("")', 'const [themeColor, setThemeColor] = useState("")\n  const [activeTab, setActiveTab] = useState("general")');
}

const tabs_ui = `
        {/* TABS HEADER */}
        <div className="flex overflow-x-auto border-b border-black/10 dark:border-white/10 mb-8 scrollbar-hide">
          <button onClick={() => setActiveTab('general')} className={\`whitespace-nowrap px-6 py-4 font-bold border-b-2 transition-all \${activeTab === 'general' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}\`}>General</button>
          <button onClick={() => setActiveTab('navbar')} className={\`whitespace-nowrap px-6 py-4 font-bold border-b-2 transition-all \${activeTab === 'navbar' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}\`}>Navegación</button>
          <button onClick={() => setActiveTab('footer')} className={\`whitespace-nowrap px-6 py-4 font-bold border-b-2 transition-all \${activeTab === 'footer' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}\`}>Footer e Integraciones</button>
        </div>
`;

// Insert the tabs UI right after `<CardHeader>` of the first big card.
// Wait, the first big card has `<form onSubmit={handleSave} className="space-y-6">`
if (!c.includes('TABS HEADER')) {
    c = c.replace('<form onSubmit={handleSave} className="space-y-6">', tabs_ui + '\n            <form onSubmit={handleSave} className="space-y-6">');
}

// Now wrap sections with activeTab conditions.
// The form currently has:
// 1. App Name and Location (General)
// 2. Logo (General)
// 3. Apariencia & Temas (General)
// 4. Mision y Vision (Footer)
// 5. Redes Sociales (Footer)
// 6. Socios Comerciales (Footer)
// 7. Controles de Navbar (Navbar)
// 8. Footer Settings (Footer)

c = c.replace('<div className="grid grid-cols-1 md:grid-cols-2 gap-6">', '{activeTab === "general" && (<div className="space-y-8"><div className="grid grid-cols-1 gap-6 max-w-xl">');
c = c.replace('md:grid-cols-2 gap-6', 'grid-cols-1 gap-6 max-w-xl'); // already replaced above but maybe not

// Oh boy, it's easier to just use standard replacements on sections!
// We can wrap blocks.
c = c.replace('{/* Nombre de la App */}', '{/* Nombre de la App */}');
// Let's close the general tab before Misión y Visión
c = c.replace('<div className="pt-6 border-t border-black/10 dark:border-white/10 mt-6 space-y-6">', '</div>)}\n\n{activeTab === "footer" && (<div className="space-y-8"><div className="pt-6 border-t border-black/10 dark:border-white/10 mt-6 space-y-6">');

// Then close Footer before Controles de Navbar
c = c.replace('<div className="space-y-4 bg-black/20 p-4 rounded-xl border border-black/5 dark:border-white/5">', '</div>)}\n\n{activeTab === "navbar" && (<div className="space-y-8"><div className="space-y-4 bg-black/20 p-4 rounded-xl border border-black/5 dark:border-white/5">');

// Then close Navbar before Footer Settings... wait, Footer Settings should be in "footer" tab!
c = c.replace('{/* Footer Settings */}', '</div>)}\n\n{activeTab === "footer" && (<div className="space-y-8">\n{/* Footer Settings */}');

// Finally close the last wrapper just before the save button!
const save_btn = '<div className="pt-6 border-t border-black/10 dark:border-white/10 flex justify-end mt-6">';
c = c.replace(save_btn, '</div>)}\n' + save_btn);

// Wait, the "Ajustes Estéticos del Logo (Previsualización en Vivo)" inside footer settings:
c = c.replace('<h4 className="text-sm font-bold text-primary border-b border-black/10 dark:border-white/10 pb-2">Ajustes Estéticos del Logo (Previsualización en Vivo)</h4>', '<h4 className="text-sm font-bold text-primary border-b border-black/10 dark:border-white/10 pb-2">Ajustes de Marca (Footer)</h4>');

// Let's replace the whole footer settings block that had "Posicion del Logo"
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
                              <span className="text-[10px] text-muted-foreground">Déjalo en blanco o transparente para usar el fondo por defecto.</span>
                            </div>
                            
                            <div className="space-y-2">
                              <label className="text-xs text-muted-foreground block">Texto de Copyright</label>
                              <input type="text" placeholder="© 2026 Gym..." value={footerLogoSettings.copyrightText || ''} onChange={e => setFooterLogoSettings((s: any) => ({...s, copyrightText: e.target.value}))} className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-lg p-2 text-sm" />
                            </div>`;

if (c.includes('Posición del Logo')) {
    c = c.replace(old_footer_settings, new_footer_settings);
}

// Since we are conditionally rendering the big preview and it uses activeTab logic, let's put it outside the conditionals!
const preview_block = `                    {/* VISTA PREVIA COMPLETA DEL FOOTER */}`;
// Wait, the preview block is inside the <form>.
// Let's take the preview block OUT of the conditional wrappers, we can just close the wrapper BEFORE the preview!
// Actually, `save_btn` is placed AFTER the preview.
// So `c = c.replace(save_btn, '</div>)}\n' + save_btn)` actually wrapped the preview inside the last tab ("footer").
// Wait! If the preview is inside the "footer" tab, it will only show when the "footer" tab is active. That's actually PERFECT! You only need to see the footer preview when editing the footer!

fs.writeFileSync('app/ajustes/page.tsx', c);
