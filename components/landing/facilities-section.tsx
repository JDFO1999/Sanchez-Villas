"use client"

import React from "react"
import { useSettings } from "@/lib/settings-context"
import { CheckCircle2, ShieldCheck, Award, HeartHandshake, Sparkles } from "lucide-react"

export function FacilitiesSection() {
  const { settings } = useSettings()

  const features = [
    {
      title: "Maquinaria de Última Generación",
      desc: "Equipamiento biomecánico de primer nivel para trabajar cada grupo muscular de forma segura y eficiente.",
      icon: Award
    },
    {
      title: "Entrenadores Certificados",
      desc: "Equipo profesional listo para guiar tus rutinas, corregir tu técnica y maximizar tus avances.",
      icon: ShieldCheck
    },
    {
      title: "Ambiente Energético y Motivador",
      desc: "Música, iluminación y una comunidad activa que te impulsa a romper tus propios récords cada día.",
      icon: Sparkles
    },
    {
      title: "Higiene y Espacios Climatizados",
      desc: "Protocolos estrictos de limpieza, duchas impecables y vestuarios con casilleros seguros.",
      icon: CheckCircle2
    }
  ]

  const promise = settings.landingSettings?.promiseSettings || {
    badge: 'NUESTRA PROMESA',
    title: 'UN ESPACIO PENSADO PARA TU EVOLUCIÓN',
    description: 'no solo entrenas: formas parte de un estilo de vida enfocado en la disciplina, la superación y los resultados reales.',
    images: [
      'https://images.unsplash.com/photo-1574680096145-d05b474e2155?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1534367507873-d2d7e24c797f?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1599058917212-d750089bc07e?q=80&w=800&auto=format&fit=crop'
    ]
  }

  const images = promise.images?.length === 4 ? promise.images : [
    promise.images?.[0] || 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?q=80&w=800&auto=format&fit=crop',
    promise.images?.[1] || 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?q=80&w=800&auto=format&fit=crop',
    promise.images?.[2] || 'https://images.unsplash.com/photo-1534367507873-d2d7e24c797f?q=80&w=800&auto=format&fit=crop',
    promise.images?.[3] || 'https://images.unsplash.com/photo-1599058917212-d750089bc07e?q=80&w=800&auto=format&fit=crop'
  ]

  return (
    <section id="instalaciones" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        
        {/* TEXT CONTENT */}
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-extrabold uppercase tracking-widest">
            <HeartHandshake className="w-3.5 h-3.5" />
            {promise.badge || "NUESTRA PROMESA"}
          </div>

          <h2 className="font-display text-3xl sm:text-5xl font-black uppercase tracking-tight text-foreground leading-tight">
            {promise.title || "UN ESPACIO PENSADO PARA TU EVOLUCIÓN"}
          </h2>

          <p className="text-muted-foreground text-base sm:text-lg leading-relaxed">
            En <span className="text-foreground font-bold">{settings.appName || "nuestro gimnasio"}</span> {promise.description || "no solo entrenas: formas parte de un estilo de vida enfocado en la disciplina, la superación y los resultados reales."}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-4">
            {features.map((item, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-card border border-border/80 space-y-2 hover:border-primary/40 transition-colors">
                <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                  <item.icon className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-sm text-foreground uppercase">{item.title}</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* IMAGE SHOWCASE */}
        <div className="grid grid-cols-2 gap-4 relative">
          <div className="space-y-4">
            <div className="h-60 rounded-3xl overflow-hidden shadow-xl border border-border group">
              <img
                src={images[0]}
                alt="Instalación 1"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="h-44 rounded-3xl overflow-hidden shadow-xl border border-border group">
              <img
                src={images[1]}
                alt="Instalación 2"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
          </div>
          <div className="space-y-4 pt-8">
            <div className="h-44 rounded-3xl overflow-hidden shadow-xl border border-border group">
              <img
                src={images[2]}
                alt="Instalación 3"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="h-60 rounded-3xl overflow-hidden shadow-xl border border-border group">
              <img
                src={images[3]}
                alt="Instalación 4"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
          </div>
        </div>

      </div>
    </section>
  )
}
