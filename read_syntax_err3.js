const fs = require('fs');
const lines = fs.readFileSync('components/dashboards/athlete-dashboard.tsx', 'utf8').split('\n');
for(let i=360; i<395; i++) {
  if (lines[i] !== undefined) console.log(i + ": " + lines[i]);
}
