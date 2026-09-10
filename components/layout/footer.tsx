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
              {settings.footerSocialLinks?.instagram && (
                <a href={settings.footerSocialLinks.instagram} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-black/5 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-primary hover:text-white transition">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
                </a>
              )}
              {settings.footerSocialLinks?.facebook && (
                <a href={settings.footerSocialLinks.facebook} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-black/5 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-primary hover:text-white transition">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                </a>
              )}
              {settings.footerSocialLinks?.tiktok && (
                <a href={settings.footerSocialLinks.tiktok} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-black/5 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-primary hover:text-white transition flex items-center justify-center">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"/></svg>
                </a>
              )}
            </div>
          </div>

          {/* Partners */}
          {settings.footerPartners && settings.footerPartners.length > 0 && (
            <div className="space-y-6">
              <h4 className="font-bold text-lg text-slate-900 dark:text-slate-100">Socios Comerciales</h4>
              <div className="flex flex-wrap gap-4 items-center">
                {settings.footerPartners.map((partner, idx) => (
                  <div key={idx} className="bg-white dark:bg-white/5 p-2 rounded-xl shadow-sm border border-black/5 dark:border-white/5 hover:scale-105 transition">
                    <img src={partner} alt="Socio" className="h-10 w-auto object-contain" />
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        <div className="mt-12 pt-6 border-t border-black/10 dark:border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} {settings.appName}. Todos los derechos reservados.</p>
          <p className="flex items-center gap-1">Powered by <span className="font-black text-primary">GymPro</span></p>
        </div>
      </div>
    </footer>
  );
}
