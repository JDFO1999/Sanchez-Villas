"use client"

import React from "react"
import { LandingNavbar } from "./landing-navbar"
import { HeroCarousel } from "./hero-carousel"
import { DisciplinesSection } from "./disciplines-section"
import { FacilitiesSection } from "./facilities-section"
import { PlansSection } from "./plans-section"
import { MapSection } from "./map-section"
import { Footer } from "@/components/layout/footer"
import { useSettings } from "@/lib/settings-context"

export function GymLandingPage() {
  const { settings } = useSettings()
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary selection:text-primary-foreground">
      {/* TOP NAVBAR */}
      <LandingNavbar />

      {/* MAIN SECTIONS */}
      <main className="flex-1 flex flex-col">
        {/* HERO PROMOTIONAL CAROUSEL */}
        <HeroCarousel />

        {/* DISCIPLINES SHOWCASE */}
        <DisciplinesSection />

        {/* FACILITIES & PROMISE */}
        <FacilitiesSection />

        {/* GOOGLE MAPS INTERACTIVE LOCATION & INFO */}
        <MapSection />

        {/* PLANS & MEMBERSHIPS (4 CARDS) */}
        <PlansSection />
      </main>

      {/* FLOATING WHATSAPP CTA PARA PROSPECTOS / NUEVOS CLIENTES */}
      {(() => {
        const waLink = settings.footerSocialLinks?.find((l: any) => l.name?.toLowerCase().includes('whatsapp') || l.url?.includes('wa.me'))?.url
        const href = waLink || `https://wa.me/?text=${encodeURIComponent(`¡Hola! Quisiera información para inscribirme en ${settings.appName || 'el gimnasio'}.`)}`
        return (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold shadow-2xl shadow-emerald-500/30 hover:scale-105 active:scale-95 transition-all duration-300 border border-white/20"
            title="Consultar por WhatsApp"
          >
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-white" />
            </span>
            <span className="text-sm">¿Deseas inscribirte? Escríbenos</span>
          </a>
        )
      })()}

      {/* FOOTER */}
      <div id="contacto" className="mt-auto w-full">
        <Footer />
      </div>
    </div>
  )
}
