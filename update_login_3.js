const fs = require('fs');
let lines = fs.readFileSync('app/login/page.tsx', 'utf8').split('\r\n');
if (lines.length === 1) lines = lines[0].split('\n');

let start = lines.findIndex(l => l.includes('Credenciales de prueba:'));
if (start !== -1) {
  // Go back to the <div className="mt-8 pt-6...">
  while(start > 0 && !lines[start].includes('<div className="mt-8')) {
    start--;
  }
  
  // Find the end </div> before the final two divs
  let end = lines.length - 1;
  while(end > start && !lines[end].includes('</div>')) {
    end--;
  }
  // Let's just delete from start to end-3
  lines.splice(start, (end - 2) - start);
}

// And fix mojibake safely by replacing all instances of strange chars
let content = lines.join('\n');
content = content.replace(/C[^\w\s]+dula o contrase[^\w\s]+a incorrectos/g, 'Cédula o contraseña incorrectos');
content = content.replace(/c[^\w\s]+dula para enviar el correo de recuperaci[^\w\s]+n\./g, 'cédula para enviar el correo de recuperación.');
content = content.replace(/Correo de recuperaci[^\w\s]+n enviado simuladamente al usuario con c[^\w\s]+dula/g, 'Correo de recuperación enviado simuladamente al usuario con cédula');
content = content.replace(/C[^\w\s]+dula de Identidad/g, 'Cédula de Identidad');
content = content.replace(/Contrase[^\w\s]+a/g, 'Contraseña');
content = content.replace(/[^\w\s<]+Olvidaste tu clave\?/g, '¿Olvidaste tu clave?');
content = content.replace(/Iniciar Sesi[^\w\s]+n/g, 'Iniciar Sesión');
content = content.replace(/[^\w\s<]+Eres un nuevo atleta\?/g, '¿Eres un nuevo atleta?');
content = content.replace(/Reg[^\w\s]+strate aqu[^\w\s]+/g, 'Regístrate aquí');

fs.writeFileSync('app/login/page.tsx', content, 'utf8');
console.log("Deleted creds and fixed mojibake");
