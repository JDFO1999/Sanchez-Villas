const fs = require('fs');
let c = fs.readFileSync('components/layout/app-layout.tsx', 'utf8');

c = c.replace(/<div className="flex items-center justify-between h-16 px-6 border-b">/, 
  `<div className={\`flex items-center h-16 border-b \${isSidebarCollapsed ? 'justify-center px-0' : 'justify-between px-6'}\`}>`);

c = c.replace(/<div className="p-4 border-t flex items-center gap-3">/,
  `<div className={\`p-4 border-t flex items-center \${isSidebarCollapsed ? 'justify-center' : 'gap-3'}\`}>`);

c = c.replace(/<span className="font-black text-2xl tracking-tighter bg-gradient-to-r from-primary via-black to-primary\/50 bg-clip-text text-transparent drop-shadow-sm">/g, 
  `<span className={\`font-black text-2xl tracking-tighter bg-gradient-to-r from-primary to-orange-400 bg-clip-text text-transparent drop-shadow-sm \${isSidebarCollapsed ? 'hidden' : 'block'}\`}>`);

fs.writeFileSync('components/layout/app-layout.tsx', c, 'utf8');
console.log("Tweaked collapsed paddings");
