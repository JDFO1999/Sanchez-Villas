const fs = require('fs');
let c = fs.readFileSync('app/ajustes/page.tsx', 'utf8');

c = c.replace(/const \[footerSocialLinks, setFooterSocialLinks\] = useState\(settings\.footerSocialLinks.*?\)/, 
  'const [footerSocialLinks, setFooterSocialLinks] = useState(Array.isArray(settings.footerSocialLinks) ? settings.footerSocialLinks : [])');

c = c.replace(/const \[footerPartners, setFooterPartners\] = useState<string\[\]>\(settings\.footerPartners.*?\)/, 
  'const [footerPartners, setFooterPartners] = useState(Array.isArray(settings.footerPartners) ? settings.footerPartners.map(p => typeof p === "string" ? { id: Math.random().toString(), imageUrl: p, width: 100, height: 40 } : p) : [])');

fs.writeFileSync('app/ajustes/page.tsx', c, 'utf8');
console.log("Fixed state init");
