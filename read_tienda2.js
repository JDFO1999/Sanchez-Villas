const fs = require('fs');
const lines = fs.readFileSync('app/tienda/page.tsx', 'utf8').split('\n');
let titleIdx = lines.findIndex(l => l.includes('text-4xl font-black'));
if(titleIdx > -1) {
  for(let i=titleIdx-2; i<=titleIdx+10; i++) console.log(i + ": " + lines[i].trim());
}
