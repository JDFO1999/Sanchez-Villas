const fs = require('fs');
const lines = fs.readFileSync('prisma/schema.prisma', 'utf8').split('\n');
for(let i=40; i<60; i++) console.log((i+1) + ": " + lines[i]);
