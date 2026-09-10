const fs = require('fs');

// 1. Fix app/ajustes/page.tsx
let a = fs.readFileSync('app/ajustes/page.tsx', 'utf8');
if (!a.includes('const [biometricFields')) {
  a = a.replace(/const \[gymCommissionPercentage, setGymCommissionPercentage\] = useState\(settings\.gymCommissionPercentage \?\? 30\)\r?\n/,
    "const [gymCommissionPercentage, setGymCommissionPercentage] = useState(settings.gymCommissionPercentage ?? 30)\n  const [biometricFields, setBiometricFields] = useState<string[]>(settings.biometricFields || ['Pecho', 'Cintura', 'Cadera'])\n");
  fs.writeFileSync('app/ajustes/page.tsx', a, 'utf8');
  console.log("Fixed ajustes biometricFields");
}

// 2. Fix app/tienda/page.tsx
let t = fs.readFileSync('app/tienda/page.tsx', 'utf8');
if (!t.includes('import { getPendingTransactions }')) {
  t = t.replace(/import { deliverTransaction } from "@\/app\/actions\/store"/, 
    "import { deliverTransaction, getPendingTransactions } from \"@/app/actions/store\"");
}
if (!t.includes('const fetchPendingOrders = async () =>')) {
  t = t.replace(/const \[pendingSearch, setPendingSearch\] = useState\(''\);/,
    "const [pendingSearch, setPendingSearch] = useState('');\n  const fetchPendingOrders = async () => { const data = await getPendingTransactions(); setPendingOrders(data); };");
}
t = t.replace(/C[^\w\s]*dula/g, 'Cédula');
t = t.replace(/c[^\w\s]*dula/g, 'cédula');
t = t.replace(/xito/g, 'éxito');
fs.writeFileSync('app/tienda/page.tsx', t, 'utf8');
console.log("Fixed tienda");

// 3. Fix app/membresias/page.tsx characters
let m = fs.readFileSync('app/membresias/page.tsx', 'utf8');
m = m.replace(/C[^\w\s]*dula/g, 'Cédula');
m = m.replace(/c[^\w\s]*dula/g, 'cédula');
fs.writeFileSync('app/membresias/page.tsx', m, 'utf8');
console.log("Fixed membresias");

// 4. Improve Sidebar animation in app-layout.tsx
let l = fs.readFileSync('components/layout/app-layout.tsx', 'utf8');
// To make it smoother, we can use `w-64` to `w-0` with `overflow-hidden` and `whitespace-nowrap` on the content container
// Wait, the main issue with sidebar animation is the children wrapping or jumping when width animates. 
// Adding `whitespace-nowrap` to the aside inner div prevents this.
l = l.replace(/<aside className=\{`print:hidden fixed inset-y-0 left-0 z-50 bg-card border-r transition-all duration-300 ease-in-out/g,
  `<aside className={\`print:hidden fixed inset-y-0 left-0 z-50 bg-card border-r transition-[width,transform] duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] whitespace-nowrap`);

fs.writeFileSync('components/layout/app-layout.tsx', l, 'utf8');
console.log("Improved sidebar animation");

