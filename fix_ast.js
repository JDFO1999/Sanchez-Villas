const fs = require('fs');
let c = fs.readFileSync('components/layout/app-layout.tsx', 'utf8');

c = c.replace(/<span className=\{\	ransition-all duration-300 \\\$\\{isSidebarCollapsed \? \opacity-0 w-0 hidden\ : \opacity-100 w-auto\\\}\\}>\{item\.name\}<\/span>/g, '<span className={	ransition-all duration-300 }>{item.name}</span>');

fs.writeFileSync('components/layout/app-layout.tsx', c, 'utf8');
