const fs = require('fs');

function fixFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Fix common UTF-8 Mojibake manually
    content = content.replace(/A\u00c3\u00ban/g, 'Aún');
    content = content.replace(/A\u01e7n/g, 'Aún');
    content = content.replace(/A\u01dfn/g, 'Aún');
    content = content.replace(/A\u02d9n/g, 'Aún');
    content = content.replace(/C\u00c3\u201cDIGO/g, 'CÓDIGO');
    content = content.replace(/C\u00c3\u0093DIGO/g, 'CÓDIGO');
    content = content.replace(/Validaci\u00c3\u00b3n/g, 'Validación');
    content = content.replace(/M\u00c3\u00b3vil/g, 'Móvil');
    content = content.replace(/m\u00c3\u00a9todo/g, 'método');
    content = content.replace(/ser\u00c3\u00a1/g, 'será');
    content = content.replace(/est\u00c3\u00a1/g, 'está');
    content = content.replace(/d\u00c3\u00addas/g, 'días');
    content = content.replace(/d\u01dfas/g, 'días');
    content = content.replace(/d\u02d9as/g, 'días');
    content = content.replace(/d\u01e7as/g, 'días');
    content = content.replace(/D\u00c3\u00addas/g, 'Días');
    content = content.replace(/D\u00c3\u00ada/g, 'Día');
    content = content.replace(/Ma\u00c3\u00b1ana/g, 'Mañana');
    content = content.replace(/B\u00c3\u00adceps/g, 'Bíceps');
    content = content.replace(/Tr\u00c3\u00adceps/g, 'Tríceps');
    content = content.replace(/Cu\u00c3\u00a1driceps/g, 'Cuádriceps');
    content = content.replace(/Extensi\u00c3\u00b3n/g, 'Extensión');
    content = content.replace(/C\u01f8dula/g, 'Cédula');
    content = content.replace(/C\u01fcdula/g, 'Cédula');
    content = content.replace(/C\u01e8dula/g, 'Cédula');
    
    // Specifically for tienda/page.tsx whatsapp prompt:
    content = content.replace(/n\u00c3\u00bamero/g, 'número');
    content = content.replace(/tel\u00c3\u00a9fono/g, 'teléfono');
    content = content.replace(/pa\u00c3\u00ads/g, 'país');
    content = content.replace(/Â¡/g, '¡');
    
    // Extra replacements for any broken characters:
    content = content.replace(/C\?DIGO/g, 'CÓDIGO');
    content = content.replace(/C\u00ef\u00bf\u00bdDIGO/g, 'CÓDIGO');
    content = content.replace(/CDIGO/g, 'CÓDIGO');
    
    // Write back
    fs.writeFileSync(filePath, content, 'utf8');
}

fixFile('app/tienda/page.tsx');
fixFile('app/rutina/page.tsx');
fixFile('components/dashboards/athlete-dashboard.tsx');
console.log('Fixed basic mojibake');
