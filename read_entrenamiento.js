const fs = require('fs');
const lines = fs.readFileSync('components/dashboards/athlete-dashboard.tsx', 'utf8').split('\n');
let inRoutine = false;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('Entrenamiento de Hoy')) {
    inRoutine = true;
  }
  if (inRoutine) {
    if (lines[i].includes('</CardContent>')) {
       for(let j=i-15; j<=i; j++) console.log(j + ": " + lines[j]);
       break;
    }
  }
}
