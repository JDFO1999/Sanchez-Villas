"use client"

import React from "react"
import { useSettings } from "@/lib/settings-context"
import { Check, Sparkles, CreditCard, ArrowRight, ShieldCheck } from "lucide-react"

export function PlansSection() {
  const { settings } = useSettings()

  const plansData = settings.landingSettings?.plansSettings || {
    badge: 'MEMBRESÍAS & PLANES',
    title: 'INVULNÉRABILIDAD Y CONSTANCIA: ELIGE TU PLAN',
    subtitle: 'Planes flexibles diseñados para tus metas, con acceso completo a equipamiento de primer nivel y asesoría continua.',
    plans: [
      {
        id: '1',
        name: 'Plan Básico Mensual',
        price: '$25',
        billingPeriod: '/mes',
        description: 'Ideal para quienes inician su disciplina física con acceso libre al área de pesas.',
        highlight: false,
        badge: '',
        features: [
          'Acceso a zona de pesas y musculación',
          'Vestuarios y duchas con agua caliente',
          'Evaluación física inicial básica',
          'Horario ilimitado de lunes a sábado'
        ],
        ctaText: 'Comenzar Ahora',
        ctaLink: '#contacto'
      },
      {
        id: '2',
        name: 'Plan Pro Fitness',
        price: '$35',
        billingPeriod: '/mes',
        description: 'El plan favorito: musculación completa más acceso libre a clases grupales y spinning.',
        highlight: true,
        badge: 'MÁS POPULAR',
        features: [
          'Todo lo del Plan Básico',
          'Acceso ilimitado a Spinning y Cross Training',
          'Rutina personalizada digital en la app',
          'Casillero personal asignado en vestuario',
          'Descuento del 10% en tienda y suplementos'
        ],
        ctaText: 'Elegir Plan Pro',
        ctaLink: '#contacto'
      },
      {
        id: '3',
        name: 'Plan Elite Personalizado',
        price: '$50',
        billingPeriod: '/mes',
        description: 'Entrenamiento de alto nivel con asesoría de coach dedicado y seguimiento biométrico semanal.',
        highlight: false,
        badge: 'RECOMENDADO',
        features: [
          'Todo lo del Plan Pro Fitness',
          'Asesoría técnica y corrección con Coach',
          'Monitoreo biométrico y de composición corporal',
          'Plan nutricional sugerido y ajuste de cargas',
          'Acceso VIP a todas las áreas y disciplinas'
        ],
        ctaText: 'Unirme a Elite',
        ctaLink: '#contacto'
      },
      {
        id: '4',
        name: 'Pase Anual Black Evolution',
        price: '$300',
        billingPeriod: '/año',
        description: 'Compromiso total a largo plazo con el mayor ahorro: entrena todo el año sin preocupaciones.',
        highlight: false,
        badge: 'MEJOR VALOR',
        features: [
          'Acceso total 365 días a todas las disciplinas',
          'Congelación de membresía por viaje hasta 30 días',
          '2 Pases de invitado al mes gratis',
          'Camiseta oficial del gimnasio de regalo',
          'Prioridad en eventos y retos de comunidad'
        ],
        ctaText: 'Obtener Pase Anual',
        ctaLink: '#contacto'
      }
    ]
  }

  const plans = plansData.plans || []

  return (
    <section id="planes" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative scroll-mt-16">
      
      {/* SECTION TITLE & BADGE */}
      <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-extrabold uppercase tracking-widest">
          <CreditCard className="w-3.5 h-3.5" />
          {plansData.badge || 'MEMBRESÍAS & PLANES'}
        </div>
        
        <h2 className="font-display text-3xl sm:text-5xl font-black uppercase tracking-tight text-foreground">
          {plansData.title || 'INVULNÉRABILIDAD Y CONSTANCIA: ELIGE TU PLAN'}
        </h2>
        
        <p className="text-muted-foreground text-base sm:text-lg">
          {plansData.subtitle || 'Planes flexibles diseñados para tus metas, con acceso completo a equipamiento de primer nivel y asesoría continua.'}
        </p>
      </div>

      {/* 4 CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
        {plans.map((plan, idx) => {
          const isHighlighted = !!plan.highlight;

          return (
            <div
              key={plan.id || idx}
              className={`rounded-3xl p-6 sm:p-7 flex flex-col justify-between transition-all duration-300 relative group ${
                isHighlighted
                  ? 'bg-card border-2 border-primary shadow-2xl shadow-primary/15 lg:-translate-y-2'
                  : 'bg-card border border-border hover:border-primary/50 hover:shadow-xl'
              }`}
            >
              {/* HIGHLIGHT OR CUSTOM BADGE */}
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-md ${
                    isHighlighted 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-foreground text-background'
                  }`}>
                    <Sparkles className="w-3 h-3" />
                    {plan.badge}
                  </span>
                </div>
              )}

              {/* CARD TOP INFO */}
              <div>
                <div className="mb-4">
                  <h3 className="font-display text-xl font-black uppercase tracking-wide text-foreground">
                    {plan.name}
                  </h3>
                  {plan.description && (
                    <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed min-h-[38px]">
                      {plan.description}
                    </p>
                  )}
                </div>

                {/* PRICE ROW */}
                <div className="py-4 border-y border-border/60 my-4 flex items-baseline gap-1.5">
                  <span className="font-display text-4xl sm:text-5xl font-black text-primary tracking-tight">
                    {plan.price}
                  </span>
                  <span className="text-xs font-bold text-muted-foreground uppercase">
                    {plan.billingPeriod || '/mes'}
                  </span>
                </div>

                {/* BENEFICIOS / FEATURES */}
                <div className="space-y-3 pt-2 pb-6">
                  <p className="text-[11px] font-extrabold uppercase tracking-widest text-muted-foreground">
                    Beneficios Incluidos:
                  </p>
                  <ul className="space-y-2.5">
                    {(plan.features || []).map((feat, fIdx) => (
                      <li key={fIdx} className="flex items-start gap-2.5 text-xs text-foreground/90 leading-tight">
                        <div className="p-0.5 rounded-full bg-primary/20 text-primary mt-0.5 shrink-0">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* CTA BUTTON - PURE OUTLINE STYLE */}
              <div className="pt-4 border-t border-border/40">
                <a
                  href={plan.ctaLink || '#contacto'}
                  className={`w-full py-3 px-4 rounded-xl font-black text-xs uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2 group-hover:gap-3 cursor-pointer ${
                    isHighlighted
                      ? 'bg-transparent border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground'
                      : 'bg-transparent border-2 border-primary/50 text-foreground hover:border-primary hover:text-primary hover:bg-primary/10'
                  }`}
                >
                  <span>{plan.ctaText || 'Elegir Plan'}</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                </a>
              </div>
            </div>
          )
        })}
      </div>

      {/* FOOTNOTE GUARANTEE */}
      <div className="mt-12 text-center flex items-center justify-center gap-2 text-xs text-muted-foreground font-medium">
        <ShieldCheck className="w-4 h-4 text-primary" />
        <span>Sin contratos forzosos. Consulta con nuestro equipo por descuentos a grupos y empresas.</span>
      </div>
    </section>
  )
}
