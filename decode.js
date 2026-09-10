const fs = require('fs');
let text = fs.readFileSync('app/membresias/page.tsx', 'binary');
let decoded = Buffer.from(text, 'binary').toString('utf8');
fs.writeFileSync('app/membresias/page.tsx', decoded, 'utf8');
console.log("Decoded");
