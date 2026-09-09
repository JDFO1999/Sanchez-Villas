const fs = require('fs');
let c = fs.readFileSync('components/dashboards/athlete-dashboard.tsx', 'utf8');

// 1. Remove dangling topExercises and variables
c = c.replace(/const topExercises = \[[\s\S]*?\]\n\s*\}\n\s*\]/g, "");
c = c.replace(/const currentExercise = topExercises\[selectedPrIndex\][\s\S]*?const strokeColor = isImproving \? "#22c55e" : "#eab308"/g, "");

// 2. Fix spelling
c = c.replace(/Carga Mǭxima/g, "Carga Máxima");
c = c.replace(/Mǭxima/g, "Máxima"); // Just in case

fs.writeFileSync('components/dashboards/athlete-dashboard.tsx', c, 'utf8');
console.log('Removed dangling code and fixed spelling');
