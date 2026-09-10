const fs = require('fs');
let c = fs.readFileSync('app/membresias/page.tsx', 'utf8');

c = c.replace(/clasíName/g, 'className');
c = c.replace(/clas.Name/g, 'className'); // Fix any variation

fs.writeFileSync('app/membresias/page.tsx', c, 'utf8');
console.log("Restored className");
