const fs = require('fs');
const lines = fs.readFileSync('components/dashboards/athlete-dashboard.tsx', 'utf8').split('\n');
let inMisCompras = false;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('{purchases.slice((currentPage')) {
    inMisCompras = true;
  }
  if (inMisCompras) {
    console.log(i + ": " + lines[i].trim());
    if (lines[i].includes('))}')) break;
  }
}
