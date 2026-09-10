const fs = require('fs');
const lines = fs.readFileSync('app/tienda/page.tsx', 'utf8').split('\n');
console.log("345-360:");
for(let i=345; i<360; i++) console.log(i+": "+lines[i]);
console.log("585-600:");
for(let i=585; i<600; i++) console.log(i+": "+lines[i]);
console.log("930-945:");
for(let i=930; i<945; i++) console.log(i+": "+lines[i]);
