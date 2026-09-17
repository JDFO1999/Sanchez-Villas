const fs = require('fs');

const replacements = [
    { bad: "", good: "ó" },
    { bad: "", good: "á" },
    { bad: "", good: "é" },
    { bad: "", good: "í" },
    { bad: "", good: "ú" },
    { bad: "", good: "ñ" },
    { bad: "", good: "í" }, // fallback for missing i
    { bad: "Ã³", good: "ó" },
    { bad: "Ã¡", good: "á" },
    { bad: "Ã©", good: "é" },
    { bad: "Ã­", good: "í" },
    { bad: "Ãº", good: "ú" },
    { bad: "Ã±", good: "ñ" },
    { bad: "Ã", good: "í" }
];

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
        
        // Custom explicit fixes based on context
        content = content.replace(/Cerrar sesin/g, "Cerrar sesión");
        content = content.replace(/Cerrar Sesin/g, "Cerrar Sesión");
        content = content.replace(/Membresa/g, "Membresía");
        content = content.replace(/Renovar Membresa/g, "Renovar Membresía");
        content = content.replace(/cdigo/g, "código");
        content = content.replace(/Atencin/g, "Atención");
        content = content.replace(/Accin/g, "Acción");
        content = content.replace(/Da/g, "Día");
        content = content.replace(/da/g, "día");
        content = content.replace(/Pestaa/g, "Pestaña");
        content = content.replace(/Nmina/g, "Nómina");
        content = content.replace(/Aadir/g, "Añadir");
        content = content.replace(/Autorizacin/g, "Autorización");
        content = content.replace(/Mvil/g, "Móvil");
        content = content.replace(/Hola/g, "¡Hola");
        content = content.replace(/Catlogo/g, "Catálogo");
        
        if (content !== initial) {
            fs.writeFileSync(f, content, 'utf8');
            console.log('Fixed', f);
        }
    }
});
