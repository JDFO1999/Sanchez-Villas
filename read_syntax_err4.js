const fs = require('fs');
const lines = fs.readFileSync('components/dashboards/athlete-dashboard.tsx', 'utf8').split('\n');
for(let i=298; i<305; i++) {
  if (lines[i] !== undefined) console.log(i + ": " + lines[i]);
}
