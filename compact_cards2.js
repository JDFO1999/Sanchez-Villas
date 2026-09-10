const fs = require('fs');
const lines = fs.readFileSync('components/dashboards/athlete-dashboard.tsx', 'utf8').split('\n');

let startIndex = -1;
let endIndex = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('<div key={tx.id} className="bg-transparent py-4 border-b border-slate-300')) {
    startIndex = i;
  }
  // Wait, I can just find the end of the map:
  if (startIndex !== -1 && lines[i].includes('))}')) {
    endIndex = i;
    break;
  }
}

if (startIndex !== -1 && endIndex !== -1) {
  const newBlock = `                <div key={tx.id} className="bg-transparent py-3 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row gap-3 justify-between md:items-center last:border-0 hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition px-2 -mx-2 rounded-lg">
                  <div className="space-y-1.5 flex-1 w-full">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-xs text-slate-900 dark:text-slate-100 uppercase">#{tx.id.slice(-6)}</span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400">{new Date(tx.date).toLocaleDateString()}</span>
                      {tx.status === 'PENDING_DELIVERY' ? (
                        <span className="text-[9px] bg-yellow-500/10 text-yellow-600 dark:text-yellow-500 border border-yellow-500/20 px-2 py-0.5 rounded-full font-bold flex items-center gap-1"><Clock className="h-3 w-3"/> PENDIENTE</span>
                      ) : tx.status === 'CANCELED' ? (
                        <span className="text-[9px] bg-red-500/10 text-red-600 dark:text-red-500 border border-red-500/20 px-2 py-0.5 rounded-full font-bold">VENCIDA</span>
                      ) : (
                        <span className="text-[9px] bg-green-500/10 text-green-600 dark:text-green-500 border border-green-500/20 px-2 py-0.5 rounded-full font-bold">COMPLETADA</span>
                      )}
                    </div>
                    
                    <div className="flex flex-wrap gap-1.5">
                      {tx.items.map(item => {
                        const img = getProductImage(item.productId)
                        return (
                          <div key={item.productId} className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-1.5 py-1 rounded-md">
                            {img ? (
                              <img src={img} alt={item.name} className="h-5 w-5 object-contain rounded-sm" />
                            ) : (
                              <div className="h-5 w-5 flex items-center justify-center">
                                <ShoppingCart className="h-3 w-3 text-slate-400" />
                              </div>
                            )}
                            <p className="text-[10px] text-slate-700 dark:text-slate-300 max-w-[100px] truncate" title={item.name}>
                              <span className="font-bold">{item.qty}x</span> {item.name}
                            </p>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  <div className="flex flex-row md:flex-col justify-between items-center md:items-end w-full md:w-auto gap-2 md:gap-1 mt-2 md:mt-0">
                    <div className="flex flex-row md:flex-col items-center md:items-end gap-2 md:gap-0">
                      <p className="font-black text-base text-primary leading-none">\${tx.total.toFixed(2)}</p>
                      <p className="text-[9px] text-slate-500 uppercase font-medium md:mt-0.5">{tx.paymentMethod}</p>
                    </div>
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => setShowTicketModal(tx)}
                        className="bg-transparent border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 px-2.5 py-1 rounded-md text-[10px] font-bold flex items-center gap-1 transition shadow-sm"
                      >
                        <Eye className="h-3 w-3" /> Ticket
                      </button>
                      {tx.status === 'PENDING_DELIVERY' && tx.paymentMethod === 'Efectivo' && (
                        <button
                          onClick={() => handleCancelTx(tx)}
                          className="bg-transparent border border-red-500 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 px-2.5 py-1 rounded-md text-[10px] font-bold transition shadow-sm"
                        >
                          Cancelar
                        </button>
                      )}
                    </div>
                  </div>
                </div>`;
  
  lines.splice(startIndex, endIndex - startIndex, newBlock);
  fs.writeFileSync('components/dashboards/athlete-dashboard.tsx', lines.join('\n'), 'utf8');
  console.log("Lines replaced.");
} else {
  console.log("Could not find start or end index.", startIndex, endIndex);
}
