const fs = require('fs');

let c = fs.readFileSync('components/dashboards/athlete-dashboard.tsx', 'utf8');

// First, inject state for attendances, streak, exerciseProgress
c = c.replace(/const \[liveDiets, setLiveDiets\] = useState<any\[\]>\(\[\]\)/, `const [liveDiets, setLiveDiets] = useState<any[]>([])
  const [attendances, setAttendances] = useState<any[]>([])
  const [streak, setStreak] = useState(0)
  const [exerciseProgress, setExerciseProgress] = useState<any[]>([])`);

c = c.replace(/setPurchases\(stats\.purchases \|\| \[\]\);\s*\}\s*\}/, `setPurchases(stats.purchases || []);
            setAttendances(stats.attendances || []);
            setStreak(stats.streak || 0);
            setExerciseProgress(stats.exerciseProgress || []);
          }
        }`);

// Fix Racha Card
c = c.replace(/<div className="text-2xl font-bold">5 d\ufffdas<\/div>/, `<div className="text-2xl font-bold">{streak} días</div>`);
c = c.replace(/<div className="text-2xl font-bold">5 d.*?as<\/div>/, `<div className="text-2xl font-bold">{streak} días</div>`);
c = c.replace(/<div className="text-2xl font-bold">5 días<\/div>/, `<div className="text-2xl font-bold">{streak} días</div>`);


// Fix Asistencias Mes Card
c = c.replace(/<div className="text-2xl font-bold">12 \/ 20<\/div>/, `<div className="text-2xl font-bold">{attendances.length}</div>`);

// Fix Carga Maxima Card
const prRegex = /<CardHeader className="flex flex-row items-center justify-between pb-2">[\s\S]*?Carga M.*?xima \(PR\)[\s\S]*?<\/CardContent>\s*<\/Card>/;
const newPrCard = `<CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Carga Máxima (PR)
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {exerciseProgress.length === 0 ? (
                <div className="text-sm text-muted-foreground mt-4">Sin registros de carga.</div>
              ) : (
                <>
                  <div className="mb-2">
                    <select 
                      value={selectedPrIndex}
                      onChange={(e) => setSelectedPrIndex(Number(e.target.value))}
                      className="bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded px-2 py-1 text-xs text-foreground w-full focus:outline-none focus:border-primary [&>option]:bg-white [&>option]:dark:bg-zinc-900 [&>option]:text-black [&>option]:dark:text-white"
                    >
                      {Array.from(new Set(exerciseProgress.map(ep => ep.exerciseId))).map((exId, i) => (
                        <option key={exId} value={i}>{exId}</option>
                      ))}
                    </select>
                  </div>
                  {(() => {
                    const uniqueExercises = Array.from(new Set(exerciseProgress.map(ep => ep.exerciseId)));
                    const selectedExId = uniqueExercises[selectedPrIndex] || uniqueExercises[0];
                    const prData = exerciseProgress.filter(ep => ep.exerciseId === selectedExId).sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
                    
                    if (!prData || prData.length === 0) return null;
                    
                    const isImproving = prData.length > 1 && prData[prData.length - 1].weight >= prData[prData.length - 2].weight;
                    const strokeColor = isImproving ? "#22c55e" : "#eab308";
                    
                    return (
                      <>
                        <div className="flex justify-between items-end">
                          <div>
                            <div className="text-2xl font-bold">{prData[prData.length - 1].weight} kg</div>
                            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                              {isImproving ? <span className="text-green-500">↑ Mejorando</span> : <span className="text-yellow-500">→ Estancado/Bajó</span>}
                            </p>
                          </div>
                          <div className="h-12 w-24">
                            <ResponsiveContainer width="100%" height="100%">
                              <LineChart data={prData}>
                                <YAxis domain={['dataMin - 10', 'dataMax + 10']} hide />
                                <Line type="monotone" dataKey="weight" stroke={strokeColor} strokeWidth={2} dot={false} />
                              </LineChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                      </>
                    )
                  })()}
                </>
              )}
            </CardContent>
          </Card>`;

c = c.replace(prRegex, newPrCard);

fs.writeFileSync('components/dashboards/athlete-dashboard.tsx', c, 'utf8');
console.log('Fixed Asistencias and PR mock data');
