import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
	await page.goto(
		"file:///C:/Users/graff/WebstormProjects/colemak-tomonokai/index.html",
	);
});

test("has title", async ({ page }) => {
	// Expect a title "to contain" a substring.
	await expect(page).toHaveTitle(/Colemak/);
});

test("screenshot", async ({ page }) => {
	await expect(page).toHaveScreenshot({
		mask: [page.locator("h2.prompt")],
	});
});
