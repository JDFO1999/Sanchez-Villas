const fs = require('fs');
let c = fs.readFileSync('components/dashboards/athlete-dashboard.tsx', 'utf8');

c = c.replace(/\/\/ Show it on screen so we can see what's wrong![\s\S]*?if \(stats\.error\) alert\("Error fetching dashboard: " \+ stats\.error\);/, '');

fs.writeFileSync('components/dashboards/athlete-dashboard.tsx', c, 'utf8');
