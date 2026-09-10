const fs = require('fs');
const lines = fs.readFileSync('app/tienda/page.tsx', 'utf8').split('\n');
for(let i=0; i<30; i++) console.log(i+": "+lines[i]);
