# Proyecto GymPro - Maximum Store

Este archivo sirve como punto de control para retomar el proyecto en cualquier momento o desde otra computadora.

## Estado Actual del Desarrollo
Hemos construido un sistema de gestión para un gimnasio con características de "Enterprise" (Nivel Avanzado). 
Toda la persistencia de datos actual es *Mock* (se guarda en el `localStorage` del navegador para desarrollo rápido).

### Módulos Completados:
1. **Autenticación (`/`):** Sistema de Login condicional basado en roles (`admin`, `coach`, `athlete`).
2. **Dashboard (`/dashboard`):** Menú principal interactivo dependiendo de los permisos del usuario.
3. **Tienda y POS (`/tienda`):** 
   - **Cajeros:** Punto de Venta (POS) con lector de código de barras, buscador rápido de clientes, creación de "Clientes de Paso" (Walk-in), override de stock por administrador.
   - **Atletas (E-Commerce):** Catálogo online con diseño premium.
   - **Checkouts:** Soporte para Efectivo, Tarjeta, Transferencia y **Pago Móvil** (requiriendo referencia y comprobante visual).
   - **Ticket de Compra:** Optimizados para impresoras térmicas (58mm/80mm) con texto en negro sólido y auto-print.
4. **Inventario (`/tienda/inventario`):** CRUD de productos con Modales.
5. **Historial de Ventas (`/tienda/ventas`):** Tabla de transacciones con visor visual de captures.
6. **Ajustes (`/ajustes`):** Buscador de empleados, configuración de tickera.

### Próximos Pasos (Pendientes):
- **Módulo de Membresías:** Modificar datos del atleta, ver inicio y vencimiento de membresía. Tracking de conexión y envíos de mensajes por WhatsApp.
- **Módulo de Asistencia:** Lector de entrada para atletas, vinculación de ventas reales al Dashboard.

## Cómo retomar el proyecto con la IA
Si estás abriendo este proyecto en una computadora nueva:
1. Asegúrate de instalar las dependencias con `npm install`.
2. Inicia el servidor con `npm run dev`.
3. Abre un nuevo chat con la IA, selecciona la carpeta del proyecto y dile: 
   *"Hola, lee el archivo ESTADO_PROYECTO.md para ponerte en contexto y empecemos a trabajar en el módulo de Membresías."*
