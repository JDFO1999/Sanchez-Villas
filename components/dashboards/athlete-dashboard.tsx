"use client"

import {  useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { buttonVariants } from "@/components/ui/button"
import { Dialog } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { CreditCard,  Calendar, CheckCircle2, Dumbbell, Flame, TrendingUp, ShoppingCart, Clock, Package, Eye, ScanBarcode } from "lucide-react"

import { LineChart, Line, ResponsiveContainer, YAxis, XAxis, Tooltip, CartesianGrid } from "recharts"
import { Transaction, Product } from "@/lib/store-service"
import { QRCodeSVG } from "qrcode.react"
import { cancelTransaction } from "@/app/actions/store"
import Swal from "sweetalert2"
import { useSettings } from "@/lib/settings-context"

export function AthleteDashboard() {
  const { user } = useAuth()
  const { settings } = useSettings()
  
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
  const [streak, setStreak] = useState(0);
  const [memberships, setMemberships] = useState<any[]>([]);
  const [biometrics, setBiometrics] = useState<any[]>([])

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
      Swal.fire({ title: 'Cancelando...', allowOutsideClick: false, didOpen: () => { Swal.getPopup()!.innerHTML = '<div style="display:flex;flex-direction:column;align-items:center;padding:20px"><div style="position:relative;width:48px;height:48px;animation:ios-spin 1s steps(12,end) infinite"><style>@keyframes ios-spin{100%{transform:rotate(360deg)}}.ios-blade{position:absolute;left:46%;top:0;width:8%;height:25%;border-radius:5px;background-color:#22c55e;transform-origin:50% 200%}</style>' + Array.from({length:12}).map((_,i) => '<div class="ios-blade" style="transform:rotate('+(i*30)+'deg);opacity:'+((i+1)/12)+'"></div>').join('') + '</div><p style="margin-top:16px;font-weight:bold;color:#22c55e;animation:pulse 2s infinite">Cargando...</p></div>' } });
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
            setLiveDiets(stats.diets || []);
              setPurchases(stats.purchases || []);
            setAttendances(stats.attendances || []);
          setBiometrics(stats.biometrics || []);
            setStreak(stats.streak || 0);
            setMemberships(stats.memberships || []);
            setExerciseProgress(stats.exerciseProgress || []);
          }
        });
        import("@/lib/data-service").then(({ athleteService }) => {
        const ath = athleteService.getAthlete(user.id)
        if (ath && ath.coachId) {
          setCoachName("Entrenador asignado")
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
          <h1 className="page-title">Hola, {user?.name?.split(' ')[0] || 'Atleta'}</h1>
          <p className="text-muted-foreground mt-1">
            Tu Coach Actual: <span className="font-bold text-foreground">{coachName}</span>
          </p>
          {(() => {
              const todayStr = new Date().toDateString();
              const todayRoutine = liveRoutines.find(r => new Date(r.date).toDateString() === todayStr);
              
              if (!todayRoutine) {
                return (
                  <div className="mt-3 bg-destructive/10 border border-destructive/30 text-destructive text-sm px-3 py-2 rounded-lg flex items-center gap-2 font-semibold">
                    <span className="inline-flex rounded-full h-2 w-2 bg-destructive" aria-hidden="true"></span>
                    Aún no tienes una rutina asignada para hoy.
                  </div>
                );
              } else if (todayRoutine.completed) {
                return (
                  <div className="mt-3 bg-success/10 border border-success/30 text-success text-sm px-3 py-2 rounded-lg flex items-center gap-2 font-semibold">
                    <CheckCircle2 className="h-4 w-4" />
                    Rutina de hoy completada. ¡Buen trabajo!
                  </div>
                );
              } else {
                return (
                  <div className="mt-3 bg-info/10 border border-info/30 text-info text-sm px-3 py-2 rounded-lg flex items-center gap-2 font-bold">
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-info mr-1"></span>
                    Tienes una nueva rutina pendiente por completar hoy.
                  </div>
                );
              }
            })()}
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <button onClick={() => setShowQRModal(true)} className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-3 md:py-2 rounded-md font-bold shadow-lg transition flex items-center justify-center gap-2 w-full sm:w-auto">
            <ScanBarcode className="h-5 w-5" /> Mostrar mi Código de Acceso
          </button>
        </div>
      </div>
      <div className="flex gap-2 flex-wrap">
          <Link href="/tienda" className="bg-card border border-border text-foreground hover:bg-muted px-4 py-2 rounded-md font-bold shadow-sm transition flex items-center gap-2">
            <ShoppingCart className="h-4 w-4" />
            Ir a la Tienda
          </Link>
          <Link href="/rutina" className="bg-card border border-border text-foreground hover:bg-muted px-4 py-2 rounded-md font-bold shadow-sm transition flex items-center gap-2"><Dumbbell className="h-4 w-4 text-primary" />Empezar rutina de hoy</Link>
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
                      className="bg-black/5 dark:bg-black/40 border border-black/20 dark:border-white/10 rounded px-2 py-1 text-xs text-foreground w-full focus:outline-none focus:border-primary [&>option]:bg-white [&>option]:dark:bg-zinc-900 [&>option]:text-black [&>option]:dark:text-white"
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
                    const strokeColor = isImproving ? "hsl(var(--success))" : "hsl(var(--warning))";
                    
                    return (
                      <>
                        <div className="flex justify-between items-end">
                          <div>
                            <div className="stat-number text-4xl">{prData[prData.length - 1].weight} kg</div>
                            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                              {isImproving ? <span className="text-success">↑ Mejorando</span> : <span className="text-warning">→ Estancado/Bajó</span>}
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

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Racha de Entrenamiento</CardTitle>
            <Flame className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="stat-number text-4xl">{streak} días</div>
            <p className="text-xs text-muted-foreground mt-1">
              Días seguidos yendo al gimnasio
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Asistencia Semanal</CardTitle>
            <Calendar className="h-4 w-4 text-info" />
          </CardHeader>
          <CardContent>
            <div className="stat-number text-4xl">
              {attendances.filter(a => new Date(a.date) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Días asistidos en los últimos 7 días
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Membresía</CardTitle>
            <CreditCard className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            {memberships.length > 0 ? (() => {
              const active = memberships.find(m => m.status === 'ACTIVE');
              if (active) {
                const daysLeft = Math.ceil((new Date(active.endDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
                return (
                  <>
                    <div className="stat-number text-4xl">{daysLeft} días</div>
                    <p className="text-xs text-muted-foreground mt-1 text-success">
                      Vence el {new Date(active.endDate).toLocaleDateString()}
                    </p>
                  </>
                );
              } else {
                return <div className="text-sm font-bold text-destructive">Inactiva</div>;
              }
            })() : (
              <div className="text-sm font-bold text-destructive">Sin membresía</div>
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
                    <div className="p-4 rounded-xl border border-border bg-transparent text-center text-foreground text-muted-foreground">
                      No tienes rutina asignada para hoy.
                    </div>
                  );
                }
                return (
                  <div className="p-4 rounded-xl border border-border bg-transparent">
                    <h4 className="font-bold text-foreground mb-1">{todayRoutine.name || 'Entrenamiento del día'}</h4>
                    <p className="text-sm text-foreground text-muted-foreground mb-3">{todayRoutine.description || 'Cumple con tus objetivos diarios.'}</p>
                    
                    <div className="space-y-2 text-sm mb-4">
                      {todayRoutine.exercises && todayRoutine.exercises.map((ex: any, i: number) => (
                        <div key={i} className="flex justify-between items-center p-2 rounded border border-transparent border-b-black/5 dark:border-b-white/5">
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full shrink-0 bg-success"></div>
                            <span className="font-medium text-foreground">{ex.name || ex.exercise?.name || 'Ejercicio ' + (i+1)}</span>
                          </div>
                          <span className="text-foreground text-muted-foreground font-medium">{ex.sets}x{ex.reps}</span>
                        </div>
                      ))}
                    </div>
                    <Link href="/rutina" className={buttonVariants({ variant: "outline", size: "sm", className: "w-full" })}>
                      Ir a la Rutina Completa
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
                  return <div className="text-sm text-foreground text-muted-foreground">Aún no hay actividades registradas.</div>;
                }
                return liveRoutines.slice(0, 3).map((routine, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-black/5 dark:border-white/5 hover:bg-secondary/20 transition">
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-2 rounded-full bg-success" />
                      <div>
                        <p className="font-medium text-sm">{routine.name || 'Rutina'}</p>
                        <p className="text-xs text-foreground text-muted-foreground">{new Date(routine.date).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <Badge tone="success">Asignada</Badge>
                  </div>
                ));
              })()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mis Compras Section */}
      <Card className="mt-6 border-black/20 dark:border-white/10 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              Mis Compras y Facturas
            </CardTitle>
          </CardHeader>
          <CardContent>
          {purchases.length === 0 ? (
            <p className="text-sm text-foreground text-muted-foreground">No tienes compras recientes.</p>
          ) : (
            <div>
              <div className="space-y-4">
              {purchases.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map(tx => (
                <div key={tx.id} className="bg-transparent py-3 border-b border-border flex flex-col md:flex-row gap-3 justify-between md:items-center last:border-0 hover:bg-muted transition px-2 -mx-2 rounded-lg">
                  <div className="space-y-1.5 flex-1 w-full">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-xs text-foreground uppercase">#{tx.id.slice(-6)}</span>
                      <span className="text-xs text-muted-foreground">{new Date(tx.date).toLocaleDateString()}</span>
                      {(tx.status as string) === 'PENDING_DELIVERY' ? (
                        <Badge tone="warning"><Clock className="h-3 w-3" aria-hidden="true" /> Pendiente</Badge>
                      ) : (tx.status as string) === 'CANCELED' ? (
                        <Badge tone="danger">Vencida</Badge>
                      ) : (
                        <Badge tone="success">Completada</Badge>
                      )}
                    </div>
                    
                    <div className="flex flex-wrap gap-1.5">
                      {tx.items.map(item => {
                        const img = getProductImage(item.productId)
                        return (
                          <div key={item.productId} className="flex items-center gap-1.5 bg-muted border border-border px-1.5 py-1 rounded-md">
                            {img ? (
                              <img src={img} alt={item.name} className="h-5 w-5 object-contain rounded-sm" />
                            ) : (
                              <div className="h-5 w-5 flex items-center justify-center">
                                <ShoppingCart className="h-3 w-3 text-muted-foreground" />
                              </div>
                            )}
                            <p className="text-xs text-foreground max-w-[100px] truncate" title={item.name}>
                              <span className="font-bold">{item.qty}x</span> {item.name}
                            </p>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  <div className="flex flex-row md:flex-col justify-between items-center md:items-end w-full md:w-auto gap-2 md:gap-1 mt-2 md:mt-0">
                    <div className="flex flex-row md:flex-col items-center md:items-end gap-2 md:gap-0">
                      <p className="font-black text-base text-primary leading-none">${tx.total.toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground uppercase font-medium md:mt-0.5">{tx.paymentMethod}</p>
                    </div>
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => setShowTicketModal(tx)}
                        className="bg-transparent border border-border text-foreground hover:bg-muted px-2.5 py-1 rounded-md text-xs font-bold flex items-center gap-1 transition shadow-sm"
                      >
                        <Eye className="h-3 w-3" /> Ticket
                      </button>
                      {(tx.status as string) === 'PENDING_DELIVERY' && tx.paymentMethod === 'Efectivo' && (
                        <button
                          onClick={() => handleCancelTx(tx)}
                          className="bg-transparent border border-destructive text-destructive hover:bg-destructive/10 dark:hover:bg-red-950 px-2.5 py-1 rounded-md text-xs font-bold transition shadow-sm"
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
                  <div className="flex justify-between items-center mt-4 border-t border-black/20 dark:border-white/10 pt-4">
                    <button 
                      disabled={currentPage === 1} 
                      onClick={() => setCurrentPage(p => p - 1)}
                      className="bg-transparent border border-border text-foreground hover:bg-muted px-4 py-2 rounded-lg text-xs font-bold disabled:opacity-30 transition shadow-sm"
                    >
                      ← Anterior
                    </button>
                    <span className="text-xs text-foreground text-muted-foreground font-medium">Página {currentPage} de {Math.ceil(purchases.length / itemsPerPage)}</span>
                    <button 
                      disabled={currentPage === Math.ceil(purchases.length / itemsPerPage)} 
                      onClick={() => setCurrentPage(p => p + 1)}
                      className="bg-transparent border border-border text-foreground hover:bg-muted px-4 py-2 rounded-lg text-xs font-bold disabled:opacity-30 transition shadow-sm"
                    >
                      Siguiente →
                    </button>
                  </div>
                )}
              </div>
          )}
        </CardContent>
      </Card>

      
      {/* Evolución Física */}
      {biometrics.length > 0 && (
        <Card className="glass border-black/10 dark:border-white/10 mt-6 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-info/10 to-transparent">
            <CardTitle className="text-xl flex items-center gap-2">
              <TrendingUp className="text-info w-6 h-6" />
              Mi Evolución Física
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={biometrics.map(b => ({...b, date: new Date(b.date).toLocaleDateString()}))} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <Line type="monotone" dataKey="weight" stroke="hsl(var(--info))" strokeWidth={3} name="Peso (kg)" dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                  {biometrics.some(b => b.bodyFat) && <Line type="monotone" dataKey="bodyFat" stroke="hsl(var(--warning))" strokeWidth={3} name="% Grasa" />}
                  <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="5 5" opacity={0.2} />
                  <XAxis dataKey="date" tick={{fontSize: 12}} tickMargin={10} stroke="currentColor" opacity={0.5} />
                  <YAxis domain={['auto', 'auto']} tick={{fontSize: 12}} stroke="currentColor" opacity={0.5} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '10px', background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', color: 'hsl(var(--foreground))' }}
                    itemStyle={{ color: 'hsl(var(--foreground))', fontWeight: 'bold' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="flex gap-4 justify-center mt-4 text-sm font-medium">
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-info"></div>Peso</div>
              {biometrics.some(b => b.bodyFat) && <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-warning"></div>Grasa Corporal</div>}
            </div>
          </CardContent>
        </Card>
      )}

      {/* TICKET MODAL */}
      {showTicketModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 overflow-y-auto" onClick={() => setShowTicketModal(null)}>
          <div className="w-full flex justify-center pt-4 md:pt-0" onClick={e => e.stopPropagation()}>
            <div className="bg-white text-black p-6 w-full max-w-sm font-mono text-sm relative shadow-sm border border-gray-200 mx-auto">
              <button onClick={() => setShowTicketModal(null)} className="absolute top-2 right-2 text-gray-500 hover:text-black font-sans font-bold text-xl">&times;</button>
              <div className="text-center mb-4 border-b border-dashed border-black pb-4">
                <h2 className="font-bold text-xl uppercase tracking-widest">TICKET DE COMPRA</h2>
                <p className="text-black mt-1 font-bold">{showTicketModal.id}</p>
                {showTicketModal.id.slice(-5).toUpperCase() && (showTicketModal.status as string) === 'PENDING_DELIVERY' && (
                  <div className="mt-2 mb-2 p-2 border-2 border-dashed border-black bg-gray-100 text-center">
                    <p className="font-bold text-xs">CÓDIGO DE RETIRO</p>
                    <p className="text-xl font-black">{showTicketModal.id.slice(-5).toUpperCase()}</p>
                  </div>
                )}
                <p className="text-black text-xs">{new Date(showTicketModal.date).toLocaleString()}</p>
                <p className="text-black text-xs font-bold mt-1">Estatus: {(showTicketModal.status as string) === 'PENDING_DELIVERY' ? 'PENDIENTE DE RETIRO' : 'COMPLETADA'}</p>
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

      <Dialog
        open={showQRModal}
        onClose={() => setShowQRModal(false)}
        title="Pase digital de acceso"
        hideTitle
        className="overflow-hidden rounded-3xl border-white/20 bg-gradient-to-br from-zinc-900 via-zinc-950 to-black text-white [&>button]:text-zinc-300 [&>button:hover]:bg-white/10 [&>button:hover]:text-white"
      >
          <div className="relative">
            {/* Ambient glows */}
            <div className="absolute -top-12 -right-12 w-44 h-44 bg-primary/25 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-warning/15 rounded-full blur-3xl pointer-events-none"></div>

            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary/20 flex items-center justify-center border border-primary/40 font-black text-primary text-sm shadow-inner">
                  GP
                </div>
                <div>
                  <h4 className="font-black text-sm tracking-wider uppercase text-white leading-tight">{settings?.appName || 'GYMPRO'}</h4>
                  <p className="text-xs text-zinc-400 font-bold tracking-widest uppercase">Pase Digital de Acceso</p>
                </div>
              </div>
              <span className="text-xs font-black uppercase px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-400/20 to-yellow-500/20 border border-warning/40 text-warning flex items-center gap-1.5 shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                VIP
              </span>
            </div>

            {/* QR Scanner Container */}
            <div className="flex flex-col items-center bg-white p-5 rounded-2xl shadow-xl mb-5">
              <QRCodeSVG value={user?.cedula || ''} size={190} level="H" />
              <p className="text-xs font-mono text-zinc-600 mt-3 font-bold tracking-wider">MUESTRA ESTE QR EN ENTRADA</p>
            </div>

            {/* Athlete Info details */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-5 flex justify-between items-center backdrop-blur-sm">
              <div>
                <p className="text-xs uppercase font-bold text-zinc-400 tracking-wider">Atleta</p>
                <p className="text-sm font-bold text-white truncate max-w-[170px]">{user?.name}</p>
              </div>
              <div className="text-right">
                <p className="text-xs uppercase font-bold text-zinc-400 tracking-wider">Cédula</p>
                <p className="text-base font-mono font-black text-primary tracking-widest">{user?.cedula}</p>
              </div>
            </div>

            <button onClick={() => setShowQRModal(false)} className="w-full bg-white/10 hover:bg-white/20 border border-white/10 text-white font-bold py-3 rounded-xl transition text-sm">
              Cerrar Carnet
            </button>
          </div>
      </Dialog>
    </div>
  )
}
