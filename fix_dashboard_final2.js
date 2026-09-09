const fs = require('fs');
let c = fs.readFileSync('components/dashboards/athlete-dashboard.tsx', 'utf8');

const startStr = "<CardTitle>Actividades Realizadas</CardTitle>";
const endStr = "Mis Compras Section";

let startIndex = c.indexOf(startStr);
let endIndex = c.indexOf("<!--", startIndex); // find next section? 
// Actually let's just find the next Card:
let nextCard = c.indexOf("{/* Mis Compras Section */}");

if (startIndex !== -1 && nextCard !== -1) {
    const before = c.substring(0, startIndex + startStr.length);
    const after = c.substring(nextCard);

    const replacement = `
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
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
            </div>
          </CardContent>
        </Card>
      </div>

      `;

    c = before + replacement + after;
}

// Mojibake fixes
c = c.replace(/C\ufffdDIGO/g, 'CÓDIGO');
c = c.replace(/C\?DIGO/g, 'CÓDIGO');
c = c.replace(/C\u01f8dula/g, 'Cédula');
c = c.replace(/C\u01fcdula/g, 'Cédula');
c = c.replace(/c\ufffddigo/g, 'código');
c = c.replace(/recepci\ufffdn/g, 'recepción');

fs.writeFileSync('components/dashboards/athlete-dashboard.tsx', c, 'utf8');
console.log('Fixed athlete dashboard block');
