const fs = require('fs');

// Fix Unplug Icon
let p = 'components/layout/app-layout.tsx';
let c = fs.readFileSync(p, 'utf8');
c = c.replace(/<Dumbbell className="h-4 w-4 shrink-0" \/>/g, '<Unplug className="h-5 w-5 shrink-0" />');
c = c.replace(/import \{ Menu, Dumbbell/g, 'import { Menu, Dumbbell, Unplug');
fs.writeFileSync(p, c, 'utf8');
console.log('Fixed Unplug icon');

// Fix Footer Logo Settings
p = 'lib/settings-context.tsx';
c = fs.readFileSync(p, 'utf8');
if (!c.includes('footerLogoSettings')) {
    c = c.replace("fadeEffect: boolean\n  }", "fadeEffect: boolean\n  }\n  footerLogoSettings?: {\n    showLogo: boolean\n    position: 'side' | 'top'\n    width: number\n    height: number\n    glassEffect: boolean\n    glowEffect: boolean\n  }");
    fs.writeFileSync(p, c, 'utf8');
}
console.log('Fixed settings-context.tsx');

p = 'components/layout/footer.tsx';
c = fs.readFileSync(p, 'utf8');
if (!c.includes('footerLogoSettings')) {
    c = c.replace(
        `            <div className="flex items-center gap-3">\n              {settings.logoUrl && (\n                <img src={settings.logoUrl} alt="Logo" className="h-10 w-auto object-contain" />\n              )}`,
        `            <div className={\`flex \${settings.footerLogoSettings?.position === 'top' ? 'flex-col items-start' : 'items-center'} gap-3\`}>\n              {settings.footerLogoSettings?.showLogo !== false && settings.logoUrl && (\n                <div className={\`relative \${settings.footerLogoSettings?.glowEffect ? 'before:absolute before:inset-0 before:bg-primary/20 before:blur-xl before:rounded-full before:animate-pulse' : ''} \${settings.footerLogoSettings?.glassEffect ? 'bg-white/5 backdrop-blur-md p-2 rounded-2xl border border-white/10 shadow-xl' : ''}\`}>\n                  <img \n                    src={settings.logoUrl} \n                    alt="Logo Footer" \n                    style={{ \n                      width: settings.footerLogoSettings?.width || 40, \n                      height: settings.footerLogoSettings?.height || 40 \n                    }} \n                    className="object-contain relative z-10" \n                  />\n                </div>\n              )}`
    );
    fs.writeFileSync(p, c, 'utf8');
}
console.log('Fixed footer.tsx');
