"use client"

import { useState, useEffect, useRef } from "react"
import { CheckCircle2, XCircle, Search, Clock, Camera, Key } from "lucide-react"
import { Scanner } from "@yudiel/react-qr-scanner"
import Swal from "sweetalert2"

export default function AsistenciaPage() {
  const [cedula, setCedula] = useState("")
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState("")
  const [athlete, setAthlete] = useState<{name: string, membershipEnd?: Date | string} | null>(null)
  
  const [showScanner, setShowScanner] = useState(false)
  
  const processAttendance = async (query: string, isCedula: boolean) => {
    if (!query) return
    
    // Si es por cédula, requerimos clave de administrador
    if (isCedula) {
      const { value: pin } = await Swal.fire({
        title: 'Validación de Seguridad',
        text: 'Ingreso manual por cédula requiere autorización de Administrador:',
        input: 'password',
        inputPlaceholder: 'Ingrese su PIN...',
        showCancelButton: true,
        confirmButtonText: 'Validar',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#10b981',
      })
      
      if (!pin) return // Cancelado
      
      const { validatePinAction } = await import('@/app/actions/auth')
      const authRes = await validatePinAction(pin)
      
      if (!authRes.success || !authRes.user || authRes.user.role !== 'admin') {
        Swal.fire('Denegado', 'PIN incorrecto o no tiene permisos de Administrador.', 'error')
        return
      }
    }
    
    const { registerAttendance } = await import('@/app/actions/users')
    const res = await registerAttendance(query, isCedula)
    
    if (res.success) {
      setStatus('success')
      setMessage('¡Bienvenido!')
      setAthlete({
        name: (res.user?.name || ""),
        membershipEnd: (res.user?.membershipEnd || "")
      })
    } else {
      setStatus('error')
      setMessage(res.error)
      setAthlete(res.lastDate ? { name: "Membresía Caducada", membershipEnd: res.lastDate } : null)
    }
    
    setCedula("")
    setTimeout(() => {
      setStatus('idle')
      setMessage("")
      setAthlete(null)
    }, 4000)
  }

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    processAttendance(cedula, true)
  }

  const handleQRScan = (detectedCodes: any[]) => {
    if (detectedCodes.length > 0 && detectedCodes[0].rawValue) {
      setShowScanner(false)
      processAttendance(detectedCodes[0].rawValue, false) // false = no es cédula, es ID/QR
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] p-4 relative">
      <h1 className="text-3xl font-black mb-8 text-center bg-gradient-to-r from-primary to-primary/50 bg-clip-text text-transparent">
        Control de Acceso
      </h1>

      <div className="bg-card border border-black/10 dark:border-white/10 rounded-2xl w-full max-w-lg p-8 shadow-2xl glass">
        
        {!showScanner ? (
          <div className="flex flex-col gap-6">
            <button 
              onClick={() => setShowScanner(true)}
              className="w-full bg-primary/20 text-primary hover:bg-primary/30 border border-primary/50 rounded-xl p-6 flex flex-col items-center justify-center gap-3 transition"
            >
              <Camera className="h-12 w-12" />
              <span className="font-bold text-lg">Escanear Código QR</span>
            </button>
            
            <div className="relative flex items-center gap-4">
              <div className="h-px bg-black/10 dark:bg-white/10 flex-1"></div>
              <span className="text-xs text-muted-foreground uppercase font-bold tracking-widest">O ingreso manual</span>
              <div className="h-px bg-black/10 dark:bg-white/10 flex-1"></div>
            </div>

            <form onSubmit={handleManualSubmit} className="flex flex-col gap-2">
              <label className="text-center text-xs text-muted-foreground font-medium flex justify-center items-center gap-1">
                <Key className="h-3 w-3" /> Requiere PIN de Administrador
              </label>
              <div className="relative">
                <input 
                  type="text"
                  value={cedula}
                  onChange={(e) => setCedula(e.target.value)}
                  placeholder="Cédula del atleta..."
                  className="w-full text-center text-xl font-bold bg-black/5 dark:bg-black/40 border-2 border-black/10 dark:border-white/10 rounded-xl p-4 focus:border-primary focus:outline-none transition-colors"
                />
                <button type="submit" className="absolute right-4 top-1/2 -translate-y-1/2 text-primary hover:text-primary/80">
                  <Search className="h-6 w-6" />
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <div className="w-full aspect-square rounded-xl overflow-hidden border-2 border-primary relative">
              <Scanner 
                onScan={handleQRScan}
                formats={["qr_code"]}
              />
            </div>
            <button 
              onClick={() => setShowScanner(false)}
              className="text-sm font-bold text-muted-foreground hover:text-white"
            >
              Cancelar y volver
            </button>
          </div>
        )}

        {status !== 'idle' && (
          <div className={`mt-8 p-6 rounded-xl text-center flex flex-col items-center justify-center animate-in zoom-in duration-300 ${status === 'success' ? 'bg-green-500/10 border-2 border-green-500' : 'bg-red-500/10 border-2 border-red-500'}`}>
            {status === 'success' ? (
              <CheckCircle2 className="h-20 w-20 text-green-500 mb-4" />
            ) : (
              <XCircle className="h-20 w-20 text-red-500 mb-4" />
            )}
            <h2 className={`text-3xl font-black mb-2 ${status === 'success' ? 'text-green-500' : 'text-red-500'}`}>
              {message}
            </h2>
            {athlete && (
              <div className="text-foreground">
                <p className="font-bold text-xl">{athlete.name}</p>
                {athlete.membershipEnd && (
                  <p className="text-sm opacity-80 mt-1 flex items-center justify-center gap-1">
                    <Clock className="h-4 w-4" /> {status === 'success' ? 'Vence:' : 'Venció:'} {new Date(athlete.membershipEnd).toLocaleDateString()}
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
