const fs = require('fs');
let c = fs.readFileSync('components/layout/app-layout.tsx', 'utf8');

c = c.replace(/lg:translate-x-0 \$\{isSidebarCollapsed \? "w-0 overflow-hidden border-none" : "w-64 lg:static"\}/,
`lg:translate-x-0 \${isSidebarCollapsed ? "lg:w-0 lg:overflow-hidden lg:border-none" : "w-64 lg:static"}`);

// To avoid breaking mobile entirely, make sure mobile is always w-64
// We can just add w-64 as a base class. 
// "w-64 lg:static" is there for false. If true, it is "lg:w-0 lg:overflow-hidden lg:border-none". But wait, if true, it lacks w-64 for mobile!
// Let's rewrite it cleanly.
c = c.replace(/lg:translate-x-0 \$\{isSidebarCollapsed \? "lg:w-0 lg:overflow-hidden lg:border-none" : "w-64 lg:static"\}/,
`w-64 \${isSidebarCollapsed ? "lg:w-0 lg:overflow-hidden lg:border-none" : "lg:static"} lg:translate-x-0`);

fs.writeFileSync('components/layout/app-layout.tsx', c, 'utf8');
console.log("Fixed mobile sidebar bug");
