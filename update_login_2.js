const fs = require('fs');
let c = fs.readFileSync('app/login/page.tsx', 'utf8');

// 1. Hardcore replacement for the test credentials
const credStart = c.indexOf('<div className="mt-8 pt-6 border-t');
if (credStart !== -1) {
  const credEnd = c.lastIndexOf('</div>\n    </div>\n  )\n}');
  if (credEnd !== -1) {
    c = c.substring(0, credStart) + c.substring(credEnd);
  }
}

// 2. Fix mojibake with unescaped replacements
c = c.replace(/C\S+dula o contrase\S+a incorrectos/, 'Cédula o contraseña incorrectos');
c = c.replace(/Por favor ingresa tu c\S+dula para enviar el correo de recuperaci\S+n\./, 'Por favor ingresa tu cédula para enviar el correo de recuperación.');
c = c.replace(/Correo de recuperaci\S+n enviado simuladamente al usuario con c\S+dula/, 'Correo de recuperación enviado simuladamente al usuario con cédula');
c = c.replace(/C\S+dula de Identidad/, 'Cédula de Identidad');
c = c.replace(/Contrase\S+a/, 'Contraseña');
c = c.replace(/\S+Olvidaste tu clave\?/, '¿Olvidaste tu clave?');
c = c.replace(/Iniciar Sesi\S+n/, 'Iniciar Sesión');
c = c.replace(/\S+Eres un nuevo atleta\?/, '¿Eres un nuevo atleta?');
c = c.replace(/Reg\S+strate aqu\S+/, 'Regístrate aquí');

fs.writeFileSync('app/login/page.tsx', c, 'utf8');
console.log("Login updated part 2!");
