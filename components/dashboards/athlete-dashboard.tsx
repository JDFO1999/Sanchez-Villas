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

  useEffect(() => {
    if (user?.id) {
      const allTx = storeService.getTransactions()
      const userTx = allTx.filter(tx => tx.customerId === user.id)
      setPurchases(userTx.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()))
      setProducts(storeService.getProducts())
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
            Aquí está tu progreso y resumen de hoy.
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Link href="/tienda" className="bg-secondary text-secondary-foreground px-4 py-2 rounded-md font-medium shadow-sm hover:bg-secondary/80 transition flex items-center gap-2">
            <ShoppingCart className="h-4 w-4" />
            Ir a la Tienda
          </Link>
          <Link href="/rutina" className="bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium shadow-sm hover:bg-primary/90 transition flex items-center gap-2">
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
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm">Factura: {tx.id}</span>
                      <span className="text-xs text-muted-foreground">{new Date(tx.date).toLocaleDateString()}</span>
                      {tx.status === 'PENDING_PICKUP' ? (
                        <span className="text-[10px] bg-yellow-500/20 text-yellow-500 px-2 py-0.5 rounded-full font-bold flex items-center gap-1"><Clock className="h-3 w-3"/> PENDIENTE RETIRO</span>
                      ) : (
                        <span className="text-[10px] bg-green-500/20 text-green-500 px-2 py-0.5 rounded-full font-bold">COMPLETADA</span>
                      )}
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {tx.items.map(item => {
                        const img = getProductImage(item.productId)
                        return (
                          <div key={item.productId} className="flex items-center gap-2 bg-secondary/30 p-2 rounded-lg border border-black/5 dark:border-white/5">
                            {img ? (
                              <img src={img} alt={item.name} className="h-10 w-10 object-contain rounded bg-black/5 dark:bg-white/5 p-1" />
                            ) : (
                              <div className="h-10 w-10 bg-black/5 dark:bg-white/5 rounded flex items-center justify-center">
                                <ShoppingCart className="h-5 w-5 text-muted-foreground opacity-50" />
                              </div>
                            )}
                            <div>
                              <p className="text-xs font-bold leading-tight max-w-[120px] truncate" title={item.name}>{item.name}</p>
                              <p className="text-[10px] text-muted-foreground">{item.qty}x</p>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                  
                  <div className="flex flex-col justify-center items-end gap-2 border-t md:border-t-0 md:border-l border-black/10 dark:border-white/10 pt-3 md:pt-0 md:pl-4">
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground mb-1">Pago con {tx.paymentMethod}</p>
                      <p className="font-black text-xl text-primary">${tx.total.toFixed(2)}</p>
                    </div>
                    {tx.pickupCode && tx.status === 'PENDING_PICKUP' && (
                      <div className="bg-white text-black px-3 py-2 rounded-lg border-2 border-dashed border-black text-center">
                        <p className="text-[9px] font-bold">CÓDIGO DE RETIRO</p>
                        <p className="font-mono font-black text-lg">{tx.pickupCode}</p>
                      </div>
                    )}
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
