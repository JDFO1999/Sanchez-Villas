const fs = require('fs');
let c = fs.readFileSync('app/ajustes/page.tsx', 'utf8');

const newFooterBlock = `
                {/* Footer Settings */}
                <div className="pt-6 border-t border-black/10 dark:border-white/10 mt-6 space-y-8">
                  <h3 className="text-lg font-bold flex items-center gap-2 text-primary">Footer y Marca</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground block">Misión</label>
                      <textarea 
                        value={footerMission}
                        onChange={(e) => setFooterMission(e.target.value)}
                        className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-lg p-3 text-sm focus:border-primary min-h-[100px]" 
                        placeholder="Misión de la empresa..."
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground block">Visión</label>
                      <textarea 
                        value={footerVision}
                        onChange={(e) => setFooterVision(e.target.value)}
                        className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-lg p-3 text-sm focus:border-primary min-h-[100px]" 
                        placeholder="Visión de la empresa..."
                      />
                    </div>
                  </div>

                  {/* Redes Sociales Dinámicas */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-muted-foreground block">Redes Sociales</label>
                      <button type="button" onClick={() => setFooterSocialLinks([...footerSocialLinks, { id: Date.now().toString(), name: 'Nueva', url: '', width: 24, height: 24 }])} className="bg-transparent border border-primary text-primary hover:bg-primary/10 text-xs px-3 py-1.5 rounded-lg transition font-bold">+ Agregar Red</button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {footerSocialLinks.map((link, idx) => (
                        <div key={link.id || idx} className="bg-black/5 dark:bg-white/5 p-4 rounded-xl border border-black/10 dark:border-white/10 space-y-4 relative group hover:shadow-md transition">
                          <button type="button" onClick={() => setFooterSocialLinks(footerSocialLinks.filter((_, i) => i !== idx))} className="absolute top-2 right-2 text-red-500 opacity-0 group-hover:opacity-100 transition p-1 hover:bg-red-500/10 rounded-lg">&times;</button>
                          
                          <div className="flex gap-4">
                            <div className="w-16 h-16 shrink-0 bg-black/10 dark:bg-black/40 rounded-xl overflow-hidden flex items-center justify-center border border-black/10 dark:border-white/10 relative">
                              {link.iconUrl ? (
                                <img src={link.iconUrl} alt={link.name} className="w-full h-full object-contain p-2" />
                              ) : (
                                <span className="text-xs text-muted-foreground">Icono</span>
                              )}
                              <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => {
                                const file = e.target.files?.[0];
                                if(file){
                                  const reader = new FileReader();
                                  reader.onloadend = () => {
                                    const arr = [...footerSocialLinks];
                                    arr[idx].iconUrl = reader.result;
                                    setFooterSocialLinks(arr);
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }} />
                            </div>
                            <div className="flex-1 space-y-2">
                              <input type="text" placeholder="Nombre (Ej. Instagram)" value={link.name} onChange={e => { const arr = [...footerSocialLinks]; arr[idx].name = e.target.value; setFooterSocialLinks(arr); }} className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-lg p-2 text-sm focus:border-primary" />
                              <input type="text" placeholder="URL (https://...)" value={link.url} onChange={e => { const arr = [...footerSocialLinks]; arr[idx].url = e.target.value; setFooterSocialLinks(arr); }} className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-lg p-2 text-sm focus:border-primary" />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-muted-foreground">Tamaño (Ancho/Alto):</span>
                              <input type="number" value={link.width} onChange={e => { const arr = [...footerSocialLinks]; arr[idx].width = Number(e.target.value) || 24; arr[idx].height = Number(e.target.value) || 24; setFooterSocialLinks(arr); }} className="w-16 bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded p-1 text-xs text-center" />
                            </div>
                            <input type="range" min="10" max="100" value={link.width} onChange={e => { const arr = [...footerSocialLinks]; arr[idx].width = Number(e.target.value); arr[idx].height = Number(e.target.value); setFooterSocialLinks(arr); }} className="w-full accent-primary" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Socios Comerciales Dinámicos */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-muted-foreground block">Socios Comerciales (Logos)</label>
                      <button type="button" onClick={() => setFooterPartners([...footerPartners, { id: Date.now().toString(), imageUrl: '', link: '', width: 100, height: 40 }])} className="bg-transparent border border-primary text-primary hover:bg-primary/10 text-xs px-3 py-1.5 rounded-lg transition font-bold">+ Agregar Socio</button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {footerPartners.map((partner, idx) => (
                        <div key={partner.id || idx} className="bg-black/5 dark:bg-white/5 p-4 rounded-xl border border-black/10 dark:border-white/10 space-y-4 relative group hover:shadow-md transition">
                          <button type="button" onClick={() => setFooterPartners(footerPartners.filter((_, i) => i !== idx))} className="absolute top-2 right-2 text-red-500 opacity-0 group-hover:opacity-100 transition p-1 hover:bg-red-500/10 rounded-lg">&times;</button>
                          
                          <div className="flex gap-4">
                            <div className="w-20 h-20 shrink-0 bg-white dark:bg-white/10 rounded-xl overflow-hidden flex items-center justify-center border border-black/10 dark:border-white/10 relative">
                              {partner.imageUrl ? (
                                <img src={partner.imageUrl} alt="Socio" className="w-full h-full object-contain p-1" />
                              ) : (
                                <span className="text-xs text-muted-foreground text-center">Subir<br/>Logo</span>
                              )}
                              <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => {
                                const file = e.target.files?.[0];
                                if(file){
                                  const reader = new FileReader();
                                  reader.onloadend = () => {
                                    const arr = [...footerPartners];
                                    arr[idx].imageUrl = reader.result;
                                    setFooterPartners(arr);
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }} />
                            </div>
                            <div className="flex-1 space-y-2 flex flex-col justify-center">
                              <input type="text" placeholder="URL (Opcional)" value={partner.link || ''} onChange={e => { const arr = [...footerPartners]; arr[idx].link = e.target.value; setFooterPartners(arr); }} className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-lg p-2 text-sm focus:border-primary" />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <div className="flex justify-between items-center">
                                <span className="text-xs text-muted-foreground">Ancho:</span>
                                <input type="number" value={partner.width} onChange={e => { const arr = [...footerPartners]; arr[idx].width = Number(e.target.value) || 100; setFooterPartners(arr); }} className="w-16 bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded p-1 text-xs text-center" />
                              </div>
                              <input type="range" min="20" max="300" value={partner.width} onChange={e => { const arr = [...footerPartners]; arr[idx].width = Number(e.target.value); setFooterPartners(arr); }} className="w-full accent-primary" />
                            </div>
                            <div className="space-y-2">
                              <div className="flex justify-between items-center">
                                <span className="text-xs text-muted-foreground">Alto:</span>
                                <input type="number" value={partner.height} onChange={e => { const arr = [...footerPartners]; arr[idx].height = Number(e.target.value) || 40; setFooterPartners(arr); }} className="w-16 bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded p-1 text-xs text-center" />
                              </div>
                              <input type="range" min="10" max="200" value={partner.height} onChange={e => { const arr = [...footerPartners]; arr[idx].height = Number(e.target.value); setFooterPartners(arr); }} className="w-full accent-primary" />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
`;

// Also, the Logo needs a slider. Let's find where Logo Settings are.
/*
                {/* Logo Visibility & Size *}
                <div className="space-y-4 pt-4 border-t border-black/5 dark:border-white/5 md:col-span-2">
*/

const oldFooterRegex = /\{\/\* Footer Settings \*\/\}[\s\S]*?(?=<div className="pt-6 border-t border-black\/10 dark:border-white\/10 flex justify-end mt-6">)/;

c = c.replace(oldFooterRegex, newFooterBlock);

fs.writeFileSync('app/ajustes/page.tsx', c, 'utf8');
console.log("Updated Footer builder");
