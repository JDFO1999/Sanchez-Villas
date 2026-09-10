const fs = require('fs');
const lines = fs.readFileSync('app/tienda/page.tsx', 'utf8').split('\n');
console.log("600-620:");
for(let i=600; i<620; i++) console.log(i+": "+lines[i]);
