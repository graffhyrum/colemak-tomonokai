import { expect, test } from "@playwright/test";
import { env } from "../config/env";

test("layout and keyboard selects are populated and functional", async ({
	page,
}) => {
	// Navigate to the page
	await page.goto(`http://${env.APP_HOST}:${env.APP_PORT}`);

	// Check that layout select exists and has correct options
	const layoutSelect = page.locator('select[name="layout"]');
	await expect(layoutSelect).toBeVisible();

	// Check layout options
	const layoutOptions = layoutSelect.locator("option");
	await expect(layoutOptions).toHaveCount(11); // All layouts from LAYOUT_NAMES

	// Check specific layout options exist
	await expect(layoutSelect).toContainText("Colemak");
	await expect(layoutSelect).toContainText("QWERTY");
	await expect(layoutSelect).toContainText("Dvorak");
	await expect(layoutSelect).toContainText("Workman");

	// Check that Colemak is selected by default
	await expect(layoutSelect).toHaveValue("colemak");

	// Check that keyboard select exists and has correct options
	const keyboardSelect = page.locator('select[name="keyboard"]');
	await expect(keyboardSelect).toBeVisible();

	// Check keyboard options
	const keyboardOptions = keyboardSelect.locator("option");
	await expect(keyboardOptions).toHaveCount(3); // ansi, iso, ortho

	// Check specific keyboard options exist
	await expect(keyboardSelect).toContainText("ANSI");
	await expect(keyboardSelect).toContainText("ISO");
	await expect(keyboardSelect).toContainText("Ortho");

	// Check that ANSI is selected by default
	await expect(keyboardSelect).toHaveValue("ansi");

	// Test changing layout
	await layoutSelect.selectOption("qwerty");
	await expect(layoutSelect).toHaveValue("qwerty");

	// Test changing keyboard
	await keyboardSelect.selectOption("iso");
	await expect(keyboardSelect).toHaveValue("iso");

	// Verify that the page still functions after changes
	await expect(page.locator("h1")).toContainText("Colemak 友の会");
	await expect(page.locator("nav")).toBeVisible();
});
