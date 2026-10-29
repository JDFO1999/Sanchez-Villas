"use client"

import { useState, useEffect, useCallback } from "react"
import { useAuth, AVAILABLE_PERMISSIONS } from "@/lib/auth-context"
import { useSettings } from "@/lib/settings-context"
import { financeService } from "@/lib/finance-service"
import { athleteService, AthleteProfile } from "@/lib/data-service"
import { Plus, Search, Eye, EyeOff, Shield, CheckCircle2, X, UserCheck } from "lucide-react"
import Swal from "sweetalert2"
import JsBarcode from "jsbarcode"
import { confirmAction } from "@/lib/confirm"
import { showSweetToast } from "@/lib/toast-context"

export default function EmpleadosPage() {
  const { user, getAllEmployees, addEmployee, updateEmployee } = useAuth()
  const { settings } = useSettings()
  const [employees, setEmployees] = useState<any[]>([])
  const [athletes, setAthletes] = useState<AthleteProfile[]>([])
  const [showEmployeeModal, setShowEmployeeModal] = useState(false)
  const [showAthleteSearchModal, setShowAthleteSearchModal] = useState(false)
  const [athleteSearchQuery, setAthleteSearchQuery] = useState("")
  const [showPin, setShowPin] = useState(false)
  const [editingPermsEmp, setEditingPermsEmp] = useState<any | null>(null)
  const [tempPermissions, setTempPermissions] = useState<string[]>([])
  const [isSavingPerms, setIsSavingPerms] = useState(false)
  
  const [empForm, setEmpForm] = useState<any>({
    id: '', name: '', cedula: '', email: '', phone: '', role: 'employee', clave: '', confirmClave: '', canManageAttendance: false, pin: '',
    birthDate: '', profession: '', courses: '', specialty: '', bankAccount: '', mobilePayment: '', avatar: '',
    baseSalary: 0, commissionRate: 0, commissionType: 'flat'
  })

  const barcodeCallbackRef = useCallback((node: SVGSVGElement | null) => {
    if (node && empForm.pin) {
      try {
        JsBarcode(node, empForm.pin, {
          format: "CODE128",
          width: 2,
          height: 50,
          displayValue: true
        });
      } catch (err) {
        console.error("Error generando código de barras:", err);
      }
    }
  }, [empForm.pin])

  useEffect(() => {
    async function load() {
      if (getAllEmployees) setEmployees(await getAllEmployees())
      const { getAthletes } = await import('@/app/actions/users')
      const res = await getAthletes()
      if (res.success) {
        setAthletes(res.athletes.map((a: any) => ({
          ...a,
          membershipEnd: a.memberships?.[0]?.endDate || new Date(0).toISOString()
        })))
      }
    }
    load()
  }, [getAllEmployees])

  const customRole = settings?.customRoles?.find((r: any) => r.id === user?.role || r.name?.toLowerCase() === user?.role?.toLowerCase())
  const hasStaffManage = user?.role === 'admin' || user?.permissions?.includes('STAFF_MANAGE') || customRole?.permissions?.includes('STAFF_MANAGE')

  if (!user || !hasStaffManage) {
    return <div className="p-8 text-center text-destructive font-bold">Acceso Denegado. Solo personal administrativo autorizado con permiso de gestión de personal.</div>
  }

  const isBarcodeRole = (role?: string) => {
    if (!role) return false
    const r = role.toLowerCase()
    return r === 'cajero' || r === 'gerente' || r === 'admin' || r.includes('cajer') || r.includes('gerent')
  }

  const generateNewPin = () => Math.floor(10000000000 + Math.random() * 90000000000).toString().slice(0, 11)

  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!addEmployee || !updateEmployee || !empForm.name || !empForm.cedula) return
    
    if (empForm.clave && empForm.clave !== empForm.confirmClave) {
      Swal.fire('Error', 'Las contraseñas no coinciden.', 'error')
      return
    }
    if (!empForm.id && !empForm.existingAthleteFound && !empForm.clave) {
      Swal.fire('Error', 'Ingresa una contraseña para el nuevo usuario.', 'error')
      return
    }

    const existingEmp = empForm.id ? employees.find(x => x.id === empForm.id) : null
    let currentPin = empForm.pin
    let generatedNewPin = false
    if (isBarcodeRole(empForm.role) && !currentPin) {
      currentPin = generateNewPin()
      generatedNewPin = true
    } else if (isBarcodeRole(empForm.role) && currentPin && (!existingEmp || existingEmp.accessPin !== currentPin)) {
      generatedNewPin = true
    }

    const payload = { ...empForm, pin: currentPin }

    if (empForm.id) {
      const ok = await updateEmployee(empForm.id, payload)
      if (!ok) return
      if (generatedNewPin && currentPin) {
        Swal.fire({
          title: '¡Código de Barras Asignado!',
          html: `Se actualizó el rol y se generó el código de barras para facturar.<br><br>Su PIN / Código de Caja es: <b>${currentPin}</b><br><span class="text-xs text-muted-foreground">(No utiliza la clave de su cuenta personal)</span><br><br><div class="flex justify-center mt-4 bg-white p-3 rounded-lg"><svg id="swal-barcode"></svg></div>`,
          icon: 'success',
          didOpen: () => {
            JsBarcode("#swal-barcode", currentPin, {
              format: "CODE128",
              lineColor: "#000",
              width: 2,
              height: 50,
              displayValue: true
            });
          }
        })
      } else {
        Swal.fire('Actualizado', 'Datos guardados con éxito', 'success')
      }
    } else {
      const ok = await addEmployee(payload, empForm.clave)
      if (!ok) return
      if (generatedNewPin && currentPin) {
        Swal.fire({
          title: '¡Personal Creado con Código de Barras!',
          html: `Se registró exitosamente.<br><br>Su PIN / Código de Barras para facturar es: <b>${currentPin}</b><br><span class="text-xs text-muted-foreground">(El cajero usa este código y no la clave de su cuenta personal)</span><br><br><div class="flex justify-center mt-4 bg-white p-3 rounded-lg"><svg id="swal-barcode"></svg></div>`,
          icon: 'success',
          didOpen: () => {
            JsBarcode("#swal-barcode", currentPin, {
              format: "CODE128",
              lineColor: "#000",
              width: 2,
              height: 50,
              displayValue: true
            });
          }
        })
      } else {
        Swal.fire('¡Personal Registrado!', 'Se guardó y asignó el rol correctamente.', 'success')
      }
    }
    setShowEmployeeModal(false)
    if (getAllEmployees) setEmployees(await getAllEmployees())
  }
  
  const selectExistingAthlete = (atleta: AthleteProfile) => {
    const pic = (atleta as any).profilePicture || atleta.avatar || ''
    setEmpForm({
      ...empForm,
      name: atleta.name,
      cedula: atleta.cedula,
      phone: atleta.phone || empForm.phone || '',
      email: (atleta as any).email || `${atleta.cedula}@atleta.com`,
      avatar: pic,
      existingAthleteFound: true,
    })
    setShowAthleteSearchModal(false)
    setAthleteSearchQuery("")
    showSweetToast(`Datos de ${atleta.name} (C.I. ${atleta.cedula}) precargados`, "success")
  }

  const buscarAtleta = () => {
    setAthleteSearchQuery("")
    setShowAthleteSearchModal(true)
  }

  const matchingAthletes = athletes.filter(a => {
    const q = athleteSearchQuery.trim().toLowerCase()
    if (!q) return true
    const cleanQ = q.replace(/\D/g, "")
    return (
      a.cedula.toLowerCase().includes(q) ||
      (cleanQ.length > 0 && a.cedula.replace(/\D/g, "").includes(cleanQ)) ||
      a.name.toLowerCase().includes(q)
    )
  }).slice(0, 12)

  return (
    <div className="space-y-6 max-w-full w-full mx-auto pb-20 relative">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="page-title mb-2">Empleados y Comisiones</h1>
          <p className="text-muted-foreground">Gestión de personal, roles, y configuración de comisiones.</p>
        </div>
        <button onClick={() => { setEmpForm({ id: '', name: '', cedula: '', email: '', phone: '', role: 'employee', pin: '', clave: '', confirmClave: '', birthDate: '', profession: '', courses: '', specialty: '', bankAccount: '', mobilePayment: '', avatar: '', baseSalary: 0, commissionRate: 0, commissionType: 'flat', canManageAttendance: false, existingAthleteFound: false }); setShowEmployeeModal(true); }} className="bg-transparent border border-success text-success px-3 py-1.5 rounded-lg font-bold hover:bg-success/10 transition flex items-center gap-2">
          <Plus className="h-4 w-4" /> Nuevo Empleado
        </button>
      </div>

      <div className="bg-card border border-black/10 dark:border-white/10 rounded-xl overflow-hidden glass">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-black/5 dark:bg-black/40 border-b border-black/10 dark:border-white/10 text-muted-foreground">
              <tr>
                <th className="p-4 font-medium">Empleado</th>
                <th className="p-4 font-medium">Información de Contacto</th>
                <th className="p-4 font-medium">Atletas Asignados</th>
                <th className="p-4 font-medium text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {employees.filter(e => e.role !== 'deleted').map(emp => {
                const assignedAthletes = athletes.filter(a => a.coachId === emp.id)
                const baseSalary = emp.baseSalary || 0
                const commissionRate = emp.commissionRate || 0
                const isSuperAdmin = emp.cedula === '26710825' || (emp.role === 'admin' && emp.id === employees.find(x => x.role === 'admin')?.id && emp.cedula === '26710825')
                const customRoleDef = settings.customRoles?.find((r: any) => r.id === emp.role)

                return (
                  <tr key={emp.id} className="transition-colors hover:bg-black/5 dark:hover:bg-white/5">
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className="font-bold">{emp.name}</span>
                        {isSuperAdmin && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-black tracking-wider bg-amber-500/20 text-amber-500 border border-amber-500/30">
                            SUPER ADMIN
                          </span>
                        )}
                        {!isSuperAdmin && emp.role === 'admin' && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-primary/20 text-primary border border-primary/30">
                            ADMINISTRADOR
                          </span>
                        )}
                        {emp.role === 'gerente' && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-500 border border-emerald-500/30">
                            GERENTE
                          </span>
                        )}
                        {customRoleDef && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-400 border border-purple-500/30">
                            {customRoleDef.name.toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1.5 flex-wrap mt-0.5">
                        <span>C.C. {emp.cedula}</span>
                        {emp.role === 'employee' && <span>| ENTRENADOR</span>}
                        {emp.role === 'cajero' && <span>| CAJERO</span>}
                        {emp.role === 'gerente' && <span>| GERENTE</span>}
                        {emp.role === 'employee' && emp.canManageAttendance && (
                          <span className="text-[10px] bg-success/10 text-success border border-success/20 px-1.5 py-0.5 rounded font-bold">
                            Asistencia Habilitada
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm">{(emp as any).email || 'Sin correo'}</div>
                      <div className="text-xs text-muted-foreground">{emp.phone || 'Sin teléfono'}</div>
                    </td>
                    <td className="p-4">
                      {emp.role === 'employee' ? (
                        <div className="font-bold text-primary">{assignedAthletes.length} atletas</div>
                      ) : (
                        <span className="text-xs text-muted-foreground">N/A</span>
                      )}
                    </td>

                    <td className="p-4 text-right flex justify-end gap-2">
                      {emp.role !== 'admin' && (
                        <button
                          onClick={async () => {
                            if (!updateEmployee) return
                            const newPin = emp.accessPin || generateNewPin()
                            const ok = await updateEmployee(emp.id, { ...emp, role: 'admin', pin: newPin })
                            if (ok) {
                              Swal.fire('¡Nuevo Administrador!', `${emp.name} ahora tiene el rol de Administrador del Sistema.`, 'success')
                              if (getAllEmployees) setEmployees(await getAllEmployees())
                            }
                          }}
                          className="px-3 py-1.5 bg-amber-500/15 text-amber-500 border border-amber-500/30 text-xs font-bold rounded hover:bg-amber-500/25 transition"
                          title="Otorgar permisos de Administrador (Requiere clave del Super Admin)"
                        >
                          Hacer Admin
                        </button>
                      )}
                      {emp.role !== 'admin' && (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingPermsEmp(emp)
                            setTempPermissions(Array.isArray(emp.permissions) ? [...emp.permissions] : [])
                          }}
                          className="px-3 py-1.5 bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 text-xs font-bold rounded transition flex items-center gap-1.5"
                          title="Gestionar permisos individuales"
                        >
                          <Shield className="h-3.5 w-3.5" /> Permisos
                        </button>
                      )}
                      <button onClick={() => {
                        const initialPin = emp.accessPin || (isBarcodeRole(emp.role) ? generateNewPin() : '');
                        setEmpForm({ birthDate: '', profession: '', courses: '', specialty: '', bankAccount: '', mobilePayment: '', avatar: '', baseSalary: 0, commissionRate: 0, commissionType: 'flat', ...emp, pin: initialPin, clave: '', confirmClave: '', existingAthleteFound: false });
                        setShowEmployeeModal(true);
                      }} className="px-3 py-1.5 bg-black/10 dark:bg-white/10 text-foreground text-xs font-bold rounded hover:bg-black/20 transition">
                        Editar
                      </button>
                      {!isSuperAdmin && (
                        <button onClick={async () => { 
                          if (await confirmAction({ title: `¿Eliminar a ${emp.name}?`, text: 'El usuario dejará de tener acceso al sistema.', confirmText: 'Sí, eliminar', danger: true })) {
                            if (updateEmployee) {
                              const ok = await updateEmployee(emp.id, { role: 'deleted' })
                              if (ok && getAllEmployees) setEmployees(await getAllEmployees())
                            }
                          }
                        }} className="px-3 py-1.5 bg-destructive/10 text-destructive hover:bg-destructive/20 text-xs font-bold rounded transition">
                          Eliminar
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
              {employees.filter(e => e.role !== 'deleted').length === 0 && (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-muted-foreground">No hay personal registrado.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showEmployeeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm overflow-y-auto">
          <div className="bg-card border border-black/10 dark:border-white/10 rounded-2xl max-w-2xl w-full p-6 shadow-2xl glass relative my-8">
            <h3 className="text-xl font-bold mb-4">{empForm.id ? 'Editar Personal' : 'Registrar Personal'}</h3>
            <form onSubmit={handleAddEmployee} className="space-y-4">
              {!empForm.id && (
                <div className="space-y-3 mb-2">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <button type="button" onClick={buscarAtleta} className="bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30 px-3.5 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition shadow-sm">
                      <Search className="h-4 w-4" /> Buscar Atleta Existente
                    </button>
                    {empForm.existingAthleteFound && (
                      <button
                        type="button"
                        onClick={() => setEmpForm({ ...empForm, name: '', cedula: '', email: '', phone: '', avatar: '', existingAthleteFound: false })}
                        className="text-xs text-muted-foreground hover:text-destructive font-semibold transition"
                      >
                        Limpiar selección
                      </button>
                    )}
                  </div>

                  {empForm.existingAthleteFound && (
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-primary/10 border border-primary/30">
                      {empForm.avatar ? (
                        <img src={empForm.avatar} alt={empForm.name} className="w-12 h-12 rounded-full object-cover border-2 border-primary shrink-0" />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-primary/20 border-2 border-primary text-primary flex items-center justify-center font-black text-lg shrink-0">
                          {empForm.name?.charAt(0)?.toUpperCase() || 'A'}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-black text-sm text-foreground truncate">{empForm.name}</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary text-primary-foreground shrink-0">
                            Atleta Seleccionado
                          </span>
                        </div>
                        <p className="text-xs font-mono text-muted-foreground">C.I. {empForm.cedula}</p>
                        <p className="text-[11px] text-primary font-semibold mt-0.5">
                          Puedes asignarle su nuevo rol y dejar la contraseña en blanco para conservar la actual.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Nombre Completo</label>
                  <input required type="text" value={empForm.name} onChange={e => setEmpForm({...empForm, name: e.target.value})} className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-lg p-2 text-sm focus:border-primary" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Cédula</label>
                  <input required type="text" value={empForm.cedula} onChange={e => setEmpForm({...empForm, cedula: e.target.value})} className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-lg p-2 text-sm focus:border-primary" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Correo</label>
                  <input type="email" value={empForm.email || ''} onChange={e => setEmpForm({...empForm, email: e.target.value})} className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-lg p-2 text-sm focus:border-primary" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Teléfono</label>
                  <input type="text" value={empForm.phone || ''} onChange={e => setEmpForm({...empForm, phone: e.target.value})} className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-lg p-2 text-sm focus:border-primary" />
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Rol de Sistema</label>
                  <select
                    required
                    value={empForm.role}
                    onChange={e => {
                      const nextRole = e.target.value
                      const nextPin = isBarcodeRole(nextRole) && !empForm.pin ? generateNewPin() : empForm.pin
                      setEmpForm({ ...empForm, role: nextRole, pin: nextPin })
                    }}
                    className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-lg p-2 text-sm focus:border-primary"
                  >
                    <option value="employee">Entrenador (Coach)</option>
                    <option value="cajero">Cajero / Recepción</option>
                    <option value="gerente">Gerente</option>
                    <option value="admin">Administrador del Sistema</option>
                    {settings.customRoles && settings.customRoles.length > 0 && (
                      <optgroup label="Roles Personalizados">
                        {settings.customRoles.map((r: any) => (
                          <option key={r.id} value={r.id}>{r.name}</option>
                        ))}
                      </optgroup>
                    )}
                  </select>
                </div>
                {empForm.role === 'admin' && (
                  <div className="col-span-2 bg-amber-500/10 border border-amber-500/30 p-3 rounded-xl flex items-start gap-3">
                    <span className="text-base">🔐</span>
                    <div>
                      <p className="text-xs font-bold text-amber-600 dark:text-amber-400">Autorización de Super Administrador Requerida</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        Al guardar, el sistema te solicitará la contraseña del <b>Super Administrador (C.I. 26710825)</b> para confirmar la creación o asignación de este Administrador.
                      </p>
                    </div>
                  </div>
                )}
                {empForm.role === 'employee' && (
                  <div className="col-span-2 bg-black/5 dark:bg-black/40 p-3.5 rounded-xl border border-black/10 dark:border-white/10 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-foreground">Acceso al Módulo de Asistencia</p>
                      <p className="text-[11px] text-muted-foreground">Permite a este entrenador acceder al lector QR y validar entradas.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={Boolean(empForm.canManageAttendance)} 
                        onChange={e => setEmpForm({...empForm, canManageAttendance: e.target.checked})} 
                        className="sr-only peer" 
                      />
                      <div className="w-11 h-6 bg-black/20 peer-focus:outline-none rounded-full peer dark:bg-white/10 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>
                )}
                <div className="col-span-2">
                    <h4 className="font-bold border-b border-black/10 dark:border-white/10 pb-2 mb-4 mt-2">Seguridad y Acceso</h4>
                  </div>
                  <div className="col-span-2 grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1 block">
                        Contraseña de Sesión {(empForm.id || empForm.existingAthleteFound) && <span className="text-xs text-muted-foreground font-normal">(Opcional: Dejar en blanco para mantener la actual)</span>}
                      </label>
                      <div className="relative">
                        <input required={!empForm.id && !empForm.existingAthleteFound} type={showPin ? "text" : "password"} value={empForm.clave} onChange={e => setEmpForm({...empForm, clave: e.target.value})} className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-lg p-2 text-sm focus:border-primary pr-10" />
                        <button type="button" onClick={() => setShowPin(!showPin)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                          {showPin ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1 block">Confirmar Contraseña</label>
                      <div className="relative">
                        <input required={!empForm.id && !empForm.existingAthleteFound} type={showPin ? "text" : "password"} value={empForm.confirmClave} onChange={e => setEmpForm({...empForm, confirmClave: e.target.value})} className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-lg p-2 text-sm focus:border-primary pr-10" />
                      </div>
                    </div>
                  </div>
                {isBarcodeRole(empForm.role) && empForm.pin && (
                   <div className="col-span-2 p-3.5 rounded-xl bg-warning/5 border border-warning/30">
                     <div className="flex items-center justify-between mb-1.5">
                       <label className="text-xs font-bold text-warning block">
                         Código de Barras / PIN Exclusivo de Caja (11 dígitos)
                       </label>
                       <button
                         type="button"
                         onClick={() => setEmpForm({ ...empForm, pin: generateNewPin() })}
                         className="text-[11px] font-bold text-primary hover:underline"
                       >
                         Regenerar Código
                       </button>
                     </div>
                     <p className="text-[11px] text-muted-foreground mb-2">
                       Exclusivo para Cajero, Gerente y Administrador en facturación/activación de planes. El cajero debe usar este código de barras/PIN (no la clave de su cuenta personal).
                     </p>
                     <div className="relative">
                       <input 
                         type={showPin ? "text" : "password"} 
                         value={empForm.pin} 
                         disabled 
                         className="w-full bg-black/5 dark:bg-black/40 border border-warning/50 rounded-lg p-2 text-sm font-mono font-bold pr-10" 
                       />
                       <button 
                         type="button" 
                         onClick={() => setShowPin(!showPin)} 
                         className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                       >
                         {showPin ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                       </button>
                     </div>
                     <div className="mt-3 flex justify-center bg-white p-4 rounded-lg">
                       <svg ref={barcodeCallbackRef}></svg>
                     </div>
                   </div>
                )}
                

              </div>
              <div className="flex gap-2 justify-end pt-4 border-t border-black/10 dark:border-white/10 mt-4">
                <button type="button" onClick={() => setShowEmployeeModal(false)} className="px-4 py-2 text-sm rounded-lg bg-black/10 dark:bg-white/10 hover:bg-white/20">Cancelar</button>
                <button type="submit" className="px-4 py-2 text-sm rounded-lg bg-transparent border border-success text-success font-bold hover:bg-success/10 transition">Guardar Empleado</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL INTERACTIVO EN VIVO: BUSCAR ATLETA EXISTENTE */}
      {showAthleteSearchModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-[#111520] border border-white/15 rounded-2xl max-w-md w-full p-5 shadow-2xl flex flex-col max-h-[85vh]">
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-white/10">
              <div>
                <h3 className="text-lg font-black text-foreground flex items-center gap-2">
                  <Search className="w-5 h-5 text-primary" /> Buscar Atleta Existente
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Escribe la cédula o el nombre del atleta para ver sus coincidencias en tiempo real y seleccionarlo:
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAthleteSearchModal(false)}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/10 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
              <input
                autoFocus
                type="text"
                value={athleteSearchQuery}
                onChange={e => setAthleteSearchQuery(e.target.value)}
                placeholder="Ej: 12345678 o nombre del atleta..."
                className="w-full bg-black/40 border-2 border-primary/50 focus:border-primary rounded-xl pl-10 pr-4 py-2.5 text-sm font-mono text-foreground placeholder:font-sans focus:outline-none transition"
              />
            </div>

            <div className="mt-3 flex-1 overflow-y-auto space-y-2 pr-1 max-h-80">
              {matchingAthletes.length === 0 ? (
                <div className="py-10 text-center text-muted-foreground text-xs border border-dashed border-white/10 rounded-xl">
                  No se encontró ningún atleta con &ldquo;{athleteSearchQuery}&rdquo;.
                </div>
              ) : (
                matchingAthletes.map(atleta => {
                  const photo = (atleta as any).profilePicture || atleta.avatar
                  return (
                    <button
                      key={atleta.id}
                      type="button"
                      onClick={() => selectExistingAthlete(atleta)}
                      className="w-full text-left p-3 rounded-xl border border-white/10 bg-white/5 hover:bg-primary/15 hover:border-primary/50 transition-all flex items-center gap-3 group"
                    >
                      {photo ? (
                        <img
                          src={photo}
                          alt={atleta.name}
                          className="w-12 h-12 rounded-full object-cover border-2 border-primary/40 group-hover:border-primary shrink-0 shadow-sm"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-primary/20 border-2 border-primary/40 group-hover:border-primary text-primary flex items-center justify-center font-black text-lg shrink-0">
                          {atleta.name?.charAt(0)?.toUpperCase() || 'A'}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-extrabold text-sm text-foreground group-hover:text-primary truncate transition-colors">
                          {atleta.name}
                        </p>
                        <p className="text-xs font-mono text-muted-foreground mt-0.5">
                          C.I. <span className="text-foreground font-bold">{atleta.cedula}</span>
                        </p>
                      </div>
                      <span className="px-2.5 py-1 rounded-lg bg-primary/20 group-hover:bg-primary text-primary group-hover:text-primary-foreground text-[11px] font-bold transition shrink-0 flex items-center gap-1">
                        <UserCheck className="w-3.5 h-3.5" /> Elegir
                      </span>
                    </button>
                  )
                })
              )}
            </div>

            <div className="pt-3 mt-3 border-t border-white/10 flex justify-end">
              <button
                type="button"
                onClick={() => setShowAthleteSearchModal(false)}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-bold text-foreground transition"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DEDICADO DE EDICIÓN DE PERMISOS */}
      {editingPermsEmp && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-card border border-black/10 dark:border-white/10 rounded-2xl max-w-xl w-full p-6 shadow-2xl glass flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-start border-b border-black/10 dark:border-white/10 pb-4 mb-4">
              <div>
                <h3 className="text-lg font-bold flex items-center gap-2 text-foreground">
                  <Shield className="h-5 w-5 text-primary" /> Permisos de Acceso
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Configurando permisos para <strong className="text-foreground">{editingPermsEmp.name}</strong> ({editingPermsEmp.role?.toUpperCase() || 'EMPLEADO'} • C.I. {editingPermsEmp.cedula})
                </p>
              </div>
              <button 
                type="button"
                onClick={() => setEditingPermsEmp(null)} 
                className="text-muted-foreground hover:text-foreground text-2xl leading-none p-1"
              >
                &times;
              </button>
            </div>

            <div className="flex items-center justify-between mb-3 px-1">
              <span className="text-xs font-semibold text-muted-foreground">
                <span className="text-primary font-bold">{tempPermissions.length}</span> de {AVAILABLE_PERMISSIONS.length} permisos habilitados
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setTempPermissions(AVAILABLE_PERMISSIONS.map(p => p.id))}
                  className="text-xs text-primary hover:underline font-bold"
                >
                  Marcar todos
                </button>
                <span className="text-muted-foreground text-xs">•</span>
                <button
                  type="button"
                  onClick={() => setTempPermissions([])}
                  className="text-xs text-destructive hover:underline font-bold"
                >
                  Desmarcar todos
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1 my-1">
              {AVAILABLE_PERMISSIONS.map(perm => {
                const isChecked = tempPermissions.includes(perm.id)
                return (
                  <label
                    key={perm.id}
                    className={`flex items-start gap-3 p-3 rounded-xl border transition cursor-pointer select-none ${
                      isChecked 
                        ? "bg-primary/10 border-primary/50 text-foreground" 
                        : "bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10 text-muted-foreground hover:border-black/20 dark:hover:border-white/20"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setTempPermissions(prev => [...prev, perm.id])
                        } else {
                          setTempPermissions(prev => prev.filter(p => p !== perm.id))
                        }
                      }}
                      className="accent-primary h-4 w-4 mt-0.5 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <span className={`text-xs font-bold block ${isChecked ? "text-primary" : "text-foreground"}`}>
                        {perm.label}
                      </span>
                      <span className="text-[11px] text-muted-foreground block leading-snug">
                        {perm.desc}
                      </span>
                    </div>
                  </label>
                )
              })}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-black/10 dark:border-white/10 mt-3">
              <button
                type="button"
                onClick={() => setEditingPermsEmp(null)}
                className="bg-transparent border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 px-4 py-2 rounded-xl text-xs font-bold transition text-foreground"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={isSavingPerms}
                onClick={async () => {
                  setIsSavingPerms(true)
                  try {
                    const { updateEmployeePermissionsAction } = await import('@/app/actions/users')
                    const res = await updateEmployeePermissionsAction(editingPermsEmp.id, tempPermissions)
                    if (res && res.success) {
                      showSweetToast(`Permisos de ${editingPermsEmp.name} actualizados exitosamente`, 'success')
                      setEmployees(prev => prev.map(e => e.id === editingPermsEmp.id ? { ...e, permissions: tempPermissions as any } : e))
                      setEditingPermsEmp(null)
                      if (getAllEmployees) {
                        const updated = await getAllEmployees()
                        setEmployees(updated)
                      }
                    } else {
                      showSweetToast(res?.error || 'Error al guardar permisos', 'error')
                    }
                  } catch (err: any) {
                    showSweetToast(err.message || 'Error al procesar la actualización', 'error')
                  } finally {
                    setIsSavingPerms(false)
                  }
                }}
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-primary/20 disabled:opacity-50"
              >
                {isSavingPerms ? 'Guardando...' : 'Guardar Permisos'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
