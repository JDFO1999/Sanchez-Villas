const fs = require('fs');
let c = fs.readFileSync('app/ajustes/page.tsx', 'utf8');

c = c.replace("logoUrl,", "logoUrl,\n          logoUrlDark,\n          faviconUrl,");

fs.writeFileSync('app/ajustes/page.tsx', c, 'utf8');
console.log("Replaced");
