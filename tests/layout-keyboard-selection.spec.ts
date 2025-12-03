import { expect } from "@playwright/test";
import type { LayoutName } from "../src/entities/layouts";
import { LAYOUT_DICTIONARIES, LAYOUT_NAMES } from "../src/entities/layouts";
import type { Level } from "../src/entities/levels";
import { KEYBOARD_SHAPES } from "../src/entities/shapes";
import { test } from "./fixture";

function getLevelLetters(layout: LayoutName, level: Level): string {
	const layoutDict =
		LAYOUT_DICTIONARIES[layout as keyof typeof LAYOUT_DICTIONARIES];
	if (!layoutDict) return "";
	const levelKey = `lvl${level}` as keyof typeof layoutDict;
	return (layoutDict[levelKey] as string) || "";
}

test.beforeEach(async ({ page }) => {
	await page.goto(`/`);
});

// Test that selects are populated correctly
test("layout and keyboard selects are populated", async ({ page }) => {
	await page.goto(`/`);

	// Check layout select
	const layoutSelect = page.locator('select[name="layout"]');
	await expect(layoutSelect).toBeVisible();
	const layoutOptions = layoutSelect.locator("option");
	await expect(layoutOptions).toHaveCount(LAYOUT_NAMES.length);
	await expect(layoutSelect).toHaveValue("colemak");

	// Check keyboard select
	const keyboardSelect = page.locator('select[name="keyboard"]');
	await expect(keyboardSelect).toBeVisible();
	const keyboardOptions = keyboardSelect.locator("option");
	await expect(keyboardOptions).toHaveCount(KEYBOARD_SHAPES.length);
	await expect(keyboardSelect).toHaveValue("ansi");
});

// Test keyboard shape changes
for (const shape of KEYBOARD_SHAPES) {
	test(`keyboard shape ${shape} displays correctly`, async ({ page }) => {
		await page.goto(`/`);

		const keyboardSelect = page.locator('select[name="keyboard"]');
		await keyboardSelect.selectOption(shape);
		await expect(keyboardSelect).toHaveValue(shape);

		// Verify page still functions
		await expect(page.locator("h1")).toContainText("Colemak 友の会");
		await expect(page.locator("nav")).toBeVisible();
	});
}

// Test layout changes with level 1 highlighting

test(`layout displays correct level 1 highlighting`, async ({
	page,
	layout,
}) => {
	const layoutSelect = page.locator('select[name="layout"]');
	await layoutSelect.selectOption(layout);
	await expect(layoutSelect).toHaveValue(layout);

	// Check that level 1 letters are properly highlighted
	const level1Letters = getLevelLetters(layout, 1);
	for (const letter of level1Letters) {
		if (letter.trim()) {
			// Skip empty letters
			await expect(page.locator(".keyboard")).toContainText(letter);
			await expect(
				page.locator(`.key.active:has-text("${letter}")`),
			).toBeVisible();
		}
	}

	// Verify page still functions
	await expect(page.locator("h1")).toContainText("Colemak 友の会");
	await expect(page.locator("nav")).toBeVisible();
});

// Test combinatorial layout + shape changes (sample of combinations)

test(`layout with shape works correctly`, async ({ page, shape, layout }) => {
	// Change layout
	const layoutSelect = page.locator('select[name="layout"]');
	await layoutSelect.selectOption(layout);
	await expect(layoutSelect).toHaveValue(layout);

	// Change shape
	const keyboardSelect = page.locator('select[name="keyboard"]');
	await keyboardSelect.selectOption(shape);
	await expect(keyboardSelect).toHaveValue(shape);

	// Verify level 1 letters are still highlighted correctly
	const level1Letters = getLevelLetters(layout, 1);
	for (const letter of level1Letters) {
		if (letter.trim()) {
			await expect(
				page.locator(`.key.active:has-text("${letter}")`),
			).toBeVisible();
		}
	}

	// Verify page still functions
	await expect(page.locator("h1")).toContainText("Colemak 友の会");
	await expect(page.locator("nav")).toBeVisible();
});
