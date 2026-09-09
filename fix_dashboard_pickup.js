const fs = require('fs');

let c = fs.readFileSync('components/dashboards/athlete-dashboard.tsx', 'utf8');

c = c.replace(/tx\.pickupCode/g, "tx.id.slice(-5).toUpperCase()");
c = c.replace(/showTicketModal\.pickupCode/g, "showTicketModal.id.slice(-5).toUpperCase()");

fs.writeFileSync('components/dashboards/athlete-dashboard.tsx', c, 'utf8');
console.log('Fixed pickup code in dashboard');
