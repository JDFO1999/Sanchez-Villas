const fs = require('fs');
const lines = fs.readFileSync('app/tienda/page.tsx', 'utf8').split('\n');
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('<button') || lines[i].includes('className="') && (lines[i].includes('bg-primary') || lines[i].includes('bg-black'))) {
    if(lines[i].includes('<button') || lines[i-1]?.includes('<button') || lines[i-2]?.includes('<button') || lines[i].includes('flex gap-2 flex-wrap'))
      console.log(i + ": " + lines[i].trim());
  }
}
