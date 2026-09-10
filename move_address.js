const fs = require('fs');
let lines = fs.readFileSync('app/ajustes/page.tsx', 'utf8').split('\n');

// 1. Remove the address block we inserted at line 195 (now search for it)
const addrStart = lines.findIndex(l => l.includes('Direccion del negocio (Footer)'));
if (addrStart !== -1) {
  // Remove 15 lines (the block we inserted + blank line)
  lines.splice(addrStart, 15);
  console.log('Removed old address block at', addrStart);
}

// 2. Find footer section title to insert after it
const footerIdx = lines.findIndex(l => l.includes('Footer y Marca'));
console.log('Footer section at line', footerIdx);

// 3. Insert after the h3 and before the grid (after footerIdx)
const insertAt = footerIdx + 1;
const addressBlock = [
  '                  ',
  '                  <div className="space-y-2">',
  '                    <label className="text-sm font-medium flex items-center gap-2">',
  '                      <span>\uD83D\uDCCD</span> Direcci\u00F3n del Negocio',
  '                    </label>',
  '                    <input',
  '                      type="text"',
  '                      value={storeAddress}',
  '                      onChange={(e) => setStoreAddress(e.target.value)}',
  '                      placeholder="Ej. Av. Principal, Local 5, Ciudad..."',
  '                      className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-lg p-3 text-sm text-foreground focus:outline-none focus:border-primary"',
  '                    />',
  '                  </div>',
];

lines.splice(insertAt, 0, ...addressBlock);
fs.writeFileSync('app/ajustes/page.tsx', lines.join('\n'), 'utf8');
console.log('Inserted address field at footer section line', insertAt);
