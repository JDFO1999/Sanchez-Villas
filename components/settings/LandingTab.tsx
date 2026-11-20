"use client"

import React, { useState } from "react"
import Link from "next/link"
import { 
  Globe, ExternalLink, Type, Image as ImageIcon, Video, Plus, Trash2, 
  MapPin, Store, HeartHandshake, CreditCard, ArrowRight, Sparkles, Users, 
  Flame, Award, Check, Download, RefreshCw 
} from "lucide-react"
import { getCoachesWithAthletesAction } from "@/app/actions/users"
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
                        {/* PREVIEW Y SUBIDA */}
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-muted-foreground block">Multimedia (Imagen o Video)</label>
                          <div className="h-28 w-full bg-black/20 rounded-xl overflow-hidden border border-black/10 dark:border-white/10 flex items-center justify-center relative group">
                            {slide.type === 'video' ? (
                              <video src={slide.url} className="w-full h-full object-cover" muted />
                            ) : (
                              <img src={slide.url} alt="Preview" className="w-full h-full object-cover" />
                            )}
                            <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white text-xs font-bold cursor-pointer transition">
                              <span>Cambiar Archivo</span>
                              <input
                                type="file"
                                accept="image/*,video/mp4,video/webm"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    const isVideo = file.type.startsWith('video');
                                    const reader = new FileReader();
                                    reader.onloadend = () => {
                                      const arr = [...landingSettings.heroSlides];
                                      arr[idx].url = reader.result as string;
                                      arr[idx].type = isVideo ? 'video' : 'image';
                                      setLandingSettings((prev: any) => ({ ...prev, heroSlides: arr }));
                                    };
                                    reader.readAsDataURL(file);
                                  }
                                }}
                              />
                            </label>
                          </div>
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

                      <div className="flex gap-4">
                        <div className="w-24 h-24 shrink-0 rounded-xl bg-black/20 overflow-hidden relative group border border-border">
                          <img src={disc.imageUrl} alt={disc.title} className="w-full h-full object-cover" />
                          <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[10px] font-bold cursor-pointer transition text-center p-1">
                            <span>Subir Foto</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const reader = new FileReader();
                                  reader.onloadend = () => {
                                    const arr = [...landingSettings.disciplines];
                                    arr[idx].imageUrl = reader.result as string;
                                    setLandingSettings((prev: any) => ({ ...prev, disciplines: arr }));
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                            />
                          </label>
                        </div>

                        <div className="flex-1 space-y-2">
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
                      const imgSrc = currentImages[imgIdx] || '';
                      return (
                        <div key={imgIdx} className="p-3 rounded-xl bg-card border border-border space-y-2">
                          <span className="text-[11px] font-bold text-primary block">Foto #{imgIdx + 1}</span>
                          <div className="h-32 w-full rounded-lg bg-black/20 overflow-hidden relative group border border-border">
                            {imgSrc ? (
                              <img src={imgSrc} alt="Preview" className="w-full h-full object-cover" />
                            ) : (
                              <div className="flex items-center justify-center h-full text-xs text-muted-foreground">Sin foto</div>
                            )}
                            <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[10px] font-bold cursor-pointer transition text-center p-1">
                              <span>Subir Imagen</span>
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    const reader = new FileReader();
                                    reader.onloadend = () => {
                                      const newImages = [...currentImages];
                                      newImages[imgIdx] = reader.result as string;
                                      setLandingSettings((prev: any) => ({
                                        ...prev,
                                        promiseSettings: { ...(prev?.promiseSettings || {}), images: newImages }
                                      }));
                                    };
                                    reader.readAsDataURL(file);
                                  }
                                }}
                              />
                            </label>
                          </div>
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
                            className="w-full bg-black/5 dark:bg-black/40 border border-border rounded p-1.5 text-[11px]"
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* GESTOR DE "ANTES Y DESPUÉS" (TRANSFORMACIONES REALES) */}
              <div className="space-y-4 p-5 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-black/10 dark:border-white/10">
                  <div>
                    <h4 className="text-base font-extrabold text-foreground flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-primary" /> Casos de Éxito / Antes y Después
                    </h4>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Muestra comparativas visuales reales de atletas que han transformado su físico y salud en el gimnasio.
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        const newCase = {
                          id: String(Date.now()),
                          athleteName: 'Nuevo Atleta',
                          duration: '3 Meses',
                          changeText: '-10 kg grasa / +3 kg músculo',
                          description: 'Disciplina inquebrantable, plan de entrenamiento personalizado y hábitos saludables.',
                          beforeImage: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?q=80&w=800&auto=format&fit=crop',
                          afterImage: 'https://images.unsplash.com/photo-1583454155184-870a1f63aebc?q=80&w=800&auto=format&fit=crop'
                        };
                        const current = landingSettings?.transformationsSettings?.items || [];
                        setLandingSettings((prev: any) => ({
                          ...prev,
                          transformationsSettings: {
                            ...(prev?.transformationsSettings || {}),
                            items: [...current, newCase]
                          }
                        }));
                      }}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow-md hover:brightness-110 active:scale-95 transition"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Agregar Transformación</span>
                    </button>
                  </div>
                </div>

                {/* TITULO Y SUBTITULO */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 rounded-xl bg-black/5 dark:bg-black/20 border border-border/40">
                  <div>
                    <label className="text-xs font-bold text-foreground block mb-1">Etiqueta Superior</label>
                    <input
                      type="text"
                      value={landingSettings?.transformationsSettings?.badge ?? 'RESULTADOS COMPROBADOS'}
                      onChange={(e) => setLandingSettings((prev: any) => ({
                        ...prev,
                        transformationsSettings: { ...(prev?.transformationsSettings || {}), badge: e.target.value }
                      }))}
                      placeholder="Ej. RESULTADOS COMPROBADOS"
                      className="w-full bg-black/5 dark:bg-black/40 border border-border rounded-lg p-2 text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-foreground block mb-1">Título Principal</label>
                    <input
                      type="text"
                      value={landingSettings?.transformationsSettings?.title ?? 'TRANSFORMACIONES REALES, VIDAS EXTRAORDINARIAS'}
                      onChange={(e) => setLandingSettings((prev: any) => ({
                        ...prev,
                        transformationsSettings: { ...(prev?.transformationsSettings || {}), title: e.target.value }
                      }))}
                      placeholder="Ej. TRANSFORMACIONES REALES..."
                      className="w-full bg-black/5 dark:bg-black/40 border border-border rounded-lg p-2 text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-foreground block mb-1">Subtítulo Descriptivo</label>
                    <input
                      type="text"
                      value={landingSettings?.transformationsSettings?.description ?? 'La constancia, el esfuerzo diario y la guía experta de nuestros entrenadores marcan la diferencia.'}
                      onChange={(e) => setLandingSettings((prev: any) => ({
                        ...prev,
                        transformationsSettings: { ...(prev?.transformationsSettings || {}), description: e.target.value }
                      }))}
                      placeholder="Ej. La constancia y el esfuerzo..."
                      className="w-full bg-black/5 dark:bg-black/40 border border-border rounded-lg p-2 text-xs"
                    />
                  </div>
                </div>

                {/* LISTA DE CASOS */}
                <div className="space-y-4 pt-2">
                  {(!landingSettings?.transformationsSettings?.items || landingSettings.transformationsSettings.items.length === 0) && (
                    <div className="p-8 text-center text-sm text-muted-foreground border border-dashed border-border rounded-xl">
                      No hay casos de "Antes y Después" registrados aún. Haz clic en "Agregar Transformación" para publicar el primero.
                    </div>
                  )}

                  {landingSettings?.transformationsSettings?.items?.map((item: any, idx: number) => {
                    const updateItem = (field: string, val: any) => {
                      const arr = [...(landingSettings.transformationsSettings?.items || [])];
                      arr[idx] = { ...arr[idx], [field]: val };
                      setLandingSettings((prev: any) => ({
                        ...prev,
                        transformationsSettings: {
                          ...(prev?.transformationsSettings || {}),
                          items: arr
                        }
                      }));
                    };

                    const deleteItem = () => {
                      const arr = (landingSettings.transformationsSettings?.items || []).filter((_: any, i: number) => i !== idx);
                      setLandingSettings((prev: any) => ({
                        ...prev,
                        transformationsSettings: {
                          ...(prev?.transformationsSettings || {}),
                          items: arr
                        }
                      }));
                    };

                    return (
                      <div key={item.id || idx} className="p-4 rounded-xl bg-card border border-border shadow-sm space-y-4">
                        <div className="flex items-center justify-between gap-2 pb-2 border-b border-border">
                          <span className="text-xs font-black uppercase text-primary tracking-wider">
                            Caso #{idx + 1}: {item.athleteName || 'Atleta'}
                          </span>
                          <button
                            type="button"
                            onClick={deleteItem}
                            className="text-xs text-destructive hover:bg-destructive/10 p-1.5 rounded-lg font-bold flex items-center gap-1 transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Eliminar</span>
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {/* FOTO ANTES */}
                          <div className="space-y-2">
                            <label className="text-[11px] font-bold text-muted-foreground uppercase flex items-center justify-between">
                              <span>Foto "Antes"</span>
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-mono">Antes</span>
                            </label>
                            <div className="h-36 w-full rounded-xl bg-black/20 overflow-hidden relative group border border-border flex items-center justify-center">
                              {item.beforeImage ? (
                                <img src={item.beforeImage} alt="Antes" className="w-full h-full object-cover" />
                              ) : (
                                <span className="text-xs text-muted-foreground">Sin foto</span>
                              )}
                              <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[10px] font-bold cursor-pointer transition text-center p-2">
                                <span>Subir Foto del Antes</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      const reader = new FileReader();
                                      reader.onloadend = () => updateItem('beforeImage', reader.result as string);
                                      reader.readAsDataURL(file);
                                    }
                                  }}
                                />
                              </label>
                            </div>
                            <input
                              type="text"
                              value={item.beforeImage || ''}
                              onChange={(e) => updateItem('beforeImage', e.target.value)}
                              placeholder="O URL imagen Antes"
                              className="w-full bg-black/5 dark:bg-black/40 border border-border rounded p-1.5 text-[11px]"
                            />
                          </div>

                          {/* FOTO DESPUÉS */}
                          <div className="space-y-2">
                            <label className="text-[11px] font-bold text-emerald-500 uppercase flex items-center justify-between">
                              <span>Foto "Después"</span>
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold font-mono">Después</span>
                            </label>
                            <div className="h-36 w-full rounded-xl bg-black/20 overflow-hidden relative group border border-border flex items-center justify-center">
                              {item.afterImage ? (
                                <img src={item.afterImage} alt="Después" className="w-full h-full object-cover" />
                              ) : (
                                <span className="text-xs text-muted-foreground">Sin foto</span>
                              )}
                              <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[10px] font-bold cursor-pointer transition text-center p-2">
                                <span>Subir Foto del Después</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      const reader = new FileReader();
                                      reader.onloadend = () => updateItem('afterImage', reader.result as string);
                                      reader.readAsDataURL(file);
                                    }
                                  }}
                                />
                              </label>
                            </div>
                            <input
                              type="text"
                              value={item.afterImage || ''}
                              onChange={(e) => updateItem('afterImage', e.target.value)}
                              placeholder="O URL imagen Después"
                              className="w-full bg-black/5 dark:bg-black/40 border border-border rounded p-1.5 text-[11px]"
                            />
                          </div>

                          {/* DATOS Y TESTIMONIO */}
                          <div className="space-y-2 lg:col-span-1 md:col-span-2">
                            <div>
                              <label className="text-[11px] font-bold text-foreground block mb-0.5">Nombre del Atleta</label>
                              <input
                                type="text"
                                value={item.athleteName || ''}
                                onChange={(e) => updateItem('athleteName', e.target.value)}
                                placeholder="Ej. Carlos Mendoza"
                                className="w-full bg-black/5 dark:bg-black/40 border border-border rounded p-1.5 text-xs font-bold"
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="text-[11px] font-bold text-foreground block mb-0.5">Tiempo Transcurrido</label>
                                <input
                                  type="text"
                                  value={item.duration || ''}
                                  onChange={(e) => updateItem('duration', e.target.value)}
                                  placeholder="Ej. 3 Meses"
                                  className="w-full bg-black/5 dark:bg-black/40 border border-border rounded p-1.5 text-xs"
                                />
                              </div>
                              <div>
                                <label className="text-[11px] font-bold text-foreground block mb-0.5">Métrica / Cambio</label>
                                <input
                                  type="text"
                                  value={item.changeText || ''}
                                  onChange={(e) => updateItem('changeText', e.target.value)}
                                  placeholder="Ej. -12 kg / +4 kg músculo"
                                  className="w-full bg-black/5 dark:bg-black/40 border border-border rounded p-1.5 text-xs text-primary font-bold"
                                />
                              </div>
                            </div>
                            <div>
                              <label className="text-[11px] font-bold text-foreground block mb-0.5">Reseña o Testimonio</label>
                              <textarea
                                rows={2}
                                value={item.description || ''}
                                onChange={(e) => updateItem('description', e.target.value)}
                                placeholder="Breve historia de su cambio..."
                                className="w-full bg-black/5 dark:bg-black/40 border border-border rounded p-1.5 text-xs resize-none"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* GESTOR DE "NUESTROS ENTRENADORES (STAFF / COACHES)" */}
              <div className="space-y-4 p-5 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-black/10 dark:border-white/10">
                  <div>
                    <h4 className="text-base font-extrabold text-foreground flex items-center gap-2">
                      <Users className="w-4 h-4 text-primary" /> Sección "Nuestros Entrenadores (Coaches)"
                    </h4>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Promociona a tu equipo de entrenadores certificados en la página principal con su especialidad, foto y contacto.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      type="button"
                      disabled={isImportingCoaches}
                      onClick={handleImportSystemCoaches}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-muted hover:bg-muted/80 text-foreground text-xs font-bold border border-border transition disabled:opacity-50"
                      title="Importa automáticamente los entrenadores registrados en el módulo de personal/coaches"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 text-primary ${isImportingCoaches ? 'animate-spin' : ''}`} />
                      <span>{isImportingCoaches ? 'Importando...' : 'Importar Coaches del Sistema'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const newCoach = {
                          id: String(Date.now()),
                          name: 'Nuevo Entrenador',
                          specialty: 'Especialista en Hipertrofia & Fuerza',
                          experience: '+4 años de experiencia',
                          bio: 'Preparador físico enfocado en rendimiento, biomecánica y motivación constante.',
                          photo: 'https://images.unsplash.com/photo-1567013127542-490d757e51fc?q=80&w=800&auto=format&fit=crop',
                          instagram: '@coach',
                          phone: ''
                        };
                        const current = landingSettings?.coaches || [];
                        setLandingSettings((prev: any) => ({
                          ...prev,
                          coaches: [...current, newCoach]
                        }));
                      }}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow-md hover:brightness-110 active:scale-95 transition"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Agregar Entrenador</span>
                    </button>
                  </div>
                </div>

                {/* TITULO Y SUBTITULO */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 rounded-xl bg-black/5 dark:bg-black/20 border border-border/40">
                  <div>
                    <label className="text-xs font-bold text-foreground block mb-1">Etiqueta Superior</label>
                    <input
                      type="text"
                      value={landingSettings?.coachesSettings?.badge ?? 'STAFF DE ÉLITE'}
                      onChange={(e) => setLandingSettings((prev: any) => ({
                        ...prev,
                        coachesSettings: { ...(prev?.coachesSettings || {}), badge: e.target.value }
                      }))}
                      placeholder="Ej. STAFF DE ÉLITE"
                      className="w-full bg-black/5 dark:bg-black/40 border border-border rounded-lg p-2 text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-foreground block mb-1">Título Principal</label>
                    <input
                      type="text"
                      value={landingSettings?.coachesSettings?.title ?? 'CONOCE A NUESTROS ENTRENADORES'}
                      onChange={(e) => setLandingSettings((prev: any) => ({
                        ...prev,
                        coachesSettings: { ...(prev?.coachesSettings || {}), title: e.target.value }
                      }))}
                      placeholder="Ej. CONOCE A NUESTROS ENTRENADORES"
                      className="w-full bg-black/5 dark:bg-black/40 border border-border rounded-lg p-2 text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-foreground block mb-1">Subtítulo Descriptivo</label>
                    <input
                      type="text"
                      value={landingSettings?.coachesSettings?.description ?? 'Profesionales certificados y apasionados por guiar tu técnica, nutrición y evolución día a día.'}
                      onChange={(e) => setLandingSettings((prev: any) => ({
                        ...prev,
                        coachesSettings: { ...(prev?.coachesSettings || {}), description: e.target.value }
                      }))}
                      placeholder="Ej. Profesionales certificados..."
                      className="w-full bg-black/5 dark:bg-black/40 border border-border rounded-lg p-2 text-xs"
                    />
                  </div>
                </div>

                {/* LISTA DE ENTRENADORES */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  {(!landingSettings?.coaches || landingSettings.coaches.length === 0) && (
                    <div className="md:col-span-2 p-8 text-center text-sm text-muted-foreground border border-dashed border-border rounded-xl">
                      No hay entrenadores agregados a la Landing. Puedes agregarlos manualmente o hacer clic en <strong>"Importar Coaches del Sistema"</strong> para cargarlos al instante.
                    </div>
                  )}

                  {landingSettings?.coaches?.map((coach: any, idx: number) => {
                    const updateCoach = (field: string, val: any) => {
                      const arr = [...(landingSettings.coaches || [])];
                      arr[idx] = { ...arr[idx], [field]: val };
                      setLandingSettings((prev: any) => ({
                        ...prev,
                        coaches: arr
                      }));
                    };

                    const deleteCoach = () => {
                      const arr = (landingSettings.coaches || []).filter((_: any, i: number) => i !== idx);
                      setLandingSettings((prev: any) => ({
                        ...prev,
                        coaches: arr
                      }));
                    };

                    return (
                      <div key={coach.id || idx} className="p-4 rounded-xl bg-card border border-border shadow-sm space-y-3">
                        <div className="flex items-center justify-between gap-2 pb-2 border-b border-border">
                          <span className="text-xs font-black uppercase text-primary">
                            Coach #{idx + 1}: {coach.name || 'Entrenador'}
                          </span>
                          <button
                            type="button"
                            onClick={deleteCoach}
                            className="text-xs text-destructive hover:bg-destructive/10 p-1.5 rounded-lg font-bold flex items-center gap-1 transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Eliminar</span>
                          </button>
                        </div>

                        <div className="flex gap-4">
                          {/* FOTO DEL COACH */}
                          <div className="w-24 h-28 shrink-0 rounded-xl bg-black/20 overflow-hidden relative group border border-border flex items-center justify-center">
                            {coach.photo ? (
                              <img src={coach.photo} alt={coach.name} className="w-full h-full object-cover" />
                            ) : (
                              <Users className="w-8 h-8 text-muted-foreground" />
                            )}
                            <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[10px] font-bold cursor-pointer transition text-center p-1">
                              <span>Subir Foto</span>
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    const reader = new FileReader();
                                    reader.onloadend = () => updateCoach('photo', reader.result as string);
                                    reader.readAsDataURL(file);
                                  }
                                }}
                              />
                            </label>
                          </div>

                          <div className="flex-1 space-y-2">
                            <input
                              type="text"
                              value={coach.name || ''}
                              onChange={(e) => updateCoach('name', e.target.value)}
                              placeholder="Nombre del Coach"
                              className="w-full bg-black/5 dark:bg-black/40 border border-border rounded-lg p-2 text-xs font-bold"
                            />
                            <input
                              type="text"
                              value={coach.specialty || ''}
                              onChange={(e) => updateCoach('specialty', e.target.value)}
                              placeholder="Especialidad (ej. Hipertrofia & Fuerza)"
                              className="w-full bg-black/5 dark:bg-black/40 border border-border rounded-lg p-2 text-xs text-primary font-bold"
                            />
                            <input
                              type="text"
                              value={coach.experience || ''}
                              onChange={(e) => updateCoach('experience', e.target.value)}
                              placeholder="Experiencia (ej. +5 años de experiencia)"
                              className="w-full bg-black/5 dark:bg-black/40 border border-border rounded-lg p-2 text-[11px]"
                            />
                          </div>
                        </div>

                        <textarea
                          rows={2}
                          value={coach.bio || ''}
                          onChange={(e) => updateCoach('bio', e.target.value)}
                          placeholder="Biografía breve / enfoque de entrenamiento..."
                          className="w-full bg-black/5 dark:bg-black/40 border border-border rounded-lg p-2 text-xs resize-none"
                        />

                        <div className="grid grid-cols-2 gap-2 pt-1">
                          <input
                            type="text"
                            value={coach.instagram || ''}
                            onChange={(e) => updateCoach('instagram', e.target.value)}
                            placeholder="Instagram (ej. @coach)"
                            className="w-full bg-black/5 dark:bg-black/40 border border-border rounded p-1.5 text-[11px]"
                          />
                          <input
                            type="text"
                            value={coach.phone || ''}
                            onChange={(e) => updateCoach('phone', e.target.value)}
                            placeholder="Teléfono / WhatsApp"
                            className="w-full bg-black/5 dark:bg-black/40 border border-border rounded p-1.5 text-[11px]"
                          />
                        </div>
                      </div>
                    );
                  })}
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
                <h4 className="text-base font-extrabold text-foreground flex items-center gap-2 pb-2 border-b border-black/10 dark:border-white/10">
                  <MapPin className="w-4 h-4 text-primary" /> Ubicación y Mapa Interactivo (Google Maps)
                </h4>

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
