const fs = require('fs');
let c = fs.readFileSync('app/ajustes/page.tsx', 'utf8');

c = c.replace(/className="border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground dark:bg-primary dark:text-primary-foreground dark:border-transparent font-bold py-3 px-6 rounded-lg hover:bg-primary\/90 transition shadow-lg shadow-primary\/20 flex items-center gap-2"/g, 
  'className="bg-transparent border-2 border-primary text-primary hover:bg-primary/10 font-bold py-3 px-6 rounded-lg transition flex items-center gap-2"');

c = c.replace(/className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-bold"/g, 
  'className="bg-transparent border border-primary text-primary hover:bg-primary/10 font-bold px-4 py-2 rounded-lg transition"');

c = c.replace(/className="text-xs bg-black\/10 dark:bg-white\/10 hover:bg-white\/20 px-3 py-1 rounded transition"/g, 
  'className="bg-transparent border border-primary text-primary hover:bg-primary/10 text-xs px-3 py-1 rounded transition"');

c = c.replace(/className="text-xs bg-black\/10 dark:bg-white\/10 px-3 py-1\.5 rounded-lg hover:bg-black\/20 dark:hover:bg-white\/20 transition font-bold"/g, 
  'className="bg-transparent border border-primary text-primary hover:bg-primary/10 text-xs px-3 py-1.5 rounded-lg transition font-bold"');

c = c.replace(/className="px-4 py-2 bg-black\/10 dark:bg-white\/10 rounded-lg text-sm hover:bg-black\/20 dark:hover:bg-white\/20"/g, 
  'className="bg-transparent border border-slate-500 text-slate-500 hover:bg-slate-500/10 px-4 py-2 rounded-lg text-sm transition"');

c = c.replace(/className="w-full bg-primary text-primary-foreground font-black py-4 rounded-xl hover:bg-primary\/90 transition-all flex items-center justify-center gap-2 text-lg shadow-lg"/g, 
  'className="w-full bg-transparent border-2 border-primary text-primary hover:bg-primary/10 font-black py-4 rounded-xl transition flex items-center justify-center gap-2 text-lg"');

fs.writeFileSync('app/ajustes/page.tsx', c, 'utf8');
console.log("Standardized buttons");
