const fs = require('fs');
let c = fs.readFileSync('app/ajustes/page.tsx', 'utf8');

c = c.replace(/const \[logoUrl, setLogoUrl\] = useState\(settings\.logoUrl \|\| ""\)/, `const [logoUrl, setLogoUrl] = useState(settings.logoUrl || "")
  const [logoUrlDark, setLogoUrlDark] = useState(settings.logoUrlDark || "")
  const [faviconUrl, setFaviconUrl] = useState(settings.faviconUrl || "")`);

c = c.replace(/logoUrl,\s*primaryColor,/, `logoUrl,\n        logoUrlDark,\n        faviconUrl,\n        primaryColor,`);

fs.writeFileSync('app/ajustes/page.tsx', c, 'utf8');
console.log("Updated state declarations");
