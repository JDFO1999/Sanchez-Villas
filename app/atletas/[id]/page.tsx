"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { athleteService, AthleteProfile, BiometricRecord } from "@/lib/data-service"
import { storeService, Transaction } from "@/lib/store-service"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, User, Calendar, Activity, ClipboardList, TrendingUp, Search } from "lucide-react"
import { useSettings } from "@/lib/settings-context"
import { updateCoachProfile } from "@/app/actions/users"
import { RoutineAssignmentModal } from "@/components/modals/routine-assignment-modal"
import Link from "next/link"
import { useParams } from "next/navigation"
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'

import Swal from 'sweetalert2'
import { showSweetToast } from "@/lib/toast-context"

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

  
  const [showEditCoach, setShowEditCoach] = useState(false)
  const [editBio, setEditBio] = useState("")
  const [editSocial, setEditSocial] = useState<{platform: string, url: string}[]>([])

  const handleUpdateCoach = async (e: React.FormEvent) => {
    e.preventDefault()
    const socialStr = JSON.stringify(editSocial)
    const res = await updateCoachProfile(athlete!.id, { bio: editBio, socialLinks: socialStr })
    if (res.success) {
      setAthlete({...athlete, bio: editBio, socialLinks: socialStr} as any)
      setShowEditCoach(false)
      showSweetToast("Perfil actualizado correctamente", "success")
    } else {
      showSweetToast("Error actualizando perfil", "error")
    }
  }

  const handleAddSocial = () => {
    setEditSocial([...editSocial, { platform: "Instagram", url: "" }])
  }

  const [showCoachRequest, setShowCoachRequest] = useState(false)
  const [requestReason, setRequestReason] = useState("")

  const [showAdminCoachModal, setShowAdminCoachModal] = useState(false)
  const [coachSearch, setCoachSearch] = useState("")
  
  const [showRoutineModal, setShowRoutineModal] = useState(false)
  const [routineType, setRoutineType] = useState("Hipertrofia")
  const [routineStart, setRoutineStart] = useState("")
  const [routineEnd, setRoutineEnd] = useState("")
  const [routineRest, setRoutineRest] = useState("90s")

  const [requestTarget, setRequestTarget] = useState("")

  const [allCoaches, setAllCoaches] = useState<any[]>([])
  useEffect(() => {
    if (getAllEmployees) {
      getAllEmployees().then(res => {
        setAllCoaches(res.filter((e: any) => e.role === 'coach'))
      }).catch(console.error)
    } else {
      setAllCoaches([{ id: '2', name: 'Carlos (Staff Principal)' }])
    }
  }, [getAllEmployees])

  useEffect(() => {
    async function load() {
      if (!id) return;
      const { getAthleteById } = await import('@/app/actions/users')
      const res = await getAthleteById(id)
      if (res.success && res.athlete) {
        // Map Prisma format to UI format
        setAthlete({
          ...res.athlete,
          membershipEnd: res.athlete.memberships?.[0]?.endDate || new Date(0).toISOString(),
          membershipType: res.athlete.memberships?.[0]?.planName || "Plan Estándar",
          biometrics: res.athlete.biometrics || [],
          attendances: res.athlete.attendances || []
        } as any)
      }
    }
    load()
  }, [id])

  if (!athlete) {
    return (
      <div className="space-y-6 max-w-full w-full mx-auto relative animate-pulse">
        {/* Header Skeleton */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 bg-card/40 p-6 rounded-2xl border border-black/5 dark:border-white/5 glass">
          <div className="flex items-center gap-6">
            <div className="h-20 w-20 rounded-full bg-black/10 dark:bg-white/10 shrink-0" />
            <div className="space-y-3">
              <div className="h-8 bg-black/10 dark:bg-white/10 rounded w-52" />
              <div className="h-4 bg-black/10 dark:bg-white/10 rounded w-40" />
              <div className="h-4 bg-black/10 dark:bg-white/10 rounded w-32" />
            </div>
          </div>
          <div className="flex gap-3">
            <div className="h-10 w-28 bg-black/10 dark:bg-white/10 rounded-lg" />
            <div className="h-10 w-28 bg-black/10 dark:bg-white/10 rounded-lg" />
          </div>
        </div>

        {/* Columns Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="space-y-6">
            <div className="glass rounded-xl p-6 border border-black/10 dark:border-white/10 space-y-4">
              <div className="h-5 bg-black/10 dark:bg-white/10 rounded w-1/3" />
              <div className="h-8 bg-black/10 dark:bg-white/10 rounded w-1/2" />
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-black/5 dark:border-white/5">
                <div className="h-4 bg-black/10 dark:bg-white/10 rounded" />
                <div className="h-4 bg-black/10 dark:bg-white/10 rounded" />
              </div>
            </div>
            <div className="glass rounded-xl p-6 border border-black/10 dark:border-white/10 space-y-4">
              <div className="h-5 bg-black/10 dark:bg-white/10 rounded w-1/3" />
              <div className="h-8 bg-black/10 dark:bg-white/10 rounded w-1/4" />
              <div className="h-2 bg-black/10 dark:bg-white/10 rounded-full w-full" />
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="glass rounded-xl p-6 border border-black/10 dark:border-white/10 space-y-4">
              <div className="h-5 bg-black/10 dark:bg-white/10 rounded w-1/4" />
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map(k => (
                  <div key={k} className="h-20 bg-black/10 dark:bg-white/10 rounded-xl" />
                ))}
              </div>
            </div>
            <div className="glass rounded-xl p-6 border border-black/10 dark:border-white/10 space-y-4">
              <div className="h-5 bg-black/10 dark:bg-white/10 rounded w-1/3" />
              <div className="h-48 bg-black/10 dark:bg-white/10 rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Access control
  if (user?.role === 'athlete' && user.cedula !== athlete.cedula) {
    return <div className="p-8 text-center text-destructive font-bold">Acceso Denegado</div>
  }

  const latestBiometrics = athlete.biometrics.length > 0 ? athlete.biometrics[athlete.biometrics.length - 1] : null

  const handleAddBiometrics = async (e: React.FormEvent) => {
    e.preventDefault()
    const customFieldsObj = newCustomFields.reduce((acc, field) => {
      if (field.name && field.value) {
        acc[field.name] = `${field.value} ${field.unit || ''}`.trim();
      }
      return acc;
    }, {} as Record<string, string>);

    const newRecord = {
      weight: parseFloat(newWeight),
      height: parseFloat(newHeight),
      customFields: Object.keys(customFieldsObj).length > 0 ? customFieldsObj : undefined
    }
    
    const { addBiometric, getAthleteById } = await import('@/app/actions/users')
    await addBiometric(athlete.id, newRecord)
    
    const res = await getAthleteById(athlete.id)
    if (res.success && res.athlete) {
      setAthlete({
        ...res.athlete,
        membershipEnd: res.athlete.memberships?.[0]?.endDate || new Date(0).toISOString(),
        membershipType: res.athlete.memberships?.[0]?.planName || "Plan Estándar",
        biometrics: res.athlete.biometrics || [],
        attendances: res.athlete.attendances || []
      } as any)
    }

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

  const currentCoachName = allCoaches.find(c => c.id === athlete?.coachId)?.name || 'Ninguno'
  const previousCoachName = athlete?.previousCoachId ? (allCoaches.find(c => c.id === athlete.previousCoachId)?.name || 'Desconocido') : null

  const filteredCoaches = allCoaches.filter(c => c.name.toLowerCase().includes(coachSearch.toLowerCase()))

  const handleAdminAssignCoach = async (coachId: string) => {
    setShowAdminCoachModal(false)
    const coach = allCoaches.find(c => c.id === coachId);
    if(!coach) return;
    
    const result = await Swal.fire({
      title: '¿Confirmar Reasignación?',
      html: `
        <p>Vas a reasignar este atleta al entrenador <b>${coach.name}</b>.</p>
        <div style="margin-top:15px; padding:15px; border-radius:8px; text-align:left;" class="bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10">
          <p style="font-size:13px; margin:0;"><b>Importante:</b> Al confirmar, la plataforma actualizará el perfil del atleta. El atleta luego podrá proceder a caja a pagar la nueva cuota asignada o la propuesta por el entrenador.</p>
        </div>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, Reasignar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#eab308',
      cancelButtonColor: '#ef4444',
      reverseButtons: true
    });

    if (result.isConfirmed) {
      const updated = { ...athlete, coachId }
      await import('@/app/actions/users').then(m => m.updateAthlete(updated.id, updated))
      setAthlete(updated)
      
      Swal.fire({
        title: '¡Asignado Exitosamente!',
        text: 'El atleta ahora está con ' + coach.name + '. Ya puede realizar el pago de la cuota correspondiente.',
        icon: 'success',
        confirmButtonColor: '#22c55e'
      });
    }
  }

  const handleAssignRoutine = (e: React.FormEvent) => {
    e.preventDefault()
    showSweetToast(`Rutina asignada: ${routineType} (${routineStart} a ${routineEnd})`, "success")
    setShowRoutineModal(false)
  }

  const handleSendRequest = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!requestTarget || !id) {
      Swal.fire({ icon: 'warning', title: 'Atención', text: 'Por favor selecciona un entrenador.' });
      return;
    }
    
    const coach = allCoaches.find(c => c.id === requestTarget);
    
    const confirm = await Swal.fire({
      title: '¿Enviar Solicitud?',
      html: `
        <p>Se enviará una petición formal para cambiar al entrenador <b>${coach?.name || ''}</b>.</p>
        <div style="margin-top:15px; padding:15px; border-radius:8px; text-align:left;" class="bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10">
          <p style="font-size:13px; margin:0;"><b>Importante:</b> Esta solicitud debe ser confirmada por la administración. Una vez autorizada, se establecerá la nueva cuota para que puedas oficializar el cambio pagando en Recepción o Tienda.</p>
        </div>
      `,
      icon: 'info',
      showCancelButton: true,
      confirmButtonText: 'Enviar Solicitud',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#2563eb'
    });

    if (!confirm.isConfirmed) return;

    const { requestCoachChange } = await import('@/app/actions/users')
    const res = await requestCoachChange(id as string, requestTarget)
    if (res.success) {
      Swal.fire('¡Solicitud Enviada!', 'El administrador evaluará la solicitud y te asignará la cuota correspondiente. Podrás verificarlo pronto.', 'success')
      setShowCoachRequest(false)
      setRequestReason("")
    } else {
      Swal.fire('Error', res.error || "Ocurrió un error al enviar la solicitud", 'error')
    }
  }

  // Calculate days remaining
  const endDateStr = athlete.membershipEnd;
  const endDate = endDateStr && endDateStr !== "1970-01-01T00:00:00.000Z" ? new Date(endDateStr) : null;
  const today = new Date();
  const diffTime = endDate ? endDate.getTime() - today.getTime() : -1;
  const diffDays = endDate ? Math.ceil(diffTime / (1000 * 60 * 60 * 24)) : 0;
  
  const createdDate = new Date(athlete.createdAt || new Date());
  const totalDaysRegistered = Math.max(1, Math.floor((today.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24)));
  const totalAttendances = athlete.attendances?.length || 0;
  const calculatedAttendancePct = Math.min(100, Math.round((totalAttendances / totalDaysRegistered) * 100));
  const attendanceText = calculatedAttendancePct >= 70 ? "Buena" : calculatedAttendancePct >= 40 ? "Regular" : "Baja";
  
  const biometricChartData = [...(athlete.biometrics || [])]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map(b => ({
      date: new Date(b.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      peso: Number(b.weight) || 0,
      altura: Number(b.height) || 0,
    }));

  return (
    <div className="space-y-6 max-w-full w-full mx-auto relative">
      
      {/* Modal Request */}
      
      {showEditCoach && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-card border border-border rounded-xl max-w-md w-full shadow-2xl glass max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-border">
              <h3 className="text-xl font-black mb-1">Editar Perfil de Entrenador</h3>
              <p className="text-sm text-muted-foreground">Actualiza tu información pública.</p>
            </div>
            
            <div className="overflow-y-auto p-6 custom-scrollbar">
              <form id="edit-coach-form" onSubmit={handleUpdateCoach} className="space-y-5">
                <div>
                  <label className="text-sm font-bold block mb-1">Biografía / Descripción</label>
                  <textarea 
                    rows={4} 
                    value={editBio}
                    onChange={e => setEditBio(e.target.value)}
                    placeholder="Soy especialista en musculación..."
                    className="w-full bg-card border border-border rounded-lg p-2.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
                  />
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-bold block">Redes Sociales</label>
                    <button type="button" onClick={handleAddSocial} className="text-[10px] uppercase font-bold bg-primary/20 text-primary px-2 py-1 rounded hover:bg-primary/30 transition">
                      + Añadir Red
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    {editSocial.length === 0 && <p className="text-xs text-muted-foreground italic">No tienes redes configuradas.</p>}
                    {editSocial.map((link, i) => (
                      <div key={i} className="flex gap-2 items-center">
                        <select 
                          value={link.platform}
                          onChange={(e) => {
                            const newS = [...editSocial];
                            newS[i].platform = e.target.value;
                            setEditSocial(newS);
                          }}
                          className="w-1/3 bg-card border border-border rounded p-2 text-xs focus:border-primary focus:outline-none"
                        >
                          <option value="Instagram">Instagram</option>
                          <option value="TikTok">TikTok</option>
                          <option value="Twitter">Twitter/X</option>
                          <option value="YouTube">YouTube</option>
                          <option value="LinkedIn">LinkedIn</option>
                          <option value="Web">Web</option>
                        </select>
                        <input 
                          type="url"
                          required
                          value={link.url}
                          onChange={(e) => {
                            const newS = [...editSocial];
                            newS[i].url = e.target.value;
                            setEditSocial(newS);
                          }}
                          placeholder="https://..."
                          className="w-full bg-card border border-border rounded p-2 text-xs focus:border-primary focus:outline-none"
                        />
                        <button type="button" onClick={() => setEditSocial(editSocial.filter((_, idx) => idx !== i))} className="text-destructive hover:text-destructive bg-destructive/10 p-2 rounded">
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </form>
            </div>
            
            <div className="p-6 border-t border-border flex justify-end gap-3 bg-black/5 dark:bg-black/20">
              <button type="button" onClick={() => setShowEditCoach(false)} className="px-4 py-2 text-sm bg-black/5 hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10 rounded-lg transition font-bold">Cancelar</button>
              <button type="submit" form="edit-coach-form" className="px-6 py-2 text-sm bg-primary text-black font-black rounded-lg hover:opacity-90 transition">Guardar</button>
            </div>
          </div>
        </div>
      )}

      {showCoachRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-card border border-black/10 dark:border-white/10 rounded-xl max-w-md w-full p-6 shadow-2xl glass">
            <h3 className="text-xl font-bold mb-2">Solicitar Cambio de Entrenador</h3>
            <p className="text-sm text-muted-foreground mb-4">Esta solicitud será revisada por la administración del gimnasio.</p>
            <form onSubmit={handleSendRequest} className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Entrenador Deseado</label>
                <select 
                  required
                  value={requestTarget}
                  onChange={e => setRequestTarget(e.target.value)}
                  className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded p-2.5 text-sm"
                >
                  <option value="">Selecciona un entrenador</option>
                  {allCoaches.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
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
                <button type="submit" className="px-4 py-2 text-sm border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground dark:bg-primary dark:text-primary-foreground dark:border-transparent font-bold rounded hover:bg-primary/90 transition">Enviar Solicitud</button>
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
        <RoutineAssignmentModal
          isOpen={showRoutineModal}
          onClose={() => setShowRoutineModal(false)}
          coachId={(user as any)?.id || ''}
          athletes={[athlete]}
          defaultAthleteId={athlete.id}
          onSuccess={() => {
            setShowRoutineModal(false);
            showSweetToast("¡Plan asignado con éxito!", "success");
          }}
        />
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
                      reader.onloadend = async () => {
                        const base64 = reader.result as string;
                        // Optimistic update
                        const updated = { ...athlete, profilePicture: base64 }
                        setAthlete(updated)
                        
                        const { updateProfilePicture } = await import('@/app/actions/users');
                        const res = await updateProfilePicture(athlete.id, base64);
                        if (res.success) {
                          setAthlete({ ...athlete, profilePicture: res.profilePicture });
                        } else {
                          showSweetToast("Error al subir foto: " + res.error, "error");
                        }
                      }
                      reader.readAsDataURL(file)
                    }
                  }} 
                />
              </label>
            )}
          </div>
          <div>
            <h1 className="page-title">{athlete.name}</h1>
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
              <span className="bg-warning/20 text-warning px-2 py-0.5 rounded text-xs font-bold flex items-center gap-1">
                🔥 Racha de Asistencia: {athlete.attendances?.length || 0} Días
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex gap-3 flex-wrap">

          {user?.id === athlete.id && (athlete as any).role === 'coach' && (
            <button onClick={() => {
              setEditBio((athlete as any).bio || "");
              try {
                setEditSocial(JSON.parse((athlete as any).socialLinks || "[]"));
              } catch {
                setEditSocial([]);
              }
              setShowEditCoach(true);
            }} className="bg-transparent border-2 border-primary text-primary hover:bg-primary/10 px-4 py-2 rounded-lg font-bold transition">
              Editar Perfil
            </button>
          )}

          {(user?.role === 'admin' || user?.role === 'coach') && (
            <button onClick={() => setShowRoutineModal(true)} className="bg-transparent border-2 border-primary text-primary hover:bg-primary/10 px-4 py-2 rounded-lg font-bold transition">
              Asignar Rutina
            </button>
          )}
          {user?.role === 'admin' && (
            <button onClick={() => setShowAdminCoachModal(true)} className="bg-primary/20 text-primary px-4 py-2 rounded-lg font-medium hover:bg-primary/30 transition">
              Cambiar Coach
            </button>
          )}
          {user?.role === 'athlete' && athlete.coachId && (
            <button onClick={() => setShowCoachRequest(true)} className="bg-transparent border-2 border-primary text-primary px-4 py-2 rounded-lg font-bold shadow-sm hover:bg-primary/10 transition">
              Solicitar Cambio de Coach
            </button>
          )}
          {user?.role === 'athlete' && !athlete.coachId && (
            <button onClick={() => setShowAdminCoachModal(true)} className="bg-transparent border-2 border-primary text-primary hover:bg-primary/10 px-4 py-2 rounded-lg font-bold transition">
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
                <p className="text-xs text-muted-foreground mb-1.5 uppercase font-bold tracking-wider">Estado</p>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full font-bold text-sm border shadow-sm"
                  style={{
                    backgroundColor: diffDays > 7 ? 'rgba(16, 185, 129, 0.1)' : diffDays > 0 ? 'rgba(245, 158, 11, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                    borderColor: diffDays > 7 ? 'rgba(16, 185, 129, 0.25)' : diffDays > 0 ? 'rgba(245, 158, 11, 0.25)' : 'rgba(239, 68, 68, 0.25)',
                    color: diffDays > 7 ? '#10b981' : diffDays > 0 ? '#f59e0b' : '#ef4444'
                  }}
                >
                  <span className="relative flex h-2.5 w-2.5">
                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${diffDays > 7 ? 'bg-emerald-400' : diffDays > 0 ? 'bg-amber-400' : 'bg-rose-400'}`} />
                    <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${diffDays > 7 ? 'bg-emerald-500' : diffDays > 0 ? 'bg-amber-500' : 'bg-rose-500'}`} />
                  </span>
                  <span>{diffDays > 0 ? `${diffDays} días restantes` : 'Membresía Vencida'}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-black/10 dark:border-white/10">
                <div>
                  <p className="text-xs text-muted-foreground">Inicio</p>
                  <p className="font-medium text-sm">{athlete.membershipStart && new Date(athlete.membershipStart).getFullYear() > 1970 ? new Date(athlete.membershipStart).toLocaleDateString() : 'Sin registro'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Vencimiento</p>
                  <p className="font-medium text-sm">{endDate ? endDate.toLocaleDateString() : 'Sin Plan Activo'}</p>
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
                <span className="text-3xl font-bold">{calculatedAttendancePct}%</span>
                <span className={`text-sm font-medium ${calculatedAttendancePct >= 70 ? 'text-success' : calculatedAttendancePct >= 40 ? 'text-warning' : 'text-destructive'}`}>{attendanceText}</span>
              </div>
              <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full" style={{ width: `${calculatedAttendancePct}%` }} />
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
              {(user?.role === 'admin' || user?.role === 'coach') && (
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
                          }} className="bg-destructive/10 text-destructive p-2 rounded hover:bg-destructive/20 mb-px shrink-0">X</button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button type="button" onClick={() => setNewCustomFields([...newCustomFields, {name: '', unit: 'cm', value: ''}])} className="text-xs bg-primary/20 text-primary font-bold py-1.5 px-3 rounded-lg hover:bg-primary/30 transition">
                    + Añadir Otra Medida
                  </button>
                  <button type="submit" className="border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground dark:bg-primary dark:text-primary-foreground dark:border-transparent font-medium py-2 px-4 rounded-lg text-sm w-full mt-2">
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
                <div className="py-8 text-center rounded-xl bg-black/5 dark:bg-white/5 border border-dashed border-black/10 dark:border-white/10">
                  <div className="h-12 w-12 rounded-full bg-primary/10 text-primary mx-auto flex items-center justify-center mb-3">
                    <Activity className="h-6 w-6 opacity-70" />
                  </div>
                  <p className="text-sm font-semibold text-foreground">Sin registros biométricos actuales</p>
                  <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">
                    Aún no se han capturado medidas ni pesaje para este perfil.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Gráfico de Evolución Física (Recharts) */}
          <Card className="glass overflow-hidden border-primary/20">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" /> Evolución Física (Progreso de Peso)
              </CardTitle>
              {athlete.biometrics.length > 1 && (
                <span className="text-xs px-2.5 py-1 rounded-full font-bold bg-primary/10 text-primary border border-primary/20">
                  {athlete.biometrics.length} tomas registradas
                </span>
              )}
            </CardHeader>
            <CardContent>
              {biometricChartData.length > 0 ? (
                <div className="pt-2">
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={biometricChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="weightGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.15} vertical={false} />
                        <XAxis 
                          dataKey="date" 
                          tick={{ fill: 'currentColor', opacity: 0.6, fontSize: 11 }} 
                          axisLine={{ opacity: 0.2 }}
                          tickLine={false}
                        />
                        <YAxis 
                          domain={['dataMin - 2', 'dataMax + 2']} 
                          tick={{ fill: 'currentColor', opacity: 0.6, fontSize: 11 }}
                          axisLine={{ opacity: 0.2 }}
                          tickLine={false}
                        />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'rgba(20, 20, 25, 0.95)', 
                            borderRadius: '12px', 
                            border: '1px solid rgba(255,255,255,0.1)',
                            boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                            fontSize: '12px',
                            color: '#fff'
                          }} 
                          formatter={(val: any) => [`${val} kg`, 'Peso']}
                          labelStyle={{ fontWeight: 'bold', color: '#10b981' }}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="peso" 
                          stroke="#10b981" 
                          strokeWidth={2.5} 
                          fillOpacity={1} 
                          fill="url(#weightGrad)" 
                          dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }}
                          activeDot={{ r: 6, fill: '#10b981', stroke: '#fff', strokeWidth: 3 }}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex justify-between items-center text-xs text-muted-foreground mt-3 pt-3 border-t border-black/5 dark:border-white/5 px-1">
                    <span>Primer registro: <strong className="text-foreground">{biometricChartData[0]?.peso} kg</strong></span>
                    <span>Último registro: <strong className="text-primary">{biometricChartData[biometricChartData.length - 1]?.peso} kg</strong></span>
                    <span>Diferencia: <strong className={
                      (biometricChartData[biometricChartData.length - 1]?.peso || 0) >= (biometricChartData[0]?.peso || 0)
                        ? "text-success" 
                        : "text-warning"
                    }>
                      {((biometricChartData[biometricChartData.length - 1]?.peso || 0) - (biometricChartData[0]?.peso || 0)).toFixed(1)} kg
                    </strong></span>
                  </div>
                </div>
              ) : (
                <div className="py-8 text-center rounded-xl bg-black/5 dark:bg-white/5 border border-dashed border-black/10 dark:border-white/10">
                  <div className="h-12 w-12 rounded-full bg-primary/10 text-primary mx-auto flex items-center justify-center mb-3">
                    <TrendingUp className="h-6 w-6 opacity-70" />
                  </div>
                  <p className="text-sm font-semibold text-foreground">Sin datos suficientes para graficar</p>
                  <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">
                    Registra al menos una medida antropométrica para visualizar la gráfica de evolución.
                  </p>
                </div>
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
              {athlete.biometrics.length === 0 ? (
                <div className="py-8 text-center rounded-xl bg-black/5 dark:bg-white/5 border border-dashed border-black/10 dark:border-white/10">
                  <ClipboardList className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
                  <p className="text-sm font-medium text-foreground">Sin historial archivado</p>
                  <p className="text-xs text-muted-foreground mt-1">Las mediciones que registres aparecerán listadas aquí con fecha.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {[...athlete.biometrics].reverse().map((record, idx) => (
                    <div key={idx} className="flex justify-between items-center p-3 rounded-lg border border-black/5 dark:border-white/5 bg-black/20 hover:bg-black/5 dark:bg-white/5 transition">
                      <div>
                        <span className="font-medium block">{new Date(record.date).toLocaleDateString()}</span>
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
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

