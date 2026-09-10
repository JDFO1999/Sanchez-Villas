const fs = require('fs');
let c = fs.readFileSync('app/actions/routines.ts', 'utf8');

c = c.replace(/import prisma from "@\/lib\/prisma"/, 'import prisma from "@/lib/db"');

fs.writeFileSync('app/actions/routines.ts', c, 'utf8');
console.log("Fixed prisma import in routines.ts");
