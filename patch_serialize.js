const fs = require('fs');
let c = fs.readFileSync('app/actions/users.ts', 'utf8');

c = c.replace(/return \{ success: true, biometrics, attendances: allAttendances\.slice\(0, 5\), memberships, purchases, streak, routines, diets, exerciseProgress \}/, 
  `const payload = { success: true, biometrics, attendances: allAttendances.slice(0, 5), memberships, purchases, streak, routines, diets, exerciseProgress };
    return JSON.parse(JSON.stringify(payload));`
);

fs.writeFileSync('app/actions/users.ts', c, 'utf8');
