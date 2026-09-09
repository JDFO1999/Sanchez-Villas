const fs = require('fs');
const content = fs.readFileSync('components/dashboards/athlete-dashboard.tsx', 'utf8');
const lines = content.split('\n');
let inMisCompras = false;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('Mis Compras')) {
    inMisCompras = true;
  }
  if (inMisCompras) {
    console.log(i + ": " + lines[i].trim());
    if (lines[i].includes('</CardContent>')) break;
  }
}
