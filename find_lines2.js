const fs = require('fs');
let c = fs.readFileSync('app/ajustes/page.tsx', 'utf8');

const lines = c.split("\n");
let start = 190;
let end = start + 115; // Just guess

for (let i = start; i < end; i++) {
  console.log(`${i}: ${lines[i]}`);
}
