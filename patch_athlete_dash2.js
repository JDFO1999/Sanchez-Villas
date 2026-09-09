const fs = require('fs');
let c = fs.readFileSync('components/dashboards/athlete-dashboard.tsx', 'utf8');

const handleCancelStr = `
  const handleCancelTx = async (tx: Transaction) => {
    const result = await Swal.fire({
      title: '¿Cancelar este pedido?',
      text: 'Esta acción cancelará tu pedido en efectivo.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#3b82f6',
      confirmButtonText: 'Sí, cancelar pedido',
      cancelButtonText: 'No, mantener'
    });

    if (result.isConfirmed) {
      Swal.fire({ title: 'Cancelando...', allowOutsideClick: false, didOpen: () => { Swal.showLoading() } });
      const res = await cancelTransaction(tx.id);
      if (res.success) {
        Swal.fire('Cancelado', 'El pedido fue cancelado correctamente.', 'success');
        const stats = await import("@/app/actions/users").then(m => m.getAthleteDashboardData(user!.id));
        if (stats.success) setPurchases(stats.purchases || []);
      } else {
        Swal.fire('Error', res.error || 'No se pudo cancelar', 'error');
      }
    }
  };
`;

c = c.replace(/const \[streak, setStreak\] = useState\(0\)/, `const [streak, setStreak] = useState(0)\n${handleCancelStr}`);

c = c.replace(/className="bg-card p-4 rounded-xl border border-black\/10 dark:border-white\/10 flex flex-col md:flex-row gap-4 justify-between"/g, 
'className="bg-card p-3 rounded-lg border border-black/10 dark:border-white/10 flex flex-col md:flex-row gap-3 justify-between"');

c = c.replace(/<span className="font-bold text-sm">Factura: \{tx\.id\}<\/span>/g, '<span className="font-bold text-xs truncate max-w-[120px]">Factura: {tx.id}</span>');

c = c.replace(/<p className="font-black text-xl text-primary">\$\{tx\.total\.toFixed\(2\)\}<\/p>/g, '<p className="font-black text-lg text-primary">${tx.total.toFixed(2)}</p>');

c = c.replace(/<img src=\{img\} alt=\{item\.name\} className="h-10 w-10/g, '<img src={img} alt={item.name} className="h-8 w-8');
c = c.replace(/<div className="h-10 w-10/g, '<div className="h-8 w-8');

const buttonsHtml = `
                        <button
                          onClick={() => setShowTicketModal(tx)}
                          className="bg-black/10 dark:bg-white/10 hover:bg-black/20 dark:hover:bg-white/20 px-3 py-1.5 rounded text-xs font-bold flex items-center gap-1 transition"
                        >
                          <Eye className="h-3 w-3" /> Ticket
                        </button>
                        {tx.status === 'PENDING_DELIVERY' && tx.paymentMethod === 'Efectivo' && (
                          <button
                            onClick={() => handleCancelTx(tx)}
                            className="bg-red-500/10 text-red-500 hover:bg-red-500/20 px-3 py-1.5 rounded text-xs font-bold transition"
                          >
                            Cancelar
                          </button>
                        )}
`;

c = c.replace(/<button\s*onClick=\{\(\) => setShowTicketModal\(tx\)\}\s*className="bg-black\/10 dark:bg-white\/10 hover:bg-black\/20 dark:hover:bg-white\/20 px-3 py-1\.5 rounded text-xs font-bold flex items-center gap-1 transition"\s*>\s*<Eye className="h-3 w-3" \/> Ver Ticket\s*<\/button>/g, buttonsHtml);

const paginationHtml = `
                </div>
                {purchases.length > itemsPerPage && (
                  <div className="flex justify-between items-center mt-4">
                    <button 
                      disabled={currentPage === 1} 
                      onClick={() => setCurrentPage(p => p - 1)}
                      className="bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 px-3 py-1 rounded text-xs font-bold disabled:opacity-50"
                    >
                      Anterior
                    </button>
                    <span className="text-xs text-muted-foreground">Página {currentPage} de {Math.ceil(purchases.length / itemsPerPage)}</span>
                    <button 
                      disabled={currentPage === Math.ceil(purchases.length / itemsPerPage)} 
                      onClick={() => setCurrentPage(p => p + 1)}
                      className="bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 px-3 py-1 rounded text-xs font-bold disabled:opacity-50"
                    >
                      Siguiente
                    </button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
`;

c = c.replace(/<\/div>\s*\}\)\}\s*<\/div>\s*\)\}\s*<\/CardContent>/, paginationHtml);

fs.writeFileSync('components/dashboards/athlete-dashboard.tsx', c, 'utf8');
