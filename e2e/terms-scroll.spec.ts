import { test, expect } from '@playwright/test';

test.describe('Modal de Términos y Condiciones', () => {
  test('debe abrirse y permitir hacer scroll hasta el final', async ({ page }) => {
    await page.goto('/registro');
    await page.waitForLoadState('networkidle');

    // Esperar a que el botón esté listo y clickearlo
    const termsBtn = page.locator('#btn-open-terms');
    await expect(termsBtn).toBeVisible();
    await termsBtn.click();

    // Esperar al diálogo
    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible({ timeout: 5000 });

    // Esperar al contenedor de scroll interno
    const scrollContainer = page.locator('div[role="region"][aria-label="Contenido de Términos y Condiciones"]');
    await expect(scrollContainer).toBeVisible();

    // Medir dimensiones
    const dims = await scrollContainer.evaluate(el => ({
      clientHeight: el.clientHeight,
      scrollHeight: el.scrollHeight,
      scrollTop: el.scrollTop,
    }));

    console.log('DIMENSIONES DEL MODAL:', dims);
    expect(dims.scrollHeight).toBeGreaterThan(dims.clientHeight);

    // Mover rueda del ratón hacia abajo
    await scrollContainer.hover();
    await page.mouse.wheel(0, 800);
    await page.waitForTimeout(500);

    const scrolledTop = await scrollContainer.evaluate(el => el.scrollTop);
    console.log('SCROLLTOP TRAS RUEDA:', scrolledTop);
    expect(scrolledTop).toBeGreaterThan(0);

    // Verificar que el footer con el botón está visible en el viewport
    const footerBtn = page.getByRole('button', { name: /Entendido y Cerrar|Aceptar y Continuar/i });
    await expect(footerBtn).toBeVisible();
  });
});
