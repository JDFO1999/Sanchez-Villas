const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

let dbUrl = process.env.DATABASE_URL;
if (dbUrl && !dbUrl.includes('sslaccept') && !dbUrl.includes('sslmode')) {
  const sep = dbUrl.includes('?') ? '&' : '?';
  dbUrl = `${dbUrl}${sep}sslaccept=accept_invalid_certs`;
}

const prisma = new PrismaClient(dbUrl ? { datasources: { db: { url: dbUrl } } } : undefined);

async function initAdmin() {
  try {
    console.log('==> [Auto-Seed] Comprobando tablas de base de datos...');
    try {
      await prisma.user.count();
    } catch (tableErr) {
      if (tableErr?.message?.includes('does not exist') || tableErr?.message?.includes('Table') || tableErr?.code === 'P2021') {
        console.log('==> [Auto-Seed] Tablas no encontradas. Ejecutando schema.sql...');
        const sqlPath = path.join(__dirname, '../prisma/schema.sql');
        if (fs.existsSync(sqlPath)) {
          const sql = fs.readFileSync(sqlPath, 'utf8');
          const stmts = sql
            .split(';')
            .map(s => s.replace(/--.*$/gm, '').trim())
            .filter(s => s.length > 0);

          for (const stmt of stmts) {
            try {
              await prisma.$executeRawUnsafe(stmt);
            } catch (err) {
              // Ignorar advertencias si ya existían ciertas definiciones
            }
          }
          console.log(`==> [Auto-Seed] ${stmts.length} tablas e índices creados con éxito.`);
        } else {
          console.warn('==> [Auto-Seed] Archivo schema.sql no encontrado en', sqlPath);
        }
      } else {
        throw tableErr;
      }
    }

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
    console.error('==> [Auto-Seed] Error en initAdmin:', error?.message || error);
  } finally {
    await prisma.$disconnect();
  }
}

initAdmin();
