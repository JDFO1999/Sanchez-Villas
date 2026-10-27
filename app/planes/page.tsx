"use client"

import React, { useState, useEffect } from "react"
import { useSettings } from "@/lib/settings-context"
import { useAuth } from "@/lib/auth-context"
import { saveSystemSettingsAction } from "@/app/actions/settings"
import { showSweetToast } from "@/lib/toast-context"
import { 
  CreditCard, 
  Sparkles, 
  Tag, 
  Check, 
  Plus, 
  Trash2, 
  Save, 
  ExternalLink,
  Flame,
  Layers,
  ArrowRight
} from "lucide-react"
import Link from "next/link"

export default function PlanesPromocionesPage() {
  const { settings, updateSettings } = useSettings()
  const { user } = useAuth()
  const [isSaving, setIsSaving] = useState(false)

  // Estado del Plan Estándar
  const [standardPrice, setStandardPrice] = useState<number>(25)
  const [standardPlanName, setStandardPlanName] = useState<string>("Plan Estándar")

  // Estado de los Planes Promocionales (4 Tarjetas)
  const defaultPlansList = [
    {
      id: '1',
      name: 'PLAN CORPORATIVO',
      price: '$15',
      billingPeriod: '/mes',
      description: 'Ideal para Escuelas, Clubes y Federaciones Deportivas.',
      highlight: true,
      badge: 'GRUPO ATLETAS',
      isPromo: true,
      features: [
        'Asesoría técnica y corrección con Coach',
        'Monitoreo biométrico y de composición corporal',
        'Asesoría personalizada',
        'Entrenamiento funcional'
      ],
      ctaText: 'Comenzar Ahora',
      ctaLink: '#contacto'
    },
    {
      id: '2',
      name: 'PLAN MAXIMUM BASICO',
      price: '$25',
      billingPeriod: '/mes',
      description: 'Plan Específico para esas personas decididas en hacer un cambio en su vida y salud.',
      highlight: false,
      badge: 'MÁS DEMANDADO',
      isPromo: false,
      features: [
        'Asesoría técnica y corrección con Coach',
        'Monitoreo biométrico y de composición corporal',
        'Entrenamiento de musculación',
        'Entrenamiento funcional'
      ],
      ctaText: 'Elegir Plan Basico',
      ctaLink: '#contacto'
    },
    {
      id: '3',
      name: 'PLAN SOLO PARA ELLAS',
      price: '$25',
      billingPeriod: '/mes',
      description: 'Entrenamiento de alto nivel con asesoría de coach dedicado para las atletas femeninas.',
      highlight: true,
      badge: 'MAYOR OFERTA',
      isPromo: true,
      features: [
        'Asesoría técnica y corrección con Coach',
        'Monitoreo biométrico y de composición corporal',
        'Plan nutricional sugerido y ajuste de cargas',
        'Entrenamiento Full Body'
      ],
      ctaText: 'Unirme a Ellas!',
      ctaLink: '#contacto'
    },
    {
      id: '4',
      name: 'PLAN ADULTO MAYOR',
      price: '$15',
      billingPeriod: '/mes',
      description: 'Compromiso para la salud del adulto mayor con programas adaptados.',
      highlight: false,
      badge: 'ADULTO MAYOR',
      isPromo: false,
      features: [
        'Asesoría técnica y corrección con Coach',
        'Monitoreo biométrico y de composición corporal',
        'Plan nutricional sugerido y ajuste de cargas',
        'Diagnóstico y mejora de la composición corporal'
      ],
      ctaText: 'ENTRENAR!',
      ctaLink: '#contacto'
    }
  ]

  const [cardsTitle, setCardsTitle] = useState("INVULNÉRABILIDAD Y CONSTANCIA: ELIGE TU PLAN")
  const [cardsBadge, setCardsBadge] = useState("MEMBRESÍAS & PLANES")
  const [cardsSubtitle, setCardsSubtitle] = useState("Planes flexibles diseñados para tus metas, con acceso completo a equipamiento de primer nivel.")
  const [promoPlans, setPromoPlans] = useState<any[]>(defaultPlansList)

  useEffect(() => {
    if (settings) {
      if (settings.monthlyFee !== undefined) {
        setStandardPrice(settings.monthlyFee)
      }
      const existingSettings = settings.landingSettings?.plansSettings
      if (existingSettings) {
        if (existingSettings.title) setCardsTitle(existingSettings.title)
        if (existingSettings.badge) setCardsBadge(existingSettings.badge)
        if (existingSettings.subtitle) setCardsSubtitle(existingSettings.subtitle)
        if (Array.isArray(existingSettings.plans) && existingSettings.plans.length > 0) {
          setPromoPlans(existingSettings.plans)
        }
      }
    }
  }, [settings])

  const updateCardField = (index: number, field: string, value: any) => {
    setPromoPlans(prev => {
      const copy = [...prev]
      copy[index] = { ...copy[index], [field]: value }
      return copy
    })
  }

  const handleFeatureChange = (cardIdx: number, featIdx: number, val: string) => {
    setPromoPlans(prev => {
      const copy = [...prev]
      const feats = [...(copy[cardIdx].features || [])]
      feats[featIdx] = val
      copy[cardIdx] = { ...copy[cardIdx], features: feats }
      return copy
    })
  }

  const handleAddFeature = (cardIdx: number) => {
    setPromoPlans(prev => {
      const copy = [...prev]
      const feats = [...(copy[cardIdx].features || []), "Nuevo beneficio"]
      copy[cardIdx] = { ...copy[cardIdx], features: feats }
      return copy
    })
  }

  const handleRemoveFeature = (cardIdx: number, featIdx: number) => {
    setPromoPlans(prev => {
      const copy = [...prev]
      const feats = [...(copy[cardIdx].features || [])]
      feats.splice(featIdx, 1)
      copy[cardIdx] = { ...copy[cardIdx], features: feats }
      return copy
    })
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const newLandingSettings: any = {
        ...(settings.landingSettings || {}),
        enabled: settings.landingSettings?.enabled ?? true,
        plansSettings: {
          badge: cardsBadge,
          title: cardsTitle,
          subtitle: cardsSubtitle,
          plans: promoPlans
        }
      }

      const res = await updateSettings({
        monthlyFee: Number(standardPrice) || 25,
        landingSettings: newLandingSettings
      })

      if (res.success) {
        showSweetToast("Planes y promociones actualizados exitosamente.", "success")
      } else {
        showSweetToast(res.error || "Error al guardar planes.", "error")
      }
    } catch (err: any) {
      showSweetToast(err?.message || "Error al procesar guardado.", "error")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* HEADER PRINCIPAL */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card/60 backdrop-blur-md p-6 rounded-2xl border border-black/10 dark:border-white/10 shadow-sm">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <Tag className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-black uppercase tracking-tight text-foreground">
              Planes y Promociones
            </h1>
          </div>
          <p className="text-xs text-muted-foreground">
            Gestiona el valor del Plan Estándar base, activa o desactiva promociones y diseña las tarjetas públicas de la página web.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Link
            href="/inicio#planes"
            target="_blank"
            className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl border border-black/10 dark:border-white/10 text-xs font-bold hover:bg-black/5 dark:hover:bg-white/5 transition flex items-center justify-center gap-2 text-muted-foreground hover:text-foreground"
          >
            <ExternalLink className="w-4 h-4" /> Ver en Página Web
          </Link>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-black uppercase tracking-wide hover:bg-primary/90 transition shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" /> {isSaving ? "Guardando..." : "Guardar Cambios"}
          </button>
        </div>
      </div>

      {/* SECCIÓN 1: PLAN ESTÁNDAR / MENSUALIDAD BASE */}
      <div className="bg-card p-6 rounded-2xl border border-black/10 dark:border-white/10 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-black/10 dark:border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-black">
              <CreditCard className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-foreground">Plan Estándar (Mensualidad Base General)</h2>
              <p className="text-xs text-muted-foreground">
                Este es el precio base que se cobra en Recepción, POS y Membresías cuando no se aplica una promoción específica.
              </p>
            </div>
          </div>
          <span className="text-[11px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-500 border border-emerald-500/30">
            Plan Oficial Base
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
          <div>
            <label className="text-xs font-bold text-foreground block mb-1.5">Nombre del Plan Estándar</label>
            <input
              type="text"
              value={standardPlanName}
              onChange={e => setStandardPlanName(e.target.value)}
              className="w-full bg-black/5 dark:bg-[#161922] border border-black/10 dark:border-white/10 rounded-xl p-2.5 text-xs font-bold focus:border-primary focus:outline-none"
              placeholder="Ej. Plan Estándar"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-foreground block mb-1.5">
              Precio Mensual Base ({settings.storeCurrency})
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3 text-xs font-black text-emerald-500 pointer-events-none select-none">
                {settings.storeCurrency}
              </span>
              <input
                type="number"
                min="0"
                step="0.5"
                value={standardPrice}
                onChange={e => setStandardPrice(parseFloat(e.target.value) || 0)}
                className="w-full bg-black/5 dark:bg-[#161922] border border-black/10 dark:border-white/10 rounded-xl py-2.5 pl-14 pr-3 text-sm font-black text-emerald-500 focus:border-emerald-500 focus:outline-none"
                placeholder="25"
              />
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">
              Aproximadamente Bs. {(standardPrice * settings.storeExchangeRate).toFixed(2)} según tasa BCV.
            </p>
          </div>

          <div className="flex flex-col justify-center bg-black/5 dark:bg-white/5 p-3.5 rounded-xl border border-black/5 dark:border-white/5">
            <span className="text-[11px] font-bold text-muted-foreground">Impacto del Plan Estándar:</span>
            <p className="text-[11px] text-foreground/80 mt-1">
              Al guardar, todos los registros de caja, renovaciones de atletas y precios automáticos asumirán este importe como la cuota mensual oficial.
            </p>
          </div>
        </div>
      </div>

      {/* SECCIÓN 2: PLANES Y MEMBRESÍAS PROMOCIONALES (4 TARJETAS) */}
      <div className="space-y-6">
        <div className="bg-card p-6 rounded-2xl border border-black/10 dark:border-white/10 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-4 border-b border-black/10 dark:border-white/10">
            <div>
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-amber-500 fill-amber-500" />
                <h2 className="text-base font-extrabold text-foreground">Tarjetas de Planes y Promociones (Página Web & POS)</h2>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Configura los planes especiales. Al activar el interruptor de promoción, la tarjeta lucirá el distintivo dorado "EN PROMOCIÓN".
              </p>
            </div>
          </div>

          {/* Textos de cabecera de la sección pública */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-bold text-foreground block mb-1">Etiqueta Superior</label>
              <input
                type="text"
                value={cardsBadge}
                onChange={e => setCardsBadge(e.target.value)}
                className="w-full bg-black/5 dark:bg-[#161922] border border-black/10 dark:border-white/10 rounded-xl p-2.5 text-xs font-bold focus:border-primary focus:outline-none"
                placeholder="MEMBRESÍAS & PLANES"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-foreground block mb-1">Título de la Sección</label>
              <input
                type="text"
                value={cardsTitle}
                onChange={e => setCardsTitle(e.target.value)}
                className="w-full bg-black/5 dark:bg-[#161922] border border-black/10 dark:border-white/10 rounded-xl p-2.5 text-xs font-bold focus:border-primary focus:outline-none"
                placeholder="INVULNÉRABILIDAD Y CONSTANCIA: ELIGE TU PLAN"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-foreground block mb-1">Subtítulo Descriptivo</label>
              <input
                type="text"
                value={cardsSubtitle}
                onChange={e => setCardsSubtitle(e.target.value)}
                className="w-full bg-black/5 dark:bg-[#161922] border border-black/10 dark:border-white/10 rounded-xl p-2.5 text-xs focus:border-primary focus:outline-none"
                placeholder="Planes flexibles diseñados para tus metas..."
              />
            </div>
          </div>
        </div>

        {/* GRILLA DE LAS 4 TARJETAS EDITABLES */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {promoPlans.map((plan, idx) => {
            const isPromoActive = Boolean(plan.isPromo)

            return (
              <div 
                key={plan.id || idx}
                className={`rounded-2xl p-5 border flex flex-col justify-between transition-all duration-300 relative ${
                  isPromoActive 
                    ? 'bg-gradient-to-b from-amber-500/10 via-card to-card border-amber-500/40 shadow-xl shadow-amber-500/5 ring-1 ring-amber-500/20'
                    : plan.highlight 
                      ? 'bg-primary/5 border-primary shadow-md' 
                      : 'bg-card border-black/10 dark:border-white/10'
                }`}
              >
                {/* BADGE ELEGANTE "EN PROMOCIÓN" */}
                {isPromoActive && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-10">
                    <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-lg bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white border border-amber-300/40">
                      <Sparkles className="w-3 h-3 text-amber-200 fill-amber-200" />
                      EN PROMOCIÓN
                    </span>
                  </div>
                )}

                <div className="space-y-4 pt-1">
                  {/* Encabezado y Switches */}
                  <div className="flex items-center justify-between pb-3 border-b border-black/10 dark:border-white/10">
                    <span className="text-xs font-black text-muted-foreground uppercase">
                      Tarjeta #{idx + 1}
                    </span>
                    <label className="flex items-center gap-1.5 cursor-pointer text-[11px] font-bold">
                      <input
                        type="checkbox"
                        checked={!!plan.highlight}
                        onChange={e => updateCardField(idx, 'highlight', e.target.checked)}
                        className="rounded text-primary focus:ring-primary h-3.5 w-3.5"
                      />
                      <span>Destacado</span>
                    </label>
                  </div>

                  {/* Switch Elegante: Activar Promoción */}
                  <div className={`p-2.5 rounded-xl border flex items-center justify-between transition-all ${
                    isPromoActive 
                      ? 'bg-amber-500/15 border-amber-500/30 text-amber-500' 
                      : 'bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10 text-muted-foreground'
                  }`}>
                    <div className="flex items-center gap-2">
                      <Flame className={`w-4 h-4 ${isPromoActive ? 'text-amber-500 fill-amber-500' : 'text-muted-foreground'}`} />
                      <span className="text-xs font-extrabold uppercase tracking-tight">
                        {isPromoActive ? "Promoción Activa" : "Activar Promoción"}
                      </span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isPromoActive}
                        onChange={e => updateCardField(idx, 'isPromo', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-black/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500"></div>
                    </label>
                  </div>

                  {/* Nombre del Plan */}
                  <div>
                    <label className="text-[10px] font-bold text-muted-foreground block mb-1">Nombre del Plan</label>
                    <input
                      type="text"
                      value={plan.name || ''}
                      onChange={e => updateCardField(idx, 'name', e.target.value)}
                      className="w-full bg-black/5 dark:bg-[#161922] border border-black/10 dark:border-white/10 rounded-lg p-2 text-xs font-black uppercase focus:border-primary focus:outline-none"
                      placeholder="PLAN CORPORATIVO"
                    />
                  </div>

                  {/* Precio y Frecuencia */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-bold text-muted-foreground block mb-1">Precio</label>
                      <input
                        type="text"
                        value={plan.price || ''}
                        onChange={e => updateCardField(idx, 'price', e.target.value)}
                        className={`w-full bg-black/5 dark:bg-[#161922] border rounded-lg p-2 text-xs font-black focus:outline-none ${
                          isPromoActive ? 'border-amber-500 text-amber-500' : 'border-black/10 dark:border-white/10 text-primary'
                        }`}
                        placeholder="$15"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-muted-foreground block mb-1">Frecuencia</label>
                      <input
                        type="text"
                        value={plan.billingPeriod || '/mes'}
                        onChange={e => updateCardField(idx, 'billingPeriod', e.target.value)}
                        className="w-full bg-black/5 dark:bg-[#161922] border border-black/10 dark:border-white/10 rounded-lg p-2 text-xs focus:border-primary focus:outline-none"
                        placeholder="/mes"
                      />
                    </div>
                  </div>

                  {/* Etiqueta Opcional (Badge personalizado) */}
                  <div>
                    <label className="text-[10px] font-bold text-muted-foreground block mb-1">Etiqueta Badge Adicional</label>
                    <input
                      type="text"
                      value={plan.badge || ''}
                      onChange={e => updateCardField(idx, 'badge', e.target.value)}
                      className="w-full bg-black/5 dark:bg-[#161922] border border-black/10 dark:border-white/10 rounded-lg p-2 text-xs focus:border-primary focus:outline-none"
                      placeholder="Ej. GRUPO ATLETAS"
                    />
                  </div>

                  {/* Descripción Corta */}
                  <div>
                    <label className="text-[10px] font-bold text-muted-foreground block mb-1">Descripción Corta</label>
                    <textarea
                      rows={2}
                      value={plan.description || ''}
                      onChange={e => updateCardField(idx, 'description', e.target.value)}
                      className="w-full bg-black/5 dark:bg-[#161922] border border-black/10 dark:border-white/10 rounded-lg p-2 text-xs focus:border-primary focus:outline-none resize-none"
                      placeholder="Ideal para escuelas, clubes y convenios..."
                    />
                  </div>

                  {/* Lista de Beneficios */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-[10px] font-bold text-muted-foreground">Beneficios Incluidos</label>
                      <button
                        type="button"
                        onClick={() => handleAddFeature(idx)}
                        className="text-[10px] text-primary hover:underline flex items-center gap-0.5 font-bold"
                      >
                        <Plus className="w-3 h-3" /> Agregar
                      </button>
                    </div>
                    <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                      {(plan.features || []).map((feat: string, fIdx: number) => (
                        <div key={fIdx} className="flex items-center gap-1.5">
                          <input
                            type="text"
                            value={feat}
                            onChange={e => handleFeatureChange(idx, fIdx, e.target.value)}
                            className="w-full bg-black/5 dark:bg-[#161922] border border-black/10 dark:border-white/10 rounded px-2 py-1 text-[11px] focus:border-primary focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveFeature(idx, fIdx)}
                            className="p-1 text-muted-foreground hover:text-rose-500 transition"
                            title="Eliminar beneficio"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Botón CTA */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-black/10 dark:border-white/10">
                    <div>
                      <label className="text-[10px] font-bold text-muted-foreground block mb-1">Texto Botón</label>
                      <input
                        type="text"
                        value={plan.ctaText || 'Comenzar Ahora'}
                        onChange={e => updateCardField(idx, 'ctaText', e.target.value)}
                        className="w-full bg-black/5 dark:bg-[#161922] border border-black/10 dark:border-white/10 rounded p-1.5 text-xs font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-muted-foreground block mb-1">Enlace</label>
                      <input
                        type="text"
                        value={plan.ctaLink || '#contacto'}
                        onChange={e => updateCardField(idx, 'ctaLink', e.target.value)}
                        className="w-full bg-black/5 dark:bg-[#161922] border border-black/10 dark:border-white/10 rounded p-1.5 text-xs text-muted-foreground"
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-black/10 dark:border-white/10 text-center">
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${
                    isPromoActive ? 'text-amber-500' : 'text-muted-foreground'
                  }`}>
                    {isPromoActive ? '● Oferta visible en web y POS' : '○ Tarjeta estándar regular'}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
