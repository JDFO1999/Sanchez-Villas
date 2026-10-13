"use client"

import React, { useState, useEffect, useRef } from "react"
import { useSettings } from "@/lib/settings-context"
import { ChevronLeft, ChevronRight, Play, Pause, ArrowRight, ShieldCheck, Dumbbell, Sparkles } from "lucide-react"

export function HeroCarousel() {
  const { settings } = useSettings()
  const slides = settings.landingSettings?.heroSlides?.length 
    ? settings.landingSettings.heroSlides 
    : [
        {
          id: '1',
          type: 'image' as const,
          url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1920&auto=format&fit=crop',
          title: 'TRANSFORMA TU CUERPO Y MENTE',
          subtitle: 'Instalaciones de alto rendimiento, entrenadores certificados y la mejor comunidad fitness.',
          ctaText: 'Ver Disciplinas',
          ctaLink: '#disciplinas'
        },
        {
          id: '2',
          type: 'image' as const,
          url: 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?q=80&w=1920&auto=format&fit=crop',
          title: 'DISCIPLINAS PARA CADA OBJETIVO',
          subtitle: 'Musculación, Cross Training, Spinning, Boxeo y mucho más en un solo lugar.',
          ctaText: 'Conoce Nuestra Ubicación',
          ctaLink: '#ubicacion'
        },
        {
          id: '3',
          type: 'image' as const,
          url: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=1920&auto=format&fit=crop',
          title: 'VIVE LA EXPERIENCIA DEL ENTRENAMIENTO REAL',
          subtitle: 'Ambiente motivador con equipo de última generación y asesoría personalizada.',
          ctaText: 'Contáctanos',
          ctaLink: '#contacto'
        }
      ]

  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(true)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % slides.length)
  }

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length)
  }

  useEffect(() => {
    if (isPlaying && slides.length > 1) {
      timerRef.current = setInterval(() => {
        nextSlide()
      }, 6500)
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [currentIndex, isPlaying, slides.length])

  if (!slides.length) return null

  const currentSlide = slides[currentIndex]

  return (
    <section id="inicio" className="relative w-full h-[90vh] min-h-[600px] max-h-[920px] flex items-center justify-center overflow-hidden bg-black select-none">
      
      {/* SLIDES BACKGROUND */}
      {slides.map((slide, idx) => {
        const isCurrent = idx === currentIndex
        return (
          <div
            key={slide.id || idx}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              isCurrent ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
            }`}
          >
            {slide.type === 'video' ? (
              <video
                src={slide.url}
                autoPlay
                muted
                loop
                playsInline
                className="w-full h-full object-cover scale-105 transform duration-[8000ms] ease-out motion-safe:scale-100"
              />
            ) : (
              <div 
                className="w-full h-full bg-cover bg-center transition-transform duration-[8000ms] ease-out"
                style={{ 
                  backgroundImage: `url('${slide.url}')`,
                  transform: isCurrent ? 'scale(1.04)' : 'scale(1.0)'
                }}
              />
            )}

            {/* OVERLAY GRADIENT FOR HIGH READABILITY */}
            <div className="absolute inset-0 bg-gradient-to-t from-background via-black/60 to-black/40" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
          </div>
        )
      })}

      {/* CONTENT LAYER */}
      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-16">
        <div className="max-w-3xl space-y-6">
          
          {/* BADGE */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/20 backdrop-blur-md border border-primary/30 text-primary text-xs sm:text-sm font-bold uppercase tracking-wider animate-in fade-in slide-in-from-bottom-2 duration-500">
            <Sparkles className="w-4 h-4 shrink-0" />
            <span>{settings.appName || "GYM PRO"} • BIENVENIDOS</span>
          </div>

          {/* MAIN TITLE */}
          <h1 
            key={`title-${currentIndex}`}
            className="font-display text-4xl sm:text-6xl lg:text-7xl font-extrabold uppercase tracking-tight text-white leading-[1.08] drop-shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-700"
          >
            {currentSlide.title || "ENTRENA CON LOS MEJORES"}
          </h1>

          {/* SUBTITLE */}
          <p 
            key={`sub-${currentIndex}`}
            className="text-lg sm:text-xl text-neutral-300 font-medium max-w-2xl leading-relaxed drop-shadow-md animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100"
          >
            {currentSlide.subtitle || settings.landingSettings?.tagline || "Tu transformación comienza hoy. Descubre nuestro centro de entrenamiento de vanguardia."}
          </p>

          {/* CALL TO ACTION BUTTONS (OUTLINE STYLE) */}
          <div className="pt-2 flex flex-wrap items-center gap-4">
            <a
              href={currentSlide.ctaLink || "#disciplinas"}
              className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-xl bg-transparent border-2 border-primary text-primary hover:bg-primary hover:text-black font-extrabold text-base tracking-wide transition-all group backdrop-blur-sm"
            >
              <span>{currentSlide.ctaText || "Explorar Disciplinas"}</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </a>

            <a
              href="#ubicacion"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-transparent hover:bg-white/10 text-white font-bold text-base backdrop-blur-md border-2 border-white/40 hover:border-white transition-all"
            >
              <span>Ver Ubicación</span>
            </a>
          </div>

        </div>
      </div>

      {/* CAROUSEL CONTROLS */}
      {slides.length > 1 && (
        <>
          {/* PREV / NEXT ARROWS */}
          <button
            onClick={prevSlide}
            aria-label="Diapositiva anterior"
            className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-md border border-white/20 hover:border-primary transition-all group"
          >
            <ChevronLeft className="w-6 h-6 group-hover:-translate-x-0.5 transition-transform" />
          </button>

          <button
            onClick={nextSlide}
            aria-label="Siguiente diapositiva"
            className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-md border border-white/20 hover:border-primary transition-all group"
          >
            <ChevronRight className="w-6 h-6 group-hover:translate-x-0.5 transition-transform" />
          </button>

          {/* BOTTOM DOTS INDICATORS */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex items-center gap-3 px-4 py-2 rounded-full bg-black/40 backdrop-blur-md border border-white/10">
            {slides.map((_, dotIdx) => (
              <button
                key={dotIdx}
                onClick={() => setCurrentIndex(dotIdx)}
                aria-label={`Ir a diapositiva ${dotIdx + 1}`}
                className={`h-2.5 rounded-full transition-all duration-300 ${
                  dotIdx === currentIndex
                    ? "w-8 bg-primary shadow-lg shadow-primary/50"
                    : "w-2.5 bg-white/40 hover:bg-white/70"
                }`}
              />
            ))}

            <button
              onClick={() => setIsPlaying(!isPlaying)}
              aria-label={isPlaying ? "Pausar carrusel" : "Reproducir carrusel"}
              className="ml-2 text-white/60 hover:text-white transition-colors"
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            </button>
          </div>
        </>
      )}

      {/* BOTTOM DECORATIVE GRADIENT FADE */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent z-20 pointer-events-none" />
    </section>
  )
}
