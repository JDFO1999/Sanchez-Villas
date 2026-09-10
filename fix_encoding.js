const fs = require('fs');
let c = fs.readFileSync('lib/settings-context.tsx', 'utf8');
c = c.replace(/Gesti\uFFFDn/g, 'Gestión');
c = c.replace(/Gesti\xC3\xB3n/g, 'Gestión');
fs.writeFileSync('lib/settings-context.tsx', c, 'utf8');
console.log("Fixed encoding");
