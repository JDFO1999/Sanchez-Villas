const fs = require('fs');
let c = fs.readFileSync('components/dashboards/athlete-dashboard.tsx', 'utf8');

c = c.replace(/Mis Compras y Facturas \(Debug: \{purchases\.length\} items\)/, 'Mis Compras y Facturas');

fs.writeFileSync('components/dashboards/athlete-dashboard.tsx', c, 'utf8');
