const fs = require('fs');
let c = fs.readFileSync('components/dashboards/athlete-dashboard.tsx', 'utf8');

c = c.replace(/<div className="space-y-4">\n\s*\{purchases\.slice/, `<div>\n              <div className="space-y-4">\n                {purchases.slice`);

c = c.replace(/Siguiente →\n\s*<\/button>\n\s*<\/div>\n\s*\)\}/, `Siguiente →\n                    </button>\n                  </div>\n                )}\n              </div>`);

fs.writeFileSync('components/dashboards/athlete-dashboard.tsx', c, 'utf8');
