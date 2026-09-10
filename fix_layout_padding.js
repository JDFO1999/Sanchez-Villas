const fs = require('fs');
let c = fs.readFileSync('components/layout/app-layout.tsx', 'utf8');

c = c.replace(
/<main className="flex-1 overflow-y-auto p-4 lg:p-8 pb-20 lg:pb-8">[\s\S]*?\{children\}[\s\S]*?<Footer \/>[\s\S]*?<\/main>/,
`<main className="flex-1 overflow-y-auto pb-20 lg:pb-0 flex flex-col">
          <div className="flex-1 p-4 lg:p-8">
            {children}
          </div>
          <Footer />
        </main>`
);

fs.writeFileSync('components/layout/app-layout.tsx', c, 'utf8');
console.log("Updated layout padding");
