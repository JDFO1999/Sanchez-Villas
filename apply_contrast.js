const fs = require('fs');
let c = fs.readFileSync('components/dashboards/athlete-dashboard.tsx', 'utf8');

// 1. Fix Pagination Buttons
c = c.replace(/className="border border-black\/20 dark:border-white\/20 hover:bg-black\/5 dark:hover:bg-white\/5 text-foreground px-4 py-2 rounded-lg text-xs font-bold disabled:opacity-30 transition"/g,
'className="bg-transparent border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 px-4 py-2 rounded-lg text-xs font-bold disabled:opacity-30 transition shadow-sm"');

// 2. Fix Ticket Button
c = c.replace(/className="border border-black\/20 dark:border-white\/20 hover:bg-black\/5 dark:hover:bg-white\/5 text-foreground px-3 py-1\.5 rounded text-xs font-bold flex items-center gap-1 transition"/g,
'className="bg-transparent border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 px-3 py-1.5 rounded text-xs font-bold flex items-center gap-1 transition shadow-sm"');

// 3. Fix Cancel Button
c = c.replace(/className="border border-red-500 text-red-500 hover:bg-red-500\/10 px-3 py-1\.5 rounded text-xs font-bold transition"/g,
'className="bg-transparent border border-red-500 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 px-3 py-1.5 rounded text-xs font-bold transition shadow-sm"');

// 4. Outer Card Contrast
c = c.replace(/className="mt-6 border-primary\/20 bg-primary\/5"/,
'className="mt-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm rounded-xl"');

// 5. Inner Purchase Card Contrast
c = c.replace(/className="bg-card p-3 rounded-lg border border-black\/10 dark:border-white\/10/g,
'className="bg-slate-50 dark:bg-slate-950 p-3 rounded-lg border border-slate-200 dark:border-slate-800');

// 6. Fix muted text
c = c.replace(/className="text-xs text-muted-foreground"/g, 'className="text-xs text-slate-500 dark:text-slate-400"');
c = c.replace(/className="text-sm text-muted-foreground"/g, 'className="text-sm text-slate-500 dark:text-slate-400"');
c = c.replace(/className="text-xs text-muted-foreground font-medium"/g, 'className="text-xs text-slate-500 dark:text-slate-400 font-medium"');

// 7. General text contrast
c = c.replace(/<span className="font-bold text-xs truncate max-w-\[120px\]">/g, '<span className="font-bold text-xs text-slate-900 dark:text-slate-100 truncate max-w-[120px]">');

fs.writeFileSync('components/dashboards/athlete-dashboard.tsx', c, 'utf8');
console.log("Replaced");
