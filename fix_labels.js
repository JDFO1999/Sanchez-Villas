const fs = require('fs');
let c = fs.readFileSync('app/login/page.tsx', 'utf8');

c = c.replace(/<\/la<\/label>/g, '</label>');
c = c.replace(/C[^\w\s]*dula de Identidad/g, 'Cédula de Identidad');
c = c.replace(/C[^\w\s]*dula o contrase[^\w\s]*a incorrectos/g, 'Cédula o contraseña incorrectos');

fs.writeFileSync('app/login/page.tsx', c, 'utf8');
console.log("Fixed label mess");
