"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { Check, Dumbbell, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { athleteService } from "@/lib/data-service"

export default function RegistroPage() {
  const { registerAthlete, login } = useAuth()
  const router = useRouter()
  
  const [nombre, setNombre] = useState("")
  const [cedula, setCedula] = useState("")
  const [telefono, setTelefono] = useState("")
  const [direccion, setDireccion] = useState("")
  const [clave, setClave] = useState("")
  const [confirmClave, setConfirmClave] = useState("")
  const [genero, setGenero] = useState<'M' | 'F'>('M')
  const [entrenador, setEntrenador] = useState("2") 
  
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const claveMatch = clave && confirmClave && clave === confirmClave

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (clave !== confirmClave) {
      setError("Las contraseñas no coinciden.")
      return
    }
    
    setIsLoading(true)

    setTimeout(() => {
      const newUser = registerAthlete(cedula, clave, { name: nombre })
      if (!newUser) {
        setError("La cédula ya está registrada.")
        setIsLoading(false)
        return
      }

      const today = new Date()
      const end = new Date()
      end.setMonth(end.getMonth() + 1)
      
      athleteService.updateAthlete({
        id: newUser.id,
        cedula: cedula,
        name: nombre,
        gender: genero,
        coachId: entrenador,
        phone: telefono,
        address: direccion,
        membershipStart: today.toISOString().split("T")[0],
        membershipEnd: end.toISOString().split("T")[0],
        attendancePercentage: 0,
        biometrics: []
      })

      login(cedula, clave)
      router.push("/")
    }, 800)
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative p-4 overflow-hidden">
      <div className="absolute inset-0 z-0 bg-black">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-black to-black opacity-60" />
      </div>

      <div className="z-10 w-full max-w-lg glass p-8 rounded-2xl flex flex-col items-center">
        <div className="w-full mb-4">
          <Link href="/login" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition">
            <ArrowLeft className="h-4 w-4 mr-1" /> Volver
          </Link>
        </div>

        <div className="h-12 w-12 bg-primary/20 rounded-full flex items-center justify-center mb-4">
          <Dumbbell className="h-6 w-6 text-primary" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Únete a GymPro</h1>
        <p className="text-muted-foreground mb-6 text-center text-sm">
          Crea tu cuenta de atleta y selecciona a tu entrenador
        </p>

        {error && (
          <div className="w-full p-3 mb-6 bg-red-500/10 border border-red-500/50 text-red-500 text-sm rounded-lg text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="w-full space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 md:col-span-1">
              <label className="text-xs font-medium text-foreground mb-1 block">Nombre Completo</label>
              <input type="text" value={nombre} onChange={e => setNombre(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-sm focus:border-primary" placeholder="Ej. Pedro Pérez" required />
            </div>
            <div className="col-span-2 md:col-span-1">
              <label className="text-xs font-medium text-foreground mb-1 block">Cédula</label>
              <input type="text" value={cedula} onChange={e => setCedula(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-sm focus:border-primary" placeholder="12345678" required />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 md:col-span-1">
              <label className="text-xs font-medium text-foreground mb-1 block">Teléfono / WhatsApp</label>
              <input type="text" value={telefono} onChange={e => setTelefono(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-sm focus:border-primary" placeholder="+57 300 000 0000" required />
            </div>
            <div className="col-span-2 md:col-span-1">
              <label className="text-xs font-medium text-foreground mb-1 block">Dirección</label>
              <input type="text" value={direccion} onChange={e => setDireccion(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-sm focus:border-primary" placeholder="Tu dirección" required />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-foreground mb-1 block">Contraseña</label>
              <input type="password" value={clave} onChange={e => setClave(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-sm focus:border-primary" placeholder="••••••••" required />
            </div>
            <div className="relative">
              <label className="text-xs font-medium text-foreground mb-1 block">Confirmar Contraseña</label>
              <input type="password" value={confirmClave} onChange={e => setConfirmClave(e.target.value)} className={`w-full bg-white/5 border rounded-lg p-3 text-sm focus:outline-none transition-all ${confirmClave ? (claveMatch ? 'border-green-500/50 focus:border-green-500' : 'border-red-500/50 focus:border-red-500') : 'border-white/10 focus:border-primary'}`} placeholder="••••••••" required />
              {claveMatch && <Check className="absolute right-3 top-9 h-4 w-4 text-green-500" />}
              {confirmClave && !claveMatch && <span className="text-[10px] text-red-500 absolute -bottom-4 left-0">No coinciden</span>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-2">
            <div>
              <label className="text-xs font-medium text-foreground mb-1 block">Género</label>
              <select value={genero} onChange={e => setGenero(e.target.value as 'M'|'F')} className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-sm focus:border-primary">
                <option value="M">Masculino</option>
                <option value="F">Femenino</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-foreground mb-1 block">Entrenador</label>
              <select value={entrenador} onChange={e => setEntrenador(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-sm focus:border-primary">
                <option value="2">Carlos (Staff)</option>
              </select>
            </div>
          </div>

          <button type="submit" disabled={isLoading || (!!confirmClave && !claveMatch)} className="w-full bg-primary text-primary-foreground font-bold py-3.5 rounded-xl hover:bg-primary/90 transition shadow-lg shadow-primary/20 flex items-center justify-center mt-6 disabled:opacity-50">
            {isLoading ? <Dumbbell className="h-5 w-5 animate-spin" /> : "Completar Registro"}
          </button>
        </form>
      </div>
    </div>
  )
}
