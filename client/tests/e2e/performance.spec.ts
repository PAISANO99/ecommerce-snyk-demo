import { test, expect } from '@playwright/test';

test('login route reaches DOMContentLoaded quickly enough for baseline performance', async ({ page }) => {
  const startedAt = Date.now();
  await page.goto('/login', { waitUntil: 'domcontentloaded' });
  const elapsed = Date.now() - startedAt;

  expect(elapsed).toBeLessThan(5000);
});
