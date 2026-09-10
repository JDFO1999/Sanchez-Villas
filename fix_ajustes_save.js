const fs = require('fs');
let c = fs.readFileSync('app/ajustes/page.tsx', 'utf8');

c = c.replace(/logoUrl,\n\s*logoSettings,/, `logoUrl,\n          logoUrlDark,\n          faviconUrl,\n          logoSettings,`);

fs.writeFileSync('app/ajustes/page.tsx', c, 'utf8');
console.log("Fixed handleSave to include logoUrlDark and faviconUrl");
