const fs = require('fs');
const lines = fs.readFileSync('prisma/schema.prisma', 'utf8').split('\n');

const endOfUserIdx = lines.findIndex((line, i) => i > 10 && line.trim() === '}' && lines[i-1].includes('mobilePayment'));

if (endOfUserIdx !== -1) {
  lines.splice(endOfUserIdx, 0, `  // Rutinas y Dietas
  athleteRoutines    Routine[]         @relation("AthleteRoutines")
  coachRoutines      Routine[]         @relation("CoachRoutines")
  athleteDiets       DietAssignment[]  @relation("AthleteDiets")
  coachDiets         DietAssignment[]  @relation("CoachDiets")
  exerciseProgresses ExerciseProgress[] @relation("AthleteExerciseProgress")`);
  
  fs.writeFileSync('prisma/schema.prisma', lines.join('\n'), 'utf8');
  console.log('Injected successfully');
} else {
  console.log('Could not find end of User model');
}
