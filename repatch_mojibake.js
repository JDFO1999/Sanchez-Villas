const fs = require('fs');
let c = fs.readFileSync('app/tienda/page.tsx', 'utf8');

c = c.replace(/CatÃ¡logo/g, 'Catálogo');
c = c.replace(/aquÃ­/g, 'aquí');
c = c.replace(/retÃ­ralos/g, 'retíralos');
c = c.replace(/recepciÃ³n/g, 'recepción');
c = c.replace(/MÃ©todo/g, 'Método');
c = c.replace(/MÃ³vil/g, 'Móvil');

fs.writeFileSync('app/tienda/page.tsx', c, 'utf8');
console.log("Re-patched exact strings");
