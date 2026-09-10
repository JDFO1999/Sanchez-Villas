const fs = require('fs');
const lines = fs.readFileSync('app/tienda/page.tsx', 'utf8').split('\n');
for (let i = 0; i < 60; i++) {
  if (lines[i].includes('Cat') || lines[i].includes('<button')) {
    console.log(i + ": " + lines[i].trim());
  }
}
