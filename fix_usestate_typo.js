const fs = require('fs');
let c = fs.readFileSync('app/ajustes/page.tsx', 'utf8');

c = c.replace(/const \[logoUrl,\s*logoUrlDark,\s*faviconUrl,\s*setLogoUrl\]/, "const [logoUrl, setLogoUrl]");

fs.writeFileSync('app/ajustes/page.tsx', c, 'utf8');
console.log("Fixed useState typo");
