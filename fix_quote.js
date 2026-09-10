const fs = require('fs');
let c = fs.readFileSync('app/login/page.tsx', 'utf8');

c = c.replace(/className="text-sm text-muted-foreground[^\w\s<]*Eres un nuevo atleta\? <\/span>/g, 'className="text-sm text-muted-foreground">¿Eres un nuevo atleta? </span>');

fs.writeFileSync('app/login/page.tsx', c, 'utf8');
console.log("Fixed missing quote in className");
