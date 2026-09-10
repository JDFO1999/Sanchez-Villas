const fs = require('fs');
let c = fs.readFileSync('app/membresias/page.tsx', 'utf8');

c = c.replace(/n.mero de transacci.n/g, 'número de transacción');

fs.writeFileSync('app/membresias/page.tsx', c, 'utf8');
console.log("Fixed swal");
