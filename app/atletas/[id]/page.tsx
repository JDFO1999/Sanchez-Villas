"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { athleteService, AthleteProfile, BiometricRecord } from "@/lib/data-service"
import { storeService, Transaction } from "@/lib/store-service"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, User, Calendar, Activity, ClipboardList, TrendingUp, Search } from "lucide-react"
import { useSettings } from "@/lib/settings-context"
import Link from "next/link"
import { useParams } from "next/navigation"

import Swal from 'sweetalert2'

export default function AtletaPerfilPage() {
  const { user, getAllEmployees } = useAuth()
  const { settings } = useSettings()
  const params = useParams()
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id

  const [athlete, setAthlete] = useState<AthleteProfile | null>(null)

  // Form states for new biometrics
  const [showForm, setShowForm] = useState(false)
  const [newWeight, setNewWeight] = useState("")
  const [newHeight, setNewHeight] = useState("")
  const [newChest, setNewChest] = useState("")
  const [newWaist, setNewWaist] = useState("")
  const [newHips, setNewHips] = useState("")
  const [newCustomFields, setNewCustomFields] = useState<{name: string, unit: string, value: string}[]>([])

  const [showCoachRequest, setShowCoachRequest] = useState(false)
  const [requestReason, setRequestReason] = useState("")

  const [showAdminCoachModal, setShowAdminCoachModal] = useState(false)
  const [coachSearch, setCoachSearch] = useState("")
  
  const [showRoutineModal, setShowRoutineModal] = useState(false)
  const [routineType, setRoutineType] = useState("Hipertrofia")
  const [routineStart, setRoutineStart] = useState("")
  const [routineEnd, setRoutineEnd] = useState("")
  const [routineRest, setRoutineRest] = useState("90s")

  useEffect(() => {
    if (id) {
      setAthlete(athleteService.getAthleteById(id))
    }
  }, [id])

  if (!athlete) return <div className="p-8">Cargando perfil...</div>

  // Access control
  if (user?.role === 'athlete' && user.cedula !== athlete.cedula) {
    return <div className="p-8 text-center text-red-500 font-bold">Acceso Denegado</div>
  }

  const latestBiometrics = athlete.biometrics.length > 0 ? athlete.biometrics[athlete.biometrics.length - 1] : null

  const handleAddBiometrics = (e: React.FormEvent) => {
    e.preventDefault()
    const customFieldsObj = newCustomFields.reduce((acc, field) => {
      if (field.name && field.value) {
        acc[field.name] = `${field.value} ${field.unit || ''}`.trim();
      }
      return acc;
    }, {} as Record<string, string>);

    const newRecord: BiometricRecord = {
      date: new Date().toISOString().split("T")[0],
      weight: parseFloat(newWeight),
      height: parseFloat(newHeight),
      customFields: Object.keys(customFieldsObj).length > 0 ? customFieldsObj : undefined
    }
    const updated = { ...athlete, biometrics: [...athlete.biometrics, newRecord] }
    athleteService.updateAthlete(updated)
    setAthlete(updated)
    setShowForm(false)
    setNewCustomFields([])
    
    const Toast = Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true
    })
    Toast.fire({ icon: 'success', title: 'Medidas actualizadas' })
  }

  const [allCoaches, setAllCoaches] = useState<any[]>([])

  useEffect(() => {
    if (getAllEmployees) {
      getAllEmployees().then(res => {
        setAllCoaches(res.filter((e: any) => e.role !== 'admin'))
      }).catch(console.error)
    } else {
      setAllCoaches([{ id: '2', name: 'Carlos (Staff Principal)' }])
    }
  }, [getAllEmployees])

  const currentCoachName = allCoaches.find(c => c.id === athlete?.coachId)?.name || 'Ninguno'
  const previousCoachName = athlete?.previousCoachId ? (allCoaches.find(c => c.id === athlete.previousCoachId)?.name || 'Desconocido') : null

  const filteredCoaches = allCoaches.filter(c => c.name.toLowerCase().includes(coachSearch.toLowerCase()))

  const handleAdminAssignCoach = (coachId: string) => {
    const updated = { ...athlete, coachId }
    athleteService.updateAthlete(updated)
    setAthlete(updated)
    setShowAdminCoachModal(false)
    alert("Entrenador asignado con éxito.")
  }

  const handleAssignRoutine = (e: React.FormEvent) => {
    e.preventDefault()
    alert(`Rutina asignada:\nTipo: ${routineType}\nPeriodo: ${routineStart} a ${routineEnd}\nDescanso: ${routineRest}`)
    setShowRoutineModal(false)
  }

  const handleSendRequest = (e: React.FormEvent) => {
    e.preventDefault()
    alert(`Solicitud enviada al Administrador con éxito.\n\nMotivo: ${requestReason}`)
    setShowCoachRequest(false)
    setRequestReason("")
  }

  // Calculate days remaining
  const endDate = new Date(athlete.membershipEnd)
  const today = new Date()
  const diffTime = endDate.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  return (
    <div className="space-y-6 max-w-5xl mx-auto relative">
      
      {/* Modal Request */}
      {showCoachRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-card border border-black/10 dark:border-white/10 rounded-xl max-w-md w-full p-6 shadow-2xl glass">
            <h3 className="text-xl font-bold mb-2">Solicitar Cambio de Entrenador</h3>
            <p className="text-sm text-muted-foreground mb-4">Esta solicitud será revisada por la administración del gimnasio.</p>
            <form onSubmit={handleSendRequest} className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Entrenador Deseado</label>
                <select className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded p-2.5 text-sm">
                  <option value="">Cualquier otro disponible</option>
                  <option value="2">Carlos (Staff Principal)</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Motivo de la solicitud</label>
                <textarea 
                  required
                  rows={3} 
                  value={requestReason}
                  onChange={e => setRequestReason(e.target.value)}
                  placeholder="Explica brevemente por qué deseas cambiar..."
                  className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded p-2.5 text-sm"
                />
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <button type="button" onClick={() => setShowCoachRequest(false)} className="px-4 py-2 text-sm bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:bg-white/10 rounded transition">Cancelar</button>
                <button type="submit" className="px-4 py-2 text-sm bg-primary text-primary-foreground font-bold rounded hover:bg-primary/90 transition">Enviar Solicitud</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Admin Coach Change */}
      {showAdminCoachModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-card border border-black/10 dark:border-white/10 rounded-xl max-w-md w-full p-6 shadow-2xl glass">
            <h3 className="text-xl font-bold mb-2">Reasignar Entrenador</h3>
            <p className="text-sm text-muted-foreground mb-4">Busca y selecciona el nuevo entrenador para este atleta.</p>
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Buscar por nombre..." 
                value={coachSearch}
                onChange={e => setCoachSearch(e.target.value)}
                className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-primary"
              />
            </div>
            <div className="space-y-2 max-h-60 overflow-y-auto mb-4">
              {filteredCoaches.length > 0 ? filteredCoaches.map(c => (
                <button 
                  key={c.id} 
                  onClick={() => handleAdminAssignCoach(c.id)}
                  className="w-full text-left p-3 rounded-lg border border-black/5 dark:border-white/5 bg-black/20 hover:bg-primary/20 hover:border-primary/50 transition flex items-center gap-3"
                >
                  <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">{c.name.charAt(0)}</div>
                  <span className="font-medium text-sm">{c.name}</span>
                </button>
              )) : (
                <p className="text-sm text-muted-foreground text-center py-4">No se encontraron entrenadores.</p>
              )}
            </div>
            <div className="flex justify-end pt-2 border-t border-black/10 dark:border-white/10">
              <button type="button" onClick={() => setShowAdminCoachModal(false)} className="px-4 py-2 text-sm bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:bg-white/10 rounded transition">Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Assign Routine */}
      {showRoutineModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-card border border-black/10 dark:border-white/10 rounded-xl max-w-md w-full p-6 shadow-2xl glass">
            <h3 className="text-xl font-bold mb-2">Asignar Rutina</h3>
            <p className="text-sm text-muted-foreground mb-4">Configura los parámetros del entrenamiento.</p>
            <form onSubmit={handleAssignRoutine} className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Catálogo de Rutinas</label>
                <select value={routineType} onChange={e => setRoutineType(e.target.value)} className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded p-2.5 text-sm">
                  <option value="Hipertrofia">Rutina de Hipertrofia (Fuerza)</option>
                  <option value="Resistencia">Rutina HIIT (Resistencia)</option>
                  <option value="Movilidad">Yoga y Movilidad</option>
                  <option value="Personalizada">Personalizada / Mixta</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Fecha Inicio</label>
                  <input type="date" required value={routineStart} onChange={e => setRoutineStart(e.target.value)} className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded p-2 text-sm" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Fecha Fin</label>
                  <input type="date" required value={routineEnd} onChange={e => setRoutineEnd(e.target.value)} className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded p-2 text-sm" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Tiempo de Descanso</label>
                <select value={routineRest} onChange={e => setRoutineRest(e.target.value)} className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded p-2.5 text-sm">
                  <option value="30s">Corto (30 seg)</option>
                  <option value="60s">Medio (60 seg)</option>
                  <option value="90s">Largo (90 seg)</option>
                  <option value="120s">Muy Largo (2 min)</option>
                </select>
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <button type="button" onClick={() => setShowRoutineModal(false)} className="px-4 py-2 text-sm bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:bg-white/10 rounded transition">Cancelar</button>
                <button type="submit" className="px-4 py-2 text-sm bg-primary text-primary-foreground font-bold rounded hover:bg-primary/90 transition">Asignar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {user?.role !== 'athlete' && (
        <Link href="/atletas" className="inline-flex items-center text-sm text-primary hover:underline">
          <ArrowLeft className="h-4 w-4 mr-1" /> Volver al directorio
        </Link>
      )}

      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 bg-card/40 p-6 rounded-2xl border border-black/5 dark:border-white/5 glass">
        <div className="flex items-center gap-6">
          <div className="relative group">
            {athlete.profilePicture ? (
              <img src={athlete.profilePicture} alt={athlete.name} className="h-20 w-20 rounded-full object-cover border-2 border-primary" />
            ) : (
              <div className="h-20 w-20 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-3xl">
                {athlete.name.charAt(0)}
              </div>
            )}
            
            {user?.role === 'athlete' && user.id === athlete.id && (
              <label className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                <span className="text-[10px] font-bold text-white text-center">Cambiar<br/>Foto</span>
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      const reader = new FileReader()
                      reader.onloadend = () => {
                        const updated = { ...athlete, profilePicture: reader.result as string }
                        athleteService.updateAthlete(updated)
                        setAthlete(updated)
                      }
                      reader.readAsDataURL(file)
                    }
                  }} 
                />
              </label>
            )}
          </div>
          <div>
            <h1 className="text-4xl font-black tracking-tighter bg-gradient-to-r from-primary dark:via-white via-black to-primary/50 bg-clip-text text-transparent dark:drop-shadow-[0_0_15px_rgba(255,255,255,0.1)] drop-shadow-sm">{athlete.name}</h1>
            <p className="text-muted-foreground flex items-center gap-2 mt-1">
              <User className="h-4 w-4" /> C.C. {athlete.cedula} &nbsp;|&nbsp; {athlete.gender === 'M' ? 'Masculino' : 'Femenino'}
            </p>
            <p className="text-muted-foreground flex items-center gap-2 mt-1">
              <span className="font-bold">Coach Actual:</span> {currentCoachName} 
              {previousCoachName && (
                <span className="text-xs ml-2 bg-black/10 dark:bg-white/10 px-2 py-0.5 rounded">
                  Anterior: {previousCoachName}
                </span>
              )}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <span className="bg-orange-500/20 text-orange-500 px-2 py-0.5 rounded text-xs font-bold flex items-center gap-1">
                🔥 Racha de Asistencia: 4 Días
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex gap-3">
          {(user?.role === 'admin' || user?.role === 'employee') && (
            <button onClick={() => setShowRoutineModal(true)} className="bg-primary/20 text-primary px-4 py-2 rounded-lg font-medium hover:bg-primary/30 transition">
              Asignar Rutina
            </button>
          )}
          {user?.role === 'admin' && (
            <button onClick={() => setShowAdminCoachModal(true)} className="bg-primary/20 text-primary px-4 py-2 rounded-lg font-medium hover:bg-primary/30 transition">
              Cambiar Coach
            </button>
          )}
          {user?.role === 'athlete' && athlete.coachId && (
            <button onClick={() => setShowCoachRequest(true)} className="bg-secondary text-foreground px-4 py-2 rounded-lg font-medium hover:bg-black/10 dark:bg-white/10 border border-black/10 dark:border-white/10 transition">
              Solicitar Cambio de Coach
            </button>
          )}
          {user?.role === 'athlete' && !athlete.coachId && (
            <button onClick={() => setShowAdminCoachModal(true)} className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition shadow">
              Seleccionar Entrenador (Opcional)
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna Izquierda: Membresía y Asistencia */}
        <div className="space-y-6">
          <Card className="glass border-primary/20">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" /> Membresía
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Estado</p>
                <p className={`font-bold text-xl ${diffDays > 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {diffDays > 0 ? `${diffDays} días restantes` : 'Vencida'}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-black/10 dark:border-white/10">
                <div>
                  <p className="text-xs text-muted-foreground">Inicio</p>
                  <p className="font-medium text-sm">{athlete.membershipStart}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Vencimiento</p>
                  <p className="font-medium text-sm">{athlete.membershipEnd}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" /> Asistencia
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between mb-2">
                <span className="text-3xl font-bold">{athlete.attendancePercentage}%</span>
                <span className="text-sm text-green-500 font-medium">Buena</span>
              </div>
              <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full" style={{ width: `${athlete.attendancePercentage}%` }} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Columna Derecha: Biometría e Historial */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="glass">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" /> Medidas Actuales
              </CardTitle>
              {(user?.role === 'admin' || user?.role === 'employee') && (
                <button 
                  onClick={() => setShowForm(!showForm)}
                  className="text-sm bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 px-3 py-1.5 rounded-lg hover:bg-black/10 dark:bg-white/10 transition"
                >
                  {showForm ? 'Cancelar' : 'Actualizar Medidas'}
                </button>
              )}
            </CardHeader>
            <CardContent>
              {showForm ? (
                <form onSubmit={handleAddBiometrics} className="space-y-4 p-4 rounded-xl bg-black/5 dark:bg-black/40 border border-black/5 dark:border-white/5">
                  <h4 className="font-medium text-sm text-primary mb-2">Nuevo Registro Biométrico</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-muted-foreground">Peso (kg)</label>
                      <input type="number" step="0.1" required value={newWeight} onChange={e => setNewWeight(e.target.value)} className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded p-2 text-sm mt-1" />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground">Altura (cm)</label>
                      <input type="number" step="1" required value={newHeight} onChange={e => setNewHeight(e.target.value)} className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded p-2 text-sm mt-1" />
                    </div>
                    
                    {/* Campos dinámicos agregados manualmente por el entrenador para este atleta */}
                    {newCustomFields.map((field, idx) => (
                      <div key={idx} className="col-span-2 grid grid-cols-3 gap-2 items-end">
                        <div>
                          <label className="text-xs text-muted-foreground">Categoría</label>
                          <input type="text" placeholder="Ej. Brazo" value={field.name} onChange={e => {
                            const newFields = [...newCustomFields]
                            newFields[idx].name = e.target.value
                            setNewCustomFields(newFields)
                          }} className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded p-2 text-sm mt-1" />
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground">Medida</label>
                          <input type="number" step="0.1" placeholder="Ej. 34" value={field.value} onChange={e => {
                            const newFields = [...newCustomFields]
                            newFields[idx].value = e.target.value
                            setNewCustomFields(newFields)
                          }} className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded p-2 text-sm mt-1" />
                        </div>
                        <div className="flex gap-2">
                          <div className="flex-1">
                            <label className="text-xs text-muted-foreground">Unidad</label>
                            <select value={field.unit} onChange={e => {
                              const newFields = [...newCustomFields]
                              newFields[idx].unit = e.target.value
                              setNewCustomFields(newFields)
                            }} className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded p-2 text-sm mt-1">
                              <option value="cm">cm</option>
                              <option value="kg">kg</option>
                              <option value="%">%</option>
                            </select>
                          </div>
                          <button type="button" onClick={() => {
                            const newFields = [...newCustomFields]
                            newFields.splice(idx, 1)
                            setNewCustomFields(newFields)
                          }} className="bg-red-500/10 text-red-500 p-2 rounded hover:bg-red-500/20 mb-px shrink-0">X</button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button type="button" onClick={() => setNewCustomFields([...newCustomFields, {name: '', unit: 'cm', value: ''}])} className="text-xs bg-primary/20 text-primary font-bold py-1.5 px-3 rounded-lg hover:bg-primary/30 transition">
                    + Añadir Otra Medida
                  </button>
                  <button type="submit" className="bg-primary text-primary-foreground font-medium py-2 px-4 rounded-lg text-sm w-full mt-2">
                    Guardar Registro
                  </button>
                </form>
              ) : latestBiometrics ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="p-4 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-center">
                    <p className="text-xs text-muted-foreground mb-1">Peso</p>
                    <p className="text-xl font-bold">{latestBiometrics.weight} <span className="text-sm font-normal text-muted-foreground">kg</span></p>
                  </div>
                  <div className="p-4 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-center">
                    <p className="text-xs text-muted-foreground mb-1">Altura</p>
                    <p className="text-xl font-bold">{latestBiometrics.height} <span className="text-sm font-normal text-muted-foreground">cm</span></p>
                  </div>
                  {athlete.gender === 'F' && latestBiometrics.chest && (
                    <>
                      <div className="p-4 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-center">
                        <p className="text-xs text-muted-foreground mb-1">Pecho</p>
                        <p className="text-xl font-bold">{latestBiometrics.chest} <span className="text-sm font-normal text-muted-foreground">cm</span></p>
                      </div>
                      <div className="p-4 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-center">
                        <p className="text-xs text-muted-foreground mb-1">Cintura</p>
                        <p className="text-xl font-bold">{latestBiometrics.waist} <span className="text-sm font-normal text-muted-foreground">cm</span></p>
                      </div>
                      <div className="p-4 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-center">
                        <p className="text-xs text-muted-foreground mb-1">Cadera</p>
                        <p className="text-xl font-bold">{latestBiometrics.hips} <span className="text-sm font-normal text-muted-foreground">cm</span></p>
                      </div>
                    </>
                  )}
                  {latestBiometrics.customFields && Object.entries(latestBiometrics.customFields)
                    .map(([key, val]) => (
                    <div key={key} className="p-4 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-center">
                      <p className="text-xs text-muted-foreground mb-1 capitalize">{key}</p>
                      <p className="text-xl font-bold">{val}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No hay registros biométricos.</p>
              )}
            </CardContent>
          </Card>

          <Card className="glass">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <ClipboardList className="h-5 w-5 text-primary" /> Historial de Medidas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[...athlete.biometrics].reverse().map((record, idx) => (
                  <div key={idx} className="flex justify-between items-center p-3 rounded-lg border border-black/5 dark:border-white/5 bg-black/20 hover:bg-black/5 dark:bg-white/5 transition">
                    <div>
                      <span className="font-medium block">{record.date}</span>
                      <span className="text-xs text-muted-foreground">
                        Peso: {record.weight}kg | Altura: {record.height}cm
                        {record.chest && ` | P: ${record.chest} | Ci: ${record.waist} | Ca: ${record.hips}`}
                        {record.customFields && Object.entries(record.customFields)
                          .filter(([k]) => !['pecho', 'cintura', 'cadera'].includes(k.toLowerCase()))
                          .map(([k,v]) => ` | ${k.substring(0,2)}: ${v}`).join('')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
