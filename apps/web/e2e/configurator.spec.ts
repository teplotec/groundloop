import { expect, test } from '@playwright/test';

test('touch-first configurator reacts to dependent choices and calculates', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { name: /Підбираємо контур цифрами/ })).toBeVisible();
  await expect(page.locator('select')).toHaveCount(0);
  await expect(page.getByRole('button', { name: /Single-U/ })).toBeVisible();
  await expect(page.getByRole('button', { name: /PG 20%/ })).toBeVisible();
  await expect(page.getByRole('button', { name: /40 × 3.7/ })).toBeVisible();

  await page.getByRole('button', { name: /Double-U/ }).click();
  await expect(page.getByText('0.24', { exact: true }).first()).toBeVisible();

  await page.getByRole('button', { name: /Порівняти 4 труби/ }).click();

  await expect(page.getByRole('heading', { name: 'Порівняння кандидатів' })).toBeVisible();
  await expect(page.getByText(/PE100-RC 40 × 3.7/)).toBeVisible();
  await expect(page.getByText('provisional', { exact: true })).toBeVisible();
});
