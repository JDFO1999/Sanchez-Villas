const fs = require('fs');
let c = fs.readFileSync('app/tienda/page.tsx', 'utf8');

// 1. Pagar Mensualidad Button
c = c.replace(/className="bg-secondary text-secondary-foreground font-bold py-2 px-4 rounded-xl flex items-center gap-2 hover:bg-secondary\/90 transition shadow-lg"/g,
'className="bg-transparent border-2 border-green-500 text-green-600 dark:text-green-500 font-bold py-2 px-4 rounded-xl flex items-center gap-2 hover:bg-green-50 dark:hover:bg-green-500/10 transition shadow-sm"');

// 2. Product Image Container Backgrounds
c = c.replace(/bg-white\/\[0\.02\] group-hover:bg-white\/\[0\.04\]/g, 'bg-slate-100 dark:bg-white/[0.02] group-hover:bg-slate-200 dark:group-hover:bg-white/[0.04]');

// 3. Fallback ShoppingCart Icons
c = c.replace(/className="h-12 w-12 text-black\/10 dark:text-white\/5"/g, 'className="h-12 w-12 text-slate-300 dark:text-slate-800"');
c = c.replace(/className="h-12 w-12 text-white\/5"/g, 'className="h-12 w-12 text-slate-300 dark:text-slate-800"');

fs.writeFileSync('app/tienda/page.tsx', c, 'utf8');
console.log("Patched tienda Mensualidad and icons");
