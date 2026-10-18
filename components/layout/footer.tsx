import Link from "next/link";
import { useSettings } from "@/lib/settings-context";
import { useTheme } from "next-themes";
import { MapPin } from "lucide-react";

export function BaseFooter({ 
  settings, 
  themeOverride 
}: { 
  settings: any, 
  themeOverride?: string 
}) {
  const { theme, resolvedTheme } = useTheme();
  const currentTheme = themeOverride || resolvedTheme || theme;
  const isDark = currentTheme === 'dark';

  const footerSettings = settings.footerLogoSettings || {};
  const pY = footerSettings.footerPadding !== undefined ? footerSettings.footerPadding : 12;
  const mT = footerSettings.footerMarginTop !== undefined ? footerSettings.footerMarginTop : 0;
  
  const footerAddress = settings.landingSettings?.map?.address || settings.storeAddress;
  const layoutTheme = footerSettings.layoutTheme || 'modern';
  
  // Custom logo or default based on theme
  const logoSrc = footerSettings.customLogoUrl || (isDark 
    ? (settings.logoUrlDark || settings.logoUrl) 
    : (settings.logoUrl || settings.logoUrlDark));

  const isGlowActive = footerSettings.glowEffect !== false;
  const logoWidth = footerSettings.width || 60;
  const logoHeight = footerSettings.height || 60;

  // Alignment for columns/headings
  const alignment = footerSettings.footerAlignment || 'left';
  const alignItemsClass = (alignment === 'center' || alignment === 'justify') ? 'items-center' : alignment === 'right' ? 'items-end' : 'items-start';
  const textAlignClass = (alignment === 'center' || alignment === 'justify') ? 'text-center' : alignment === 'right' ? 'text-right' : 'text-left';
  const justifyClass = (alignment === 'center' || alignment === 'justify') ? 'justify-center' : alignment === 'right' ? 'justify-end' : 'justify-start';

  // Alignment for paragraph texts (Misión, Visión, Ubicación text): supports 'justify' and 'center' explicitly
  const textMode = footerSettings.footerTextAlign || (alignment === 'center' ? 'center' : alignment === 'right' ? 'right' : 'justify');
  const alignPClass = textMode === 'center' ? 'text-center' : textMode === 'left' ? 'text-left' : textMode === 'right' ? 'text-right' : 'text-justify';

  // Position: 'side' (horizontal) or 'top' / 'top-center' (vertical)
  const isLogoTop = footerSettings.position === 'top' || footerSettings.position === 'top-center';
  const isLogoTopCentered = footerSettings.position === 'top-center';
  const col1AlignItems = isLogoTopCentered ? 'items-center' : (isLogoTop ? alignItemsClass : 'items-start');
  const col1TextAlign = isLogoTopCentered ? 'text-center' : textAlignClass;
  // El texto del párrafo de Misión siempre respeta si el usuario eligió Justificado o Centrado
  const col1AlignP = alignPClass;

  // Text effect
  const getTextEffectClass = (effect?: string) => {
    switch (effect) {
      case 'neon':
        return 'text-primary drop-shadow-[0_0_12px_rgba(var(--primary),0.85)]';
      case 'minimalist':
        return 'text-foreground/80 font-light tracking-widest uppercase';
      case 'none':
        return 'text-foreground';
      case 'gradient':
      default:
        return 'bg-gradient-to-r from-primary via-orange-400 to-amber-500 bg-clip-text text-transparent';
    }
  };

  const textEffectClass = getTextEffectClass(footerSettings.textEffect);
  const showText = footerSettings.showText !== false && footerSettings.showAppName !== false;
  const textSize = footerSettings.textSize || 24;

  const renderLogo = (customW?: number, customH?: number) => {
    if (footerSettings.showLogo === false || !logoSrc) return null;
    const w = customW || logoWidth;
    const h = customH || logoHeight;

    return (
      <div 
        className={`shrink-0 relative flex items-center justify-center ${footerSettings.glassEffect ? 'bg-white/5 backdrop-blur-md p-2 rounded-2xl border border-black/10 dark:border-white/10 shadow-xl' : ''}`}
        style={{ width: `${w}px`, height: `${h}px` }}
      >
        {isGlowActive && (
          <div 
            className="absolute inset-0 rounded-full bg-primary/50 animate-logo-glow pointer-events-none"
            style={{ 
              boxShadow: '0 0 25px 8px hsl(var(--primary) / 0.45)',
              filter: 'blur(10px)'
            }} 
          />
        )}
        <img 
          src={logoSrc} 
          alt="Logo Footer" 
          style={{ width: `${w}px`, height: `${h}px` }} 
          className="object-contain relative z-10 transition-transform duration-300 hover:scale-105" 
        />
      </div>
    );
  };

  return (
    <footer 
      className="shrink-0 bg-card/50 border-t border-black/20 dark:border-white/10 backdrop-blur-md transition-all duration-300 relative"
      style={{
        paddingTop: `${pY * 0.25}rem`,
        paddingBottom: `${pY * 0.25}rem`,
        backgroundColor: footerSettings.bgColor ? footerSettings.bgColor : undefined,
        marginTop: `${mT * 0.25}rem`
      }}
    >
      {/* Decorative Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-black/70 dark:via-primary/50 to-transparent"></div>

      <div className="w-full px-6 md:px-12">
        
        {layoutTheme === 'modern' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8 w-full items-start">
            {/* Column 1: Brand Logo + Mission */}
            <div className={`flex ${isLogoTop ? 'flex-col' : 'flex-row'} ${col1AlignItems} gap-6`}>
              {renderLogo()}
              <div className={`flex flex-col gap-3 w-full ${col1TextAlign}`}>
                {showText && (
                  <span style={{ fontSize: textSize }} className={`font-black tracking-tighter ${textEffectClass}`}>
                    {settings.appName}
                  </span>
                )}
                {settings.footerMission && (
                  <div className={`text-sm text-muted-foreground w-full ${col1TextAlign}`}>
                    <h4 className="font-bold text-foreground mb-2">Nuestra Misión</h4>
                    <p className={`leading-relaxed ${col1AlignP}`}>{settings.footerMission}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Column 2: Vision + Contact & Socials */}
            <div className={`flex flex-col ${alignItemsClass} ${textAlignClass} space-y-8 w-full`}>
              {settings.footerVision && (
                <div className={`text-sm text-muted-foreground w-full ${textAlignClass}`}>
                  <h4 className="font-bold text-foreground mb-2">Nuestra Visión</h4>
                  <p className={`leading-relaxed ${alignPClass}`}>{settings.footerVision}</p>
                </div>
              )}
              <div className={`flex flex-col ${alignItemsClass} ${textAlignClass} space-y-4`}>
                <h4 className="font-bold text-lg text-foreground relative inline-block">
                  Redes y Contacto
                  <span className={`absolute -bottom-2 ${(alignment === 'center' || alignment === 'justify') ? 'left-1/2 -translate-x-1/2' : alignment === 'right' ? 'right-0' : 'left-0'} w-1/2 h-0.5 bg-primary/50 rounded-full`}></span>
                </h4>
                <div className={`flex flex-wrap ${justifyClass} gap-4 pt-2`}>
                  {Array.isArray(settings.footerSocialLinks) && settings.footerSocialLinks.map((link: any) => (
                    <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer" className="p-3 rounded-full bg-black/5 dark:bg-white/5 text-muted-foreground hover:text-primary transition-all duration-300 hover:scale-110 flex items-center justify-center group">
                      {link.iconUrl ? <img src={link.iconUrl} alt={link.name} style={{ width: link.width, height: link.height }} className="object-contain group-hover:brightness-110" /> : <span className="text-xs font-bold">{link.name.substring(0,2)}</span>}
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* Column 3: Partners & Location (Socios Comerciales y Ubicación SIEMPRE centrados, texto de ubicación justificable o centrado) */}
            <div className="flex flex-col items-center text-center space-y-8 w-full">
              {settings.footerPartners && settings.footerPartners.length > 0 && (
                <div className="flex flex-col items-center text-center w-full space-y-4">
                  <h4 className="font-bold text-lg text-foreground relative inline-block">
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
              {footerAddress && (
                <div className="flex flex-col items-center text-center gap-2 text-sm text-muted-foreground mt-auto w-full">
                  <div className="flex items-center justify-center gap-2 text-primary font-semibold">
                    <MapPin className="h-4 w-4 shrink-0" />
                    <span>Ubicación</span>
                  </div>
                  <p className={`max-w-xs w-full leading-relaxed ${alignPClass}`}>{footerAddress}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {layoutTheme === 'classic' && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 w-full items-start">
            <div className={`flex flex-col gap-4 ${col1TextAlign}`}>
              <div className={`flex ${isLogoTop ? 'flex-col' : 'flex-row'} ${col1AlignItems} gap-4`}>
                {renderLogo()}
                {showText && (
                  <span style={{ fontSize: textSize }} className={`font-black tracking-tighter ${textEffectClass}`}>{settings.appName}</span>
                )}
              </div>
              {footerAddress && (
                <div className="flex flex-col items-center text-center gap-2 text-sm text-muted-foreground mt-4 w-full">
                  <div className="flex items-center justify-center gap-1.5 text-primary font-semibold">
                    <MapPin className="h-4 w-4 shrink-0" />
                    <span>Ubicación</span>
                  </div>
                  <p className={`w-full leading-relaxed ${alignPClass}`}>{footerAddress}</p>
                </div>
              )}
            </div>
            
            <div className={textAlignClass}>
              <h4 className="font-bold text-foreground mb-4 uppercase tracking-wider text-sm">Misión</h4>
              {settings.footerMission && <p className={`text-sm text-muted-foreground leading-relaxed ${alignPClass}`}>{settings.footerMission}</p>}
            </div>

            <div className={textAlignClass}>
              <h4 className="font-bold text-foreground mb-4 uppercase tracking-wider text-sm">Visión</h4>
              {settings.footerVision && <p className={`text-sm text-muted-foreground leading-relaxed ${alignPClass}`}>{settings.footerVision}</p>}
            </div>

            <div className="flex flex-col gap-8 items-center text-center">
              <div className="text-center">
                <h4 className="font-bold text-foreground mb-4 uppercase tracking-wider text-sm">Síguenos</h4>
                <div className="flex flex-wrap justify-center gap-3">
                  {Array.isArray(settings.footerSocialLinks) && settings.footerSocialLinks.map((link: any) => (
                    <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer" className="p-2 rounded bg-black/5 dark:bg-white/5 text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-all flex items-center justify-center">
                      {link.iconUrl ? <img src={link.iconUrl} alt={link.name} style={{ width: link.width*0.8, height: link.height*0.8 }} className="object-contain" /> : <span className="text-xs font-bold">{link.name.substring(0,2)}</span>}
                    </a>
                  ))}
                </div>
              </div>
              
              {settings.footerPartners && settings.footerPartners.length > 0 && (
                <div className="text-center w-full">
                  <h4 className="font-bold text-foreground mb-4 uppercase tracking-wider text-sm">Socios Comerciales</h4>
                  <div className="flex flex-wrap justify-center gap-4">
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
              {renderLogo(logoWidth, logoHeight)}
              {showText && (
                <span style={{ fontSize: textSize }} className={`font-black tracking-tighter ${textEffectClass}`}>{settings.appName}</span>
              )}
            </div>
            
            {(settings.footerMission || settings.footerVision) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm text-muted-foreground w-full">
                {settings.footerMission && (
                  <div>
                    <h4 className="font-bold text-foreground mb-2 uppercase tracking-widest text-xs">Misión</h4>
                    <p className={`leading-relaxed ${alignPClass}`}>{settings.footerMission}</p>
                  </div>
                )}
                {settings.footerVision && (
                  <div>
                    <h4 className="font-bold text-foreground mb-2 uppercase tracking-widest text-xs">Visión</h4>
                    <p className={`leading-relaxed ${alignPClass}`}>{settings.footerVision}</p>
                  </div>
                )}
              </div>
            )}
            
            <div className="flex flex-wrap justify-center gap-6">
              {Array.isArray(settings.footerSocialLinks) && settings.footerSocialLinks.map((link: any) => (
                <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2">
                  {link.iconUrl ? <img src={link.iconUrl} alt={link.name} style={{ width: 20, height: 20 }} className="object-contain" /> : null}
                  <span className="font-medium text-sm">{link.name}</span>
                </a>
              ))}
            </div>
            
            {footerAddress && (
              <div className="flex flex-col items-center justify-center gap-2 text-sm text-muted-foreground w-full">
                <div className="flex items-center justify-center gap-2 text-primary font-semibold">
                  <MapPin className="h-4 w-4 shrink-0" />
                  <span>Ubicación</span>
                </div>
                <p className={`max-w-md w-full leading-relaxed ${alignPClass}`}>{footerAddress}</p>
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

        <div className="mt-12 pt-6 border-t border-black/10 dark:border-white/5 flex flex-col justify-center items-center gap-4 text-xs text-muted-foreground w-full text-center">
          <p>{footerSettings.copyrightText || `© ${new Date().getFullYear()} ${settings.appName}. Todos los derechos reservados.`}</p>
        </div>
      </div>
    </footer>
  );
}

export function Footer() {
  const { settings } = useSettings();
  return <BaseFooter settings={settings} />;
}
