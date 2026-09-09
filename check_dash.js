const fs = require('fs');
const content = fs.readFileSync('components/dashboards/athlete-dashboard.tsx', 'utf8');
console.log("Purchases mention count: " + (content.match(/purchases/g) || []).length);
console.log("Mis Compras mention: " + content.includes("Mis Compras"));
