const fs = require('fs');
const content = fs.readFileSync('app/atletas/[id]/page.tsx', 'utf8');
const lines = content.split('\n');
for (let i = 400; i < 550; i++) {
  if (lines[i]) console.log(i + ": " + lines[i]);
}
