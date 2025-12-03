import { expect, test } from "@playwright/test";

test("page loads and shows basic interface", async ({ page }) => {
	// Navigate to the page
	await page.goto("http://localhost:3000");

	// Just check that the page loads and has a title
	await expect(page.locator("h1")).toContainText("Colemak Club");

	// Check that level navigation is present
	await expect(page.locator("nav")).toBeVisible();
	const levelButtons = page.locator("nav button");
	await expect(levelButtons).toHaveCount(7);

	// Check that level 1 is selected by default
	await expect(page.locator("nav button.currentLevel")).toContainText(
		"Level 1",
	);
});
