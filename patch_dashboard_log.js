const fs = require('fs');

let c = fs.readFileSync('components/dashboards/athlete-dashboard.tsx', 'utf8');

c = c.replace(/setPurchases\(stats\.purchases \|\| \[\]\);/, "console.log('API returned purchases:', stats.purchases);\n              setPurchases(stats.purchases || []);");

fs.writeFileSync('components/dashboards/athlete-dashboard.tsx', c, 'utf8');
console.log('Added console.log for purchases');
