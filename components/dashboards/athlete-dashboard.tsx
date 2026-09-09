"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Calendar, CheckCircle2, Dumbbell, Flame, TrendingUp, ShoppingCart, Clock, Package, Eye, ScanBarcode } from "lucide-react"

import { LineChart, Line, ResponsiveContainer, YAxis } from "recharts"
import { Transaction, Product } from "@/lib/store-service"
import { QRCodeSVG } from "qrcode.react"
import { cancelTransaction } from "@/app/actions/store"
import Swal from "sweetalert2"

export function AthleteDashboard() {
  const { user } = useAuth()
  
  const [routineStatus, setRoutineStatus] = useState<'pending' | 'in-progress' | 'completed'>('pending')
  const [selectedPrIndex, setSelectedPrIndex] = useState(0)
  
  const [purchases, setPurchases] = useState<Transaction[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [showTicketModal, setShowTicketModal] = useState<Transaction | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 3

  const [showQRModal, setShowQRModal] = useState(false)
  const [coachName, setCoachName] = useState('Sin Asignar')
  const [liveRoutines, setLiveRoutines] = useState<any[]>([])
  const [liveDiets, setLiveDiets] = useState<any[]>([])
  const [attendances, setAttendances] = useState<any[]>([])
  const [streak, setStreak] = useState(0)

  const handleCancelTx = async (tx: Transaction) => {
    const result = await Swal.fire({
      title: '¿Cancelar este pedido?',
      text: 'Esta acción cancelará tu pedido en efectivo.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      background: document.documentElement.classList.contains('dark') ? '#1f2937' : '#ffffff',
      color: document.documentElement.classList.contains('dark') ? '#f3f4f6' : '#111827',
      cancelButtonColor: '#3b82f6',
      confirmButtonText: 'Sí, cancelar pedido',
      cancelButtonText: 'No, mantener'
    });

    if (result.isConfirmed) {
      Swal.fire({ title: 'Cancelando...', allowOutsideClick: false, didOpen: () => { Swal.showLoading() } });
      const res = await cancelTransaction(tx.id);
      if (res.success) {
        Swal.fire({ title: 'Cancelado', text: 'El pedido fue cancelado correctamente.', icon: 'success', background: document.documentElement.classList.contains('dark') ? '#1f2937' : '#ffffff', color: document.documentElement.classList.contains('dark') ? '#f3f4f6' : '#111827' });
        const stats = await import("@/app/actions/users").then(m => m.getAthleteDashboardData(user!.id));
        if (stats.success) setPurchases(stats.purchases || []);
      } else {
        Swal.fire({ title: 'Error', text: res.error || 'No se pudo cancelar', icon: 'error', background: document.documentElement.classList.contains('dark') ? '#1f2937' : '#ffffff', color: document.documentElement.classList.contains('dark') ? '#f3f4f6' : '#111827' });
      }
    }
  };

  const [exerciseProgress, setExerciseProgress] = useState<any[]>([])
  useEffect(() => {
    if (user?.id) {
      
      
      
      

      // fetch coach
      import("@/app/actions/users").then(async ({ getAthleteDashboardData }) => {
          const stats = await getAthleteDashboardData(user.id);
          if (stats.success) {
            setLiveRoutines(stats.routines || []);
            setLiveDiets(stats.diets || []);
            console.log('API returned purchases:', stats.purchases);
              setPurchases(stats.purchases || []);
            setAttendances(stats.attendances || []);
            setStreak(stats.streak || 0);
            setExerciseProgress(stats.exerciseProgress || []);
          }
        });
        import("@/lib/data-service").then(({ athleteService }) => {
        const ath = athleteService.getAthlete(user.id)
        if (ath && ath.coachId) {
          setCoachName(ath.coach?.name || 'Entrenador asignado')
        }
      })
    }
  }, [user?.id])

  const getProductImage = (productId: string) => {
    const prod = products.find(p => p.id === productId)
    return prod?.imageUrl || ''
  }

  

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tighter bg-gradient-to-r from-primary dark:dark:via-white via-black via-black to-primary/50 bg-clip-text text-transparent dark:dark:drop-shadow-[0_0_15px_rgba(255,255,255,0.1)] drop-shadow-sm drop-shadow-sm">Hola, {user?.name?.split(' ')[0] || 'Atleta'}</h1>
          <p className="text-muted-foreground mt-1">
            Tu Coach Actual: <span className="font-bold text-foreground">{coachName}</span>
          </p>
          {(() => {
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
            })()}
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <button onClick={() => setShowQRModal(true)} className="bg-primary text-white px-4 py-2 rounded-md font-bold shadow-sm hover:bg-primary/90 transition flex items-center justify-center gap-2">
            <ScanBarcode className="h-5 w-5" /> Mostrar mi Código de Acceso
          </button>
        </div>
      </div>
      <div className="flex gap-2 flex-wrap">
          <Link href="/tienda" className="bg-green-600 text-white dark:bg-green-600 dark:text-white px-4 py-2 rounded-md font-medium shadow-sm hover:bg-green-700 transition flex items-center gap-2">
            <ShoppingCart className="h-4 w-4" />
            Ir a la Tienda
          </Link>
          <Link href="/rutina" className="bg-primary text-primary-foreground font-black px-4 py-2 rounded-md shadow-sm hover:opacity-90 transition flex items-center gap-2 drop-shadow-md">
            <Dumbbell className="h-4 w-4" />
            Rutinas propuestas por el Coach
          </Link>
        </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
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
          </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Entrenamiento de Hoy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {(() => {
                const todayStr = new Date().toDateString();
                const todayRoutine = liveRoutines.find(r => new Date(r.date).toDateString() === todayStr);
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
        </Card>
        
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Actividades Realizadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {(() => {
                if (liveRoutines.length === 0) {
                  return <div className="text-sm text-slate-500 dark:text-slate-400">Aún no hay actividades registradas.</div>;
                }
                return liveRoutines.slice(0, 3).map((routine, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-black/5 dark:border-white/5 hover:bg-secondary/20 transition">
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-2 rounded-full bg-green-500" />
                      <div>
                        <p className="font-medium text-sm">{routine.name || 'Rutina'}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{new Date(routine.date).toLocaleDateString()}</p>
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

      {/* Mis Compras Section */}
      <Card className="mt-6 border-black/10 dark:border-white/10 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              Mis Compras y Facturas
            </CardTitle>
          </CardHeader>
          <CardContent>
          {purchases.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">No tienes compras recientes.</p>
          ) : (
            <div>
              <div className="space-y-4">
              {purchases.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map(tx => (
                <div key={tx.id} className="bg-transparent py-4 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row gap-4 justify-between last:border-0">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900 dark:text-slate-100">Factura: {tx.id}</span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">{new Date(tx.date).toLocaleDateString()}</span>
                      {tx.status === 'PENDING_DELIVERY' ? (
                          <span className="text-[10px] bg-yellow-500/20 text-yellow-500 px-2 py-0.5 rounded-full font-bold flex items-center gap-1"><Clock className="h-3 w-3"/> PENDIENTE RETIRO</span>
                        ) : tx.status === 'CANCELED' ? (
                          <span className="text-[10px] bg-red-500/20 text-red-500 px-2 py-0.5 rounded-full font-bold">VENCIDA</span>
                        ) : (
                          <span className="text-[10px] bg-green-500/20 text-green-500 px-2 py-0.5 rounded-full font-bold">COMPLETADA</span>
                        )}
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {tx.items.map(item => {
                        const img = getProductImage(item.productId)
                        return (
                          <div key={item.productId} className="flex items-center gap-3 py-1">
                            {img ? (
                              <img src={img} alt={item.name} className="h-10 w-10 object-contain rounded-md bg-transparent" />
                            ) : (
                              <div className="h-10 w-10 bg-transparent flex items-center justify-center">
                                <ShoppingCart className="h-5 w-5 text-slate-400 dark:text-slate-500" />
                              </div>
                            )}
                            <div>
                              <p className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-tight max-w-[120px] truncate" title={item.name}>{item.name}</p>
                              <p className="text-[10px] text-slate-500 dark:text-slate-400">{item.qty}x</p>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                  
                  <div className="flex flex-col justify-center items-end gap-2 border-t md:border-t-0 md:border-l border-black/10 dark:border-white/10 pt-3 md:pt-0 md:pl-4">
                    <div className="text-right">
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Pago con {tx.paymentMethod}</p>
                      <p className="font-black text-lg text-primary">${tx.total.toFixed(2)}</p>
                    </div>
                    <div className="flex gap-2">
                      
                        <button
                          onClick={() => setShowTicketModal(tx)}
                          className="bg-transparent border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 px-3 py-1.5 rounded text-xs font-bold flex items-center gap-1 transition shadow-sm"
                        >
                          <Eye className="h-3 w-3" /> Ticket
                        </button>
                        {tx.status === 'PENDING_DELIVERY' && tx.paymentMethod === 'Efectivo' && (
                          <button
                            onClick={() => handleCancelTx(tx)}
                            className="bg-transparent border border-red-500 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 px-3 py-1.5 rounded text-xs font-bold transition shadow-sm"
                          >
                            Cancelar
                          </button>
                        )}

                    </div>
                    
                  </div>
                </div>
              ))}
            </div>

                {purchases.length > itemsPerPage && (
                  <div className="flex justify-between items-center mt-4 border-t border-black/10 dark:border-white/10 pt-4">
                    <button 
                      disabled={currentPage === 1} 
                      onClick={() => setCurrentPage(p => p - 1)}
                      className="bg-transparent border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 px-4 py-2 rounded-lg text-xs font-bold disabled:opacity-30 transition shadow-sm"
                    >
                      ← Anterior
                    </button>
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Página {currentPage} de {Math.ceil(purchases.length / itemsPerPage)}</span>
                    <button 
                      disabled={currentPage === Math.ceil(purchases.length / itemsPerPage)} 
                      onClick={() => setCurrentPage(p => p + 1)}
                      className="bg-transparent border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 px-4 py-2 rounded-lg text-xs font-bold disabled:opacity-30 transition shadow-sm"
                    >
                      Siguiente →
                    </button>
                  </div>
                )}
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
                {showTicketModal.id.slice(-5).toUpperCase() && showTicketModal.status === 'PENDING_DELIVERY' && (
                  <div className="mt-2 mb-2 p-2 border-2 border-dashed border-black bg-gray-100 text-center">
                    <p className="font-bold text-[10px]">CÓDIGO DE RETIRO</p>
                    <p className="text-xl font-black">{showTicketModal.id.slice(-5).toUpperCase()}</p>
                  </div>
                )}
                <p className="text-black text-xs">{new Date(showTicketModal.date).toLocaleString()}</p>
                <p className="text-black text-xs font-bold mt-1">Estatus: {showTicketModal.status === 'PENDING_DELIVERY' ? 'PENDIENTE DE RETIRO' : 'COMPLETADA'}</p>
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
            <p className="text-sm text-gray-500 mb-6 text-center">Muestra este cÃ³digo en recepciÃ³n para marcar tu entrada.</p>
            
            <div className="bg-gray-100 p-4 rounded-xl mb-6">
              <QRCodeSVG value={user?.cedula || ''} size={200} level="H" />
            </div>

            <div className="text-center mb-6">
              <p className="text-xs text-gray-400 uppercase tracking-widest font-bold">CÃ©dula Identidad</p>
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
