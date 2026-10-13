"use client"

import React, { useState, useEffect } from "react"
import { useSettings } from "@/lib/settings-context"
import { useAuth } from "@/lib/auth-context"
import { useToast } from "@/lib/toast-context"
import {
  Trophy,
  Flame,
  Dumbbell,
  Calendar,
  MessageSquare,
  Users,
  Target,
  Share2,
  Heart,
  Award,
  Sparkles,
  CheckCircle2,
  ThumbsUp,
  Clock,
  ShieldCheck,
  PlusCircle,
  Trash2,
  Edit3,
  X,
  Check,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog } from "@/components/ui/dialog"
import {
  getCommunityPostsAction,
  createCommunityPostAction,
  deleteCommunityPostAction,
  toggleCommunityReactionAction,
  getCommunityChallengesAction,
  createCommunityChallengeAction,
  updateChallengeStatusAction,
  toggleJoinChallengeAction,
  updateTrainingPhilosophyAction,
  updateGymScheduleAction,
  getHallOfFameAction,
} from "@/app/actions/community"

export default function ComunidadPage() {
  const { settings, updateSettings } = useSettings()
  const { user } = useAuth()
  const { showToast } = useToast()

  const [activeTab, setActiveTab] = useState<"muro" | "retos" | "ranking">("muro")
  const [posts, setPosts] = useState<any[]>([])
  const [challenges, setChallenges] = useState<any[]>([])
  const [isLoadingPosts, setIsLoadingPosts] = useState(true)
  const [isLoadingChallenges, setIsLoadingChallenges] = useState(true)

  // Crear Post Form State
  const [newTitle, setNewTitle] = useState("")
  const [newContent, setNewContent] = useState("")
  const [newTag, setNewTag] = useState("Aviso Oficial")
  const [isSubmittingPost, setIsSubmittingPost] = useState(false)

  // Crear Reto Form State
  const [showChallengeModal, setShowChallengeModal] = useState(false)
  const [challengeTitle, setChallengeTitle] = useState("")
  const [challengeDesc, setChallengeDesc] = useState("")
  const [challengeCategory, setChallengeCategory] = useState("Fuerza")
  const [challengeDays, setChallengeDays] = useState(30)
  const [isSubmittingChallenge, setIsSubmittingChallenge] = useState(false)

  // Editar Filosofía Modal (Admin)
  const [showPhilosophyModal, setShowPhilosophyModal] = useState(false)
  const [philosophyText, setPhilosophyText] = useState(
    settings.trainingPhilosophy ||
      "No cuentes los días, haz que los días cuenten. Tu único límite es la mente que te dice que pares una repetición antes."
  )
  const [isSavingPhilosophy, setIsSavingPhilosophy] = useState(false)

  // Editar Horarios Modal (Admin)
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [scheduleWeekdays, setScheduleWeekdays] = useState(settings.gymSchedule?.weekdays || "6:00 AM - 10:00 PM")
  const [scheduleSaturdays, setScheduleSaturdays] = useState(settings.gymSchedule?.saturdays || "7:00 AM - 6:00 PM")
  const [scheduleSundays, setScheduleSundays] = useState(settings.gymSchedule?.sundays || "8:00 AM - 2:00 PM")
  const [isSavingSchedule, setIsSavingSchedule] = useState(false)

  // Salón de la Fama (Datos Reales)
  const [hallOfFame, setHallOfFame] = useState<any[]>([])
  const [isLoadingHallOfFame, setIsLoadingHallOfFame] = useState(true)

  const canPost = user?.role === "admin" || user?.role === "coach"
  const isAdmin = user?.role === "admin"
  const isCoach = user?.role === "coach"

  // Cargar Posts desde la Base de Datos
  const loadPosts = async () => {
    setIsLoadingPosts(true)
    const res = await getCommunityPostsAction()
    if (res.success && res.posts) {
      setPosts(res.posts)
    }
    setIsLoadingPosts(false)
  }

  // Cargar Retos desde la Base de Datos
  const loadChallenges = async () => {
    setIsLoadingChallenges(true)
    const res = await getCommunityChallengesAction()
    if (res.success && res.challenges) {
      setChallenges(res.challenges)
    }
    setIsLoadingChallenges(false)
  }

  // Cargar Salón de la Fama desde la Base de Datos
  const loadHallOfFame = async () => {
    setIsLoadingHallOfFame(true)
    const res = await getHallOfFameAction()
    if (res.success && res.leaders) {
      setHallOfFame(res.leaders)
    }
    setIsLoadingHallOfFame(false)
  }

  useEffect(() => {
    loadPosts()
    loadChallenges()
    loadHallOfFame()
  }, [])

  // Crear Publicación
  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTitle.trim() || !newContent.trim()) {
      showToast("Por favor completa el título y el contenido.", "error")
      return
    }

    setIsSubmittingPost(true)
    const res = await createCommunityPostAction({
      title: newTitle,
      content: newContent,
      tag: newTag,
    })

    if (res.success) {
      showToast("Publicación añadida al muro.", "success")
      setNewTitle("")
      setNewContent("")
      loadPosts()
    } else {
      showToast(res.error || "Error al publicar.", "error")
    }
    setIsSubmittingPost(false)
  }

  // Eliminar Publicación
  const handleDeletePost = async (postId: string) => {
    if (!confirm("¿Deseas eliminar esta publicación?")) return
    const res = await deleteCommunityPostAction(postId)
    if (res.success) {
      showToast("Publicación eliminada.", "success")
      setPosts((prev) => prev.filter((p) => p.id !== postId))
    } else {
      showToast(res.error || "No se pudo eliminar.", "error")
    }
  }

  // Reacciones (Me gusta, Me encanta)
  const handleReaction = async (postId: string, type: "LIKE" | "LOVE") => {
    if (!user) {
      showToast("Debes iniciar sesión para reaccionar.", "warning")
      return
    }

    // Actualización optimista en el cliente
    setPosts((prev) =>
      prev.map((post) => {
        if (post.id !== postId) return post
        const reactions = Array.isArray(post.reactions) ? [...post.reactions] : []
        const existingIdx = reactions.findIndex((r: any) => r.userId === user.id)

        if (existingIdx >= 0) {
          if (reactions[existingIdx].type === type) {
            reactions.splice(existingIdx, 1) // Quitar
          } else {
            reactions[existingIdx] = { ...reactions[existingIdx], type } // Cambiar
          }
        } else {
          reactions.push({
            id: `temp-${Date.now()}`,
            userId: user.id,
            postId,
            type,
          })
        }
        return { ...post, reactions }
      })
    )

    await toggleCommunityReactionAction(postId, type)
  }

  // Crear Reto
  const handleCreateChallenge = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!challengeTitle.trim() || !challengeDesc.trim()) {
      showToast("Completa los datos del reto.", "error")
      return
    }

    setIsSubmittingChallenge(true)
    const res = await createCommunityChallengeAction({
      title: challengeTitle,
      description: challengeDesc,
      category: challengeCategory,
      daysLeft: challengeDays,
    })

    if (res.success) {
      showToast(res.message || "Reto creado exitosamente.", "success")
      setChallengeTitle("")
      setChallengeDesc("")
      setShowChallengeModal(false)
      loadChallenges()
    } else {
      showToast(res.error || "Error al crear el reto.", "error")
    }
    setIsSubmittingChallenge(false)
  }

  // Aprobar / Rechazar Reto (Admin)
  const handleChallengeStatus = async (challengeId: string, status: "APPROVED" | "REJECTED") => {
    const res = await updateChallengeStatusAction(challengeId, status)
    if (res.success) {
      showToast(
        status === "APPROVED" ? "Reto aprobado y publicado." : "Reto rechazado.",
        "success"
      )
      loadChallenges()
    } else {
      showToast(res.error || "Error al actualizar estado.", "error")
    }
  }

  // Unirse al Reto
  const handleJoinChallenge = async (challengeId: string) => {
    if (!user) {
      showToast("Inicia sesión para unirte al reto.", "warning")
      return
    }

    const res = await toggleJoinChallengeAction(challengeId)
    if (res.success) {
      showToast(res.joined ? "¡Te has unido al reto!" : "Te has desuscrito del reto.", "info")
      loadChallenges()
    } else {
      showToast(res.error || "Error.", "error")
    }
  }

  // Guardar Filosofía (Solo Admin)
  const handleSavePhilosophy = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!philosophyText.trim()) return

    setIsSavingPhilosophy(true)
    const res = await updateTrainingPhilosophyAction(philosophyText)
    if (res.success) {
      updateSettings({ trainingPhilosophy: philosophyText.trim() })
      showToast("Filosofía de entrenamiento actualizada.", "success")
      setShowPhilosophyModal(false)
    } else {
      showToast(res.error || "Error al guardar.", "error")
    }
    setIsSavingPhilosophy(false)
  }

  // Guardar Horarios de Sala (Solo Admin)
  const handleSaveSchedule = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSavingSchedule(true)
    const newSchedule = {
      weekdays: scheduleWeekdays.trim(),
      saturdays: scheduleSaturdays.trim(),
      sundays: scheduleSundays.trim(),
    }
    const res = await updateGymScheduleAction(newSchedule)
    if (res.success) {
      updateSettings({ gymSchedule: newSchedule })
      showToast("Horarios de sala actualizados correctamente.", "success")
      setShowScheduleModal(false)
    } else {
      showToast(res.error || "Error al actualizar horarios.", "error")
    }
    setIsSavingSchedule(false)
  }

  // Horarios de sala dinámicos desde Ajustes
  const gymSchedule = settings.gymSchedule || {
    weekdays: "6:00 AM - 10:00 PM",
    saturdays: "7:00 AM - 6:00 PM",
    sundays: "8:00 AM - 2:00 PM",
  }

  return (
    <div className="w-full max-w-none px-2 sm:px-4 md:px-8 pb-16 space-y-8">
      {/* Hero Header a Ancho Completo */}
      <div className="relative overflow-hidden rounded-3xl border border-black/10 dark:border-white/10 bg-gradient-to-br from-card via-card/90 to-background p-6 md:p-10 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/30 text-primary text-xs font-black uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              Comunidad & Cultura Fitness Oficial
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold uppercase font-display tracking-tight text-foreground">
              Comunidad <span className="text-primary">{settings.appName || ""}</span>
            </h1>
            <p className="text-muted-foreground max-w-3xl text-sm md:text-base leading-relaxed">
              Punto de encuentro para anuncios oficiales, técnicas de entrenamiento compartidas por los coaches y retos mensuales diseñados para superar tus límites.
            </p>
          </div>

          {/* User Status Pill */}
          <div className="flex items-center gap-4 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 backdrop-blur-md p-4 rounded-2xl self-start md:self-auto shrink-0">
            {user?.profilePicture ? (
              <img
                src={user.profilePicture}
                alt={user.name}
                className="w-12 h-12 rounded-2xl object-cover border-2 border-primary/40 shadow-md"
              />
            ) : (
              <div className="w-12 h-12 rounded-2xl bg-primary/20 border border-primary/40 flex items-center justify-center font-black text-primary text-base">
                {user?.name?.slice(0, 2).toUpperCase() || "GYM"}
              </div>
            )}
            <div>
              <span className="block text-sm font-extrabold text-foreground">{user?.name || "Invitado"}</span>
              <span className="text-xs font-bold uppercase tracking-wider text-primary">
                {user?.role === "admin"
                  ? "Administrador"
                  : user?.role === "coach"
                  ? "Entrenador"
                  : "Atleta Oficial"}
              </span>
            </div>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex gap-2 mt-8 border-b border-border/60 pb-3 overflow-x-auto">
          <button
            onClick={() => setActiveTab("muro")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold tracking-wide transition-all ${
              activeTab === "muro"
                ? "bg-primary text-primary-foreground shadow-md shadow-primary/25"
                : "text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5"
            }`}
          >
            <MessageSquare className="w-4 h-4" /> Muro & Avisos Oficiales
          </button>
          <button
            onClick={() => setActiveTab("retos")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold tracking-wide transition-all ${
              activeTab === "retos"
                ? "bg-primary text-primary-foreground shadow-md shadow-primary/25"
                : "text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5"
            }`}
          >
            <Flame className="w-4 h-4" /> Retos del Mes
          </button>
          <button
            onClick={() => setActiveTab("ranking")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold tracking-wide transition-all ${
              activeTab === "ranking"
                ? "bg-primary text-primary-foreground shadow-md shadow-primary/25"
                : "text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5"
            }`}
          >
            <Trophy className="w-4 h-4" /> Salón de la Fama
          </button>
        </div>
      </div>

      {/* Main Grid: 100% de la pantalla */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start w-full">
        {/* Left Column (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {activeTab === "muro" && (
            <>
              {/* Formulario de Publicación: SOLO Administradores y Entrenadores */}
              {canPost ? (
                <div className="rounded-2xl border border-primary/30 bg-card p-6 shadow-xl space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {user?.profilePicture ? (
                        <img
                          src={user.profilePicture}
                          alt={user.name}
                          className="w-10 h-10 rounded-full object-cover border border-primary/40"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center font-black text-primary text-sm">
                          {user?.name?.slice(0, 2).toUpperCase() || "ST"}
                        </div>
                      )}
                      <div>
                        <h4 className="font-extrabold text-sm text-foreground flex items-center gap-2">
                          {user?.name}
                          <span className="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded-full uppercase font-black">
                            {user?.role === "admin" ? "Admin" : "Coach"}
                          </span>
                        </h4>
                        <p className="text-xs text-muted-foreground">Publicar aviso o comunicado en el muro</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-primary flex items-center gap-1">
                      <ShieldCheck className="w-4 h-4" /> Autorizado para publicar
                    </span>
                  </div>

                  <form onSubmit={handleCreatePost} className="space-y-3.5">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <input
                        type="text"
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        placeholder="Título del anuncio..."
                        className="sm:col-span-2 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                        required
                      />
                      <select
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        className="bg-card dark:bg-zinc-900 border border-black/10 dark:border-white/10 rounded-xl px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                      >
                        <option value="Aviso Oficial" className="bg-card text-foreground py-1">Aviso Oficial</option>
                        <option value="Técnica & Entrenamiento" className="bg-card text-foreground py-1">Técnica & Entrenamiento</option>
                        <option value="Nuevos Equipos" className="bg-card text-foreground py-1">Nuevos Equipos</option>
                        <option value="Nutrición & Salud" className="bg-card text-foreground py-1">Nutrición & Salud</option>
                        <option value="Motivación" className="bg-card text-foreground py-1">Motivación</option>
                      </select>
                    </div>

                    <textarea
                      value={newContent}
                      onChange={(e) => setNewContent(e.target.value)}
                      placeholder="Escribe el mensaje o comunicado oficial para los atletas..."
                      rows={3}
                      className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl p-3.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm resize-none transition-all"
                      required
                    />

                    <div className="flex justify-between items-center pt-1">
                      <span className="text-xs text-muted-foreground">
                        Visible en tiempo real para todos los atletas del gimnasio
                      </span>
                      <Button type="submit" disabled={isSubmittingPost} size="sm">
                        {isSubmittingPost ? "Publicando..." : "Publicar Comunicado"}
                      </Button>
                    </div>
                  </form>
                </div>
              ) : (
                /* Mensaje para Atletas: Información de que solo coaches/admin publican */
                <div className="rounded-2xl border border-border/80 bg-black/5 dark:bg-white/5 p-4 flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-2.5">
                    <Dumbbell className="w-4 h-4 text-primary" />
                    <span>
                      Tablón oficial de la comunidad. Las publicaciones son emitidas por entrenadores y administración. ¡Puedes reaccionar a cada una!
                    </span>
                  </div>
                </div>
              )}

              {/* Lista de Publicaciones desde Base de Datos */}
              {isLoadingPosts ? (
                <div className="py-12 text-center text-muted-foreground text-sm">
                  Cargando publicaciones del muro...
                </div>
              ) : posts.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border p-12 text-center text-muted-foreground">
                  <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-40" />
                  <p className="font-bold text-sm">Aún no hay publicaciones en el muro.</p>
                  <p className="text-xs mt-1">Los avisos de los entrenadores aparecerán aquí.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {posts.map((post) => {
                    const postReactions = Array.isArray(post.reactions) ? post.reactions : []
                    const likeCount = postReactions.filter((r: any) => r.type === "LIKE").length
                    const loveCount = postReactions.filter((r: any) => r.type === "LOVE").length
                    const userReaction = postReactions.find((r: any) => r.userId === user?.id)?.type

                    return (
                      <div
                        key={post.id}
                        className="rounded-2xl border border-black/10 dark:border-white/10 bg-card p-6 shadow-md hover:border-primary/40 transition-all duration-300 space-y-4"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-center gap-3">
                            {post.author?.profilePicture ? (
                              <img
                                src={post.author.profilePicture}
                                alt={post.author.name}
                                className="w-11 h-11 rounded-2xl object-cover border-2 border-primary/30 shadow-sm"
                              />
                            ) : (
                              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30 flex items-center justify-center font-black text-primary text-sm shadow-sm">
                                {post.author?.name?.slice(0, 2).toUpperCase() || "GP"}
                              </div>
                            )}
                            <div>
                              <h4 className="font-bold text-sm text-foreground flex items-center gap-2">
                                {post.author?.name || "Autor"}
                                <span className="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded-full font-black uppercase">
                                  {post.author?.role === "admin" ? "Admin" : "Coach"}
                                </span>
                              </h4>
                              <p className="text-xs text-muted-foreground">
                                {new Date(post.createdAt).toLocaleDateString("es-ES", {
                                  day: "numeric",
                                  month: "short",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-black/5 dark:bg-white/5 text-muted-foreground border border-black/10 dark:border-white/10">
                              {post.tag}
                            </span>
                            {isAdmin && (
                              <button
                                onClick={() => handleDeletePost(post.id)}
                                title="Eliminar publicación (Solo Administrador)"
                                className="text-muted-foreground hover:text-destructive p-1 rounded-lg transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>

                        <div>
                          <h3 className="text-base font-extrabold text-foreground mb-1.5">{post.title}</h3>
                          <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                            {post.content}
                          </p>
                        </div>

                        {/* Barra de Reacciones: Me gusta y Me encanta */}
                        <div className="pt-3 border-t border-border flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {/* Botón: Me gusta */}
                            <button
                              onClick={() => handleReaction(post.id, "LIKE")}
                              className={`flex items-center gap-1.5 text-xs font-bold transition-all px-3 py-1.5 rounded-xl border ${
                                userReaction === "LIKE"
                                  ? "bg-primary/20 border-primary/50 text-primary"
                                  : "bg-black/5 dark:bg-white/5 border-transparent text-muted-foreground hover:text-foreground"
                              }`}
                            >
                              <ThumbsUp className="w-3.5 h-3.5" />
                              <span>Me gusta ({likeCount})</span>
                            </button>

                            {/* Botón: Me encanta */}
                            <button
                              onClick={() => handleReaction(post.id, "LOVE")}
                              className={`flex items-center gap-1.5 text-xs font-bold transition-all px-3 py-1.5 rounded-xl border ${
                                userReaction === "LOVE"
                                  ? "bg-rose-500/20 border-rose-500/50 text-rose-500"
                                  : "bg-black/5 dark:bg-white/5 border-transparent text-muted-foreground hover:text-foreground"
                              }`}
                            >
                              <Heart className={`w-3.5 h-3.5 ${userReaction === "LOVE" ? "fill-current" : ""}`} />
                              <span>Me encanta ({loveCount})</span>
                            </button>
                          </div>

                          <div className="text-[11px] text-muted-foreground font-semibold">
                            {likeCount + loveCount} reacciones en total
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </>
          )}

          {activeTab === "retos" && (
            <div className="space-y-6">
              {/* Botón para Proponer/Crear Reto: Solo Coaches y Admin */}
              {canPost && (
                <div className="flex justify-between items-center bg-card p-4 rounded-2xl border border-black/10 dark:border-white/10 shadow-sm">
                  <div>
                    <h4 className="font-extrabold text-sm text-foreground">Gestión de Desafíos Fitness</h4>
                    <p className="text-xs text-muted-foreground">
                      {isAdmin
                        ? "Como Administrador puedes crear y aprobar retos de los entrenadores."
                        : "Como Entrenador puedes proponer retos para que los apruebe el Administrador."}
                    </p>
                  </div>
                  <Button onClick={() => setShowChallengeModal(true)} size="sm">
                    <PlusCircle className="w-4 h-4 mr-1.5" />
                    {isAdmin ? "Crear Reto Oficial" : "Proponer Reto del Mes"}
                  </Button>
                </div>
              )}

              {/* Lista de Retos */}
              {isLoadingChallenges ? (
                <div className="py-12 text-center text-muted-foreground text-sm">
                  Cargando retos de la comunidad...
                </div>
              ) : challenges.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border p-12 text-center text-muted-foreground">
                  <Flame className="w-10 h-10 mx-auto mb-3 opacity-40" />
                  <p className="font-bold text-sm">No hay retos activos en este momento.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {challenges.map((c) => {
                    const isJoined = c.participants?.some((p: any) => p.userId === user?.id)
                    const participantCount = c.participants?.length || 0
                    const isPending = c.status === "PENDING"

                    return (
                      <div
                        key={c.id}
                        className={`rounded-2xl border bg-card p-6 shadow-md relative overflow-hidden space-y-4 ${
                          isPending ? "border-amber-500/50 bg-amber-500/5" : "border-black/10 dark:border-white/10"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                              <span className="text-[11px] font-black uppercase tracking-wider text-amber-500 bg-amber-500/10 px-2.5 py-0.5 rounded-full">
                                {c.category}
                              </span>
                              <span className="text-xs text-muted-foreground">• {c.daysLeft} días restantes</span>
                              {isPending && (
                                <span className="text-[10px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-500/30">
                                  Pendiente de Aprobación
                                </span>
                              )}
                            </div>
                            <h3 className="text-xl font-bold font-display text-foreground">{c.title}</h3>
                            <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{c.description}</p>
                            <p className="text-xs text-muted-foreground mt-2 flex items-center gap-2">
                              {c.creator?.profilePicture && (
                                <img
                                  src={c.creator.profilePicture}
                                  alt={c.creator.name}
                                  className="w-4 h-4 rounded-full object-cover"
                                />
                              )}
                              <span>Propuesto por <strong>{c.creator?.name}</strong></span>
                            </p>
                          </div>

                          {/* Acciones: Si está pendiente y soy Admin -> Aprobar/Rechazar. Si está aprobado -> Inscribirse */}
                          <div className="shrink-0 flex items-center gap-2">
                            {isPending && isAdmin ? (
                              <div className="flex items-center gap-2">
                                <Button
                                  onClick={() => handleChallengeStatus(c.id, "APPROVED")}
                                  size="sm"
                                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                                >
                                  <Check className="w-4 h-4 mr-1" /> Aprobar
                                </Button>
                                <Button
                                  onClick={() => handleChallengeStatus(c.id, "REJECTED")}
                                  size="sm"
                                  variant="danger"
                                >
                                  <X className="w-4 h-4 mr-1" /> Rechazar
                                </Button>
                              </div>
                            ) : !isPending ? (
                              <Button
                                onClick={() => handleJoinChallenge(c.id)}
                                variant={isJoined ? "outline" : "primary"}
                                size="sm"
                              >
                                {isJoined ? (
                                  <>
                                    <CheckCircle2 className="w-4 h-4 text-emerald-500 mr-1.5" /> Inscrito
                                  </>
                                ) : (
                                  "Unirme al Reto"
                                )}
                              </Button>
                            ) : null}
                          </div>
                        </div>

                        {!isPending && (
                          <div className="space-y-1.5 pt-3 border-t border-border">
                            <div className="flex justify-between text-xs text-muted-foreground font-semibold">
                              <span>Participantes inscritos</span>
                              <span>{participantCount} atletas activos</span>
                            </div>
                            <div className="w-full h-2 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-amber-500 to-primary rounded-full transition-all duration-500"
                                style={{ width: `${Math.min(100, participantCount * 10)}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === "ranking" && (
            <div className="rounded-2xl border border-black/10 dark:border-white/10 bg-card p-6 shadow-lg space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-extrabold uppercase font-display text-foreground">
                    Atletas del Mes & Máximos Récords
                  </h3>
                  <p className="text-xs text-muted-foreground">Reconocimiento a la constancia y disciplina</p>
                </div>
                <Trophy className="w-8 h-8 text-amber-400" />
              </div>

              {isLoadingHallOfFame ? (
                <div className="py-12 text-center text-muted-foreground text-sm">
                  Cargando récords y méritos de atletas...
                </div>
              ) : hallOfFame.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground space-y-2">
                  <Trophy className="w-10 h-10 mx-auto text-amber-500/40" />
                  <p className="font-bold text-sm">Aún no hay récords registrados.</p>
                  <p className="text-xs">A medida que los atletas registren asistencias, avances de peso y retos completados, irán figurando aquí automáticamente.</p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {hallOfFame.map((item) => (
                    <div key={`${item.athleteId}-${item.category}-${item.pos}`} className="py-4 flex items-center justify-between gap-4 first:pt-0 last:pb-0">
                      <div className="flex items-center gap-3">
                        <span className={`w-8 h-8 rounded-xl bg-black/5 dark:bg-white/5 flex items-center justify-center font-black font-display text-base ${item.color}`}>
                          #{item.pos}
                        </span>
                        {item.profilePicture ? (
                          <img
                            src={item.profilePicture}
                            alt={item.name}
                            className="w-10 h-10 rounded-full object-cover border border-primary/40"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center font-black text-primary text-xs">
                            {item.name?.slice(0, 2).toUpperCase() || "AT"}
                          </div>
                        )}
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-sm text-foreground">{item.name}</h4>
                            <span className="text-[10px] text-primary/80 font-semibold bg-primary/10 px-2 py-0.5 rounded-md">
                              {item.category}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground">{item.stat}</p>
                        </div>
                      </div>
                      <span className="text-xs font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-black/5 dark:bg-white/5 border border-border">
                        {item.badge}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Filosofía de Entrenamiento: Editable SOLO por Admin */}
          <div className="rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/10 via-card to-card p-6 shadow-xl relative overflow-hidden space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-xl bg-primary text-primary-foreground">
                  <Flame className="w-5 h-5" />
                </div>
                <h3 className="font-black text-base uppercase font-display text-foreground tracking-wide">
                  Filosofía de Entrenamiento
                </h3>
              </div>

              {/* Botón de Edición: Solo visible para el Administrador */}
              {isAdmin && (
                <button
                  onClick={() => setShowPhilosophyModal(true)}
                  className="p-2 rounded-xl bg-primary/20 hover:bg-primary/30 text-primary transition-all text-xs font-bold flex items-center gap-1"
                  title="Editar Filosofía (Solo Administrador)"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Editar</span>
                </button>
              )}
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed italic pt-1">
              &quot;{settings.trainingPhilosophy || philosophyText}&quot;
            </p>

            <div className="pt-3 border-t border-border flex items-center justify-between text-xs">
              <span className="font-bold text-primary">{settings.appName || ""}</span>
              <span className="text-muted-foreground">Staff & Coaches</span>
            </div>
          </div>

          {/* Horarios de Sala: Totalmente configurables en Ajustes */}
          <div className="rounded-2xl border border-black/10 dark:border-white/10 bg-card p-6 shadow-md space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary" />
                <h4 className="font-bold text-sm uppercase tracking-wider text-foreground">Horarios de Sala</h4>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] bg-primary/15 text-primary px-2 py-0.5 rounded-full font-bold">Oficial</span>
                {isAdmin && (
                  <button
                    onClick={() => {
                      setScheduleWeekdays(gymSchedule.weekdays)
                      setScheduleSaturdays(gymSchedule.saturdays)
                      setScheduleSundays(gymSchedule.sundays)
                      setShowScheduleModal(true)
                    }}
                    className="p-1.5 rounded-lg bg-primary/20 hover:bg-primary/30 text-primary transition-all text-xs font-bold flex items-center gap-1"
                    title="Editar Horarios (Solo Administrador)"
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>Editar</span>
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-2.5 text-xs text-muted-foreground">
              <div className="flex justify-between py-1.5 border-b border-border/50">
                <span className="font-medium">Lunes a Viernes</span>
                <span className="font-bold text-foreground">{gymSchedule.weekdays}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-border/50">
                <span className="font-medium">Sábados</span>
                <span className="font-bold text-foreground">{gymSchedule.saturdays}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="font-medium">Domingos & Feriados</span>
                <span className="font-bold text-foreground">{gymSchedule.sundays}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL: Proponer / Crear Reto */}
      <Dialog
        open={showChallengeModal}
        onClose={() => setShowChallengeModal(false)}
        title={isAdmin ? "Crear Reto Oficial" : "Proponer Reto del Mes"}
        description={
          isAdmin
            ? "El reto se publicará inmediatamente para todos los atletas."
            : "Tu propuesta será revisada y aprobada por el administrador antes de ser visible."
        }
      >
        <form onSubmit={handleCreateChallenge} className="space-y-4">
          <div>
            <label className="text-xs font-semibold block mb-1">Título del Reto</label>
            <input
              type="text"
              value={challengeTitle}
              onChange={(e) => setChallengeTitle(e.target.value)}
              placeholder="Ej. Reto Fuerza 300 lbs"
              className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold block mb-1">Categoría</label>
              <select
                value={challengeCategory}
                onChange={(e) => setChallengeCategory(e.target.value)}
                className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl px-3 py-2.5 text-sm"
              >
                <option value="Fuerza">Fuerza</option>
                <option value="Resistencia">Resistencia</option>
                <option value="Disciplina">Disciplina</option>
                <option value="Cardio">Cardio</option>
                <option value="Pérdida de Grasa">Pérdida de Grasa</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold block mb-1">Días de Duración</label>
              <input
                type="number"
                min={1}
                max={90}
                value={challengeDays}
                onChange={(e) => setChallengeDays(Number(e.target.value))}
                className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold block mb-1">Descripción y Reglas</label>
            <textarea
              rows={3}
              value={challengeDesc}
              onChange={(e) => setChallengeDesc(e.target.value)}
              placeholder="Describe en qué consiste el reto y cómo se mide la victoria..."
              className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl p-3 text-sm resize-none"
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setShowChallengeModal(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmittingChallenge}>
              {isSubmittingChallenge ? "Guardando..." : isAdmin ? "Publicar Reto" : "Enviar a Aprobación"}
            </Button>
          </div>
        </form>
      </Dialog>

      {/* MODAL: Editar Filosofía de Entrenamiento (Solo Admin) */}
      <Dialog
        open={showPhilosophyModal}
        onClose={() => setShowPhilosophyModal(false)}
        title="Editar Filosofía de Entrenamiento"
        description="Esta cita o lema define la identidad motivacional del gimnasio."
      >
        <form onSubmit={handleSavePhilosophy} className="space-y-4">
          <textarea
            rows={4}
            value={philosophyText}
            onChange={(e) => setPhilosophyText(e.target.value)}
            className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl p-3.5 text-sm resize-none"
            placeholder="Escribe la frase motivacional..."
            required
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setShowPhilosophyModal(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSavingPhilosophy}>
              {isSavingPhilosophy ? "Guardando..." : "Guardar Filosofía"}
            </Button>
          </div>
        </form>
      </Dialog>

      {/* MODAL: Editar Horarios de Sala (Solo Admin) */}
      <Dialog
        open={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
        title="Editar Horarios de Sala"
        description="Configura los horarios de atención que verán los atletas y entrenadores."
      >
        <form onSubmit={handleSaveSchedule} className="space-y-4">
          <div>
            <label className="text-xs font-semibold block mb-1">Lunes a Viernes</label>
            <input
              type="text"
              value={scheduleWeekdays}
              onChange={(e) => setScheduleWeekdays(e.target.value)}
              placeholder="Ej. 6:00 AM - 10:00 PM"
              className="w-full bg-card dark:bg-zinc-900 border border-black/10 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              required
            />
          </div>

          <div>
            <label className="text-xs font-semibold block mb-1">Sábados</label>
            <input
              type="text"
              value={scheduleSaturdays}
              onChange={(e) => setScheduleSaturdays(e.target.value)}
              placeholder="Ej. 7:00 AM - 6:00 PM"
              className="w-full bg-card dark:bg-zinc-900 border border-black/10 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              required
            />
          </div>

          <div>
            <label className="text-xs font-semibold block mb-1">Domingos y Feriados</label>
            <input
              type="text"
              value={scheduleSundays}
              onChange={(e) => setScheduleSundays(e.target.value)}
              placeholder="Ej. 8:00 AM - 2:00 PM"
              className="w-full bg-card dark:bg-zinc-900 border border-black/10 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setShowScheduleModal(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSavingSchedule}>
              {isSavingSchedule ? "Guardando..." : "Guardar Horarios"}
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  )
}
