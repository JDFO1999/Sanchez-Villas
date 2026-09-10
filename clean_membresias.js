const fs = require('fs');
let c = fs.readFileSync('app/membresias/page.tsx', 'utf8');

c = c.replace(/\{ title: "Inasistencia", text: ".*" \},/g, 
  '{ title: "Inasistencia", text: "¡Hola {nombre}! Hemos notado que llevas días sin venir al gimnasio. ¿Todo bien? Te esperamos." },');
c = c.replace(/\{ title: "Felicitaci[^\"]*", text: ".*" \},/g, 
  '{ title: "Felicitación", text: "¡Felicidades por tu constancia esta semana {nombre}! Sigue así." },');
c = c.replace(/\{ title: "Recordatorio", text: ".*" \}/g, 
  '{ title: "Recordatorio", text: "Hola {nombre}, te recordamos que tu membresía está próxima a vencer. ¡Renueva pronto para no perder el ritmo!" }');

c = c.replace(/alert\("Las contrase.*as no coinciden."\)/g, 'alert("Las contraseñas no coinciden.")');
c = c.replace(/alert\("El atleta no tiene un n.mero de tel.fono registrado."\)/g, 'alert("El atleta no tiene un número de teléfono registrado.")');

c = c.replace(/Toast\.fire\(\{ icon: 'success', title: 'Renovaci.*n y cobro .*xitosos' \}\)/g, "Toast.fire({ icon: 'success', title: 'Renovación y cobro exitosos' })");

c = c.replace(/<h3 className="text-xl font-bold mb-2">Renovar Membres.*a<\/h3>/g, '<h3 className="text-xl font-bold mb-2">Renovar Membresía</h3>');
c = c.replace(/<p className="text-sm text-muted-foreground mb-4">Se crear.* el cobro autom.*ticamente en la caja\.<\/p>/g, '<p className="text-sm text-muted-foreground mb-4">Se creará el cobro automáticamente en la caja.</p>');
c = c.replace(/<label className="text-sm font-medium mb-1 block">Duraci.*n \(Meses\)<\/label>/g, '<label className="text-sm font-medium mb-1 block">Duración (Meses)</label>');
c = c.replace(/A.*adir Entrenador Personal/g, 'Añadir Entrenador Personal');
c = c.replace(/M.*todo de Pago/g, 'Método de Pago');
c = c.replace(/N.* de Transacci.*n/g, 'Nº de Transacción');
c = c.replace(/N.* de Referencia/g, 'Nº de Referencia');
c = c.replace(/C.*mara/g, 'Cámara');
c = c.replace(/<label className="text-xs font-medium mb-1 block">C.*dula<\/label>/g, '<label className="text-xs font-medium mb-1 block">Cédula</label>');
c = c.replace(/<label className="text-xs font-medium mb-1 block">Tel.*fono<\/label>/g, '<label className="text-xs font-medium mb-1 block">Teléfono</label>');
c = c.replace(/<label className="text-xs font-medium mb-1 block">Direcci.*n<\/label>/g, '<label className="text-xs font-medium mb-1 block">Dirección</label>');
c = c.replace(/Cambiar Contrase.*a \(Opcional\)/g, 'Cambiar Contraseña (Opcional)');
c = c.replace(/Nueva Contrase.*a/g, 'Nueva Contraseña');
c = c.replace(/Confirmar Contrase.*a/g, 'Confirmar Contraseña');
c = c.replace(/Repetir contrase.*a/g, 'Repetir contraseña');
c = c.replace(/Sin n.*mero registrado/g, 'Sin número registrado');
c = c.replace(/T.*tulo del bot.*n/g, 'Título del botón');
c = c.replace(/Ej\. Promoci.*n/g, 'Ej. Promoción');
c = c.replace(/tenemos una promoci.*n/g, 'tenemos una promoción');
c = c.replace(/Membres.*as \& CRM/g, 'Membresías & CRM');
c = c.replace(/comun.*cate con tus atletas/g, 'comunícate con tus atletas');
c = c.replace(/Buscar por c.*dula o nombre/g, 'Buscar por cédula o nombre');
c = c.replace(/Plan Est.*ndar/g, 'Plan Estándar');
c = c.replace(/d.*as<\/span>/g, 'días</span>');
c = c.replace(/>.*sltimo Acceso/g, '>Último Acceso');
c = c.replace(/MODAL QR FULLSCREEN.*/g, 'MODAL QR FULLSCREEN */}');

fs.writeFileSync('app/membresias/page.tsx', c, 'utf8');
console.log("Replaced cleanly");
