const fs = require('fs');
let c = fs.readFileSync('lib/settings-context.tsx', 'utf8');

c = c.replace(/let link = document\.querySelector\("link\[rel~='icon'\]"\);/g, 'let link = document.querySelector("link[rel~=\'icon\']") as HTMLLinkElement;');
c = c.replace(/link = document\.createElement\('link'\);/g, 'link = document.createElement("link") as HTMLLinkElement;');

c = c.replace(/parsed\.footerPartners\.map\(p =>/g, 'parsed.footerPartners.map((p: any) =>');

fs.writeFileSync('lib/settings-context.tsx', c, 'utf8');
console.log("Fixed settings-context TS errors");
