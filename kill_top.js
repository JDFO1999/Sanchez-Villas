const fs = require('fs');
let c = fs.readFileSync('components/dashboards/athlete-dashboard.tsx', 'utf8');

c = c.replace(/const topExercises = \[[\s\S]*?\]/, "");

fs.writeFileSync('components/dashboards/athlete-dashboard.tsx', c, 'utf8');
