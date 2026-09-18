const fs = require('fs');
let lines = fs.readFileSync('app/ajustes/page.tsx', 'utf8').split('\n');

// 1. Add activeTab
let themeIdx = lines.findIndex(l => l.includes('const [themeColor, setThemeColor] = useState("")'));
if(themeIdx !== -1 && !lines.find(l => l.includes('activeTab'))) {
    lines.splice(themeIdx + 1, 0, '  const [activeTab, setActiveTab] = useState("general")');
}

// 2. Add Tabs UI just before <form>
let formIdx = lines.findIndex(l => l.includes('<form onSubmit={handleSave} className="space-y-6">'));
if(formIdx !== -1 && !lines.find(l => l.includes('TABS HEADER'))) {
    const tabsUI = `        {/* TABS HEADER */}
        <div className="flex overflow-x-auto border-b border-black/10 dark:border-white/10 mb-8 scrollbar-hide">
          <button type="button" onClick={() => setActiveTab('general')} className={\`whitespace-nowrap px-6 py-4 font-bold border-b-2 transition-all \${activeTab === 'general' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}\`}>General</button>
          <button type="button" onClick={() => setActiveTab('navbar')} className={\`whitespace-nowrap px-6 py-4 font-bold border-b-2 transition-all \${activeTab === 'navbar' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}\`}>Navegación y Login</button>
          <button type="button" onClick={() => setActiveTab('footer')} className={\`whitespace-nowrap px-6 py-4 font-bold border-b-2 transition-all \${activeTab === 'footer' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}\`}>Footer e Integraciones</button>
        </div>`;
    lines.splice(formIdx, 0, tabsUI);
}

// Re-evaluate line numbers
let getIdx = (str) => lines.findIndex(l => l.includes(str));

let generalStart = getIdx('{/* Nombre de la App */}');
let navbarStart = getIdx('Ajustes Estéticos del Logo (Previsualización en Vivo)'); // This is inside a h4. The div is 2 lines above!
let footerStart = getIdx('{/* Footer Settings */}');
let footerEnd = getIdx('flex justify-end mt-6'); // The div for save button

if (generalStart !== -1 && navbarStart !== -1 && footerStart !== -1 && footerEnd !== -1) {
    // 1. Wrap General
    // generalStart - 1 is `<div className="grid grid-cols-1 md:grid-cols-2 gap-6">`
    lines.splice(generalStart - 1, 0, '            <div className={activeTab === "general" ? "block space-y-6" : "hidden"}>');
    
    // 2. Close General, Open Navbar
    // navbarStart is `<h4 className="text-sm font-bold text-primary mb-4">Ajustes Estéticos...`
    // navbarStart - 1 is `<div className="pt-4 border-t border-black/5 dark:border-white/5">`
    // navbarStart - 2 is `                  {/* Live Preview & Sizes */}`
    let navbarInsert = getIdx('{/* Live Preview & Sizes */}');
    lines.splice(navbarInsert, 0, '            </div>\n            <div className={activeTab === "navbar" ? "block space-y-6" : "hidden"}>');
    
    // 3. Close Navbar, Open Footer
    // footerStart is `{/* Footer Settings */}`
    let footerInsert = getIdx('{/* Footer Settings */}');
    lines.splice(footerInsert, 0, '            </div>\n            <div className={activeTab === "footer" ? "block space-y-6" : "hidden"}>');
    
    // 4. Close Footer
    // footerEnd is the `<div className="pt-6 ... flex justify-end">`
    let saveInsert = getIdx('flex justify-end mt-6');
    lines.splice(saveInsert, 0, '            </div>');
}

// Write file
fs.writeFileSync('app/ajustes/page.tsx', lines.join('\n'));
