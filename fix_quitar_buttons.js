const fs = require('fs');
let c = fs.readFileSync('app/ajustes/page.tsx', 'utf8');

c = c.replace(/className="mt-2 text-xs text-red-500 hover:underline">Quitar<\/button>/g, 'className="mt-2 text-xs text-red-500 hover:underline relative z-10">Quitar</button>');

fs.writeFileSync('app/ajustes/page.tsx', c, 'utf8');
console.log("Fixed Quitar buttons z-index");
