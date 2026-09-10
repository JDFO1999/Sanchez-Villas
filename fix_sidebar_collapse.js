const fs = require('fs');
let c = fs.readFileSync('components/layout/app-layout.tsx', 'utf8');

c = c.replace(/<aside className={`print:hidden fixed inset-y-0 left-0 z-50 w-64 bg-card border-r transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 \${\r?\n\s*sidebarOpen \? "translate-x-0" : "-translate-x-full"\r?\n\s*}`}/,
`<aside className={\`print:hidden fixed inset-y-0 left-0 z-50 bg-card border-r transition-all duration-300 ease-in-out lg:static \${sidebarOpen ? "translate-x-0" : "-translate-x-full"} \${isSidebarCollapsed ? "w-20" : "w-64"}\`}`);

// Need to hide the texts when collapsed
c = c.replace(/settings\.logoUrl && !isSidebarCollapsed \? \(/g, `settings.logoUrl ? (`); // revert old broken attempt if any
c = c.replace(/<span className="font-black text-2xl tracking-tighter bg-gradient-to-r from-primary to-orange-400 bg-clip-text text-transparent drop-shadow-sm">/g,
`<span className={\`font-black text-2xl tracking-tighter bg-gradient-to-r from-primary to-orange-400 bg-clip-text text-transparent drop-shadow-sm \${isSidebarCollapsed ? 'hidden' : 'block'}\`}>`);

// The user info at the bottom needs to hide
c = c.replace(/<div className="flex-1 min-w-0">/, `<div className={\`flex-1 min-w-0 \${isSidebarCollapsed ? 'hidden' : 'block'}\`}>`);

// The menu items:
// Find `<span className="font-medium">{item.name}</span>`
c = c.replace(/<span className="font-medium">\{item\.name\}<\/span>/g, `<span className={\`font-medium \${isSidebarCollapsed ? 'hidden' : 'block'}\`}>{item.name}</span>`);

// The "Ajustes" button
c = c.replace(/<span className="font-medium">Ajustes<\/span>/g, `<span className={\`font-medium \${isSidebarCollapsed ? 'hidden' : 'block'}\`}>Ajustes</span>`);

fs.writeFileSync('components/layout/app-layout.tsx', c, 'utf8');
console.log("Fixed sidebar collapse classes");
