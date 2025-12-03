import { expect, type Page } from "@playwright/test";
import type { LayoutName } from "../src/entities/layouts";
import { LAYOUT_DICTIONARIES, LAYOUT_NAMES } from "../src/entities/layouts";
import type { Level } from "../src/entities/levels";
import { KEYBOARD_SHAPES } from "../src/entities/shapes";
import { test } from "./fixture";

test.beforeEach(async ({ page }) => {
	await page.goto(`/`);
});

test("layout and keyboard selection functionality", async ({
	page,
	layout,
}) => {
	await test.step("selects are populated correctly", async () => {
		await verifySelectsPopulated(page);
	});

	await test.step("keyboard shape changes work", async () => {
		for (const shape of KEYBOARD_SHAPES) {
			await test.step(`shape ${shape}`, async () => {
				const keyboardSelect = page.locator('select[name="keyboard"]');
				await keyboardSelect.selectOption(shape);
				await expect(keyboardSelect).toHaveValue(shape);
				await verifyPageBasics(page);
			});
		}
	});

	await test.step("layout displays correct level 1 highlighting", async () => {
		const layoutSelect = page.locator('select[name="layout"]');
		await layoutSelect.selectOption(layout);
		await expect(layoutSelect).toHaveValue(layout);

		await verifyLevel1Highlighting(page, layout);
		await verifyPageBasics(page);
	});

	await test.step("layout with shape combinations work", async () => {
		const layoutSelect = page.locator('select[name="layout"]');
		await layoutSelect.selectOption(layout);
		await expect(layoutSelect).toHaveValue(layout);

		for (const shape of KEYBOARD_SHAPES) {
			await test.step(`layout ${layout} with shape ${shape}`, async () => {
				const keyboardSelect = page.locator('select[name="keyboard"]');
				await keyboardSelect.selectOption(shape);
				await expect(keyboardSelect).toHaveValue(shape);
			});
		}

		await verifyLevel1Highlighting(page, layout);
		await verifyPageBasics(page);
	});
});

async function verifyPageBasics(page: Page) {
	await expect(page.locator("h1")).toContainText("Colemak 友の会");
	await expect(page.locator("nav")).toBeVisible();
}

async function verifySelectsPopulated(page: Page) {
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
}

async function verifyLevel1Highlighting(page: Page, layout: LayoutName) {
	const level1Letters = getLevelLetters(layout, 1);
	for (const letter of level1Letters) {
		if (letter.trim()) {
			await expect(page.locator(".keyboard")).toContainText(letter);
			await expect(
				page.locator(`.key.active:has-text("${letter}")`),
			).toBeVisible();
		}
	}
}

function getLevelLetters(layout: LayoutName, level: Level): string {
	const layoutDict = LAYOUT_DICTIONARIES[layout];
	if (!layoutDict) return "";
	const levelKey = `lvl${level}` as keyof typeof layoutDict;
	return layoutDict[levelKey] || "";
}
