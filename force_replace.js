const fs = require('fs');
let c = fs.readFileSync('app/ajustes/page.tsx', 'utf8');

let idx = c.indexOf("updateSettings({");
let idx2 = c.indexOf("logoUrl,", idx);

c = c.substring(0, idx2) + "logoUrl,\n          logoUrlDark,\n          faviconUrl," + c.substring(idx2 + "logoUrl,".length);

fs.writeFileSync('app/ajustes/page.tsx', c, 'utf8');
console.log("Forced replacement!");
