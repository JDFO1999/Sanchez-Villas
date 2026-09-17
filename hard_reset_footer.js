const fs = require('fs');
let p = 'components/layout/footer.tsx';
let c = fs.readFileSync(p, 'utf8');

c = `import Link from "next/link";
import { useSettings } from "@/lib/settings-context";
import { MapPin } from "lucide-react";

export function Footer() {
  const { settings } = useSettings();

  const pY = settings.footerLogoSettings?.footerPadding !== undefined ? settings.footerLogoSettings.footerPadding : 12;
  const mT = settings.footerLogoSettings?.footerMarginTop !== undefined ? settings.footerLogoSettings.footerMarginTop : 0;
  const fAlign = settings.footerLogoSettings?.footerAlignment || 'left';
  const alignClass = fAlign === 'center' ? 'text-center' : fAlign === 'right' ? 'text-right' : 'text-left';
  const gridAlign = fAlign === 'center' ? 'items-center' : fAlign === 'right' ? 'items-end' : 'items-start';

  return (
    <footer 
      className={\`bg-card/50 border-t border-black/10 dark:border-white/5 backdrop-blur-md \${alignClass} transition-all duration-300\`}
      style={{
        paddingTop: \`\${pY * 0.25}rem\`,
        paddingBottom: \`\${pY * 0.25}rem\`,
        marginTop: \`\${mT * 0.25}rem\`
      }}
    >
      <div className={\`max-w-7xl mx-auto px-6 flex flex-col \${gridAlign}\`}>
        <div className={\`grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8 w-full \${fAlign === 'center' ? 'justify-items-center text-center' : fAlign === 'right' ? 'justify-items-end text-right' : 'justify-items-start text-left'}\`}>
          
          {/* Brand & Mission/Vision */}
          <div className={\`space-y-6 flex flex-col \${gridAlign}\`}>
            <div className={\`flex \${settings.footerLogoSettings?.position === 'top' ? 'flex-col' : 'flex-row'} \${gridAlign} gap-3\`}>
              {settings.footerLogoSettings?.showLogo !== false && settings.logoUrl && (
                <div className={\`relative \${settings.footerLogoSettings?.glowEffect ? 'before:absolute before:inset-0 before:bg-primary/20 before:blur-xl before:rounded-full before:animate-pulse' : ''} \${settings.footerLogoSettings?.glassEffect ? 'bg-white/5 backdrop-blur-md p-2 rounded-2xl border border-black/10 dark:border-white/10 shadow-xl' : ''}\`}>
                  <img 
                    src={settings.logoUrl} 
                    alt="Logo Footer" 
                    style={{ 
                      width: settings.footerLogoSettings?.width || 40, 
                      height: settings.footerLogoSettings?.height || 40 
                    }} 
                    className="object-contain relative z-10" 
                  />
                </div>
              )}
              {settings.footerLogoSettings?.showText !== false && (
                <span 
                  style={{ fontSize: settings.footerLogoSettings?.textSize || 24 }}
                  className={\`font-black tracking-tighter \${
                    settings.footerLogoSettings?.textEffect === 'neon' ? 'text-primary drop-shadow-[0_0_10px_rgba(var(--primary),0.8)]' :
                    settings.footerLogoSettings?.textEffect === 'minimalist' ? 'text-foreground/80 font-light tracking-widest' :
                    settings.footerLogoSettings?.textEffect === 'none' ? 'text-foreground' :
                    'bg-gradient-to-r from-primary to-orange-400 bg-clip-text text-transparent'
                  }\`}
                >
                  {settings.appName}
                </span>
              )}
            </div>
            
            {(settings.footerMission || settings.footerVision) && (
              <div className="space-y-4 text-sm text-slate-600 dark:text-slate-400">
                {settings.footerMission && (
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-slate-100 mb-1">Nuestra Misión</h4>
                    <p className="leading-relaxed">{settings.footerMission}</p>
                  </div>
                )}
                {settings.footerVision && (
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-slate-100 mb-1">Nuestra Visión</h4>
                    <p className="leading-relaxed">{settings.footerVision}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Contact & Socials */}
          <div className={\`space-y-6 flex flex-col \${gridAlign}\`}>
            <h4 className="font-bold text-lg text-slate-900 dark:text-slate-100">Contacto y Redes</h4>
            
            {settings.storeAddress && (
              <div className={\`flex gap-3 text-sm text-slate-600 dark:text-slate-400 \${gridAlign}\`}>
                <MapPin className="h-5 w-5 shrink-0 text-primary" />
                <p>{settings.storeAddress}</p>
              </div>
            )}

            <div className={\`flex flex-wrap gap-4 pt-2 \${fAlign === 'center' ? 'justify-center' : fAlign === 'right' ? 'justify-end' : 'justify-start'}\`}>
              {Array.isArray(settings.footerSocialLinks) && settings.footerSocialLinks.map((link) => (
                <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-black/5 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:text-primary transition-all duration-300 hover:scale-110 hover:-translate-y-2 hover:shadow-[0_10px_20px_rgba(var(--primary),0.3)] flex items-center justify-center">
                  {link.iconUrl ? (
                    <img src={link.iconUrl} alt={link.name} style={{ width: link.width, height: link.height }} className="object-contain" />
                  ) : (
                    <span className="text-xs font-bold">{link.name.substring(0,2)}</span>
                  )}
                </a>
              ))}
            </div>
          </div>

          {/* Partners */}
          {settings.footerPartners && settings.footerPartners.length > 0 && (
            <div className={\`space-y-6 flex flex-col \${gridAlign}\`}>
              <h4 className="font-bold text-lg text-slate-900 dark:text-slate-100">Socios Comerciales</h4>
              <div className={\`flex flex-wrap gap-4 \${fAlign === 'center' ? 'justify-center' : fAlign === 'right' ? 'justify-end' : 'justify-start'}\`}>
                
                {settings.footerPartners.map((partner) => (
                  <div key={partner.id} className="bg-white dark:bg-white/5 p-2 rounded-xl shadow-sm border border-black/5 dark:border-white/5 hover:scale-110 hover:-translate-y-2 hover:shadow-[0_10px_20px_rgba(var(--primary),0.3)] transition-all duration-300">
                    {partner.link ? (
                      <a href={partner.link} target="_blank" rel="noopener noreferrer">
                        <img src={partner.imageUrl} alt="Socio" style={{ width: partner.width, height: partner.height }} className="object-contain" />
                      </a>
                    ) : (
                      <img src={partner.imageUrl} alt="Socio" style={{ width: partner.width, height: partner.height }} className="object-contain" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        <div className="mt-12 pt-6 border-t border-black/10 dark:border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500 w-full">
          <p>© {new Date().getFullYear()} {settings.appName}. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
`;

fs.writeFileSync(p, c, 'utf8');
console.log('Fixed footer.tsx manually!');
