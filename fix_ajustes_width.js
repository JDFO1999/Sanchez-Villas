const fs = require('fs');
let c = fs.readFileSync('app/ajustes/page.tsx', 'utf8');

c = c.replace(/<div className="space-y-6 max-w-4xl mx-auto">/, '<div className="space-y-6 max-w-7xl mx-auto w-full">');

fs.writeFileSync('app/ajustes/page.tsx', c, 'utf8');
console.log("Updated ajustes width");
