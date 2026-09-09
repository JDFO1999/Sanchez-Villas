const fs = require('fs');

let c = fs.readFileSync('app/tienda/page.tsx', 'utf8');
const checkoutRegex = /setCart\(\[\]\)[\s\S]*?showToast\("Compra completada exitosamente.", "success"\)[\s\S]*?router\.refresh\(\)/;

const newCheckout = `setCart([])
      
      if (isAthlete) {
        showToast("Compra completada exitosamente. Revisa tus Compras Recientes.", "success");
        router.push('/'); // Navigate to dashboard
        router.refresh();
      } else {
        setShowReceipt(res.transaction);
        setShowAdminCart(false);
        setTxReference("");
        setTxReceiptImage("");
        showToast("Compra completada exitosamente.", "success");
        router.refresh();
      }`;

c = c.replace(checkoutRegex, newCheckout);

// And we can remove the injected modal in Athlete view since they redirect now
const modalRegex = /\{\/\* TICKET \/ RECIBO MODAL PARA ATLETA INYECTADO \*\/\}[\s\S]*?\}\)\(\)\}/;
c = c.replace(modalRegex, '');

fs.writeFileSync('app/tienda/page.tsx', c, 'utf8');
console.log('Fixed athlete redirect in tienda');
