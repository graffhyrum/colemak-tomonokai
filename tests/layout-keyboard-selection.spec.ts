import { expect } from "@playwright/test";
import { getLevelLetters } from "../src/entities/getLevelLetters.ts";
import { LAYOUT_NAMES } from "../src/entities/layouts";
import { KEYBOARD_SHAPES } from "../src/entities/shapes";
import { step, test } from "./fixture";

test.describe("Layout and Keyboard Selection", () => {
	test.beforeEach(async ({ homePage }) => {
		await homePage.goto();
		await homePage.assertions.isLoaded();
	});

	test("selects are populated correctly", async ({ homePage }) => {
		await step("Verify layout and keyboard selects are populated", async () => {
			await homePage.assertions.isLoaded(); // includes select validation
		});
	});

	test("keyboard shape changes work", async ({ homePage }) => {
		for (const shape of KEYBOARD_SHAPES) {
			await step(`shape ${shape}`, async () => {
				await homePage.actions.selectKeyboardShape(shape);
				await homePage.assertions.hasCorrectShape(shape);
				await homePage.assertions.isLoaded();
			});
		}
	});

	test("layout selection works", async ({ homePage, layout }) => {
		await step("Select layout", async () => {
			await homePage.actions.selectLayout(layout);
			await homePage.assertions.hasCorrectLayout(layout);
			await homePage.assertions.isLoaded();
		});
	});

	test("layout with shape combinations work", async ({ homePage, layout }) => {
		await step("Select layout", async () => {
			await homePage.actions.selectLayout(layout);
			await homePage.assertions.hasCorrectLayout(layout);
		});

		for (const shape of KEYBOARD_SHAPES) {
			await step(`layout ${layout} with shape ${shape}`, async () => {
				await homePage.actions.selectKeyboardShape(shape);
				await homePage.assertions.hasCorrectShape(shape);
			});
		}

		await homePage.assertions.isLoaded();
	});
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
	const keyboardSelect = page.locator('select[name="shape"]');
	await expect(keyboardSelect).toBeVisible();
	const keyboardOptions = keyboardSelect.locator("option");
	await expect(keyboardOptions).toHaveCount(KEYBOARD_SHAPES.length);
	await expect(keyboardSelect).toHaveValue("ansi");
});

// Test keyboard shape changes
for (const shape of KEYBOARD_SHAPES) {
	test(`keyboard shape ${shape} displays correctly`, async ({ page }) => {
		await page.goto(`/`);

		const keyboardSelect = page.locator('select[name="shape"]');
		await keyboardSelect.selectOption(shape);
		await expect(keyboardSelect).toHaveValue(shape);

		// Verify page still functions
		await expect(page.locator("h1")).toContainText("Colemak 友の会");
		await expect(page.locator("nav")).toBeVisible();
	});
}

// Test layout changes with level 1 highlighting
for (const layout of LAYOUT_NAMES) {
	test(`layout ${layout} displays correct level 1 highlighting`, async ({
		page,
	}) => {
		await page.goto(`/`);

		const layoutSelect = page.locator('select[name="layout"]');
		await layoutSelect.selectOption(layout);
		await expect(layoutSelect).toHaveValue(layout);

		// Check that level 1 letters are properly highlighted
		const level1Letters = getLevelLetters(layout, 1);
		for (const letter of level1Letters) {
			if (letter.trim()) {
				// Skip empty letters
				await expect(page.locator(".cheatsheet")).toContainText(letter);
				await expect(
					page.locator(`.key.currentLevelKeys:has-text("${letter}")`),
				).toBeVisible();
			}
		}

		// Verify page still functions
		await expect(page.locator("h1")).toContainText("Colemak 友の会");
		await expect(page.locator("nav")).toBeVisible();
	});
}

// Test combinatorial layout + shape changes (sample of combinations)
for (const layout of LAYOUT_NAMES) {
	// Test first 3 layouts to avoid too many tests
	for (const shape of KEYBOARD_SHAPES) {
		test(`layout ${layout} with shape ${shape} works correctly`, async ({
			page,
		}) => {
			await page.goto(`/`);

			// Change layout
			const layoutSelect = page.locator('select[name="layout"]');
			await layoutSelect.selectOption(layout);
			await expect(layoutSelect).toHaveValue(layout);

			// Change shape
			const keyboardSelect = page.locator('select[name="shape"]');
			await keyboardSelect.selectOption(shape);
			await expect(keyboardSelect).toHaveValue(shape);

			// Verify level 1 letters are still highlighted correctly
			const level1Letters = getLevelLetters(layout, 1);
			for (const letter of level1Letters) {
				if (letter.trim()) {
					await expect(
						page.locator(`.key.currentLevelKeys:has-text("${letter}")`),
					).toBeVisible();
				}
			}

			// Verify page still functions
			await expect(page.locator("h1")).toContainText("Colemak 友の会");
			await expect(page.locator("nav")).toBeVisible();
		});
	}
}
