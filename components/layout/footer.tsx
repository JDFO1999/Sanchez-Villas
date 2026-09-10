import Link from "next/link";
import { useSettings } from "@/lib/settings-context";
import { MapPin } from "lucide-react";

export function Footer() {
  const { settings } = useSettings();

  return (
    <footer className="mt-12 bg-card/50 border-t border-black/10 dark:border-white/5 backdrop-blur-md pb-8 pt-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
          
          {/* Brand & Mission/Vision */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              {settings.logoUrl && (
                <img src={settings.logoUrl} alt="Logo" className="h-10 w-auto object-contain" />
              )}
              <span className="font-black text-2xl tracking-tighter bg-gradient-to-r from-primary to-orange-400 bg-clip-text text-transparent">{settings.appName}</span>
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
          <div className="space-y-6">
            <h4 className="font-bold text-lg text-slate-900 dark:text-slate-100">Contacto y Redes</h4>
            
            {settings.storeAddress && (
              <div className="flex gap-3 text-sm text-slate-600 dark:text-slate-400">
                <MapPin className="h-5 w-5 shrink-0 text-primary" />
                <p>{settings.storeAddress}</p>
              </div>
            )}

            <div className="flex gap-4 pt-2">
              
              
              
              {Array.isArray(settings.footerSocialLinks) && settings.footerSocialLinks.map((link) => (
                <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-black/5 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-primary hover:text-white transition flex items-center justify-center">
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
            <div className="space-y-6">
              <h4 className="font-bold text-lg text-slate-900 dark:text-slate-100">Socios Comerciales</h4>
              <div className="flex flex-wrap gap-4 items-center">
                
                {settings.footerPartners.map((partner) => (
                  <div key={partner.id} className="bg-white dark:bg-white/5 p-2 rounded-xl shadow-sm border border-black/5 dark:border-white/5 hover:scale-105 transition">
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

        <div className="mt-12 pt-6 border-t border-black/10 dark:border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} {settings.appName}. Todos los derechos reservados.</p>
          <p className="flex items-center gap-1">Powered by <span className="font-black text-primary">{settings.appName}</span></p>
        </div>
      </div>
    </footer>
  );
}
