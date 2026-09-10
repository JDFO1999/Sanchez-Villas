"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useSettings } from "@/lib/settings-context"
import { useAuth } from "@/lib/auth-context"
import {
  Dumbbell,
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
  ScanLine
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

  useEffect(() => {
    if (!isLoading && !user && pathname !== '/login') {
      router.push('/login')
    }
  }, [user, isLoading, pathname, router])

  if (isLoading) return <div className="h-screen w-screen flex items-center justify-center"><Dumbbell className="h-8 w-8 animate-spin text-primary" /></div>

  if (pathname === '/login') {
    return <>{children}</>
  }

  let currentNavItems = [...navItems]
  if (user?.role === 'admin') {
    currentNavItems.push({ name: "Asistencia", href: "/asistencia", icon: ScanLine })
    currentNavItems.push({ name: "Empleados", href: "/empleados", icon: Users })
    currentNavItems.push({ name: "Finanzas", href: "/finanzas", icon: BarChart3 })
    currentNavItems.push({ name: "Ajustes", href: "/ajustes", icon: Settings })
  } else if (user?.role === 'athlete') {
    currentNavItems = [
      { name: "Mi Progreso", href: "/", icon: Home },
      { name: "Rutina", href: "/rutina", icon: Dumbbell },
      { name: "Mi Perfil", href: `/atletas/${user.id}`, icon: Users },
      { name: "Comunidad", href: "/comunidad", icon: MessageSquare },
    ]
  } else {
    currentNavItems = [
      { name: "Panel Principal", href: "/", icon: Home },
      { name: "Asistencia", href: "/asistencia", icon: ScanLine }
    ]
    if (user?.role === 'employee' || user?.permissions?.includes('CRM_MANAGE')) {
      currentNavItems.push({ name: "Atletas / Rutinas", href: "/atletas", icon: Users })
    }
    if (user?.role === 'cajero' || user?.permissions?.includes('POS_ACCESS')) {
      currentNavItems.push({ name: "Membresías", href: "/membresias", icon: CreditCard })
      currentNavItems.push({ name: "Tienda (POS)", href: "/tienda", icon: Store })
    }
    currentNavItems.push({ name: "Comunidad", href: "/comunidad", icon: MessageSquare })
  }

  const LogoComponent = () => (
    <Link href="/" className="flex items-center gap-2 font-bold text-xl text-primary hover:opacity-80 transition">
      {settings.logoSettings?.showInNavbar && (
        (settings.logoUrl || settings.logoUrlDark) ? (
          <img
            src={(theme === 'dark' && settings.logoUrlDark) ? settings.logoUrlDark : (settings.logoUrl || settings.logoUrlDark)}
            alt="Logo"
            style={{
              width: settings.logoSettings.widthNavbar,
              height: settings.logoSettings.heightNavbar,
              objectFit: settings.logoSettings.objectFit,
              maskImage: settings.logoSettings.fadeEffect ? 'linear-gradient(to bottom, black 50%, transparent 100%)' : 'none',
              WebkitMaskImage: settings.logoSettings.fadeEffect ? 'linear-gradient(to bottom, black 50%, transparent 100%)' : 'none'
            }}
            className="transition-all"
          />
        ) : (
          <Dumbbell style={{ width: settings.logoSettings.widthNavbar * 0.75, height: settings.logoSettings.widthNavbar * 0.75 }} />
        )
      )}
      {settings.logoSettings?.showNameInNavbar && (
        <span>{settings.appName}</span>
      )}
    </Link>
  )

  return (
    <div className="flex h-screen overflow-hidden print:overflow-visible bg-background">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`print:hidden fixed inset-y-0 left-0 z-50 bg-card border-r transition-[width,transform] duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] overflow-hidden ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } ${isSidebarCollapsed ? "w-16 lg:w-16" : "w-64"} lg:static lg:translate-x-0`}
      >
        <div className="flex flex-col h-full">
          <div className={`flex items-center h-16 border-b gap-2 ${isSidebarCollapsed ? 'justify-center px-2' : 'px-4'}`}>
            <div className={`flex-1 min-w-0 transition-all duration-300 ${isSidebarCollapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100"}`}>
              <LogoComponent />
            </div>
            <button
              className="hidden lg:flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5 rounded-lg p-2 transition-colors shrink-0"
              onClick={toggleSidebarCollapse}
              title={isSidebarCollapsed ? "Expandir menú" : "Colapsar menú"}
            >
              <Menu className="h-5 w-5" />
            </button>
            <button
              className="lg:hidden text-muted-foreground hover:text-foreground p-2"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="flex flex-col flex-1 justify-between py-4 overflow-y-auto">
            <nav className="space-y-1 px-2">
              {currentNavItems.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                      isActive
                        ? "bg-primary/20 dark:bg-primary/10 text-primary font-bold"
                        : "text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5 hover:text-foreground"
                    }`}
                    title={isSidebarCollapsed ? item.name : undefined}
                  >
                    <item.icon className="h-5 w-5 shrink-0" />
                    <span className={`transition-all duration-300 whitespace-nowrap ${isSidebarCollapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100 w-auto"}`}>
                      {item.name}
                    </span>
                  </Link>
                )
              })}
            </nav>

            <div className={`px-2 py-4 border-t flex flex-col gap-3 ${isSidebarCollapsed ? 'items-center' : ''}`}>
              <div className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : 'justify-between px-1'}`}>
                {!isSidebarCollapsed && (
                  <span className="text-sm text-muted-foreground font-medium">Tema</span>
                )}
                <button
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  className="p-2 rounded-xl bg-black/5 dark:bg-white/10 text-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                  title="Cambiar tema"
                >
                  {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                </button>
              </div>
              <button
                onClick={() => logout()}
                className={`text-sm text-red-500 hover:text-red-400 font-medium flex items-center gap-2 px-1 ${isSidebarCollapsed ? 'justify-center' : 'text-left'}`}
                title="Cerrar sesión"
              >
                <Dumbbell className="h-4 w-4 shrink-0" />
                <span className={`transition-all duration-300 whitespace-nowrap ${isSidebarCollapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100 w-auto"}`}>
                  Cerrar Sesión
                </span>
              </button>
            </div>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="flex items-center justify-between h-16 px-4 border-b bg-card">
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5 p-2 rounded-lg transition-colors"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="lg:hidden">
              <LogoComponent />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5 p-2 rounded-lg transition-colors"
            >
              {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto pb-20 lg:pb-0 flex flex-col">
          <div className="flex-1 p-4 lg:p-8">
            {children}
          </div>
          <Footer />
        </main>

        <nav className="print:hidden lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-card border-t flex items-center justify-around px-2 z-40 pb-safe">
          {currentNavItems.slice(0, 5).map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <item.icon className="h-5 w-5" />
                <span className="text-[10px] font-medium">{item.name}</span>
              </Link>
            )
          })}
        </nav>
      </div>
    </div>
  )
}
