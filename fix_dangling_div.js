const fs = require('fs');
let c = fs.readFileSync('app/login/page.tsx', 'utf8');

c = c.replace(/C[^\w\s]*dula de Identidad/g, 'Cédula de Identidad');
c = c.replace(/Contrase[^\w\s]*a/g, 'Contraseña');
c = c.replace(/[^\w\s<]*Olvidaste tu clave\?/g, '¿Olvidaste tu clave?');
c = c.replace(/Iniciar Sesi[^\w\s]*n/g, 'Iniciar Sesión');
c = c.replace(/[^\w\s<]*Eres un nuevo atleta\?/g, '¿Eres un nuevo atleta?');
c = c.replace(/Reg[^\w\s]*strate aqu[^\w\s]*/g, 'Regístrate aquí');

// Also fix the extra </div>
c = c.replace(/        <\/div>\r?\n      <\/div>\r?\n    <\/div>\r?\n  \)\r?\n}/, '      </div>\n    </div>\n  )\n}');

fs.writeFileSync('app/login/page.tsx', c, 'utf8');
console.log("Fixed dangling div and remaining mojibake");
