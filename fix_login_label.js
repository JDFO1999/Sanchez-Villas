const fs = require('fs');
let c = fs.readFileSync('app/login/page.tsx', 'utf8');

c = c.replace(/Contraseñabel>/g, 'Contraseña</label>');
c = c.replace(/Contraseña<\/label><\/label>/g, 'Contraseña</label>'); // Just in case it gets duplicated
c = c.replace(/Contraseñabel>/g, 'Contraseña</label>'); 
c = c.replace(/Contrase.a<\/label>/g, 'Contraseña</label>');
c = c.replace(/Contraseña<\/label>bel>/g, 'Contraseña</label>');

// Also let me check if there's any other "bel>" just to be absolutely sure
c = c.replace(/bel>/g, '</label>');
c = c.replace(/<\/label><\/label>/g, '</label>');

fs.writeFileSync('app/login/page.tsx', c, 'utf8');
console.log("Fixed label typo in login");
