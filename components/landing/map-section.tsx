"use client"

import React from "react"
import { useSettings } from "@/lib/settings-context"
import { MapPin, Navigation, Phone, MessageCircle, Clock, Calendar, CheckCircle2 } from "lucide-react"

export function MapSection() {
  const { settings } = useSettings()

  const rawMap = settings.landingSettings?.map
  const officialAddress = "Centro comercial rospier local 28, 29 y 30, 5ta Av con avenida la patria, San Felipe, Yaracuy, Venezuela"
  const officialGoogleMapsUrl = "https://www.google.com/maps/place/?q=place_id:ChIJV1stlkrPgI4Rl7xpcD1p26w"
  const officialEmbedUrl = "https://maps.google.com/maps?q=10.3356845,-68.7391279+(Maximum+Evolution+Fit)&t=&z=17&ie=UTF8&iwloc=&output=embed"

  const mapData = {
    embedUrl: (rawMap?.embedUrl && !rawMap.embedUrl.includes("66.8833")) ? rawMap.embedUrl : officialEmbedUrl,
    address: (rawMap?.address && !rawMap.address.includes("Avenida Principal, Centro")) ? rawMap.address : (settings.storeAddress || officialAddress),
    googleMapsUrl: (rawMap?.googleMapsUrl && rawMap.googleMapsUrl !== "https://maps.google.com") ? rawMap.googleMapsUrl : officialGoogleMapsUrl,
    phone: rawMap?.phone || "+58 412 123 4567",
    whatsapp: rawMap?.whatsapp || "+58 414 123 4567",
    infoCardTitle: rawMap?.infoCardTitle || "Información del Gym"
  }

  const gymSchedule = settings.gymSchedule || {
    weekdays: '6:00 AM - 10:00 PM',
    saturdays: '7:00 AM - 6:00 PM',
    sundays: '8:00 AM - 2:00 PM'
  }

  // Sanitizar URL de embed si el usuario pegó el iframe completo
  let embedSrc = mapData.embedUrl
  if (embedSrc && embedSrc.includes('<iframe') && embedSrc.includes('src="')) {
    const match = embedSrc.match(/src="([^"]+)"/)
    if (match && match[1]) {
      embedSrc = match[1]
    }
  }

  const whatsappClean = (mapData.whatsapp || '').replace(/[^0-9]/g, '')
  const whatsappUrl = whatsappClean 
    ? `https://wa.me/${whatsappClean}?text=${encodeURIComponent('¡Hola! Me gustaría recibir información sobre membresías y horarios en ' + (settings.appName || 'el gimnasio') + '.')}`
    : '#'

  return (
    <section id="ubicacion" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative">
      
      {/* SECTION TITLE */}
      <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-extrabold uppercase tracking-widest">
          <MapPin className="w-3.5 h-3.5" />
          NUESTRA UBICACIÓN
        </div>
        
        <h2 className="font-display text-3xl sm:text-5xl font-black uppercase tracking-tight text-foreground">
          VEN Y VISÍTANOS EN EL CENTRO DE LA CIUDAD
        </h2>
        
        <p className="text-muted-foreground text-base sm:text-lg">
          Fácil acceso, estacionamiento seguro y un espacio pensado para tu máxima comodidad y rendimiento.
        </p>
      </div>

      {/* MAP & INFO CONTAINER */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        {/* INTERACTIVE GOOGLE MAP (CENTER/LEFT - 7 or 8 COLS) */}
        <div className="lg:col-span-7 xl:col-span-8 rounded-3xl overflow-hidden border border-border shadow-2xl relative min-h-[420px] lg:min-h-[520px] bg-muted flex flex-col group">
          {embedSrc ? (
            <iframe
              src={embedSrc}
              width="100%"
              height="100%"
              style={{ border: 0, minHeight: '420px', flex: 1 }}
              allowFullScreen={true}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Ubicación en Google Maps"
              className="w-full h-full filter saturate-105 contrast-105"
            />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
              <MapPin className="w-12 h-12 text-primary/40 mb-3" />
              <p className="font-bold text-foreground">Mapa no configurado aún</p>
              <p className="text-sm">Configura la URL de Google Maps en Ajustes &gt; Página Principal.</p>
            </div>
          )}

          {/* FLOATING ACTION BADGE ON MAP */}
          <div className="absolute top-4 left-4 z-10">
            <div className="px-4 py-2 rounded-xl bg-background/90 backdrop-blur-md border border-border/80 shadow-lg text-xs font-bold text-foreground flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Gimnasio Abierto Hoy</span>
            </div>
          </div>
        </div>

        {/* INFO CARD (RIGHT - 5 or 4 COLS) */}
        <div className="lg:col-span-5 xl:col-span-4 flex flex-col justify-between p-8 sm:p-10 rounded-3xl bg-card border border-border shadow-xl space-y-8">
          
          <div className="space-y-6">
            <h3 className="font-display font-extrabold text-2xl uppercase tracking-wide text-foreground">
              {mapData.infoCardTitle || "Información del Gym"}
            </h3>

            {/* ADDRESS */}
            <div className="flex items-start gap-3.5">
              <div className="p-2.5 rounded-xl bg-primary/10 text-primary shrink-0 border border-primary/20">
                <MapPin className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Dirección</p>
                <p className="text-sm font-semibold text-foreground leading-snug">
                  {mapData.address || settings.storeAddress || "Avenida Principal, Centro Deportivo"}
                </p>
              </div>
            </div>

            {/* SCHEDULE */}
            <div id="horarios" className="flex items-start gap-3.5 scroll-mt-28">
              <div className="p-2.5 rounded-xl bg-primary/10 text-primary shrink-0 border border-primary/20">
                <Clock className="w-5 h-5" />
              </div>
              <div className="space-y-1 flex-1">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Horarios de Atención</p>
                <div className="text-xs space-y-1 mt-1 text-foreground/90 font-medium">
                  <div className="flex justify-between border-b border-border/40 pb-1">
                    <span>Lunes a Viernes:</span>
                    <span className="font-bold text-foreground">{gymSchedule.weekdays}</span>
                  </div>
                  <div className="flex justify-between border-b border-border/40 py-1">
                    <span>Sábados:</span>
                    <span className="font-bold text-foreground">{gymSchedule.saturdays}</span>
                  </div>
                  <div className="flex justify-between pt-1">
                    <span>Domingos:</span>
                    <span className="font-bold text-foreground">{gymSchedule.sundays}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* PHONE & WHATSAPP */}
            <div className="flex items-start gap-3.5">
              <div className="p-2.5 rounded-xl bg-primary/10 text-primary shrink-0 border border-primary/20">
                <Phone className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Contacto Directo</p>
                <p className="text-sm font-semibold text-foreground">
                  {mapData.phone || mapData.whatsapp || "+58 412 123 4567"}
                </p>
              </div>
            </div>
          </div>

          {/* ACTION BUTTONS (OUTLINE STYLE) */}
          <div className="pt-4 border-t border-border flex flex-col gap-3">
            {whatsappClean && (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                  try {
                    import('@/lib/toast-context').then(({ showSweetToast }) => {
                      showSweetToast('Abriendo WhatsApp del gimnasio...', 'info');
                    });
                  } catch (e) {}
                }}
                className="w-full flex items-center justify-center gap-2.5 py-3.5 px-4 rounded-xl bg-transparent border-2 border-emerald-500 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 font-bold text-sm tracking-wide active:scale-98 transition-all"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Escribir por WhatsApp</span>
              </a>
            )}

            {mapData.googleMapsUrl && (
              <a
                href={mapData.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                  try {
                    import('@/lib/toast-context').then(({ showSweetToast }) => {
                      showSweetToast('Abriendo Google Maps...', 'info');
                    });
                  } catch (e) {}
                }}
                className="w-full flex items-center justify-center gap-2.5 py-3.5 px-4 rounded-xl bg-transparent border-2 border-primary text-primary hover:bg-primary/10 font-bold text-sm active:scale-98 transition-all"
              >
                <Navigation className="w-4 h-4" />
                <span>Cómo Llegar (Google Maps)</span>
              </a>
            )}
          </div>

        </div>

      </div>

    </section>
  )
}
