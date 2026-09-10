const fs = require('fs');
let m = fs.readFileSync('app/membresias/page.tsx', 'utf8');

// Fix specific known words
m = m.replace(/est\u01ED/g, 'está'); // estǭ -> está
m = m.replace(/M\u01F8todo/g, 'Método'); // MǸtodo -> Método
m = m.replace(/n\u01E7mero/g, 'número'); // nǧmero -> número
m = m.replace(/C\u01EDmara/g, 'Cámara'); // Cǭmara -> Cámara
m = m.replace(/Tel\u01F8fono/g, 'Teléfono'); // TelǸfono -> Teléfono
m = m.replace(/tel\u01F8fono/g, 'teléfono'); // telǸfono -> teléfono
m = m.replace(/autom\u01EDticamente/g, 'automáticamente'); // automǭticamente -> automáticamente
m = m.replace(/Est\u01EDndar/g, 'Estándar'); // Estǭndar -> Estándar
m = m.replace(/enviar\u01ED/g, 'enviará'); // enviarǭ -> enviará

// Using dot for replacement chars
m = m.replace(/d.as/g, 'días');
m = m.replace(/Membres.as/g, 'Membresías');
m = m.replace(/Membres.a/g, 'Membresía');
m = m.replace(/Contrase.a/g, 'Contraseña');
m = m.replace(/contrase.a/g, 'contraseña');
m = m.replace(/Direcci.n/g, 'Dirección');
m = m.replace(/Renovaci.n/g, 'Renovación');
m = m.replace(/promoci.n/g, 'promoción');
m = m.replace(/Promoci.n/g, 'Promoción');
m = m.replace(/bot.n/g, 'botón');
m = m.replace(/T.tulo/g, 'Título');
m = m.replace(/.Hola/g, '¡Hola');
m = m.replace(/.Todo/g, '¿Todo');
m = m.replace(/.Felicidades/g, '¡Felicidades');
m = m.replace(/as./g, 'así');
m = m.replace(/.Renueva/g, '¡Renueva');
m = m.replace(/A.adir/g, 'Añadir');
m = m.replace(/N. de/g, 'Nº de');
m = m.replace(/.sltimo/g, 'Último');
m = m.replace(/comun.cate/g, 'comunícate');
m = m.replace(/FULLSCREEN./g, 'FULLSCREEN');
m = m.replace(/.xito/g, 'éxito');

fs.writeFileSync('app/membresias/page.tsx', m, 'utf8');
console.log("Fixed Membresias words");
