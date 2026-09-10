const fs = require('fs');
let c = fs.readFileSync('app/login/page.tsx', 'utf8');

c = c.replace(/Iniciar Sesi.n/g, 'Iniciar Sesión');
c = c.replace(/.Eres un nuevo atleta\?/g, '¿Eres un nuevo atleta?');
c = c.replace(/Reg.strate aqu./g, 'Regístrate aquí');

fs.writeFileSync('app/login/page.tsx', c, 'utf8');
console.log("Fixed mojibake explicitly with dot");
