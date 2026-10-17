const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function initAdmin() {
  try {
    console.log('==> [Auto-Seed] Verificando usuario Administrador (26710825)...');
    const hashedPassword = await bcrypt.hash('#AdminMaximumSa#93', 10);
    
    await prisma.user.upsert({
      where: { cedula: '26710825' },
      update: {
        role: 'admin',
        password: hashedPassword,
      },
      create: {
        cedula: '26710825',
        name: 'Super Administrador',
        role: 'admin',
        password: hashedPassword,
      }
    });

    console.log('==> [Auto-Seed] ¡Usuario Administrador (Cédula: 26710825) configurado con éxito!');
  } catch (error) {
    console.error('==> [Auto-Seed] Error verificando admin:', error?.message || error);
  } finally {
    await prisma.$disconnect();
  }
}

initAdmin();
