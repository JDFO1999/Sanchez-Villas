const fs = require('fs');
let c = fs.readFileSync('app/tienda/page.tsx', 'utf8');

c = c.replace(/className="px-4 py-2 text-sm rounded border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground dark:bg-primary dark:text-primary-foreground dark:border-transparent font-bold hover:bg-primary\/90"/g,
'className="px-4 py-2 text-sm rounded-xl bg-transparent border-2 border-green-500 text-green-600 dark:text-green-500 font-bold hover:bg-green-50 dark:hover:bg-green-500/10 transition"');

fs.writeFileSync('app/tienda/page.tsx', c, 'utf8');
