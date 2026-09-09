const fs = require('fs');
let c = fs.readFileSync('components/dashboards/athlete-dashboard.tsx', 'utf8');

c = c.replace(/<div className="space-y-4">\s*\{purchases\.slice\(\(currentPage - 1\) \* itemsPerPage, currentPage \* itemsPerPage\)\.map\(tx => \(/, 
`<div>
              <div className="space-y-4">
              {purchases.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map(tx => (`);

fs.writeFileSync('components/dashboards/athlete-dashboard.tsx', c, 'utf8');
