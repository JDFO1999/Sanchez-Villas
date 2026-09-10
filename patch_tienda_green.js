const fs = require('fs');
let c = fs.readFileSync('app/tienda/page.tsx', 'utf8');

// 1. Mojibake Fixes
c = c.replace(/CatÃ¡logo/g, 'Catálogo');
c = c.replace(/MÃ©todo de Pago/g, 'Método de Pago');
c = c.replace(/Pago MÃ³vil/g, 'Pago Móvil');
c = c.replace(/Reserva tus productos desde aquÃ­ y retÃ­ralos en recepciÃ³n\./g, 'Reserva tus productos desde aquí y retíralos en recepción.');
c = c.replace(/aquÃ­/g, 'aquí');
c = c.replace(/retÃ­ralos/g, 'retíralos');
c = c.replace(/recepciÃ³n/g, 'recepción');

// Wait, the terminal showed: "Catǭlogo", "aqu", "retralos", "recepcin", "MǸtodo de Pago"
// Because Node might read it as "CatÃ¡logo" if it's UTF-8, but if it's corrupt in the source file we need to be careful.
// Let's just do a generic replace.
c = c.replace(/Cat[^\w\s]*logo/g, 'Catálogo');
c = c.replace(/M[^\w\s]*todo de Pago/g, 'Método de Pago');
c = c.replace(/Pago M[^\w\s]*vil/g, 'Pago Móvil');
c = c.replace(/Reserva tus productos desde aqu[^\w\s]* y ret[^\w\s]*ralos en recepci[^\w\s]*n\./g, 'Reserva tus productos desde aquí y retíralos en recepción.');

// 2. Title Gradient 
c = c.replace(/className="text-4xl font-black tracking-tighter bg-gradient-to-r from-primary dark:dark:via-white via-black via-black to-primary\/50 bg-clip-text text-transparent dark:dark:drop-shadow-\[0_0_15px_rgba\(255,255,255,0\.1\)\] drop-shadow-sm drop-shadow-sm"/g,
'className="text-4xl font-black tracking-tighter bg-gradient-to-r from-primary to-orange-400 bg-clip-text text-transparent drop-shadow-sm"');

// 3. Green Outline Buttons replacements
const greenOutlineClasses = 'bg-transparent border-2 border-green-500 text-green-600 dark:text-green-500 font-bold py-2 px-4 rounded-xl flex items-center gap-2 hover:bg-green-50 dark:hover:bg-green-500/10 transition shadow-sm';
const greenOutlineClassesLg = 'w-full bg-transparent border-2 border-green-500 text-green-600 dark:text-green-500 font-black py-3.5 rounded-xl hover:bg-green-50 dark:hover:bg-green-500/10 transition shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed';

// Cart buttons (Athlete and Admin)
c = c.replace(/className="border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground dark:bg-primary dark:text-primary-foreground dark:border-transparent font-bold py-2 px-4 rounded-xl flex items-center gap-2 hover:bg-primary\/90 transition shadow-lg shadow-primary\/20"/g, 
`className="${greenOutlineClasses}"`);

// Admin cart with anim
c = c.replace(/className=\{`border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground dark:bg-primary dark:text-primary-foreground dark:border-transparent font-bold py-2 px-4 rounded-xl flex items-center gap-2 hover:bg-primary\/90 transition shadow-lg shadow-primary\/20 \$\{cartAnim \? 'animate-bounce' : ''\}`\}/g,
`className={\`${greenOutlineClasses} \${cartAnim ? 'animate-bounce' : ''}\`}`);

// Enviar Pedido (Athlete)
c = c.replace(/className="w-full border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground dark:bg-primary dark:text-primary-foreground dark:border-transparent font-black py-3\.5 rounded-xl hover:bg-primary\/90 transition shadow-lg shadow-primary\/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed drop-shadow-md"/g,
`className="${greenOutlineClassesLg}"`);

// Cobrar Total (Admin)
c = c.replace(/className="w-full border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground dark:bg-primary dark:text-primary-foreground dark:border-transparent font-bold py-3\.5 rounded-xl hover:bg-primary\/90 transition shadow-lg shadow-primary\/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"/g,
`className="${greenOutlineClassesLg}"`);

// Pedidos Online (Admin) -> Make it orange outline
const orangeOutlineClasses = 'bg-transparent border-2 border-orange-500 text-orange-600 dark:text-orange-500 font-bold py-2 px-4 rounded-xl flex items-center gap-2 hover:bg-orange-50 dark:hover:bg-orange-500/10 transition shadow-sm mr-2';
c = c.replace(/className="border-2 border-orange-500 text-orange-600 hover:bg-orange-500 hover:text-white dark:bg-orange-500 dark:text-white dark:border-transparent font-bold py-2 px-4 rounded-xl flex items-center gap-2 hover:bg-orange-600 transition shadow-lg shadow-orange-500\/20 mr-2"/g,
`className="${orangeOutlineClasses}"`);


fs.writeFileSync('app/tienda/page.tsx', c, 'utf8');
console.log("Patched tienda");
