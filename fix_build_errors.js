const fs = require('fs');

// Fix app/atletas/[id]/page.tsx
let c = fs.readFileSync('app/atletas/[id]/page.tsx', 'utf8');
c = c.replace(/stats\.attendance/g, 'stats.attendances');
c = c.replace(/m\.plan/g, 'm.status'); // 'plan' does not exist on membership, fallback to status?
fs.writeFileSync('app/atletas/[id]/page.tsx', c, 'utf8');
console.log('Fixed atletas page');

// Fix app/empleados/page.tsx
let emp = fs.readFileSync('app/empleados/page.tsx', 'utf8');
emp = emp.replace(/athlete\.email/g, 'athlete.cedula'); // email doesn't exist on AthleteProfile
fs.writeFileSync('app/empleados/page.tsx', emp, 'utf8');
console.log('Fixed empleados page');

// Fix app/finanzas/page.tsx
let fin = fs.readFileSync('app/finanzas/page.tsx', 'utf8');
fin = fin.replace(/const generatePDF = \(\) => \{[\s\S]*?html2pdf\(\)\.set\(opt\)\.from\(element\)\.save\(\);/g, `const generatePDF = () => {
    const element = document.getElementById('report-content');
    if (!element) return;
    import('html2pdf.js').then((html2pdf) => {
      const opt = {
        margin: 0.5,
        filename: 'reporte-financiero.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
      };
      html2pdf.default().set(opt).from(element).save();
    });
  };`);
fs.writeFileSync('app/finanzas/page.tsx', fin, 'utf8');
console.log('Fixed finanzas page');

