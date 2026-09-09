const fs = require('fs');

let c = fs.readFileSync('app/tienda/page.tsx', 'utf8');

c = c.replace(/router\.push\('\/'\); \/\/ Navigate to dashboard\s*router\.refresh\(\);/g, "window.location.href = '/';");

fs.writeFileSync('app/tienda/page.tsx', c, 'utf8');
console.log('Fixed router push');
