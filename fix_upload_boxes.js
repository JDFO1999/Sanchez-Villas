const fs = require('fs');
let c = fs.readFileSync('app/ajustes/page.tsx', 'utf8');

c = c.replace(/<span className="text-xs text-muted-foreground">Icono<\/span>/, '<div className="text-[10px] font-bold text-center text-primary leading-tight"><span className="text-xl block mb-1">↑</span>Subir<br/>Logo</div>');

c = c.replace(/<span className="text-xs text-muted-foreground text-center">Subir<br\/>Logo<\/span>/, '<div className="text-xs font-bold text-center text-primary leading-tight"><span className="text-2xl block mb-1">↑</span>Subir<br/>Logo</div>');

fs.writeFileSync('app/ajustes/page.tsx', c, 'utf8');
console.log("Updated Upload boxes text");
