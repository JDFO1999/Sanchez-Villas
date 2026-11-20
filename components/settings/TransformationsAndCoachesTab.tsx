"use client"

import React, { useState, useEffect } from "react"
import { useSettings } from "@/lib/settings-context"
import { useToast } from "@/lib/toast-context"
import {
  Sparkles,
  Users,
  Plus,
  Trash2,
  Save,
  ExternalLink,
  CheckCircle2,
  RefreshCw,
  Award,
  Clock,
  TrendingUp,
  Dumbbell,
  Phone,
} from "lucide-react"
import { DraggableImageFrame } from "./DraggableImageFrame"
import { getCoachesWithAthletesAction } from "@/app/actions/users"
import Link from "next/link"

const DEFAULT_TRANSFORMATIONS = [
  {
    id: "def-1",
    athleteName: "Andrés Silva",
    duration: "4 Meses",
    changeText: "-14 kg grasa / +3.5 kg masa magra",
    description: "Con constancia en el entrenamiento de fuerza y asesoría personalizada, recuperó su energía y redefinió completamente su composición corporal.",
    beforeImage: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?q=80&w=800&auto=format&fit=crop",
    afterImage: "https://images.unsplash.com/photo-1583454155184-870a1f63aebc?q=80&w=800&auto=format&fit=crop",
    beforePosition: "50% 50%",
    afterPosition: "50% 50%",
  },
  {
    id: "def-2",
    athleteName: "Mariana Delgado",
    duration: "3 Meses",
    changeText: "-8 kg / Tonificación y fuerza funcional",
    description: "Superó sus propios límites a través de la disciplina diaria, logrando una postura óptima, fuerza en tren superior y una salud impecable.",
    beforeImage: "https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=800&auto=format&fit=crop",
    afterImage: "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=800&auto=format&fit=crop",
    beforePosition: "50% 30%",
    afterPosition: "50% 30%",
  },
  {
    id: "def-3",
    athleteName: "Roberto González",
    duration: "6 Meses",
    changeText: "+6 kg masa muscular / PR 140 kg Sentadilla",
    description: "Enfoque total en hipertrofia y sobrecarga progresiva. Transformó su disciplina en un estilo de vida de alto rendimiento.",
    beforeImage: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=800&auto=format&fit=crop",
    afterImage: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=800&auto=format&fit=crop",
    beforePosition: "50% 25%",
    afterPosition: "50% 25%",
  },
]

const DEFAULT_COACHES = [
  {
    id: "coach-1",
    name: "Belkis Solano",
    specialty: "Hipertrofia, Musculación & Biomecánica",
    experience: "+7 años de experiencia",
    bio: "Especialista en sobrecarga progresiva, corrección postural y planes de tonificación integral para atletas de todos los niveles.",
    photo: "https://images.unsplash.com/photo-1594381898411-846e7d193883?q=80&w=800&auto=format&fit=crop",
    photoPosition: "50% 20%",
    instagram: "@belkis_coach",
    phone: "+58 412 123 4567",
  },
  {
    id: "coach-2",
    name: "Robert Azuaje",
    specialty: "Powerlifting, Fuerza Máxima & Acondicionamiento",
    experience: "+6 años de experiencia",
    bio: "Preparador enfocado en maximizar marcas de levantamiento, técnica de potencia y prevención activa de lesiones articulares.",
    photo: "https://images.unsplash.com/photo-1567013127542-490d757e51fc?q=80&w=800&auto=format&fit=crop",
    photoPosition: "50% 20%",
    instagram: "@robert_power",
    phone: "+58 414 987 6543",
  },
  {
    id: "coach-3",
    name: "Rosa Tovar",
    specialty: "Entrenamiento Funcional & Pérdida de Grasa",
    experience: "+5 años de experiencia",
    bio: "Metodología orientada a la quema calórica eficiente, agilidad, resistencia cardiovascular y motivación deportiva diaria.",
    photo: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=800&auto=format&fit=crop",
    photoPosition: "50% 20%",
    instagram: "@rosatovar_fit",
    phone: "+58 424 555 1234",
  },
]

export function TransformationsAndCoachesTab() {
  const { settings, updateSettings } = useSettings()
  const { showToast } = useToast()

  const [activeSubTab, setActiveSubTab] = useState<"transformations" | "coaches">("transformations")
  const [isSaving, setIsSaving] = useState(false)
  const [isImporting, setIsImporting] = useState(false)

  // Local states
  const [transConf, setTransConf] = useState({
    badge: settings.landingSettings?.transformationsSettings?.badge || "RESULTADOS COMPROBADOS",
    title: settings.landingSettings?.transformationsSettings?.title || "TRANSFORMACIONES REALES, VIDAS EXTRAORDINARIAS",
    description: settings.landingSettings?.transformationsSettings?.description || "La constancia, el esfuerzo diario y la guía experta de nuestros entrenadores marcan la diferencia. Conoce las historias de éxito de nuestra comunidad.",
    items: settings.landingSettings?.transformationsSettings?.items || DEFAULT_TRANSFORMATIONS,
  })

  const [coachesConf, setCoachesConf] = useState({
    badge: settings.landingSettings?.coachesSettings?.badge || "STAFF DE ÉLITE",
    title: settings.landingSettings?.coachesSettings?.title || "CONOCE A NUESTROS ENTRENADORES",
    description: settings.landingSettings?.coachesSettings?.description || "Profesionales certificados y apasionados por guiar tu técnica, nutrición y evolución deportiva paso a paso.",
    coaches: settings.landingSettings?.coachesSettings?.coaches || DEFAULT_COACHES,
  })

  // Sincronizar si cambia settings exterior
  useEffect(() => {
    if (settings.landingSettings?.transformationsSettings) {
      setTransConf({
        badge: settings.landingSettings.transformationsSettings.badge || "RESULTADOS COMPROBADOS",
        title: settings.landingSettings.transformationsSettings.title || "TRANSFORMACIONES REALES, VIDAS EXTRAORDINARIAS",
        description: settings.landingSettings.transformationsSettings.description || "",
        items: settings.landingSettings.transformationsSettings.items?.length
          ? settings.landingSettings.transformationsSettings.items
          : DEFAULT_TRANSFORMATIONS,
      })
    }
    if (settings.landingSettings?.coachesSettings) {
      setCoachesConf({
        badge: settings.landingSettings.coachesSettings.badge || "STAFF DE ÉLITE",
        title: settings.landingSettings.coachesSettings.title || "CONOCE A NUESTROS ENTRENADORES",
        description: settings.landingSettings.coachesSettings.description || "",
        coaches: settings.landingSettings.coachesSettings.coaches?.length
          ? settings.landingSettings.coachesSettings.coaches
          : DEFAULT_COACHES,
      })
    }
  }, [settings])

  // Guardar configuración completa
  const handleSave = async () => {
    setIsSaving(true)
    try {
      const currentLanding = settings.landingSettings || ({} as any)
      const res = await updateSettings({
        landingSettings: {
          ...currentLanding,
          transformationsSettings: transConf,
          coachesSettings: coachesConf,
        },
      })

      if (res && res.success) {
        showToast("¡Configuración guardada exitosamente!", "success")
      } else {
        showToast(res?.error || "Error al guardar los cambios", "error")
      }
    } catch (err: any) {
      console.error("Error saving transformations & coaches:", err)
      showToast("Ocurrió un error al guardar", "error")
    } finally {
      setIsSaving(false)
    }
  }

  // Importar entrenadores del sistema
  const handleImportCoaches = async () => {
    setIsImporting(true)
    try {
      const res = await getCoachesWithAthletesAction()
      if (res.success && res.coaches && res.coaches.length > 0) {
        const existingNames = new Set(coachesConf.coaches.map((c) => c.name.toLowerCase().trim()))
        let addedCount = 0
        const updatedList = [...coachesConf.coaches]

        for (const coach of res.coaches) {
          if (!existingNames.has(coach.name?.toLowerCase().trim())) {
            let specialtyText = "Entrenador Certificado"
            if (coach.specialties) {
              if (typeof coach.specialties === "string" && coach.specialties.trim().startsWith("{")) {
                try {
                  const parsed = JSON.parse(coach.specialties)
                  specialtyText = parsed.text || parsed.specialties || parsed.specialty || specialtyText
                } catch (e) {}
              } else if (typeof coach.specialties === "string") {
                specialtyText = coach.specialties
              }
            }

            updatedList.push({
              id: coach.id,
              name: coach.name,
              specialty: specialtyText,
              experience: "+3 años de experiencia",
              bio: coach.bio || "Entrenador comprometido con la superación física y los objetivos de cada atleta.",
              photo: coach.profilePicture || "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=800&auto=format&fit=crop",
              photoPosition: "50% 20%",
              instagram: coach.instagram || "",
              phone: coach.phone || "",
            })
            addedCount++
          }
        }

        setCoachesConf((prev) => ({ ...prev, coaches: updatedList }))
        if (addedCount > 0) {
          showToast(`¡Se importaron ${addedCount} entrenadores del sistema! Recuerda guardar cambios.`, "success")
        } else {
          showToast("Todos los entrenadores del sistema ya estaban incluidos.", "info")
        }
      } else {
        showToast("No se encontraron entrenadores registrados en el sistema.", "warning")
      }
    } catch (e) {
      console.error(e)
      showToast("Error al importar entrenadores", "error")
    } finally {
      setIsImporting(false)
    }
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* HEADER DE MÓDULO CON ACCIONES */}
      <div className="rounded-3xl border border-black/10 dark:border-white/10 bg-gradient-to-r from-card via-card to-primary/5 p-6 sm:p-8 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-black tracking-wider uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Módulo de Marketing & Staff</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black font-display uppercase tracking-tight text-foreground">
            Casos de Éxito & Entrenadores
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl leading-relaxed">
            Personaliza las historias de transformación física y el equipo de coaches que se muestran en la página principal.
            <strong className="text-foreground font-semibold"> ¡Ahora puedes arrastrar cualquier foto para encuadrarla perfectamente!</strong>
          </p>
        </div>

        <div className="flex items-center gap-3 self-start md:self-center shrink-0">
          <Link
            href="/inicio#transformaciones"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-xs font-bold text-foreground transition border border-border"
          >
            <span>Ver en la Web</span>
            <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
          </Link>

          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-black shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? "Guardando..." : "Guardar Cambios"}</span>
          </button>
        </div>
      </div>

      {/* SUB-TABS INTERACTIVOS */}
      <div className="flex items-center gap-2 p-1.5 bg-black/5 dark:bg-black/30 rounded-2xl border border-black/10 dark:border-white/10 max-w-xl">
        <button
          type="button"
          onClick={() => setActiveSubTab("transformations")}
          className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeSubTab === "transformations"
              ? "bg-primary text-primary-foreground shadow-md font-black"
              : "text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5"
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Transformaciones Reales ({transConf.items.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab("coaches")}
          className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeSubTab === "coaches"
              ? "bg-primary text-primary-foreground shadow-md font-black"
              : "text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5"
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Nuestros Entrenadores ({coachesConf.coaches.length})</span>
        </button>
      </div>

      {/* CONTENIDO 1: TRANSFORMACIONES (ANTES Y DESPUÉS) */}
      {activeSubTab === "transformations" && (
        <div className="space-y-6">
          {/* Encabezados de la Sección */}
          <div className="p-6 rounded-3xl bg-card border border-border shadow-lg space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border/50">
              <h3 className="font-extrabold text-sm uppercase text-foreground tracking-wide flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                Textos de la Sección en la Landing
              </h3>
              <button
                type="button"
                onClick={() => {
                  const newCase = {
                    id: String(Date.now()),
                    athleteName: "Nuevo Atleta",
                    duration: "3 Meses",
                    changeText: "-10 kg grasa / +3 kg músculo",
                    description: "Disciplina inquebrantable, plan de entrenamiento personalizado y hábitos saludables.",
                    beforeImage: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?q=80&w=800&auto=format&fit=crop",
                    afterImage: "https://images.unsplash.com/photo-1583454155184-870a1f63aebc?q=80&w=800&auto=format&fit=crop",
                    beforePosition: "50% 50%",
                    afterPosition: "50% 50%",
                  }
                  setTransConf((prev) => ({ ...prev, items: [newCase, ...prev.items] }))
                  showToast("Nuevo caso agregado. Personalízalo a continuación.", "info")
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow-md hover:brightness-110 active:scale-95 transition"
              >
                <Plus className="w-4 h-4" />
                <span>+ Agregar Transformación</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-bold text-muted-foreground block mb-1">Etiqueta Superior</label>
                <input
                  type="text"
                  value={transConf.badge}
                  onChange={(e) => setTransConf((prev) => ({ ...prev, badge: e.target.value }))}
                  placeholder="Ej. RESULTADOS COMPROBADOS"
                  className="w-full bg-black/5 dark:bg-black/30 border border-border rounded-xl px-3 py-2 text-xs text-foreground font-semibold"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs font-bold text-muted-foreground block mb-1">Título Principal</label>
                <input
                  type="text"
                  value={transConf.title}
                  onChange={(e) => setTransConf((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="Ej. TRANSFORMACIONES REALES, VIDAS EXTRAORDINARIAS"
                  className="w-full bg-black/5 dark:bg-black/30 border border-border rounded-xl px-3 py-2 text-xs text-foreground font-semibold"
                />
              </div>
              <div className="sm:col-span-3">
                <label className="text-xs font-bold text-muted-foreground block mb-1">Subtítulo Descriptivo</label>
                <textarea
                  rows={2}
                  value={transConf.description}
                  onChange={(e) => setTransConf((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe la motivación o el valor de la disciplina en el gimnasio..."
                  className="w-full bg-black/5 dark:bg-black/30 border border-border rounded-xl p-3 text-xs text-foreground resize-none"
                />
              </div>
            </div>
          </div>

          {/* Lista de Tarjetas de Transformación */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {transConf.items.map((item, idx) => {
              const updateItem = (key: string, val: any) => {
                const next = [...transConf.items]
                next[idx] = { ...next[idx], [key]: val }
                setTransConf((prev) => ({ ...prev, items: next }))
              }

              const removeItem = () => {
                if (confirm(`¿Eliminar la transformación de ${item.athleteName}?`)) {
                  setTransConf((prev) => ({
                    ...prev,
                    items: prev.items.filter((_, i) => i !== idx),
                  }))
                }
              }

              return (
                <div
                  key={item.id || idx}
                  className="rounded-3xl border border-border bg-card p-6 shadow-xl space-y-5 relative transition-all hover:border-primary/40 flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    {/* Header de la tarjeta */}
                    <div className="flex items-center justify-between pb-3 border-b border-border/50">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-primary/20 text-primary flex items-center justify-center font-black text-xs">
                          #{idx + 1}
                        </span>
                        <h4 className="font-extrabold text-sm text-foreground">
                          {item.athleteName || "Atleta Sin Nombre"}
                        </h4>
                      </div>

                      <button
                        type="button"
                        onClick={removeItem}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition"
                        title="Eliminar caso de éxito"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* FOTOS INTERACTIVAS: ANTES Y DESPUÉS CON DRAGGABLE REPOSITION */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* FOTO ANTES */}
                      <div className="space-y-1.5">
                        <DraggableImageFrame
                          src={item.beforeImage}
                          position={item.beforePosition || "50% 50%"}
                          onChange={(pos) => updateItem("beforePosition", pos)}
                          label="📸 FOTO ANTES"
                          aspectRatio="aspect-[3/4]"
                          onUpload={(dataUrl) => updateItem("beforeImage", dataUrl)}
                        />
                        <input
                          type="text"
                          value={item.beforeImage || ""}
                          onChange={(e) => updateItem("beforeImage", e.target.value)}
                          placeholder="URL Foto Antes..."
                          className="w-full bg-black/5 dark:bg-black/30 border border-border rounded-lg px-2.5 py-1 text-[11px] text-muted-foreground font-mono"
                        />
                      </div>

                      {/* FOTO DESPUÉS */}
                      <div className="space-y-1.5">
                        <DraggableImageFrame
                          src={item.afterImage}
                          position={item.afterPosition || "50% 50%"}
                          onChange={(pos) => updateItem("afterPosition", pos)}
                          label="🔥 FOTO DESPUÉS"
                          aspectRatio="aspect-[3/4]"
                          onUpload={(dataUrl) => updateItem("afterImage", dataUrl)}
                        />
                        <input
                          type="text"
                          value={item.afterImage || ""}
                          onChange={(e) => updateItem("afterImage", e.target.value)}
                          placeholder="URL Foto Después..."
                          className="w-full bg-black/5 dark:bg-black/30 border border-border rounded-lg px-2.5 py-1 text-[11px] text-muted-foreground font-mono"
                        />
                      </div>
                    </div>

                    {/* DATOS DEL ATLETA */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      <div>
                        <label className="text-[11px] font-bold text-muted-foreground block mb-1">Nombre del Atleta</label>
                        <input
                          type="text"
                          value={item.athleteName || ""}
                          onChange={(e) => updateItem("athleteName", e.target.value)}
                          placeholder="Ej. Andrés Silva"
                          className="w-full bg-black/5 dark:bg-black/30 border border-border rounded-xl px-3 py-2 text-xs font-semibold"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-muted-foreground block mb-1">Duración del Proceso</label>
                        <input
                          type="text"
                          value={item.duration || ""}
                          onChange={(e) => updateItem("duration", e.target.value)}
                          placeholder="Ej. 4 Meses / 16 Semanas"
                          className="w-full bg-black/5 dark:bg-black/30 border border-border rounded-xl px-3 py-2 text-xs font-semibold"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-muted-foreground block mb-1">Métrica o Cambio Destacado</label>
                      <input
                        type="text"
                        value={item.changeText || ""}
                        onChange={(e) => updateItem("changeText", e.target.value)}
                        placeholder="Ej. -14 kg grasa / +3.5 kg masa magra"
                        className="w-full bg-black/5 dark:bg-black/30 border border-border rounded-xl px-3 py-2 text-xs font-bold text-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-muted-foreground block mb-1">Testimonio / Historia de Superación</label>
                      <textarea
                        rows={2}
                        value={item.description || ""}
                        onChange={(e) => updateItem("description", e.target.value)}
                        placeholder="Describe cómo fue su evolución, constancia y disciplina..."
                        className="w-full bg-black/5 dark:bg-black/30 border border-border rounded-xl p-2.5 text-xs text-foreground resize-none"
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* CONTENIDO 2: NUESTROS ENTRENADORES (COACHES) */}
      {activeSubTab === "coaches" && (
        <div className="space-y-6">
          {/* Encabezados y Acciones */}
          <div className="p-6 rounded-3xl bg-card border border-border shadow-lg space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/50">
              <h3 className="font-extrabold text-sm uppercase text-foreground tracking-wide flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" />
                Textos de la Sección en la Landing
              </h3>
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={handleImportCoaches}
                  disabled={isImporting}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 border border-border text-xs font-bold text-foreground transition"
                >
                  <RefreshCw className={`w-3.5 h-3.5 text-primary ${isImporting ? "animate-spin" : ""}`} />
                  <span>{isImporting ? "Importando..." : "📥 Importar Coaches del Sistema"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const newCoach = {
                      id: `coach-${Date.now()}`,
                      name: "Nuevo Entrenador",
                      specialty: "Acondicionamiento Físico & Musculación",
                      experience: "+3 años de experiencia",
                      bio: "Especialista en entrenamiento estructurado, biomecánica y motivación constante.",
                      photo: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=800&auto=format&fit=crop",
                      photoPosition: "50% 20%",
                      instagram: "",
                      phone: "",
                    }
                    setCoachesConf((prev) => ({ ...prev, coaches: [newCoach, ...prev.coaches] }))
                    showToast("Nuevo coach agregado. Personalízalo a continuación.", "info")
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow-md hover:brightness-110 active:scale-95 transition"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Agregar Entrenador</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-bold text-muted-foreground block mb-1">Etiqueta Superior</label>
                <input
                  type="text"
                  value={coachesConf.badge}
                  onChange={(e) => setCoachesConf((prev) => ({ ...prev, badge: e.target.value }))}
                  placeholder="Ej. STAFF DE ÉLITE"
                  className="w-full bg-black/5 dark:bg-black/30 border border-border rounded-xl px-3 py-2 text-xs text-foreground font-semibold"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs font-bold text-muted-foreground block mb-1">Título Principal</label>
                <input
                  type="text"
                  value={coachesConf.title}
                  onChange={(e) => setCoachesConf((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="Ej. CONOCE A NUESTROS ENTRENADORES"
                  className="w-full bg-black/5 dark:bg-black/30 border border-border rounded-xl px-3 py-2 text-xs text-foreground font-semibold"
                />
              </div>
              <div className="sm:col-span-3">
                <label className="text-xs font-bold text-muted-foreground block mb-1">Subtítulo Descriptivo</label>
                <textarea
                  rows={2}
                  value={coachesConf.description}
                  onChange={(e) => setCoachesConf((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe la calidad y preparación del equipo técnico..."
                  className="w-full bg-black/5 dark:bg-black/30 border border-border rounded-xl p-3 text-xs text-foreground resize-none"
                />
              </div>
            </div>
          </div>

          {/* Grid de Entrenadores con Draggable Focal Point */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {coachesConf.coaches.map((coach, idx) => {
              const updateCoach = (key: string, val: any) => {
                const next = [...coachesConf.coaches]
                next[idx] = { ...next[idx], [key]: val }
                setCoachesConf((prev) => ({ ...prev, coaches: next }))
              }

              const removeCoach = () => {
                if (confirm(`¿Eliminar al entrenador ${coach.name}?`)) {
                  setCoachesConf((prev) => ({
                    ...prev,
                    coaches: prev.coaches.filter((_, i) => i !== idx),
                  }))
                }
              }

              return (
                <div
                  key={coach.id || idx}
                  className="rounded-3xl border border-border bg-card p-5 shadow-xl space-y-4 relative transition-all hover:border-primary/40 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    {/* Header Tarjeta */}
                    <div className="flex items-center justify-between pb-2 border-b border-border/50">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-md bg-primary/20 text-primary flex items-center justify-center font-black text-[10px]">
                          #{idx + 1}
                        </span>
                        <h4 className="font-extrabold text-sm text-foreground truncate max-w-[180px]">
                          {coach.name}
                        </h4>
                      </div>

                      <button
                        type="button"
                        onClick={removeCoach}
                        className="p-1 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition"
                        title="Eliminar entrenador"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* FOTO CON REENCUADRE ARRASTRABLE */}
                    <DraggableImageFrame
                      src={coach.photo}
                      position={coach.photoPosition || "50% 20%"}
                      onChange={(pos) => updateCoach("photoPosition", pos)}
                      label="👤 Foto del Coach (Arrastra para encuadrar)"
                      aspectRatio="aspect-[4/3]"
                      onUpload={(dataUrl) => updateCoach("photo", dataUrl)}
                    />

                    <input
                      type="text"
                      value={coach.photo || ""}
                      onChange={(e) => updateCoach("photo", e.target.value)}
                      placeholder="URL de foto o sube una arriba..."
                      className="w-full bg-black/5 dark:bg-black/30 border border-border rounded-lg px-2.5 py-1 text-[11px] text-muted-foreground font-mono"
                    />

                    {/* DATOS DEL COACH */}
                    <div className="space-y-2 pt-1">
                      <div>
                        <label className="text-[11px] font-bold text-muted-foreground block mb-0.5">Nombre Completo</label>
                        <input
                          type="text"
                          value={coach.name || ""}
                          onChange={(e) => updateCoach("name", e.target.value)}
                          placeholder="Ej. Belkis Solano"
                          className="w-full bg-black/5 dark:bg-black/30 border border-border rounded-xl px-3 py-1.5 text-xs font-semibold"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-muted-foreground block mb-0.5">Especialidad Principal</label>
                        <input
                          type="text"
                          value={coach.specialty || ""}
                          onChange={(e) => updateCoach("specialty", e.target.value)}
                          placeholder="Ej. Hipertrofia, Musculación & Biomecánica"
                          className="w-full bg-black/5 dark:bg-black/30 border border-border rounded-xl px-3 py-1.5 text-xs font-semibold text-primary"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-muted-foreground block mb-0.5">Experiencia Acreditada</label>
                        <input
                          type="text"
                          value={coach.experience || ""}
                          onChange={(e) => updateCoach("experience", e.target.value)}
                          placeholder="Ej. +7 años de experiencia"
                          className="w-full bg-black/5 dark:bg-black/30 border border-border rounded-xl px-3 py-1.5 text-xs"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-muted-foreground block mb-0.5">Biografía Breve</label>
                        <textarea
                          rows={2}
                          value={coach.bio || ""}
                          onChange={(e) => updateCoach("bio", e.target.value)}
                          placeholder="Enfoque de entrenamiento o filosofía deportiva..."
                          className="w-full bg-black/5 dark:bg-black/30 border border-border rounded-xl p-2 text-xs resize-none"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <div>
                          <label className="text-[10px] font-bold text-muted-foreground block mb-0.5">Instagram</label>
                          <input
                            type="text"
                            value={coach.instagram || ""}
                            onChange={(e) => updateCoach("instagram", e.target.value)}
                            placeholder="@coach_usuario"
                            className="w-full bg-black/5 dark:bg-black/30 border border-border rounded-lg p-1.5 text-xs"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-muted-foreground block mb-0.5">WhatsApp / Móvil</label>
                          <input
                            type="text"
                            value={coach.phone || ""}
                            onChange={(e) => updateCoach("phone", e.target.value)}
                            placeholder="+58 412 123 4567"
                            className="w-full bg-black/5 dark:bg-black/30 border border-border rounded-lg p-1.5 text-xs"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
