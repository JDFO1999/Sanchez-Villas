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
  User as UserIcon
} from "lucide-react"
import { useTheme } from "next-themes"
import { Footer } from "./footer"

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

  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const { user, isLoading, logout } = useAuth()
  const { settings } = useSettings()
  const router = useRouter()
  const [navImgError, setNavImgError] = useState(false)

  useEffect(() => {
    setNavImgError(false)
  }, [user?.profilePicture])

  useEffect(() => {
    if (!isLoading && !user && pathname !== '/' && pathname !== '/inicio' && pathname !== '/login' && pathname !== '/registro') {
      router.push('/login')
    }
  }, [user, isLoading, pathname, router])

  if (isLoading) return <FullScreenLoader text="Iniciando..." />

  if (pathname === '/login' || pathname === '/registro' || pathname === '/inicio' || (pathname === '/' && !user)) {
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
    currentNavItems.push({ name: "Comunidad", href: "/comunidad", icon: MessageSquare })
  } else {
    // Gerente, Cajero, Recepción y demás personal:
    // Solo ven los módulos que tengan explícitamente habilitados en sus permisos
    currentNavItems = [
      { name: "Dashboard", href: "/", icon: Home },
    ]

    // Atletas (CRM)
    if (user?.role === 'employee' || hasPermission('CRM_MANAGE')) {
      currentNavItems.push({ name: "Atletas", href: "/atletas", icon: Users })
    }

    // Membresías
    if (user?.role === 'cajero' || hasPermission('POS_ACCESS') || hasPermission('CRM_MANAGE')) {
      currentNavItems.push({ name: "Membresías", href: "/membresias", icon: CreditCard })
    }

    // Tienda / POS
    if (user?.role === 'cajero' || hasPermission('POS_ACCESS') || hasPermission('INVENTORY_MANAGE')) {
      currentNavItems.push({ name: "Tienda (POS)", href: "/tienda", icon: Store })
    }

    // Asistencia
    if (user?.role === 'cajero' || user?.role === 'recepcion' || (user as any)?.canManageAttendance || hasPermission('CRM_MANAGE')) {
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
          <Dumbbell 
            className="text-primary transition-transform group-hover:scale-110 shrink-0"
            style={{ 
              width: Math.max(24, (settings.logoSettings?.widthNavbar || 40) * 0.75), 
              height: Math.max(24, (settings.logoSettings?.heightNavbar || 40) * 0.75),
              padding: settings.logoSettings?.paddingNavbar ? `${settings.logoSettings.paddingNavbar}px` : undefined
            }} 
          />
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
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`print:hidden fixed inset-y-0 left-0 z-50 bg-card transition-[width,transform] duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] overflow-hidden ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } ${isSidebarCollapsed ? "w-16 lg:w-16" : "w-64"} lg:static lg:translate-x-0`}
      >
        <div className="absolute right-0 top-0 w-[1px] h-full bg-gradient-to-b from-transparent via-black/70 dark:via-primary/50 to-transparent"></div>
        <div className="flex flex-col h-full">
          <div className={`flex items-center min-h-[4rem] py-2 relative gap-2 ${isSidebarCollapsed ? 'justify-center px-0' : 'px-4'}`}>
            <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-black/70 dark:via-primary/50 to-transparent"></div>
            
            {/* Solo se muestra el Logo / Marca cuando la barra lateral está desplegada */}
            {!isSidebarCollapsed && (
              <div className="flex-1 min-w-0 transition-all duration-300 flex items-center">
                <LogoComponent />
              </div>
            )}

            <button aria-label="Expandir o colapsar menú" className={`hidden lg:flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5 rounded-lg p-2 transition-colors shrink-0 ${isSidebarCollapsed ? 'mx-auto' : ''}`}
              onClick={toggleSidebarCollapse}
              title={isSidebarCollapsed ? "Expandir menú" : "Colapsar menú"}
            >
              <Menu className="h-5 w-5" />
            </button>
            <button aria-label="Cerrar menú" className="lg:hidden text-muted-foreground hover:text-foreground p-2"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="flex flex-col flex-1 justify-between py-4 overflow-y-auto">
            <nav className="space-y-1 px-2">
              {currentNavItems.map((item) => {
                const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    aria-current={isActive ? "page" : undefined}
                    className={`relative flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                      isActive
                        ? "bg-primary/10 text-primary font-bold before:absolute before:left-0 before:top-2 before:bottom-2 before:w-1 before:rounded-full before:bg-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                    title={isSidebarCollapsed ? item.name : undefined}
                  >
                    <item.icon className="h-5 w-5 shrink-0" />
                    <span className={`transition-all duration-300 whitespace-nowrap ${isSidebarCollapsed ? "sr-only" : "opacity-100 w-auto"}`}>
                      {item.name}
                    </span>
                  </Link>
                )
              })}
            </nav>

            <div className={`px-2 py-4 relative flex flex-col gap-3 ${isSidebarCollapsed ? 'items-center' : ''}`}>
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-black/70 dark:via-primary/50 to-transparent"></div>
              <div className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : 'justify-between px-1'}`}>
                {!isSidebarCollapsed && (
                  <span className="text-sm text-muted-foreground font-medium">Tema</span>
                )}
                <button aria-label="Cambiar tema" onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="p-2 rounded-xl bg-black/5 dark:bg-white/10 text-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                  title="Cambiar tema"
                >
                  {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                </button>
              </div>
              <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-black/70 dark:via-primary/50 to-transparent my-1"></div>
              <button
                onClick={() => logout()}
                className={`text-sm text-destructive hover:text-destructive font-medium flex items-center gap-2 px-1 ${isSidebarCollapsed ? 'justify-center' : 'text-left'}`}
                title="Cerrar sesión"
              >
                <Unplug className="h-5 w-5 shrink-0" />
                <span className={`transition-all duration-300 whitespace-nowrap ${isSidebarCollapsed ? "sr-only" : "opacity-100 w-auto"}`}>
                  Cerrar Sesión
                </span>
              </button>
            </div>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="flex items-center justify-between h-16 p-0 relative bg-card">
          <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-black/70 dark:via-primary/50 to-transparent"></div>
          <div className="flex items-center gap-3">
            <button aria-label="Abrir menú" className="lg:hidden text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5 p-2 rounded-lg transition-colors"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>

          {user && (
            <div className="flex items-center gap-2 sm:gap-3">
              <Link
                href={user.role !== 'athlete' ? '/perfil' : `/atletas/${user.id}`}
                className="flex items-center gap-2.5 p-1.5 pr-3 rounded-xl bg-black/5 hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10 transition-colors border border-black/5 dark:border-white/5"
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
                  <span className="text-xs font-bold leading-tight text-foreground">{user.name}</span>
                  <span className="text-[10px] text-muted-foreground uppercase font-semibold">{getRoleLabel(user.role)}</span>
                </div>
              </Link>
            </div>
          )}
        </header>

        <main className="flex-1 overflow-y-auto pb-16 lg:pb-0 flex flex-col">
          <div className="flex-1 p-4 lg:p-8">
            {children}
          </div>
          <Footer />
        </main>

        <nav className="print:hidden lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-card flex items-center overflow-x-auto overflow-y-hidden snap-x z-40 pb-safe">
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-black/70 dark:via-primary/50 to-transparent"></div>
          {currentNavItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
            return (
              <Link
                key={item.name}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={`relative flex flex-col items-center justify-center min-w-[76px] h-full gap-1 snap-center focus-visible:outline-none focus-visible:bg-muted ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {isActive && <span className="absolute top-0 h-0.5 w-8 rounded-full bg-primary" aria-hidden="true" />}
                <item.icon className="h-5 w-5" />
                <span className="text-xs font-medium whitespace-nowrap">{item.name}</span>
              </Link>
            )
          })}
        </nav>
      </div>
    </div>
  )
}
