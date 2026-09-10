const fs = require('fs');
let t = fs.readFileSync('app/tienda/page.tsx', 'utf8');

// Insert the import at the top
t = t.replace(/import \{ useState, useEffect, useRef \} from "react";?/, 
  "import { useState, useEffect, useRef } from \"react\";\nimport { getPendingTransactions } from \"@/app/actions/store\";");

fs.writeFileSync('app/tienda/page.tsx', t, 'utf8');
console.log("Added import");
