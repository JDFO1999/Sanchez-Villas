const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function initAdmin() {
  try {
    const adminExists = await prisma.user.findFirst({
      where: { role: 'admin' }
    });

    if (!adminExists) {
      console.log('==> [Auto-Seed] Creando usuario Administrador inicial...');
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await prisma.user.create({
        data: {
          cedula: 'admin',
          name: 'Administrador Principal',
          role: 'admin',
          password: hashedPassword,
        }
      });
      console.log('==> [Auto-Seed] ¡Administrador creado exitosamente (Usuario: admin | Clave: admin123)!');
    } else {
      console.log('==> [Auto-Seed] Administrador existente detectado.');
    }
  } catch (error) {
    console.error('==> [Auto-Seed] Error verificando admin:', error?.message || error);
  } finally {
    await prisma.$disconnect();
  }
}

initAdmin();
