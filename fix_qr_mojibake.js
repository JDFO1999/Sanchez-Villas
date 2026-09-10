const fs = require('fs');
let c = fs.readFileSync('components/dashboards/athlete-dashboard.tsx', 'utf8');

c = c.replace(/cÃ³digo/g, 'código');
c = c.replace(/recepciÃ³n/g, 'recepción');
// There might be some other ones like cǟdigo
c = c.replace(/c[^\w\s]*digo/g, 'código');
c = c.replace(/recepci[^\w\s]*n/g, 'recepción');

fs.writeFileSync('components/dashboards/athlete-dashboard.tsx', c, 'utf8');
console.log("Fixed mojibake in athlete-dashboard");
