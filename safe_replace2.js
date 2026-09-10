const fs = require('fs');
let text = fs.readFileSync('app/membresias/page.tsx', 'binary');
let decoded = Buffer.from(text, 'binary').toString('utf8');

decoded = decoded.replace(/\u01ed/g, 'á');
decoded = decoded.replace(/\u01f8/g, 'é');
decoded = decoded.replace(/\u01e7/g, 'ú');

// Safe, targeted replacements
decoded = decoded.replace(/Membresas & CRM/g, 'Membresías & CRM');
decoded = decoded.replace(/Renovar Membresa/g, 'Renovar Membresía');
decoded = decoded.replace(/tu membresa est/g, 'tu membresía est');
decoded = decoded.replace(/Inasistencia/g, 'Inasistencia');
decoded = decoded.replace(/llevas das sin/g, 'llevas días sin');
decoded = decoded.replace(/Hola/g, '¡Hola');
decoded = decoded.replace(/Todo bien/g, '¿Todo bien');
decoded = decoded.replace(/Felicitacin/g, 'Felicitación');
decoded = decoded.replace(/Felicidades/g, '¡Felicidades');
decoded = decoded.replace(/Sigue as\./g, 'Sigue así.');
decoded = decoded.replace(/Renueva pronto/g, '¡Renueva pronto');
decoded = decoded.replace(/Las contraseas/g, 'Las contraseñas');
decoded = decoded.replace(/Cambiar Contrasea/g, 'Cambiar Contraseña');
decoded = decoded.replace(/Nueva Contrasea/g, 'Nueva Contraseña');
decoded = decoded.replace(/Confirmar Contrasea/g, 'Confirmar Contraseña');
decoded = decoded.replace(/Repetir contrasea/g, 'Repetir contraseña');
decoded = decoded.replace(/un nmero/g, 'un número');
decoded = decoded.replace(/Sin nmero/g, 'Sin número');
decoded = decoded.replace(/Renovacin y cobro exitosos/g, 'Renovación y cobro exitosos');
decoded = decoded.replace(/Duracin/g, 'Duración');
decoded = decoded.replace(/Aadir Entrenador/g, 'Añadir Entrenador');
decoded = decoded.replace(/Mtodo de Pago/g, 'Método de Pago');
decoded = decoded.replace(/N de Transaccin/g, 'Nº de Transacción');
decoded = decoded.replace(/N de Referencia/g, 'Nº de Referencia');
decoded = decoded.replace(/Cmara/g, 'Cámara');
decoded = decoded.replace(/Cdula/g, 'Cédula');
decoded = decoded.replace(/Telfono/g, 'Teléfono');
decoded = decoded.replace(/Direccin/g, 'Dirección');
decoded = decoded.replace(/Ttulo del botn/g, 'Título del botón');
decoded = decoded.replace(/Ej. Promocin/g, 'Ej. Promoción');
decoded = decoded.replace(/una promocin/g, 'una promoción');
decoded = decoded.replace(/comuncate/g, 'comunícate');
decoded = decoded.replace(/sltimo/g, 'Último');

fs.writeFileSync('app/membresias/page.tsx', decoded, 'utf8');
console.log("Safe targeted replace done");
