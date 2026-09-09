const fs = require('fs');
const content = fs.readFileSync('app/atletas/[id]/page.tsx', 'utf8');
const lines = content.split('\n');
for (let i = 0; i < lines.length; i++) {
  if (lines[i].toLowerCase().includes('factura') || lines[i].toLowerCase().includes('compra')) {
    console.log(i + ": " + lines[i].trim());
  }
}
