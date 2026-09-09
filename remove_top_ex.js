const fs = require('fs');
let c = fs.readFileSync('components/dashboards/athlete-dashboard.tsx', 'utf8');

const regex = /const topExercises = \[\s*\{\s*id: 1,\s*name: "Sentadilla libre",\s*data: \[\s*\{ day: "S1", weight: 100 \},\s*\{ day: "S2", weight: 105 \},\s*\{ day: "S3", weight: 110 \},\s*\{ day: "S4", weight: 115 \},\s*\{ day: "S5", weight: 120 \},\s*\]\s*\}\s*\]/;
c = c.replace(regex, "");

c = c.replace(/const currentExercise = topExercises\[selectedPrIndex\]\s*const prData = currentExercise\.data\s*const isImproving = prData\[prData\.length - 1\]\.weight >= prData\[prData\.length - 2\]\.weight\s*const strokeColor = isImproving \? "#22c55e" : "#eab308"/g, "");

fs.writeFileSync('components/dashboards/athlete-dashboard.tsx', c, 'utf8');
console.log('Fixed topExercises');
