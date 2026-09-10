const fs = require('fs');
let c = fs.readFileSync('lib/settings-context.tsx', 'utf8');

c = c.replace(/try \{\s*setSettings\(\{ \.\.\.defaultSettings, \.\.\.JSON\.parse\(saved\) \}\)\s*\} catch \(e\)/, `try {
        let parsed = JSON.parse(saved);
        if (parsed.footerSocialLinks && !Array.isArray(parsed.footerSocialLinks)) {
          parsed.footerSocialLinks = defaultSettings.footerSocialLinks;
        }
        if (parsed.footerPartners && !Array.isArray(parsed.footerPartners)) {
          parsed.footerPartners = [];
        } else if (Array.isArray(parsed.footerPartners)) {
          parsed.footerPartners = parsed.footerPartners.map(p => typeof p === "string" ? { id: Math.random().toString(), imageUrl: p, width: 100, height: 40 } : p);
        }
        setSettings({ ...defaultSettings, ...parsed })
      } catch (e)`);

fs.writeFileSync('lib/settings-context.tsx', c, 'utf8');
console.log("Fixed context local storage parsing");
