const fs = require('fs');
let c = fs.readFileSync('app/ajustes/page.tsx', 'utf8');

// 1. Inject state variables
const stateBlock = `  const [storeTicketWidth, setStoreTicketWidth] = useState(settings.storeTicketWidth || '80mm')
  
  const [footerMission, setFooterMission] = useState(settings.footerMission || "")
  const [footerVision, setFooterVision] = useState(settings.footerVision || "")
  const [footerSocialLinks, setFooterSocialLinks] = useState(settings.footerSocialLinks || {instagram:'', facebook:'', tiktok:''})
  const [footerPartners, setFooterPartners] = useState<string[]>(settings.footerPartners || [])
  const [partnerInput, setPartnerInput] = useState("")`;

c = c.replace(/  const \[storeTicketWidth, setStoreTicketWidth\] = useState\(settings\.storeTicketWidth \|\| '80mm'\)/, stateBlock);

// 2. Inject handleSave updates
const handleSaveBlock = `      updateSettings({
        appName,
        primaryColor,
        secondaryColor,
        borderColor,
        isGlass,
        fontFamily: fontFamily as any,
        logoUrl,
        logoSettings,
        storeCurrency,
        storeCurrencySecondary,
        storeExchangeRate,
        storeTaxRate,
        storeReceiptMessage,
        storeNextInvoice,
        storeRif,
        storeAddress,
        storeUseThermalPrinter,
        storePaymentInstructions,
        storePaymentQRs,
        storeTicketWidth: storeTicketWidth as any,
        coachCustomPricing,
        gymCommissionPercentage,
        biometricFields,
        footerMission,
        footerVision,
        footerSocialLinks,
        footerPartners
      })`;

c = c.replace(/      updateSettings\(\{[\s\S]*?storeReceiptMessage,/, handleSaveBlock.split('storeReceiptMessage,')[0] + 'storeReceiptMessage,');

// 3. Inject UI Section inside the form
const footerSection = `
              {/* Footer Settings */}
              <div className="pt-6 border-t border-black/10 dark:border-white/10">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-primary">Footer y Marca</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground block">Misión</label>
                    <textarea 
                      value={footerMission}
                      onChange={(e) => setFooterMission(e.target.value)}
                      className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-lg p-3 text-sm text-foreground focus:outline-none focus:border-primary min-h-[100px]" 
                      placeholder="Misión de la empresa..."
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground block">Visión</label>
                    <textarea 
                      value={footerVision}
                      onChange={(e) => setFooterVision(e.target.value)}
                      className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-lg p-3 text-sm text-foreground focus:outline-none focus:border-primary min-h-[100px]" 
                      placeholder="Visión de la empresa..."
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium text-muted-foreground block">Redes Sociales (URLs)</label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <input type="text" placeholder="Instagram URL" value={footerSocialLinks.instagram} onChange={e => setFooterSocialLinks({...footerSocialLinks, instagram: e.target.value})} className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-lg p-3 text-sm focus:border-primary" />
                      <input type="text" placeholder="Facebook URL" value={footerSocialLinks.facebook} onChange={e => setFooterSocialLinks({...footerSocialLinks, facebook: e.target.value})} className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-lg p-3 text-sm focus:border-primary" />
                      <input type="text" placeholder="TikTok URL" value={footerSocialLinks.tiktok} onChange={e => setFooterSocialLinks({...footerSocialLinks, tiktok: e.target.value})} className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-lg p-3 text-sm focus:border-primary" />
                    </div>
                  </div>
                  
                  {/* Partners / Socios Comerciales */}
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium text-muted-foreground block">Socios Comerciales (URLs de Logos)</label>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        value={partnerInput}
                        onChange={(e) => setPartnerInput(e.target.value)}
                        className="flex-1 bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-lg p-3 text-sm focus:border-primary" 
                        placeholder="Pega la URL del logo y presiona Enter..."
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            if (partnerInput.trim()) {
                              setFooterPartners([...footerPartners, partnerInput.trim()]);
                              setPartnerInput("");
                            }
                          }
                        }}
                      />
                      <button 
                        type="button"
                        onClick={() => {
                          if (partnerInput.trim()) {
                            setFooterPartners([...footerPartners, partnerInput.trim()]);
                            setPartnerInput("");
                          }
                        }}
                        className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-bold"
                      >
                        Añadir
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-4 mt-4">
                      {footerPartners.map((p, idx) => (
                        <div key={idx} className="relative group p-2 border border-black/10 dark:border-white/10 rounded-xl bg-white dark:bg-black/20">
                          <img src={p} alt="Socio" className="h-10 w-auto object-contain" />
                          <button 
                            type="button" 
                            onClick={() => setFooterPartners(footerPartners.filter((_, i) => i !== idx))}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition shadow-lg"
                          >
                            &times;
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
`;

c = c.replace(/              <div className="flex justify-end pt-4 border-t border-black\/10 dark:border-white\/10">/, footerSection + '\n              <div className="flex justify-end pt-4 border-t border-black/10 dark:border-white/10">');

fs.writeFileSync('app/ajustes/page.tsx', c, 'utf8');
console.log("Ajustes patched with footer section");
