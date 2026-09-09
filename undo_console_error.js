const fs = require('fs');
let c = fs.readFileSync('app/actions/users.ts', 'utf8');

c = c.replace(/console\.error\('getAthleteDashboardData error:', error\); return \{ success: false, error: 'Error al obtener dashboard de atleta', details: error\.message \}/, "return { success: false, error: 'Error al obtener dashboard de atleta' }");

fs.writeFileSync('app/actions/users.ts', c, 'utf8');
