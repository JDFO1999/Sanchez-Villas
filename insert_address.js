const fs = require('fs');
let lines = fs.readFileSync('app/ajustes/page.tsx', 'utf8').split('\n');

const idx = lines.findIndex(l => l.includes('Branding and Logos'));
if (idx === -1) { console.log('Not found'); process.exit(1); }

const newLines = [
  '                {/* Direccion del negocio (Footer) */}',
  '                <div className="space-y-2 md:col-span-2">',
  '                  <label className="text-sm font-medium flex items-center gap-2">',
  '                    <span>\uD83D\uDCCD</span> Direcci\u00F3n del Negocio (visible en el Footer)',
  '                  </label>',
  '                  <input',
  '                    type="text"',
  '                    value={storeAddress}',
  '                    onChange={(e) => setStoreAddress(e.target.value)}',
  '                    placeholder="Ej. Av. Principal, Local 5, Ciudad..."',
  '                    className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-lg p-3 text-sm text-foreground focus:outline-none focus:border-primary"',
  '                  />',
  '                </div>',
  ''
];

lines.splice(idx, 0, ...newLines);
fs.writeFileSync('app/ajustes/page.tsx', lines.join('\n'), 'utf8');
console.log('Inserted address field at line', idx);
