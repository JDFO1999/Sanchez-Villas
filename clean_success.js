const fs = require('fs');
let c = fs.readFileSync('components/dashboards/athlete-dashboard.tsx', 'utf8');

c = c.replace(/if \(stats\.success\) \{\s*\} else \{\s*console\.error\("DASHBOARD ERROR:", stats\.error\);\s*\}\s*if \(stats\.success\) \{/, 'if (stats.success) {');

fs.writeFileSync('components/dashboards/athlete-dashboard.tsx', c, 'utf8');
