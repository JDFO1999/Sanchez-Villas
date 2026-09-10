const fs = require('fs');

function fixButtons(path) {
  let c = fs.readFileSync(path, 'utf8');
  c = c.replace(/className="([^"]*)bg-green-500 text-white([^"]*hover:bg-green-600[^"]*)"/g, (match, p1, p2) => {
    return `className="${p1}bg-transparent border-2 border-green-500 text-green-500${p2.replace('hover:bg-green-600', 'hover:bg-green-500/10')}"`;
  });
  c = c.replace(/className="([^"]*)bg-primary text-primary-foreground([^"]*hover:bg-primary\/90[^"]*)"/g, (match, p1, p2) => {
    return `className="${p1}bg-transparent border-2 border-primary text-primary${p2.replace('hover:bg-primary/90', 'hover:bg-primary/10')}"`;
  });
  fs.writeFileSync(path, c, 'utf8');
}

fixButtons('app/finanzas/page.tsx');
fixButtons('app/empleados/page.tsx');

console.log("Fixed remaining buttons");
