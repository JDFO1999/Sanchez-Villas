const fs = require('fs');
let c = fs.readFileSync('components/layout/app-layout.tsx', 'utf8');

c = c.replace(/key=<span className={`transition-all duration-300 \$\{isSidebarCollapsed \? "opacity-0 w-0 hidden" : "opacity-100 w-auto"\}`}>{item\.name}<\/span>/g, 'key={item.name}');

fs.writeFileSync('components/layout/app-layout.tsx', c, 'utf8');
console.log("Fixed key issue");
