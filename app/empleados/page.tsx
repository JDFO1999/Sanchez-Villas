"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { useSettings } from "@/lib/settings-context"
import { financeService } from "@/lib/finance-service"
import { athleteService, AthleteProfile } from "@/lib/data-service"
import { Plus, Search } from "lucide-react"

export default function EmpleadosPage() {
  const { user, getAllEmployees, addEmployee, updateEmployee } = useAuth()
  const { settings } = useSettings()
  const [employees, setEmployees] = useState<any[]>([])
  const [athletes, setAthletes] = useState<AthleteProfile[]>([])
  const [showEmployeeModal, setShowEmployeeModal] = useState(false)
  
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
      alert("Las contraseñas no coinciden.")
      return
    }

    if (empForm.id) {
      await updateEmployee(empForm.id, empForm)
    } else {
      await addEmployee(empForm, empForm.clave)
    }
    setShowEmployeeModal(false)
    if (getAllEmployees) setEmployees(await getAllEmployees())
  }
  
  const handlePayEmployee = async (emp: any, totalPay: number) => {
    if (confirm(`¿Proceder a pagar la nómina de ${settings.storeCurrency} ${totalPay.toFixed(2)} a ${emp.name}?`)) {
      financeService.addExpense({
        description: `Nómina: ${emp.name}`,
        amount: totalPay,
        category: 'Nómina'
      })
      if (updateEmployee) {
        await updateEmployee(emp.id, { ...emp, lastPaidDate: new Date().toISOString() })
      }
      if (getAllEmployees) setEmployees(await getAllEmployees())
    }
  }

  const buscarAtleta = () => {
    const cedulaStr = prompt("Ingrese la cédula del atleta a buscar:");
    if (!cedulaStr) return;
    const atleta = athletes.find(a => a.cedula === cedulaStr);
    if (atleta) {
      setEmpForm({
        ...empForm,
        name: atleta.name,
        cedula: atleta.cedula,
        email: atleta.email || `${atleta.cedula}@atleta.com`,
      });
      alert(`Atleta ${atleta.name} encontrado y precargado.`);
    } else {
      alert("No se encontró ningún atleta con esa cédula.");
    }
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-20 relative">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-black tracking-tighter bg-gradient-to-r from-primary dark:dark:via-white via-black via-black to-primary/50 bg-clip-text text-transparent mb-2">Empleados y Nómina</h1>
          <p className="text-muted-foreground">Gestión de personal, roles, salarios base y pago de comisiones.</p>
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
                <th className="p-4 font-medium">Atletas Asignados</th>
                <th className="p-4 font-medium">Sueldo + Comisiones</th>
                <th className="p-4 font-medium text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {employees.filter(e => e.role !== 'admin').map(emp => {
                const assignedAthletes = athletes.filter(a => a.coachId === emp.id)
                const baseSalary = emp.baseSalary || 0
                const commissionRate = emp.commissionRate || 0
                const commissionType = emp.commissionType || 'flat'
                
                const avgMembership = 30
                const totalRevenueFromMembership = assignedAthletes.length * avgMembership
                let commission = 0
                if (settings.coachCustomPricing) {
                  const coachTotalGross = assignedAthletes.length * commissionRate
                  const gymCut = coachTotalGross * ((settings.gymCommissionPercentage || 30) / 100)
                  commission = coachTotalGross - gymCut
                } else {
                  commission = commissionType === 'percentage' 
                    ? totalRevenueFromMembership * (commissionRate / 100) 
                    : assignedAthletes.length * commissionRate
                }
                  
                const totalPay = baseSalary + commission
                const currentMonth = new Date().toISOString().substring(0, 7)
                const isPaidThisMonth = emp.lastPaidDate && emp.lastPaidDate.startsWith(currentMonth)

                return (
                  <tr key={emp.id} className={`transition-colors ${isPaidThisMonth ? 'bg-green-500/5' : 'hover:bg-black/5 dark:hover:bg-white/5'}`}>
                    <td className="p-4">
                      <div className="font-bold flex items-center gap-2">
                        {emp.name}
                        {isPaidThisMonth && <span className="bg-green-500 text-white text-[10px] px-1.5 py-0.5 rounded-full uppercase">Pagado</span>}
                      </div>
                      <div className="text-xs text-muted-foreground">{emp.cedula} | {emp.role}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-bold">{assignedAthletes.length} atletas</div>
                    </td>
                    <td className="p-4">
                      <div className="text-xs text-muted-foreground">Base: {settings.storeCurrency} {baseSalary} + Com: {settings.storeCurrency} {commission.toFixed(2)}</div>
                      <div className="font-black text-primary">{settings.storeCurrency} {totalPay.toFixed(2)}</div>
                    </td>
                    <td className="p-4 text-right flex justify-end gap-2">
                      <button onClick={() => { setEmpForm({ birthDate: '', profession: '', courses: '', specialty: '', bankAccount: '', mobilePayment: '', avatar: '', baseSalary: 0, commissionRate: 0, commissionType: 'flat', ...emp, clave: '', confirmClave: '' }); setShowEmployeeModal(true); }} className="px-3 py-1.5 bg-black/10 dark:bg-white/10 text-foreground text-xs font-bold rounded hover:bg-black/20 transition">
                        Editar
                      </button>
                      {!isPaidThisMonth ? (
                        <button onClick={() => handlePayEmployee(emp, totalPay)} className="px-3 py-1.5 bg-green-500 text-white text-xs font-bold rounded hover:bg-green-600 transition shadow-lg shadow-green-500/20">
                          Pagar
                        </button>
                      ) : (
                        <button disabled className="px-3 py-1.5 bg-green-500/20 text-green-500 text-xs font-bold rounded cursor-not-allowed">
                          Listo
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
              {employees.filter(e => e.role !== 'admin').length === 0 && (
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
              <div className="flex gap-2 mb-2">
                 <button type="button" onClick={buscarAtleta} className="bg-primary/20 text-primary px-3 py-1.5 rounded-lg text-sm font-bold flex items-center gap-2">
                   <Search className="h-4 w-4" /> Buscar Atleta Existente
                 </button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Nombre Completo</label>
                  <input required type="text" value={empForm.name} onChange={e => setEmpForm({...empForm, name: e.target.value})} className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-lg p-2 text-sm focus:border-primary" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Cédula</label>
                  <input required type="text" value={empForm.cedula} onChange={e => setEmpForm({...empForm, cedula: e.target.value})} disabled={!!empForm.id} className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-lg p-2 text-sm focus:border-primary" />
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
                      <input required type="password" value={empForm.clave} onChange={e => setEmpForm({...empForm, clave: e.target.value})} className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-lg p-2 text-sm focus:border-primary" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1 block">Confirmar Contraseña</label>
                      <input required type="password" value={empForm.confirmClave} onChange={e => setEmpForm({...empForm, confirmClave: e.target.value})} className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-lg p-2 text-sm focus:border-primary" />
                    </div>
                  </>
                )}
                {empForm.id && empForm.pin && (
                   <div className="col-span-2">
                     <label className="text-xs font-bold text-orange-500 mb-1 block">PIN Generado de POS (Solo lectura)</label>
                     <input type="text" value={empForm.pin} disabled className="w-full bg-black/5 dark:bg-black/40 border border-orange-500/50 rounded-lg p-2 text-sm" />
                   </div>
                )}
                <div className="col-span-2 border-t border-black/10 dark:border-white/10 pt-4 mt-2">
                  <h4 className="font-bold text-primary mb-3">Información Salarial y Comisiones</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1 block">Sueldo Base Mensual ({settings.storeCurrency})</label>
                      <input type="number" step="0.01" min="0" value={empForm.baseSalary} onChange={e => setEmpForm({...empForm, baseSalary: Number(e.target.value)})} className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-lg p-2 text-sm focus:border-primary" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1 block">Comisión por Atleta (Monto o %)</label>
                      <input type="number" step="0.01" min="0" value={empForm.commissionRate} onChange={e => setEmpForm({...empForm, commissionRate: Number(e.target.value)})} className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-lg p-2 text-sm focus:border-primary" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1 block">Tipo de Comisión</label>
                      <select value={empForm.commissionType} onChange={e => setEmpForm({...empForm, commissionType: e.target.value})} className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-lg p-2 text-sm focus:border-primary">
                        <option value="flat">Monto Fijo ({settings.storeCurrency})</option>
                        <option value="percentage">Porcentaje (%) del Plan</option>
                      </select>
                    </div>
                  </div>
                </div>
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
