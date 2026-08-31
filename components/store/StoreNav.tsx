"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { ShoppingCart, Package, Receipt } from "lucide-react"

export function StoreNav() {
  const pathname = usePathname()
  const { user } = useAuth()

  // Admins get everything, Employees might only get POS and Ventas (or all, but restricted in the page)
  const navs = [
    { name: "Punto de Venta (POS)", href: "/tienda", icon: ShoppingCart },
    { name: "Inventario", href: "/tienda/inventario", icon: Package, adminOnly: true },
    { name: "Historial de Ventas", href: "/tienda/ventas", icon: Receipt },
  ]

  return (
    <div className="flex gap-2 overflow-x-auto pb-4 mb-4 border-b border-white/10">
      {navs.map(nav => {
        if (nav.adminOnly && user?.role !== 'admin') return null

        const isActive = pathname === nav.href
        return (
          <Link 
            key={nav.href} 
            href={nav.href}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition text-sm font-medium whitespace-nowrap ${
              isActive 
                ? "bg-primary text-primary-foreground shadow-md shadow-primary/20" 
                : "bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-foreground"
            }`}
          >
            <nav.icon className="h-4 w-4" />
            {nav.name}
          </Link>
        )
      })}
    </div>
  )
}
