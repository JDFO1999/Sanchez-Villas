"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { useSettings } from "@/lib/settings-context"
import { financeService } from "@/lib/finance-service"
import { athleteService, AthleteProfile } from "@/lib/data-service"
import { Plus, Search, Eye, EyeOff } from "lucide-react"
import Swal from "sweetalert2"
import Barcode from "react-barcode"
import JsBarcode from "jsbarcode"

export default function EmpleadosPage() {
  const { user, getAllEmployees, addEmployee, updateEmployee } = useAuth()
  const { settings } = useSettings()
  const [employees, setEmployees] = useState<any[]>([])
  const [athletes, setAthletes] = useState<AthleteProfile[]>([])
  const [showEmployeeModal, setShowEmployeeModal] = useState(false)
  const [showPin, setShowPin] = useState(false)
  
  const [empForm, setEmpForm] = useState<any>({
    id: '', name: '', cedula: '', email: '', role: 'employee', clave: '', confirmClave: '', pin: '',
    birthDate: '', profession: '', courses: '', specialty: '', bankAccount: '', mobilePayment: '', avatar: '',
    baseSalary: 0, commissionRate: 0, commissionType: 'flat'
  })

  useEffect(() => {
    async function load() {
      if (getAllEmployees) setEmployees(await getAllEmployees())
      // athleteService will also be updated later
      setAthletes(athleteService.getAthletes())
    }
    load()
  }, [getAllEmployees])

  if (!user || user.role !== 'admin') {
    return <div className="p-8 text-center text-red-500 font-bold">Acceso Denegado. Solo administradores.</div>
  }

  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!addEmployee || !updateEmployee || !empForm.name || !empForm.cedula) return
    
    if (!empForm.id && empForm.clave !== empForm.confirmClave) {
      Swal.fire('Error', 'Las contraseñas no coinciden.', 'error')
      return
    }

    let currentPin = empForm.pin
    let generatedNewPin = false
    if (empForm.role === 'cajero' && !currentPin) {
      currentPin = Math.floor(10000000000 + Math.random() * 90000000000).toString().slice(0, 11)
      generatedNewPin = true
    }

    const payload = { ...empForm, pin: currentPin }

    if (empForm.id) {
      await updateEmployee(empForm.id, payload)
      Swal.fire('Actualizado', 'Datos guardados con éxito', 'success')
    } else {
      await addEmployee(payload, empForm.clave)
      if (generatedNewPin) {
        Swal.fire({
          title: '¡Empleado Creado!',
          html: `Se creó el cajero exitosamente.<br><br>Su PIN de acceso para facturar es: <b>${currentPin}</b><br><br><div class="flex justify-center mt-4"><svg id="swal-barcode"></svg></div>`,
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
        Swal.fire('¡Empleado Creado!', 'Registrado correctamente', 'success')
      }
    }
    setShowEmployeeModal(false)
    if (getAllEmployees) setEmployees(await getAllEmployees())
  }
  
  const buscarAtleta = async () => {
    const { value: cedulaStr } = await Swal.fire({
      title: 'Buscar Atleta Existente',
      input: 'text',
      inputLabel: 'Ingrese la cédula del atleta:',
      inputPlaceholder: 'Ej: 12345678',
      showCancelButton: true,
      confirmButtonText: 'Buscar',
      cancelButtonText: 'Cancelar'
    })

    if (!cedulaStr) return;
    const atleta = athletes.find(a => a.cedula === cedulaStr);
    if (atleta) {
      setEmpForm({
        ...empForm,
        name: atleta.name,
        cedula: atleta.cedula,
        email: atleta.email || `${atleta.cedula}@atleta.com`,
      });
      Swal.fire('¡Encontrado!', `Atleta ${atleta.name} encontrado y precargado.`, 'success');
    } else {
      Swal.fire('No Encontrado', 'No se encontró ningún atleta con esa cédula.', 'error');
    }
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-20 relative">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-black tracking-tighter bg-gradient-to-r from-primary dark:dark:via-white via-black via-black to-primary/50 bg-clip-text text-transparent mb-2">Empleados y Comisiones</h1>
          <p className="text-muted-foreground">Gestión de personal, roles, y configuración de comisiones.</p>
        </div>
        <button onClick={() => { setEmpForm({ id: '', name: '', cedula: '', email: '', role: 'employee', clave: '', confirmClave: '', birthDate: '', profession: '', courses: '', specialty: '', bankAccount: '', mobilePayment: '', avatar: '', baseSalary: 0, commissionRate: 0, commissionType: 'flat' }); setShowEmployeeModal(true); }} className="bg-green-500 text-white px-3 py-1.5 rounded-lg font-bold hover:bg-green-600 transition flex items-center gap-2">
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
              {employees.filter(e => e.role !== 'admin' && e.role !== 'deleted').map(emp => {
                const assignedAthletes = athletes.filter(a => a.coachId === emp.id)
                const baseSalary = emp.baseSalary || 0
                const commissionRate = emp.commissionRate || 0

                return (
                  <tr key={emp.id} className="transition-colors hover:bg-black/5 dark:hover:bg-white/5">
                    <td className="p-4">
                      <div className="font-bold">{emp.name}</div>
                      <div className="text-xs text-muted-foreground">C.C. {emp.cedula} | {emp.role.toUpperCase()}</div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm">{emp.email || 'Sin correo'}</div>
                      <div className="text-xs text-muted-foreground">{emp.phone || 'Sin teléfono'}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-primary">{assignedAthletes.length} atletas</div>
                    </td>

                    <td className="p-4 text-right flex justify-end gap-2">
                      <button onClick={() => { setEmpForm({ birthDate: '', profession: '', courses: '', specialty: '', bankAccount: '', mobilePayment: '', avatar: '', baseSalary: 0, commissionRate: 0, commissionType: 'flat', ...emp, pin: emp.accessPin || '', clave: '', confirmClave: '' }); setShowEmployeeModal(true); }} className="px-3 py-1.5 bg-black/10 dark:bg-white/10 text-foreground text-xs font-bold rounded hover:bg-black/20 transition">
                        Editar
                      </button>
                      <button onClick={async () => { 
                        if(confirm(`¿Estás seguro de eliminar (soft delete) a ${emp.name}?`)) {
                          if (updateEmployee) {
                            await updateEmployee(emp.id, { role: 'deleted' })
                            if (getAllEmployees) setEmployees(await getAllEmployees())
                          }
                        }
                      }} className="px-3 py-1.5 bg-red-500/10 text-red-500 hover:bg-red-500/20 text-xs font-bold rounded transition">
                        Eliminar
                      </button>
                    </td>
                  </tr>
                )
              })}
              {employees.filter(e => e.role !== 'admin' && e.role !== 'deleted').length === 0 && (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-muted-foreground">No hay entrenadores o empleados registrados.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showEmployeeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm overflow-y-auto">
          <div className="bg-card border border-black/10 dark:border-white/10 rounded-2xl max-w-2xl w-full p-6 shadow-2xl glass relative my-8">
            <h3 className="text-xl font-bold mb-4">{empForm.id ? 'Editar Empleado' : 'Registrar Empleado'}</h3>
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
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Rol de Sistema</label>
                  <select required value={empForm.role} onChange={e => setEmpForm({...empForm, role: e.target.value})} className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-lg p-2 text-sm focus:border-primary">
                    <option value="employee">Entrenador (Coach)</option>
                    <option value="cajero">Cajero / Recepción</option>
                  </select>
                </div>
                {!empForm.id && (
                  <>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1 block">Contraseña de Sesión</label>
                      <div className="relative">
                        <input required type={showPin ? "text" : "password"} value={empForm.clave} onChange={e => setEmpForm({...empForm, clave: e.target.value})} className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-lg p-2 text-sm focus:border-primary pr-10" />
                        <button type="button" onClick={() => setShowPin(!showPin)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                          {showPin ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1 block">Confirmar Contraseña</label>
                      <div className="relative">
                        <input required type={showPin ? "text" : "password"} value={empForm.confirmClave} onChange={e => setEmpForm({...empForm, confirmClave: e.target.value})} className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-lg p-2 text-sm focus:border-primary pr-10" />
                      </div>
                    </div>
                  </>
                )}
                {empForm.role === 'cajero' && empForm.id && empForm.pin && (
                   <div className="col-span-2">
                     <label className="text-xs font-bold text-orange-500 mb-1 block">Código de Barras / PIN de POS (11 dígitos)</label>
                     <div className="relative">
                       <input 
                         type={showPin ? "text" : "password"} 
                         value={empForm.pin} 
                         disabled 
                         className="w-full bg-black/5 dark:bg-black/40 border border-orange-500/50 rounded-lg p-2 text-sm pr-10" 
                       />
                       <button 
                         type="button" 
                         onClick={() => setShowPin(!showPin)} 
                         className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                       >
                         {showPin ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                       </button>
                     </div>
                     <div className="mt-4 flex justify-center bg-white p-4 rounded-lg">
                       <Barcode value={empForm.pin} format="CODE128" width={2} height={50} />
                     </div>
                   </div>
                )}
                

              </div>
              <div className="flex gap-2 justify-end pt-4 border-t border-black/10 dark:border-white/10 mt-4">
                <button type="button" onClick={() => setShowEmployeeModal(false)} className="px-4 py-2 text-sm rounded-lg bg-black/10 dark:bg-white/10 hover:bg-white/20">Cancelar</button>
                <button type="submit" className="px-4 py-2 text-sm rounded-lg bg-green-500 text-white font-bold hover:bg-green-600">Guardar Empleado</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
