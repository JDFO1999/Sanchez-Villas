const fs = require('fs');
let c = fs.readFileSync('app/login/page.tsx', 'utf8');

// 1. Fix Mojibake
c = c.replace(/CǸdula o contrasea incorrectos/g, 'Cédula o contraseña incorrectos');
c = c.replace(/Por favor ingresa tu cǸdula para enviar el correo de recuperacin\./g, 'Por favor ingresa tu cédula para enviar el correo de recuperación.');
c = c.replace(/Correo de recuperacin enviado simuladamente al usuario con cǸdula/g, 'Correo de recuperación enviado simuladamente al usuario con cédula');
c = c.replace(/CǸdula de Identidad/g, 'Cédula de Identidad');
c = c.replace(/Contrasea/g, 'Contraseña');
c = c.replace(/Olvidaste tu clave\?/g, '¿Olvidaste tu clave?');
c = c.replace(/Iniciar Sesin/g, 'Iniciar Sesión');
c = c.replace(/Eres un nuevo atleta\?/g, '¿Eres un nuevo atleta?');
c = c.replace(/Regstrate aqu/g, 'Regístrate aquí');

// 2. Change button style
c = c.replace(/className="w-full border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground dark:bg-primary dark:text-primary-foreground dark:border-transparent font-bold py-3.5 rounded-xl hover:bg-primary\/90 transition shadow-lg shadow-primary\/20 flex items-center justify-center"/, 
'className="w-full bg-transparent border-2 border-primary text-primary hover:bg-primary/10 font-bold py-3.5 rounded-xl transition flex items-center justify-center"');

// 3. Remove "Credenciales de prueba:" block
const credsStart = c.indexOf('<div className="mt-8 pt-6 border-t border-black/10 dark:border-white/10 w-full text-center text-xs text-muted-foreground">');
if (credsStart !== -1) {
  // Find the end of this div (which is just before the closing </div> of the main glass container)
  const nextDiv = c.indexOf('</div>\n    </div>\n  )\n}', credsStart);
  if (nextDiv !== -1) {
    c = c.substring(0, credsStart) + c.substring(nextDiv);
  }
}

// 4. Move "Registrate aqui" outside the form
const regLinkMatch = c.match(/<div className="mt-4 text-center">[\s\S]*?<\/div>\r?\n\s*<\/form>/);
if (regLinkMatch) {
  const regLink = regLinkMatch[0].replace('</form>', ''); // extract div
  c = c.replace(regLinkMatch[0], '</form>\n        ' + regLink.trim());
}

fs.writeFileSync('app/login/page.tsx', c, 'utf8');
console.log("Login page updated!");
