import prisma from "@/lib/db";
import { createAthlete } from "@/app/actions/users";

const atletas = [
  // 5 Mayores de edad
  {
    tipo: 'MAYOR',
    nombre: 'Alejandro Morales',
    cedula: '25111222',
    telefono: '0414-1112233',
    correo: 'alejandro.morales@gymmail.com',
    fechaNacimiento: '1998-04-12',
    genero: 'M' as const,
    direccion: 'Av. Las Delicias, Residencias El Bosque, Apto 4-B',
    clave: 'GymPro2026*',
  },
  {
    tipo: 'MAYOR',
    nombre: 'Gabriela Rivas',
    cedula: '26333444',
    telefono: '0424-2223344',
    correo: 'gabriela.rivas@gymmail.com',
    fechaNacimiento: '2001-09-23',
    genero: 'F' as const,
    direccion: 'Calle Los Cedros, Qta. Flor de Mayo',
    clave: 'GymPro2026*',
  },
  {
    tipo: 'MAYOR',
    nombre: 'Ricardo Fernández',
    cedula: '24555666',
    telefono: '0412-3334455',
    correo: 'ricardo.fernandez@gymmail.com',
    fechaNacimiento: '1996-11-05',
    genero: 'M' as const,
    direccion: 'Sector La Soledad, Edif. Torre Norte, PH-1',
    clave: 'GymPro2026*',
  },
  {
    tipo: 'MAYOR',
    nombre: 'Valeria Mendoza',
    cedula: '27888999',
    telefono: '0416-4445566',
    correo: 'valeria.mendoza@gymmail.com',
    fechaNacimiento: '2003-02-18',
    genero: 'F' as const,
    direccion: 'Av. Bolívar, Res. Araguaney, Piso 6',
    clave: 'GymPro2026*',
  },
  {
    tipo: 'MAYOR',
    nombre: 'Carlos Eduardo Pinto',
    cedula: '23444555',
    telefono: '0414-5556677',
    correo: 'carlos.pinto@gymmail.com',
    fechaNacimiento: '1994-07-30',
    genero: 'M' as const,
    direccion: 'Urbanización Base Aragua, Manzana C, Casa 12',
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
    genero: 'M' as const,
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
    genero: 'F' as const,
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
    genero: 'M' as const,
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
    genero: 'F' as const,
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
    genero: 'M' as const,
    direccion: 'Sector La Arboleda, Calle Los Mangos, Casa 15',
    clave: 'GymPro2026*',
    representante: {
      nombre: 'Patricia Torres',
      cedula: '16444333',
      telefono: '0414-5432109',
    },
  },
];

async function main() {
  console.log('--- Iniciando Registro de 10 Clientes (5 Mayores y 5 Menores) ---');

  // Limpiar antes de ejecutar
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

  const results: any[] = [];

  for (let i = 0; i < atletas.length; i++) {
    const a = atletas[i];
    const res = await createAthlete(a.cedula, a.clave, {
      name: a.nombre,
      gender: a.genero,
      birthDate: a.fechaNacimiento,
      phone: a.telefono,
      email: a.correo,
      address: a.direccion,
      guardianName: a.tipo === 'MENOR' ? a.representante?.nombre : undefined,
      guardianCedula: a.tipo === 'MENOR' ? a.representante?.cedula : undefined,
      guardianPhone: a.tipo === 'MENOR' ? a.representante?.telefono : undefined,
      isSelfRegistration: true,
    });

    if (!res.success) {
      console.error(`❌ Error registrando atleta ${a.nombre}:`, res.error);
      process.exit(1);
    }

    // Verificar en BD
    const dbUser = await prisma.user.findUnique({
      where: { cedula: a.cedula },
      select: {
        id: true,
        name: true,
        cedula: true,
        email: true,
        birthDate: true,
        guardianName: true,
        guardianCedula: true,
        guardianPhone: true,
        role: true,
      }
    });

    results.push({
      n: i + 1,
      tipo: a.tipo,
      nombre: dbUser?.name,
      cedula: dbUser?.cedula,
      nacimiento: dbUser?.birthDate,
      rol: dbUser?.role,
      representante: dbUser?.guardianName || '(N/A - Mayor de edad)',
      ciRepresentante: dbUser?.guardianCedula || '-',
      telRepresentante: dbUser?.guardianPhone || '-',
    });

    console.log(`✅ [${i + 1}/10] Registrado exitosamente: ${a.nombre} (${a.tipo})`);
  }

  console.log('\n--- RESUMEN DE LOS 10 CLIENTES REGISTRADOS EN BD ---');
  console.table(results);
  process.exit(0);
}

main().catch(err => {
  console.error('Error fatal:', err);
  process.exit(1);
});
