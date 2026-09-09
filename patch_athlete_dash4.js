const fs = require('fs');
const lines = fs.readFileSync('components/dashboards/athlete-dashboard.tsx', 'utf8').split('\n');

let cardContentIdx = -1;
let inMisCompras = false;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('Mis Compras y Facturas')) {
    inMisCompras = true;
  }
  if (inMisCompras && lines[i].includes('</CardContent>')) {
    cardContentIdx = i;
    break;
  }
}

if (cardContentIdx !== -1) {
  // we want to replace from line cardContentIdx - 2 to cardContentIdx
  // Wait, let's just insert the pagination right before `</div>\n          )}`
  
  // Find the exact line of `)}` right before `</CardContent>`
  const insertIdx = cardContentIdx - 1; // This should be `)}`
  
  const paginationHtml = `
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
                )}`;
                
  lines.splice(insertIdx, 0, paginationHtml);
  fs.writeFileSync('components/dashboards/athlete-dashboard.tsx', lines.join('\n'), 'utf8');
  console.log("Pagination injected!");
}
