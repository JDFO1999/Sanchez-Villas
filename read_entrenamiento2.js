const fs = require('fs');
const lines = fs.readFileSync('components/dashboards/athlete-dashboard.tsx', 'utf8').split('\n');
let inRoutine = false;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('No tienes rutina asignada para hoy.')) {
    inRoutine = true;
  }
  if (inRoutine) {
    console.log(i + ": " + lines[i]);
    if (lines[i].includes('Ir a la Rutina Completa')) break;
  }
}
