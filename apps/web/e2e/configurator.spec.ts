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

  const submit = page.getByRole('button', { name: /Порівняти 4 труби/ });
  await submit.scrollIntoViewIfNeeded();

  const diagnostics = await submit.evaluate((button) => {
    const wrapper = button.parentElement;
    const previous = wrapper?.previousElementSibling;
    const rect = button.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const serializeRect = (element: Element | null | undefined) => {
      if (!element) return null;
      const value = element.getBoundingClientRect();
      return {
        top: value.top,
        right: value.right,
        bottom: value.bottom,
        left: value.left,
        width: value.width,
        height: value.height,
      };
    };

    return {
      viewport: { width: window.innerWidth, height: window.innerHeight },
      button: serializeRect(button),
      wrapper: serializeRect(wrapper),
      wrapperPosition: wrapper ? getComputedStyle(wrapper).position : null,
      previous: serializeRect(previous),
      hitStack: document.elementsFromPoint(centerX, centerY).slice(0, 6).map((element) => ({
        tag: element.tagName,
        className: element.className,
        text: element.textContent?.trim().slice(0, 80) ?? '',
        position: getComputedStyle(element).position,
        zIndex: getComputedStyle(element).zIndex,
      })),
    };
  });

  console.log('mobile-submit-diagnostics', JSON.stringify(diagnostics));

  await submit.click();

  await expect(page.getByRole('heading', { name: 'Порівняння кандидатів' })).toBeVisible();
  await expect(page.getByText(/PE100-RC 40 × 3.7/)).toBeVisible();
  await expect(page.getByText('provisional', { exact: true })).toBeVisible();
});
