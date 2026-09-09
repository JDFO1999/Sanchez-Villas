const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const athleteId = 'cmtkeap2s0004o4wo8jtj3m2n';
  
  try {
    const biometrics = await prisma.biometric.findMany({
      where: { athleteId },
      orderBy: { date: "asc" }
    })
    const allAttendances = await prisma.attendance.findMany({
      where: { athleteId },
      orderBy: { date: "desc" }
    })
    const memberships = await prisma.membership.findMany({
      where: { athleteId },
      include: { plan: true },
      orderBy: { endDate: 'desc' }
    })
    const purchases = await prisma.transaction.findMany({
      where: { customerId: athleteId },
      orderBy: { date: 'desc' },
      include: { items: true },
      take: 5
    });
    
    const routines = await prisma.routine.findMany({
      where: { athleteId },
      include: { exercises: true },
      orderBy: { date: "asc" }
    })
    const diets = await prisma.dietAssignment.findMany({
      where: { athleteId },
      orderBy: { date: "desc" }
    })
    const exerciseProgress = await prisma.exerciseProgress.findMany({
      where: { athleteId },
      orderBy: { date: "asc" }
    })
    
    let lastDate = new Date();
    lastDate.setHours(0,0,0,0);
    let streak = 0;
    
    const payload = { success: true, biometrics, attendances: allAttendances.slice(0, 5), memberships, purchases, streak, routines, diets, exerciseProgress };
    
    console.log("About to stringify...");
    const str = JSON.stringify(payload);
    console.log("Stringified OK! Length:", str.length);
  } catch(e) {
    console.error("FAILED!", e);
  }
}

check().finally(() => prisma.$disconnect());
