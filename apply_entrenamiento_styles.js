const fs = require('fs');
let c = fs.readFileSync('components/dashboards/athlete-dashboard.tsx', 'utf8');

// 1. Top Tienda button -> outline green
c = c.replace(/className="bg-green-600 text-white dark:bg-green-600 dark:text-white px-4 py-2 rounded-md font-medium shadow-sm hover:bg-green-700 transition flex items-center gap-2"/g,
'className="bg-transparent border border-green-500 text-green-600 dark:text-green-500 px-4 py-2 rounded-md font-bold shadow-sm hover:bg-green-50 dark:hover:bg-green-500/10 transition flex items-center gap-2"');

// 2. Top Rutina button -> outline green
c = c.replace(/className="bg-primary text-primary-foreground font-black px-4 py-2 rounded-md shadow-sm hover:opacity-90 transition flex items-center gap-2 drop-shadow-md"/g,
'className="bg-transparent border border-green-500 text-green-600 dark:text-green-500 px-4 py-2 rounded-md font-bold shadow-sm hover:bg-green-50 dark:hover:bg-green-500/10 transition flex items-center gap-2"');

// 3. Card inner "Ir a la Rutina Completa" button -> outline green
c = c.replace(/className="w-full py-2 bg-primary\/20 text-primary font-bold rounded-lg hover:bg-primary\/30 transition text-sm"/g,
'className="w-full py-2 bg-transparent border border-green-500 text-green-600 dark:text-green-500 font-bold rounded-lg hover:bg-green-50 dark:hover:bg-green-500/10 transition text-sm"');

// 4. "Entrenamiento de hoy" Empty state background -> clean flat design
c = c.replace(/className="p-4 rounded-lg bg-secondary\/50 border text-center text-muted-foreground"/g,
'className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-center text-slate-500 dark:text-slate-400"');

// 5. "Entrenamiento de hoy" Active state background -> clean flat design
c = c.replace(/className="p-4 rounded-lg bg-secondary\/50 border"/g,
'className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent"');

// Also fix some text colors inside the card to look better in light mode
c = c.replace(/className="font-medium text-primary mb-1"/g, 'className="font-bold text-slate-900 dark:text-slate-100 mb-1"');
c = c.replace(/className="text-sm text-muted-foreground mb-3"/g, 'className="text-sm text-slate-500 dark:text-slate-400 mb-3"');
c = c.replace(/<div className="h-2 w-2 rounded-full shrink-0 bg-muted-foreground"><\/div>\n\s*<span>\{ex\.name \|\| ex\.exercise\?\.name \|\| 'Ejercicio ' \+ \(i\+1\)\}<\/span>/g,
'<div className="h-2 w-2 rounded-full shrink-0 bg-green-500"></div>\n                            <span className="font-medium text-slate-800 dark:text-slate-200">{ex.name || ex.exercise?.name || \'Ejercicio \' + (i+1)}</span>');
c = c.replace(/<span className="text-muted-foreground">\{ex\.sets\}x\{ex\.reps\}<\/span>/g,
'<span className="text-slate-500 dark:text-slate-400 font-medium">{ex.sets}x{ex.reps}</span>');

fs.writeFileSync('components/dashboards/athlete-dashboard.tsx', c, 'utf8');
console.log("Replaced!");
