const fs = require('fs');
const lines = fs.readFileSync('components/dashboards/athlete-dashboard.tsx', 'utf8').split('\n');
let inMisCompras = false;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('Mis Compras y Facturas')) {
    inMisCompras = true;
  }
  if (inMisCompras) {
    if(lines[i].includes('text-muted-foreground') || lines[i].includes('text-foreground')) {
      console.log(i + ": " + lines[i].trim());
    }
    if (lines[i].includes('</CardContent>')) break;
  }
}
