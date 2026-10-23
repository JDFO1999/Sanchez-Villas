"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { useTheme } from "next-themes"
import { useSettings } from "@/lib/settings-context"
import { useAuth } from "@/lib/auth-context"
import { Sun, Moon, LogIn, LayoutDashboard, Menu, X } from "lucide-react"

export function LandingNavbar() {
  const { theme, setTheme } = useTheme()
  const { settings } = useSettings()
  const { user } = useAuth()
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 30) {
        setScrolled(true)
      } else {
        setScrolled(false)
      }
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const currentTheme = theme || 'dark'
  const isDark = currentTheme === 'dark'
  const logoSrc = isDark 
    ? (settings.logoUrlDark || settings.logoUrl) 
    : (settings.logoUrl || settings.logoUrlDark)

  const navLinks = [
    { name: "Inicio", href: "#inicio" },
    { name: "Disciplinas", href: "#disciplinas" },
    { name: "Instalaciones", href: "#instalaciones" },
    { name: "Horarios", href: "#horarios" },
    { name: "Ubicación", href: "#ubicacion" },
    { name: "Planes", href: "#planes" },
    { name: "Contacto", href: "#contacto" },
  ]

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled 
          ? "bg-background/90 backdrop-blur-md shadow-lg py-3" 
          : "bg-gradient-to-b from-background/95 via-background/70 to-transparent py-5"
      }`}
    >
      {/* SEPARADOR AMARILLO/DORADO INFERIOR IDÉNTICO AL DASHBOARD */}
      <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary to-transparent opacity-80 pointer-events-none"></div>

      <div className="w-full px-4 sm:px-8 lg:px-12 flex items-center justify-between gap-4">
        
        {/* LEFT: LOGO & BRAND NAME */}
        <div className="flex items-center justify-start flex-1 sm:flex-none">
          <Link href="#inicio" className="flex items-center gap-3 group transition">
            {settings.logoSettings?.showInNavbar && logoSrc ? (
              <img
                src={logoSrc}
                alt={settings.appName || "Gym Logo"}
                style={{
                  width: settings.logoSettings.widthNavbar || 44,
                  height: settings.logoSettings.heightNavbar || 44,
                  objectFit: settings.logoSettings.objectFit || 'contain',
                  padding: settings.logoSettings?.paddingNavbar ? `${settings.logoSettings.paddingNavbar}px` : undefined,
                  margin: settings.logoSettings?.marginNavbar ? `${settings.logoSettings.marginNavbar}px` : undefined,
                }}
                className="transition-transform duration-300 group-hover:scale-105 shrink-0 drop-shadow-md"
              />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center text-primary font-black text-lg group-hover:scale-105 transition-transform shadow-inner select-none">
                {(settings.appName || 'M').charAt(0).toUpperCase()}
              </div>
            )}

            {settings.logoSettings?.showNameInNavbar !== false && (
              <div className="flex flex-col">
                <span className="font-display font-extrabold text-xl sm:text-2xl tracking-wider text-neutral-950 dark:text-white uppercase group-hover:text-primary transition-colors">
                  {settings.appName || "GYM PRO"}
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest text-primary">
                  Fitness & Performance
                </span>
              </div>
            )}
          </Link>
        </div>

        {/* CENTER: DESKTOP NAV LINKS (SIN SCROLL / COMPACTO ELEGANTE) */}
        <nav className="hidden md:flex items-center justify-center flex-1 gap-3 lg:gap-5 xl:gap-7">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="text-xs lg:text-[13px] font-bold text-neutral-900 dark:text-neutral-200 hover:text-primary dark:hover:text-primary transition-colors tracking-tight relative py-1 after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-primary hover:after:w-full after:transition-all after:duration-300 whitespace-nowrap"
            >
              {link.name}
            </a>
          ))}
        </nav>

        {/* RIGHT: ACTIONS: THEME TOGGLE & AUTH BUTTON */}
        <div className="hidden md:flex items-center justify-end flex-1 sm:flex-none gap-3">
          {/* THEME SWITCHER */}
          <button
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className="p-2.5 rounded-xl bg-transparent border-2 border-border hover:border-primary text-neutral-900 dark:text-white hover:text-primary transition-all duration-200"
            aria-label="Cambiar tema de color"
            title={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          {/* LOGIN OR DASHBOARD CTA (OUTLINE BORDER STYLE) */}
          {user ? (
            <Link
              href="/"
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-transparent border-2 border-primary text-primary hover:bg-primary/10 active:scale-95 font-extrabold text-sm tracking-wide transition-all whitespace-nowrap"
            >
              <LayoutDashboard className="h-4 w-4" />
              <span>Mi Panel</span>
            </Link>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-transparent border-2 border-primary text-primary hover:bg-primary/10 active:scale-95 font-extrabold text-sm tracking-wide transition-all whitespace-nowrap"
            >
              <LogIn className="h-4 w-4" />
              <span>Ingresar</span>
            </Link>
          )}
        </div>

        {/* MOBILE MENU TOGGLE BUTTON */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className="p-2 rounded-xl bg-transparent border-2 border-border text-neutral-900 dark:text-white"
            aria-label="Cambiar tema"
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl bg-transparent border-2 border-border text-neutral-900 dark:text-white"
            aria-label="Abrir menú de navegación"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

      </div>

      {/* MOBILE DROPDOWN MENU */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-card/95 backdrop-blur-xl border-b border-border px-6 py-6 shadow-2xl animate-in slide-in-from-top-4 duration-300">
          <nav className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-base font-bold text-neutral-900 dark:text-neutral-100 hover:text-primary transition-colors py-1"
              >
                {link.name}
              </a>
            ))}
            
            <div className="pt-4 border-t border-border mt-2">
              {user ? (
                <Link
                  href="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-transparent border-2 border-primary text-primary hover:bg-primary/10 active:scale-95 font-extrabold text-sm tracking-wide transition-all"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  <span>Ir a Mi Panel de Control</span>
                </Link>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-transparent border-2 border-primary text-primary hover:bg-primary/10 active:scale-95 font-extrabold text-sm tracking-wide transition-all"
                >
                  <LogIn className="h-4 w-4" />
                  <span>Iniciar Sesión / Portal Miembros</span>
                </Link>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
