const fs = require('fs');
let s = fs.readFileSync('lib/settings-context.tsx', 'utf8');

// Fix the interface
s = s.replace(/footerSocialLinks: \[\{ id: '1', name: 'Instagram', url: '', iconUrl: '', width: 24, height: 24 \}\]\[\]/, 'footerSocialLinks: { id: string, name: string, url: string, iconUrl?: string, width: number, height: number }[]');

// Fix the defaults object
// Because I accidentally replaced BOTH, let's find the defaults object and fix it
// The defaults object starts with "export const defaultSettings: AppSettings = {"
// We'll just do a manual string replace on the whole file where it makes sense.

s = s.replace(/footerSocialLinks:\s*\[\{ id: '1', name: 'Instagram', url: '', iconUrl: '', width: 24, height: 24 \}\]\[\]/g, "footerSocialLinks: { id: string, name: string, url: string, iconUrl?: string, width: number, height: number }[]");

s = s.replace(/footerSocialLinks: \{ id: string, name: string, url: string, iconUrl\?: string, width: number, height: number \}\[\]\n\s*footerPartners:/, "footerSocialLinks: [{ id: '1', name: 'Instagram', url: '', iconUrl: '', width: 24, height: 24 }],\n  footerPartners:");

fs.writeFileSync('lib/settings-context.tsx', s, 'utf8');
console.log("Fixed settings context");
