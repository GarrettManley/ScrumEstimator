import AxeBuilder from '@axe-core/playwright';
import { expect, Page, test } from '@playwright/test';

async function seriousViolations(page: Page) {
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
  return results.violations
    .filter((v) => v.impact === 'serious' || v.impact === 'critical')
    .map((v) => `${v.id}: ${v.help}`);
}

test('home page has no serious accessibility violations', async ({ page }) => {
  await page.goto('/');
  expect(await seriousViolations(page)).toEqual([]);
});

test('a room has no serious accessibility violations', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Your name').fill('Alice');
  await page.getByRole('button', { name: 'Create room' }).click();
  await page.waitForURL(/\/room\//);
  await expect(page.getByRole('button', { name: '5', exact: true })).toBeVisible();
  expect(await seriousViolations(page)).toEqual([]);
});
