import { expect, test } from '@playwright/test';

test('touch-first configurator reacts to dependent choices and calculates', async ({ page }, testInfo) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { name: /Підбираємо контур цифрами/ })).toBeVisible();
  await expect(page.locator('select')).toHaveCount(0);
  await expect(page.getByRole('button', { name: /Single-U/ })).toBeVisible();
  await expect(page.getByRole('button', { name: /PG 20%/ })).toBeVisible();
  await expect(page.getByRole('button', { name: /40 × 3.7/ })).toBeVisible();

  await page.getByRole('button', { name: /Double-U/ }).click();
  await expect(page.getByText('0.24', { exact: true }).first()).toBeVisible();

  const submit = page.getByRole('button', { name: /Порівняти 4 труби/ });

  if (testInfo.project.name === 'mobile-chromium') {
    await submit.scrollIntoViewIfNeeded();
    const box = await submit.boundingBox();
    expect(box).not.toBeNull();
    if (!box) throw new Error('Mobile submit button has no bounding box');

    const point = {
      x: box.x + box.width / 2,
      y: box.y + box.height / 2,
    };
    const submitIsHitTarget = await page.evaluate(({ x, y }) => {
      const hit = document.elementFromPoint(x, y);
      return Boolean(hit?.closest('button.primary-action'));
    }, point);

    expect(submitIsHitTarget).toBe(true);
    await page.touchscreen.tap(point.x, point.y);
  } else {
    await submit.click();
  }

  await expect(page.getByRole('heading', { name: 'Порівняння кандидатів' })).toBeVisible();
  await expect(page.getByText(/PE100-RC 40 × 3.7/)).toBeVisible();
  await expect(page.getByText('provisional', { exact: true })).toBeVisible();
});
