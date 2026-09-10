const fs = require('fs');
let c = fs.readFileSync('components/layout/footer.tsx', 'utf8');

// Update social links rendering
c = c.replace(/\{settings\.footerSocialLinks\?\.instagram[\s\S]*?<\/a>\s*\)\}/, '');
c = c.replace(/\{settings\.footerSocialLinks\?\.facebook[\s\S]*?<\/a>\s*\)\}/, '');
c = c.replace(/\{settings\.footerSocialLinks\?\.tiktok[\s\S]*?<\/a>\s*\)\}/, `
              {Array.isArray(settings.footerSocialLinks) && settings.footerSocialLinks.map((link) => (
                <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-black/5 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-primary hover:text-white transition flex items-center justify-center">
                  {link.iconUrl ? (
                    <img src={link.iconUrl} alt={link.name} style={{ width: link.width, height: link.height }} className="object-contain" />
                  ) : (
                    <span className="text-xs font-bold">{link.name.substring(0,2)}</span>
                  )}
                </a>
              ))}
`);

// Update partners rendering
c = c.replace(/\{settings\.footerPartners\.map\(\(partner, idx\) => \([\s\S]*?\)\)\}/, `
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
`);

fs.writeFileSync('components/layout/footer.tsx', c, 'utf8');
console.log("Fixed footer");
