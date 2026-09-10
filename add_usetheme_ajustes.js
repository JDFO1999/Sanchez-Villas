const fs = require('fs');
let c = fs.readFileSync('app/ajustes/page.tsx', 'utf8');

c = c.replace(/import \{ useSettings \} from '\.\.\/lib\/settings-context'/, `import { useSettings } from '../lib/settings-context'\nimport { useTheme } from 'next-themes'`);
c = c.replace(/const \{ settings, updateSettings \} = useSettings\(\)/, `const { settings, updateSettings } = useSettings()\n  const { theme } = useTheme()`);

fs.writeFileSync('app/ajustes/page.tsx', c, 'utf8');
console.log("Added useTheme to ajustes");
