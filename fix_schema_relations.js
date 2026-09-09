const fs = require('fs');
let c = fs.readFileSync('prisma/schema.prisma', 'utf8');

const injection = `
  // Rutinas y Dietas
  athleteRoutines    Routine[]         @relation("AthleteRoutines")
  coachRoutines      Routine[]         @relation("CoachRoutines")
  athleteDiets       DietAssignment[]  @relation("AthleteDiets")
  coachDiets         DietAssignment[]  @relation("CoachDiets")
  exerciseProgresses ExerciseProgress[] @relation("AthleteExerciseProgress")
`;

c = c.replace(/  mobilePayment    String\?\n\}/, `  mobilePayment    String?\n${injection}}`);

fs.writeFileSync('prisma/schema.prisma', c, 'utf8');
