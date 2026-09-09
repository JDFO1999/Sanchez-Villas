const fs = require('fs');
let c = fs.readFileSync('app/actions/users.ts', 'utf8');

c = c.replace(/take: 5\s*\n\s*\}\);/g, '} /* removed take to allow client pagination */);');

fs.writeFileSync('app/actions/users.ts', c, 'utf8');
