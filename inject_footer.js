const fs = require('fs');
const lines = fs.readFileSync('components/layout/app-layout.tsx', 'utf8').split('\n');

let idx = lines.findIndex(l => l.includes('</main>'));
if (idx > -1) {
  lines.splice(idx, 0, '          <Footer />');
  fs.writeFileSync('components/layout/app-layout.tsx', lines.join('\n'), 'utf8');
  console.log("Injected Footer at bottom of main!");
}
