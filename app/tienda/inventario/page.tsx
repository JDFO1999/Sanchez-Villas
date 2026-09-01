"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { useSettings } from "@/lib/settings-context"
import { storeService, Product } from "@/lib/store-service"
import { StoreNav } from "@/components/store/StoreNav"
import { Card, CardContent } from "@/components/ui/card"
import { PackagePlus, Search, Edit, Trash2, AlertTriangle, Plus } from "lucide-react"
import { useToast } from "@/lib/toast-context"

export default function InventarioPage() {
  const { user } = useAuth()
  const { settings } = useSettings()
  const [products, setProducts] = useState<Product[]>([])
  const [search, setSearch] = useState("")

  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  
  // Form state
  const [barcode, setBarcode] = useState("")
  const [name, setName] = useState("")
  const [department, setDepartment] = useState("")
  const [category, setCategory] = useState("")
  const [costPrice, setCostPrice] = useState(0)
  const [sellPrice, setSellPrice] = useState(0)
  const [currentStock, setCurrentStock] = useState(0)
  const { showToast } = useToast()
  
  // Custom Modals for Dept / Cat
  const [showDeptModal, setShowDeptModal] = useState(false)
  const [showCatModal, setShowCatModal] = useState(false)
  const [newItemName, setNewItemName] = useState("")

  const [minStockAlert, setMinStockAlert] = useState(5)
  const [imageUrl, setImageUrl] = useState("")

  const [allDepts, setAllDepts] = useState<string[]>([])
  const [allCats, setAllCats] = useState<string[]>([])

  useEffect(() => {
    setProducts(storeService.getProducts())
    setAllDepts(storeService.getDepartments())
    setAllCats(storeService.getCategories())
  }, [])

  if (!user || (user.role !== 'admin' && !user.permissions?.includes('INVENTORY_MANAGE'))) {
    return <div className="p-8 text-center text-red-500 font-bold">Acceso Denegado. Solo personal autorizado.</div>
  }

  const filtered = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.barcode.includes(search) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  )

  const openModal = (p?: Product) => {
    if (p) {
      setEditingId(p.id)
      setBarcode(p.barcode)
      setName(p.name)
      setDepartment(p.department)
      setCategory(p.category)
      setCostPrice(p.costPrice)
      setSellPrice(p.sellPrice)
      setCurrentStock(p.currentStock)
      setMinStockAlert(p.minStockAlert)
      setImageUrl(p.imageUrl || "")
    } else {
      setEditingId(null)
      setBarcode("")
      setName("")
      setDepartment("Nutrición")
      setCategory("General")
      setCostPrice(0)
      setSellPrice(0)
      setCurrentStock(0)
      setMinStockAlert(5)
      setImageUrl("")
    }
    setShowModal(true)
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => setImageUrl(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    const product: Product = {
      id: editingId || Date.now().toString(),
      barcode,
      name,
      department,
      category,
      costPrice,
      sellPrice,
      currentStock,
      minStockAlert,
      imageUrl
    }
    storeService.updateProduct(product)
    setProducts(storeService.getProducts())
    setShowModal(false)
    showToast(`Producto ${editingId ? 'actualizado' : 'creado'} correctamente.`, "success")
  }

  const handleDelete = (id: string) => {
    if (confirm("¿Seguro que deseas eliminar este producto?")) {
      storeService.deleteProduct(id)
      setProducts(storeService.getProducts())
      showToast("Producto eliminado.", "warning")
    }
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto relative">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
        <div>
          <h1 className="text-4xl font-black tracking-tighter bg-gradient-to-r from-primary dark:dark:via-white via-black via-black to-primary/50 bg-clip-text text-transparent dark:dark:drop-shadow-[0_0_15px_rgba(255,255,255,0.1)] drop-shadow-sm drop-shadow-sm mb-4">Inventario de Tienda</h1>
        </div>
      </div>
      <StoreNav />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Buscar por código de barras, nombre..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors"
          />
        </div>
        <button 
          onClick={() => openModal()}
          className="bg-primary text-primary-foreground font-bold py-2.5 px-4 rounded-lg hover:bg-primary/90 transition shadow-lg shadow-primary/20 flex items-center gap-2 text-sm"
        >
          <PackagePlus className="h-4 w-4" /> Nuevo Producto
        </button>
      </div>

      <div className="bg-card border border-black/10 dark:border-white/10 rounded-xl overflow-hidden glass">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-black/5 dark:bg-black/40 border-b border-black/10 dark:border-white/10 text-muted-foreground">
              <tr>
                <th className="p-4 font-medium">Código / Producto</th>
                <th className="p-4 font-medium">Categoría</th>
                <th className="p-4 font-medium">Costo</th>
                <th className="p-4 font-medium">Precio</th>
                <th className="p-4 font-medium">Margen</th>
                <th className="p-4 font-medium">Stock</th>
                <th className="p-4 font-medium text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map(p => {
                const isLowStock = p.currentStock <= p.minStockAlert
                const margin = p.sellPrice - p.costPrice
                const marginPercent = p.costPrice > 0 ? ((margin / p.costPrice) * 100).toFixed(0) : '100'

                return (
                  <tr key={p.id} className="hover:bg-black/5 dark:bg-white/5 transition-colors">
                    <td className="p-4 flex items-center gap-3">
                      {p.imageUrl ? (
                        <div className="h-8 w-8 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded overflow-hidden shrink-0">
                          <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="h-8 w-8 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded flex items-center justify-center shrink-0">
                          <PackagePlus className="h-4 w-4 text-muted-foreground" />
                        </div>
                      )}
                      <div>
                        <div className="font-bold">{p.name}</div>
                        <div className="text-xs text-muted-foreground">{p.barcode}</div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-xs bg-black/10 dark:bg-white/10 inline-block px-2 py-0.5 rounded text-foreground">{p.category}</div>
                      <div className="text-[10px] text-muted-foreground mt-1">{p.department}</div>
                    </td>
                    <td className="p-4">
                      {settings.storeCurrency}{p.costPrice.toFixed(2)}
                      {settings.storeCurrencySecondary && settings.storeExchangeRate > 0 && <div className="text-[10px] text-muted-foreground">{settings.storeCurrencySecondary}{(p.costPrice * settings.storeExchangeRate).toFixed(2)}</div>}
                    </td>
                    <td className="p-4 font-bold text-green-500">
                      {settings.storeCurrency}{p.sellPrice.toFixed(2)}
                      {settings.storeCurrencySecondary && settings.storeExchangeRate > 0 && <div className="text-[10px] text-muted-foreground font-normal">{settings.storeCurrencySecondary}{(p.sellPrice * settings.storeExchangeRate).toFixed(2)}</div>}
                    </td>
                    <td className="p-4 text-xs text-muted-foreground">
                      {settings.storeCurrency}{margin.toFixed(2)} ({marginPercent}%)
                      {settings.storeCurrencySecondary && settings.storeExchangeRate > 0 && <div className="text-[10px] text-muted-foreground/50">{settings.storeCurrencySecondary}{(margin * settings.storeExchangeRate).toFixed(2)}</div>}
                    </td>
                    <td className="p-4">
                      <div className={`flex items-center gap-2 font-bold ${isLowStock ? 'text-red-500' : 'text-foreground'}`}>
                        {p.currentStock}
                        {isLowStock && <AlertTriangle className="h-4 w-4" />}
                      </div>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button onClick={() => openModal(p)} className="p-2 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:bg-white/10 rounded transition text-blue-400">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleDelete(p.id)} className="p-2 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:bg-white/10 rounded transition text-red-400">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                )
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-muted-foreground">No hay productos.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-card border border-black/10 dark:border-white/10 rounded-xl max-w-md w-full p-6 shadow-2xl glass overflow-y-auto max-h-[90vh]">
            <h3 className="text-xl font-bold mb-4">{editingId ? 'Editar Producto' : 'Nuevo Producto'}</h3>
            <form onSubmit={handleSave} className="space-y-4">
              
              <div>
                <label className="text-xs font-medium mb-1 block">Código de Barras (Escanea o Escribe)</label>
                <input required type="text" value={barcode} onChange={e=>setBarcode(e.target.value)} className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded p-2 text-sm focus:border-primary" />
              </div>
              
              <div>
                <label className="text-xs font-medium mb-1 block">Nombre del Producto</label>
                <input required type="text" value={name} onChange={e=>setName(e.target.value)} className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded p-2 text-sm focus:border-primary" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium mb-1 flex items-center justify-between">
                    Departamento
                    <button type="button" onClick={() => { setShowDeptModal(true); setNewItemName(""); }} className="text-primary hover:underline text-[10px] font-bold">+ Nuevo</button>
                  </label>
                  <select required value={department} onChange={e=>setDepartment(e.target.value)} className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded p-2 text-sm focus:border-primary">
                    <option value="">Seleccione...</option>
                    {allDepts.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium mb-1 flex items-center justify-between">
                    Categoría
                    <button type="button" onClick={() => { setShowCatModal(true); setNewItemName(""); }} className="text-primary hover:underline text-[10px] font-bold">+ Nueva</button>
                  </label>
                  <select required value={category} onChange={e=>setCategory(e.target.value)} className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded p-2 text-sm focus:border-primary">
                    <option value="">Seleccione...</option>
                    {allCats.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium mb-1 block">Costo de Compra</label>
                  <input required type="number" step="0.01" value={costPrice} onChange={e=>setCostPrice(Number(e.target.value))} className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded p-2 text-sm focus:border-primary" />
                </div>
                <div>
                  <label className="text-xs font-medium mb-1 block">Precio de Venta</label>
                  <input required type="number" step="0.01" value={sellPrice} onChange={e=>setSellPrice(Number(e.target.value))} className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded p-2 text-sm focus:border-primary" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium mb-1 block">Stock Actual</label>
                  <input required type="number" value={currentStock} onChange={e=>setCurrentStock(Number(e.target.value))} className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded p-2 text-sm focus:border-primary" />
                </div>
                <div>
                  <label className="text-xs font-medium mb-1 block">Alerta Stock Mínimo</label>
                  <input required type="number" value={minStockAlert} onChange={e=>setMinStockAlert(Number(e.target.value))} className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded p-2 text-sm focus:border-primary" />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium mb-1 block">Imagen del Producto (Opcional)</label>
                <div className="flex items-center gap-4 mt-2">
                  <div className="h-16 w-16 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-lg flex items-center justify-center p-1 shrink-0 overflow-hidden">
                    {imageUrl ? (
                      <img src={imageUrl} alt="Preview" className="max-h-full max-w-full object-contain" />
                    ) : (
                      <span className="text-[10px] text-muted-foreground text-center leading-tight">Sin Foto</span>
                    )}
                  </div>
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="w-full text-xs text-muted-foreground file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-primary/20 file:text-primary hover:file:bg-primary/30 cursor-pointer" 
                  />
                  {imageUrl && <button type="button" onClick={()=>setImageUrl("")} className="text-xs text-red-500 hover:underline shrink-0">Quitar</button>}
                </div>
              </div>
              
              <div className="flex gap-3 justify-end pt-4">
                <button type="button" onClick={()=>setShowModal(false)} className="px-4 py-2 text-sm bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:bg-white/10 rounded transition">Cancelar</button>
                <button type="submit" className="px-4 py-2 text-sm bg-primary text-primary-foreground font-bold rounded hover:bg-primary/90 transition">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Mini Modal Departamento */}
      {showDeptModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="bg-card border border-black/10 dark:border-white/10 rounded-xl p-6 shadow-2xl glass max-w-sm w-full">
            <h3 className="font-bold mb-4">Nuevo Departamento</h3>
            <input 
              autoFocus
              type="text" 
              value={newItemName}
              onChange={e => setNewItemName(e.target.value)}
              placeholder="Nombre..."
              className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded p-2 text-sm focus:border-primary mb-4"
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowDeptModal(false)} className="px-3 py-1.5 text-sm bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:bg-white/10 rounded">Cancelar</button>
              <button onClick={() => {
                if (newItemName.trim()) {
                  storeService.addDepartment(newItemName.trim());
                  setAllDepts(storeService.getDepartments());
                  setDepartment(newItemName.trim());
                  setShowDeptModal(false);
                  showToast("Departamento creado.", "success");
                }
              }} className="px-3 py-1.5 text-sm bg-primary text-primary-foreground font-bold rounded">Guardar</button>
            </div>
          </div>
        </div>
      )}

      {/* Mini Modal Categoría */}
      {showCatModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="bg-card border border-black/10 dark:border-white/10 rounded-xl p-6 shadow-2xl glass max-w-sm w-full">
            <h3 className="font-bold mb-4">Nueva Categoría</h3>
            <input 
              autoFocus
              type="text" 
              value={newItemName}
              onChange={e => setNewItemName(e.target.value)}
              placeholder="Nombre..."
              className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded p-2 text-sm focus:border-primary mb-4"
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowCatModal(false)} className="px-3 py-1.5 text-sm bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:bg-white/10 rounded">Cancelar</button>
              <button onClick={() => {
                if (newItemName.trim()) {
                  storeService.addCategory(newItemName.trim());
                  setAllCats(storeService.getCategories());
                  setCategory(newItemName.trim());
                  setShowCatModal(false);
                  showToast("Categoría creada.", "success");
                }
              }} className="px-3 py-1.5 text-sm bg-primary text-primary-foreground font-bold rounded">Guardar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
