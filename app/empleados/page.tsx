"use client"

import { useState, useEffect, useCallback } from "react"
import { useAuth } from "@/lib/auth-context"
import { useSettings } from "@/lib/settings-context"
import { financeService } from "@/lib/finance-service"
import { athleteService, AthleteProfile } from "@/lib/data-service"
import { Plus, Search, Eye, EyeOff } from "lucide-react"
import Swal from "sweetalert2"
import JsBarcode from "jsbarcode"
import { confirmAction } from "@/lib/confirm"

export default function EmpleadosPage() {
  const { user, getAllEmployees, addEmployee, updateEmployee } = useAuth()
  const { settings } = useSettings()
  const [employees, setEmployees] = useState<any[]>([])
  const [athletes, setAthletes] = useState<AthleteProfile[]>([])
  const [showEmployeeModal, setShowEmployeeModal] = useState(false)
  const [showPin, setShowPin] = useState(false)
  
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

  if (!user || user.role !== 'admin') {
    return <div className="p-8 text-center text-destructive font-bold">Acceso Denegado. Solo administradores.</div>
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
  
  const buscarAtleta = async () => {
    const { swalTheme, themeColor } = await import('@/lib/confirm')
    const theme = swalTheme()

    const { value: cedulaStr } = await Swal.fire({
      title: 'Buscar Atleta Existente',
      html: `
        <div style="text-align: left; padding: 0 4px;">
          <p style="font-size: 0.875rem; margin-bottom: 8px; opacity: 0.85;">
            Ingresa la cédula del atleta para ascenderlo a Administrador, Gerente, Cajero o Entrenador:
          </p>
        </div>
      `,
      input: 'text',
      inputPlaceholder: 'Ej: 12345678',
      showCancelButton: true,
      confirmButtonText: 'Buscar Atleta',
      cancelButtonText: 'Cancelar',
      reverseButtons: true,
      ...theme,
      confirmButtonColor: themeColor('primary') || '#eab308',
      cancelButtonColor: 'rgba(150, 150, 150, 0.4)',
      customClass: {
        popup: 'border border-black/10 dark:border-white/10 rounded-2xl shadow-2xl glass',
        title: 'font-black text-xl tracking-tight text-foreground',
        input: 'bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-xl p-3 text-base text-foreground font-mono focus:border-primary',
        confirmButton: 'font-bold rounded-xl px-5 py-2.5 shadow-md',
        cancelButton: 'font-bold rounded-xl px-4 py-2.5'
      }
    })

    if (!cedulaStr) return;
    const atleta = athletes.find(a => a.cedula === cedulaStr.trim());
    if (atleta) {
      setEmpForm({
        ...empForm,
        name: atleta.name,
        cedula: atleta.cedula,
        phone: atleta.phone || empForm.phone || '',
        email: (atleta as any).email || `${atleta.cedula}@atleta.com`,
        existingAthleteFound: true,
      });

      const avatarHtml = (atleta as any).profilePicture || atleta.avatar
        ? `<img src="${(atleta as any).profilePicture || atleta.avatar}" alt="${atleta.name}" style="width:64px;height:64px;border-radius:9999px;object-fit:cover;margin:0 auto 10px auto;border:2px solid ${themeColor('primary') || '#eab308'};" />`
        : `<div style="width:56px;height:56px;border-radius:9999px;margin:0 auto 10px auto;background:rgba(234,179,8,0.15);color:${themeColor('primary') || '#eab308'};display:flex;align-items:center;justify-content:center;font-size:24px;font-weight:900;border:2px solid ${themeColor('primary') || '#eab308'};">${atleta.name.charAt(0)}</div>`

      Swal.fire({
        title: '¡Atleta Encontrado!',
        html: `
          ${avatarHtml}
          <p style="font-size:1.15rem;font-weight:800;margin-bottom:4px;">${atleta.name}</p>
          <p style="font-size:0.875rem;opacity:0.75;margin-bottom:12px;">C.I. ${atleta.cedula}</p>
          <p style="font-size:0.85rem;background:rgba(234,179,8,0.1);border:1px solid rgba(234,179,8,0.25);border-radius:10px;padding:8px 12px;color:${themeColor('primary') || '#eab308'};font-weight:600;">
            Datos precargados. Puedes seleccionar su nuevo rol de personal y dejar la contraseña en blanco para que conserve la suya actual.
          </p>
        `,
        icon: 'success',
        confirmButtonText: 'Continuar',
        ...theme,
        confirmButtonColor: themeColor('primary') || '#eab308',
        customClass: {
          popup: 'border border-black/10 dark:border-white/10 rounded-2xl shadow-2xl glass',
          title: 'font-black text-xl text-foreground',
          confirmButton: 'font-bold rounded-xl px-6 py-2.5'
        }
      });
    } else {
      Swal.fire({
        title: 'No Encontrado',
        text: `No se encontró ningún atleta registrado con la cédula "${cedulaStr.trim()}".`,
        icon: 'error',
        confirmButtonText: 'Entendido',
        ...theme,
        confirmButtonColor: themeColor('destructive') || '#ef4444',
        customClass: {
          popup: 'border border-destructive/30 rounded-2xl shadow-2xl glass',
          title: 'font-black text-xl text-destructive',
          confirmButton: 'font-bold rounded-xl px-5 py-2.5'
        }
      });
    }
  }

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
                <div className="flex gap-2 mb-2">
                   <button type="button" onClick={buscarAtleta} className="bg-primary/20 text-primary px-3 py-1.5 rounded-lg text-sm font-bold flex items-center gap-2">
                     <Search className="h-4 w-4" /> Buscar Atleta Existente
                   </button>
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
    </div>
  )
}
