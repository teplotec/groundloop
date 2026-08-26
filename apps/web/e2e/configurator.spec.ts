import { expect, test } from '@playwright/test';

test('touch-first configurator reacts to dependent choices and calculates', async ({ page }, testInfo) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { name: /Підбираємо контур цифрами/ })).toBeVisible();
  await expect(page.locator('select')).toHaveCount(0);
  await expect(page.getByRole('button', { name: /Single-U/ })).toBeVisible();
  await expect(page.getByRole('button', { name: /PG 20%/ })).toBeVisible();
  await expect(page.getByRole('button', { name: /PE100-RC 40 × 3.7/ })).toBeVisible();

  await page.getByRole('button', { name: /Double-U/ }).click();
  await expect(page.getByText('0.24', { exact: true }).first()).toBeVisible();

  const submit = page.getByRole('button', { name: /Порівняти 4 труби/ });

  if (testInfo.project.name === 'mobile-chromium') {
    const submitIsHitTarget = await submit.evaluate((button) => {
      button.scrollIntoView({ block: 'center', inline: 'nearest' });
      const rect = button.getBoundingClientRect();
      const hit = document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2);
      return hit === button || Boolean(hit && button.contains(hit));
    });

    expect(submitIsHitTarget).toBe(true);

    await submit.evaluate((button) => {
      (button as HTMLButtonElement).click();
    });
  } else {
    await submit.click();
  }

  const resultsHeading = page.getByRole('heading', { name: 'Порівняння кандидатів' });
  await expect(resultsHeading).toBeVisible();
  await expect(page.getByText(/PE100-RC 40 × 3.7/)).toBeVisible();
  await expect(page.getByText('попередня модель', { exact: true })).toBeVisible();

  await expect.poll(async () =>
    resultsHeading.evaluate((heading) => {
      const rect = heading.getBoundingClientRect();
      return rect.top >= 0 && rect.top < window.innerHeight;
    }),
  ).toBe(true);
});

test('Ukrainian is the default and the engineering copy can switch to English', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { name: /Підбираємо контур цифрами/ })).toBeVisible();
  await page.getByRole('button', { name: 'EN', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Size the loop with numbers, not habit.' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Pipe candidates' })).toBeVisible();

  await page.getByRole('button', { name: 'UA', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Труби для порівняння' })).toBeVisible();
});
