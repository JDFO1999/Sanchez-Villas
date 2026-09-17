const fs = require('fs');

const files = [
    'app/membresias/page.tsx',
    'app/tienda/page.tsx',
    'app/tienda/ventas/page.tsx',
    'app/finanzas/page.tsx',
    'app/ajustes/page.tsx',
    'components/layout/app-layout.tsx'
];

files.forEach(f => {
    if(fs.existsSync(f)) {
        let content = fs.readFileSync(f, 'utf8');
        let initial = content;
        
        // Remove bad characters inside specific words
        content = content.replace(/d[^a-zA-Z0-9]?ark:/g, "dark:");
        content = content.replace(/Mod[^a-zA-Z0-9]?al/g, "Modal");
        content = content.replace(/Guard[^a-zA-Z0-9]?ar/g, "Guardar");
        content = content.replace(/Hola/g, "¡Hola");
        
        if (content !== initial) {
            fs.writeFileSync(f, content, 'utf8');
            console.log('Fixed regex in', f);
        }
    }
});
