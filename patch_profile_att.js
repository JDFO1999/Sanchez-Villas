const fs = require('fs');
let c = fs.readFileSync('app/atletas/[id]/page.tsx', 'utf8');

c = c.replace(/attendance: res\.athlete\.attendance \|\| \[\]/g, 'attendance: res.athlete.attendances || []');

// Fix streak calculation since it's 0 currently
c = c.replace(/\{athlete\.streak \|\| 0\}/g, '{athlete.attendance?.length || 0}');

fs.writeFileSync('app/atletas/[id]/page.tsx', c, 'utf8');
console.log('Fixed attendance array and streak display');
