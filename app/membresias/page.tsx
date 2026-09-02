"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { athleteService, AthleteProfile } from "@/lib/data-service"
import { storeService, Transaction } from "@/lib/store-service"
import { useSettings } from "@/lib/settings-context"
import { Card, CardContent } from "@/components/ui/card"
import { Search, CreditCard, Clock, MessageSquare, Edit, Check, DollarSign } from "lucide-react"
import Swal from 'sweetalert2'

export default function MembresiasPage() {
  const { user, adminUpdateAthleteCredentials, getAllEmployees } = useAuth()
  const { settings } = useSettings()
  const [athletes, setAthletes] = useState<AthleteProfile[]>([])
  const [search, setSearch] = useState("")

  // Renovar Modal State
  const [showRenovarModal, setShowRenovarModal] = useState<AthleteProfile | null>(null)
  const [renovarIncludeCoach, setRenovarIncludeCoach] = useState(false)
  const [renovarSelectedCoach, setRenovarSelectedCoach] = useState("")
  const [renovarMonths, setRenovarMonths] = useState(1)
  const [renovarPaymentMethod, setRenovarPaymentMethod] = useState<'Efectivo' | 'Tarjeta' | 'Transferencia' | 'Pago Móvil' | 'Binance' | 'Crédito/Fiado'>('Efectivo')
  const [renovarReference, setRenovarReference] = useState("")

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
  const [allCoaches, setAllCoaches] = useState<any[]>([])

  useEffect(() => {
    async function load() {
      const { getAllEmployees } = await import('@/app/actions/users')
      setAthletes(athleteService.getAthletes())
      
      const empRes = await getAllEmployees()
      if (empRes.success) {
        setAllCoaches(empRes.employees.filter((e: any) => e.role !== 'admin'))
      }
    }
    load()
  }, [])

  if (!user || (user.role !== 'admin' && !user.permissions?.includes('CRM_MANAGE') && !user.permissions?.includes('POS_ACCESS'))) {
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

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!showEditModal) return
    if (editPassword && editPassword !== editConfirmPassword) {
      alert("Las contraseñas no coinciden.")
      return
    }

    // Update credentials in auth system
    const success = await adminUpdateAthleteCredentials(
      showEditModal.cedula,
      editCedula,
      editName,
      editPassword
    )

    if (success) {
      // Update in athlete DB
      const current = athleteService.getAthlete(showEditModal.id)
      if (current) {
        athleteService.updateAthlete({
          ...current,
          name: editName,
          cedula: editCedula, // they might have changed it
          phone: editPhone,
          address: editAddress
        })
      }
      setAthletes(athleteService.getAthletes())
      setShowEditModal(null)
    } else {
      alert("Error al actualizar credenciales.")
    }
  }

  const sendMessage = () => {
    if (!showMessageModal) return
    if (!showMessageModal.phone) {
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

  const openRenovarModal = (a: AthleteProfile) => {
    setRenovarSelectedCoach(a.coachId || "")
    setRenovarIncludeCoach(!!a.coachId)
    setRenovarMonths(1)
    setRenovarPaymentMethod('Efectivo')
    setRenovarReference('')
    setShowRenovarModal(a)
  }

  const handleRenovar = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!showRenovarModal) return
    
    // Calculate total
    const membershipPrice = 30 * renovarMonths
    let coachPrice = 0

    if (renovarIncludeCoach && renovarSelectedCoach) {
      if (settings.coachCustomPricing) {
        const coachInfo = getAllEmployees ? (await getAllEmployees()).find((e: any) => e.id === renovarSelectedCoach) : null;
        const cRate = coachInfo?.commissionRate || 15
        coachPrice = cRate * renovarMonths
      } else {
        coachPrice = 15 * renovarMonths
      }
    }
    
    const total = membershipPrice + coachPrice
    
    if (!renovarPaymentMethod) return;

    const { createTransaction } = await import('@/app/actions/store')
    
    // Process Transaction
    const coachInfo = getAllEmployees ? (await getAllEmployees()).find((e: any) => e.id === renovarSelectedCoach) : null;
    await createTransaction({
       cashierId: user?.id || 'admin',
       customerId: showRenovarModal.id,
       items: [
         { productId: 'MEMB', name: `Membresía (${renovarMonths} mes/es)`, price: membershipPrice, qty: 1, subtotal: membershipPrice },
         ...(coachPrice ? [{ productId: 'COACH', name: `Entrenador (${coachInfo?.name || 'Asignado'})`, price: coachPrice, qty: 1, subtotal: coachPrice }] : [])
       ],
       subtotal: total,
       tax: 0,
       total,
       paymentMethod: renovarPaymentMethod,
       reference: renovarReference,
    })

    // Update Athlete Membership
    const currentEnd = new Date(showRenovarModal.membershipEnd)
    const now = new Date()
    let startFrom = currentEnd > now ? currentEnd : now
    startFrom.setMonth(startFrom.getMonth() + renovarMonths)

    const currentAth = athleteService.getAthlete(showRenovarModal.id)
    if (currentAth) {
      athleteService.updateAthlete({
        ...currentAth,
        membershipEnd: startFrom.toISOString(),
        coachId: renovarIncludeCoach ? renovarSelectedCoach : showRenovarModal.coachId
      })
    }
    
    setAthletes(athleteService.getAthletes())
    setShowRenovarModal(null)
    
    // Toast Notification
    const Toast = Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer)
        toast.addEventListener('mouseleave', Swal.resumeTimer)
      }
    })
    Toast.fire({ icon: 'success', title: 'Renovación y cobro exitosos' })
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto relative">
      
      {/* RENOVAR MODAL */}
      {showRenovarModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-card border border-black/10 dark:border-white/10 rounded-xl max-w-md w-full p-6 shadow-2xl glass overflow-y-auto max-h-[90vh]">
            <h3 className="text-xl font-bold mb-2">Renovar Membresía</h3>
            <p className="text-sm text-muted-foreground mb-4">Se creará el cobro automáticamente en la caja.</p>
            <form onSubmit={handleRenovar} className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Duración (Meses)</label>
                <input type="number" min="1" max="12" value={renovarMonths} onChange={e => setRenovarMonths(Number(e.target.value))} className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded p-2 text-sm" />
              </div>
              <div className="flex items-center gap-2 mt-4 bg-black/5 dark:bg-white/5 p-3 rounded-lg border border-black/10 dark:border-white/10">
                <input 
                  type="checkbox" 
                  id="includeCoach" 
                  checked={renovarIncludeCoach} 
                  onChange={e => setRenovarIncludeCoach(e.target.checked)} 
                  className="w-4 h-4 text-primary bg-black/10 dark:bg-white/10 border-black/20 dark:border-white/20 rounded focus:ring-primary"
                />
                <label htmlFor="includeCoach" className="text-sm font-medium cursor-pointer">
                  Añadir Entrenador Personal
                </label>
              </div>

              {renovarIncludeCoach && (
                <div className="mt-3">
                  <label className="text-sm font-medium mb-1 block">Seleccionar Entrenador</label>
                  <select 
                    required 
                    value={renovarSelectedCoach} 
                    onChange={e => setRenovarSelectedCoach(e.target.value)} 
                    className="w-full bg-card dark:bg-black border border-black/10 dark:border-white/10 rounded p-2.5 text-sm"
                  >
                    <option value="">Seleccione uno...</option>
                    {allCoaches.map((c: any) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              )}
              
              <div className="bg-primary/10 border border-primary/20 p-4 rounded-lg mt-4 mb-4 flex justify-between items-center">
                <span className="font-medium text-sm text-primary">Total a Cobrar:</span>
                <span className="text-2xl font-black text-primary">
                  {settings.storeCurrency} {(() => {
                    const mem = 30 * renovarMonths
                    let coachPrice = 0
                    if (renovarIncludeCoach && renovarSelectedCoach) {
                      if (settings.coachCustomPricing) {
                        const coachInfo = getAllEmployees ? getAllEmployees().find((e: any) => e.id === renovarSelectedCoach) : null;
                        coachPrice = (coachInfo?.commissionRate || 15) * renovarMonths
                      } else {
                        coachPrice = 15 * renovarMonths
                      }
                    }
                    return mem + coachPrice
                  })()}
                </span>
              </div>

              {/* Método de Pago */}
              <div className="space-y-4 pt-4 border-t border-black/10 dark:border-white/10">
                <h4 className="font-bold text-sm">Detalles de Facturación</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium mb-1 block">Método de Pago</label>
                    <select 
                      value={renovarPaymentMethod}
                      onChange={e => setRenovarPaymentMethod(e.target.value as any)}
                      className="w-full bg-card dark:bg-black border border-black/10 dark:border-white/10 rounded p-2 text-sm"
                    >
                      <option value="Efectivo">Efectivo</option>
                      <option value="Tarjeta">Punto de Venta (Tarjeta)</option>
                      <option value="Pago Móvil">Pago Móvil</option>
                      <option value="Transferencia">Transferencia</option>
                      <option value="Binance">Binance</option>
                      <option value="Crédito/Fiado">Crédito/Fiado</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium mb-1 block">N° de Referencia</label>
                    <input 
                      type="text" 
                      value={renovarReference} 
                      onChange={e => setRenovarReference(e.target.value)} 
                      placeholder="Opcional..."
                      className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded p-2 text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-4">
                <button type="button" onClick={() => setShowRenovarModal(null)} className="px-4 py-2 text-sm bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:bg-white/10 rounded transition">Cancelar</button>
                <button type="submit" className="px-4 py-2 text-sm bg-green-500 text-white font-bold rounded hover:bg-green-600 transition shadow-lg shadow-green-500/20">Confirmar y Cobrar</button>
              </div>
            </form>
          </div>
        </div>
      )}

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
                className="text-xs bg-green-500 text-white border border-green-600 px-2 py-1 rounded hover:bg-green-600 font-bold transition flex items-center gap-1"
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
                      onClick={() => isExpired && openRenovarModal(a)}
                      disabled={!isExpired}
                      className={`flex-1 md:w-full px-3 py-2 rounded transition text-xs font-medium flex items-center justify-center gap-1 ${
                        isExpired 
                          ? 'bg-green-500 hover:bg-green-600 text-white' 
                          : 'bg-black/5 dark:bg-white/5 text-muted-foreground opacity-50 cursor-not-allowed'
                      }`}
                    >
                      <DollarSign className="h-3 w-3" /> Renovar
                    </button>
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
