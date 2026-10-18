"use client"

import { useState, useEffect, useRef } from "react"
import { CheckCircle2, XCircle, Search, Clock, Camera, Key } from "lucide-react"
import { Scanner } from "@yudiel/react-qr-scanner"
import Swal from "sweetalert2"
import { useAuth } from "@/lib/auth-context"
import { swalTheme, themeColor } from "@/lib/confirm"

export default function AsistenciaPage() {
  const { user } = useAuth()
  const [cedula, setCedula] = useState("")
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState("")
  const [athlete, setAthlete] = useState<{name: string, profilePicture?: string | null, membershipEnd?: Date | string} | null>(null)
  
  const [showScanner, setShowScanner] = useState(false)

  if (user && user.role !== 'admin' && user.role !== 'cajero' && user.role !== 'recepcion' && !(user as any)?.canManageAttendance) {
    return (
      <div className="p-8 text-center text-destructive font-bold">
        Acceso Denegado. Solo personal de recepción o entrenadores autorizados por el administrador pueden acceder a la Asistencia.
      </div>
    )
  }
  
  const processAttendance = async (query: string, isCedula: boolean) => {
    if (!query) return
    
    // Si es por cédula, requerimos exclusivamente la clave de la cuenta del Administrador
    if (isCedula) {
      const { value: adminClave } = await Swal.fire({
        title: 'Autorización de Administrador',
        text: 'El ingreso manual por cédula en recepción requiere la clave de Administrador:',
        input: 'password',
        inputPlaceholder: 'Ingrese clave de Administrador...',
        showCancelButton: true,
        confirmButtonText: 'Autorizar',
        cancelButtonText: 'Cancelar',
        ...swalTheme(),
        confirmButtonColor: themeColor('primary') || '#10b981',
      })
      
      if (!adminClave) return // Cancelado
      
      const { validateAdminPasswordAction } = await import('@/app/actions/auth')
      const authRes = await validateAdminPasswordAction(adminClave)
      
      if (!authRes.success || !authRes.user || authRes.user.role !== 'admin') {
        Swal.fire({
          title: 'Denegado',
          text: authRes.error || 'Clave de Administrador incorrecta.',
          icon: 'error',
          ...swalTheme(),
          confirmButtonColor: themeColor('destructive') || '#ef4444',
        })
        return
      }
    }
    
    const { registerAttendance } = await import('@/app/actions/users')
    const res = await registerAttendance(query, isCedula)
    const theme = swalTheme()
    
    if (res.success) {
      setStatus('success')
      setMessage('¡Bienvenido!')
      setAthlete({
        name: (res.user?.name || ""),
        profilePicture: (res.user as any)?.profilePicture || null,
        membershipEnd: (res.user?.membershipEnd || "")
      })
      
      // Beep success (Web Audio API)
      try {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.5, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
        osc.start();
        osc.stop(ctx.currentTime + 0.1);
      } catch(e){}

      const avatarHtml = (res.user as any)?.profilePicture
        ? `<img src="${(res.user as any).profilePicture}" alt="${res.user?.name}" style="width:76px;height:76px;border-radius:9999px;object-fit:cover;margin:0 auto 12px auto;border:3px solid ${themeColor('primary') || '#eab308'};box-shadow: 0 4px 14px rgba(0,0,0,0.15);" />`
        : `<div style="width:72px;height:72px;border-radius:9999px;margin:0 auto 12px auto;background:rgba(234,179,8,0.15);color:${themeColor('primary') || '#eab308'};display:flex;align-items:center;justify-content:center;font-size:28px;font-weight:900;border:2px solid ${themeColor('primary') || '#eab308'};">${(res.user?.name || 'A').charAt(0)}</div>`;

      Swal.fire({
        title: '¡Acceso Concedido!',
        html: `${avatarHtml}<p style="font-size:1.25rem;font-weight:800;margin-bottom:6px;">${res.user?.name}</p><p style="font-size:0.875rem;opacity:0.8;">Vence: <b>${new Date(res.user?.membershipEnd || "").toLocaleDateString()}</b></p>`,
        icon: 'success',
        timer: 3000,
        timerProgressBar: true,
        showConfirmButton: false,
        ...theme,
        customClass: {
          popup: 'border border-black/10 dark:border-white/10 rounded-2xl shadow-2xl glass',
          title: 'font-black text-2xl',
        }
      });
    } else {
      setStatus('error')
      setMessage(res.error ?? "No se pudo registrar la asistencia.")
      setAthlete(res.lastDate || (res as any).user ? {
        name: (res as any).user?.name || "Atleta",
        profilePicture: (res as any).user?.profilePicture || null,
        membershipEnd: res.lastDate
      } : null)
      
      // Beep error (Web Audio API)
      try {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.3);
        gain.gain.setValueAtTime(0.5, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      } catch(e){}

      const expiredAvatarHtml = (res as any).user?.profilePicture
        ? `<img src="${(res as any).user.profilePicture}" alt="${(res as any).user?.name}" style="width:76px;height:76px;border-radius:9999px;object-fit:cover;margin:0 auto 12px auto;border:3px solid ${themeColor('destructive') || '#ef4444'};box-shadow: 0 4px 14px rgba(0,0,0,0.15);" />`
        : `<div style="width:72px;height:72px;border-radius:9999px;margin:0 auto 12px auto;background:rgba(239,68,68,0.15);color:${themeColor('destructive') || '#ef4444'};display:flex;align-items:center;justify-content:center;font-size:28px;font-weight:900;border:2px solid ${themeColor('destructive') || '#ef4444'};">${((res as any).user?.name || 'A').charAt(0)}</div>`;

      Swal.fire({
        title: '¡Acceso Denegado!',
        html: `${expiredAvatarHtml}${(res as any).user?.name ? `<p style="font-size:1.25rem;font-weight:800;margin-bottom:6px;">${(res as any).user.name}</p>` : ''}<p style="font-size:1rem;font-weight:700;color:${themeColor('destructive') || '#ef4444'};">${res.error}</p>${res.lastDate ? `<p style="font-size:0.875rem;opacity:0.8;margin-top:6px;">Venció el: <b>${new Date(res.lastDate).toLocaleDateString()}</b></p>` : ''}`,
        icon: 'error',
        confirmButtonText: 'Entendido',
        ...theme,
        confirmButtonColor: themeColor('destructive') || '#ef4444',
        customClass: {
          popup: 'border border-destructive/30 rounded-2xl shadow-2xl glass',
          title: 'font-black text-2xl text-destructive',
          confirmButton: 'font-bold rounded-xl px-6 py-2.5 shadow-lg'
        }
      });
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
                <Key className="h-3 w-3" /> Requiere Clave de Administrador
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
      </div>
    </div>
  )
}
