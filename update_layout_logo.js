const fs = require('fs');
let c = fs.readFileSync('components/layout/app-layout.tsx', 'utf8');

c = c.replace(/settings\.logoUrl \? \(/, `(settings.logoUrl || settings.logoUrlDark) ? (`);
c = c.replace(/src=\{settings\.logoUrl\}/, `src={(theme === 'dark' && settings.logoUrlDark) ? settings.logoUrlDark : (settings.logoUrl || settings.logoUrlDark)}`);

fs.writeFileSync('components/layout/app-layout.tsx', c, 'utf8');
console.log("Updated app-layout");
