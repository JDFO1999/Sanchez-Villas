const fs = require('fs');
let m = fs.readFileSync('app/membresias/page.tsx', 'utf8');

m = m.replace(/\u01ed/g, 'á');
m = m.replace(/\u01f8/g, 'é');
m = m.replace(/\u01e7/g, 'ú');
m = m.replace(/\u011b/g, 'ě');

m = m.replace(/d\ufffda/g, 'día');
m = m.replace(/Membres\ufffda/g, 'Membresía');
m = m.replace(/contrase\ufffda/g, 'contraseña');
m = m.replace(/Contrase\ufffda/g, 'Contraseña');
m = m.replace(/Direcci\ufffdn/g, 'Dirección');
m = m.replace(/Renovaci\ufffdn/g, 'Renovación');
m = m.replace(/promoci\ufffdn/g, 'promoción');
m = m.replace(/Promoci\ufffdn/g, 'Promoción');
m = m.replace(/bot\ufffdn/g, 'botón');
m = m.replace(/T\ufffdtulo/g, 'Título');
m = m.replace(/\ufffdHola/g, '¡Hola');
m = m.replace(/\ufffdTodo/g, '¿Todo');
m = m.replace(/\ufffdFelicidades/g, '¡Felicidades');
m = m.replace(/as\ufffd/g, 'así');
m = m.replace(/\ufffdRenueva/g, '¡Renueva');
m = m.replace(/A\ufffdadir/g, 'Añadir');
m = m.replace(/N\ufffd de/g, 'Nº de');
m = m.replace(/\ufffdsltimo/g, 'Último');
m = m.replace(/comun\ufffdcate/g, 'comunícate');
m = m.replace(/FULLSCREEN\ufffd/g, 'FULLSCREEN');
m = m.replace(/\ufffdxitosos/g, 'exitosos');
m = m.replace(/Felicitaci\ufffdn/g, 'Felicitación');
m = m.replace(/Duraci\ufffdn/g, 'Duración');
m = m.replace(/Transacci\ufffdn/g, 'Transacción');

fs.writeFileSync('app/membresias/page.tsx', m, 'utf8');
console.log("Fixed syntax and replaced");
