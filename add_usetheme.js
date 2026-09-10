const fs = require('fs');
let c = fs.readFileSync('app/login/page.tsx', 'utf8');

c = c.replace(/import \{ useSettings \} from '..\/lib\/settings-context'/, `import { useSettings } from '../lib/settings-context'\nimport { useTheme } from 'next-themes'`);
c = c.replace(/const \{ settings \} = useSettings\(\)/, `const { settings } = useSettings()\n  const { theme } = useTheme()`);

fs.writeFileSync('app/login/page.tsx', c, 'utf8');
console.log("Added useTheme to login");
