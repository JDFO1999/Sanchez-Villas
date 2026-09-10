const fs = require('fs');
let c = fs.readFileSync('components/layout/app-layout.tsx', 'utf8');

c = c.replace(/<aside([^>]*)>([\s\S]*?)<\/aside>/g, (match, p1, p2) => {
  return `<aside${p1}>\n<div className={\`flex flex-col h-full transition-opacity duration-300 ease-in-out \${isSidebarCollapsed ? 'lg:opacity-0 delay-0' : 'lg:opacity-100 delay-200'}\`}>${p2}\n</div>\n</aside>`;
});

fs.writeFileSync('components/layout/app-layout.tsx', c, 'utf8');
console.log("Updated app-layout animation");
