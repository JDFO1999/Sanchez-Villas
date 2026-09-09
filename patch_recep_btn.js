const fs = require('fs');
let c = fs.readFileSync('components/dashboards/reception-dashboard.tsx', 'utf8');

const oldButton = `onClick={() => {
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
                      }}`;

const newButton = `onClick={() => {
                        Swal.fire({
                          title: 'Validar Entrega',
                          text: 'Introduce el Código de Retiro que el atleta tiene en su pantalla:',
                          input: 'text',
                          inputPlaceholder: 'Ej: J3M2N',
                          showCancelButton: true,
                          confirmButtonText: 'Validar y Entregar',
                          cancelButtonText: 'Cancelar'
                        }).then((result) => {
                          if (result.isConfirmed) {
                            if (result.value?.toUpperCase() === tx.id.slice(-5).toUpperCase()) {
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
                            } else {
                              Swal.fire('Error', 'El código ingresado es incorrecto.', 'error')
                            }
                          }
                        })
                      }}`;

if (c.includes('deliverTransaction(tx.id, user?.id || \'\').then(res => {')) {
    c = c.replace(oldButton, newButton);
    fs.writeFileSync('components/dashboards/reception-dashboard.tsx', c, 'utf8');
    console.log('Patched reception dashboard');
} else {
    console.log('Could not find oldButton');
}
