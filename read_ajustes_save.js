const fs = require('fs');
const lines = fs.readFileSync('app/ajustes/page.tsx', 'utf8').split('\n');
const handleSaveStart = lines.findIndex(l => l.includes('const handleSave = () =>'));
for(let i=handleSaveStart; i<=handleSaveStart+20; i++) {
  console.log(i + ": " + lines[i]);
}
