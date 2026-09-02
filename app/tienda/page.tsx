"use client"

// Imports
import { useState, useEffect, useRef } from "react"
import { useAuth } from "@/lib/auth-context"
import { useSettings } from "@/lib/settings-context"
import { storeService, Product, TransactionItem, Transaction } from "@/lib/store-service"
import { athleteService, AthleteProfile } from "@/lib/data-service"
import { StoreNav } from "@/components/store/StoreNav"
import { Card, CardContent } from "@/components/ui/card"
import { Search, ShoppingCart, Plus, Minus, Trash2, CheckCircle2, User, ReceiptText, UserPlus, Eye, Camera, ImageIcon } from "lucide-react"
import { useToast } from "@/lib/toast-context"
import FilterDropdown from "@/components/ui/FilterDropdown"

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
  const [showAdminCart, setShowAdminCart] = useState(false)

  const [cartAnim, setCartAnim] = useState(false)
  const [flyingItems, setFlyingItems] = useState<{id: number, x: number, y: number, image?: string}[]>([])
  
  const [search, setSearch] = useState("")
  const [activeCategory, setActiveCategory] = useState("Todas")
  const [priceMin, setPriceMin] = useState("")
  const [priceMax, setPriceMax] = useState("")
  
  // Cart
  const [cart, setCart] = useState<TransactionItem[]>([])
  const [selectedAthleteId, setSelectedAthleteId] = useState<string>("")
  const [paymentMethod, setPaymentMethod] = useState<'Seleccionar' | 'Efectivo' | 'Tarjeta' | 'Transferencia' | 'Pago Móvil' | 'Binance' | 'Crédito/Fiado'>('Seleccionar')
  const [txReference, setTxReference] = useState("")
  const [txReceiptImage, setTxReceiptImage] = useState("")
  
  // Admin Override
  const [showAdminOverride, setShowAdminOverride] = useState(false)
  const [pendingCartProduct, setPendingCartProduct] = useState<Product | null>(null)
  const [adminCedula, setAdminCedula] = useState("")
  
  // Receipt Modal
  const [showReceipt, setShowReceipt] = useState<Transaction | null>(null)

  const barcodeInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  const [showQRModal, setShowQRModal] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const { getAthletes } = await import('@/app/actions/users')
      const athRes = await getAthletes()
      
      const loadedProducts = storeService.getProducts()
      setProducts(loadedProducts)
      if (athRes.success) setAthletes(athRes.athletes as any)
      
      const uniqueCats = Array.from(new Set(loadedProducts.map((p: any) => p.category)))
      setCategories(["Todas", ...(uniqueCats as string[])])
    }
    load()
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

  const addToCart = (product: Product, e?: React.MouseEvent) => {
    if (product.currentStock <= 0) {
      setPendingCartProduct(product)
      setShowAdminOverride(true)
      return
    }
    executeAddToCart(product)
    
    if (e) {
      const target = e.currentTarget as HTMLElement;
      const rect = target.getBoundingClientRect();
      const newFlying = {
        id: Date.now() + Math.random(),
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
        image: product.imageUrl
      };
      setFlyingItems(prev => [...prev, newFlying]);
      setTimeout(() => {
        setFlyingItems(prev => prev.filter(f => f.id !== newFlying.id));
      }, 700);
    }
    
    setCartAnim(true)
    setTimeout(() => setCartAnim(false), 300)
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
          if (productId === 'MEMBRESIA-001' && newQty > 1) {
            showToast("Solo puedes pagar 1 mes a la vez.", "warning")
            return item
          }
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
    const matchesMin = priceMin !== "" ? p.sellPrice >= Number(priceMin) : true
    const matchesMax = priceMax !== "" ? p.sellPrice <= Number(priceMax) : true
    return matchesSearch && matchesCategory && matchesMin && matchesMax
  })

  const subtotal = cart.reduce((acc, item) => acc + item.subtotal, 0)
  const tax = subtotal * (settings.storeTaxRate / 100)
  const total = subtotal + tax

  const handleCheckout = async () => {
    if (cart.length === 0) return
    if (paymentMethod === 'Seleccionar') {
      showToast("Debe seleccionar un método de pago.", "error")
      return
    }

    if (['Transferencia', 'Pago Móvil', 'Binance'].includes(paymentMethod)) {
      if (!txReference.trim()) {
        showToast(`Debe ingresar la referencia para ${paymentMethod}.`, "error")
        return
      }
      if (!txReceiptImage) {
        showToast(`Debe subir el comprobante para ${paymentMethod}.`, "error")
        return
      }
    }

    const isAthlete = user?.role === 'athlete'

    if (!isAthlete) {
      const pin = prompt("Por seguridad, ingrese su PIN de Cajero para procesar la venta:")
      if (pin === null) return // Cancelled
      const { validatePinAction } = await import('@/app/actions/auth')
      const res = await validatePinAction(pin)
      if (!res.success) {
        showToast(res.error || "PIN incorrecto. Venta cancelada.", "error")
        return
      }
    }

    const tx: Transaction = {
      id: `TX-${Date.now()}`,
      date: new Date().toISOString(),
      cashierId: isAthlete ? 'SELF_SERVICE' : (user?.id || 'unknown'),
      customerId: isAthlete ? user?.id : (selectedAthleteId || undefined),
      items: cart,
      subtotal,
      tax,
      total,
      paymentMethod,
      reference: (paymentMethod === 'Transferencia' || paymentMethod === 'Pago Móvil' || paymentMethod === 'Binance') ? txReference : undefined,
      receiptImage: (paymentMethod === 'Transferencia' || paymentMethod === 'Pago Móvil' || paymentMethod === 'Binance') ? txReceiptImage : undefined,
      status: isAthlete ? 'PENDING_PICKUP' : 'COMPLETED',
      pickupCode: isAthlete ? `ATH-${Math.floor(1000 + Math.random() * 9000)}` : undefined
    }

    if (paymentMethod === 'Crédito/Fiado' && selectedAthleteId && !isAthlete) {
      // Find athlete and save debt
      const { updateAthlete } = await import('@/app/actions/users');
      // For now we don't have debt in schema, skipping real debt update for mockup
    }

    const { createTransaction } = await import('@/app/actions/store');
    
    const res = await createTransaction({
       cashierId: isAthlete ? 'SELF_SERVICE' : (user?.id || 'unknown'),
       customerId: isAthlete ? user?.id : (selectedAthleteId || undefined),
       items: cart,
       subtotal,
       tax,
       total,
       paymentMethod,
       reference: (paymentMethod === 'Transferencia' || paymentMethod === 'Pago Móvil' || paymentMethod === 'Binance') ? txReference : undefined
    });

    if (res.success) {
      // We still use local products state but it will refresh on reload or we could fetch again
      setCart([])
      setShowReceipt(res.transaction)
      setShowAdminCart(false)
      setTxReference("")
      setTxReceiptImage("")
      showToast("Compra completada exitosamente.", "success")
      
      if (settings.storeUseThermalPrinter) {
        setTimeout(() => {
          window.print()
        }, 500)
      }
    } else {
      showToast(res.error, "error")
    }
  }

  if (!user || (user.role !== 'admin' && !user.permissions?.includes('POS_ACCESS') && user.role !== 'athlete')) {
    return <div className="p-8 text-center text-red-500 font-bold">Acceso Denegado a la Tienda.</div>
  }

  // ===== VISTA CATÁLOGO PARA ATLETAS =====
  if (user.role === 'athlete') {
    return (
      <div className="space-y-6 max-w-6xl mx-auto pb-20">
        <div className="flex justify-between items-end flex-wrap gap-4">
          <div>
            <h1 className="text-4xl font-black tracking-tighter bg-gradient-to-r from-primary dark:dark:via-white via-black via-black to-primary/50 bg-clip-text text-transparent dark:dark:drop-shadow-[0_0_15px_rgba(255,255,255,0.1)] drop-shadow-sm drop-shadow-sm">Catálogo {settings.appName}</h1>
            <p className="text-muted-foreground mt-1">Reserva tus productos desde aquí y retíralos en recepción.</p>
          </div>
          <div className="relative flex gap-2">
            <button 
              onClick={() => {
                setCart(prev => {
                  if (prev.find(i => i.productId === 'MEMBRESIA-001')) return prev;
                  return [...prev, {
                    productId: 'MEMBRESIA-001',
                    name: 'Pago Mensualidad',
                    qty: 1,
                    price: 30, // Default mock price
                    subtotal: 30
                  }];
                });
                setShowAthleteCart(true);
              }}
              className="bg-secondary text-secondary-foreground font-bold py-2 px-4 rounded-xl flex items-center gap-2 hover:bg-secondary/90 transition shadow-lg"
            >
              <User className="h-5 w-5" />
              <span>Pagar Mensualidad</span>
            </button>
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

        {/* Filtros + Buscador */}
        <div className="flex items-center gap-2 mb-4">
          <FilterDropdown
            categories={categories}
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
            priceMin={priceMin}
            priceMax={priceMax}
            onPriceMinChange={setPriceMin}
            onPriceMaxChange={setPriceMax}
          />
          <form onSubmit={handleBarcodeSearch} className="relative flex-1 hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Buscar producto..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors"
            />
          </form>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 p-1 sm:p-2">
          {filteredProducts.map(p => {
            const isOutOfStock = p.currentStock <= 0
            return (
              <Card 
                key={p.id} 
                onClick={(e) => !isOutOfStock && addToCart(p, e)}
                className={`group cursor-pointer bg-card/80 border-black/5 dark:border-white/5 overflow-hidden rounded-xl transition-all duration-300 ${isOutOfStock ? 'opacity-50 grayscale' : 'hover:scale-[1.03] hover:border-primary hover:shadow-[0_0_20px_rgba(255,255,255,0.15)] hover:bg-card z-0 hover:z-10'}`}
              >
                <div className="h-40 sm:h-28 w-full relative flex items-center justify-center p-3 bg-white/[0.02] group-hover:bg-white/[0.04] transition-colors">
                  {p.imageUrl ? (
                    <img src={p.imageUrl} alt={p.name} className="w-full h-full object-contain drop-shadow-lg group-hover:scale-105 transition-transform" />
                  ) : (
                    <ShoppingCart className="h-12 w-12 text-black/10 dark:text-white/5" />
                  )}
                  
                  {isOutOfStock && (
                    <div className="absolute inset-0 bg-red-900/40 flex items-center justify-center backdrop-blur-[2px] z-10">
                      <span className="font-black text-red-400 rotate-[-15deg] border-2 border-red-400 px-2 py-1 rounded-lg text-sm tracking-widest">AGOTADO</span>
                    </div>
                  )}
                  {/* Price Tag Floating */}
                  <div className="absolute bottom-2 right-2 bg-black/80 backdrop-blur-sm px-2 py-1 rounded-md border border-black/10 dark:border-white/10 text-primary font-bold text-xs shadow-xl z-20">
                    {settings.storeCurrency} {p.sellPrice.toFixed(2)}
                    {settings.storeCurrencySecondary && settings.storeExchangeRate > 0 && (
                      <div className="text-[10px] text-muted-foreground mt-0.5">
                        {settings.storeCurrencySecondary} {(p.sellPrice * settings.storeExchangeRate).toFixed(2)}
                      </div>
                    )}
                  </div>
                </div>
                <CardContent className="p-3">
                  <div className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider mb-1 truncate">{p.category}</div>
                  <h3 className="font-bold text-xs sm:text-sm leading-tight line-clamp-2 min-h-[2.5rem] group-hover:text-primary transition-colors" title={p.name}>{p.name}</h3>
                  <div className="flex justify-between items-center mt-2 pt-2 border-t border-black/5 dark:border-white/5">
                    <span className="text-[10px] text-muted-foreground">Stock disp.</span>
                    <span className={`text-xs font-black ${p.currentStock <= p.minStockAlert ? 'text-yellow-500' : 'text-green-500'}`}>{p.currentStock}</span>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* MODAL CHECKOUT ATLETA */}
        {showAthleteCart && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 sm:p-4 backdrop-blur-sm">
            <div className="bg-card border border-black/10 dark:border-white/10 sm:rounded-xl w-[95vw] max-w-xl shadow-2xl glass max-h-[95vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
              <div className="p-4 border-b border-black/10 dark:border-white/10 bg-black/20 flex justify-between items-center">
                <h3 className="font-bold text-lg flex items-center gap-2"><ShoppingCart className="h-5 w-5 text-primary" /> Tu Carrito</h3>
                <button onClick={() => setShowAthleteCart(false)} className="text-muted-foreground hover:text-white font-bold">&times;</button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {cart.map(item => (
                  <div key={item.productId} className="flex justify-between items-center bg-black/5 dark:bg-black/40 p-3 rounded-lg border border-black/5 dark:border-white/5">
                    <div className="flex-1">
                      <h4 className="font-bold text-sm leading-tight">{item.name}</h4>
                      <p className="text-xs text-muted-foreground">{settings.storeCurrency} {item.price.toFixed(2)} c/u</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center bg-black/5 dark:bg-white/5 rounded-lg border border-black/10 dark:border-white/10">
                        <button onClick={()=>updateQty(item.productId, -1)} className="p-1 hover:bg-black/10 dark:bg-white/10 text-muted-foreground hover:text-red-400 rounded-l-lg"><Minus className="h-4 w-4"/></button>
                        <span className="w-6 text-center text-sm font-bold">{item.qty}</span>
                        <button onClick={()=>updateQty(item.productId, 1)} className="p-1 hover:bg-black/10 dark:bg-white/10 text-muted-foreground hover:text-green-400 rounded-r-lg"><Plus className="h-4 w-4"/></button>
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
              <div className="p-4 border-t border-black/10 dark:border-white/10 bg-black/5 dark:bg-black/40 space-y-4 flex-shrink-0 overflow-y-auto max-h-[50vh]">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground block">Método de Pago</label>
                  <select 
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-lg p-2 text-sm focus:border-primary appearance-none"
                  >
                    <option value="Seleccionar">Seleccionar</option>
                    <option value="Efectivo">Efectivo</option>
                    <option value="Pago Móvil">Pago Móvil</option>
                    <option value="Transferencia">Transferencia</option>
                    <option value="Binance">Binance</option>
                  </select>
                  {paymentMethod === 'Efectivo' && (
                    <div className="mt-2 text-[10px] sm:text-xs text-yellow-500 bg-yellow-500/10 p-2 rounded border border-yellow-500/20">
                      <span className="font-bold">Aviso:</span> Al seleccionar Efectivo, cuentas con <strong>24 horas</strong> para dirigirte a la tienda y pagar. De lo contrario, la reserva será cancelada.
                    </div>
                  )}
                </div>
                {(paymentMethod === 'Transferencia' || paymentMethod === 'Pago Móvil' || paymentMethod === 'Binance') && (
                  <div className="space-y-3 pt-2">
                    <div className="p-3 bg-primary/10 border border-primary/20 rounded-lg whitespace-pre-wrap text-xs text-primary font-medium flex items-center gap-3">
                      <div className="flex-1">
                        {paymentMethod === 'Pago Móvil' && settings.storePaymentInstructions?.pagoMovil}
                        {paymentMethod === 'Transferencia' && settings.storePaymentInstructions?.transferencia}
                        {paymentMethod === 'Binance' && settings.storePaymentInstructions?.binance}
                      </div>
                      {(() => {
                        const qr = paymentMethod === 'Pago Móvil' ? settings.storePaymentQRs?.pagoMovil
                          : paymentMethod === 'Transferencia' ? settings.storePaymentQRs?.transferencia
                          : paymentMethod === 'Binance' ? settings.storePaymentQRs?.binance : null;
                        return qr ? (
                          <button type="button" onClick={() => setShowQRModal(qr)} className="p-2 rounded-lg bg-primary/20 hover:bg-primary/30 transition shrink-0" title="Ver QR">
                            <Eye className="h-5 w-5 text-primary" />
                          </button>
                        ) : null;
                      })()}
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-muted-foreground">Número de Referencia ({paymentMethod})</label>
                      <input 
                        type="text" 
                        value={txReference}
                        onChange={(e) => setTxReference(e.target.value)}
                        placeholder="Ej. 12345678"
                        className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-lg p-2 text-sm focus:border-primary" 
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-muted-foreground">Comprobante (Capture)</label>
                      <div className="grid grid-cols-2 gap-2">
                        <label className="flex flex-col items-center justify-center gap-1.5 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 rounded-xl py-3 text-xs font-bold cursor-pointer transition text-center px-1">
                          <ImageIcon className="h-5 w-5 shrink-0" />
                          <span className="truncate w-full">Galería</span>
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
                            className="hidden" 
                          />
                        </label>
                        <label className="flex flex-col items-center justify-center gap-1.5 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 rounded-xl py-3 text-xs font-bold cursor-pointer transition text-center px-1">
                          <Camera className="h-5 w-5 shrink-0" />
                          <span className="truncate w-full">Tomar Foto</span>
                          <input
                            type="file"
                            accept="image/*"
                            capture="environment"
                            onChange={(e) => {
                              const file = e.target.files?.[0]
                              if (file) {
                                const reader = new FileReader()
                                reader.onloadend = () => setTxReceiptImage(reader.result as string)
                                reader.readAsDataURL(file)
                              }
                            }}
                            className="hidden"
                          />
                        </label>
                      </div>
                      {txReceiptImage && (
                        <div className="mt-2 relative w-20 h-20">
                          <img src={txReceiptImage} alt="Comprobante" className="w-20 h-20 object-cover rounded-lg border border-primary/30" />
                          <button onClick={() => setTxReceiptImage("")} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px] font-bold">&times;</button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                <div className="pt-2 space-y-1">
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Subtotal</span>
                    <span>{settings.storeCurrency} {subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-end text-xl font-bold text-primary pt-2 border-t border-black/10 dark:border-white/10">
                    <span>Total a Pagar</span>
                    <div className="text-right flex flex-col">
                      <span>{settings.storeCurrency} {total.toFixed(2)}</span>
                      {settings.storeExchangeRate > 0 && settings.storeCurrencySecondary && (
                        <span className="text-sm text-muted-foreground">{settings.storeCurrencySecondary} {(total * settings.storeExchangeRate).toFixed(2)}</span>
                      )}
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    if (paymentMethod === 'Seleccionar') {
                      showToast("Debes seleccionar un método de pago.", "error");
                      return;
                    }
                    if (['Transferencia', 'Pago Móvil', 'Binance'].includes(paymentMethod)) {
                      if (!txReference.trim() || !txReceiptImage) {
                        showToast(`Debes ingresar la referencia y el capture de tu ${paymentMethod}.`, "warning");
                        return;
                      }
                    }
                    handleCheckout();
                    setShowAthleteCart(false);
                  }}
                  disabled={cart.length === 0}
                  className="w-full bg-primary text-primary-foreground font-black py-3.5 rounded-xl hover:bg-primary/90 transition shadow-lg shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed drop-shadow-md"
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
      <div className="flex justify-between items-end flex-wrap gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tighter bg-gradient-to-r from-primary dark:dark:via-white via-black via-black to-primary/50 bg-clip-text text-transparent dark:dark:drop-shadow-[0_0_15px_rgba(255,255,255,0.1)] drop-shadow-sm drop-shadow-sm mb-4">Tienda {settings.appName}</h1>
          <StoreNav />
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <button onClick={() => setShowAdminCart(true)} className={`bg-primary text-primary-foreground font-bold py-2 px-4 rounded-xl flex items-center gap-2 hover:bg-primary/90 transition shadow-lg shadow-primary/20 ${cartAnim ? 'animate-bounce' : ''}`}>
              <ShoppingCart className="h-5 w-5" />
              <span>Pagar / Carrito ({cart.reduce((a, b) => a + b.qty, 0)})</span>
            </button>
            {cart.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full animate-pulse">
                {cart.reduce((a, b) => a + b.qty, 0)}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0">
        
        {/* LADO IZQUIERDO: PRODUCTOS */}
        <div className="flex-1 flex flex-col min-h-0">
          
          {/* Filtros + Buscador */}
          <div className="flex items-center gap-2 mb-4">
            <FilterDropdown
              categories={categories}
              activeCategory={activeCategory}
              onCategoryChange={setActiveCategory}
              priceMin={priceMin}
              priceMax={priceMax}
              onPriceMinChange={setPriceMin}
              onPriceMaxChange={setPriceMax}
            />
            <form onSubmit={handleBarcodeSearch} className="relative flex-1 hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input 
                ref={barcodeInputRef}
                type="text" 
                placeholder="Escanea código de barras o busca por nombre..." 
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors"
              />
            </form>
          </div>

          {/* Cuadrícula de Productos */}
          <div className="flex-1 overflow-y-auto min-h-0 pb-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4 p-2">
              {filteredProducts.map(p => {
                const isOutOfStock = p.currentStock <= 0
                return (
                  <Card 
                    key={p.id} 
                    onClick={(e) => !isOutOfStock && addToCart(p, e)}
                    className={`group cursor-pointer bg-card/80 border-black/5 dark:border-white/5 overflow-hidden rounded-xl transition-all duration-300 ${isOutOfStock ? 'opacity-50 grayscale' : 'hover:scale-[1.03] hover:border-primary hover:shadow-[0_0_20px_rgba(255,255,255,0.15)] hover:bg-card z-0 hover:z-10'}`}
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
                      <div className="absolute bottom-2 right-2 bg-black/80 backdrop-blur-sm px-2 py-1 rounded-md border border-black/10 dark:border-white/10 text-primary font-bold text-xs shadow-xl z-20">
                        {settings.storeCurrency} {p.sellPrice.toFixed(2)}
                        {settings.storeCurrencySecondary && settings.storeExchangeRate > 0 && (
                          <div className="text-[10px] text-muted-foreground mt-0.5">
                            {settings.storeCurrencySecondary} {(p.sellPrice * settings.storeExchangeRate).toFixed(2)}
                          </div>
                        )}
                      </div>
                    </div>
                    <CardContent className="p-3">
                      <div className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider mb-1 truncate">{p.category}</div>
                      <h3 className="font-bold text-xs leading-tight line-clamp-2 min-h-[2rem] group-hover:text-primary transition-colors" title={p.name}>{p.name}</h3>
                      <div className="flex justify-between items-center mt-2 pt-2 border-t border-black/5 dark:border-white/5">
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

        {/* LADO DERECHO: CARRITO Y FACTURACIÓN (AHORA EN MODAL) */}
        {showAdminCart && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
            <div className="w-[95vw] max-w-2xl max-h-[95vh] flex flex-col bg-card border border-black/10 dark:border-white/10 rounded-xl glass shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              <div className="p-4 border-b border-black/10 dark:border-white/10 bg-black/20 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5 text-primary" />
                  <h2 className="font-bold text-lg">Ticket de Compra</h2>
                </div>
                <button onClick={() => setShowAdminCart(false)} className="text-muted-foreground hover:text-white transition p-1">
                  &times;
                </button>
              </div>

          {/* Items del Carrito */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[100px]">
            {cart.map(item => (
              <div key={item.productId} className="flex justify-between items-center bg-black/5 dark:bg-black/40 p-3 rounded-lg border border-black/5 dark:border-white/5">
                <div className="flex-1">
                  <h4 className="font-bold text-sm leading-tight">{item.name}</h4>
                  <p className="text-xs text-muted-foreground">{settings.storeCurrency} {item.price.toFixed(2)} c/u</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center bg-black/5 dark:bg-white/5 rounded-lg border border-black/10 dark:border-white/10">
                    <button onClick={()=>updateQty(item.productId, -1)} className="p-1 hover:bg-black/10 dark:bg-white/10 text-muted-foreground hover:text-red-400 rounded-l-lg"><Minus className="h-4 w-4"/></button>
                    <span className="w-6 text-center text-sm font-bold">{item.qty}</span>
                    <button onClick={()=>updateQty(item.productId, 1)} className="p-1 hover:bg-black/10 dark:bg-white/10 text-muted-foreground hover:text-green-400 rounded-r-lg"><Plus className="h-4 w-4"/></button>
                  </div>
                  <div className="font-bold text-sm w-16 text-right">
                    {settings.storeCurrency} {item.subtotal.toFixed(2)}
                  </div>
                </div>
              </div>
            ))}
            {cart.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-50 py-10">
                <ShoppingCart className="h-12 w-12 mb-4" />
                <p>Carrito Vacío</p>
                <p className="text-xs text-center mt-2 max-w-[200px]">Usa el lector de código de barras o selecciona un producto de la lista.</p>
              </div>
            )}
          </div>

          {/* Zona de Pago */}
          <div className="p-4 border-t border-black/10 dark:border-white/10 bg-black/5 dark:bg-black/40 space-y-4 flex-shrink-0 max-h-[65vh] overflow-y-auto">
            
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
                  className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm focus:border-primary"
                />
                {clientSearchQuery && !selectedAthleteId && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-black/10 dark:border-white/10 rounded-lg shadow-xl max-h-40 overflow-y-auto z-10 glass">
                    {athletes.filter(a => a.name.toLowerCase().includes(clientSearchQuery.toLowerCase()) || a.cedula.includes(clientSearchQuery)).map(a => (
                      <button 
                        type="button"
                        key={a.id} 
                        onClick={() => { setSelectedAthleteId(a.id); setClientSearchQuery(`${a.name} (${a.cedula})`); }}
                        className="w-full text-left px-4 py-2 hover:bg-black/10 dark:bg-white/10 text-sm border-b border-black/5 dark:border-white/5 last:border-0"
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
                {['Efectivo', 'Tarjeta', 'Transferencia', 'Pago Móvil', 'Binance'].map(m => (
                  <button 
                    key={m}
                    onClick={() => setPaymentMethod(m as any)}
                    className={`flex-auto px-2 py-2 rounded border text-xs font-bold transition whitespace-nowrap ${paymentMethod === m ? 'bg-primary/20 border-primary text-primary' : 'bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10 text-muted-foreground hover:bg-black/10 dark:bg-white/10'}`}
                  >
                    {m === 'Transferencia' ? 'Transf.' : m}
                  </button>
                ))}
              </div>
            </div>

            {(paymentMethod === 'Transferencia' || paymentMethod === 'Pago Móvil' || paymentMethod === 'Binance') && (
              <div className="space-y-3 pt-2">
                <div className="p-3 bg-primary/10 border border-primary/20 rounded-lg whitespace-pre-wrap text-xs text-primary font-medium flex items-center gap-3">
                  <div className="flex-1">
                    {paymentMethod === 'Pago Móvil' && settings.storePaymentInstructions?.pagoMovil}
                    {paymentMethod === 'Transferencia' && settings.storePaymentInstructions?.transferencia}
                    {paymentMethod === 'Binance' && settings.storePaymentInstructions?.binance}
                  </div>
                  {(() => {
                    const qr = paymentMethod === 'Pago Móvil' ? settings.storePaymentQRs?.pagoMovil
                      : paymentMethod === 'Transferencia' ? settings.storePaymentQRs?.transferencia
                      : paymentMethod === 'Binance' ? settings.storePaymentQRs?.binance : null;
                    return qr ? (
                      <button type="button" onClick={() => setShowQRModal(qr)} className="p-2 rounded-lg bg-primary/20 hover:bg-primary/30 transition shrink-0" title="Ver QR">
                        <Eye className="h-5 w-5 text-primary" />
                      </button>
                    ) : null;
                  })()}
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">Número de Referencia ({paymentMethod})</label>
                  <input 
                    type="text" 
                    value={txReference}
                    onChange={(e) => setTxReference(e.target.value)}
                    placeholder="Ej. 12345678"
                    className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-lg p-2 text-sm focus:border-primary" 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">Comprobante (Capture)</label>
                  <div className="flex gap-2">
                    <label className="flex-1 flex items-center justify-center gap-2 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 rounded-lg p-2 text-xs font-semibold cursor-pointer transition">
                      <ImageIcon className="h-4 w-4 shrink-0" />
                      <span className="truncate">Galería</span>
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
                        className="hidden" 
                      />
                    </label>
                    <label className="flex-1 flex items-center justify-center gap-2 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 rounded-lg p-2 text-xs font-semibold cursor-pointer transition">
                      <Camera className="h-4 w-4 shrink-0" />
                      <span className="truncate">Cámara</span>
                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) {
                            const reader = new FileReader()
                            reader.onloadend = () => setTxReceiptImage(reader.result as string)
                            reader.readAsDataURL(file)
                          }
                        }}
                        className="hidden"
                      />
                    </label>
                  </div>
                  {txReceiptImage && (
                    <div className="mt-2 relative w-20 h-20">
                      <img src={txReceiptImage} alt="Comprobante" className="w-20 h-20 object-cover rounded-lg border border-primary/30" />
                      <button onClick={() => setTxReceiptImage("")} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px] font-bold">&times;</button>
                    </div>
                  )}
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
              <div className="flex justify-between items-end text-xl font-bold text-primary pt-2 border-t border-black/10 dark:border-white/10">
                <span>Total</span>
                <div className="text-right flex flex-col">
                  <span>{settings.storeCurrency} {total.toFixed(2)}</span>
                  {settings.storeExchangeRate > 0 && settings.storeCurrencySecondary && (
                    <span className="text-sm text-muted-foreground">{settings.storeCurrencySecondary} {(total * settings.storeExchangeRate).toFixed(2)}</span>
                  )}
                </div>
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
        )}
      </div>
      
      {/* MODAL DE OVERRIDE DE STOCK */}
      {showAdminOverride && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="bg-card border border-black/10 dark:border-white/10 rounded-xl max-w-sm w-full p-6 shadow-2xl glass">
            <h3 className="text-xl font-bold mb-2 text-red-500">Autorización Requerida</h3>
            <p className="text-sm text-muted-foreground mb-4">El producto <strong>{pendingCartProduct?.name}</strong> no tiene stock. Ingrese Cédula o pase código de Administrador para facturar sin stock.</p>
            <form onSubmit={handleAdminOverride} className="space-y-4">
              <input 
                type="password" 
                autoFocus
                placeholder="Cédula de Administrador..." 
                value={adminCedula}
                onChange={e => setAdminCedula(e.target.value)}
                className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-lg p-3 text-sm focus:border-primary"
              />
              <div className="flex gap-2 justify-end">
                <button type="button" onClick={() => {setShowAdminOverride(false); setPendingCartProduct(null);}} className="px-4 py-2 rounded bg-black/10 dark:bg-white/10 hover:bg-white/20">Cancelar</button>
                <button type="submit" className="px-4 py-2 rounded bg-red-500 text-white font-bold hover:bg-red-600">Autorizar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL CLIENTE DE PASO */}
      {showWalkInModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="bg-card border border-black/10 dark:border-white/10 rounded-xl max-w-sm w-full p-6 shadow-2xl glass">
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
                  className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-lg p-2 text-sm focus:border-primary"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Nombre</label>
                <input 
                  required type="text" value={walkInName} onChange={e => setWalkInName(e.target.value)}
                  className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-lg p-2 text-sm focus:border-primary"
                />
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <button type="button" onClick={() => setShowWalkInModal(false)} className="px-4 py-2 text-sm rounded bg-black/10 dark:bg-white/10 hover:bg-white/20">Cancelar</button>
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
                {showReceipt.pickupCode && (
                  <div className="mt-2 mb-2 p-2 border-2 border-dashed border-black bg-gray-100">
                    <p className="font-bold">CÓDIGO DE RETIRO</p>
                    <p className="text-xl font-black">{showReceipt.pickupCode}</p>
                  </div>
                )}
                <p className="text-black">{new Date(showReceipt.date).toLocaleString()}</p>
                <p className="text-black mt-2">Cajero: {user?.name}</p>
                <p className="text-black">Cliente: {showReceipt.customerId ? athletes.find(a=>a.id === showReceipt.customerId)?.name : 'Consumidor Final'}</p>
                {showReceipt.deliveredBy && (
                  <p className="text-black font-bold">Despachado por: {showReceipt.deliveredBy}</p>
                )}
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
                    <span className="shrink-0 font-bold">{settings.storeCurrencySecondary} {(item.subtotal * (settings.storeExchangeRate || 1)).toFixed(2)}</span>
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
                  <span>{settings.storeCurrencySecondary} {(showReceipt.subtotal * (settings.storeExchangeRate || 1)).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>IVA ({settings.storeTaxRate}%)</span>
                  <span>{settings.storeCurrencySecondary} {(showReceipt.tax * (settings.storeExchangeRate || 1)).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xl font-black mt-2 pt-2 border-t border-black">
                  <span>TOTAL</span>
                  <span>{settings.storeCurrencySecondary} {(showReceipt.total * (settings.storeExchangeRate || 1)).toFixed(2)}</span>
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

      {/* MODAL QR FULLSCREEN */}
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

      {/* FLYING ITEMS */}
      {flyingItems.map(item => (
        <div 
          key={item.id}
          className="fixed z-[9999] pointer-events-none animate-fly-to-cart"
          style={{
            '--startX': `${item.x}px`,
            '--startY': `${item.y}px`,
          } as any}
        >
          {item.image ? (
            <img src={item.image} className="w-16 h-16 object-cover rounded-xl shadow-2xl drop-shadow-xl" />
          ) : (
            <div className="w-10 h-10 bg-primary rounded-full shadow-2xl drop-shadow-xl flex items-center justify-center text-primary-foreground font-bold text-xs"><ShoppingCart className="h-5 w-5"/></div>
          )}
        </div>
      ))}
      <style>{`
        @keyframes flyToCart {
          0% { 
            left: var(--startX); 
            top: var(--startY); 
            transform: translate(-50%, -50%) scale(1) rotate(0deg); 
            opacity: 1; 
          }
          100% { 
            left: calc(100vw - 80px); 
            top: 60px; 
            transform: translate(-50%, -50%) scale(0.2) rotate(360deg); 
            opacity: 0; 
          }
        }
        .animate-fly-to-cart {
          animation: flyToCart 0.7s cubic-bezier(0.2, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  )
}
