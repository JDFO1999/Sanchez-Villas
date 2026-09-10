const fs = require('fs');
let c = fs.readFileSync('app/membresias/page.tsx', 'utf8');

c = c.replace(/\{renovarPaymentMethod === 'Tarjeta' \? 'Nº de TransaccióntMethod\}\)`\}/g, 
  "{renovarPaymentMethod === 'Tarjeta' ? 'Nº de Transacción' : `Nº de Referencia (${renovarPaymentMethod})`}");

fs.writeFileSync('app/membresias/page.tsx', c, 'utf8');
console.log("Fixed missing ternary");
