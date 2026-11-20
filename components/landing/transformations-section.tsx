"use client"

import React, { useState } from "react"
import { useSettings } from "@/lib/settings-context"
import { Sparkles, Clock, TrendingUp, Dumbbell, ArrowRight } from "lucide-react"

interface TransformationItem {
  id: string
  athleteName: string
  duration: string
  changeText: string
  description: string
  beforeImage: string
  afterImage: string
}

const DEFAULT_TRANSFORMATIONS: TransformationItem[] = [
  {
    id: "def-1",
    athleteName: "Andrés Silva",
    duration: "4 Meses",
    changeText: "-14 kg grasa / +3.5 kg masa magra",
    description: "Con constancia en el entrenamiento de fuerza y asesoría personalizada, recuperó su energía y redefinió completamente su composición corporal.",
    beforeImage: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?q=80&w=800&auto=format&fit=crop",
    afterImage: "https://images.unsplash.com/photo-1583454155184-870a1f63aebc?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: "def-2",
    athleteName: "Mariana Delgado",
    duration: "3 Meses",
    changeText: "-8 kg / Tonificación y fuerza funcional",
    description: "Superó sus propios límites a través de la disciplina diaria, logrando una postura óptima, fuerza en tren superior y una salud impecable.",
    beforeImage: "https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=800&auto=format&fit=crop",
    afterImage: "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: "def-3",
    athleteName: "Roberto González",
    duration: "6 Meses",
    changeText: "+6 kg masa muscular / PR 140 kg Sentadilla",
    description: "Enfoque total en hipertrofia y sobrecarga progresiva. Transformó su disciplina en un estilo de vida de alto rendimiento.",
    beforeImage: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=800&auto=format&fit=crop",
    afterImage: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=800&auto=format&fit=crop",
  },
]

export function TransformationsSection() {
  const { settings } = useSettings()
  const conf = settings?.landingSettings?.transformationsSettings

  const badge = conf?.badge || "RESULTADOS COMPROBADOS"
  const title = conf?.title || "TRANSFORMACIONES REALES, VIDAS EXTRAORDINARIAS"
  const description =
    conf?.description ||
    "La constancia, el esfuerzo diario y la guía experta de nuestros entrenadores marcan la diferencia. Conoce las historias de éxito de nuestra comunidad."

  const items: TransformationItem[] =
    conf?.items && conf.items.length > 0 ? conf.items : DEFAULT_TRANSFORMATIONS

  // Active view for each card: "before" | "after" | "split"
  const [activeViews, setActiveViews] = useState<Record<string, "before" | "after">>({})

  const toggleView = (id: string, view: "before" | "after") => {
    setActiveViews((prev) => ({ ...prev, [id]: view }))
  }

  return (
    <section id="transformaciones" className="py-20 px-4 sm:px-6 lg:px-8 border-t border-border/40 bg-gradient-to-b from-background via-black/20 to-background">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* ENCABEZADO DE SECCIÓN */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-black tracking-wider uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{badge}</span>
          </div>
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight text-foreground">
            {title}
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            {description}
          </p>
        </div>

        {/* GRID DE CASOS DE TRANSFORMACIÓN */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {items.map((item) => {
            const currentView = activeViews[item.id] || "after"
            const displayImg = currentView === "before" ? item.beforeImage : item.afterImage

            return (
              <div
                key={item.id}
                className="group rounded-3xl border border-border/60 bg-card overflow-hidden shadow-lg hover:border-primary/50 hover:shadow-primary/10 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* FOTOGRAFÍA COMPARATIVA INTERACTIVA */}
                  <div className="relative h-72 sm:h-80 w-full overflow-hidden bg-black/40">
                    <img
                      src={displayImg || item.afterImage}
                      alt={`${item.athleteName} - ${currentView}`}
                      className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    />

                    {/* OVERLAY SUPERIOR: BADGE DE TIEMPO */}
                    <div className="absolute top-4 left-4 z-10 flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/70 backdrop-blur-md border border-white/10 text-xs font-bold text-foreground shadow-md">
                      <Clock className="w-3.5 h-3.5 text-primary" />
                      <span>{item.duration || "Transformación"}</span>
                    </div>

                    {/* SELECTOR INTERACTIVO: ANTES / DESPUÉS */}
                    <div className="absolute bottom-4 right-4 z-10 flex items-center p-1 rounded-xl bg-black/80 backdrop-blur-md border border-white/15 shadow-xl">
                      <button
                        type="button"
                        onClick={() => toggleView(item.id, "before")}
                        className={`px-3 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
                          currentView === "before"
                            ? "bg-primary text-black shadow-md scale-105"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        ANTES
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleView(item.id, "after")}
                        className={`px-3 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
                          currentView === "after"
                            ? "bg-emerald-500 text-black shadow-md scale-105"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        DESPUÉS
                      </button>
                    </div>

                    {/* BADGE DE ESTADO ACTUAL EN ESQUINA */}
                    <div className="absolute bottom-4 left-4 z-10">
                      <span
                        className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-lg backdrop-blur-md border shadow-sm ${
                          currentView === "before"
                            ? "bg-muted/80 text-foreground border-white/10"
                            : "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                        }`}
                      >
                        Viendo: {currentView === "before" ? "Estado Inicial" : "Resultado Final"}
                      </span>
                    </div>
                  </div>

                  {/* CUERPO INFORMATIVO */}
                  <div className="p-5 sm:p-6 space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-lg font-black text-foreground group-hover:text-primary transition-colors">
                        {item.athleteName}
                      </h3>
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 font-bold">
                        Atleta
                      </span>
                    </div>

                    {item.changeText && (
                      <div className="flex items-center gap-2 p-2.5 rounded-xl bg-primary/10 border border-primary/20 text-xs font-bold text-primary">
                        <TrendingUp className="w-4 h-4 shrink-0 text-primary" />
                        <span>{item.changeText}</span>
                      </div>
                    )}

                    {item.description && (
                      <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed italic">
                        "{item.description}"
                      </p>
                    )}
                  </div>
                </div>

                {/* FOOTER DE LA TARJETA */}
                <div className="p-5 sm:p-6 pt-0 border-t border-border/40 mt-4">
                  <a
                    href="#planes"
                    className="inline-flex items-center justify-between w-full pt-3 text-xs font-bold text-primary group-hover:underline"
                  >
                    <span>Comenzar mi transformación</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </a>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
