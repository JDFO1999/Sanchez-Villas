"use client"

import React, { useState } from "react"
import Link from "next/link"
import { 
  Globe, ExternalLink, Type, Image as ImageIcon, Video, Plus, Trash2, 
  MapPin, Store, HeartHandshake, CreditCard, ArrowRight, Sparkles, Users, 
  Flame, Award, Check, Download, RefreshCw 
} from "lucide-react"
import { getCoachesWithAthletesAction } from "@/app/actions/users"
import { DraggableImageFrame } from "./DraggableImageFrame"
import Swal from "sweetalert2"

interface LandingTabProps {
  landingSettings: any
  setLandingSettings: React.Dispatch<React.SetStateAction<any>>
}

export function LandingTab({
  landingSettings,
  setLandingSettings,
}: LandingTabProps) {
  const [isImportingCoaches, setIsImportingCoaches] = useState(false)

  const handleImportSystemCoaches = async () => {
    setIsImportingCoaches(true)
    try {
      const res = await getCoachesWithAthletesAction()
      if (res.success && res.coaches && res.coaches.length > 0) {
        const existingCoaches = landingSettings?.coaches || []
        const existingNames = new Set(existingCoaches.map((c: any) => c.name?.toLowerCase().trim()))

        let addedCount = 0
        const newCoaches = [...existingCoaches]

        for (const coach of res.coaches) {
          if (!existingNames.has(coach.name?.toLowerCase().trim())) {
            let specialtyText = "Entrenador Certificado"
            if (coach.specialties) {
              if (typeof coach.specialties === "string" && coach.specialties.trim().startsWith("{")) {
                try {
                  const parsed = JSON.parse(coach.specialties)
                  specialtyText = parsed.text || parsed.specialties || parsed.specialty || specialtyText
                } catch {}
              } else if (typeof coach.specialties === "string") {
                specialtyText = coach.specialties
              }
            }

            newCoaches.push({
              id: coach.id || String(Date.now() + Math.random()),
              name: coach.name,
              specialty: specialtyText,
              experience: "+4 años de experiencia",
              bio: `Especialista en asesoría personalizada, técnica y evolución constante.`,
              photo: coach.profilePicture || "https://images.unsplash.com/photo-1567013127542-490d757e51fc?q=80&w=800&auto=format&fit=crop",
              instagram: "",
              phone: coach.phone || ""
            })
            addedCount++
          }
        }

        setLandingSettings((prev: any) => ({
          ...prev,
          coaches: newCoaches
        }))

        Swal.fire({
          icon: "success",
          title: "¡Coaches Importados!",
          text: `Se agregaron ${addedCount} entrenadores desde el directorio a la configuración de la Landing.`,
          timer: 2500,
          showConfirmButton: false
        })
      } else {
        Swal.fire("Aviso", "No se encontraron entrenadores registrados en el sistema.", "info")
      }
    } catch {
      Swal.fire("Error", "No se pudieron cargar los entrenadores del sistema.", "error")
    } finally {
      setIsImportingCoaches(false)
    }
  }
  return (
    <div className="space-y-8">
{/* ENCABEZADO Y ACTIVACIÓN */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-primary/10 border border-primary/20">
                <div>
                  <h3 className="text-lg font-black text-foreground flex items-center gap-2">
                    <Globe className="w-5 h-5 text-primary" /> Página Principal Promocional (Landing Page)
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Configura el carrusel de fotos/videos, disciplinas deportivas, mapa de Google Maps y datos de contacto de tu vitrina web.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <a
                    href="/inicio"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/10 dark:bg-white/10 hover:bg-primary/20 text-xs font-bold text-foreground border border-black/10 dark:border-white/10 transition"
                  >
                    <span>Ver Landing</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* LEMA O SLOGAN PRINCIPAL */}
              <div className="space-y-2 p-5 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10">
                <label className="text-sm font-bold flex items-center gap-2 text-foreground">
                  <Type className="w-4 h-4 text-primary" /> Eslogan o Lema Promocional (Hero)
                </label>
                <input
                  type="text"
                  value={landingSettings?.tagline || ''}
                  onChange={e => setLandingSettings((prev: any) => ({ ...prev, tagline: e.target.value }))}
                  placeholder="Ej. Supera tus límites, forja tu mejor versión"
                  className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-lg p-3 text-sm text-foreground focus:border-primary"
                />
              </div>

              {/* GESTOR DE CARRUSEL (FOTOS Y VIDEOS) */}
              <div className="space-y-4 p-5 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-black/10 dark:border-white/10">
                  <div>
                    <h4 className="text-base font-extrabold text-foreground flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-primary" /> Carrusel de Imágenes y Videos del Hero
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      Sube fotos en alta resolución (PNG, JPG, WebP) o videos (MP4) para cautivar a los visitantes de tu gimnasio.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const newSlide = {
                        id: String(Date.now()),
                        type: 'image',
                        url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1920&auto=format&fit=crop',
                        title: 'NUEVO SLIDE',
                        subtitle: 'Descripción motivacional de este slide.',
                        ctaText: 'Ver Disciplinas',
                        ctaLink: '#disciplinas'
                      };
                      setLandingSettings((prev: any) => ({
                        ...prev,
                        heroSlides: [...(prev?.heroSlides || []), newSlide]
                      }));
                    }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow-md hover:brightness-110 active:scale-95 transition"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Agregar Slide</span>
                  </button>
                </div>

                {/* LISTA DE SLIDES */}
                <div className="space-y-4 pt-2">
                  {(!landingSettings?.heroSlides || landingSettings.heroSlides.length === 0) && (
                    <div className="p-8 text-center text-sm text-muted-foreground border border-dashed border-black/20 dark:border-white/20 rounded-xl">
                      No hay diapositivas agregadas aún. Haz clic en "Agregar Slide" para comenzar.
                    </div>
                  )}

                  {landingSettings?.heroSlides?.map((slide: any, idx: number) => (
                    <div key={slide.id || idx} className="p-4 rounded-xl bg-card border border-black/10 dark:border-white/10 shadow-sm space-y-4">
                      <div className="flex items-center justify-between gap-2 pb-2 border-b border-border">
                        <span className="text-xs font-black uppercase text-primary tracking-wider">Slide #{idx + 1}</span>
                        <button
                          type="button"
                          onClick={() => {
                            const updated = landingSettings.heroSlides.filter((_: any, i: number) => i !== idx);
                            setLandingSettings((prev: any) => ({ ...prev, heroSlides: updated }));
                          }}
                          className="text-xs text-destructive hover:bg-destructive/10 p-1.5 rounded-lg font-bold flex items-center gap-1 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Eliminar</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* PREVIEW Y SUBIDA CON REENCUADRE ARRASTRABLE */}
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-muted-foreground block">Multimedia (Imagen o Video)</label>
                          {slide.type === 'video' ? (
                            <div className="h-32 w-full bg-black/20 rounded-xl overflow-hidden border border-black/10 dark:border-white/10 flex items-center justify-center relative group">
                              <video src={slide.url} className="w-full h-full object-cover" muted />
                              <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white text-xs font-bold cursor-pointer transition">
                                <span>Cambiar Video</span>
                                <input
                                  type="file"
                                  accept="video/mp4,video/webm"
                                  className="hidden"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      const reader = new FileReader();
                                      reader.onloadend = () => {
                                        const arr = [...landingSettings.heroSlides];
                                        arr[idx].url = reader.result as string;
                                        arr[idx].type = 'video';
                                        setLandingSettings((prev: any) => ({ ...prev, heroSlides: arr }));
                                      };
                                      reader.readAsDataURL(file);
                                    }
                                  }}
                                />
                              </label>
                            </div>
                          ) : (
                            <DraggableImageFrame
                              src={slide.url}
                              position={slide.position || "50% 50%"}
                              onChange={(pos) => {
                                const arr = [...landingSettings.heroSlides];
                                arr[idx].position = pos;
                                setLandingSettings((prev: any) => ({ ...prev, heroSlides: arr }));
                              }}
                              label={`Slide #${idx + 1} (Arrastra para encuadrar)`}
                              aspectRatio="aspect-video"
                              onUpload={(dataUrl) => {
                                const arr = [...landingSettings.heroSlides];
                                arr[idx].url = dataUrl;
                                arr[idx].type = 'image';
                                setLandingSettings((prev: any) => ({ ...prev, heroSlides: arr }));
                              }}
                            />
                          )}
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={slide.url || ''}
                              placeholder="O pega URL (https://...)"
                              onChange={(e) => {
                                const arr = [...landingSettings.heroSlides];
                                arr[idx].url = e.target.value;
                                setLandingSettings((prev: any) => ({ ...prev, heroSlides: arr }));
                              }}
                              className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-lg p-2 text-xs"
                            />
                            <select
                              value={slide.type || 'image'}
                              onChange={(e) => {
                                const arr = [...landingSettings.heroSlides];
                                arr[idx].type = e.target.value;
                                setLandingSettings((prev: any) => ({ ...prev, heroSlides: arr }));
                              }}
                              className="bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-lg p-2 text-xs"
                            >
                              <option value="image">Foto</option>
                              <option value="video">Video</option>
                            </select>
                          </div>
                        </div>

                        {/* TITULOS */}
                        <div className="space-y-2 md:col-span-2">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="text-xs font-bold text-muted-foreground block mb-1">Título Principal</label>
                              <input
                                type="text"
                                value={slide.title || ''}
                                onChange={(e) => {
                                  const arr = [...landingSettings.heroSlides];
                                  arr[idx].title = e.target.value;
                                  setLandingSettings((prev: any) => ({ ...prev, heroSlides: arr }));
                                }}
                                placeholder="Ej. TRANSFORMA TU CUERPO"
                                className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-lg p-2 text-xs font-bold focus:border-primary"
                              />
                            </div>
                            <div>
                              <label className="text-xs font-bold text-muted-foreground block mb-1">Subtítulo / Mensaje</label>
                              <input
                                type="text"
                                value={slide.subtitle || ''}
                                onChange={(e) => {
                                  const arr = [...landingSettings.heroSlides];
                                  arr[idx].subtitle = e.target.value;
                                  setLandingSettings((prev: any) => ({ ...prev, heroSlides: arr }));
                                }}
                                placeholder="Ej. Instalaciones de alto rendimiento..."
                                className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-lg p-2 text-xs focus:border-primary"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                            <div>
                              <label className="text-xs font-bold text-muted-foreground block mb-1">Texto del Botón</label>
                              <input
                                type="text"
                                value={slide.ctaText || ''}
                                onChange={(e) => {
                                  const arr = [...landingSettings.heroSlides];
                                  arr[idx].ctaText = e.target.value;
                                  setLandingSettings((prev: any) => ({ ...prev, heroSlides: arr }));
                                }}
                                placeholder="Ej. Ver Disciplinas"
                                className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-lg p-2 text-xs focus:border-primary"
                              />
                            </div>
                            <div>
                              <label className="text-xs font-bold text-muted-foreground block mb-1">Enlace del Botón (#sección)</label>
                              <input
                                type="text"
                                value={slide.ctaLink || ''}
                                onChange={(e) => {
                                  const arr = [...landingSettings.heroSlides];
                                  arr[idx].ctaLink = e.target.value;
                                  setLandingSettings((prev: any) => ({ ...prev, heroSlides: arr }));
                                }}
                                placeholder="Ej. #disciplinas o #ubicacion"
                                className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-lg p-2 text-xs focus:border-primary"
                              />
                            </div>
                          </div>
                        </div>

                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* GESTOR DE DISCIPLINAS */}
              <div className="space-y-4 p-5 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-black/10 dark:border-white/10">
                  <div>
                    <h4 className="text-base font-extrabold text-foreground flex items-center gap-2">
                      <Store className="w-4 h-4 text-primary" /> Catálogo de Disciplinas Deportivas
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      Muestra las especialidades de tu gimnasio: Musculación, Funcional, Boxeo, Spinning, etc. Puedes registrar más de 6 disciplinas y se adaptarán automáticamente al 100% en columnas responsivas.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const newDisc = {
                        id: String(Date.now()),
                        title: 'Nueva Disciplina',
                        description: 'Breve resumen de los beneficios y objetivos de esta disciplina.',
                        imageUrl: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=800&auto=format&fit=crop',
                        intensity: 'Alta',
                        schedule: 'Lunes a Sábado'
                      };
                      setLandingSettings((prev: any) => ({
                        ...prev,
                        disciplines: [...(prev?.disciplines || []), newDisc]
                      }));
                    }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow-md hover:brightness-110 active:scale-95 transition"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Agregar Disciplina</span>
                  </button>
                </div>

                {/* TITULO Y SUBTITULO DE SECCION DE DISCIPLINAS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-xl bg-black/5 dark:bg-black/20 border border-border/40">
                  <div>
                    <label className="text-xs font-bold text-foreground block mb-1">Título de la Sección de Disciplinas</label>
                    <input
                      type="text"
                      value={landingSettings?.disciplinesTitle ?? 'ENTRENA A TU MANERA, SUPERA TUS LÍMITES'}
                      onChange={(e) => setLandingSettings((prev: any) => ({ ...prev, disciplinesTitle: e.target.value }))}
                      placeholder="Ej. ENTRENA A TU MANERA, SUPERA TUS LÍMITES"
                      className="w-full bg-black/5 dark:bg-black/40 border border-border rounded-lg p-2 text-xs font-bold focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-foreground block mb-1">Subtítulo Descriptivo</label>
                    <input
                      type="text"
                      value={landingSettings?.disciplinesSubtitle ?? 'Disponemos de programas y áreas diseñadas para todos los niveles, desde principiantes hasta atletas de alto rendimiento.'}
                      onChange={(e) => setLandingSettings((prev: any) => ({ ...prev, disciplinesSubtitle: e.target.value }))}
                      placeholder="Ej. Disponemos de programas..."
                      className="w-full bg-black/5 dark:bg-black/40 border border-border rounded-lg p-2 text-xs focus:border-primary"
                    />
                  </div>
                </div>

                {/* GRID DE DISCIPLINAS */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  {(!landingSettings?.disciplines || landingSettings.disciplines.length === 0) && (
                    <div className="md:col-span-2 p-8 text-center text-sm text-muted-foreground border border-dashed border-black/20 dark:border-white/20 rounded-xl">
                      No hay disciplinas registradas. Haz clic en "Agregar Disciplina" para añadir una.
                    </div>
                  )}

                  {landingSettings?.disciplines?.map((disc: any, idx: number) => (
                    <div key={disc.id || idx} className="p-4 rounded-xl bg-card border border-border shadow-sm space-y-3">
                      <div className="flex items-center justify-between gap-2 pb-2 border-b border-border">
                        <span className="text-xs font-black uppercase text-primary">Disciplina #{idx + 1}</span>
                        <button
                          type="button"
                          onClick={() => {
                            const updated = landingSettings.disciplines.filter((_: any, i: number) => i !== idx);
                            setLandingSettings((prev: any) => ({ ...prev, disciplines: updated }));
                          }}
                          className="text-xs text-destructive hover:bg-destructive/10 p-1.5 rounded-lg font-bold flex items-center gap-1 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Eliminar</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-1.5">
                          <DraggableImageFrame
                            src={disc.imageUrl}
                            position={disc.position || "50% 50%"}
                            onChange={(pos) => {
                              const arr = [...landingSettings.disciplines];
                              arr[idx].position = pos;
                              setLandingSettings((prev: any) => ({ ...prev, disciplines: arr }));
                            }}
                            label="📸 Foto (Arrastra para encuadrar)"
                            aspectRatio="aspect-[4/3]"
                            onUpload={(dataUrl) => {
                              const arr = [...landingSettings.disciplines];
                              arr[idx].imageUrl = dataUrl;
                              setLandingSettings((prev: any) => ({ ...prev, disciplines: arr }));
                            }}
                          />
                          <input
                            type="text"
                            value={disc.imageUrl || ''}
                            onChange={(e) => {
                              const arr = [...landingSettings.disciplines];
                              arr[idx].imageUrl = e.target.value;
                              setLandingSettings((prev: any) => ({ ...prev, disciplines: arr }));
                            }}
                            placeholder="URL imagen..."
                            className="w-full bg-black/5 dark:bg-black/40 border border-border rounded p-1.5 text-[11px]"
                          />
                        </div>

                        <div className="md:col-span-2 space-y-2">
                          <input
                            type="text"
                            value={disc.title || ''}
                            onChange={(e) => {
                              const arr = [...landingSettings.disciplines];
                              arr[idx].title = e.target.value;
                              setLandingSettings((prev: any) => ({ ...prev, disciplines: arr }));
                            }}
                            placeholder="Nombre (ej. Musculación)"
                            className="w-full bg-black/5 dark:bg-black/40 border border-border rounded-lg p-2 text-xs font-bold"
                          />
                          <textarea
                            rows={2}
                            value={disc.description || ''}
                            onChange={(e) => {
                              const arr = [...landingSettings.disciplines];
                              arr[idx].description = e.target.value;
                              setLandingSettings((prev: any) => ({ ...prev, disciplines: arr }));
                            }}
                            placeholder="Descripción breve..."
                            className="w-full bg-black/5 dark:bg-black/40 border border-border rounded-lg p-2 text-xs resize-none"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 pt-1">
                        <div>
                          <label className="text-[10px] font-bold text-muted-foreground block mb-0.5">Intensidad</label>
                          <select
                            value={disc.intensity || 'Alta'}
                            onChange={(e) => {
                              const arr = [...landingSettings.disciplines];
                              arr[idx].intensity = e.target.value;
                              setLandingSettings((prev: any) => ({ ...prev, disciplines: arr }));
                            }}
                            className="w-full bg-black/5 dark:bg-black/40 border border-border rounded-lg p-1.5 text-xs"
                          >
                            <option value="Baja">Baja</option>
                            <option value="Media">Media</option>
                            <option value="Alta">Alta</option>
                            <option value="Extrema">Extrema</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-muted-foreground block mb-0.5">Horarios o Días</label>
                          <input
                            type="text"
                            value={disc.schedule || ''}
                            onChange={(e) => {
                              const arr = [...landingSettings.disciplines];
                              arr[idx].schedule = e.target.value;
                              setLandingSettings((prev: any) => ({ ...prev, disciplines: arr }));
                            }}
                            placeholder="Ej. Lunes a Sábado"
                            className="w-full bg-black/5 dark:bg-black/40 border border-border rounded-lg p-1.5 text-xs"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* GESTOR DE "NUESTRA PROMESA" Y FOTOS DE INSTALACIONES */}
              <div className="space-y-4 p-5 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10">
                <div className="pb-3 border-b border-black/10 dark:border-white/10">
                  <h4 className="text-base font-extrabold text-foreground flex items-center gap-2">
                    <HeartHandshake className="w-4 h-4 text-primary" /> Sección "Nuestra Promesa & Instalaciones"
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Personaliza los títulos y las 4 fotos representativas de tus instalaciones, máquinas y áreas de entrenamiento.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-bold text-foreground block mb-1">Etiqueta Superior</label>
                    <input
                      type="text"
                      value={landingSettings?.promiseSettings?.badge ?? 'NUESTRA PROMESA'}
                      onChange={(e) => setLandingSettings((prev: any) => ({
                        ...prev,
                        promiseSettings: { ...(prev?.promiseSettings || {}), badge: e.target.value }
                      }))}
                      placeholder="Ej. NUESTRA PROMESA"
                      className="w-full bg-black/5 dark:bg-black/40 border border-border rounded-lg p-2 text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-foreground block mb-1">Título Principal</label>
                    <input
                      type="text"
                      value={landingSettings?.promiseSettings?.title ?? 'UN ESPACIO PENSADO PARA TU EVOLUCIÓN'}
                      onChange={(e) => setLandingSettings((prev: any) => ({
                        ...prev,
                        promiseSettings: { ...(prev?.promiseSettings || {}), title: e.target.value }
                      }))}
                      placeholder="Ej. UN ESPACIO PENSADO PARA TU EVOLUCIÓN"
                      className="w-full bg-black/5 dark:bg-black/40 border border-border rounded-lg p-2 text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-foreground block mb-1">Texto de la Promesa</label>
                    <input
                      type="text"
                      value={landingSettings?.promiseSettings?.description ?? 'no solo entrenas: formas parte de un estilo de vida enfocado en la disciplina, la superación y los resultados reales.'}
                      onChange={(e) => setLandingSettings((prev: any) => ({
                        ...prev,
                        promiseSettings: { ...(prev?.promiseSettings || {}), description: e.target.value }
                      }))}
                      placeholder="Ej. no solo entrenas: formas parte..."
                      className="w-full bg-black/5 dark:bg-black/40 border border-border rounded-lg p-2 text-xs"
                    />
                  </div>
                </div>

                {/* 4 FOTOS DE INSTALACIONES */}
                <div className="pt-2">
                  <label className="text-xs font-bold text-muted-foreground block mb-3">Las 4 Fotografías de la Galería de Instalaciones:</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[0, 1, 2, 3].map((imgIdx) => {
                      const currentImages = landingSettings?.promiseSettings?.images || [
                        'https://images.unsplash.com/photo-1574680096145-d05b474e2155?q=80&w=800&auto=format&fit=crop',
                        'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?q=80&w=800&auto=format&fit=crop',
                        'https://images.unsplash.com/photo-1534367507873-d2d7e24c797f?q=80&w=800&auto=format&fit=crop',
                        'https://images.unsplash.com/photo-1599058917212-d750089bc07e?q=80&w=800&auto=format&fit=crop'
                      ];
                      const currentPositions = landingSettings?.promiseSettings?.imagePositions || [
                        '50% 50%', '50% 50%', '50% 50%', '50% 50%'
                      ];
                      const imgSrc = currentImages[imgIdx] || '';
                      return (
                        <div key={imgIdx} className="p-3 rounded-2xl bg-card border border-border space-y-2">
                          <DraggableImageFrame
                            src={imgSrc}
                            position={currentPositions[imgIdx] || "50% 50%"}
                            onChange={(pos) => {
                              const newPositions = [...currentPositions];
                              newPositions[imgIdx] = pos;
                              setLandingSettings((prev: any) => ({
                                ...prev,
                                promiseSettings: { ...(prev?.promiseSettings || {}), imagePositions: newPositions }
                              }));
                            }}
                            label={`📸 Instalación #${imgIdx + 1}`}
                            aspectRatio="aspect-[4/3]"
                            onUpload={(dataUrl) => {
                              const newImages = [...currentImages];
                              newImages[imgIdx] = dataUrl;
                              setLandingSettings((prev: any) => ({
                                ...prev,
                                promiseSettings: { ...(prev?.promiseSettings || {}), images: newImages }
                              }));
                            }}
                          />
                          <input
                            type="text"
                            value={imgSrc}
                            onChange={(e) => {
                              const newImages = [...currentImages];
                              newImages[imgIdx] = e.target.value;
                              setLandingSettings((prev: any) => ({
                                ...prev,
                                promiseSettings: { ...(prev?.promiseSettings || {}), images: newImages }
                              }));
                            }}
                            placeholder="O pega URL de imagen"
                            className="w-full bg-black/5 dark:bg-black/40 border border-border rounded-lg p-1.5 text-[11px]"
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* ACCESO AL MÓDULO INDEPENDIENTE DE CASOS DE ÉXITO & COACHES */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-primary/5 to-transparent border border-primary/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-primary/20 text-primary shrink-0">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-foreground">Casos de Éxito & Staff de Entrenadores</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Esta sección ahora cuenta con su <strong>módulo dedicado</strong> en la pestaña superior con <strong>reencuadre interactivo de imágenes arrastrando con el ratón</strong>.
                    </p>
                  </div>
                </div>
              </div>

              {/* MÓDULO INDEPENDIENTE DE PLANES Y MEMBRESÍAS */}
              <div className="p-4 sm:p-5 rounded-2xl bg-primary/5 border border-primary/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-primary/10 text-primary shrink-0">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-foreground">Gestión de Planes y Membresías de la Página Principal</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Esta sección ahora se administra de forma unificada en el módulo independiente <strong>Planes / Promos</strong> con sincronización en tiempo real para la Landing Page y el POS de caja.
                    </p>
                  </div>
                </div>
                <Link
                  href="/planes"
                  className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition shadow-sm whitespace-nowrap shrink-0"
                >
                  Ir al módulo de Planes
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* GESTOR DE UBICACIÓN Y GOOGLE MAPS */}
              <div className="space-y-4 p-5 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-black/10 dark:border-white/10">
                  <h4 className="text-base font-extrabold text-foreground flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-primary" /> Ubicación y Mapa Interactivo (Google Maps)
                  </h4>
                  <button
                    type="button"
                    onClick={() => {
                      setLandingSettings((prev: any) => ({
                        ...prev,
                        map: {
                          ...(prev?.map || {}),
                          embedUrl: "https://maps.google.com/maps?q=10.3356845,-68.7391279+(Maximum+Evolution+Fit)&t=&z=17&ie=UTF8&iwloc=&output=embed",
                          address: "Centro comercial rospier local 28, 29 y 30, 5ta Av con avenida la patria, San Felipe, Yaracuy, Venezuela",
                          googleMapsUrl: "https://www.google.com/maps/place/?q=place_id:ChIJV1stlkrPgI4Rl7xpcD1p26w",
                          infoCardTitle: "Información del Gym"
                        }
                      }))
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/15 hover:bg-primary/25 text-primary text-xs font-bold transition self-start sm:self-auto"
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    <span>📍 Autocompletar Ubicación Oficial (San Felipe)</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-xs font-bold text-foreground block">
                      URL del Mapa Embebido de Google Maps (o etiqueta iframe completa)
                    </label>
                    <input
                      type="text"
                      value={landingSettings?.map?.embedUrl || ''}
                      onChange={(e) => setLandingSettings((prev: any) => ({
                        ...prev,
                        map: { ...(prev?.map || {}), embedUrl: e.target.value }
                      }))}
                      placeholder="https://www.google.com/maps/embed?pb=... o <iframe src='...'></iframe>"
                      className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-lg p-3 text-xs text-foreground focus:border-primary font-mono"
                    />
                    <p className="text-[11px] text-muted-foreground">
                      💡 <strong>¿Cómo obtenerlo?</strong> Ve a Google Maps &gt; Busca tu gimnasio &gt; Haz clic en <em>Compartir</em> &gt; Pestaña <em>Insertar un mapa</em> &gt; Copia el HTML o el enlace src y pégalo aquí.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-foreground block">Título de la Tarjeta Lateral</label>
                    <input
                      type="text"
                      value={landingSettings?.map?.infoCardTitle ?? 'Información del Gym'}
                      onChange={(e) => setLandingSettings((prev: any) => ({
                        ...prev,
                        map: { ...(prev?.map || {}), infoCardTitle: e.target.value }
                      }))}
                      placeholder="Ej. Información del Gym"
                      className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-lg p-2.5 text-xs text-foreground focus:border-primary"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-foreground block">Dirección Visible</label>
                    <input
                      type="text"
                      value={landingSettings?.map?.address || ''}
                      onChange={(e) => setLandingSettings((prev: any) => ({
                        ...prev,
                        map: { ...(prev?.map || {}), address: e.target.value }
                      }))}
                      placeholder="Ej. Av. Principal, Edificio Gym, Nivel 1"
                      className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-lg p-2.5 text-xs text-foreground focus:border-primary"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-foreground block">Enlace Directo de Google Maps (Para botón "Cómo llegar")</label>
                    <input
                      type="text"
                      value={landingSettings?.map?.googleMapsUrl || ''}
                      onChange={(e) => setLandingSettings((prev: any) => ({
                        ...prev,
                        map: { ...(prev?.map || {}), googleMapsUrl: e.target.value }
                      }))}
                      placeholder="https://maps.google.com/..."
                      className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-lg p-2.5 text-xs text-foreground focus:border-primary"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-foreground block">Teléfono de Contacto</label>
                    <input
                      type="text"
                      value={landingSettings?.map?.phone || ''}
                      onChange={(e) => setLandingSettings((prev: any) => ({
                        ...prev,
                        map: { ...(prev?.map || {}), phone: e.target.value }
                      }))}
                      placeholder="Ej. +58 412 123 4567"
                      className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-lg p-2.5 text-xs text-foreground focus:border-primary"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-foreground block">WhatsApp Directo</label>
                    <input
                      type="text"
                      value={landingSettings?.map?.whatsapp || ''}
                      onChange={(e) => setLandingSettings((prev: any) => ({
                        ...prev,
                        map: { ...(prev?.map || {}), whatsapp: e.target.value }
                      }))}
                      placeholder="Ej. +58 414 123 4567"
                      className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-lg p-2.5 text-xs text-foreground focus:border-primary"
                    />
                  </div>
                </div>
              </div>
    </div>
  )
}
