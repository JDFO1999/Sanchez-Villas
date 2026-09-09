const fs = require('fs');

let c = fs.readFileSync('components/dashboards/athlete-dashboard.tsx', 'utf8');

c = c.replace(/C\u01df\ufffddigo/g, "Código");
c = c.replace(/C\u01df\ufffddigo/g, "Código");
c = c.replace(/M\u01df\ufffdxima/g, "Máxima");

// Brute-force the common texts:
c = c.replace(/Mostrar mi C.*?digo de Acceso/g, "Mostrar mi Código de Acceso");
c = c.replace(/Tu C.*?digo de Acceso/g, "Tu Código de Acceso");
c = c.replace(/Carga M.*?xima/g, "Carga Máxima");
c = c.replace(/Sin duraci.*?n/g, "Sin duración");

// Let's also check for "Días" and "Aún" just in case they are still broken in some other weird way
c = c.replace(/D.*?as restantes/g, "Días restantes");
c = c.replace(/Men.*? de Opciones/g, "Menú de Opciones");

fs.writeFileSync('components/dashboards/athlete-dashboard.tsx', c, 'utf8');
console.log('Fixed additional mojibake');
