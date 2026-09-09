const fs = require('fs');
let c = fs.readFileSync('components/dashboards/athlete-dashboard.tsx', 'utf8');

c = c.replace(/if \(stats\.success\) \{/, `if (stats.success) {
            } else {
              console.error("DASHBOARD ERROR:", stats.error);
              // Show it on screen so we can see what's wrong!
              if (stats.error) alert("Error fetching dashboard: " + stats.error);
            }
            if (stats.success) {`);

fs.writeFileSync('components/dashboards/athlete-dashboard.tsx', c, 'utf8');
