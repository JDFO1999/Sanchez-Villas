const fs = require('fs');
let c = fs.readFileSync('components/dashboards/athlete-dashboard.tsx', 'utf8');

// 1. Mostrar mi Código de Acceso to outline primary (yellow)
c = c.replace(/className="bg-primary text-white px-4 py-2 rounded-md font-bold shadow-sm hover:bg-primary\/90 transition flex items-center justify-center gap-2"/g,
'className="bg-transparent border-2 border-primary text-primary hover:bg-primary/10 px-4 py-2 rounded-md font-bold shadow-sm transition flex items-center justify-center gap-2"');

// 2. Make borders darker in light mode
c = c.replace(/border-slate-200/g, 'border-slate-300'); // Much darker border
c = c.replace(/border-black\/10/g, 'border-black/20'); // Darker generic border

// 3. Make text darker in light mode
c = c.replace(/text-slate-500/g, 'text-slate-700'); // Much darker muted text
c = c.replace(/text-slate-400/g, 'text-slate-600'); // Some other grays

fs.writeFileSync('components/dashboards/athlete-dashboard.tsx', c, 'utf8');
console.log("Updated athlete-dashboard.tsx");
