"use client"

import React from "react"
import { LandingNavbar } from "./landing-navbar"
import { HeroCarousel } from "./hero-carousel"
import { DisciplinesSection } from "./disciplines-section"
import { FacilitiesSection } from "./facilities-section"
import { MapSection } from "./map-section"
import { Footer } from "@/components/layout/footer"

export function GymLandingPage() {
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
      </main>

      {/* FOOTER */}
      <div id="contacto">
        <Footer />
      </div>
    </div>
  )
}
