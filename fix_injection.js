const fs = require('fs');
let c = fs.readFileSync('components/layout/app-layout.tsx', 'utf8');

c = c.replace(/className=\{    ransition-all duration-300/g, 'className={`transition-all duration-300');
c = c.replace(/"opacity-100"\}\}/g, '"opacity-100"}`}');

fs.writeFileSync('components/layout/app-layout.tsx', c, 'utf8');
console.log("Fixed the powershell injection");
