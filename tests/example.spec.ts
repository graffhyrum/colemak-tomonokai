import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
  await page.goto('file:///C:/Users/graff/WebstormProjects/colemak-tomonokai/index.html');

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/Colemak/);
});

