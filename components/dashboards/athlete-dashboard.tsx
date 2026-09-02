"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, CheckCircle2, Dumbbell, Flame, TrendingUp, ShoppingCart, Clock, Package, Eye, ScanBarcode } from "lucide-react"
import Link from "next/link"
import { LineChart, Line, ResponsiveContainer, YAxis } from "recharts"
import { storeService, Transaction, Product } from "@/lib/store-service"
import { QRCodeSVG } from "qrcode.react"

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
  const [showTicketModal, setShowTicketModal] = useState<Transaction | null>(null)

  const [showQRModal, setShowQRModal] = useState(false)
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
          <h1 className="text-4xl font-black tracking-tighter bg-gradient-to-r from-primary dark:dark:via-white via-black via-black to-primary/50 bg-clip-text text-transparent dark:dark:drop-shadow-[0_0_15px_rgba(255,255,255,0.1)] drop-shadow-sm drop-shadow-sm">Hola, {user?.name?.split(' ')[0] || 'Atleta'}</h1>
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
        <div className="flex flex-col sm:flex-row gap-2">
          <button onClick={() => setShowQRModal(true)} className="bg-primary text-white px-4 py-2 rounded-md font-bold shadow-sm hover:bg-primary/90 transition flex items-center justify-center gap-2">
            <ScanBarcode className="h-5 w-5" /> Mostrar mi Código de Acceso
          </button>
        </div>
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
                className="bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded px-2 py-1 text-xs text-foreground w-full focus:outline-none focus:border-primary [&>option]:bg-white [&>option]:dark:bg-zinc-900 [&>option]:text-black [&>option]:dark:text-white"
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
                    { name: "3. Extensión de Cuádriceps", reps: "3 x 15" },
                    { name: "4. Hip Thrust", reps: "4 x 10" }
                  ].map((ex, i) => {
                    const savedStates = JSON.parse(localStorage.getItem('gympro_exercise_states') || '{}')
                    const todayState = savedStates?.today?.[i] || 'pending'
                    const stateColor = todayState === 'completed' ? 'text-green-500 line-through opacity-60' 
                      : todayState === 'failed' ? 'text-red-500 line-through opacity-60'
                      : todayState === 'progress' ? 'text-yellow-500' : ''
                    const dotColor = todayState === 'completed' ? 'bg-green-500' 
                      : todayState === 'failed' ? 'bg-red-500'
                      : todayState === 'progress' ? 'bg-yellow-500' : 'bg-muted-foreground'
                    return (
                    <div key={i} 
                         className="flex justify-between items-center p-2 rounded border border-transparent border-b-black/5 dark:border-b-white/5">
                      <div className="flex items-center gap-2">
                        <div className={`h-2 w-2 rounded-full shrink-0 ${dotColor}`}></div>
                        <span className={stateColor}>{ex.name}</span>
                      </div>
                      <span className="text-muted-foreground">{ex.reps}</span>
                    </div>
                  )})}
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
              {(() => {
                const savedStates = JSON.parse(localStorage.getItem('gympro_exercise_states') || '{}')
                const todayExercises = [
                  "Sentadilla Libre", "Prensa Inclinada", "Extensión de Cuádriceps", "Hip Thrust"
                ]
                const completedToday = todayExercises
                  .map((name, i) => ({ name, state: savedStates?.today?.[i] || 'pending' }))
                  .filter(e => e.state === 'completed')

                const pastActivities = [
                  { date: "Ayer", type: "Espalda y Bíceps", status: "Completado" },
                  { date: "Hace 2 días", type: "Pecho y Tríceps", status: "Completado" },
                  { date: "Hace 3 días", type: "Batido Post-Entreno", status: "Completado" },
                ]

                const todayItems = completedToday.map(e => ({ date: "Hoy", type: e.name, status: "Completado" }))
                const allItems = todayItems.length > 0 ? [...todayItems, ...pastActivities] : [
                  { date: "Hoy", type: "Aún no has completado ejercicios", status: "Pendiente" },
                  ...pastActivities
                ]

                return allItems.map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-black/5 dark:border-white/5 hover:bg-secondary/20 transition">
                    <div className="flex items-center gap-3">
                      <div className={`h-2 w-2 rounded-full ${item.status === 'Completado' ? 'bg-green-500' : 'bg-muted-foreground'}`} />
                      <div>
                        <p className="font-medium text-sm">{item.type}</p>
                        <p className="text-xs text-muted-foreground">{item.date}</p>
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      item.status === 'Completado' 
                        ? 'bg-green-500/10 text-green-500' 
                        : 'bg-black/5 dark:bg-white/5 text-muted-foreground'
                    }`}>
                      {item.status}
                    </span>
                  </div>
                ))
              })()}
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
                    <div className="flex gap-2">
                      <button 
                        onClick={() => setShowTicketModal(tx)}
                        className="bg-black/10 dark:bg-white/10 hover:bg-black/20 dark:hover:bg-white/20 px-3 py-1.5 rounded text-xs font-bold flex items-center gap-1 transition"
                      >
                        <Eye className="h-3 w-3" /> Ver Ticket
                      </button>
                    </div>
                    {tx.pickupCode && tx.status === 'PENDING_PICKUP' && (
                      <div className="bg-white text-black px-3 py-2 rounded-lg border-2 border-dashed border-black text-center mt-1">
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

      {/* TICKET MODAL */}
      {showTicketModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 overflow-y-auto" onClick={() => setShowTicketModal(null)}>
          <div className="w-full flex justify-center pt-4 md:pt-0" onClick={e => e.stopPropagation()}>
            <div className="bg-white text-black p-6 w-full max-w-sm font-mono text-sm relative shadow-sm border border-gray-200 mx-auto">
              <button onClick={() => setShowTicketModal(null)} className="absolute top-2 right-2 text-gray-500 hover:text-black font-sans font-bold text-xl">&times;</button>
              <div className="text-center mb-4 border-b border-dashed border-black pb-4">
                <h2 className="font-bold text-xl uppercase tracking-widest">TICKET DE COMPRA</h2>
                <p className="text-black mt-1 font-bold">{showTicketModal.id}</p>
                {showTicketModal.pickupCode && showTicketModal.status === 'PENDING_PICKUP' && (
                  <div className="mt-2 mb-2 p-2 border-2 border-dashed border-black bg-gray-100 text-center">
                    <p className="font-bold text-[10px]">CÓDIGO DE RETIRO</p>
                    <p className="text-xl font-black">{showTicketModal.pickupCode}</p>
                  </div>
                )}
                <p className="text-black text-xs">{new Date(showTicketModal.date).toLocaleString()}</p>
                <p className="text-black text-xs font-bold mt-1">Estatus: {showTicketModal.status === 'PENDING_PICKUP' ? 'PENDIENTE DE RETIRO' : 'COMPLETADA'}</p>
              </div>

              <div className="space-y-2 mb-4 text-black">
                <div className="flex justify-between font-bold border-b border-black pb-1 mb-2 text-xs">
                  <span>CANT. DESC.</span>
                  <span>TOTAL</span>
                </div>
                {showTicketModal.items.map(item => (
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
                  <span>${showTicketModal.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-base font-black mt-1 pt-1 border-t border-black">
                  <span>TOTAL</span>
                  <span>${showTicketModal.total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between mt-2">
                  <span>Pago con:</span>
                  <span className="uppercase">{showTicketModal.paymentMethod}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showQRModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" onClick={() => setShowQRModal(false)}>
          <div className="bg-white rounded-2xl max-w-sm w-full p-8 shadow-2xl flex flex-col items-center text-black relative" onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-black mb-1">Tu Código de Acceso</h3>
            <p className="text-sm text-gray-500 mb-6 text-center">Muestra este código en recepción para marcar tu entrada.</p>
            
            <div className="bg-gray-100 p-4 rounded-xl mb-6">
              <QRCodeSVG value={user?.cedula || ''} size={200} level="H" />
            </div>

            <div className="text-center mb-6">
              <p className="text-xs text-gray-400 uppercase tracking-widest font-bold">Cédula Identidad</p>
              <p className="text-2xl font-mono tracking-widest font-black">{user?.cedula}</p>
            </div>
            
            <button onClick={() => setShowQRModal(false)} className="w-full bg-black text-white font-bold py-3 rounded-lg hover:bg-gray-800 transition">
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
