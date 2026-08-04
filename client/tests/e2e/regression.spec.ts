import { test, expect } from '@playwright/test';

test('auth routes preserve key headings and honest social login messaging', async ({ page }) => {
  await page.goto('/login');
  await expect(page.getByText(/google próximamente/i)).toBeVisible();
  await expect(page.getByRole('heading', { level: 1, name: /^bienvenido$/i })).toBeVisible();

  await page.goto('/register');
  await expect(page.getByRole('heading', { name: /crea tu cuenta/i })).toBeVisible();
  await expect(page.getByLabel(/correo electrónico/i)).toBeVisible();
});
