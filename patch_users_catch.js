const fs = require('fs');
let c = fs.readFileSync('app/actions/users.ts', 'utf8');

c = c.replace(/return \{ success: false, error: 'Error al obtener dashboard de atleta' \}/, `console.error("DASHBOARD CATCH ERROR:", error); return { success: false, error: 'Error al obtener dashboard de atleta' }`);

fs.writeFileSync('app/actions/users.ts', c, 'utf8');
