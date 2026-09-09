const fs = require('fs');
let c = fs.readFileSync('app/actions/users.ts', 'utf8');

c = c.replace(/include: \{ items: true \},\n\s*take: 5\n\s*\}/, 'include: { items: true }\n      }');
c = c.replace(/include: \{ items: true \},\r\n\s*take: 5\r\n\s*\}/, 'include: { items: true }\n      }');

fs.writeFileSync('app/actions/users.ts', c, 'utf8');
