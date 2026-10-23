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
            {/* Logo Oficial de WhatsApp */}
            <svg className="w-5 h-5 fill-current shrink-0" viewBox="0 0 24 24">
              <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.634.044-1.84-.455-1.523-.629-2.5-2.18-2.577-2.282-.075-.102-.622-.826-.622-1.574 0-.748.39-1.116.529-1.267.14-.15.305-.188.406-.188.102 0 .204.002.292.007.094.005.219-.036.343.262.128.309.438 1.07.476 1.148.038.077.063.167.013.268-.05.101-.076.164-.15.251-.077.088-.161.196-.231.263-.076.074-.156.155-.067.308.089.153.396.654.85 1.059.584.521 1.076.683 1.229.759.152.076.242.064.331-.039.09-.102.383-.446.486-.6.102-.153.204-.128.344-.077.14.051.889.419 1.042.495.152.076.254.114.292.178.038.064.038.37-.106.775zm-3.394-10.416c-5.522 0-10 4.477-10 10 0 1.769.459 3.498 1.332 5.016l-1.417 5.176 5.305-1.391c1.459.796 3.111 1.215 4.78 1.215 5.523 0 10-4.477 10-10 0-5.523-4.477-10-10-10z" />
            </svg>
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
