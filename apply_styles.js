const fs = require('fs');
let c = fs.readFileSync('components/dashboards/athlete-dashboard.tsx', 'utf8');

// 1. Tienda button to Green
c = c.replace(/className="bg-black text-white dark:bg-secondary dark:text-secondary-foreground px-4 py-2 rounded-md font-medium shadow-sm hover:opacity-80 transition flex items-center gap-2"/, 
'className="bg-green-600 text-white dark:bg-green-600 dark:text-white px-4 py-2 rounded-md font-medium shadow-sm hover:bg-green-700 transition flex items-center gap-2"');

// 2. Ticket button to outline
c = c.replace(/className="bg-black\/10 dark:bg-white\/10 hover:bg-black\/20 dark:hover:bg-white\/20 px-3 py-1\.5 rounded text-xs font-bold flex items-center gap-1 transition"/,
'className="border border-black/20 dark:border-white/20 hover:bg-black/5 dark:hover:bg-white/5 text-foreground px-3 py-1.5 rounded text-xs font-bold flex items-center gap-1 transition"');

// 3. Cancelar button to outline
c = c.replace(/className="bg-red-500\/10 text-red-500 hover:bg-red-500\/20 px-3 py-1\.5 rounded text-xs font-bold transition"/,
'className="border border-red-500 text-red-500 hover:bg-red-500/10 px-3 py-1.5 rounded text-xs font-bold transition"');

// 4. Pagination buttons to outline (both Anterior and Siguiente)
c = c.replace(/className="bg-black\/5 dark:bg-white\/5 hover:bg-black\/10 dark:hover:bg-white\/10 px-4 py-2 rounded-lg text-xs font-bold disabled:opacity-30 transition"/g,
'className="border border-black/20 dark:border-white/20 hover:bg-black/5 dark:hover:bg-white/5 text-foreground px-4 py-2 rounded-lg text-xs font-bold disabled:opacity-30 transition"');

fs.writeFileSync('components/dashboards/athlete-dashboard.tsx', c, 'utf8');
console.log("Replaced");
