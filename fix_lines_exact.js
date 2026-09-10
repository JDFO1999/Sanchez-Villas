const fs = require('fs');
let lines = fs.readFileSync('components/layout/app-layout.tsx', 'utf8').split('\n');
let modified = false;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('LogoComponent') && lines[i].includes('ransition-all')) {
    lines[i] = '            <div className={`transition-all duration-300 ${isSidebarCollapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100"}`}><LogoComponent /></div>';
    modified = true;
  }
}
if (modified) {
  fs.writeFileSync('components/layout/app-layout.tsx', lines.join('\n'), 'utf8');
  console.log('Fixed line');
} else {
  console.log('Line not found');
}
