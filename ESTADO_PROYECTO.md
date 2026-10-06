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

### Sistema de Diseño (en curso):
- **Base:** tokens semánticos `success` / `warning` / `info` (claro y oscuro) en `app/globals.css`; fuente de display `Barlow Condensed` (`--font-display`, clases `.font-display`, `.stat-number`); clase única `.page-title` aplicada en las 15 pantallas que antes copiaban el gradiente. **Estilo del título (decisión del usuario):** texto con degradado dorado (claro: dorado → oscuro → dorado tenue; oscuro: dorado → blanco → dorado tenue) y resplandor suave; no volver a un título sólido.
- **Componentes nuevos en `components/ui/`:** `button.tsx` (variantes primary/outline/ghost/success/danger), `badge.tsx` (tonos), `page-title.tsx` (usa `.page-title`).
- **Migración a tokens (hecha):** los colores de texto, borde y fondo teñido `green/red/orange/yellow/amber/blue/emerald` y la escala `slate-*` se sustituyeron por `success` / `warning` / `info` / `destructive` / `foreground` / `muted-foreground` / `border` / `muted` en 22 archivos de `app/` y `components/` (excepto `footer.tsx`, que tiene colores configurables). Quedan solo rellenos sólidos (`bg-green-500` en puntos y botones con texto blanco).
- **Dashboard del atleta:** avisos de rutina en frase normal (sin mayúsculas ni parpadeo), cifras de KPI con `.stat-number`, `<Link><button/></Link>` reemplazado por `buttonVariants`, textos mínimos de 12 px, gráficos con colores de tokens.
- **Login y sidebar:** etiquetas asociadas (`htmlFor`), botón mostrar/ocultar contraseña, `autoComplete`; sidebar y barra móvil con `aria-current`, barra dorada de sección activa y foco visible.
- **Codificación:** reparado el texto con mojibake (`Ã­`, `Ã³`) en `users.ts`, `membresias`, `tienda` y `athlete-dashboard`.
- **Dialog accesible (`components/ui/dialog.tsx`):** `role="dialog"`, Escape, foco atrapado y restaurado, scroll del fondo bloqueado. Ya lo usan: recuperar contraseña (login), exportar reporte (admin) y pase QR (atleta). El resto de modales (`fixed inset-0` en tienda, membresías, finanzas, atletas/[id], ajustes, empleados, inventario, ventas, coach-dashboard, routine-assignment-modal, qr-scanner) siguen con markup propio: migrarlos a `Dialog`.
- **Confirmaciones y toasts con el tema:** `lib/confirm.ts` (`confirmAction`, `swalTheme`) reemplaza los `confirm()` nativos de `empleados` e `inventario`; `toast-context.tsx` ya no usa colores fijos. Los demás `Swal.fire` con `#1f2937`/`#ffffff` fijos (p. ej. `athlete-dashboard` en `handleCancelTx`) deberían usar `swalTheme()`.
- **`Button` / `Badge`:** adoptados en login, modal de reporte y estados de compra del atleta; el resto de pantallas aún repiten clases a mano.
- **Footer:** migrado a tokens (ya no usa `slate-*`).
- **Pendiente:** migrar los demás modales a `Dialog`; adoptar `Button`/`Badge` en tienda, membresías, finanzas y atletas; revisar el contraste de los rellenos sólidos (`bg-green-500` + texto blanco) en modo claro.

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
