import { test, expect } from '@playwright/test';

// Placeholder smoke test — replaced by the real room-flow e2e in M1.
test('app shell loads', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('app-root')).toBeVisible();
});
