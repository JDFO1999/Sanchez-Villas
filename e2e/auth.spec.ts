import { test, expect } from '@playwright/test';

test.describe('Pantalla de Autenticación', () => {
  test('debe cargar /login sin errores de consola ni errores de hidratación', async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto('/login');
    await expect(page).toHaveTitle(/Maximum|Gym/i);

    // Verificar que no ocurrieron errores de hydration mismatch
    const hydrationErrors = consoleErrors.filter(err => 
      err.includes('Hydration failed') || 
      err.includes('did not match') ||
      err.includes('hydration-mismatch')
    );
    expect(hydrationErrors).toEqual([]);
  });
});
