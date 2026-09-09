const fs = require('fs');
let c = fs.readFileSync('components/dashboards/athlete-dashboard.tsx', 'utf8');

c = c.replace(/\{tx\.status === 'PENDING_DELIVERY' \? \([\s\S]*?\) : \(\s*<span className="text-\[10px\] bg-green-500\/20 text-green-500 px-2 py-0\.5 rounded-full \\nfont-bold">COMPLETADA<\/span>\s*\)\}/, `{tx.status === 'PENDING_DELIVERY' ? (
                          <span className="text-[10px] bg-yellow-500/20 text-yellow-500 px-2 py-0.5 rounded-full font-bold flex items-center gap-1"><Clock className="h-3 w-3"/> PENDIENTE RETIRO</span>
                        ) : tx.status === 'CANCELED' ? (
                          <span className="text-[10px] bg-red-500/20 text-red-500 px-2 py-0.5 rounded-full font-bold">VENCIDA</span>
                        ) : (
                          <span className="text-[10px] bg-green-500/20 text-green-500 px-2 py-0.5 rounded-full font-bold">COMPLETADA</span>
                        )}`);

// Fallback if previous regex failed due to formatting:
if (!c.includes("tx.status === 'CANCELED'")) {
    c = c.replace(/\{tx\.status === 'PENDING_DELIVERY' \? \([\s\S]*?\) : \([\s\S]*?COMPLETADA<\/span>\s*\)\}/, `{tx.status === 'PENDING_DELIVERY' ? (
                          <span className="text-[10px] bg-yellow-500/20 text-yellow-500 px-2 py-0.5 rounded-full font-bold flex items-center gap-1"><Clock className="h-3 w-3"/> PENDIENTE RETIRO</span>
                        ) : tx.status === 'CANCELED' ? (
                          <span className="text-[10px] bg-red-500/20 text-red-500 px-2 py-0.5 rounded-full font-bold">VENCIDA</span>
                        ) : (
                          <span className="text-[10px] bg-green-500/20 text-green-500 px-2 py-0.5 rounded-full font-bold">COMPLETADA</span>
                        )}`);
}

fs.writeFileSync('components/dashboards/athlete-dashboard.tsx', c, 'utf8');
