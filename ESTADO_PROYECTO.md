# Proyecto GymPro - Maximum Store

Este archivo sirve como punto de control para retomar el proyecto en cualquier momento o desde otra computadora.

## Estado Actual del Desarrollo
Hemos construido un sistema de gestión para un gimnasio con características de "Enterprise" (Nivel Avanzado). 
Se ha implementado el **backend con SQL Server (Prisma)**, aunque quedan un par de componentes en transición.

### Módulos Completados:
1. **Autenticacin y Sesiones (`/`):** Sistema de Login condicional basado en roles usando \`jose\` (JWT) y Server Actions de Next.js.
2. **Dashboard (`/dashboard`):** Menú principal interactivo dependiendo de los permisos del usuario.
3. **Tienda y POS (`/tienda`):** 
   - **Cajeros:** Punto de Venta (POS) con lector de código de barras, buscador rápido de clientes, creación de "Clientes de Paso" (Walk-in), override de stock por administrador.
   - **Atletas (E-Commerce):** Catálogo online con diseño premium.
   - **Checkouts:** Soporte para Efectivo, Tarjeta, Transferencia, **Pago Móvil** y **Crédito/Fiado** (el cual incrementa la deuda del Atleta en la base de datos de Prisma).
   - **Ticket de Compra:** Optimizados para impresoras térmicas (58mm/80mm) con texto en negro sólido y auto-print.
4. **Inventario (`/tienda/inventario`):** CRUD de productos conectado a Prisma.
5. **Historial de Ventas (`/tienda/ventas`):** Tabla de transacciones con visor visual de captures.
6. **Ajustes (`/ajustes`):** Buscador de empleados, configuración de tickera, y personalización profunda de Footer (Padding, Margin, Alineación).
7. **Módulo de Membresías (`/membresias`):** Modificar datos del atleta, ver inicio y vencimiento de membresía. Tracking de conexión y envíos de mensajes por WhatsApp.
8. **Módulo de Asistencia (`/asistencia`):** Lector de entrada para atletas validando vencimiento y registro de check-in, vinculación de ventas reales al Dashboard.
9. **Mis Atletas (`/mis-atletas`):** Módulo para que los entrenadores vean y asignen rutinas a sus atletas.

### Próximos Pasos (Pendientes):
- **Refinamiento UI/UX:** Revisar diseño responsive en todas las pantallas.
- **Gráficos del Dashboard:** Conectar los datos de las gráficas (ingresos y gastos) a las ventas reales de la base de datos (actualmente son Mocks).
- **Rutinas y Dietas:** Terminar de enlazar `lib/data-service.ts` (localStorage) a la Base de Datos para las Rutinas y Progresos de Atletas.

## Cómo retomar el proyecto con la IA
Si estás abriendo este proyecto en una computadora nueva:
1. Asegúrate de instalar las dependencias con `npm install`.
2. Sincroniza la BD con `npx prisma db push` y `npx prisma generate`.
3. Inicia el servidor con `npm run dev`.
4. Abre un nuevo chat con la IA, selecciona la carpeta del proyecto y dile: 
   *"Hola, lee el archivo ESTADO_PROYECTO.md para ponerte en contexto y sigamos con los Próximos Pasos Pendientes."*
