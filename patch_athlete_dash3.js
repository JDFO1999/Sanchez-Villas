const fs = require('fs');
let c = fs.readFileSync('components/dashboards/athlete-dashboard.tsx', 'utf8');

// Remove CODIGO DE RETIRO div
const codigoRegex = /\{tx\.id\.slice\(-5\)\.toUpperCase\(\) && tx\.status === 'PENDING_DELIVERY' && \(\s*<div className="bg-white text-black px-3 py-2 rounded-lg border-2 border-dashed border-black text-center mt-1">\s*<p className="text-\[9px\] font-bold">CÓDIGO DE RETIRO<\/p>\s*<p className="font-mono font-black text-lg">\{tx\.id\.slice\(-5\)\.toUpperCase\(\)\}<\/p>\s*<\/div>\s*\)\}/g;
c = c.replace(codigoRegex, '');

// Inject pagination right before closing CardContent
const paginationHtml = `
                </div>
                {purchases.length > itemsPerPage && (
                  <div className="flex justify-between items-center mt-4 border-t border-black/10 dark:border-white/10 pt-4">
                    <button 
                      disabled={currentPage === 1} 
                      onClick={() => setCurrentPage(p => p - 1)}
                      className="bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 px-4 py-2 rounded-lg text-xs font-bold disabled:opacity-30 transition"
                    >
                      ← Anterior
                    </button>
                    <span className="text-xs text-muted-foreground font-medium">Página {currentPage} de {Math.ceil(purchases.length / itemsPerPage)}</span>
                    <button 
                      disabled={currentPage === Math.ceil(purchases.length / itemsPerPage)} 
                      onClick={() => setCurrentPage(p => p + 1)}
                      className="bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 px-4 py-2 rounded-lg text-xs font-bold disabled:opacity-30 transition"
                    >
                      Siguiente →
                    </button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
`;

c = c.replace(/<\/div>\s*\}\)\}\s*<\/div>\s*\)\}\s*<\/CardContent>/g, paginationHtml);

// Fix SweetAlert Theme dynamically
c = c.replace(/confirmButtonColor: '#ef4444',/, "confirmButtonColor: '#ef4444',\n      background: document.documentElement.classList.contains('dark') ? '#1f2937' : '#ffffff',\n      color: document.documentElement.classList.contains('dark') ? '#f3f4f6' : '#111827',");
c = c.replace(/Swal\.fire\('Cancelado', 'El pedido fue cancelado correctamente\.', 'success'\);/, "Swal.fire({ title: 'Cancelado', text: 'El pedido fue cancelado correctamente.', icon: 'success', background: document.documentElement.classList.contains('dark') ? '#1f2937' : '#ffffff', color: document.documentElement.classList.contains('dark') ? '#f3f4f6' : '#111827' });");
c = c.replace(/Swal\.fire\('Error', res\.error \|\| 'No se pudo cancelar', 'error'\);/, "Swal.fire({ title: 'Error', text: res.error || 'No se pudo cancelar', icon: 'error', background: document.documentElement.classList.contains('dark') ? '#1f2937' : '#ffffff', color: document.documentElement.classList.contains('dark') ? '#f3f4f6' : '#111827' });");


fs.writeFileSync('components/dashboards/athlete-dashboard.tsx', c, 'utf8');
