"use client"

import React, { useEffect, useState, useRef } from "react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import {
  Bell,
  X,
  Dumbbell,
  Cake,
  MessageSquare,
  Trophy,
  Clock,
  CheckCircle2,
  ExternalLink,
  Volume2
} from "lucide-react"
import {
  getMyNotificationsAction,
  markNotificationReadAction,
  markAllNotificationsReadAction,
  savePushSubscriptionAction
} from "@/app/actions/notifications"

// Sintetizador Web Audio API para el sonido de notificación estilo WhatsApp
function playWhatsAppChime() {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext
    if (!AudioContext) return
    const ctx = new AudioContext()
    
    // Tono 1 (880 Hz - La5)
    const osc1 = ctx.createOscillator()
    const gain1 = ctx.createGain()
    osc1.type = "sine"
    osc1.frequency.setValueAtTime(880, ctx.currentTime)
    gain1.gain.setValueAtTime(0, ctx.currentTime)
    gain1.gain.linearRampToValueAtTime(0.25, ctx.currentTime + 0.02)
    gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12)
    osc1.connect(gain1)
    gain1.connect(ctx.destination)
    osc1.start(ctx.currentTime)
    osc1.stop(ctx.currentTime + 0.12)

    // Tono 2 (1320 Hz - Mi6)
    const osc2 = ctx.createOscillator()
    const gain2 = ctx.createGain()
    osc2.type = "sine"
    osc2.frequency.setValueAtTime(1320, ctx.currentTime + 0.08)
    gain2.gain.setValueAtTime(0, ctx.currentTime + 0.08)
    gain2.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.1)
    gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.28)
    osc2.connect(gain2)
    gain2.connect(ctx.destination)
    osc2.start(ctx.currentTime + 0.08)
    osc2.stop(ctx.currentTime + 0.28)
  } catch (_) {}
}

export function WhatsAppNotificationManager() {
  const { user } = useAuth()
  const router = useRouter()

  const [activeBanner, setActiveBanner] = useState<any | null>(null)
  const [unreadCount, setUnreadCount] = useState(0)
  const [notifications, setNotifications] = useState<any[]>([])
  const [showDrawer, setShowDrawer] = useState(false)
  const [permissionRequested, setPermissionRequested] = useState(false)
  const [pushEnabled, setPushEnabled] = useState(false)

  const lastSeenIdRef = useRef<string | null>(null)
  const isPollingRef = useRef(false)

  useEffect(() => {
    const handleOpen = () => {
      setShowDrawer(true)
      fetchNotifications()
    }
    window.addEventListener("open_notifications_drawer", handleOpen)
    return () => window.removeEventListener("open_notifications_drawer", handleOpen)
  }, [user])

  // 1. Inicializar Service Worker y verificar permisos Push
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return

    if ("Notification" in window) {
      if (Notification.permission === "granted") {
        setPushEnabled(true)
        registerAndSubscribePush()
      } else if (Notification.permission === "default") {
        const dismissed = localStorage.getItem("maxfit_push_prompt_dismissed")
        if (!dismissed) {
          // Mostrar aviso tras 5 segundos de navegación
          const t = setTimeout(() => setPermissionRequested(true), 5000)
          return () => clearTimeout(t)
        }
      }
    }
  }, [user])

  const registerAndSubscribePush = async () => {
    try {
      if (!("serviceWorker" in navigator) || !("PushManager" in window)) return
      const reg = await navigator.serviceWorker.ready
      
      const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "BItGbsbYuo0lJGgDmQiFduYnhxUTVjvD8pzNXdPGLJBt-znJPCzFFfvZnhktMLN6hyQPtLlYdCJT89cO4x2gFNk"
      
      let sub = await reg.pushManager.getSubscription()
      if (!sub) {
        // Convertir key VAPID
        const padding = "=".repeat((4 - (vapidKey.length % 4)) % 4)
        const base64 = (vapidKey + padding).replace(/-/g, "+").replace(/_/g, "/")
        const rawData = window.atob(base64)
        const outputArray = new Uint8Array(rawData.length)
        for (let i = 0; i < rawData.length; ++i) {
          outputArray[i] = rawData.charCodeAt(i)
        }

        sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: outputArray
        })
      }

      if (sub && user) {
        const p256dh = sub.getKey ? btoa(String.fromCharCode.apply(null, Array.from(new Uint8Array(sub.getKey("p256dh")!)))) : ""
        const auth = sub.getKey ? btoa(String.fromCharCode.apply(null, Array.from(new Uint8Array(sub.getKey("auth")!)))) : ""

        await savePushSubscriptionAction({
          endpoint: sub.endpoint,
          p256dh,
          auth
        })
        setPushEnabled(true)
      }
    } catch (err) {
      console.warn("No se pudo completar la suscripción push:", err)
    }
  }

  const handleEnablePush = async () => {
    setPermissionRequested(false)
    if (!("Notification" in window)) return
    try {
      const perm = await Notification.requestPermission()
      if (perm === "granted") {
        setPushEnabled(true)
        await registerAndSubscribePush()
        // Mostrar notificación de bienvenida de prueba estilo WhatsApp
        playWhatsAppChime()
        if (navigator.vibrate) navigator.vibrate([150, 75, 150])
        setActiveBanner({
          id: "welcome_push",
          title: "✅ Notificaciones Activadas",
          message: "A partir de ahora recibirás alertas de tus rutinas, membresías y comunidad en tu teléfono.",
          type: "GENERAL",
          url: "/"
        })
      } else {
        localStorage.setItem("maxfit_push_prompt_dismissed", "true")
      }
    } catch (_) {}
  }

  // 2. Polling periódico de notificaciones cada 25s
  const fetchNotifications = async () => {
    if (!user || isPollingRef.current) return
    isPollingRef.current = true
    try {
      const res = await getMyNotificationsAction()
      if (res.success && res.notifications) {
        setNotifications(res.notifications)
        setUnreadCount(res.unreadCount || 0)

        // Detectar si hay una notificación nueva sin leer para mostrar el banner
        const newest = res.notifications[0]
        if (newest && !newest.read) {
          const storedLastId = sessionStorage.getItem("maxfit_last_notif_id")
          if (newest.id !== storedLastId && newest.id !== lastSeenIdRef.current) {
            lastSeenIdRef.current = newest.id
            sessionStorage.setItem("maxfit_last_notif_id", newest.id)

            // Disparar sonido y vibración tipo WhatsApp
            playWhatsAppChime()
            if (typeof navigator !== "undefined" && navigator.vibrate) {
              navigator.vibrate([180, 80, 180])
            }

            setActiveBanner(newest)
          }
        }
      }
    } catch (_) {}
    finally {
      isPollingRef.current = false
    }
  }

  useEffect(() => {
    if (!user) return
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 25000)
    return () => clearInterval(interval)
  }, [user])

  // Temporizador para auto-ocultar el banner a los 7 segundos
  useEffect(() => {
    if (!activeBanner) return
    const t = setTimeout(() => {
      setActiveBanner(null)
    }, 7000)
    return () => clearTimeout(t)
  }, [activeBanner])

  const handleBannerClick = async () => {
    if (!activeBanner) return
    if (activeBanner.id !== "welcome_push") {
      await markNotificationReadAction(activeBanner.id)
    }
    const targetUrl = activeBanner.url || "/"
    setActiveBanner(null)
    router.push(targetUrl)
  }

  const getNotifIcon = (type: string) => {
    switch (type) {
      case "ROUTINE":
        return <Dumbbell className="w-5 h-5 text-amber-400" />
      case "DIET":
        return <Volume2 className="w-5 h-5 text-emerald-400" />
      case "POST":
        return <MessageSquare className="w-5 h-5 text-sky-400" />
      case "BIRTHDAY":
        return <Cake className="w-5 h-5 text-rose-400" />
      case "RANKING":
        return <Trophy className="w-5 h-5 text-amber-300" />
      case "MEMBERSHIP_EXPIRING":
        return <Clock className="w-5 h-5 text-amber-500" />
      case "MEMBERSHIP_ACTIVATED":
        return <CheckCircle2 className="w-5 h-5 text-emerald-500" />
      default:
        return <Bell className="w-5 h-5 text-primary" />
    }
  }

  if (!user) return null

  return (
    <>
      {/* 1. Banner Flotante Heads-up estilo Notificación de WhatsApp */}
      {activeBanner && (
        <aside
          role="alert"
          aria-live="assertive"
          className="fixed top-3 left-3 right-3 sm:left-auto sm:right-6 sm:w-[400px] z-[999999] animate-in slide-in-from-top-4 duration-300 pointer-events-auto"
        >
          <div
            onClick={handleBannerClick}
            className="cursor-pointer bg-[#18181b]/95 dark:bg-[#121214]/95 text-white border-2 border-primary/40 hover:border-primary shadow-[0_12px_36px_rgba(0,0,0,0.65)] backdrop-blur-2xl rounded-2xl p-3.5 transition-all active:scale-[0.98] group relative flex items-start gap-3.5"
          >
            {/* Indicador superior tipo mensajería móvil */}
            <div className="absolute top-2 right-10 flex items-center gap-1.5 text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block" />
              <span>Mensaje • Ahora</span>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation()
                setActiveBanner(null)
              }}
              className="absolute top-2.5 right-2.5 p-1 rounded-lg text-zinc-400 hover:text-white transition"
              title="Cerrar"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Avatar / Icono */}
            <div className="w-11 h-11 rounded-2xl bg-black/40 border border-primary/40 flex items-center justify-center shrink-0 shadow-inner mt-0.5">
              {getNotifIcon(activeBanner.type)}
            </div>

            {/* Contenido del Mensaje */}
            <div className="min-w-0 flex-1 pr-6">
              <h4 className="font-extrabold text-sm text-white tracking-tight flex items-center gap-1.5">
                <span className="truncate">{activeBanner.title}</span>
              </h4>
              <p className="text-xs text-zinc-300 mt-1 line-clamp-2 leading-relaxed">
                {activeBanner.message}
              </p>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-primary mt-1.5 group-hover:underline">
                <span>Tocar para abrir</span>
                <ExternalLink className="w-3 h-3" />
              </span>
            </div>
          </div>
        </aside>
      )}

      {/* 2. Banner discreto de activación de notificaciones móviles */}
      {permissionRequested && !pushEnabled && (
        <aside
          role="dialog"
          aria-label="Permisos de notificación"
          className="fixed bottom-20 lg:bottom-6 left-3 right-3 sm:left-auto sm:right-6 sm:w-[380px] z-[99998] animate-in slide-in-from-bottom-4 duration-300"
        >
          <div className="bg-card/95 border-2 border-emerald-500/50 rounded-2xl p-4 shadow-2xl glass text-foreground flex flex-col gap-2.5">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <Bell className="w-4 h-4 animate-bounce" />
                </div>
                <div>
                  <h4 className="font-black text-sm text-foreground">Alertas tipo WhatsApp</h4>
                  <p className="text-[11px] text-muted-foreground">En tu móvil al instante</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setPermissionRequested(false)
                  localStorage.setItem("maxfit_push_prompt_dismissed", "true")
                }}
                className="text-muted-foreground hover:text-foreground p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-muted-foreground leading-snug">
              Recibe avisos de tus rutinas, activación de membresías, cumpleaños y puestos de ranking en tu teléfono.
            </p>
            <div className="flex items-center gap-2 mt-1">
              <button
                onClick={handleEnablePush}
                className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-black font-extrabold text-xs py-2 px-3 rounded-xl transition active:scale-95 shadow-md flex items-center justify-center gap-1.5"
              >
                <span>Activar en este móvil</span>
              </button>
              <button
                onClick={() => {
                  setPermissionRequested(false)
                  localStorage.setItem("maxfit_push_prompt_dismissed", "true")
                }}
                className="text-xs font-semibold text-muted-foreground hover:text-foreground px-3 py-2"
              >
                Ahora no
              </button>
            </div>
          </div>
        </aside>
      )}

      {/* 3. Cajón de Notificaciones (Historial) */}
      {showDrawer && (
        <div className="fixed inset-0 z-[99999] flex justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="w-full max-w-sm bg-card h-full shadow-2xl border-l border-border flex flex-col animate-in slide-in-from-right duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header del cajón */}
            <div className="p-4 border-b border-border flex items-center justify-between bg-black/5 dark:bg-black/20">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-primary" />
                <h3 className="font-display font-black text-base uppercase tracking-tight text-foreground">
                  Notificaciones
                </h3>
                {unreadCount > 0 && (
                  <span className="bg-primary text-black font-black text-[10px] px-2 py-0.5 rounded-full">
                    {unreadCount} nuevas
                  </span>
                )}
              </div>
              <button
                onClick={() => setShowDrawer(false)}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Acciones superiores */}
            {notifications.length > 0 && unreadCount > 0 && (
              <div className="px-4 py-2 border-b border-border/50 flex justify-end bg-muted/20">
                <button
                  onClick={async () => {
                    await markAllNotificationsReadAction()
                    setUnreadCount(0)
                    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
                  }}
                  className="text-xs font-bold text-primary hover:underline"
                >
                  Marcar todas como leídas
                </button>
              </div>
            )}

            {/* Lista de mensajes */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {notifications.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-muted-foreground space-y-2">
                  <Bell className="w-12 h-12 stroke-1 text-muted-foreground/40" />
                  <p className="font-bold text-sm">No tienes notificaciones pendientes</p>
                  <p className="text-xs">
                    Aquí aparecerán los avisos de tus rutinas, dietas, avisos del muro y membresías.
                  </p>
                </div>
              ) : (
                notifications.map((item) => (
                  <div
                    key={item.id}
                    onClick={async () => {
                      if (!item.read) {
                        await markNotificationReadAction(item.id)
                        setUnreadCount((c) => Math.max(0, c - 1))
                        setNotifications((prev) =>
                          prev.map((n) => (n.id === item.id ? { ...n, read: true } : n))
                        )
                      }
                      setShowDrawer(false)
                      router.push(item.url || "/")
                    }}
                    className={`p-3 rounded-2xl border transition cursor-pointer flex items-start gap-3 relative ${
                      item.read
                        ? "bg-card hover:bg-muted/30 border-border/60"
                        : "bg-primary/5 hover:bg-primary/10 border-primary/30 shadow-sm"
                    }`}
                  >
                    {!item.read && (
                      <span className="absolute top-3 right-3 w-2 h-2 rounded-full bg-primary" />
                    )}
                    <div className="w-9 h-9 rounded-xl bg-black/5 dark:bg-white/5 border border-border flex items-center justify-center shrink-0 mt-0.5">
                      {getNotifIcon(item.type)}
                    </div>
                    <div className="min-w-0 flex-1 pr-2">
                      <h5 className="font-extrabold text-xs text-foreground truncate">
                        {item.title}
                      </h5>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2 leading-relaxed">
                        {item.message}
                      </p>
                      <span className="text-[10px] text-muted-foreground/80 mt-1 block font-medium">
                        {new Date(item.createdAt).toLocaleDateString("es-ES", {
                          hour: "2-digit",
                          minute: "2-digit",
                          day: "numeric",
                          month: "short"
                        })}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

/**
 * Botón Campana para el Navbar con contador de no leídos
 */
export function NotificationBellButton({ onClick }: { onClick?: () => void }) {
  const { user } = useAuth()
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (!user) return
    const updateCount = async () => {
      try {
        const res = await getMyNotificationsAction()
        if (res.success) {
          setUnreadCount(res.unreadCount || 0)
        }
      } catch (_) {}
    }
    updateCount()
    const int = setInterval(updateCount, 25000)
    return () => clearInterval(int)
  }, [user])

  if (!user) return null

  const handleClick = () => {
    if (onClick) {
      onClick()
    } else {
      window.dispatchEvent(new CustomEvent("open_notifications_drawer"))
    }
  }

  return (
    <button
      onClick={handleClick}
      className="relative p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5 transition"
      title="Notificaciones"
      aria-label="Ver notificaciones"
    >
      <Bell className="w-5 h-5" />
      {unreadCount > 0 && (
        <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-primary text-black font-black text-[10px] rounded-full flex items-center justify-center animate-pulse shadow-md">
          {unreadCount > 9 ? "9+" : unreadCount}
        </span>
      )}
    </button>
  )
}
