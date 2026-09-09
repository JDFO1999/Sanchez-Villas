const fs = require('fs');

let rec = fs.readFileSync('components/dashboards/reception-dashboard.tsx', 'utf8');
rec = rec.replace(/res\.session\.expectedCash/g, 'res.session?.expectedCash');
fs.writeFileSync('components/dashboards/reception-dashboard.tsx', rec, 'utf8');
console.log('Fixed reception-dashboard');
