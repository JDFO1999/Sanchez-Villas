const fs = require('fs');
let c = fs.readFileSync('app/membresias/page.tsx', 'utf8');

// Just replace everything aggressively
c = c.replace(/est[^\w\s]* pr[^\w\s]*xima/g, 'está próxima');
c = c.replace(/M[^\w\s]*todo de Pago/g, 'Método de Pago');
c = c.replace(/n[^\w\s]*mero/g, 'número');
c = c.replace(/tel[^\w\s]*fono/g, 'teléfono');
c = c.replace(/Tel[^\w\s]*fono/g, 'Teléfono');
c = c.replace(/autom[^\w\s]*ticamente/g, 'automáticamente');
c = c.replace(/Est[^\w\s]*ndar/g, 'Estándar');
c = c.replace(/enviar[^\w\s]* a/g, 'enviará a');
c = c.replace(/C[^\w\s]*mara/g, 'Cámara');
c = c.replace(/C[^\w\s]*dula/g, 'Cédula');
c = c.replace(/c[^\w\s]*dula/g, 'cédula');

// Also do standard replacement character ones
c = c.replace(/d\ufffda/g, 'día');
c = c.replace(/Membres\ufffdas/g, 'Membresías');
c = c.replace(/Membres\ufffda/g, 'Membresía');
c = c.replace(/Membres.as/g, 'Membresías');
c = c.replace(/Membres.a/g, 'Membresía');
c = c.replace(/Contrase.a/g, 'Contraseña');
c = c.replace(/contrase.a/g, 'contraseña');
c = c.replace(/Direcci.n/g, 'Dirección');
c = c.replace(/Renovaci.n/g, 'Renovación');
c = c.replace(/promoci.n/g, 'promoción');
c = c.replace(/Promoci.n/g, 'Promoción');
c = c.replace(/bot.n/g, 'botón');
c = c.replace(/T.tulo/g, 'Título');
c = c.replace(/.Hola/g, '¡Hola');
c = c.replace(/.Todo/g, '¿Todo');
c = c.replace(/.Felicidades/g, '¡Felicidades');
c = c.replace(/as./g, 'así');
c = c.replace(/.Renueva/g, '¡Renueva');
c = c.replace(/A.adir/g, 'Añadir');
c = c.replace(/N. de/g, 'Nº de');
c = c.replace(/.sltimo/g, 'Último');
c = c.replace(/comun.cate/g, 'comunícate');
c = c.replace(/.xitosos/g, 'exitosos');
c = c.replace(/Felicitaci.n/g, 'Felicitación');
c = c.replace(/Duraci.n/g, 'Duración');
c = c.replace(/Transacci.n/g, 'Transacción');
c = c.replace(/M.vil/g, 'Móvil');
c = c.replace(/Cr.dito/g, 'Crédito');
c = c.replace(/pr.xima/g, 'próxima');

fs.writeFileSync('app/membresias/page.tsx', c, 'utf8');
console.log("Fixed all aggressively");
