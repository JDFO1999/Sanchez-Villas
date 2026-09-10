const fs = require('fs');
let c = fs.readFileSync('components/layout/app-layout.tsx', 'utf8');

// Change w-0 to w-20 for collapsed sidebar
c = c.replace(/lg:w-0 lg:overflow-hidden lg:border-none/g, 'lg:w-20');

// Find the LogoComponent inside the sidebar header
let lines = c.split('\n');
let modified = false;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('<LogoComponent />') && lines[i-1] && lines[i-1].includes('justify-center px-0')) {
    lines[i] = '            <div className={	ransition-all duration-300 }><LogoComponent /></div>';
    modified = true;
  }
}

if (modified) {
  fs.writeFileSync('components/layout/app-layout.tsx', lines.join('\n'), 'utf8');
  console.log('Sidebar updated');
} else {
  console.log('Could not find LogoComponent to replace');
}
