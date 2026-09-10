const fs = require('fs');
let c = fs.readFileSync('app/login/page.tsx', 'utf8');

c = c.replace(/settings\.logoUrl \? \(/, `(settings.logoUrl || settings.logoUrlDark) ? (`);
c = c.replace(/src=\{settings\.logoUrl\}/, `src={(theme === 'dark' && settings.logoUrlDark) ? settings.logoUrlDark : (settings.logoUrl || settings.logoUrlDark)}`);

fs.writeFileSync('app/login/page.tsx', c, 'utf8');
console.log("Updated login");
