const fs = require('fs');
let c = fs.readFileSync('app/ajustes/page.tsx', 'utf8');

const lines = c.split("\n");
let start = -1;
let end = -1;

for (let i=0; i<lines.length; i++) {
  if (lines[i].includes("{/* Logo Upload */}")) start = i;
  if (lines[i].includes("{/* Colors */}")) end = i;
}
console.log(`Start: ${start}, End: ${end}`);
