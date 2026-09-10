const fs = require('fs');
let c = fs.readFileSync('app/ajustes/page.tsx', 'utf8');

// Find the closing </div> after the appName input and add the address field right after
const target = `                </div>
  
  
                {/* Branding and Logos */}`;

const replacement = `                </div>

                {/* Direccion del negocio */}
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <span className="text-muted-foreground">📍</span> Direcci\u00F3n del Negocio (Footer)
                  </label>
                  <input 
                    type="text" 
                    value={storeAddress}
                    onChange={(e) => setStoreAddress(e.target.value)}
                    placeholder="Ej. Av. Principal, Local 5, Ciudad..."
                    className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-lg p-3 text-sm text-foreground focus:outline-none focus:border-primary" 
                  />
                </div>
  
  
                {/* Branding and Logos */}`;

c = c.replace(target, replacement);
fs.writeFileSync('app/ajustes/page.tsx', c, 'utf8');
console.log('Added address field to main settings section');
