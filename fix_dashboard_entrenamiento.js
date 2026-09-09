const fs = require('fs');
let c = fs.readFileSync('components/dashboards/athlete-dashboard.tsx', 'utf8');

const regex = /<CardTitle>Entrenamiento de Hoy<\/CardTitle>[\s\S]*?<\/CardContent>\s*<\/Card>/;

const replacement = `<CardTitle>Entrenamiento de Hoy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {(() => {
                const todayRoutine = liveRoutines && liveRoutines.length > 0 ? liveRoutines[0] : null;
                if (!todayRoutine) {
                  return (
                    <div className="p-4 rounded-lg bg-secondary/50 border text-center text-muted-foreground">
                      No tienes rutina asignada para hoy.
                    </div>
                  );
                }
                return (
                  <div className="p-4 rounded-lg bg-secondary/50 border">
                    <h4 className="font-medium text-primary mb-1">{todayRoutine.name || 'Entrenamiento del día'}</h4>
                    <p className="text-sm text-muted-foreground mb-3">{todayRoutine.description || 'Cumple con tus objetivos diarios.'}</p>
                    
                    <div className="space-y-2 text-sm mb-4">
                      {todayRoutine.exercises && todayRoutine.exercises.map((ex: any, i: number) => (
                        <div key={i} className="flex justify-between items-center p-2 rounded border border-transparent border-b-black/5 dark:border-b-white/5">
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full shrink-0 bg-muted-foreground"></div>
                            <span>{ex.name || ex.exercise?.name || 'Ejercicio ' + (i+1)}</span>
                          </div>
                          <span className="text-muted-foreground">{ex.sets}x{ex.reps}</span>
                        </div>
                      ))}
                    </div>
                    <Link href="/rutina">
                      <button className="w-full py-2 bg-primary/20 text-primary font-bold rounded-lg hover:bg-primary/30 transition text-sm">
                        Ir a la Rutina Completa
                      </button>
                    </Link>
                  </div>
                );
              })()}
            </div>
          </CardContent>
        </Card>`;

c = c.replace(regex, replacement);
fs.writeFileSync('components/dashboards/athlete-dashboard.tsx', c, 'utf8');
console.log('Fixed Entrenamiento de Hoy');
