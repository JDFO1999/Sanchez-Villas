"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, CheckCircle2, Dumbbell, Flame, TrendingUp, ShoppingCart, Clock, Package } from "lucide-react"
import Link from "next/link"
import { LineChart, Line, ResponsiveContainer, YAxis } from "recharts"
import { storeService, Transaction, Product } from "@/lib/store-service"

const topExercises = [
  {
    id: 1,
    name: "Sentadilla libre",
    data: [
      { day: "S1", weight: 100 },
      { day: "S2", weight: 105 },
      { day: "S3", weight: 110 },
      { day: "S4", weight: 115 },
      { day: "S5", weight: 120 },
    ]
  },
  {
    id: 2,
    name: "Peso Muerto",
    data: [
      { day: "S1", weight: 120 },
      { day: "S2", weight: 120 },
      { day: "S3", weight: 125 },
      { day: "S4", weight: 130 },
      { day: "S5", weight: 130 },
    ]
  },
  {
    id: 3,
    name: "Press de Banca",
    data: [
      { day: "S1", weight: 70 },
      { day: "S2", weight: 75 },
      { day: "S3", weight: 72 },
      { day: "S4", weight: 70 },
      { day: "S5", weight: 65 }, // Estancado o bajó
    ]
  }
]

export function AthleteDashboard() {
  const { user } = useAuth()
  
  const [routineStatus, setRoutineStatus] = useState<'pending' | 'in-progress' | 'completed'>('pending')
  const [selectedPrIndex, setSelectedPrIndex] = useState(0)
  
  const [purchases, setPurchases] = useState<Transaction[]>([])
  const [products, setProducts] = useState<Product[]>([])

  const [coachName, setCoachName] = useState('Sin Asignar')
  useEffect(() => {
    if (user?.id) {
      const allTx = storeService.getTransactions()
      const userTx = allTx.filter(tx => tx.customerId === user.id)
      setPurchases(userTx.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()))
      setProducts(storeService.getProducts())

      // fetch coach
      import("@/lib/data-service").then(({ athleteService }) => {
        const ath = athleteService.getAthlete(user.id)
        if (ath && ath.coachId) {
          const storedUser = localStorage.getItem('gympro_user') // or just fetch from mocked users
          if (ath.coachId === '2' || ath.coachId === '4') setCoachName('Carlos (Staff Principal)')
          else setCoachName('Entrenador asignado')
        }
      })
    }
  }, [user?.id])

  const getProductImage = (productId: string) => {
    const prod = products.find(p => p.id === productId)
    return prod?.imageUrl || ''
  }

  const currentExercise = topExercises[selectedPrIndex]
  const prData = currentExercise.data
  const isImproving = prData[prData.length - 1].weight >= prData[prData.length - 2].weight
  const strokeColor = isImproving ? "#22c55e" : "#eab308"

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tighter bg-gradient-to-r from-primary dark:dark:via-white via-black via-black to-primary/50 bg-clip-text text-transparent dark:dark:drop-shadow-[0_0_15px_rgba(255,255,255,0.1)] drop-shadow-sm drop-shadow-sm">Hola, {user?.name?.split(' ')[1] || 'Atleta'}</h1>
          <p className="text-muted-foreground mt-1">
            Tu Coach Actual: <span className="font-bold text-foreground">{coachName}</span>
          </p>
          <div className="mt-3 bg-blue-500/10 border border-blue-500/30 text-blue-500 text-sm px-3 py-2 rounded-lg flex items-center gap-2">
             <span className="relative flex h-3 w-3">
               <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
               <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
             </span>
             Tienes una nueva rutina pendiente por completar hoy.
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Link href="/tienda" className="bg-black text-white dark:bg-secondary dark:text-secondary-foreground px-4 py-2 rounded-md font-medium shadow-sm hover:opacity-80 transition flex items-center gap-2">
            <ShoppingCart className="h-4 w-4" />
            Ir a la Tienda
          </Link>
          <Link href="/rutina" className="bg-primary text-primary-foreground font-black px-4 py-2 rounded-md shadow-sm hover:opacity-90 transition flex items-center gap-2 drop-shadow-md">
            <Dumbbell className="h-4 w-4" />
            Rutinas propuestas por el Coach
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Racha Actual
            </CardTitle>
            <Flame className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4 Días</div>
            <p className="text-xs text-muted-foreground mt-1">
              ¡Sigue así! Estás en racha.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Asistencias Mes
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12 / 20</div>
            <p className="text-xs text-muted-foreground mt-1">
              Progreso hacia tu meta mensual
            </p>
          </CardContent>
        </Card>

        <Card className="border-primary/50 bg-primary/5">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-primary">
              Membresía
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">Activa</div>
            <p className="text-xs text-muted-foreground mt-1">
              Vence en 14 días
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Carga Máxima (PR)
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="mb-2">
              <select 
                value={selectedPrIndex}
                onChange={(e) => setSelectedPrIndex(Number(e.target.value))}
                className="bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded px-2 py-1 text-xs text-muted-foreground w-full focus:outline-none focus:border-primary"
              >
                {topExercises.map((ex, i) => (
                  <option key={ex.id} value={i}>{ex.name}</option>
                ))}
              </select>
            </div>
            <div className="flex justify-between items-end">
              <div>
                <div className="text-2xl font-bold">{prData[prData.length - 1].weight} kg</div>
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                  {isImproving ? <span className="text-green-500">▲ Mejorando</span> : <span className="text-yellow-500">▼ Estancado/Bajó</span>}
                </p>
              </div>
              <div className="h-10 w-24">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={prData}>
                    <YAxis domain={['dataMin - 10', 'dataMax + 10']} hide />
                    <Line type="monotone" dataKey="weight" stroke={strokeColor} strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Entrenamiento de Hoy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-secondary/50 border">
                <h4 className="font-medium text-primary mb-1">Día 4: Pierna y Glúteo</h4>
                <p className="text-sm text-muted-foreground mb-3">Enfocado en hipertrofia y fuerza máxima.</p>
                
                <div className="space-y-2 text-sm mb-4">
                  {[
                    { name: "1. Sentadilla Libre", reps: "4 x 10-12" },
                    { name: "2. Prensa Inclinada", reps: "4 x 12" },
                    { name: "3. Extensión de Cuádriceps", reps: "3 x 15" }
                  ].map((ex, i) => (
                    <div key={i} 
                         className={`flex justify-between items-center p-2 rounded border transition-colors ${routineStatus === 'in-progress' ? 'hover:bg-black/5 dark:bg-white/5 cursor-pointer border-black/10 dark:border-white/10' : 'border-transparent border-b-white/5'}`}
                         onClick={() => {
                           if (routineStatus === 'in-progress') {
                             // Minimal internal state for toggling in dashboard
                             const el = document.getElementById(`dash-ex-${i}`) as HTMLInputElement
                             if (el) el.checked = !el.checked
                           }
                         }}>
                      <div className="flex items-center gap-2">
                        {routineStatus === 'in-progress' && (
                          <input type="checkbox" id={`dash-ex-${i}`} className="h-4 w-4 rounded border-white/20 bg-black/50 accent-primary" onClick={e => e.stopPropagation()} />
                        )}
                        <span className={routineStatus === 'completed' ? 'line-through text-muted-foreground' : ''}>{ex.name}</span>
                      </div>
                      <span className="text-muted-foreground">{ex.reps}</span>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  {routineStatus === 'pending' && (
                    <button 
                      onClick={() => setRoutineStatus('in-progress')}
                      className="w-full py-2 bg-primary/20 text-primary font-bold rounded-lg hover:bg-primary/30 transition text-sm"
                    >
                      Empezar Entrenamiento
                    </button>
                  )}
                  {routineStatus === 'in-progress' && (
                    <button 
                      onClick={() => setRoutineStatus('completed')}
                      className="w-full py-2 bg-primary text-primary-foreground font-bold rounded-lg hover:bg-primary/90 transition text-sm flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 className="h-4 w-4" /> Marcar como Completado
                    </button>
                  )}
                  {routineStatus === 'completed' && (
                    <div className="w-full py-2 bg-green-500/20 text-green-500 font-bold rounded-lg text-sm flex items-center justify-center gap-2">
                      <CheckCircle2 className="h-4 w-4" /> Entrenamiento Finalizado
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Actividades Realizadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { date: "Hoy", type: routineStatus === 'completed' ? "Pierna y Glúteo" : "Bebida recomendada tomada (Pre-entreno)", status: "Completado" },
                { date: "Ayer", type: "Espalda y Bíceps", status: "Completado" },
                { date: "Hace 2 días", type: "Pecho y Tríceps", status: "Completado" },
                { date: "Hace 3 días", type: "Batido Post-Entreno", status: "Completado" },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-black/5 dark:border-white/5 hover:bg-secondary/20 transition">
                  <div className="flex items-center gap-3">
                    <div className={`h-2 w-2 rounded-full ${item.status === 'Completado' ? 'bg-green-500' : 'bg-primary'}`} />
                    <div>
                      <p className="font-medium text-sm">{item.type}</p>
                      <p className="text-xs text-muted-foreground">{item.date}</p>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    item.status === 'Completado' 
                      ? 'bg-green-500/10 text-green-500' 
                      : 'bg-primary/10 text-primary'
                  }`}>
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mis Compras Section */}
      <Card className="mt-6 border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            Mis Compras y Facturas
          </CardTitle>
        </CardHeader>
        <CardContent>
          {purchases.length === 0 ? (
            <p className="text-sm text-muted-foreground">No tienes compras recientes.</p>
          ) : (
            <div className="space-y-4">
              {purchases.map(tx => (
                <div key={tx.id} className="bg-card p-4 rounded-xl border border-black/10 dark:border-white/10 flex flex-col md:flex-row gap-4 justify-between">
                  <div className="w-full flex justify-center pt-4 md:pt-0">
                    <div className="bg-white text-black p-6 w-full max-w-sm font-mono text-sm relative shadow-sm border border-gray-200 mx-auto">
                      <div className="text-center mb-4 border-b border-dashed border-black pb-4">
                        <h2 className="font-bold text-xl uppercase tracking-widest">TICKET DE COMPRA</h2>
                        <p className="text-black mt-1 font-bold">{tx.id}</p>
                        {tx.pickupCode && tx.status === 'PENDING_PICKUP' && (
                          <div className="mt-2 mb-2 p-2 border-2 border-dashed border-black bg-gray-100 text-center">
                            <p className="font-bold text-[10px]">CÓDIGO DE RETIRO</p>
                            <p className="text-xl font-black">{tx.pickupCode}</p>
                          </div>
                        )}
                        <p className="text-black text-xs">{new Date(tx.date).toLocaleString()}</p>
                        <p className="text-black text-xs font-bold mt-1">Estatus: {tx.status === 'PENDING_PICKUP' ? 'PENDIENTE DE RETIRO' : 'COMPLETADA'}</p>
                      </div>

                      <div className="space-y-2 mb-4 text-black">
                        <div className="flex justify-between font-bold border-b border-black pb-1 mb-2 text-xs">
                          <span>CANT. DESC.</span>
                          <span>TOTAL</span>
                        </div>
                        {tx.items.map(item => (
                          <div key={item.productId} className="flex justify-between items-start text-xs mb-1 leading-tight">
                            <div className="flex gap-2 pr-2">
                              <span className="font-bold">{item.qty}x</span>
                              <span>{item.name}</span>
                            </div>
                            <span className="shrink-0 font-bold">${item.subtotal.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>

                      <div className="border-t border-dashed border-black pt-3 space-y-1 text-black text-xs">
                        <div className="flex justify-between">
                          <span>Subtotal</span>
                          <span>${tx.subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-base font-black mt-1 pt-1 border-t border-black">
                          <span>TOTAL</span>
                          <span>${tx.total.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between mt-2">
                          <span>Pago con:</span>
                          <span className="uppercase">{tx.paymentMethod}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
