const fs = require('fs');
let c = fs.readFileSync('components/layout/app-layout.tsx', 'utf8');

c = c.replace(/opacity-0 w-0 hidden/g, 'opacity-0 w-0 overflow-hidden');

fs.writeFileSync('components/layout/app-layout.tsx', c, 'utf8');
console.log('Fixed hidden class for smoother animation');
