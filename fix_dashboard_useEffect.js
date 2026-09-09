const fs = require('fs');
let c = fs.readFileSync('components/dashboards/athlete-dashboard.tsx', 'utf8');

const regex = /import\("@\/app\/actions\/users"\)\.then\(async \(\{ getAthleteDashboardData \}\) => \{[\s\S]*?\}\);/g;

const replacement = `import("@/app/actions/users").then(async ({ getAthleteDashboardData }) => {
          const stats = await getAthleteDashboardData(user.id);
          if (stats.success) {
            setLiveRoutines(stats.routines || []);
            setLiveDiets(stats.diets || []);
            setPurchases(stats.purchases || []);
          }
        });`;

c = c.replace(regex, replacement);

c = c.replace(/const storedUser = localStorage\.getItem\('gympro_user'\)[\s\S]*?else setCoachName\('Entrenador asignado'\)/, "setCoachName(ath.coachId ? 'Entrenador asignado' : 'Sin Asignar')");

fs.writeFileSync('components/dashboards/athlete-dashboard.tsx', c, 'utf8');
console.log('Fixed useEffect state');
