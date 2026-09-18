const fs = require('fs');

let f = fs.readFileSync('components/layout/footer.tsx', 'utf8');

const s_style = 'paddingBottom: `${pY * 0.25}rem`,';
if (!f.includes('settings.footerLogoSettings?.bgColor')) {
    f = f.replace(s_style, s_style + '\n        backgroundColor: settings.footerLogoSettings?.bgColor && settings.footerLogoSettings.bgColor !== "#000000" ? settings.footerLogoSettings.bgColor : undefined,');
}

const modern_app_name = '{settings.footerLogoSettings?.showText !== false && (';
const modern_app_name_new = '{settings.footerLogoSettings?.showText !== false && settings.footerLogoSettings?.showAppName !== false && (';
if (f.includes(modern_app_name) && !f.includes(modern_app_name_new)) {
    f = f.replace(modern_app_name, modern_app_name_new);
}

const old_copy = '<p>© {new Date().getFullYear()} {settings.appName}. Todos los derechos reservados.</p>';
const new_copy = '<p>{settings.footerLogoSettings?.copyrightText || `© ${new Date().getFullYear()} ${settings.appName}. Todos los derechos reservados.`}</p>';
if (f.includes(old_copy)) {
    f = f.replace(old_copy, new_copy);
}

fs.writeFileSync('components/layout/footer.tsx', f);
