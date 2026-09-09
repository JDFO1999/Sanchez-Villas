const fs = require('fs');
let c = fs.readFileSync('app/actions/users.ts', 'utf8');

c = c.replace(/const payload = \{ success: true, biometrics, attendances: allAttendances\.slice\(0, 5\), memberships, purchases, streak, routines, diets, exerciseProgress \};/, `console.log("SERVER SIDE PURCHASES FOR", athleteId, ":", purchases.length);
    const payload = { success: true, biometrics, attendances: allAttendances.slice(0, 5), memberships, purchases, streak, routines, diets, exerciseProgress };`);

fs.writeFileSync('app/actions/users.ts', c, 'utf8');
