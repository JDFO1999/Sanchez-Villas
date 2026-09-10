const fs = require('fs');
let c = fs.readFileSync('components/layout/app-layout.tsx', 'utf8');

c = c.replace(/<div className={`flex flex-col h-full transition-opacity duration-300 ease-in-out \$\{isSidebarCollapsed \? 'lg:opacity-0 delay-0' : 'lg:opacity-100 delay-200'\}`}/g, '<div className={`flex flex-col h-full overflow-hidden whitespace-nowrap`}');

c = c.replace(/\{item\.name\}/g, '<span className={`transition-all duration-300 ${isSidebarCollapsed ? "opacity-0 w-0 hidden" : "opacity-100 w-auto"}`}>{item.name}</span>');

c = c.replace(/<span className="text-sm text-muted-foreground font-medium">Tema<\/span>/g, '<span className={`text-sm text-muted-foreground font-medium transition-all duration-300 ${isSidebarCollapsed ? "opacity-0 w-0 hidden" : "opacity-100 w-auto"}`}>Tema</span>');

c = c.replace(/Cerrar Sesión/g, '<span className={`transition-all duration-300 ${isSidebarCollapsed ? "opacity-0 w-0 hidden" : "opacity-100 w-auto"}`}>Cerrar Sesión</span>');

fs.writeFileSync('components/layout/app-layout.tsx', c, 'utf8');
console.log("Fixed sidebar animation");
