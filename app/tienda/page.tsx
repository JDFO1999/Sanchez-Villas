"use client"

import { useState, useEffect, useRef } from "react"
import { useAuth } from "@/lib/auth-context"
import { useSettings } from "@/lib/settings-context"
import { storeService, Product, TransactionItem, Transaction } from "@/lib/store-service"
import { athleteService, AthleteProfile } from "@/lib/data-service"
import { StoreNav } from "@/components/store/StoreNav"
import { Card, CardContent } from "@/components/ui/card"
import { Search, ShoppingCart, Plus, Minus, Trash2, CheckCircle2, User, ReceiptText, UserPlus } from "lucide-react"
import { useToast } from "@/lib/toast-context"

export default function TiendaPOSPage() {
  const { user } = useAuth()
  const { settings } = useSettings()
  const { showToast } = useToast()
  
  const [products, setProducts] = useState<Product[]>([])
  const [athletes, setAthletes] = useState<AthleteProfile[]>([])
  
  // Client Search & Walk-in
  const [clientSearchQuery, setClientSearchQuery] = useState("")
  const [showWalkInModal, setShowWalkInModal] = useState(false)
  const [walkInName, setWalkInName] = useState("")
  const [walkInCedula, setWalkInCedula] = useState("")
  const [categories, setCategories] = useState<string[]>([])
  
  // Athlete View Cart
  const [showAthleteCart, setShowAthleteCart] = useState(false)
  
  const [search, setSearch] = useState("")
  const [activeCategory, setActiveCategory] = useState("Todas")
  
  // Cart
  const [cart, setCart] = useState<TransactionItem[]>([])
  const [selectedAthleteId, setSelectedAthleteId] = useState<string>("")
  const [paymentMethod, setPaymentMethod] = useState<'Efectivo' | 'Tarjeta' | 'Transferencia' | 'Pago Móvil'>('Efectivo')
  const [txReference, setTxReference] = useState("")
  const [txReceiptImage, setTxReceiptImage] = useState("")
  
  // Admin Override
  const [showAdminOverride, setShowAdminOverride] = useState(false)
  const [pendingCartProduct, setPendingCartProduct] = useState<Product | null>(null)
  const [adminCedula, setAdminCedula] = useState("")
  
  // Receipt Modal
  const [showReceipt, setShowReceipt] = useState<Transaction | null>(null)

  const barcodeInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const prods = storeService.getProducts()
    setProducts(prods)
    setAthletes(athleteService.getAthletes())
    
    const { cats } = storeService.getDepartmentsAndCategories()
    setCategories(["Todas", ...cats])
  }, [])

  const executeAddToCart = (product: Product) => {
    setCart(prev => {
      const exists = prev.find(i => i.productId === product.id)
      if (exists) {
        if (exists.qty >= product.currentStock && product.currentStock > 0) {
          showToast("No hay suficiente stock para añadir más.", "warning")
          return prev
        }
        return prev.map(i => i.productId === product.id ? { ...i, qty: i.qty + 1, subtotal: (i.qty + 1) * i.price } : i)
      }
      return [...prev, {
        productId: product.id,
        name: product.name,
        qty: 1,
        price: product.sellPrice,
        subtotal: product.sellPrice
      }]
    })
  }

  const addToCart = (product: Product) => {
    if (product.currentStock <= 0) {
      setPendingCartProduct(product)
      setShowAdminOverride(true)
      return
    }
    executeAddToCart(product)
  }

  const handleAdminOverride = (e: React.FormEvent) => {
    e.preventDefault()
    const allUsers = JSON.parse(localStorage.getItem('gympro_users') || '[]')
    const isAdmin = allUsers.find((u: any) => u.cedula === adminCedula && u.role === 'admin')
    
    if (isAdmin) {
      setShowAdminOverride(false)
      setAdminCedula("")
      if (pendingCartProduct) executeAddToCart(pendingCartProduct)
      setPendingCartProduct(null)
      showToast("Venta sin stock autorizada.", "success")
    } else {
      showToast("Cédula de administrador inválida.", "error")
    }
  }

  const updateQty = (productId: string, delta: number) => {
    setCart(prev => {
      const newCart = prev.map(item => {
        if (item.productId === productId) {
          const product = products.find(p => p.id === productId)
          const newQty = item.qty + delta
          if (newQty <= 0) return null
          if (product && newQty > product.currentStock) {
            showToast("No hay suficiente stock.", "warning")
            return item
          }
          return { ...item, qty: newQty, subtotal: newQty * item.price }
        }
        return item
      }).filter(Boolean) as TransactionItem[]
      return newCart
    })
  }

  // Barcode scanner listener
  const handleBarcodeSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (!search) return
    const matched = products.find(p => p.barcode === search)
    if (matched) {
      addToCart(matched)
      setSearch("") // clear for next scan
    }
  }

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.barcode === search
    const matchesCategory = activeCategory === "Todas" || p.category === activeCategory
    return matchesSearch && matchesCategory
  })

  const subtotal = cart.reduce((acc, item) => acc + item.subtotal, 0)
  const tax = subtotal * (settings.storeTaxRate / 100)
  const total = subtotal + tax

  const handleCheckout = () => {
    if (cart.length === 0) return

    const tx: Transaction = {
      id: `TX-${Date.now()}`,
      date: new Date().toISOString(),
      cashierId: user?.role === 'athlete' ? 'SELF_SERVICE' : (user?.id || 'unknown'),
      customerId: user?.role === 'athlete' ? user?.id : (selectedAthleteId || undefined),
      items: cart,
      subtotal,
      tax,
      total,
      paymentMethod,
      reference: (paymentMethod === 'Transferencia' || paymentMethod === 'Pago Móvil') ? txReference : undefined,
      receiptImage: (paymentMethod === 'Transferencia' || paymentMethod === 'Pago Móvil') ? txReceiptImage : undefined
    }

    storeService.addTransaction(tx)
    setProducts(storeService.getProducts()) // Refresh stock
    setCart([])
    setShowReceipt(tx)
    setTxReference("")
    setTxReceiptImage("")
    showToast("Compra completada exitosamente.", "success")
    
    if (settings.storeUseThermalPrinter) {
      setTimeout(() => {
        window.print()
      }, 500)
    }
  }

  if (!user || (user.role !== 'admin' && !user.permissions?.includes('POS_ACCESS') && user.role !== 'athlete')) {
    return <div className="p-8 text-center text-red-500 font-bold">Acceso Denegado a la Tienda.</div>
  }

  // ===== VISTA CATÁLOGO PARA ATLETAS =====
  if (user.role === 'athlete') {
    return (
      <div className="space-y-6 max-w-6xl mx-auto pb-20">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Catálogo {settings.appName}</h1>
            <p className="text-muted-foreground mt-1">Reserva tus productos desde aquí y retíralos en recepción.</p>
          </div>
          <div className="relative">
            <button onClick={() => setShowAthleteCart(true)} className="bg-primary text-primary-foreground font-bold py-2 px-4 rounded-xl flex items-center gap-2 hover:bg-primary/90 transition shadow-lg shadow-primary/20">
              <ShoppingCart className="h-5 w-5" />
              <span>Carrito ({cart.reduce((a, b) => a + b.qty, 0)})</span>
            </button>
            {cart.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full animate-pulse">
                {cart.reduce((a, b) => a + b.qty, 0)}
              </span>
            )}
          </div>
        </div>

        {/* Categorías */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map(c => (
            <button 
              key={c}
              onClick={() => setActiveCategory(c)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition ${activeCategory === c ? 'bg-primary text-primary-foreground' : 'bg-white/5 hover:bg-white/10'}`}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 mt-4">
          {filteredProducts.map(p => {
            const isOutOfStock = p.currentStock <= 0
            return (
              <Card key={p.id} className={`group relative bg-card border-white/10 overflow-hidden rounded-2xl transition-all duration-300 ${isOutOfStock ? 'opacity-60 grayscale' : 'hover:shadow-[0_0_20px_rgba(255,255,255,0.05)] hover:border-primary/50 hover:-translate-y-1'}`}>
                <div className="h-48 w-full bg-gradient-to-b from-white/5 to-transparent relative flex items-center justify-center p-4">
                  {p.imageUrl ? (
                    <img src={p.imageUrl} alt={p.name} className="w-full h-full object-contain drop-shadow-2xl transition-transform duration-500 group-hover:scale-110" />
                  ) : (
                    <ShoppingCart className="h-20 w-20 text-white/5 transition-transform duration-500 group-hover:scale-110 group-hover:text-primary/20" />
                  )}
                  {/* Category Badge Floating */}
                  <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md border border-white/10 text-[10px] text-primary uppercase font-bold tracking-wider px-2 py-1 rounded-full">
                    {p.category}
                  </div>
                  {/* Stock Badge */}
                  <div className={`absolute top-3 right-3 text-[10px] font-bold px-2 py-1 rounded-full backdrop-blur-md border ${isOutOfStock ? 'bg-red-500/20 text-red-400 border-red-500/30' : 'bg-green-500/20 text-green-400 border-green-500/30'}`}>
                    {isOutOfStock ? 'AGOTADO' : `Stock: ${p.currentStock}`}
                  </div>
                </div>
                
                <CardContent className="p-5 bg-gradient-to-t from-black/60 to-transparent">
                  <h3 className="font-bold text-base leading-tight line-clamp-2 mb-4 min-h-[2.5rem] group-hover:text-primary transition-colors" title={p.name}>{p.name}</h3>
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Precio</p>
                      <p className="text-2xl font-black text-white">{settings.storeCurrency} {p.sellPrice.toFixed(2)}</p>
                    </div>
                    <button 
                      onClick={() => !isOutOfStock && addToCart(p)}
                      disabled={isOutOfStock}
                      className="h-10 w-10 flex items-center justify-center rounded-xl bg-primary/20 text-primary hover:bg-primary hover:text-primary-foreground hover:shadow-lg hover:shadow-primary/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Plus className="h-5 w-5" />
                    </button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* MODAL CHECKOUT ATLETA */}
        {showAthleteCart && (
          <div className="fixed inset-0 z-50 flex flex-col justify-end sm:items-center sm:justify-center bg-black/80 sm:p-4">
            <div className="bg-card border-t border-white/10 sm:border sm:rounded-xl w-full max-w-md shadow-2xl glass h-[85vh] sm:h-auto max-h-[90vh] flex flex-col">
              <div className="p-4 border-b border-white/10 bg-black/20 flex justify-between items-center">
                <h3 className="font-bold text-lg flex items-center gap-2"><ShoppingCart className="h-5 w-5 text-primary" /> Tu Carrito</h3>
                <button onClick={() => setShowAthleteCart(false)} className="text-muted-foreground hover:text-white font-bold">&times;</button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {cart.map(item => (
                  <div key={item.productId} className="flex justify-between items-center bg-black/40 p-3 rounded-lg border border-white/5">
                    <div className="flex-1">
                      <h4 className="font-bold text-sm leading-tight">{item.name}</h4>
                      <p className="text-xs text-muted-foreground">{settings.storeCurrency} {item.price.toFixed(2)} c/u</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center bg-white/5 rounded-lg border border-white/10">
                        <button onClick={()=>updateQty(item.productId, -1)} className="p-1 hover:bg-white/10 text-muted-foreground hover:text-red-400 rounded-l-lg"><Minus className="h-4 w-4"/></button>
                        <span className="w-6 text-center text-sm font-bold">{item.qty}</span>
                        <button onClick={()=>updateQty(item.productId, 1)} className="p-1 hover:bg-white/10 text-muted-foreground hover:text-green-400 rounded-r-lg"><Plus className="h-4 w-4"/></button>
                      </div>
                      <div className="font-bold text-sm w-16 text-right">
                        {settings.storeCurrency} {item.subtotal.toFixed(2)}
                      </div>
                    </div>
                  </div>
                ))}
                {cart.length === 0 && (
                  <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-50 pt-10 pb-10">
                    <ShoppingCart className="h-12 w-12 mb-4" />
                    <p>Carrito Vacío</p>
                  </div>
                )}
              </div>
              <div className="p-4 border-t border-white/10 bg-black/40 space-y-4 flex-shrink-0 overflow-y-auto max-h-[50vh]">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground block">Método de Pago</label>
                  <select 
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-sm focus:border-primary appearance-none"
                  >
                    <option value="Pago Móvil">Pago Móvil</option>
                    <option value="Transferencia">Transferencia</option>
                  </select>
                </div>
                {(paymentMethod === 'Transferencia' || paymentMethod === 'Pago Móvil') && (
                  <div className="space-y-3 pt-2">
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-muted-foreground">Número de Referencia ({paymentMethod})</label>
                      <input 
                        type="text" 
                        value={txReference}
                        onChange={(e) => setTxReference(e.target.value)}
                        placeholder="Ej. 12345678"
                        className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-sm focus:border-primary" 
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-muted-foreground">Comprobante (Capture)</label>
                      <input 
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) {
                            const reader = new FileReader()
                            reader.onloadend = () => setTxReceiptImage(reader.result as string)
                            reader.readAsDataURL(file)
                          }
                        }}
                        className="w-full text-xs text-muted-foreground file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-primary/20 file:text-primary hover:file:bg-primary/30 cursor-pointer" 
                      />
                    </div>
                  </div>
                )}
                <div className="pt-2 space-y-1">
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Subtotal</span>
                    <span>{settings.storeCurrency} {subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xl font-bold text-primary pt-2 border-t border-white/10">
                    <span>Total a Pagar</span>
                    <span>{settings.storeCurrency} {total.toFixed(2)}</span>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    if ((paymentMethod === 'Transferencia' || paymentMethod === 'Pago Móvil') && !txReference && !txReceiptImage) {
                      showToast(`Debes ingresar la referencia o el capture de tu ${paymentMethod}.`, "warning");
                      return;
                    }
                    handleCheckout();
                    setShowAthleteCart(false);
                  }}
                  disabled={cart.length === 0}
                  className="w-full bg-primary text-primary-foreground font-bold py-3.5 rounded-xl hover:bg-primary/90 transition shadow-lg shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <CheckCircle2 className="h-5 w-5" /> Enviar Pedido
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  // ===== VISTA POS PARA EMPLEADOS / ADMIN =====
  return (
    <div className="space-y-4 max-w-[1400px] mx-auto h-[calc(100vh-100px)] flex flex-col">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Tienda Maximum Store</h1>
        <StoreNav />
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0">
        
        {/* LADO IZQUIERDO: PRODUCTOS */}
        <div className="flex-1 flex flex-col min-h-0">
          
          {/* Categorías */}
          <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
            {categories.map(c => (
              <button 
                key={c}
                onClick={() => setActiveCategory(c)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition ${activeCategory === c ? 'bg-primary text-primary-foreground' : 'bg-white/5 hover:bg-white/10'}`}
              >
                {c}
              </button>
            ))}
          </div>

          {/* Buscador / Lector */}
          <form onSubmit={handleBarcodeSearch} className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input 
              ref={barcodeInputRef}
              type="text" 
              placeholder="Escanea el código de barras o busca por nombre (Enter para añadir)..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-base focus:outline-none focus:border-primary transition-colors"
            />
          </form>

          {/* Cuadrícula de Productos */}
          <div className="flex-1 overflow-y-auto min-h-0 pb-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredProducts.map(p => {
                const isOutOfStock = p.currentStock <= 0
                return (
                  <Card 
                    key={p.id} 
                    onClick={() => !isOutOfStock && addToCart(p)}
                    className={`group cursor-pointer bg-card/80 border-white/5 overflow-hidden rounded-xl transition-all duration-200 ${isOutOfStock ? 'opacity-50 grayscale' : 'hover:border-primary/50 hover:bg-card hover:shadow-lg'}`}
                  >
                    <div className="h-28 w-full relative flex items-center justify-center p-3 bg-white/[0.02] group-hover:bg-white/[0.04] transition-colors">
                      {p.imageUrl ? (
                        <img src={p.imageUrl} alt={p.name} className="w-full h-full object-contain drop-shadow-lg group-hover:scale-105 transition-transform" />
                      ) : (
                        <ShoppingCart className="h-12 w-12 text-white/5" />
                      )}
                      
                      {isOutOfStock && (
                        <div className="absolute inset-0 bg-red-900/40 flex items-center justify-center backdrop-blur-[2px] z-10">
                          <span className="font-black text-red-400 rotate-[-15deg] border-2 border-red-400 px-2 py-1 rounded-lg text-sm tracking-widest">AGOTADO</span>
                        </div>
                      )}
                      {/* Price Tag Floating */}
                      <div className="absolute bottom-2 right-2 bg-black/80 backdrop-blur-sm px-2 py-1 rounded-md border border-white/10 text-primary font-bold text-xs shadow-xl z-20">
                        {settings.storeCurrency} {p.sellPrice.toFixed(2)}
                      </div>
                    </div>
                    <CardContent className="p-3">
                      <div className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider mb-1 truncate">{p.category}</div>
                      <h3 className="font-bold text-xs leading-tight line-clamp-2 min-h-[2rem] group-hover:text-primary transition-colors" title={p.name}>{p.name}</h3>
                      <div className="flex justify-between items-center mt-2 pt-2 border-t border-white/5">
                        <span className="text-[10px] text-muted-foreground">Disponibles:</span>
                        <span className={`text-xs font-black ${p.currentStock <= p.minStockAlert ? 'text-yellow-500' : 'text-green-500'}`}>{p.currentStock}</span>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        </div>

        {/* LADO DERECHO: CARRITO Y FACTURACIÓN */}
        <div className="w-full lg:w-[420px] flex flex-col bg-card border border-white/10 rounded-xl glass overflow-hidden">
          <div className="p-4 border-b border-white/10 bg-black/20 flex items-center gap-2 flex-shrink-0">
            <ShoppingCart className="h-5 w-5 text-primary" />
            <h2 className="font-bold text-lg">Ticket de Compra</h2>
          </div>

          {/* Items del Carrito */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[150px]">
            {cart.map(item => (
              <div key={item.productId} className="flex justify-between items-center bg-black/40 p-3 rounded-lg border border-white/5">
                <div className="flex-1">
                  <h4 className="font-bold text-sm leading-tight">{item.name}</h4>
                  <p className="text-xs text-muted-foreground">{settings.storeCurrency} {item.price.toFixed(2)} c/u</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center bg-white/5 rounded-lg border border-white/10">
                    <button onClick={()=>updateQty(item.productId, -1)} className="p-1 hover:bg-white/10 text-muted-foreground hover:text-red-400 rounded-l-lg"><Minus className="h-4 w-4"/></button>
                    <span className="w-6 text-center text-sm font-bold">{item.qty}</span>
                    <button onClick={()=>updateQty(item.productId, 1)} className="p-1 hover:bg-white/10 text-muted-foreground hover:text-green-400 rounded-r-lg"><Plus className="h-4 w-4"/></button>
                  </div>
                  <div className="font-bold text-sm w-16 text-right">
                    {settings.storeCurrency} {item.subtotal.toFixed(2)}
                  </div>
                </div>
              </div>
            ))}
            {cart.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-50 pt-20">
                <ShoppingCart className="h-12 w-12 mb-4" />
                <p>Carrito Vacío</p>
                <p className="text-xs text-center mt-2 max-w-[200px]">Usa el lector de código de barras o selecciona un producto de la lista.</p>
              </div>
            )}
          </div>

          {/* Zona de Pago */}
          <div className="p-4 border-t border-white/10 bg-black/40 space-y-4 flex-shrink-0 max-h-[55vh] overflow-y-auto">
            
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground flex justify-between items-center">
                Vincular a Cliente
                <button type="button" onClick={() => setShowWalkInModal(true)} className="text-primary hover:underline flex items-center gap-1 font-bold">
                  <UserPlus className="h-3 w-3" /> Nuevo
                </button>
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input 
                  type="text" 
                  placeholder="Buscar por cédula o nombre..."
                  value={clientSearchQuery}
                  onChange={e => {
                    setClientSearchQuery(e.target.value)
                    if (selectedAthleteId) setSelectedAthleteId("") 
                  }}
                  className="w-full bg-black/40 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm focus:border-primary"
                />
                {clientSearchQuery && !selectedAthleteId && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-white/10 rounded-lg shadow-xl max-h-40 overflow-y-auto z-10 glass">
                    {athletes.filter(a => a.name.toLowerCase().includes(clientSearchQuery.toLowerCase()) || a.cedula.includes(clientSearchQuery)).map(a => (
                      <button 
                        type="button"
                        key={a.id} 
                        onClick={() => { setSelectedAthleteId(a.id); setClientSearchQuery(`${a.name} (${a.cedula})`); }}
                        className="w-full text-left px-4 py-2 hover:bg-white/10 text-sm border-b border-white/5 last:border-0"
                      >
                        <div className="font-bold">{a.name}</div>
                        <div className="text-xs text-muted-foreground">C.C. {a.cedula}</div>
                      </button>
                    ))}
                    {athletes.filter(a => a.name.toLowerCase().includes(clientSearchQuery.toLowerCase()) || a.cedula.includes(clientSearchQuery)).length === 0 && (
                      <div className="px-4 py-3 text-xs text-muted-foreground text-center">
                        No se encontraron clientes. <br/><span className="text-primary font-bold">Haz clic en '+ Nuevo' arriba.</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              {/* Alerta de Membresía */}
              {selectedAthleteId && (() => {
                const athlete = athletes.find(a => a.id === selectedAthleteId);
                if (!athlete) return null;
                const isExpired = new Date(athlete.membershipEnd).getTime() < new Date().getTime();
                if (isExpired) {
                  return (
                    <div className="mt-2 bg-red-500/20 border border-red-500/50 p-2 rounded flex gap-2 items-start text-xs text-red-500">
                      <span className="font-bold uppercase">¡Atención!</span>
                      <span>Membresía Vencida ({athlete.membershipEnd}). Ofrece la renovación.</span>
                    </div>
                  );
                }
                return null;
              })()}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Método de Pago</label>
              <div className="flex gap-2 flex-wrap">
                {['Efectivo', 'Tarjeta', 'Transferencia', 'Pago Móvil'].map(m => (
                  <button 
                    key={m}
                    onClick={() => setPaymentMethod(m as any)}
                    className={`flex-1 min-w-[70px] py-2 rounded border text-[10px] sm:text-xs font-bold transition ${paymentMethod === m ? 'bg-primary/20 border-primary text-primary' : 'bg-white/5 border-white/10 text-muted-foreground hover:bg-white/10'}`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            {(paymentMethod === 'Transferencia' || paymentMethod === 'Pago Móvil') && (
              <div className="space-y-3 pt-2">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">Número de Referencia ({paymentMethod})</label>
                  <input 
                    type="text" 
                    value={txReference}
                    onChange={(e) => setTxReference(e.target.value)}
                    placeholder="Ej. 12345678"
                    className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-sm focus:border-primary" 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">Comprobante (Capture)</label>
                  <input 
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        const reader = new FileReader()
                        reader.onloadend = () => setTxReceiptImage(reader.result as string)
                        reader.readAsDataURL(file)
                      }
                    }}
                    className="w-full text-xs text-muted-foreground file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-primary/20 file:text-primary hover:file:bg-primary/30 cursor-pointer" 
                  />
                </div>
              </div>
            )}

            <div className="pt-2 space-y-1">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Subtotal</span>
                <span>{settings.storeCurrency} {subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>IVA ({settings.storeTaxRate}%)</span>
                <span>{settings.storeCurrency} {tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xl font-bold text-primary pt-2 border-t border-white/10">
                <span>Total</span>
                <span>{settings.storeCurrency} {total.toFixed(2)}</span>
              </div>
            </div>

            <button 
              onClick={handleCheckout}
              disabled={cart.length === 0}
              className="w-full bg-primary text-primary-foreground font-bold py-3.5 rounded-xl hover:bg-primary/90 transition shadow-lg shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <CheckCircle2 className="h-5 w-5" /> Cobrar Total
            </button>

          </div>
        </div>
      </div>

      {/* MODAL DE OVERRIDE DE STOCK */}
      {showAdminOverride && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="bg-card border border-white/10 rounded-xl max-w-sm w-full p-6 shadow-2xl glass">
            <h3 className="text-xl font-bold mb-2 text-red-500">Autorización Requerida</h3>
            <p className="text-sm text-muted-foreground mb-4">El producto <strong>{pendingCartProduct?.name}</strong> no tiene stock. Ingrese Cédula o pase código de Administrador para facturar sin stock.</p>
            <form onSubmit={handleAdminOverride} className="space-y-4">
              <input 
                type="password" 
                autoFocus
                placeholder="Cédula de Administrador..." 
                value={adminCedula}
                onChange={e => setAdminCedula(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-sm focus:border-primary"
              />
              <div className="flex gap-2 justify-end">
                <button type="button" onClick={() => {setShowAdminOverride(false); setPendingCartProduct(null);}} className="px-4 py-2 rounded bg-white/10 hover:bg-white/20">Cancelar</button>
                <button type="submit" className="px-4 py-2 rounded bg-red-500 text-white font-bold hover:bg-red-600">Autorizar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL CLIENTE DE PASO */}
      {showWalkInModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="bg-card border border-white/10 rounded-xl max-w-sm w-full p-6 shadow-2xl glass">
            <h3 className="text-xl font-bold mb-4">Nuevo Cliente (Rápido)</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              if (walkInName && walkInCedula) {
                const newClient = {
                  id: `WALKIN-${Date.now()}`,
                  cedula: walkInCedula,
                  name: walkInName,
                  membershipStart: new Date().toISOString(),
                  membershipEnd: new Date(Date.now() + 86400000).toISOString(),
                  phone: '', 
                  address: '',
                  gender: 'M',
                  coachId: null,
                  attendancePercentage: 0,
                  biometrics: []
                } as unknown as AthleteProfile;
                athleteService.updateAthlete(newClient as any);
                setAthletes(athleteService.getAthletes());
                setSelectedAthleteId(newClient.id);
                setClientSearchQuery(`${newClient.name} (${newClient.cedula})`);
                setShowWalkInModal(false);
                setWalkInName(""); setWalkInCedula("");
                showToast("Cliente agregado.", "success");
              }
            }} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Cédula</label>
                <input 
                  required autoFocus type="text" value={walkInCedula} onChange={e => setWalkInCedula(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-sm focus:border-primary"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Nombre</label>
                <input 
                  required type="text" value={walkInName} onChange={e => setWalkInName(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-sm focus:border-primary"
                />
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <button type="button" onClick={() => setShowWalkInModal(false)} className="px-4 py-2 text-sm rounded bg-white/10 hover:bg-white/20">Cancelar</button>
                <button type="submit" className="px-4 py-2 text-sm rounded bg-primary text-primary-foreground font-bold hover:bg-primary/90">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TICKET / RECIBO MODAL */}
      {showReceipt && (() => {
        const widthClass = settings.storeTicketWidth === '58mm' ? 'max-w-[280px]' : settings.storeTicketWidth === 'Carta' ? 'max-w-2xl' : 'max-w-sm';
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 overflow-y-auto">
            <div className={`bg-white text-black p-8 w-full font-mono text-sm relative shadow-2xl my-auto ${widthClass}`}>
              <button onClick={() => setShowReceipt(null)} className="absolute top-4 right-4 text-gray-500 hover:text-black font-sans font-bold text-xl print:hidden">&times;</button>
              
              <div className="text-center mb-6 border-b border-dashed border-black pb-6">
                <h2 className="font-bold text-2xl uppercase tracking-widest">{settings.appName}</h2>
                {settings.storeRif && <p className="text-xs text-black mt-1 font-bold">RIF/NIT: {settings.storeRif}</p>}
                {settings.storeAddress && <p className="text-xs text-black mb-2">{settings.storeAddress}</p>}
                <p className="text-black mt-1 font-bold">Ticket: {showReceipt.id}</p>
                <p className="text-black">{new Date(showReceipt.date).toLocaleString()}</p>
                <p className="text-black mt-2">Cajero: {user?.name}</p>
                <p className="text-black">Cliente: {showReceipt.customerId ? athletes.find(a=>a.id === showReceipt.customerId)?.name : 'Consumidor Final'}</p>
              </div>

              <div className="space-y-2 mb-6 text-black">
                <div className="flex justify-between font-bold border-b border-black pb-1 mb-2">
                  <span>CANT. DESC.</span>
                  <span>TOTAL</span>
                </div>
                {showReceipt.items.map(item => (
                  <div key={item.productId} className="flex justify-between items-start text-sm mb-1 leading-tight">
                    <div className="flex gap-2 pr-2">
                      <span className="font-bold">{item.qty}x</span>
                      <span>{item.name}</span>
                    </div>
                    <span className="shrink-0 font-bold">{settings.storeCurrency} {item.subtotal.toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-dashed border-black pt-4 space-y-1 text-black font-bold">
                <div className="flex justify-between">
                  <span>Artículos Totales</span>
                  <span>{showReceipt.items.reduce((acc, item) => acc + item.qty, 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{settings.storeCurrency} {showReceipt.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>IVA ({settings.storeTaxRate}%)</span>
                  <span>{settings.storeCurrency} {showReceipt.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xl font-black mt-2 pt-2 border-t border-black">
                  <span>TOTAL</span>
                  <span>{settings.storeCurrency} {showReceipt.total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between mt-2">
                  <span>Pago con:</span>
                  <span className="uppercase">{showReceipt.paymentMethod}</span>
                </div>
                {showReceipt.reference && (
                  <div className="flex justify-between">
                    <span>Ref:</span>
                    <span className="uppercase">{showReceipt.reference}</span>
                  </div>
                )}
              </div>

              <div className="text-center mt-8 text-black italic font-bold">
                {settings.storeReceiptMessage}
              </div>

              <div className="mt-6 flex flex-col gap-2 print:hidden">
                <button 
                  onClick={() => window.print()}
                  className="w-full bg-black text-white font-sans font-bold py-3 rounded hover:bg-gray-800 transition flex items-center justify-center gap-2"
                >
                  <ReceiptText className="h-5 w-5" /> Imprimir Recibo
                </button>
                <button 
                  onClick={() => {
                    const client = showReceipt.customerId ? athletes.find(a=>a.id === showReceipt.customerId) : null;
                    const phone = client?.phone || prompt("Ingrese número de teléfono (con código de país ej. 57300...):");
                    if (phone) {
                      const msg = `Hola! Tu recibo de compra en *${settings.appName}* está listo.%0A%0ATicket: ${showReceipt.id}%0ATotal: ${settings.storeCurrency} ${showReceipt.total.toFixed(2)}%0A%0A¡Gracias por preferirnos!`;
                      window.open(`https://wa.me/${phone}?text=${msg}`, '_blank');
                    }
                  }}
                  className="w-full bg-green-500 text-white font-sans font-bold py-3 rounded hover:bg-green-600 transition flex items-center justify-center gap-2"
                >
                  Enviar por WhatsApp
                </button>
              </div>
            </div>
          </div>
        )
      })()}
    </div>
  )
}
