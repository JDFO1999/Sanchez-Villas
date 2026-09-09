const fs = require('fs');
const content = fs.readFileSync('components/dashboards/athlete-dashboard.tsx', 'utf8');
const lines = content.split('\n');
let inMisCompras = false;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('Mis Compras')) {
    inMisCompras = true;
  }
  if (inMisCompras) {
    if (lines[i].includes('</CardContent>')) {
      for(let j = i - 5; j <= i + 1; j++) {
        console.log(j + ": " + lines[j]);
      }
      break;
    }
  }
}
