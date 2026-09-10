const fs = require('fs');
let c = fs.readFileSync('app/ajustes/page.tsx', 'utf8');
c = c.replace(/arr\[idx\]\.iconUrl = reader\.result;/g, 'arr[idx].iconUrl = reader.result as string;');
c = c.replace(/arr\[idx\]\.imageUrl = reader\.result;/g, 'arr[idx].imageUrl = reader.result as string;');
fs.writeFileSync('app/ajustes/page.tsx', c, 'utf8');
