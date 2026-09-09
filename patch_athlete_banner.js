const fs = require('fs');
let c = fs.readFileSync('components/dashboards/athlete-dashboard.tsx', 'utf8');

const bannerInsert = `
          {purchases.some(tx => tx.status === 'PENDING_DELIVERY') && (
            <div className="mb-4 bg-orange-500/10 border-2 border-orange-500 text-orange-600 dark:text-orange-400 p-4 rounded-xl flex items-center justify-between shadow-lg shadow-orange-500/20">
              <div className="flex items-center gap-3">
                <Package className="h-8 w-8 animate-bounce" />
                <div>
                  <h3 className="font-black text-lg uppercase tracking-tight">¡Tienes un pedido en espera!</h3>
                  <p className="text-sm font-medium">Acércate a recepción con tu Código de Retiro para retirar tus productos.</p>
                </div>
              </div>
            </div>
          )}
          <div className="bg-card p-6 rounded-2xl shadow-sm border border-black/10 dark:border-white/10 mb-6">`;

c = c.replace('<div className="bg-card p-6 rounded-2xl shadow-sm border border-black/10 dark:border-white/10 mb-6">', bannerInsert);

fs.writeFileSync('components/dashboards/athlete-dashboard.tsx', c, 'utf8');
console.log('Added pending order banner to athlete dashboard');
