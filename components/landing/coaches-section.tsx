"use client"

import React from "react"
import { useSettings } from "@/lib/settings-context"
import { Users, Award, Dumbbell, MessageCircle, CheckCircle2 } from "lucide-react"

interface CoachItem {
  id: string
  name: string
  specialty: string
  experience: string
  bio: string
  photo: string
  instagram?: string
  phone?: string
}

const DEFAULT_COACHES: CoachItem[] = [
  {
    id: "coach-1",
    name: "Belkis Solano",
    specialty: "Hipertrofia, Musculación & Biomecánica",
    experience: "+7 años de experiencia",
    bio: "Especialista en sobrecarga progresiva, corrección postural y planes de tonificación integral para atletas de todos los niveles.",
    photo: "https://images.unsplash.com/photo-1594381898411-846e7d193883?q=80&w=800&auto=format&fit=crop",
    instagram: "@belkis_coach",
    phone: "+58 412 123 4567"
  },
  {
    id: "coach-2",
    name: "Robert Azuaje",
    specialty: "Powerlifting, Fuerza Máxima & Acondicionamiento",
    experience: "+6 años de experiencia",
    bio: "Preparador enfocado en maximizar marcas de levantamiento, técnica de potencia y prevención activa de lesiones articulares.",
    photo: "https://images.unsplash.com/photo-1567013127542-490d757e51fc?q=80&w=800&auto=format&fit=crop",
    instagram: "@robert_power",
    phone: "+58 414 987 6543"
  },
  {
    id: "coach-3",
    name: "Rosa Tovar",
    specialty: "Entrenamiento Funcional & Pérdida de Grasa",
    experience: "+5 años de experiencia",
    bio: "Metodología orientada a la quema calórica eficiente, agilidad, resistencia cardiovascular y motivación deportiva diaria.",
    photo: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=800&auto=format&fit=crop",
    instagram: "@rosatovar_fit",
    phone: "+58 424 555 1234"
  },
]

export function CoachesSection() {
  const { settings } = useSettings()
  const conf = settings?.landingSettings?.coachesSettings

  const badge = conf?.badge || "STAFF DE ÉLITE"
  const title = conf?.title || "CONOCE A NUESTROS ENTRENADORES"
  const description =
    conf?.description ||
    "Profesionales certificados y apasionados por guiar tu técnica, nutrición y evolución deportiva paso a paso."

  const coaches: CoachItem[] =
    conf?.coaches && conf.coaches.length > 0
      ? conf.coaches
      : DEFAULT_COACHES

  return (
    <section id="entrenadores" className="py-20 px-4 sm:px-6 lg:px-8 border-t border-border/40 bg-card/40">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* ENCABEZADO DE SECCIÓN */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-black tracking-wider uppercase">
            <Users className="w-3.5 h-3.5" />
            <span>{badge}</span>
          </div>
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight text-foreground">
            {title}
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            {description}
          </p>
        </div>

        {/* GRID DE ENTRENADORES */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {coaches.map((coach) => {
            const waPhone = coach.phone?.replace(/\D/g, "")
            const waHref = waPhone
              ? `https://wa.me/${waPhone}?text=${encodeURIComponent(`Hola Coach ${coach.name}, quisiera información sobre entrenamiento personalizado en ${settings.appName || 'el gimnasio'}.`)}`
              : null

            return (
              <div
                key={coach.id}
                className="group rounded-3xl border border-border/60 bg-card overflow-hidden shadow-lg hover:border-primary/50 hover:shadow-primary/10 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* FOTO DEL ENTRENADOR */}
                  <div className="relative h-72 sm:h-80 w-full overflow-hidden bg-black/40">
                    <img
                      src={coach.photo || "https://images.unsplash.com/photo-1567013127542-490d757e51fc?q=80&w=800&auto=format&fit=crop"}
                      alt={coach.name}
                      className="w-full h-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105"
                    />

                    {/* BADGE DE COACH CERTIFICADO */}
                    <div className="absolute top-4 left-4 z-10 flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/70 backdrop-blur-md border border-primary/30 text-xs font-bold text-primary shadow-md">
                      <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                      <span>Coach Certificado</span>
                    </div>

                    {coach.experience && (
                      <div className="absolute bottom-4 left-4 z-10 flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/80 backdrop-blur-md border border-white/10 text-xs font-medium text-foreground">
                        <Award className="w-3.5 h-3.5 text-primary" />
                        <span>{coach.experience}</span>
                      </div>
                    )}
                  </div>

                  {/* CUERPO INFORMATIVO */}
                  <div className="p-5 sm:p-6 space-y-3">
                    <h3 className="text-xl font-black text-foreground group-hover:text-primary transition-colors">
                      {coach.name}
                    </h3>

                    {coach.specialty && (
                      <p className="text-xs font-bold text-primary flex items-center gap-1.5">
                        <Dumbbell className="w-3.5 h-3.5 text-primary shrink-0" />
                        <span>{coach.specialty}</span>
                      </p>
                    )}

                    {coach.bio && (
                      <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                        {coach.bio}
                      </p>
                    )}
                  </div>
                </div>

                {/* ACCIONES DEL COACH */}
                <div className="p-5 sm:p-6 pt-0 border-t border-border/40 mt-4 flex items-center justify-between gap-3">
                  {coach.instagram && (
                    <a
                      href={coach.instagram.startsWith("http") ? coach.instagram : `https://instagram.com/${coach.instagram.replace("@", "")}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs font-bold text-muted-foreground hover:text-foreground flex items-center gap-1.5 transition pt-3"
                    >
                      <svg className="w-4 h-4 text-pink-500 inline-block" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                        <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                      </svg>
                      <span>{coach.instagram.startsWith("@") ? coach.instagram : `@${coach.instagram}`}</span>
                    </a>
                  )}

                  {waHref ? (
                    <a
                      href={waHref}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500 hover:text-black font-bold text-xs transition border border-emerald-500/30 mt-3 ml-auto"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>Consultar</span>
                    </a>
                  ) : (
                    <a
                      href="#planes"
                      className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline mt-3 ml-auto"
                    >
                      <span>Entrenar con este coach</span>
                    </a>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
