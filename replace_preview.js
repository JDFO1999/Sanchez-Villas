const fs = require('fs');
let c = fs.readFileSync('app/ajustes/page.tsx', 'utf8');

// 1. Remove old small preview
c = c.replace(/\{\/\* Live Preview Box \*\/\}[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/, '</div></div>');

// 2. Add full preview before the save button
const saveBtn = `              <div className="flex justify-end pt-6 border-t border-black/10 dark:border-white/10">`;

const fullPreview = `
                    {/* VISTA PREVIA COMPLETA DEL FOOTER */}
                    <div className="mt-8 pt-8 border-t border-black/10 dark:border-white/10">
                      <h3 className="text-sm font-bold text-muted-foreground mb-4 uppercase tracking-wider">Vista Previa del Footer</h3>
                      
                      <div className="w-full bg-card/50 border border-black/10 dark:border-white/5 backdrop-blur-md rounded-xl overflow-hidden relative"
                           style={{
                             paddingTop: \`\${(footerLogoSettings.footerPadding ?? 12) * 0.25}rem\`,
                             paddingBottom: \`\${(footerLogoSettings.footerPadding ?? 12) * 0.25}rem\`,
                             marginTop: \`\${(footerLogoSettings.footerMarginTop ?? 0) * 0.25}rem\`
                           }}>
                        {/* Decorative Glow */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>

                        <div className="w-full px-6 md:px-12">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8 w-full items-start scale-[0.8] transform origin-top pb-12">
                            
                            {/* Column 1 */}
                            <div className="flex flex-row items-start gap-6">
                              {footerLogoSettings?.showLogo !== false && logoUrl && (
                                <div className={\`shrink-0 relative \${footerLogoSettings?.glowEffect ? 'before:absolute before:inset-0 before:bg-primary/20 before:blur-xl before:rounded-full before:animate-pulse' : ''} \${footerLogoSettings?.glassEffect ? 'bg-white/5 backdrop-blur-md p-2 rounded-2xl border border-black/10 dark:border-white/10 shadow-xl' : ''}\`}>
                                  <img 
                                    src={logoUrl} 
                                    alt="Logo Footer" 
                                    style={{ width: footerLogoSettings?.width || 60, height: footerLogoSettings?.height || 60 }} 
                                    className="object-contain relative z-10" 
                                  />
                                </div>
                              )}
                              
                              <div className="flex flex-col gap-3">
                                {footerLogoSettings?.showText !== false && (
                                  <span 
                                    style={{ fontSize: footerLogoSettings?.textSize || 24 }}
                                    className={\`font-black tracking-tighter \${
                                      footerLogoSettings?.textEffect === 'neon' ? 'text-primary drop-shadow-[0_0_10px_rgba(var(--primary),0.8)]' :
                                      footerLogoSettings?.textEffect === 'minimalist' ? 'text-foreground/80 font-light tracking-widest' :
                                      footerLogoSettings?.textEffect === 'none' ? 'text-foreground' :
                                      'bg-gradient-to-r from-primary to-orange-400 bg-clip-text text-transparent'
                                    }\`}
                                  >
                                    {appName}
                                  </span>
                                )}
                                
                                {footerMission && (
                                  <div className="text-sm text-slate-600 dark:text-slate-400">
                                    <h4 className="font-bold text-slate-900 dark:text-slate-100 mb-2">Nuestra Misión</h4>
                                    <p className="leading-relaxed text-justify">{footerMission}</p>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Column 2 */}
                            <div className="flex flex-col items-center text-center space-y-8">
                              {footerVision && (
                                <div className="text-sm text-slate-600 dark:text-slate-400">
                                  <h4 className="font-bold text-slate-900 dark:text-slate-100 mb-2">Nuestra Visión</h4>
                                  <p className="leading-relaxed text-justify">{footerVision}</p>
                                </div>
                              )}
                              <div className="flex flex-col items-center text-center space-y-4">
                                <h4 className="font-bold text-lg text-slate-900 dark:text-slate-100 relative inline-block">
                                  Redes y Contacto
                                  <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1/2 h-0.5 bg-primary/50 rounded-full"></span>
                                </h4>
                                <div className="flex flex-wrap justify-center gap-4 pt-2">
                                  {footerSocialLinks.map((link: any) => (
                                    <div key={link.id} className="p-3 rounded-full bg-black/5 dark:bg-white/5 text-slate-600 dark:text-slate-400 transition-all duration-300 flex items-center justify-center">
                                      {link.iconUrl ? (
                                        <img src={link.iconUrl} alt={link.name} style={{ width: link.width, height: link.height }} className="object-contain" />
                                      ) : (
                                        <span className="text-xs font-bold">{link.name.substring(0,2)}</span>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>

                            {/* Column 3 */}
                            <div className="flex flex-col items-center text-center space-y-8">
                              {footerPartners && footerPartners.length > 0 && (
                                <div className="flex flex-col items-center w-full space-y-4">
                                  <h4 className="font-bold text-lg text-slate-900 dark:text-slate-100 relative inline-block">
                                    Socios Comerciales
                                    <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1/2 h-0.5 bg-primary/50 rounded-full"></span>
                                  </h4>
                                  <div className="flex flex-wrap justify-center gap-6 pt-2">
                                    {footerPartners.map((partner: any) => (
                                      <div key={partner.id} className="opacity-80 grayscale dark:bg-white/90 dark:p-2 dark:rounded-xl dark:border dark:border-white/20">
                                        <div className="flex items-center justify-center">
                                          <img src={partner.imageUrl} alt="Socio" style={{ width: partner.width, height: partner.height }} className="object-contain drop-shadow-md" />
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                              
                              {storeAddress && (
                                <div className="flex flex-col items-center text-center gap-2 text-sm text-slate-600 dark:text-slate-400 mt-auto">
                                  <div className="flex items-center gap-2 text-primary font-semibold">
                                    <MapPin className="h-4 w-4" />
                                    <span>Ubicación</span>
                                  </div>
                                  <p className="max-w-xs">{storeAddress}</p>
                                </div>
                              )}
                            </div>

                          </div>
                        </div>
                      </div>
                    </div>

` + saveBtn;

c = c.replace(saveBtn, fullPreview);

fs.writeFileSync('app/ajustes/page.tsx', c);
console.log("Replaced");
