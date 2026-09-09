const fs = require('fs');

function fixMojibake(text) {
  return text
    .replace(/Ã¡/g, 'á')
    .replace(/Ã©/g, 'é')
    .replace(/Ã­/g, 'í')
    .replace(/Ã³/g, 'ó')
    .replace(/Ãº/g, 'ú')
    .replace(/Ã±/g, 'ñ')
    .replace(/Ã /g, 'Á')
    .replace(/Ã‰/g, 'É')
    .replace(/Ã\x8D/g, 'Í')
    .replace(/Ã“/g, 'Ó')
    .replace(/Ãš/g, 'Ú')
    .replace(/Ã‘/g, 'Ñ')
    .replace(/Â¿/g, '¿')
    .replace(/Â¡/g, '¡')
    .replace(/Â°/g, '°');
}

let c = fs.readFileSync('app/atletas/[id]/page.tsx', 'utf8');

c = fixMojibake(c);

// Fix attendance logic and "Invalid Date"
c = c.replace(/const endDate = new Date\(athlete\.membershipEnd\)/, `const endDateStr = athlete.membershipEnd;
  const endDate = endDateStr && endDateStr !== "1970-01-01T00:00:00.000Z" ? new Date(endDateStr) : null;
  const today = new Date();
  const diffTime = endDate ? endDate.getTime() - today.getTime() : -1;
  const diffDays = endDate ? Math.ceil(diffTime / (1000 * 60 * 60 * 24)) : 0;
  
  const createdDate = new Date(athlete.createdAt || new Date());
  const totalDaysRegistered = Math.max(1, Math.floor((today.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24)));
  const totalAttendances = athlete.attendance?.length || 0;
  const calculatedAttendancePct = Math.min(100, Math.round((totalAttendances / totalDaysRegistered) * 100));
  const attendanceText = calculatedAttendancePct >= 70 ? "Buena" : calculatedAttendancePct >= 40 ? "Regular" : "Baja";`);

// Remove old diffTime, diffDays calculations
c = c.replace(/const today = new Date\(\)\n  const diffTime = endDate\.getTime\(\) - today\.getTime\(\)\n  const diffDays = Math\.ceil\(diffTime \/ \(1000 \* 60 \* 60 \* 24\)\)/, '');

c = c.replace(/\{athlete\.attendancePercentage\}%/g, '{calculatedAttendancePct}%');
c = c.replace(/<span className="text-sm text-green-500 font-medium">Buena<\/span>/, `<span className={\`text-sm font-medium \${calculatedAttendancePct >= 70 ? 'text-green-500' : calculatedAttendancePct >= 40 ? 'text-yellow-500' : 'text-red-500'}\`}>{attendanceText}</span>`);

// Handle Invalid Date on Membership
c = c.replace(/<p className="font-medium text-sm">\{new Date\(athlete\.membershipEnd\)\.toLocaleDateString\(\)\}<\/p>/, `<p className="font-medium text-sm">{endDate ? endDate.toLocaleDateString() : 'Sin Plan Activo'}</p>`);

// Fix Plan name showing up if not active
c = c.replace(/<p className="font-medium text-sm">\{athlete\.membershipType\}<\/p>/, `<p className="font-medium text-sm">{endDate ? athlete.membershipType : 'Ninguno'}</p>`);

c = c.replace(/<p className="font-bold text-xl \$\{diffDays > 0 \? 'text-green-500' : 'text-red-500'\}">/, `<p className={\`font-bold text-xl \${diffDays > 0 ? 'text-green-500' : 'text-red-500'}\`}>`);

c = c.replace(/\{diffDays > 0 \? 'Activa' : 'Vencida'\}/, `{!endDate ? 'Sin Membresía' : diffDays > 0 ? 'Activa' : 'Vencida'}`);

// Also fix the text 4 DÃ­as which might be hardcoded in the file
c = c.replace(/ðŸ”¥ Racha de Asistencia: 4 DÃ­as/, '🔥 Racha de Asistencia: {athlete.streak || 0} Días');
c = c.replace(/ðŸ”¥ Racha de Asistencia: 4 Días/, '🔥 Racha de Asistencia: {athlete.streak || 0} Días');

fs.writeFileSync('app/atletas/[id]/page.tsx', c, 'utf8');
console.log('Fixed Mojibake and Attendance logic!');
