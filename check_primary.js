const fs = require('fs');
const lines = fs.readFileSync('app/tienda/page.tsx', 'utf8').split('\n');
for(let i=0; i<lines.length; i++) {
  if (lines[i].includes('bg-primary') && lines[i].includes('button')) {
    console.log(i + ": " + lines[i].trim());
  }
}
