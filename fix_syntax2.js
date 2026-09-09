const fs = require('fs');
let c = fs.readFileSync('app/atletas/[id]/page.tsx', 'utf8');

c = c.replace(/const today = new Date\(\)\n  const diffTime = endDate\.getTime\(\) - today\.getTime\(\)\n  const diffDays = Math\.ceil\(diffTime \/ \(1000 \* 60 \* 60 \* 24\)\)/g, '');

fs.writeFileSync('app/atletas/[id]/page.tsx', c, 'utf8');
