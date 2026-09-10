const fs = require('fs');
let c = fs.readFileSync('lib/settings-context.tsx', 'utf8');

c = c.replace(/  biometricFields: string\[\]\r?\n\}/, 
`  biometricFields: string[]
  footerMission: string
  footerVision: string
  footerSocialLinks: {
    instagram: string
    facebook: string
    tiktok: string
  }
  footerPartners: string[]
}`);

c = c.replace(/  biometricFields: \['fingerprint'\],\r?\n\};/, 
`  biometricFields: ['fingerprint'],
  footerMission: "Inspirar y guiar a nuestra comunidad hacia un estilo de vida más saludable y activo, brindando las mejores herramientas y espacios para su desarrollo físico y mental.",
  footerVision: "Ser el centro de acondicionamiento físico líder en innovación y resultados, donde cada socio alcanza su máximo potencial en un ambiente motivador y profesional.",
  footerSocialLinks: {
    instagram: "",
    facebook: "",
    tiktok: ""
  },
  footerPartners: []
};`);

fs.writeFileSync('lib/settings-context.tsx', c, 'utf8');
console.log("Settings patched");
