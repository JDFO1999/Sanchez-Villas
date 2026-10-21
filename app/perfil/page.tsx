"use client"

import React, { useState, useRef, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { useSettings } from "@/lib/settings-context"
import { useToast } from "@/lib/toast-context"
import { updateProfilePicture, removeProfilePicture } from "@/app/actions/users"
import {
  User as UserIcon,
  Camera,
  Shield,
  Mail,
  Key,
  Calendar,
  CheckCircle2,
  Lock,
  Sparkles,
  Trash2,
  AlertTriangle,
  Dumbbell,
  Plus,
  Save,
} from "lucide-react"
import { Button } from "@/components/ui/button"

export default function PerfilPage() {
  const { user, updateUserProfilePicture } = useAuth()
  const { settings } = useSettings()
  const { showToast } = useToast()
  
  const [profileImage, setProfileImage] = useState<string | null>(user?.profilePicture || null)
  const [imageError, setImageError] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Estados para Entrenadores
  const [coachBio, setCoachBio] = useState("")
  const [socialLinks, setSocialLinks] = useState<{ platform: string; url: string }[]>([])
  const [isSavingCoach, setIsSavingCoach] = useState(false)

  const isCoach = user?.role === "coach"
  const isAdmin = user?.role === "admin" || user?.role === "gerente"

  // Sincronizar imagen cuando cargue el usuario desde la sesión
  useEffect(() => {
    if (user?.profilePicture) {
      setProfileImage(user.profilePicture)
      setImageError(false)
    } else {
      setProfileImage(null)
    }
  }, [user?.profilePicture])

  // Cargar detalles específicos del perfil del entrenador
  useEffect(() => {
    async function loadCoachDetails() {
      if (!isCoach) return
      try {
        const { getMyProfileDetailsAction } = await import("@/app/actions/users")
        const res = await getMyProfileDetailsAction()
        if (res.success && res.user) {
          if (res.user.bio) setCoachBio(res.user.bio)
          if (res.user.socialLinks) {
            try {
              const parsed = JSON.parse(res.user.socialLinks)
              if (Array.isArray(parsed)) setSocialLinks(parsed)
            } catch {}
          }
        }
      } catch (err) {
        console.error("Error al cargar datos del entrenador:", err)
      }
    }

    loadCoachDetails()
  }, [isCoach])

  // El perfil administrativo y de entrenadores es privado: solo admin, gerente y coach acceden
  if (!isAdmin && !isCoach) {
    return (
      <div className="w-full max-w-lg mx-auto mt-16 p-8 rounded-3xl border border-destructive/20 bg-card text-center space-y-4 shadow-xl">
        <div className="w-16 h-16 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mx-auto">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-black text-foreground">Acceso Denegado</h2>
        <p className="text-sm text-muted-foreground">
          Este módulo de perfil es exclusivo del personal autorizado (Administradores y Entrenadores).
        </p>
      </div>
    )
  }

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const previousImage = profileImage || user?.profilePicture || null

    setIsUploading(true)
    setImageError(false)
    try {
      const { compressImage } = await import("@/lib/image-compress")
      const base64 = await compressImage(file, 400, 400, 0.8, 48000)
      setProfileImage(base64)

      if (!user?.id) throw new Error("No hay usuario autenticado")
      const res = await updateProfilePicture(user.id, base64)
      if (res.success && res.profilePicture) {
        setProfileImage(res.profilePicture)
        setImageError(false)
        updateUserProfilePicture(res.profilePicture)
        showToast("Foto de perfil actualizada correctamente.", "success")
      } else {
        setProfileImage(previousImage)
        showToast(res.error || "No se pudo guardar la imagen.", "error")
      }
    } catch (err: any) {
      setProfileImage(previousImage)
      showToast(err?.message || "Error al actualizar imagen.", "error")
    } finally {
      setIsUploading(false)
      e.target.value = ""
    }
  }

  const handleRemovePhoto = async () => {
    if (!user?.id) return
    setIsUploading(true)
    try {
      const res = await removeProfilePicture(user.id)
      if (res.success) {
        setProfileImage(null)
        setImageError(false)
        updateUserProfilePicture("")
        showToast("Foto de perfil eliminada correctamente.", "success")
      } else {
        showToast(res.error || "No se pudo eliminar la imagen.", "error")
      }
    } catch (err: any) {
      showToast(err?.message || "Error al eliminar imagen.", "error")
    } finally {
      setIsUploading(false)
    }
  }

  const handleAddSocial = () => {
    setSocialLinks([...socialLinks, { platform: "Instagram", url: "" }])
  }

  const handleRemoveSocial = (idx: number) => {
    setSocialLinks(socialLinks.filter((_, i) => i !== idx))
  }

  const handleUpdateSocial = (idx: number, field: "platform" | "url", val: string) => {
    const updated = [...socialLinks]
    updated[idx] = { ...updated[idx], [field]: val }
    setSocialLinks(updated)
  }

  const handleSaveCoachData = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.id) return
    setIsSavingCoach(true)
    try {
      const { updateCoachProfile } = await import("@/app/actions/users")
      const res = await updateCoachProfile(user.id, {
        bio: coachBio.trim(),
        socialLinks: JSON.stringify(socialLinks),
      })
      if (res.success) {
        showToast("Información de entrenador actualizada con éxito.", "success")
      } else {
        showToast(res.error || "Error al actualizar información.", "error")
      }
    } catch (err: any) {
      showToast(err?.message || "Error al guardar información del entrenador.", "error")
    } finally {
      setIsSavingCoach(false)
    }
  }

  const currentDisplayImage = !imageError && (profileImage || user?.profilePicture)

  return (
    <div className="w-full max-w-full space-y-8 pb-16">
      {/* Encabezado */}
      <div>
        <h1 className="page-title">
          {isCoach ? "Perfil del Entrenador" : "Perfil del Administrador"}
        </h1>
        <p className="text-muted-foreground mt-1">
          {isCoach
            ? "Gestiona tu fotografía oficial de entrenador, biografía profesional y redes sociales de contacto para tus atletas."
            : "Gestiona tu foto oficial de administrador. Los demás usuarios únicamente podrán ver tu foto en las publicaciones y avisos."}
        </p>
      </div>

      {/* Tarjeta Principal de Perfil */}
      <div className="rounded-3xl border border-black/10 dark:border-white/10 bg-card p-6 md:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 relative z-10">
          {/* Avatar con botón de subida */}
          <div className="relative group shrink-0">
            <div className="w-32 h-32 rounded-3xl overflow-hidden border-2 border-primary/40 bg-primary/10 shadow-2xl flex items-center justify-center relative">
              {currentDisplayImage ? (
                <img
                  src={currentDisplayImage as string}
                  alt={user?.name || "Perfil"}
                  onError={() => setImageError(true)}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <div className="text-4xl font-extrabold text-primary font-display">
                  {user?.name?.slice(0, 2).toUpperCase() || (isCoach ? "CO" : "AD")}
                </div>
              )}

              {/* Overlay hover para cambiar foto */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white cursor-pointer"
              >
                <Camera className="w-6 h-6 mb-1 text-primary animate-bounce" />
                <span className="text-[11px] font-bold tracking-wider uppercase">
                  {isUploading ? "Subiendo..." : "Cambiar Foto"}
                </span>
              </button>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageChange}
              accept="image/*"
              className="hidden"
            />
          </div>

          {/* Información del Usuario */}
          <div className="flex-1 text-center sm:text-left space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <h2 className="text-2xl font-black text-foreground">{user?.name}</h2>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-primary/15 text-primary border border-primary/30 w-fit mx-auto sm:mx-0">
                {isCoach ? (
                  <>
                    <Dumbbell className="w-3.5 h-3.5 text-primary" /> Entrenador Oficial (Coach)
                  </>
                ) : (
                  <>
                    <Shield className="w-3.5 h-3.5" /> Administrador del Sistema
                  </>
                )}
              </span>
            </div>

            <p className="text-xs text-muted-foreground flex items-center justify-center sm:justify-start gap-1.5">
              <span>Usuario / Identificador:</span>
              <strong className="text-foreground">{user?.cedula}</strong>
            </p>

            <p className="text-xs text-muted-foreground">
              {isCoach
                ? "Tu foto se sincroniza en la lista de entrenadores, en las asignaciones de atletas y en tus publicaciones del muro."
                : "Tu foto de perfil se sincroniza en todos los módulos (comunidad, avisos y barra superior). Ningún usuario ajeno tiene acceso a este perfil."}
            </p>

            {imageError && (
              <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2 text-left">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>La foto guardada previamente presentaba un formato incompatible o dañado. Puedes subir una nueva o restablecer el avatar inicial.</span>
              </div>
            )}

            <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="rounded-xl gap-2 font-bold"
              >
                <Camera className="w-4 h-4 text-primary" />
                <span>{isUploading ? "Procesando..." : currentDisplayImage ? "Cambiar Foto" : "Subir Foto"}</span>
              </Button>

              {(currentDisplayImage || imageError) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRemovePhoto}
                  disabled={isUploading}
                  className="rounded-xl gap-2 font-bold text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/30"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Eliminar Foto</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Sección exclusiva para Entrenadores: Biografía y Redes Sociales */}
      {isCoach && (
        <form onSubmit={handleSaveCoachData} className="rounded-3xl border border-black/10 dark:border-white/10 bg-card p-6 md:p-8 shadow-xl space-y-6">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-primary/10 text-primary">
              <Dumbbell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-foreground">Ficha Profesional y Redes Sociales</h3>
              <p className="text-xs text-muted-foreground">
                Información que verán tus atletas asignados en su panel y al consultar tus rutinas
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2">
                Biografía / Enfoque de Entrenamiento
              </label>
              <textarea
                rows={4}
                value={coachBio}
                onChange={(e) => setCoachBio(e.target.value)}
                placeholder="Ejemplo: Especialista en hipertrofia y acondicionamiento funcional con más de 5 años de experiencia..."
                className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-2xl p-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none transition-all"
              />
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                  Redes Sociales y Canales de Contacto
                </label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddSocial}
                  className="rounded-xl text-xs gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5 text-primary" /> Añadir Red Social
                </Button>
              </div>

              {socialLinks.length === 0 ? (
                <p className="text-xs text-muted-foreground italic bg-black/5 dark:bg-white/5 p-4 rounded-xl text-center">
                  Aún no has agregado redes sociales. Añade tus perfiles (Instagram, TikTok, WhatsApp) para que tus atletas puedan contactarte.
                </p>
              ) : (
                <div className="space-y-2.5">
                  {socialLinks.map((link, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <select
                        value={link.platform}
                        onChange={(e) => handleUpdateSocial(idx, "platform", e.target.value)}
                        className="w-36 bg-card border border-black/10 dark:border-white/10 rounded-xl px-3 py-2 text-xs font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                      >
                        <option value="Instagram">Instagram</option>
                        <option value="TikTok">TikTok</option>
                        <option value="WhatsApp">WhatsApp</option>
                        <option value="YouTube">YouTube</option>
                        <option value="Facebook">Facebook</option>
                        <option value="X">X (Twitter)</option>
                        <option value="Web">Sitio Web</option>
                      </select>

                      <input
                        type="text"
                        value={link.url}
                        onChange={(e) => handleUpdateSocial(idx, "url", e.target.value)}
                        placeholder="Enlace o nombre de usuario (ej. @tuusuario)..."
                        className="flex-1 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl px-3.5 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                      />

                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoveSocial(idx)}
                        className="p-2 h-9 w-9 rounded-xl text-destructive hover:bg-destructive/10 border-destructive/30"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-3 flex justify-end">
              <Button type="submit" disabled={isSavingCoach} className="rounded-xl gap-2 font-bold">
                <Save className="w-4 h-4" />
                <span>{isSavingCoach ? "Guardando..." : "Guardar Perfil de Entrenador"}</span>
              </Button>
            </div>
          </div>
        </form>
      )}

      {/* Tarjeta de Privacidad y Visibilidad */}
      <div className="rounded-2xl border border-black/10 dark:border-white/10 bg-card p-6 shadow-md space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-primary/10 text-primary">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-foreground">Privacidad y Protección de Cuenta</h3>
            <p className="text-xs text-muted-foreground">Control estricto de visibilidad</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-muted-foreground pt-1">
          <div className="p-4 rounded-xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 space-y-1.5">
            <span className="font-bold text-foreground flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Perfil 100% Protegido
            </span>
            <p className="text-[11px] leading-relaxed">
              Nadie ajeno a tu cuenta puede acceder a esta ruta ni modificar tus configuraciones personales.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 space-y-1.5">
            <span className="font-bold text-foreground flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-500" /> Visibilidad de Foto
            </span>
            <p className="text-[11px] leading-relaxed">
              {isCoach
                ? "Tus atletas asignados podrán ver tu foto oficial, biografía y enlaces a redes sociales para coordinar entrenamientos."
                : "Lo único que pueden ver los demás usuarios es tu fotografía en los comunicados oficiales del muro de comunidad y como autor de retos."}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

