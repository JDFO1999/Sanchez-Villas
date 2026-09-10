const fs = require('fs');
let c = fs.readFileSync('app/login/page.tsx', 'utf8');

c = c.replace(/Iniciar Sesi\uFFFDn/g, 'Iniciar Sesión');
c = c.replace(/\uFFFDEres un nuevo atleta\?/g, '¿Eres un nuevo atleta?');
c = c.replace(/Reg\uFFFDstrate aqu\uFFFD/g, 'Regístrate aquí');
c = c.replace(/text-sm \uFFFDEres un nuevo atleta\? <\/span>/g, 'text-muted-foreground">¿Eres un nuevo atleta? </span>');
c = c.replace(/<span className="text-sm ¿Eres un nuevo atleta\? <\/span>/g, '<span className="text-sm text-muted-foreground">¿Eres un nuevo atleta? </span>');

fs.writeFileSync('app/login/page.tsx', c, 'utf8');
console.log("Fixed mojibake explicitly");
