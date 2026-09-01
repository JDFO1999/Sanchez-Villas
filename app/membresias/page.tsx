"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { athleteService, AthleteProfile } from "@/lib/data-service"
import { Card, CardContent } from "@/components/ui/card"
import { Search, CreditCard, Clock, MessageSquare, Edit, Check } from "lucide-react"

export default function MembresiasPage() {
  const { user, adminUpdateAthleteCredentials } = useAuth()
  const [athletes, setAthletes] = useState<AthleteProfile[]>([])
  const [search, setSearch] = useState("")

  // Edit Modal State
  const [showEditModal, setShowEditModal] = useState<AthleteProfile | null>(null)
  const [editName, setEditName] = useState("")
  const [editCedula, setEditCedula] = useState("")
  const [editPhone, setEditPhone] = useState("")
  const [editAddress, setEditAddress] = useState("")
  const [editPassword, setEditPassword] = useState("")
  const [editConfirmPassword, setEditConfirmPassword] = useState("")

  // Message Modal State
  const [showMessageModal, setShowMessageModal] = useState<AthleteProfile | null>(null)
  const [messageText, setMessageText] = useState("")

  const [customMessages, setCustomMessages] = useState([
    { title: "Inasistencia", text: "¡Hola {nombre}! Hemos notado que llevas días sin venir al gimnasio. ¿Todo bien? Te esperamos." },
    { title: "Felicitación", text: "¡Felicidades por tu constancia esta semana {nombre}! Sigue así." },
    { title: "Recordatorio", text: "Hola {nombre}, te recordamos que tu membresía está próxima a vencer. ¡Renueva pronto para no perder el ritmo!" }
  ])
  const [showCreateMessageModal, setShowCreateMessageModal] = useState(false)
  const [newMessageTitle, setNewMessageTitle] = useState("")
  const [newMessageText, setNewMessageText] = useState("")

  useEffect(() => {
    setAthletes(athleteService.getAthletes())
  }, [])

  if (!user || (user.role !== 'admin' && !user.permissions?.includes('CRM_MANAGE'))) {
    return <div className="p-8 text-center text-red-500 font-bold">Acceso Denegado. Solo personal autorizado.</div>
  }

  const filtered = athletes.filter(a => 
    a.name.toLowerCase().includes(search.toLowerCase()) || 
    a.cedula.includes(search)
  )

  const openEditModal = (a: AthleteProfile) => {
    setEditName(a.name)
    setEditCedula(a.cedula)
    setEditPhone(a.phone || "")
    setEditAddress(a.address || "")
    setEditPassword("")
    setEditConfirmPassword("")
    setShowEditModal(a)
  }

  const passwordMatch = editPassword && editConfirmPassword && editPassword === editConfirmPassword

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!showEditModal) return
    if (editPassword && editPassword !== editConfirmPassword) {
      alert("Las contraseñas no coinciden.")
      return
    }

    // Update credentials in auth system
    const success = adminUpdateAthleteCredentials(
      showEditModal.cedula,
      editCedula,
      editName,
      editPassword
    )

    if (success) {
      // Update in athlete DB
      const updatedProfile = { 
        ...showEditModal, 
        name: editName, 
        cedula: editCedula,
        phone: editPhone,
        address: editAddress
      }
      athleteService.updateAthlete(updatedProfile)
      setAthletes(athleteService.getAthletes()) // refresh list
      setShowEditModal(null)
      alert("Atleta actualizado exitosamente.")
    } else {
      alert("Error actualizando atleta. Cédula no encontrada.")
    }
  }

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!showMessageModal?.phone) {
      alert("El atleta no tiene un número de teléfono registrado.")
      return
    }
    // Clean phone number (remove spaces, +, etc)
    const phone = showMessageModal.phone.replace(/\D/g, '')
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(messageText)}`
    window.open(url, '_blank')
    setShowMessageModal(null)
    setMessageText("")
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto relative">
      
      {/* EDIT MODAL */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-card border border-black/10 dark:border-white/10 rounded-xl max-w-md w-full p-6 shadow-2xl glass overflow-y-auto max-h-[90vh]">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><Edit className="h-5 w-5 text-primary"/> Editar Atleta</h3>
            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 md:col-span-1">
                  <label className="text-xs font-medium mb-1 block">Nombre Completo</label>
                  <input required type="text" value={editName} onChange={e=>setEditName(e.target.value)} className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded p-2 text-sm focus:border-primary" />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="text-xs font-medium mb-1 block">Cédula</label>
                  <input required type="text" value={editCedula} onChange={e=>setEditCedula(e.target.value)} className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded p-2 text-sm focus:border-primary" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 md:col-span-1">
                  <label className="text-xs font-medium mb-1 block">Teléfono</label>
                  <input required type="text" value={editPhone} onChange={e=>setEditPhone(e.target.value)} className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded p-2 text-sm focus:border-primary" />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="text-xs font-medium mb-1 block">Dirección</label>
                  <input required type="text" value={editAddress} onChange={e=>setEditAddress(e.target.value)} className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded p-2 text-sm focus:border-primary" />
                </div>
              </div>

              <div className="pt-2 border-t border-black/5 dark:border-white/5">
                <p className="text-xs text-muted-foreground mb-2">Cambiar Contraseña (Opcional)</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium mb-1 block">Nueva Contraseña</label>
                    <input type="password" placeholder="Dejar en blanco" value={editPassword} onChange={e=>setEditPassword(e.target.value)} className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded p-2 text-sm focus:border-primary" />
                  </div>
                  <div className="relative">
                    <label className="text-xs font-medium mb-1 block">Confirmar Contraseña</label>
                    <input type="password" value={editConfirmPassword} onChange={e=>setEditConfirmPassword(e.target.value)} className={`w-full bg-black/5 dark:bg-black/40 border rounded p-2 text-sm focus:outline-none transition-all ${editConfirmPassword ? (passwordMatch ? 'border-green-500/50' : 'border-red-500/50') : 'border-black/10 dark:border-white/10'}`} placeholder="Repetir contraseña" disabled={!editPassword} required={!!editPassword} />
                    {passwordMatch && editPassword && <Check className="absolute right-3 top-7 h-4 w-4 text-green-500" />}
                    {editConfirmPassword && !passwordMatch && editPassword && <span className="text-[10px] text-red-500 absolute -bottom-4 left-0">No coinciden</span>}
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3 justify-end pt-4">
                <button type="button" onClick={()=>setShowEditModal(null)} className="px-4 py-2 text-sm bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:bg-white/10 rounded transition">Cancelar</button>
                <button type="submit" disabled={!!editPassword && !passwordMatch} className="px-4 py-2 text-sm bg-primary text-primary-foreground font-bold rounded hover:bg-primary/90 transition disabled:opacity-50">Guardar Cambios</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MESSAGE MODAL */}
      {showMessageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-card border border-black/10 dark:border-white/10 rounded-xl max-w-md w-full p-6 shadow-2xl glass">
            <h3 className="text-xl font-bold mb-1 flex items-center gap-2"><MessageSquare className="h-5 w-5 text-primary"/> Mensaje a {showMessageModal.name}</h3>
            <p className="text-xs text-muted-foreground mb-4">Se enviará a: {showMessageModal.phone || 'Sin número registrado'}</p>
            
            <div className="flex flex-wrap gap-2 mb-4 max-h-32 overflow-y-auto">
              {customMessages.map((msg, i) => (
                <button 
                  key={i} 
                  onClick={() => setMessageText(msg.text.replace('{nombre}', showMessageModal.name.split(' ')[0]))} 
                  className="text-xs bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 px-2 py-1 rounded hover:bg-black/10 dark:bg-white/10 transition"
                >
                  {msg.title}
                </button>
              ))}
              <button 
                onClick={() => setShowCreateMessageModal(true)}
                className="text-xs bg-primary/20 text-primary border border-primary/20 px-2 py-1 rounded hover:bg-primary/30 transition flex items-center gap-1"
              >
                + Nuevo
              </button>
            </div>

            <form onSubmit={handleSendMessage} className="space-y-4">
              <textarea 
                required
                rows={4} 
                value={messageText}
                onChange={e => setMessageText(e.target.value)}
                placeholder="Escribe tu mensaje..."
                className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded p-3 text-sm focus:outline-none focus:border-primary"
              />
              <div className="flex gap-3 justify-end pt-2">
                <button type="button" onClick={()=>setShowMessageModal(null)} className="px-4 py-2 text-sm bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:bg-white/10 rounded transition">Cancelar</button>
                <button type="submit" className="px-4 py-2 text-sm bg-green-500 text-white font-bold rounded hover:bg-green-600 transition flex items-center gap-2">
                  Abrir WhatsApp
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE MESSAGE MODAL */}
      {showCreateMessageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="bg-card border border-black/10 dark:border-white/10 rounded-xl max-w-sm w-full p-6 shadow-2xl glass">
            <h3 className="text-lg font-bold mb-4">Crear Plantilla de Mensaje</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              setCustomMessages(prev => [...prev, { title: newMessageTitle, text: newMessageText }]);
              setShowCreateMessageModal(false);
              setNewMessageTitle("");
              setNewMessageText("");
            }} className="space-y-4">
              <div>
                <label className="text-xs font-medium mb-1 block">Título del botón</label>
                <input required type="text" value={newMessageTitle} onChange={e=>setNewMessageTitle(e.target.value)} placeholder="Ej. Promoción" className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded p-2 text-sm focus:border-primary" />
              </div>
              <div>
                <label className="text-xs font-medium mb-1 block">Mensaje (Usa {'{nombre}'} para el atleta)</label>
                <textarea required rows={4} value={newMessageText} onChange={e=>setNewMessageText(e.target.value)} placeholder="Ej. Hola {nombre}, tenemos una promoción..." className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded p-2 text-sm focus:border-primary" />
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <button type="button" onClick={()=>setShowCreateMessageModal(false)} className="px-4 py-2 text-sm bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:bg-white/10 rounded transition">Cancelar</button>
                <button type="submit" className="px-4 py-2 text-sm bg-primary text-primary-foreground font-bold rounded hover:bg-primary/90 transition">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tighter bg-gradient-to-r from-primary dark:dark:via-white via-black via-black to-primary/50 bg-clip-text text-transparent dark:dark:drop-shadow-[0_0_15px_rgba(255,255,255,0.1)] drop-shadow-sm drop-shadow-sm">Membresías & CRM</h1>
          <p className="text-muted-foreground mt-1">
            Gestiona accesos, planes y comunícate con tus atletas.
          </p>
        </div>
        
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Buscar por cédula o nombre..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filtered.map(a => {
          const endDate = new Date(a.membershipEnd)
          const today = new Date()
          const diffDays = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
          const isExpired = diffDays <= 0

          return (
            <Card key={a.id} className="glass overflow-hidden hover:border-primary/30 transition-colors">
              <CardContent className="p-0">
                <div className="flex flex-col md:flex-row items-stretch">
                  
                  {/* Info Principal */}
                  <div className="p-5 flex-1 flex items-center gap-4 relative">
                    {/* Status Badge */}
                    <div className={`absolute top-4 right-4 text-[10px] font-bold px-2 py-0.5 rounded-full ${isExpired ? 'bg-red-500 text-white' : 'bg-green-500 text-white'}`}>
                      {isExpired ? 'VENCIDO' : 'ACTIVO'}
                    </div>

                    <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xl shrink-0">
                      {a.name.charAt(0)}
                    </div>
                    <div className="pr-12">
                      <h3 className="font-bold text-lg leading-tight">{a.name}</h3>
                      <p className="text-sm text-muted-foreground">C.C. {a.cedula}</p>
                    </div>
                  </div>

                  {/* Detalles Membresía */}
                  <div className="p-5 flex-1 border-t md:border-t-0 md:border-l border-black/5 dark:border-white/5 flex flex-col justify-center">
                    <div className="flex items-center gap-2 mb-1">
                      <CreditCard className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">{a.membershipType || 'Plan Estándar'}</span>
                    </div>
                    <div className="text-sm">
                      <span className="text-muted-foreground">Vence: </span>
                      <span className={isExpired ? 'text-red-500 font-bold' : 'text-foreground'}>{a.membershipEnd}</span>
                      <span className={`ml-2 px-2 py-0.5 rounded text-xs font-bold ${isExpired ? 'bg-red-500/20 text-red-500' : 'bg-green-500/20 text-green-500'}`}>
                        {isExpired ? 'Vencida' : `${diffDays} días`}
                      </span>
                    </div>
                  </div>

                  {/* Último Acceso */}
                  <div className="p-5 flex-1 border-t md:border-t-0 md:border-l border-black/5 dark:border-white/5 flex flex-col justify-center">
                    <div className="flex items-center gap-2 mb-1">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Último Acceso</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{a.lastLogin || 'Nunca'}</p>
                  </div>

                  {/* Acciones */}
                  <div className="p-5 border-t md:border-t-0 md:border-l border-black/5 dark:border-white/5 flex flex-row md:flex-col items-center justify-center gap-2">
                    <button 
                      onClick={() => openEditModal(a)}
                      className="flex-1 md:w-full bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:bg-white/10 text-foreground border border-black/10 dark:border-white/10 px-3 py-2 rounded transition text-xs font-medium flex items-center justify-center gap-1"
                    >
                      <Edit className="h-3 w-3" /> Editar
                    </button>
                    <button 
                      onClick={() => setShowMessageModal(a)}
                      className="flex-1 md:w-full bg-primary/20 hover:bg-primary/30 text-primary border border-primary/20 px-3 py-2 rounded transition text-xs font-medium flex items-center justify-center gap-1"
                    >
                      <MessageSquare className="h-3 w-3" /> Mensaje
                    </button>
                  </div>

                </div>
              </CardContent>
            </Card>
          )
        })}

        {filtered.length === 0 && (
          <div className="p-8 text-center text-muted-foreground glass rounded-xl border border-black/10 dark:border-white/10">
            No se encontraron atletas.
          </div>
        )}
      </div>
    </div>
  )
}
