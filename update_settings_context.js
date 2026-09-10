const fs = require('fs');

// 1. UPDATE lib/settings-context.tsx
let s = fs.readFileSync('lib/settings-context.tsx', 'utf8');
s = s.replace(/logoSettings: \{[\s\S]*?\}/, 'logoSettings: { showInNavbar: boolean, showInSidebar: boolean, showInLogin: boolean, size: number, width: number, height: number, rounded: boolean }');
s = s.replace(/footerSocialLinks: \{[\s\S]*?\}/, 'footerSocialLinks: { id: string, name: string, url: string, iconUrl?: string, width: number, height: number }[]');
s = s.replace(/footerPartners: string\[\]/, 'footerPartners: { id: string, imageUrl: string, width: number, height: number, link?: string }[]');

// update defaults
s = s.replace(/logoSettings: \{\s*showInNavbar: true,\s*showInSidebar: true,\s*showInLogin: true,\s*size: 150,\s*rounded: false\s*\}/, 
  'logoSettings: { showInNavbar: true, showInSidebar: true, showInLogin: true, size: 150, width: 150, height: 150, rounded: false }');
s = s.replace(/footerSocialLinks: \{[\s\S]*?\}/, "footerSocialLinks: [{ id: '1', name: 'Instagram', url: '', iconUrl: '', width: 24, height: 24 }]");
s = s.replace(/footerPartners: \[\]/, 'footerPartners: []');

fs.writeFileSync('lib/settings-context.tsx', s, 'utf8');
console.log("Updated settings context");
