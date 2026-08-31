export interface Product {
  id: string
  barcode: string
  name: string
  department: string // e.g. "Nutrición", "Ropa", "Accesorios"
  category: string // e.g. "Proteínas", "Pre-entrenos", "Camisetas"
  costPrice: number
  sellPrice: number
  currentStock: number
  minStockAlert: number
  imageUrl?: string
}

export interface TransactionItem {
  productId: string
  name: string
  qty: number
  price: number
  subtotal: number
}

export interface Transaction {
  id: string
  date: string
  cashierId: string
  customerId?: string // null if walk-in client
  items: TransactionItem[]
  subtotal: number
  tax: number
  total: number
  paymentMethod: 'Efectivo' | 'Tarjeta' | 'Transferencia' | 'Pago Móvil'
  reference?: string // For Transferencia y Pago Movil
  receiptImage?: string // For Transferencia y Pago Movil (Base64)
}

const PRODUCTS_DB_KEY = "gympro_products_db"
const TRANSACTIONS_DB_KEY = "gympro_transactions_db"
const DEPTS_DB_KEY = "gympro_depts_db"
const CATS_DB_KEY = "gympro_cats_db"

export const storeService = {
  getProducts: (): Product[] => {
    if (typeof window === "undefined") return []
    const data = localStorage.getItem(PRODUCTS_DB_KEY)
    if (!data) {
      const initial: Product[] = [
        {
          id: 'p1',
          barcode: '7701234567890',
          name: 'Whey Protein Gold Standard 5lbs',
          department: 'Nutrición',
          category: 'Proteínas',
          costPrice: 45.00,
          sellPrice: 70.00,
          currentStock: 12,
          minStockAlert: 5
        },
        {
          id: 'p2',
          barcode: '7701234567891',
          name: 'Creatina Monohidratada 300g',
          department: 'Nutrición',
          category: 'Aminoácidos',
          costPrice: 15.00,
          sellPrice: 30.00,
          currentStock: 3, // Low stock alert
          minStockAlert: 10
        },
        {
          id: 'p3',
          barcode: '7701234567892',
          name: 'Camiseta Dry-Fit GymPro (L)',
          department: 'Ropa',
          category: 'Camisetas',
          costPrice: 8.00,
          sellPrice: 20.00,
          currentStock: 25,
          minStockAlert: 5
        }
      ]
      localStorage.setItem(PRODUCTS_DB_KEY, JSON.stringify(initial))
      return initial
    }
    return JSON.parse(data)
  },

  updateProduct: (product: Product) => {
    const products = storeService.getProducts()
    const index = products.findIndex(p => p.id === product.id)
    if (index >= 0) {
      products[index] = product
    } else {
      products.push(product)
    }
    localStorage.setItem(PRODUCTS_DB_KEY, JSON.stringify(products))
  },

  deleteProduct: (id: string) => {
    let products = storeService.getProducts()
    products = products.filter(p => p.id !== id)
    localStorage.setItem(PRODUCTS_DB_KEY, JSON.stringify(products))
  },

  getTransactions: (): Transaction[] => {
    if (typeof window === "undefined") return []
    const data = localStorage.getItem(TRANSACTIONS_DB_KEY)
    if (!data) {
      return []
    }
    return JSON.parse(data)
  },

  addTransaction: (tx: Transaction) => {
    const transactions = storeService.getTransactions()
    transactions.push(tx)
    localStorage.setItem(TRANSACTIONS_DB_KEY, JSON.stringify(transactions))

    // Reduce stock
    const products = storeService.getProducts()
    tx.items.forEach(item => {
      const prodIndex = products.findIndex(p => p.id === item.productId)
      if (prodIndex >= 0) {
        products[prodIndex].currentStock -= item.qty
      }
    })
    localStorage.setItem(PRODUCTS_DB_KEY, JSON.stringify(products))
  },
  
  getDepartments: (): string[] => {
    if (typeof window === "undefined") return []
    const data = localStorage.getItem(DEPTS_DB_KEY)
    if (!data) return ["Nutrición", "Ropa", "Accesorios", "Servicios"]
    return JSON.parse(data)
  },

  addDepartment: (dept: string) => {
    const depts = storeService.getDepartments()
    if (!depts.includes(dept)) {
      depts.push(dept)
      localStorage.setItem(DEPTS_DB_KEY, JSON.stringify(depts))
    }
  },

  getCategories: (): string[] => {
    if (typeof window === "undefined") return []
    const data = localStorage.getItem(CATS_DB_KEY)
    if (!data) return ["Proteínas", "Aminoácidos", "Camisetas", "Mensualidades"]
    return JSON.parse(data)
  },

  addCategory: (cat: string) => {
    const cats = storeService.getCategories()
    if (!cats.includes(cat)) {
      cats.push(cat)
      localStorage.setItem(CATS_DB_KEY, JSON.stringify(cats))
    }
  },
  
  getDepartmentsAndCategories: () => {
    const depts = storeService.getDepartments()
    const cats = storeService.getCategories()
    return { depts, cats }
  }
}
