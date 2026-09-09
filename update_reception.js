const fs = require('fs');

let c = fs.readFileSync('components/dashboards/reception-dashboard.tsx', 'utf8');

if (!c.includes('Package')) {
    c = c.replace('Wallet, Camera } from "lucide-react"', 'Wallet, Camera, Package } from "lucide-react"');
}

if (!c.includes('const [pendingOrders, setPendingOrders]')) {
    c = c.replace('const [search, setSearch] = useState("")', `const [search, setSearch] = useState("")
  const [pendingOrders, setPendingOrders] = useState<any[]>([])

  const fetchPendingOrders = () => {
    import('@/app/actions/store').then(({ getPendingTransactions }) => {
      getPendingTransactions().then(res => {
        if (res.success) setPendingOrders(res.transactions)
      })
    })
  }

  useEffect(() => {
    fetchPendingOrders()
    const interval = setInterval(fetchPendingOrders, 30000)
    return () => clearInterval(interval)
  }, [])`);
}

const newCard = `        <Card className="col-span-1 md:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Package className="h-5 w-5 text-orange-500" />
              Pedidos en Espera (Tienda)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pendingOrders.length === 0 ? (
              <p className="text-sm text-muted-foreground">No hay pedidos pendientes de entrega.</p>
            ) : (
              <div className="space-y-4">
                {pendingOrders.map(tx => (
                  <div key={tx.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-orange-500/10 p-4 rounded-lg border border-orange-500/20">
                    <div>
                      <div className="flex gap-2 items-center mb-1">
                        <span className="font-mono text-xl font-black bg-white text-black px-2 rounded border border-black shadow-sm">{tx.id.slice(-5).toUpperCase()}</span>
                        <span className="font-bold">{tx.customer?.name || 'Atleta'}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{tx.items.map((i: any) => \`\${i.qty}x \${i.name}\`).join(', ')}</p>
                      <p className="text-[10px] text-muted-foreground font-bold mt-1">Pago: {tx.paymentMethod}</p>
                    </div>
                    <button 
                      onClick={() => {
                        import('@/app/actions/store').then(({ deliverTransaction }) => {
                          deliverTransaction(tx.id, user?.id || '').then(res => {
                            if (res.success) {
                              fetchPendingOrders()
                              Swal.fire({ title: 'Pedido Entregado', icon: 'success', toast: true, position: 'top-end', showConfirmButton: false, timer: 3000 })
                            } else {
                              Swal.fire({ title: 'Error', text: res.error, icon: 'error', toast: true, position: 'top-end', showConfirmButton: false, timer: 3000 })
                            }
                          })
                        })
                      }}
                      className="bg-orange-500 text-white px-4 py-2 rounded-lg font-bold shadow hover:bg-orange-600 transition w-full sm:w-auto"
                    >
                      Marcar Entregado
                    </button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-1 md:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Control de Acceso Manual</CardTitle>`;

c = c.replace(`<Card className="col-span-1 md:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Control de Acceso Manual</CardTitle>`, newCard);

fs.writeFileSync('components/dashboards/reception-dashboard.tsx', c, 'utf8');
console.log('Updated reception-dashboard.tsx');
