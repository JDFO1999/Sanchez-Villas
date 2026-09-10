const fs = require('fs');
let c = fs.readFileSync('app/tienda/page.tsx', 'utf8');
if (c.includes('Catálogo')) console.log('Fixed Catálogo');
if (c.includes('aquí')) console.log('Fixed aquí');
if (c.includes('retíralos')) console.log('Fixed retíralos');
if (c.includes('recepción')) console.log('Fixed recepción');
if (c.includes('Método')) console.log('Fixed Método');
if (c.includes('Móvil')) console.log('Fixed Móvil');
