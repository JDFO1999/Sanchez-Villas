const fs = require('fs');
let c = fs.readFileSync('lib/settings-context.tsx', 'utf8');

// Update AppSettings interface
c = c.replace(/logoUrl: string/, 'logoUrl: string\n  logoUrlDark?: string\n  faviconUrl?: string');
// Update defaultSettings
c = c.replace(/logoUrl: '',/, "logoUrl: '',\n  logoUrlDark: '',\n  faviconUrl: '',");

// Inject favicon
c = c.replace(/document\.title = newSettings\.appName \+ " - Sistema de Gestión";\n\s*\}/, `document.title = newSettings.appName + " - Sistema de Gestión";
    }
    if (typeof document !== 'undefined' && newSettings.faviconUrl !== undefined) {
      let link = document.querySelector("link[rel~='icon']");
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.getElementsByTagName('head')[0].appendChild(link);
      }
      link.href = newSettings.faviconUrl || '/favicon.ico';
    }`);

c = c.replace(/document\.title = \(parsed\.appName \|\| defaultSettings\.appName\) \+ " - Sistema de Gestión";\n\s*\}/, `document.title = (parsed.appName || defaultSettings.appName) + " - Sistema de Gestión";
        }
        if (typeof document !== 'undefined') {
          let link = document.querySelector("link[rel~='icon']");
          if (!link) {
            link = document.createElement('link');
            link.rel = 'icon';
            document.getElementsByTagName('head')[0].appendChild(link);
          }
          link.href = parsed.faviconUrl || defaultSettings.faviconUrl || '/favicon.ico';
        }`);

fs.writeFileSync('lib/settings-context.tsx', c, 'utf8');
console.log("Updated settings-context");
