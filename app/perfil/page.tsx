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

  // Sincronizar imagen cuando cargue el usuario desde la sesión
  useEffect(() => {
    if (user?.profilePicture) {
      setProfileImage(user.profilePicture)
      setImageError(false)
    } else {
      setProfileImage(null)
    }
  }, [user?.profilePicture])

  // El perfil administrativo es privado: solo admin y gerente acceden
  if (user?.role !== "admin" && user?.role !== "gerente") {
    return (
      <div className="w-full max-w-lg mx-auto mt-16 p-8 rounded-3xl border border-destructive/20 bg-card text-center space-y-4 shadow-xl">
        <div className="w-16 h-16 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mx-auto">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-black text-foreground">Acceso Denegado</h2>
        <p className="text-sm text-muted-foreground">
          Este módulo de perfil es exclusivo del personal administrativo. Ningún otro usuario puede visualizarlo.
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

  const currentDisplayImage = !imageError && (profileImage || user?.profilePicture)

  return (
    <div className="w-full max-w-full space-y-8 pb-16">
      {/* Encabezado */}
      <div>
        <h1 className="page-title">Perfil del Administrador</h1>
        <p className="text-muted-foreground mt-1">
          Gestiona tu foto oficial de administrador. Los demás usuarios únicamente podrán ver tu foto en las publicaciones y avisos.
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
                  alt={user?.name || "Perfil Administrador"}
                  onError={() => setImageError(true)}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <div className="text-4xl font-extrabold text-primary font-display">
                  {user?.name?.slice(0, 2).toUpperCase() || "AD"}
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
                <Shield className="w-3.5 h-3.5" /> Administrador del Sistema
              </span>
            </div>

            <p className="text-xs text-muted-foreground flex items-center justify-center sm:justify-start gap-1.5">
              <span>Usuario / Identificador:</span>
              <strong className="text-foreground">{user?.cedula}</strong>
            </p>

            <p className="text-xs text-muted-foreground">
              Tu foto de perfil se sincroniza en todos los módulos (comunidad, avisos y barra superior). Ningún usuario ajeno tiene acceso a este perfil ni a tus datos privados.
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
              Nadie puede acceder a esta ruta ni consultar tu ficha. Cualquier intento de visualización externa queda bloqueado por seguridad.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 space-y-1.5">
            <span className="font-bold text-foreground flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-500" /> Visibilidad de Foto
            </span>
            <p className="text-[11px] leading-relaxed">
              Lo único que pueden ver los demás usuarios es tu fotografía en los comunicados oficiales del muro de comunidad y como autor de retos.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

