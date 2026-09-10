const fs = require('fs');
const lines = fs.readFileSync('app/ajustes/page.tsx', 'utf8').split('\n');
let i = lines.findIndex(l => l.includes('Guardar Cambios'));
if (i > -1) {
  for(let j=i-15; j<=i+5; j++) console.log(j + ": " + lines[j]);
}
