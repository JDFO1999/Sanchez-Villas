const fs = require('fs');

let c = fs.readFileSync('components/dashboards/athlete-dashboard.tsx', 'utf8');

// 1. Replace the static blue banner with the dynamic banner
const bannerRegex = /<div className="mt-3 bg-blue-500\/10 border border-blue-500\/30 text-blue-500 text-sm px-3 py-2 rounded-lg flex items-center gap-2">[\s\S]*?<\/div>/;

const dynamicBanner = `{(() => {
              const todayStr = new Date().toDateString();
              const todayRoutine = liveRoutines.find(r => new Date(r.date).toDateString() === todayStr);
              
              if (!todayRoutine) {
                return (
                  <div className="mt-3 bg-red-500/10 border border-red-500/30 text-red-500 text-sm px-3 py-2 rounded-lg flex items-center gap-2 font-bold uppercase">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                    </span>
                    NO SE HA ASIGNADO UNA RUTINA POR HOY
                  </div>
                );
              } else if (todayRoutine.completed) {
                return (
                  <div className="mt-3 bg-green-500/10 border border-green-500/30 text-green-500 text-sm px-3 py-2 rounded-lg flex items-center gap-2 font-bold uppercase">
                    <CheckCircle2 className="h-4 w-4" />
                    HAS COMPLETADO LA RUTINA DE HOY, EXCELENTE!
                  </div>
                );
              } else {
                return (
                  <div className="mt-3 bg-blue-500/10 border border-blue-500/30 text-blue-500 text-sm px-3 py-2 rounded-lg flex items-center gap-2 font-bold">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                    </span>
                    Tienes una nueva rutina pendiente por completar hoy.
                  </div>
                );
              }
            })()}`;

c = c.replace(bannerRegex, dynamicBanner);

// 2. Fix the "Entrenamiento de Hoy" Card to also use the same todayRoutine logic so it matches!
const cardRegex = /const todayRoutine = liveRoutines && liveRoutines\.length > 0 \? liveRoutines\[0\] : null;/;
c = c.replace(cardRegex, "const todayStr = new Date().toDateString();\n                const todayRoutine = liveRoutines.find(r => new Date(r.date).toDateString() === todayStr);");

fs.writeFileSync('components/dashboards/athlete-dashboard.tsx', c, 'utf8');
console.log('Fixed routine banner and card logic');
