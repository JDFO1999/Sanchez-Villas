"use client"
import { FullScreenLoader, ProgressiveRouteLoader } from "@/components/ui/loader"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useSettings } from "@/lib/settings-context"
import { useAuth } from "@/lib/auth-context"
import {
  Dumbbell,
  Unplug,
  Home,
  Users,
  CreditCard,
  Store,
  BarChart3,
  MessageSquare,
  Menu,
  X,
  Moon,
  Sun,
  Settings,
  ScanLine,
  Tag,
  User as UserIcon
} from "lucide-react"
import { useTheme } from "next-themes"
import { Footer } from "./footer"
import { BcvRateBadge } from "@/components/ui/bcv-rate-badge"

const navItems = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Atletas", href: "/atletas", icon: Users },
  { name: "Membresías", href: "/membresias", icon: CreditCard },
  { name: "Tienda", href: "/tienda", icon: Store },
  { name: "Comunidad", href: "/comunidad", icon: MessageSquare },
]

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const pathname = usePathname()

  // Cerrar automáticamente la barra lateral en móviles al cambiar de ruta
  useEffect(() => {
    setSidebarOpen(false)
  }, [pathname])

  // Bloquear el scroll del fondo cuando la barra lateral móvil está abierta
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [sidebarOpen])

  useEffect(() => {
    const stored = localStorage.getItem('gympro_sidebar_collapsed')
    if (stored === 'true') {
      setIsSidebarCollapsed(true)
    }
  }, [])

  const toggleSidebarCollapse = () => {
    const newState = !isSidebarCollapsed
    setIsSidebarCollapsed(newState)
    localStorage.setItem('gympro_sidebar_collapsed', String(newState))
  }
  const { theme, setTheme } = useTheme()
  const { user, isLoading, logout, isLoggingOut } = useAuth()
  const { settings } = useSettings()
  const router = useRouter()
  const [navImgError, setNavImgError] = useState(false)

  useEffect(() => {
    setNavImgError(false)
  }, [user?.profilePicture])

  const isAuthOrPublicPage = 
    pathname === '/' ||
    pathname === '/inicio' ||
    pathname === '/login' ||
    pathname === '/registro' ||
    pathname === '/recuperar-password' ||
    pathname === '/olvide-password' ||
    pathname.startsWith('/recuperar-password') ||
    pathname.startsWith('/olvide-password')

  useEffect(() => {
    if (!isLoading && !user && !isAuthOrPublicPage) {
      router.push('/login')
    }
  }, [user, isLoading, isAuthOrPublicPage, router])

  // Páginas estrictamente públicas (login, registro, landing /inicio, recuperación de contraseña):
  // Se renderizan de inmediato sin esperar la carga de sesión
  if (
    pathname === '/login' ||
    pathname === '/registro' ||
    pathname === '/inicio' ||
    pathname.startsWith('/recuperar-password') ||
    pathname.startsWith('/olvide-password')
  ) {
    return <>{children}</>
  }

  // En '/' y rutas privadas esperamos que finalice la validación de sesión
  if (isLoading) return <FullScreenLoader text="Iniciando..." progressive={true} />

  // Si en '/' no hay usuario autenticado tras cargar sesión, mostrar landing promocional sin barra lateral
  if (pathname === '/' && !user) {
    return <>{children}</>
  }

  const customRole = settings?.customRoles?.find(
    (r: any) => r.id === user?.role || r.name?.toLowerCase() === user?.role?.toLowerCase()
  )
  const effectivePermissions = Array.from(
    new Set([...(user?.permissions || []), ...(customRole?.permissions || [])])
  )
  const hasPermission = (perm: string) => effectivePermissions.includes(perm as any)

  const getRoleLabel = (role?: string | null) => {
    if (!role) return ""
    switch (role.toLowerCase()) {
      case "admin":
        return "Administrador"
      case "gerente":
        return "Gerente"
      case "coach":
      case "employee":
        return "Entrenador"
      case "cajero":
        return "Cajero"
      case "recepcion":
        return "Recepción"
      case "athlete":
        return "Atleta"
      default:
        return role
    }
  }

  let currentNavItems: Array<{ name: string; href: string; icon: any }> = []

  if (user?.role === 'admin') {
    // Administrador: acceso total e irrestricto por defecto
    currentNavItems = [
      ...navItems,
      { name: "Planes / Promos", href: "/planes", icon: Tag },
      { name: "Entrenadores", href: "/entrenadores", icon: Dumbbell },
      { name: "Asistencia", href: "/asistencia", icon: ScanLine },
      { name: "Empleados", href: "/empleados", icon: Users },
      { name: "Finanzas", href: "/finanzas", icon: BarChart3 },
      { name: "Ajustes", href: "/ajustes", icon: Settings },
      { name: "Mi Perfil", href: "/perfil", icon: UserIcon },
    ]
  } else if (user?.role === 'athlete') {
    currentNavItems = [
      { name: "Mi Progreso", href: "/", icon: Home },
      { name: "Rutina", href: "/rutina", icon: Dumbbell },
      { name: "Mi Perfil", href: `/atletas/${user.id}`, icon: Users },
      { name: "Comunidad", href: "/comunidad", icon: MessageSquare },
    ]
  } else if (user?.role === 'coach' || user?.role === 'employee') {
    currentNavItems = [
      { name: "Panel Principal", href: "/", icon: Home },
      { name: "Mi Perfil", href: "/perfil", icon: UserIcon },
      { name: "Mis Atletas", href: "/atletas", icon: Users },
    ]
    if ((user as any)?.canManageAttendance || hasPermission('CRM_MANAGE')) {
      currentNavItems.push({ name: "Asistencia", href: "/asistencia", icon: ScanLine })
    }
    if (hasPermission('CRM_MANAGE')) {
      currentNavItems.push({ name: "Membresías", href: "/membresias", icon: CreditCard })
    }
    if (hasPermission('POS_ACCESS') || hasPermission('INVENTORY_MANAGE')) {
      currentNavItems.push({ name: "Tienda (POS)", href: "/tienda", icon: Store })
    }
    currentNavItems.push({ name: "Comunidad", href: "/comunidad", icon: MessageSquare })
  } else {
    // Gerente, Cajero, Recepción y demás personal:
    // Solo ven los módulos que tengan explícitamente habilitados en sus permisos
    currentNavItems = [
      { name: "Dashboard", href: "/", icon: Home },
    ]

    // Atletas (CRM)
    if (user?.role === 'employee' || user?.role === 'recepcion' || user?.role === 'gerente' || hasPermission('CRM_MANAGE')) {
      currentNavItems.push({ name: "Atletas", href: "/atletas", icon: Users })
    }

    // Membresías
    if (user?.role === 'cajero' || user?.role === 'recepcion' || user?.role === 'gerente' || hasPermission('POS_ACCESS') || hasPermission('CRM_MANAGE')) {
      currentNavItems.push({ name: "Membresías", href: "/membresias", icon: CreditCard })
    }

    // Planes y Promociones (Gerente o permisos de gestión comercial/ajustes)
    if (user?.role === 'gerente' || hasPermission('SETTINGS_MANAGE') || hasPermission('CRM_MANAGE')) {
      currentNavItems.push({ name: "Planes / Promos", href: "/planes", icon: Tag })
    }

    // Tienda / POS
    if (user?.role === 'cajero' || user?.role === 'recepcion' || user?.role === 'gerente' || hasPermission('POS_ACCESS') || hasPermission('INVENTORY_MANAGE')) {
      currentNavItems.push({ name: "Tienda (POS)", href: "/tienda", icon: Store })
    }

    // Asistencia
    if (user?.role === 'cajero' || user?.role === 'recepcion' || user?.role === 'gerente' || (user as any)?.canManageAttendance || hasPermission('CRM_MANAGE')) {
      currentNavItems.push({ name: "Asistencia", href: "/asistencia", icon: ScanLine })
    }

    // Entrenadores (requiere STAFF_MANAGE o CRM_MANAGE)
    if (hasPermission('STAFF_MANAGE') || hasPermission('CRM_MANAGE')) {
      currentNavItems.push({ name: "Entrenadores", href: "/entrenadores", icon: Dumbbell })
    }

    // Empleados y nómina (requiere STAFF_MANAGE)
    if (hasPermission('STAFF_MANAGE')) {
      currentNavItems.push({ name: "Empleados", href: "/empleados", icon: Users })
    }

    // Finanzas (requiere FINANCE_MANAGE o FINANCE_VIEW)
    if (hasPermission('FINANCE_MANAGE') || hasPermission('FINANCE_VIEW')) {
      currentNavItems.push({ name: "Finanzas", href: "/finanzas", icon: BarChart3 })
    }

    // Ajustes globales (requiere SETTINGS_MANAGE)
    if (hasPermission('SETTINGS_MANAGE')) {
      currentNavItems.push({ name: "Ajustes", href: "/ajustes", icon: Settings })
    }

    // Comunidad
    currentNavItems.push({ name: "Comunidad", href: "/comunidad", icon: MessageSquare })

    // Mi Perfil para personal administrativo y gerencia
    if (user?.role === 'gerente' || user?.role === 'cajero' || user?.role === 'recepcion' || user?.role === 'employee') {
      currentNavItems.push({ name: "Mi Perfil", href: "/perfil", icon: UserIcon })
    }
  }

  const LogoComponent = () => (
    <Link 
      href="/inicio" 
      title="Ver Página Principal Promocional"
      className="flex items-center gap-2.5 font-bold text-xl text-primary hover:opacity-85 transition group py-1"
      style={{
        margin: settings.logoSettings?.marginNavbar ? `${settings.logoSettings.marginNavbar}px` : undefined,
      }}
    >
      {settings.logoSettings?.showInNavbar && (
        (settings.logoUrl || settings.logoUrlDark) ? (
          <img
            src={(theme === 'dark' && settings.logoUrlDark) ? settings.logoUrlDark : (settings.logoUrl || settings.logoUrlDark)}
            alt="Logo"
            style={{
              width: settings.logoSettings.widthNavbar || 40,
              height: settings.logoSettings.heightNavbar || 40,
              objectFit: settings.logoSettings.objectFit || 'contain',
              padding: settings.logoSettings?.paddingNavbar ? `${settings.logoSettings.paddingNavbar}px` : undefined,
              maxWidth: '100%',
              maskImage: settings.logoSettings.fadeEffect ? 'linear-gradient(to bottom, black 50%, transparent 100%)' : 'none',
              WebkitMaskImage: settings.logoSettings.fadeEffect ? 'linear-gradient(to bottom, black 50%, transparent 100%)' : 'none'
            }}
            className="transition-transform group-hover:scale-105 shrink-0"
          />
        ) : (
          <div 
            className="rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center font-black text-primary transition-transform group-hover:scale-105 shrink-0 shadow-sm"
            style={{ 
              width: settings.logoSettings?.widthNavbar || 40, 
              height: settings.logoSettings?.heightNavbar || 40,
              fontSize: Math.max(14, (settings.logoSettings?.heightNavbar || 40) * 0.45),
              padding: settings.logoSettings?.paddingNavbar ? `${settings.logoSettings.paddingNavbar}px` : undefined
            }} 
          >
            {(settings.appName || 'M').charAt(0).toUpperCase()}
          </div>
        )
      )}
      {settings.logoSettings?.showNameInNavbar && settings.appName && (
        <span className="truncate leading-tight">{settings.appName}</span>
      )}
    </Link>
  )

  return (
    <div className="flex h-screen overflow-hidden print:overflow-visible bg-background">
      <ProgressiveRouteLoader />
      {isLoggingOut && <FullScreenLoader text="Cerrando sesión..." progressive={true} />}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`print:hidden fixed inset-y-0 left-0 z-50 bg-card transition-[width,transform] duration-300 ease-in-out ${
          sidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        } ${isSidebarCollapsed ? "w-72 lg:w-16" : "w-72 lg:w-64"} lg:static lg:translate-x-0 h-full max-h-[100dvh] flex flex-col`}
      >
        <div className="absolute right-0 top-0 w-[1px] h-full bg-gradient-to-b from-transparent via-black/70 dark:via-primary/50 to-transparent"></div>
        <div className="flex flex-col h-full overflow-hidden">
          <div className={`flex items-center min-h-[4rem] py-2 relative gap-2 shrink-0 ${isSidebarCollapsed ? 'justify-between lg:justify-center px-4 lg:px-0' : 'justify-between px-4'}`}>
            <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-black/70 dark:via-primary/50 to-transparent"></div>
            
            {/* Solo se oculta el Logo en escritorio cuando la barra está colapsada; en móvil SIEMPRE visible */}
            <div className={`flex-1 min-w-0 transition-all duration-300 flex items-center ${isSidebarCollapsed ? 'lg:hidden' : ''}`}>
              <LogoComponent />
            </div>

            <button aria-label="Expandir o colapsar menú" className={`hidden lg:flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5 rounded-lg p-2 transition-colors shrink-0 ${isSidebarCollapsed ? 'mx-auto' : ''}`}
              onClick={toggleSidebarCollapse}
              title={isSidebarCollapsed ? "Expandir menú" : "Colapsar menú"}
            >
              <Menu className="h-5 w-5" />
            </button>
            <button
              aria-label="Cerrar menú"
              className="lg:hidden text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5 p-2 rounded-lg transition-colors cursor-pointer touch-manipulation"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="flex flex-col flex-1 justify-between py-4 px-2 overflow-y-auto overscroll-contain touch-auto">
            <nav className="space-y-1">
              {currentNavItems.map((item) => {
                const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    aria-current={isActive ? "page" : undefined}
                    className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                      isActive
                        ? "bg-primary/15 text-primary font-bold shadow-sm shadow-primary/10 border border-primary/25 before:absolute before:left-0 before:top-2 before:bottom-2 before:w-1.5 before:rounded-r-full before:bg-primary"
                        : "text-muted-foreground hover:bg-muted/80 hover:text-foreground hover:translate-x-0.5"
                    }`}
                  >
                    <item.icon className={`h-5 w-5 shrink-0 transition-transform group-hover:scale-110 ${isActive ? 'text-primary' : ''}`} />
                    <span className={`transition-all duration-300 whitespace-nowrap ${isSidebarCollapsed ? "lg:sr-only" : "opacity-100 w-auto"}`}>
                      {item.name}
                    </span>

                    {/* Tooltip flotante enriquecido cuando la barra está colapsada (SOLO en pantallas grandes) */}
                    {isSidebarCollapsed && (
                      <span className="hidden lg:block absolute left-full ml-3 px-2.5 py-1.5 bg-card/95 text-foreground text-xs font-semibold rounded-lg shadow-xl border border-border whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity z-50 backdrop-blur-md">
                        {item.name}
                      </span>
                    )}
                  </Link>
                )
              })}
            </nav>

            <div className={`pt-4 border-t border-black/10 dark:border-white/10 flex flex-col gap-3 pb-8 lg:pb-2 ${isSidebarCollapsed ? 'lg:items-center' : ''}`}>
              <div className={`flex items-center ${isSidebarCollapsed ? 'lg:justify-center justify-between px-1' : 'justify-between px-1'}`}>
                <span className={`text-sm text-muted-foreground font-medium ${isSidebarCollapsed ? 'lg:hidden' : ''}`}>Tema</span>
                <button
                  aria-label="Cambiar tema"
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  className="p-2 rounded-xl bg-black/5 dark:bg-white/10 text-foreground hover:text-primary hover:bg-primary/10 transition-colors cursor-pointer"
                  title="Cambiar tema"
                >
                  {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                </button>
              </div>
              <button
                onClick={() => {
                  setSidebarOpen(false)
                  logout()
                }}
                className={`text-sm text-destructive hover:text-destructive/80 font-medium flex items-center gap-2 px-1 py-1 rounded-lg hover:bg-destructive/10 transition-colors cursor-pointer ${isSidebarCollapsed ? 'lg:justify-center' : 'text-left'}`}
                title="Cerrar sesión"
              >
                <Unplug className="h-5 w-5 shrink-0" />
                <span className={`transition-all duration-300 whitespace-nowrap ${isSidebarCollapsed ? "lg:sr-only" : "opacity-100 w-auto"}`}>
                  Cerrar Sesión
                </span>
              </button>
            </div>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="flex items-center justify-between h-16 px-2 sm:px-6 relative bg-card z-30">
          <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-black/70 dark:via-primary/50 to-transparent"></div>
          
          {/* Botón de Menú hamburguesa (z-20 relativo para estar siempre libre de bloqueos) */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0 relative z-20">
            <button
              aria-label="Abrir menú lateral"
              className="lg:hidden text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5 p-2 rounded-lg transition-colors cursor-pointer touch-manipulation"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>

          {/* Tasa Oficial BCV / Divisas centrada en el Navbar (con contenedor seguro que no bloquea clics laterales) */}
          <div className="flex-1 flex justify-center items-center px-1 sm:px-2 min-w-0 relative z-10 pointer-events-auto overflow-hidden">
            <BcvRateBadge />
          </div>

          {user && (
            <div className="flex items-center gap-2 sm:gap-3 shrink-0 relative z-20">
              <Link
                href={user.role !== 'athlete' ? '/perfil' : `/atletas/${user.id}`}
                className="flex items-center gap-2 sm:gap-2.5 p-1 sm:p-1.5 sm:pr-3 rounded-xl bg-black/5 hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10 transition-colors border border-black/5 dark:border-white/5"
                title="Ver Perfil"
              >
                {user.profilePicture && !navImgError ? (
                  <img
                    src={user.profilePicture}
                    alt={user.name}
                    className="w-8 h-8 rounded-full object-cover border border-primary/50"
                    onError={() => setNavImgError(true)}
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-primary/20 text-primary font-bold flex items-center justify-center text-xs border border-primary/30">
                    {user.name?.charAt(0) || "U"}
                  </div>
                )}
                <div className="hidden sm:flex flex-col text-left">
                  <span className="text-xs font-bold leading-tight text-foreground truncate max-w-[120px]">{user.name}</span>
                  <span className="text-[10px] text-muted-foreground uppercase font-semibold">{getRoleLabel(user.role)}</span>
                </div>
              </Link>
            </div>
          )}
        </header>

        <main className="flex-1 overflow-y-auto flex flex-col">
          <div className="flex-1 p-4 lg:p-8">
            {children}
          </div>
          <Footer />
        </main>
      </div>
    </div>
  )
}
