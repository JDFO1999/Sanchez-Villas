const fs = require('fs');
let c = fs.readFileSync('components/dashboards/athlete-dashboard.tsx', 'utf8');

c = c.replace(/className="text-\[10px\] text-muted-foreground"/g, 'className="text-[10px] text-slate-500 dark:text-slate-400"');
c = c.replace(/className="text-xs text-muted-foreground mb-1"/g, 'className="text-xs text-slate-500 dark:text-slate-400 mb-1"');
c = c.replace(/className="h-5 w-5 text-muted-foreground opacity-50"/g, 'className="h-5 w-5 text-slate-400 dark:text-slate-500"');
c = c.replace(/className="text-xs font-bold leading-tight max-w-\[120px\] truncate"/g, 'className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-tight max-w-[120px] truncate"');

fs.writeFileSync('components/dashboards/athlete-dashboard.tsx', c, 'utf8');
console.log("Replaced");
