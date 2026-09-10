const fs = require('fs');
let c = fs.readFileSync('app/atletas/[id]/page.tsx', 'utf8');

c = c.replace(/className="bg-secondary text-foreground px-4 py-2 rounded-lg font-medium hover:bg-black\/10 dark:bg-white\/10 border border-black\/10 dark:border-white\/10 transition"/g,
'className="bg-transparent border-2 border-primary text-primary px-4 py-2 rounded-lg font-bold shadow-sm hover:bg-primary/10 transition"');

fs.writeFileSync('app/atletas/[id]/page.tsx', c, 'utf8');
console.log("Updated app/atletas/[id]/page.tsx");
