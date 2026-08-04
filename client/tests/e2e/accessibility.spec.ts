import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const PUBLIC_ROUTES = ['/login', '/register'];
const CLIENT_ROUTES = ['/home', '/cart', '/checkout', '/catalogo', '/products/1'];
const ADMIN_ROUTES = ['/admin', '/admin/products', '/admin/orders', '/admin/users', '/admin/settings'];

async function expectNoCriticalA11yViolations(page: Page, pageUrl: string) {
  await page.goto(pageUrl);
  await page.waitForLoadState('networkidle').catch(() => undefined);

  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa'])
    .analyze();

  const criticalOrSerious = results.violations.filter((violation) =>
    ['critical', 'serious'].includes(violation.impact ?? '')
  );

  expect(criticalOrSerious).toEqual([]);
}

async function seedClientSession(page: Page) {
  await page.addInitScript(() => {
    localStorage.setItem(
      'vibe-pulse-auth',
      JSON.stringify({ id: 1, name: 'Cliente QA', email: 'qa@cliente.test', role: 'CLIENT' })
    );
    localStorage.setItem('vibe-pulse-token', 'qa-client-token');
  });
}

async function seedAdminSession(page: Page) {
  await page.addInitScript(() => {
    localStorage.setItem(
      'vibe-pulse-auth',
      JSON.stringify({ id: 2, name: 'Admin QA', email: 'qa@admin.test', role: 'ADMIN' })
    );
    localStorage.setItem('vibe-pulse-token', 'qa-admin-token');
  });
}

test('public auth routes have no critical accessibility violations', async ({ page }) => {
  for (const route of PUBLIC_ROUTES) {
    await expectNoCriticalA11yViolations(page, route);
  }
});

test('authenticated client routes have no critical accessibility violations', async ({ page }) => {
  await seedClientSession(page);

  for (const route of CLIENT_ROUTES) {
    await expectNoCriticalA11yViolations(page, route);
  }
});

test('authenticated admin routes have no critical accessibility violations', async ({ page }) => {
  await seedAdminSession(page);

  for (const route of ADMIN_ROUTES) {
    await expectNoCriticalA11yViolations(page, route);
  }
});

test('login route supports basic keyboard navigation', async ({ page }) => {
  await page.goto('/login');

  await page.keyboard.press('Tab');
  await expect(page.locator('#login-email')).toBeFocused();

  await page.keyboard.press('Tab');
  await expect(page.locator('#login-password')).toBeFocused();

  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: /mostrar contrase.+|ocultar contrase.+/i })).toBeFocused();
});
