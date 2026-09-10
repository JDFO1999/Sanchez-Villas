const fs = require('fs');
let c = fs.readFileSync('app/ajustes/page.tsx', 'utf8');

const replacement =   const handleFaviconUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => setFaviconUrl(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  const handleLogoDarkUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => setLogoUrlDark(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  const handleLogoUpload;

c = c.replace('  const handleLogoUpload', replacement);

fs.writeFileSync('app/ajustes/page.tsx', c, 'utf8');
console.log('Added handlers');
