const fs = require('fs');

let c = fs.readFileSync('components/dashboards/athlete-dashboard.tsx', 'utf8');

// Fix the coach assignment mock:
c = c.replace(/const storedUser = localStorage\.getItem\('gympro_user'\)[\s\S]*?else setCoachName\('Entrenador asignado'\)/, "setCoachName(ath.coach?.name || 'Entrenador asignado')");

// Fix the fetch state mock:
c = c.replace(/setLiveRoutines\(liveRoutines \|\| \[\]\);\s*setLiveDiets\(liveDiets \|\| \[\]\);/, "setLiveRoutines(stats.routines || []);\n              setLiveDiets(stats.diets || []);\n              setPurchases(stats.purchases || []);");

// Remove the hardcoded activities and replace with real mapped data
const activitiesMockRegex = /\{\(\(\) => \{\s*const savedStates = JSON\.parse[\s\S]*?\}\) \? 'bg-green-500' : 'bg-muted-foreground'\}\`\} \/>\s*<div>\s*<p className="font-medium text-sm">\{item\.type\}<\/p>\s*<p className="text-xs text-muted-foreground">\{item\.date\}<\/p>\s*<\/div>\s*<\/div>\s*<span className=\{\`text-xs px-2 py-1 rounded-full \$\{\s*item\.status === 'Completado' \s*\? 'bg-green-500\/10 text-green-500' \s*: 'bg-black\/5 dark:bg-white\/5 text-muted-foreground'\s*\}\`\}>\s*\{item\.status\}\s*<\/span>\s*<\/div>\s*\)\)\s*\}\)\(\)\}/;

const realActivitiesLogic = `
              {(() => {
                if (liveRoutines.length === 0) {
                  return <div className="text-sm text-muted-foreground">Aún no hay actividades registradas.</div>;
                }
                return liveRoutines.slice(0, 3).map((routine, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-black/5 dark:border-white/5 hover:bg-secondary/20 transition">
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-2 rounded-full bg-green-500" />
                      <div>
                        <p className="font-medium text-sm">{routine.name || 'Rutina'}</p>
                        <p className="text-xs text-muted-foreground">{new Date(routine.date).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <span className="text-xs px-2 py-1 rounded-full bg-green-500/10 text-green-500">
                      Asignada
                    </span>
                  </div>
                ));
              })()}
`;

c = c.replace(activitiesMockRegex, realActivitiesLogic.trim());

// Mojibake fixes
c = c.replace(/C\ufffdDIGO/g, 'CÓDIGO');
c = c.replace(/C\?DIGO/g, 'CÓDIGO');
c = c.replace(/C\u01f8dula/g, 'Cédula');
c = c.replace(/C\u01fcdula/g, 'Cédula');
c = c.replace(/c\ufffddigo/g, 'código');
c = c.replace(/recepci\ufffdn/g, 'recepción');

fs.writeFileSync('components/dashboards/athlete-dashboard.tsx', c, 'utf8');
console.log('Fixed athlete dashboard');
