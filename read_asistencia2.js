const fs = require('fs');
const content = fs.readFileSync('app/atletas/[id]/page.tsx', 'utf8');
const lines = content.split('\n');
for (let i = 410; i < 435; i++) {
  if (lines[i]) console.log(i + ": " + lines[i]);
}
