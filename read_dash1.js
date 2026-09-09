const fs = require('fs');
const content = fs.readFileSync('components/dashboards/athlete-dashboard.tsx', 'utf8');
const lines = content.split('\n');
for (let i = 0; i < 40; i++) console.log(i + ": " + lines[i]);
