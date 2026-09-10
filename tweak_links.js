const fs = require('fs');
let c = fs.readFileSync('components/layout/app-layout.tsx', 'utf8');

c = c.replace(/className={\`flex items-center gap-3 px-4 py-3 rounded-lg transition-all/g,
  `className={\`flex items-center \${isSidebarCollapsed ? 'justify-center p-3' : 'gap-3 px-4 py-3'} rounded-lg transition-all`);

c = c.replace(/className="flex items-center gap-3 px-4 py-3 rounded-lg transition-all/g,
  `className={\`flex items-center \${isSidebarCollapsed ? 'justify-center p-3' : 'gap-3 px-4 py-3'} rounded-lg transition-all\``);

fs.writeFileSync('components/layout/app-layout.tsx', c, 'utf8');
console.log("Tweaked link items");
