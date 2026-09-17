import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  await prisma.user.create({
    data: {
      name: 'Entrenador Prueba',
      email: 'coach@test.com',
      phone: '04141234567',
      role: 'coach',
      password: '123',
      accessPin: '4321',
      commissionRate: 20,
      cedula: 'V-99999999'
    }
  });
  console.log('Entrenador creado');
}
main().catch(console.error).finally(() => prisma.$disconnect());
