import { test, expect } from '@playwright/test';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const atletas = [
  // 5 Mayores de edad
  {
    tipo: 'MAYOR',
    nombre: 'Alejandro Morales',
    cedula: '25111222',
    telefono: '0414-5551001',
    correo: 'alejandro.morales@gymmail.com',
    fechaNacimiento: '1998-04-12',
    genero: 'M',
    direccion: 'Av. Las Delicias, Edf. Rosalba, Apto 4-B',
    clave: 'GymPro2026*',
  },
  {
    tipo: 'MAYOR',
    nombre: 'Gabriela Rivas',
    cedula: '26333444',
    telefono: '0424-6662002',
    correo: 'gabriela.rivas@gymmail.com',
    fechaNacimiento: '2001-09-23',
    genero: 'F',
    direccion: 'Calle Bolívar, Casa Nro 12, Sector Centro',
    clave: 'GymPro2026*',
  },
  {
    tipo: 'MAYOR',
    nombre: 'Ricardo Fernández',
    cedula: '24555666',
    telefono: '0412-7773003',
    correo: 'ricardo.fernandez@gymmail.com',
    fechaNacimiento: '1996-11-05',
    genero: 'M',
    direccion: 'Urb. San Jacinto, Manzana D, Casa 18',
    clave: 'GymPro2026*',
  },
  {
    tipo: 'MAYOR',
    nombre: 'Valeria Mendoza',
    cedula: '27888999',
    telefono: '0416-8884004',
    correo: 'valeria.mendoza@gymmail.com',
    fechaNacimiento: '2003-02-18',
    genero: 'F',
    direccion: 'Residencias Los Laureles, Torre B, Piso 7',
    clave: 'GymPro2026*',
  },
  {
    tipo: 'MAYOR',
    nombre: 'Carlos Eduardo Pinto',
    cedula: '23444555',
    telefono: '0414-9995005',
    correo: 'carlos.pinto@gymmail.com',
    fechaNacimiento: '1994-07-30',
    genero: 'M',
    direccion: 'Sector El Castaño, Callejón 3, Qta. Bella Vista',
    clave: 'GymPro2026*',
  },

  // 5 Menores de edad
  {
    tipo: 'MENOR',
    nombre: 'Mateo Salazar',
    cedula: '31222333',
    telefono: '0414-1116006',
    correo: 'mateo.salazar@gymmail.com',
    fechaNacimiento: '2010-06-14',
    genero: 'M',
    direccion: 'Urb. La Soledad, Calle 2, Qta. Los Salazar',
    clave: 'GymPro2026*',
    representante: {
      nombre: 'Carmen Salazar',
      cedula: '14222333',
      telefono: '0414-9876543',
    },
  },
  {
    tipo: 'MENOR',
    nombre: 'Camila Rodríguez',
    cedula: '32444555',
    telefono: '0424-2227007',
    correo: 'camila.rodriguez@gymmail.com',
    fechaNacimiento: '2011-10-08',
    genero: 'F',
    direccion: 'Av. Principal de Calicanto, Edf. Aragua',
    clave: 'GymPro2026*',
    representante: {
      nombre: 'Luis Rodríguez',
      cedula: '13555666',
      telefono: '0424-8765432',
    },
  },
  {
    tipo: 'MENOR',
    nombre: 'Sebastián Blanco',
    cedula: '30666777',
    telefono: '0412-3338008',
    correo: 'sebastian.blanco@gymmail.com',
    fechaNacimiento: '2009-03-25',
    genero: 'M',
    direccion: 'Urbanización El Bosque, Vereda 8, Casa 4',
    clave: 'GymPro2026*',
    representante: {
      nombre: 'Elena Blanco',
      cedula: '15888999',
      telefono: '0412-7654321',
    },
  },
  {
    tipo: 'MENOR',
    nombre: 'Sofía Valentina Gómez',
    cedula: '33111222',
    telefono: '0416-4449009',
    correo: 'sofia.gomez@gymmail.com',
    fechaNacimiento: '2012-12-03',
    genero: 'F',
    direccion: 'Residencias Parque Choroní, Apto 2-A',
    clave: 'GymPro2026*',
    representante: {
      nombre: 'Manuel Gómez',
      cedula: '12777888',
      telefono: '0416-6543210',
    },
  },
  {
    tipo: 'MENOR',
    nombre: 'Diego Alejandro Torres',
    cedula: '31888999',
    telefono: '0414-5550010',
    correo: 'diego.torres@gymmail.com',
    fechaNacimiento: '2010-05-19',
    genero: 'M',
    direccion: 'Sector La Arboleda, Calle Los Mangos, Casa 15',
    clave: 'GymPro2026*',
    representante: {
      nombre: 'Patricia Torres',
      cedula: '16444333',
      telefono: '0414-5432109',
    },
  },
];

test.describe('Registro de 10 Clientes (5 Mayores y 5 Menores)', () => {
  test.describe.configure({ mode: 'serial' });
  test.setTimeout(90000);

  test.beforeAll(async () => {
    // Limpiar usuarios de prueba si existen para garantizar idempotencia
    const cedulas = atletas.map(a => a.cedula);
    const emails = atletas.map(a => a.correo.toLowerCase());
    await prisma.user.deleteMany({
      where: {
        OR: [
          { cedula: { in: cedulas } },
          { email: { in: emails } }
        ]
      }
    });
  });

  test.afterEach(async ({ page, context }) => {
    await context.clearCookies();
    await page.evaluate(() => {
      try {
        localStorage.clear();
        sessionStorage.clear();
      } catch {}
    }).catch(() => {});
  });

  for (let i = 0; i < atletas.length; i++) {
    const a = atletas[i];
    test(`[${i + 1}/10] Registro Atleta ${a.tipo}: ${a.nombre} (CI: ${a.cedula})`, async ({ page, context }) => {
      await context.clearCookies();
      await page.goto('/registro');
      await page.waitForLoadState('domcontentloaded');

      // Esperar a que React esté montado e hidratado (icono del tema visible)
      await page.locator('button[aria-label="Alternar tema"] svg').waitFor({ state: 'visible', timeout: 30000 });
      await page.waitForTimeout(500);

      // Si aparece la alerta de actualización PWA, cerrarla para evitar superposiciones
      const laterBtn = page.locator('button:has-text("Más tarde")');
      if (await laterBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
        await laterBtn.click();
      }

      // 1. Nombre y Apellido
      const nombreInput = page.locator('#athlete-name');
      await expect(nombreInput).toBeVisible({ timeout: 15000 });
      await nombreInput.fill(a.nombre);

      // 2. Cédula
      const cedulaInput = page.locator('#athlete-cedula');
      await cedulaInput.fill(a.cedula);

      // 3. Teléfono
      const telefonoInput = page.locator('#athlete-phone');
      await telefonoInput.fill(a.telefono);

      // 4. Correo
      const correoInput = page.locator('#athlete-email');
      await correoInput.fill(a.correo);

      // 5. Fecha de nacimiento
      const fechaInput = page.locator('#athlete-birthdate');
      await fechaInput.fill(a.fechaNacimiento);

      // 6. Género
      const generoSelect = page.locator('#athlete-gender');
      await generoSelect.selectOption(a.genero);

      // 7. Dirección
      const dirInput = page.locator('#athlete-address');
      await dirInput.fill(a.direccion);

      // 8. Si es menor, completar datos del representante
      if (a.tipo === 'MENOR' && a.representante) {
        const repNameInput = page.locator('#guardian-name');
        await expect(repNameInput).toBeVisible({ timeout: 10000 });
        await repNameInput.fill(a.representante.nombre);

        const repCedulaInput = page.locator('#guardian-cedula');
        await repCedulaInput.fill(a.representante.cedula);

        const repPhoneInput = page.locator('#guardian-phone');
        await repPhoneInput.fill(a.representante.telefono);
      }

      // 9. Contraseñas
      const pwdInput = page.locator('#athlete-password');
      await pwdInput.fill(a.clave);
      const confirmInput = page.locator('#athlete-confirm-password');
      await confirmInput.fill(a.clave);

      // 10. Aceptar términos
      const termsCheckbox = page.locator('#terms-checkbox');
      await termsCheckbox.check();

      // Breve pausa para asegurar sincronización de React state
      await page.waitForTimeout(300);

      // 11. Enviar formulario
      const submitBtn = page.locator('button[type="submit"]');
      await expect(submitBtn).toBeEnabled();
      await submitBtn.click();

      // 12. Verificar en la base de datos con expect.poll (hasta 15s)
      await expect.poll(async () => {
        return await prisma.user.findUnique({
          where: { cedula: a.cedula },
        });
      }, { timeout: 15000, intervals: [300, 600, 1000] }).not.toBeNull();

      const createdUser = await prisma.user.findUnique({
        where: { cedula: a.cedula },
      });

      expect(createdUser?.name).toBe(a.nombre);
      expect(createdUser?.role?.toLowerCase()).toBe('athlete');
      expect(createdUser?.birthDate).toBe(a.fechaNacimiento);

      if (a.tipo === 'MENOR' && a.representante) {
        expect(createdUser?.guardianName).toBe(a.representante.nombre);
        expect(createdUser?.guardianCedula).toBe(a.representante.cedula);
        expect(createdUser?.guardianPhone).toBe(a.representante.telefono);
      }

      console.log(`✅ [OK ${i + 1}/10] Atleta ${a.tipo} creado: ${a.nombre} (CI: ${a.cedula}) - BD Verificada`);
    });
  }
});
