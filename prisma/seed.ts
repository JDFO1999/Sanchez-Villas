import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log("Iniciando seeder...")

  const defaultPasswordHash = await bcrypt.hash("MaxFit#Admin2026!Secure", 10)

  // Crear usuario Admin
  const admin = await prisma.user.upsert({
    where: { cedula: '26710825' },
    update: {},
    create: {
      cedula: '26710825',
      name: 'Super Administrador',
      role: 'admin',
      password: defaultPasswordHash
    },
  })
  
  console.log("Admin creado:", admin)
  
  // Crear Cajero de prueba
  const cajero = await prisma.user.upsert({
    where: { cedula: 'cajero' },
    update: {},
    create: {
      cedula: 'cajero',
      name: 'Caja Principal',
      role: 'cajero',
      password: '123', 
      accessPin: '1111' 
    },
  })
  console.log("Cajero creado:", cajero)

  // Crear Entrenador de prueba
  const coach = await prisma.user.upsert({
    where: { cedula: '4444' },
    update: {},
    create: {
      cedula: '4444',
      name: 'Entrenador Carlos',
      role: 'employee',
      password: 'entrenador',
      baseSalary: 200,
      commissionRate: 15
    },
  })
  console.log("Coach creado:", coach)

  // Crear Atleta de prueba
  const athlete = await prisma.user.upsert({
    where: { cedula: '9012' },
    update: {},
    create: {
      cedula: '9012',
      name: 'Atleta Juan',
      role: 'athlete',
      password: 'atleta',
      coachId: coach.id
    },
  })
  console.log("Atleta creado:", athlete)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
