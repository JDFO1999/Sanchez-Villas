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
  Settings
} from "lucide-react"
import { useTheme } from "next-themes"

const navItems = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Atletas", href: "/atletas", icon: Users },
  { name: "Membresías", href: "/membresias", icon: CreditCard },
  { name: "Tienda", href: "/tienda", icon: Store },
  { name: "Finanzas", href: "/finanzas", icon: BarChart3 },
  { name: "Comunidad", href: "/comunidad", icon: MessageSquare },
]

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
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

  // Define navigation based on role
  let currentNavItems = [...navItems];
  if (user?.role === 'admin') {
    currentNavItems.push({ name: "Ajustes", href: "/ajustes", icon: Settings })
  } else if (user?.role === 'athlete') {
    currentNavItems = [
      { name: "Mi Progreso", href: "/", icon: Home },
      { name: "Rutina", href: "/rutina", icon: Dumbbell },
      { name: "Mi Perfil", href: `/atletas/${user.id}`, icon: Users },
      { name: "Comunidad", href: "/comunidad", icon: MessageSquare },
    ]
  } else if (user?.role === 'employee') {
    currentNavItems = [
      { name: "Asistencia", href: "/", icon: Home },
      { name: "Atletas", href: "/atletas", icon: Users },
      { name: "Membresías", href: "/membresias", icon: CreditCard },
      { name: "Tienda (POS)", href: "/tienda", icon: Store },
      { name: "Comunidad", href: "/comunidad", icon: MessageSquare },
    ]
  }

  const LogoComponent = () => (
    <Link href="/" className="flex items-center gap-2 font-bold text-xl text-primary hover:opacity-80 transition">
      {settings.logoUrl ? (
        <img src={settings.logoUrl} alt="Logo" className="h-8 w-8 object-contain" />
      ) : (
        <Dumbbell className="h-6 w-6" />
      )}
      <span>{settings.appName}</span>
    </Link>
  )

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Desktop Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-card border-r transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between h-16 px-6 border-b">
          <LogoComponent />
          <button 
            className="lg:hidden text-muted-foreground hover:text-foreground"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="flex flex-col h-[calc(100vh-4rem)] justify-between py-4">
          <nav className="space-y-1 px-3">
            {currentNavItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors ${
                    isActive 
                      ? "bg-primary/10 text-primary font-medium" 
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </Link>
              )
            })}
          </nav>
          
          <div className="px-6 py-4 border-t flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground font-medium">Tema</span>
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="p-2 rounded-full bg-secondary text-foreground hover:bg-primary/20 transition-colors"
              >
                {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
            </div>
            
            <button 
              onClick={() => logout()}
              className="text-sm text-red-500 hover:text-red-400 text-left font-medium flex items-center gap-2"
            >
              <Dumbbell className="h-4 w-4" /> {/* Or use LogOut icon if available */}
              Cerrar Sesión
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header Mobile */}
        <header className="lg:hidden flex items-center justify-between h-16 px-4 border-b bg-card">
          <LogoComponent />
          <div className="flex items-center gap-4">
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="text-muted-foreground"
            >
              {theme === "dark" ? <Sun className="h-6 w-6" /> : <Moon className="h-6 w-6" />}
            </button>
            <button 
              className="text-muted-foreground"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-8 pb-20 lg:pb-8">
          {children}
        </main>

        {/* Bottom Navigation for Mobile */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-card border-t flex items-center justify-around px-2 z-40 pb-safe">
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
