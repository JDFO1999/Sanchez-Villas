import Link from "next/link";
import { useSettings } from "@/lib/settings-context";
import { MapPin } from "lucide-react";

export function BaseFooter({ 
  settings, 
  themeOverride 
}: { 
  settings: any, 
  themeOverride?: string 
}) {
  const pY = settings.footerLogoSettings?.footerPadding !== undefined ? settings.footerLogoSettings.footerPadding : 12;
  const mT = settings.footerLogoSettings?.footerMarginTop !== undefined ? settings.footerLogoSettings.footerMarginTop : 0;
  
  const layoutTheme = themeOverride || settings.footerLogoSettings?.layoutTheme || 'modern';

  return (
    <footer 
      className="shrink-0 bg-card/50 border-t border-black/10 dark:border-white/5 backdrop-blur-md transition-all duration-300 relative"
      style={{
        paddingTop: `${pY * 0.25}rem`,
        paddingBottom: `${pY * 0.25}rem`,
        backgroundColor: settings.footerLogoSettings?.bgColor && settings.footerLogoSettings.bgColor !== "#000000" ? settings.footerLogoSettings.bgColor : undefined,
        marginTop: `${mT * 0.25}rem`
      }}
    >
      {/* Decorative Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>

      <div className="w-full px-6 md:px-12">
        
        {layoutTheme === 'modern' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8 w-full items-start">
            {/* Column 1: Brand Logo + Mission */}
            <div className="flex flex-row items-start gap-6">
              {settings.footerLogoSettings?.showLogo !== false && settings.logoUrl && (
                <div className={`shrink-0 relative ${settings.footerLogoSettings?.glowEffect ? 'before:absolute before:inset-0 before:bg-primary/20 before:blur-xl before:rounded-full before:animate-pulse' : ''} ${settings.footerLogoSettings?.glassEffect ? 'bg-white/5 backdrop-blur-md p-2 rounded-2xl border border-black/10 dark:border-white/10 shadow-xl' : ''}`}>
                  <img src={settings.logoUrl} alt="Logo Footer" style={{ width: settings.footerLogoSettings?.width || 60, height: settings.footerLogoSettings?.height || 60 }} className="object-contain relative z-10" />
                </div>
              )}
              <div className="flex flex-col gap-3">
                {settings.footerLogoSettings?.showText !== false && settings.footerLogoSettings?.showAppName !== false && (
                  <span style={{ fontSize: settings.footerLogoSettings?.textSize || 24 }} className="font-black tracking-tighter text-foreground">{settings.appName}</span>
                )}
                {settings.footerMission && (
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    <h4 className="font-bold text-slate-900 dark:text-slate-100 mb-2">Nuestra Misión</h4>
                    <p className="leading-relaxed text-justify">{settings.footerMission}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Column 2: Vision + Contact & Socials */}
            <div className="flex flex-col items-center text-center space-y-8">
              {settings.footerVision && (
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  <h4 className="font-bold text-slate-900 dark:text-slate-100 mb-2">Nuestra Visión</h4>
                  <p className="leading-relaxed text-justify">{settings.footerVision}</p>
                </div>
              )}
              <div className="flex flex-col items-center text-center space-y-4">
                <h4 className="font-bold text-lg text-slate-900 dark:text-slate-100 relative inline-block">
                  Redes y Contacto
                  <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1/2 h-0.5 bg-primary/50 rounded-full"></span>
                </h4>
                <div className="flex flex-wrap justify-center gap-4 pt-2">
                  {Array.isArray(settings.footerSocialLinks) && settings.footerSocialLinks.map((link: any) => (
                    <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer" className="p-3 rounded-full bg-black/5 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:text-primary transition-all duration-300 hover:scale-110 flex items-center justify-center group">
                      {link.iconUrl ? <img src={link.iconUrl} alt={link.name} style={{ width: link.width, height: link.height }} className="object-contain group-hover:brightness-110" /> : <span className="text-xs font-bold">{link.name.substring(0,2)}</span>}
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* Column 3: Partners & Location */}
            <div className="flex flex-col items-center text-center space-y-8">
              {settings.footerPartners && settings.footerPartners.length > 0 && (
                <div className="flex flex-col items-center w-full space-y-4">
                  <h4 className="font-bold text-lg text-slate-900 dark:text-slate-100 relative inline-block">
                    Socios Comerciales
                    <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1/2 h-0.5 bg-primary/50 rounded-full"></span>
                  </h4>
                  <div className="flex flex-wrap justify-center gap-6 pt-2">
                    {settings.footerPartners.map((partner: any) => (
                      <div key={partner.id} className="opacity-80 hover:opacity-100 grayscale hover:grayscale-0 dark:bg-white/90 dark:p-2 dark:rounded-xl dark:border dark:border-white/20">
                        {partner.link ? (
                          <a href={partner.link} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center"><img src={partner.imageUrl} alt="Socio" style={{ width: partner.width, height: partner.height }} className="object-contain drop-shadow-md" /></a>
                        ) : (
                          <div className="flex items-center justify-center"><img src={partner.imageUrl} alt="Socio" style={{ width: partner.width, height: partner.height }} className="object-contain drop-shadow-md" /></div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {settings.storeAddress && (
                <div className="flex flex-col items-center text-center gap-2 text-sm text-slate-600 dark:text-slate-400 mt-auto">
                  <div className="flex items-center gap-2 text-primary font-semibold"><MapPin className="h-4 w-4" /><span>Ubicación</span></div>
                  <p className="max-w-xs">{settings.storeAddress}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {layoutTheme === 'classic' && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 w-full items-start text-left">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-4">
                {settings.footerLogoSettings?.showLogo !== false && settings.logoUrl && (
                  <img src={settings.logoUrl} alt="Logo Footer" style={{ width: settings.footerLogoSettings?.width || 60, height: settings.footerLogoSettings?.height || 60 }} className="object-contain" />
                )}
                {settings.footerLogoSettings?.showText !== false && (
                  <span style={{ fontSize: settings.footerLogoSettings?.textSize || 24 }} className="font-black tracking-tighter text-foreground">{settings.appName}</span>
                )}
              </div>
              {settings.storeAddress && (
                <div className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400 mt-4">
                  <MapPin className="h-5 w-5 shrink-0 text-primary" />
                  <p>{settings.storeAddress}</p>
                </div>
              )}
            </div>
            
            <div>
              <h4 className="font-bold text-slate-900 dark:text-slate-100 mb-4 uppercase tracking-wider text-sm">Misión</h4>
              {settings.footerMission && <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{settings.footerMission}</p>}
            </div>

            <div>
              <h4 className="font-bold text-slate-900 dark:text-slate-100 mb-4 uppercase tracking-wider text-sm">Visión</h4>
              {settings.footerVision && <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{settings.footerVision}</p>}
            </div>

            <div className="flex flex-col gap-8">
              <div>
                <h4 className="font-bold text-slate-900 dark:text-slate-100 mb-4 uppercase tracking-wider text-sm">Síguenos</h4>
                <div className="flex flex-wrap gap-3">
                  {Array.isArray(settings.footerSocialLinks) && settings.footerSocialLinks.map((link: any) => (
                    <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer" className="p-2 rounded bg-black/5 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-primary hover:text-primary-foreground transition-all flex items-center justify-center">
                      {link.iconUrl ? <img src={link.iconUrl} alt={link.name} style={{ width: link.width*0.8, height: link.height*0.8 }} className="object-contain" /> : <span className="text-xs font-bold">{link.name.substring(0,2)}</span>}
                    </a>
                  ))}
                </div>
              </div>
              
              {settings.footerPartners && settings.footerPartners.length > 0 && (
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-slate-100 mb-4 uppercase tracking-wider text-sm">Partners</h4>
                  <div className="flex flex-wrap gap-4">
                    {settings.footerPartners.map((partner: any) => (
                      <div key={partner.id} className="opacity-80 hover:opacity-100 dark:bg-white/90 dark:p-1 dark:rounded">
                        <img src={partner.imageUrl} alt="Socio" style={{ width: partner.width*0.8, height: partner.height*0.8 }} className="object-contain" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {layoutTheme === 'minimalist' && (
          <div className="flex flex-col items-center text-center max-w-3xl mx-auto space-y-10">
            <div className="flex flex-col items-center gap-4">
              {settings.footerLogoSettings?.showLogo !== false && settings.logoUrl && (
                <img src={settings.logoUrl} alt="Logo Footer" style={{ width: settings.footerLogoSettings?.width || 80, height: settings.footerLogoSettings?.height || 80 }} className="object-contain" />
              )}
              {settings.footerLogoSettings?.showText !== false && (
                <span style={{ fontSize: settings.footerLogoSettings?.textSize || 28 }} className="font-black tracking-tighter text-foreground">{settings.appName}</span>
              )}
            </div>
            
            {(settings.footerMission || settings.footerVision) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm text-slate-600 dark:text-slate-400">
                {settings.footerMission && (
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-slate-100 mb-2 uppercase tracking-widest text-xs">Misión</h4>
                    <p className="leading-relaxed">{settings.footerMission}</p>
                  </div>
                )}
                {settings.footerVision && (
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-slate-100 mb-2 uppercase tracking-widest text-xs">Visión</h4>
                    <p className="leading-relaxed">{settings.footerVision}</p>
                  </div>
                )}
              </div>
            )}
            
            <div className="flex flex-wrap justify-center gap-6">
              {Array.isArray(settings.footerSocialLinks) && settings.footerSocialLinks.map((link: any) => (
                <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-primary transition-colors flex items-center gap-2">
                  {link.iconUrl ? <img src={link.iconUrl} alt={link.name} style={{ width: 20, height: 20 }} className="object-contain" /> : null}
                  <span className="font-medium text-sm">{link.name}</span>
                </a>
              ))}
            </div>
            
            {settings.storeAddress && (
              <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
                <MapPin className="h-4 w-4" />
                <p>{settings.storeAddress}</p>
              </div>
            )}
            
            {settings.footerPartners && settings.footerPartners.length > 0 && (
              <div className="pt-8 border-t border-black/5 dark:border-white/5 w-full flex flex-col items-center gap-4">
                <span className="text-xs text-muted-foreground uppercase tracking-widest">Con el respaldo de</span>
                <div className="flex flex-wrap justify-center gap-8">
                  {settings.footerPartners.map((partner: any) => (
                    <div key={partner.id} className="opacity-50 hover:opacity-100 grayscale transition-all dark:bg-white/90 dark:p-1 dark:rounded">
                      <img src={partner.imageUrl} alt="Socio" style={{ width: partner.width, height: partner.height }} className="object-contain" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="mt-12 pt-6 border-t border-black/10 dark:border-white/5 flex flex-col justify-center items-center gap-4 text-xs text-slate-500 w-full text-center">
          <p>{settings.footerLogoSettings?.copyrightText || `© ${new Date().getFullYear()} ${settings.appName}. Todos los derechos reservados.`}</p>
        </div>
      </div>
    </footer>
  );
}

export function Footer() {
  const { settings } = useSettings();
  return <BaseFooter settings={settings} />;
}
