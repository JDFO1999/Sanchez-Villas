const fs = require('fs');
const content = fs.readFileSync('app/atletas/[id]/page.tsx', 'utf8');
console.log("LENGTH: " + content.length);
const lines = content.split('\n');
for (let i = 0; i < 200; i++) {
  if (lines[i]) console.log(i + ": " + lines[i]);
}
