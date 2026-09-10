const fs = require('fs');
let c = fs.readFileSync('components/layout/app-layout.tsx', 'utf8');

c = c.replace(/<div className=\{\!isSidebarCollapsed \? "lg:hidden" : ""\}>\s*<LogoComponent \/>\s*<\/div>/, '<div className="lg:hidden">\n                <LogoComponent />\n              </div>');

fs.writeFileSync('components/layout/app-layout.tsx', c, 'utf8');
console.log("Updated logo display");
