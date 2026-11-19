"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { athleteService, AthleteProfile, BiometricRecord } from "@/lib/data-service"
import { storeService, Transaction } from "@/lib/store-service"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, User, Calendar, Activity, ClipboardList, TrendingUp, Search, Camera, Loader2, CalendarCheck, Edit, Check, X, KeyRound, User as UserIcon, MessageSquare, CreditCard, Receipt, ShieldAlert, Send } from "lucide-react"
import { useSettings } from "@/lib/settings-context"
import { calculateCutoffDate, askPassword } from "@/lib/confirm"
import { toDateInputValue, formatDisplayDate } from "@/lib/utils"
import { updateCoachProfile } from "@/app/actions/users"
import { RoutineAssignmentModal } from "@/components/modals/routine-assignment-modal"
import { AttendanceHistoryModal } from "@/components/athletes/attendance-history-modal"
import Link from "next/link"
import { useParams } from "next/navigation"
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'

import Swal from 'sweetalert2'
import { showSweetToast } from "@/lib/toast-context"

export default function AtletaPerfilPage() {
  const calculateAge = (dateStr?: string | null) => {
    if (!dateStr) return null
    const birth = new Date(dateStr + "T00:00:00")
    if (isNaN(birth.getTime())) return null
    const today = new Date()
    let age = today.getFullYear() - birth.getFullYear()
    const m = today.getMonth() - birth.getMonth()
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    return age >= 0 && age <= 120 ? age : null
  }
  const { user, getAllEmployees, updateUserProfilePicture } = useAuth()
  const { settings } = useSettings()
  const params = useParams()
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id

  const [athlete, setAthlete] = useState<AthleteProfile | null>(null)
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false)
  const [photoError, setPhotoError] = useState(false)
  const [showAttendanceModal, setShowAttendanceModal] = useState(false)

  // Estados para Modal de Edición de Datos y Credenciales (Admin/Gerente)
  const [showEditAthleteModal, setShowEditAthleteModal] = useState(false)
  const [editName, setEditName] = useState("")
  const [editCedula, setEditCedula] = useState("")
  const [editPhone, setEditPhone] = useState("")
  const [editEmail, setEditEmail] = useState("")
  const [editAddress, setEditAddress] = useState("")
  const [editBirthDate, setEditBirthDate] = useState("")
  const [editGender, setEditGender] = useState("M")
  const [editCoachId, setEditCoachId] = useState("")
  const [editGuardianName, setEditGuardianName] = useState("")
  const [editGuardianCedula, setEditGuardianCedula] = useState("")
  const [editGuardianPhone, setEditGuardianPhone] = useState("")
  const [editPassword, setEditPassword] = useState("")
  const [editConfirmPassword, setEditConfirmPassword] = useState("")
  const [isSavingAthlete, setIsSavingAthlete] = useState(false)
  const [isSendingReset, setIsSendingReset] = useState(false)

  // Estados para Modal de Edición Directa de Membresía y Coach (Admin/Gerente)
  const [showEditMembershipModal, setShowEditMembershipModal] = useState(false)
  const [editMembStart, setEditMembStart] = useState("")
  const [editMembEnd, setEditMembEnd] = useState("")
  const [editMembPlan, setEditMembPlan] = useState("")
  const [editMembCoach, setEditMembCoach] = useState("")
  const [isSavingMembership, setIsSavingMembership] = useState(false)

  // WhatsApp 1-Click State
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false)
  const [whatsAppText, setWhatsAppText] = useState("")

  const canEditAthlete = user?.role === 'admin' || user?.role === 'gerente' || user?.role === 'cajero' || user?.role === 'recepcion'
  const canSendWhatsApp = user && (user.role === 'admin' || user.role === 'gerente' || user.role === 'cajero' || user.role === 'recepcion' || user.role === 'coach')

  const defaultLandingPlans = [
    { name: "PLAN CORPORATIVO", price: "$25", billingPeriod: "/mes" },
    { name: "PLAN MAXIMUM BASICO", price: "$25", billingPeriod: "/mes" },
    { name: "PLAN SOLO PARA ELLAS", price: "$25", billingPeriod: "/mes" },
    { name: "PLAN ADULTO MAYOR", price: "$25", billingPeriod: "/mes" },
  ]
  const rawLandingPlans = settings?.landingSettings?.plansSettings?.plans?.length
    ? settings.landingSettings.plansSettings.plans
    : defaultLandingPlans
  const baseMonthlyPrice = settings?.monthlyFee || 25
  const promotionalPlans = rawLandingPlans.map((p: any) => {
    const rawNum = parseFloat(String(p.price || "").replace(/[^0-9.]/g, ""))
    return {
      name: String(p.name || "Plan Promocional").trim(),
      price: Number.isFinite(rawNum) && rawNum > 0 ? rawNum : baseMonthlyPrice,
      period: p.billingPeriod || p.period || "/mes",
    }
  })
  const availablePlans = [
    { name: "Plan Estándar", price: baseMonthlyPrice, period: "/mes" },
    ...promotionalPlans.filter((p: any) => p.name.toLowerCase() !== "plan estándar")
  ]

  const applyWhatsAppTemplate = (type: 'receipt' | 'expiry' | 'welcome') => {
    if (!athlete) return
    const firstName = athlete.name.split(' ')[0]
    const gymName = settings?.appName || "Maximum Evolution Fit"
    const endDate = athlete.membershipEnd && athlete.membershipEnd !== "1970-01-01T00:00:00.000Z"
      ? formatDisplayDate(athlete.membershipEnd)
      : "Vigente"
    const planName = (athlete as any).membershipType || (athlete as any).planName || "Membresía Activa"

    if (type === 'receipt') {
      setWhatsAppText(`🏋️ *Comprobante de Membresía / Pago* 📄\n\n¡Hola ${firstName}! Confirmamos el registro y activación de tu membresía (*${planName}*) en *${gymName}*.\n\n📅 Válido hasta: *${endDate}*\n💳 C.I./ID: *${athlete.cedula}*\n\n¡Gracias por entrenar con nosotros! Dale con toda.`);
    } else if (type === 'expiry') {
      setWhatsAppText(`⏰ *Recordatorio de Membresía - ${gymName}* 🏋️‍♂️\n\n¡Hola ${firstName}! Te recordamos de forma amistosa que tu membresía (*${planName}*) está próxima a vencer este *${endDate}*.\n\nPuedes renovarla cómodamente en recepción o a través de nuestros canales de pago para que no pares tu progreso. ¡Te esperamos!`);
    } else if (type === 'welcome') {
      setWhatsAppText(`🎉 *¡Bienvenido(a) a ${gymName}!* 🚀\n\n¡Hola ${firstName}! Estamos muy felices de tenerte con nosotros. Tu ficha ha sido creada exitosamente.\n\n🎫 *Pase Digital:* Puedes identificarte en recepción con tu C.I. *${athlete.cedula}* o con tu código QR personal desde tu portal web.\n\n¡A darlo todo en cada entrenamiento! 💪🔥`);
    }
  }

  const handleSendWhatsApp = () => {
    if (!athlete) return
    if (!athlete.phone) {
      showSweetToast("El atleta no tiene un número de teléfono registrado.", "warning")
      return
    }
    const cleanPhone = athlete.phone.replace(/\D/g, '')
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(whatsAppText)}`
    window.open(url, '_blank')
    setShowWhatsAppModal(false)
    setWhatsAppText("")
  }

  // Solo el propio usuario puede modificar su foto de perfil
  const canChangePhoto = Boolean(
    user && user.id === athlete?.id
  )

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !athlete) return
    const previousPhoto = athlete.profilePicture
    setIsUploadingPhoto(true)
    try {
      const { compressImage } = await import('@/lib/image-compress')
      const compressedBase64 = await compressImage(file, 400, 400, 0.8, 55000)

      // Vista previa inmediata mientras se guarda en base de datos
      setAthlete(prev => prev ? { ...prev, profilePicture: compressedBase64 } : null)

      const { updateProfilePicture } = await import('@/app/actions/users')
      const res = await updateProfilePicture(athlete.id, compressedBase64)

      if (res.success && res.profilePicture) {
        setAthlete(prev => prev ? { ...prev, profilePicture: res.profilePicture } : null)
        if (user?.id === athlete.id && updateUserProfilePicture) {
          updateUserProfilePicture(res.profilePicture)
        }
        showSweetToast("Foto de perfil guardada con éxito.", "success")
      } else {
        setAthlete(prev => prev ? { ...prev, profilePicture: previousPhoto } : null)
        showSweetToast(res.error || "No se pudo guardar la foto del atleta.", "error")
      }
    } catch (err: any) {
      setAthlete(prev => prev ? { ...prev, profilePicture: previousPhoto } : null)
      showSweetToast(err?.message || "Error al procesar la foto.", "error")
    } finally {
      setIsUploadingPhoto(false)
      e.target.value = ""
    }
  }

  // Form states for new biometrics
  const [showForm, setShowForm] = useState(false)
  const [newWeight, setNewWeight] = useState("")
  const [newHeight, setNewHeight] = useState("")
  const [newChest, setNewChest] = useState("")
  const [newWaist, setNewWaist] = useState("")
  const [newHips, setNewHips] = useState("")
  const [newCustomFields, setNewCustomFields] = useState<{name: string, unit: string, value: string}[]>([])

  
  const [showEditCoach, setShowEditCoach] = useState(false)
  const [editBio, setEditBio] = useState("")
  const [editSocial, setEditSocial] = useState<{platform: string, url: string}[]>([])

  const handleUpdateCoach = async (e: React.FormEvent) => {
    e.preventDefault()
    const socialStr = JSON.stringify(editSocial)
    const res = await updateCoachProfile(athlete!.id, { bio: editBio, socialLinks: socialStr })
    if (res.success) {
      setAthlete({...athlete, bio: editBio, socialLinks: socialStr} as any)
      setShowEditCoach(false)
      showSweetToast("Perfil actualizado correctamente", "success")
    } else {
      showSweetToast("Error actualizando perfil", "error")
    }
  }

  const handleAddSocial = () => {
    setEditSocial([...editSocial, { platform: "Instagram", url: "" }])
  }

  const [showCoachRequest, setShowCoachRequest] = useState(false)
  const [requestReason, setRequestReason] = useState("")

  const [showAdminCoachModal, setShowAdminCoachModal] = useState(false)
  const [coachSearch, setCoachSearch] = useState("")
  
  const [showRoutineModal, setShowRoutineModal] = useState(false)
  const [routineType, setRoutineType] = useState("Hipertrofia")
  const [routineStart, setRoutineStart] = useState("")
  const [routineEnd, setRoutineEnd] = useState("")
  const [routineRest, setRoutineRest] = useState("90s")

  const [requestTarget, setRequestTarget] = useState("")

  const [allCoaches, setAllCoaches] = useState<any[]>([])
  useEffect(() => {
    if (getAllEmployees) {
      getAllEmployees().then(res => {
        if (Array.isArray(res)) {
          setAllCoaches(res.filter((e: any) => e.role === 'coach' || e.role === 'employee'))
        }
      }).catch(console.error)
    }
  }, [getAllEmployees])

  const loadAthleteData = async () => {
    if (!id) return;
    const { getAthleteById } = await import('@/app/actions/users')
    const res = await getAthleteById(id)
    if (res.success && res.athlete) {
      setAthlete({
        ...res.athlete,
        membershipEnd: res.athlete.memberships?.[0]?.endDate || new Date(0).toISOString(),
        membershipStart: res.athlete.memberships?.[0]?.startDate || null,
        membershipType: res.athlete.memberships?.[0]?.planName || "Plan Estándar",
        biometrics: res.athlete.biometrics || [],
        attendances: res.athlete.attendances || []
      } as any)
    }
  }

  useEffect(() => {
    loadAthleteData()
  }, [id])

  const handleOpenEditMembership = () => {
    if (!athlete) return
    const sDate = athlete.membershipStart && new Date(athlete.membershipStart).getFullYear() > 1970
      ? new Date(athlete.membershipStart).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0]
    const eDate = athlete.membershipEnd && new Date(athlete.membershipEnd).getFullYear() > 1970
      ? new Date(athlete.membershipEnd).toISOString().split('T')[0]
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

    setEditMembStart(sDate)
    setEditMembEnd(eDate)
    setEditMembPlan((athlete as any).membershipType || (athlete as any).planName || "Plan Estándar")
    setEditMembCoach(athlete.coachId || "")
    setShowEditMembershipModal(true)
  }

  const handleSaveMembership = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!athlete) return
    if (!editMembEnd) {
      showSweetToast("Por favor ingresa la fecha de corte / vencimiento.", "warning")
      return
    }

    setIsSavingMembership(true)
    try {
      const { updateAthleteMembershipAndCoach } = await import('@/app/actions/users')
      const res = await updateAthleteMembershipAndCoach(athlete.id, {
        startDate: editMembStart,
        endDate: editMembEnd,
        planName: editMembPlan || "Plan Estándar",
        coachId: editMembCoach || null
      })

      if (res.success) {
        showSweetToast("Membresía y entrenador actualizados exitosamente.", "success")
        setShowEditMembershipModal(false)
        await loadAthleteData()
      } else {
        showSweetToast(res.error || "No se pudo actualizar la membresía.", "error")
      }
    } catch (err: any) {
      showSweetToast(err?.message || "Error al actualizar la membresía.", "error")
    } finally {
      setIsSavingMembership(false)
    }
  }

  const handleOpenEditAthlete = () => {
    if (!athlete) return
    setEditName(athlete.name || "")
    setEditCedula(athlete.cedula || "")
    setEditPhone(athlete.phone || "")
    setEditEmail((athlete as any).email || "")
    setEditAddress(athlete.address || "")
    setEditBirthDate((athlete as any).birthDate || "")
    setEditGender(athlete.gender || "M")
    setEditCoachId(athlete.coachId || "")
    setEditGuardianName((athlete as any).guardianName || "")
    setEditGuardianCedula((athlete as any).guardianCedula || "")
    setEditGuardianPhone((athlete as any).guardianPhone || "")
    setEditPassword("")
    setEditConfirmPassword("")

    const hasExistingMemb = Boolean(athlete.membershipEnd && new Date(athlete.membershipEnd).getFullYear() > 1970)
    const sDate = athlete.membershipStart && new Date(athlete.membershipStart).getFullYear() > 1970
      ? toDateInputValue(athlete.membershipStart)
      : toDateInputValue(new Date())
    const eDate = hasExistingMemb
      ? toDateInputValue(athlete.membershipEnd)
      : ""

    setEditMembStart(sDate)
    setEditMembEnd(eDate)
    setEditMembPlan((athlete as any).membershipType || (athlete as any).planName || (hasExistingMemb ? "Plan Estándar" : ""))
    setEditMembCoach(athlete.coachId || "")
    setShowEditAthleteModal(true)
  }

  const handleClearAthleteMembership = async () => {
    if (!athlete) return
    const superAdminPwd = await askPassword({
      title: "Autorización de Super Administrador",
      text: `Devolver o quitar la membresía de ${athlete.name} equivale a una devolución. Ingresa la contraseña del Super Administrador para confirmar:`,
    })
    if (!superAdminPwd) return

    setIsSavingAthlete(true)
    setIsSavingMembership(true)
    try {
      const { clearAthleteMembershipAction } = await import('@/app/actions/users')
      const res = await clearAthleteMembershipAction(athlete.id, superAdminPwd)
      if (res.success) {
        setEditMembEnd("")
        setEditMembPlan("")
        setShowEditAthleteModal(false)
        setShowEditMembershipModal(false)
        showSweetToast("Membresía devuelta a «Sin Membresía» correctamente.", "success")
        await loadAthleteData()
      } else {
        showSweetToast(res.error || "No se pudo quitar la membresía.", "error")
      }
    } catch (err: any) {
      showSweetToast(err?.message || "Error al quitar la membresía.", "error")
    } finally {
      setIsSavingAthlete(false)
      setIsSavingMembership(false)
    }
  }

  const handleSendResetLink = async (targetAthlete: { id: string; name: string; email?: string | null; phone?: string | null }) => {
    setIsSendingReset(true)
    try {
      const { adminSendAthletePasswordReset } = await import("@/app/actions/auth-reset")
      const res = await adminSendAthletePasswordReset(targetAthlete.id)
      if (!res.success) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: res.error || 'No se pudo generar el enlace de recuperación.'
        })
        return
      }

      const emailNote = res.emailSent
        ? `<div class="p-2.5 mb-3 bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 rounded-lg text-xs font-semibold">
             ✉️ Enlace enviado exitosamente al correo <b>${res.userEmail}</b>
           </div>`
        : res.hasEmail
        ? `<div class="p-2.5 mb-3 bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 rounded-lg text-xs font-semibold">
             ⚠️ No se pudo enviar por correo (${res.emailError || 'sin servidor SMTP configurado'}), pero el enlace está listo abajo.
           </div>`
        : `<div class="p-2.5 mb-3 bg-blue-500/15 border border-blue-500/30 text-blue-600 dark:text-blue-400 rounded-lg text-xs font-semibold">
             ℹ️ El atleta no tiene correo registrado. Puedes compartirle el enlace directamente por WhatsApp o copiarlo.
           </div>`;

      const phoneClean = res.userPhone ? res.userPhone.replace(/\D/g, "") : ""
      const waPhone = phoneClean.startsWith('58') ? phoneClean : phoneClean.length === 11 && phoneClean.startsWith('0') ? '58' + phoneClean.slice(1) : phoneClean
      const waUrl = waPhone
        ? `https://wa.me/${waPhone}?text=${encodeURIComponent(`Hola ${res.userName}! Aquí tienes tu enlace seguro para acceder y configurar tu contraseña en Maximum Evolution Fit:\n\n${res.resetUrl}\n\n(Válido por 60 minutos)`)}`
        : null

      await Swal.fire({
        title: 'Enlace de Restablecimiento',
        html: `
          <div class="text-left text-sm space-y-2">
            ${emailNote}
            <p class="text-xs text-muted-foreground mb-1 font-semibold">Enlace de acceso generado (válido por 60 min):</p>
            <div class="p-2.5 bg-black/10 dark:bg-white/10 rounded-lg font-mono text-[11px] break-all select-all border border-black/10 dark:border-white/10">
              ${res.resetUrl}
            </div>
            <div class="pt-3 flex flex-col gap-2">
              <button id="swal-copy-btn" type="button" class="w-full py-2.5 px-3 bg-amber-500 hover:bg-amber-600 text-black font-bold text-xs rounded-lg transition cursor-pointer">
                📋 Copiar Enlace al Portapapeles
              </button>
              ${waUrl ? `
                <a href="${waUrl}" target="_blank" rel="noopener noreferrer" class="w-full py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg text-center transition flex items-center justify-center gap-1.5 no-underline">
                  💬 Enviar por WhatsApp al ${res.userPhone}
                </a>
              ` : ''}
            </div>
          </div>
        `,
        icon: 'success',
        showConfirmButton: true,
        confirmButtonText: 'Listo',
        confirmButtonColor: '#f59e0b',
        didOpen: () => {
          const btn = document.getElementById('swal-copy-btn')
          if (btn) {
            btn.addEventListener('click', () => {
              navigator.clipboard.writeText(res.resetUrl || "")
              btn.innerText = '✅ ¡Enlace Copiado!'
              setTimeout(() => { btn.innerText = '📋 Copiar Enlace al Portapapeles' }, 2000)
            })
          }
        }
      })
    } catch (err: any) {
      Swal.fire({
        icon: 'error',
        title: 'Error de Conexión',
        text: err?.message || 'Error al conectar con el servidor.'
      })
    } finally {
      setIsSendingReset(false)
    }
  }

  const handleSaveEditAthlete = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!athlete) return

    setIsSavingAthlete(true)
    try {
      const { updateAthlete, updateAthleteMembershipAndCoach } = await import('@/app/actions/users')
      
      // 1. Guardar datos personales
      const res = await updateAthlete(athlete.id, {
        name: editName,
        cedula: editCedula,
        phone: editPhone,
        email: editEmail,
        address: editAddress,
        birthDate: editBirthDate || null,
        gender: editGender,
        coachId: editCoachId || null,
        guardianName: editGuardianName || null,
        guardianCedula: editGuardianCedula || null,
        guardianPhone: editGuardianPhone || null
      })

      if (!res.success) {
        showSweetToast(res.error || "No se pudo actualizar los datos.", "error")
        setIsSavingAthlete(false)
        return
      }

      // 2. Si es Admin o Gerente y se especificó fecha de corte, actualizar membresía y coach
      if (canEditAthlete && editMembEnd) {
        if (editMembStart && editMembEnd < editMembStart) {
          showSweetToast("La fecha de corte / vencimiento no puede ser anterior a la fecha de inicio.", "warning")
          setIsSavingAthlete(false)
          return
        }

        const membRes = await updateAthleteMembershipAndCoach(athlete.id, {
          startDate: editMembStart,
          endDate: editMembEnd,
          planName: editMembPlan || "Plan Estándar",
          coachId: editCoachId || null
        })
        if (!membRes.success) {
          showSweetToast(membRes.error || "Advertencia: No se pudo actualizar la membresía.", "warning")
        }

        // Registrar factura histórica informativa (Sin Flujo de Caja)
        if (editMembPlan) {
          try {
            const { createTransaction } = await import('@/app/actions/store')
            const matched = availablePlans.find(p => p.name.toLowerCase() === editMembPlan.toLowerCase()) || availablePlans[0]
            const planPrice = matched ? matched.price : baseMonthlyPrice
            await createTransaction({
              cashierId: user?.id,
              customerId: athlete.id,
              skipAutoMembership: true,
              items: [
                {
                  productId: `PLAN:${editMembPlan}`,
                  name: editMembPlan,
                  price: planPrice,
                  qty: 1,
                  subtotal: planPrice
                }
              ],
              subtotal: planPrice,
              tax: 0,
              total: planPrice,
              paymentMethod: "Sin Flujo de Caja (Histórico)",
              reference: "Asignación administrativa desde Perfil / No pasó por Flujo de Caja",
              status: "COMPLETED"
            })
          } catch {}
        }
      }

      showSweetToast("Datos y membresía actualizados correctamente.", "success")
      setShowEditAthleteModal(false)
      await loadAthleteData()
    } catch (err: any) {
      showSweetToast(err?.message || "Error al actualizar.", "error")
    } finally {
      setIsSavingAthlete(false)
    }
  }

  if (!athlete) {
    return (
      <div className="space-y-6 max-w-full w-full mx-auto relative animate-pulse">
        {/* Header Skeleton */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 bg-card/40 p-6 rounded-2xl border border-black/5 dark:border-white/5 glass">
          <div className="flex items-center gap-6">
            <div className="h-20 w-20 rounded-full bg-black/10 dark:bg-white/10 shrink-0" />
            <div className="space-y-3">
              <div className="h-8 bg-black/10 dark:bg-white/10 rounded w-52" />
              <div className="h-4 bg-black/10 dark:bg-white/10 rounded w-40" />
              <div className="h-4 bg-black/10 dark:bg-white/10 rounded w-32" />
            </div>
          </div>
          <div className="flex gap-3">
            <div className="h-10 w-28 bg-black/10 dark:bg-white/10 rounded-lg" />
            <div className="h-10 w-28 bg-black/10 dark:bg-white/10 rounded-lg" />
          </div>
        </div>

        {/* Columns Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="space-y-6">
            <div className="glass rounded-xl p-6 border border-black/10 dark:border-white/10 space-y-4">
              <div className="h-5 bg-black/10 dark:bg-white/10 rounded w-1/3" />
              <div className="h-8 bg-black/10 dark:bg-white/10 rounded w-1/2" />
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-black/5 dark:border-white/5">
                <div className="h-4 bg-black/10 dark:bg-white/10 rounded" />
                <div className="h-4 bg-black/10 dark:bg-white/10 rounded" />
              </div>
            </div>
            <div className="glass rounded-xl p-6 border border-black/10 dark:border-white/10 space-y-4">
              <div className="h-5 bg-black/10 dark:bg-white/10 rounded w-1/3" />
              <div className="h-8 bg-black/10 dark:bg-white/10 rounded w-1/4" />
              <div className="h-2 bg-black/10 dark:bg-white/10 rounded-full w-full" />
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="glass rounded-xl p-6 border border-black/10 dark:border-white/10 space-y-4">
              <div className="h-5 bg-black/10 dark:bg-white/10 rounded w-1/4" />
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map(k => (
                  <div key={k} className="h-20 bg-black/10 dark:bg-white/10 rounded-xl" />
                ))}
              </div>
            </div>
            <div className="glass rounded-xl p-6 border border-black/10 dark:border-white/10 space-y-4">
              <div className="h-5 bg-black/10 dark:bg-white/10 rounded w-1/3" />
              <div className="h-48 bg-black/10 dark:bg-white/10 rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Access control
  if (user?.role === 'athlete' && user.cedula !== athlete.cedula) {
    return <div className="p-8 text-center text-destructive font-bold">Acceso Denegado</div>
  }

  const latestBiometrics = athlete.biometrics.length > 0 ? athlete.biometrics[athlete.biometrics.length - 1] : null

  const handleAddBiometrics = async (e: React.FormEvent) => {
    e.preventDefault()
    const customFieldsObj = newCustomFields.reduce((acc, field) => {
      if (field.name && field.value) {
        acc[field.name] = `${field.value} ${field.unit || ''}`.trim();
      }
      return acc;
    }, {} as Record<string, string>);

    const newRecord = {
      weight: parseFloat(newWeight),
      height: parseFloat(newHeight),
      customFields: Object.keys(customFieldsObj).length > 0 ? customFieldsObj : undefined
    }
    
    const { addBiometric, getAthleteById } = await import('@/app/actions/users')
    await addBiometric(athlete.id, newRecord)
    
    const res = await getAthleteById(athlete.id)
    if (res.success && res.athlete) {
      setAthlete({
        ...res.athlete,
        membershipEnd: res.athlete.memberships?.[0]?.endDate || new Date(0).toISOString(),
        membershipType: res.athlete.memberships?.[0]?.planName || "Plan Estándar",
        biometrics: res.athlete.biometrics || [],
        attendances: res.athlete.attendances || []
      } as any)
    }

    setShowForm(false)
    setNewCustomFields([])
    
    const Toast = Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true
    })
    Toast.fire({ icon: 'success', title: 'Medidas actualizadas' })
  }

  const currentCoachName = allCoaches.find(c => c.id === athlete?.coachId)?.name || 'Ninguno'
  const previousCoachName = athlete?.previousCoachId ? (allCoaches.find(c => c.id === athlete.previousCoachId)?.name || 'Desconocido') : null

  const filteredCoaches = allCoaches.filter(c => c.name.toLowerCase().includes(coachSearch.toLowerCase()))

  const handleAdminAssignCoach = async (coachId: string) => {
    setShowAdminCoachModal(false)
    const coach = allCoaches.find(c => c.id === coachId);
    if(!coach) return;
    
    const result = await Swal.fire({
      title: '¿Confirmar Reasignación?',
      html: `
        <p>Vas a reasignar este atleta al entrenador <b>${coach.name}</b>.</p>
        <div style="margin-top:15px; padding:15px; border-radius:8px; text-align:left;" class="bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10">
          <p style="font-size:13px; margin:0;"><b>Importante:</b> Al confirmar, la plataforma actualizará el perfil del atleta. El atleta luego podrá proceder a caja a pagar la nueva cuota asignada o la propuesta por el entrenador.</p>
        </div>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, Reasignar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#eab308',
      cancelButtonColor: '#ef4444',
      reverseButtons: true
    });

    if (result.isConfirmed) {
      const updated = { ...athlete, coachId }
      await import('@/app/actions/users').then(m => m.updateAthlete(updated.id, updated))
      setAthlete(updated)
      
      Swal.fire({
        title: '¡Asignado Exitosamente!',
        text: 'El atleta ahora está con ' + coach.name + '. Ya puede realizar el pago de la cuota correspondiente.',
        icon: 'success',
        confirmButtonColor: '#22c55e'
      });
    }
  }

  const handleAssignRoutine = (e: React.FormEvent) => {
    e.preventDefault()
    showSweetToast(`Rutina asignada: ${routineType} (${routineStart} a ${routineEnd})`, "success")
    setShowRoutineModal(false)
  }

  const handleSendRequest = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!requestTarget || !id) {
      Swal.fire({ icon: 'warning', title: 'Atención', text: 'Por favor selecciona un entrenador.' });
      return;
    }
    
    const coach = allCoaches.find(c => c.id === requestTarget);
    
    const confirm = await Swal.fire({
      title: '¿Enviar Solicitud?',
      html: `
        <p>Se enviará una petición formal para cambiar al entrenador <b>${coach?.name || ''}</b>.</p>
        <div style="margin-top:15px; padding:15px; border-radius:8px; text-align:left;" class="bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10">
          <p style="font-size:13px; margin:0;"><b>Importante:</b> Esta solicitud debe ser confirmada por la administración. Una vez autorizada, se establecerá la nueva cuota para que puedas oficializar el cambio pagando en Recepción o Tienda.</p>
        </div>
      `,
      icon: 'info',
      showCancelButton: true,
      confirmButtonText: 'Enviar Solicitud',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#2563eb'
    });

    if (!confirm.isConfirmed) return;

    const { requestCoachChange } = await import('@/app/actions/users')
    const res = await requestCoachChange(id as string, requestTarget)
    if (res.success) {
      Swal.fire('¡Solicitud Enviada!', 'El administrador evaluará la solicitud y te asignará la cuota correspondiente. Podrás verificarlo pronto.', 'success')
      setShowCoachRequest(false)
      setRequestReason("")
    } else {
      Swal.fire('Error', res.error || "Ocurrió un error al enviar la solicitud", 'error')
    }
  }

  // Calculate days remaining
  const endDateStr = athlete.membershipEnd;
  const endDate = endDateStr && endDateStr !== "1970-01-01T00:00:00.000Z" ? new Date(endDateStr) : null;
  const today = new Date();
  const diffTime = endDate ? endDate.getTime() - today.getTime() : -1;
  const diffDays = endDate ? Math.ceil(diffTime / (1000 * 60 * 60 * 24)) : 0;
  
  const createdDate = new Date(athlete.createdAt || new Date());
  const totalDaysRegistered = Math.max(1, Math.floor((today.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24)));
  const totalAttendances = athlete.attendances?.length || 0;
  const calculatedAttendancePct = Math.min(100, Math.round((totalAttendances / totalDaysRegistered) * 100));
  const attendanceText = calculatedAttendancePct >= 70 ? "Buena" : calculatedAttendancePct >= 40 ? "Regular" : "Baja";
  
  const biometricChartData = [...(athlete.biometrics || [])]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map(b => ({
      date: new Date(b.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      peso: Number(b.weight) || 0,
      altura: Number(b.height) || 0,
    }));

  return (
    <div className="space-y-6 max-w-full w-full mx-auto relative">
      
      {/* Modal Request */}
      
      {showEditCoach && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-card border border-border rounded-xl max-w-md w-full shadow-2xl glass max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-border">
              <h3 className="text-xl font-black mb-1">Editar Perfil de Entrenador</h3>
              <p className="text-sm text-muted-foreground">Actualiza tu información pública.</p>
            </div>
            
            <div className="overflow-y-auto p-6 custom-scrollbar">
              <form id="edit-coach-form" onSubmit={handleUpdateCoach} className="space-y-5">
                <div>
                  <label className="text-sm font-bold block mb-1">Biografía / Descripción</label>
                  <textarea 
                    rows={4} 
                    value={editBio}
                    onChange={e => setEditBio(e.target.value)}
                    placeholder="Soy especialista en musculación..."
                    className="w-full bg-card border border-border rounded-lg p-2.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
                  />
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-bold block">Redes Sociales</label>
                    <button type="button" onClick={handleAddSocial} className="text-[10px] uppercase font-bold bg-primary/20 text-primary px-2 py-1 rounded hover:bg-primary/30 transition">
                      + Añadir Red
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    {editSocial.length === 0 && <p className="text-xs text-muted-foreground italic">No tienes redes configuradas.</p>}
                    {editSocial.map((link, i) => (
                      <div key={i} className="flex gap-2 items-center">
                        <select 
                          value={link.platform}
                          onChange={(e) => {
                            const newS = [...editSocial];
                            newS[i].platform = e.target.value;
                            setEditSocial(newS);
                          }}
                          className="w-1/3 bg-card border border-border rounded p-2 text-xs focus:border-primary focus:outline-none"
                        >
                          <option value="Instagram">Instagram</option>
                          <option value="TikTok">TikTok</option>
                          <option value="Twitter">Twitter/X</option>
                          <option value="YouTube">YouTube</option>
                          <option value="LinkedIn">LinkedIn</option>
                          <option value="Web">Web</option>
                        </select>
                        <input 
                          type="url"
                          required
                          value={link.url}
                          onChange={(e) => {
                            const newS = [...editSocial];
                            newS[i].url = e.target.value;
                            setEditSocial(newS);
                          }}
                          placeholder="https://..."
                          className="w-full bg-card border border-border rounded p-2 text-xs focus:border-primary focus:outline-none"
                        />
                        <button type="button" onClick={() => setEditSocial(editSocial.filter((_, idx) => idx !== i))} className="text-destructive hover:text-destructive bg-destructive/10 p-2 rounded">
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </form>
            </div>
            
            <div className="p-6 border-t border-border flex justify-end gap-3 bg-black/5 dark:bg-black/20">
              <button type="button" onClick={() => setShowEditCoach(false)} className="px-4 py-2 text-sm bg-black/5 hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10 rounded-lg transition font-bold">Cancelar</button>
              <button type="submit" form="edit-coach-form" className="px-6 py-2 text-sm bg-primary text-black font-black rounded-lg hover:opacity-90 transition">Guardar</button>
            </div>
          </div>
        </div>
      )}

      {showCoachRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-card border border-black/10 dark:border-white/10 rounded-xl max-w-md w-full p-6 shadow-2xl glass">
            <h3 className="text-xl font-bold mb-2">Solicitar Cambio de Entrenador</h3>
            <p className="text-sm text-muted-foreground mb-4">Esta solicitud será revisada por la administración del gimnasio.</p>
            <form onSubmit={handleSendRequest} className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Entrenador Deseado</label>
                <select 
                  required
                  value={requestTarget}
                  onChange={e => setRequestTarget(e.target.value)}
                  className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded p-2.5 text-sm"
                >
                  <option value="">Selecciona un entrenador</option>
                  {allCoaches.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Motivo de la solicitud</label>
                <textarea 
                  required
                  rows={3} 
                  value={requestReason}
                  onChange={e => setRequestReason(e.target.value)}
                  placeholder="Explica brevemente por qué deseas cambiar..."
                  className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded p-2.5 text-sm"
                />
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <button type="button" onClick={() => setShowCoachRequest(false)} className="px-4 py-2 text-sm bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:bg-white/10 rounded transition">Cancelar</button>
                <button type="submit" className="px-4 py-2 text-sm border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground dark:bg-primary dark:text-primary-foreground dark:border-transparent font-bold rounded hover:bg-primary/90 transition">Enviar Solicitud</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Admin Coach Change */}
      {showAdminCoachModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-card border border-black/10 dark:border-white/10 rounded-xl max-w-md w-full p-6 shadow-2xl glass">
            <h3 className="text-xl font-bold mb-2">Reasignar Entrenador</h3>
            <p className="text-sm text-muted-foreground mb-4">Busca y selecciona el nuevo entrenador para este atleta.</p>
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Buscar por nombre..." 
                value={coachSearch}
                onChange={e => setCoachSearch(e.target.value)}
                className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-primary"
              />
            </div>
            <div className="space-y-2 max-h-60 overflow-y-auto mb-4">
              {filteredCoaches.length > 0 ? filteredCoaches.map(c => (
                <button 
                  key={c.id} 
                  onClick={() => handleAdminAssignCoach(c.id)}
                  className="w-full text-left p-3 rounded-lg border border-black/5 dark:border-white/5 bg-black/20 hover:bg-primary/20 hover:border-primary/50 transition flex items-center gap-3"
                >
                  <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">{c.name.charAt(0)}</div>
                  <span className="font-medium text-sm">{c.name}</span>
                </button>
              )) : (
                <p className="text-sm text-muted-foreground text-center py-4">No se encontraron entrenadores.</p>
              )}
            </div>
            <div className="flex justify-end pt-2 border-t border-black/10 dark:border-white/10">
              <button type="button" onClick={() => setShowAdminCoachModal(false)} className="px-4 py-2 text-sm bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:bg-white/10 rounded transition">Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Assign Routine */}
      {showRoutineModal && (
        <RoutineAssignmentModal
          isOpen={showRoutineModal}
          onClose={() => setShowRoutineModal(false)}
          coachId={(user as any)?.id || ''}
          athletes={[athlete]}
          defaultAthleteId={athlete.id}
          onSuccess={() => {
            setShowRoutineModal(false);
            showSweetToast("¡Plan asignado con éxito!", "success");
          }}
        />
      )}

      {user?.role !== 'athlete' && (
        <Link href="/atletas" className="inline-flex items-center text-sm text-primary hover:underline">
          <ArrowLeft className="h-4 w-4 mr-1" /> Volver al directorio
        </Link>
      )}

      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 bg-card/40 p-6 rounded-2xl border border-black/5 dark:border-white/5 glass">
        <div className="flex items-center gap-6">
          <div className="relative group shrink-0">
            {athlete.profilePicture && !photoError ? (
              <img
                src={athlete.profilePicture}
                alt={athlete.name}
                onError={() => setPhotoError(true)}
                className="h-20 w-20 rounded-full object-cover border-2 border-primary shadow-md"
              />
            ) : (
              <div className="h-20 w-20 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-3xl border-2 border-primary/30">
                {athlete.name.charAt(0)}
              </div>
            )}
            
            {canChangePhoto && (
              <>
                <label className="absolute inset-0 bg-black/60 rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                  {isUploadingPhoto ? (
                    <Loader2 className="w-5 h-5 text-primary animate-spin" />
                  ) : (
                    <>
                      <Camera className="w-4 h-4 text-white mb-0.5" />
                      <span className="text-[9px] font-bold text-white text-center leading-tight">Cambiar<br/>Foto</span>
                    </>
                  )}
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    disabled={isUploadingPhoto}
                    onChange={handlePhotoChange}
                  />
                </label>

                {/* Botón flotante accesible en móviles */}
                <label 
                  className="absolute -bottom-1 -right-1 bg-primary text-black p-1.5 rounded-full shadow-lg cursor-pointer hover:scale-110 active:scale-95 transition border border-background flex items-center justify-center"
                  title="Cambiar foto de atleta"
                >
                  {isUploadingPhoto ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Camera className="w-3.5 h-3.5" />
                  )}
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    disabled={isUploadingPhoto}
                    onChange={handlePhotoChange}
                  />
                </label>
              </>
            )}
          </div>
          <div>
            <h1 className="page-title">{athlete.name}</h1>
            <p className="text-muted-foreground flex items-center gap-2 mt-1 flex-wrap">
              <span className="flex items-center gap-1"><User className="h-4 w-4" /> C.I. {athlete.cedula}</span>
              <span>&nbsp;|&nbsp;</span>
              <span>{athlete.gender === 'M' ? 'Masculino' : 'Femenino'}</span>
              <span>&nbsp;|&nbsp;</span>
              <span className="flex items-center gap-1 font-medium text-foreground">
                🎂 {athlete.birthDate ? `${athlete.birthDate} ${calculateAge(athlete.birthDate) !== null ? `(${calculateAge(athlete.birthDate)} años)` : ''}` : 'Sin datos'}
              </span>
            </p>
            {((athlete as any).guardianName || (athlete.birthDate && calculateAge(athlete.birthDate) !== null && calculateAge(athlete.birthDate)! < 18)) && (
              <div className="mt-2 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center gap-2 text-xs flex-wrap">
                <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0" />
                <span className="text-foreground font-bold">Representante Legal:</span>
                <span className="text-muted-foreground font-medium">
                  {(athlete as any).guardianName || 'Pendiente por registrar'}
                  {(athlete as any).guardianCedula ? ` • C.I. ${(athlete as any).guardianCedula}` : ''}
                  {(athlete as any).guardianPhone ? ` • Tel: ${(athlete as any).guardianPhone}` : ''}
                </span>
              </div>
            )}
            <p className="text-muted-foreground flex items-center gap-2 mt-1">
              <span className="font-bold">Coach Actual:</span> {currentCoachName} 
              {previousCoachName && (
                <span className="text-xs ml-2 bg-black/10 dark:bg-white/10 px-2 py-0.5 rounded">
                  Anterior: {previousCoachName}
                </span>
              )}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <span className="bg-warning/20 text-warning px-2 py-0.5 rounded text-xs font-bold flex items-center gap-1">
                🔥 Racha de Asistencia: {athlete.attendances?.length || 0} Días
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex gap-3 flex-wrap">

          {canEditAthlete && (
            <button
              onClick={handleOpenEditAthlete}
              className="bg-primary text-primary-foreground hover:opacity-90 px-4 py-2 rounded-lg font-bold flex items-center gap-2 shadow-sm transition"
            >
              <Edit className="w-4 h-4" />
              <span>Editar Datos y Contraseña</span>
            </button>
          )}

          {canSendWhatsApp && (
            <button
              onClick={() => {
                applyWhatsAppTemplate('receipt')
                setShowWhatsAppModal(true)
              }}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 shadow-sm transition"
              title="Enviar mensaje rápido por WhatsApp"
            >
              <MessageSquare className="w-4 h-4" />
              <span>WhatsApp (1 Clic)</span>
            </button>
          )}

          {user?.id === athlete.id && ((athlete as any).role === 'coach' || (athlete as any).role === 'employee') && (
            <button onClick={() => {
              setEditBio((athlete as any).bio || "");
              try {
                setEditSocial(JSON.parse((athlete as any).socialLinks || "[]"));
              } catch {
                setEditSocial([]);
              }
              setShowEditCoach(true);
            }} className="bg-transparent border-2 border-primary text-primary hover:bg-primary/10 px-4 py-2 rounded-lg font-bold transition">
              Editar Perfil
            </button>
          )}

          {(user?.role === 'admin' || user?.role === 'coach' || user?.role === 'employee') && (
            <button onClick={() => setShowRoutineModal(true)} className="bg-transparent border-2 border-primary text-primary hover:bg-primary/10 px-4 py-2 rounded-lg font-bold transition">
              Asignar Rutina
            </button>
          )}
          {user?.role === 'admin' && (
            <button onClick={() => setShowAdminCoachModal(true)} className="bg-primary/20 text-primary px-4 py-2 rounded-lg font-medium hover:bg-primary/30 transition">
              Cambiar Coach
            </button>
          )}
          {user?.role === 'athlete' && athlete.coachId && (
            <button onClick={() => setShowCoachRequest(true)} className="bg-transparent border-2 border-primary text-primary px-4 py-2 rounded-lg font-bold shadow-sm hover:bg-primary/10 transition">
              Solicitar Cambio de Coach
            </button>
          )}
          {user?.role === 'athlete' && !athlete.coachId && (
            <button onClick={() => setShowAdminCoachModal(true)} className="bg-transparent border-2 border-primary text-primary hover:bg-primary/10 px-4 py-2 rounded-lg font-bold transition">
              Seleccionar Entrenador (Opcional)
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna Izquierda: Membresía y Asistencia */}
        <div className="space-y-6">
          {/* Ficha de Representante Legal (Menores de 18 años) */}
          {(athlete.guardianName || (athlete.birthDate && calculateAge(athlete.birthDate) !== null && calculateAge(athlete.birthDate)! < 18)) && (
            <Card className="glass border-amber-500/30 bg-amber-500/5 shadow-md">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-base flex items-center gap-2 text-foreground font-black">
                  <ShieldAlert className="h-5 w-5 text-amber-500" /> Ficha de Representante Legal
                </CardTitle>
                <span className="text-[10px] uppercase font-black px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-500 border border-amber-500/30">
                  Menor de Edad
                </span>
              </CardHeader>
              <CardContent className="space-y-3.5 pt-1">
                <div>
                  <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Nombre del Representante</p>
                  <p className="font-extrabold text-sm text-foreground">
                    {athlete.guardianName || <span className="text-amber-500 italic">Pendiente por registrar</span>}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-black/10 dark:border-white/10">
                  <div>
                    <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Cédula</p>
                    <p className="font-bold text-sm text-foreground">
                      {athlete.guardianCedula ? (athlete.guardianCedula.startsWith('V-') || athlete.guardianCedula.startsWith('E-') ? athlete.guardianCedula : `V-${athlete.guardianCedula}`) : <span className="text-muted-foreground/70 italic text-xs">Sin registro</span>}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Teléfono / WhatsApp</p>
                    {athlete.guardianPhone ? (
                      <a
                        href={`https://wa.me/58${athlete.guardianPhone.replace(/\D/g, '').replace(/^0/, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-bold text-xs text-emerald-500 hover:text-emerald-400 flex items-center gap-1.5 transition underline underline-offset-2"
                        title="Abrir WhatsApp del Representante"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span>{athlete.guardianPhone}</span>
                      </a>
                    ) : (
                      <p className="text-xs text-muted-foreground italic">Sin teléfono</p>
                    )}
                  </div>
                </div>

                <div className="pt-2 border-t border-black/5 dark:border-white/5 flex items-center justify-between text-[11px] text-muted-foreground">
                  <span>Custodia y Exoneración Registrada</span>
                  {canEditAthlete && (
                    <button
                      type="button"
                      onClick={handleOpenEditAthlete}
                      className="text-primary hover:underline font-bold text-xs flex items-center gap-1 cursor-pointer"
                    >
                      <Edit className="w-3 h-3" /> Editar
                    </button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="glass border-primary/20">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" /> Membresía
              </CardTitle>
              {canEditAthlete && (
                <button
                  type="button"
                  onClick={handleOpenEditMembership}
                  className="text-xs font-bold text-primary bg-primary/10 hover:bg-primary/20 border border-primary/30 px-2.5 py-1 rounded-lg transition cursor-pointer flex items-center gap-1.5 shadow-sm"
                  title="Editar fecha de compra, corte y entrenador asignado"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>Editar Membresía</span>
                </button>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1.5 uppercase font-bold tracking-wider">Estado</p>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full font-bold text-sm border shadow-sm"
                  style={{
                    backgroundColor: diffDays > 7 ? 'rgba(16, 185, 129, 0.1)' : (diffDays > 0 || !endDate) ? 'rgba(245, 158, 11, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                    borderColor: diffDays > 7 ? 'rgba(16, 185, 129, 0.25)' : (diffDays > 0 || !endDate) ? 'rgba(245, 158, 11, 0.25)' : 'rgba(239, 68, 68, 0.25)',
                    color: diffDays > 7 ? '#10b981' : (diffDays > 0 || !endDate) ? '#f59e0b' : '#ef4444'
                  }}
                >
                  <span className="relative flex h-2.5 w-2.5">
                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${diffDays > 7 ? 'bg-emerald-400' : (diffDays > 0 || !endDate) ? 'bg-amber-400' : 'bg-rose-400'}`} />
                    <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${diffDays > 7 ? 'bg-emerald-500' : (diffDays > 0 || !endDate) ? 'bg-amber-500' : 'bg-rose-500'}`} />
                  </span>
                  <span>{diffDays > 0 ? `${diffDays} días restantes` : endDate ? 'Membresía Vencida' : 'Sin Membresía (Pendiente de Pago)'}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-black/10 dark:border-white/10">
                <div>
                  <p className="text-xs text-muted-foreground">Inicio (Compra)</p>
                  <p className="font-medium text-sm">{athlete.membershipStart && new Date(athlete.membershipStart).getFullYear() > 1970 ? formatDisplayDate(athlete.membershipStart) : 'Sin registro'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Vencimiento (Corte)</p>
                  <p className="font-medium text-sm">{athlete.membershipEnd && new Date(athlete.membershipEnd).getFullYear() > 1970 ? formatDisplayDate(athlete.membershipEnd) : 'Sin Plan Activo'}</p>
                </div>
              </div>
              <div className="pt-2 border-t border-black/10 dark:border-white/10 flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Plan Asignado</p>
                  <p className="font-bold text-sm text-foreground">{(athlete as any).membershipType || (athlete as any).planName || 'Plan Estándar'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" /> Asistencia
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between mb-2">
                <span className="text-3xl font-bold">{calculatedAttendancePct}%</span>
                <span className={`text-sm font-medium ${calculatedAttendancePct >= 70 ? 'text-success' : calculatedAttendancePct >= 40 ? 'text-warning' : 'text-destructive'}`}>{attendanceText}</span>
              </div>
              <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full" style={{ width: `${calculatedAttendancePct}%` }} />
              </div>
              <button
                type="button"
                onClick={() => setShowAttendanceModal(true)}
                className="w-full mt-3 flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary text-xs font-bold transition border border-primary/25 cursor-pointer"
              >
                <CalendarCheck className="w-4 h-4" />
                <span>Ver Días Asistidos y Plan</span>
              </button>
            </CardContent>
          </Card>
        </div>

        {/* Columna Derecha: Biometría e Historial */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="glass">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" /> Medidas Actuales
              </CardTitle>
              {(user?.role === 'admin' || user?.role === 'coach' || user?.role === 'employee') && (
                <button 
                  onClick={() => setShowForm(!showForm)}
                  className="text-sm bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 px-3 py-1.5 rounded-lg hover:bg-black/10 dark:bg-white/10 transition"
                >
                  {showForm ? 'Cancelar' : 'Actualizar Medidas'}
                </button>
              )}
            </CardHeader>
            <CardContent>
              {showForm ? (
                <form onSubmit={handleAddBiometrics} className="space-y-4 p-4 rounded-xl bg-black/5 dark:bg-black/40 border border-black/5 dark:border-white/5">
                  <h4 className="font-medium text-sm text-primary mb-2">Nuevo Registro Biométrico</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-muted-foreground">Peso (kg)</label>
                      <input type="number" step="0.1" required value={newWeight} onChange={e => setNewWeight(e.target.value)} className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded p-2 text-sm mt-1" />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground">Altura (cm)</label>
                      <input type="number" step="1" required value={newHeight} onChange={e => setNewHeight(e.target.value)} className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded p-2 text-sm mt-1" />
                    </div>
                    
                    {/* Campos dinámicos agregados manualmente por el entrenador para este atleta */}
                    {newCustomFields.map((field, idx) => (
                      <div key={idx} className="col-span-2 grid grid-cols-3 gap-2 items-end">
                        <div>
                          <label className="text-xs text-muted-foreground">Categoría</label>
                          <input type="text" placeholder="Ej. Brazo" value={field.name} onChange={e => {
                            const newFields = [...newCustomFields]
                            newFields[idx].name = e.target.value
                            setNewCustomFields(newFields)
                          }} className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded p-2 text-sm mt-1" />
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground">Medida</label>
                          <input type="number" step="0.1" placeholder="Ej. 34" value={field.value} onChange={e => {
                            const newFields = [...newCustomFields]
                            newFields[idx].value = e.target.value
                            setNewCustomFields(newFields)
                          }} className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded p-2 text-sm mt-1" />
                        </div>
                        <div className="flex gap-2">
                          <div className="flex-1">
                            <label className="text-xs text-muted-foreground">Unidad</label>
                            <select value={field.unit} onChange={e => {
                              const newFields = [...newCustomFields]
                              newFields[idx].unit = e.target.value
                              setNewCustomFields(newFields)
                            }} className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded p-2 text-sm mt-1">
                              <option value="cm">cm</option>
                              <option value="kg">kg</option>
                              <option value="%">%</option>
                            </select>
                          </div>
                          <button type="button" onClick={() => {
                            const newFields = [...newCustomFields]
                            newFields.splice(idx, 1)
                            setNewCustomFields(newFields)
                          }} className="bg-destructive/10 text-destructive p-2 rounded hover:bg-destructive/20 mb-px shrink-0">X</button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button type="button" onClick={() => setNewCustomFields([...newCustomFields, {name: '', unit: 'cm', value: ''}])} className="text-xs bg-primary/20 text-primary font-bold py-1.5 px-3 rounded-lg hover:bg-primary/30 transition">
                    + Añadir Otra Medida
                  </button>
                  <button type="submit" className="border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground dark:bg-primary dark:text-primary-foreground dark:border-transparent font-medium py-2 px-4 rounded-lg text-sm w-full mt-2">
                    Guardar Registro
                  </button>
                </form>
              ) : latestBiometrics ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="p-4 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-center">
                    <p className="text-xs text-muted-foreground mb-1">Peso</p>
                    <p className="text-xl font-bold">{latestBiometrics.weight} <span className="text-sm font-normal text-muted-foreground">kg</span></p>
                  </div>
                  <div className="p-4 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-center">
                    <p className="text-xs text-muted-foreground mb-1">Altura</p>
                    <p className="text-xl font-bold">{latestBiometrics.height} <span className="text-sm font-normal text-muted-foreground">cm</span></p>
                  </div>
                  {athlete.gender === 'F' && latestBiometrics.chest && (
                    <>
                      <div className="p-4 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-center">
                        <p className="text-xs text-muted-foreground mb-1">Pecho</p>
                        <p className="text-xl font-bold">{latestBiometrics.chest} <span className="text-sm font-normal text-muted-foreground">cm</span></p>
                      </div>
                      <div className="p-4 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-center">
                        <p className="text-xs text-muted-foreground mb-1">Cintura</p>
                        <p className="text-xl font-bold">{latestBiometrics.waist} <span className="text-sm font-normal text-muted-foreground">cm</span></p>
                      </div>
                      <div className="p-4 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-center">
                        <p className="text-xs text-muted-foreground mb-1">Cadera</p>
                        <p className="text-xl font-bold">{latestBiometrics.hips} <span className="text-sm font-normal text-muted-foreground">cm</span></p>
                      </div>
                    </>
                  )}
                  {latestBiometrics.customFields && Object.entries(latestBiometrics.customFields)
                    .map(([key, val]) => (
                    <div key={key} className="p-4 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-center">
                      <p className="text-xs text-muted-foreground mb-1 capitalize">{key}</p>
                      <p className="text-xl font-bold">{val}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center rounded-xl bg-black/5 dark:bg-white/5 border border-dashed border-black/10 dark:border-white/10">
                  <div className="h-12 w-12 rounded-full bg-primary/10 text-primary mx-auto flex items-center justify-center mb-3">
                    <Activity className="h-6 w-6 opacity-70" />
                  </div>
                  <p className="text-sm font-semibold text-foreground">Sin registros biométricos actuales</p>
                  <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">
                    Aún no se han capturado medidas ni pesaje para este perfil.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Gráfico de Evolución Física (Recharts) */}
          <Card className="glass overflow-hidden border-primary/20">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" /> Evolución Física (Progreso de Peso)
              </CardTitle>
              {athlete.biometrics.length > 1 && (
                <span className="text-xs px-2.5 py-1 rounded-full font-bold bg-primary/10 text-primary border border-primary/20">
                  {athlete.biometrics.length} tomas registradas
                </span>
              )}
            </CardHeader>
            <CardContent>
              {biometricChartData.length > 0 ? (
                <div className="pt-2">
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={biometricChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="weightGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.15} vertical={false} />
                        <XAxis 
                          dataKey="date" 
                          tick={{ fill: 'currentColor', opacity: 0.6, fontSize: 11 }} 
                          axisLine={{ opacity: 0.2 }}
                          tickLine={false}
                        />
                        <YAxis 
                          domain={['dataMin - 2', 'dataMax + 2']} 
                          tick={{ fill: 'currentColor', opacity: 0.6, fontSize: 11 }}
                          axisLine={{ opacity: 0.2 }}
                          tickLine={false}
                        />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'rgba(20, 20, 25, 0.95)', 
                            borderRadius: '12px', 
                            border: '1px solid rgba(255,255,255,0.1)',
                            boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                            fontSize: '12px',
                            color: '#fff'
                          }} 
                          formatter={(val: any) => [`${val} kg`, 'Peso']}
                          labelStyle={{ fontWeight: 'bold', color: '#10b981' }}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="peso" 
                          stroke="#10b981" 
                          strokeWidth={2.5} 
                          fillOpacity={1} 
                          fill="url(#weightGrad)" 
                          dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }}
                          activeDot={{ r: 6, fill: '#10b981', stroke: '#fff', strokeWidth: 3 }}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex justify-between items-center text-xs text-muted-foreground mt-3 pt-3 border-t border-black/5 dark:border-white/5 px-1">
                    <span>Primer registro: <strong className="text-foreground">{biometricChartData[0]?.peso} kg</strong></span>
                    <span>Último registro: <strong className="text-primary">{biometricChartData[biometricChartData.length - 1]?.peso} kg</strong></span>
                    <span>Diferencia: <strong className={
                      (biometricChartData[biometricChartData.length - 1]?.peso || 0) >= (biometricChartData[0]?.peso || 0)
                        ? "text-success" 
                        : "text-warning"
                    }>
                      {((biometricChartData[biometricChartData.length - 1]?.peso || 0) - (biometricChartData[0]?.peso || 0)).toFixed(1)} kg
                    </strong></span>
                  </div>
                </div>
              ) : (
                <div className="py-8 text-center rounded-xl bg-black/5 dark:bg-white/5 border border-dashed border-black/10 dark:border-white/10">
                  <div className="h-12 w-12 rounded-full bg-primary/10 text-primary mx-auto flex items-center justify-center mb-3">
                    <TrendingUp className="h-6 w-6 opacity-70" />
                  </div>
                  <p className="text-sm font-semibold text-foreground">Sin datos suficientes para graficar</p>
                  <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">
                    Registra al menos una medida antropométrica para visualizar la gráfica de evolución.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="glass">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <ClipboardList className="h-5 w-5 text-primary" /> Historial de Medidas
              </CardTitle>
            </CardHeader>
            <CardContent>
              {athlete.biometrics.length === 0 ? (
                <div className="py-8 text-center rounded-xl bg-black/5 dark:bg-white/5 border border-dashed border-black/10 dark:border-white/10">
                  <ClipboardList className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
                  <p className="text-sm font-medium text-foreground">Sin historial archivado</p>
                  <p className="text-xs text-muted-foreground mt-1">Las mediciones que registres aparecerán listadas aquí con fecha.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {[...athlete.biometrics].reverse().map((record, idx) => (
                    <div key={idx} className="flex justify-between items-center p-3 rounded-lg border border-black/5 dark:border-white/5 bg-black/20 hover:bg-black/5 dark:bg-white/5 transition">
                      <div>
                        <span className="font-medium block">{new Date(record.date).toLocaleDateString()}</span>
                        <span className="text-xs text-muted-foreground">
                          Peso: {record.weight}kg | Altura: {record.height}cm
                          {record.chest && ` | P: ${record.chest} | Ci: ${record.waist} | Ca: ${record.hips}`}
                          {record.customFields && Object.entries(record.customFields)
                            .filter(([k]) => !['pecho', 'cintura', 'cadera'].includes(k.toLowerCase()))
                            .map(([k,v]) => ` | ${k.substring(0,2)}: ${v}`).join('')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Historial de Pagos y Renovaciones (Oculto para Entrenadores) */}
          {user?.role !== 'coach' && user?.role !== 'employee' && (
            <Card className="glass border-primary/20">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Receipt className="h-5 w-5 text-primary" /> Historial de Pagos y Renovaciones
                </CardTitle>
                {Array.isArray((athlete as any).customerTx) && (athlete as any).customerTx.length > 0 && (
                  <span className="text-xs px-2.5 py-1 rounded-full font-bold bg-primary/10 text-primary border border-primary/20">
                    {(athlete as any).customerTx.length} factura(s)
                  </span>
                )}
              </CardHeader>
              <CardContent>
                {!Array.isArray((athlete as any).customerTx) || (athlete as any).customerTx.length === 0 ? (
                  <div className="py-8 text-center rounded-xl bg-black/5 dark:bg-white/5 border border-dashed border-black/10 dark:border-white/10">
                    <CreditCard className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
                    <p className="text-sm font-medium text-foreground">Sin facturas o renovaciones registradas</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Los pagos de planes, renovaciones y compras realizadas por este atleta aparecerán aquí.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                    {(athlete as any).customerTx.map((tx: any) => {
                      const isNoFlow = /sin flujo/i.test(tx.paymentMethod || "")
                      const rawSummary = Array.isArray(tx.items) && tx.items.length > 0
                        ? tx.items.map((it: any) => `${it.qty}x ${it.name}`).join(", ")
                        : "Pago / Renovación"
                      
                      // Eliminar etiquetas técnicas internas para el usuario
                      const itemsSummary = rawSummary
                        .replace(/\s*\((?:Histórico\s*\/?\s*Sin Flujo|Histórico|Sin Flujo)\)/gi, "")
                        .trim()

                      // Para el atleta, mostrar "Membresía" en vez de "Sin Flujo de Caja (Histórico)"
                      const displayMethod = isNoFlow ? "Membresía" : (tx.paymentMethod || "Efectivo")

                      const rawRef = tx.reference
                        ? String(tx.reference).replace(/\s*\[VUELTO:.*?\]/g, "").trim()
                        : ""
                      
                      // Ocultar al usuario referencias técnicas del flujo de caja administrativo
                      const isInternalAdminRef = /no pas[oó] por flujo|asignaci[oó]n administrativa/i.test(rawRef)
                      const cleanRef = isInternalAdminRef ? "" : rawRef

                      return (
                        <div
                          key={tx.id}
                          className="p-3.5 rounded-xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-primary/40 transition"
                        >
                          <div className="space-y-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-bold text-sm text-foreground truncate">{itemsSummary}</span>
                              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/30">
                                {displayMethod}
                              </span>
                            </div>
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                              <span>📅 {new Date(tx.date).toLocaleDateString()} {new Date(tx.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                              {cleanRef && (
                                <span className="font-mono text-[11px] text-foreground/80">Ref: {cleanRef}</span>
                              )}
                              {tx.cashier?.name && (
                                <span>👤 Cobrado por: <strong className="text-foreground">{tx.cashier.name}</strong></span>
                              )}
                            </div>
                          </div>
                          <div className="sm:text-right shrink-0">
                            <span className="text-base font-black text-emerald-500">
                              {settings?.storeCurrency || "$"}{Number(tx.total || 0).toFixed(2)}
                            </span>
                            <span className="block text-[10px] uppercase font-bold text-muted-foreground">
                              {tx.status === "COMPLETED" ? "Completado" : tx.status === "PENDING_DELIVERY" ? "Por Retirar" : tx.status}
                            </span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <AttendanceHistoryModal
        open={showAttendanceModal}
        onClose={() => setShowAttendanceModal(false)}
        athlete={
          athlete
            ? {
                ...athlete,
                coachName: athlete.coachId
                  ? allCoaches.find((c) => c.id === athlete.coachId)?.name
                  : undefined,
              }
            : null
        }
      />

      {/* MODAL DE EDICIÓN DE DATOS Y CREDENCIALES DEL ATLETA */}
      {showEditAthleteModal && athlete && (
        <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-black/60 p-2 sm:p-4 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-[#0e1017]/90 backdrop-blur-2xl text-card-foreground border border-black/15 dark:border-white/15 rounded-2xl max-w-lg lg:max-w-6xl xl:max-w-7xl w-full p-4 sm:p-6 shadow-2xl relative my-auto max-h-[94vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-black/10 dark:border-white/10 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-primary/15 text-primary flex items-center justify-center">
                  <Edit className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-foreground leading-tight">Editar Atleta</h3>
                  <p className="text-xs text-muted-foreground">{athlete.name}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowEditAthleteModal(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Formulario con Layout de 3 Columnas en PC */}
            <form onSubmit={handleSaveEditAthlete} className="flex flex-col flex-1 min-h-0">
              <div className="overflow-y-auto pr-1 flex-1">
                <div className={`grid grid-cols-1 ${canEditAthlete ? "lg:grid-cols-3" : "lg:grid-cols-2"} gap-4 lg:gap-5 items-start`}>
                  {/* COLUMNA 1: DATOS PERSONALES & CONTACTO */}
                  <div className="bg-black/5 dark:bg-white/[0.03] p-4 rounded-xl border border-black/10 dark:border-white/10 space-y-3">
                    <span className="text-[11px] font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <UserIcon className="w-3.5 h-3.5 text-primary" /> Datos Personales & Contacto
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-semibold mb-1 block">Nombre Completo *</label>
                        <input
                          required
                          type="text"
                          value={editName}
                          onChange={e => setEditName(e.target.value)}
                          className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-lg p-2.5 text-sm focus:border-primary focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-semibold mb-1 block">Cédula *</label>
                        <input
                          required
                          type="text"
                          value={editCedula}
                          onChange={e => setEditCedula(e.target.value)}
                          className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-lg p-2.5 text-sm focus:border-primary focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-semibold mb-1 block">Teléfono (WhatsApp)</label>
                        <input
                          type="text"
                          placeholder="0414-0000000"
                          value={editPhone}
                          onChange={e => setEditPhone(e.target.value)}
                          className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-lg p-2.5 text-sm focus:border-primary focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-semibold mb-1 block">Correo Electrónico</label>
                        <input
                          type="email"
                          placeholder="atleta@gym.com"
                          value={editEmail}
                          onChange={e => setEditEmail(e.target.value)}
                          className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-lg p-2.5 text-sm focus:border-primary focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-xs font-semibold block">Fecha de Nacimiento</label>
                          {editBirthDate && calculateAge(editBirthDate) !== null ? (
                            <span className="text-[11px] font-semibold text-primary">
                              🎂 {calculateAge(editBirthDate)} años
                            </span>
                          ) : (
                            <span className="text-[11px] text-muted-foreground/80 italic">
                              Sin datos
                            </span>
                          )}
                        </div>
                        <input
                          type="date"
                          max={new Date().toISOString().split("T")[0]}
                          min="1920-01-01"
                          value={editBirthDate}
                          onChange={e => setEditBirthDate(e.target.value)}
                          className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-lg p-2.5 text-sm focus:border-primary focus:outline-none [color-scheme:light] dark:[color-scheme:dark]"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-semibold mb-1 block">Género</label>
                        <select
                          value={editGender}
                          onChange={e => setEditGender(e.target.value)}
                          className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-lg p-2.5 text-sm focus:border-primary focus:outline-none"
                        >
                          <option value="M">Masculino</option>
                          <option value="F">Femenino</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-semibold mb-1 block">Entrenador (Coach)</label>
                        <select
                          value={editCoachId}
                          onChange={e => setEditCoachId(e.target.value)}
                          className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-lg p-2.5 text-sm focus:border-primary focus:outline-none"
                        >
                          <option value="">Sin entrenador asignado</option>
                          {allCoaches.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-xs font-semibold mb-1 block">Dirección de Habitación</label>
                        <input
                          type="text"
                          placeholder="Sector / Calle / Residencia"
                          value={editAddress}
                          onChange={e => setEditAddress(e.target.value)}
                          className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-lg p-2.5 text-sm focus:border-primary focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Sub-bloque Representante Legal */}
                    {(editGuardianName || (editBirthDate && calculateAge(editBirthDate) !== null && calculateAge(editBirthDate)! < 18)) && (
                      <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 space-y-2.5">
                        <div className="flex items-center gap-2 text-xs font-bold text-amber-500">
                          <ShieldAlert className="w-4 h-4 shrink-0" />
                          <span>Datos del Representante Legal (Menor de 18)</span>
                        </div>

                        <div>
                          <label className="text-[11px] font-semibold mb-1 block">Nombre y Apellido</label>
                          <input
                            type="text"
                            placeholder="Ej. María Elena Pérez"
                            value={editGuardianName}
                            onChange={e => setEditGuardianName(e.target.value)}
                            className="w-full bg-background border border-border rounded-lg p-2 text-xs focus:border-primary focus:outline-none"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[11px] font-semibold mb-1 block">Cédula</label>
                            <input
                              type="text"
                              placeholder="Ej. 12345678"
                              value={editGuardianCedula}
                              onChange={e => setEditGuardianCedula(e.target.value.replace(/\D/g, "").slice(0, 9))}
                              className="w-full bg-background border border-border rounded-lg p-2 text-xs focus:border-primary focus:outline-none"
                            />
                          </div>

                          <div>
                            <label className="text-[11px] font-semibold mb-1 block">Teléfono</label>
                            <input
                              type="tel"
                              placeholder="Ej. 04141234567"
                              value={editGuardianPhone}
                              onChange={e => setEditGuardianPhone(e.target.value)}
                              className="w-full bg-background border border-border rounded-lg p-2 text-xs focus:border-primary focus:outline-none"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* COLUMNA 2: SEGURIDAD Y MEMBRESÍA HISTÓRICA */}
                  <div className="bg-black/5 dark:bg-white/[0.03] p-4 rounded-xl border border-black/10 dark:border-white/10 space-y-4">
                    {/* Sección Seguridad / Restablecer Contraseña */}
                    <div className="space-y-2">
                      <span className="text-[11px] font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                        <KeyRound className="w-3.5 h-3.5 text-amber-500" /> Seguridad & Acceso
                      </span>
                      <div className="p-3.5 rounded-xl bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 space-y-2.5">
                        <div>
                          <p className="text-xs font-bold text-foreground">
                            Restablecer Contraseña
                          </p>
                          <p className="text-[11px] text-muted-foreground leading-tight mt-0.5">
                            Genera un link seguro (válido 60 min) enviado al correo y listo para compartir por WhatsApp.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleSendResetLink(athlete)}
                          disabled={isSendingReset}
                          className="w-full px-3.5 py-2.5 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-600 text-black shadow-sm transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                        >
                          {isSendingReset ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              <span>Generando Enlace...</span>
                            </>
                          ) : (
                            <>
                              <Send className="w-3.5 h-3.5" />
                              <span>Enviar Link de Acceso</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Sección Membresía & Corte / Entrenador (Solo Admin / Gerente) */}
                    {canEditAthlete && (
                      <div className="space-y-3 pt-3 border-t border-black/10 dark:border-white/10">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="text-[11px] font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-primary" /> Membresía & Corte
                          </span>
                          {((athlete.membershipEnd && new Date(athlete.membershipEnd).getFullYear() > 1970) || editMembEnd) && (
                            <button
                              type="button"
                              onClick={handleClearAthleteMembership}
                              disabled={isSavingAthlete}
                              className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-rose-500/15 hover:bg-rose-500/25 text-rose-500 border border-rose-500/30 transition flex items-center gap-1 cursor-pointer disabled:opacity-50"
                            >
                              <X className="w-3 h-3" />
                              Quitar Membresía
                            </button>
                          )}
                        </div>
                        <p className="text-[11px] text-muted-foreground leading-tight">
                          Modifica las fechas históricas. Si no tiene membresía, deja la Fecha de Corte en blanco.
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          <div>
                            <label className="text-xs font-semibold mb-1 block">Fecha de Compra / Inicio</label>
                            <input
                              type="date"
                              value={editMembStart}
                              onChange={e => setEditMembStart(e.target.value)}
                              className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-lg p-2 text-xs focus:border-primary focus:outline-none"
                            />
                          </div>

                          <div>
                            <label className="text-xs font-semibold mb-1 block">Fecha de Corte</label>
                            <input
                              type="date"
                              value={editMembEnd}
                              onChange={e => setEditMembEnd(e.target.value)}
                              className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-lg p-2 text-xs focus:border-primary focus:outline-none"
                            />
                          </div>
                        </div>

                        {/* Botones rápidos de cálculo de Fecha de Corte */}
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-muted-foreground block">Cálculo rápido de corte:</span>
                          <div className="flex flex-wrap items-center gap-1.5">
                            {[
                              { label: "+1 Mes", months: 1 },
                              { label: "+3 Meses", months: 3 },
                              { label: "+6 Meses", months: 6 },
                              { label: "+1 Año", months: 12 },
                            ].map(btn => (
                              <button
                                key={btn.months}
                                type="button"
                                onClick={() => setEditMembEnd(calculateCutoffDate(editMembStart, btn.months))}
                                className="px-2 py-1 rounded-md text-[11px] font-bold border border-primary/30 bg-primary/10 hover:bg-primary/20 text-primary transition cursor-pointer"
                              >
                                {btn.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* COLUMNA 3: SELECCIÓN DE PLAN DE MEMBRESÍA */}
                  {canEditAthlete && (
                    <div className="bg-black/5 dark:bg-white/[0.03] p-4 rounded-xl border border-black/10 dark:border-white/10 space-y-4">
                      <div>
                        <span className="text-[11px] font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 mb-2">
                          <CalendarCheck className="w-3.5 h-3.5 text-primary" /> Plan de Membresía
                        </span>

                        <label className="text-xs font-semibold mb-1 block">Seleccionar Plan</label>
                        <select
                          value={editMembPlan}
                          onChange={e => {
                            const val = e.target.value
                            setEditMembPlan(val)
                            if (val && !editMembEnd) {
                              setEditMembEnd(calculateCutoffDate(editMembStart, 1))
                            }
                          }}
                          className="w-full bg-black/5 dark:bg-[#161922] border border-black/10 dark:border-white/10 rounded-lg p-2 text-xs focus:border-primary focus:outline-none font-medium mb-2.5"
                        >
                          <option value="">-- Sin Plan Seleccionado --</option>
                          {availablePlans.map((plan) => (
                            <option key={plan.name} value={plan.name}>
                              {plan.name} — {settings?.storeCurrency || "$"}{plan.price} {plan.period}
                            </option>
                          ))}
                          {editMembPlan && !availablePlans.some(p => p.name === editMembPlan) && (
                            <option value={editMembPlan}>{editMembPlan}</option>
                          )}
                        </select>

                        <div className="grid grid-cols-2 gap-1.5 max-h-[220px] overflow-y-auto pr-0.5">
                          {availablePlans.map((plan) => {
                            const isSelected = editMembPlan === plan.name
                            return (
                              <button
                                key={plan.name}
                                type="button"
                                onClick={() => {
                                  setEditMembPlan(plan.name)
                                  if (!editMembEnd) {
                                    setEditMembEnd(calculateCutoffDate(editMembStart, 1))
                                  }
                                }}
                                className={`text-left p-2 rounded-lg border transition-all flex items-center justify-between gap-1.5 ${
                                  isSelected
                                    ? 'border-primary bg-primary/15 shadow-sm ring-1 ring-primary'
                                    : 'border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 hover:border-primary/40'
                                }`}
                              >
                                <div className="min-w-0">
                                  <span className="font-bold text-[11px] block truncate">{plan.name}</span>
                                  <span className="text-[10px] font-black text-primary">
                                    {settings?.storeCurrency || "$"}{plan.price} <span className="text-[9px] font-normal text-muted-foreground">{plan.period}</span>
                                  </span>
                                </div>
                                {isSelected && <Check className="w-3.5 h-3.5 text-primary shrink-0" />}
                              </button>
                            )
                          })}
                        </div>
                      </div>

                      <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl space-y-1">
                        <span className="font-bold text-xs text-amber-500 block">ℹ️ Ficha Administrativa</span>
                        <p className="text-[11px] text-muted-foreground leading-tight">
                          Las modificaciones directas se guardan como asignación histórica. Si el atleta va a pagar una renovación en caja, realiza la operación desde el módulo de Membresías o Tienda.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Botones de acción fijos en el pie */}
              <div className="flex gap-2.5 justify-end pt-3 mt-4 border-t border-black/10 dark:border-white/10 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowEditAthleteModal(false)}
                  disabled={isSavingAthlete}
                  className="px-4 py-2 text-sm font-semibold bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 rounded-xl transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSavingAthlete}
                  className="px-5 py-2 text-sm font-bold bg-primary text-primary-foreground rounded-xl hover:opacity-90 transition disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                >
                  {isSavingAthlete ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Guardando...</span>
                    </>
                  ) : (
                    <span>Guardar Cambios</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL EDITAR MEMBRESÍA Y ENTRENADOR */}
      {showEditMembershipModal && (
        <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-black/60 p-2 sm:p-4 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-[#0e1017]/90 backdrop-blur-2xl text-card-foreground border border-black/15 dark:border-white/15 rounded-2xl max-w-md w-full p-4 sm:p-6 shadow-2xl relative my-auto max-h-[92vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-black/10 dark:border-white/10 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                  <Calendar className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">Editar Membresía & Entrenador</h3>
                  <p className="text-xs text-muted-foreground">{athlete.name} (C.I. {athlete.cedula})</p>
                </div>
              </div>
              <button 
                onClick={() => setShowEditMembershipModal(false)}
                className="text-muted-foreground hover:text-foreground text-sm p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveMembership} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold mb-1 block">Fecha de Compra / Inicio</label>
                  <input
                    type="date"
                    required
                    value={editMembStart}
                    onChange={e => setEditMembStart(e.target.value)}
                    className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-lg p-2.5 text-sm focus:border-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold mb-1 block">Fecha de Corte / Vencimiento</label>
                  <input
                    type="date"
                    required
                    value={editMembEnd}
                    onChange={e => setEditMembEnd(e.target.value)}
                    className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-lg p-2.5 text-sm focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              {/* Botones rápidos de cálculo de Fecha de Corte */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] font-bold text-muted-foreground mr-1">Cálculo rápido de corte:</span>
                {[
                  { label: "+1 Mes", months: 1 },
                  { label: "+3 Meses", months: 3 },
                  { label: "+6 Meses", months: 6 },
                  { label: "+1 Año", months: 12 },
                ].map(btn => (
                  <button
                    key={btn.months}
                    type="button"
                    onClick={() => setEditMembEnd(calculateCutoffDate(editMembStart, btn.months))}
                    className="px-2.5 py-1 rounded-lg text-[11px] font-bold border border-primary/30 bg-primary/10 hover:bg-primary/20 text-primary transition cursor-pointer"
                  >
                    {btn.label}
                  </button>
                ))}
              </div>

              <div>
                <label className="text-xs font-semibold mb-1 block">Plan de Membresía</label>
                <select
                  required
                  value={editMembPlan}
                  onChange={e => setEditMembPlan(e.target.value)}
                  className="w-full bg-black/5 dark:bg-[#161922] border border-black/10 dark:border-white/10 rounded-lg p-2.5 text-sm focus:border-primary focus:outline-none font-medium"
                >
                  {availablePlans.map((plan) => (
                    <option key={plan.name} value={plan.name}>
                      {plan.name} — {settings?.storeCurrency || "$"}{plan.price} {plan.period}
                    </option>
                  ))}
                  {editMembPlan && !availablePlans.some(p => p.name === editMembPlan) && (
                    <option value={editMembPlan}>{editMembPlan}</option>
                  )}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold mb-1 block">Entrenador Asignado (Ya pagó)</label>
                <select
                  value={editMembCoach}
                  onChange={e => setEditMembCoach(e.target.value)}
                  className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-lg p-2.5 text-sm focus:border-primary focus:outline-none"
                >
                  <option value="">-- Sin entrenador asignado --</option>
                  {allCoaches.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                <p className="text-[11px] text-muted-foreground mt-1">
                  Asigna al entrenador directamente sin requerir nuevo pago en caja.
                </p>
              </div>

              {/* Botones de acción */}
              <div className="flex gap-2.5 justify-end pt-4 border-t border-black/10 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setShowEditMembershipModal(false)}
                  disabled={isSavingMembership}
                  className="px-4 py-2 text-sm font-semibold bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 rounded-xl transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSavingMembership}
                  className="px-5 py-2 text-sm font-bold bg-primary text-primary-foreground rounded-xl hover:opacity-90 transition disabled:opacity-50 flex items-center gap-2"
                >
                  {isSavingMembership ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Guardando...</span>
                    </>
                  ) : (
                    <span>Guardar Membresía</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL WHATSAPP 1-CLIC */}
      {showWhatsAppModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md">
          <div className="bg-card dark:bg-[#0e1017] border border-black/10 dark:border-white/10 rounded-2xl max-w-lg w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-black/10 dark:border-white/10 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                  <MessageSquare className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">Mensaje Rápido por WhatsApp</h3>
                  <p className="text-xs text-muted-foreground">Destinatario: {athlete.name} ({athlete.phone || 'Sin número'})</p>
                </div>
              </div>
              <button 
                onClick={() => setShowWhatsAppModal(false)}
                className="text-muted-foreground hover:text-foreground text-sm p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <p className="text-xs font-semibold text-muted-foreground">Plantillas predefinidas (1 Clic):</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => applyWhatsAppTemplate('receipt')}
                  className="text-xs p-2.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold transition text-left flex flex-col gap-1"
                >
                  <span>📄 Comprobante</span>
                  <span className="text-[10px] font-normal opacity-80">Pago y membresía</span>
                </button>
                <button
                  type="button"
                  onClick={() => applyWhatsAppTemplate('expiry')}
                  className="text-xs p-2.5 rounded-xl border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 font-bold transition text-left flex flex-col gap-1"
                >
                  <span>⏰ Vencimiento</span>
                  <span className="text-[10px] font-normal opacity-80">Aviso amistoso</span>
                </button>
                <button
                  type="button"
                  onClick={() => applyWhatsAppTemplate('welcome')}
                  className="text-xs p-2.5 rounded-xl border border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 font-bold transition text-left flex flex-col gap-1"
                >
                  <span>🎫 Bienvenida</span>
                  <span className="text-[10px] font-normal opacity-80">Pase digital</span>
                </button>
              </div>

              <div>
                <label className="text-xs font-semibold block mb-1">Mensaje personalizado a enviar:</label>
                <textarea
                  rows={5}
                  value={whatsAppText}
                  onChange={(e) => setWhatsAppText(e.target.value)}
                  placeholder="Selecciona una plantilla arriba o escribe tu mensaje aquí..."
                  className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:border-emerald-500 resize-none"
                />
              </div>

              <div className="flex gap-2.5 justify-end pt-2 border-t border-black/10 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setShowWhatsAppModal(false)}
                  className="px-4 py-2 text-sm font-semibold bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 rounded-xl transition"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSendWhatsApp}
                  disabled={!whatsAppText.trim()}
                  className="px-5 py-2 text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition disabled:opacity-50 flex items-center gap-2 shadow-md shadow-emerald-500/20"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Abrir en WhatsApp</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

