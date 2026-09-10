const fs = require('fs');
let c = fs.readFileSync('lib/settings-context.tsx', 'utf8');

c = c.replace(/setSettings\(\{ \.\.\.defaultSettings, \.\.\.parsed \}\)/, `setSettings({ ...defaultSettings, ...parsed });
        if (typeof document !== 'undefined') {
          document.title = (parsed.appName || defaultSettings.appName) + " - Sistema de Gestión";
        }`);

c = c.replace(/const updated = \{ \.\.\.settings, \.\.\.newSettings \}\s*setSettings\(updated\)/, `const updated = { ...settings, ...newSettings }
    setSettings(updated)
    if (typeof document !== 'undefined' && newSettings.appName) {
      document.title = newSettings.appName + " - Sistema de Gestión";
    }`);

fs.writeFileSync('lib/settings-context.tsx', c, 'utf8');
console.log("Fixed title update");
