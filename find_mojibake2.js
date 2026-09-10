const fs = require('fs');
let c = fs.readFileSync('app/membresias/page.tsx', 'utf8');

// Find all non-ascii chars
let set = new Set();
for(let i=0; i<c.length; i++) {
  if(c.charCodeAt(i) > 127) {
    set.add(c[i]);
  }
}
console.log(Array.from(set).map(ch => ch + ' : ' + ch.charCodeAt(0).toString(16)));
