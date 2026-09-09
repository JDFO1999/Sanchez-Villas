const fs = require('fs');
let c = fs.readFileSync('components/dashboards/athlete-dashboard.tsx', 'utf8');

const regex = /<CardTitle className="flex items-center gap-2">\s*<Package className="h-5 w-5 text-primary" \/>\s*Mis Compras y Facturas\s*<\/CardTitle>\s*<\/CardHeader>\s*<CardContent>/;

const replacement = `<CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              Mis Compras y Facturas (Debug: {purchases.length} items)
            </CardTitle>
          </CardHeader>
          <CardContent>`;

c = c.replace(regex, replacement);

fs.writeFileSync('components/dashboards/athlete-dashboard.tsx', c, 'utf8');
console.log('Patched athlete-dashboard.tsx with debug length');
