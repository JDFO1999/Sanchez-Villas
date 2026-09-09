const fs = require('fs');
let c = fs.readFileSync('components/dashboards/athlete-dashboard.tsx', 'utf8');

// Revert Outer Card to standard clean look (no weird backgrounds)
c = c.replace(/className="mt-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm rounded-xl"/,
'className="mt-6 border-black/10 dark:border-white/10 shadow-sm"');

// Change Inner Items to flat list (no background, just a bottom border)
c = c.replace(/className="bg-slate-50 dark:bg-slate-950 p-3 rounded-lg border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row gap-3 justify-between"/g,
'className="bg-transparent py-4 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row gap-4 justify-between last:border-0"');

// Restore some breathing room to the text sizes (make it look elegant)
c = c.replace(/<span className="font-bold text-xs text-slate-900 dark:text-slate-100 truncate max-w-\[120px\]">/g,
'<span className="font-bold text-sm text-slate-900 dark:text-slate-100">');

// For the product items inside the purchase (remove background there too, keep it clean)
c = c.replace(/className="flex items-center gap-2 bg-secondary\/30 p-2 rounded-lg border border-black\/5 dark:border-white\/5"/g,
'className="flex items-center gap-3 py-1"');
c = c.replace(/className="h-8 w-8 object-contain rounded bg-black\/5 dark:bg-white\/5 p-1"/g,
'className="h-10 w-10 object-contain rounded-md bg-transparent"');
c = c.replace(/className="h-8 w-8 bg-black\/5 dark:bg-white\/5 rounded flex items-center justify-center"/g,
'className="h-10 w-10 bg-transparent flex items-center justify-center"');

fs.writeFileSync('components/dashboards/athlete-dashboard.tsx', c, 'utf8');
console.log("Done");
