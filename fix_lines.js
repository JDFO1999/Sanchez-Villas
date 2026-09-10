const fs = require('fs');
let c = fs.readFileSync('components/layout/app-layout.tsx', 'utf8');

let lines = c.split('\n');
let modified = false;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('transition-all duration-300') && lines[i].includes('isSidebarCollapsed') && lines[i].includes('{item.name}')) {
    lines[i] = '                  <span className={	ransition-all duration-300 }>{item.name}</span>';
    modified = true;
  }
}
if (modified) {
  fs.writeFileSync('components/layout/app-layout.tsx', lines.join('\n'), 'utf8');
  console.log('Fixed lines');
} else {
  console.log('No lines found to fix');
}
