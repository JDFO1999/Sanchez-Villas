"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { athleteService, AthleteProfile } from "@/lib/data-service"
import { storeService, Transaction } from "@/lib/store-service"
import { useSettings } from "@/lib/settings-context"
import { Card, CardContent } from "@/components/ui/card"
import { Search, CreditCard, Clock, MessageSquare, Edit, Check, DollarSign, Camera, Eye, Image as ImageIcon, X, Calendar, KeyRound, User as UserIcon, Bell, Send, Mail } from "lucide-react"
import Link from "next/link"
import Swal from 'sweetalert2'
import { showSweetToast } from "@/lib/toast-context"
import { calculateCutoffDate, confirmAction } from "@/lib/confirm"

type PaymentMethodType = 'Efectivo' | 'Tarjeta' | 'Transferencia' | 'Pago Móvil' | 'Binance' | 'Crédito/Fiado'

interface PaymentSplit {
  method: PaymentMethodType;
  amount: number | string;
  reference: string;
  receiptImage: string | null;
}

export default function MembresíasPage() {
  const { user, getAllEmployees, updateEmployee } = useAuth()
  const { settings } = useSettings()
  const [athletes, setAthletes] = useState<AthleteProfile[]>([])
  const [search, setSearch] = useState("")

  // Planes promocionales de la página de inicio (con respaldo a las 4 tarjetas promocionales del gimnasio)
  const defaultLandingPlans = [
    { name: "PLAN CORPORATIVO", price: "$25", billingPeriod: "/mes", highlight: true },
    { name: "PLAN MAXIMUM BASICO", price: "$25", billingPeriod: "/mes", highlight: false },
    { name: "PLAN SOLO PARA ELLAS", price: "$25", billingPeriod: "/mes", highlight: true },
    { name: "PLAN ADULTO MAYOR", price: "$25", billingPeriod: "/mes", highlight: false },
  ]
  const rawLandingPlans = settings.landingSettings?.plansSettings?.plans?.length
    ? settings.landingSettings.plansSettings.plans
    : defaultLandingPlans

  const baseMonthlyPrice = settings.monthlyFee || 25
  const promotionalPlans = rawLandingPlans.map((p: any) => {
    const rawNum = parseFloat(String(p.price || "").replace(/[^0-9.]/g, ""))
    return {
      name: String(p.name || "Plan Promocional").trim(),
      price: Number.isFinite(rawNum) && rawNum > 0 ? rawNum : baseMonthlyPrice,
      period: p.billingPeriod || p.period || "/mes",
      description: p.description || "",
      features: Array.isArray(p.features) ? p.features : [],
      popular: Boolean(p.highlight || p.popular)
    }
  })

  const availablePlans = [
    {
      name: "Plan Estándar",
      price: baseMonthlyPrice,
      period: "/mes",
      description: "Plan estándar mensual del gimnasio",
      features: ["Acceso general a sala de musculación"],
      popular: false
    },
    ...promotionalPlans.filter((p: any) => p.name.toLowerCase() !== "plan estándar")
  ]

  // Renovar / Activar Modal State
  const [showRenovarModal, setShowRenovarModal] = useState<AthleteProfile | null>(null)
  const [isWalkInMode, setIsWalkInMode] = useState(false)
  const [walkInCedula, setWalkInCedula] = useState("")
  const [walkInName, setWalkInName] = useState("")
  const [walkInPhone, setWalkInPhone] = useState("")
  const [selectedPlanName, setSelectedPlanName] = useState<string>("")
  const [selectedPlanPrice, setSelectedPlanPrice] = useState<number>(25)
  const [renovarIncludeCoach, setRenovarIncludeCoach] = useState(false)
  const [renovarSelectedCoach, setRenovarSelectedCoach] = useState("")
  const [renovarUseCustomCoachFee, setRenovarUseCustomCoachFee] = useState(false)
  const [renovarCustomCoachFee, setRenovarCustomCoachFee] = useState<string>("")
  const [renovarMonths, setRenovarMonths] = useState(1)
  const [renovarSplitCount, setRenovarSplitCount] = useState<1 | 2 | 3>(1)
  const [renovarSplits, setRenovarSplits] = useState<PaymentSplit[]>([
    { method: 'Efectivo', amount: '', reference: '', receiptImage: null },
    { method: 'Pago Móvil', amount: '', reference: '', receiptImage: null },
    { method: 'Tarjeta', amount: '', reference: '', receiptImage: null }
  ])
  const [renovarReceivedAmount, setRenovarReceivedAmount] = useState<string>("")
  const [renovarChangeMethod, setRenovarChangeMethod] = useState<'Efectivo' | 'Pago Móvil' | 'Transferencia'>('Efectivo')
  const [renovarChangeRef, setRenovarChangeRef] = useState<string>("")
  const [showQRModal, setShowQRModal] = useState<string | null>(null)

  // Métodos de pago activos según la configuración en Ajustes
  const hasPagoMovil = Boolean(settings.storePaymentInstructions?.pagoMovil?.trim() || settings.storePaymentInstructions?.pagoMovil2?.trim() || settings.storePaymentQRs?.pagoMovil || settings.storePaymentQRs?.pagoMovil2)
  const hasTransferencia = Boolean(settings.storePaymentInstructions?.transferencia?.trim() || settings.storePaymentInstructions?.transferencia2?.trim() || settings.storePaymentQRs?.transferencia || settings.storePaymentQRs?.transferencia2)
  const hasBinance = Boolean(settings.storePaymentInstructions?.binance?.trim() || settings.storePaymentQRs?.binance)

  const availableMembershipPaymentMethods: { value: PaymentMethodType; label: string }[] = [
    { value: 'Efectivo', label: 'Efectivo' },
    { value: 'Tarjeta', label: 'Punto de Venta (Tarjeta)' },
    ...(hasPagoMovil ? [{ value: 'Pago Móvil' as PaymentMethodType, label: 'Pago Móvil' }] : []),
    ...(hasTransferencia ? [{ value: 'Transferencia' as PaymentMethodType, label: 'Transferencia' }] : []),
    ...(hasBinance ? [{ value: 'Binance' as PaymentMethodType, label: 'Binance' }] : []),
    { value: 'Crédito/Fiado', label: 'Crédito/Fiado' },
  ]

  // Edit Modal State
  const [showEditModal, setShowEditModal] = useState<AthleteProfile | null>(null)
  const [editName, setEditName] = useState("")
  const [editCedula, setEditCedula] = useState("")
  const [editPhone, setEditPhone] = useState("")
  const [editAddress, setEditAddress] = useState("")
  const [editRole, setEditRole] = useState("athlete")
  const [editCoachId, setEditCoachId] = useState("")
  const [editStartDate, setEditStartDate] = useState("")
  const [editEndDate, setEditEndDate] = useState("")
  const [editPlanName, setEditPlanName] = useState("")
  const [editPassword, setEditPassword] = useState("")
  const [editConfirmPassword, setEditConfirmPassword] = useState("")
  const [editRegisterPayment, setEditRegisterPayment] = useState(false)
  const [editPaymentMethod, setEditPaymentMethod] = useState<PaymentMethodType>("Efectivo")
  const [editPaymentRef, setEditPaymentRef] = useState("")
  const [editPaymentAmount, setEditPaymentAmount] = useState<string>("")
  const [isSavingEdit, setIsSavingEdit] = useState(false)

  // Message Modal State
  const [showMessageModal, setShowMessageModal] = useState<AthleteProfile | null>(null)
  const [messageText, setMessageText] = useState("")

  const [customMessages, setCustomMessages] = useState([
    { 
      title: "🧾 Comprobante de Membresía", 
      text: "¡Hola {nombre}! Confirmamos el pago y activación de tu membresía ({plan}) en {gym}. Tu acceso se encuentra activo hasta el {vencimiento}. ¡A entrenar con todo!" 
    },
    { 
      title: "⏰ Aviso de Vencimiento", 
      text: "¡Hola {nombre}! Te recordamos de forma amistosa que tu membresía en {gym} está próxima a vencer el {vencimiento}. Renueva a tiempo en recepción para no perder tu acceso ni tu ritmo de entrenamiento." 
    },
    { 
      title: "🎫 Bienvenida y Pase Digital", 
      text: "¡Bienvenido(a) a {gym}, {nombre}! Ya estás activo en nuestro sistema. Puedes acceder a las instalaciones presentando tu C.I. {cedula} o tu código QR digital. ¡Mucho éxito en tus metas!" 
    },
    { 
      title: "💪 Inasistencia / Motivación", 
      text: "¡Hola {nombre}! Hemos notado que llevas días sin venir a entrenar a {gym}. ¿Todo bien? Tu rutina te espera, ¡no pierdas la constancia!" 
    }
  ])
  const [showCreateMessageModal, setShowCreateMessageModal] = useState(false)
  const [newMessageTitle, setNewMessageTitle] = useState("")
  const [newMessageText, setNewMessageText] = useState("")
  const [allCoaches, setAllCoaches] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [cronSummary, setCronSummary] = useState<any>(null)
  const [isRunningAlerts, setIsRunningAlerts] = useState(false)

  const handleRunCronAlerts = async () => {
    setIsRunningAlerts(true)
    try {
      const { runDailyNotificationChecks } = await import('@/app/actions/notifications')
      const res = await runDailyNotificationChecks()
      if (res.success && res.summary) {
        setCronSummary(res.summary)
        showSweetToast(`Alertas procesadas: ${res.summary.emailsSentCount} correos enviados.`, "success")
      } else {
        showSweetToast(res.error || "Error al procesar alertas", "error")
      }
    } catch (err: any) {
      showSweetToast(err?.message || "Error al ejecutar alertas", "error")
    } finally {
      setIsRunningAlerts(false)
    }
  }

  const handleTestSmtp = async () => {
    const { value: targetEmail } = await Swal.fire({
      title: 'Diagnóstico de Correo (Gmail / SMTP)',
      text: 'Ingresa un correo electrónico para verificar la conexión y recibir un correo de prueba corporativo:',
      input: 'email',
      inputPlaceholder: 'tu-correo@ejemplo.com',
      inputValue: user?.email || '',
      showCancelButton: true,
      confirmButtonText: 'Enviar Correo de Prueba',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#f59e0b',
      background: '#0e1017',
      color: '#ffffff'
    })

    if (targetEmail) {
      Swal.fire({
        title: 'Verificando Servidor...',
        text: 'Conectando con el servidor SMTP (Gmail / Resend) y despachando plantilla corporativa...',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading()
        },
        background: '#0e1017',
        color: '#ffffff'
      })

      try {
        const { testSmtpConnectionAction } = await import('@/app/actions/notifications')
        const res = await testSmtpConnectionAction(targetEmail)
        if (res.success) {
          Swal.fire({
            title: '¡Conexión Exitosa!',
            text: res.message || `Correo corporativo de prueba enviado con éxito a ${targetEmail}.`,
            icon: 'success',
            confirmButtonColor: '#f59e0b',
            background: '#0e1017',
            color: '#ffffff'
          })
        } else {
          Swal.fire({
            title: 'Error de Configuración SMTP',
            text: res.error || 'No se pudo conectar al servidor de correo. Si usas Gmail, verifica que estés usando una Contraseña de Aplicación de 16 caracteres.',
            icon: 'error',
            confirmButtonColor: '#ef4444',
            background: '#0e1017',
            color: '#ffffff'
          })
        }
      } catch (err: any) {
        Swal.fire('Error', err?.message || 'Error al ejecutar prueba de correo.', 'error')
      }
    }
  }

  const refreshAthletes = async () => {
    try {
      const { getAllEmployees, getAthletes } = await import('@/app/actions/users')
      const athRes = await getAthletes()
      if (athRes.success) {
        setAthletes(
          athRes.athletes
            .filter((a: any) => !a.role || a.role === 'athlete')
            .map((a: any) => ({
              ...a,
              membershipStart: a.memberships?.[0]?.startDate || null,
              membershipEnd: a.memberships?.[0]?.endDate || new Date(0).toISOString(),
              planName: a.memberships?.[0]?.planName || a.membershipType || 'Plan Estándar',
              membershipType: a.memberships?.[0]?.planName || a.membershipType || 'Mensual',
              coachId: a.coachId || null
            }))
        )
      }
      
      const empRes = await getAllEmployees()
      if (empRes.success) {
        setAllCoaches(empRes.employees.filter((e: any) => e.role === 'coach' || e.role === 'employee'))
      }
    } catch (err) {
      console.error("Error cargando membresías:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refreshAthletes()
  }, [])

  const isAuthorized = user && (
    user.role === 'admin' ||
    user.role === 'gerente' ||
    user.role === 'cajero' ||
    user.role === 'recepcion' ||
    user.permissions?.includes('CRM_MANAGE') ||
    user.permissions?.includes('POS_ACCESS')
  )

  if (!isAuthorized) {
    return <div className="p-8 text-center text-destructive font-bold">Acceso Denegado. Solo personal autorizado.</div>
  }

  const [filterType, setFilterType] = useState('Todas')

  const filtered = athletes.filter(a => {
    if ((a as any).role && (a as any).role !== 'athlete') return false
    const matchesSearch = a.name.toLowerCase().includes(search.toLowerCase()) || a.cedula.includes(search)
    if (!matchesSearch) return false

    const endDate = new Date(a.membershipEnd)
    const today = new Date()
    const diffDays = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    
    if (filterType === 'Activas') return diffDays > 0
    if (filterType === 'Por Vencer') return diffDays > 0 && diffDays <= 5
    if (filterType === 'Vencidas') return diffDays <= 0
    return true
  })

  const openEditModal = (a: AthleteProfile) => {
    setEditName(a.name)
    setEditCedula(a.cedula)
    setEditPhone(a.phone || "")
    setEditAddress(a.address || "")
    setEditRole("athlete")
    setEditCoachId(a.coachId || "")
    setEditPassword("")
    setEditConfirmPassword("")

    const hasExistingMemb = Boolean(a.membershipEnd && new Date(a.membershipEnd).getFullYear() > 1970)
    const sDate = a.membershipStart && new Date(a.membershipStart).getFullYear() > 1970 
      ? new Date(a.membershipStart).toISOString().split('T')[0]
      : new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString().split('T')[0]
    const eDate = hasExistingMemb
      ? new Date(a.membershipEnd).toISOString().split('T')[0]
      : ""
    
    const pName = (a as any).planName || (a as any).membershipType || (hasExistingMemb ? "Plan Estándar" : "")
    setEditStartDate(sDate)
    setEditEndDate(eDate)
    setEditPlanName(pName)
    setEditRegisterPayment(false)
    setEditPaymentMethod("Efectivo")
    setEditPaymentRef("")
    const matchedPlan = availablePlans.find(p => p.name.toLowerCase() === (pName || "Plan Estándar").toLowerCase()) || availablePlans[0]
    setEditPaymentAmount(matchedPlan ? matchedPlan.price.toString() : "30")
    setShowEditModal(a)
  }

  const handleSelectPlanInEditModal = (planName: string) => {
    setEditPlanName(planName)
    if (!planName) return
    const matched = availablePlans.find(p => p.name === planName)
    if (matched) {
      setEditPaymentAmount(matched.price.toString())
    }
    if (!editEndDate) {
      setEditEndDate(calculateCutoffDate(editStartDate, 1))
    }
    if (!editRegisterPayment) {
      showSweetToast(
        "Seleccionaste un plan sin activar el Flujo de Caja. Si es un atleta antiguo que ya tenía membresía, puedes continuar; si es una inscripción o renovación nueva, te recomendamos activar «Registrar cobro en Caja».",
        "warning"
      )
    }
  }

  const handleClearMembershipInEditModal = async () => {
    if (!showEditModal) return
    const ok = await confirmAction({
      title: "¿Devolver / Quitar Membresía?",
      text: `Se anulará el plan actual de ${showEditModal.name} y quedará nuevamente como «Sin Membresía».`,
      confirmText: "Sí, quitar membresía",
      danger: true,
    })
    if (!ok) return

    setIsSavingEdit(true)
    try {
      const { clearAthleteMembershipAction } = await import('@/app/actions/users')
      const res = await clearAthleteMembershipAction(showEditModal.id)
      if (res.success) {
        setEditEndDate("")
        setEditPlanName("")
        setEditRegisterPayment(false)
        await refreshAthletes()
        setShowEditModal(null)
        showSweetToast("Membresía devuelta a «Sin Membresía» correctamente.", "success")
      } else {
        showSweetToast(res.error || "No se pudo quitar la membresía.", "error")
      }
    } catch (err: any) {
      showSweetToast(err?.message || "Error al quitar la membresía.", "error")
    } finally {
      setIsSavingEdit(false)
    }
  }

  const passwordMatch = editPassword && editConfirmPassword && editPassword === editConfirmPassword

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!showEditModal) return
    if (editPassword) {
      if (editPassword.length < 6) {
        showSweetToast("La contraseña debe tener al menos 6 caracteres.", "warning")
        return
      }
      if (editPassword !== editConfirmPassword) {
        showSweetToast("Las contraseñas no coinciden.", "warning")
        return
      }
    }

    setIsSavingEdit(true)
    try {
      if (user?.role === 'admin' && editRole !== 'athlete' && updateEmployee) {
        const ok = await updateEmployee(showEditModal.id, {
          name: editName,
          cedula: editCedula,
          phone: editPhone,
          role: editRole,
          ...(editPassword ? { clave: editPassword } : {})
        } as any)
        if ((ok as any) === false) {
          setIsSavingEdit(false)
          return
        }
        await refreshAthletes()
        setShowEditModal(null)
        showSweetToast("Usuario promovido a rol de sistema exitosamente.", "success")
        return
      }

      const { updateAthlete, updateAthleteMembershipAndCoach } = await import('@/app/actions/users')
      const res = await updateAthlete(showEditModal.id, {
        name: editName,
        cedula: editCedula,
        phone: editPhone,
        address: editAddress,
        coachId: editCoachId || null,
        ...(editPassword ? { password: editPassword } : {})
      })

      if (!res.success) {
        showSweetToast(res.error || "Error al actualizar datos.", "error")
        return
      }

      // Actualizar fecha de inicio, corte, plan y entrenador
      if (editEndDate) {
        const membRes = await updateAthleteMembershipAndCoach(showEditModal.id, {
          startDate: editStartDate,
          endDate: editEndDate,
          planName: editPlanName || "Plan Estándar",
          coachId: editCoachId || null
        })
        if (!membRes.success) {
          showSweetToast(membRes.error || "Advertencia: No se pudo actualizar la membresía.", "error")
          return
        }
      }

      // Si se indicó registrar el pago en Caja / Flujo de Caja
      if (editRegisterPayment) {
        const payAmount = parseFloat(editPaymentAmount) || 0
        if (payAmount > 0) {
          const { createTransaction } = await import('@/app/actions/store')
          const pName = editPlanName || "Plan Estándar"
          const txRes = await createTransaction({
            cashierId: user?.id,
            customerId: showEditModal.id,
            items: [
              {
                productId: `PLAN:${pName}`,
                name: `${pName} (Ajuste administrativo)`,
                price: payAmount,
                qty: 1,
                subtotal: payAmount
              }
            ],
            subtotal: payAmount,
            tax: 0,
            total: payAmount,
            creditAmount: 0,
            paymentMethod: editPaymentMethod,
            reference: editPaymentRef ? `Ref: ${editPaymentRef.trim()} (Asiento desde edición)` : 'Asiento directo desde edición de membresía'
          })

          if (!txRes.success) {
            showSweetToast("Membresía actualizada, pero ocurrió un aviso con el registro en caja: " + (txRes.error || ""), "warning")
          }
        }
      }

      await refreshAthletes()
      setShowEditModal(null)
      showSweetToast(editRegisterPayment ? "Datos, membresía y cobro en caja registrados con éxito." : "Datos y membresía actualizados correctamente.", "success")
    } catch (err: any) {
      showSweetToast(err?.message || "Error al actualizar.", "error")
    } finally {
      setIsSavingEdit(false)
    }
  }

  const sendMessage = () => {
    if (!showMessageModal) return
    if (!showMessageModal.phone) {
      showSweetToast("El atleta no tiene un número de teléfono registrado.", "warning")
      return
    }
    // Clean phone number (remove spaces, +, etc)
    const phone = showMessageModal.phone.replace(/\D/g, '')
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(messageText)}`
    window.open(url, '_blank')
    setShowMessageModal(null)
    setMessageText("")
  }

  const gymCoachPercentage = Number(settings.gymCommissionPercentage) > 0 ? Number(settings.gymCommissionPercentage) : 40

  const calculateCoachMonthlyFee = (
    planPrice: number,
    includeCoach: boolean,
    coachId: string,
    useCustomFee: boolean = renovarUseCustomCoachFee,
    customFeeVal: string = renovarCustomCoachFee
  ) => {
    if (!includeCoach || !coachId) return 0
    if (useCustomFee) {
      const parsed = parseFloat(customFeeVal)
      return Number.isFinite(parsed) && parsed >= 0 ? Math.round(parsed * 100) / 100 : 0
    }
    return Math.round((planPrice * (gymCoachPercentage / 100)) * 100) / 100
  }

  const syncSingleSplitAmount = (
    planPrice: number,
    months: number,
    includeCoach: boolean,
    coachId: string,
    useCustomFee: boolean = renovarUseCustomCoachFee,
    customFeeVal: string = renovarCustomCoachFee
  ) => {
    const mem = planPrice * months
    const cPrice = calculateCoachMonthlyFee(planPrice, includeCoach, coachId, useCustomFee, customFeeVal) * months
    const newTotal = Math.round((mem + cPrice) * 100) / 100
    setRenovarSplits(prev => {
      const copy = [...prev]
      if (renovarSplitCount === 1) {
        copy[0] = { ...copy[0], amount: newTotal }
      }
      return copy
    })
  }

  const openRenovarModal = (a: AthleteProfile) => {
    setIsWalkInMode(false)
    setWalkInCedula("")
    setWalkInName("")
    setWalkInPhone("")
    setRenovarReceivedAmount("")
    setRenovarChangeMethod("Efectivo")
    setRenovarChangeRef("")
    const defaultPlan = availablePlans.find(p => p.name.toLowerCase() === (a.membershipType || "").toLowerCase()) || availablePlans.find(p => p.popular) || availablePlans[0]
    const pName = defaultPlan?.name || "Plan Estándar"
    const pPrice = defaultPlan?.price || baseMonthlyPrice
    setSelectedPlanName(pName)
    setSelectedPlanPrice(pPrice)
    const validAssignedCoach = a.coachId && allCoaches.some(c => c.id === a.coachId) ? a.coachId : ""
    setRenovarSelectedCoach(validAssignedCoach)
    setRenovarIncludeCoach(!!validAssignedCoach)
    setRenovarUseCustomCoachFee(false)
    const defaultPctFee = Math.round((pPrice * (gymCoachPercentage / 100)) * 100) / 100
    setRenovarCustomCoachFee(defaultPctFee.toString())
    setRenovarMonths(1)
    const baseTotal = Math.round((pPrice + (validAssignedCoach ? defaultPctFee : 0)) * 100) / 100
    setRenovarSplitCount(1)
    setRenovarSplits([
      { method: 'Efectivo', amount: baseTotal, reference: '', receiptImage: null },
      { method: 'Pago Móvil', amount: '', reference: '', receiptImage: null },
      { method: 'Tarjeta', amount: '', reference: '', receiptImage: null }
    ])
    setShowRenovarModal(a)
  }

  const openWalkInPlanModal = () => {
    setIsWalkInMode(true)
    setWalkInCedula("")
    setWalkInName("")
    setWalkInPhone("")
    setRenovarReceivedAmount("")
    setRenovarChangeMethod("Efectivo")
    setRenovarChangeRef("")
    const defaultPlan = availablePlans.find(p => p.popular) || availablePlans[0]
    const pName = defaultPlan?.name || "Plan Estándar"
    const pPrice = defaultPlan?.price || baseMonthlyPrice
    setSelectedPlanName(pName)
    setSelectedPlanPrice(pPrice)
    setRenovarSelectedCoach("")
    setRenovarIncludeCoach(false)
    setRenovarUseCustomCoachFee(false)
    const defaultPctFee = Math.round((pPrice * (gymCoachPercentage / 100)) * 100) / 100
    setRenovarCustomCoachFee(defaultPctFee.toString())
    setRenovarMonths(1)
    setRenovarSplitCount(1)
    setRenovarSplits([
      { method: 'Efectivo', amount: pPrice, reference: '', receiptImage: null },
      { method: 'Pago Móvil', amount: '', reference: '', receiptImage: null },
      { method: 'Tarjeta', amount: '', reference: '', receiptImage: null }
    ])
    setShowRenovarModal({
      id: "WALK_IN",
      name: "Nuevo Cliente (Por Cédula)",
      cedula: "",
      membershipType: pName,
      membershipEnd: new Date(0).toISOString(),
      status: "Activa"
    } as any)
  }

  const handleRenovar = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!showRenovarModal) return

    if (isWalkInMode) {
      const cleanCed = walkInCedula.replace(/\D/g, "").trim()
      if (!cleanCed) {
        Swal.fire('Cédula Requerida', 'Ingresa el número de cédula del cliente para enlazar su plan.', 'warning')
        return
      }
      if (!walkInName.trim()) {
        Swal.fire('Nombre Requerido', 'Ingresa el nombre del cliente.', 'warning')
        return
      }
    }
    
    // Calculate total
    const membershipPrice = selectedPlanPrice * renovarMonths
    const coachPrice = calculateCoachMonthlyFee(
      selectedPlanPrice,
      renovarIncludeCoach,
      renovarSelectedCoach,
      renovarUseCustomCoachFee,
      renovarCustomCoachFee
    ) * renovarMonths
    
    const total = Math.round((membershipPrice + coachPrice) * 100) / 100
    
    const activeSplits = renovarSplits.slice(0, renovarSplitCount);
    const assignedTotal = activeSplits.reduce((acc, s) => acc + (parseFloat(String(s.amount)) || 0), 0);

    if (renovarSplitCount > 1) {
      if (Math.abs(total - assignedTotal) > 0.05) {
        Swal.fire('Monto Incompleto', `La suma de las formas de pago (${settings.storeCurrency} ${assignedTotal.toFixed(2)}) debe coincidir exactamente con el total de la membresía (${settings.storeCurrency} ${total.toFixed(2)}).`, 'warning');
        return;
      }
    }

    for (let i = 0; i < activeSplits.length; i++) {
      const s = activeSplits[i];
      const sAmount = parseFloat(String(s.amount)) || 0;
      if (sAmount <= 0) {
        Swal.fire('Monto no válido', `El monto de la forma de pago #${i + 1} (${s.method}) debe ser mayor a 0.`, 'warning');
        return;
      }
      if (['Transferencia', 'Pago Móvil', 'Binance'].includes(s.method)) {
        if (!s.reference?.trim()) {
          Swal.fire('Referencia Requerida', `Debes ingresar la referencia para la forma de pago #${i + 1} (${s.method}).`, 'warning');
          return;
        }
      } else if (s.method === 'Tarjeta') {
        if (!s.reference?.trim()) {
          Swal.fire('Transacción Requerida', `Debes ingresar el número de transacción/voucher para la Tarjeta (forma #${i + 1}).`, 'warning');
          return;
        }
      }
    }

    const receivedNum = parseFloat(renovarReceivedAmount) || 0;
    const changeToReturn = receivedNum > total ? Math.round((receivedNum - total) * 100) / 100 : 0;

    // Validación de PIN de Seguridad del Recepcionista / Cajero
    const { value: pin } = await Swal.fire({
      title: 'Validación de Seguridad',
      html: `Plan: <b>${selectedPlanName}</b> (${renovarMonths} mes/es) — Total: <b>${settings.storeCurrency} ${total.toFixed(2)}</b>${changeToReturn > 0 ? `<br><span class="text-xs text-warning">Recibido: ${settings.storeCurrency} ${receivedNum.toFixed(2)} | Vuelto: ${settings.storeCurrency} ${changeToReturn.toFixed(2)} (${renovarChangeMethod})</span>` : ''}<br><br><span class="text-xs text-muted-foreground">Ingrese su PIN de Recepcionista/Cajero o escanee su código para registrar el cobro en Finanzas y activar la membresía:</span>`,
      input: 'password',
      inputPlaceholder: 'Ingrese su PIN...',
      showCancelButton: true,
      confirmButtonText: 'Validar y Cobrar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#10b981',
    })

    if (!pin) return

    const { validatePinAction } = await import('@/app/actions/auth')
    const pinRes = await validatePinAction(pin)
    if (!pinRes.success || !pinRes.user) {
      Swal.fire('PIN Incorrecto', pinRes.error || 'No se pudo validar el PIN. La membresía no fue activada.', 'error')
      return
    }

    const validatedCashierId = pinRes.user.id

    const creditAmount = renovarSplitCount === 1
      ? (activeSplits[0]?.method === 'Crédito/Fiado' ? total : 0)
      : activeSplits
          .filter(s => s.method === 'Crédito/Fiado')
          .reduce((acc, s) => acc + (parseFloat(String(s.amount)) || 0), 0);

    let adminCreditPassword = '';
    if (creditAmount > 0) {
      const { value: admPwd } = await Swal.fire({
        title: '🔐 Autorización para Fiar (Crédito)',
        html: `El cliente solicita <b>${settings.storeCurrency} ${creditAmount.toFixed(2)}</b> a <b>Crédito / Fiado</b> para el plan <b>${selectedPlanName}</b>.<br><br><span class="text-xs text-muted-foreground">Ingrese la <b>Contraseña del Administrador</b> para autorizar el crédito y registrarlo en Cuentas por Cobrar:</span>`,
        input: 'password',
        inputPlaceholder: 'Contraseña del Administrador...',
        showCancelButton: true,
        confirmButtonText: 'Autorizar Fiado',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#f59e0b',
      });
      if (!admPwd) return;
      const { validateAdminPasswordAction } = await import('@/app/actions/auth');
      const admRes = await validateAdminPasswordAction(admPwd);
      if (!admRes.success) {
        Swal.fire('Autorización Denegada', admRes.error || 'Contraseña de Administrador incorrecta. No se autorizó el fiado.', 'error');
        return;
      }
      adminCreditPassword = admPwd;
    }

    let finalPaymentMethod: string;
    let finalReference: string | undefined;
    let finalReceiptImage: string | undefined;

    if (renovarSplitCount === 1) {
      finalPaymentMethod = activeSplits[0].method;
      finalReference = activeSplits[0].reference?.trim() || undefined;
      finalReceiptImage = activeSplits[0].receiptImage || undefined;
    } else {
      finalPaymentMethod = `Mixto: ${activeSplits.map(s => `${s.method} (${settings.storeCurrency} ${Number(s.amount).toFixed(2)})`).join(' + ')}`;
      finalReference = activeSplits.filter(s => s.reference?.trim()).map(s => `${s.method}: ${s.reference.trim()}`).join(' | ') || undefined;
      finalReceiptImage = activeSplits.find(s => s.receiptImage)?.receiptImage || undefined;
    }

    if (changeToReturn > 0) {
      const changeTag = `Recibido: $${receivedNum.toFixed(2)} | Vuelto: $${changeToReturn.toFixed(2)} (${renovarChangeMethod}${renovarChangeRef.trim() ? ` Ref: ${renovarChangeRef.trim()}` : ''})`;
      finalReference = finalReference ? `${finalReference} | ${changeTag}` : changeTag;
    }

    const { createTransaction } = await import('@/app/actions/store')
    const { createAthlete, updateAthlete, getAthletes } = await import('@/app/actions/users')

    let targetAthleteId = showRenovarModal.id

    if (isWalkInMode) {
      const cleanCed = walkInCedula.replace(/\D/g, "").trim()
      const createRes = await createAthlete({
        cedula: cleanCed,
        name: walkInName.trim(),
        phone: walkInPhone.trim() || undefined,
        coachId: renovarIncludeCoach && renovarSelectedCoach ? renovarSelectedCoach : undefined,
        skipMembershipCreation: true
      })
      if (!createRes.success || !createRes.athlete) {
        Swal.fire('Error', createRes.error || 'No se pudo registrar o actualizar al cliente por cédula.', 'error')
        return
      }
      targetAthleteId = createRes.athlete.id
    }
    
    // Process Transaction (which atomically creates/extends Membership in DB)
    const coachInfo = getAllEmployees ? (await getAllEmployees()).find((e: any) => e.id === renovarSelectedCoach) : null;
    const txRes = await createTransaction({
       cashierId: validatedCashierId,
       customerId: targetAthleteId,
       items: [
         { productId: `PLAN:${selectedPlanName}`, name: `${selectedPlanName} (${renovarMonths} mes/es)`, price: selectedPlanPrice, qty: renovarMonths, subtotal: membershipPrice },
         ...(coachPrice ? [{ productId: 'COACH', name: `Entrenador (${coachInfo?.name || 'Asignado'})`, price: coachPrice / renovarMonths, qty: renovarMonths, subtotal: coachPrice }] : [])
       ],
       subtotal: total,
       tax: 0,
       total,
       creditAmount,
       adminCreditPassword,
       paymentMethod: finalPaymentMethod,
       reference: finalReference,
       receiptImage: finalReceiptImage
    })

    if (!txRes.success) {
      Swal.fire('Error al Procesar Pago', txRes.error || 'No se pudo registrar la transacción financiera. La membresía no fue activada.', 'error')
      return
    }

    // Update Athlete Coach if changed (membership already created atomically by createTransaction)
    if (!isWalkInMode && renovarIncludeCoach && renovarSelectedCoach && renovarSelectedCoach !== showRenovarModal.coachId) {
      await updateAthlete(targetAthleteId, {
        coachId: renovarSelectedCoach
      })
    }
    
    await refreshAthletes()
    setShowRenovarModal(null)
    
    // Toast Notification
    const Toast = Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 3500,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer)
        toast.addEventListener('mouseleave', Swal.resumeTimer)
      }
    })
    Toast.fire({
      icon: 'success',
      title: isWalkInMode
        ? `Plan cobrado por ${pinRes.user.name} y enlazado a la cédula`
        : `Plan activado y registrado en Finanzas por ${pinRes.user.name}`
    })
  }

  return (
    <div className="space-y-6 max-w-full mx-auto relative">
      
      {/* RENOVAR / ACTIVAR PLAN MODAL */}
      {showRenovarModal && (
        <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-black/90 p-2 sm:p-4 backdrop-blur-md overflow-y-auto">
          <div className="bg-[#0e1017] dark:bg-[#0e1017] text-card-foreground border border-black/15 dark:border-white/15 rounded-2xl max-w-lg w-full p-4 sm:p-6 shadow-2xl relative my-auto max-h-[92vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-3 mb-2">
              <div>
                <h3 className="text-lg sm:text-xl font-bold">
                  {isWalkInMode
                    ? 'Asignar una Membresía'
                    : (new Date(showRenovarModal.membershipEnd).getFullYear() <= 1970 ? `Activar Plan — ${showRenovarModal.name}` : `Renovar Plan — ${showRenovarModal.name}`)}
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {isWalkInMode
                    ? 'Si el cliente aún no se ha registrado en la web, el plan quedará asociado a su Cédula y se enlazará automáticamente cuando se registre en /registro.'
                    : `C.I. ${showRenovarModal.cedula} • Se registrará el cobro en caja y se activará el plan seleccionado.`}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowRenovarModal(null)}
                className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/10 shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleRenovar} className="space-y-4">
              {isWalkInMode && (
                <div className="p-3.5 rounded-xl bg-primary/5 border border-primary/20 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-primary mb-1 block">Cédula del Cliente (Solo números) *</label>
                      <input
                        required
                        type="text"
                        placeholder="Ej: 28123456"
                        value={walkInCedula}
                        onChange={e => {
                          const clean = e.target.value.replace(/\D/g, "")
                          setWalkInCedula(clean)
                          const existingAth = athletes.find(x => x.cedula.replace(/\D/g, "") === clean)
                          if (existingAth && !walkInName) {
                            setWalkInName(existingAth.name)
                            if (existingAth.phone) setWalkInPhone(existingAth.phone)
                          }
                        }}
                        className="w-full bg-card dark:bg-black border border-black/15 dark:border-white/15 rounded-lg p-2 text-sm font-mono focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold mb-1 block">Nombre y Apellido *</label>
                      <input
                        required
                        type="text"
                        placeholder="Ej: María Pérez"
                        value={walkInName}
                        onChange={e => setWalkInName(e.target.value)}
                        className="w-full bg-card dark:bg-black border border-black/15 dark:border-white/15 rounded-lg p-2 text-sm focus:border-primary"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Teléfono / WhatsApp (Opcional)</label>
                    <input
                      type="text"
                      placeholder="Ej: 04141234567"
                      value={walkInPhone}
                      onChange={e => setWalkInPhone(e.target.value)}
                      className="w-full bg-card dark:bg-black border border-black/15 dark:border-white/15 rounded-lg p-2 text-sm focus:border-primary"
                    />
                  </div>
                </div>
              )}

              {/* Selector de Plan Promocional o Mensualidad Básica */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 block">
                  Seleccionar Plan o Mensualidad
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {availablePlans.map((plan) => {
                    const isSelected = selectedPlanName === plan.name
                    return (
                      <button
                        key={plan.name}
                        type="button"
                        onClick={() => {
                          setSelectedPlanName(plan.name)
                          setSelectedPlanPrice(plan.price)
                          syncSingleSplitAmount(plan.price, renovarMonths, renovarIncludeCoach, renovarSelectedCoach)
                        }}
                        className={`text-left p-3 rounded-xl border transition-all flex flex-col justify-between ${
                          isSelected
                            ? 'border-primary bg-primary/15 shadow-sm ring-1 ring-primary'
                            : 'border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 hover:border-primary/40'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-1">
                          <span className="font-black text-xs uppercase tracking-tight leading-snug">{plan.name}</span>
                          {plan.popular && (
                            <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-primary text-primary-foreground shrink-0">
                              Popular
                            </span>
                          )}
                        </div>
                        <div className="mt-2 flex items-baseline gap-1">
                          <span className="text-lg font-black text-primary">{settings.storeCurrency}{plan.price}</span>
                          <span className="text-[10px] text-muted-foreground">{plan.period}</span>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Duración (Meses)</label>
                <input
                  type="number"
                  min="1"
                  max="12"
                  value={renovarMonths}
                  onChange={e => {
                    const m = Math.max(1, Number(e.target.value) || 1)
                    setRenovarMonths(m)
                    syncSingleSplitAmount(selectedPlanPrice, m, renovarIncludeCoach, renovarSelectedCoach)
                  }}
                  className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded p-2 text-sm"
                />
              </div>
              <div className="flex items-center gap-2 mt-4 bg-black/5 dark:bg-white/5 p-3 rounded-lg border border-black/10 dark:border-white/10">
                <input 
                  type="checkbox" 
                  id="includeCoach" 
                  checked={renovarIncludeCoach} 
                  onChange={e => {
                    const checked = e.target.checked
                    setRenovarIncludeCoach(checked)
                    syncSingleSplitAmount(selectedPlanPrice, renovarMonths, checked, renovarSelectedCoach)
                  }} 
                  className="w-4 h-4 text-primary bg-black/10 dark:bg-white/10 border-black/20 dark:border-white/20 rounded focus:ring-primary"
                />
                <label htmlFor="includeCoach" className="text-sm font-medium cursor-pointer">
                  Añadir Entrenador Personal
                </label>
              </div>

              {renovarIncludeCoach && (
                <div className="mt-3 space-y-2.5 p-3 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Seleccionar Entrenador (Coach)</label>
                    <select 
                      required 
                      value={renovarSelectedCoach} 
                      onChange={e => {
                        const cId = e.target.value
                        setRenovarSelectedCoach(cId)
                        syncSingleSplitAmount(selectedPlanPrice, renovarMonths, renovarIncludeCoach, cId, renovarUseCustomCoachFee, renovarCustomCoachFee)
                      }} 
                      className="w-full bg-card dark:bg-black border border-black/10 dark:border-white/10 rounded p-2.5 text-sm"
                    >
                      <option value="">Seleccione un Coach...</option>
                      {allCoaches.map((c: any) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  {renovarSelectedCoach && (
                    <div className="pt-2 border-t border-black/10 dark:border-white/10 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setRenovarUseCustomCoachFee(false)
                            syncSingleSplitAmount(selectedPlanPrice, renovarMonths, renovarIncludeCoach, renovarSelectedCoach, false, renovarCustomCoachFee)
                          }}
                          className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border transition ${
                            !renovarUseCustomCoachFee
                              ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                              : 'bg-black/5 dark:bg-white/5 text-muted-foreground border-black/10 dark:border-white/10 hover:text-foreground'
                          }`}
                        >
                          Seguir Ajustes ({gymCoachPercentage}% = +{settings.storeCurrency}{((selectedPlanPrice * gymCoachPercentage) / 100).toFixed(2)}/mes)
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const fallbackVal = renovarCustomCoachFee || ((selectedPlanPrice * gymCoachPercentage) / 100).toFixed(2)
                            setRenovarCustomCoachFee(fallbackVal)
                            setRenovarUseCustomCoachFee(true)
                            syncSingleSplitAmount(selectedPlanPrice, renovarMonths, renovarIncludeCoach, renovarSelectedCoach, true, fallbackVal)
                          }}
                          className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border transition ${
                            renovarUseCustomCoachFee
                              ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                              : 'bg-black/5 dark:bg-white/5 text-muted-foreground border-black/10 dark:border-white/10 hover:text-foreground'
                          }`}
                        >
                          Monto personalizado ($)
                        </button>
                      </div>

                      {renovarUseCustomCoachFee && (
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-primary">{settings.storeCurrency}</span>
                          <input
                            type="number"
                            step="any"
                            min="0"
                            value={renovarCustomCoachFee}
                            onChange={e => {
                              const val = e.target.value
                              setRenovarCustomCoachFee(val)
                              syncSingleSplitAmount(selectedPlanPrice, renovarMonths, renovarIncludeCoach, renovarSelectedCoach, true, val)
                            }}
                            placeholder="0.00"
                            className="w-24 bg-card dark:bg-black border border-primary/50 rounded-lg px-2 py-1 text-xs font-mono font-bold focus:outline-none focus:border-primary"
                          />
                          <span className="text-[10px] text-muted-foreground">/mes</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
              
              {(() => {
                const mem = selectedPlanPrice * renovarMonths
                const coachPrice = calculateCoachMonthlyFee(
                  selectedPlanPrice,
                  renovarIncludeCoach,
                  renovarSelectedCoach,
                  renovarUseCustomCoachFee,
                  renovarCustomCoachFee
                ) * renovarMonths
                const totalCalculado = Math.round((mem + coachPrice) * 100) / 100

                const assignedSum = renovarSplits.slice(0, renovarSplitCount).reduce((acc, s) => acc + (parseFloat(String(s.amount)) || 0), 0)
                const diff = Math.round((totalCalculado - assignedSum) * 100) / 100
                const isExact = Math.abs(diff) < 0.01

                return (
                  <>
                    <div className="bg-primary/10 border border-primary/20 p-4 rounded-xl mt-4 mb-4 flex justify-between items-center">
                      <div>
                        <span className="font-bold text-sm text-primary block">Total a Cobrar:</span>
                        <span className="text-[11px] text-muted-foreground">
                          {selectedPlanName} × {renovarMonths} mes(es)
                          {renovarIncludeCoach && renovarSelectedCoach
                            ? ` + Coach: ${settings.storeCurrency}${coachPrice.toFixed(2)} (${renovarUseCustomCoachFee ? 'Personalizado' : `${gymCoachPercentage}% Ajustes`})`
                            : ''}
                        </span>
                      </div>
                      <span className="text-2xl font-black text-primary">
                        {settings.storeCurrency} {totalCalculado.toFixed(2)}
                      </span>
                    </div>

                    {/* Método de Pago */}
                    <div className="space-y-4 pt-4 border-t border-black/10 dark:border-white/10">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <h4 className="font-bold text-sm">Detalles de Facturación y Pago</h4>
                        
                        {/* Selector de 1, 2 o 3 formas de pago */}
                        <div className="flex items-center gap-1 bg-black/5 dark:bg-white/5 p-1 rounded-lg border border-black/10 dark:border-white/10 text-xs">
                          <span className="text-[10px] text-muted-foreground font-semibold px-1">Formas:</span>
                          {([1, 2, 3] as const).map(num => (
                            <button
                              key={num}
                              type="button"
                              onClick={() => {
                                setRenovarSplitCount(num)
                                setRenovarSplits(prev => {
                                  const copy = [...prev]
                                  if (num === 1) {
                                    copy[0].amount = totalCalculado
                                  } else if (num === 2) {
                                    const half = Math.round((totalCalculado / 2) * 100) / 100
                                    copy[0].amount = copy[0].amount && Number(copy[0].amount) > 0 ? copy[0].amount : half
                                    copy[1].amount = Math.max(0, Math.round((totalCalculado - Number(copy[0].amount || 0)) * 100) / 100)
                                  } else if (num === 3) {
                                    const third = Math.round((totalCalculado / 3) * 100) / 100
                                    copy[0].amount = copy[0].amount && Number(copy[0].amount) > 0 ? copy[0].amount : third
                                    copy[1].amount = copy[1].amount && Number(copy[1].amount) > 0 ? copy[1].amount : third
                                    copy[2].amount = Math.max(0, Math.round((totalCalculado - Number(copy[0].amount || 0) - Number(copy[1].amount || 0)) * 100) / 100)
                                  }
                                  return copy
                                })
                              }}
                              className={`px-2.5 py-1 rounded font-bold transition ${
                                renovarSplitCount === num 
                                  ? 'bg-primary text-primary-foreground shadow-sm' 
                                  : 'text-muted-foreground hover:text-foreground'
                              }`}
                            >
                              {num === 1 ? '1 Forma' : `${num} Formas`}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Lista de formas de pago */}
                      <div className="space-y-3">
                        {Array.from({ length: renovarSplitCount }).map((_, idx) => {
                          const split = renovarSplits[idx] || { method: 'Efectivo', amount: '', reference: '', receiptImage: null }
                          return (
                            <div key={idx} className="p-3.5 bg-black/5 dark:bg-white/5 rounded-xl border border-black/10 dark:border-white/10 space-y-3">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-primary flex items-center gap-1.5">
                                  <CreditCard className="w-3.5 h-3.5" /> Forma de Pago #{idx + 1}
                                </span>
                                {renovarSplitCount > 1 && (
                                  <span className="text-[11px] text-muted-foreground">
                                    Subtotal: <b>{settings.storeCurrency} {Number(split.amount || 0).toFixed(2)}</b>
                                  </span>
                                )}
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                  <label className="text-xs text-muted-foreground mb-1 block">Método de Pago</label>
                                  <select 
                                    value={split.method}
                                    onChange={e => {
                                      const newMethod = e.target.value as any
                                      setRenovarSplits(prev => {
                                        const c = [...prev]
                                        c[idx] = { ...c[idx], method: newMethod }
                                        return c
                                      })
                                    }}
                                    className="w-full bg-card dark:bg-black border border-black/10 dark:border-white/10 rounded-lg p-2 text-sm focus:border-primary font-medium"
                                  >
                                    {availableMembershipPaymentMethods.map(m => (
                                      <option key={m.value} value={m.value}>{m.label}</option>
                                    ))}
                                  </select>
                                </div>

                                <div>
                                  <label className="text-xs text-muted-foreground mb-1 block">
                                    Monto a Pagar ({settings.storeCurrency})
                                  </label>
                                  <input 
                                    type="number"
                                    step="any"
                                    min="0"
                                    max={totalCalculado}
                                    value={split.amount}
                                    onChange={e => {
                                      const val = e.target.value
                                      setRenovarSplits(prev => {
                                        const c = [...prev]
                                        c[idx] = { ...c[idx], amount: val }
                                        // Auto-calculate remainder for subsequent split if configured
                                        if (renovarSplitCount === 2 && idx === 0) {
                                          const numVal = parseFloat(val) || 0
                                          c[1] = { ...c[1], amount: Math.max(0, Math.round((totalCalculado - numVal) * 100) / 100) }
                                        } else if (renovarSplitCount === 3 && (idx === 0 || idx === 1)) {
                                          const num0 = idx === 0 ? (parseFloat(val) || 0) : (parseFloat(String(c[0].amount)) || 0)
                                          const num1 = idx === 1 ? (parseFloat(val) || 0) : (parseFloat(String(c[1].amount)) || 0)
                                          c[2] = { ...c[2], amount: Math.max(0, Math.round((totalCalculado - num0 - num1) * 100) / 100) }
                                        }
                                        return c
                                      })
                                    }}
                                    className="w-full bg-card dark:bg-black border border-black/10 dark:border-white/10 rounded-lg p-2 text-sm font-mono focus:border-primary"
                                    placeholder="0.00"
                                  />
                                </div>
                              </div>

                              {split.method === 'Crédito/Fiado' && (
                                <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-lg text-[11px] text-amber-600 dark:text-amber-400 flex items-start gap-2">
                                  <span>🔐</span>
                                  <span>
                                    <b>Crédito autorizado por Administrador:</b> Se solicitará la contraseña del Administrador al confirmar y este monto ({settings.storeCurrency} {Number(split.amount || 0).toFixed(2)}) irá a <b>Cuentas por Cobrar</b> con el plan elegido.
                                  </span>
                                </div>
                              )}

                              {/* Datos adicionales si es transferencia, pago móvil, binance o tarjeta */}
                              {['Transferencia', 'Pago Móvil', 'Binance', 'Tarjeta'].includes(split.method) && (
                                <div className="space-y-2 pt-2 border-t border-black/5 dark:border-white/5">
                                  {/* Cuentas de Pago / Instrucciones y QRs */}
                                  {split.method === 'Pago Móvil' && (
                                    <div className="space-y-1.5">
                                      {(settings.storePaymentInstructions?.pagoMovil || settings.storePaymentQRs?.pagoMovil) && (
                                        <div className="p-2 bg-primary/10 border border-primary/20 rounded-lg text-xs flex items-center justify-between gap-2">
                                          <div className="flex-1 whitespace-pre-wrap leading-tight text-[11px] text-primary">
                                            <span className="font-bold block text-[10px] uppercase text-primary/80">Cuenta 1:</span>
                                            {settings.storePaymentInstructions?.pagoMovil || 'Ver datos escaneando el código QR'}
                                          </div>
                                          {settings.storePaymentQRs?.pagoMovil && (
                                            <button type="button" onClick={() => setShowQRModal(settings.storePaymentQRs?.pagoMovil || null)} className="px-2 py-1 rounded bg-primary text-black font-bold text-[10px] flex items-center gap-1 shrink-0 hover:opacity-90 shadow-sm">
                                              <Eye className="h-3 w-3" /> Ver QR
                                            </button>
                                          )}
                                        </div>
                                      )}
                                      {(settings.storePaymentInstructions?.pagoMovil2 || settings.storePaymentQRs?.pagoMovil2) && (
                                        <div className="p-2 bg-primary/10 border border-primary/20 rounded-lg text-xs flex items-center justify-between gap-2">
                                          <div className="flex-1 whitespace-pre-wrap leading-tight text-[11px] text-primary">
                                            <span className="font-bold block text-[10px] uppercase text-primary/80">Cuenta 2:</span>
                                            {settings.storePaymentInstructions?.pagoMovil2 || 'Ver datos escaneando el código QR'}
                                          </div>
                                          {settings.storePaymentQRs?.pagoMovil2 && (
                                            <button type="button" onClick={() => setShowQRModal(settings.storePaymentQRs?.pagoMovil2 || null)} className="px-2 py-1 rounded bg-primary text-black font-bold text-[10px] flex items-center gap-1 shrink-0 hover:opacity-90 shadow-sm">
                                              <Eye className="h-3 w-3" /> Ver QR
                                            </button>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  )}

                                  {split.method === 'Transferencia' && (
                                    <div className="space-y-1.5">
                                      {(settings.storePaymentInstructions?.transferencia || settings.storePaymentQRs?.transferencia) && (
                                        <div className="p-2 bg-primary/10 border border-primary/20 rounded-lg text-xs flex items-center justify-between gap-2">
                                          <div className="flex-1 whitespace-pre-wrap leading-tight text-[11px] text-primary">
                                            <span className="font-bold block text-[10px] uppercase text-primary/80">Cuenta 1:</span>
                                            {settings.storePaymentInstructions?.transferencia || 'Ver datos escaneando el código QR'}
                                          </div>
                                          {settings.storePaymentQRs?.transferencia && (
                                            <button type="button" onClick={() => setShowQRModal(settings.storePaymentQRs?.transferencia || null)} className="px-2 py-1 rounded bg-primary text-black font-bold text-[10px] flex items-center gap-1 shrink-0 hover:opacity-90 shadow-sm">
                                              <Eye className="h-3 w-3" /> Ver QR
                                            </button>
                                          )}
                                        </div>
                                      )}
                                      {(settings.storePaymentInstructions?.transferencia2 || settings.storePaymentQRs?.transferencia2) && (
                                        <div className="p-2 bg-primary/10 border border-primary/20 rounded-lg text-xs flex items-center justify-between gap-2">
                                          <div className="flex-1 whitespace-pre-wrap leading-tight text-[11px] text-primary">
                                            <span className="font-bold block text-[10px] uppercase text-primary/80">Cuenta 2:</span>
                                            {settings.storePaymentInstructions?.transferencia2 || 'Ver datos escaneando el código QR'}
                                          </div>
                                          {settings.storePaymentQRs?.transferencia2 && (
                                            <button type="button" onClick={() => setShowQRModal(settings.storePaymentQRs?.transferencia2 || null)} className="px-2 py-1 rounded bg-primary text-black font-bold text-[10px] flex items-center gap-1 shrink-0 hover:opacity-90 shadow-sm">
                                              <Eye className="h-3 w-3" /> Ver QR
                                            </button>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  )}

                                  {split.method === 'Binance' && (
                                    <div className="p-2 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-xs flex items-center justify-between gap-2">
                                      <div className="flex-1 whitespace-pre-wrap leading-tight text-[11px] text-yellow-600 dark:text-yellow-400">
                                        <span className="font-bold block text-[10px] uppercase">Binance Pay:</span>
                                        {settings.storePaymentInstructions?.binance || 'Pago directo con Binance'}
                                      </div>
                                      {settings.storePaymentQRs?.binance && (
                                        <button type="button" onClick={() => setShowQRModal(settings.storePaymentQRs?.binance || null)} className="px-2 py-1 rounded bg-yellow-500 text-black font-bold text-[10px] flex items-center gap-1 shrink-0 hover:opacity-90 shadow-sm">
                                          <Eye className="h-3 w-3" /> Ver QR
                                        </button>
                                      )}
                                    </div>
                                  )}

                                  <div className="flex items-center justify-between">
                                    <label className="text-xs text-muted-foreground">
                                      {split.method === 'Tarjeta' ? 'N° de Transacción / Voucher' : `N° Referencia (${split.method})`}
                                    </label>
                                  </div>

                                  <input 
                                    type="text" 
                                    value={split.reference} 
                                    onChange={e => {
                                      const refVal = e.target.value
                                      setRenovarSplits(prev => {
                                        const c = [...prev]
                                        c[idx] = { ...c[idx], reference: refVal }
                                        return c
                                      })
                                    }}
                                    placeholder={split.method === 'Tarjeta' ? 'Ej. 000123' : 'Número de referencia...'}
                                    className="w-full bg-card dark:bg-black border border-black/10 dark:border-white/10 rounded-lg p-2 text-xs focus:border-primary"
                                  />

                                  {['Transferencia', 'Pago Móvil', 'Binance'].includes(split.method) && (
                                    <div className="flex items-center gap-2 pt-1">
                                      <label className="flex-1 flex items-center justify-center gap-1.5 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 rounded-lg py-1.5 text-xs font-semibold cursor-pointer transition">
                                        <ImageIcon className="h-3.5 w-3.5" />
                                        <span>{split.receiptImage ? '✓ Comprobante listo' : 'Subir Comprobante (Capture)'}</span>
                                        <input 
                                          type="file" 
                                          accept="image/*"
                                          onChange={(e) => {
                                            const file = e.target.files?.[0]
                                            if (file) {
                                              const reader = new FileReader()
                                              reader.onloadend = () => {
                                                setRenovarSplits(prev => {
                                                  const c = [...prev]
                                                  c[idx] = { ...c[idx], receiptImage: reader.result as string }
                                                  return c
                                                })
                                              }
                                              reader.readAsDataURL(file)
                                            }
                                          }}
                                          className="hidden" 
                                        />
                                      </label>
                                      {split.receiptImage && (
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setRenovarSplits(prev => {
                                              const c = [...prev]
                                              c[idx] = { ...c[idx], receiptImage: null }
                                              return c
                                            })
                                          }}
                                          className="text-xs text-destructive hover:underline p-1 font-bold"
                                        >
                                          Quitar
                                        </button>
                                      )}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>

                      {/* Resumen del balance cuando son 2 o 3 formas de pago */}
                      {renovarSplitCount > 1 && (
                        <div className={`p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs font-bold ${
                          isExact 
                            ? 'bg-success/10 border-success/30 text-success' 
                            : 'bg-amber-500/10 border-amber-500/30 text-amber-500'
                        }`}>
                          <span>Total: {settings.storeCurrency} {totalCalculado.toFixed(2)} | Asignado: {settings.storeCurrency} {assignedSum.toFixed(2)}</span>
                          <span>
                            {isExact ? '✓ Monto completo distribuido' : diff > 0 ? `Falta asignar: ${settings.storeCurrency} ${diff.toFixed(2)}` : `Excede por: ${settings.storeCurrency} ${Math.abs(diff).toFixed(2)}`}
                          </span>
                        </div>
                      )}

                      {/* Calculadora y Registro de Vuelto (Cuando el cliente entrega billete mayor al total) */}
                      <div className="p-3.5 rounded-xl bg-amber-500/5 border border-amber-500/20 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-amber-500 flex items-center gap-1.5">
                            <DollarSign className="w-3.5 h-3.5" /> Calculadora y Registro de Vuelto (Opcional)
                          </span>
                          <span className="text-[10px] text-muted-foreground">Descuenta automáticamente de Caja / Banco</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="text-[11px] text-muted-foreground mb-1 block">Monto Recibido del Cliente ({settings.storeCurrency})</label>
                            <input
                              type="number"
                              step="any"
                              min="0"
                              placeholder={`Ej: 20.00 (Total: ${totalCalculado.toFixed(2)})`}
                              value={renovarReceivedAmount}
                              onChange={e => setRenovarReceivedAmount(e.target.value)}
                              className="w-full bg-card dark:bg-black border border-black/15 dark:border-white/15 rounded-lg p-2 text-xs font-mono font-bold focus:border-amber-500"
                            />
                          </div>
                          <div>
                            <label className="text-[11px] text-muted-foreground mb-1 block">Método de Entrega del Vuelto</label>
                            <select
                              value={renovarChangeMethod}
                              onChange={e => setRenovarChangeMethod(e.target.value as any)}
                              className="w-full bg-card dark:bg-black border border-black/15 dark:border-white/15 rounded-lg p-2 text-xs font-semibold focus:border-amber-500"
                            >
                              <option value="Efectivo">Efectivo (Descontar de Caja)</option>
                              <option value="Pago Móvil">Pago Móvil (Descontar de Banco)</option>
                              <option value="Transferencia">Transferencia (Descontar de Banco)</option>
                            </select>
                          </div>
                        </div>
                        {(parseFloat(renovarReceivedAmount) || 0) > totalCalculado && (() => {
                          const changeUsd = Math.round(((parseFloat(renovarReceivedAmount) || 0) - totalCalculado) * 100) / 100;
                          const changeBs = settings.storeExchangeRate > 0 ? changeUsd * settings.storeExchangeRate : 0;
                          return (
                            <div className="pt-2 border-t border-amber-500/20 space-y-2">
                              <div className="flex items-center justify-between text-xs font-black text-amber-500">
                                <span>Vuelto a Entregar al Cliente:</span>
                                <span>
                                  {settings.storeCurrency} {changeUsd.toFixed(2)}
                                  {changeBs > 0 && settings.storeCurrencySecondary ? ` (${settings.storeCurrencySecondary} ${changeBs.toFixed(2)})` : ''}
                                </span>
                              </div>
                              {renovarChangeMethod !== 'Efectivo' && (
                                <input
                                  type="text"
                                  placeholder={`N° Referencia del vuelto por ${renovarChangeMethod} (Opcional)...`}
                                  value={renovarChangeRef}
                                  onChange={e => setRenovarChangeRef(e.target.value)}
                                  className="w-full bg-card dark:bg-black border border-black/15 dark:border-white/15 rounded-lg p-1.5 text-xs focus:border-amber-500"
                                />
                              )}
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  </>
                )
              })()}

              <div className="flex gap-3 justify-end pt-4">
                <button type="button" onClick={() => setShowRenovarModal(null)} className="px-4 py-2 text-sm bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:bg-white/10 rounded transition">Cancelar</button>
                <button type="submit" className="px-4 py-2 text-sm bg-green-500 text-white font-bold rounded hover:bg-green-600 transition shadow-lg shadow-green-500/20">Validar PIN y Cobrar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-black/90 p-2 sm:p-4 backdrop-blur-md overflow-y-auto">
          <div className="bg-[#0e1017] dark:bg-[#0e1017] text-card-foreground border border-black/15 dark:border-white/15 rounded-2xl max-w-lg w-full p-4 sm:p-6 shadow-2xl relative my-auto max-h-[92vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-black/10 dark:border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-primary/15 text-primary flex items-center justify-center">
                  <Edit className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-foreground leading-tight">Editar Atleta y Membresía</h3>
                  <p className="text-xs text-muted-foreground">{showEditModal.name} • C.I. {showEditModal.cedula}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowEditModal(null)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Formulario */}
            <form onSubmit={handleSaveEdit} className="space-y-4 overflow-y-auto pr-1">
              {/* Sección Datos Personales */}
              <div className="space-y-3">
                <span className="text-[11px] font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <UserIcon className="w-3.5 h-3.5 text-primary" /> Datos Personales
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
                    <label className="text-xs font-semibold mb-1 block">Teléfono</label>
                    <input
                      type="text"
                      placeholder="0414-0000000"
                      value={editPhone}
                      onChange={e => setEditPhone(e.target.value)}
                      className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-lg p-2.5 text-sm focus:border-primary focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold mb-1 block">Entrenador (Coach Asignado)</label>
                    <select
                      value={editCoachId}
                      onChange={e => setEditCoachId(e.target.value)}
                      className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-lg p-2.5 text-sm focus:border-primary focus:outline-none"
                    >
                      <option value="">Sin entrenador asignado</option>
                      {allCoaches.map(c => (
                        <option key={c.id} value={c.id}>{c.name} (Coach)</option>
                      ))}
                    </select>
                  </div>
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

              {/* Sección Membresía & Corte / Fechas */}
              <div className="pt-3 border-t border-black/10 dark:border-white/10 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-[11px] font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-primary" /> Membresía & Fecha de Corte (Histórico)
                  </span>
                  {((showEditModal.membershipEnd && new Date(showEditModal.membershipEnd).getFullYear() > 1970) || editEndDate) && (
                    <button
                      type="button"
                      onClick={handleClearMembershipInEditModal}
                      disabled={isSavingEdit}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-rose-500/15 hover:bg-rose-500/25 text-rose-500 border border-rose-500/30 transition flex items-center gap-1 cursor-pointer disabled:opacity-50"
                    >
                      <X className="w-3 h-3" />
                      Devolver / Quitar Membresía
                    </button>
                  )}
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Modifica directamente la fecha de compra/inicio, fecha de corte (vencimiento) y plan del atleta. Si el atleta no tiene membresía, deja la Fecha de Corte en blanco.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold mb-1 block">Fecha de Compra / Inicio</label>
                    <input
                      type="date"
                      value={editStartDate}
                      onChange={e => setEditStartDate(e.target.value)}
                      className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-lg p-2.5 text-sm focus:border-primary focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold mb-1 block">Fecha de Corte / Vencimiento</label>
                    <input
                      type="date"
                      value={editEndDate}
                      onChange={e => setEditEndDate(e.target.value)}
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
                      onClick={() => setEditEndDate(calculateCutoffDate(editStartDate, btn.months))}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-bold border border-primary/30 bg-primary/10 hover:bg-primary/20 text-primary transition cursor-pointer"
                    >
                      {btn.label}
                    </button>
                  ))}
                </div>

                <div>
                  <label className="text-xs font-semibold mb-1.5 block">Seleccionar Plan / Membresía</label>
                  <select
                    value={editPlanName}
                    onChange={e => handleSelectPlanInEditModal(e.target.value)}
                    className="w-full bg-black/5 dark:bg-[#161922] border border-black/10 dark:border-white/10 rounded-lg p-2.5 text-sm focus:border-primary focus:outline-none font-medium"
                  >
                    <option value="">-- Sin Plan Seleccionado --</option>
                    {availablePlans.map((plan) => (
                      <option key={plan.name} value={plan.name}>
                        {plan.name} — {settings.storeCurrency}{plan.price} {plan.period}
                      </option>
                    ))}
                    {editPlanName && !availablePlans.some(p => p.name === editPlanName) && (
                      <option value={editPlanName}>{editPlanName}</option>
                    )}
                  </select>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                    {availablePlans.map((plan) => {
                      const isSelected = editPlanName === plan.name
                      return (
                        <button
                          key={plan.name}
                          type="button"
                          onClick={() => handleSelectPlanInEditModal(plan.name)}
                          className={`text-left p-2.5 rounded-xl border transition-all flex items-center justify-between gap-2 ${
                            isSelected
                              ? 'border-primary bg-primary/15 shadow-sm ring-1 ring-primary'
                              : 'border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 hover:border-primary/40'
                          }`}
                        >
                          <div className="min-w-0">
                            <span className="font-bold text-xs block truncate">{plan.name}</span>
                            <span className="text-[11px] font-black text-primary">
                              {settings.storeCurrency}{plan.price} <span className="text-[10px] font-normal text-muted-foreground">{plan.period}</span>
                            </span>
                          </div>
                          {isSelected && <Check className="w-4 h-4 text-primary shrink-0" />}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Opción para asentar en Caja / Flujo de Caja */}
                <div className="p-3.5 bg-primary/5 border border-primary/20 rounded-xl space-y-3">
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editRegisterPayment}
                      onChange={e => setEditRegisterPayment(e.target.checked)}
                      className="w-4 h-4 text-primary rounded focus:ring-primary accent-primary"
                    />
                    <div className="text-xs">
                      <span className="font-bold text-foreground block">¿Registrar este cobro en Caja y Flujo Financiero?</span>
                      <span className="text-muted-foreground">Crea el asiento contable para que sume a los ingresos del gimnasio y métricas.</span>
                    </div>
                  </label>

                  {editRegisterPayment && (
                    <div className="pt-2 border-t border-primary/10 grid grid-cols-1 sm:grid-cols-3 gap-2.5 animate-in fade-in duration-200">
                      <div>
                        <label className="text-[11px] font-bold block mb-1">Monto ({settings.storeCurrency})</label>
                        <input
                          type="number"
                          step="0.01"
                          value={editPaymentAmount}
                          onChange={e => setEditPaymentAmount(e.target.value)}
                          className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-lg p-2 text-xs focus:border-primary focus:outline-none"
                          placeholder="Monto"
                          required={editRegisterPayment}
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold block mb-1">Método de Pago</label>
                        <select
                          value={editPaymentMethod}
                          onChange={e => setEditPaymentMethod(e.target.value as PaymentMethodType)}
                          className="w-full bg-black/5 dark:bg-[#161922] border border-black/10 dark:border-white/10 rounded-lg p-2 text-xs focus:border-primary focus:outline-none"
                        >
                          {availableMembershipPaymentMethods.map(m => (
                            <option key={m.value} value={m.value}>{m.label}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-[11px] font-bold block mb-1">Referencia / Comprobante</label>
                        <input
                          type="text"
                          value={editPaymentRef}
                          onChange={e => setEditPaymentRef(e.target.value)}
                          className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-lg p-2 text-xs focus:border-primary focus:outline-none"
                          placeholder="Ej: 849204 / Efectivo"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {user?.role === 'admin' && (
                <div className="pt-3 border-t border-black/10 dark:border-white/10 space-y-2">
                  <label className="text-xs font-bold text-primary block">Rol en el Sistema (Ascender Usuario)</label>
                  <select
                    value={editRole}
                    onChange={e => setEditRole(e.target.value)}
                    className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-lg p-2.5 text-sm focus:border-primary font-medium"
                  >
                    <option value="athlete">Atleta (Cliente)</option>
                    <option value="employee">Entrenador (Coach)</option>
                    <option value="cajero">Cajero / Recepción</option>
                    <option value="gerente">Gerente</option>
                    <option value="admin">Administrador del Sistema</option>
                  </select>
                  {editRole === 'admin' && (
                    <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-lg text-[11px] text-amber-600 dark:text-amber-400">
                      🔐 <b>Super Administrador Requerido:</b> Al guardar se te pedirá la contraseña del <b>Super Administrador (primer administrador creado)</b> para autorizar el rol de Administrador.
                    </div>
                  )}
                </div>
              )}

              <div className="pt-3 border-t border-black/10 dark:border-white/10 space-y-3">
                <span className="text-[11px] font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-amber-500" /> Cambiar Contraseña (Opcional)
                </span>
                <p className="text-[11px] text-muted-foreground">
                  Deja estos campos en blanco si no deseas modificar la clave actual del atleta.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold mb-1 block">Nueva Contraseña</label>
                    <input
                      type="password"
                      placeholder="Mínimo 6 caracteres"
                      value={editPassword}
                      onChange={e => setEditPassword(e.target.value)}
                      className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-lg p-2.5 text-sm focus:border-primary focus:outline-none"
                    />
                  </div>
                  <div className="relative">
                    <label className="text-xs font-semibold mb-1 block">Confirmar Contraseña</label>
                    <input
                      type="password"
                      value={editConfirmPassword}
                      onChange={e => setEditConfirmPassword(e.target.value)}
                      className={`w-full bg-black/5 dark:bg-black/40 border rounded-lg p-2.5 text-sm focus:outline-none transition-all ${
                        editConfirmPassword
                          ? passwordMatch
                            ? 'border-emerald-500 focus:border-emerald-500'
                            : 'border-rose-500 focus:border-rose-500'
                          : 'border-black/10 dark:border-white/10 focus:border-primary'
                      }`}
                      placeholder="Repetir contraseña"
                      disabled={!editPassword}
                      required={!!editPassword}
                    />
                    {passwordMatch && editPassword && <Check className="absolute right-3 top-8 h-4 w-4 text-emerald-500" />}
                    {editConfirmPassword && !passwordMatch && editPassword && (
                      <span className="text-[10px] text-destructive absolute -bottom-4 left-0">No coinciden</span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3 justify-end pt-4 border-t border-black/10 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setShowEditModal(null)}
                  className="px-4 py-2 text-sm bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 rounded-lg transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSavingEdit || (!!editPassword && !passwordMatch)}
                  className="px-5 py-2 text-sm bg-primary text-primary-foreground font-bold rounded-lg hover:bg-primary/90 transition disabled:opacity-50 shadow-md"
                >
                  {isSavingEdit ? "Guardando..." : "Guardar Cambios"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MESSAGE MODAL */}
      {showMessageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-md">
          <div className="bg-[#0e1017] dark:bg-[#0e1017] border border-black/15 dark:border-white/15 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-xl font-bold mb-1 flex items-center gap-2"><MessageSquare className="h-5 w-5 text-primary"/> Mensaje a {showMessageModal.name}</h3>
            <p className="text-xs text-muted-foreground mb-4">Se enviará a: {showMessageModal.phone || 'Sin número registrado'}</p>
            
            <div className="flex flex-wrap gap-2 mb-4 max-h-32 overflow-y-auto">
              {customMessages.map((msg, i) => (
                <button 
                  key={i} 
                  type="button"
                  onClick={() => {
                    const endDate = showMessageModal.membershipEnd && showMessageModal.membershipEnd !== "1970-01-01T00:00:00.000Z"
                      ? new Date(showMessageModal.membershipEnd).toLocaleDateString()
                      : "Sin fecha registrada"
                    const formatted = msg.text
                      .replace(/{nombre}/g, showMessageModal.name.split(' ')[0])
                      .replace(/{cedula}/g, showMessageModal.cedula || "")
                      .replace(/{plan}/g, (showMessageModal as any).membershipType || (showMessageModal as any).planName || "Membresía")
                      .replace(/{vencimiento}/g, endDate)
                      .replace(/{gym}/g, settings.appName || "Maximum Evolution Fit")
                    setMessageText(formatted)
                  }} 
                  className="text-xs bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 px-2.5 py-1.5 rounded-lg hover:bg-black/10 dark:bg-white/10 transition font-medium text-left"
                >
                  {msg.title}
                </button>
              ))}
              <button 
                type="button"
                onClick={() => setShowCreateMessageModal(true)}
                className="text-xs bg-emerald-500 text-white border border-emerald-600 px-2.5 py-1.5 rounded-lg hover:bg-emerald-600 font-bold transition flex items-center gap-1 shrink-0"
              >
                + Nueva Plantilla
              </button>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); sendMessage(); }} className="space-y-4">
              <textarea 
                required
                rows={4} 
                value={messageText}
                onChange={e => setMessageText(e.target.value)}
                placeholder="Escribe tu mensaje o selecciona una plantilla arriba..."
                className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:border-primary"
              />
              <div className="flex gap-3 justify-end pt-2">
                <button type="button" onClick={()=>setShowMessageModal(null)} className="px-4 py-2 text-sm bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:bg-white/10 rounded-xl transition">Cancelar</button>
                <button type="submit" className="px-5 py-2 text-sm bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl transition flex items-center gap-2 shadow-md">
                  <MessageSquare className="w-4 h-4" />
                  Abrir WhatsApp
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE MESSAGE MODAL */}
      {showCreateMessageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-md">
          <div className="bg-[#0e1017] dark:bg-[#0e1017] border border-black/15 dark:border-white/15 rounded-2xl max-w-sm w-full p-6 shadow-2xl">
            <h3 className="text-lg font-bold mb-4">Crear Plantilla de Mensaje</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              setCustomMessages(prev => [...prev, { title: newMessageTitle, text: newMessageText }]);
              setShowCreateMessageModal(false);
              setNewMessageTitle("");
              setNewMessageText("");
            }} className="space-y-4">
              <div>
                <label className="text-xs font-medium mb-1 block">Título del botón</label>
                <input required type="text" value={newMessageTitle} onChange={e=>setNewMessageTitle(e.target.value)} placeholder="Ej. Promoción" className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded p-2 text-sm focus:border-primary" />
              </div>
              <div>
                <label className="text-xs font-medium mb-1 block">Mensaje (Usa {'{nombre}'} para el atleta)</label>
                <textarea required rows={4} value={newMessageText} onChange={e=>setNewMessageText(e.target.value)} placeholder="Ej. ¡Hola {nombre}, tenemos una promoción..." className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded p-2 text-sm focus:border-primary" />
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <button type="button" onClick={()=>setShowCreateMessageModal(false)} className="px-4 py-2 text-sm bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:bg-white/10 rounded transition">Cancelar</button>
                <button type="submit" className="px-4 py-2 text-sm border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground dark:bg-primary dark:text-primary-foreground dark:border-transparent font-bold rounded hover:bg-primary/90 transition">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CRON ALERTS SUMMARY & WHATSAPP QUEUE MODAL */}
      {cronSummary && (
        <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-black/90 p-2 sm:p-4 backdrop-blur-md overflow-y-auto">
          <div className="bg-[#0e1017] dark:bg-[#0e1017] border border-black/15 dark:border-white/15 rounded-2xl max-w-xl w-full p-5 sm:p-6 shadow-2xl relative my-auto max-h-[92vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-black/10 dark:border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-500 flex items-center justify-center">
                  <Bell className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-foreground leading-tight">Resultados del Cron de Alertas</h3>
                  <p className="text-xs text-muted-foreground">Notificaciones automáticas procesadas para hoy</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setCronSummary(null)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Resumen Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-4">
              <div className="bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-xl p-3 text-center">
                <p className="text-[10px] uppercase font-bold text-muted-foreground">Correos Enviados</p>
                <p className="text-xl font-black text-emerald-500">{cronSummary.emailsSentCount}</p>
              </div>
              <div className="bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-xl p-3 text-center">
                <p className="text-[10px] uppercase font-bold text-muted-foreground">Vencen en 3 Días</p>
                <p className="text-xl font-black text-amber-500">{cronSummary.expiring3DaysCount}</p>
              </div>
              <div className="bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-xl p-3 text-center">
                <p className="text-[10px] uppercase font-bold text-muted-foreground">Vencen Hoy</p>
                <p className="text-xl font-black text-rose-500">{cronSummary.expiredTodayCount}</p>
              </div>
              <div className="bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-xl p-3 text-center">
                <p className="text-[10px] uppercase font-bold text-muted-foreground">+7d Ausentes</p>
                <p className="text-xl font-black text-blue-500">{cronSummary.inactive7DaysCount}</p>
              </div>
            </div>

            {/* Cola de WhatsApp */}
            <div className="space-y-2 flex-1 overflow-y-auto pr-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <MessageSquare className="h-3.5 w-3.5 text-emerald-500" /> Cola de Mensajes para WhatsApp ({cronSummary.whatsappQueue?.length || 0})
                </span>
                <span className="text-[10px] text-muted-foreground">Envío directo con 1 clic</span>
              </div>

              {(!cronSummary.whatsappQueue || cronSummary.whatsappQueue.length === 0) ? (
                <div className="p-6 text-center text-xs text-muted-foreground border border-dashed border-black/10 dark:border-white/10 rounded-xl">
                  No hay alertas pendientes para enviar hoy. Todos los atletas están al día.
                </div>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {cronSummary.whatsappQueue.map((item: any) => (
                    <div key={item.id} className="p-3 bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-xl flex items-center justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-foreground truncate">{item.name}</span>
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                            item.type === 'EXPIRED_TODAY' ? 'bg-rose-500/15 text-rose-500' : item.type === 'EXPIRING_3_DAYS' ? 'bg-amber-500/15 text-amber-500' : 'bg-blue-500/15 text-blue-500'
                          }`}>
                            {item.title}
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground font-mono mt-0.5">{item.phone}</p>
                      </div>
                      <a
                        href={`https://wa.me/${item.phone.replace(/\D/g, '')}?text=${encodeURIComponent(item.message)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-xs font-bold transition flex items-center gap-1 shrink-0 shadow-sm"
                      >
                        <Send className="h-3 w-3" /> Enviar
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-black/10 dark:border-white/10 flex flex-wrap items-center justify-between gap-2">
              <button
                type="button"
                onClick={handleTestSmtp}
                className="px-3 py-1.5 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-muted-foreground hover:text-foreground rounded-lg text-xs font-semibold transition flex items-center gap-1.5"
              >
                <Mail className="h-3.5 w-3.5 text-amber-500" /> Probar Servidor (Gmail / SMTP)
              </button>
              <button
                type="button"
                onClick={() => setCronSummary(null)}
                className="px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg text-xs font-bold transition"
              >
                Cerrar Resumen
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Membresías y Gestión de Planes</h1>
          <p className="text-muted-foreground mt-1">
            Gestiona accesos, planes promocionales y comunicación con los atletas.
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2 w-full sm:w-auto items-center">
          <button
            type="button"
            onClick={handleRunCronAlerts}
            disabled={isRunningAlerts}
            className="bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 border border-black/10 dark:border-white/10 text-foreground font-bold text-xs px-3.5 py-2.5 rounded-lg transition flex items-center gap-1.5 whitespace-nowrap"
          >
            <Bell className={`h-4 w-4 text-amber-500 ${isRunningAlerts ? 'animate-spin' : ''}`} />
            {isRunningAlerts ? "Ejecutando..." : "Ejecutar Alertas Diarias"}
          </button>
          <button
            type="button"
            onClick={openWalkInPlanModal}
            className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold text-xs px-3.5 py-2.5 rounded-lg transition shadow-md shadow-primary/20 flex items-center gap-1.5 whitespace-nowrap"
          >
            <DollarSign className="h-4 w-4" /> Asignar una Membresía
          </button>
          <select 
            value={filterType} 
            onChange={e => setFilterType(e.target.value)}
            className="bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary transition-colors"
          >
            <option value="Todas">Todas</option>
            <option value="Activas">Activas</option>
            <option value="Por Vencer">Por Vencer</option>
            <option value="Vencidas">Vencidas / Sin Plan</option>
          </select>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Buscar por Cédula o nombre..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-primary transition-colors"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          [1, 2, 3, 4].map(i => (
            <div key={i} className="glass rounded-xl p-5 border border-black/10 dark:border-white/10 animate-pulse">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="flex items-center gap-4 flex-1 w-full">
                  <div className="h-12 w-12 rounded-full bg-black/10 dark:bg-white/10 shrink-0" />
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-black/10 dark:bg-white/10 rounded w-1/2" />
                    <div className="h-3 bg-black/10 dark:bg-white/10 rounded w-1/3" />
                  </div>
                </div>
                <div className="flex-1 w-full space-y-2">
                  <div className="h-3 bg-black/10 dark:bg-white/10 rounded w-1/3" />
                  <div className="h-4 bg-black/10 dark:bg-white/10 rounded w-1/2" />
                </div>
                <div className="flex-1 w-full space-y-2">
                  <div className="h-3 bg-black/10 dark:bg-white/10 rounded w-1/4" />
                  <div className="h-4 bg-black/10 dark:bg-white/10 rounded w-1/3" />
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                  <div className="h-8 w-20 bg-black/10 dark:bg-white/10 rounded" />
                  <div className="h-8 w-20 bg-black/10 dark:bg-white/10 rounded" />
                </div>
              </div>
            </div>
          ))
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 px-4 rounded-2xl glass border border-dashed border-black/15 dark:border-white/15 my-4">
            <div className="h-16 w-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center text-primary shadow-inner">
              <CreditCard className="h-8 w-8 opacity-80" />
            </div>
            <h3 className="text-xl font-black text-foreground">No se encontraron membresías</h3>
            <p className="text-sm text-muted-foreground mt-1.5 max-w-md mx-auto">
              {search ? `No hay resultados para "${search}". Intenta con otra cédula o nombre.` : "No hay atletas en el filtro seleccionado."}
            </p>
          </div>
        ) : (
          filtered.map(a => {
            const hasValidMemb = Boolean(a.membershipEnd && new Date(a.membershipEnd).getFullYear() > 1970)
            const endDate = hasValidMemb ? new Date(a.membershipEnd) : null
            const today = new Date()
            const diffDays = endDate ? Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)) : 0
            const isExpired = hasValidMemb && diffDays <= 0
            const noMembYet = !hasMembValidHelper(hasValidMemb)

            function hasMembValidHelper(v: boolean) { return v }

            return (
              <Card key={a.id} className="glass overflow-hidden hover:border-primary/40 transition-all duration-200">
                <CardContent className="p-0">
                  <div className="flex flex-col md:flex-row items-stretch">
                    
                    {/* Info Principal */}
                    <div className="p-5 flex-1 flex items-center gap-4 relative">
                      {/* Dynamic Semaphore Status Badge */}
                      <div className={`absolute top-4 right-4 inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-0.5 rounded-full border shadow-sm ${
                        noMembYet
                          ? 'text-amber-400 bg-amber-500/10 border-amber-500/30'
                          : isExpired 
                          ? 'text-rose-400 bg-rose-500/10 border-rose-500/30' 
                          : diffDays <= 5 
                          ? 'text-warning bg-warning/10 border-warning/30' 
                          : 'text-success bg-success/10 border-success/30'
                      }`}>
                        <span className="relative flex h-2 w-2">
                          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                            noMembYet ? 'bg-amber-400' : isExpired ? 'bg-rose-400' : diffDays <= 5 ? 'bg-amber-400' : 'bg-emerald-400'
                          }`} />
                          <span className={`relative inline-flex rounded-full h-2 w-2 ${
                            noMembYet ? 'bg-amber-500' : isExpired ? 'bg-rose-500' : diffDays <= 5 ? 'bg-amber-500' : 'bg-emerald-500'
                          }`} />
                        </span>
                        <span>{noMembYet ? 'SIN MEMBRESÍA' : isExpired ? 'VENCIDA' : diffDays <= 5 ? 'POR VENCER' : 'ACTIVA'}</span>
                      </div>

                      <Link href={`/atletas/${a.id}`} className="flex items-center gap-4 group/ath pr-24">
                        {(a.profilePicture || a.avatar) ? (
                          <img
                            src={a.profilePicture || a.avatar || ""}
                            alt={a.name}
                            className="h-12 w-12 rounded-full object-cover shrink-0 border border-primary/30 group-hover/ath:ring-2 group-hover/ath:ring-primary/50 transition"
                          />
                        ) : (
                          <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xl shrink-0 border border-primary/20">
                            {a.name.charAt(0)}
                          </div>
                        )}
                        <div>
                          <h3 className="font-bold text-lg leading-tight group-hover/ath:text-primary transition">{a.name}</h3>
                          <p className="text-xs text-muted-foreground mt-0.5">C.I. {a.cedula}</p>
                        </div>
                      </Link>
                    </div>

                    {/* Detalles Membresias */}
                    <div className="p-5 flex-1 border-t md:border-t-0 md:border-l border-black/5 dark:border-white/5 flex flex-col justify-center">
                      <div className="flex items-center gap-2 mb-1">
                        <CreditCard className="h-4 w-4 text-primary" />
                        <span className="text-sm font-bold">{noMembYet ? 'Sin plan activo' : (a.membershipType || 'Plan Estándar')}</span>
                      </div>
                      <div className="text-sm">
                        <span className="text-muted-foreground text-xs">{noMembYet ? 'Estado: ' : 'Vence: '}</span>
                        <span className={noMembYet ? 'text-warning font-bold' : isExpired ? 'text-rose-500 font-bold' : 'text-foreground font-semibold'}>
                          {noMembYet ? 'Pendiente de pago' : endDate?.toLocaleDateString()}
                        </span>
                        <span className={`ml-2 px-2 py-0.5 rounded text-xs font-bold border ${
                          noMembYet
                            ? 'bg-warning/10 text-warning border-warning/20'
                            : isExpired 
                            ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' 
                            : diffDays <= 5
                            ? 'bg-warning/10 text-warning border-warning/20'
                            : 'bg-success/10 text-success border-success/20'
                        }`}>
                          {noMembYet ? 'Por activar' : isExpired ? 'Vencida' : `${diffDays} días`}
                        </span>
                      </div>
                    </div>

                    {/* Ultimo Acceso */}
                    <div className="p-5 flex-1 border-t md:border-t-0 md:border-l border-black/5 dark:border-white/5 flex flex-col justify-center">
                      <div className="flex items-center gap-2 mb-1">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Último Acceso</span>
                      </div>
                      <p className="text-sm font-semibold">{a.lastLogin || 'Nunca'}</p>
                    </div>

                    {/* Acciones */}
                    <div className="p-5 border-t md:border-t-0 md:border-l border-black/5 dark:border-white/5 flex flex-row md:flex-col items-center justify-center gap-2">
                      <button 
                        onClick={() => openRenovarModal(a)}
                        className={`flex-1 md:w-full px-3 py-2 rounded-lg transition text-xs font-bold flex items-center justify-center gap-1.5 ${
                          noMembYet || isExpired
                            ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-md shadow-emerald-500/20' 
                            : 'bg-primary/15 hover:bg-primary/25 text-primary border border-primary/30'
                        }`}
                      >
                        <DollarSign className="h-3.5 w-3.5" /> {noMembYet ? 'Activar Plan' : 'Renovar Plan'}
                      </button>
                      <button 
                        onClick={() => openEditModal(a)}
                        className="flex-1 md:w-full bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:bg-white/10 text-foreground border border-black/10 dark:border-white/10 px-3 py-2 rounded-lg transition text-xs font-medium flex items-center justify-center gap-1.5"
                      >
                        <Edit className="h-3.5 w-3.5" /> Editar
                      </button>
                      <button 
                        onClick={() => setShowMessageModal(a)}
                        className="flex-1 md:w-full bg-primary/20 hover:bg-primary/30 text-primary border border-primary/20 px-3 py-2 rounded-lg transition text-xs font-medium flex items-center justify-center gap-1.5"
                      >
                        <MessageSquare className="h-3.5 w-3.5" /> Mensaje
                      </button>
                    </div>

                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>
      
      {/* MODAL QR FULLSCREENº */}
      {showQRModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 p-6 backdrop-blur-md" onClick={() => setShowQRModal(null)}>
          <div className="relative bg-white rounded-2xl p-6 max-w-xs w-full shadow-2xl" onClick={e => e.stopPropagation()}>
            <button onClick={() => setShowQRModal(null)} className="absolute top-3 right-3 text-gray-500 hover:text-black font-bold text-xl">&times;</button>
            <h3 className="text-center font-bold text-black mb-4">Escanea el QR</h3>
            <img src={showQRModal} alt="QR de Pago" className="w-full aspect-square object-contain" />
            <p className="text-center text-xs text-gray-500 mt-3">Usa la app de tu banco para escanear</p>
          </div>
        </div>
      )}
    </div>
  )
}




