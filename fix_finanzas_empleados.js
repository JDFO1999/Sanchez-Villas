const fs = require('fs');

// 1. Fix app/finanzas/page.tsx
let f = fs.readFileSync('app/finanzas/page.tsx', 'utf8');

// Fix the reference error
f = f.replace(/let commission = 0; if \(emp\.commissionType === 'flat'\) \{ commission = empAssignedAthletes.length \* commissionRate; \}/,
`const empAssignedAthletes = athletes.filter(a => a.coachId === emp.id);
                      let commission = 0; if (emp.commissionType === 'flat') { commission = empAssignedAthletes.length * commissionRate; }`);

// Remove the old declaration (only the second one that throws)
// Because I injected it above, I need to remove the original below it.
// The original was: `const empAssignedAthletes = athletes.filter(a => a.coachId === emp.id)`
f = f.replace(/const empAssignedAthletes = athletes\.filter\(a => a\.coachId === emp\.id\)/g, 
function(match, offset, string) {
  // If it's the second occurrence, remove it. Wait, it's safer to just split by the exact string and remove the latter one.
  return match;
});

// Let's do it safely
f = f.replace(/const isPaidThisMonth = [^\n]*\n\s*const empAssignedAthletes = athletes\.filter\(a => a\.coachId === emp\.id\)/, 
(match) => match.split('\n')[0]);

// Fix "Reporte General (PDF)" button
f = f.replace(/className="border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground dark:bg-primary dark:text-primary-foreground dark:border-transparent px-4 py-2 rounded-lg font-bold shadow-sm hover:bg-primary\/90 transition flex items-center gap-2"/,
'className="bg-transparent border-2 border-primary text-primary hover:bg-primary/10 px-4 py-2 rounded-lg font-bold transition flex items-center gap-2"');

// Fix "Pagar Nómina" button
f = f.replace(/className="px-3 py-1\.5 bg-green-500 text-white text-xs font-bold rounded hover:bg-green-600 transition shadow-lg shadow-green-500\/20">/,
'className="px-3 py-1.5 bg-transparent border border-green-500 text-green-500 text-xs font-bold rounded hover:bg-green-500/10 transition">');

// Fix "Pagar y Generar Recibo" button
f = f.replace(/className="px-4 py-2 text-sm rounded-lg bg-green-500 text-white font-bold hover:bg-green-600">/,
'className="px-4 py-2 text-sm rounded-lg bg-transparent border border-green-500 text-green-500 font-bold hover:bg-green-500/10 transition">');

fs.writeFileSync('app/finanzas/page.tsx', f, 'utf8');

// 2. Fix app/empleados/page.tsx
let e = fs.readFileSync('app/empleados/page.tsx', 'utf8');

// Fix "Nuevo Empleado" button
e = e.replace(/className="bg-green-500 text-white px-3 py-1\.5 rounded-lg font-bold hover:bg-green-600 transition flex items-center gap-2"/,
'className="bg-transparent border border-green-500 text-green-500 px-3 py-1.5 rounded-lg font-bold hover:bg-green-500/10 transition flex items-center gap-2"');

// Fix "Guardar Empleado" button
e = e.replace(/className="px-4 py-2 text-sm rounded-lg bg-green-500 text-white font-bold hover:bg-green-600">/,
'className="px-4 py-2 text-sm rounded-lg bg-transparent border border-green-500 text-green-500 font-bold hover:bg-green-500/10 transition">');

fs.writeFileSync('app/empleados/page.tsx', e, 'utf8');

console.log("Fixed ReferenceError and button styles");
