const fs = require('fs');
let c = fs.readFileSync('app/ajustes/page.tsx', 'utf8');

const newHandlers = `const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setLogoUrl(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleLogoDarkUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setLogoUrlDark(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleFaviconUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setFaviconUrl(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }`;

c = c.replace(/const handleLogoUpload = \(e: React\.ChangeEvent<HTMLInputElement>\) => \{[\s\S]*?reader\.readAsDataURL\(file\)\n\s*\}\n\s*\}/, newHandlers);

fs.writeFileSync('app/ajustes/page.tsx', c, 'utf8');
console.log("Updated upload handlers");
