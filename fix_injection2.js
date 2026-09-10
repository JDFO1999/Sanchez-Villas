const fs = require('fs');
let c = fs.readFileSync('components/layout/app-layout.tsx', 'utf8');

c = c.replace(/className=\{[\s\t]*ransition-all duration-300 \$\{isSidebarCollapsed \? "opacity-0 w-0 overflow-hidden" : "opacity-100"\}\}/g, 'className={`transition-all duration-300 ${isSidebarCollapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100"}`}');

fs.writeFileSync('components/layout/app-layout.tsx', c, 'utf8');
console.log("Fixed the powershell injection 2");
