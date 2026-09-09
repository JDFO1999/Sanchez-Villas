const fs = require('fs');

let fin = fs.readFileSync('app/finanzas/page.tsx', 'utf8');
fin = fin.replace(/const baseSalary = employee\.baseSalary \|\| 0;\s*const commission = empAssignedAthletes\.length \* \(employee\.commissionRate \|\| 0\);/g, `const empAssignedAthletes = athletes.filter(a => a.coachId === employee.id);
const baseSalary = employee.baseSalary || 0;
const commission = empAssignedAthletes.length * (employee.commissionRate || 0);`);
fs.writeFileSync('app/finanzas/page.tsx', fin, 'utf8');
console.log('Fixed empAssignedAthletes');
