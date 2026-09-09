const fs = require('fs');

let c = fs.readFileSync('components/dashboards/athlete-dashboard.tsx', 'utf8');

// Fix status checks
c = c.replace(/tx\.status === 'PENDING_PICKUP'/g, "tx.status === 'PENDING_DELIVERY'");
c = c.replace(/showTicketModal\.status === 'PENDING_PICKUP'/g, "showTicketModal.status === 'PENDING_DELIVERY'");

fs.writeFileSync('components/dashboards/athlete-dashboard.tsx', c, 'utf8');
console.log('Fixed status checks');
