const fs = require('fs');

let c = fs.readFileSync('app/actions/users.ts', 'utf8');

c = c.replace(/return \{ success: false, error: 'Error al obtener dashboard de atleta' \}/, "console.error('getAthleteDashboardData error:', error); return { success: false, error: 'Error al obtener dashboard de atleta', details: error.message }");

fs.writeFileSync('app/actions/users.ts', c, 'utf8');
console.log('Added error logging to getAthleteDashboardData');
