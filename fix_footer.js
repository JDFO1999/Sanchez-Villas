const fs = require('fs');
let c = fs.readFileSync('components/layout/footer.tsx', 'utf8');

c = c.replace(/className="p-2 rounded-full bg-black\/5 dark:bg-white\/5 text-slate-600 dark:text-slate-400 hover:bg-primary hover:text-white transition flex items-center justify-center"/, 'className="p-2 rounded-full bg-black/5 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:text-primary transition-all duration-300 hover:scale-110 hover:-translate-y-2 hover:shadow-[0_10px_20px_rgba(var(--primary),0.3)] flex items-center justify-center"');

c = c.replace(/hover:scale-105 transition"/, 'hover:scale-110 hover:-translate-y-2 hover:shadow-[0_10px_20px_rgba(var(--primary),0.3)] transition-all duration-300"');

fs.writeFileSync('components/layout/footer.tsx', c, 'utf8');
console.log("Updated footer animations");
