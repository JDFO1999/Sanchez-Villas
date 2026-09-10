const fs = require('fs');
let c = fs.readFileSync('app/ajustes/page.tsx', 'utf8');

c = c.replace(/\}\}\s*\/>/g, '} } />');

fs.writeFileSync('app/ajustes/page.tsx', c, 'utf8');
console.log("Fixed JSX closing tag");
