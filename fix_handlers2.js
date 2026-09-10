const fs = require('fs');
let c = fs.readFileSync('app/ajustes/page.tsx', 'utf8');

const replacement = "  const handleFaviconUpload = (e: any) => { const f = e.target.files?.[0]; if(f) { const r = new FileReader(); r.onloadend = () => setFaviconUrl(r.result as string); r.readAsDataURL(f); } }\n  const handleLogoDarkUpload = (e: any) => { const f = e.target.files?.[0]; if(f) { const r = new FileReader(); r.onloadend = () => setLogoUrlDark(r.result as string); r.readAsDataURL(f); } }\n  const handleLogoUpload";

c = c.replace("  const handleLogoUpload", replacement);

fs.writeFileSync('app/ajustes/page.tsx', c, 'utf8');
