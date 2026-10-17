# Despliegue en VPS con Coolify 🚀

Este proyecto está 100% optimizado para desplegarse en cualquier VPS con **Coolify** (a través de Dockerfile individual o Docker Compose).

---

## Opción 1: Despliegue Directo vía Git (Recomendada en Coolify)

1. En tu panel de Coolify:
   - Haz clic en **+ New Resource** > **Public / Private Repository**.
   - Conecta tu repositorio de GitHub: `https://github.com/JDFO1999/Sanchez-Villas` (Rama: `main`).
2. **Build Pack:** Selecciona **Dockerfile**.
3. **Variables de Entorno (Environment Variables):**
   Configura las siguientes variables en la pestaña **Environment Variables** de Coolify:
   - `DATABASE_URL`: URL de conexión a tu base de datos MySQL en Coolify (ejemplo: `mysql://usuario:contraseña@servidor_mysql:3306/gym`).
   - `JWT_SECRET`: Cadena aleatoria segura de al menos 32 caracteres (ej: `d948cf6108154...`).
   - `UPLOAD_DIR`: `/data/uploads` (ya viene por defecto en el Dockerfile).
   - `NODE_ENV`: `production`
4. **Almacenamiento Persistente (Storage):**
   - En la pestaña **Storage** de la aplicación en Coolify, añade un volumen persistente:
     - **Source / Destination:** `/data/uploads`
     - Esto garantiza que las fotos subidas (logos, atletas, comprobantes) no se borren en cada actualización.
5. **Base de Datos MySQL:**
   - Si no tienes MySQL creado, en Coolify ve a **+ New Resource** > **Databases** > **MySQL**, asígnale nombre y copia la URL interna para pegarla en `DATABASE_URL`.
6. Haz clic en **Deploy**. 
   - El script `entrypoint.sh` sincronizará automáticamente las tablas de la base de datos con `prisma db push` al arrancar el contenedor.

---

## Opción 2: Despliegue Todo-En-Uno con Docker Compose

Si prefieres levantar la aplicación junto con MySQL en un solo paso:
1. En Coolify: **+ New Resource** > **Docker Compose**.
2. Selecciona tu repositorio o pega el contenido del archivo `docker-compose.yml`.
3. Configura en las variables de entorno de Coolify:
   - `DATABASE_URL=mysql://gymuser:gympassword@db:3306/gym`
   - `JWT_SECRET=tu_clave_secreta_de_mas_de_32_caracteres`
   - `DB_ROOT_PASSWORD=un_password_seguro_root`
   - `DB_PASSWORD=gympassword`
4. Haz clic en **Deploy**.

---

## Comandos Útiles

Para ejecutar el seeder inicial con los usuarios base (Admin, Cajero, etc.):
```bash
docker exec -it <id_del_contenedor> npx ts-node prisma/seed.ts
```
