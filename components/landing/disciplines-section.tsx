"use client"

import React from "react"
import { useSettings } from "@/lib/settings-context"
import { useTheme } from "next-themes"
import { Flame, Zap, Activity, Clock, ShieldCheck } from "lucide-react"

export function DisciplinesSection() {
  const { settings } = useSettings()
  const { theme, resolvedTheme } = useTheme()
  const currentTheme = resolvedTheme || theme
  const logoSrc = currentTheme === "dark"
    ? (settings.logoUrlDark || settings.logoUrl)
    : (settings.logoUrl || settings.logoUrlDark)

  const disciplines = settings.landingSettings?.disciplines?.length
    ? settings.landingSettings.disciplines
    : [
        {
          id: '1',
          title: 'Musculación & Hipertrofia',
          description: 'Zona de peso libre, máquinas selectorizadas y asesoría técnica para maximizar tu ganancia muscular y fuerza.',
          imageUrl: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=800&auto=format&fit=crop',
          intensity: 'Alta',
          schedule: 'Lunes a Sábado'
        },
        {
          id: '2',
          title: 'Cross Training & Funcional',
          description: 'Entrenamientos dinámicos de alta intensidad para elevar resistencia, potencia cardiovascular y agilidad.',
          imageUrl: 'https://images.unsplash.com/photo-1517963879433-6ad2b056d712?q=80&w=800&auto=format&fit=crop',
          intensity: 'Extrema',
          schedule: 'Mañanas y Tardes'
        },
        {
          id: '3',
          title: 'Indoor Cycling (Spinning)',
          description: 'Quema calorías al ritmo de la música con sesiones guiadas que fortalecen piernas y capacidad aeróbica.',
          imageUrl: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=800&auto=format&fit=crop',
          intensity: 'Media - Alta',
          schedule: 'Clases Grupales'
        },
        {
          id: '4',
          title: 'Boxeo & Contacto',
          description: 'Aprende técnica, golpeo al saco, reflejos y coordinación en una disciplina que desafía tu velocidad y resistencia.',
          imageUrl: 'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?q=80&w=800&auto=format&fit=crop',
          intensity: 'Alta',
          schedule: 'Lunes, Miércoles y Viernes'
        }
      ]

  const getIntensityBadge = (intensity?: string) => {
    switch (intensity?.toLowerCase()) {
      case 'extrema':
        return <span className="px-2.5 py-1 rounded-full text-xs font-black bg-red-500/20 text-red-500 border border-red-500/30">INTENSIDAD EXTREMA</span>
      case 'alta':
        return <span className="px-2.5 py-1 rounded-full text-xs font-black bg-amber-500/20 text-amber-500 border border-amber-500/30">INTENSIDAD ALTA</span>
      default:
        return <span className="px-2.5 py-1 rounded-full text-xs font-black bg-primary/20 text-primary border border-primary/30">TODOS LOS NIVELES</span>
    }
  }

  return (
    <section id="disciplinas" className="pt-20 pb-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative">
      
      {/* SECTION HEADER */}
      <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-extrabold uppercase tracking-widest">
          <Flame className="w-3.5 h-3.5" />
          NUESTRAS DISCIPLINAS
        </div>
        
        <h2 className="font-display text-3xl sm:text-5xl font-black uppercase tracking-tight text-foreground">
          {settings.landingSettings?.disciplinesTitle || "ENTRENA A TU MANERA, SUPERA TUS LÍMITES"}
        </h2>
        
        <p className="text-muted-foreground text-base sm:text-lg">
          {settings.landingSettings?.disciplinesSubtitle || "Disponemos de programas y áreas diseñadas para todos los niveles, desde principiantes hasta atletas de alto rendimiento."}
        </p>
      </div>

      {/* CARDS GRID: ADAPTATIVE FOR 4, 6 OR MORE DISCIPLINES */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
        {disciplines.map((item, index) => (
          <div
            key={item.id || index}
            className="group relative flex flex-col rounded-3xl overflow-hidden bg-card border border-border/60 hover:border-primary/50 shadow-lg hover:shadow-2xl hover:shadow-primary/10 transition-all duration-300 hover:-translate-y-1.5"
          >
            {/* IMAGE WRAPPER */}
            <div className="relative h-64 w-full overflow-hidden bg-muted">
              <img
                src={item.imageUrl}
                alt={item.title}
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
              />
              
              {/* GRADIENTS */}
              <div className="absolute inset-0 bg-gradient-to-t from-card via-black/30 to-transparent" />
              
              {/* BADGE ON TOP */}
              <div className="absolute top-4 left-4">
                {getIntensityBadge(item.intensity)}
              </div>
            </div>

            {/* CARD BODY */}
            <div className="p-6 flex flex-col flex-1 justify-between space-y-4">
              <div className="space-y-2">
                <h3 className="font-display font-extrabold text-xl text-foreground group-hover:text-primary transition-colors uppercase">
                  {item.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {item.description}
                </p>
              </div>

              {/* CARD FOOTER */}
              <div className="pt-4 border-t border-border/50 flex items-center justify-between text-xs font-bold text-muted-foreground">
                <div className="flex items-center gap-1.5 text-primary">
                  <Clock className="w-4 h-4 shrink-0" />
                  <span>{item.schedule || "Lunes a Sábado"}</span>
                </div>
                <div className="text-[11px] uppercase tracking-wider text-muted-foreground/80">
                  {settings.appName || "GYM"}
                </div>
              </div>

            </div>
          </div>
        ))}
      </div>

      {/* COACHING / MOTIVATIONAL BANNER */}
      {settings.trainingPhilosophy && (
        <div className="mt-8 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-card via-primary/5 to-card border border-primary/20 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-primary/15 flex items-center justify-center text-primary shrink-0 border border-primary/30 overflow-hidden p-2">
              {logoSrc ? (
                <img
                  src={logoSrc}
                  alt={settings.appName || "Logo"}
                  className="w-full h-full object-contain transition-all duration-300"
                />
              ) : (
                <div className="w-full h-full rounded-xl bg-primary/10 flex items-center justify-center text-primary font-black text-xl">
                  {(settings.appName || 'M').charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div>
              <h4 className="font-display font-black text-lg sm:text-xl uppercase text-foreground">
                FILOSOFÍA DE ENTRENAMIENTO
              </h4>
              <p className="text-sm sm:text-base text-muted-foreground italic mt-1 max-w-2xl">
                "{settings.trainingPhilosophy}"
              </p>
            </div>
          </div>
          <a
            href="#planes"
            className="shrink-0 px-6 py-3 rounded-xl bg-transparent border-2 border-primary text-primary hover:bg-primary/10 active:scale-95 font-bold text-sm tracking-wide transition-all"
          >
            Comenzar Ahora
          </a>
        </div>
      )}

    </section>
  )
}
