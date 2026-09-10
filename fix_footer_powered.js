const fs = require('fs');
let c = fs.readFileSync('components/layout/footer.tsx', 'utf8');

c = c.replace(/Powered by <span className="font-black text-primary">GymPro<\/span>/, 'Powered by <span className="font-black text-primary">{settings.appName}</span>');

fs.writeFileSync('components/layout/footer.tsx', c, 'utf8');
console.log("Fixed footer powered by");
